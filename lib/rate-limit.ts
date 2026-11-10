/**
 * Fixed-window attempt limiter for the sign-in form.
 *
 * Without one, passwords can be guessed as fast as the server will answer.
 * That matters more here than it used to: a superadmin account can read every
 * customer's details and set anyone's password, so the sign-in form is now the
 * way in to the whole system, not just to one sales page.
 *
 * State lives in this process. The service runs a single replica (see the
 * Railway config), so that is accurate today — but if it is ever scaled out,
 * each replica would count separately and the effective limit would multiply.
 * Move this to the database or Redis at that point.
 */

type Window = { count: number; firstAt: number; blockedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

/** Per e-mail: stops someone hammering one account. */
const PER_ACCOUNT = 5;
/** Per IP across all accounts: stops one host spraying many e-mails. */
const PER_IP = 20;

const windows = new Map<string, Window>();

// The map only grows while attempts keep arriving; sweep the stale entries so
// a long-running process does not hold them for ever.
function sweep(now: number) {
  if (windows.size < 5000) return;
  for (const [key, w] of windows) {
    if (now - w.firstAt > WINDOW_MS && now > w.blockedUntil) windows.delete(key);
  }
}

function peek(key: string, limit: number, now: number) {
  const w = windows.get(key);
  if (!w) return { blocked: false, retryInSec: 0 };
  if (now < w.blockedUntil) {
    return { blocked: true, retryInSec: Math.ceil((w.blockedUntil - now) / 1000) };
  }
  if (now - w.firstAt > WINDOW_MS) {
    windows.delete(key);
    return { blocked: false, retryInSec: 0 };
  }
  return { blocked: w.count >= limit, retryInSec: 0 };
}

export type LimitCheck = { blocked: boolean; retryInSec: number };

/** Called before the password is checked. */
export function checkLoginAllowed(ip: string, email: string): LimitCheck {
  const now = Date.now();
  sweep(now);
  const account = peek(`a:${ip}:${email}`, PER_ACCOUNT, now);
  if (account.blocked) return account;
  return peek(`i:${ip}`, PER_IP, now);
}

/** Called only when the password was wrong. */
export function recordLoginFailure(ip: string, email: string): void {
  const now = Date.now();
  for (const [key, limit] of [
    [`a:${ip}:${email}`, PER_ACCOUNT],
    [`i:${ip}`, PER_IP],
  ] as const) {
    const w = windows.get(key);
    if (!w || now - w.firstAt > WINDOW_MS) {
      windows.set(key, { count: 1, firstAt: now, blockedUntil: 0 });
      continue;
    }
    w.count += 1;
    if (w.count >= limit) w.blockedUntil = now + BLOCK_MS;
  }
}

/** Called on a correct password, so one good sign-in clears the slate. */
export function clearLoginFailures(ip: string, email: string): void {
  windows.delete(`a:${ip}:${email}`);
  windows.delete(`i:${ip}`);
}

/** Best-effort client address. Railway terminates TLS in front of the app, so
 *  the real address arrives in x-forwarded-for; the first entry is the client. */
export function clientIp(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export const LIMIT_SETTINGS = { PER_ACCOUNT, PER_IP, WINDOW_MS, BLOCK_MS };

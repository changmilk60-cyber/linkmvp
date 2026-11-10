/** Licence date maths, shared by the dashboard and the superadmin tools. */

export const DAY_MS = 86_400_000;

export function daysLeft(expiresAt: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
}

export function isExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

/**
 * Where an extension starts counting from.
 *
 * A licence that still has time left is extended from its own end date, so the
 * remaining days are not thrown away. One that already lapsed is extended from
 * today — otherwise "+30 days" on a licence that ran out six months ago lands
 * in the past and the account stays expired, which looks like a broken button.
 */
export function extendFrom(expiresAt: Date, now = new Date()): Date {
  return isExpired(expiresAt, now) ? new Date(now) : new Date(expiresAt);
}

export function extendBy(expiresAt: Date, days: number, now = new Date()): Date {
  const base = extendFrom(expiresAt, now);
  base.setUTCDate(base.getUTCDate() + days);
  return base;
}

/** "2027-01-15" -> Date at 23:59:59.999 UTC so the whole day counts as valid. */
export function endOfDayUTC(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const d = new Date(`${isoDate}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type LicenseStatus = "expired" | "soon" | "ok";

export function licenseStatus(expiresAt: Date, now = new Date()): LicenseStatus {
  if (isExpired(expiresAt, now)) return "expired";
  return daysLeft(expiresAt, now) <= 7 ? "soon" : "ok";
}

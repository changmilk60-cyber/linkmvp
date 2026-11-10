import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "session";
const alg = "HS256";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET env var is missing. Set it in .env (see .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.userId as string) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Authorisation
//
// The session cookie carries only a user id and lives for 30 days. Roles are
// therefore looked up fresh on every request: putting the role in the JWT
// would mean a demoted admin kept their powers until their cookie expired,
// with no way to revoke it.
// ---------------------------------------------------------------------------

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  disabled: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // passwordHash is deliberately never selected.
    select: { id: true, email: true, role: true, disabled: true },
  });
  return user ?? null;
}

export function isSuperadmin(user: SessionUser | null): boolean {
  return !!user && user.role === "superadmin" && !user.disabled;
}

/**
 * Guard for every superadmin page AND every superadmin server action.
 *
 * Server actions are independently reachable HTTP endpoints — guarding only
 * the page that renders the buttons leaves the actions themselves open, so
 * this has to be the first line of each action too.
 *
 * Answers 404 rather than redirecting to the login page so that the route
 * does not confirm it exists to someone who is not allowed to use it.
 */
export async function requireSuperadmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!isSuperadmin(user)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return user as SessionUser;
}

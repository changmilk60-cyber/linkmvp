/**
 * Promotes the account named by SUPERADMIN_EMAIL to role "superadmin".
 *
 * Runs on every boot from the `start` script and is idempotent: it only ever
 * promotes the one address held in the environment, and does nothing if that
 * account is already a superadmin or does not exist yet.
 *
 * Why an env var and not a value in the repository: the address identifies a
 * real person, and who holds the role should be changeable without a code
 * change. Why not a route: nothing self-serve may ever grant this role.
 *
 * Never fails the boot — a database that is still starting must not take the
 * whole service down.
 */
import { PrismaClient } from "@prisma/client";

const email = (process.env.SUPERADMIN_EMAIL || "").trim().toLowerCase();

if (!email) {
  console.log("[superadmin] SUPERADMIN_EMAIL is not set — skipping.");
  process.exit(0);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!user) {
    console.log(`[superadmin] no account for ${email} yet — it will be promoted on the next boot after sign-up.`);
  } else if (user.role === "superadmin") {
    console.log(`[superadmin] ${email} is already a superadmin.`);
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { role: "superadmin" } });
    console.log(`[superadmin] promoted ${email}.`);
  }
} catch (err) {
  console.error("[superadmin] skipped:", err instanceof Error ? err.message : err);
} finally {
  await prisma.$disconnect();
}

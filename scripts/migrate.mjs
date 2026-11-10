/**
 * Applies database migrations at boot, replacing `prisma db push`.
 *
 * `db push --accept-data-loss` compares the live database to schema.prisma and
 * reshapes it to match, with permission to drop whatever no longer fits. There
 * is no record of what it did and no way back: renaming a field in the schema
 * silently destroys that column and everything in it on the next deploy.
 * `migrate deploy` only ever runs the SQL committed under prisma/migrations,
 * so every change to production is reviewable in the repository first.
 *
 * Baselining: production was built by `db push` and so has the tables but no
 * _prisma_migrations ledger. Running `migrate deploy` against it unchanged
 * would try to CREATE TABLE over live data and fail. The first run here marks
 * 0_init as already applied — the ledger is written, no SQL is executed, the
 * data is untouched — and every later migration then applies normally. On an
 * empty database (a fresh developer machine) the baseline just runs as usual.
 */
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const BASELINE = "0_init";

// --no-install: never reach for the registry at boot. The CLI is a runtime
// dependency precisely so this step cannot depend on the network being up.
function prisma(...args) {
  execFileSync("npx", ["--no-install", "prisma", ...args], { stdio: "inherit" });
}

const db = new PrismaClient();

try {
  const [{ ledger, tables }] = await db.$queryRaw`
    SELECT
      to_regclass('public._prisma_migrations') IS NOT NULL AS ledger,
      to_regclass('public."User"')             IS NOT NULL AS tables
  `;

  if (!ledger && tables) {
    console.log(`[migrate] existing database without a migration ledger — baselining ${BASELINE}.`);
    await db.$disconnect();
    prisma("migrate", "resolve", "--applied", BASELINE);
  } else {
    await db.$disconnect();
    if (!ledger) console.log("[migrate] empty database — applying migrations from scratch.");
  }
} catch (err) {
  // A database that is still starting is not a reason to skip migrations, so
  // this fails loudly rather than letting the app boot against an old schema.
  await db.$disconnect().catch(() => undefined);
  console.error("[migrate] could not inspect the database:", err instanceof Error ? err.message : err);
  process.exit(1);
}

prisma("migrate", "deploy");

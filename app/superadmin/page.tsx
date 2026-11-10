import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/auth";
import { daysLeft, fmtDate, licenseStatus } from "@/lib/license";
import SuperadminClient from "./SuperadminClient";

export const metadata: Metadata = { title: "SUPERADMIN — LINKMVP", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const PER_PAGE = 25;

export default async function SuperadminPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; sort?: string };
}) {
  // First line of the page, and of every action in ./actions.ts.
  const actor = await requireSuperadmin();

  const q = (searchParams.q || "").trim();
  const sort = searchParams.sort === "newest" ? "newest" : "expiring";
  const pageNo = Math.max(1, Number(searchParams.page) || 1);

  const where = q
    ? {
        OR: [
          { slug: { contains: q, mode: "insensitive" as const } },
          { user: { email: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [total, rows, auditRows] = await Promise.all([
    prisma.page.count({ where }),
    prisma.page.findMany({
      where,
      // Soonest to expire first — the view an operator actually works from.
      // Permanent licences sort to the bottom of the "expiring first" view:
      // they are never the thing an operator needs to act on.
      orderBy:
        sort === "newest"
          ? { createdAt: "desc" }
          : [{ licenseNeverExpires: "asc" as const }, { licenseExpiresAt: "asc" as const }],
      skip: (pageNo - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        slug: true,
        licenseExpiresAt: true,
        licenseNeverExpires: true,
        createdAt: true,
        // passwordHash is never selected.
        user: { select: { id: true, email: true, role: true, disabled: true, createdAt: true } },
        _count: { select: { visits: true } },
      },
    }),
    prisma.adminAudit.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const now = new Date();
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host && /^(localhost|127\.)/.test(host) ? "http" : "https");
  const baseUrl = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const items = rows.map((r) => ({
    pageId: r.id,
    slug: r.slug,
    userId: r.user.id,
    email: r.user.email,
    role: r.user.role,
    disabled: r.user.disabled,
    joined: fmtDate(r.user.createdAt),
    expiresAt: fmtDate(r.licenseExpiresAt),
    never: r.licenseNeverExpires,
    daysLeft: r.licenseNeverExpires ? 0 : daysLeft(r.licenseExpiresAt, now),
    status: licenseStatus(r.licenseExpiresAt, now, r.licenseNeverExpires),
    visits: r._count.visits,
  }));

  const summary = {
    total,
    // Permanent licences are excluded from both warning counts.
    expired: await prisma.page.count({
      where: { licenseNeverExpires: false, licenseExpiresAt: { lte: now } },
    }),
    soon: await prisma.page.count({
      where: {
        licenseNeverExpires: false,
        licenseExpiresAt: { gt: now, lte: new Date(now.getTime() + 7 * 86_400_000) },
      },
    }),
    forever: await prisma.page.count({ where: { licenseNeverExpires: true } }),
    disabled: await prisma.user.count({ where: { disabled: true } }),
  };

  return (
    <SuperadminClient
      actorEmail={actor.email}
      items={items}
      summary={summary}
      baseUrl={baseUrl}
      q={q}
      sort={sort}
      pageNo={pageNo}
      perPage={PER_PAGE}
      audit={auditRows.map((a) => ({
        id: a.id,
        actorEmail: a.actorEmail,
        action: a.action,
        targetEmail: a.targetEmail,
        before: a.before,
        after: a.after,
        at: a.createdAt.toISOString().slice(0, 16).replace("T", " "),
      }))}
    />
  );
}

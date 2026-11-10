import { headers } from "next/headers";
import { getSessionUser, isSuperadmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateOwnPage } from "@/app/actions";
import { lastNDays, parseSections, todayUTC } from "@/lib/sections";
import AdminClient from "./AdminClient";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  // A suspension has to take effect on the session already open, not only at
  // the next sign-in — the cookie is valid for 30 days.
  if (sessionUser.disabled) redirect("/login");
  const userId = sessionUser.id;

  const page = await getOrCreateOwnPage(userId);

  const todayStr = todayUTC();
  const days7 = lastNDays(7);
  const thirtyAgo = new Date();
  thirtyAgo.setUTCDate(thirtyAgo.getUTCDate() - 29);
  const thirtyAgoStr = todayUTC(thirtyAgo);

  const [
    viewsToday,
    uniqueTodayRows,
    signupClicksTotal,
    lineClicksTotal,
    signupClicksToday,
    lineClicksToday,
    viewsAllTime,
    views30d,
    dayRows,
  ] = await Promise.all([
    prisma.visit.count({ where: { pageId: page.id, day: todayStr, kind: "view" } }),
    prisma.visit.findMany({ where: { pageId: page.id, day: todayStr, kind: "view" }, select: { visitorId: true }, distinct: ["visitorId"] }),
    prisma.visit.count({ where: { pageId: page.id, kind: "click_signup" } }),
    prisma.visit.count({ where: { pageId: page.id, kind: "click_line" } }),
    prisma.visit.count({ where: { pageId: page.id, day: todayStr, kind: "click_signup" } }),
    prisma.visit.count({ where: { pageId: page.id, day: todayStr, kind: "click_line" } }),
    prisma.visit.count({ where: { pageId: page.id, kind: "view" } }),
    prisma.visit.count({ where: { pageId: page.id, kind: "view", day: { gte: thirtyAgoStr } } }),
    prisma.visit.findMany({ where: { pageId: page.id, day: { in: days7 } }, select: { day: true, kind: true } }),
  ]);

  const viewsByDay: Record<string, number> = Object.fromEntries(days7.map((d) => [d, 0]));
  const signupByDay: Record<string, number> = Object.fromEntries(days7.map((d) => [d, 0]));
  const lineByDay: Record<string, number> = Object.fromEntries(days7.map((d) => [d, 0]));
  for (const row of dayRows) {
    if (row.kind === "view") viewsByDay[row.day] = (viewsByDay[row.day] || 0) + 1;
    if (row.kind === "click_signup") signupByDay[row.day] = (signupByDay[row.day] || 0) + 1;
    if (row.kind === "click_line") lineByDay[row.day] = (lineByDay[row.day] || 0) + 1;
  }

  const ctr = viewsAllTime > 0 ? (((signupClicksTotal + lineClicksTotal) / viewsAllTime) * 100).toFixed(1) : "0.0";

  const stats = {
    viewsToday,
    uniqueToday: uniqueTodayRows.length,
    signupClicksToday,
    lineClicksToday,
    signupClicksTotal,
    lineClicksTotal,
    viewsAllTime,
    views30d,
    ctr,
    chart: days7.map((d) => ({ label: d.slice(5).replace("-", "/"), value: viewsByDay[d] || 0 })),
    table: [...days7].reverse().map((d) => [d.slice(5).replace("-", "/"), signupByDay[d] || 0, lineByDay[d] || 0]) as [string, number, number][],
  };

  // The sales-page URL shown here has to match the domain the owner actually
  // uses. NEXT_PUBLIC_BASE_URL is a single baked-in value, so once a custom
  // domain is added it keeps printing the old railway.app host. Read the host
  // the dashboard was requested on instead, exactly as the sales page does for
  // its OG tags, and keep the env var only as a fallback.
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host && /^(localhost|127\.)/.test(host) ? "http" : "https");
  const baseUrl = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Formatted on the server so the client renders the same string it was sent —
  // a locale-dependent date built in the browser would differ on hydration.
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, createdAt: true } });
  const thaiDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
  const neverExpires = page.licenseNeverExpires;
  const daysLeft = neverExpires ? 0 : Math.max(0, Math.ceil((page.licenseExpiresAt.getTime() - Date.now()) / 86_400_000));

  return (
    <AdminClient
      page={{
        id: page.id,
        slug: page.slug,
        themePreset: page.themePreset,
        tabTitle: page.tabTitle,
        ogDescription: page.ogDescription,
        ogImage: page.ogImage,
        logoUrl: page.logoUrl,
        footerText: page.footerText,
        footerTextColor: page.footerTextColor,
        colorOverrides: page.colorOverrides,
        fbPixelIds: page.fbPixelIds,
        fbPixelCode: page.fbPixelCode,
        fbPixelEnabled: page.fbPixelEnabled,
        capiAccessToken: page.capiAccessToken,
        capiEndpointUrl: page.capiEndpointUrl,
        capiEventName: page.capiEventName,
        ctaLayout: page.ctaLayout,
        landingUrl: page.landingUrl,
        whitepageRedirectUrl: page.whitepageRedirectUrl,
        cloakToLandingUrl: page.cloakToLandingUrl,
        heroHeadline: page.heroHeadline,
        heroSubtext: page.heroSubtext,
        sections: parseSections(page.sections),
        reviewsTitle: page.reviewsTitle,
        reviewsSubtitle: page.reviewsSubtitle,
        reviews: page.reviews ? JSON.parse(page.reviews) : [],
        licenseExpiresAt: page.licenseExpiresAt.toISOString().slice(0, 10),
        neverExpires,
        daysLeft,
      }}
      account={{
        email: user?.email ?? "",
        joinedAt: user ? thaiDate(user.createdAt) : "-",
        pageCreatedAt: thaiDate(page.createdAt),
        pageUrl: `${baseUrl.replace(/\/$/, "")}/${page.slug}`,
      }}
      stats={stats}
      baseUrl={baseUrl}
      superadmin={isSuperadmin(sessionUser)}
    />
  );
}

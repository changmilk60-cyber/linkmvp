import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateOwnPage } from "@/app/actions";
import { lastNDays, parseSections, todayUTC } from "@/lib/sections";
import AdminClient from "./AdminClient";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const daysLeft = Math.max(0, Math.ceil((page.licenseExpiresAt.getTime() - Date.now()) / 86_400_000));

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
        lineLogoUrl: page.lineLogoUrl,
        footerText: page.footerText,
        footerTextColor: page.footerTextColor,
        colorOverrides: page.colorOverrides,
        fbPixelIds: page.fbPixelIds,
        capiAccessToken: page.capiAccessToken,
        capiEndpointUrl: page.capiEndpointUrl,
        capiEventName: page.capiEventName,
        ctaLayout: page.ctaLayout,
        landingUrl: page.landingUrl,
        whitepageRedirectUrl: page.whitepageRedirectUrl,
        useSameLandingForAll: page.useSameLandingForAll,
        cloakToLandingUrl: page.cloakToLandingUrl,
        heroHeadline: page.heroHeadline,
        heroSubtext: page.heroSubtext,
        sections: parseSections(page.sections),
        reviewsTitle: page.reviewsTitle,
        reviewsSubtitle: page.reviewsSubtitle,
        reviews: page.reviews ? JSON.parse(page.reviews) : [],
        licenseExpiresAt: page.licenseExpiresAt.toISOString().slice(0, 10),
        daysLeft,
      }}
      stats={stats}
      baseUrl={baseUrl}
    />
  );
}

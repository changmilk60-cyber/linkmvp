import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { parseSections } from "@/lib/sections";
import SalesPage from "./SalesPage";

export const dynamic = "force-dynamic";

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) notFound();

  const expired = page.licenseExpiresAt.getTime() < Date.now();
  if (expired) {
    if (page.whitepageRedirectUrl) redirect(page.whitepageRedirectUrl);
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b0b", color: "#aaa", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "40px" }}>
        <p>หน้านี้หมดอายุการใช้งานแล้ว</p>
      </main>
    );
  }

  if (page.cloakToLandingUrl && page.landingUrl) {
    redirect(page.landingUrl);
  }

  const colorOverrides = page.colorOverrides ? JSON.parse(page.colorOverrides) : {};
  const reviews = page.reviews ? JSON.parse(page.reviews) : [];
  const fbPixelIds: string[] = page.fbPixelIds ? JSON.parse(page.fbPixelIds) : [];

  return (
    <SalesPage
      slug={page.slug}
      themePreset={page.themePreset}
      colorOverrides={colorOverrides}
      logoUrl={page.logoUrl}
      heroHeadline={page.heroHeadline}
      heroSubtext={page.heroSubtext}
      footerText={page.footerText}
      footerTextColor={page.footerTextColor}
      sections={parseSections(page.sections)}
      reviewsTitle={page.reviewsTitle}
      reviewsSubtitle={page.reviewsSubtitle}
      reviews={reviews}
      fbPixelIds={fbPixelIds}
      ctaLayout={page.ctaLayout === "vertical" ? "vertical" : "horizontal"}
    />
  );
}

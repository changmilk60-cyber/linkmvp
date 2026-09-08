import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { parseSections } from "@/lib/sections";
import { normalizeExternalUrl } from "@/lib/url";
import { isBotUserAgent } from "@/lib/bot";
import { headers } from "next/headers";
import SalesPage from "./SalesPage";

export const dynamic = "force-dynamic";

// Without this the sales page inherits the layout's metadata, so a customer's
// browser tab reads "PageVIP Pro — LINKMVP" — the admin's name, on a page
// meant for their visitors. Each page supplies its own from ตั้งค่าหลัก.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    select: { tabTitle: true, ogDescription: true, ogImage: true, heroHeadline: true },
  });
  if (!page) return { title: "" };

  const title = page.tabTitle || page.heroHeadline || "";
  const description = page.ogDescription || undefined;
  const images = page.ogImage ? [page.ogImage] : undefined;
  return {
    title,
    description,
    openGraph: { title: title || undefined, description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title: title || undefined, description, images },
  };
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) notFound();

  const expired = page.licenseExpiresAt.getTime() < Date.now();
  if (expired) {
    const whitepage = normalizeExternalUrl(page.whitepageRedirectUrl);
    if (whitepage) redirect(whitepage);
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b0b", color: "#aaa", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "40px" }}>
        <p>หน้านี้หมดอายุการใช้งานแล้ว</p>
      </main>
    );
  }

  // Only crawlers and link-preview fetchers are sent to the landing page;
  // real visitors always get the sales page. An unusable landing link falls
  // through to the sales page rather than redirecting to a path on our own
  // domain.
  const landing = normalizeExternalUrl(page.landingUrl);
  if (page.cloakToLandingUrl && landing && isBotUserAgent(headers().get("user-agent"))) {
    redirect(landing);
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
      signupEventName={page.capiEventName === "purchase" ? "Purchase" : "Subscribe"}
    />
  );
}

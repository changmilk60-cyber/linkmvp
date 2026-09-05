import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import CourseTemplate from "./CourseTemplate";
import CustomCodeBlock from "./CustomCodeBlock";

export const dynamic = "force-dynamic";

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const link = await prisma.link.findUnique({ where: { slug: params.slug } });

  if (!link) notFound();

  // fire-and-forget click increment
  prisma.link
    .update({ where: { id: link.id }, data: { clicks: { increment: 1 } } })
    .catch(() => {});

  if (link.type === "SHORT") {
    redirect(link.targetUrl || "/");
  }

  // BIO page render
  const blocks: { label: string; url: string }[] = JSON.parse(
    link.blocks || "[]"
  );
  const theme = link.themeColor || "#3d5afe";
  const pixelId =
    link.fbPixelId && /^\d{5,20}$/.test(link.fbPixelId) ? link.fbPixelId : null;

  const pixelTags = pixelId && (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );

  const customCodeBlock = link.customCode && <CustomCodeBlock html={link.customCode} />;
  const images: string[] = link.images ? JSON.parse(link.images) : [];

  if (link.template === "custom") {
    return (
      <main className="mx-auto min-h-screen max-w-md bg-white">
        {pixelTags}
        {link.customCode ? (
          customCodeBlock
        ) : (
          <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-ink/40">
              หน้านี้ใช้เทมเพลต &quot;คัสต้อม&quot; แต่ยังไม่ได้ใส่โค้ดกำหนดเอง
            </p>
            <p className="mt-1 text-xs text-ink/30">
              ไปที่แดชบอร์ด แล้วเพิ่มโค้ดในช่อง &quot;โค้ดกำหนดเอง (Custom Code)&quot;
            </p>
          </div>
        )}
      </main>
    );
  }

  if (link.template === "course") {
    return (
      <CourseTemplate
        title={link.title}
        bio={link.bio}
        avatarEmoji={link.avatarEmoji}
        theme={theme}
        tracks={blocks}
        ctaUrl={blocks[0]?.url || "#"}
        pixelTags={pixelTags}
        customCodeBlock={customCodeBlock}
        images={images}
        fontFamily={link.fontFamily}
        toggles={link.sectionToggles ? JSON.parse(link.sectionToggles) : undefined}
        reviews={link.reviews ? JSON.parse(link.reviews) : undefined}
        faq={link.faq ? JSON.parse(link.faq) : undefined}
        promotions={link.promotions ? JSON.parse(link.promotions) : undefined}
        pricing={link.pricing ? JSON.parse(link.pricing) : undefined}
        contact={link.contact ? JSON.parse(link.contact) : undefined}
      />
    );
  }

  if (link.template === "service") {
    return (
      <main className="mx-auto min-h-screen max-w-md bg-white pb-16">
        {pixelTags}
        <div
          className="flex flex-col items-center px-6 pb-8 pt-14 text-center"
          style={{ background: `linear-gradient(160deg, ${theme}, ${theme}cc)` }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            {link.avatarEmoji || "🏢"}
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">{link.title}</h1>
          {link.bio && (
            <p className="mt-1 text-sm text-white/85">{link.bio}</p>
          )}
        </div>

        <div className="px-6">
          <p className="mt-6 mb-3 text-sm font-semibold text-ink/50">
            บริการ / ช่องทางติดต่อ
          </p>
          <div className="space-y-3">
            {blocks.map((b, i) => (
              <a
                key={i}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3.5 shadow-sm transition hover:shadow-md"
              >
                <span className="font-semibold" style={{ color: theme }}>
                  {b.label}
                </span>
                <span style={{ color: theme }}>→</span>
              </a>
            ))}
            {blocks.length === 0 && (
              <p className="text-center text-sm text-ink/40">ยังไม่มีรายการในหน้านี้</p>
            )}
          </div>
        </div>

        <p className="mt-16 text-center text-xs text-ink/30">สร้างด้วย LinkMVP</p>
        {customCodeBlock}
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-16"
      style={{ background: `linear-gradient(180deg, ${theme}14, #fff 30%)` }}
    >
      {pixelTags}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-sm"
        style={{ background: theme + "22" }}
      >
        {link.avatarEmoji || "✨"}
      </div>
      <h1 className="mt-4 text-xl font-bold" style={{ color: theme }}>
        {link.title}
      </h1>
      {link.bio && <p className="mt-1 text-center text-sm text-ink/60">{link.bio}</p>}

      <div className="mt-8 w-full space-y-3">
        {blocks.map((b, i) => (
          <a
            key={i}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl px-4 py-3.5 text-center font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: theme }}
          >
            {b.label}
          </a>
        ))}
        {blocks.length === 0 && (
          <p className="text-center text-sm text-ink/40">ยังไม่มีลิงก์ในหน้านี้</p>
        )}
      </div>

      <p className="mt-16 text-xs text-ink/30">สร้างด้วย LinkMVP</p>
      {customCodeBlock}
    </main>
  );
}

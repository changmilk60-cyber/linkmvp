"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { ViewTracker, TrackedLink } from "./Tracker";
import { themeFor, type SectionEntry, type SectionKey } from "@/lib/sections";

type Review = { member: string; text: string; stars: string };

export default function SalesPage({
  slug,
  themePreset,
  colorOverrides,
  logoUrl,
  heroHeadline,
  heroSubtext,
  footerText,
  footerTextColor,
  sections,
  reviewsTitle,
  reviewsSubtitle,
  reviews,
  fbPixelIds,
  ctaLayout,
}: {
  slug: string;
  themePreset: string;
  colorOverrides: Record<string, string>;
  logoUrl: string | null;
  heroHeadline: string | null;
  heroSubtext: string | null;
  footerText: string | null;
  footerTextColor: string | null;
  sections: SectionEntry[];
  reviewsTitle: string | null;
  reviewsSubtitle: string | null;
  reviews: Review[];
  fbPixelIds: string[];
  ctaLayout: "vertical" | "horizontal";
}) {
  const theme = themeFor(themePreset);
  const primary = colorOverrides.primary || theme.primary;
  const textBody = colorOverrides.body || "#ffffff";
  const textMuted = colorOverrides.muted || "rgba(255,255,255,.6)";

  const enabled = useMemo(() => new Map(sections.map((s) => [s.key, s])), [sections]);
  const get = (key: SectionKey) => enabled.get(key);
  const isOn = (key: SectionKey) => !!enabled.get(key)?.enabled;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.base,
        color: textBody,
        fontFamily: "Kanit, 'Noto Sans Thai', system-ui, sans-serif",
      }}
    >
      <ViewTracker slug={slug} />
      {fbPixelIds.map((id) => (
        <FbPixel key={id} id={id} />
      ))}

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px 48px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <header style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", paddingTop: "8px" }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" style={{ maxWidth: "160px", maxHeight: "90px", objectFit: "contain" }} />
          ) : null}
          {heroHeadline ? <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: primary }}>{heroHeadline}</h1> : null}
          {heroSubtext ? <p style={{ margin: 0, fontSize: "14px", color: textMuted }}>{heroSubtext}</p> : null}
        </header>

        {isOn("online_users") && <OnlineUsers data={get("online_users")!.data as { min: number; max: number }} accent={primary} />}
        {isOn("gif_signup_button") && (
          <TrackedLink slug={slug} kind="click_signup" href={(get("gif_signup_button")!.data as { linkUrl: string }).linkUrl}>
            {(get("gif_signup_button")!.data as { imageUrl?: string }).imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={(get("gif_signup_button")!.data as { imageUrl: string }).imageUrl} alt="สมัครสมาชิก" style={{ width: "100%", borderRadius: "12px", display: "block" }} />
            ) : (
              <CtaButton bg={primary}>สมัครสมาชิกตอนนี้</CtaButton>
            )}
          </TrackedLink>
        )}
        {isOn("bonus_total") && <BonusTotal data={get("bonus_total")!.data as { baseAmount: number; perHourIncrement: number }} accent={primary} />}
        {isOn("top_games") && <TopGames data={get("top_games")!.data as { games: { name: string; imageUrl: string }[] }} accent={primary} />}
        {isOn("hero_image") && (get("hero_image")!.data as { imageUrl?: string }).imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(get("hero_image")!.data as { imageUrl: string }).imageUrl} alt="" style={{ width: "100%", borderRadius: "14px", display: "block" }} />
        ) : null}
        {isOn("text_block_1") && <TextBlock data={get("text_block_1")!.data as { heading: string; body: string }} accent={primary} />}
        {isOn("text_block_2") && <TextBlock data={get("text_block_2")!.data as { heading: string; body: string }} accent={primary} />}
        {isOn("player_ranking") && <PlayerRanking data={get("player_ranking")!.data as { players: { name: string; amount: string }[] }} accent={primary} />}
        {isOn("withdraw_feed") && <WithdrawFeed data={get("withdraw_feed")!.data as WithdrawFeedData} accent={primary} muted={textMuted} />}
        {isOn("prizes") && <Prizes data={get("prizes")!.data as { items: { label: string; imageUrl: string }[] }} accent={primary} />}
        {isOn("announcements") && <Announcements data={get("announcements")!.data as { items: string[] }} accent={primary} muted={textMuted} />}
        {isOn("image_slider") && <ImageSlider data={get("image_slider")!.data as { images: string[] }} />}
        {isOn("reviews") && reviews.length > 0 && (
          <ReviewsCarousel title={reviewsTitle} subtitle={reviewsSubtitle} reviews={reviews} accent={primary} muted={textMuted} />
        )}
        {isOn("signup_line_buttons") && (
          <div style={{ display: "flex", flexDirection: ctaLayout === "vertical" ? "column" : "row", gap: "10px", marginTop: "8px" }}>
            <TrackedLink slug={slug} kind="click_signup" href={(get("signup_line_buttons")!.data as { signupUrl: string }).signupUrl} style={{ flex: 1 }}>
              <CtaButton bg={primary}>สมัครสมาชิก</CtaButton>
            </TrackedLink>
            <TrackedLink slug={slug} kind="click_line" href={(get("signup_line_buttons")!.data as { lineUrl: string }).lineUrl} style={{ flex: 1 }}>
              <CtaButton bg="#06c755">ทัก LINE</CtaButton>
            </TrackedLink>
          </div>
        )}

        {footerText ? (
          <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: "12px", color: footerTextColor || textMuted }}>{footerText}</p>
        ) : null}
      </div>
    </main>
  );
}

function FbPixel({ id }: { id: string }) {
  return (
    <>
      <Script id={`fb-pixel-${id}`} strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`} alt="" />
      </noscript>
    </>
  );
}

function CtaButton({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "block", width: "100%", background: bg, color: "#fff", textAlign: "center", padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "15px" }}>
      {children}
    </span>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent: string }) {
  return <div style={{ background: "rgba(255,255,255,.05)", border: `1px solid ${accent}33`, borderRadius: "14px", padding: "14px" }}>{children}</div>;
}

function OnlineUsers({ data, accent }: { data: { min: number; max: number }; accent: string }) {
  const [n, setN] = useState(data.min);
  useEffect(() => {
    const tick = () => setN(Math.floor(data.min + Math.random() * Math.max(1, data.max - data.min)));
    tick();
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [data.min, data.max]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: `${accent}1a`, border: `1px solid ${accent}55`, borderRadius: "999px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, color: accent }}>
      <span aria-hidden="true">👥</span> มีผู้ใช้งานออนไลน์ {n} คน
    </div>
  );
}

function BonusTotal({ data, accent }: { data: { baseAmount: number; perHourIncrement: number }; accent: string }) {
  const startRef = useState(() => Date.now())[0];
  const [amount, setAmount] = useState(data.baseAmount);
  useEffect(() => {
    const tick = () => {
      const hrs = (Date.now() - startRef) / 3_600_000;
      setAmount(Math.round(data.baseAmount + hrs * data.perHourIncrement));
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [data.baseAmount, data.perHourIncrement, startRef]);
  return (
    <Card accent={accent}>
      <p style={{ margin: 0, fontSize: "12px", color: "inherit", opacity: 0.7, textAlign: "center" }}>ยอดโบนัสสะสม</p>
      <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, textAlign: "center", color: accent, fontVariantNumeric: "tabular-nums" }}>{amount.toLocaleString()}</p>
    </Card>
  );
}

function TopGames({ data, accent }: { data: { games: { name: string; imageUrl: string }[] }; accent: string }) {
  const games = data.games.filter((g) => g.name || g.imageUrl);
  if (games.length === 0) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${games.length}, 1fr)`, gap: "8px" }}>
      {games.map((g, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          {g.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={g.imageUrl} alt={g.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "10px", border: `1px solid ${accent}55` }} />
          ) : (
            <div style={{ width: "100%", aspectRatio: "1", borderRadius: "10px", background: `${accent}22` }} />
          )}
          {g.name ? <p style={{ margin: "4px 0 0", fontSize: "11px" }}>{g.name}</p> : null}
        </div>
      ))}
    </div>
  );
}

function TextBlock({ data, accent }: { data: { heading: string; body: string }; accent: string }) {
  if (!data.heading && !data.body) return null;
  return (
    <div>
      {data.heading ? <h2 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: accent }}>{data.heading}</h2> : null}
      {data.body ? <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.body}</p> : null}
    </div>
  );
}

function PlayerRanking({ data, accent }: { data: { players: { name: string; amount: string }[] }; accent: string }) {
  if (data.players.length === 0) return null;
  return (
    <Card accent={accent}>
      <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: accent }}>🏆 อันดับผู้เล่น</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {data.players.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span>#{i + 1} {p.name}</span>
            <span style={{ color: accent, fontVariantNumeric: "tabular-nums" }}>{p.amount}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

type FeedBank = { name: string; logoUrl: string; color: string };
type WithdrawFeedData = {
  title?: string;
  statusLabel?: string;
  minAmount?: number;
  maxAmount?: number;
  rows?: number;
  intervalSec?: number;
  banks?: FeedBank[];
};
type FeedItem = { id: string; bank: FeedBank | null; user: string; amount: number; at: Date };

const pad = (n: number) => String(n).padStart(2, "0");
// Thai Buddhist year, matching how the rest of the product shows dates.
function thaiDateTime(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear() + 543} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function WithdrawFeed({ data, accent, muted }: { data: WithdrawFeedData; accent: string; muted: string }) {
  const rows = Math.min(20, Math.max(1, Number(data.rows) || 5));
  const intervalSec = Math.min(120, Math.max(2, Number(data.intervalSec) || 6));
  const min = Math.max(0, Number(data.minAmount) || 0);
  const max = Math.max(min, Number(data.maxAmount) || min);
  const banksKey = JSON.stringify(data.banks || []);

  // Seeded on the client only: the rows are random and clock-based, so
  // rendering them on the server would mismatch on hydration.
  const [items, setItems] = useState<FeedItem[]>([]);
  useEffect(() => {
    const banks: FeedBank[] = (JSON.parse(banksKey) as FeedBank[]).filter((b) => b.name || b.logoUrl);
    const make = (secondsAgo: number): FeedItem => ({
      id: Math.random().toString(36).slice(2),
      bank: banks.length ? banks[Math.floor(Math.random() * banks.length)] : null,
      user: `xxxx${Math.floor(100000 + Math.random() * 900000)}xxxx`,
      amount: Math.floor(min + Math.random() * (max - min + 1)),
      at: new Date(Date.now() - secondsAgo * 1000),
    });

    let elapsed = 0;
    setItems(
      Array.from({ length: rows }, () => {
        elapsed += 3 + Math.floor(Math.random() * 6);
        return make(elapsed);
      })
    );

    const id = setInterval(() => setItems((prev) => [make(0), ...prev].slice(0, rows)), intervalSec * 1000);
    return () => clearInterval(id);
  }, [rows, intervalSec, min, max, banksKey]);

  if (items.length === 0) return null;

  return (
    <div style={{ background: "rgba(255,255,255,.05)", border: `1px solid ${accent}33`, borderRadius: "14px", overflow: "hidden" }}>
      {data.title ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: `${accent}1f`, borderBottom: `1px solid ${accent}33`, fontSize: "13px", fontWeight: 700, color: accent }}>
          <span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, flexShrink: 0 }} />
          {data.title}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px" }}>
        {items.map((it) => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,.28)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "12px", padding: "10px 12px" }}>
            {it.bank?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.bank.logoUrl} alt={it.bank.name} style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <span
                aria-hidden="true"
                style={{ width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0, background: it.bank?.color || accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff" }}
              >
                {(it.bank?.name || "?").charAt(0)}
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0, fontSize: "12.5px", lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>ยูส: {it.user}</p>
              <p style={{ margin: 0 }}>ยอดถอน: <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{it.amount.toLocaleString()}</span> บาท</p>
              <p style={{ margin: 0, color: muted }}>วันที่: {thaiDateTime(it.at)}</p>
            </div>
            {data.statusLabel ? (
              <span style={{ flexShrink: 0, background: `${accent}26`, border: `1px solid ${accent}66`, color: accent, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700 }}>
                {data.statusLabel}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Prizes({ data, accent }: { data: { items: { label: string; imageUrl: string }[] }; accent: string }) {
  const items = data.items.filter((i) => i.label || i.imageUrl);
  if (items.length === 0) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
      {items.map((it, i) => (
        <Card key={i} accent={accent}>
          {it.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.imageUrl} alt={it.label} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "8px", marginBottom: "6px" }} />
          ) : null}
          <p style={{ margin: 0, fontSize: "12px", textAlign: "center" }}>{it.label}</p>
        </Card>
      ))}
    </div>
  );
}

function Announcements({ data, accent, muted }: { data: { items: string[] }; accent: string; muted: string }) {
  if (data.items.length === 0) return null;
  return (
    <Card accent={accent}>
      <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 700, color: accent }}>📣 ประกาศ</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {data.items.map((t, i) => (
          <p key={i} style={{ margin: 0, fontSize: "12.5px", color: muted }}>• {t}</p>
        ))}
      </div>
    </Card>
  );
}

function ImageSlider({ data }: { data: { images: string[] } }) {
  const images = data.images.filter(Boolean);
  if (images.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt="" style={{ height: "160px", width: "160px", flexShrink: 0, objectFit: "cover", borderRadius: "12px" }} />
      ))}
    </div>
  );
}

function ReviewsCarousel({ title, subtitle, reviews, accent, muted }: { title: string | null; subtitle: string | null; reviews: Review[]; accent: string; muted: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % reviews.length), 4000);
    return () => clearInterval(id);
  }, [reviews.length]);
  const r = reviews[i];
  return (
    <div>
      <h2 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: 700, textAlign: "center", color: accent }}>{title || "⭐ เสียงตอบรับจากผู้ใช้งาน"}</h2>
      {subtitle ? <p style={{ margin: "0 0 8px", fontSize: "12px", textAlign: "center", color: muted }}>{subtitle}</p> : null}
      <Card accent={accent}>
        <p style={{ margin: 0, color: "#ffce73" }}>{"★".repeat(Number(r.stars?.[0]) || 5)}</p>
        <p style={{ margin: "6px 0 0", fontSize: "13px" }}>{r.text}</p>
        <p style={{ margin: "8px 0 0", fontSize: "12px", fontWeight: 600, color: muted }}>— {r.member}</p>
      </Card>
    </div>
  );
}

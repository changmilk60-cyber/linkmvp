"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  Badge,
  BarChart,
  Button,
  ColorField,
  DataTable,
  Field,
  Hint,
  ImageUploadField,
  PageHeader,
  Pill,
  QuickNavGrid,
  SaveBanner,
  SaveBar,
  SectionCard,
  SectionRow,
  SegmentedChoice,
  Select,
  StatCard,
  TextInput,
  Textarea,
  ThemeSwatchCard,
  Toggle,
} from "@/components/ds";
import { logoutAction, moveSectionAction, renameSlugAction, saveSettingsAction } from "@/app/actions";
import { FEED_BANK_SLOTS, SECTION_META, THEME_PRESETS, type SectionEntry, type SectionKey } from "@/lib/sections";

type PageData = {
  id: string;
  slug: string;
  themePreset: string;
  tabTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  logoUrl: string | null;
  lineLogoUrl: string | null;
  footerText: string | null;
  footerTextColor: string | null;
  colorOverrides: string | null;
  fbPixelIds: string | null;
  capiAccessToken: string | null;
  capiEndpointUrl: string | null;
  capiEventName: string;
  ctaLayout: string;
  landingUrl: string | null;
  whitepageRedirectUrl: string | null;
  useSameLandingForAll: boolean;
  cloakToLandingUrl: boolean;
  heroHeadline: string | null;
  heroSubtext: string | null;
  sections: SectionEntry[];
  reviewsTitle: string | null;
  reviewsSubtitle: string | null;
  reviews: { member: string; text: string; stars: string }[];
  licenseExpiresAt: string;
  daysLeft: number;
};

type Stats = {
  viewsToday: number;
  uniqueToday: number;
  signupClicksToday: number;
  lineClicksToday: number;
  signupClicksTotal: number;
  lineClicksTotal: number;
  viewsAllTime: number;
  views30d: number;
  ctr: string;
  chart: { label: string; value: number }[];
  table: [string, number, number][];
};

const NAV = [
  { icon: "📘", label: "วิธีใช้งาน", key: "manual" },
  { icon: "📊", label: "Dashboard", key: "dashboard" },
  { icon: "⏰", label: "วันใช้งาน", key: "license" },
  { icon: "🔗", label: "เปลี่ยนชื่อ URL", key: "url" },
  { icon: "🌐", label: "ใช้งาน Bot", key: "bot" },
  { icon: "🍪", label: "ใส่ Pixel", key: "pixel" },
  { icon: "🎨", label: "โทนสี", key: "theme" },
  { icon: "📐", label: "จัดเรียง Section", key: "sections" },
  { label: "ตั้งค่าหลัก", key: "main" },
  { label: "รูปภาพ", key: "images" },
  { label: "ข้อความหน้าเว็บ", key: "text" },
  { label: "ปรับสีตัวอักษร", key: "colors" },
];

function d(data: Record<string, unknown>) {
  return data as Record<string, string>;
}

export default function AdminClient({ page, stats, baseUrl }: { page: PageData; stats: Stats; baseUrl: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    manual: false, dashboard: true, license: true, url: true, bot: true, sections: true,
    reviews: true, theme: true, pixel: true, main: true, images: true, text: true, colors: true,
  });
  const t = (k: string) => () => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const jump = (it: { key: string }) => {
    const el = document.getElementById("panel-" + it.key);
    if (el) window.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
  };

  const [saveState, saveAction] = useFormState(saveSettingsAction, {});
  const [themePreset, setThemePreset] = useState(page.themePreset);
  const colors = page.colorOverrides ? (JSON.parse(page.colorOverrides) as Record<string, string>) : {};
  const pixelIds: string[] = page.fbPixelIds ? JSON.parse(page.fbPixelIds) : [];

  // Every panel's own "บันทึกส่วนนี้" button — and the bottom SaveBar — share
  // this one saveAction/saveState pair, so a single popup here covers all of
  // them regardless of scroll position. Auto-dismisses after 3s.
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [toastShown, setToastShown] = useState(false);
  useEffect(() => {
    if (saveState?.success) {
      setToast({ ok: true, text: "บันทึกเรียบร้อย" });
    } else if (saveState?.error) {
      setToast({ ok: false, text: saveState.error });
    } else {
      return;
    }
    setToastShown(true);
    const showTimer = setTimeout(() => setToastShown(false), 3000);
    return () => clearTimeout(showTimer);
  }, [saveState]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            zIndex: 9999,
            transform: `translateX(-50%) translateY(${toastShown ? "0" : "-16px"})`,
            opacity: toastShown ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 220ms var(--ease-standard), transform 220ms var(--ease-standard)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--surface-card)",
              border: "1px solid " + (toast.ok ? "var(--border-accent)" : "var(--border-danger)"),
              borderRadius: "var(--radius-card)",
              padding: "14px 22px",
              boxShadow: "0 8px 28px rgba(0,0,0,.45)",
              font: "var(--fw-bold) var(--fs-section-title)/1.2 var(--font-sans)",
              color: toast.ok ? "var(--text-accent)" : "var(--text-danger)",
              maxWidth: "90vw",
            }}
          >
            <span aria-hidden="true">{toast.ok ? "✅" : "⚠"}</span>
            {toast.text}
          </div>
        </div>
      ) : null}
      <div style={{ maxWidth: "940px", margin: "0 auto", padding: "20px", display: "flex", flexDirection: "column", gap: "var(--gap-card)" }}>
        <PageHeader
          title="หลังบ้านแก้เว็บ"
          subtitle="จัดการเป็นหมวดหมู่ กดบันทึกครั้งเดียวใช้ได้ทั้งเว็บ"
          actions={
            <>
              <Pill icon="⏰">เหลือ {page.daysLeft} วัน</Pill>
              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" icon="👁">พรีวิวหน้าเซลเพจ</Button>
              </a>
              <form action={logoutAction}><Button variant="ghost" type="submit">ออกจากระบบ</Button></form>
            </>
          }
        />

        {saveState?.success ? <SaveBanner message="บันทึกเรียบร้อย" version={new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")} /> : null}
        <QuickNavGrid columns={4} items={NAV} onSelect={jump} />

        <div id="panel-manual">
          <SectionCard icon="📘" title="คู่มือใช้งานหลังบ้าน" subtitle="เลือกหัวข้อที่ต้องการเพื่อดูวิธีใช้งานทีละขั้นตอน" open={open.manual} onToggle={t("manual")}>
            <ManualAccordion />
          </SectionCard>
        </div>

        <div id="panel-dashboard">
          <SectionCard icon="📊" title="Dashboard สถิติเซลเพจ" subtitle="สรุปผู้เข้าชมและจำนวนการคลิกปุ่ม อัปเดตแบบเรียลไทม์จากผู้เข้าชมจริง" open={open.dashboard} onToggle={t("dashboard")}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "var(--gap-grid)" }}>
              <StatCard label="ผู้เข้าชมวันนี้" value={stats.viewsToday} note="Session" />
              <StatCard label="ผู้ชมไม่ซ้ำวันนี้" value={stats.uniqueToday} note="ประมาณจากเบราว์เซอร์" />
              <StatCard label="คลิกปุ่มสมัครทั้งหมด" value={stats.signupClicksTotal} note={`วันนี้ ${stats.signupClicksToday} คลิก`} />
              <StatCard label="คลิกปุ่ม LINE ทั้งหมด" value={stats.lineClicksTotal} note={`วันนี้ ${stats.lineClicksToday} คลิก`} />
              <StatCard label="ผู้เข้าชมทั้งหมด" value={stats.viewsAllTime} note="ตั้งแต่เปิดใช้งาน" />
              <StatCard label="อัตราคลิกโดยรวม (CTR)" value={`${stats.ctr}%`} note="คลิกทุกปุ่ม/ผู้เข้าชม" />
              <StatCard label="ผู้ชม 30 วันล่าสุด" value={stats.views30d} note="รวม" />
              <StatCard label="สถานะ" value={page.daysLeft > 0 ? "ใช้งานได้" : "หมดอายุ"} noteTone="muted" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "var(--gap-grid)" }}>
              <BarChart title="ผู้เข้าชมย้อนหลัง 7 วัน" height={230} data={stats.chart} />
              <DataTable title="คลิกรายวัน" columns={["วันที่", "สมัคร", "LINE"]} rows={stats.table} />
            </div>
            <p style={{ margin: 0, font: "var(--fw-medium) var(--fs-micro)/1.4 var(--font-sans)", color: "var(--text-muted)" }}>
              นับจากการเข้าชมหน้าเซลเพจจริงและการคลิกปุ่มสมัคร/LINE จริง • ผู้ชมไม่ซ้ำประมาณจากคุกกี้เบราว์เซอร์
            </p>
          </SectionCard>
        </div>

        <div id="panel-license">
          <SectionCard icon="⏰" title="วันใช้งาน (License)" subtitle="หมดอายุแล้วหน้าเว็บจะเด้งไป White Page อัตโนมัติ" open={open.license} onToggle={t("license")}>
            <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)" }}>
              <p style={{ margin: 0, font: "var(--fw-semibold) var(--fs-body)/1.5 var(--font-sans)" }}>วันหมดอายุปัจจุบัน: <span style={{ color: "var(--text-accent-bright)" }}>{page.licenseExpiresAt}</span></p>
              <p style={{ margin: "6px 0 0", font: "var(--fw-semibold) var(--fs-body)/1.5 var(--font-sans)" }}>ต้องการต่ออายุ กรุณาติดต่อแอดมิน</p>
            </div>
          </SectionCard>
        </div>

        <div id="panel-url">
          <UrlPanel open={open.url} onToggle={t("url")} pageId={page.id} slug={page.slug} baseUrl={baseUrl} />
        </div>

        <div id="panel-bot">
          <SectionCard icon="🌐" title="ตั้งค่าใช้งาน bot" subtitle="กำหนดหน้าเดียวกันสำหรับคอมพิวเตอร์ มือถือ แท็บเล็ต และระบบตรวจสอบ" open={open.bot} onToggle={t("bot")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={["landingUrl", "whitepageRedirectUrl", "useSameLandingForAll", "cloakToLandingUrl"]} />
              <Field label="ลิงก์ Landing Page" hint="ใส่ URL แบบเต็ม หากเว้นว่างหรือ URL ไม่ถูกต้อง ระบบจะแสดงหน้าเซลเพจเดิม" hintTone="body">
                <TextInput mono name="landingUrl" defaultValue={page.landingUrl || ""} placeholder="https://example.com" />
              </Field>
              <Field label="ลิงก์ Redirect หน้า Whitepage" hint="เมื่อหมดอายุ ระบบจะส่งผู้เข้าชมไปยัง URL นี้ทันที หากเว้นว่างจะโชว์หน้าหมดอายุเปล่า" hintTone="body">
                <TextInput mono name="whitepageRedirectUrl" defaultValue={page.whitepageRedirectUrl || ""} placeholder="https://example.com" />
              </Field>
              <ToggleRow name="cloakToLandingUrl" title="ใช้ Landing Page แทนหน้าเซลเพจเดิม" sub="เปิดไว้ = ผู้เข้าชมทุกคนถูกส่งไปที่ลิงก์ Landing Page แทน" defaultChecked={page.cloakToLandingUrl} />
              <ToggleRow name="useSameLandingForAll" title="คอมและมือถือเห็นหน้าเดียวกัน" sub="ทุกอุปกรณ์แสดงหน้าเซลเพจหลัก" defaultChecked={page.useSameLandingForAll} />
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-sections">
          <SectionCard icon="📐" title="จัดเรียง Section" subtitle="กดลูกศรเพื่อสลับลำดับ • สลับปุ่มเพื่อเปิด/ปิด แต่ละ section • กดบันทึกทั้งหมดด้านล่างสุด" open={open.sections} onToggle={t("sections")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={[]} ownsSections />
              {page.sections.map((s, i) => (
                <div key={s.key} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "12px" }}>
                    <Button type="submit" formAction={moveSectionAction.bind(null, i, "up")} variant="quiet" size="sm" disabled={i === 0}>▲</Button>
                    <Button type="submit" formAction={moveSectionAction.bind(null, i, "down")} variant="quiet" size="sm" disabled={i === page.sections.length - 1}>▼</Button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <SectionRow
                      index={i + 1}
                      icon={SECTION_META[s.key].icon}
                      title={SECTION_META[s.key].title}
                      enabled={s.enabled}
                      onToggleName={`section_enabled_${s.key}`}
                    >
                      <SectionExtra sKey={s.key} data={s.data} />
                    </SectionRow>
                  </div>
                </div>
              ))}
              {/* per-row data fields above are collected by name into the same form; a reorder click submits via moveSectionAction instead, which only reads pageId */}
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-reviews">
          <SectionCard icon="⭐" title="จัดการรีวิวแบบสุ่ม" count={`${page.reviews.length} รีวิว`} subtitle="แสดงครั้งละ 1 รีวิว • เปลี่ยนอัตโนมัติทุก 4 วินาที" open={open.reviews} onToggle={t("reviews")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={["reviewsTitle", "reviewsSubtitle"]} ownsReviews />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-grid)" }}>
                <Field label="หัวข้อรีวิว"><TextInput name="reviewsTitle" defaultValue={page.reviewsTitle || ""} placeholder="⭐ เสียงตอบรับจากผู้ใช้งาน" /></Field>
                <Field label="คำอธิบายใต้หัวข้อ"><TextInput name="reviewsSubtitle" defaultValue={page.reviewsSubtitle || ""} placeholder="อัปเดตรีวิวใหม่ทุก 4 วินาที" /></Field>
              </div>
              <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", display: "flex", flexDirection: "column", gap: "var(--gap-field)" }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const r = page.reviews[i] || { member: "", text: "", stars: "5 ดาว" };
                  return <ReviewRowForm key={i} index={i} member={r.member} text={r.text} stars={r.stars} />;
                })}
              </div>
              <Hint tone="muted">เว้นว่างแถวที่ไม่ใช้ • ชื่อผู้รีวิวจะแสดงตามที่กรอก</Hint>
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-theme">
          <SectionCard icon="🎨" title="โทนสีเว็บไซต์" count="12 โทน" subtitle="เลือกโทนสีที่ต้องการ — สีและพื้นหลังหน้าเซลเพจจะเปลี่ยนให้เข้าชุดกันอัตโนมัติ" open={open.theme} onToggle={t("theme")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={["themePreset"]} />
              <input type="hidden" name="themePreset" value={themePreset} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--gap-grid)" }}>
                {THEME_PRESETS.map((p) => (
                  <ThemeSwatchCard key={p.key} name={p.name} icon={p.icon} base={p.base} primary={p.primary} accent={p.accent} selected={themePreset === p.key} onSelect={() => setThemePreset(p.key)} />
                ))}
              </div>
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-pixel">
          <SectionCard title="Pixel" icon="🍪" subtitle="ตั้งค่าก่อนขึ้นแอด — สำคัญมาก" open={open.pixel} onToggle={t("pixel")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={["fbPixelIds"]} />
              <Field label="Facebook Pixel ID (ขึ้นบรรทัดใหม่ต่อ 1 ไอดี)">
                <Textarea name="fbPixelIds" defaultValue={pixelIds.join("\n")} rows={3} placeholder={"960483503717089"} />
              </Field>
              <Hint tone="body">กรอก Pixel ID แยกบรรทัด ระบบจะรวมค่าให้อัตโนมัติ</Hint>
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-main">
          <SectionCard title="ตั้งค่าหลัก" subtitle="Tab Title, OG, CAPI และอื่นๆ" open={open.main} onToggle={t("main")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={["tabTitle", "ogDescription", "capiAccessToken", "capiEndpointUrl", "capiEventName", "ctaLayout"]} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-grid)" }}>
                <Field label="ชื่อแท็บเบราว์เซอร์ (Tab Title)"><TextInput name="tabTitle" defaultValue={page.tabTitle || ""} /></Field>
                <Field label="OG Description" hint="ข้อความสั้นๆ ที่แสดงใต้ชื่อตอนแชร์ลิงก์" hintTone="body"><TextInput name="ogDescription" defaultValue={page.ogDescription || ""} /></Field>
                <Field label="CAPI Access Token" hint="จาก Facebook Events Manager" hintTone="body">
                  <TextInput name="capiAccessToken" defaultValue={page.capiAccessToken || ""} placeholder="EAAxxxxxxxxxxxxxx..." />
                  <Hint tone="warning" icon="⚠">เป็นความลับ — ห้ามเปิดเผย</Hint>
                </Field>
                <Field label="ลิงก์ CAPI Endpoint" hint="ปล่อยว่างไว้ก็ได้" hintTone="body"><TextInput name="capiEndpointUrl" defaultValue={page.capiEndpointUrl || ""} /></Field>
                <Field label="ชื่อ Event CAPI" boxed>
                  <SegCapiEvent defaultValue={page.capiEventName} />
                </Field>
                <Field label="Layout ปุ่มสมัคร + LINE" hint="แนวตั้ง = ปุ่มอยู่บน–ล่าง • แนวนอน = ปุ่มอยู่ซ้าย–ขวา" hintTone="body">
                  <SegCtaLayout defaultValue={page.ctaLayout} />
                </Field>
              </div>
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-images">
          <SectionCard title="รูปภาพ" subtitle="โลโก้และโลโก้ LINE ของเว็บ" open={open.images} onToggle={t("images")}>
            <form action={saveAction} style={{ display: "contents" }} encType="multipart/form-data">
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={[]} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-grid)" }}>
                <ImageUploadField label="โลโก้" name="file_logoUrl" currentUrl={page.logoUrl} recommend="ขนาดแนะนำ: 138 × 78 px — แนวนอน พื้นหลังโปร่งใส (.png)" />
                <ImageUploadField label="โลโก้ LINE" name="file_lineLogoUrl" currentUrl={page.lineLogoUrl} recommend="ขนาดแนะนำ: 28 × 28 px — สี่เหลี่ยมจัตุรัส" />
                <ImageUploadField label="OG Image (รูปตอนแชร์ลิงก์)" name="file_ogImage" currentUrl={page.ogImage} recommend="ขนาดแนะนำ: 1200 × 630 px — แนวนอน (1.91:1)" />
              </div>
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-text">
          <SectionCard title="ข้อความหน้าเว็บ" subtitle="หัวข้อ/คำโปรย และท้ายเว็บ" open={open.text} onToggle={t("text")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={["heroHeadline", "heroSubtext", "footerText", "footerTextColor"]} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-grid)" }}>
                <Field label="หัวข้อหลัก"><TextInput name="heroHeadline" defaultValue={page.heroHeadline || ""} /></Field>
                <Field label="คำโปรย"><TextInput name="heroSubtext" defaultValue={page.heroSubtext || ""} /></Field>
              </div>
              <Field label="ข้อความท้ายเว็บ"><Textarea name="footerText" defaultValue={page.footerText || ""} rows={2} /></Field>
              <ColorField label="🎨 สีข้อความท้ายเว็บ" name="footerTextColor" value={page.footerTextColor || ""} swatch={page.footerTextColor || "#ffffff"} />
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <div id="panel-colors">
          <SectionCard title="ปรับสีตัวอักษร" subtitle="ปรับสีอิสระ — ทับ Theme Preset ปล่อยว่าง = ใช้สีจาก Theme" open={open.colors} onToggle={t("colors")}>
            <form action={saveAction} style={{ display: "contents" }}>
              <input type="hidden" name="pageId" value={page.id} />
              <HiddenCarry page={page} except={[]} ownsColors />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-grid)" }}>
                {[
                  ["primary", "สีหลัก (หัวข้อ / ปุ่ม)"],
                  ["body", "สีข้อความทั่วไป"],
                  ["muted", "สีข้อความรอง"],
                  ["cta_text", "สีตัวอักษรปุ่มหลัก"],
                  ["line_cta_text", "สีตัวอักษรปุ่ม LINE"],
                ].map(([key, label]) => (
                  <ColorField key={key} label={label} name={`color_${key}`} value={colors[key] || ""} swatch={colors[key] || "#ffffff"} />
                ))}
              </div>
              <Button type="submit" variant="quiet">บันทึกส่วนนี้</Button>
            </form>
          </SectionCard>
        </div>

        <form action={saveAction}>
          <input type="hidden" name="pageId" value={page.id} />
          <HiddenCarry page={page} except={[]} />
          {saveState?.error ? <p style={{ color: "var(--text-danger)", font: "var(--text-hint)" }}>{saveState.error}</p> : null}
          <SaveBar label="บันทึกทั้งหมด" />
        </form>
      </div>
    </div>
  );
}

// ---------------- small helpers ----------------

function ToggleRow({ name, title, sub, defaultChecked }: { name: string; title: string; sub: string; defaultChecked: boolean }) {
  const [val, setVal] = useState(defaultChecked);
  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)" }}>
      <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", font: "var(--fw-semibold) var(--fs-label)/1.2 var(--font-sans)", color: val ? "var(--text-accent)" : "var(--text-body)" }}>
        <span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: val ? "var(--green-500)" : "var(--white)" }} />{title}
      </p>
      <p style={{ margin: "4px 0 10px", font: "var(--text-hint)", color: "var(--text-muted)" }}>{sub}</p>
      <Toggle checked={val} onChange={setVal} name={name} />
    </div>
  );
}

function SegCapiEvent({ defaultValue }: { defaultValue: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name="capiEventName" value={v} />
      <SegmentedChoice value={v} onChange={setV} options={[{ icon: "🔔", label: "สมัครรับข้อมูล", sublabel: "(Subscribe)", value: "subscribe" }, { icon: "🛒", label: "การซื้อ", sublabel: "(Purchase)", value: "purchase" }]} />
    </>
  );
}

function SegCtaLayout({ defaultValue }: { defaultValue: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name="ctaLayout" value={v} />
      <SegmentedChoice value={v} onChange={setV} options={[{ icon: "↕", label: "แนวตั้ง", value: "vertical" }, { icon: "↔", label: "แนวนอน", value: "horizontal" }]} />
    </>
  );
}

function ReviewRowForm({ index, member, text, stars }: { index: number; member: string; text: string; stars: string }) {
  const inp = { background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--text-body-default)", outline: "none" as const, minWidth: 0 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: "var(--gap-grid)", alignItems: "center" }}>
      <input name={`review_member_${index}`} defaultValue={member} placeholder="สมาชิก" style={inp} />
      <input name={`review_text_${index}`} defaultValue={text} placeholder="ข้อความรีวิว" style={inp} />
      <Select name={`review_stars_${index}`} defaultValue={stars} options={["5 ดาว", "4 ดาว", "3 ดาว", "2 ดาว", "1 ดาว"].map((s) => ({ value: s, label: s }))} />
      <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", font: "var(--fw-bold) var(--fs-label)/1 var(--font-sans)", color: "var(--text-danger)", cursor: "pointer" }}>
        <input type="checkbox" name={`review_remove_${index}`} />✖
      </label>
    </div>
  );
}

function ManualAccordion() {
  const [i, setI] = useState<number | null>(null);
  return (
    <Accordion
      openIndex={i}
      onToggle={setI}
      items={[
        { icon: "📊", title: "ดูสถิติใน Dashboard", body: "ตัวเลขทั้งหมดนับจากผู้เข้าชมจริง • ผู้ชมไม่ซ้ำเป็นค่าประมาณจากคุกกี้เบราว์เซอร์" },
        { icon: "📐", title: "เปิด–ปิด และเรียงลำดับ Section", body: "กดลูกศร ▲▼ เพื่อสลับลำดับ แล้วสลับสวิตช์เพื่อเปิด/ปิดแต่ละ section จากนั้นกดบันทึก" },
        { icon: "🖼", title: "อัปโหลดหรือเปลี่ยนรูปภาพ", body: "เลือกไฟล์รูปในแต่ละช่อง (สูงสุด 5MB ต่อรูป)" },
        { icon: "🎨", title: "เลือกธีมและสีพื้นหลัง", body: "เลือกโทนสี 1 ชุด สีพื้นหลังและปุ่มจะเปลี่ยนให้อัตโนมัติ" },
        { icon: "🍪", title: "เพิ่ม Pixel และเลือก Event CAPI", body: "กรอก Pixel ID แยกบรรทัด ระบบจะรวมค่าให้อัตโนมัติ" },
        { icon: "🔗", title: "เปลี่ยนชื่อ URL เว็บไซต์", body: "URL เดิมจะเปิดไม่ได้หลังเปลี่ยนชื่อ กรุณาอัปเดตลิงก์ที่นำไปใช้งานทั้งหมด" },
        { icon: "💾", title: "บันทึกและตรวจสอบหน้าเว็บ", body: "กดบันทึกทั้งหมด แล้วกดพรีวิวหน้าเซลเพจ" },
      ]}
    />
  );
}

function UrlPanel({ open, onToggle, pageId, slug, baseUrl }: { open: boolean; onToggle: () => void; pageId: string; slug: string; baseUrl: string }) {
  const [state, formAction] = useFormState(renameSlugAction, {});
  return (
    <SectionCard icon="🔗" title="เปลี่ยนชื่อ URL ของเซลเพจ" subtitle="เปลี่ยนชื่อโฟลเดอร์เว็บไซต์ โดยไม่แก้ไขรูป ข้อความ หรือการตั้งค่าภายใน" open={open} onToggle={onToggle}>
      <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)" }}>
        <label style={{ display: "block", font: "var(--text-label)", color: "var(--text-accent)", marginBottom: "8px" }}>URL ปัจจุบัน</label>
        <TextInput mono readOnly value={`${baseUrl.replace(/^https?:\/\//, "")}/${slug}`} />
        <form action={formAction} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--gap-grid)", alignItems: "end", marginTop: "12px" }}>
          <input type="hidden" name="pageId" value={pageId} />
          <div><label style={{ display: "block", font: "var(--text-label)", color: "var(--text-accent)", marginBottom: "8px" }}>ชื่อลิงก์ใหม่</label><TextInput name="newSlug" placeholder="เช่น new-name" /></div>
          <div><label style={{ display: "block", font: "var(--text-label)", color: "var(--text-accent)", marginBottom: "8px" }}>รหัสผ่านยืนยัน</label><TextInput name="confirmPassword" type="password" /></div>
          <Button type="submit" variant="primary">เปลี่ยนชื่อ URL</Button>
        </form>
        {state?.error ? <p style={{ color: "var(--text-danger)", font: "var(--text-hint)", margin: "8px 0 0" }}>{state.error}</p> : null}
        {state?.success ? <p style={{ color: "var(--text-accent)", font: "var(--text-hint)", margin: "8px 0 0" }}>เปลี่ยนชื่อ URL แล้ว — หน้าอาจต้องโหลดใหม่เพื่อเห็นค่าล่าสุด</p> : null}
        <Hint tone="warning" icon="⚠">URL เดิมจะเปิดไม่ได้หลังเปลี่ยนชื่อ กรุณาอัปเดตลิงก์ที่นำไปใช้งานทั้งหมด และห้ามปิดหน้านี้ระหว่างดำเนินการ</Hint>
      </div>
    </SectionCard>
  );
}

// Carries every field the big form needs from `page`/`sections`, as hidden
// inputs, so that submitting from any one panel's own <form> — or the final
// SaveBar's <form> — always sends the *complete* settings snapshot through
// the same saveSettingsAction. Panels list which fields *they* own as
// visible inputs via `except`; everything else rides along hidden.
function HiddenCarry({
  page,
  except,
  ownsSections,
  ownsColors,
  ownsReviews,
}: {
  page: PageData;
  except: string[];
  /** Set only by the panel that renders the real controls for that area, so
   *  its visible inputs aren't shadowed by duplicates carried here. Any panel
   *  that does NOT own an area must carry it, or saveSettingsAction sees the
   *  fields missing and writes the area blank. */
  ownsSections?: boolean;
  ownsColors?: boolean;
  ownsReviews?: boolean;
}) {
  const skip = new Set(except);
  const colors = page.colorOverrides ? (JSON.parse(page.colorOverrides) as Record<string, string>) : {};
  const pixelIds: string[] = page.fbPixelIds ? JSON.parse(page.fbPixelIds) : [];
  return (
    <>
      {!skip.has("themePreset") && <input type="hidden" name="themePreset" value={page.themePreset} />}
      {!skip.has("tabTitle") && <input type="hidden" name="tabTitle" value={page.tabTitle || ""} />}
      {!skip.has("ogDescription") && <input type="hidden" name="ogDescription" value={page.ogDescription || ""} />}
      {!skip.has("capiEventName") && <input type="hidden" name="capiEventName" value={page.capiEventName} />}
      {!skip.has("ctaLayout") && <input type="hidden" name="ctaLayout" value={page.ctaLayout} />}
      {!skip.has("capiAccessToken") && <input type="hidden" name="capiAccessToken" value={page.capiAccessToken || ""} />}
      {!skip.has("capiEndpointUrl") && <input type="hidden" name="capiEndpointUrl" value={page.capiEndpointUrl || ""} />}
      {!skip.has("heroHeadline") && <input type="hidden" name="heroHeadline" value={page.heroHeadline || ""} />}
      {!skip.has("heroSubtext") && <input type="hidden" name="heroSubtext" value={page.heroSubtext || ""} />}
      {!skip.has("footerText") && <input type="hidden" name="footerText" value={page.footerText || ""} />}
      {!skip.has("footerTextColor") && <input type="hidden" name="footerTextColor" value={page.footerTextColor || ""} />}
      {!skip.has("fbPixelIds") && <input type="hidden" name="fbPixelIds" value={pixelIds.join("\n")} />}
      {!skip.has("landingUrl") && <input type="hidden" name="landingUrl" value={page.landingUrl || ""} />}
      {!skip.has("whitepageRedirectUrl") && <input type="hidden" name="whitepageRedirectUrl" value={page.whitepageRedirectUrl || ""} />}
      {!skip.has("useSameLandingForAll") && page.useSameLandingForAll && <input type="hidden" name="useSameLandingForAll" value="on" />}
      {!skip.has("cloakToLandingUrl") && page.cloakToLandingUrl && <input type="hidden" name="cloakToLandingUrl" value="on" />}
      {!skip.has("reviewsTitle") && <input type="hidden" name="reviewsTitle" value={page.reviewsTitle || ""} />}
      {!skip.has("reviewsSubtitle") && <input type="hidden" name="reviewsSubtitle" value={page.reviewsSubtitle || ""} />}
      {!ownsReviews && page.reviews.map((r, i) => (
        <span key={i}>
          <input type="hidden" name={`review_member_${i}`} value={r.member} />
          <input type="hidden" name={`review_text_${i}`} value={r.text} />
          <input type="hidden" name={`review_stars_${i}`} value={r.stars} />
        </span>
      ))}
      {!ownsColors && ["primary", "body", "muted", "cta_text", "line_cta_text"].map((k) => (
        <input key={k} type="hidden" name={`color_${k}`} value={colors[k] || ""} />
      ))}
      {!ownsSections && page.sections.map((s) => (
        <span key={s.key}>
          <input type="hidden" name={`section_enabled_${s.key}`} value={s.enabled ? "on" : ""} />
          <SectionHiddenData sKey={s.key} data={s.data} />
        </span>
      ))}
    </>
  );
}

function SectionHiddenData({ sKey, data }: { sKey: SectionKey; data: Record<string, unknown> }) {
  const v = d(data);
  switch (sKey) {
    case "online_users":
      return <><input type="hidden" name="section_data_online_users_min" value={v.min ?? 20} /><input type="hidden" name="section_data_online_users_max" value={v.max ?? 80} /></>;
    case "bonus_total":
      return <><input type="hidden" name="section_data_bonus_total_baseAmount" value={v.baseAmount ?? 0} /><input type="hidden" name="section_data_bonus_total_perHourIncrement" value={v.perHourIncrement ?? 0} /></>;
    case "gif_signup_button":
      return <input type="hidden" name="section_data_gif_signup_button_linkUrl" value={v.linkUrl || ""} />;
    case "text_block_1":
    case "text_block_2":
      return <><input type="hidden" name={`section_data_${sKey}_heading`} value={v.heading || ""} /><input type="hidden" name={`section_data_${sKey}_body`} value={v.body || ""} /></>;
    case "top_games": {
      const games = (data as { games?: { name: string }[] }).games || [];
      return <>{games.map((g, i) => <input key={i} type="hidden" name={`section_data_top_games_name_${i}`} value={g.name || ""} />)}</>;
    }
    case "player_ranking": {
      const players = (data as { players?: { name: string; amount: string }[] }).players || [];
      return <>{Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>
          <input type="hidden" name={`section_data_player_ranking_name_${i}`} value={players[i]?.name || ""} />
          <input type="hidden" name={`section_data_player_ranking_amount_${i}`} value={players[i]?.amount || ""} />
        </span>
      ))}</>;
    }
    case "withdraw_feed": {
      const banks = (data as { banks?: { name: string; color: string }[] }).banks || [];
      return (
        <>
          <input type="hidden" name="section_data_withdraw_feed_title" value={v.title || ""} />
          <input type="hidden" name="section_data_withdraw_feed_statusLabel" value={v.statusLabel || ""} />
          <input type="hidden" name="section_data_withdraw_feed_minAmount" value={v.minAmount ?? 1000} />
          <input type="hidden" name="section_data_withdraw_feed_maxAmount" value={v.maxAmount ?? 20000} />
          <input type="hidden" name="section_data_withdraw_feed_rows" value={v.rows ?? 5} />
          <input type="hidden" name="section_data_withdraw_feed_intervalSec" value={v.intervalSec ?? 6} />
          {Array.from({ length: FEED_BANK_SLOTS }).map((_, i) => (
            <span key={i}>
              <input type="hidden" name={`section_data_withdraw_feed_bank_name_${i}`} value={banks[i]?.name || ""} />
              <input type="hidden" name={`section_data_withdraw_feed_bank_color_${i}`} value={banks[i]?.color || ""} />
            </span>
          ))}
        </>
      );
    }
    case "prizes": {
      const items = (data as { items?: { label: string }[] }).items || [];
      return <>{Array.from({ length: 4 }).map((_, i) => <input key={i} type="hidden" name={`section_data_prizes_label_${i}`} value={items[i]?.label || ""} />)}</>;
    }
    case "announcements": {
      const items = (data as { items?: string[] }).items || [];
      return <>{Array.from({ length: 5 }).map((_, i) => <input key={i} type="hidden" name={`section_data_announcements_text_${i}`} value={items[i] || ""} />)}</>;
    }
    case "signup_line_buttons":
      return <><input type="hidden" name="section_data_signup_line_buttons_signupUrl" value={v.signupUrl || ""} /><input type="hidden" name="section_data_signup_line_buttons_lineUrl" value={v.lineUrl || ""} /></>;
    default:
      return null;
  }
}

function SectionExtra({ sKey, data }: { sKey: SectionKey; data: Record<string, unknown> }) {
  const v = d(data);
  switch (sKey) {
    case "online_users":
      return (
        <>
          <Field label="ผู้ใช้ออนไลน์ ต่ำสุด"><TextInput name="section_data_online_users_min" defaultValue={String(v.min ?? 20)} type="number" /></Field>
          <Field label="ผู้ใช้ออนไลน์ สูงสุด"><TextInput name="section_data_online_users_max" defaultValue={String(v.max ?? 80)} type="number" /></Field>
        </>
      );
    case "bonus_total":
      return (
        <>
          <Field label="ยอดตั้งต้น"><TextInput name="section_data_bonus_total_baseAmount" defaultValue={String(v.baseAmount ?? 0)} type="number" /></Field>
          <Field label="เพิ่มต่อชั่วโมง"><TextInput name="section_data_bonus_total_perHourIncrement" defaultValue={String(v.perHourIncrement ?? 0)} type="number" /></Field>
        </>
      );
    case "gif_signup_button":
      return (
        <>
          <Field label="ลิงก์ปุ่ม GIF สมัคร" hint="ใส่ลิงก์ปลายทางแบบเต็ม เริ่มด้วย https://" hintTone="accent"><TextInput name="section_data_gif_signup_button_linkUrl" defaultValue={v.linkUrl || ""} placeholder="https://example.com" /></Field>
          <ImageUploadField label="รูปปุ่ม GIF สมัคร" name="section_file_gif_signup_button_image" currentUrl={v.imageUrl} recommend="แนวนอน กว้าง 396 px ขึ้นไป (.gif หรือ .png)" />
        </>
      );
    case "hero_image":
      return <ImageUploadField label="รูปหลัก" name="section_file_hero_image_image" currentUrl={v.imageUrl} recommend="430 × 430 px — สี่เหลี่ยมจัตุรัส (1:1)" style={{ gridColumn: "1 / -1" }} />;
    case "text_block_1":
    case "text_block_2":
      return (
        <>
          <Field label="หัวข้อ"><TextInput name={`section_data_${sKey}_heading`} defaultValue={v.heading || ""} /></Field>
          <Field label="เนื้อหา"><Textarea name={`section_data_${sKey}_body`} defaultValue={v.body || ""} rows={3} /></Field>
        </>
      );
    case "top_games": {
      const games = (data as { games?: { name: string; imageUrl: string }[] }).games || [];
      return (
        <>
          {[0, 1, 2].map((i) => (
            <Field key={i} label={`เกม ${i + 1}`}>
              <TextInput name={`section_data_top_games_name_${i}`} defaultValue={games[i]?.name || ""} placeholder="ชื่อเกม" style={{ marginBottom: "8px" }} />
              <ImageUploadField name={`section_file_top_games_image_${i}`} currentUrl={games[i]?.imageUrl} />
            </Field>
          ))}
        </>
      );
    }
    case "player_ranking": {
      const players = (data as { players?: { name: string; amount: string }[] }).players || [];
      return (
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <TextInput name={`section_data_player_ranking_name_${i}`} defaultValue={players[i]?.name || ""} placeholder={`ชื่อผู้เล่นอันดับ ${i + 1}`} />
              <TextInput name={`section_data_player_ranking_amount_${i}`} defaultValue={players[i]?.amount || ""} placeholder="ยอด" />
            </div>
          ))}
        </div>
      );
    }
    case "withdraw_feed": {
      const banks = (data as { banks?: { name: string; logoUrl: string; color: string }[] }).banks || [];
      return (
        <>
          <Field label="หัวข้อกล่อง"><TextInput name="section_data_withdraw_feed_title" defaultValue={v.title || ""} placeholder="AUTO SYSTEM • ยืนยันยอดแล้ว" /></Field>
          <Field label="ข้อความป้ายสถานะ"><TextInput name="section_data_withdraw_feed_statusLabel" defaultValue={v.statusLabel || ""} placeholder="สำเร็จแล้ว" /></Field>
          <Field label="ยอดถอนต่ำสุด (บาท)"><TextInput name="section_data_withdraw_feed_minAmount" type="number" defaultValue={String(v.minAmount ?? 1000)} /></Field>
          <Field label="ยอดถอนสูงสุด (บาท)"><TextInput name="section_data_withdraw_feed_maxAmount" type="number" defaultValue={String(v.maxAmount ?? 20000)} /></Field>
          <Field label="แสดงกี่รายการ" hint="1–20 รายการ" hintTone="muted"><TextInput name="section_data_withdraw_feed_rows" type="number" defaultValue={String(v.rows ?? 5)} /></Field>
          <Field label="เพิ่มรายการใหม่ทุกกี่วินาที" hint="2–120 วินาที" hintTone="muted"><TextInput name="section_data_withdraw_feed_intervalSec" type="number" defaultValue={String(v.intervalSec ?? 6)} /></Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ margin: "0 0 8px", font: "var(--text-label)", color: "var(--text-accent)" }}>ธนาคารที่จะสุ่มแสดง (เว้นว่างช่องที่ไม่ใช้)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "var(--gap-grid)" }}>
              {Array.from({ length: FEED_BANK_SLOTS }).map((_, i) => (
                <Field key={i} label={`ธนาคาร ${i + 1}`}>
                  <TextInput name={`section_data_withdraw_feed_bank_name_${i}`} defaultValue={banks[i]?.name || ""} placeholder="ชื่อธนาคาร" style={{ marginBottom: "8px" }} />
                  <TextInput name={`section_data_withdraw_feed_bank_color_${i}`} defaultValue={banks[i]?.color || ""} placeholder="สีวงกลม เช่น #4e2a84" style={{ marginBottom: "8px" }} />
                  <ImageUploadField name={`section_file_withdraw_feed_bank_logo_${i}`} currentUrl={banks[i]?.logoUrl} note="อัปโหลดโลโก้ธนาคารเอง (ไม่ใส่ก็ได้ จะใช้วงกลมสี + ตัวอักษรแรกแทน)" />
                </Field>
              ))}
            </div>
          </div>
          <Hint tone="warning" icon="⚠" style={{ gridColumn: "1 / -1" }}>
            รายการในส่วนนี้ระบบสุ่มสร้างขึ้นใหม่ทุกครั้งที่มีคนเปิดหน้าเว็บ ไม่ใช่รายการถอนจริง
          </Hint>
        </>
      );
    }
    case "prizes": {
      const items = (data as { items?: { label: string; imageUrl: string }[] }).items || [];
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Field key={i} label={`รางวัล ${i + 1}`}>
              <TextInput name={`section_data_prizes_label_${i}`} defaultValue={items[i]?.label || ""} placeholder="ชื่อรางวัล" style={{ marginBottom: "8px" }} />
              <ImageUploadField name={`section_file_prizes_image_${i}`} currentUrl={items[i]?.imageUrl} />
            </Field>
          ))}
        </>
      );
    }
    case "announcements": {
      const items = (data as { items?: string[] }).items || [];
      return (
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TextInput key={i} name={`section_data_announcements_text_${i}`} defaultValue={items[i] || ""} placeholder={`ประกาศ ${i + 1}`} />
          ))}
        </div>
      );
    }
    case "image_slider": {
      const images = (data as { images?: string[] }).images || [];
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <ImageUploadField key={i} label={`สไลด์ ${i + 1}`} name={`section_file_image_slider_image_${i}`} currentUrl={images[i]} recommend="430 × 430 px" />
          ))}
        </>
      );
    }
    case "signup_line_buttons":
      return (
        <>
          <Field label="🔗 ลิงก์สมัคร / เข้าสู่ระบบ" hint="ใส่ลิงก์ปลายทางแบบเต็ม เริ่มด้วย https://" hintTone="accent"><TextInput name="section_data_signup_line_buttons_signupUrl" defaultValue={v.signupUrl || ""} placeholder="https://example.com" /></Field>
          <Field label="🔗 ลิงก์ LINE" hint="ใส่ลิงก์ปลายทางแบบเต็ม เริ่มด้วย https://" hintTone="accent"><TextInput name="section_data_signup_line_buttons_lineUrl" defaultValue={v.lineUrl || ""} placeholder="https://example.com" /></Field>
        </>
      );
    default:
      return null;
  }
}

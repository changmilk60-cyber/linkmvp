import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ds";
import HomeFaq from "./HomeFaq";

export const metadata: Metadata = {
  title: "LINKMVP – ระบบสร้างเซลเพจและจัดการหน้าเว็บไซต์ขายสินค้าออนไลน์",
  description:
    "แพลตฟอร์มสร้างและจัดการหน้า Sales Page สำหรับธุรกิจออนไลน์ จัดการ Section โทนสี Pixel รีวิว และสถิติผู้เข้าชมได้จากระบบหลังบ้านเดียว",
};

const FEATURES = [
  {
    icon: "🧩",
    title: "จัดการหลาย Section ได้ง่าย",
    body: "ปรับแต่งส่วนประกอบของหน้าเซลเพจได้อย่างเป็นระบบ ทั้งส่วนแนะนำสินค้า รายละเอียด รูปภาพ และเนื้อหาประกอบการขาย",
    ticks: ["เปิด-ปิดแต่ละ Section ได้", "จัดลำดับขึ้น-ลงได้เอง", "พรีวิวผลก่อนเผยแพร่"],
  },
  {
    icon: "🎨",
    title: "ปรับแต่งโทนสีเว็บไซต์",
    body: "เปลี่ยนสีและรูปแบบการนำเสนอให้เข้ากับแบรนด์หรือสินค้า เพื่อสร้างเอกลักษณ์ให้หน้าเซลเพจของคุณ",
    ticks: ["เลือกสีพื้นหลังและปุ่มได้", "ปรับสีตัวอักษรแยกส่วน", "เห็นผลทันทีที่บันทึก"],
  },
  {
    icon: "🗂️",
    title: "จัดการเนื้อหาจากหลังบ้านเดียว",
    body: "แก้ไขข้อมูลและอัปเดตเนื้อหาผ่านระบบจัดการส่วนกลาง ช่วยลดความยุ่งยากในการดูแลเว็บไซต์",
    ticks: ["แก้ข้อความและรูปภาพ", "ลากรูปจากคอมมาวางได้", "ไม่ต้องเขียนโค้ด"],
  },
  {
    icon: "📊",
    title: "รองรับการติดตั้ง Tracking Pixel",
    body: "ตั้งค่า Pixel สำหรับติดตามผลทางการตลาดตามการรองรับของระบบ เพื่อนำข้อมูลไปวิเคราะห์และปรับปรุงแคมเปญโฆษณา",
    ticks: ["ใส่ Facebook Pixel ID ได้", "ยิง Event ตอนกดปุ่ม", "ใช้ร่วมกับ Ads Manager"],
  },
  {
    icon: "⭐",
    title: "จัดการรีวิวลูกค้า",
    body: "ดูแลส่วนแสดงรีวิวและความคิดเห็นจากลูกค้า เพื่อช่วยนำเสนอข้อมูลประกอบการตัดสินใจซื้อ",
    ticks: ["เพิ่ม-ลบรีวิวได้เอง", "ตั้งค่าการแสดงผล", "จัดวางร่วมกับ Section อื่น"],
  },
  {
    icon: "📈",
    title: "ดูสถิติผู้เข้าชมเว็บไซต์",
    body: "ตรวจสอบสถิติผู้เข้าชมหน้าเซลเพจ เพื่อเข้าใจการเข้าถึงเว็บไซต์และนำข้อมูลไปปรับปรุงการตลาด",
    ticks: ["นับยอดเข้าชมหน้าเพจ", "นับการคลิกปุ่ม", "ดูได้จากหน้า Dashboard"],
  },
];

const AUDIENCE = [
  { who: "เจ้าของร้านค้าออนไลน์", what: "จัดการหน้าเสนอขายสินค้าและอัปเดตข้อมูลได้สะดวก" },
  { who: "นักการตลาดออนไลน์", what: "บริหารหน้าเซลเพจสำหรับแคมเปญโฆษณา" },
  { who: "เอเจนซี่การตลาด", what: "จัดการงานหน้าเซลเพจให้กับธุรกิจและลูกค้า" },
  { who: "ผู้ขายสินค้าออนไลน์", what: "นำเสนอรายละเอียดสินค้าและรีวิวผ่านหน้าเว็บไซต์" },
  { who: "ผู้ประกอบการ", what: "เพิ่มช่องทางนำเสนอสินค้าและบริการบนโลกออนไลน์" },
];

const CAPABILITIES = [
  { big: "17", label: "SECTION", note: "ส่วนประกอบหน้าเซลเพจที่เปิด-ปิดและจัดลำดับได้เอง" },
  { big: "0", label: "LINES OF CODE", note: "ไม่ต้องเขียนโค้ดหรือแก้ไฟล์เว็บไซต์เลยสักบรรทัด" },
  { big: "2", label: "THEME MODES", note: "สลับธีมสว่าง / ธีมมืด ในระบบหลังบ้านได้ตามถนัด" },
  { big: "1", label: "DASHBOARD", note: "เนื้อหา โทนสี Pixel รีวิว และสถิติ อยู่ในที่เดียวกัน" },
];

const STEPS = [
  { no: "01", title: "สมัครสมาชิกและเข้าสู่ระบบ", body: "สร้างบัญชีเพื่อเข้าใช้งานระบบหลังบ้าน แล้วตั้งชื่อ URL ของหน้าเซลเพจที่ต้องการ" },
  { no: "02", title: "จัดเนื้อหาและปรับโทนสี", body: "เลือกเปิด Section ที่ต้องการใช้ ใส่ข้อความ รูปภาพ รีวิว และปรับสีให้เข้ากับแบรนด์" },
  { no: "03", title: "เผยแพร่และติดตามผล", body: "กดบันทึกแล้วหน้าเซลเพจอัปเดตทันที พร้อมดูสถิติผู้เข้าชมและยิง Pixel ได้จาก Dashboard" },
];

function Section({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ width: "100%", padding: "clamp(56px, 8vw, 100px) 0", ...style }}>
      <div className="lp-shell">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="lp-eyebrow">{children}</span>;
}

function H2({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <h2
      style={{
        margin: "0 0 14px",
        fontFamily: "var(--font-sans-pv)",
        fontSize: "clamp(25px, 3.6vw, 38px)",
        fontWeight: 700,
        lineHeight: 1.35,
        color: "var(--text-primary)",
        textWrap: "balance",
        ...(center ? { textAlign: "center" as const } : null),
      }}
    >
      {children}
    </h2>
  );
}

function Accent({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--text-accent)" }}>{children}</span>;
}

function Lead({ children, center = false, max = "720px" }: { children: ReactNode; center?: boolean; max?: string }) {
  return (
    <p
      style={{
        margin: center ? "0 auto 14px" : "0 0 14px",
        maxWidth: max,
        fontFamily: "var(--font-sans-pv)",
        fontSize: "15.5px",
        lineHeight: 1.85,
        color: "var(--text-muted)",
        ...(center ? { textAlign: "center" as const } : null),
      }}
    >
      {children}
    </p>
  );
}

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-page)", overflowX: "hidden" }}>
      {/* ── top bar ───────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "color-mix(in srgb, var(--surface-page) 86%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-hairline)",
        }}
      >
        <div className="lp-shell" style={{ padding: "13px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-sans-pv)", fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: ".02em" }}>
            LINK<Accent>MVP</Accent>
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login"><Button variant="ghost" size="sm">เข้าสู่ระบบ</Button></Link>
            <Link href="/register"><Button variant="primary" size="sm">เริ่มต้นใช้งาน</Button></Link>
          </div>
        </div>
      </header>

      {/* ── 1 · hero ──────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "clamp(52px, 8vw, 96px) 0 0" }}>
        <span aria-hidden="true" className="lp-grid-bg" />
        <span aria-hidden="true" className="lp-beams">
          <span className="lp-beam lp-beam-1" />
          <span className="lp-beam lp-beam-2" />
          <span className="lp-beam lp-beam-3" />
          <span className="lp-beam lp-beam-4" />
          <span className="lp-beam-core lp-beam-core-l" />
          <span className="lp-beam-core lp-beam-core-r" />
        </span>
        <div className="lp-shell" style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Eyebrow>⚡ Sales Page Management Platform</Eyebrow>
          <h1
            style={{
              margin: "4px 0 0",
              maxWidth: "820px",
              fontFamily: "var(--font-sans-pv)",
              fontSize: "clamp(31px, 5.4vw, 54px)",
              fontWeight: 700,
              lineHeight: 1.32,
              color: "var(--text-primary)",
              textWrap: "balance",
            }}
          >
            <span style={{ display: "inline-block" }}>สร้างเซลเพจง่าย ๆ</span>{" "}
            <span style={{ display: "inline-block" }}>จัดการทุกหน้า</span>{" "}
            <span style={{ display: "inline-block" }}><Accent>ในที่เดียว.</Accent></span>
          </h1>
          <Lead center max="640px">
            แพลตฟอร์มสร้างและจัดการหน้า Sales Page สำหรับธุรกิจออนไลน์ ปรับ Section โทนสี รีวิว และ Pixel
            ได้จากหลังบ้านเดียว ไม่ต้องเสียเวลาแก้ไขเว็บไซต์ทีละหน้า
          </Lead>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", margin: "14px 0 26px" }}>
            <Link href="/register"><Button variant="primary" size="lg" icon="⚡">เริ่มต้นใช้งานฟรี</Button></Link>
            <Link href="/login"><Button variant="outline" size="lg">เข้าสู่ระบบหลังบ้าน</Button></Link>
          </div>
          <div className="lp-chips">
            <span className="lp-chip"><b>◆</b> จัดเรียง Section</span>
            <span className="lp-chip"><b>◆</b> โทนสีเว็บไซต์</span>
            <span className="lp-chip"><b>◆</b> Tracking Pixel</span>
            <span className="lp-chip"><b>◆</b> รีวิวลูกค้า</span>
            <span className="lp-chip"><b>◆</b> สถิติผู้เข้าชม</span>
          </div>
        </div>

        {/* admin preview */}
        <div className="lp-shell" style={{ position: "relative", marginTop: "clamp(34px, 5vw, 56px)" }}>
          <div className="lp-window">
            <div className="lp-window-bar">
              <span className="lp-dot" /><span className="lp-dot" /><span className="lp-dot" />
              <span style={{ marginLeft: "10px", font: "500 12.5px/1 var(--font-sans-pv)", color: "var(--text-muted)" }}>
                PageVIP Pro — LINKMVP · ระบบจัดการหลังบ้าน
              </span>
            </div>
            <div className="lp-window-body">
              <nav className="lp-window-nav" aria-hidden="true">
                <span className="lp-nav-item" data-on="1">Dashboard</span>
                <span className="lp-nav-item">วันใช้งาน</span>
                <span className="lp-nav-item">จัดเรียง Section</span>
                <span className="lp-nav-item">โทนสีเว็บไซต์</span>
                <span className="lp-nav-item">ใส่ Pixel</span>
                <span className="lp-nav-item">ตั้งค่าหลัก</span>
              </nav>
              <div style={{ padding: "16px", display: "grid", gap: "9px" }} aria-hidden="true">
                <div className="lp-row">หัวเว็บไซต์<span className="lp-switch" data-on="1" /></div>
                <div className="lp-row">รูปภาพหลัก<span className="lp-switch" data-on="1" /></div>
                <div className="lp-row">ข้อความหน้าเว็บ<span className="lp-switch" data-on="1" /></div>
                <div className="lp-row">รีวิวลูกค้า<span className="lp-switch" data-on="1" /></div>
                <div className="lp-row">วิดีโอจาก YouTube<span className="lp-switch" /></div>
                <div className="lp-row">ปุ่มสมัคร / ทักไลน์<span className="lp-switch" data-on="1" /></div>
              </div>
            </div>
          </div>
        </div>
        <span aria-hidden="true" className="lp-glow" style={{ bottom: "-320px" }} />
      </section>

      {/* ── 2 · what it is ────────────────────────────────────── */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)", marginTop: "clamp(40px, 6vw, 70px)" }}>
        <div style={{ display: "grid", gap: "28px", gridTemplateColumns: "1fr", alignItems: "start" }}>
          <div style={{ maxWidth: "860px" }}>
            <Eyebrow>แนะนำระบบ</Eyebrow>
            <H2>ระบบสร้างเซลเพจ ที่ทำให้การขายออนไลน์ <Accent>จัดการง่ายขึ้น</Accent></H2>
            <Lead max="860px">
              การทำธุรกิจออนไลน์ในปัจจุบัน การมีหน้าเซลเพจที่นำเสนอสินค้าและบริการได้อย่างน่าสนใจเป็นสิ่งสำคัญ
              LINKMVP จึงถูกพัฒนาขึ้นเพื่อช่วยให้เจ้าของธุรกิจ นักการตลาด และผู้ขายสินค้าออนไลน์
              สามารถจัดการหน้าเซลเพจได้อย่างเป็นระบบ
            </Lead>
            <Lead max="860px">
              ไม่ว่าจะเป็นการแก้ไขข้อความ ปรับเปลี่ยนรูปภาพ จัดเรียงส่วนประกอบของหน้าเว็บไซต์ หรืออัปเดตข้อมูลต่าง ๆ
              ก็สามารถดำเนินการผ่านระบบหลังบ้านได้อย่างสะดวก ลดขั้นตอนการทำงาน
              และเพิ่มความคล่องตัวในการทำการตลาดออนไลน์
            </Lead>
          </div>
        </div>
      </Section>

      {/* ── 3 · features ──────────────────────────────────────── */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <Eyebrow>จุดเด่นของ LINKMVP</Eyebrow>
        <H2>ทุกเครื่องมือจัดการเซลเพจ <Accent>รวมไว้ในแพลตฟอร์มเดียว</Accent></H2>
        <Lead max="760px">
          เครื่องมือที่จำเป็นต่อการดูแลหน้าขายสินค้า ถูกรวมไว้ในหลังบ้านชุดเดียว เปิดใช้ส่วนไหนก็ได้ตามที่ธุรกิจของคุณต้องการ
        </Lead>
        <div className="lp-panel" style={{ marginTop: "26px" }}>
          <div className="lp-panel-head">ฟีเจอร์ที่พร้อมใช้งานในระบบหลังบ้าน</div>
          <div className="lp-cards lp-cards-3">
            {FEATURES.map((f) => (
              <article className="lp-card" key={f.title}>
                <span
                  aria-hidden="true"
                  style={{ display: "inline-grid", placeItems: "center", width: "42px", height: "42px", borderRadius: "12px", border: "1px solid var(--border-accent)", background: "var(--green-900)", fontSize: "19px", marginBottom: "14px" }}
                >
                  {f.icon}
                </span>
                <h3 style={{ margin: "0 0 9px", fontFamily: "var(--font-sans-pv)", fontSize: "18px", fontWeight: 700, lineHeight: 1.45, color: "var(--text-primary)" }}>{f.title}</h3>
                <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "14.5px", lineHeight: 1.75, color: "var(--text-muted)" }}>{f.body}</p>
                <ul className="lp-ticks">
                  {f.ticks.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 4 · capabilities band ─────────────────────────────── */}
      <section style={{ background: "var(--surface-accent-soft)", borderTop: "1px solid var(--border-hairline)", borderBottom: "1px solid var(--border-hairline)", padding: "clamp(50px, 7vw, 86px) 0" }}>
        <div className="lp-shell">
          <Eyebrow>ระบบทำอะไรได้บ้าง</Eyebrow>
          <H2>จัดการหน้าเซลเพจได้ครบ <Accent>จากศูนย์กลางเดียว</Accent></H2>
          <Lead max="820px">
            ไม่ต้องเสียเวลาจัดการเว็บไซต์หลายส่วนแยกจากกัน LINKMVP รวบรวมเครื่องมือสำคัญสำหรับการดูแลหน้าเซลเพจไว้ในระบบหลังบ้านเดียว
          </Lead>
          <div className="lp-cards" style={{ marginTop: "26px" }}>
            {CAPABILITIES.map((c) => (
              <div key={c.label} style={{ border: "1px solid var(--border-hairline)", borderRadius: "16px", background: "color-mix(in srgb, var(--surface-card) 70%, transparent)", padding: "22px 20px" }}>
                <div style={{ fontFamily: "var(--font-sans-pv)", fontSize: "34px", fontWeight: 700, lineHeight: 1.1, color: "var(--text-primary)" }}>{c.big}</div>
                <div style={{ margin: "4px 0 8px", fontFamily: "var(--font-sans-pv)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", color: "var(--text-accent)" }}>{c.label}</div>
                <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "14px", lineHeight: 1.7, color: "var(--text-muted)" }}>{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 · audience ──────────────────────────────────────── */}
      <Section>
        <Eyebrow>ประโยชน์สำหรับธุรกิจ</Eyebrow>
        <H2>เหมาะสำหรับใคร <Accent>ที่ต้องการทำเซลเพจอย่างมืออาชีพ</Accent></H2>
        <Lead max="760px">LINKMVP ออกแบบมาเพื่อรองรับการทำงานของธุรกิจออนไลน์หลากหลายรูปแบบ</Lead>
        <ul className="lp-cards lp-cards-3" style={{ listStyle: "none", margin: "26px 0 0", padding: 0 }}>
          {AUDIENCE.map((a) => (
            <li className="lp-card" key={a.who} style={{ padding: "20px" }}>
              <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--green-tint-3)", color: "var(--text-accent)", fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>✓</span>
              <strong style={{ display: "block", marginBottom: "5px", fontFamily: "var(--font-sans-pv)", fontSize: "16.5px", fontWeight: 700, color: "var(--text-primary)" }}>{a.who}</strong>
              <span style={{ fontFamily: "var(--font-sans-pv)", fontSize: "14.5px", lineHeight: 1.7, color: "var(--text-muted)" }}>{a.what}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 6 · why choose ────────────────────────────────────── */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <div className="lp-cards" style={{ gridTemplateColumns: undefined }}>
          <div className="lp-card" style={{ padding: "30px 28px", borderColor: "var(--border-accent)" }}>
            <Eyebrow>ระบบจัดการหลังบ้าน</Eyebrow>
            <H2>ปรับแต่งได้ทุกส่วน <Accent>โดยไม่ต้องแตะโค้ด</Accent></H2>
            <Lead>
              คุณสามารถจัดการองค์ประกอบของหน้าเว็บไซต์ ปรับแต่งรูปแบบการนำเสนอ อัปเดตเนื้อหา
              และดูแลข้อมูลที่เกี่ยวข้องกับการตลาดได้อย่างสะดวกจากหน้าเดียว
            </Lead>
            <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "15.5px", fontWeight: 600, lineHeight: 1.7, color: "var(--text-accent)" }}>
              จัดการง่ายขึ้น ทำงานเป็นระบบมากขึ้น ด้วย LINKMVP
            </p>
          </div>
          <div className="lp-card" style={{ padding: "30px 28px" }}>
            <Eyebrow>ทำไมต้องเลือก LINKMVP</Eyebrow>
            <H2>เปลี่ยนงานที่ยุ่งยาก <Accent>ให้เป็นเรื่องง่าย</Accent></H2>
            <Lead>
              การสร้างหน้าเว็บไซต์ขายสินค้าไม่จำเป็นต้องเริ่มจากการเขียนโค้ดหรือแก้ไขเว็บไซต์ด้วยขั้นตอนที่ซับซ้อนเสมอไป
            </Lead>
            <Lead>
              ไม่ว่าคุณจะดูแลหน้าเซลเพจเพียงหน้าเดียว หรือมีหลายหน้าที่ต้องอัปเดตเป็นประจำ
              การมีระบบจัดการส่วนกลางจะช่วยให้การทำงานสะดวกและเป็นระเบียบมากขึ้น
            </Lead>
          </div>
        </div>
      </Section>

      {/* ── 7 · steps ─────────────────────────────────────────── */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Eyebrow>เริ่มต้นอย่างไร</Eyebrow>
          <H2 center>3 ขั้นตอนง่าย ๆ <br /><Accent>เริ่มใช้งานได้เลย</Accent></H2>
          <Lead center max="620px">ไม่ต้องติดตั้งโปรแกรมเพิ่ม ใช้งานผ่านเบราว์เซอร์ได้ทันทีทั้งคอมและมือถือ</Lead>
        </div>
        <div className="lp-cards lp-cards-3" style={{ marginTop: "30px" }}>
          {STEPS.map((s) => (
            <article className="lp-card" key={s.no}>
              <span className="lp-step-no">{s.no}</span>
              <h3 style={{ margin: "10px 0 8px", fontFamily: "var(--font-sans-pv)", fontSize: "18px", fontWeight: 700, lineHeight: 1.45, color: "var(--text-primary)" }}>{s.title}</h3>
              <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "14.5px", lineHeight: 1.75, color: "var(--text-muted)" }}>{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ── 8 · FAQ ───────────────────────────────────────────── */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "30px" }}>
          <Eyebrow>FAQ</Eyebrow>
          <H2 center>คำถามที่พบบ่อย <br /><Accent>ตอบชัดเจนทุกประเด็น</Accent></H2>
        </div>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <HomeFaq />
        </div>
      </Section>

      {/* ── 9 · closing CTA ───────────────────────────────────── */}
      <Section>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            background: "var(--surface-accent-header)",
            border: "1px solid var(--border-accent)",
            borderRadius: "22px",
            padding: "clamp(42px, 6vw, 72px) 24px",
          }}
        >
          <span aria-hidden="true" className="lp-glow" style={{ bottom: "-340px" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Eyebrow>พร้อมเริ่มแล้วหรือยัง</Eyebrow>
            <H2 center>
              พร้อมยกระดับการจัดการเซลเพจ <br />
              <Accent>ให้จบในที่เดียวหรือยัง?</Accent>
            </H2>
            <Lead center max="640px">
              เริ่มต้นใช้งาน LINKMVP แพลตฟอร์มสร้างและจัดการหน้าเซลเพจ ที่ช่วยให้ธุรกิจออนไลน์ของคุณทำงานได้ง่ายขึ้น
              จัดการทุกอย่างจากหลังบ้านเดียว
            </Lead>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
              <Link href="/register"><Button variant="primary" size="lg" icon="⚡">เริ่มต้นใช้งานฟรี</Button></Link>
              <Link href="/login"><Button variant="white" size="lg">เข้าสู่ระบบ</Button></Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ── footer ────────────────────────────────────────────── */}
      <footer style={{ position: "relative", overflow: "hidden", borderTop: "1px solid var(--border-hairline)", background: "var(--surface-card)" }}>
        <span aria-hidden="true" className="lp-aurora-wrap">
          <span className="lp-aurora-haze" />
          <span className="lp-aurora-line" />
        </span>
        <div className="lp-shell" style={{ position: "relative", padding: "48px 20px 40px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px" }}>
            <span style={{ display: "block", marginBottom: "8px", fontFamily: "var(--font-sans-pv)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
              LINK<Accent>MVP</Accent>
            </span>
            <p style={{ margin: 0, maxWidth: "520px", fontFamily: "var(--font-sans-pv)", fontSize: "14px", lineHeight: 1.8, color: "var(--text-muted)" }}>
              ระบบสร้างและจัดการหน้าเซลเพจสำหรับธุรกิจออนไลน์ จัดการเนื้อหา Section โทนสี Pixel รีวิว และสถิติผู้เข้าชมได้จากระบบหลังบ้านเดียว
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", alignItems: "center", fontFamily: "var(--font-sans-pv)", fontSize: "14px", marginLeft: "auto" }}>
            <a href="https://linkmvp.shop/" target="_blank" rel="noopener noreferrer">linkmvp.shop</a>
            <Link href="/register" style={{ color: "var(--text-muted)" }}>เริ่มต้นใช้งาน</Link>
            <Link href="/login" style={{ color: "var(--text-muted)" }}>เข้าสู่ระบบ</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

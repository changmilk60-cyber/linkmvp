import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button, Pill } from "@/components/ds";
import HomeFaq from "./HomeFaq";

export const metadata: Metadata = {
  title: "LINKMVP – ระบบสร้างเซลเพจและจัดการหน้าเว็บไซต์ขายสินค้าออนไลน์",
  description:
    "แพลตฟอร์มสร้างและจัดการหน้า Sales Page สำหรับธุรกิจออนไลน์ จัดการ Section โทนสี Pixel รีวิว และสถิติผู้เข้าชมได้จากระบบหลังบ้านเดียว",
};

const FEATURES = [
  { title: "จัดการหลาย Section ได้ง่าย", body: "ปรับแต่งส่วนประกอบของหน้าเซลเพจได้อย่างเป็นระบบ ไม่ว่าจะเป็นส่วนแนะนำสินค้า รายละเอียดสินค้า รูปภาพ หรือเนื้อหาประกอบการขาย" },
  { title: "ปรับแต่งโทนสีเว็บไซต์", body: "ปรับเปลี่ยนสีและรูปแบบการนำเสนอให้เหมาะกับแบรนด์หรือสินค้า เพื่อสร้างเอกลักษณ์ให้กับหน้าเซลเพจของคุณ" },
  { title: "จัดการเนื้อหาจากหลังบ้านเดียว", body: "แก้ไขข้อมูลและอัปเดตเนื้อหาหน้าเซลเพจผ่านระบบจัดการส่วนกลาง ช่วยลดความยุ่งยากในการดูแลเว็บไซต์" },
  { title: "รองรับการติดตั้ง Tracking Pixel", body: "จัดการการตั้งค่า Pixel สำหรับการติดตามผลทางการตลาด เช่น Facebook Pixel และ TikTok Pixel ตามการรองรับของระบบ เพื่อช่วยให้คุณนำข้อมูลไปวิเคราะห์และปรับปรุงแคมเปญโฆษณา" },
  { title: "จัดการรีวิวลูกค้า", body: "จัดการส่วนแสดงรีวิวและความคิดเห็นจากลูกค้า เพื่อช่วยนำเสนอข้อมูลประกอบการตัดสินใจซื้อสินค้า" },
  { title: "ดูสถิติผู้เข้าชมเว็บไซต์", body: "ตรวจสอบสถิติผู้เข้าชมหน้าเซลเพจ เพื่อทำความเข้าใจการเข้าถึงเว็บไซต์และนำข้อมูลไปใช้ปรับปรุงการทำการตลาด" },
];

const AUDIENCE = [
  { who: "เจ้าของร้านค้าออนไลน์", what: "จัดการหน้าเสนอขายสินค้าและอัปเดตข้อมูลได้สะดวก" },
  { who: "นักการตลาดออนไลน์", what: "บริหารหน้าเซลเพจสำหรับแคมเปญโฆษณา" },
  { who: "เอเจนซี่การตลาด", what: "จัดการงานหน้าเซลเพจให้กับธุรกิจและลูกค้า" },
  { who: "ผู้ขายสินค้าออนไลน์", what: "นำเสนอรายละเอียดสินค้าและรีวิวผ่านหน้าเว็บไซต์" },
  { who: "ผู้ประกอบการ", what: "เพิ่มช่องทางนำเสนอสินค้าและบริการบนโลกออนไลน์" },
];

function Section({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ width: "100%", padding: "clamp(56px, 8vw, 96px) 20px", ...style }}>
      <div style={{ maxWidth: "1060px", margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: "0 0 12px", fontFamily: "var(--font-sans-pv)", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-accent)" }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ margin: "0 0 18px", fontFamily: "var(--font-sans-pv)", fontSize: "clamp(24px, 3.4vw, 34px)", fontWeight: 700, lineHeight: 1.35, color: "var(--text-primary)" }}>
      {children}
    </h2>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: "0 0 14px", fontFamily: "var(--font-sans-pv)", fontSize: "16px", lineHeight: 1.85, color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      {/* top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "color-mix(in srgb, var(--surface-page) 88%, transparent)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border-hairline)",
        }}
      >
        <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-sans-pv)", fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: ".02em" }}>
            LINK<span style={{ color: "var(--text-accent)" }}>MVP</span>
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login"><Button variant="ghost" size="sm">เข้าสู่ระบบ</Button></Link>
            <Link href="/register"><Button variant="primary" size="sm">เริ่มต้นใช้งาน</Button></Link>
          </div>
        </div>
      </header>

      {/* 1 — hero */}
      <Section style={{ position: "relative", overflow: "hidden", paddingTop: "clamp(48px, 7vw, 80px)" }}>
        <span
          aria-hidden="true"
          style={{ position: "absolute", top: "-220px", left: "50%", transform: "translateX(-50%)", width: "min(900px, 120vw)", height: "460px", background: "radial-gradient(ellipse at center, var(--green-tint-3) 0%, transparent 70%)", pointerEvents: "none" }}
        />
        <div style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Pill tone="soft" icon="⚡">Sales Page Management Platform</Pill>
          <h1 style={{ margin: "18px 0 0", maxWidth: "780px", fontFamily: "var(--font-sans-pv)", fontSize: "clamp(30px, 5.2vw, 50px)", fontWeight: 700, lineHeight: 1.35, color: "var(--text-primary)", textWrap: "balance" }}>
            <span style={{ display: "inline-block" }}>สร้างเซลเพจง่าย ๆ</span>{" "}
            <span style={{ display: "inline-block" }}>จัดการทุกหน้าได้ในที่เดียว</span>{" "}
            <span style={{ display: "inline-block" }}>ด้วย <span style={{ color: "var(--text-accent)" }}>LINKMVP</span></span>
          </h1>
          <p style={{ margin: "20px 0 0", maxWidth: "720px", fontFamily: "var(--font-sans-pv)", fontSize: "16px", lineHeight: 1.85, color: "var(--text-muted)" }}>
            แพลตฟอร์มสร้างและจัดการหน้า Sales Page สำหรับธุรกิจออนไลน์ ช่วยให้คุณสร้าง ปรับแต่ง และอัปเดตหน้าเซลเพจได้อย่างสะดวกผ่านระบบหลังบ้านเดียว ไม่ต้องเสียเวลาแก้ไขเว็บไซต์ทีละหน้า
          </p>
          <p style={{ margin: "10px 0 0", maxWidth: "720px", fontFamily: "var(--font-sans-pv)", fontSize: "16px", lineHeight: 1.85, color: "var(--text-muted)" }}>
            จัดการเนื้อหา Section ปรับโทนสี เพิ่มรีวิวลูกค้า ตั้งค่า Pixel และติดตามสถิติผู้เข้าชมได้ครบในระบบเดียว
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "30px" }}>
            <Link href="/register"><Button variant="primary" size="lg">เริ่มต้นใช้งาน</Button></Link>
            <Link href="/login"><Button variant="outline" size="lg">ดูตัวอย่างระบบ</Button></Link>
          </div>
        </div>
      </Section>

      {/* 2 — what it is */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <div style={{ maxWidth: "820px" }}>
          <Eyebrow>แนะนำระบบ</Eyebrow>
          <H2>ระบบสร้างเซลเพจที่ช่วยให้การขายออนไลน์จัดการง่ายขึ้น</H2>
          <Lead>
            การทำธุรกิจออนไลน์ในปัจจุบัน การมีหน้าเซลเพจที่นำเสนอสินค้าและบริการได้อย่างน่าสนใจเป็นสิ่งสำคัญ LINKMVP จึงถูกพัฒนาขึ้นเพื่อช่วยให้เจ้าของธุรกิจ นักการตลาด และผู้ขายสินค้าออนไลน์ สามารถจัดการหน้าเซลเพจได้อย่างเป็นระบบ
          </Lead>
          <Lead>
            ไม่ว่าจะเป็นการแก้ไขข้อความ ปรับเปลี่ยนรูปภาพ จัดเรียงส่วนประกอบของหน้าเว็บไซต์ หรืออัปเดตข้อมูลต่าง ๆ ก็สามารถดำเนินการผ่านระบบหลังบ้านได้อย่างสะดวก
          </Lead>
          <Lead>
            LINKMVP ช่วยให้คุณบริหารจัดการหน้าเซลเพจได้จากจุดเดียว ลดขั้นตอนการทำงาน และเพิ่มความคล่องตัวในการทำการตลาดออนไลน์
          </Lead>
        </div>
      </Section>

      {/* 3 — features */}
      <Section style={{ background: "var(--surface-accent-soft)", borderTop: "1px solid var(--border-hairline)", borderBottom: "1px solid var(--border-hairline)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Eyebrow>จุดเด่นของ LINKMVP</Eyebrow>
          <H2>ทุกเครื่องมือจัดการเซลเพจ รวมไว้ในแพลตฟอร์มเดียว</H2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "18px" }}>
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "26px 24px" }}
            >
              <span
                aria-hidden="true"
                style={{ display: "inline-grid", placeItems: "center", width: "40px", height: "40px", borderRadius: "var(--radius-badge)", background: "var(--surface-primary)", color: "var(--text-on-primary)", fontFamily: "var(--font-sans-pv)", fontSize: "17px", fontWeight: 700, marginBottom: "16px" }}
              >
                {i + 1}
              </span>
              <h3 style={{ margin: "0 0 10px", fontFamily: "var(--font-sans-pv)", fontSize: "18px", fontWeight: 700, lineHeight: 1.45, color: "var(--text-primary)" }}>{f.title}</h3>
              <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "15px", lineHeight: 1.75, color: "var(--text-muted)" }}>{f.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* 4 — who it is for */}
      <Section>
        <div style={{ maxWidth: "820px", marginBottom: "32px" }}>
          <Eyebrow>ประโยชน์สำหรับธุรกิจ</Eyebrow>
          <H2>เหมาะสำหรับใครที่ต้องการทำหน้าเซลเพจอย่างมืออาชีพ</H2>
          <Lead>LINKMVP ออกแบบมาเพื่อรองรับการทำงานของธุรกิจออนไลน์หลากหลายรูปแบบ</Lead>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
          {AUDIENCE.map((a) => (
            <li
              key={a.who}
              style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "18px 20px" }}
            >
              <span aria-hidden="true" style={{ flexShrink: 0, marginTop: "3px", width: "22px", height: "22px", display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--green-tint-3)", color: "var(--text-accent)", fontSize: "13px", fontWeight: 700 }}>✓</span>
              <span>
                <strong style={{ display: "block", fontFamily: "var(--font-sans-pv)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{a.who}</strong>
                <span style={{ fontFamily: "var(--font-sans-pv)", fontSize: "14.5px", lineHeight: 1.7, color: "var(--text-muted)" }}>{a.what}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 5 + 6 — backend, why choose */}
      <Section style={{ background: "var(--surface-accent-soft)", borderTop: "1px solid var(--border-hairline)", borderBottom: "1px solid var(--border-hairline)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "28px" }}>
          <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-card)", padding: "30px 28px" }}>
            <Eyebrow>ระบบจัดการหลังบ้าน</Eyebrow>
            <H2>จัดการหน้าเซลเพจได้จากศูนย์กลางเดียว</H2>
            <Lead>ไม่ต้องเสียเวลาจัดการเว็บไซต์หลายส่วนแยกจากกัน LINKMVP ช่วยรวบรวมเครื่องมือสำคัญสำหรับการดูแลหน้าเซลเพจไว้ในระบบหลังบ้านเดียว</Lead>
            <Lead>คุณสามารถจัดการองค์ประกอบของหน้าเว็บไซต์ ปรับแต่งรูปแบบการนำเสนอ อัปเดตเนื้อหา และดูแลข้อมูลที่เกี่ยวข้องกับการตลาดได้อย่างสะดวก</Lead>
            <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "16px", fontWeight: 600, lineHeight: 1.7, color: "var(--text-accent)" }}>
              จัดการง่ายขึ้น ทำงานเป็นระบบมากขึ้น ด้วย LINKMVP
            </p>
          </div>
          <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "30px 28px" }}>
            <Eyebrow>ทำไมต้องเลือก LINKMVP</Eyebrow>
            <H2>เปลี่ยนการจัดการเซลเพจที่ยุ่งยาก ให้เป็นเรื่องง่าย</H2>
            <Lead>การสร้างหน้าเว็บไซต์ขายสินค้าไม่จำเป็นต้องเริ่มต้นจากการเขียนโค้ดหรือแก้ไขเว็บไซต์ด้วยขั้นตอนที่ซับซ้อนเสมอไป</Lead>
            <Lead>LINKMVP ช่วยให้คุณจัดการส่วนต่าง ๆ ของหน้าเซลเพจผ่านระบบหลังบ้านที่ออกแบบมาเพื่อการบริหารจัดการโดยเฉพาะ</Lead>
            <Lead>ไม่ว่าคุณจะดูแลหน้าเซลเพจเพียงหน้าเดียว หรือมีหลายหน้าที่ต้องอัปเดตอยู่เป็นประจำ การมีระบบจัดการส่วนกลางจะช่วยให้การทำงานสะดวกและเป็นระเบียบมากยิ่งขึ้น</Lead>
          </div>
        </div>
      </Section>

      {/* 7 — CTA */}
      <Section>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            background: "var(--surface-accent-header)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-card)",
            padding: "clamp(40px, 6vw, 64px) 24px",
          }}
        >
          <H2>พร้อมยกระดับการจัดการเซลเพจของคุณแล้วหรือยัง?</H2>
          <p style={{ margin: "0 auto 8px", maxWidth: "680px", fontFamily: "var(--font-sans-pv)", fontSize: "16px", lineHeight: 1.85, color: "var(--text-body)" }}>
            เริ่มต้นใช้งาน LINKMVP แพลตฟอร์มสร้างและจัดการหน้าเซลเพจที่ช่วยให้ธุรกิจออนไลน์ของคุณทำงานได้ง่ายขึ้น
          </p>
          <p style={{ margin: "0 auto 26px", maxWidth: "680px", fontFamily: "var(--font-sans-pv)", fontSize: "16px", lineHeight: 1.85, color: "var(--text-body)" }}>
            จัดการทุกอย่างจากหลังบ้านเดียว พร้อมปรับแต่งหน้าเว็บไซต์ให้เหมาะกับธุรกิจของคุณ
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            <Link href="/register"><Button variant="primary" size="lg">เริ่มต้นใช้งาน</Button></Link>
            <Link href="/login"><Button variant="white" size="lg">เข้าสู่ระบบ</Button></Link>
          </div>
        </div>
      </Section>

      {/* 8 — FAQ */}
      <Section style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Eyebrow>คำถามที่พบบ่อย</Eyebrow>
          <H2>FAQ</H2>
        </div>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <HomeFaq />
        </div>
      </Section>

      {/* footer */}
      <footer style={{ borderTop: "1px solid var(--border-hairline)", background: "var(--surface-card)" }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "44px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <span style={{ fontFamily: "var(--font-sans-pv)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
            LINK<span style={{ color: "var(--text-accent)" }}>MVP</span> <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>– Sales Page Management Platform</span>
          </span>
          <p style={{ margin: 0, maxWidth: "760px", fontFamily: "var(--font-sans-pv)", fontSize: "14.5px", lineHeight: 1.8, color: "var(--text-muted)" }}>
            ระบบสร้างและจัดการหน้าเซลเพจสำหรับธุรกิจออนไลน์ ช่วยให้การบริหารหน้าเว็บไซต์ขายสินค้าเป็นเรื่องง่าย จัดการเนื้อหา Section โทนสี Pixel รีวิว และสถิติผู้เข้าชมได้จากระบบหลังบ้านเดียว
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", fontFamily: "var(--font-sans-pv)", fontSize: "14.5px" }}>
            <a href="https://linkmvp.shop/" target="_blank" rel="noopener noreferrer">https://linkmvp.shop/</a>
            <Link href="/register" style={{ color: "var(--text-muted)" }}>เริ่มต้นใช้งาน</Link>
            <Link href="/login" style={{ color: "var(--text-muted)" }}>เข้าสู่ระบบ</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

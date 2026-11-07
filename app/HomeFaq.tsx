"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "LINKMVP คืออะไร?",
    a: "LINKMVP คือระบบสำหรับสร้างและจัดการหน้าเซลเพจ (Sales Page) ที่ช่วยให้ผู้ใช้งานสามารถปรับแต่งและบริหารจัดการเนื้อหาบนหน้าเว็บไซต์ผ่านระบบหลังบ้านเดียว",
  },
  {
    q: "ระบบเซลเพจคืออะไร?",
    a: "เซลเพจ (Sales Page) คือหน้าเว็บไซต์ที่ออกแบบมาเพื่อใช้ในการนำเสนอสินค้าและบริการ โดยมีเนื้อหา รูปภาพ รายละเอียด และข้อมูลประกอบการตัดสินใจ เพื่อสนับสนุนการขายสินค้าออนไลน์",
  },
  {
    q: "LINKMVP เหมาะกับใครบ้าง?",
    a: "เหมาะสำหรับเจ้าของธุรกิจออนไลน์ ร้านค้าออนไลน์ นักการตลาด ผู้ขายสินค้า และเอเจนซี่ที่ต้องการเครื่องมือสำหรับสร้างและจัดการหน้าเซลเพจ",
  },
  {
    q: "สามารถแก้ไขหน้าเซลเพจได้หรือไม่?",
    a: "ได้ ผู้ใช้งานสามารถจัดการ Section ปรับแต่งโทนสี และแก้ไของค์ประกอบต่าง ๆ ผ่านระบบหลังบ้านของ LINKMVP",
  },
  {
    q: "LINKMVP รองรับการติดตั้ง Pixel หรือไม่?",
    a: "ระบบมีฟังก์ชันจัดการ Pixel เพื่อรองรับการติดตั้งเครื่องมือติดตามผลทางการตลาด ช่วยให้ผู้ใช้งานสามารถนำข้อมูลไปวิเคราะห์แคมเปญโฆษณาได้",
  },
  {
    q: "ทำไมธุรกิจออนไลน์ควรมีระบบจัดการเซลเพจ?",
    a: "เพราะช่วยให้การดูแลหน้าเว็บไซต์ขายสินค้ามีความเป็นระบบ ลดขั้นตอนในการอัปเดตข้อมูล และช่วยให้สามารถปรับปรุงเนื้อหาให้เหมาะสมกับการทำการตลาดได้อย่างต่อเนื่อง",
  },
];

export default function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={it.q}
            style={{
              background: "var(--surface-card)",
              border: "1px solid " + (isOpen ? "var(--border-accent)" : "var(--border-hairline)"),
              borderRadius: "14px",
              overflow: "hidden",
              transition: "var(--transition-control)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                background: "transparent",
                border: 0,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--font-sans-pv)",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 1.5,
                color: "var(--text-primary)",
              }}
            >
              <span aria-hidden="true" style={{ flexShrink: 0, width: "7px", height: "7px", borderRadius: "50%", background: "var(--text-accent)" }} />
              <span style={{ flex: 1 }}>{it.q}</span>
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: "28px",
                  height: "28px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: isOpen ? "var(--surface-primary)" : "var(--surface-raised)",
                  color: isOpen ? "var(--text-on-primary)" : "var(--text-accent)",
                  fontSize: "17px",
                  lineHeight: 1,
                  transition: "var(--transition-control)",
                }}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? (
              <p
                style={{
                  margin: 0,
                  padding: "0 20px 18px 41px",
                  fontFamily: "var(--font-sans-pv)",
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: "var(--text-muted)",
                }}
              >
                {it.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

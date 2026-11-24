"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENT_STORAGE_KEY, POLICY_VERSION, needsConsent } from "@/lib/policy";

/**
 * Privacy notice for linkmvp.shop's own pages, shown once per policy version.
 *
 * A bar along the bottom of the screen, not a modal: it never blocks the page,
 * takes no focus and does not lock scrolling, so the site works exactly the
 * same whether or not it is acknowledged. That fits what it is for here —
 * these pages set no optional cookies and run no tracking, so there is nothing
 * for a visitor to switch off, and a box that held the page hostage until it
 * was pressed would only be in the way.
 *
 * Deliberately NOT mounted in the root layout: that layout also wraps every
 * customer's sales page. It is added page by page to the marketing and
 * sign-in pages only.
 *
 * Starts hidden and decides after mount. Rendering it on the server would
 * flash the bar at people who already accepted, and the server cannot know.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch {
      // Storage blocked (private mode, strict settings): the choice cannot be
      // remembered, so it is shown once per page view instead of failing.
    }
    if (needsConsent(stored)) setOpen(true);
  }, []);

  // A fixed bar sits on top of the bottom of the page. Reserve that much room
  // under the content while it is open, otherwise the last links on a short
  // screen could never be scrolled clear of it.
  useEffect(() => {
    if (!open || !bar.current) return;
    const el = bar.current;
    const prev = document.body.style.paddingBottom;
    const reserve = () => {
      document.body.style.paddingBottom = `${el.offsetHeight + 24}px`;
    };
    reserve();
    const ro = new ResizeObserver(reserve);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.style.paddingBottom = prev;
    };
  }, [open]);

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, POLICY_VERSION);
    } catch {
      /* see above — the bar still closes for this page view */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      ref={bar}
      role="region"
      aria-label="การแจ้งเรื่องคุกกี้และนโยบายความเป็นส่วนตัว"
      className="pv-consent-bar"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "16px",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "min(760px, calc(100% - 24px))",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "12px 20px",
        padding: "16px 20px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-accent)",
        borderRadius: "var(--radius-card)",
        boxShadow: "0 12px 40px rgba(0,0,0,.55)",
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
          เว็บไซต์นี้ใช้คุกกี้
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: "var(--font-sans-pv)", fontSize: "13.5px", lineHeight: 1.7, color: "var(--text-muted)" }}>
          เราใช้เฉพาะคุกกี้ที่จำเป็นต่อการเข้าสู่ระบบ และเก็บข้อมูลบัญชีตามที่ระบุใน
          <a href="/privacy" target="_blank" rel="noopener" style={{ color: "var(--text-accent)", textDecoration: "underline", margin: "0 4px" }}>
            นโยบายความเป็นส่วนตัว
          </a>
          ท่านใช้งานเว็บไซต์ต่อได้ตามปกติโดยไม่ต้องกดยอมรับ
        </p>
      </div>
      <button
        type="button"
        onClick={accept}
        style={{
          flex: "0 0 auto",
          padding: "11px 26px",
          border: 0,
          borderRadius: "var(--radius-button)",
          background: "var(--surface-primary)",
          color: "var(--text-on-primary)",
          fontFamily: "var(--font-sans-pv)",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ยอมรับ
      </button>
    </div>
  );
}

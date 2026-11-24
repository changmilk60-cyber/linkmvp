"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENT_STORAGE_KEY, POLICY_VERSION, needsConsent } from "@/lib/policy";

/**
 * First-visit privacy notice for linkmvp.shop's own pages.
 *
 * Deliberately NOT mounted in the root layout: that layout also wraps every
 * customer's sales page, and a box covering the page before the visitor can
 * reach the sign-up button would cost the customer conversions. It is added
 * page by page to the marketing and sign-in pages only.
 *
 * Starts hidden and decides after mount. Rendering it on the server would
 * flash the box at people who already accepted, and the server cannot know.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch {
      // Storage blocked (private mode, strict settings): the choice cannot be
      // remembered, so it is asked once per page view instead of failing.
    }
    if (needsConsent(stored)) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    button.current?.focus();
    // Keep the page behind the box from scrolling while it is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, POLICY_VERSION);
    } catch {
      /* see above — the box still closes for this page view */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="pv-consent-backdrop"
      // minmax(0,1fr): a plain grid column grows to fit its content, so the
      // 460px card pushed past a narrower screen instead of shrinking to it.
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", placeItems: "center", padding: "20px", background: "rgba(0,0,0,.72)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pv-consent-title"
        aria-describedby="pv-consent-body"
        className="pv-consent-card"
        onKeyDown={(e) => {
          // Only one thing can be focused in here; stop Tab from leaving the box.
          if (e.key === "Tab") {
            e.preventDefault();
            button.current?.focus();
          }
        }}
        style={{ width: "100%", maxWidth: "460px", maxHeight: "100%", overflow: "auto", background: "var(--surface-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-card)", boxShadow: "0 24px 70px rgba(0,0,0,.6)" }}
      >
        <div style={{ background: "var(--surface-accent-header)", borderBottom: "2px solid var(--green-500)", padding: "20px 22px", textAlign: "center" }}>
          <div aria-hidden="true" style={{ fontSize: "28px", lineHeight: 1 }}>🛡</div>
          <h2 id="pv-consent-title" style={{ margin: "8px 0 0", fontFamily: "var(--font-sans-pv)", fontSize: "20px", fontWeight: 700, lineHeight: 1.3, color: "var(--text-primary)" }}>
            นโยบายความเป็นส่วนตัว
          </h2>
        </div>
        <div style={{ padding: "20px 22px 22px" }}>
          <p id="pv-consent-body" style={{ margin: 0, fontFamily: "var(--font-sans-pv)", fontSize: "15px", lineHeight: 1.8, color: "var(--text-body)" }}>
            เว็บไซต์นี้เก็บข้อมูลบัญชีของคุณและใช้คุกกี้ที่จำเป็นต่อการเข้าสู่ระบบ ตามที่อธิบายไว้ใน
            <a href="/privacy" target="_blank" rel="noopener" style={{ color: "var(--text-accent)", textDecoration: "underline", margin: "0 4px" }}>
              นโยบายความเป็นส่วนตัว
            </a>
            กรุณาอ่านและกดยอมรับเพื่อใช้งานต่อ
          </p>
          <button
            ref={button}
            type="button"
            onClick={accept}
            style={{ marginTop: "18px", width: "100%", padding: "13px 16px", border: 0, borderRadius: "var(--radius-button)", background: "var(--surface-primary)", color: "var(--text-on-primary)", fontFamily: "var(--font-sans-pv)", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-glow, 0 8px 22px rgba(0,204,102,.28))" }}
          >
            ยอมรับ
          </button>
        </div>
      </div>
    </div>
  );
}

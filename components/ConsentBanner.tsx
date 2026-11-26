"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CONSENT_STORAGE_KEY, POLICY_VERSION, needsConsent } from "@/lib/policy";

/** Colours for the bar. The default is LINKMVP's own green-on-black; a
 *  customer's sales page passes its theme so the bar looks like part of it. */
export type ConsentLook = {
  background: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  buttonBg: string;
  buttonText: string;
};

const SITE_LOOK: ConsentLook = {
  background: "var(--surface-card)",
  border: "var(--border-accent)",
  text: "var(--text-primary)",
  muted: "var(--text-muted)",
  accent: "var(--text-accent)",
  buttonBg: "var(--surface-primary)",
  buttonText: "var(--text-on-primary)",
};

const SITE_MESSAGE = (
  <>
    เราใช้เฉพาะคุกกี้ที่จำเป็นต่อการเข้าสู่ระบบ และเก็บข้อมูลบัญชีตามที่ระบุใน
    <PolicyLink color="var(--text-accent)" />
    ท่านใช้งานเว็บไซต์ต่อได้ตามปกติโดยไม่ต้องกดยอมรับ
  </>
);

/** Opens in a new tab so a visitor who is mid-form or mid-page keeps their place. */
export function PolicyLink({ color }: { color: string }) {
  return (
    <a href="/privacy" target="_blank" rel="noopener" style={{ color, textDecoration: "underline", margin: "0 4px" }}>
      นโยบายความเป็นส่วนตัว
    </a>
  );
}

/**
 * Privacy notice bar, shown once per policy version.
 *
 * A bar along the bottom of the screen, not a modal: it never blocks the page,
 * takes no focus and does not lock scrolling.
 *
 * Used in two places:
 *  - linkmvp.shop's own home page (the default look and wording);
 *  - a customer's sales page, with that page's theme colours, compact sizing
 *    for phones, and wording that matches what that page really does.
 * It is deliberately NOT mounted in the root layout: that layout wraps every
 * customer page, and whether a customer's page shows it is the owner's choice.
 *
 * Pressing the button records that the visitor has seen the policy. It does
 * not switch anything off: the pages' counting and any Meta Pixel run whether
 * or not it is pressed, and the wording says so rather than implying control.
 *
 * Starts hidden and decides after mount. Rendering it on the server would
 * flash the bar at people who already accepted, and the server cannot know.
 */
export default function ConsentBanner({
  title,
  message,
  look = SITE_LOOK,
  compact = false,
  reserve = "body",
  label = "ยอมรับ",
}: {
  title?: string;
  message?: ReactNode;
  look?: ConsentLook;
  compact?: boolean;
  /** "body": pad the whole document (fine on LINKMVP's own pages).
   *  "inline": render an in-flow spacer where this component sits, so the page's
   *  own background shows under it instead of the document's. */
  reserve?: "body" | "inline";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [spacer, setSpacer] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const heading = title ?? (message ? undefined : "เว็บไซต์นี้ใช้คุกกี้");

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
  // under the content while it is open, otherwise the last lines on a short
  // screen could never be scrolled clear of it.
  useEffect(() => {
    if (!open || !bar.current) return;
    const el = bar.current;
    const prev = document.body.style.paddingBottom;
    const reserveRoom = () => {
      const room = el.offsetHeight + 24;
      if (reserve === "inline") setSpacer(room);
      else document.body.style.paddingBottom = `${room}px`;
    };
    reserveRoom();
    const ro = new ResizeObserver(reserveRoom);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (reserve === "body") document.body.style.paddingBottom = prev;
    };
  }, [open, reserve]);

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, POLICY_VERSION);
    } catch {
      /* see above — the bar still closes for this page view */
    }
    setOpen(false);
    setSpacer(0);
  }

  if (!open) return null;

  return (
    <>
      <div
        ref={bar}
        role="region"
        aria-label="การแจ้งเรื่องคุกกี้และนโยบายความเป็นส่วนตัว"
        className="pv-consent-bar"
        style={{
          position: "fixed",
          left: "50%",
          bottom: compact ? "10px" : "16px",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: compact ? "min(480px, calc(100% - 16px))" : "min(760px, calc(100% - 24px))",
          display: "flex",
          flexWrap: compact ? "nowrap" : "wrap",
          alignItems: "center",
          gap: compact ? "10px" : "12px 20px",
          padding: compact ? "10px 12px" : "16px 20px",
          background: look.background,
          border: `1px solid ${look.border}`,
          borderRadius: compact ? "14px" : "var(--radius-card)",
          boxShadow: "0 12px 40px rgba(0,0,0,.55)",
          fontFamily: "var(--font-sans-pv)",
        }}
      >
        <div style={{ flex: compact ? "1 1 auto" : "1 1 320px", minWidth: 0 }}>
          {heading ? (
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: look.text }}>{heading}</p>
          ) : null}
          <p style={{ margin: heading ? "4px 0 0" : 0, fontSize: compact ? "12px" : "13.5px", lineHeight: compact ? 1.55 : 1.7, color: look.muted }}>
            {message ?? SITE_MESSAGE}
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          style={{
            flex: "0 0 auto",
            padding: compact ? "9px 16px" : "11px 26px",
            border: 0,
            borderRadius: compact ? "10px" : "var(--radius-button)",
            background: look.buttonBg,
            color: look.buttonText,
            fontFamily: "var(--font-sans-pv)",
            fontSize: compact ? "14px" : "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      </div>
      {reserve === "inline" && spacer > 0 ? <div aria-hidden="true" style={{ height: spacer }} /> : null}
    </>
  );
}

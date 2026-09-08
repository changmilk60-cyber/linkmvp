"use client";

import { useEffect, type ReactNode } from "react";

// The Meta pixel's base code defines window.fbq; it is absent when the page
// has no pixel configured, or when a blocker stops fbevents.js loading.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function track(slug: string, kind: "view" | "click_signup" | "click_line", fbEvent?: string) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, kind }),
    keepalive: true,
  }).catch(() => {});

  // Reported to Facebook as well as to our own stats, so an ad set optimising
  // for this conversion actually receives it.
  if (fbEvent && typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", fbEvent);
  }
}

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track(slug, "view");
    // fire once per mount — a real page load, not a React strict-mode remount concern in production
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function TrackedLink({
  slug,
  kind,
  fbEvent,
  href,
  className,
  style,
  children,
}: {
  slug: string;
  kind: "click_signup" | "click_line";
  /** Standard Meta event name to fire on click, e.g. "Subscribe" or "Contact". */
  fbEvent?: string;
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={() => track(slug, kind, fbEvent)}
    >
      {children}
    </a>
  );
}

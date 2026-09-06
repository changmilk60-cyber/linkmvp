"use client";

import { useEffect, type ReactNode } from "react";

function track(slug: string, kind: "view" | "click_signup" | "click_line") {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, kind }),
    keepalive: true,
  }).catch(() => {});
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
  href,
  className,
  style,
  children,
}: {
  slug: string;
  kind: "click_signup" | "click_line";
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
      onClick={() => track(slug, kind)}
    >
      {children}
    </a>
  );
}

"use client";

import { useEffect, useRef } from "react";

// Custom HTML injected via innerHTML never runs <script> tags (browser
// behavior), so this re-creates each script node to make embeds/snippets
// actually execute — same trick used by most "custom code" website builders.
export default function CustomCodeBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    el.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      for (const attr of Array.from(oldScript.attributes)) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.text = oldScript.textContent || "";
      oldScript.replaceWith(newScript);
    });
  }, [html]);

  return <div ref={ref} />;
}

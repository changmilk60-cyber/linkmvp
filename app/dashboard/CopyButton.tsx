"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 rounded-md bg-mint/5 px-2 py-0.5 text-xs text-mint/60 hover:bg-mint/10"
    >
      {copied ? "คัดลอกแล้ว" : "คัดลอก"}
    </button>
  );
}

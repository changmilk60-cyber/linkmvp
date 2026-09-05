"use client";

import { useState } from "react";

const PRESETS = [
  "#22c55e",
  "#3d5afe",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#0f172a",
  "#f43f5e",
];

export default function ColorSwatches({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setValue(c)}
          aria-label={c}
          className="h-7 w-7 shrink-0 rounded-full transition"
          style={{
            background: c,
            boxShadow: value.toLowerCase() === c ? `0 0 0 2px #0a0f0d, 0 0 0 4px ${c}` : undefined,
          }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
        aria-label="กำหนดสีเอง"
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

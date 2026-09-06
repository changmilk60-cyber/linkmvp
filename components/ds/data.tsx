"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export function StatCard({ label, value, note, noteTone = "accent", style }: { label: string; value: ReactNode; note?: string; noteTone?: "accent" | "muted"; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", ...style }}>
      <span aria-hidden="true" style={{ position: "absolute", top: "-26px", right: "-26px", width: "72px", height: "72px", borderRadius: "50%", background: "var(--green-tint-3)" }} />
      <p style={{ margin: 0, font: "var(--fw-medium) var(--fs-label)/1.3 var(--font-sans)", color: "var(--text-muted)", position: "relative" }}>{label}</p>
      <p style={{ margin: "8px 0 6px", font: "var(--text-stat)", color: "var(--text-primary)", position: "relative" }}>{value}</p>
      {note ? <p style={{ margin: 0, font: "var(--fw-semibold) var(--fs-hint)/1.35 var(--font-sans)", color: noteTone === "accent" ? "var(--text-accent)" : "var(--text-muted)", position: "relative" }}>{note}</p> : null}
    </div>
  );
}

export function BarChart({ title, data, height = 240, style }: { title?: string; data: { label: string; value: number }[]; height?: number; style?: CSSProperties }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", ...style }}>
      {title ? <h3 style={{ margin: "0 0 16px", font: "var(--fw-semibold) var(--fs-section-title)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{title}</h3> : null}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: height + "px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px", height: "100%" }}>
            <span style={{ font: "var(--fw-bold) var(--fs-micro)/1 var(--font-sans)", color: "var(--text-primary)" }}>{d.value}</span>
            <span style={{ width: "100%", maxWidth: "38px", height: Math.max(2, (d.value / max) * (height - 46)) + "px", borderRadius: "6px 6px 0 0", background: "var(--surface-primary)" }} />
            <span style={{ font: "var(--fw-medium) var(--fs-micro)/1 var(--font-sans)", color: "var(--text-muted)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTable({ title, columns, rows, style }: { title?: string; columns: string[]; rows: (string | number)[][]; style?: CSSProperties }) {
  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", ...style }}>
      {title ? <h3 style={{ margin: "0 0 12px", font: "var(--fw-semibold) var(--fs-section-title)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{title}</h3> : null}
      <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--fw-medium) var(--fs-label)/1.4 var(--font-sans)" }}>
        <thead>
          <tr>{columns.map((c, i) => <th key={i} style={{ textAlign: i ? "right" : "left", padding: "8px 4px", font: "var(--fw-medium) var(--fs-hint)/1.2 var(--font-sans)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-hairline)" }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => <td key={j} style={{ textAlign: j ? "right" : "left", padding: "11px 4px", color: j ? "var(--text-body)" : "var(--text-primary)", borderBottom: "1px solid var(--border-hairline)" }}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SectionRow({
  index,
  icon,
  title,
  enabled,
  onToggleName,
  children,
  style,
}: {
  index: number;
  icon?: string;
  title: string;
  enabled: boolean;
  onToggleName: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", overflow: "hidden", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px" }}>
        <span aria-hidden="true" style={{ color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>≡</span>
        <span style={{ minWidth: "34px", height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-badge)", background: "var(--surface-raised)", border: "1px solid var(--border-accent)", font: "var(--fw-bold) var(--fs-badge)/1 var(--font-sans)", color: "var(--text-accent)" }}>{index}</span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px", font: "var(--fw-semibold) var(--fs-section-title)/1.2 var(--font-sans)", color: "var(--text-primary)" }}>
          {icon ? <span aria-hidden="true">{icon}</span> : null}{title}
        </span>
        <SectionToggle name={onToggleName} defaultEnabled={enabled} />
      </div>
      {children ? <div style={{ padding: "0 14px 14px", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "var(--gap-grid)" }}>{children}</div> : null}
    </div>
  );
}

// A real controlled switch. The previous version styled a <span> inside a
// <label> wrapping a hidden checkbox and flipped `.checked` imperatively —
// which the label's own activation behaviour then flipped straight back, so
// the switch looked on but submitted off. React state is the single source of
// truth here, and the hidden input carries it into the form exactly the way a
// checked checkbox would ("on" when set, empty otherwise).
function SectionToggle({ name, defaultEnabled }: { name: string; defaultEnabled: boolean }) {
  const [on, setOn] = useState(defaultEnabled);
  return (
    <>
      <input type="hidden" name={name} value={on ? "on" : ""} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        style={{ width: "56px", height: "30px", flex: "0 0 auto", borderRadius: "var(--radius-pill)", border: "1px solid " + (on ? "var(--green-500)" : "var(--border-hairline)"), background: on ? "var(--surface-primary)" : "var(--surface-raised)", position: "relative", cursor: "pointer", transition: "var(--transition-control)", padding: 0 }}
      >
        <span style={{ position: "absolute", top: "3px", left: on ? "29px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "var(--white)", transition: "left var(--dur-base) var(--ease-standard)" }} />
      </button>
    </>
  );
}

export function ThemeSwatchCard({ name, icon, base, primary, accent, selected = false, onSelectValue, radioName, style }: { name: string; icon: string; base: string; primary: string; accent: string; selected?: boolean; onSelectValue: string; radioName: string; style?: CSSProperties }) {
  return (
    <label style={{ background: "var(--surface-inset)", border: "1px solid " + (selected ? "var(--white)" : "var(--border-hairline)"), borderRadius: "var(--radius-inset)", padding: "14px 12px", cursor: "pointer", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", transition: "var(--transition-control)", ...style }}>
      <input type="radio" name={radioName} value={onSelectValue} defaultChecked={selected} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
      {selected ? <span aria-hidden="true" style={{ position: "absolute", top: "10px", right: "12px", color: "var(--white)", fontSize: "14px" }}>✓</span> : null}
      <span style={{ display: "flex", gap: "6px" }}>
        {[base, primary, accent].map((c, i) => <span key={i} style={{ width: "18px", height: "18px", borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,.14)" }} />)}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "6px", font: "var(--fw-semibold) var(--fs-hint)/1.2 var(--font-sans)", color: "var(--text-body)" }}>
        <span aria-hidden="true">{icon}</span>{name}
      </span>
    </label>
  );
}

export function ReviewRow({ index, member, text, stars, style }: { index: number; member: string; text: string; stars: string; style?: CSSProperties }) {
  const inp: CSSProperties = { background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--text-body-default)", outline: "none", minWidth: 0 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: "var(--gap-grid)", alignItems: "center", ...style }}>
      <input name={`review_member_${index}`} defaultValue={member} placeholder="สมาชิก" style={inp} />
      <input name={`review_text_${index}`} defaultValue={text} placeholder="ข้อความรีวิว" style={inp} />
      <select name={`review_stars_${index}`} defaultValue={stars} style={{ background: "var(--off-white)", color: "var(--ink-900)", border: "1px solid var(--border-hairline)", borderRadius: "6px", padding: "8px 10px", font: "var(--fw-medium) var(--fs-label)/1.2 var(--font-sans)", cursor: "pointer" }}>
        {["5 ดาว", "4 ดาว", "3 ดาว", "2 ดาว", "1 ดาว"].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", font: "var(--fw-bold) var(--fs-label)/1 var(--font-sans)", color: "var(--text-danger)", cursor: "pointer" }}>
        <input type="checkbox" name={`review_remove_${index}`} />✖
      </label>
    </div>
  );
}

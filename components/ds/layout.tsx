import type { CSSProperties, ReactNode } from "react";

export function Accordion({
  items,
  openIndex,
  onToggle,
  style,
}: {
  items: { icon?: string; title: string; body: string }[];
  openIndex: number | null;
  onToggle: (i: number | null) => void;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-field)", ...style }}>
      {items.map((it, i) => {
        const open = openIndex === i;
        return (
          <div key={i} style={{ background: "var(--surface-inset)", border: "1px solid " + (open ? "var(--border-accent)" : "var(--border-hairline)"), borderRadius: "var(--radius-inset)", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => onToggle(open ? null : i)}
              style={{ width: "100%", background: "transparent", border: 0, padding: "16px 18px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", font: "var(--fw-semibold) var(--fs-section-title)/1.2 var(--font-sans)", color: "var(--text-primary)", textAlign: "left" }}
            >
              {it.icon ? <span aria-hidden="true">{it.icon}</span> : null}
              <span style={{ flex: 1 }}>{it.title}</span>
              <span aria-hidden="true" style={{ color: "var(--text-accent)", fontSize: "20px", lineHeight: 1 }}>{open ? "−" : "+"}</span>
            </button>
            {open ? <div style={{ padding: "0 18px 16px", font: "var(--text-body-default)", color: "var(--text-body)" }}>{it.body}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, style }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; style?: CSSProperties }) {
  return (
    <header style={{ background: "var(--surface-accent-header)", borderBottom: "2px solid var(--green-500)", borderRadius: "var(--radius-card)", padding: "22px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", ...style }}>
      <div style={{ flex: 1, minWidth: "200px" }}>
        <h1 style={{ margin: 0, font: "var(--text-page-title)", color: "var(--text-primary)" }}>{title}</h1>
        {subtitle ? <p style={{ margin: "6px 0 0", font: "var(--text-hint)", color: "var(--text-muted)" }}>{subtitle}</p> : null}
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>{actions}</div>
    </header>
  );
}

export function QuickNavGrid({
  items,
  onSelect,
  columns = 4,
  style,
}: {
  items: { icon?: string; label: string; key: string }[];
  onSelect?: (it: { icon?: string; label: string; key: string }) => void;
  columns?: number;
  style?: CSSProperties;
}) {
  return (
    <nav style={{ background: "var(--surface-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-card)", padding: "var(--pad-card)", display: "grid", gridTemplateColumns: "repeat(" + columns + ",minmax(0,1fr))", gap: "var(--gap-grid)", ...style }}>
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect && onSelect(it)}
          style={{ background: "var(--surface-accent-soft)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-button)", padding: "13px 10px", font: "var(--fw-semibold) var(--fs-label)/1.2 var(--font-sans)", color: "var(--text-accent)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "var(--transition-control)" }}
        >
          {it.icon ? <span aria-hidden="true">{it.icon}</span> : null}
          {it.label}
        </button>
      ))}
    </nav>
  );
}

export function SaveBar({ label = "บันทึกทั้งหมด", pending, style }: { label?: string; pending?: boolean; style?: CSSProperties }) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ width: "100%", background: "var(--surface-primary)", color: "var(--text-on-primary)", border: "1px solid var(--green-500)", borderRadius: "var(--radius-card)", padding: "22px", font: "var(--fw-bold) 20px/1 var(--font-sans)", cursor: pending ? "wait" : "pointer", boxShadow: "var(--shadow-primary)", transition: "var(--transition-control)", opacity: pending ? 0.7 : 1, ...style }}
    >
      {pending ? "กำลังบันทึก..." : label}
    </button>
  );
}

export function SectionCard({
  icon,
  title,
  count,
  subtitle,
  open = true,
  onToggle,
  accent = true,
  children,
  style,
  id,
}: {
  icon?: string;
  title: ReactNode;
  count?: ReactNode;
  subtitle?: ReactNode;
  open?: boolean;
  onToggle?: () => void;
  accent?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  id?: string;
}) {
  return (
    <section id={id} style={{ background: "var(--surface-card)", border: "1px solid " + (accent ? "var(--border-accent)" : "var(--border-hairline)"), borderRadius: "var(--radius-card)", overflow: "hidden", ...style }}>
      <header style={{ background: accent ? "var(--surface-section-header)" : "var(--surface-inset)", padding: "var(--pad-card-header)", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border-accent)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, font: "var(--text-card-title)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {icon ? <span aria-hidden="true">{icon}</span> : null}
            <span>{title}</span>
            {count ? <span style={{ font: "var(--fw-semibold) var(--fs-label)/1 var(--font-sans)", color: "var(--text-accent)" }}>({count})</span> : null}
          </h2>
          {subtitle ? <p style={{ margin: "4px 0 0", font: "var(--text-hint)", color: "var(--text-muted)" }}>{subtitle}</p> : null}
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            style={{ background: "var(--surface-inset)", color: "var(--text-body)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-button)", padding: "var(--pad-button-sm)", font: "var(--fw-medium) var(--fs-hint)/1.1 var(--font-sans)", cursor: "pointer", display: "inline-flex", gap: "6px", alignItems: "center", transition: "var(--transition-control)" }}
          >
            {open ? "ซ่อนรายการ" : "แสดงรายการ"}
            <span aria-hidden="true">{open ? "▲" : "▼"}</span>
          </button>
        ) : null}
      </header>
      {open ? <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: "var(--gap-field)" }}>{children}</div> : null}
    </section>
  );
}

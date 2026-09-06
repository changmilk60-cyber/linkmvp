import type { ChangeEvent, CSSProperties, ReactNode } from "react";

export function Field({
  label,
  labelTone = "accent",
  hint,
  hintTone = "muted",
  hintIcon,
  boxed = true,
  children,
  style,
}: {
  label?: ReactNode;
  labelTone?: "accent" | "warning" | "primary";
  hint?: ReactNode;
  hintTone?: "accent" | "warning" | "body" | "muted";
  hintIcon?: ReactNode;
  boxed?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const labelColor = labelTone === "accent" ? "var(--text-accent)" : labelTone === "warning" ? "var(--text-warning)" : "var(--text-primary)";
  const inner = (
    <>
      {label ? <label style={{ display: "block", font: "var(--text-label)", color: labelColor, marginBottom: "8px" }}>{label}</label> : null}
      {children}
      {hint ? (
        <p style={{ margin: "6px 0 0", display: "flex", gap: "6px", font: "var(--text-hint)", color: hintTone === "accent" ? "var(--text-accent)" : hintTone === "warning" ? "var(--text-warning)" : hintTone === "body" ? "var(--text-body)" : "var(--text-muted)" }}>
          {hintIcon ? <span aria-hidden="true">{hintIcon}</span> : null}
          <span>{hint}</span>
        </p>
      ) : null}
    </>
  );
  return boxed ? (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", ...style }}>{inner}</div>
  ) : (
    <div style={style}>{inner}</div>
  );
}

export function TextInput({
  value,
  onChange,
  name,
  placeholder,
  mono = false,
  disabled = false,
  readOnly = false,
  type = "text",
  style,
  defaultValue,
  ...rest
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  name?: string;
  placeholder?: string;
  mono?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: string;
  style?: CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "style" | "value" | "defaultValue" | "type">) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      defaultValue={defaultValue}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      onChange={onChange ? (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined}
      style={{
        width: "100%",
        background: "var(--surface-field)",
        border: "1px solid var(--border-field)",
        borderRadius: "var(--radius-field)",
        padding: "var(--pad-field)",
        color: "var(--text-body)",
        font: mono ? "var(--fw-regular) var(--fs-body)/1.4 var(--font-mono)" : "var(--text-body-default)",
        outline: "none",
        transition: "var(--transition-control)",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    />
  );
}

export function Textarea({ value, defaultValue, onChange, name, placeholder, rows = 4, style }: { value?: string; defaultValue?: string; onChange?: (v: string) => void; name?: string; placeholder?: string; rows?: number; style?: CSSProperties }) {
  return (
    <textarea
      name={name}
      rows={rows}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      style={{ width: "100%", background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--text-body-default)", outline: "none", resize: "vertical", transition: "var(--transition-control)", ...style }}
    />
  );
}

export function Select({ value, defaultValue, onChange, name, options, style }: { value?: string; defaultValue?: string; onChange?: (v: string) => void; name?: string; options: { value: string; label: string }[]; style?: CSSProperties }) {
  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      style={{ background: "var(--off-white)", color: "var(--ink-900)", border: "1px solid var(--border-hairline)", borderRadius: "6px", padding: "7px 10px", font: "var(--fw-medium) var(--fs-label)/1.2 var(--font-sans)", cursor: "pointer", ...style }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, name, disabled = false, style }: { checked: boolean; onChange?: (v: boolean) => void; name?: string; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      style={{ width: "56px", height: "30px", flex: "0 0 auto", borderRadius: "var(--radius-pill)", border: "1px solid " + (checked ? "var(--green-500)" : "var(--border-hairline)"), background: checked ? "var(--surface-primary)" : "var(--surface-raised)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", transition: "var(--transition-control)", padding: 0, opacity: disabled ? 0.5 : 1, ...style }}
    >
      {name ? <input type="hidden" name={name} value={checked ? "on" : ""} /> : null}
      <span style={{ position: "absolute", top: "3px", left: checked ? "29px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "var(--white)", transition: "left var(--dur-base) var(--ease-standard)" }} />
    </button>
  );
}

export function SegmentedChoice({ options, value, onChange, columns, style }: { options: { icon?: string; label: string; sublabel?: string; value: string }[]; value: string; onChange: (v: string) => void; columns?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(" + (columns || options.length) + ",minmax(0,1fr))", gap: "var(--gap-grid)", ...style }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{ background: active ? "var(--green-tint-1)" : "var(--surface-inset)", border: "1px solid " + (active ? "var(--border-accent-strong)" : "var(--border-hairline)"), borderRadius: "var(--radius-inset)", padding: "14px 12px", color: active ? "var(--text-accent)" : "var(--text-body)", font: "var(--fw-semibold) var(--fs-label)/1.35 var(--font-sans)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", transition: "var(--transition-control)" }}
          >
            <span>{o.icon ? <span aria-hidden="true" style={{ marginRight: "6px" }}>{o.icon}</span> : null}{o.label}</span>
            {o.sublabel ? <span style={{ font: "var(--text-hint)", color: "inherit", opacity: 0.85 }}>{o.sublabel}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function ColorField({ label, value = "", swatch = "#ffffff", placeholder = "เช่น #ff9900", onChange, name, hint = "ปล่อยว่าง = ใช้สีจาก Theme Preset อัตโนมัติ", style }: { label?: ReactNode; value?: string; swatch?: string; placeholder?: string; onChange?: (v: string) => void; name?: string; hint?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", ...style }}>
      {label ? <label style={{ display: "block", font: "var(--text-label)", color: "var(--text-accent)", marginBottom: "8px" }}>{label}</label> : null}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ width: "40px", height: "40px", flex: "0 0 auto", borderRadius: "var(--radius-swatch)", background: swatch || "#00000000", border: "1px solid var(--border-hairline)" }} />
        <input
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          style={{ flex: 1, minWidth: 0, background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--text-body-default)", outline: "none" }}
        />
      </div>
      {hint ? <p style={{ margin: "6px 0 0", font: "var(--text-hint)", color: "var(--text-muted)" }}>{hint}</p> : null}
    </div>
  );
}

export function ImageUploadField({
  label,
  name,
  currentUrl,
  currentSize,
  recommend,
  note,
  onRemove,
  removeName,
  style,
}: {
  label?: ReactNode;
  name: string;
  currentUrl?: string | null;
  currentSize?: string;
  recommend?: string;
  note?: string;
  onRemove?: () => void;
  removeName?: string;
  style?: CSSProperties;
}) {
  return (
    <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", ...style }}>
      {label ? <label style={{ display: "block", font: "var(--text-label)", color: "var(--text-accent)", marginBottom: "8px" }}>{label}</label> : null}
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="" style={{ width: "100%", maxWidth: "220px", borderRadius: "var(--radius-field)", display: "block", marginBottom: "8px", border: "1px solid var(--border-hairline)" }} />
      ) : null}
      <input type="file" name={name} accept="image/*" style={{ width: "100%", color: "var(--text-body)", font: "var(--text-hint)" }} />
      {currentSize ? (
        <p style={{ margin: "8px 0 0", font: "var(--fw-bold) var(--fs-hint)/1.2 var(--font-sans)", color: "var(--text-accent)" }}><span aria-hidden="true">📐</span> ขนาดปัจจุบัน: {currentSize}</p>
      ) : null}
      {onRemove && currentUrl ? (
        <label style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", font: "var(--fw-semibold) var(--fs-hint)/1.1 var(--font-sans)", color: "var(--text-danger)", cursor: "pointer" }}>
          <input type="checkbox" name={removeName} onChange={onRemove} />
          <span aria-hidden="true">🗑</span> ลบรูปนี้
        </label>
      ) : null}
      {recommend ? <p style={{ margin: "6px 0 0", font: "var(--fw-medium) var(--fs-hint)/1.4 var(--font-sans)", color: "var(--text-warning)" }}><span aria-hidden="true">📏</span> {recommend}</p> : null}
      {note ? <p style={{ margin: "4px 0 0", font: "var(--text-hint)", color: "var(--text-body)" }}>{note}</p> : null}
    </div>
  );
}

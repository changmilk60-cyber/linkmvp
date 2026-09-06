import type { CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "quiet" | "white" | "danger" | "line";
type ButtonSize = "sm" | "md" | "lg" | "block";

const BUTTON_BASE: CSSProperties = {
  font: "var(--fw-semibold) var(--fs-label)/1.2 var(--font-sans)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "var(--pad-button)",
  borderRadius: "var(--radius-button)",
  border: "1px solid transparent",
  cursor: "pointer",
  transition: "var(--transition-control)",
  whiteSpace: "nowrap",
  textDecoration: "none",
};

const BUTTON_VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: { background: "var(--surface-primary)", color: "var(--text-on-primary)", boxShadow: "var(--shadow-primary)", borderColor: "var(--green-500)" },
  outline: { background: "var(--surface-accent-soft)", color: "var(--text-accent)", borderColor: "var(--border-accent)" },
  ghost: { background: "var(--green-900)", color: "var(--text-accent)", borderColor: "var(--border-accent)" },
  quiet: { background: "var(--surface-inset)", color: "var(--text-body)", borderColor: "var(--border-hairline)" },
  white: { background: "var(--off-white)", color: "var(--ink-900)", borderColor: "var(--off-white)", fontWeight: "var(--fw-bold)" as unknown as number },
  danger: { background: "var(--surface-danger-soft)", color: "var(--text-danger)", borderColor: "var(--border-danger)" },
  line: { background: "var(--line-green)", color: "var(--white)", borderColor: "var(--line-green)" },
};

const BUTTON_SIZES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: "var(--pad-button-sm)", fontSize: "var(--fs-hint)" },
  md: {},
  lg: { padding: "14px 26px", fontSize: "var(--fs-section-title)" },
  block: { padding: "16px 26px", fontSize: "18px", width: "100%" },
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  disabled = false,
  fullWidth = false,
  style,
  type = "button",
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        ...BUTTON_BASE,
        ...BUTTON_VARIANTS[variant],
        ...BUTTON_SIZES[size],
        ...(fullWidth ? { width: "100%" } : null),
        ...(disabled ? { opacity: 0.45, cursor: "not-allowed", boxShadow: "none" } : null),
        ...style,
      }}
      {...rest}
    >
      {icon ? <span aria-hidden="true" style={{ fontSize: "1.05em", lineHeight: 1 }}>{icon}</span> : null}
      {children}
    </button>
  );
}

const PILL_TONES: Record<string, CSSProperties> = {
  solid: { background: "var(--green-600)", color: "var(--white)", border: "1px solid var(--green-600)" },
  soft: { background: "var(--green-tint-1)", color: "var(--text-accent)", border: "1px solid var(--border-accent)" },
  neutral: { background: "var(--surface-inset)", color: "var(--text-muted)", border: "1px solid var(--border-hairline)" },
  warning: { background: "transparent", color: "var(--text-warning)", border: "1px solid var(--amber-300)" },
};

export function Pill({ tone = "solid", icon, children, style }: { tone?: keyof typeof PILL_TONES; icon?: ReactNode; children?: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "var(--radius-button)", font: "var(--fw-semibold) var(--fs-label)/1.1 var(--font-sans)", ...PILL_TONES[tone], ...style }}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}

export function Badge({ children, tone = "accent", style }: { children?: ReactNode; tone?: "accent" | "plain"; style?: CSSProperties }) {
  const tones: Record<string, CSSProperties> = {
    accent: { background: "var(--surface-inset)", color: "var(--text-accent)", border: "1px solid var(--border-accent)" },
    plain: { background: "var(--surface-inset)", color: "var(--text-body)", border: "1px solid var(--border-hairline)" },
  };
  return (
    <span style={{ minWidth: "34px", height: "34px", padding: "0 8px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-badge)", font: "var(--fw-bold) var(--fs-badge)/1 var(--font-sans)", ...tones[tone], ...style }}>
      {children}
    </span>
  );
}

const HINT_TONES: Record<string, string> = { muted: "var(--text-muted)", accent: "var(--text-accent)", warning: "var(--text-warning)", danger: "var(--text-danger)", body: "var(--text-body)" };

export function Hint({ tone = "muted", icon, children, style }: { tone?: keyof typeof HINT_TONES; icon?: ReactNode; children?: ReactNode; style?: CSSProperties }) {
  return (
    <p style={{ margin: "6px 0 0", display: "flex", gap: "6px", alignItems: "flex-start", color: HINT_TONES[tone], font: "var(--text-hint)", ...style }}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </p>
  );
}

export function SaveBanner({ message = "บันทึกเรียบร้อย", version, style }: { message?: string; version?: string; style?: CSSProperties }) {
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-card)", padding: "16px 20px", font: "var(--fw-bold) var(--fs-section-title)/1.2 var(--font-sans)", color: "var(--text-accent)", ...style }}>
      {message}
      {version ? (
        <>
          {" "}
          <span style={{ color: "var(--green-700)" }}>●</span> <span style={{ color: "var(--text-accent-bright)" }}>{version}</span>
        </>
      ) : null}
    </div>
  );
}

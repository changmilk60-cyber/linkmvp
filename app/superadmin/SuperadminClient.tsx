"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Button, SectionCard, TextInput } from "@/components/ds";
import { updateLicenseAction, setDisabledAction, resetPasswordAction } from "./actions";

type Item = {
  pageId: string;
  slug: string;
  userId: string;
  email: string;
  role: string;
  disabled: boolean;
  joined: string;
  expiresAt: string;
  daysLeft: number;
  status: "expired" | "soon" | "ok";
  visits: number;
};

type AuditRow = {
  id: string;
  actorEmail: string;
  action: string;
  targetEmail: string;
  before: string | null;
  after: string | null;
  at: string;
};

const STATUS: Record<Item["status"], { label: string; color: string; bg: string }> = {
  expired: { label: "หมดอายุแล้ว", color: "var(--text-danger)", bg: "var(--surface-danger-soft)" },
  soon: { label: "ใกล้หมดอายุ", color: "var(--text-warning)", bg: "var(--surface-inset)" },
  ok: { label: "ใช้งานได้", color: "var(--text-accent)", bg: "var(--surface-inset)" },
};

const ACTION_LABEL: Record<string, string> = {
  extend_license: "ต่ออายุ",
  set_license: "ตั้งวันหมดอายุ",
  disable: "ระงับการใช้งาน",
  enable: "ปลดระงับ",
  reset_password: "ตั้งรหัสผ่านใหม่",
};

/** Readable but mixed — avoids 0/O and 1/l/I so it survives being read aloud
 *  or copied out of a chat message by hand. */
function suggestPassword(len = 12) {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

function PasswordResetter({ item, onDone }: { item: Item; onDone: () => void }) {
  const [state, formAction] = useFormState(resetPasswordAction, {});
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <form action={formAction} style={{ marginTop: "10px", background: "var(--surface-field)", border: "1px solid var(--border-danger)", borderRadius: "var(--radius-inset)", padding: "14px" }}>
      <input type="hidden" name="userId" value={item.userId} />
      <p style={{ margin: "0 0 10px", font: "var(--text-hint)", color: "var(--text-warning)" }}>
        ⚠ ตั้งรหัสผ่านใหม่ให้ <strong>{item.email}</strong> — รหัสเดิมจะใช้ไม่ได้ทันที
        และอุปกรณ์ที่ล็อกอินค้างอยู่จะถูกตัดออกทั้งหมด
      </p>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          name="newPassword"
          type="text"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          style={{ flex: "1 1 220px", background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--fw-regular) var(--fs-body)/1.4 var(--font-mono)" }}
        />
        <Button type="button" variant="ghost" size="sm" onClick={() => { setPw(suggestPassword()); setCopied(false); }}>
          สุ่มรหัสให้
        </Button>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "12px", cursor: "pointer", font: "var(--text-label)", color: "var(--text-body)" }}>
        <input type="checkbox" name="confirm" value="yes" style={{ width: "17px", height: "17px", accentColor: "var(--green-500)", cursor: "pointer", flexShrink: 0 }} />
        ยืนยันตั้งรหัสผ่านใหม่ให้บัญชีนี้
      </label>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
        <Button type="submit" variant="primary" size="sm">ตั้งรหัสผ่านใหม่</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>ปิด</Button>
      </div>

      {state?.error ? <p style={{ margin: "10px 0 0", color: "var(--text-danger)", font: "var(--text-hint)" }}>{state.error}</p> : null}
      {state?.success ? (
        <div style={{ marginTop: "12px", background: "var(--surface-inset)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-inset)", padding: "12px" }}>
          <p style={{ margin: "0 0 8px", color: "var(--text-accent)", font: "var(--text-hint)" }}>{state.success}</p>
          {state.reveal ? (
            <>
              <p style={{ margin: "0 0 6px", font: "var(--text-hint)", color: "var(--text-muted)" }}>
                รหัสผ่านใหม่ — แสดงครั้งเดียว ระบบไม่ได้เก็บไว้ที่ไหน คัดลอกส่งให้เจ้าของบัญชีเลย
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <code style={{ flex: "1 1 200px", background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "10px 12px", color: "var(--text-accent-bright)", font: "var(--fw-bold) var(--fs-body)/1.4 var(--font-mono)", overflowWrap: "anywhere" }}>
                  {state.reveal}
                </code>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => { navigator.clipboard?.writeText(state.reveal as string).then(() => setCopied(true)).catch(() => undefined); }}>
                  {copied ? "คัดลอกแล้ว ✓" : "คัดลอก"}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div style={{ flex: "1 1 150px", background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "14px 16px" }}>
      <div style={{ font: "var(--fw-bold) 26px/1.1 var(--font-sans)", color: tone || "var(--text-primary)" }}>{value}</div>
      <div style={{ marginTop: "3px", font: "var(--text-hint)", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function LicenseEditor({ item, onDone }: { item: Item; onDone: () => void }) {
  const [state, formAction] = useFormState(updateLicenseAction, {});
  const [mode, setMode] = useState<"add" | "set">("add");
  const [days, setDays] = useState("30");
  const [date, setDate] = useState(item.expiresAt);

  // Mirror of extendFrom() in lib/license.ts so the operator sees the same
  // date the server will write: a lapsed licence counts from today, a live
  // one from its own end date.
  const preview = (() => {
    if (mode === "set") return date || "—";
    const n = Number(days);
    if (!Number.isInteger(n) || n === 0) return "—";
    const base = item.status === "expired" ? new Date() : new Date(`${item.expiresAt}T00:00:00Z`);
    base.setUTCDate(base.getUTCDate() + n);
    return base.toISOString().slice(0, 10);
  })();

  return (
    <form action={formAction} style={{ marginTop: "10px", background: "var(--surface-field)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-inset)", padding: "14px" }}>
      <input type="hidden" name="pageId" value={item.pageId} />
      <input type="hidden" name="mode" value={mode} />

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        {(["add", "set"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{ padding: "7px 13px", borderRadius: "var(--radius-button)", cursor: "pointer", font: "var(--fw-semibold) var(--fs-hint)/1.1 var(--font-sans)", background: mode === m ? "var(--surface-primary)" : "var(--surface-raised)", color: mode === m ? "var(--text-on-primary)" : "var(--text-muted)", border: "1px solid " + (mode === m ? "var(--border-accent-strong)" : "var(--border-hairline)") }}
          >
            {m === "add" ? "ต่ออายุ (+วัน)" : "ตั้งวันที่เอง"}
          </button>
        ))}
      </div>

      {mode === "add" ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {[30, 90, 180, 365].map((d) => (
            <button key={d} type="button" onClick={() => setDays(String(d))}
              style={{ padding: "7px 12px", borderRadius: "var(--radius-button)", cursor: "pointer", font: "var(--fw-medium) var(--fs-hint)/1.1 var(--font-sans)", background: days === String(d) ? "var(--green-900)" : "var(--surface-raised)", color: days === String(d) ? "var(--text-accent-bright)" : "var(--text-muted)", border: "1px solid " + (days === String(d) ? "var(--border-accent)" : "var(--border-hairline)") }}>
              +{d} วัน
            </button>
          ))}
          <input name="days" type="number" value={days} onChange={(e) => setDays(e.target.value)}
            style={{ width: "100px", background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--text-body-default)" }} />
        </div>
      ) : (
        <input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
          style={{ background: "var(--surface-field)", border: "1px solid var(--border-field)", borderRadius: "var(--radius-field)", padding: "var(--pad-field)", color: "var(--text-body)", font: "var(--text-body-default)", colorScheme: "dark" }} />
      )}

      <p style={{ margin: "12px 0 0", font: "var(--fw-semibold) var(--fs-body)/1.5 var(--font-sans)", color: "var(--text-body)" }}>
        {item.expiresAt} <span style={{ color: "var(--text-accent)" }}>→ {preview}</span>
        {item.status === "expired" && mode === "add" ? (
          <span style={{ display: "block", font: "var(--text-hint)", color: "var(--text-warning)", marginTop: "4px" }}>
            บัญชีนี้หมดอายุแล้ว — นับวันใหม่จากวันนี้
          </span>
        ) : null}
      </p>

      <label style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "12px", cursor: "pointer", font: "var(--text-label)", color: "var(--text-body)" }}>
        <input type="checkbox" name="confirm" value="yes" style={{ width: "17px", height: "17px", accentColor: "var(--green-500)", cursor: "pointer", flexShrink: 0 }} />
        ยืนยันเปลี่ยนวันหมดอายุของ {item.email}
      </label>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
        <Button type="submit" variant="primary" size="sm">บันทึก</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>ปิด</Button>
      </div>

      {state?.error ? <p style={{ margin: "10px 0 0", color: "var(--text-danger)", font: "var(--text-hint)" }}>{state.error}</p> : null}
      {state?.success ? <p style={{ margin: "10px 0 0", color: "var(--text-accent)", font: "var(--text-hint)" }}>บันทึกแล้ว — {state.success}</p> : null}
    </form>
  );
}

function DisableButton({ item }: { item: Item }) {
  const [state, formAction] = useFormState(setDisabledAction, {});
  return (
    <form action={formAction} style={{ display: "inline" }}>
      <input type="hidden" name="userId" value={item.userId} />
      <input type="hidden" name="disabled" value={String(!item.disabled)} />
      <Button type="submit" variant={item.disabled ? "outline" : "ghost"} size="sm">
        {item.disabled ? "ปลดระงับ" : "ระงับการใช้งาน"}
      </Button>
      {state?.error ? <span style={{ marginLeft: "8px", color: "var(--text-danger)", font: "var(--text-hint)" }}>{state.error}</span> : null}
    </form>
  );
}

function Row({ item, baseUrl }: { item: Item; baseUrl: string }) {
  const [open, setOpen] = useState<"" | "license" | "password">("");
  const s = STATUS[item.status];
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid " + (item.disabled ? "var(--border-danger)" : "var(--border-hairline)"), borderRadius: "var(--radius-inset)", padding: "14px 16px", opacity: item.disabled ? 0.72 : 1 }}>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 250px", minWidth: 0 }}>
          <div style={{ font: "var(--fw-semibold) var(--fs-body)/1.4 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>
            {item.email}
            {item.role === "superadmin" ? <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "999px", background: "var(--green-900)", color: "var(--text-accent-bright)", font: "var(--fw-semibold) var(--fs-micro)/1.4 var(--font-sans)" }}>SUPERADMIN</span> : null}
            {item.disabled ? <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "999px", background: "var(--surface-danger-soft)", color: "var(--text-danger)", font: "var(--fw-semibold) var(--fs-micro)/1.4 var(--font-sans)" }}>ระงับอยู่</span> : null}
          </div>
          <a href={`${baseUrl}/${item.slug}`} target="_blank" rel="noopener noreferrer" style={{ font: "var(--text-hint)", color: "var(--text-muted)" }}>
            /{item.slug} ↗
          </a>
        </div>
        <div style={{ flex: "0 0 auto", textAlign: "right" }}>
          <div style={{ font: "var(--fw-semibold) var(--fs-body)/1.3 var(--font-sans)", color: s.color }}>{item.expiresAt}</div>
          <div style={{ font: "var(--text-hint)", color: "var(--text-muted)" }}>
            {item.status === "expired" ? s.label : `เหลือ ${item.daysLeft} วัน`} · {item.visits} ครั้ง
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Button type="button" variant={open === "license" ? "outline" : "primary"} size="sm"
            onClick={() => setOpen(open === "license" ? "" : "license")}>
            {open === "license" ? "ยกเลิก" : "แก้วันหมดอายุ"}
          </Button>
          <Button type="button" variant="ghost" size="sm"
            onClick={() => setOpen(open === "password" ? "" : "password")}>
            {open === "password" ? "ยกเลิก" : "ตั้งรหัสผ่านใหม่"}
          </Button>
          <DisableButton item={item} />
        </div>
      </div>
      {open === "license" ? <LicenseEditor item={item} onDone={() => setOpen("")} /> : null}
      {open === "password" ? <PasswordResetter item={item} onDone={() => setOpen("")} /> : null}
    </div>
  );
}

export default function SuperadminClient({
  actorEmail, items, summary, baseUrl, q, sort, pageNo, perPage, audit,
}: {
  actorEmail: string;
  items: Item[];
  summary: { total: number; expired: number; soon: number; disabled: number };
  baseUrl: string;
  q: string;
  sort: string;
  pageNo: number;
  perPage: number;
  audit: AuditRow[];
}) {
  const lastPage = Math.max(1, Math.ceil(summary.total / perPage));
  const href = (p: number) => `/superadmin?${new URLSearchParams({ ...(q ? { q } : {}), sort, page: String(p) })}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <header style={{ borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-card)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "14px 20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ font: "var(--fw-bold) 18px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>
            SUPER<span style={{ color: "var(--text-accent)" }}>ADMIN</span>
          </span>
          <span style={{ font: "var(--text-hint)", color: "var(--text-muted)" }}>{actorEmail}</span>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/dashboard"><Button variant="ghost" size="sm">กลับหลังบ้านของฉัน</Button></Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 20px 60px", display: "flex", flexDirection: "column", gap: "var(--gap-grid)" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Stat label="หน้าเซลเพจทั้งหมด" value={summary.total} />
          <Stat label="หมดอายุแล้ว" value={summary.expired} tone="var(--text-danger)" />
          <Stat label="ใกล้หมดอายุ (≤7 วัน)" value={summary.soon} tone="var(--text-warning)" />
          <Stat label="บัญชีที่ถูกระงับ" value={summary.disabled} />
        </div>

        <SectionCard icon="👥" title="ผู้ใช้งานทั้งหมด" subtitle="เรียงตามวันที่เหลือน้อยที่สุดก่อน" open>
          <form method="get" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "var(--gap-grid)" }}>
            <input type="hidden" name="sort" value={sort} />
            <div style={{ flex: "1 1 240px" }}>
              <TextInput name="q" defaultValue={q} placeholder="ค้นหาอีเมล หรือ ชื่อลิงก์" autoComplete="off" />
            </div>
            <Button type="submit" variant="primary">ค้นหา</Button>
            {q ? <Link href={`/superadmin?sort=${sort}`}><Button type="button" variant="ghost">ล้าง</Button></Link> : null}
          </form>

          <div style={{ display: "flex", gap: "8px", marginBottom: "var(--gap-grid)", flexWrap: "wrap" }}>
            {[["expiring", "ใกล้หมดอายุก่อน"], ["newest", "สมัครล่าสุดก่อน"]].map(([key, label]) => (
              <Link key={key} href={`/superadmin?${new URLSearchParams({ ...(q ? { q } : {}), sort: key })}`}>
                <Button type="button" variant={sort === key ? "primary" : "ghost"} size="sm">{label}</Button>
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <p style={{ margin: 0, font: "var(--text-body-default)", color: "var(--text-muted)" }}>ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {items.map((it) => <Row key={it.pageId} item={it} baseUrl={baseUrl} />)}
            </div>
          )}

          {lastPage > 1 ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "var(--gap-grid)", flexWrap: "wrap" }}>
              {pageNo > 1 ? <Link href={href(pageNo - 1)}><Button variant="ghost" size="sm">‹ ก่อนหน้า</Button></Link> : null}
              <span style={{ font: "var(--text-hint)", color: "var(--text-muted)" }}>หน้า {pageNo} / {lastPage}</span>
              {pageNo < lastPage ? <Link href={href(pageNo + 1)}><Button variant="ghost" size="sm">ถัดไป ›</Button></Link> : null}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard icon="📜" title="ประวัติการแก้ไขล่าสุด" subtitle="บันทึกทุกครั้งที่มีการต่ออายุหรือระงับบัญชี">
          {audit.length === 0 ? (
            <p style={{ margin: 0, font: "var(--text-body-default)", color: "var(--text-muted)" }}>ยังไม่มีประวัติ</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {audit.map((a) => (
                <div key={a.id} style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "10px 13px", font: "var(--text-hint)", color: "var(--text-muted)", overflowWrap: "anywhere" }}>
                  <span style={{ color: "var(--text-muted)" }}>{a.at}</span>{" · "}
                  <span style={{ color: "var(--text-accent)" }}>{ACTION_LABEL[a.action] || a.action}</span>{" · "}
                  <span style={{ color: "var(--text-body)" }}>{a.targetEmail}</span>
                  {a.before || a.after ? <span>{" · "}{a.before} → {a.after}</span> : null}
                  {" · โดย "}{a.actorEmail}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </main>
    </div>
  );
}

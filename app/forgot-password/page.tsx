import Link from "next/link";
import { Hint } from "@/components/ds";

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "var(--surface-page)" }}>
      <div style={{ width: "460px", maxWidth: "100%", background: "var(--surface-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-card)", overflow: "hidden" }}>
        <div style={{ background: "var(--surface-accent-header)", borderBottom: "2px solid var(--green-500)", padding: "26px 24px", textAlign: "center" }}>
          <div aria-hidden="true" style={{ fontSize: "34px", lineHeight: 1 }}>🔑</div>
          <h1 style={{ margin: "10px 0 0", font: "var(--fw-bold) 24px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>ลืมรหัสผ่าน</h1>
        </div>
        <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: "var(--gap-field)" }}>
          <div style={{ background: "var(--surface-inset)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-inset)", padding: "var(--pad-inset)", font: "var(--text-body-default)", color: "var(--text-body)" }}>
            ตอนนี้ระบบยังรีเซ็ตรหัสผ่านเองอัตโนมัติไม่ได้ เพราะยังไม่ได้เชื่อมระบบส่งอีเมล
            <br />
            <br />
            กรุณาติดต่อแอดมินเพื่อขอตั้งรหัสผ่านใหม่ พร้อมแจ้งอีเมลที่ใช้สมัคร
          </div>
          <Hint tone="muted">
            เมื่อเชื่อมระบบส่งอีเมลแล้ว หน้านี้จะเปลี่ยนเป็นฟอร์มกรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
          </Hint>
          <p style={{ margin: "4px 0 0", textAlign: "center", font: "var(--text-hint)", color: "var(--text-muted)" }}>
            <Link href="/login" style={{ color: "var(--text-accent)" }}>← กลับไปหน้าเข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

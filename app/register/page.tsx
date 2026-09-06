"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "@/app/actions";
import Link from "next/link";
import { Button, Field, TextInput } from "@/components/ds";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="block" disabled={pending}>
      {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, {});

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", background: "var(--surface-page)" }}>
      <div style={{ width: "420px", maxWidth: "100%", background: "var(--surface-card)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-card)", overflow: "hidden" }}>
        <div style={{ background: "var(--surface-accent-header)", borderBottom: "2px solid var(--green-500)", padding: "26px 24px", textAlign: "center" }}>
          <div aria-hidden="true" style={{ fontSize: "34px", lineHeight: 1 }}>⚙</div>
          <h1 style={{ margin: "10px 0 0", font: "var(--fw-bold) 24px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>สมัครสมาชิก</h1>
          <p style={{ margin: "6px 0 0", font: "var(--text-hint)", color: "var(--text-muted)" }}>สร้างบัญชีเพื่อเริ่มสร้างหน้าเซลเพจของคุณ</p>
        </div>
        <form action={formAction} style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: "var(--gap-field)" }}>
          <Field label="อีเมล" boxed={false}><TextInput name="email" type="email" required /></Field>
          <Field label="รหัสผ่าน" hint="อย่างน้อย 6 ตัวอักษร" boxed={false}><TextInput name="password" type="password" minLength={6} required /></Field>
          {state?.error ? <p style={{ margin: 0, color: "var(--text-danger)", font: "var(--text-hint)" }}>{state.error}</p> : null}
          <SubmitButton />
          <p style={{ margin: "4px 0 0", textAlign: "center", font: "var(--text-hint)", color: "var(--text-muted)" }}>
            มีบัญชีอยู่แล้ว? <Link href="/login" style={{ color: "var(--text-accent)" }}>เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "@/app/actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary w-full" disabled={pending} type="submit">
      {pending ? "กำลังสมัคร..." : "สมัครสมาชิก"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, {});

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
      <p className="mt-1 text-sm text-ink/60">สร้างบัญชีเพื่อเริ่มย่อลิงก์และสร้างหน้า Bio</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">อีเมล</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">รหัสผ่าน</label>
          <input className="input" id="password" name="password" type="password" minLength={6} required />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-medium text-ink underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </main>
  );
}

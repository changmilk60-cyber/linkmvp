"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary w-full" disabled={pending} type="submit">
      {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-sm text-ink/60">ยินดีต้อนรับกลับมา</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">อีเมล</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">รหัสผ่าน</label>
          <input className="input" id="password" name="password" type="password" required />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-medium text-ink underline">
          สมัครสมาชิก
        </Link>
      </p>
    </main>
  );
}

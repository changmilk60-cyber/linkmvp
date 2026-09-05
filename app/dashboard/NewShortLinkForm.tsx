"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createShortLinkAction } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" disabled={pending} type="submit">
      {pending ? "กำลังสร้าง..." : "ย่อลิงก์"}
    </button>
  );
}

export default function NewShortLinkForm() {
  const [state, formAction] = useFormState(createShortLinkAction, {});

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label className="label" htmlFor="targetUrl">URL ปลายทาง</label>
        <input
          className="input"
          id="targetUrl"
          name="targetUrl"
          placeholder="https://example.com/หน้ายาวๆ"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="shortSlug">ตัวย่อ (ไม่ใส่ = สุ่มให้)</label>
        <input className="input" id="shortSlug" name="slug" placeholder="promo-สิงหา" />
      </div>
      <SubmitButton />
      {state?.error && (
        <p className="text-sm text-red-600 sm:col-span-3">{state.error}</p>
      )}
    </form>
  );
}

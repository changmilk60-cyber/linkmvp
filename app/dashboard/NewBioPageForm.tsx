"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBioPageAction } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" disabled={pending} type="submit">
      {pending ? "กำลังสร้าง..." : "สร้างหน้า Bio"}
    </button>
  );
}

export default function NewBioPageForm() {
  const [state, formAction] = useFormState(createBioPageAction, {});

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="slug">ตัวย่อ URL</label>
        <input className="input" id="slug" name="slug" placeholder="beam" required />
      </div>
      <div>
        <label className="label" htmlFor="title">ชื่อหน้า</label>
        <input className="input" id="title" name="title" placeholder="แบรนด์ของคุณ" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="bio">คำโปรย</label>
        <input className="input" id="bio" name="bio" placeholder="ลิงก์รวมของฉัน" />
      </div>
      <div>
        <label className="label" htmlFor="themeColor">สีธีม</label>
        <input className="input h-10" id="themeColor" name="themeColor" type="color" defaultValue="#3d5afe" />
      </div>
      <div>
        <label className="label" htmlFor="avatarEmoji">ไอคอน (emoji)</label>
        <input className="input" id="avatarEmoji" name="avatarEmoji" placeholder="✨" maxLength={2} />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

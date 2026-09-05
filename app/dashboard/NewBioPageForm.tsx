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
        <label className="label" htmlFor="template">เทมเพลต</label>
        <select className="input" id="template" name="template" defaultValue="classic">
          <option value="classic">มาตรฐาน</option>
          <option value="service">ธุรกิจบริการ</option>
          <option value="course">คอร์สเรียนออนไลน์</option>
          <option value="custom">คัสต้อม (กำหนดเอง)</option>
        </select>
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
      <div className="sm:col-span-2">
        <label className="label" htmlFor="fbPixelId">Facebook Pixel ID (ถ้ามี)</label>
        <input
          className="input"
          id="fbPixelId"
          name="fbPixelId"
          placeholder="123456789012345"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <p className="mt-1 text-xs text-ink/40">
          ใส่ไว้เพื่อติดตามยอดเข้าชม/conversion จาก Facebook Ads บนหน้านี้
        </p>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="customCode">โค้ดกำหนดเอง (Custom Code)</label>
        <textarea
          className="input font-mono text-xs"
          id="customCode"
          name="customCode"
          rows={5}
          placeholder="<script>...</script> หรือโค้ด embed อื่น ๆ"
          maxLength={20000}
        />
        <p className="mt-1 text-xs text-ink/40">
          โค้ดนี้จะถูกฝังลงในหน้า Bio ของคุณตรง ๆ และรันจริงกับผู้เข้าชมทุกคน
          ใส่เฉพาะโค้ดที่คุณเขียนเองหรือเชื่อถือแหล่งที่มาเท่านั้น
          หากเลือกเทมเพลต &quot;คัสต้อม&quot; โค้ดนี้จะกลายเป็นเนื้อหาหลักของทั้งหน้า
        </p>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="images">รูปภาพประกอบ (สูงสุด 6 รูป, ไม่เกิน 5MB ต่อรูป)</label>
        <input
          className="input"
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
        />
        <p className="mt-1 text-xs text-ink/40">
          ใช้แทนรูปตัวอย่าง/พื้นหลังในเทมเพลตคอร์สเรียนออนไลน์
        </p>
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

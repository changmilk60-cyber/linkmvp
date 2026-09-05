"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateBioPageAction } from "@/app/actions";
import ColorSwatches from "../../ColorSwatches";

type Review = { name: string; text: string };
type Faq = { q: string; a: string };
type Toggles = {
  carousel: boolean;
  quiz: boolean;
  countdown: boolean;
  reviews: boolean;
  faq: boolean;
};

const FONT_OPTIONS = ["", "Prompt", "Kanit", "Sarabun", "Mitr", "Chonburi"];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary w-full text-base" disabled={pending} type="submit">
      {pending ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
    </button>
  );
}

export default function EditBioPageForm({
  linkId,
  title,
  bio,
  themeColor,
  avatarEmoji,
  fbPixelId,
  template,
  customCode,
  fontFamily,
  images,
  toggles,
  reviews,
  faq,
}: {
  linkId: string;
  title: string;
  bio: string;
  themeColor: string;
  avatarEmoji: string;
  fbPixelId: string;
  template: string;
  customCode: string;
  fontFamily: string;
  images: string[];
  toggles: Toggles;
  reviews: Review[];
  faq: Faq[];
}) {
  const [state, formAction] = useFormState(updateBioPageAction, {});
  const reviewRows = [...reviews, ...Array(5).fill({ name: "", text: "" })].slice(0, 5);
  const faqRows = [...faq, ...Array(6).fill({ q: "", a: "" })].slice(0, 6);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="linkId" value={linkId} />

      <div className="card grid gap-3 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-mint/80 sm:col-span-2">ข้อมูลพื้นฐาน</h2>
        <div>
          <label className="label" htmlFor="template">เทมเพลต</label>
          <select className="input" id="template" name="template" defaultValue={template}>
            <option value="classic">มาตรฐาน</option>
            <option value="service">ธุรกิจบริการ</option>
            <option value="course">คอร์สเรียนออนไลน์</option>
            <option value="custom">คัสต้อม (กำหนดเอง)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="fontFamily">ฟอนต์ (เฉพาะเทมเพลตคอร์สเรียน)</label>
          <select className="input" id="fontFamily" name="fontFamily" defaultValue={fontFamily}>
            <option value="">ค่าเริ่มต้น</option>
            {FONT_OPTIONS.filter(Boolean).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="title">ชื่อหน้า</label>
          <input className="input" id="title" name="title" defaultValue={title} />
        </div>
        <div>
          <label className="label" htmlFor="avatarEmoji">ไอคอน (emoji)</label>
          <input className="input" id="avatarEmoji" name="avatarEmoji" defaultValue={avatarEmoji} maxLength={2} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="bio">คำโปรย</label>
          <input className="input" id="bio" name="bio" defaultValue={bio} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">สีธีม</label>
          <ColorSwatches name="themeColor" defaultValue={themeColor} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="fbPixelId">Facebook Pixel ID (ถ้ามี)</label>
          <input
            className="input"
            id="fbPixelId"
            name="fbPixelId"
            defaultValue={fbPixelId}
            placeholder="123456789012345"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-mint/80">ส่วนที่แสดงในหน้า (เทมเพลตคอร์สเรียน)</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {([
            ["carousel", "แกลเลอรีรูปภาพ"],
            ["quiz", "แบบทดสอบเลือกเส้นทาง"],
            ["countdown", "นับถอยหลัง"],
            ["reviews", "รีวิว"],
            ["faq", "คำถามที่พบบ่อย"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-lg border border-accent/15 px-3 py-2 text-sm">
              <input type="checkbox" name={`toggle_${key}`} defaultChecked={toggles[key]} className="accent-accent" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-mint/80">โค้ดกำหนดเอง (Custom Code)</h2>
        <textarea
          className="input font-mono text-xs"
          name="customCode"
          rows={5}
          defaultValue={customCode}
          placeholder="<script>...</script> หรือโค้ด embed อื่น ๆ"
          maxLength={20000}
        />
        <p className="mt-1 text-xs text-mint/40">
          โค้ดนี้จะถูกฝังลงในหน้า Bio ของคุณตรง ๆ และรันจริงกับผู้เข้าชมทุกคน
          ใส่เฉพาะโค้ดที่คุณเขียนเองหรือเชื่อถือแหล่งที่มาเท่านั้น
          หากเลือกเทมเพลต &quot;คัสต้อม&quot; โค้ดนี้จะกลายเป็นเนื้อหาหลักของทั้งหน้า
        </p>
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-mint/80">รูปภาพ (สูงสุด 6 รูปรวม, ไม่เกิน 5MB ต่อรูป)</h2>
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url) => (
              <label key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <span className="mt-1 flex items-center gap-1 text-xs text-mint/50">
                  <input type="checkbox" name="removeImages" value={url} className="accent-red-500" />
                  ลบรูปนี้
                </span>
              </label>
            ))}
          </div>
        )}
        <label className="label" htmlFor="images">เพิ่มรูปใหม่</label>
        <input className="input" id="images" name="images" type="file" accept="image/*" multiple />
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-mint/80">รีวิว (เว้นว่างแถวที่ไม่ใช้)</h2>
        <div className="space-y-3">
          {reviewRows.map((r, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
              <input className="input" name={`review_name_${i}`} defaultValue={r.name} placeholder="ชื่อผู้รีวิว" />
              <input className="input" name={`review_text_${i}`} defaultValue={r.text} placeholder="ข้อความรีวิว" />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-mint/80">คำถามที่พบบ่อย (เว้นว่างแถวที่ไม่ใช้)</h2>
        <div className="space-y-3">
          {faqRows.map((f, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-accent/10 p-3">
              <input className="input" name={`faq_q_${i}`} defaultValue={f.q} placeholder="คำถาม" />
              <textarea className="input" name={`faq_a_${i}`} defaultValue={f.a} placeholder="คำตอบ" rows={2} />
            </div>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <SaveButton />
    </form>
  );
}

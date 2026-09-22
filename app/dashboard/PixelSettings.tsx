"use client";

import { useState } from "react";
import { parseMetaPixelIds } from "@/lib/meta-pixel";

export default function PixelSettings({ initialCode, initialEnabled }: { initialCode: string; initialEnabled: boolean }) {
  const [code, setCode] = useState(initialCode);
  const [enabled, setEnabled] = useState(initialEnabled);
  let ids: string[] = [];
  let error = "";
  try { ids = parseMetaPixelIds(code); } catch (e) { error = (e as Error).message; }
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <p>คัดลอก Base Code จาก Meta Events Manager แล้ววางในช่องด้านล่าง หรือกรอก Pixel ID แยกบรรทัด</p>
      <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        เปิดใช้งาน Meta Pixel
      </label>
      <input type="hidden" name="fbPixelEnabled" value={enabled ? "on" : "off"} />
      <label htmlFor="meta-pixel-code">Meta Pixel Base Code หรือ Pixel ID</label>
      <textarea id="meta-pixel-code" name="fbPixelCode" value={code} onChange={(e) => setCode(e.target.value)} rows={10} maxLength={20000} spellCheck={false}
        placeholder={"<!-- Meta Pixel Code -->\n<script>\n...\nfbq('init', '123456789012345');\nfbq('track', 'PageView');\n</script>"}
        aria-invalid={Boolean(error)} aria-describedby="meta-pixel-status" style={{ width: "100%", padding: "14px", borderRadius: "10px", background: "var(--surface-field)", color: "var(--text-body)", border: "1px solid var(--border-field)", fontFamily: "monospace", resize: "vertical" }} />
      <p id="meta-pixel-status" role="status" style={{ color: error ? "var(--text-danger)" : "var(--text-accent)" }}>
        {error || (ids.length ? `พบ Pixel ID: ${ids.join(", ")} — ${enabled ? "พร้อมใช้งานเมื่อบันทึก" : "ปิดใช้งานเมื่อบันทึก"}` : "ยังไม่ได้ตั้งค่า Pixel")}
      </p>
      <p>ระบบใช้ Pixel ID จากโค้ดเพื่อติดตั้งบนหน้าเซลเพจ และส่ง PageView อัตโนมัติ โดยรวม ID ที่ซ้ำกันให้เหลือครั้งเดียว โค้ดเสริมหรือ Custom Event ในช่องนี้จะไม่ถูกเรียกใช้</p>
      <p>หลังบันทึก เปิดหน้าเซลเพจแล้วตรวจสอบใน Meta Events Manager → Test Events การปิดใช้งานจะหยุด Pixel เมื่อโหลดหน้าใหม่ โดยเก็บโค้ดไว้ให้เปิดใช้ได้อีก</p>
    </div>
  );
}

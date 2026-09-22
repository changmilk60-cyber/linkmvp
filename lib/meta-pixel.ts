// Treat pasted code as data only: never execute user-supplied JavaScript.
export function parseMetaPixelIds(input: string): string[] {
  const value = input.trim();
  if (!value) return [];
  if (value.length > 20000) throw new Error("โค้ด Pixel ยาวเกิน 20,000 ตัวอักษร");
  if (/^[\d\s,]+$/.test(value)) {
    const ids = value.split(/[\s,]+/).filter(Boolean);
    if (ids.some((id) => !/^\d{5,20}$/.test(id))) throw new Error("Pixel ID ต้องเป็นตัวเลข 5–20 หลัก");
    return [...new Set(ids)];
  }
  const ids = [...value.matchAll(/\bfbq\s*\(\s*['"]init['"]\s*,\s*['"](\d{5,20})['"]\s*\)/g)].map((m) => m[1]);
  if (!ids.length) throw new Error("ไม่พบ Pixel ID ในโค้ด กรุณาวาง Meta Pixel Base Code ที่มี fbq('init', 'Pixel ID') หรือกรอกเฉพาะ Pixel ID");
  return [...new Set(ids)];
}

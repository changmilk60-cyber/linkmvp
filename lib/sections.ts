// The sales-page section types a merchant can reorder / enable-disable
// from the "จัดเรียง Section" panel. Each Page.sections column stores an
// array of these, in display order — array order *is* the sort order.

export type SectionKey =
  | "online_users"
  | "gif_signup_button"
  | "bonus_total"
  | "top_games"
  | "hero_image"
  | "text_block_1"
  | "text_block_2"
  | "player_ranking"
  | "withdraw_feed"
  | "prizes"
  | "announcements"
  | "image_slider"
  | "reviews"
  | "signup_line_buttons";

export type SectionEntry = {
  key: SectionKey;
  enabled: boolean;
  data: Record<string, unknown>;
};

export const SECTION_META: Record<SectionKey, { icon: string; title: string }> = {
  online_users: { icon: "👥", title: "จำนวนผู้ใช้ออนไลน์" },
  gif_signup_button: { icon: "🎯", title: "ปุ่ม GIF สมัคร" },
  bonus_total: { icon: "💰", title: "ยอดโบนัสสะสม" },
  top_games: { icon: "🎮", title: "เกมยอดนิยม" },
  hero_image: { icon: "🖼", title: "รูปหลัก" },
  text_block_1: { icon: "📝", title: "ข้อความ 1" },
  text_block_2: { icon: "📝", title: "ข้อความ 2" },
  player_ranking: { icon: "🏆", title: "อันดับผู้เล่น" },
  withdraw_feed: { icon: "🏦", title: "รายการถอนล่าสุด (สุ่มอัตโนมัติ)" },
  prizes: { icon: "🎁", title: "ของรางวัล" },
  announcements: { icon: "📣", title: "ประกาศ / ข่าว" },
  image_slider: { icon: "🎞", title: "สไลด์รูป" },
  reviews: { icon: "⭐", title: "รีวิวแบบสุ่ม" },
  signup_line_buttons: { icon: "⚪", title: "ปุ่มสมัคร + LINE" },
};

export type FeedBank = { name: string; logoUrl: string; color: string };

// Names + circle colours only — merchants upload their own logo images.
export const FEED_BANK_SLOTS = 6;
export const DEFAULT_FEED_BANKS: FeedBank[] = [
  { name: "ไทยพาณิชย์", logoUrl: "", color: "#4e2a84" },
  { name: "กสิกรไทย", logoUrl: "", color: "#138f2d" },
  { name: "กรุงเทพ", logoUrl: "", color: "#1e4598" },
  { name: "กรุงไทย", logoUrl: "", color: "#01a6e5" },
  { name: "ทีทีบี", logoUrl: "", color: "#1279be" },
  { name: "กรุงศรี", logoUrl: "", color: "#c8952f" },
];

export const DEFAULT_SECTIONS: SectionEntry[] = [
  { key: "online_users", enabled: true, data: { min: 20, max: 80 } },
  { key: "gif_signup_button", enabled: true, data: { imageUrl: "", linkUrl: "" } },
  { key: "bonus_total", enabled: true, data: { baseAmount: 128500, perHourIncrement: 340 } },
  {
    key: "top_games",
    enabled: true,
    data: { games: [{ name: "", imageUrl: "" }, { name: "", imageUrl: "" }, { name: "", imageUrl: "" }] },
  },
  { key: "hero_image", enabled: false, data: { imageUrl: "" } },
  { key: "text_block_1", enabled: false, data: { heading: "", body: "" } },
  { key: "text_block_2", enabled: false, data: { heading: "", body: "" } },
  { key: "player_ranking", enabled: true, data: { players: [] as { name: string; amount: string }[] } },
  {
    key: "withdraw_feed",
    enabled: false,
    data: {
      title: "AUTO SYSTEM • ยืนยันยอดแล้ว",
      statusLabel: "สำเร็จแล้ว",
      minAmount: 1000,
      maxAmount: 20000,
      rows: 5,
      intervalSec: 6,
      banks: DEFAULT_FEED_BANKS,
    },
  },
  { key: "prizes", enabled: true, data: { items: [] as { label: string; imageUrl: string }[] } },
  { key: "announcements", enabled: false, data: { items: [] as string[] } },
  { key: "image_slider", enabled: false, data: { images: ["", "", "", ""] } },
  { key: "reviews", enabled: true, data: {} },
  { key: "signup_line_buttons", enabled: true, data: { signupUrl: "", lineUrl: "" } },
];

export function parseSections(json: string | null | undefined): SectionEntry[] {
  if (!json) return DEFAULT_SECTIONS;
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SECTIONS;
    // Merge in any section keys missing from a stored (older) array so newly
    // added section types still show up in the admin.
    const seen = new Set(parsed.map((s: SectionEntry) => s.key));
    const missing = DEFAULT_SECTIONS.filter((s) => !seen.has(s.key));
    return [...parsed, ...missing];
  } catch {
    return DEFAULT_SECTIONS;
  }
}

export const THEME_PRESETS: { key: string; name: string; icon: string; base: string; primary: string; accent: string }[] = [
  { key: "black-gold", name: "ดำทอง", icon: "⚫🟡", base: "#1a1200", primary: "#f5c400", accent: "#ffd700" },
  { key: "pink-sky", name: "ชมพูฟ้า", icon: "🩷🩵", base: "#21143a", primary: "#ff9bd7", accent: "#7fdcff" },
  { key: "red-black", name: "แดงดำ", icon: "🔴⚫", base: "#1a0000", primary: "#cc0000", accent: "#ff6666" },
  { key: "green-black", name: "เขียวดำ", icon: "🟢⚫", base: "#001a08", primary: "#00cc66", accent: "#00ff88" },
  { key: "purple-gold", name: "ม่วงทอง", icon: "💜🟡", base: "#160d2e", primary: "#9b59e8", accent: "#f5c400" },
  { key: "blue-white", name: "น้ำเงินขาว", icon: "🔵⚪", base: "#020d1f", primary: "#1e6fff", accent: "#e0f0ff" },
  { key: "orange-black", name: "ส้มดำ", icon: "🧡⚫", base: "#1c0b00", primary: "#ff7a00", accent: "#ffc266" },
  { key: "cyber-sky", name: "ฟ้าไซเบอร์", icon: "🩵🔵", base: "#00131d", primary: "#00d9ff", accent: "#7af5ff" },
  { key: "rose-gold", name: "โรสโกลด์", icon: "🌹✨", base: "#251116", primary: "#d88991", accent: "#ffd0b8" },
  { key: "teal-gold", name: "ทีลทอง", icon: "🌊🟡", base: "#00201e", primary: "#00a89d", accent: "#e4bd59" },
  { key: "silver-black", name: "เงินดำ", icon: "⚪⚫", base: "#101216", primary: "#aeb6c2", accent: "#eef3f8" },
  { key: "wine-gold", name: "ไวน์แดงทอง", icon: "🍷🟡", base: "#260611", primary: "#8f1839", accent: "#d8ad4c" },
];

export function themeFor(key: string) {
  return THEME_PRESETS.find((t) => t.key === key) || THEME_PRESETS[3];
}

export function todayUTC(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function lastNDays(n: number) {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(todayUTC(d));
  }
  return out;
}

"use server";

import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getSessionUserId,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const SLUG_RE = /^[a-zA-Z0-9_-]{3,32}$/;
const FB_PIXEL_RE = /^\d{5,20}$/;
const BIO_TEMPLATES = ["classic", "service", "course", "custom"] as const;
const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type ActionState = { error?: string; success?: boolean };

async function saveUploadedImages(files: File[]): Promise<string[] | { error: string }> {
  const real = files.filter((f) => f && f.size > 0);
  if (real.length === 0) return [];
  if (real.length > MAX_IMAGES) {
    return { error: `อัปโหลดรูปได้ไม่เกิน ${MAX_IMAGES} รูป` };
  }

  const urls: string[] = [];
  await mkdir(UPLOAD_DIR, { recursive: true });

  for (const file of real) {
    if (!file.type.startsWith("image/")) {
      return { error: "อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น" };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: "แต่ละรูปต้องมีขนาดไม่เกิน 5MB" };
    }
    const ext = (file.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
    const filename = `${nanoid(12)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    urls.push(`/uploads/${filename}`);
  }

  return urls;
}

function cleanSlug(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

// ---------- AUTH ----------

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password || password.length < 6) {
    return { error: "กรอกอีเมลและรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "ไม่พบบัญชีนี้" };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "รหัสผ่านไม่ถูกต้อง" };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

// ---------- SHORT LINKS ----------

export async function createShortLinkAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const targetUrl = String(formData.get("targetUrl") || "").trim();
  let slug = cleanSlug(String(formData.get("slug") || ""));

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return { error: "ใส่ URL ปลายทางให้ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)" };
  }

  if (!slug) {
    slug = nanoid(7);
  } else if (!SLUG_RE.test(slug)) {
    return { error: "ตัวย่อลิงก์ใช้ได้เฉพาะ a-z, 0-9, - และ _ (3-32 ตัวอักษร)" };
  }

  const exists = await prisma.link.findUnique({ where: { slug } });
  if (exists) return { error: "ตัวย่อลิงก์นี้ถูกใช้ไปแล้ว ลองอันอื่น" };

  await prisma.link.create({
    data: { slug, type: "SHORT", targetUrl, userId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ---------- BIO PAGES ----------

export async function createBioPageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  let slug = cleanSlug(String(formData.get("slug") || ""));
  const title = String(formData.get("title") || "").trim() || "หน้าของฉัน";
  const bio = String(formData.get("bio") || "").trim();
  const themeColor = String(formData.get("themeColor") || "#3d5afe");
  const avatarEmoji = String(formData.get("avatarEmoji") || "✨");
  const fbPixelId = String(formData.get("fbPixelId") || "").trim();
  const templateInput = String(formData.get("template") || "classic");
  const template = (BIO_TEMPLATES as readonly string[]).includes(templateInput)
    ? templateInput
    : "classic";
  const customCode = String(formData.get("customCode") || "").trim();

  if (!slug) return { error: "ใส่ตัวย่อ URL สำหรับหน้า Bio" };
  if (!SLUG_RE.test(slug)) {
    return { error: "ตัวย่อ URL ใช้ได้เฉพาะ a-z, 0-9, - และ _ (3-32 ตัวอักษร)" };
  }
  if (fbPixelId && !FB_PIXEL_RE.test(fbPixelId)) {
    return { error: "Facebook Pixel ID ต้องเป็นตัวเลขเท่านั้น (5-20 หลัก)" };
  }
  if (customCode.length > 20000) {
    return { error: "โค้ดกำหนดเองยาวเกินไป (ไม่เกิน 20,000 ตัวอักษร)" };
  }

  const exists = await prisma.link.findUnique({ where: { slug } });
  if (exists) return { error: "ตัวย่อ URL นี้ถูกใช้ไปแล้ว ลองอันอื่น" };

  const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);
  const savedImages = await saveUploadedImages(imageFiles);
  if (!Array.isArray(savedImages)) return savedImages;

  await prisma.link.create({
    data: {
      slug,
      type: "BIO",
      title,
      bio,
      themeColor,
      avatarEmoji,
      blocks: "[]",
      fbPixelId: fbPixelId || null,
      template,
      customCode: customCode || null,
      images: savedImages.length > 0 ? JSON.stringify(savedImages) : null,
      userId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const TOGGLE_KEYS = [
  "carousel",
  "quiz",
  "countdown",
  "reviews",
  "faq",
  "promotions",
  "pricing",
  "contact",
] as const;

export async function updateBioPageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const linkId = String(formData.get("linkId") || "");
  const existing = await prisma.link.findFirst({ where: { id: linkId, userId, type: "BIO" } });
  if (!existing) return { error: "ไม่พบหน้านี้" };

  const title = String(formData.get("title") || "").trim() || "หน้าของฉัน";
  const bio = String(formData.get("bio") || "").trim();
  const themeColor = String(formData.get("themeColor") || existing.themeColor || "#3d5afe");
  const avatarEmoji = String(formData.get("avatarEmoji") || "✨");
  const fbPixelId = String(formData.get("fbPixelId") || "").trim();
  const templateInput = String(formData.get("template") || existing.template || "classic");
  const template = (BIO_TEMPLATES as readonly string[]).includes(templateInput)
    ? templateInput
    : "classic";
  const customCode = String(formData.get("customCode") || "").trim();
  const fontFamily = String(formData.get("fontFamily") || "").trim();

  if (fbPixelId && !FB_PIXEL_RE.test(fbPixelId)) {
    return { error: "Facebook Pixel ID ต้องเป็นตัวเลขเท่านั้น (5-20 หลัก)" };
  }
  if (customCode.length > 20000) {
    return { error: "โค้ดกำหนดเองยาวเกินไป (ไม่เกิน 20,000 ตัวอักษร)" };
  }

  const sectionToggles: Record<string, boolean> = {};
  for (const key of TOGGLE_KEYS) {
    sectionToggles[key] = formData.get(`toggle_${key}`) === "on";
  }

  const reviews: { name: string; text: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const name = String(formData.get(`review_name_${i}`) || "").trim();
    const text = String(formData.get(`review_text_${i}`) || "").trim();
    if (name || text) reviews.push({ name: name || "ผู้เรียน", text });
  }

  const faq: { q: string; a: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const q = String(formData.get(`faq_q_${i}`) || "").trim();
    const a = String(formData.get(`faq_a_${i}`) || "").trim();
    if (q || a) faq.push({ q, a });
  }

  const promotions: { label: string; detail: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const label = String(formData.get(`promo_label_${i}`) || "").trim();
    const detail = String(formData.get(`promo_detail_${i}`) || "").trim();
    if (label || detail) promotions.push({ label, detail });
  }

  const pricing: { name: string; price: string; features: string; highlight: boolean }[] = [];
  for (let i = 0; i < 3; i++) {
    const name = String(formData.get(`price_name_${i}`) || "").trim();
    const price = String(formData.get(`price_price_${i}`) || "").trim();
    const features = String(formData.get(`price_features_${i}`) || "").trim();
    const highlight = formData.get(`price_highlight_${i}`) === "on";
    if (name || price || features) pricing.push({ name, price, features, highlight });
  }

  const contact = {
    phone: String(formData.get("contact_phone") || "").trim(),
    line: String(formData.get("contact_line") || "").trim(),
    email: String(formData.get("contact_email") || "").trim(),
    address: String(formData.get("contact_address") || "").trim(),
  };
  const hasContact = Object.values(contact).some(Boolean);

  const newImageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);
  const newSaved = await saveUploadedImages(newImageFiles);
  if (!Array.isArray(newSaved)) return newSaved;
  const existingImages: string[] = existing.images ? JSON.parse(existing.images) : [];
  const removeImages = formData.getAll("removeImages").map(String);
  const keptImages = existingImages.filter((u) => !removeImages.includes(u));
  const allImages = [...keptImages, ...newSaved].slice(0, MAX_IMAGES);

  await prisma.link.update({
    where: { id: linkId },
    data: {
      title,
      bio,
      themeColor,
      avatarEmoji,
      fbPixelId: fbPixelId || null,
      template,
      customCode: customCode || null,
      fontFamily: fontFamily || null,
      sectionToggles: JSON.stringify(sectionToggles),
      reviews: reviews.length > 0 ? JSON.stringify(reviews) : null,
      faq: faq.length > 0 ? JSON.stringify(faq) : null,
      promotions: promotions.length > 0 ? JSON.stringify(promotions) : null,
      pricing: pricing.length > 0 ? JSON.stringify(pricing) : null,
      contact: hasContact ? JSON.stringify(contact) : null,
      images: allImages.length > 0 ? JSON.stringify(allImages) : null,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function addBioBlockAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const linkId = String(formData.get("linkId") || "");
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();

  if (!label || !url || !/^https?:\/\//i.test(url)) {
    return { error: "ใส่ชื่อปุ่มและ URL ให้ถูกต้อง" };
  }

  const link = await prisma.link.findFirst({ where: { id: linkId, userId } });
  if (!link) return { error: "ไม่พบหน้า Bio นี้" };

  const blocks = JSON.parse(link.blocks || "[]");
  blocks.push({ label, url });

  await prisma.link.update({
    where: { id: linkId },
    data: { blocks: JSON.stringify(blocks) },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeBioBlockAction(formData: FormData): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const linkId = String(formData.get("linkId") || "");
  const index = Number(formData.get("index"));

  const link = await prisma.link.findFirst({ where: { id: linkId, userId } });
  if (!link) return;

  const blocks = JSON.parse(link.blocks || "[]");
  blocks.splice(index, 1);

  await prisma.link.update({
    where: { id: linkId },
    data: { blocks: JSON.stringify(blocks) },
  });

  revalidatePath("/dashboard");
}

export async function deleteLinkAction(formData: FormData): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const linkId = String(formData.get("linkId") || "");
  await prisma.link.deleteMany({ where: { id: linkId, userId } });

  revalidatePath("/dashboard");
}

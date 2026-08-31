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

const SLUG_RE = /^[a-zA-Z0-9_-]{3,32}$/;

type ActionState = { error?: string; success?: boolean };

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

  if (!slug) return { error: "ใส่ตัวย่อ URL สำหรับหน้า Bio" };
  if (!SLUG_RE.test(slug)) {
    return { error: "ตัวย่อ URL ใช้ได้เฉพาะ a-z, 0-9, - และ _ (3-32 ตัวอักษร)" };
  }

  const exists = await prisma.link.findUnique({ where: { slug } });
  if (exists) return { error: "ตัวย่อ URL นี้ถูกใช้ไปแล้ว ลองอันอื่น" };

  await prisma.link.create({
    data: {
      slug,
      type: "BIO",
      title,
      bio,
      themeColor,
      avatarEmoji,
      blocks: "[]",
      userId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
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

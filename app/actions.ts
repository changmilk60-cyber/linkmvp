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
import { DEFAULT_SECTIONS, parseSections, type SectionEntry, type SectionKey } from "@/lib/sections";

const SLUG_RE = /^[a-zA-Z0-9_-]{3,32}$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type ActionState = { error?: string; success?: boolean };

function cleanSlug(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 32);
}

async function saveUpload(file: FormDataEntryValue | null): Promise<string | null | { error: string }> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return { error: "อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "แต่ละรูปต้องมีขนาดไม่เกิน 5MB" };
  const ext = (file.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
  const filename = `${nanoid(12)}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

// ---------- AUTH ----------

async function uniqueSlugFromEmail(email: string) {
  const base = cleanSlug(email.split("@")[0] || "page") || "page";
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.page.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password || password.length < 6) {
    return { error: "กรอกอีเมลและรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "อีเมลนี้ถูกใช้งานแล้ว" };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const slug = await uniqueSlugFromEmail(email);
  await prisma.page.create({
    data: {
      slug,
      userId: user.id,
      sections: JSON.stringify(DEFAULT_SECTIONS),
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
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

// Every logged-in user has exactly one Page (the one "หลังบ้านแก้เว็บ" admin
// manages). Older accounts that predate this field, or any edge case where
// creation above didn't run, get one lazily here.
export async function getOrCreateOwnPage(userId: string) {
  const existing = await prisma.page.findFirst({ where: { userId } });
  if (existing) return existing;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const slug = await uniqueSlugFromEmail(user?.email || nanoid(6));
  return prisma.page.create({
    data: { slug, userId, sections: JSON.stringify(DEFAULT_SECTIONS) },
  });
}

// ---------- URL rename ----------

export async function renameSlugAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const pageId = String(formData.get("pageId") || "");
  const newSlugRaw = String(formData.get("newSlug") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const page = await prisma.page.findFirst({ where: { id: pageId, userId } });
  if (!page) return { error: "ไม่พบหน้านี้" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await verifyPassword(confirmPassword, user.passwordHash))) {
    return { error: "รหัสผ่านไม่ถูกต้อง" };
  }

  const newSlug = cleanSlug(newSlugRaw);
  if (!SLUG_RE.test(newSlug)) {
    return { error: "ตัวย่อ URL ใช้ได้เฉพาะ a-z, 0-9, - และ _ (3-32 ตัวอักษร)" };
  }
  if (newSlug === page.slug) return { error: "ชื่อ URL ใหม่ต้องไม่ซ้ำกับชื่อเดิม" };

  const exists = await prisma.page.findUnique({ where: { slug: newSlug } });
  if (exists) return { error: "ตัวย่อ URL นี้ถูกใช้ไปแล้ว ลองอันอื่น" };

  await prisma.page.update({ where: { id: page.id }, data: { slug: newSlug } });
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------- reorder ----------

export async function moveSectionAction(index: number, direction: "up" | "down", formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const pageId = String(formData.get("pageId") || "");
  const page = await prisma.page.findFirst({ where: { id: pageId, userId } });
  if (!page) return;

  const sections = parseSections(page.sections);

  // The arrows live inside the sections form, so its on/off switches come
  // along with the submission — keep them rather than dropping whatever the
  // user just toggled but hasn't pressed Save for yet.
  for (const s of sections) {
    if (formData.has(`section_enabled_${s.key}`)) {
      s.enabled = formData.get(`section_enabled_${s.key}`) === "on";
    }
  }

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sections.length) return;
  [sections[index], sections[swapWith]] = [sections[swapWith], sections[index]];

  await prisma.page.update({ where: { id: page.id }, data: { sections: JSON.stringify(sections) } });
  revalidatePath("/dashboard");
}

// ---------- main settings save (the one big "บันทึกทั้งหมด" form) ----------

const NUM = (fd: FormData, k: string) => {
  const v = Number(fd.get(k));
  return Number.isFinite(v) ? v : undefined;
};
const STR = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v || undefined;
};

export async function saveSettingsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const pageId = String(formData.get("pageId") || "");
  const page = await prisma.page.findFirst({ where: { id: pageId, userId } });
  if (!page) return { error: "ไม่พบหน้านี้" };

  // ---- appearance / main settings ----
  const themePreset = STR(formData, "themePreset") || page.themePreset;
  const tabTitle = STR(formData, "tabTitle") ?? null;
  const ogDescription = STR(formData, "ogDescription") ?? null;
  const capiEventName = formData.get("capiEventName") === "purchase" ? "purchase" : "subscribe";
  const ctaLayout = formData.get("ctaLayout") === "vertical" ? "vertical" : "horizontal";
  const capiAccessToken = STR(formData, "capiAccessToken") ?? null;
  const capiEndpointUrl = STR(formData, "capiEndpointUrl") ?? null;

  const heroHeadline = STR(formData, "heroHeadline") ?? null;
  const heroSubtext = STR(formData, "heroSubtext") ?? null;
  const footerText = STR(formData, "footerText") ?? null;
  const footerTextColor = STR(formData, "footerTextColor") ?? null;

  const fbPixelIdsRaw = String(formData.get("fbPixelIds") || "");
  const fbPixelIds = fbPixelIdsRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => /^\d{5,20}$/.test(s));

  const landingUrl = STR(formData, "landingUrl") ?? null;
  const whitepageRedirectUrl = STR(formData, "whitepageRedirectUrl") ?? null;
  const useSameLandingForAll = formData.get("useSameLandingForAll") === "on";
  const cloakToLandingUrl = formData.get("cloakToLandingUrl") === "on";

  const colorFields = ["primary", "body", "muted", "cta_text", "line_cta_text"] as const;
  const colorOverrides: Record<string, string> = {};
  for (const k of colorFields) {
    const v = STR(formData, `color_${k}`);
    if (v) colorOverrides[k] = v;
  }

  const reviewsTitle = STR(formData, "reviewsTitle") ?? null;
  const reviewsSubtitle = STR(formData, "reviewsSubtitle") ?? null;
  const reviews: { member: string; text: string; stars: string }[] = [];
  for (let i = 0; i < 5; i++) {
    if (formData.get(`review_remove_${i}`) === "on") continue;
    const member = String(formData.get(`review_member_${i}`) || "").trim();
    const text = String(formData.get(`review_text_${i}`) || "").trim();
    const stars = String(formData.get(`review_stars_${i}`) || "5 ดาว");
    if (member || text) reviews.push({ member: member || "สมาชิก", text, stars });
  }

  // ---- image uploads ----
  const uploads: Record<string, string | null> = {};
  for (const field of ["logoUrl", "lineLogoUrl", "ogImage"] as const) {
    const saved = await saveUpload(formData.get(`file_${field}`));
    if (saved && typeof saved === "object") return saved;
    if (saved) uploads[field] = saved;
  }

  // ---- sections ----
  const sections = parseSections(page.sections);
  for (const s of sections) {
    s.enabled = formData.get(`section_enabled_${s.key}`) === "on";
    switch (s.key as SectionKey) {
      case "online_users": {
        s.data = { min: NUM(formData, "section_data_online_users_min") ?? 20, max: NUM(formData, "section_data_online_users_max") ?? 80 };
        break;
      }
      case "bonus_total": {
        s.data = {
          baseAmount: NUM(formData, "section_data_bonus_total_baseAmount") ?? 0,
          perHourIncrement: NUM(formData, "section_data_bonus_total_perHourIncrement") ?? 0,
        };
        break;
      }
      case "gif_signup_button": {
        const img = await saveUpload(formData.get("section_file_gif_signup_button_image"));
        if (img && typeof img === "object") return img;
        s.data = {
          linkUrl: STR(formData, "section_data_gif_signup_button_linkUrl") || "",
          imageUrl: img || (s.data as { imageUrl?: string }).imageUrl || "",
        };
        break;
      }
      case "hero_image": {
        const img = await saveUpload(formData.get("section_file_hero_image_image"));
        if (img && typeof img === "object") return img;
        s.data = { imageUrl: img || (s.data as { imageUrl?: string }).imageUrl || "" };
        break;
      }
      case "text_block_1":
      case "text_block_2": {
        s.data = {
          heading: STR(formData, `section_data_${s.key}_heading`) || "",
          body: STR(formData, `section_data_${s.key}_body`) || "",
        };
        break;
      }
      case "top_games": {
        const games: { name: string; imageUrl: string }[] = [];
        for (let i = 0; i < 3; i++) {
          const img = await saveUpload(formData.get(`section_file_top_games_image_${i}`));
          if (img && typeof img === "object") return img;
          const prev = (s.data as { games?: { name: string; imageUrl: string }[] }).games?.[i];
          games.push({ name: STR(formData, `section_data_top_games_name_${i}`) || "", imageUrl: img || prev?.imageUrl || "" });
        }
        s.data = { games };
        break;
      }
      case "player_ranking": {
        const players: { name: string; amount: string }[] = [];
        for (let i = 0; i < 5; i++) {
          const name = STR(formData, `section_data_player_ranking_name_${i}`);
          const amount = STR(formData, `section_data_player_ranking_amount_${i}`);
          if (name || amount) players.push({ name: name || "", amount: amount || "" });
        }
        s.data = { players };
        break;
      }
      case "prizes": {
        const items: { label: string; imageUrl: string }[] = [];
        for (let i = 0; i < 4; i++) {
          const img = await saveUpload(formData.get(`section_file_prizes_image_${i}`));
          if (img && typeof img === "object") return img;
          const prev = (s.data as { items?: { label: string; imageUrl: string }[] }).items?.[i];
          const label = STR(formData, `section_data_prizes_label_${i}`);
          if (label || img || prev?.imageUrl) items.push({ label: label || "", imageUrl: img || prev?.imageUrl || "" });
        }
        s.data = { items };
        break;
      }
      case "announcements": {
        const items: string[] = [];
        for (let i = 0; i < 5; i++) {
          const t = STR(formData, `section_data_announcements_text_${i}`);
          if (t) items.push(t);
        }
        s.data = { items };
        break;
      }
      case "image_slider": {
        const images: string[] = [];
        for (let i = 0; i < 4; i++) {
          const img = await saveUpload(formData.get(`section_file_image_slider_image_${i}`));
          if (img && typeof img === "object") return img;
          const prev = (s.data as { images?: string[] }).images?.[i];
          images.push(img || prev || "");
        }
        s.data = { images };
        break;
      }
      case "signup_line_buttons": {
        s.data = {
          signupUrl: STR(formData, "section_data_signup_line_buttons_signupUrl") || "",
          lineUrl: STR(formData, "section_data_signup_line_buttons_lineUrl") || "",
        };
        break;
      }
      case "reviews":
        // content lives in the top-level reviews/reviewsTitle fields above
        break;
    }
  }

  await prisma.page.update({
    where: { id: page.id },
    data: {
      themePreset,
      tabTitle,
      ogDescription,
      ...uploads,
      capiEventName,
      ctaLayout,
      capiAccessToken,
      capiEndpointUrl,
      heroHeadline,
      heroSubtext,
      footerText,
      footerTextColor,
      fbPixelIds: fbPixelIds.length ? JSON.stringify(fbPixelIds) : null,
      landingUrl,
      whitepageRedirectUrl,
      useSameLandingForAll,
      cloakToLandingUrl,
      colorOverrides: Object.keys(colorOverrides).length ? JSON.stringify(colorOverrides) : null,
      reviewsTitle,
      reviewsSubtitle,
      reviews: reviews.length ? JSON.stringify(reviews) : null,
      sections: JSON.stringify(sections satisfies SectionEntry[]),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { success: true };
}

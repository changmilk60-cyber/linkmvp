"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin, type SessionUser } from "@/lib/auth";
import { endOfDayUTC, extendBy, fmtDate } from "@/lib/license";

type ActionState = { error?: string; success?: string };

const MAX_EXTEND_DAYS = 3650; // ten years — a typo guard, not a policy

async function audit(
  actor: SessionUser,
  action: string,
  target: { id: string; email: string },
  before?: string | null,
  after?: string | null,
) {
  await prisma.adminAudit.create({
    data: {
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetId: target.id,
      targetEmail: target.email,
      before: before ?? null,
      after: after ?? null,
    },
  });
}

/** Extend or set a page's licence. Both paths go through one action so the
 *  confirmation, the audit entry and the revalidate stay in one place. */
export async function updateLicenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperadmin();

  if (!formData.get("confirm")) {
    return { error: "กรุณาติ๊กยืนยันก่อนบันทึก" };
  }

  const pageId = String(formData.get("pageId") || "");
  const mode = String(formData.get("mode") || "");

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, slug: true, licenseExpiresAt: true, user: { select: { id: true, email: true } } },
  });
  if (!page) return { error: "ไม่พบหน้านี้" };

  const before = page.licenseExpiresAt;
  let after: Date;

  if (mode === "add") {
    const days = Number(formData.get("days"));
    if (!Number.isInteger(days) || days === 0 || Math.abs(days) > MAX_EXTEND_DAYS) {
      return { error: `จำนวนวันต้องเป็นจำนวนเต็ม ไม่เกิน ${MAX_EXTEND_DAYS} วัน` };
    }
    after = extendBy(before, days);
  } else if (mode === "set") {
    const parsed = endOfDayUTC(String(formData.get("date") || ""));
    if (!parsed) return { error: "รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น ปปปป-ดด-วว)" };
    after = parsed;
  } else {
    return { error: "คำสั่งไม่ถูกต้อง" };
  }

  await prisma.page.update({ where: { id: page.id }, data: { licenseExpiresAt: after } });
  await audit(
    actor,
    mode === "add" ? "extend_license" : "set_license",
    page.user,
    fmtDate(before),
    fmtDate(after),
  );

  revalidatePath("/superadmin");
  return { success: `${page.user.email}: ${fmtDate(before)} → ${fmtDate(after)}` };
}

/** Suspend or restore an account. Never deletes: removing a User cascades to
 *  their Page and every Visit row, and that cannot be undone. */
export async function setDisabledAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperadmin();

  const userId = String(formData.get("userId") || "");
  const disabled = String(formData.get("disabled")) === "true";

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, disabled: true },
  });
  if (!target) return { error: "ไม่พบผู้ใช้นี้" };

  // Locking yourself out would leave the system with no way back in.
  if (target.id === actor.id) {
    return { error: "ระงับบัญชีตัวเองไม่ได้" };
  }
  if (target.role === "superadmin" && disabled) {
    return { error: "ระงับบัญชี superadmin ด้วยกันไม่ได้ — ถอดสิทธิ์ที่ฐานข้อมูลก่อน" };
  }
  if (target.disabled === disabled) {
    return { error: "สถานะเป็นแบบนี้อยู่แล้ว" };
  }

  await prisma.user.update({ where: { id: target.id }, data: { disabled } });
  await audit(actor, disabled ? "disable" : "enable", target, String(target.disabled), String(disabled));

  revalidatePath("/superadmin");
  return { success: `${target.email}: ${disabled ? "ระงับการใช้งานแล้ว" : "ปลดระงับแล้ว"}` };
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { todayUTC } from "@/lib/sections";

const KINDS = new Set(["view", "click_signup", "click_line"]);
const VID_COOKIE = "sc_vid";

export async function POST(req: Request) {
  const { slug, kind } = (await req.json().catch(() => ({}))) as { slug?: string; kind?: string };
  if (!slug || !kind || !KINDS.has(kind)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const page = await prisma.page.findUnique({ where: { slug }, select: { id: true } });
  if (!page) return NextResponse.json({ ok: false }, { status: 404 });

  const jar = cookies();
  let vid = jar.get(VID_COOKIE)?.value;
  const res = NextResponse.json({ ok: true });
  if (!vid) {
    vid = nanoid(16);
    res.cookies.set(VID_COOKIE, vid, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
  }

  await prisma.visit.create({
    data: { pageId: page.id, day: todayUTC(), kind, visitorId: vid },
  });

  return res;
}

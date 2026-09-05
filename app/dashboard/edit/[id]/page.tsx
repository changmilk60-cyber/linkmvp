import { getSessionUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditBioPageForm from "./EditBioPageForm";

const DEFAULT_TOGGLES = { carousel: true, quiz: true, countdown: true, reviews: true, faq: true };

export default async function EditBioPagePage({ params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const page = await prisma.link.findFirst({
    where: { id: params.id, userId, type: "BIO" },
  });
  if (!page) notFound();

  const toggles = page.sectionToggles
    ? { ...DEFAULT_TOGGLES, ...JSON.parse(page.sectionToggles) }
    : DEFAULT_TOGGLES;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">แก้ไขหน้า Bio</h1>
        <Link href="/dashboard" className="btn btn-outline">กลับแดชบอร์ด</Link>
      </div>

      <EditBioPageForm
        linkId={page.id}
        title={page.title || ""}
        bio={page.bio || ""}
        themeColor={page.themeColor || "#3d5afe"}
        avatarEmoji={page.avatarEmoji || "✨"}
        fbPixelId={page.fbPixelId || ""}
        template={page.template || "classic"}
        customCode={page.customCode || ""}
        fontFamily={page.fontFamily || ""}
        images={page.images ? JSON.parse(page.images) : []}
        toggles={toggles}
        reviews={page.reviews ? JSON.parse(page.reviews) : []}
        faq={page.faq ? JSON.parse(page.faq) : []}
      />
    </main>
  );
}

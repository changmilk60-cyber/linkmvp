import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const link = await prisma.link.findUnique({ where: { slug: params.slug } });

  if (!link) notFound();

  // fire-and-forget click increment
  prisma.link
    .update({ where: { id: link.id }, data: { clicks: { increment: 1 } } })
    .catch(() => {});

  if (link.type === "SHORT") {
    redirect(link.targetUrl || "/");
  }

  // BIO page render
  const blocks: { label: string; url: string }[] = JSON.parse(
    link.blocks || "[]"
  );
  const theme = link.themeColor || "#3d5afe";

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-16"
      style={{ background: `linear-gradient(180deg, ${theme}14, #fff 30%)` }}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-sm"
        style={{ background: theme + "22" }}
      >
        {link.avatarEmoji || "✨"}
      </div>
      <h1 className="mt-4 text-xl font-bold" style={{ color: theme }}>
        {link.title}
      </h1>
      {link.bio && <p className="mt-1 text-center text-sm text-ink/60">{link.bio}</p>}

      <div className="mt-8 w-full space-y-3">
        {blocks.map((b, i) => (
          <a
            key={i}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl px-4 py-3.5 text-center font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: theme }}
          >
            {b.label}
          </a>
        ))}
        {blocks.length === 0 && (
          <p className="text-center text-sm text-ink/40">ยังไม่มีลิงก์ในหน้านี้</p>
        )}
      </div>

      <p className="mt-16 text-xs text-ink/30">สร้างด้วย LinkMVP</p>
    </main>
  );
}

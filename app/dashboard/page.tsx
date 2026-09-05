import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions";
import NewShortLinkForm from "./NewShortLinkForm";
import NewBioPageForm from "./NewBioPageForm";
import BioPageCard from "./BioPageCard";
import DeleteButton from "./DeleteButton";
import CopyButton from "./CopyButton";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const shortLinks = links.filter((l) => l.type === "SHORT");
  const bioPages = links.filter((l) => l.type === "BIO");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const stats = [
    { label: "ลิงก์ทั้งหมด", value: links.length },
    { label: "ย่อลิงก์", value: shortLinks.length },
    { label: "หน้า Bio", value: bioPages.length },
    { label: "คลิกรวม", value: totalClicks },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <form action={logoutAction}>
          <button className="btn btn-outline" type="submit">ออกจากระบบ</button>
        </form>
      </div>

      {/* STATS */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-extrabold text-accent">{s.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-mint/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* SHORT LINKS */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold">ย่อลิงก์</h2>
        <div className="card mb-4">
          <NewShortLinkForm />
        </div>
        <div className="space-y-2">
          {shortLinks.length === 0 && (
            <p className="text-sm text-mint/50">ยังไม่มีลิงก์ที่ย่อไว้</p>
          )}
          {shortLinks.map((l) => (
            <div key={l.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-accent">
                    {baseUrl}/{l.slug}
                  </span>
                  <CopyButton text={`${baseUrl}/${l.slug}`} />
                </div>
                <p className="truncate text-sm text-mint/50">{l.targetUrl}</p>
                <p className="mt-1 text-xs text-mint/40">คลิก {l.clicks} ครั้ง</p>
              </div>
              <DeleteButton linkId={l.id} />
            </div>
          ))}
        </div>
      </section>

      {/* BIO PAGES */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">หน้า Bio link</h2>
        <div className="card mb-4">
          <NewBioPageForm />
        </div>
        <div className="space-y-4">
          {bioPages.length === 0 && (
            <p className="text-sm text-mint/50">ยังไม่มีหน้า Bio</p>
          )}
          {bioPages.map((p) => (
            <BioPageCard key={p.id} page={p} baseUrl={baseUrl} />
          ))}
        </div>
      </section>
    </main>
  );
}

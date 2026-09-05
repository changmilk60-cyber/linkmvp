"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addBioBlockAction, removeBioBlockAction } from "@/app/actions";
import DeleteButton from "./DeleteButton";
import CopyButton from "./CopyButton";

type Block = { label: string; url: string };
type PageLite = {
  id: string;
  slug: string;
  title: string | null;
  bio: string | null;
  themeColor: string | null;
  avatarEmoji: string | null;
  blocks: string | null;
  clicks: number;
};

function AddBlockButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-outline shrink-0" disabled={pending} type="submit">
      {pending ? "..." : "+ เพิ่มปุ่ม"}
    </button>
  );
}

export default function BioPageCard({
  page,
  baseUrl,
}: {
  page: PageLite;
  baseUrl: string;
}) {
  const [addState, addAction] = useFormState(addBioBlockAction, {});
  const blocks: Block[] = JSON.parse(page.blocks || "[]");
  const link = `${baseUrl}/${page.slug}`;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
            style={{ background: (page.themeColor || "#3d5afe") + "22" }}
          >
            {page.avatarEmoji || "✨"}
          </div>
          <div>
            <p className="font-semibold">{page.title}</p>
            <div className="flex items-center gap-2">
              <a href={link} target="_blank" className="text-sm text-accent">
                {link}
              </a>
              <CopyButton text={link} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={`/dashboard/edit/${page.id}`}
            className="rounded-lg px-2 py-1 text-sm text-accent hover:bg-accent/10"
          >
            แก้ไข
          </a>
          <DeleteButton linkId={page.id} />
        </div>
      </div>

      <p className="mt-2 text-xs text-mint/40">เข้าชม {page.clicks} ครั้ง</p>

      <div className="mt-4 space-y-2">
        {blocks.map((b, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-mint/10 px-3 py-2 text-sm">
            <span className="truncate">
              <span className="font-medium">{b.label}</span>{" "}
              <span className="text-mint/40">— {b.url}</span>
            </span>
            <form action={removeBioBlockAction}>
              <input type="hidden" name="linkId" value={page.id} />
              <input type="hidden" name="index" value={i} />
              <button className="text-xs text-red-400 hover:underline" type="submit">
                ลบ
              </button>
            </form>
          </div>
        ))}
        {blocks.length === 0 && (
          <p className="text-sm text-mint/40">ยังไม่มีปุ่มลิงก์ในหน้านี้</p>
        )}
      </div>

      <form action={addAction} className="mt-3 flex gap-2">
        <input type="hidden" name="linkId" value={page.id} />
        <input className="input" name="label" placeholder="ชื่อปุ่ม เช่น Instagram" required />
        <input className="input" name="url" placeholder="https://..." required />
        <AddBlockButton />
      </form>
      {addState?.error && <p className="mt-1 text-sm text-red-400">{addState.error}</p>}
    </div>
  );
}

"use client";

import { deleteLinkAction } from "@/app/actions";

export default function DeleteButton({ linkId }: { linkId: string }) {
  return (
    <form
      action={deleteLinkAction}
      onSubmit={(e) => {
        if (!confirm("ลบลิงก์นี้ใช่ไหม?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="linkId" value={linkId} />
      <button
        type="submit"
        className="shrink-0 rounded-lg px-2 py-1 text-sm text-ink/40 hover:bg-red-50 hover:text-red-600"
      >
        ลบ
      </button>
    </form>
  );
}

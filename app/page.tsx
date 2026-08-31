import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="mb-4 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60">
        MVP · ย่อลิงก์ + หน้า Bio
      </span>
      <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
        ย่อลิงก์ และสร้างหน้า Bio
        <br />
        ของคุณเองใน 1 นาที
      </h1>
      <p className="mt-4 max-w-md text-ink/60">
        เครื่องมือจัดการลิงก์เบื้องต้น: ย่อ URL แบบกำหนดชื่อเองได้ และสร้างหน้ารวมลิงก์
        (Bio page) พร้อมนับยอดคลิก
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="btn btn-primary">
          เริ่มใช้งานฟรี
        </Link>
        <Link href="/login" className="btn btn-outline">
          เข้าสู่ระบบ
        </Link>
      </div>
    </main>
  );
}

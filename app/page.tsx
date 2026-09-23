import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button, Pill } from "@/components/ds";

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center", gap: "16px" }}>
      <Pill tone="soft" icon="⚡">linkmvp</Pill>
      <h1 style={{ margin: 0, maxWidth: "800px", font: "var(--fw-bold) clamp(26px, 4vw, 36px)/1.4 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>
        เครื่องมือจัดการเซลเพจครบวงจร: ย่อลิ้ง ปรับแต่งหน้า ไบโอ สร้าง เซลเพจ บริการ บอทไลน์ เพื่อธุรกิจของคุณ
      </h1>
      <p style={{ margin: 0, maxWidth: "440px", font: "var(--text-body-default)", color: "var(--text-muted)" }}>
        จัดการ Section, โทนสี, Pixel, รีวิว และสถิติผู้เข้าชม — กดบันทึกครั้งเดียวใช้ได้ทั้งเว็บ
      </p>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <Link href="/register"><Button variant="primary">เริ่มใช้งาน</Button></Link>
        <Link href="/login"><Button variant="ghost">เข้าสู่ระบบ</Button></Link>
      </div>
    </main>
  );
}

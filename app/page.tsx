import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button, Pill } from "@/components/ds";

export default async function Home() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", background: "var(--surface-page)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center", gap: "16px" }}>
      <Pill tone="soft" icon="⚡">PageVIP Pro</Pill>
      <h1 style={{ margin: 0, maxWidth: "560px", font: "var(--fw-bold) 36px/1.25 var(--font-sans)", color: "var(--text-primary)" }}>
        สร้างและแก้หน้าเซลเพจของคุณ<br />จากหลังบ้านเดียว
      </h1>
      <p style={{ margin: 0, maxWidth: "440px", font: "var(--text-body-default)", color: "var(--text-muted)" }}>
        จัดการ Section, โทนสี, Pixel, รีวิว และสถิติผู้เข้าชม — กดบันทึกครั้งเดียวใช้ได้ทั้งเว็บ
      </p>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <Link href="/register"><Button variant="primary">เริ่มใช้งานฟรี</Button></Link>
        <Link href="/login"><Button variant="ghost">เข้าสู่ระบบ</Button></Link>
      </div>
    </main>
  );
}

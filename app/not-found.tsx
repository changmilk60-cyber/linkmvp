import Link from "next/link";

// Shown for any address that does not exist — including a sales-page link whose
// owner has since renamed it. Plain and calm: a visitor from an ad should see
// clearly that the page is gone, not a blank or an English framework message.
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#050b14", color: "#e8f1f8", fontFamily: "Kanit, 'Noto Sans Thai', system-ui, sans-serif", textAlign: "center" }}>
      <div>
        <p style={{ margin: 0, fontSize: "clamp(72px, 22vw, 140px)", fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", color: "#5cd6ff" }}>404</p>
        <h1 style={{ margin: "12px 0 6px", fontSize: "22px", fontWeight: 700 }}>ไม่พบหน้านี้</h1>
        <p style={{ margin: "0 0 22px", fontSize: "15px", color: "#9bb0c2" }}>ลิงก์อาจถูกเปลี่ยนชื่อ ลบ หรือพิมพ์ไม่ถูกต้อง</p>
        <Link href="/" style={{ display: "inline-block", padding: "11px 22px", borderRadius: "12px", background: "#5cd6ff", color: "#04121d", fontWeight: 700, textDecoration: "none" }}>กลับหน้าแรก</Link>
      </div>
    </main>
  );
}

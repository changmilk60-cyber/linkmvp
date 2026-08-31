import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkMVP — ย่อลิงก์ & หน้า Bio ของคุณ",
  description: "เครื่องมือย่อลิงก์และสร้างหน้า Bio link แบบง่าย",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

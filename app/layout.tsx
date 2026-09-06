import type { Metadata } from "next";
import "./globals.css";
import "./pagevip-theme.css";

export const metadata: Metadata = {
  title: "PageVIP Pro — หลังบ้านแก้เว็บ",
  description: "สร้างและจัดการหน้าเซลเพจของคุณ พร้อมหลังบ้านแก้เว็บครบวงจร",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pv-scope antialiased">{children}</body>
    </html>
  );
}

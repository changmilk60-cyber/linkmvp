import type { Metadata } from "next";
import "./globals.css";
import "./pagevip-theme.css";

export const metadata: Metadata = {
  title: "PageVIP Pro — LINKMVP",
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
        {/* Applies the saved admin scheme before first paint, so switching to
            light does not flash a dark screen on every load. Scoped to the
            admin: a customer's sales page must never follow this preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(location.pathname.indexOf('/dashboard')===0&&localStorage.getItem('pv-scheme')==='light'){document.documentElement.setAttribute('data-pv-scheme','light')}}catch(e){}",
          }}
        />
      </head>
      <body className="pv-scope antialiased">{children}</body>
    </html>
  );
}

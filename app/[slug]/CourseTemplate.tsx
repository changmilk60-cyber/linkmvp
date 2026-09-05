"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Track = { label: string; url: string };
type Review = { name: string; text: string };
type Faq = { q: string; a: string };
type Toggles = {
  carousel: boolean;
  quiz: boolean;
  countdown: boolean;
  reviews: boolean;
  faq: boolean;
};

const DEFAULT_TOGGLES: Toggles = {
  carousel: true,
  quiz: true,
  countdown: true,
  reviews: true,
  faq: true,
};

const DEMO_REVIEWS = [
  { name: "ผู้เรียนตัวอย่าง 01", text: "ข้อความรีวิวตัวอย่างที่ต้องเปลี่ยนเป็นข้อมูลจริง" },
  { name: "ผู้เรียนตัวอย่าง 02", text: "ข้อความรีวิวตัวอย่างที่ต้องเปลี่ยนเป็นข้อมูลจริง" },
  { name: "ผู้เรียนตัวอย่าง 03", text: "ข้อความรีวิวตัวอย่างที่ต้องเปลี่ยนเป็นข้อมูลจริง" },
];

const DEMO_FAQ = [
  {
    q: "ต้องมีพื้นฐานมาก่อนไหม?",
    a: "ไม่จำเป็น คอร์สออกแบบให้เริ่มจากศูนย์ได้ มีบทเรียนปูพื้นฐานให้ก่อนเข้าส่วนลงมือทำจริง",
  },
  {
    q: "เรียนย้อนหลังได้นานแค่ไหน?",
    a: "เข้าถึงเนื้อหาและอัปเดตทั้งหมดได้ตลอดอายุการเข้าถึงที่ระบุในแต่ละแพ็กเกจ",
  },
  {
    q: "ถ้าติดปัญหาจะถามใครได้บ้าง?",
    a: "ถามได้ในกลุ่มพูดคุยของคอร์ส หรือช่องทางที่ระบุไว้ตามแพ็กเกจที่เลือก",
  },
  {
    q: "ขอใบเสร็จหรือเอกสารได้ไหม?",
    a: "ออกใบเสร็จ/ใบกำกับภาษีได้ แจ้งความต้องการหลังสมัครผ่านช่องทางติดต่อ",
  },
];

const QUIZ_QUESTIONS = [
  {
    label: "1. เป้าหมายหลักของคุณคือะไร?",
    options: [
      "เริ่มจากพื้นฐานและค่อย ๆ ทำความเข้าใจ",
      "ทำโปรเจกต์ให้เป็นชิ้นงาน",
      "มีคนช่วยดูงานและให้คำแนะนำ",
    ],
  },
  {
    label: "2. คุณมีเวลาเรียนต่อสัปดาห์ประมาณเท่าไร?",
    options: [
      "2-3 ชั่วโมง เรียนแบบยืดหยุ่น",
      "4-6 ชั่วโมง มีเวลาทำโปรเจกต์ต่อเนื่อง",
      "7 ชั่วโมงขึ้นไป อยากเร่งทำให้เสร็จเร็ว",
    ],
  },
  {
    label: "3. รูปแบบการสนับสนุนที่ต้องการ?",
    options: [
      "เรียนเองและกำหนดจังหวะเองได้",
      "กำหนดเป็นรอบตามตารางเวลา",
      "มีคนดูงานหรือให้คำแนะนำใกล้ชิด",
    ],
  },
];

const TRACK_RESULTS = ["Self-paced", "Workshop Sprint", "Mentor Track"];

function formatUnit(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export default function CourseTemplate({
  title,
  bio,
  avatarEmoji,
  theme,
  tracks,
  ctaUrl,
  pixelTags,
  customCodeBlock,
  images,
  fontFamily,
  toggles,
  reviews,
  faq,
}: {
  title: string | null;
  bio: string | null;
  avatarEmoji: string | null;
  theme: string;
  tracks: Track[];
  ctaUrl: string;
  pixelTags: ReactNode;
  customCodeBlock?: ReactNode;
  images?: string[];
  fontFamily?: string | null;
  toggles?: Partial<Toggles>;
  reviews?: Review[];
  faq?: Faq[];
}) {
  const on = { ...DEFAULT_TOGGLES, ...toggles };
  const reviewList = reviews && reviews.length > 0 ? reviews : DEMO_REVIEWS;
  const faqList = faq && faq.length > 0 ? faq : DEMO_FAQ;
  const trackList: Track[] =
    tracks.length > 0
      ? tracks
      : [
          { label: "Self-paced", url: ctaUrl },
          { label: "Workshop Sprint", url: ctaUrl },
          { label: "Mentor Track", url: ctaUrl },
        ];

  const [answers, setAnswers] = useState<(number | null)[]>([0, 0, 0]);
  const recommended =
    TRACK_RESULTS[answers[0] ?? 0] ?? TRACK_RESULTS[0];

  const deadlineRef = useRef<number>(Date.now() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, deadlineRef.current - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining / (60 * 60 * 1000)) % 24);
  const mins = Math.floor((remaining / (60 * 1000)) % 60);
  const secs = Math.floor((remaining / 1000) % 60);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollBottom = () =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  const [copied, setCopied] = useState(false);
  const sharePage = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: title || "", url });
        return;
      }
    } catch {
      // ignore share cancel
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  return (
    <main
      className="relative mx-auto min-h-screen max-w-md bg-[#f4f6fb] px-5 pb-16 pt-6"
      style={{ color: "#1c2540", fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : undefined }}
    >
      {pixelTags}
      {fontFamily && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            fontFamily
          )}:wght@400;600;700;800&display=swap`}
        />
      )}

      <div className="fixed left-4 top-4 z-20 flex flex-col gap-2">
        <button
          onClick={scrollTop}
          aria-label="เลื่อนขึ้นบนสุด"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/60 shadow"
        >
          ↑
        </button>
        <button
          onClick={scrollBottom}
          aria-label="เลื่อนลงล่างสุด"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/60 shadow"
        >
          ↓
        </button>
      </div>
      <button
        onClick={sharePage}
        aria-label="แชร์หน้านี้"
        className="fixed right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/60 shadow"
      >
        {copied ? "✓" : "⇪"}
      </button>

      <div className="flex flex-col items-center pt-8">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow"
          style={{ background: theme + "22" }}
        >
          {avatarEmoji || "🧑‍🏫"}
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold leading-snug" style={{ color: theme }}>
          {title || "เรียนให้จบเป็นชิ้นงาน ไม่ใช่แค่ดูวิดีโอ"}
        </h1>
        <p className="mt-3 text-center text-sm text-ink/60">
          {bio ||
            "คอร์สออนไลน์สำหรับคนที่อยากเปลี่ยนความรู้ให้เป็นโปรเจกต์จริง มีบทเรียนสั้น แบบฝึกหัด และแนวทางแผนการเรียนให้เหมาะกับเวลาของคุณ"}
        </p>
      </div>

      {on.carousel && (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {(images && images.length > 0 ? images : [0, 1, 2]).map((item, i) =>
            typeof item === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={item}
                alt=""
                className="h-40 w-56 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div
                key={i}
                className="h-40 w-56 flex-shrink-0 rounded-xl"
                style={{
                  background: `linear-gradient(160deg, ${theme}33, ${theme}88)`,
                }}
              />
            )
          )}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {trackList.map((t, i) => (
          <a
            key={i}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl border bg-white py-3 text-center font-bold shadow-sm transition hover:shadow-md"
            style={{ borderColor: theme + "55", color: theme }}
          >
            {t.label}
          </a>
        ))}
      </div>

      {on.quiz && (
      <>
      <p className="mt-4 text-center text-xs text-ink/50">
        ยังไม่แน่ใจว่าแพ็กเกจไหนเหมาะกับคุณ? ทำแบบทดสอบสั้น ๆ ด้านล่างได้เลย
      </p>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
        <div className="mb-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          ⏱ หาทางเรียนที่เหมาะกับคุณ
        </div>
        <h2 className="text-lg font-extrabold" style={{ color: theme }}>
          ตอบ 3 ข้อ แล้วเลือกเส้นทางได้ง่ายขึ้น
        </h2>
        <p className="mt-1 text-xs text-ink/50">
          คำแนะนำไม่ใช่ข้อสรุปตายตัว คุณยังสลับแพ็กเกจภายหลังหรือติดต่อทีมงานเพิ่มเติมได้
        </p>

        <div className="mt-4 space-y-4">
          {QUIZ_QUESTIONS.map((q, qi) => (
            <div key={qi}>
              <p className="mb-2 text-sm font-semibold text-ink/80">{q.label}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[qi] = oi;
                          return next;
                        })
                      }
                      className="block w-full rounded-lg border px-3 py-2 text-left text-sm transition"
                      style={
                        selected
                          ? { borderColor: theme, color: theme, background: theme + "11" }
                          : { borderColor: "#e5e7eb", color: "#374151" }
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-xl px-4 py-4 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${theme}, #1c2540)` }}
        >
          <p className="text-xs opacity-80">เส้นทางที่น่าจะเหมาะกับคุณเป็นจุดเริ่มต้น</p>
          <p className="mt-1 text-lg font-extrabold" style={{ color: "#ffd54a" }}>
            {recommended}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-lg border border-ink/15 bg-white py-2 text-sm font-semibold text-ink/60"
            onClick={() => setAnswers([0, 0, 0])}
          >
            ล้างคำตอบ
          </button>
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg py-2 text-center text-sm font-semibold text-white"
            style={{ background: theme }}
          >
            ยืนยันเส้นทาง LINE
          </a>
        </div>
      </div>
      </>
      )}

      {on.countdown && (
      <div className="mt-6 rounded-2xl p-4 text-center text-white" style={{ background: "#1c2540" }}>
        <p className="text-sm font-semibold">รอบสมัครถัดไปปิดใน</p>
        <div className="mt-2 flex justify-center gap-2 text-xl font-mono font-bold">
          {[
            { v: days, l: "วัน" },
            { v: hours, l: "ชั่วโมง" },
            { v: mins, l: "นาที" },
            { v: secs, l: "วินาที" },
          ].map((u, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="rounded bg-white/10 px-2 py-1">{formatUnit(u.v)}</span>
              <span className="mt-1 text-[10px] font-normal opacity-60">{u.l}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {on.reviews && (
      <>
      <h2 className="mt-8 text-center text-lg font-extrabold" style={{ color: theme }}>
        รีวิวจากผู้เรียน
      </h2>
      <div className="mt-4 space-y-3">
        {reviewList.map((r, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
            <p className="text-amber-500">★★★★★</p>
            <p className="mt-1 text-sm text-ink/60">{r.text}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/10 text-xs">
                {r.name.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-semibold">{r.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {on.faq && (
      <div className="mt-8 space-y-2">
        {faqList.map((f, i) => (
          <details key={i} className="rounded-lg border border-ink/10 bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
            <p className="mt-2 text-xs text-ink/60">{f.a}</p>
          </details>
        ))}
      </div>
      )}

      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block w-full rounded-xl py-3 text-center text-sm font-bold text-white"
        style={{ background: theme }}
      >
        ส่งข้อมูลสมัครเรียน
      </a>
      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-xl py-3 text-center text-sm font-bold text-white"
        style={{ background: "#1c2540" }}
      >
        ถามรายละเอียดคอร์สทาง LINE
      </a>

      <p className="mt-8 text-center text-xs text-ink/30">สร้างด้วย LinkMVP</p>
      {customCodeBlock}
    </main>
  );
}

# PageVIP Pro

หลังบ้านแก้เว็บสำหรับสร้างและจัดการหน้าเซลเพจ 1 หน้าเดียวต่อบัญชี สร้างด้วย Next.js 14
(App Router) + Prisma + PostgreSQL

หน้าตาและโครงสร้างของ "หลังบ้านแก้เว็บ" อ้างอิงจาก design system ในโฟลเดอร์
`.claude-design/` (ถ้ามี) — ธีมเขียว-ดำ, ฟอนต์ Kanit, การ์ดพับได้ 13 ส่วน

## ฟีเจอร์

- สมัครสมาชิก / เข้าสู่ระบบ (อีเมล + รหัสผ่าน, session แบบ JWT cookie) — สมัครแล้วได้หน้าเซลเพจ 1 หน้าโดยอัตโนมัติ
- **หลังบ้านแก้เว็บ**: Dashboard สถิติจริง (ผู้เข้าชม/คลิกจริงจากผู้เข้าชม ไม่ใช่ตัวเลขปลอม), เปลี่ยนชื่อ URL,
  ตั้งค่า Bot/Whitepage cloak, จัดเรียง/เปิดปิด 13 sections, จัดการรีวิวแบบสุ่ม, เลือกโทนสี 12 แบบ, ตั้งค่า Pixel/CAPI,
  อัปโหลดรูป, แก้ข้อความ, ปรับสีตัวอักษร
- **หน้าเซลเพจสาธารณะ** (`/[slug]`): เรนเดอร์จาก sections ที่ตั้งค่าไว้ — ผู้ใช้ออนไลน์ (จำลอง), ปุ่ม GIF สมัคร,
  ยอดโบนัสสะสม, เกมยอดนิยม, รูปหลัก, ข้อความ, อันดับผู้เล่น, ของรางวัล, ประกาศ, สไลด์รูป, รีวิวหมุนอัตโนมัติ,
  ปุ่มสมัคร + LINE — พร้อม Facebook Pixel และนับคลิก/ผู้เข้าชมจริงลงฐานข้อมูล
- **License**: หมดอายุแล้วหน้าเว็บจะเด้งไป Whitepage URL ที่ตั้งไว้อัตโนมัติ

## สิ่งที่ยังไม่มี (ต้องทำต่อถ้าจะใช้งานจริงเต็มรูปแบบ)

- ต่ออายุ License เอง (ตอนนี้ต้องต่อจากฝั่งแอดมิน/ฐานข้อมูลโดยตรง)
- การตรวจจับ bot จริงจัง (ตอนนี้ toggle "ใช้หน้าเดียวกันทุกอุปกรณ์" เป็นการตั้งค่าที่บันทึกไว้ ไม่ได้ผูก logic ตรวจจับอุปกรณ์/บอทจริง)
- Rate limiting / bot protection บนฟอร์ม

---

## เริ่มต้นใช้งานบนเครื่อง (local dev)

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) เตรียมฐานข้อมูล Postgres

- **Docker (เร็วสุด):**
  ```bash
  docker run --name pagevip-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
  ```
  แล้วใช้ `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"`

### 3) ตั้งค่า environment variables

```bash
cp .env.example .env
```

แก้ไข `.env`: `DATABASE_URL`, `SESSION_SECRET` (`openssl rand -base64 32`), `NEXT_PUBLIC_BASE_URL`

### 4) สร้างตารางในฐานข้อมูล

```bash
npx prisma db push
```

### 5) รัน dev server

```bash
npm run dev
```

เปิด http://localhost:3000

---

## Deploy ขึ้น Railway

1. เชื่อม repo นี้เข้ากับโปรเจกต์ Railway ที่มี service เว็บ + PostgreSQL อยู่แล้ว (Railway จะเซ็ต
   `DATABASE_URL` ให้อัตโนมัติจาก service Postgres ในโปรเจกต์เดียวกัน)
2. ตั้งตัวแปรที่เหลือใน service ของแอป → tab "Variables": `SESSION_SECRET`, `NEXT_PUBLIC_BASE_URL`
3. Build Command: `npm run build`, Start Command: `npm run start` — `start` รัน
   `prisma db push --accept-data-loss` ให้อัตโนมัติก่อนเปิดเซิร์ฟเวอร์ทุกครั้ง จึง sync schema เองไม่ต้องรัน
   migration มือ (เหมาะกับช่วง MVP ที่ schema ยังเปลี่ยนบ่อย — เมื่อมีข้อมูลจริงเยอะแล้วควรเปลี่ยนไปใช้
   `prisma migrate deploy` แทน)

## โครงสร้างโปรเจกต์

```
app/
  actions.ts              ← server actions ทั้งหมด (auth, บันทึกการตั้งค่า, เปลี่ยน URL, จัดเรียง section)
  api/track/route.ts      ← รับ POST บันทึกการเข้าชม/คลิกจากหน้าเซลเพจสาธารณะ
  dashboard/              ← "หลังบ้านแก้เว็บ" (page.tsx ดึงข้อมูล+สถิติ, AdminClient.tsx = ฟอร์มใหญ่ทั้งหมด)
  [slug]/                 ← หน้าเซลเพจสาธารณะ (page.tsx เช็ค license, SalesPage.tsx เรนเดอร์ sections)
  login/, register/       ← ฟอร์มเข้าสู่ระบบ/สมัคร (ธีมเดียวกับหลังบ้าน)
components/ds/            ← primitives ของดีไซน์ระบบ (Button, SectionCard, Field, StatCard, ฯลฯ)
lib/
  prisma.ts               ← Prisma client singleton
  auth.ts                 ← session cookie (JWT), hash รหัสผ่าน
  sections.ts             ← นิยาม 13 sections, 12 theme presets, helper วันที่
prisma/schema.prisma      ← schema ฐานข้อมูล (User, Page, Visit)
```

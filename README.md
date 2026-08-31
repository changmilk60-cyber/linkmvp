# LinkMVP

ระบบย่อลิงก์ + สร้างหน้า Bio link แบบง่าย (MVP) สร้างด้วย Next.js 14 (App Router) +
Prisma + PostgreSQL + Tailwind CSS

## ฟีเจอร์ที่มีในเวอร์ชันนี้

- สมัครสมาชิก / เข้าสู่ระบบ (อีเมล + รหัสผ่าน, session แบบ JWT cookie)
- ย่อลิงก์: กำหนดตัวย่อเองได้ หรือให้ระบบสุ่มให้, นับจำนวนคลิก
- หน้า Bio link: ตั้งชื่อ, คำโปรย, สีธีม, ไอคอน, เพิ่ม/ลบปุ่มลิงก์ได้ไม่จำกัด, นับยอดเข้าชม
- แดชบอร์ดจัดการลิงก์และหน้า Bio ทั้งหมดในที่เดียว พร้อมปุ่มคัดลอกลิงก์

## สิ่งที่ยังไม่มี (ต้องทำต่อถ้าจะใช้งานจริง)

- Analytics ละเอียด (ประเทศ/อุปกรณ์/referrer) — ตอนนี้นับแค่จำนวนคลิกรวม
- QR code generator
- ระบบสมาชิก/แพลนราคา/การชำระเงิน
- Custom domain ต่อผู้ใช้
- Rate limiting / bot protection บนฟอร์ม

---

## เริ่มต้นใช้งานบนเครื่อง (local dev)

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) เตรียมฐานข้อมูล Postgres

ต้องมี PostgreSQL ให้ต่อ ถ้ายังไม่มี เลือกวิธีใดวิธีหนึ่ง:

- **Docker (เร็วสุด):**
  ```bash
  docker run --name linkmvp-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
  ```
  แล้วใช้ `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"`

- **หรือใช้ฟรี Postgres จาก [Neon](https://neon.tech) / [Railway](https://railway.app)** แล้วคัดลอก connection string มาใส่

### 3) ตั้งค่า environment variables

```bash
cp .env.example .env
```

แก้ไข `.env`:
- `DATABASE_URL` — connection string จากขั้นตอนที่ 2
- `SESSION_SECRET` — สุ่มด้วย `openssl rand -base64 32`
- `NEXT_PUBLIC_BASE_URL` — ปล่อยเป็น `http://localhost:3000` ตอน dev

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

## Deploy ขึ้น Railway (แนะนำ — ง่ายสุด เพราะมี Postgres ให้ในตัว)

1. สร้างโปรเจกต์ใหม่บน [railway.app](https://railway.app) → "Deploy from GitHub repo" (push โค้ดนี้ขึ้น GitHub ก่อน)
2. กด "+ New" → "Database" → "PostgreSQL" เพื่อสร้างฐานข้อมูลในโปรเจกต์เดียวกัน — Railway จะสร้างตัวแปร `DATABASE_URL` ให้อัตโนมัติและเชื่อมกับ service ของแอปให้เอง
3. ไปที่ service ของแอป → tab "Variables" เพิ่ม:
   - `SESSION_SECRET` = string สุ่มยาวๆ
   - `NEXT_PUBLIC_BASE_URL` = โดเมนที่ Railway ให้มา (เช่น `https://xxxx.up.railway.app`)
4. ไปที่ tab "Settings" → "Deploy" ตั้ง **Build Command**: `npm run build` และ **Start Command**: `npm run start`
5. หลัง deploy ครั้งแรกสำเร็จ ต้องรัน migration หนึ่งครั้ง เปิด Railway Shell (หรือรันจากเครื่องคุณโดยชี้ DATABASE_URL ไปที่ Railway Postgres) แล้วรัน:
   ```bash
   npx prisma db push
   ```

## Deploy ขึ้น Vercel

1. Push โค้ดขึ้น GitHub แล้ว "Import Project" ใน [vercel.com](https://vercel.com)
2. เพิ่ม Postgres ฟรีผ่าน Vercel Marketplace (Neon หรือ Vercel Postgres) — จะได้ `DATABASE_URL` มาอัตโนมัติ ใส่ใน Project → Settings → Environment Variables
3. เพิ่มตัวแปรเพิ่มเติม:
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_BASE_URL` = โดเมน Vercel ของโปรเจกต์
4. Deploy ได้เลย (Vercel รัน `npm run build` ให้อัตโนมัติ ซึ่งจะรัน `prisma generate` ให้ในตัว)
5. รัน migration ครั้งแรกจากเครื่องตัวเอง โดยตั้ง `DATABASE_URL` ในเครื่องให้ชี้ไปที่ฐานข้อมูล production แล้วรัน:
   ```bash
   npx prisma db push
   ```

> หมายเหตุ: Vercel เป็น serverless ไม่มี persistent disk จึงต้องใช้ Postgres ภายนอกเสมอ (ห้ามใช้ SQLite บน Vercel)

---

## โครงสร้างโปรเจกต์

```
app/
  actions.ts          ← server actions ทั้งหมด (auth, CRUD ลิงก์/บิโอ)
  page.tsx            ← หน้าแรก
  register/, login/    ← ฟอร์มสมัคร/เข้าสู่ระบบ
  dashboard/           ← แดชบอร์ดจัดการลิงก์ (server component + client forms)
  [slug]/page.tsx      ← route เดียวที่ทำหน้าที่ทั้ง redirect ลิงก์ย่อ และ render หน้า Bio
lib/
  prisma.ts           ← Prisma client singleton
  auth.ts             ← สร้าง/ตรวจ session cookie (JWT), hash รหัสผ่าน
prisma/schema.prisma   ← schema ฐานข้อมูล (User, Link)
```

## ขยายต่อได้ง่ายๆ

- **Analytics ละเอียดขึ้น**: เพิ่มตาราง `ClickEvent` แล้ว log ทุกครั้งที่มีคนกดลิงก์ (เก็บ user-agent, referrer, ip → geolocate)
- **QR code**: ใช้ไลบรารี `qrcode` generate PNG/SVG จาก URL ของแต่ละลิงก์ ไม่ต้องทำ backend เพิ่ม
- **ธีมหน้า Bio เพิ่มเติม**: เพิ่มคอลัมน์ `template` ใน `Link` แล้ว switch การ render ใน `app/[slug]/page.tsx`

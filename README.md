# 🚀 AI Academy

> **Học như chơi — Chơi mà học.** Nền tảng giáo dục AI cá nhân hóa cho học sinh lớp 3–6.
> English · Toán · Khoa học · Đọc hiểu · Lập trình · Kỹ năng tự học.

Phong cách: **Duolingo × Khan Academy Kids × Minecraft** — mobile-first, gamified, dẫn dắt bởi AI.

---

## 🧱 Tech stack

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, Shadcn-style UI, Framer Motion, TanStack Query |
| Backend | NestJS 10 (Clean Architecture + DDD + Repository + CQRS-lite), class-validator, JWT |
| Data | PostgreSQL 16, Prisma 5, Redis 7 |
| AI | OpenAI API qua `@ai-academy/ai` (provider-agnostic) |
| Monorepo | npm workspaces |

```
apps/        web (Next.js) · api (NestJS)
packages/    types · utils · ai · ui
docs/        ARCHITECTURE.md · DEPLOYMENT.md
```

---

## ✅ Yêu cầu

- **Node.js ≥ 20**, npm ≥ 10
- **PostgreSQL 16** và **Redis 7** (chạy nhanh bằng Docker — xem dưới)
- (Tùy chọn) **OPENAI_API_KEY** — nếu để trống, các tính năng AI dùng **nội dung fallback an toàn**, app vẫn chạy đầy đủ.

---

## ⚡ Chạy local (5 bước)

### 1. Cài dependencies (tại thư mục gốc)
```bash
npm install
```

### 2. Bật PostgreSQL + Redis
Cách nhanh nhất (chỉ DB & cache):
```bash
docker compose up -d postgres redis
```
> Không có Docker? Cài Postgres/Redis thủ công rồi chỉnh `DATABASE_URL`, `REDIS_URL`.

### 3. Cấu hình môi trường
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# (tùy chọn) điền OPENAI_API_KEY vào apps/api/.env
```

### 4. Khởi tạo database (migrate + seed)
```bash
npm run prisma:generate          # sinh Prisma Client
npm run prisma:migrate           # tạo bảng (migrate dev)
npm run prisma:seed              # dữ liệu mẫu + tài khoản demo
```

### 5. Chạy app
```bash
npm run dev          # chạy song song API (4000) + Web (3000)
# hoặc tách riêng:
npm run dev:api
npm run dev:web
```

- 🌐 Web: http://localhost:3000
- 🔌 API: http://localhost:4000/api/v1
- 📖 Swagger: http://localhost:4000/api/v1/docs

### 🔑 Tài khoản demo (sau khi seed)
| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@aiacademy.vn` | `Admin@12345` |
| Phụ huynh | `phuhuynh@demo.vn` | `Parent@123` |

> Đăng nhập phụ huynh để thấy con demo "Bé Na" (lớp 4) và toàn bộ luồng học/quest/thưởng.

---

## 🧩 Script hữu ích

| Lệnh | Tác dụng |
|------|----------|
| `npm run dev` | Chạy web + api song song |
| `npm run build` | Build packages → api → web |
| `npm run prisma:migrate` | Tạo/áp migration (dev) |
| `npm run prisma:seed` | Seed dữ liệu mẫu |
| `npm run db:reset` | Reset DB (xóa + migrate + seed) |
| `npm run lint` | Lint toàn workspace |

---

## 🗺️ Tính năng chính

- **Auth**: JWT access + refresh xoay vòng, RBAC (Admin/Parent/Student), argon2.
- **Home**: avatar, level, XP, streak, daily quest (AI sinh, có fallback).
- **5 Worlds**: English / Math / Science / Reading / Coding.
- **AI Tutor**: chat theo môn, cá nhân hóa theo sở thích; Toán gợi ý **từng bước, không cho đáp án ngay**.
- **Gamification**: XP/Level (đường cong), Badge (rule-based), Streak (timezone), Reward Store (đổi XP).
- **Parent Dashboard**: thời gian học, điểm mạnh/yếu, **báo cáo AI**.
- **Family Challenge**: thử thách bố/mẹ–con & cả gia đình.
- **Admin Panel**: thống kê, quản lý người dùng, **Prompt Management** (sửa prompt AI trong DB).

Chi tiết kiến trúc: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Triển khai: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 🛠️ Khắc phục sự cố

| Vấn đề | Cách xử lý |
|--------|-----------|
| `Can't reach database` | Kiểm tra `docker compose ps`, đúng `DATABASE_URL` chưa |
| Prisma Client lỗi | Chạy lại `npm run prisma:generate` |
| AI báo chưa cấu hình | Bình thường nếu chưa có `OPENAI_API_KEY` — app dùng fallback |
| Port bận | Đổi `PORT` (api) / `next dev -p` (web) |
| Lỗi import `@ai-academy/*` | Chạy `npm install` ở gốc; nếu chạy `dev:api`/`dev:web` riêng lẻ, build packages trước: `npm run build:packages` (lệnh `npm run dev` đã tự build) |

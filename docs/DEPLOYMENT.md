# AI Academy — Hướng dẫn triển khai (Deployment)

Kiến trúc deploy đề xuất:

| Thành phần | Nền tảng | Ghi chú |
|-----------|----------|---------|
| Frontend (`apps/web`) | **Vercel** | Next.js native |
| Backend (`apps/api`) | **Railway** | NestJS qua Docker |
| PostgreSQL | **Railway** / Supabase | |
| Redis | **Railway** (plugin) / Upstash | |
| Object storage | **Supabase Storage** | ảnh avatar, audio |

---

## 1. Chuẩn bị

- Tài khoản: Vercel, Railway, (tùy chọn) Supabase, OpenAI.
- Sinh secret JWT mạnh:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Chạy 2 lần cho `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET`.

---

## 2. Database & Redis (Railway)

1. Tạo project mới trên Railway → **New → Database → PostgreSQL**. Copy `DATABASE_URL`.
2. **New → Database → Redis**. Copy `REDIS_URL`.
3. Áp migration & seed (chạy local trỏ vào DB Railway, hoặc trong CI):
   ```bash
   DATABASE_URL="<railway-postgres-url>" npm run prisma:deploy -w @ai-academy/api
   DATABASE_URL="<railway-postgres-url>" npm run prisma:seed   -w @ai-academy/api
   ```

> `prisma migrate deploy` cũng tự chạy khi container API khởi động (xem `apps/api/Dockerfile`).

---

## 3. Backend trên Railway (Docker)

1. **New → Service → Deploy from GitHub repo** (repo monorepo này).
2. Settings → Build:
   - Builder: **Dockerfile**
   - Dockerfile Path: `apps/api/Dockerfile`
   - Root Directory: `/` (build context phải là root monorepo).
3. Variables (Environment):
   ```
   NODE_ENV=production
   PORT=4000
   API_PREFIX=api/v1
   DATABASE_URL=<railway postgres>
   REDIS_URL=<railway redis>
   JWT_ACCESS_SECRET=<secret>
   JWT_REFRESH_SECRET=<secret>
   JWT_ACCESS_TTL=15m
   JWT_REFRESH_TTL=30d
   CORS_ORIGINS=https://<your-web>.vercel.app
   OPENAI_API_KEY=<openai-key>
   AI_DEFAULT_MODEL=gpt-4o-mini
   ```
4. Expose port `4000` → Railway cấp domain, ví dụ `https://aiacademy-api.up.railway.app`.
5. Health: Swagger tại `/<API_PREFIX>/docs` (tắt ở production nếu cần).

---

## 4. Frontend trên Vercel

1. **Add New → Project** → import repo.
2. Settings:
   - **Root Directory**: `apps/web`
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (Vercel tự xử lý workspace; nếu cần: `npm run build -w @ai-academy/web` từ root với Root Directory = `/`).
3. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://aiacademy-api.up.railway.app/api/v1
   ```
4. Deploy. Sau khi có domain Vercel, cập nhật lại `CORS_ORIGINS` của API cho khớp.

> Lưu ý monorepo: nếu Vercel báo thiếu package nội bộ, đặt **Root Directory = `/`** và Build Command = `npm install && npm run build -w @ai-academy/web`, Output Directory = `apps/web/.next`.

---

## 5. Supabase Storage (tùy chọn)

1. Tạo project Supabase → Storage → tạo bucket `ai-academy` (public hoặc signed URL).
2. Lấy `Project URL` và `service_role key` → đặt `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`.

---

## 6. Triển khai bằng Docker Compose (VPS/tự host)

```bash
cp .env.example .env          # điền secret + OPENAI_API_KEY
docker compose up -d --build  # postgres + redis + api + web
docker compose exec api npx prisma migrate deploy
docker compose exec api node -e "require('child_process')"  # (tùy) seed:
docker compose exec api sh -c "cd /app/apps/api && npx ts-node prisma/seed.ts"
```
- Web: http://localhost:3000 · API: http://localhost:4000/api/v1

---

## 7. Checklist production

- [ ] Đổi toàn bộ secret JWT, mật khẩu DB.
- [ ] `CORS_ORIGINS` chỉ chứa domain thật.
- [ ] Bật HTTPS (Vercel/Railway tự cấp).
- [ ] Giới hạn `AI_THROTTLE_LIMIT` phù hợp ngân sách OpenAI.
- [ ] Bật backup PostgreSQL định kỳ.
- [ ] Tắt Swagger ở production (đã tự tắt khi `NODE_ENV=production`).
- [ ] Theo dõi log (pino) + audit_logs cho hành động nhạy cảm.

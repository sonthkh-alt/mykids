# 🧭 BÀN GIAO — Tiếp tục làm việc (đọc file này đầu tiên)

> Mục đích: mở repo trên **bất kỳ máy nào** là tiếp tục được ngay. Cập nhật: 2026-06-19.

## 0. Tiếp tục với Claude trên máy khác
Bộ nhớ của Claude lưu cục bộ từng máy → **không tự sang máy mới**. Khi mở phiên Claude mới, hãy dán cho nó:
- Link repo: `https://github.com/sonthkh-alt/mykids`
- Câu: *"Đọc docs/HANDOFF.md để nắm bối cảnh rồi tiếp tục."*

---

## 1. Dự án là gì
**AI Academy** — nền tảng giáo dục AI cho học sinh lớp 3–6 (English/Toán/Khoa học/Đọc hiểu/Lập trình), phong cách Duolingo. Monorepo npm-workspaces.
- `apps/web` — Next.js 15 (frontend, mobile-first, gamified)
- `apps/api` — NestJS 10 (Clean Architecture + DDD + Repository)
- `packages/` — `types`, `utils`, `ai` (OpenAI provider-agnostic), `ui`
- Chi tiết kiến trúc: [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) · Triển khai: [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) · Chạy local: [`../README.md`](../README.md)

## 2. ĐANG CHẠY LIVE (production)
| Thành phần | Địa chỉ / Dịch vụ |
|---|---|
| Web (Vercel) | https://mykids-api.vercel.app |
| API (Railway) | https://mykids-production.up.railway.app/api/v1 |
| PostgreSQL | **Neon** (region ap-southeast-1) — đã migrate + seed |
| Redis | **Upstash** (Singapore) |
| AI (OpenAI-compatible) | **shopaikey.com** `/v1`, model `gpt-4o-mini` |

**Nội dung đã nạp:** ~3.720 bài học · ~26.800 câu hỏi · ~500 giờ (5 môn, mỗi môn ~100h).

**Tài khoản demo:**
- Phụ huynh: `phuhuynh@demo.vn` / `Parent@123` (có 3 con: Bé Na, Hà Ngọc Bách, Hà Ngọc Tùng)
- Admin: `admin@aiacademy.vn` / `Admin@12345`

## 3. Khóa bí mật (KHÔNG nằm trong Git)
Các biến `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `OPENAI_API_KEY`, `OPENAI_BASE_URL` được đặt tại:
- **Railway → service API → tab Variables** (backend)
- **Vercel → project → Settings → Environment Variables** (`NEXT_PUBLIC_API_URL`)
- Lấy lại giá trị: mở dashboard tương ứng, hoặc xem lịch sử chat.
- ⚠️ **NÊN ĐỔI (rotate)** các khóa này vì đã từng dán công khai: Neon (reset password) · Upstash (reset token) · shopaikey (key mới) → cập nhật lại trong Railway.

## 4. Quy trình cập nhật / deploy
- Code đẩy lên GitHub nhánh `main`.
- **Web (Vercel):** tự deploy khi push. ✅
- **API (Railway):** kiểm tra **Settings → bật Auto Deploy** nhánh `main`. Nếu CHƯA bật, mỗi lần đổi backend phải vào Railway → đổi 1 biến bất kỳ (vd `APP_VERSION`) để buộc build lại, hoặc bấm Deploy thủ công.
- Đổi `NEXT_PUBLIC_API_URL` trên Vercel → **phải Redeploy** (biến nướng vào lúc build).
- Đổi nội dung học: sửa generator trong `apps/api/prisma/content/` rồi chạy lại seed (xem mục 6).

## 5. Đã làm gần đây (changelog)
- Sinh đủ 14 bước nền tảng + deploy live.
- Kho nội dung procedural ~100h/môn (`apps/api/prisma/content/{math,english,science,coding,reading}.ts`).
- Đăng nhập web ↔ API (sửa CORS, định tuyến `/api/v1`).
- Bật AI (shopaikey): AI Tutor, Đấu trường Toán (gợi ý từng bước, không lộ đáp án), cá nhân hóa theo sở thích.
- Nút "Cho con học" + chọn/đổi con (nhiều con).
- **Nhiệm vụ hằng ngày tự hoàn thành** khi học xong bài đúng môn (Anh/Toán/Đọc); Vận động/Sáng tạo bấm "Đã làm".
- **Đổi độ khó:** chọn Lớp 3–6 trong mỗi World + sửa Lớp/Trình độ trong Hồ sơ.
- **Lộ trình kiểu Duolingo:** đường đi uốn lượn, mở khóa tuần tự (✓ xong · ⭐ đang học · 🔒 khóa), chia chặng theo chủ đề; xong bài → quay lại lộ trình thấy bài kế mở.
- **Sửa hiển thị đúng/sai** khi kiểm tra (xanh = đáp án đúng, đỏ = ô chọn sai).

## 6. Lệnh hữu ích
```bash
# Cài & build
npm install
npm run build:packages      # build types/utils/ai trước (bắt buộc)
npm run dev                 # chạy api + web local

# Database (trỏ DATABASE_URL vào Neon, dùng URL DIRECT - bỏ "-pooler" khi migrate)
npm run prisma:generate
npm run prisma:migrate      # local dev
# Production: prisma migrate deploy (Dockerfile tự chạy)
npm run prisma:seed         # nạp lại nội dung (SEED_SCALE=2 để nhiều gấp đôi)
```

## 7. ⚠️ GOTCHAS (lỗi đã gặp — tránh lặp lại)
- **Build API:** `apps/api/tsconfig.json` phải có `rootDir: "./src"` và include CHỈ `src/**` (không gồm `prisma/**`) → nếu không, `nest build` xuất ra `dist/src/main.js` làm hỏng `node dist/main.js` + Docker.
- **OneDrive sync** đôi khi làm `dist` build dở (thiếu file). Nếu lỗi "Cannot find module" → xóa `apps/api/dist` + `tsconfig.tsbuildinfo` rồi build lại.
- **Định tuyến:** global prefix là `api/v1`; KHÔNG bật `enableVersioning` (sẽ thành `/api/v1/v1/...` → 404).
- **CORS:** `CORS_ORIGINS=*` được xử lý thành `origin:true`; hoặc đặt đúng domain Vercel.
- **packages exports** trỏ `dist` (đã build) → luôn `build:packages` trước khi build app.
- **Redis Upstash** dùng scheme `rediss://` (TLS, hai chữ s).
- **Migration trên Neon** dùng kết nối DIRECT (bỏ `-pooler` trong host); runtime app dùng pooler.

## 8. Ý tưởng / việc đang chờ làm tiếp
- [ ] **Cơ chế Duolingo chặt hơn:** bắt trả lời đúng mới qua, hỏi lại câu sai ở cuối, chỉ hoàn thành khi đạt đủ % đúng.
- [ ] **Crown/luyện lại bài** để lên cấp độ khó (như Duolingo crowns).
- [ ] **Nghe–nói tiếng Anh:** TTS đọc từ, ghi âm phát âm.
- [ ] **Ảnh avatar/huy hiệu đẹp** (hiện dùng emoji/placeholder).
- [ ] **Tài khoản đăng nhập riêng cho từng con** (hiện học qua tài khoản phụ huynh).
- [ ] **Rotate toàn bộ secrets** (xem mục 3).
- [ ] Bật **Auto Deploy** trên Railway nếu chưa.
- [ ] (Tùy) Hạn chế lộ `isCorrect` ra client trong API `getLesson` (hiện trả về để hiển thị; chấp nhận được cho trẻ em).

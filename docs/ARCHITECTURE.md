# AI Academy — Kiến trúc tổng thể

> "Học như chơi — Chơi mà học". Nền tảng giáo dục AI cá nhân hóa cho học sinh lớp 3–6.

---

## 1. Tầm nhìn kỹ thuật

AI Academy là một **monorepo** chứa hai ứng dụng (`web`, `api`) và bốn package dùng chung
(`types`, `utils`, `ai`, `ui`). Backend áp dụng **Clean Architecture + DDD + Repository Pattern**,
có chọn lọc **CQRS** cho các luồng phức tạp (gamification, AI). Frontend là **Next.js 15 App Router**
mobile-first, gamified theo phong cách Duolingo × Khan Academy Kids × Minecraft.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                       │
│   Học sinh (mobile-first PWA)        Phụ huynh (dashboard)      Admin       │
└───────────────┬──────────────────────────┬───────────────────────┬────────┘
                │ HTTPS / JSON              │                       │
                ▼                           ▼                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     apps/web  — Next.js 15 (App Router)                    │
│  • Server Components + Server Actions   • TailwindCSS + Shadcn UI          │
│  • Framer Motion (animation)            • TanStack Query (client cache)    │
│  • Auth qua httpOnly cookie (access + refresh)                            │
└───────────────┬────────────────────────────────────────────────────────── ┘
                │ REST  /api/v1/*   (Bearer access token)
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       apps/api  — NestJS (Clean Architecture)             │
│                                                                            │
│   Interface Layer   →  Controllers, DTO, Guards, Interceptors             │
│   Application Layer →  Use-cases / CQRS Commands & Queries, Services       │
│   Domain Layer      →  Entities, Value Objects, Domain Events, Policies    │
│   Infrastructure    →  Prisma repos, Redis, OpenAI, Supabase Storage       │
│                                                                            │
│   Cross-cutting: RBAC Guard · Rate limit · Audit log · Validation · Logger │
└──────┬───────────────┬───────────────┬──────────────────┬──────────────── ┘
       │               │               │                  │
       ▼               ▼               ▼                  ▼
 ┌──────────┐   ┌────────────┐   ┌────────────┐    ┌──────────────┐
 │PostgreSQL│   │   Redis    │   │ OpenAI API │    │ Supabase     │
 │ (Prisma) │   │ cache/rate │   │ (AI Tutor) │    │ Storage      │
 └──────────┘   └────────────┘   └────────────┘    └──────────────┘
```

---

## 2. Cấu trúc thư mục monorepo

```
ai-academy/
├── apps/
│   ├── api/                      # NestJS backend
│   │   ├── prisma/               # schema.prisma + seed
│   │   └── src/
│   │       ├── core/             # config, prisma, redis, logger, guards, filters
│   │       ├── modules/
│   │       │   ├── auth/         # JWT + refresh + RBAC
│   │       │   ├── users/
│   │       │   ├── students/
│   │       │   ├── parents/
│   │       │   ├── family/       # family-group, family-challenge
│   │       │   ├── learning/     # courses, lessons, exercises, records (5 Worlds)
│   │       │   ├── ai/           # ai-tutor, prompt-management
│   │       │   ├── quests/       # daily quest
│   │       │   ├── gamification/ # xp, level, badge, streak, reward
│   │       │   ├── reports/      # parent report
│   │       │   └── admin/        # admin panel APIs
│   │       └── main.ts
│   └── web/                      # Next.js 15 frontend
│       └── src/
│           ├── app/              # App Router (auth, dashboard, worlds, admin)
│           ├── components/
│           ├── lib/              # api client, auth, query
│           └── styles/
├── packages/
│   ├── types/                    # DTO/contract types dùng chung FE+BE
│   ├── utils/                    # helper thuần (xp, date, validation, result)
│   ├── ai/                       # OpenAI client + prompt builder + schema
│   └── ui/                       # design tokens + component primitives
├── docs/
├── docker-compose.yml
└── package.json (workspaces)
```

---

## 3. Phân tầng Backend (Clean Architecture per module)

Mỗi module nghiệp vụ tuân theo 4 tầng, phụ thuộc hướng vào trong (Dependency Rule):

| Tầng | Trách nhiệm | Ví dụ |
|------|-------------|-------|
| **Interface** | Nhận request, xác thực, map DTO | `*.controller.ts`, `dto/`, `*.guard.ts` |
| **Application** | Điều phối use-case, CQRS, transaction | `commands/`, `queries/`, `*.service.ts` |
| **Domain** | Quy tắc nghiệp vụ thuần, không phụ thuộc framework | `entities/`, `value-objects/`, `*.policy.ts` |
| **Infrastructure** | I/O: DB, cache, AI, storage | `*.repository.ts`, `prisma/`, `openai/` |

- **Repository Pattern**: domain phụ thuộc interface `XxxRepository` (port); Prisma là adapter.
- **CQRS** áp dụng cho: cấp XP/level-up, sinh Daily Quest, sinh AI feedback, báo cáo phụ huynh —
  nơi ghi (command) và đọc (query) có mô hình khác nhau và cần audit.
- **Domain Events** (qua `@nestjs/event-emitter` hoặc Redis pub/sub): ví dụ `LessonCompleted`
  → tính XP → kiểm tra badge → cập nhật streak → cập nhật quest, tách rời nhau.

## 4. Phân tầng AI

`packages/ai` đóng gói **provider-agnostic**: `LlmClient` (OpenAI adapter) + `PromptBuilder`.
Backend module `ai/` lưu prompt template trong DB (bảng `ai_prompts` qua Prompt Management),
inject biến cá nhân hóa (sở thích, trình độ) tại runtime, gọi LLM với JSON-schema response để
output có cấu trúc. Mọi hội thoại lưu vào `ai_conversations` / `ai_messages` phục vụ audit & báo cáo.

## 5. Bảo mật (xuyên suốt)

- **AuthN**: JWT access (ngắn hạn, 15') + refresh token (xoay vòng, lưu hash trong DB/Redis).
- **AuthZ**: RBAC 3 vai trò `ADMIN | PARENT | STUDENT` qua `@Roles()` + `RolesGuard`.
  Quan hệ phụ huynh–con kiểm tra ở tầng policy (parent chỉ xem con mình).
- **Rate limiting**: `@nestjs/throttler` + Redis store; giới hạn riêng cho endpoint AI.
- **Validation**: `class-validator` + `ZodValidationPipe` toàn cục, whitelist DTO.
- **Audit Log**: interceptor ghi hành động nhạy cảm vào `audit_logs`.
- **COPPA-friendly**: tài khoản học sinh nhỏ tuổi do phụ huynh tạo & quản lý.

## 6. Gamification & Personalization

- **Gamification engine** (CQRS + events): XP → Level (đường cong tăng dần), Badge (rule-based),
  Streak (theo ngày, timezone học sinh), Avatar unlock, Reward store đổi điểm.
- **Personalization**: hồ sơ `{ grade, interests, english_level, math_level, learning_style }`
  được nén thành "persona context" chèn vào prompt → AI sinh nội dung theo sở thích (Robot, Minecraft…).

## 7. Công nghệ chốt

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn UI, Framer Motion, TanStack Query |
| Backend | NestJS 10, TypeScript, class-validator, @nestjs/jwt, @nestjs/throttler |
| Data | PostgreSQL 16, Prisma 5, Redis 7 |
| AI | OpenAI API (gpt-4o family) qua `packages/ai` |
| Storage | Supabase Storage |
| Deploy | Web → Vercel · API → Railway · DB/Redis → Railway/Supabase |

## 8. Luồng dữ liệu tiêu biểu — "Học sinh hoàn thành 1 bài học"

```
web: nộp bài  ──►  POST /api/v1/learning/exercises/:id/submit
        │
        ▼
 ExercisesController → SubmitExerciseCommand (Application)
        │  ghi student_answers, learning_records (Infra/Prisma, transaction)
        ▼
 emit LessonCompleted (Domain Event)
        ├─► GamificationHandler: +XP → check level-up → check badge → update streak
        ├─► QuestHandler: cập nhật student_daily_quests
        └─► ReportHandler: cập nhật learning_records cho báo cáo phụ huynh
        │
        ▼
 trả về { xpGained, newLevel?, badgesUnlocked[], questsProgressed[] }  → UI nổ confetti 🎉
```

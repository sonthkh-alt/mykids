# ---- Build từ root monorepo: docker build -f apps/api/Dockerfile . ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- deps: cài dependencies toàn workspace ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ai/package.json ./packages/ai/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
RUN npm install

# ---- build: biên dịch packages + api, generate prisma ----
FROM deps AS build
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm run build -w @ai-academy/types \
 && npm run build -w @ai-academy/utils \
 && npm run build -w @ai-academy/ai
RUN npm run prisma:generate -w @ai-academy/api
RUN npm run build -w @ai-academy/api

# ---- runner ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
WORKDIR /app/apps/api
EXPOSE 4000
# chạy migrate deploy rồi start (an toàn cho production)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

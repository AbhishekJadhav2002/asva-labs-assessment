FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

COPY . .

RUN npm ci

FROM deps AS builder
WORKDIR /app

RUN npm run --workspace=apps/api prisma:generate
RUN npm run --workspace=apps/api build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/apps/api/tsconfig.runtime.json ./apps/api/tsconfig.json
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/build ./apps/api/build
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

RUN mkdir -p /app/apps/api/logs && chown nodejs:nodejs /app/apps/api/logs

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', res => process.exit(res.statusCode === 200 ? 0 : 1))"

WORKDIR /app/apps/api

CMD ["node", "-r", "tsconfig-paths/register",  "build/server.js"]

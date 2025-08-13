# Backend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
# Use npm to keep it simple; replace with pnpm if preferred
RUN if [ -f package-lock.json ]; then npm ci; else npm i --production=false; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# ensure uploads dir exists
RUN mkdir -p /app/uploads
EXPOSE 4000
CMD ["node", "dist/index.js"]

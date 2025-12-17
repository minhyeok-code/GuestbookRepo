FROM node:20.11.1-alpine AS builder
WORKDIR /app

# 빌드 시 API URL 주입 (workflow에서 전달)
ARG NEXT_PUBLIC_API_URL=http://backend:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20.11.1-alpine
WORKDIR /app

# 환경변수 전달
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]

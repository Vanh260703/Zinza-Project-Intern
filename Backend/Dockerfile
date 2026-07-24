# stage1: cài toàn bộ dependencies (kể cả dev, cần cho nest build) vào trong container deps
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# stage2: tạo ra container mới và copy node_modules từ deps sang
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# stage3: tạo ra container mới và chỉ cài dependencies của production
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# stage4 : ghép thành image production nhỏ gọn
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 8000
CMD ["node", "dist/main"]

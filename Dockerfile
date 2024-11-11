# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json và package-lock.json trước để tận dụng cache
COPY package*.json ./

# Cài đặt các gói phụ thuộc
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# # Tạo Prisma Client nếu cần
RUN npx prisma generate

# Build ứng dụng
RUN npm run build

# Stage 2: Serve the application
FROM node:18-alpine

WORKDIR /app

# Copy từ build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Mở cổng ứng dụng
# EXPOSE 5000

# Lệnh để chạy ứng dụng
CMD ["npm", "run", "start:prod"]

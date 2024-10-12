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
# RUN npx prisma generate

# Build ứng dụng
RUN npm run build
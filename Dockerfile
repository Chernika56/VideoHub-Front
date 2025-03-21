# # Шаг 1: Используем образ с Node.js для сборки приложения
# FROM node:20.15.1 AS builder

# WORKDIR /app

# # Копируем package.json и устанавливаем зависимости
# COPY package.json package-lock.json ./
# RUN npm install

# # Копируем исходный код и собираем приложение
# COPY . .
# RUN npm run build

# FROM node:20.15.1 AS server

# WORKDIR /app

# # Копируем сборку Nitro + серверную часть
# COPY --from=builder /app/.output /app/.output
# COPY package.json package-lock.json ./

# RUN npm install --omit=dev
# CMD ["node", "/app/.output/server/index.mjs"]

# # Шаг 2: Используем Nginx для серверной части
# FROM nginx:alpine

# # Устанавливаем OpenSSL для генерации сертификатов
# RUN apk add --no-cache openssl

# # Генерация самоподписанного сертификата и приватного ключа
# RUN mkdir -p /etc/ssl/certs && \
#     openssl req -x509 -newkey rsa:2048 -days 365 -nodes \
#     -keyout /etc/ssl/certs/cert.key -out /etc/ssl/certs/cert.crt \
#     -subj "/CN=localhost"

# # Копируем собранное Nuxt.js приложение в директорию для статических файлов Nginx
# COPY --from=builder /app/.output/public /usr/share/nginx/html

# # Копируем конфигурацию Nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Открываем порты для HTTP и HTTPS
# EXPOSE 80 443

# RUN nginx -t

# # Запуск Nginx
# CMD ["nginx", "-g", "daemon off;"]

# Build Stage 1

FROM node:20.15.1
WORKDIR /app

# Copy package.json and your lockfile, here we add pnpm-lock.yaml for illustration
COPY package.json . 

# Install dependencies
RUN npm install

COPY . .

# Build the project
RUN npm run build

ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]


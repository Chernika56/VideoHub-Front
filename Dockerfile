FROM node:22-alpine AS build

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ARG API_BASE_URL 
RUN npm run generate

FROM nginx:stable-alpine

COPY --from=build /app/.output/public/ /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

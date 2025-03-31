FROM node:20.15.1 AS build
WORKDIR /app
COPY package.json . 
RUN npm install
COPY . .
RUN npm run build

CMD ["node", ".output/server/index.mjs"]

# FROM nginx:stable-alpine

# COPY --from=build /app/.output /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 3000
# CMD ["nginx", "-g", "daemon off;"]



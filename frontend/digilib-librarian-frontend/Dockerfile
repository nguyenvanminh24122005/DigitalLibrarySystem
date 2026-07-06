FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
ARG VITE_API_BASE_URL=http://localhost:5000
ARG VITE_ADMIN_URL=
ARG VITE_USER_URL=
ARG VITE_ADMIN_PORTAL_URL=
ARG VITE_READER_PORTAL_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
ENV VITE_USER_URL=$VITE_USER_URL
ENV VITE_ADMIN_PORTAL_URL=$VITE_ADMIN_PORTAL_URL
ENV VITE_READER_PORTAL_URL=$VITE_READER_PORTAL_URL
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

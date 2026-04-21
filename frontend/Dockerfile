# Dockerfile — Multi-stage build for GoalsTracker frontend.
# Builds Angular app, then serves via Nginx.

FROM node:20-alpine AS build
WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx ng build --configuration production

# Serve stage
FROM nginx:alpine AS runtime

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

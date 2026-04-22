# Dockerfile — Multi-stage build for GoalsTracker frontend.
# Builds Tailwind CSS, then Angular app, then serves via Nginx.

FROM node:20-alpine AS build
WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build Tailwind CSS (required — Angular doesn't process @plugin "daisyui")
RUN npx tailwindcss -i src/styles.css -o src/styles.built.css

# Build Angular for production
RUN npx ng build --configuration production

# Serve stage
FROM nginx:alpine AS runtime

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

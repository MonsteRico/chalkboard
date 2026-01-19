# Build stage
FROM oven/bun:latest AS builder

# Set working directory to match project structure
WORKDIR /app/ClientApp

# Accept build argument for backend URL
ARG VITE_BACKEND_URL=ws://localhost:3000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy shared types directory (needed for compilation)
# This maintains the ../../../shared relative path structure
COPY shared/ /app/shared/

# Copy package files
COPY ClientApp/package.json ClientApp/bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY ClientApp/ .

# Build the application
RUN bun run build

# Production stage - use a lightweight web server
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional, for SPA routing)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

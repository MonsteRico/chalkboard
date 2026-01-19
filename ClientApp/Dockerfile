# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy shared types (needed for imports)
COPY shared ./shared

# Copy package files
COPY ClientApp/package.json ClientApp/bun.lock* ./ClientApp/

# Install dependencies
WORKDIR /app/ClientApp
RUN bun install --frozen-lockfile

# Copy application code
COPY ClientApp ./

# Create symlink so shared directory can resolve zod from node_modules
# This helps TypeScript resolve zod when compiling shared/types/validation.ts
RUN cd /app/shared && ln -s ../ClientApp/node_modules node_modules 2>/dev/null || true

# Build the application
RUN bun run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/ClientApp/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
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

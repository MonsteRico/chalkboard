FROM oven/bun:latest

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

# Expose port (default 4173 for vite preview, can be overridden via PORT env var)
EXPOSE 4173

# Run vite preview to serve the built app
CMD ["bun", "run", "preview"]

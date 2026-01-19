FROM oven/bun:latest

WORKDIR /app

# Copy shared types (needed for imports)
COPY shared ./shared

# Copy package files
COPY BackendApp/package.json BackendApp/bun.lock* ./BackendApp/

# Install dependencies
WORKDIR /app/BackendApp
RUN bun install --frozen-lockfile

# Copy application code
COPY BackendApp ./

# Expose port (default 3000, can be overridden via PORT env var)
EXPOSE 3000

# Run the server
CMD ["bun", "run", "server.ts"]

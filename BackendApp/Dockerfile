# Use Bun official image
FROM oven/bun:latest

# Set working directory to match project structure
WORKDIR /app/BackendApp

# Copy shared types directory (needed for compilation)
# This maintains the ../shared relative path structure
COPY shared/ /app/shared/

# Copy package files
COPY BackendApp/package.json BackendApp/bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY BackendApp/ .

# Expose port (default 3000, can be overridden via PORT env var)
EXPOSE 3000

# Run the server
CMD ["bun", "run", "server.ts"]

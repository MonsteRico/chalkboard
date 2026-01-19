# Deployment Guide

This project uses Docker Compose for easy deployment.

## Prerequisites

- Docker and Docker Compose installed
- Caddy installed (for reverse proxy with automatic HTTPS)

## Quick Start

1. **Build and start the containers:**
   ```bash
   docker-compose up -d --build
   ```

2. **Configure Caddy:**
   - Place the `Caddyfile` in your Caddy configuration directory
   - Or run Caddy with: `caddy run --config Caddyfile`
   - Make sure Caddy has access to ports 80 and 443

3. **Access the application:**
   - Frontend: https://chalkboard.matthewgardner.dev
   - Backend WebSocket: Automatically handled via Caddy at `/ws/*`

## Port Mappings

- **Backend**: Host port `8100` → Container port `3000`
- **Frontend**: Host port `8101` → Container port `4173` (Vite preview)

## Environment Variables

### Backend
- `PORT`: Server port (default: `3000`)

### Frontend
- `PORT`: Vite preview port (default: `4173`)
- `VITE_WS_URL`: WebSocket URL (optional, auto-detected from browser location)

## Development

For local development without Docker:

1. **Backend:**
   ```bash
   cd BackendApp
   bun install
   bun run server.ts
   ```

2. **Frontend:**
   ```bash
   cd ClientApp
   bun install
   bun run dev
   ```

## Notes

- The WebSocket connection automatically uses `wss://` when accessed via HTTPS
- Caddy handles automatic HTTPS certificate provisioning via Let's Encrypt
- The frontend automatically detects the WebSocket URL based on the current domain

# Docker Deployment Guide

This guide explains how to deploy the Chalkboard application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic knowledge of Docker commands

## Quick Start

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** (optional - defaults work for local development):
   - `BACKEND_PORT`: Port for the backend server (default: 3000)
   - `FRONTEND_PORT`: Port for the frontend (default: 5173)
   - `VITE_BACKEND_URL`: WebSocket URL for frontend to connect to backend
     - For Docker: `ws://backend:3000` (uses service name)
     - For local dev: `ws://localhost:3000`
     - For production with SSL: `wss://your-domain.com`

3. **Build and start the containers:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173 (or your configured `FRONTEND_PORT`)
   - Backend WebSocket: ws://localhost:3000 (or your configured `BACKEND_PORT`)

## Docker Commands

### Start services
```bash
docker-compose up
```

### Start services in detached mode (background)
```bash
docker-compose up -d
```

### Rebuild and start
```bash
docker-compose up --build
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Restart a specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Architecture

- **Backend**: Bun server running on port 3000 (configurable via `BACKEND_PORT`)
- **Frontend**: Vite app built and served via nginx on port 80 (mapped to host port via `FRONTEND_PORT`)
- **Network**: Both services communicate via Docker bridge network `chalkboard-network`

## Reverse Proxy Setup (Caddy)

The project includes example Caddy configurations for reverse proxying:

### Using Caddyfile

1. **Set your ports in `.env`:**
   ```env
   BACKEND_PORT=3000
   FRONTEND_PORT=5173
   ```

2. **Copy and customize `Caddyfile.example`:**
   ```bash
   cp Caddyfile.example Caddyfile
   ```

3. **Update the Caddyfile** with your domain and ports:
   ```caddy
   your-domain.com {
       handle /ws/* {
           reverse_proxy localhost:3000 {
               header_up Connection "Upgrade"
               header_up Upgrade "websocket"
           }
       }
       
       handle {
           reverse_proxy localhost:5173
       }
   }
   ```

4. **Start Caddy:**
   ```bash
   caddy run
   ```

### Port Configuration

The Docker containers expose ports that you can configure via `.env`:

- **`BACKEND_PORT`**: Port for backend WebSocket server (default: 3000)
  - Accessible at `ws://localhost:${BACKEND_PORT}/ws/*`
  - Use this in Caddy to proxy WebSocket traffic

- **`FRONTEND_PORT`**: Port for frontend HTTP server (default: 5173)
  - Accessible at `http://localhost:${FRONTEND_PORT}`
  - Use this in Caddy to proxy HTTP traffic

**Example Caddy configuration** (update ports to match your `.env`):
```caddy
chalkboard.example.com {
    # WebSocket proxy to backend
    handle /ws/* {
        reverse_proxy localhost:3000 {
            header_up Connection "Upgrade"
            header_up Upgrade "websocket"
        }
    }
    
    # HTTP proxy to frontend
    handle {
        reverse_proxy localhost:5173
    }
}
```

See `Caddyfile.example` for a complete example with comments.

## Production Deployment

For production deployment:

1. **Update `.env` file:**
   ```env
   VITE_BACKEND_URL=wss://your-backend-domain.com
   BACKEND_PORT=3000
   FRONTEND_PORT=5173
   ```

2. **Set up Caddy reverse proxy** (see above) or use another reverse proxy (nginx, Traefik, etc.) to handle SSL termination

3. **Consider using Docker secrets** for sensitive environment variables

4. **Set up proper logging** and monitoring

## Troubleshooting

### Frontend can't connect to backend
- Ensure `VITE_BACKEND_URL` in `.env` matches your deployment setup
- In Docker, use service name `backend` instead of `localhost`
- Check that both containers are on the same network

### Port conflicts
- Change `BACKEND_PORT` or `FRONTEND_PORT` in `.env` if ports are already in use

### Rebuild after code changes
```bash
docker-compose up --build
```

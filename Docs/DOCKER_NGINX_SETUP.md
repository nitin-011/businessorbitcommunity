# Docker & Nginx Setup Guide

This document explains the architecture, configuration, and execution of the Docker and Nginx setup for the Business Orbit Community project.

## 1. Architecture Overview
The project is containerized using Docker Compose. It utilizes a microservice-style architecture with the following components:
- **Nginx (Reverse Proxy)**: Acts as the single entry point for the application. It receives all HTTP requests and routes them to the appropriate backend or frontend containers.
- **Frontend (Next.js)**: The React/Next.js UI.
- **Backend (Node.js/Express)**: The core API server.

When scaling is enabled, Docker's internal DNS automatically load-balances requests across multiple instances of the frontend and backend containers.

---

## 2. Docker Compose Configuration (`docker-compose.yml`)
The setup is orchestrated by `docker-compose.yml`, which defines three services:

1. **`nginx`**
   - **Image**: `nginx:alpine` (a lightweight Nginx image).
   - **Ports**: Maps `8080:80`. Port `8080` on the host machine is forwarded to port `80` inside the Nginx container. *Note: Port `8080` is used to allow secure execution under Rootless Docker without requiring `sudo` privileges.*
   - **Volumes**: Mounts `./nginx/nginx.conf` as a read-only (`ro`) configuration file.
   - **Depends On**: Ensures `frontend` and `backend` containers start before Nginx.

2. **`backend`**
   - **Build Context**: Builds the image using `backend/Dockerfile`.
   - **Expose**: Exposes port `8001` internally to the Docker network (not to the host).
   - **Environment**: Reads variables from `backend/.env`.

3. **`frontend`**
   - **Build Context**: Builds the image using `frontend/Dockerfile`.
   - **Expose**: Exposes port `3000` internally to the Docker network.
   - **Environment**: Reads variables from `frontend/.env`.

---

## 3. Nginx Configuration (`nginx/nginx.conf`)
Nginx is configured to serve as a high-performance reverse proxy. Key configurations include:

- **Security Headers**: Injects `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy` into all responses to secure the application.
- **Gzip Compression**: Compresses text, JSON, and JavaScript responses to reduce bandwidth and improve loading speeds.
- **Routing**:
  - `location /api/`: Intercepts any request starting with `/api/` and proxies it to the internal `http://backend:8001`. It preserves headers like `X-Real-IP` and properly handles WebSocket upgrades.
  - `location /`: Routes all other traffic to the Next.js frontend at `http://frontend:3000`.

---

## 4. Environment Variables

To run the Docker setup successfully, you must have two `.env` files.

### Backend (`backend/.env`)
```env
# Required for security. Must be at least 32 characters long.
JWT_SECRET=your_super_secret_jwt_key_here_12345

# MongoDB connection. If running MongoDB natively on your computer (outside Docker),
# use host.docker.internal instead of localhost.
# Example: mongodb://host.docker.internal:27017/business_orbit
# If using MongoDB Atlas, just use your mongodb+srv:// URL.
MONGO_URL=mongodb+srv://...

# Ports and networking
PORT=8001
CORS_ORIGINS=*
NODE_ENV=production

# Other necessary variables (Cloudinary, PhonePe, SMTP)
# ...
```

### Frontend (`frontend/.env`)
```env
# Crucial for Docker/Nginx: Leave this blank ("").
# This forces the frontend to make API calls to the relative path `/api`, 
# which Nginx intercepts and forwards to the backend containers.
NEXT_PUBLIC_API_URL=""
NODE_ENV=production
```

---

## 5. Running and Scaling (`run.sh`)

We use a custom wrapper script (`run.sh`) to start the project. This script abstracts away Docker Compose commands and handles graceful shutdowns.

### Starting the Project
To start the project with Docker and scale the frontend and backend services:
```bash
./run.sh --docker --scale 3
```
- `--docker`: Instructs the script to use `docker-compose` instead of running Node locally.
- `--scale <N>`: Spins up `<N>` instances of the backend and frontend containers. Nginx will automatically round-robin traffic between them.

### Stopping the Project
When you press `Ctrl+C` or close the terminal, the script's built-in `trap` intercepts the termination signal and automatically runs `docker compose down`. This ensures that all containers, networks, and scaled replicas are safely destroyed and do not run orphaned in the background.

---

## 6. Important Note on Docker Contexts
The project is optimized for **Rootless Docker**.
- **Rootless Context (`rootless`)**: Runs the Docker daemon as your standard user. This prevents permission errors, provides excellent performance on Linux, and does not require `sudo`. Because of this, the Nginx port is mapped to `8080` instead of the privileged port `80`.
- Access the application at **`http://localhost:8080`**.

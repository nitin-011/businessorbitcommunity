# Production Deployment Guide

This guide details the infrastructure, environment configuration, database setup, and production scaling aspects for the Business Orbit Community application. It is intended for DevOps engineers and system administrators deploying the stack.

---

## Infrastructure, Docker & Nginx

This project uses a containerized architecture orchestrated by Docker Compose, with Nginx acting as a secure reverse proxy for the frontend and backend services.

### Multi-Stage Docker Builds
The application utilizes multi-stage Docker builds to keep the production images lightweight and secure:

*   **Frontend (`frontend/Dockerfile`)**: The frontend leverages the Next.js `standalone` output feature. The build stage compiles the application, while the runner stage copies only the minimal necessary files (`.next/standalone`, `public`, and `.next/static`) and exposes port `3000`.
*   **Backend (`backend/Dockerfile`)**: The backend isolates the build environment from the runtime. After compiling the application, the runner stage uses `npm ci --only=production` to install exclusively production dependencies, ensuring a smaller attack surface, and exposes port `8001`.

### Nginx Reverse Proxy Configuration
The production Nginx configuration (`nginx/nginx.prod.conf`) serves as the main entry point, handling security, performance optimization, and request routing:

*   **Routing (Upstream Proxies)**:
    *   API requests matching `/api/` are routed to the backend service via `proxy_pass http://backend:8001;`.
    *   All other requests matching `/` are routed to the frontend service via `proxy_pass http://frontend:3000;`.
*   **SSL & Security**: Enforces modern SSL protocols (`ssl_protocols TLSv1.2 TLSv1.3;`) and redirects all incoming HTTP traffic on port 80 to HTTPS using a `301` redirect (`return 301 https://$host$request_uri;`).
*   **Rate Limiting**: Protects the API routes from abuse by implementing a request limit zone (`limit_req_zone`). It restricts traffic to `30r/s` per IP address with a burst allowance of `50` requests for the `/api/` location block.
*   **Gzip Compression**: Enabled globally (`gzip on;`) with a compression level of `6` (`gzip_comp_level 6;`) for text-based MIME types to minimize payload sizes and improve load times.

### Docker Compose Setup
The `docker-compose.yml` file defines the relationship, network, and deployment rules for the services:

*   **Services & Dependencies**: It defines the `nginx`, `backend`, and `frontend` services. The `nginx` proxy explicitly waits for both the frontend and backend to start using the `depends_on` directive.
*   **Port Mappings**: The `nginx` container maps the host's port `8080` to the container's port `80` (`"8080:80"`). The `frontend` and `backend` services expose port `8080` internally to the Docker network (overriding their default Dockerfile ports via environment variables).
*   **Restart Policies**: All services are configured with `restart: unless-stopped`, ensuring they automatically restart if they crash or if the Docker daemon restarts, providing a resilient deployment architecture.

---

## Environment Variables & Integrations

The deployment relies on several environment variables across the frontend and backend, managing everything from routing to third-party integrations.

### Frontend Environment
Defined in `frontend/.env` (and injected at build time for the browser):

*   **`NEXT_PUBLIC_API_URL`**: Critical for Axios routing, this defines the base URL the frontend uses to communicate with the backend API.
*   **`NODE_ENV`**: Must be set to `production` for optimized builds.

### Backend Core
Parsed, validated, and managed by `backend/src/config/env.ts`:

*   **`PORT`**: The port the backend service binds to (defaults to `8001`).
*   **`MONGO_URL`**: The MongoDB connection string.
*   **`DB_NAME`**: The target database name.
*   **`JWT_SECRET`**: Required for secure session tokens. The application enforces a strict security check: it **must be >= 32 characters** and **cannot be the placeholder** `"your_jwt_secret_here"`, otherwise the server will refuse to start.

### Initial Setup Envs
*   **`ADMIN_EMAIL`**: Default admin email used during database seeding (defaults to `admin@businessorbit.com`).
*   **`ADMIN_PASSWORD`**: Default admin password for the initial setup (defaults to `Admin@12345`).

### Email (SMTP)
Configures the outgoing mail server for platform notifications:
*   **`SMTP_HOST`**
*   **`SMTP_PORT`**
*   **`SMTP_USER`**
*   **`SMTP_PASS`**
*   **`SENDER_EMAIL`**

### Integrations

**Cloudinary**
Handles media and file uploads:
*   **`CLOUDINARY_URL`**
*   **`CLOUDINARY_CLOUD_NAME`**
*   **`CLOUDINARY_API_KEY`**
*   **`CLOUDINARY_API_SECRET`**

**PhonePe Standard Checkout SDK**
Handles payment processing:
*   **`PHONEPE_MERCHANT_ID`**
*   **`PHONEPE_CLIENT_ID`**
*   **`PHONEPE_CLIENT_SECRET`**
*   **`PHONEPE_ENV`** (e.g., `UAT` for testing or `PRODUCTION`)

---

## Database Setup & Production Scaling

### Database Provisioning
This application requires a MongoDB cluster (such as MongoDB Atlas) for data persistence. For the application to connect successfully, you must configure network peering or explicitly whitelist your deployed server's IP address within your MongoDB provider's network access settings.

### Initial Data Seeding
Once the application is running, you can seed the database with the necessary default accounts. You can safely run the included seeder script:

```bash
./.agents/scripts/seed-e2e-data.sh
```

This script safely injects the default Admin account (`e2e-admin@businessorbit.network`) and an E2E Community Member into the database. Because the script relies on `upsert` operations, it can be run multiple times without duplicating or corrupting existing records.

### Scaling Considerations
The deployment stack is built to be resilient and highly performant:
- **Nginx Proxy**: Nginx sits in front of the application to handle rate limiting (capped at 30 requests/s) and provides static asset gzip compression to reduce payload sizes.
- **Container Reliability**: The backend and frontend Docker containers are configured with `restart: unless-stopped`, ensuring they automatically recover from unexpected failures or server reboots.
- **Next.js Optimization**: The Next.js frontend is configured for `standalone` mode. This strips out unused dependencies, significantly reducing the final container size and improving boot times.
- **Asset Management**: Media assets are offloaded directly to Cloudinary. This strategy drastically reduces disk I/O on the application server and offloads bandwidth usage to a global CDN.

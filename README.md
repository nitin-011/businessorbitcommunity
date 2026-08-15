# Business Orbit Community

## Project Architecture
This project is built with a modern web architecture:
- **Frontend**: Next.js (React)
- **Backend**: Node.js with Express
- **Database**: MongoDB

## Local Development
To run both the frontend and backend locally in an interactive mode, you can use the provided run script:

```bash
./run.sh -i
```

This will start both applications concurrently in your terminal.

## Environment Variables
The following environment variables are required to run the application correctly. You need to create `.env` files in both the frontend and backend directories.

### Backend (`backend/.env`)
```
MONGO_URL=mongodb://localhost:27017/businessorbit
# DEVELOPMENT ONLY. For production, generate a cryptographically random secret.
JWT_SECRET=your_jwt_secret_here
ADMIN_EMAIL=admin@businessorbit.com
ADMIN_PASSWORD=Admin@12345
# Add other required backend environment variables here...
```

You can initialize the first admin account by running:
```bash
cd backend && npx ts-node scripts/seed_admin.ts
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Production Deployment
For production deployment, we use Docker and Docker Compose. To deploy the application in a production environment:

1. Ensure Docker and Docker Compose are installed on your system.
2. Ensure you have the necessary environment variables configured correctly.
3. Run the following command from the root of the project to build and start the containers:

```bash
docker-compose up -d --build
```

# Environment Variables Guide

This document outlines the core environment variables required for the production deployment of the Business Orbit Community application, including examples and their exact usage across the codebase.

NEXT_PUBLIC_API_URL:
    e.g. `https://api.businessorbit.com`
    this is used in `frontend/lib/api.ts` to configure the base URL for the Axios client, determining exactly where the frontend sends all of its API requests

NODE_ENV:
    e.g. `production`
    this is used implicitly by Next.js and Node.js across the stack to detect if the app is in production mode, which disables dev-tools and enables performance optimizations

PORT:
    e.g. `8001`
    this is used in `backend/src/server.ts` to define the specific network port where the Express backend binds and listens for incoming traffic

MONGO_URL:
    e.g. `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true`
    this is used in `backend/src/config/database.ts` as the primary connection string to securely authenticate and link the backend to your MongoDB Atlas cluster

DB_NAME:
    e.g. `business_orbit`
    this is used in `backend/src/config/database.ts` to specify the exact database namespace inside the MongoDB cluster where documents should be read and written

CORS_ORIGINS:
    e.g. `https://businessorbit.com,http://localhost:3000`
    this is used in `backend/src/server.ts` by the `cors` middleware to enforce a strict security whitelist of frontend domains allowed to make cross-origin HTTP requests

FRONTEND_URL:
    e.g. `https://businessorbit.com`
    this is used in `backend/src/modules/community/card.controller.ts` to dynamically construct fully-qualified redirection URLs (success or failure pages) to send the user back to the frontend after a PhonePe transaction

API_URL:
    e.g. `https://api.businessorbit.com`
    this is used in `backend/src/modules/community/card.controller.ts` to dynamically construct the webhook callback URL, telling the PhonePe gateway exactly where to send the server-to-server (S2S) payment status updates

SMTP_HOST:
    e.g. `smtp.gmail.com`
    this is used in `backend/src/utils/email.ts` to point the Nodemailer transport to your specific outgoing mail provider's server

SMTP_PORT:
    e.g. `587`
    this is used in `backend/src/utils/email.ts` to define the network port for the SMTP connection (typically 587 for TLS or 465 for SSL encryption)

SMTP_USER:
    e.g. `noreply@businessorbit.com`
    this is used in `backend/src/utils/email.ts` to authenticate your username or email address with the SMTP mail server provider

SMTP_PASS:
    e.g. `abcd efgh ijkl mnop`
    this is used in `backend/src/utils/email.ts` as the secure app password to authorize the connection with the SMTP mail server

SENDER_EMAIL:
    e.g. `noreply@businessorbit.com`
    this is used in `backend/src/utils/email.ts` to define the default "From" address that users will see when they receive platform notification emails

CLOUDINARY_CLOUD_NAME:
    e.g. `dbomrpvlf`
    this is used in `backend/src/config/cloudinary.ts` to uniquely link the Cloudinary backend SDK to your specific media storage workspace

CLOUDINARY_API_KEY:
    e.g. `725421567883322`
    this is used in `backend/src/config/cloudinary.ts` as the public identifier to authenticate your application's requests to upload or delete media

CLOUDINARY_API_SECRET:
    e.g. `xe9nr9-Dp7MQ4mMf68k7i6bGPgc`
    this is used in `backend/src/config/cloudinary.ts` as the private signature key to securely sign and authorize administrative Cloudinary API requests

CLOUDINARY_URL:
    e.g. `cloudinary://725421567883322:xe9nr9-Dp7MQ4mMf68k7i6bGPgc@dbomrpvlf`
    this is used in `backend/src/modules/community/controller.ts` to provide the raw, fully constructed connection string for advanced Cloudinary operations

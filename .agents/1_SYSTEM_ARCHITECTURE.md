# System Architecture & Tech Stack

## Overview
Business Orbit Community is a full-stack platform built with a clear separation between a Next.js frontend and a Node.js/Express backend. 

## Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, TanStack React Query v5, Axios.
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB).
- **Database**: MongoDB (Atlas/Local depending on env).
- **Integrations**: 
  - **Payments**: PhonePe PG SDK
  - **Images**: Cloudinary
  - **Email**: Nodemailer (SMTP)
- **Deployment**: Dockerized with Nginx reverse proxy.

## Directory Structure

### `backend/`
Follows a Domain-Driven Design (DDD) module pattern rather than flat MVC:
- `src/models/`: Mongoose schemas defining the data layer.
- `src/modules/`: Contains business logic grouped by domain (`admin/`, `auth/`, `business/`, `community/`, `upload/`). Each module typically contains its own `controller.ts` and `routes.ts`.
- `src/middleware/`: Express middlewares, most notably `auth.ts` for role-based access control.
- `src/utils/`: Shared helpers (`jwt.ts`, `email.ts`, `password.ts`).

### `frontend/`
Follows Next.js App Router conventions:
- `app/(site)/`: A Route Group for all public-facing pages (`/community`, `/orbit-card`, `/business`). Shares a public layout/navbar.
- `app/admin/`: A separate routing tree for the authenticated admin dashboard. Uses `AuthContext.tsx` to guard routes.
- `components/`: Pure, presentational React components (e.g., `Hero.tsx`, `OrbitCardVisual.tsx`).
- `lib/api.ts`: Centralized networking layer. All API calls route through Axios instances here.

## Key Architectural Decisions
1. **Cookie-based Auth**: JWTs are issued via `httpOnly` cookies, keeping them secure from XSS. The frontend does not manage token strings directly.
2. **Module Independence**: Backend features are isolated. Community logic does not bleed into Admin logic unless explicitly crossing boundaries via well-defined models.
3. **Optimistic UI via React Query**: The frontend heavily relies on React Query for caching, background fetching, and mutation invalidation to keep the UI snappy and in sync with the backend.

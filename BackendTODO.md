# Backend Integration TODOs

This document outlines all the necessary backend additions and modifications required to fully integrate with the existing Next.js frontend and implement the features scaffolded in the UI.

## 1. Community Directory (`/community`)

The frontend currently uses a mock data array and fake authentication for the `/community` page. We need to implement a real member directory and authentication system.

### Data Model & Sync
- [ ] **Create `CommunityMember` Model**: 
  - Fields: `name`, `role`, `bio`, `linkedin`, `instagram`, `phone`, `email` (unique), `password` (hashed), `photoUrl`, `status`.
- [ ] **Automated Sync from Applications**: 
  - Update `PATCH /api/admin/approve/:type/:id` in `backend/src/modules/admin/controller.ts`.
  - When a `Student` or `Business` is approved, automatically create a `CommunityMember` record.
  - Map the `Business` model's `role` field (which the frontend uses for LinkedIn/Website) to the `CommunityMember`'s `linkedin` or website field appropriately.
- [ ] **Welcome/Setup Email**:
  - Upon approval, send an email to the user with a temporary password or a setup link to configure their profile and password.

### API Endpoints
- [ ] **`POST /api/community/login`**: Implement authentication for community members. Return an `access_token` and `refresh_token` as `httpOnly` cookies (similar to Admin auth).
- [ ] **`GET /api/community/members`**: 
  - Implement the member directory fetch. 
  - Return objects matching the frontend's `CommunityMemberCard` shape: `{ name, role, bio, linkedin, instagram, phone, email, photoUrl? }`.
  - Add pagination, search, and filtering capabilities.
- [ ] **`PATCH /api/community/profile`**: (Optional but necessary eventually) Endpoint for members to update their bio, social links, and upload a `photoUrl`.

## 2. Orbit Card Checkout (`/orbit-card/checkout`)

The frontend order form is fully mocked and needs to be replaced with real order persistence and PhonePe payment gateway integration.

### Data Model
- [ ] **Create `OrbitCardOrder` Model**:
  - Fields: `fullName`, `phone`, `email`, `companyAndDesignation` (maps to `formData.company` from the UI), `addressLine1`, `addressLine2`, `landmark`, `city`, `state`, `pincode`, `gstin`.
  - Payment Fields: `status` (PENDING, SUCCESS, FAILED), `paymentId`, `amount` (₹9,999).
  - *Note*: `fullName` and `companyAndDesignation` are printed directly on the physical card. The backend needs a mechanism to export these (e.g., CSV export for the printing provider or an API integration).

### API Endpoints & PhonePe Integration
- [ ] **Install PhonePe SDK**: Run `npm install @phonepe-pg/pg-sdk-node` in the backend.
- [ ] **Environment Variables**: Add `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`, and `PHONEPE_ENV` to `config/env.ts`.
- [ ] **`POST /api/orbit-card/checkout`**:
  - Validate form data.
  - Create an `OrbitCardOrder` with `status: 'PENDING'`.
  - Initialize the PhonePe SDK `StandardCheckoutClient`.
  - Generate a payment link and return it to the frontend for redirection.
- [ ] **`POST /api/orbit-card/webhook`**:
  - Server-to-Server (S2S) callback endpoint for PhonePe.
  - Verify the `X-VERIFY` header to ensure authenticity.
  - Update the corresponding `OrbitCardOrder` status to `SUCCESS` or `FAILED`.
  - Trigger any post-payment actions (e.g., confirmation email, card production queue).

## 3. General & Architecture Refinements

- [ ] **Frontend Environment Variables**: Ensure the frontend has `NEXT_PUBLIC_API_URL` correctly configured to point to the backend once it's deployed.
- [ ] **Email Configuration**: The local backend gracefully no-ops email sending if `SENDGRID_API_KEY` is missing. Provide a valid key in the `.env` file to ensure welcome, OTP, and community setup emails actually send.
- [ ] **"Join as Student" URL**: The `/join` route and "Join as Student" CTA are currently missing or return 404. Once the real student platform URL is provided, wire up the redirects on the frontend.
- [ ] **Frontend Network State Wiring**: 
  - Update `app/community/page.tsx` to replace the mock delays with real TanStack Query fetches.
  - Update `app/orbit-card/checkout/page.tsx` to handle the real payment redirect flow instead of the simulated modal.

# Product Requirements Document (PRD): Backend Integration & Enhancements

## 1. Objective
The goal of this project is to implement the missing backend services required to fully integrate with the Next.js frontend of the Business Orbit Community platform. This includes building out a secure community member directory, processing Orbit Card purchases via PhonePe, handling profile photo uploads via Cloudinary, and establishing a robust unit/integration testing suite using Jest and Supertest.

## 2. Scope
This PRD covers the backend additions strictly necessary to make the scaffolded frontend components fully functional and production-ready.

**In Scope:**
- `CommunityMember` data model and authentication.
- Automated creation of `CommunityMember` accounts upon application approval.
- Member profile updates, including Cloudinary image uploads.
- `OrbitCardOrder` data model.
- PhonePe PG Node.js SDK integration for payment processing.
- Orbit Card order fulfillment endpoints (Admin CSV export).
- Automated email notifications (SendGrid).
- Unit and integration tests (Jest + Supertest).

**Out of Scope:**
- Implementing a real student join platform (handled externally, frontend redirect only).
- Frontend UI redesigns or major component changes.

---

## 3. Functional Requirements

### 3.1 Community Directory (`/api/community`)
- **Data Synchronization**: When an Admin approves a `Student` or `Business` application, the system must automatically create a `CommunityMember` record.
- **Member Authentication**: Community Members must be able to securely log in using an email and password. Auth tokens will be distributed as `httpOnly` cookies.
- **Profile Management**: Members can update their bio, social links (LinkedIn, Instagram), and upload a profile picture.
- **Photo Uploads**: Profile pictures must be uploaded to Cloudinary, and the returned secure URL stored in the `photoUrl` field of the member's profile.
- **Directory Retrieval**: A public (or member-only) endpoint must return a list of active community members matching the frontend `CommunityMemberCard` properties. Support for pagination and search must be included.

### 3.2 Orbit Card Checkout (`/api/orbit-card`)
- **Order Capture**: The backend must capture user details submitted via the `/orbit-card/checkout` form. Crucial fields like `fullName` and `companyAndDesignation` must be preserved exactly as entered for card printing.
- **Payment Gateway**: Integration with the PhonePe Business Payment Gateway using the official `@phonepe-pg/pg-sdk-node` package.
- **Webhook Handling**: A Server-to-Server (S2S) webhook endpoint must securely verify the `X-VERIFY` signature from PhonePe and update the order status (`SUCCESS` or `FAILED`).
- **Post-Payment Actions**: On a successful payment, the backend must dispatch a confirmation email to the user.
- **Order Fulfillment**: Admins must be able to export a CSV of successful `OrbitCardOrder`s from the admin dashboard to send to the card printing provider.

### 3.3 Testing Requirements
- **Framework**: Jest and Supertest.
- **Coverage**: All newly created controllers (`community`, `orbit-card`) must have unit tests for business logic and integration tests for API endpoints.
- **Mocking**: External services like PhonePe, Cloudinary, and SendGrid must be mocked in the test environment to prevent side effects and network latency.

---

## 4. Technical Architecture

### 4.1 Data Models (Mongoose)

**`CommunityMember`**
- `name` (String, required)
- `role` (String) - Maps from Business application or generic description.
- `bio` (String)
- `linkedin` (String)
- `instagram` (String)
- `phone` (String)
- `email` (String, required, unique)
- `password` (String, required) - bcrypt hashed.
- `photoUrl` (String) - Cloudinary URL.
- `status` (Enum: active, inactive)

**`OrbitCardOrder`**
- `fullName` (String, required)
- `phone` (String, required)
- `email` (String, required)
- `companyAndDesignation` (String, required)
- `addressLine1` (String, required)
- `addressLine2` (String)
- `landmark` (String)
- `city` (String, required)
- `state` (String, required)
- `pincode` (String, required)
- `gstin` (String)
- `status` (Enum: PENDING, SUCCESS, FAILED)
- `paymentId` (String) - PhonePe transaction reference.
- `amount` (Number) - Constant 9999.

### 4.2 API Endpoints Map

**Community**
- `POST /api/community/login` - Member authentication.
- `GET /api/community/members` - Fetch paginated directory.
- `PATCH /api/community/profile` - Update profile details.
- `POST /api/community/profile/photo` - Cloudinary upload endpoint.

**Orbit Card**
- `POST /api/orbit-card/checkout` - Create order, init PhonePe, return redirect URL.
- `POST /api/orbit-card/webhook` - S2S PhonePe callback.

**Admin**
- `GET /api/admin/orbit-card/export` - Export successful orders as CSV.

---

## 5. Detailed Task Breakdown (Vertical Slices)

### Slice 1: Project Foundation & Testing Setup
- [ ] Task 1.1: Install `jest`, `supertest`, `@types/jest`, `ts-jest` and initialize the Jest configuration.
- [ ] Task 1.2: Set up a dedicated test database connection or in-memory MongoDB server for testing.
- [ ] Task 1.3: Add `CLOUDINARY_URL`, `PHONEPE_*`, and `SENDGRID_API_KEY` configurations to `config/env.ts`.

### Slice 2: Community Member Directory (End-to-End)
- [ ] Task 2.1: Define the `CommunityMember` Mongoose schema and model.
- [ ] Task 2.2: Implement the `GET /api/community/members` endpoint with pagination and search.
- [ ] Task 2.3: Write unit and integration tests for the directory endpoint.
- [ ] Task 2.4: **Frontend Wiring:** Update `app/community/page.tsx` to replace the mock array with a real TanStack Query fetch to the new endpoint.

### Slice 3: Community Application Sync & Auth (End-to-End)
- [ ] Task 3.1: Modify the Admin approval controller (`PATCH /api/admin/approve/:type/:id`) to automatically create a `CommunityMember` record.
- [ ] Task 3.2: Implement email notification using SendGrid to send a setup link to the newly approved member.
- [ ] Task 3.3: Implement the `POST /api/community/login` endpoint issuing JWT cookies.
- [ ] Task 3.4: Write unit and integration tests for the sync mechanism and login flow.
- [ ] Task 3.5: **Frontend Wiring:** Wire the community login form in `app/community/page.tsx` to use the real login endpoint.

### Slice 4: Member Profiles & Photo Uploads (End-to-End)
- [ ] Task 4.1: Install `cloudinary` and `multer`. Configure Multer for in-memory uploads.
- [ ] Task 4.2: Implement `POST /api/community/profile/photo` to handle image upload, stream to Cloudinary, and save the URL.
- [ ] Task 4.3: Implement `PATCH /api/community/profile` for standard text field updates.
- [ ] Task 4.4: Write tests for profile updates, mocking the Cloudinary uploader.
- [ ] Task 4.5: **Frontend Wiring:** (If UI exists/is planned) Wire profile update forms to the real endpoints.

### Slice 5: Orbit Card Order Capture & PhonePe (End-to-End)
- [ ] Task 5.1: Define the `OrbitCardOrder` Mongoose schema and model.
- [ ] Task 5.2: Install `@phonepe-pg/pg-sdk-node` and initialize the PhonePe client.
- [ ] Task 5.3: Implement `POST /api/orbit-card/checkout` to validate payload, save a `PENDING` order, and generate a PhonePe payment URL.
- [ ] Task 5.4: Write tests for order creation and validate PhonePe SDK initialization behavior.
- [ ] Task 5.5: **Frontend Wiring:** Update `app/orbit-card/checkout/page.tsx` to call the checkout endpoint and handle the redirect to PhonePe.

### Slice 6: PhonePe Webhook & Post-Payment Fulfillment
- [ ] Task 6.1: Implement `POST /api/orbit-card/webhook` to handle PhonePe callbacks and ensure robust `X-VERIFY` signature validation.
- [ ] Task 6.2: On successful validation, update order `status` to `SUCCESS` and trigger a confirmation email via SendGrid.
- [ ] Task 6.3: Write tests for the webhook, simulating correct and incorrect `X-VERIFY` headers.

### Slice 7: Admin Export
- [ ] Task 7.1: Implement `GET /api/admin/orbit-card/export` (protected by admin middleware) to export successful orders using a CSV stringifier.
- [ ] Task 7.2: **Frontend Wiring:** Add an "Export Orders" button to the admin dashboard (`app/admin/page.tsx`) to trigger the CSV download.

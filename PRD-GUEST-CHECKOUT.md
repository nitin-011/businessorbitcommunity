# PRD: Guest Checkout Refactoring

## 1. Goal & Context
Currently, the Orbit Card checkout process requires users to be fully authenticated community members. To reduce friction and improve conversion rates, we need to refactor the checkout flow to support "Guest Checkout." 

Guests should be able to fill out the form and purchase the card without creating an account. If a user *happens* to be logged in, their purchase should still automatically link to their existing account.

## 2. Requirements

### 2.1 Backend: Schema Updates (`OrbitCardOrder`)
To properly track orders made by guests, we must capture their contact information directly on the order document. 
- **Modify** `memberId`: Change from `required: true` to `required: false` (optional).
- **Add** `email`: `String`, `required: true`. Used for order communication and matching.
- **Add** `phone`: `String`, `required: true`.

### 2.2 Backend: Authentication Middleware
The endpoint `POST /api/community/card/checkout` is currently protected by a strict `requireCommunityAuth` middleware that rejects unauthenticated requests with a `401 Not authenticated`.
- **Create** a new middleware: `optionalCommunityAuth`.
- **Behavior**: It should attempt to decode the JWT token if provided in cookies or headers. If valid, it attaches `req.member`. If missing or invalid, it simply calls `next()` without returning an error, allowing the request to proceed as a guest.
- **Update Route**: Replace `requireCommunityAuth` with `optionalCommunityAuth` on the checkout route.

### 2.3 Backend: Controller Logic (`card.controller.ts`)
- **Extract Fields**: Update the controller to extract `email` and `phone` from `req.body` in addition to the existing fields (`shippingAddress`, `fullName`, `companyAndDesignation`).
- **Validation**: Ensure `email` and `phone` are present.
- **Dynamic Linking**: When creating the `OrbitCardOrder` document, pass `memberId: req.member?.id || null` so it links to the account if the user is logged in, and remains null for guests.
- **Webhook Adjustments**: The PhonePe payload requires a `merchantUserId`. For guests (where `memberId` is null), fallback to generating a temporary ID (e.g., `GUEST_${Date.now()}`) or use their `phone` number to satisfy PhonePe's requirements.

### 2.4 Frontend: API Payload (`api.ts` & `page.tsx`)
The checkout form already captures `email` and `phone`, but the frontend API call might not be transmitting them to the backend yet.
- **Update** `communityAPI.checkoutCard` in `api.ts` to accept `email` and `phone` in its TypeScript interface.
- **Update** `page.tsx` to pass `formData.email` and `formData.phone` into the `checkoutCard` API function during submission.

## 3. Out of Scope
- Auto-creating community accounts for guests post-checkout.
- Sending transactional emails/SMS (can be added later).

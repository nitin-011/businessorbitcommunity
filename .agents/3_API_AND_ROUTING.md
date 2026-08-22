# API, Routing & Authentication

## Backend Authentication Flow
- **Token Generation**: The backend uses JWTs (`jsonwebtoken`). Tokens are configured to last `7d` (7 days) to match the cookie `maxAge`.
- **Delivery Mechanism**: JWTs are NOT returned in JSON bodies. They are attached exclusively as `httpOnly`, `secure`, `sameSite` cookies (named `token`).
- **Role Guards**: The `middleware/auth.ts` exposes a factory function `authenticate(["role"])`. 
  - `authenticate(["admin"])` ensures the decoded token has the admin role and populates `req.admin`.
  - `authenticate(["community"])` does the same for community members and populates `req.member`.

## Frontend Interceptor & Refresh Strategy
- **File**: `frontend/lib/api.ts`
- **Behavior**: A global Axios response interceptor catches all `401 Unauthorized` responses.
- **Refresh Mechanism**: It automatically pauses the failed request, calls `/api/auth/refresh`, and upon success, replays the original request silently.
- **Fallback**: If refresh fails, it handles routing to the login screens natively. **Crucial Rule:** It explicitly checks `window.location.pathname` to prevent assigning `window.location.href = "/community"` if the user is *already* on that route, avoiding infinite hard-reload loops. It also completely ignores `/login` endpoint failures to prevent swallowing "Invalid Credentials" errors.

## Frontend Routing Peculiarities
- **No Standalone Login Pages**: There is no `/login` route. 
  - Admin login is handled natively inside `app/admin/page.tsx` (it renders a login form if `AuthContext` returns `admin === null`).
  - Community login is handled natively inside `app/(site)/community/page.tsx`.

## Payment Flow (PhonePe)
The Orbit Card purchase flow is a 3-step Server-to-Server process:
1. **Initiation (`checkoutCard` in `card.controller.ts`)**: Validates shipping details, creates a `PENDING` order in Mongo, generates a `transactionId`, and asks PhonePe for a payment URL.
2. **User Redirect**: The user is sent to the PhonePe gateway.
3. **Verification (`paymentRedirect` in `card.controller.ts`)**: PhonePe redirects the user back to the backend. The backend ignores the client's success claims and makes a secure S2S API call to PhonePe (`client.getOrderStatus`) to verify the transaction. If `COMPLETED`, it marks the DB as `SUCCESS` and redirects the user to the React success UI.

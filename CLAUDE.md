# Business Orbit Community - Agent Guidelines

## Authentication & Network Architecture Rules

1. **Axios Interceptors & 401 Handling**:
   - **Never intercept `/login`**: Global Axios interceptors that catch `401 Unauthorized` errors to attempt a token refresh MUST explicitly exclude login routes (e.g., `/login`). Otherwise, the interceptor will swallow "Invalid Credentials" errors and replace them with "No refresh token" errors.
   - **Never force hard reloads on login pages**: When falling back from a failed refresh, do NOT use `window.location.href = "/login"` if the user is already on the login route. This causes an infinite hard-reload loop in the browser. Reject the promise and let the local React state (e.g., `setStatus('login')`) handle the UI swap.

2. **React Query Configuration**:
   - **Disable Retries for Auth Errors**: The global `QueryClient` MUST be configured to disable retries (`retry: false`) for `401` and `403` HTTP status codes. Retrying unauthenticated requests causes massive network spam and triggers the Axios 401 interceptor multiple times per query.

3. **JWT & Cookie Sync**:
   - **Matching Expirations**: JWT `expiresIn` durations MUST match the cookie `maxAge` durations. Do not issue a 15-minute token inside a 7-day cookie unless a true, separate Refresh Token architecture is implemented.
   - **Refresh Endpoints**: Never attempt to `jwt.verify()` an expired access token inside a refresh endpoint without explicitly handling `TokenExpiredError`, or you will permanently lock users out when their short-lived token expires.

# Test Credentials

## Admin Account
- Email: admin@businessorbit.com
- Password: Admin@12345
- Role: admin

## Auth Endpoints
- POST /api/auth/login
- POST /api/auth/logout

## Student Endpoints
- POST /api/student/apply
- POST /api/student/send-otp
- POST /api/student/verify-otp
- POST /api/student/submit-id

## Business Endpoints
- POST /api/business/apply

## Admin Endpoints (Requires Auth)
- GET /api/admin/stats
- GET /api/admin/students
- GET /api/admin/business
- PATCH /api/admin/approve/:type/:id
- PATCH /api/admin/reject/:type/:id
- POST /api/admin/bulk-email

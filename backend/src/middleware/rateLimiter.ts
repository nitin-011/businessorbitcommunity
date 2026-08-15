/**
 * @file rateLimiter.ts
 * @description Rate limiting middleware configurations.
 * @architecture Uses express-rate-limit to protect endpoints against brute-force attacks and abuse.
 */

import rateLimit from "express-rate-limit";

// Limit repeated login requests to prevent brute force attacks
/**
 * @desc    Middleware to limit repeated login requests from a single IP to prevent brute force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

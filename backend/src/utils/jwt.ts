/**
 * @file jwt.ts
 * @description Utility for generating and verifying JSON Web Tokens (JWT).
 * @architecture Centralizes token generation and validation for the authentication layer.
 */
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * @desc    Generates a short-lived access token
 * @param   {TokenPayload} payload - The user data to encode in the token
 * @returns {string} The signed JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "15m" });
};

/**
 * @desc    Generates a long-lived refresh token
 * @param   {TokenPayload} payload - The user data to encode in the token
 * @returns {string} The signed JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
};

/**
 * @desc    Verifies and decodes a JWT string
 * @param   {string} token - The JWT string to verify
 * @returns {TokenPayload} The decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

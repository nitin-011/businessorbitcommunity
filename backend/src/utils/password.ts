/**
 * @file password.ts
 * @description Utility for hashing and verifying passwords securely.
 * @architecture Wraps bcrypt to enforce consistent password salting and hashing across the application.
 */
import bcrypt from "bcrypt";

/**
 * @desc    Hashes a plaintext password using bcrypt
 * @param   {string} password - The plaintext password to hash
 * @returns {Promise<string>} The hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * @desc    Compares a plaintext password against a hashed password
 * @param   {string} password - The plaintext password attempt
 * @param   {string} hashedPassword - The stored bcrypt hash
 * @returns {Promise<boolean>} True if the password matches, false otherwise
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

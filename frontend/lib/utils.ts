/**
 * @file utils.ts
 * @description React component for the Business Orbit Community application.
 * @architecture Presentational UI component.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

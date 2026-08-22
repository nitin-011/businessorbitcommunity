"use client";

/**
 * @file layout.tsx
 * @description Next.js App Router page/layout for layout.tsx.
 * @architecture Server or Client component mapping to a specific route segment.
 */

import { AdminAuthProvider } from "./AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

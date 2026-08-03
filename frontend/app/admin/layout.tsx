'use client';

import { AdminAuthProvider } from './AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

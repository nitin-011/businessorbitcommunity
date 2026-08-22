"use client";

/**
 * @file providers.tsx
 * @description Global application providers wrapper.
 * @architecture Wraps the Next.js app in necessary providers like TanStack QueryClientProvider.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import axios, { AxiosError } from "axios";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof AxiosError) {
                // Don't retry auth/permission errors
                if (
                  error.response?.status === 401 ||
                  error.response?.status === 403
                ) {
                  return false;
                }
              }
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * @file layout.tsx
 * @description Next.js App Router page/layout for layout.tsx.
 * @architecture Server or Client component mapping to a specific route segment.
 */
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Business Orbit - Join the Most Action-Oriented Community",
  description:
    "Connect with high-quality professionals, access exclusive opportunities, and grow your network.",
};

// Navbar/Footer deliberately live in app/(site)/layout.tsx, not here — this root
// layout has to stay neutral so /admin (outside the (site) route group) doesn't
// inherit the public marketing chrome. See app/(site)/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

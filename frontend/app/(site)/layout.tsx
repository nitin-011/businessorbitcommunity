/**
 * @file layout.tsx
 * @description Next.js App Router page/layout for layout.tsx.
 * @architecture Server or Client component mapping to a specific route segment.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

// This route group holds every public marketing/application page (/, /business,
// /community, /orbit-card, /orbit-card/checkout) — the global Navbar + Footer live
// here, not in the root layout, specifically so /admin (a sibling, outside this
// group) doesn't inherit them. See known-issues.md: the public nav used to render
// on top of the intentionally plain admin dashboard because the root layout wrapped
// every route. Route groups are transparent to the URL — moving pages in/out of
// `(site)` never changes their path.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CookieBanner />
    </>
  );
}

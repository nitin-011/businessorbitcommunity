"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-border-dark py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white/60 text-sm">
            © 2024 Business Orbit. All rights reserved.
          </div>
          {/* Only entry point to /admin on desktop — the Navbar's "Admin" link
              lives inside the mobile-only hamburger menu (md:hidden), so
              desktop had no way in at all before this. Kept as a plain text
              link, not a styled CTA button, matching the admin area's
              deliberately plain look (see design-system.md) rather than the
              lime pill/glow language used for marketing CTAs. */}
          <Link
            href="/admin"
            data-testid="footer-admin-link"
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-border-dark py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white/60 text-sm">
            © 2024 Business Orbit. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link href="/student" className="text-white/60 hover:text-white transition-colors text-sm">
              For Students
            </Link>
            <Link href="/business" className="text-white/60 hover:text-white transition-colors text-sm">
              For Business
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
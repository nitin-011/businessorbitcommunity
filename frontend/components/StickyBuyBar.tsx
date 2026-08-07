'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function StickyBuyBar() {
  const [pastThreshold, setPastThreshold] = useState(false);
  const [pricingInView, setPricingInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setPastThreshold(window.scrollY > 520);
    };

    window.addEventListener('scroll', handleScroll);

    // Hide once the page's own inline pricing/Buy Now block scrolls into view —
    // no need for a floating duplicate at that point. Falls back to always-visible
    // (once past the scroll threshold) if no #pricing element exists on the page.
    const pricingEl = document.getElementById('pricing');
    let observer: IntersectionObserver | undefined;
    if (pricingEl) {
      observer = new IntersectionObserver(
        ([entry]) => setPricingInView(entry.isIntersecting),
        { rootMargin: '0px 0px -20% 0px' }
      );
      observer.observe(pricingEl);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, []);

  const visible = pastThreshold && !pricingInView;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40"
        >
          <Link
            href="/orbit-card/checkout"
            data-testid="orbit-card-sticky-buy-button"
            className="group flex items-center gap-3 pl-6 pr-5 py-4 bg-[#D4FF3F] text-black rounded-full font-glacial shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_30px_rgba(212,255,63,0.35)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_45px_rgba(212,255,63,0.55)]"
          >
            <span className="flex flex-col leading-tight">
              <span className="font-bold text-[14px] tracking-wide">Buy Now</span>
              <span className="text-[11px] font-medium opacity-70">₹9,999 + GST</span>
            </span>
            <ArrowRight className="w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-[3px]" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

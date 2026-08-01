'use client';

import Image from 'next/image';
import { Nfc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

// Renders `name` as individually animated characters — each letter springs in as
// it's typed and springs out as it's deleted. Neighboring letters reposition via
// normal DOM reflow (instant, no animation needed for that part); deliberately not
// using framer-motion's `layout` prop here — under rapid keystrokes it left stale
// transforms on characters (a FLIP-timing issue when updates arrive faster than the
// layout animation settles). Falls back to a crossfaded "Your Name Here" placeholder
// when empty. Index-based keys mean this animates beautifully for the common case
// (typing/backspacing at the end) — a mid-string edit just updates instantly without
// an enter/exit flourish, a reasonable tradeoff against a full text-diff animator.
function AnimatedCardName({ name, compact }: { name: string; compact: boolean }) {
  const isEmpty = name.trim().length === 0;

  return (
    <span
      className={`font-glacial uppercase tracking-wide text-[#F5F5F5] inline-flex flex-nowrap min-w-0 overflow-hidden ${
        compact ? 'text-[13px]' : 'text-[16px]'
      }`}
    >
      <AnimatePresence initial={false}>
        {isEmpty ? (
          <motion.span
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ whiteSpace: 'nowrap' }}
          >
            Your Name Here
          </motion.span>
        ) : (
          name.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </span>
  );
}

export default function OrbitCardVisual({ compact = false, name = '' }: { compact?: boolean; name?: string }) {
  return (
    <div
      data-testid="orbit-card-visual"
      className={`relative overflow-hidden rounded-2xl border border-[#D4FF3F]/40 bg-gradient-to-br from-[#151515] to-[#0A0A0A] shadow-[0_0_40px_rgba(212,255,63,0.12)] mx-auto ${
        compact ? 'w-full max-w-[280px] aspect-[380/240]' : 'w-full max-w-[380px] aspect-[380/240]'
      }`}
    >
      {/* Noise Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Corner Glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-[#D4FF3F]/20 blur-3xl rounded-full" />

      <div className={`relative z-10 h-full flex flex-col justify-between ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <Image
            src={logoImg}
            alt="Business Orbit"
            quality={100}
            unoptimized
            className={compact ? 'h-5 w-auto object-contain' : 'h-7 w-auto object-contain'}
          />
          <div className="flex items-center gap-1.5">
            <span className="font-glacial text-[10px] uppercase tracking-[0.2em] text-[#D4FF3F]">
              Orbit Card
            </span>
            <Nfc className={compact ? 'w-3 h-3 text-[#D4FF3F]' : 'w-4 h-4 text-[#D4FF3F]'} />
          </div>
        </div>

        <div>
          <div className={`font-mono tracking-[0.15em] text-[#F5F5F5]/90 ${compact ? 'text-[11px] mb-2' : 'text-[15px] mb-3'}`}>
            •••• •••• •••• 0001
          </div>
          <div className="flex items-end justify-between gap-3">
            <AnimatedCardName name={name} compact={compact} />
            <span className="font-mono text-[10px] text-[#A1A1A1] shrink-0">LIFETIME MEMBER</span>
          </div>
        </div>
      </div>

      {/* Local font-glacial style (matches the rest of the app's per-component pattern) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
            .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
          `,
        }}
      />
    </div>
  );
}

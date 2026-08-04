'use client';

import { useState } from 'react';
import { Nfc, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Renders `text` as individually animated characters — each letter springs in as
// it's typed and springs out as it's deleted. Neighboring letters reposition via
// normal DOM reflow (instant, no animation needed for that part); deliberately not
// using framer-motion's `layout` prop here — under rapid keystrokes it left stale
// transforms on characters (a FLIP-timing issue when updates arrive faster than the
// layout animation settles). Falls back to a crossfaded placeholder when empty.
// Index-based keys mean this animates beautifully for the common case (typing/
// backspacing at the end) — a mid-string edit just updates instantly without an
// enter/exit flourish, a reasonable tradeoff against a full text-diff animator.
// Shared by both the name and designation lines on the card's back face.
function AnimatedCardText({
  text,
  placeholder,
  className,
}: {
  text: string;
  placeholder: string;
  className: string;
}) {
  const isEmpty = text.trim().length === 0;

  return (
    <span className={`inline-flex flex-nowrap min-w-0 overflow-hidden ${className}`}>
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
            {placeholder}
          </motion.span>
        ) : (
          text.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </span>
  );
}

// PRODUCTION / BACKEND NOTE — this component is the source of truth for what
// actually gets printed/encoded on the physical NFC card. Plain-text version
// of both faces + the finalized T&Cs also live in
// agent-notes/orbit-card-content-spec.md for anyone who doesn't want to read
// component code (e.g. whoever handles card printing/encoding).
//   FRONT — wordmark only ("ORBIT CARD"), nothing else: no logo, no member
//     data, no NFC glyph. Deliberately minimal per spec.
//   BACK — member Name + Designation (sourced live from the checkout form —
//     `formData.name` / `formData.company` in app/orbit-card/checkout/page.tsx
//     — "Designation" here is really that form's single combined "Company &
//     Designation" free-text field, not two separate values) + an NFC tap
//     indicator + the lifetime-membership tag.
// ELIGIBILITY: Orbit Card is founder-only — there is no student path or
// category selector anywhere in the checkout flow. Confirmed multiple times
// across this project; don't reintroduce one without explicit confirmation.
// FINISH: "Gunmetal Titanium" aluminium material (chosen from a 4-option
// showcase) — a brushed-metal gradient + fine diagonal brush lines + a soft
// corner sheen, replacing the earlier plain dark card. Kept close in mood to
// the site's original near-black cards (darker aluminium, not bright silver)
// so it doesn't clash with the rest of the dark UI around it.
function CardFace({
  side,
  compact,
  children,
}: {
  side: 'front' | 'back';
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.6)]"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: side === 'back' ? 'rotateY(180deg)' : undefined,
        backgroundImage:
          'repeating-linear-gradient(95deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px), linear-gradient(140deg, #6b7078 0%, #4a4e55 38%, #2d2f34 65%, #45484e 88%, #34363b 100%)',
      }}
    >
      {/* Corner sheen — soft light catching the brushed surface */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-32 bg-white/20 blur-3xl rounded-full" />

      <div className={`relative z-10 h-full flex flex-col justify-between ${compact ? 'p-4' : 'p-6'}`}>{children}</div>
    </div>
  );
}

export default function OrbitCardVisual({
  compact = false,
  name = '',
  designation = '',
  interactive = false,
  defaultSide = 'front',
}: {
  compact?: boolean;
  name?: string;
  designation?: string;
  interactive?: boolean;
  defaultSide?: 'front' | 'back';
}) {
  const [flipped, setFlipped] = useState(defaultSide === 'back');

  return (
    <div className="w-full">
      <div
        data-testid="orbit-card-visual"
        onClick={interactive ? () => setFlipped((f) => !f) : undefined}
        className={`relative mx-auto ${
          compact ? 'w-full max-w-[280px] aspect-[380/240]' : 'w-full max-w-[380px] aspect-[380/240]'
        } ${interactive ? 'cursor-pointer' : ''}`}
        style={{ perspective: '1200px' }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateY: defaultSide === 'back' ? 180 : 0 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* FRONT — "Orbit Card" wordmark, nothing else */}
          <CardFace side="front" compact={compact}>
            <div className="h-full flex items-center justify-center">
              <span
                className={`font-glacial uppercase tracking-[0.25em] text-[#F2F3F4] ${
                  compact ? 'text-[18px]' : 'text-[24px] md:text-[28px]'
                }`}
              >
                Orbit Card
              </span>
            </div>
          </CardFace>

          {/* BACK — member details + NFC indicator */}
          <CardFace side="back" compact={compact}>
            <div className="flex items-center gap-1.5">
              <Nfc className={compact ? 'w-3 h-3 text-[#C7CAD0]' : 'w-4 h-4 text-[#C7CAD0]'} />
              <span className="font-glacial text-[10px] uppercase tracking-[0.2em] text-[#C7CAD0]">
                Tap to Connect
              </span>
            </div>

            <div>
              <AnimatedCardText
                text={name}
                placeholder="Your Name Here"
                className={`font-glacial uppercase tracking-wide text-[#F2F3F4] mb-1 ${
                  compact ? 'text-[13px]' : 'text-[16px]'
                }`}
              />
              <div className="flex items-end justify-between gap-3">
                <AnimatedCardText
                  text={designation}
                  placeholder="Your Designation Here"
                  className={`font-glacial text-[#C7CAD0] ${compact ? 'text-[10px]' : 'text-[12px]'}`}
                />
                <span className="font-mono text-[10px] text-[#D4FF3F]/90 shrink-0">LIFETIME MEMBER</span>
              </div>
            </div>
          </CardFace>
        </motion.div>
      </div>

      {interactive && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            data-testid="orbit-card-visual-flip-button"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            Tap to flip
          </button>
        </div>
      )}

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

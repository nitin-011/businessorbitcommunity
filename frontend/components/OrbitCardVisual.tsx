"use client";

import { motion, AnimatePresence } from "framer-motion";

// Renders `text` as individually animated characters — each letter springs in as
// it's typed and springs out as it's deleted. Neighboring letters reposition via
// normal DOM reflow (instant, no animation needed for that part); deliberately not
// using framer-motion's `layout` prop here — under rapid keystrokes it left stale
// transforms on characters (a FLIP-timing issue when updates arrive faster than the
// layout animation settles). Falls back to a crossfaded placeholder when empty —
// the placeholder is what's visible on the product page (no buyer data yet); real
// checkout input replaces it live, letter by letter.
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
    <span
      className={`inline-flex flex-nowrap min-w-0 overflow-hidden ${className}`}
    >
      <AnimatePresence initial={false}>
        {isEmpty ? (
          <motion.span
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ whiteSpace: "nowrap" }}
          >
            {placeholder}
          </motion.span>
        ) : (
          text.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </span>
  );
}

// PRODUCTION / BACKEND NOTE — this is the finalized Orbit Card design, built
// as pure CSS/HTML (no image asset) from agent-notes/orbit-card.html's
// "Silver / Steel" theme — brushed-metal gradient, perforated steel insert
// panel on the right, "ORBIT CARD" brand mark top-left, holder info
// (Name / Designation / Email) bottom-left. One view only, no front/back
// flip. Sizing uses CSS container query units (cqw) so every measurement
// scales proportionally with however wide the card is rendered — matches
// the reference file's `calc(var(--w) * fraction)` pattern without needing
// a fixed --w per instance.
//   Product page (no props passed): shows the literal placeholders "Name" /
//     "Designation" / "Email", unchanged — confirmed explicitly, don't wire
//     real data in there.
//   Checkout (name / designation / email passed from `formData`): live
//     replaces those placeholders as the buyer types — `designation` here
//     is `cardDesignation`, a derived "Company — Designation" string (see
//     app/orbit-card/checkout/page.tsx), not the raw form field.
// ELIGIBILITY: Orbit Card is founder-only — there is no student path or
// category selector anywhere in the checkout flow. Confirmed multiple times
// across this project; don't reintroduce one without explicit confirmation.
export default function OrbitCardVisual({
  compact = false,
  name = "",
  designation = "",
  email = "",
}: {
  compact?: boolean;
  name?: string;
  designation?: string;
  email?: string;
}) {
  return (
    <div
      data-testid="orbit-card-visual"
      className={`relative mx-auto rounded-[20px] overflow-hidden transition-transform duration-[400ms] ease-out hover:-translate-y-1.5 ${
        compact ? "w-full max-w-[280px]" : "w-full max-w-[380px]"
      }`}
      style={{
        aspectRatio: "1.585 / 1",
        containerType: "inline-size",
        backgroundImage:
          "repeating-linear-gradient(100deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px), radial-gradient(circle at 62% 26%, rgba(255,255,255,0.22), transparent 60%), linear-gradient(135deg, #46484b 0%, #a8aaad 55%, #626366 100%)",
        boxShadow:
          "0 2px 3px rgba(0,0,0,0.18), 0 20px 40px -12px rgba(0,0,0,0.45)",
      }}
    >
      {/* Perforated steel insert panel, right side */}
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          width: "30%",
          backgroundImage:
            "radial-gradient(rgba(20,20,22,0.55) 1.15px, transparent 1.4px)",
          backgroundSize: "15px 15px",
          backgroundPosition: "calc(100% - 24px) 22px",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          maskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      >
        {/* Brighten the insert area so it reads as a distinct plate */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.14) 30%, rgba(255,255,255,0.14) 100%)",
          }}
        />
        {/* Soft seam where the plate meets the body */}
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: "40%",
            background:
              "linear-gradient(to right, rgba(0,0,0,0.18), transparent)",
          }}
        />
      </div>

      {/* Inner edge highlight / shade for a touch of dimensionality */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none z-[3]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.35)",
        }}
      />

      {/* Brand */}
      <div
        className="absolute z-[2] font-glacial font-bold whitespace-nowrap text-[6.2cqw] text-[#FAFAFB]"
        style={{ top: "8.5%", left: "8.5%", letterSpacing: "0.02em" }}
      >
        Orbit Card
      </div>

      {/* Holder info */}
      <div
        className="absolute z-[2] flex flex-col"
        style={{ left: "8.5%", bottom: "9%", gap: "1.2cqw", maxWidth: "58%" }}
      >
        <AnimatedCardText
          text={name}
          placeholder="Name"
          className="font-glacial font-semibold text-[4.3cqw] text-[#FAFAFB] leading-[1.1]"
        />
        <AnimatedCardText
          text={designation}
          placeholder="Designation"
          className="font-glacial text-[3.2cqw] text-[#E8E9EA] leading-[1.1]"
        />
        <AnimatedCardText
          text={email}
          placeholder="Email"
          className="font-glacial font-light text-[2.8cqw] text-[#D2D3D5] leading-[1.1]"
        />
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

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Nfc,
  Infinity as InfinityIcon,
  KeyRound,
  Gift,
  CalendarDays,
  TrendingUp,
  Handshake,
  Megaphone,
} from 'lucide-react';
import InteractiveSphere from '@/components/InteractiveSphere';
import OrbitCardVisual from '@/components/OrbitCardVisual';
import StickyBuyBar from '@/components/StickyBuyBar';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

const CORE_BENEFITS = [
  {
    icon: Nfc,
    label: 'Physical NFC Orbit Card',
  },
  {
    icon: InfinityIcon,
    label: 'Lifetime Premium Membership',
    sub: 'One-time ₹9,999 + 18% GST · No expiry · No renewal',
  },
  {
    icon: KeyRound,
    label: 'Access to the Premium Member Portal',
  },
];

// Sourced from agent-notes/BOC_content_1.docx — replaces the earlier 4-category
// copy with the expanded 5-category version (headline + hook + bullets per
// category). BOCC = Business Orbit Campus Clubs, a separate sibling platform
// (not this one) that the distribution/directory benefits route through.
// The doc's "Value:" takeaway line per category was dropped from the UI on
// request — full text is still in BOC_content_1.docx if it's ever wanted back.
// BACKEND NOTE: this is static marketing copy, not user/DB data — no fetch or
// API needed here. Only the order form on /orbit-card/checkout produces real
// data (see the NOTE at the top of that file + orbit-card-payment-integration.md).
const CATEGORIES = [
  {
    icon: Gift,
    title: 'Exclusive Startup Perks & Partner Credits',
    hook: 'Save thousands on the tools every startup needs.',
    items: [
      'Free credits from leading startup platforms',
      'Exclusive partner offers & discounts',
      'Access to premium founder tools',
      'Software, AI, cloud & productivity benefits',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Grow Faster with BOCC Distribution',
    hook: 'Reach the right audience without spending months building visibility.',
    items: [
      'Access to the BOCC Student Distribution Network',
      'Content promotion across Business Orbit channels',
      'Community-powered product visibility',
      'Startup showcases and feature opportunities',
    ],
  },
  {
    icon: Handshake,
    title: 'Connect with the Right People',
    hook: 'Build meaningful relationships that move your startup forward.',
    items: ['1:1 mentor guidance', 'Investor introductions', 'Founder networking', 'Incubator connections', 'Industry experts'],
  },
  {
    icon: CalendarDays,
    title: 'Exclusive Events & High-Value Opportunities',
    hook: 'Go beyond public events.',
    items: [
      'Members-only networking sessions',
      'Startup meetups',
      'Founder roundtables',
      'Pitch opportunities',
      'Invite-only ecosystem events',
    ],
  },
  {
    icon: Megaphone,
    title: 'Marketing & Growth Opportunities',
    hook: "Increase your startup's visibility through curated campaigns.",
    items: ['Featured startup campaigns', 'Community promotions', 'Launch support', 'Marketing collaborations', 'Event partnerships'],
  },
];

function CategoryCard({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[16px] p-[32px] transition-all duration-300 hover:-translate-y-[4px] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_20px_50px_rgba(212,255,63,0.12)]">
      <div className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#D4FF3F]/10 border border-[#D4FF3F]/30 mb-[20px] mx-auto sm:mx-0">
        <cat.icon className="w-[20px] h-[20px] text-[#D4FF3F]" />
      </div>
      <h3 className="font-glacial text-[20px] text-[#F5F5F5] font-bold mb-[8px] text-center sm:text-left">
        {cat.title}
      </h3>
      <p className="font-glacial text-[14px] text-[#A1A1A1] italic mb-[16px] text-left">{cat.hook}</p>
      <ul className="space-y-[10px] font-glacial text-[14px] text-[#C4C4C4] leading-[1.5] text-left">
        {cat.items.map((item, j) => (
          <li key={j} className="flex items-start">
            <ChevronRight className="w-[14px] h-[14px] text-[#D4FF3F] mr-[8px] mt-[3px] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OrbitCardPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />

      <div
        data-testid="orbit-card-page"
        className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-24 pb-32 overflow-hidden relative font-glacial"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveSphere />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 text-center">
          <div className="text-left mb-10">
            <Link
              href="/"
              data-testid="orbit-card-back-link"
              className="inline-flex items-center gap-2 text-[#A1A1A1] hover:text-[#F5F5F5] text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* HERO */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${bebas.className} text-[44px] md:text-[64px] text-[#F5F5F5] uppercase leading-[1.05] mb-4`}
          >
            Orbit Card
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[16px] md:text-[18px] text-[#A1A1A1] max-w-xl mx-auto mb-10"
          >
            Your all-access pass to the Business Orbit ecosystem — in one physical card.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <OrbitCardVisual />
          </motion.div>

          {/* CORE PRODUCT BENEFITS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 pb-16 border-b border-white/10"
          >
            {CORE_BENEFITS.map((benefit, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#D4FF3F]/10 border border-[#D4FF3F]/30 flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-[#D4FF3F]" />
                </div>
                <span className="text-[15px] font-medium text-[#F5F5F5] leading-snug">{benefit.label}</span>
                {benefit.sub && <span className="text-[12px] text-[#A1A1A1] mt-1.5">{benefit.sub}</span>}
              </div>
            ))}
          </motion.div>
        </div>

        {/* BENEFIT CATEGORIES — wider container than the rest of the page so
            cards get more horizontal room; less bullet-text wrapping means
            shorter cards and less scrolling. Rest of the page stays at
            max-w-3xl deliberately (hero/pricing/T&Cs read better narrow). */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${bebas.className} text-[28px] md:text-[36px] text-[#F5F5F5] uppercase leading-[1.1] mb-4`}
          >
            What&apos;s inside the Portal
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[15px] md:text-[16px] text-[#A1A1A1] max-w-2xl mx-auto mb-10"
          >
            The Orbit Card gives you exclusive access to resources, opportunities, and a
            community designed to help founders launch, grow, and raise capital.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORIES.slice(0, -1).map((cat, i) => (
                <CategoryCard key={i} cat={cat} />
              ))}
            </div>
            {/* Odd one out — same size as the rest, centered rather than
                stretched full-width, so it doesn't look like a different tier. */}
            <div className="mt-6 flex justify-center">
              <div className="w-full md:w-[calc(50%-12px)]">
                <CategoryCard cat={CATEGORIES[CATEGORIES.length - 1]} />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 text-center">
          {/* TERMS & CONDITIONS — finalized copy as of 2026-08-03, mirrored
              in agent-notes/orbit-card-content-spec.md for anyone (legal,
              support, backend) who wants the plain-text version. No refund
              policy of any kind — item 2 is deliberately a flat statement,
              don't add refund conditions/windows back in. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-testid="orbit-card-terms"
            id="terms"
            className="mb-12 bg-[#121212] border border-white/10 rounded-xl p-6 text-left scroll-mt-28"
          >
            <h2 className="text-[15px] font-bold text-[#F5F5F5] mb-4">Terms &amp; Conditions</h2>
            <ul className="space-y-2.5">
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                Membership is non-transferable and tied to the verified details used at order.
              </li>
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                All purchases are final and non-refundable.
              </li>
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                Membership is lifetime — no expiry, no renewal.
              </li>
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                Access to events and sessions is subject to availability and may be limited by seat count.
              </li>
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                All upcoming opportunities, benefits, and features are included as part of your
                membership at no additional cost.
              </li>
            </ul>
          </motion.div>

          {/* PRICING — updated 2026-08-07: GST (18%) is charged over and above
              this ₹9,999 base price, not baked into it. Shipping stays "Free"
              for now, but that's an explicitly pending decision, not settled
              like GST is — see agent-notes/known-issues.md before changing
              either figure. The exact itemized total (base + GST) is computed
              and shown at checkout, not duplicated here as a hardcoded number
              — this headline is deliberately the base "sticker price" only. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            id="pricing"
            className="bg-[#FFFFFF] rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center"
          >
            <div className="text-[13px] text-[#6B7280] font-medium mb-2">One-time payment</div>
            <div className="text-[40px] font-bold text-[#111111] leading-none mb-1">₹9,999</div>
            <div className="text-[14px] text-[#6B7280] mb-1">Lifetime access · No expiry · No renewal</div>
            <div className="text-[12px] text-[#9CA3AF] mb-8">+ 18% GST · Free shipping</div>

            <Link
              href="/orbit-card/checkout"
              data-testid="orbit-card-buy-now-button"
              className="inline-block w-full sm:w-auto px-10 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(212,255,63,0.4)]"
            >
              Buy Now
            </Link>

            <div className="mt-8 pt-6 border-t border-[#F3F4F6] flex flex-wrap items-center justify-center gap-[8px] md:gap-[16px] text-[12px] md:text-[13px] text-[#A1A1A1] font-medium">
              <span>Secure order</span>
              <span className="text-[#D1D5DB]">•</span>
              <span>One-time payment</span>
              <span className="text-[#D1D5DB]">•</span>
              <span>Lifetime access</span>
            </div>
          </motion.div>
        </div>

        <StickyBuyBar />
      </div>
    </>
  );
}

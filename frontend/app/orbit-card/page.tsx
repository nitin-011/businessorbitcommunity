'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';
import {
  ArrowLeft,
  Check,
  Nfc,
  Infinity as InfinityIcon,
  KeyRound,
  Gift,
  CalendarDays,
  Users,
  Lightbulb,
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
    sub: 'One-time ₹9,999 · No expiry · No renewal',
  },
  {
    icon: KeyRound,
    label: 'Access to the Premium Member Portal',
  },
];

const CATEGORIES = [
  {
    icon: Gift,
    title: 'Partner Benefits',
    items: ['AWS Credits', 'Microsoft Azure Credits', 'Other partner discounts', 'Startup tools & software benefits'],
  },
  {
    icon: CalendarDays,
    title: 'Exclusive Events',
    items: ['Founder Meetups', 'Private Networking Sessions', 'Exclusive Dinners', 'Closed-Door Events'],
  },
  {
    icon: Users,
    title: 'BOCC Student Directory',
    items: ['Access to student founders and startup teams from the BOCC platform'],
  },
  {
    icon: Lightbulb,
    title: '"Let’s Build an Idea Together"',
    items: ['Our team works with you to turn your idea into a real business — guidance, connections, and hands-on support along the way.'],
  },
];

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

          {/* FOUR BENEFIT CATEGORIES */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${bebas.className} text-[28px] md:text-[36px] text-[#F5F5F5] uppercase leading-[1.1] mb-10`}
          >
            What&apos;s inside the Portal
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 text-left"
          >
            {CATEGORIES.map((cat, i) => (
              <div
                key={i}
                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[32px] transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#FAFAFA] border border-[#E5E7EB] mb-[20px] mx-auto sm:mx-0">
                  <cat.icon className="w-[20px] h-[20px] text-[#111111]" />
                </div>
                <h3 className="font-glacial text-[20px] text-[#111111] font-bold mb-[16px] text-center sm:text-left">
                  {cat.title}
                </h3>
                <ul className="space-y-[10px] font-glacial text-[14px] text-[#6B7280] leading-[1.5] text-left">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start">
                      <span className="text-[#86A810] mr-[10px] mt-[3px] shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          {/* TERMS & CONDITIONS */}
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
                Refunds are available within 7 days of purchase, no questions asked.
              </li>
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                Access to events and sessions is subject to availability and may be limited by seat count.
              </li>
              <li className="text-[13px] text-[#A1A1A1] leading-[1.6]">
                Full terms will be provided at launch — this is placeholder copy for now.
              </li>
            </ul>
          </motion.div>

          {/* PRICING */}
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
            <div className="text-[12px] text-[#9CA3AF] mb-8">Inclusive of all taxes · Free shipping</div>

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
              <span>7-day refund window</span>
            </div>
          </motion.div>
        </div>

        <StickyBuyBar />
      </div>
    </>
  );
}

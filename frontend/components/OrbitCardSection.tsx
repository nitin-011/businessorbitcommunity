'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

export default function OrbitCardSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />
      <section
        data-testid="orbit-card-section"
        className="relative py-16 md:py-20 bg-gradient-to-b from-[#0A0A0A] to-[#121212] overflow-hidden"
      >
        {/* Subtle Noise Texture Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-glacial uppercase tracking-[0.15em] text-[#4F9DFF] text-[12px] md:text-[14px] font-semibold mb-[16px]"
          >
            — ORBIT CARD
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`${bebas.className} text-[32px] md:text-[44px] text-[#F5F5F5] uppercase leading-[1.1] mb-[16px]`}
          >
            One Card. Lifetime Access.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-glacial text-[15px] md:text-[16px] text-[#A1A1A1] leading-[1.6] mb-[32px] max-w-lg mx-auto"
          >
            A physical NFC card and a lifetime Business Orbit membership in one.
            Partner credits, invite-only events, the founder directory, and hands-on
            help turning your idea into a real business — all unlocked with a single
            tap.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/orbit-card"
              data-testid="orbit-card-cta"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4FF3F] text-black rounded-full font-glacial font-bold text-[15px] md:text-[16px] tracking-wide hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(212,255,63,0.4)] transition-all duration-300 group"
            >
              Join the Exclusive Club
              <ArrowRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-[4px]" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

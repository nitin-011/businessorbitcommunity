'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

export default function FinalCTA() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />
      <section 
        data-testid="final-cta-section" 
        className="relative py-[100px] md:py-[160px] bg-gradient-to-b from-[#FAFAFA] to-[#F3F4F6] overflow-hidden flex flex-col items-center justify-center text-center"
      >
        {/* Light Noise Texture Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Center Radial Glow for CTA area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[#D4FF3F]/[0.15] blur-[80px] md:blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-[700px] px-[24px]">
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${bebas.className} text-[40px] md:text-[64px] lg:text-[72px] text-[#111111] uppercase leading-[1.05] tracking-tight mb-[24px]`}
          >
            Stop waiting. Start building.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-[8px] mb-[48px]"
          >
            <p className="font-glacial text-[18px] md:text-[20px] text-[#6B7280]">
              You don&apos;t need more content. You need the right network.
            </p>
            <p className="font-glacial text-[16px] md:text-[18px] text-[#A1A1A1]">
              Join builders, founders, and students already creating real opportunities.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-[16px] mb-[40px] z-20 relative w-full sm:w-auto"
          >
            <Link
              href="/student"
              className="w-full sm:w-auto px-[32px] py-[16px] bg-[#D4FF3F] text-[#000000] rounded-full font-glacial font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] shadow-[0_0_20px_rgba(212,255,63,0.3)] hover:shadow-[0_0_40px_rgba(212,255,63,0.5)] text-center flex items-center justify-center"
            >
              Join as Student
            </Link>

            <Link
              href="/business"
              className="w-full sm:w-auto px-[32px] py-[16px] bg-transparent border border-[#D4FF3F] text-[#111111] rounded-full font-glacial font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:bg-[#D4FF3F] hover:text-[#000000] hover:shadow-[0_0_40px_rgba(212,255,63,0.5)] text-center flex items-center justify-center"
            >
              Join as Founder
            </Link>
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-[8px] md:gap-[20px] font-glacial text-[13px] md:text-[14px] text-[#6B7280] font-medium"
          >
            <span>100% free for lifetime</span>
            <span className="hidden md:inline text-[#D1D5DB]">•</span>
            <span>No spam. Only curated opportunities</span>
            <span className="hidden md:inline text-[#D1D5DB]">•</span>
            <span>Built by real builders</span>
          </motion.div>

        </div>
      </section>
    </>
  );
}
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

export default function CommunitySection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />
      <section 
        id="community" 
        data-testid="community-section" 
        className="relative py-[80px] md:py-[120px] bg-gradient-to-b from-[#FAFAFA] to-[#F3F4F6] overflow-hidden"
      >
        {/* Light Noise Texture Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-[24px]">
          <div className="flex flex-col lg:flex-row gap-[64px] lg:gap-[100px] items-center lg:items-start">
            
            {/* Left Box: Cards (Order 2 on Mobile, Order 1 on Desktop) */}
            <div className="w-full lg:w-[45%] flex flex-col gap-[20px] md:gap-[24px] order-2 lg:order-1 justify-center mt-[40px]">

              {/* Founder Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="/business"
                  className="group block bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[28px] md:p-[32px] transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] hover:border-[#D1D5DB]"
                >
                  <span className="font-glacial text-[14px] text-[#6B7280] mb-[12px] uppercase tracking-wide block">
                    For Founders
                  </span>
                  <h3 className="font-glacial text-[22px] md:text-[24px] text-[#111111] font-bold leading-[1.3] mb-[24px]">
                    Find talent.<br className="hidden md:block"/> Get mentorship. Scale faster.
                  </h3>

                  <ul className="space-y-[16px] mb-[40px]">
                    {["Hire skilled students", "Access mentors & operators", "Connect with investors"].map((pt, i) => (
                      <li key={i} className="flex items-start text-[#6B7280] font-glacial text-[15px] md:text-[16px] leading-[1.5]">
                        <svg className="w-[18px] h-[18px] text-[#86A810] mr-[12px] shrink-0 mt-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="font-glacial text-[16px] text-[#111111] font-bold flex items-center group-hover:text-[#86A810] transition-colors duration-300">
                    Join as Founder <ArrowRight className="ml-[8px] w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-[4px]" />
                  </div>
                </Link>
              </motion.div>

            </div>

            {/* Right Box: Text Content (Order 1 on Mobile, Order 2 on Desktop) */}
            <div className="w-full lg:w-[55%] flex flex-col order-1 lg:order-2 lg:pt-[100px]">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-glacial uppercase tracking-[0.1em] text-[#4F9DFF] text-[12px] md:text-[14px] font-semibold mb-[10px]"
              >
                — COMMUNITY
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`${bebas.className} text-[36px] md:text-[56px] text-[#111111] uppercase leading-[1.1] mb-[32px]`}
              >
                Two paths. One powerful network.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-glacial text-[18px] md:text-[28px] lg:text-[30px] leading-[1.5] max-w-[600px] text-[#6B7280]"
              >
                Whether you&apos;re a student looking for <span className="text-[#111111] font-medium">real opportunities</span> or a founder aiming to <span className="text-[#111111] font-medium">scale faster</span>, Business Orbit connects you to the <span className="text-[#111111] font-medium">right people</span> at the <span className="text-[#111111] font-medium">right time</span>.
              </motion.p>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}
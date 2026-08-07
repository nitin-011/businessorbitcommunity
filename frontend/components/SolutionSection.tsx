"use client";

import { motion } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import { CalendarDays, Star, TrendingUp, Handshake } from "lucide-react";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function SolutionSection() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `,
        }}
      />
      <section
        data-testid="solution-section"
        className="relative py-[100px] md:py-[140px] bg-gradient-to-b from-[#FAFAFA] to-[#F3F4F6] overflow-hidden"
      >
        {/* Light Noise Texture Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-[24px] md:px-[48px]">
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center text-center mb-[60px] md:mb-[80px]">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-glacial uppercase tracking-[0.1em] text-[#4F9DFF] text-[12px] md:text-[14px] font-semibold mb-[20px]"
            >
              — THE SOLUTION
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`${bebas.className} text-[36px] md:text-[56px] text-[#111111] uppercase leading-[1.1] max-w-[800px] mx-auto`}
            >
              This isn’t a community. It’s an ecosystem.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-glacial text-[18px] md:text-[20px] text-[#6B7280] mt-[16px] max-w-[700px] mx-auto"
            >
              Built through real events, real people, and real opportunities.
            </motion.p>
          </div>

          {/* Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {/* Card 1 */}
            <motion.div
              variants={itemVariants}
              className="group flex flex-col bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[32px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:border-[#D1D5DB] shadow-sm relative overflow-hidden"
            >
              {/* Icon */}
              <div className="mb-[24px] flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#FAFAFA] border border-[#E5E7EB] group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="w-[20px] h-[20px] text-[#111111]" />
              </div>
              <h3 className="font-glacial text-[22px] text-[#111111] font-bold mb-[24px] leading-[1.3]">
                Built Through Real Events
              </h3>
              <ul className="space-y-[14px] font-glacial text-[15px] md:text-[16px] text-[#6B7280] leading-[1.5] mb-auto">
                <li>
                  <span className="font-bold text-[#111111]">10+</span> meetups
                  organized
                </li>
                <li>
                  <span className="font-bold text-[#111111]">5+</span>{" "}
                  conferences hosted
                </li>
                <li>
                  <span className="font-bold text-[#111111]">10+</span> offline
                  speaker sessions
                </li>
                <li>
                  <span className="font-bold text-[#111111]">10+</span> virtual
                  sessions with real guidance
                </li>
                <li>
                  <span className="font-bold text-[#111111]">3+</span> exclusive
                  events
                </li>
              </ul>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={itemVariants}
              className="group flex flex-col bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[32px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:border-[#4F9DFF]/60 shadow-sm relative overflow-hidden ring-1 ring-inset ring-[#FFFFFF] hover:ring-[#4F9DFF]/10"
            >
              <div className="mb-[24px] flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#FAFAFA] border border-[#E5E7EB] group-hover:scale-110 transition-transform duration-300">
                <Star className="w-[20px] h-[20px] text-[#4F9DFF]" />
              </div>
              <h3 className="font-glacial text-[22px] text-[#111111] font-bold mb-[24px] leading-[1.3]">
                Opportunities That Actually Matter
              </h3>
              <ul className="space-y-[14px] font-glacial text-[15px] md:text-[16px] text-[#6B7280] leading-[1.5] flex-grow">
                <li>
                  Direct access to{" "}
                  <span className="font-medium text-[#111111] border-b border-[#E5E7EB]">
                    real founders
                  </span>
                </li>
                <li>Internship & collaboration opportunities</li>
                <li>Learn from people actually building</li>
                <li>
                  No fluff, only{" "}
                  <span className="font-medium text-[#111111] border-b border-[#E5E7EB]">
                    real exposure
                  </span>
                </li>
              </ul>
              <div className="mt-[32px] p-[16px] bg-[#FAFAFA] border border-[#F3F4F6] rounded-lg font-glacial text-[14px] text-[#4F9DFF] leading-[1.4] font-medium">
                This community is completely free. No hidden charges. No paid
                access.
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={itemVariants}
              className="group flex flex-col bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[32px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:border-[#86A810]/60 shadow-sm relative overflow-hidden ring-1 ring-inset ring-[#FFFFFF] hover:ring-[#86A810]/10"
            >
              <div className="mb-[24px] flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#FAFAFA] border border-[#E5E7EB] group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-[20px] h-[20px] text-[#86A810]" />
              </div>
              <h3 className="font-glacial text-[22px] text-[#111111] font-bold mb-[24px] leading-[1.3]">
                Built for Founders to Scale
              </h3>
              <ul className="space-y-[14px] font-glacial text-[15px] md:text-[16px] text-[#6B7280] leading-[1.5] mb-auto">
                <li>
                  <span className="font-bold text-[#111111]">3+</span> startup
                  pitching sessions
                </li>
                <li>
                  Network of{" "}
                  <span className="font-bold text-[#111111]">20+</span> VCs
                </li>
                <li>
                  <span className="font-bold text-[#111111]">30+</span> angel
                  investors connected
                </li>
                <li>Access to builders & collaborators</li>
              </ul>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              variants={itemVariants}
              className="group flex flex-col bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-[32px] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:border-[#D1D5DB] shadow-sm relative overflow-hidden"
            >
              <div className="mb-[24px] flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#FAFAFA] border border-[#E5E7EB] group-hover:scale-110 transition-transform duration-300">
                <Handshake className="w-[20px] h-[20px] text-[#111111]" />
              </div>
              <h3 className="font-glacial text-[22px] text-[#111111] font-bold mb-[24px] leading-[1.3]">
                Strong Industry Connections
              </h3>
              <ul className="space-y-[14px] font-glacial text-[15px] md:text-[16px] text-[#6B7280] leading-[1.5] mb-auto">
                <li>
                  <span className="font-bold text-[#111111]">3+</span>{" "}
                  professional conferences organized
                </li>
                <li>
                  Access to{" "}
                  <span className="font-medium text-[#111111] border-b border-[#E5E7EB]">
                    experienced operators
                  </span>
                </li>
                <li>Real conversations, not surface networking</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

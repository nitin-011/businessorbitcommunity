'use client';

import { motion } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';
import InteractiveSphere from './InteractiveSphere';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ProblemSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />
      <section 
        data-testid="problem-section" 
        className="relative py-[100px] md:py-[160px] bg-gradient-to-b from-[#0A0A0A] to-[#121212] overflow-hidden"
      >
        {/* Interactive 3D Sphere Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveSphere />
        </div>

        {/* Subtle Noise Texture Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#4F9DFF] opacity-[0.03] blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#D4FF3F] opacity-[0.03] blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-[24px] md:px-[48px]">
          
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center text-center mb-[80px] md:mb-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-glacial uppercase tracking-[0.15em] text-[#4F9DFF] text-[12px] md:text-[14px] font-semibold mb-[16px]"
            >
              — THE PROBLEM
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`${bebas.className} text-[40px] md:text-[64px] text-[#F5F5F5] uppercase leading-[1.1]`}
            >
              Networking is broken.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-glacial text-[16px] md:text-[18px] text-[#A1A1A1] mt-[12px]"
            >
              But no one talks about it.
            </motion.p>
          </div>

          {/* Two Columns Layout */}
          <div className="flex flex-col md:flex-row relative">
            
            {/* Divider Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#2A2A2A] transform -translate-x-1/2" />
            
            {/* LEFT: Students */}
            <motion.div 
              className="w-full md:w-1/2 md:pr-[60px] lg:pr-[80px] group transition-transform duration-500 hover:-translate-y-[8px]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="font-glacial text-[14px] text-[#A1A1A1] tracking-[0.1em] uppercase mb-[16px]">
                STUDENTS
              </motion.div>
              <motion.h3 variants={itemVariants} className={`${bebas.className} text-[32px] md:text-[40px] text-[#F5F5F5] uppercase leading-[1.1] mb-[32px]`}>
                Lost in noise. No real direction.
              </motion.h3>
              <ul className="space-y-[24px] font-glacial text-[16px] md:text-[18px] text-[#A1A1A1]">
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#4F9DFF] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>Applying everywhere, <span className="text-[#FFFFFF]">hearing back nowhere</span></p>
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#4F9DFF] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>Job portals filled with <span className="text-[#FFFFFF]">irrelevant listings</span></p>
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#4F9DFF] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>Networking events that <span className="text-[#FFFFFF]">lead to nothing</span></p>
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#4F9DFF] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p><span className="text-[#FFFFFF]">No direct access</span> to founders or decision-makers</p>
                </motion.li>
              </ul>
            </motion.div>

            {/* Divider Line (Mobile) */}
            <div className="md:hidden w-full h-[1px] bg-[#2A2A2A] my-[60px]" />

            {/* RIGHT: Founders */}
            <motion.div 
              className="w-full md:w-1/2 md:pl-[60px] lg:pl-[80px] group transition-transform duration-500 hover:-translate-y-[8px]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="font-glacial text-[14px] text-[#A1A1A1] tracking-[0.1em] uppercase mb-[16px]">
                FOUNDERS
              </motion.div>
              <motion.h3 variants={itemVariants} className={`${bebas.className} text-[32px] md:text-[40px] text-[#F5F5F5] uppercase leading-[1.1] mb-[32px]`}>
                Building alone. Scaling slower.
              </motion.h3>
              <ul className="space-y-[24px] font-glacial text-[16px] md:text-[18px] text-[#A1A1A1]">
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#D4FF3F] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>Hard to find <span className="text-[#FFFFFF]">reliable, skilled talent</span></p>
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#D4FF3F] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>No <span className="text-[#FFFFFF]">curated network</span> of builders</p>
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#D4FF3F] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>Events feel like <span className="text-[#FFFFFF]">noise, not value</span></p>
                </motion.li>
                <motion.li variants={itemVariants} className="flex items-start">
                  <span className="text-[#D4FF3F] mr-[16px] mt-[4px] opacity-70">—</span>
                  <p>Struggling to connect with the <span className="text-[#FFFFFF]">right mentors or investors</span></p>
                </motion.li>
              </ul>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

import img1 from '../assets/1.jpeg';
import img2 from '../assets/2.jpeg';
import img3 from '../assets/3.jpeg';
import img4 from '../assets/4.jpeg';
import img5 from '../assets/5.jpeg';
import img6 from '../assets/6.jpeg';
import img7 from '../assets/7.jpeg';
import img8 from '../assets/8.jpeg';
import img9 from '../assets/9.jpeg';
import img10 from '../assets/10.jpeg';
import img11 from '../assets/11.jpeg';
import img12 from '../assets/12.jpeg';
import img13 from '../assets/13.jpeg';
import img14 from '../assets/14.jpeg';
import img15 from '../assets/15.jpeg';
import img16 from '../assets/16.jpeg';

const images = [
  img1, img2, img3, img4, img5, img6, img7, img8, 
  img9, img10, img11, img12, img13, img14, img15, img16
];

export default function SocialProofSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />
      <section 
        data-testid="social-proof-section" 
        className="relative py-[100px] md:py-[140px] bg-gradient-to-b from-[#0A0A0A] to-[#121212] overflow-hidden"
      >
        {/* Subtle Noise Texture Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-[24px] md:px-[48px]">
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-[60px] md:mb-[80px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`${bebas.className} text-[40px] md:text-[56px] text-[#F5F5F5] uppercase leading-[1.1]`}
            >
              Moments from the <span className="text-[#D4FF3F] italic pr-[4px]">community</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-glacial text-[16px] md:text-[18px] text-[#A1A1A1] mt-[16px]"
            >
              Exclusive events, summits, and gatherings from across our chapters.
            </motion.p>
          </div>

          {/* Masonry Grid */}
          <motion.div 
            className="columns-1 md:columns-2 lg:columns-3 gap-[24px] space-y-[24px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
            }}
          >
            {images.map((img, i) => (
              <motion.div 
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
                className="break-inside-avoid relative rounded-[16px] overflow-hidden group shadow-lg drop-shadow-sm cursor-pointer border border-[#1F1F1F] bg-[#1A1A1A]"
              >
                <div className="relative overflow-hidden w-full h-full">
                  <Image
                    src={img}
                    alt={`Community Event ${i + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    placeholder="blur"
                  />
                  {/* Subtle Dark Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}
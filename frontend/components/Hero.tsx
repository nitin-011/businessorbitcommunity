"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import InteractiveSphere from "./InteractiveSphere";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const TYPING_WORDS = [
  "Internships",
  "Clients",
  "Funding",
  "Mentorship",
  "Growth",
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = TYPING_WORDS[wordIndex];
    let timeoutId: NodeJS.Timeout;

    const speed = isDeleting ? 40 : 100;

    if (isDeleting) {
      if (text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
      } else {
        timeoutId = setTimeout(() => {
          setText((prev) => prev.slice(0, -1));
        }, speed);
      }
    } else {
      if (text === currentWord) {
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // Wait 2s before start deleting
      } else {
        timeoutId = setTimeout(() => {
          setText((prev) => currentWord.slice(0, prev.length + 1));
        }, speed);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [text, isDeleting, wordIndex]);

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
        data-testid="hero-section"
        className="relative min-h-screen pt-10 bg-gradient-to-b from-[#0A0A0A] to-[#121212] overflow-hidden flex items-center justify-center selection:bg-[#D4FF3F] selection:text-black"
      >
        {/* Subtle Noise Texture Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Background Sphere Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center mix-blend-screen opacity-80">
          <InteractiveSphere />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-center pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Headline */}
            <h1
              className={`${bebas.className} text-[40px] md:text-[56px] lg:text-[72px] uppercase font-normal text-[#F5F5F5] tracking-wide leading-[1.1] mb-6 max-w-5xl`}
            >
              Build your career. Scale your startup.
            </h1>

            {/* Typing Animation Area */}
            <div className="flex items-center justify-center h-12 sm:h-16 md:h-20 mb-6 font-glacial">
              <span className="text-[32px] md:text-[48px] lg:text-[60px] font-bold text-[#D4FF3F] drop-shadow-[0_0_15px_rgba(212,255,63,0.3)] tracking-tight">
                {text}
              </span>
              <span className="w-[3px] md:w-[4px] h-[32px] md:h-[48px] lg:h-[60px] ml-1 md:ml-2 bg-[#D4FF3F] animate-pulse"></span>
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-glacial text-[16px] lg:text-[18px] text-[#A1A1A1] leading-[1.6] mb-12 max-w-2xl mx-auto"
            >
              An{" "}
              <span className="italic text-[#D4FF3F] opacity-90">
                action-oriented community
              </span>{" "}
              to access real opportunities, mentors, and growth <br /> All in
              one place.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto font-glacial"
            >
              <Link
                href="/business"
                className="px-8 py-4 bg-[#D4FF3F] text-black rounded-full font-medium text-[14px] md:text-[16px] tracking-wide hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(212,255,63,0.4)] transition-all duration-300 pointer-events-auto w-full sm:w-auto text-center flex items-center justify-center group"
              >
                Join as Founder
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Gradient Overlay for blending into standard sections */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />
      </section>
    </>
  );
}

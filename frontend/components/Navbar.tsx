"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

import logoImg from "../assets/logo.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
            .font-glacial {
              font-family: 'Glacial Indifference', sans-serif;
            }
          `,
        }}
      />

      <nav
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-black/70 border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src={logoImg}
                alt="Business Orbit"
                quality={100}
                unoptimized
                className="w-auto h-8 md:h-12 object-contain"
                priority
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 font-glacial">
              <Link
                href="/business"
                data-testid="nav-business-link"
                className="text-[16px] text-[#F5F5F5] opacity-80 hover:opacity-100 hover:text-[#D4FF3F] transition-all"
              >
                For Business
              </Link>

              <Link
                href="/community"
                data-testid="nav-community-link"
                className="text-[16px] text-[#F5F5F5] opacity-80 hover:opacity-100 hover:text-[#D4FF3F] transition-all"
              >
                Access to Community
              </Link>

              <Link
                href="/join"
                data-testid="nav-join-cta"
                className={`${bebas.className} px-[24px] py-[10px] bg-[#D4FF3F] text-black rounded-full text-[18px] md:text-[20px] uppercase font-normal tracking-wide hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(212,255,63,0.4)] transition-all flex items-center justify-center`}
              >
                Join Community
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              data-testid="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#F5F5F5]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-white/10 font-glacial bg-[#0A0A0A] backdrop-blur-xl absolute top-full left-0 right-0 px-6 shadow-2xl">
              <div className="flex flex-col gap-5">
                <Link
                  href="/student"
                  className="text-[18px] text-[#F5F5F5] opacity-90 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Students
                </Link>

                <Link
                  href="/business"
                  className="text-[18px] text-[#F5F5F5] opacity-90 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Business
                </Link>

                <Link
                  href="/community"
                  className="text-[18px] text-[#F5F5F5] opacity-90 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Access to Community
                </Link>


                <Link
                  href="/join"
                  className={`${bebas.className} px-[24px] py-[14px] mt-2 bg-[#D4FF3F] text-black rounded-full text-[20px] uppercase font-normal tracking-wide text-center`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Community
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

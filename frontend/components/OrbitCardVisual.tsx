'use client';

import Image from 'next/image';
import { Nfc } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function OrbitCardVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      data-testid="orbit-card-visual"
      className={`relative overflow-hidden rounded-2xl border border-[#D4FF3F]/40 bg-gradient-to-br from-[#151515] to-[#0A0A0A] shadow-[0_0_40px_rgba(212,255,63,0.12)] mx-auto ${
        compact ? 'w-full max-w-[280px] aspect-[380/240]' : 'w-full max-w-[380px] aspect-[380/240]'
      }`}
    >
      {/* Noise Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Corner Glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-[#D4FF3F]/20 blur-3xl rounded-full" />

      <div className={`relative z-10 h-full flex flex-col justify-between ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <Image
            src={logoImg}
            alt="Business Orbit"
            quality={100}
            unoptimized
            className={compact ? 'h-5 w-auto object-contain' : 'h-7 w-auto object-contain'}
          />
          <div className="flex items-center gap-1.5">
            <span className="font-glacial text-[10px] uppercase tracking-[0.2em] text-[#D4FF3F]">
              Orbit Card
            </span>
            <Nfc className={compact ? 'w-3 h-3 text-[#D4FF3F]' : 'w-4 h-4 text-[#D4FF3F]'} />
          </div>
        </div>

        <div>
          <div className={`font-mono tracking-[0.15em] text-[#F5F5F5]/90 ${compact ? 'text-[11px] mb-2' : 'text-[15px] mb-3'}`}>
            •••• •••• •••• 0001
          </div>
          <div className="flex items-end justify-between">
            <span className={`font-glacial uppercase tracking-wide text-[#F5F5F5] ${compact ? 'text-[13px]' : 'text-[16px]'}`}>
              Your Name Here
            </span>
            <span className="font-mono text-[10px] text-[#A1A1A1]">LIFETIME MEMBER</span>
          </div>
        </div>
      </div>

      {/* Local font-glacial style (matches the rest of the app's per-component pattern) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
            .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
          `,
        }}
      />
    </div>
  );
}

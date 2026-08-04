"use client";

import { useState } from "react";
import { Linkedin, Instagram, Phone, Mail } from "lucide-react";

// BACKEND HANDOFF — expected shape for a community member record, once the
// directory is wired to the real API/database:
//   { name, role, bio, linkedin, instagram, phone, email, photoUrl? }
// - name/role/bio/phone/email: plain strings.
// - linkedin/instagram: full profile URLs (used directly as href).
// - photoUrl: optional. When present, it's rendered as the card's photo
//   (plain <img>, not next/image — see note below). When absent, or if the
//   URL fails to load, the card falls back to an initials avatar generated
//   from `name` — no separate "hasPhoto" flag needed on your side.
export interface CommunityMember {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  instagram: string;
  phone: string;
  email: string;
  photoUrl?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function CommunityMemberCard({
  member,
}: {
  member: CommunityMember;
}) {
  // Plain <img> (not next/image) deliberately — the real photo domain isn't
  // known yet (backend/CDN not wired up), and next/image requires
  // allowlisting remote domains in next.config.js ahead of time. Swap to
  // next/image once the real photo host is known, for optimization.
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(member.photoUrl) && !photoFailed;

  return (
    <div
      data-testid="community-member-card"
      className="group flex flex-col sm:flex-row bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-[4px] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
    >
      {/* Photo panel — real photo when supplied, initials avatar fallback otherwise */}
      <div className="relative w-full h-64 sm:h-auto sm:w-[340px] shrink-0 self-stretch bg-gradient-to-br from-white/[0.05] to-transparent flex items-center justify-center overflow-hidden sm:border-r border-b sm:border-b-0 border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-[#D4FF3F]/20 blur-3xl rounded-full" />
        <span className="relative font-glacial font-bold text-[56px] text-[#D4FF3F] tracking-wide">
          {getInitials(member.name)}
        </span>
        {showPhoto && (
          <img
            src={member.photoUrl}
            alt={member.name}
            onError={() => setPhotoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-7 sm:p-9 flex flex-col">
        <div className="mb-3">
          <h3 className="font-glacial font-bold text-[24px] text-[#F5F5F5] leading-tight">
            {member.name}
          </h3>
          <p className="font-glacial text-[15px] text-[#A1A1A1]">
            {member.role}
          </p>
        </div>

        <p className="font-glacial text-[16px] text-[#C4C4C4] leading-[1.7] mb-6 max-w-2xl">
          {member.bio}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2">
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="community-member-linkedin"
              aria-label={`${member.name} on LinkedIn`}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A1A1A1] hover:text-[#F5F5F5] hover:border-[#D4FF3F]/50 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={member.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="community-member-instagram"
              aria-label={`${member.name} on Instagram`}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A1A1A1] hover:text-[#F5F5F5] hover:border-[#D4FF3F]/50 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <a
              href={`tel:${member.phone}`}
              data-testid="community-member-phone"
              className="flex items-center gap-1.5 text-[13px] text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {member.phone}
            </a>
            <a
              href={`mailto:${member.email}`}
              data-testid="community-member-email"
              className="flex items-center gap-1.5 text-[13px] text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {member.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

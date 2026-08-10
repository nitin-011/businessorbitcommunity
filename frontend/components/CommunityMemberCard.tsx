"use client";

import { useState } from "react";
import Image from "next/image";
import { Linkedin, Instagram, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";

// BACKEND HANDOFF — expected shape for a community member record:
//   { name, role, bio, linkedin, instagram, phone, email, photoUrl? }
// - photoUrl: optional. Cloudinary URLs (res.cloudinary.com) are rendered
//   via next/image. Any other host silently falls back to an initials avatar.
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

/** Only pass URLs from known-safe image hosts to next/image to avoid
 *  unconfigured-hostname errors (e.g. stale Google Drive URLs). */
const SAFE_IMAGE_HOSTS = ["res.cloudinary.com"];
function isSafeImageUrl(url?: string): boolean {
  if (!url) return false;
  try {
    return SAFE_IMAGE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

// Bio is clamped to this many lines before "Read more" appears
const BIO_CLAMP_LINES = 3;

export default function CommunityMemberCard({
  member,
}: {
  member: CommunityMember;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const showPhoto = isSafeImageUrl(member.photoUrl) && !photoFailed;

  return (
    <div
      data-testid="community-member-card"
      className={`group flex flex-col sm:flex-row bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-[3px] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
        bioExpanded
          ? "sm:min-h-[260px] sm:h-auto overflow-visible"
          : "sm:h-[260px] overflow-hidden"
      }`}
    >
      {/* ── Photo panel ─────────────────────────────────────────────────────── */}
      {/* Square on sm+, 56 vw tall strip on mobile */}
      <div className={`relative w-full h-52 sm:h-full sm:w-[220px] md:w-[240px] lg:w-[260px] shrink-0 bg-gradient-to-br from-white/[0.05] to-transparent flex items-center justify-center overflow-hidden sm:border-r border-b sm:border-b-0 border-white/10 ${
        bioExpanded ? "rounded-tl-2xl rounded-bl-2xl" : ""
      }`}>
        {/* Noise grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Accent glow */}
        <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-[#D4FF3F]/20 blur-3xl rounded-full" />

        {/* Initials fallback — always rendered beneath the photo */}
        <span className="relative z-0 font-glacial font-bold text-[52px] text-[#D4FF3F] tracking-wide select-none">
          {getInitials(member.name)}
        </span>

        {/* Photo — object-cover + object-top keeps faces in frame */}
        {showPhoto && (
          <Image
            src={member.photoUrl!}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 220px, (max-width: 1024px) 240px, 260px"
            className="absolute inset-0 z-10 object-cover object-top"
            onError={() => setPhotoFailed(true)}
            priority={false}
          />
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col overflow-hidden">
        {/* Name + Role */}
        <div className="mb-2 min-w-0">
          <h3 className="font-glacial font-bold text-[20px] sm:text-[22px] text-[#F5F5F5] leading-snug line-clamp-2">
            {member.name}
          </h3>
          <p className="font-glacial text-[13px] text-[#A1A1A1] truncate mt-0.5">
            {member.role || <span className="italic opacity-50">—</span>}
          </p>
        </div>

        {/* Bio with read-more toggle */}
        <div className="flex-1 min-h-0 mb-3">
          <p
            className={`font-glacial text-[14px] text-[#C4C4C4] leading-[1.65] transition-all ${
              bioExpanded ? "" : "line-clamp-3"
            }`}
          >
            {member.bio || <span className="italic opacity-40">No bio provided.</span>}
          </p>
          {/* Only show toggle if bio is long enough to be clamped */}
          {member.bio && member.bio.length > 120 && (
            <button
              onClick={() => setBioExpanded((v) => !v)}
              className="mt-1 flex items-center gap-1 text-[12px] text-[#D4FF3F]/70 hover:text-[#D4FF3F] transition-colors font-glacial"
            >
              {bioExpanded ? (
                <>Read less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Read more <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Footer: socials + contact */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 mt-auto">
          {/* Social icons */}
          <div className="flex items-center gap-1.5">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="community-member-linkedin"
                aria-label={`${member.name} on LinkedIn`}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A1A1A1] hover:text-[#F5F5F5] hover:border-[#D4FF3F]/50 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="community-member-instagram"
                aria-label={`${member.name} on Instagram`}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A1A1A1] hover:text-[#F5F5F5] hover:border-[#D4FF3F]/50 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Contact details */}
          <div className="flex flex-col items-start sm:items-end gap-0.5">
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                data-testid="community-member-phone"
                className="flex items-center gap-1.5 text-[12px] text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
              >
                <Phone className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[160px]">{member.phone}</span>
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                data-testid="community-member-email"
                className="flex items-center gap-1.5 text-[12px] text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
              >
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[160px]">{member.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

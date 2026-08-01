'use client';

import { Linkedin, Instagram, Phone, Mail } from 'lucide-react';

export interface CommunityMember {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  instagram: string;
  phone: string;
  email: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function CommunityMemberCard({ member }: { member: CommunityMember }) {
  return (
    <div
      data-testid="community-member-card"
      className="group flex flex-col sm:flex-row bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] hover:border-[#D1D5DB]"
    >
      {/* Photo panel — placeholder until real photos are supplied/fetched */}
      <div className="relative w-full h-40 sm:h-auto sm:w-[170px] shrink-0 self-stretch bg-gradient-to-br from-[#151515] to-[#0A0A0A] flex items-center justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
        <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 bg-[#D4FF3F]/20 blur-3xl rounded-full" />
        <span className="relative font-glacial font-bold text-[40px] text-[#D4FF3F] tracking-wide">
          {getInitials(member.name)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 sm:p-7 flex flex-col">
        <div className="mb-3">
          <h3 className="font-glacial font-bold text-[20px] text-[#111111] leading-tight">{member.name}</h3>
          <p className="font-glacial text-[14px] text-[#6B7280]">{member.role}</p>
        </div>

        <p className="font-glacial text-[15px] text-[#6B7280] leading-[1.6] mb-6">{member.bio}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="community-member-linkedin"
              aria-label={`${member.name} on LinkedIn`}
              className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111111] hover:border-[#D4FF3F] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={member.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="community-member-instagram"
              aria-label={`${member.name} on Instagram`}
              className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111111] hover:border-[#D4FF3F] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <a
              href={`tel:${member.phone}`}
              data-testid="community-member-phone"
              className="flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#111111] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {member.phone}
            </a>
            <a
              href={`mailto:${member.email}`}
              data-testid="community-member-email"
              className="flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#111111] transition-colors"
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

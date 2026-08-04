'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';
import { ArrowLeft, Lock, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '@/lib/api';
import InteractiveSphere from '@/components/InteractiveSphere';
import CommunityMemberCard, { CommunityMember } from '@/components/CommunityMemberCard';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

const inputClasses =
  'w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all';

// BACKEND HANDOFF — this array is placeholder data only (screens-first build).
// Replace it with a real fetch once the member directory endpoint exists —
// each object must match the `CommunityMember` shape exported from
// `components/CommunityMemberCard.tsx` (name, role, bio, linkedin, instagram,
// phone, email, optional photoUrl). No pagination/loading/error states exist
// yet since there's no live endpoint to hit — add those when wiring the real
// fetch in (e.g. TanStack Query, matching the pattern in `lib/api.ts`).
const PLACEHOLDER_MEMBERS: CommunityMember[] = [
  {
    name: 'Aditi Sharma',
    role: 'Founder, Loopwave Robotics',
    bio: 'Building autonomous delivery robots for last-mile logistics. Previously led hardware for three years at a Bangalore-based drone startup before going out on her own. Always up for a conversation about robotics, manufacturing, or early-stage hardware fundraising.',
    linkedin: '#',
    instagram: '#',
    phone: '+91 90000 00001',
    email: 'aditi.sharma@example.com',
  },
  {
    name: 'Rohan Mehta',
    role: 'B.Tech CS, IIT Delhi',
    bio: 'Full-stack developer exploring generative AI applications in edtech. Shipped two hackathon-winning projects in the last year and is currently building an AI-assisted note-taking tool on the side. Looking for internships and technical co-founders.',
    linkedin: '#',
    instagram: '#',
    phone: '+91 90000 00002',
    email: 'rohan.mehta@example.com',
  },
  {
    name: 'Priya Nair',
    role: 'Product Designer, Studio Nine',
    bio: 'Design partner for early-stage founders, helping them go from idea to shippable product. Previously led design at two Series A startups across fintech and healthtech. Happy to review pitch decks or product flows for anyone in the community.',
    linkedin: '#',
    instagram: '#',
    phone: '+91 90000 00003',
    email: 'priya.nair@example.com',
  },
  {
    name: 'Karan Verma',
    role: 'Final Year, NIT Surat',
    bio: 'Mechanical engineering student building a low-cost water filtration system for rural communities as a climate-tech side project. Keen on manufacturing and hardware prototyping. Open to internships in core engineering roles.',
    linkedin: '#',
    instagram: '#',
    phone: '+91 90000 00004',
    email: 'karan.verma@example.com',
  },
  {
    name: 'Sana Iqbal',
    role: 'Co-Founder, GreenCart',
    bio: 'Scaling a D2C sustainable grocery brand across three cities with a focus on zero-plastic packaging. Previously worked in supply chain at a large FMCG company before going the founder route. Happy to talk logistics, D2C growth, or early fundraising.',
    linkedin: '#',
    instagram: '#',
    phone: '+91 90000 00005',
    email: 'sana.iqbal@example.com',
  },
  {
    name: 'Arjun Desai',
    role: 'MBA Candidate, ISB Hyderabad',
    bio: 'Ex-management consultant transitioning into venture investing after four years advising consumer and retail clients. Decided he’d rather work directly with founders than advise from the sidelines. Interested in connecting with early-stage teams raising their first round.',
    linkedin: '#',
    instagram: '#',
    phone: '+91 90000 00006',
    email: 'arjun.desai@example.com',
  },
];

export default function CommunityPage() {
  // NOTE: fully mocked — any email/password "succeeds" after a simulated delay.
  // No backend call, no real auth, no persistence. Real member accounts and
  // real directory data land once the backend/database side is connected.
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'login' | 'processing' | 'directory'>('login');

  const { data: membersResponse, isLoading } = useQuery({
    queryKey: ['communityMembers'],
    queryFn: () => communityAPI.getMembers().then(res => res.data),
    enabled: status === 'directory'
  });

  const members = membersResponse?.data?.members || PLACEHOLDER_MEMBERS;
  const membersCount = membersResponse?.data?.pagination?.total || PLACEHOLDER_MEMBERS.length;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    try {
      await communityAPI.login(credentials);
      setStatus('directory');
    } catch (err) {
      alert('Login failed. Please check your credentials.');
      setStatus('login');
    }
  };

  const handleSignOut = () => {
    setCredentials({ email: '', password: '' });
    setStatus('login');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />

      <div
        data-testid="community-page"
        className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-24 pb-20 overflow-hidden relative font-glacial"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveSphere />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-10">
            <Link
              href="/"
              data-testid="community-back-link"
              className="inline-flex items-center gap-2 text-[#A1A1A1] hover:text-[#F5F5F5] text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {status !== 'directory' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#D4FF3F]/10 border border-[#D4FF3F]/30 flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-5 h-5 text-[#D4FF3F]" />
                  </div>
                  <h1 className={`${bebas.className} text-[32px] md:text-[40px] text-[#F5F5F5] uppercase leading-[1.1] mb-2`}>
                    Access to Community
                  </h1>
                  <p className="text-[15px] text-[#A1A1A1]">
                    Sign in to browse member profiles and connect with the community.
                  </p>
                </div>

                <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <form onSubmit={handleLogin} className="space-y-4" data-testid="community-login-form">
                    <div>
                      <label htmlFor="community-email" className="block text-[#111111] font-medium mb-1.5 text-sm">
                        Email Address
                      </label>
                      <input
                        id="community-email"
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        className={inputClasses}
                        placeholder="jane@example.com"
                        data-testid="community-email-input"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="community-password" className="block text-[#111111] font-medium mb-1.5 text-sm">
                        Password
                      </label>
                      <input
                        id="community-password"
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className={inputClasses}
                        placeholder="••••••••"
                        data-testid="community-password-input"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === 'processing'}
                        data-testid="community-login-submit"
                        className="w-full px-6 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        {status === 'processing' ? 'Signing In...' : 'Sign In'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="directory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                  <div>
                    <h1 className={`${bebas.className} text-[32px] md:text-[44px] text-[#F5F5F5] uppercase leading-[1.1] mb-2`}>
                      Community Members
                    </h1>
                    <p className="text-[15px] text-[#A1A1A1]">{isLoading ? 'Loading...' : `${membersCount} members and counting.`}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    data-testid="community-sign-out"
                    className="inline-flex items-center gap-2 text-[#A1A1A1] hover:text-[#F5F5F5] text-sm transition-colors self-start sm:self-auto"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>

                <div
                  data-testid="community-member-grid"
                  className="grid grid-cols-1 gap-6"
                >
                  {members.map((member: CommunityMember) => (
                    <CommunityMemberCard key={member.email} member={member} />
                  ))}
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </>
  );
}

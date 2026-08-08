"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import { ArrowLeft, Lock, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { communityAPI } from "@/lib/api";
import InteractiveSphere from "@/components/InteractiveSphere";
import CommunityMemberCard, {
  CommunityMember,
} from "@/components/CommunityMemberCard";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const inputClasses =
  "w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all";

const MemberSkeleton = () => (
  <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-2xl p-6 md:p-8 animate-pulse">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-white/10" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-3 bg-white/10 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-3 bg-white/10 rounded w-full" />
      <div className="h-3 bg-white/10 rounded w-5/6" />
      <div className="h-3 bg-white/10 rounded w-4/6" />
    </div>
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded bg-white/10" />
      <div className="w-8 h-8 rounded bg-white/10" />
    </div>
  </div>
);

export default function CommunityPage() {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [status, setStatus] = useState<
    "login" | "processing" | "directory" | "checking_session"
  >("checking_session");

  useEffect(() => {
    communityAPI
      .getMe()
      .then(() => setStatus("directory"))
      .catch(() => setStatus("login"));
  }, []);

  const {
    data: membersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["communityMembers"],
    queryFn: () => communityAPI.getMembers().then((res) => res.data),
    enabled: status === "directory",
  });

  const members = membersResponse?.data?.members || [];
  const membersCount = membersResponse?.data?.pagination?.total || 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    try {
      const isEmail = credentials.identifier.includes("@");
      const payload = {
        password: credentials.password,
        ...(isEmail
          ? { email: credentials.identifier }
          : { username: credentials.identifier }),
      };
      await communityAPI.login(payload);
      setStatus("directory");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      setStatus("login");
    }
  };

  const handleSignOut = () => {
    setCredentials({ identifier: "", password: "" });
    setStatus("login");
  };

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

      <div
        data-testid="community-page"
        className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-24 pb-20 overflow-hidden relative font-glacial"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveSphere />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
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

          {status === "checking_session" ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="w-8 h-8 border-2 border-[#D4FF3F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : status !== "directory" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-[#D4FF3F]/10 border border-[#D4FF3F]/30 flex items-center justify-center mx-auto mb-5">
                  <Lock className="w-5 h-5 text-[#D4FF3F]" />
                </div>
                <h1
                  className={`${bebas.className} text-[32px] md:text-[40px] text-[#F5F5F5] uppercase leading-[1.1] mb-2`}
                >
                  Access to Community
                </h1>
                <p className="text-[15px] text-[#A1A1A1]">
                  Sign in to browse member profiles and connect with the
                  community.
                </p>
              </div>

              <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <form
                  onSubmit={handleLogin}
                  className="space-y-4"
                  data-testid="community-login-form"
                >
                  <div>
                    <label
                      htmlFor="community-email"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Email or Username
                    </label>
                    <input
                      id="community-email"
                      type="text"
                      value={credentials.identifier}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          identifier: e.target.value,
                        })
                      }
                      className={inputClasses}
                      placeholder="jane@example.com or jane892"
                      data-testid="community-email-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="community-password"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Password
                    </label>
                    <input
                      id="community-password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      className={inputClasses}
                      placeholder="••••••••"
                      data-testid="community-password-input"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "processing"}
                      data-testid="community-login-submit"
                      className="w-full px-6 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      {status === "processing" ? "Signing In..." : "Sign In"}
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
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <h1
                    className={`${bebas.className} text-[32px] md:text-[44px] text-[#F5F5F5] uppercase leading-[1.1] mb-2`}
                  >
                    Community Members
                  </h1>
                  <p className="text-[15px] text-[#A1A1A1]">
                    {isLoading
                      ? "Loading..."
                      : `${membersCount} members and counting.`}
                  </p>
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
                {isLoading ? (
                  <>
                    <MemberSkeleton />
                    <MemberSkeleton />
                    <MemberSkeleton />
                  </>
                ) : isError ? (
                  <div className="text-red-400 p-4 border border-red-400/20 rounded-xl bg-red-400/5">
                    Failed to load community members. Please try again later.
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-[#A1A1A1] p-8 text-center border border-white/10 rounded-xl bg-white/5">
                    No community members found.
                  </div>
                ) : (
                  members.map((member: CommunityMember) => (
                    <CommunityMemberCard key={member.email} member={member} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { businessAPI } from "@/lib/api";
import { Bebas_Neue } from "next/font/google";
import InteractiveSphere from "@/components/InteractiveSphere";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

export default function BusinessPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "", // Using role field for LinkedIn/Website to satisfy backend requirements safely
    stage: "",
    email: "",
    phone: "", // Processed safely on submit
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const applyMutation = useMutation({
    mutationFn: () => businessAPI.apply(formData),
    onSuccess: () => {
      setSuccess(true);
      setError("");
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message ||
          "Application failed. Please try again.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, company, role, stage, email, phone } = formData;
    if (!name || !company || !role || !stage || !email || !phone) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setError("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (!urlRegex.test(role)) {
      setError("Please enter a valid LinkedIn or Website URL.");
      return;
    }

    setError("");
    applyMutation.mutate();
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
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

      {/* GLOBAL WRAPPER: Matches Student Page EXACTLY with proper navbar clearance */}
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-24 pb-12 overflow-hidden relative font-glacial">
        {/* Interactive Sphere Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveSphere />
        </div>

        {/* Subtle Noise Texture Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* SPLIT LAYOUT CONTAINER */}
        {!success ? (
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 xl:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* ========================================================= */}
            {/* LEFT SIDE — FORM (Fixed/Sticky on Desktop, Top on Mobile) */}
            {/* ========================================================= */}
            <div className="w-full lg:w-[45%] flex flex-col lg:sticky lg:top-28">
              <div className="w-full bg-[#FFFFFF] rounded-2xl md:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-10 flex flex-col justify-center">
                <h1
                  className={`${bebas.className} text-4xl md:text-[44px] text-[#111111] leading-[1] mb-2 uppercase`}
                >
                  Join as a Founder
                </h1>
                <p className="text-base text-[#6B7280] mb-6">
                  Get access to talent, network, and opportunities
                </p>

                {/* FREE HIGHLIGHT */}
                <div className="mb-6 px-4 py-3 md:px-5 md:py-4 rounded-xl bg-[#D4FF3F]/10 border border-[#D4FF3F]/40 shadow-[0_0_20px_rgba(212,255,63,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4FF3F]/20 blur-2xl rounded-full pointer-events-none" />
                  <p className="font-bold text-[15px] md:text-[16px] text-[#111111] leading-tight mb-1">
                    100% <span className="text-[#86A810]">FREE</span> FOR
                    LIFETIME
                  </p>
                  <p className="text-[13px] md:text-[14px] text-[#6B7280]">
                    No hidden costs. No paid access.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* MAIN FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="Steve Jobs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#111111] font-medium mb-1.5 text-sm">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                      placeholder="founder@startup.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">
                        Startup Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="Next Big Thing Inc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">
                        Stage of Startup
                      </label>
                      <select
                        value={formData.stage}
                        onChange={(e) =>
                          setFormData({ ...formData, stage: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all appearance-none"
                        required
                      >
                        <option value="">Select Stage</option>
                        <option value="Idea">Idea</option>
                        <option value="MVP">MVP</option>
                        <option value="Scaling">Scaling</option>
                        <option value="Funded">Funded</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#111111] font-medium mb-1.5 text-sm">
                      LinkedIn / Website
                    </label>
                    <input
                      type="url"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={applyMutation.isPending}
                      className="w-full px-6 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      {applyMutation.isPending
                        ? "Submitting..."
                        : "Join as Founder — It’s Free"}
                    </button>
                  </div>
                </form>

                {/* Trust Text */}
                <div className="mt-8 pt-6 border-t border-[#F3F4F6] flex flex-wrap items-center justify-center gap-[6px] md:gap-[10px] text-[12px] md:text-[13px] text-[#A1A1A1] font-medium">
                  <span>Free forever</span>
                  <span>•</span>
                  <span>No spam</span>
                  <span>•</span>
                  <span>Only serious builders</span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT SIDE — SCROLLABLE CONTENT (Dark Theme) */}
            {/* ========================================================= */}
            <div className="w-full lg:w-[55%] pb-20">
              <div className="w-full max-w-[650px] mx-auto lg:mr-auto lg:ml-0">
                {/* Section 1 - Hook */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-16 md:mb-20"
                >
                  <h1
                    className={`${bebas.className} text-5xl md:text-7xl lg:text-8xl text-[#F5F5F5] uppercase leading-[0.95] tracking-tight mb-4`}
                  >
                    Stop building alone.
                  </h1>
                  <p
                    className={`${bebas.className} text-3xl md:text-4xl lg:text-5xl text-[#D4FF3F] uppercase leading-[1.05] mb-6 md:mb-8`}
                  >
                    Get the right people, faster.
                  </p>
                  <p className="text-lg md:text-xl text-[#A1A1A1] leading-relaxed">
                    Skip the endless networking mixers and disconnected cold
                    emails. Lock into an ecosystem that feeds founders direct
                    access to top-tier execution talent, serious VCs, and
                    operators playing the same game.
                  </p>
                </motion.div>

                {/* Section 2 - Value Stack */}
                <div className="space-y-12 md:space-y-16 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 md:before:left-[17px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#D4FF3F]/30 before:via-[#4F9DFF]/10 before:to-transparent before:hidden md:before:block">
                  {/* Block 1 */}
                  <motion.div
                    variants={blockVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative md:pl-16"
                  >
                    <div className="hidden md:absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#D4FF3F] flex items-center justify-center -translate-x-[16px] mt-1.5 shadow-[0_0_15px_rgba(212,255,63,0.3)]">
                      <div className="w-2 h-2 bg-[#D4FF3F] rounded-full" />
                    </div>
                    <h3
                      className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}
                    >
                      Find people who actually build.
                    </h3>
                    <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                      <li>
                        Access to{" "}
                        <span className="text-[#FFFFFF] font-medium border-b border-[#333]">
                          skilled, vetted students
                        </span>
                      </li>
                      <li>
                        Build your team{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          faster
                        </span>
                      </li>
                      <li>
                        Work with people{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          ready to execute
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Block 2 */}
                  <motion.div
                    variants={blockVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative md:pl-16"
                  >
                    <div className="hidden md:absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#4F9DFF] flex items-center justify-center -translate-x-[16px] mt-1.5 shadow-[0_0_15px_rgba(79,157,255,0.3)]">
                      <div className="w-2 h-2 bg-[#4F9DFF] rounded-full" />
                    </div>
                    <h3
                      className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}
                    >
                      Get into the right rooms.
                    </h3>
                    <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                      <li>
                        Connect intimately with{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          20+ VCs
                        </span>
                      </li>
                      <li>
                        Network globally with{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          30+ angel investors
                        </span>
                      </li>
                      <li>
                        Meet ambitious{" "}
                        <span className="text-[#FFFFFF] font-medium border-b border-[#333]">
                          founders and operators
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Block 3 */}
                  <motion.div
                    variants={blockVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative md:pl-16"
                  >
                    <div className="hidden md:absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#D4FF3F]/60 flex items-center justify-center -translate-x-[16px] mt-1.5">
                      <div className="w-2 h-2 bg-[#D4FF3F]/60 rounded-full" />
                    </div>
                    <h3
                      className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}
                    >
                      Put your startup in front of the right people.
                    </h3>
                    <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                      <li>
                        Direct access to{" "}
                        <span className="text-[#FFFFFF] font-medium border-b border-[#333]">
                          3+ startup pitching sessions
                        </span>
                      </li>
                      <li>
                        Get direct structural{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          exposure to investors
                        </span>
                      </li>
                      <li>
                        Real critical{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          feedback, not noise
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Block 4 */}
                  <motion.div
                    variants={blockVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative md:pl-16"
                  >
                    <div className="hidden md:absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#4F9DFF]/60 flex items-center justify-center -translate-x-[16px] mt-1.5">
                      <div className="w-2 h-2 bg-[#4F9DFF]/60 rounded-full" />
                    </div>
                    <h3
                      className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}
                    >
                      Not events. Opportunities.
                    </h3>
                    <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                      <li>
                        Access to highly raw,{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          curated networking events
                        </span>
                      </li>
                      <li>
                        Platform to{" "}
                        <span className="text-[#FFFFFF] font-medium border-b border-[#333]">
                          speak, collaborate, and grow
                        </span>
                      </li>
                      <li>
                        Be an integral part of an{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          organizing ecosystem
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Block 5 */}
                  <motion.div
                    variants={blockVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative md:pl-16"
                  >
                    <div className="hidden md:absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#D4FF3F] flex items-center justify-center -translate-x-[16px] mt-1.5 shadow-[0_0_15px_rgba(212,255,63,0.3)]">
                      <div className="w-2 h-2 bg-[#D4FF3F] rounded-full" />
                    </div>
                    <h3
                      className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}
                    >
                      Move faster than others.
                    </h3>
                    <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                      <li>
                        Skip the friction of{" "}
                        <span className="text-[#FFFFFF] font-medium line-through decoration-[#FF4F4F]">
                          cold outreach
                        </span>
                      </li>
                      <li>
                        Get instant access to{" "}
                        <span className="text-[#FFFFFF] font-medium text-[#D4FF3F]">
                          warm connections
                        </span>
                      </li>
                      <li>
                        Execute visions with{" "}
                        <span className="text-[#FFFFFF] font-medium border-b border-[#333]">
                          the exact right people
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Block 6 */}
                  <motion.div
                    variants={blockVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative md:pl-16"
                  >
                    <div className="hidden md:absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#FFFFFF] flex items-center justify-center -translate-x-[16px] mt-1.5 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      <div className="w-2 h-2 bg-[#FFFFFF] rounded-full" />
                    </div>
                    <h3
                      className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}
                    >
                      No noise. Only builders.
                    </h3>
                    <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                      <li>
                        Exclusively{" "}
                        <span className="text-[#FFFFFF] font-medium border-b border-[#333]">
                          curated members only
                        </span>
                      </li>
                      <li>
                        Benefit from a truly{" "}
                        <span className="text-[#FFFFFF] font-medium">
                          high-signal network
                        </span>
                      </li>
                      <li>
                        Surrounded by people strictly{" "}
                        <span className="text-[#FFFFFF] font-medium text-[#D4FF3F]">
                          serious about growth
                        </span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#333] rounded-[32px] p-10 md:p-16 shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="w-24 h-24 bg-[#D4FF3F]/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-[#D4FF3F]/10 blur-xl rounded-full" />
                <svg
                  className="w-12 h-12 text-[#D4FF3F] relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2
                className={`${bebas.className} text-5xl md:text-6xl text-[#F5F5F5] uppercase mb-4 tracking-tight`}
              >
                Application Received!
              </h2>

              <p className="text-xl text-[#A1A1A1] leading-relaxed mb-10 max-w-xl mx-auto">
                Your details have been submitted successfully and are{" "}
                <strong className="text-[#FFFFFF]">
                  awaiting admin approval
                </strong>
                . Once approved, your login details will be sent directly to
                your email.
              </p>

              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    name: "",
                    company: "",
                    role: "",
                    stage: "",
                    email: "",
                    phone: "",
                  });
                }}
                className="inline-block px-10 py-5 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide hover:scale-[1.03] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,255,63,0.4)]"
              >
                Back to Home
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}

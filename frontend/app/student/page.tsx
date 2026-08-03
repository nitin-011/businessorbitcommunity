'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { studentAPI } from '@/lib/api';
import { Bebas_Neue } from 'next/font/google';
import InteractiveSphere from '@/components/InteractiveSphere';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

type Step = 'form' | 'otp' | 'success';

export default function StudentPage() {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    course: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [idCardLink, setIdCardLink] = useState('');
  const [error, setError] = useState('');

  // 1. Initial Application
  const applyMutation = useMutation({
    mutationFn: () => studentAPI.apply(formData),
    onSuccess: () => {
      setError('');
      sendOTPMutation.mutate();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Application failed. Please try again.');
    },
  });

  // 2. Send OTP
  const sendOTPMutation = useMutation({
    mutationFn: () => studentAPI.sendOTP(formData.email),
    onSuccess: () => {
      setStep('otp');
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to send OTP.');
    },
  });

  // 3. Verify OTP + Auto Submit ID
  const verifyOTPMutation = useMutation({
    mutationFn: () => studentAPI.verifyOTP(formData.email, otp),
    onSuccess: () => {
      setError('');
      // After OTP verified successfully, directly submit ID link 
      // instead of requiring user to hit 'Submit' again on a third form
      submitIDMutation.mutate();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Invalid OTP.');
    },
  });

  // 4. Submit ID Link secretly
  const submitIDMutation = useMutation({
    mutationFn: () => studentAPI.submitID(formData.email, idCardLink),
    onSuccess: () => {
      setStep('success');
      setError('');
    },
    onError: (error: any) => {
      // If it fails, we still want them to pass if OTP worked? 
      // Usually, just let backend fail and they have to contact support, or show error.
      setError(error.response?.data?.message || 'Failed to submit ID Link.');
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate();
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTPMutation.mutate();
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />
      
      {/* GLOBAL WRAPPER: Exact styling from Hero with correct top padding below Navbar */}
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-24 pb-12 overflow-hidden relative font-glacial">
        
        {/* Same Hero Background Elements */}
        <div className="absolute inset-0 z-0 opacity-40">
           <InteractiveSphere />
        </div>
        <div 
           className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        
        {/* MAINTAINING SPLIT LAYOUT CONTAINER */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 xl:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDE — FORM (Fixed/Sticky on Desktop, Top on Mobile) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[45%] flex flex-col lg:sticky lg:top-28">
            
            <div className="w-full bg-[#FFFFFF] rounded-2xl md:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-10 flex flex-col justify-center">
              
              <h1 className={`${bebas.className} text-4xl md:text-[44px] text-[#111111] leading-[1] mb-2 uppercase`}>
                Join Business Orbit
              </h1>
              <p className="text-base text-[#6B7280] mb-6">
                Apply in 30 seconds
              </p>

              {/* FREE HIGHLIGHT */}
              <div className="mb-6 px-4 py-3 md:px-5 md:py-4 rounded-xl bg-[#D4FF3F]/10 border border-[#D4FF3F]/40 shadow-[0_0_20px_rgba(212,255,63,0.15)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4FF3F]/20 blur-2xl rounded-full pointer-events-none" />
                 <p className="font-bold text-[15px] md:text-[16px] text-[#111111] leading-tight mb-1">
                   100% <span className="text-[#86A810]">FREE</span> FOR LIFETIME
                 </p>
                 <p className="text-[13px] md:text-[14px] text-[#6B7280]">
                   No hidden charges. No upsells. Ever.
                 </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* MAIN FORM */}
              {step === 'form' && (
                <form onSubmit={handleApply} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#111111] font-medium mb-1.5 text-sm">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                      placeholder="john@university.edu"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kept here explicitly because backend actually requires course/college based on mongoose model */}
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">College</label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="University Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#111111] font-medium mb-1.5 text-sm">Course</label>
                      <input
                        type="text"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                        placeholder="e.g. B.Tech CS"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#111111] font-medium mb-1.5 text-sm">Student ID (Drive link)</label>
                    <input
                      type="url"
                      value={idCardLink}
                      onChange={(e) => setIdCardLink(e.target.value)}
                      placeholder="Paste your Google Drive link"
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
                      {applyMutation.isPending ? 'Submitting...' : 'Join Now — It’s Free'}
                    </button>
                  </div>
                </form>
              )}

              {/* OTP FORM */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-5 flex-grow flex flex-col justify-center">
                  <div>
                    <h2 className="text-xl font-bold text-[#111111] mb-1">Verify Your Email</h2>
                    <p className="text-[#6B7280] text-sm">We've sent a 6-digit code to <span className="font-semibold text-[#111111]">{formData.email}</span></p>
                  </div>
                  <div>
                    <label className="block text-[#111111] font-medium mb-1.5 text-sm">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] text-center text-[28px] tracking-[0.4em] font-semibold focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={verifyOTPMutation.isPending || submitIDMutation.isPending}
                      className="w-full px-6 py-4 bg-[#111111] text-white rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:bg-[#000000] hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {(verifyOTPMutation.isPending || submitIDMutation.isPending) ? 'Verifying...' : 'Verify Email'}
                    </button>
                    <button
                      type="button"
                      onClick={() => sendOTPMutation.mutate()}
                      className="w-full mt-4 text-center text-sm text-[#6B7280] hover:text-[#111111] font-medium transition-colors"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* SUCCESS FORM */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-[#D4FF3F]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[#86A810]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#111111] mb-3">Application Received</h2>
                  <p className="text-[#6B7280] mb-8 leading-relaxed">
                    Welcome to Business Orbit! We will review your Student ID and send a confirmation to your email shortly.
                  </p>
                  <a
                    href="/"
                    className="inline-block w-full px-6 py-4 bg-[#111111] text-[#FFFFFF] rounded-full font-bold text-[16px] tracking-wide hover:scale-[1.03] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                  >
                    Return to Home
                  </a>
                </div>
              )}

              {/* Trust Text */}
              <div className="mt-8 pt-6 border-t border-[#F3F4F6] flex flex-wrap items-center justify-center gap-[6px] md:gap-[10px] text-[12px] md:text-[13px] text-[#A1A1A1] font-medium">
                <span>Free forever</span>
                <span>•</span>
                <span>No spam</span>
                <span>•</span>
                <span>Only real opportunities</span>
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
                  <h1 className={`${bebas.className} text-5xl md:text-7xl lg:text-8xl text-[#F5F5F5] uppercase leading-[0.95] tracking-tight mb-4`}>
                    This is not just a community.
                  </h1>
                  <p className={`${bebas.className} text-3xl md:text-4xl lg:text-5xl text-[#D4FF3F] uppercase leading-[1.05] mb-6 md:mb-8`}>
                    This is where your college journey actually starts.
                  </p>
                  <p className="text-lg md:text-xl text-[#A1A1A1] leading-relaxed">
                    Stop waiting for degree-day to start building your career. We give you direct access to the network, the skills, and the opportunities to break out of the standard academic trap. 
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
                     <h3 className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}>
                       Earn while you learn.
                     </h3>
                     <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                        <li>Get access to <span className="text-[#FFFFFF] font-medium">PAID internships</span></li>
                        <li>Work on <span className="text-[#FFFFFF] font-medium border-b border-[#333]">real freelance projects</span></li>
                        <li>Build <span className="text-[#FFFFFF] font-medium">actual experience</span> (not just certificates)</li>
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
                     <h3 className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}>
                       Be where things actually happen.
                     </h3>
                     <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                        <li><span className="text-[#FFFFFF] font-medium">Free access</span> to all events</li>
                        <li>Opportunity to be part of the <span className="text-[#FFFFFF] font-medium">organizing committee</span></li>
                        <li>Work behind the scenes of <span className="text-[#FFFFFF] font-medium border-b border-[#333]">real conferences</span></li>
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
                     <h3 className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}>
                       Win. Learn. Stand out.
                     </h3>
                     <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                        <li>Chance to win <span className="text-[#FFFFFF] font-medium">exclusive goodies</span></li>
                        <li>Participate in <span className="text-[#FFFFFF] font-medium">curated competitions</span></li>
                        <li>Direct <span className="text-[#FFFFFF] font-medium border-b border-[#333]">recognition</span> inside the ecosystem</li>
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
                     <h3 className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}>
                       Work on projects that matter.
                     </h3>
                     <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                        <li>Collaborate with <span className="text-[#FFFFFF] font-medium">reputed departments</span></li>
                        <li>Work on <span className="text-[#FFFFFF] font-medium border-b border-[#333]">real-world startup problems</span></li>
                        <li>Build a portfolio that <span className="text-[#FFFFFF] font-medium">actually stands out</span></li>
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
                     <h3 className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}>
                       Don’t waste your college years.
                     </h3>
                     <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                        <li><span className="text-[#FFFFFF] font-medium">Virtual sessions</span> every 15 days</li>
                        <li>Learn how to <span className="text-[#FFFFFF] font-medium">maximize your college journey</span></li>
                        <li>Receive guidance from <span className="text-[#FFFFFF] font-medium border-b border-[#333]">people already doing it</span></li>
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
                     <h3 className={`${bebas.className} text-3xl md:text-[38px] text-[#F5F5F5] uppercase mb-4 leading-[1.05]`}>
                       Your network = your future.
                     </h3>
                     <ul className="text-lg text-[#A1A1A1] space-y-3 list-disc list-inside">
                        <li>Work with <span className="text-[#FFFFFF] font-medium">high-quality teams</span></li>
                        <li>Connect intimately with <span className="text-[#FFFFFF] font-medium border-b border-[#333]">founders and builders</span></li>
                        <li>Surround yourself with <span className="text-[#FFFFFF] font-medium">serious people</span></li>
                     </ul>
                  </motion.div>

               </div>

             </div>
          </div>

        </div>
      </div>
    </>
  );
}

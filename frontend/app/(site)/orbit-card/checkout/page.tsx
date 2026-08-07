'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';
import { ArrowLeft, AlertCircle, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import InteractiveSphere from '@/components/InteractiveSphere';
import OrbitCardVisual from '@/components/OrbitCardVisual';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

const inputClasses =
  'w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all';

const selectClasses = `${inputClasses} appearance-none pr-10 cursor-pointer`;

// Static reference data — India's states + union territories don't change often
// enough to warrant an API call; this is baked into the frontend like any other
// fixed lookup list, same as a country picker would be.
const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

type Step = 'details' | 'delivery' | 'payment' | 'confirmation';

// Pricing (updated 2026-08-07): GST is charged over and above the ₹9,999 base
// price, not baked into it — do not go back to an "inclusive of all taxes"
// framing without explicit confirmation. Shipping stays "Free" for now, but
// that's an explicitly pending decision (may become a separate charge later),
// not a settled inclusive-price claim like GST is — see
// agent-notes/known-issues.md and orbit-card-content-spec.md.
// BACKEND NOTE: whatever real order pipeline replaces this mock (see
// agent-notes/orbit-card-payment-integration.md) must charge/record the GST
// component explicitly (basePrice/gstAmount/totalAmount, not just one flat
// "amount") — the buyer's optional GSTIN field only makes sense against a
// real tax breakup.
const ORBIT_CARD_BASE_PRICE = 9999;
const ORBIT_CARD_GST_RATE = 0.18;
const ORBIT_CARD_GST_AMOUNT = Math.round(ORBIT_CARD_BASE_PRICE * ORBIT_CARD_GST_RATE);
const ORBIT_CARD_TOTAL_PRICE = ORBIT_CARD_BASE_PRICE + ORBIT_CARD_GST_AMOUNT;

function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function generateOrderReference() {
  return `BOC-${Date.now().toString(36).toUpperCase()}`;
}

function StepIndicator({ step }: { step: 'details' | 'delivery' }) {
  return (
    <div className="flex items-center gap-3 mb-5" data-testid="orbit-card-checkout-step-indicator">
      <div className={`flex items-center gap-2 text-xs font-semibold ${step === 'details' ? 'text-[#111111]' : 'text-[#9CA3AF]'}`}>
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
            step === 'details' ? 'bg-[#D4FF3F] text-black' : 'bg-[#F3F4F6] text-[#9CA3AF]'
          }`}
        >
          1
        </span>
        Your Details
      </div>
      <div className="flex-1 h-px bg-[#E5E7EB]" />
      <div className={`flex items-center gap-2 text-xs font-semibold ${step === 'delivery' ? 'text-[#111111]' : 'text-[#9CA3AF]'}`}>
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
            step === 'delivery' ? 'bg-[#D4FF3F] text-black' : 'bg-[#F3F4F6] text-[#9CA3AF]'
          }`}
        >
          2
        </span>
        Delivery &amp; Payment
      </div>
    </div>
  );
}

export default function OrbitCardCheckoutPage() {
  // NOTE: this order form is fully mocked end to end — no payment gateway, no
  // backend call, no persistence (not even localStorage), including the
  // "payment" step below, which is a simulated delay, not a real charge.
  // Real order/payment handling should replace this rather than extend it in
  // place — see agent-notes/orbit-card-payment-integration.md for the
  // planned real flow. The 'error' status branch is scaffolded for that
  // future integration; nothing in the current mock can actually trigger it.
  // BACKEND NOTE: `formData.name`, `formData.company`, and
  // `formData.designation` aren't just order data — they're what gets
  // printed on the back of the physical card, combined as "Company —
  // Designation" (see the PRODUCTION/BACKEND NOTE atop
  // components/OrbitCardVisual.tsx and agent-notes/orbit-card-content-spec.md).
  // Kept as two separate fields (not one free-text field) specifically so
  // records stay structured/queryable and the printed format is consistent
  // regardless of how the buyer types — don't recombine them into one input.
  // Whatever real order pipeline replaces this mock needs to carry all three
  // fields through to card production, not just to a database record.
  // BACKEND NOTE — eligibility: Orbit Card is founder-only, deliberately —
  // there is no student path anywhere in this flow. Don't reintroduce a
  // category/student option without explicit confirmation; this has flipped
  // back and forth earlier in the project and the current, confirmed state
  // is founder-only.
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    designation: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    agreeToTerms: false,
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [orderReference, setOrderReference] = useState('');

  // Single combined "Company — Designation" line for the card visual, built
  // from the two clean fields rather than trusting free-typed formatting.
  // Falls back gracefully if only one of the two is filled in yet.
  const cardDesignation = [formData.company, formData.designation].filter(Boolean).join(' — ');

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('delivery');
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    setPaymentStatus('processing');
    try {
      setTimeout(() => {
        setOrderReference(generateOrderReference());
        setPaymentStatus('idle');
        setStep('confirmation');
      }, 1800);
    } catch {
      setPaymentStatus('error');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
        .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
      `}} />

      <div
        data-testid="orbit-card-checkout-page"
        className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] pt-20 pb-12 overflow-hidden relative font-glacial"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveSphere />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        {(step === 'details' || step === 'delivery') && (
          <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
            <Link
              href="/orbit-card"
              data-testid="orbit-card-checkout-back-link"
              className="inline-flex items-center gap-2 text-[#A1A1A1] hover:text-[#F5F5F5] text-sm transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orbit Card
            </Link>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* LEFT — Order form */}
              <div className="w-full lg:w-[55%]">
                <div className="w-full bg-[#FFFFFF] rounded-2xl md:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8">
                  <h1 className={`${bebas.className} text-3xl md:text-[32px] text-[#111111] leading-[1] mb-1.5 uppercase`}>
                    Checkout
                  </h1>
                  <p className="text-sm text-[#6B7280] mb-5">Complete your Orbit Card order</p>

                  <StepIndicator step={step} />

                  {step === 'details' && (
                    <motion.form
                      key="details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleDetailsSubmit}
                      className="space-y-4"
                      data-testid="orbit-card-checkout-details-form"
                    >
                      <div>
                        <label htmlFor="checkout-name" className="block text-[#111111] font-medium mb-1.5 text-sm">Full Name</label>
                        <input
                          id="checkout-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={inputClasses}
                          placeholder="Jane Doe"
                          data-testid="orbit-card-checkout-name-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-phone" className="block text-[#111111] font-medium mb-1.5 text-sm">Phone Number</label>
                        <input
                          id="checkout-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={inputClasses}
                          placeholder="+91 98765 43210"
                          pattern="[+0-9\s-]{10,15}"
                          title="Enter a valid phone number"
                          data-testid="orbit-card-checkout-phone-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-email" className="block text-[#111111] font-medium mb-1.5 text-sm">Email Address</label>
                        <input
                          id="checkout-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={inputClasses}
                          placeholder="jane@example.com"
                          data-testid="orbit-card-checkout-email-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-company" className="block text-[#111111] font-medium mb-1.5 text-sm">
                          Company
                        </label>
                        <input
                          id="checkout-company"
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className={inputClasses}
                          placeholder="Acme Inc."
                          data-testid="orbit-card-checkout-company-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-designation" className="block text-[#111111] font-medium mb-1.5 text-sm">
                          Designation
                        </label>
                        <input
                          id="checkout-designation"
                          type="text"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className={inputClasses}
                          placeholder="Founder"
                          data-testid="orbit-card-checkout-designation-input"
                          required
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          data-testid="orbit-card-checkout-confirm-button"
                          className="w-full px-6 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)]"
                        >
                          Confirm Order
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {step === 'delivery' && (
                    <motion.form
                      key="delivery"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleDeliverySubmit}
                      className="space-y-3"
                      data-testid="orbit-card-checkout-delivery-form"
                    >
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        data-testid="orbit-card-checkout-back-to-details"
                        className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#111111] text-sm transition-colors -mt-1 mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to your details
                      </button>

                      <div>
                        <label htmlFor="checkout-address1" className="block text-[#111111] font-medium mb-1.5 text-sm">Address Line 1</label>
                        <input
                          id="checkout-address1"
                          type="text"
                          value={formData.addressLine1}
                          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          className={inputClasses}
                          placeholder="Flat / House no., Building, Street"
                          data-testid="orbit-card-checkout-address1-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-address2" className="block text-[#111111] font-medium mb-1.5 text-sm">Address Line 2 <span className="text-[#6B7280] font-normal">(optional)</span></label>
                        <input
                          id="checkout-address2"
                          type="text"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          className={inputClasses}
                          placeholder="Apartment, floor, etc."
                          data-testid="orbit-card-checkout-address2-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-landmark" className="block text-[#111111] font-medium mb-1.5 text-sm">Landmark <span className="text-[#6B7280] font-normal">(optional)</span></label>
                        <input
                          id="checkout-landmark"
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          className={inputClasses}
                          placeholder="Near XYZ Mall"
                          data-testid="orbit-card-checkout-landmark-input"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-city" className="block text-[#111111] font-medium mb-1.5 text-sm">City</label>
                          <input
                            id="checkout-city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={inputClasses}
                            placeholder="Mumbai"
                            data-testid="orbit-card-checkout-city-input"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-state" className="block text-[#111111] font-medium mb-1.5 text-sm">State</label>
                          <div className="relative">
                            <select
                              id="checkout-state"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className={selectClasses}
                              data-testid="orbit-card-checkout-state-input"
                              required
                            >
                              <option value="" disabled>
                                Select a state
                              </option>
                              {INDIAN_STATES.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-pincode" className="block text-[#111111] font-medium mb-1.5 text-sm">Pincode</label>
                          <input
                            id="checkout-pincode"
                            type="text"
                            inputMode="numeric"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            className={inputClasses}
                            placeholder="400001"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            title="Enter a 6-digit pincode"
                            data-testid="orbit-card-checkout-pincode-input"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-gstin" className="block text-[#111111] font-medium mb-1.5 text-sm">
                            GSTIN <span className="text-[#6B7280] font-normal">(optional)</span>
                          </label>
                          <input
                            id="checkout-gstin"
                            type="text"
                            value={formData.gstin}
                            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                            className={inputClasses}
                            placeholder="22AAAAA0000A1Z5"
                            maxLength={15}
                            data-testid="orbit-card-checkout-gstin-input"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-start gap-3">
                        <input
                          id="checkout-consent"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                          className="mt-1 w-4 h-4 shrink-0 accent-[#D4FF3F] cursor-pointer"
                          data-testid="orbit-card-checkout-consent-checkbox"
                          required
                        />
                        <label htmlFor="checkout-consent" className="text-[#6B7280] text-[13px] leading-relaxed cursor-pointer">
                          I agree to the{' '}
                          <Link href="/orbit-card#terms" className="text-[#111111] underline hover:no-underline">
                            Terms &amp; Conditions
                          </Link>
                          .
                        </label>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          data-testid="orbit-card-checkout-pay-button"
                          className="w-full px-6 py-3.5 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)]"
                        >
                          Pay — {formatINR(ORBIT_CARD_TOTAL_PRICE)}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </div>

              {/* RIGHT — Order summary */}
              <div className="w-full lg:w-[45%] lg:pt-2">
                <h2 className="text-[13px] uppercase tracking-[0.15em] text-[#A1A1A1] font-semibold mb-5">
                  Order Summary
                </h2>

                <div className="mb-6">
                  <OrbitCardVisual
                    compact
                    name={formData.name}
                    designation={cardDesignation}
                    email={formData.email}
                  />
                </div>

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6 mb-6">
                  <div className="flex justify-between text-[15px] text-[#F5F5F5] mb-3">
                    <span>Orbit Card — Lifetime Membership</span>
                    <span>{formatINR(ORBIT_CARD_BASE_PRICE)}</span>
                  </div>
                  <div className="flex justify-between text-[15px] text-[#A1A1A1] mb-4 pb-4 border-b border-white/10">
                    <span>Shipping</span>
                    <span className="text-[#D4FF3F]">Free</span>
                  </div>
                  <div className="flex justify-between text-[15px] text-[#A1A1A1] mb-3">
                    <span>Subtotal</span>
                    <span>{formatINR(ORBIT_CARD_BASE_PRICE)}</span>
                  </div>
                  <div className="flex justify-between text-[15px] text-[#A1A1A1] mb-4 pb-4 border-b border-white/10">
                    <span>GST (18%)</span>
                    <span>{formatINR(ORBIT_CARD_GST_AMOUNT)}</span>
                  </div>
                  <div className="flex justify-between text-[18px] font-bold text-[#F5F5F5] mb-1">
                    <span>Total</span>
                    <span className="text-[#D4FF3F]">{formatINR(ORBIT_CARD_TOTAL_PRICE)}</span>
                  </div>
                  <div className="text-[11px] text-[#6B7280]">GST charged separately, as required by law</div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#A1A1A1] font-medium">
                  <span>Secure order</span>
                  <span className="text-[#333]">•</span>
                  <span>One-time payment</span>
                  <span className="text-[#333]">•</span>
                  <span>Lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            data-testid="orbit-card-checkout-payment-step"
            className="relative z-10 max-w-md mx-auto px-6 text-center py-24"
          >
            {paymentStatus === 'error' ? (
              <div
                data-testid="orbit-card-checkout-error"
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Something went wrong processing your payment. Please try again.</span>
              </div>
            ) : (
              <>
                <Loader2 className="w-10 h-10 text-[#D4FF3F] animate-spin mx-auto mb-6" />
                <h1 className="text-[#F5F5F5] text-lg font-semibold mb-2">Processing your payment</h1>
                <p className="text-[#A1A1A1] text-sm">Connecting securely — please don&apos;t close this page.</p>
              </>
            )}
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            data-testid="orbit-card-checkout-confirmation"
            className="relative z-10 max-w-2xl mx-auto px-6 md:px-8 text-center py-12"
          >
            <div className="w-16 h-16 bg-[#D4FF3F]/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#D4FF3F]" />
            </div>
            <h1 className={`${bebas.className} text-3xl md:text-[40px] text-[#F5F5F5] uppercase leading-[1.05] mb-3`}>
              Order Confirmed
            </h1>
            <p className="text-[#A1A1A1] mb-2 leading-relaxed">
              Thanks, {formData.name.split(' ')[0] || 'there'} — we&apos;ve emailed your confirmation and
              receipt. Your physical Orbit Card is being prepared and will be delivered to the
              address you provided.
            </p>
            <p data-testid="orbit-card-checkout-order-reference" className="text-[#F5F5F5] text-sm font-mono mb-10">
              Order Reference: {orderReference}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left mb-10">
              <div>
                <OrbitCardVisual
                  compact
                  name={formData.name}
                  designation={cardDesignation}
                  email={formData.email}
                />
              </div>

              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 text-[13px] text-[#A1A1A1] space-y-3">
                <div className="flex justify-between">
                  <span>Orbit Card — Lifetime Membership</span>
                  <span className="text-[#F5F5F5] font-medium">{formatINR(ORBIT_CARD_BASE_PRICE)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#D4FF3F] font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="text-[#F5F5F5] font-medium">{formatINR(ORBIT_CARD_GST_AMOUNT)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-[#F5F5F5] font-semibold">Total Paid</span>
                  <span className="text-[#D4FF3F] font-semibold">{formatINR(ORBIT_CARD_TOTAL_PRICE)}</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="text-[#F5F5F5] font-medium mb-1">Company &amp; Designation</div>
                  <div>{formData.company}</div>
                  <div>{formData.designation}</div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="text-[#F5F5F5] font-medium mb-1">Delivery Address</div>
                  <div>{formData.addressLine1}{formData.addressLine2 ? `, ${formData.addressLine2}` : ''}</div>
                  {formData.landmark && <div>{formData.landmark}</div>}
                  <div>{formData.city}, {formData.state} {formData.pincode}</div>
                </div>
              </div>
            </div>

            <Link
              href="/"
              data-testid="orbit-card-checkout-confirmation-home-button"
              className="inline-block w-full sm:w-auto px-10 py-4 bg-[#111111] text-[#FFFFFF] rounded-full font-bold text-[16px] tracking-wide hover:scale-[1.03] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
            >
              Back to Home
            </Link>
          </motion.div>
        )}
      </div>
    </>
  );
}

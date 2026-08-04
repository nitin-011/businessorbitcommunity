"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import { ArrowLeft, AlertCircle, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import InteractiveSphere from "@/components/InteractiveSphere";
import OrbitCardVisual from "@/components/OrbitCardVisual";
import { communityAPI } from "@/lib/api";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const inputClasses =
  "w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all";

const selectClasses = `${inputClasses} appearance-none pr-10 cursor-pointer`;

// Static reference data — India's states + union territories don't change often
// enough to warrant an API call; this is baked into the frontend like any other
// fixed lookup list, same as a country picker would be.
const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function generateOrderReference() {
  return `BOC-${Date.now().toString(36).toUpperCase()}`;
}

function CheckoutContent() {
  // NOTE: this order form is fully mocked — no payment gateway, no backend call,
  // no persistence (not even localStorage). Submitting just simulates a brief
  // processing delay before showing the success modal. Real order/payment handling
  // should replace this rather than extend it in place — see
  // agent-notes/orbit-card-payment-integration.md for the planned real flow.
  // The 'error' status branch below is scaffolded for that future integration;
  // nothing in the current mock can actually trigger it.
  // BACKEND NOTE: `formData.name` and `formData.company` aren't just order data —
  // they're what gets printed on the back of the physical card (see the
  // PRODUCTION/BACKEND NOTE atop components/OrbitCardVisual.tsx and
  // agent-notes/orbit-card-content-spec.md). Whatever real order pipeline
  // replaces this mock needs to carry those two fields through to card
  // production, not just to a database record.
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    agreeToTerms: false,
  });

  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  // Initialize state based on URL param
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >(
    paymentStatus === "success"
      ? "success"
      : paymentStatus === "failed" || paymentStatus === "error"
        ? "error"
        : "idle",
  );

  const [orderReference, setOrderReference] = useState(
    searchParams.get("orderId") || "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    try {
      const address = `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ", " : ""}${formData.landmark ? formData.landmark + ", " : ""}${formData.city}, ${formData.state} - ${formData.pincode}`;
      const res = await communityAPI.checkoutCard({
        shippingAddress: address,
        fullName: formData.name,
        companyAndDesignation: formData.company,
        email: formData.email,
        phone: formData.phone,
      });
      if (res.data?.success && res.data?.data?.paymentUrl) {
        window.location.href = res.data.data.paymentUrl;
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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
        data-testid="orbit-card-checkout-page"
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

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
          <Link
            href="/orbit-card"
            data-testid="orbit-card-checkout-back-link"
            className="inline-flex items-center gap-2 text-[#A1A1A1] hover:text-[#F5F5F5] text-sm transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orbit Card
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* LEFT — Order form */}
            <div className="w-full lg:w-[55%]">
              <div className="w-full bg-[#FFFFFF] rounded-2xl md:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-10">
                <h1
                  className={`${bebas.className} text-3xl md:text-[36px] text-[#111111] leading-[1] mb-2 uppercase`}
                >
                  Checkout
                </h1>
                <p className="text-base text-[#6B7280] mb-8">
                  Complete your Orbit Card order
                </p>

                {status === "error" && (
                  <div
                    data-testid="orbit-card-checkout-error"
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Something went wrong placing your order. Please try again.
                    </span>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  data-testid="orbit-card-checkout-form"
                >
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="Jane Doe"
                      data-testid="orbit-card-checkout-name-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Phone Number
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="+91 98765 43210"
                      pattern="[+0-9\s-]{10,15}"
                      title="Enter a valid phone number"
                      data-testid="orbit-card-checkout-phone-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Email Address
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="jane@example.com"
                      data-testid="orbit-card-checkout-email-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-company"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Company &amp; Designation
                    </label>
                    <input
                      id="checkout-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="Acme Inc. — Founder"
                      data-testid="orbit-card-checkout-company-input"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <div className="text-[#111111] font-medium text-sm mb-1">
                      Delivery Address
                    </div>
                    <p className="text-[#6B7280] text-xs mb-4">
                      Your physical Orbit Card will be shipped here.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address1"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Address Line 1
                    </label>
                    <input
                      id="checkout-address1"
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          addressLine1: e.target.value,
                        })
                      }
                      className={inputClasses}
                      placeholder="Flat / House no., Building, Street"
                      data-testid="orbit-card-checkout-address1-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address2"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Address Line 2{" "}
                      <span className="text-[#6B7280] font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="checkout-address2"
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          addressLine2: e.target.value,
                        })
                      }
                      className={inputClasses}
                      placeholder="Apartment, floor, etc."
                      data-testid="orbit-card-checkout-address2-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-landmark"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Landmark{" "}
                      <span className="text-[#6B7280] font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="checkout-landmark"
                      type="text"
                      value={formData.landmark}
                      onChange={(e) =>
                        setFormData({ ...formData, landmark: e.target.value })
                      }
                      className={inputClasses}
                      placeholder="Near XYZ Mall"
                      data-testid="orbit-card-checkout-landmark-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block text-[#111111] font-medium mb-1.5 text-sm"
                      >
                        City
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className={inputClasses}
                        placeholder="Mumbai"
                        data-testid="orbit-card-checkout-city-input"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="checkout-state"
                        className="block text-[#111111] font-medium mb-1.5 text-sm"
                      >
                        State
                      </label>
                      <div className="relative">
                        <select
                          id="checkout-state"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
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

                  <div>
                    <label
                      htmlFor="checkout-pincode"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      Pincode
                    </label>
                    <input
                      id="checkout-pincode"
                      type="text"
                      inputMode="numeric"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className={`${inputClasses} max-w-[200px]`}
                      placeholder="400001"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      title="Enter a 6-digit pincode"
                      data-testid="orbit-card-checkout-pincode-input"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <label
                      htmlFor="checkout-gstin"
                      className="block text-[#111111] font-medium mb-1.5 text-sm"
                    >
                      GSTIN{" "}
                      <span className="text-[#6B7280] font-normal">
                        (optional, for a business invoice)
                      </span>
                    </label>
                    <input
                      id="checkout-gstin"
                      type="text"
                      value={formData.gstin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gstin: e.target.value.toUpperCase(),
                        })
                      }
                      className={inputClasses}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                      data-testid="orbit-card-checkout-gstin-input"
                    />
                  </div>

                  <div className="pt-2 flex items-start gap-3">
                    <input
                      id="checkout-consent"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          agreeToTerms: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 shrink-0 accent-[#D4FF3F] cursor-pointer"
                      data-testid="orbit-card-checkout-consent-checkbox"
                      required
                    />
                    <label
                      htmlFor="checkout-consent"
                      className="text-[#6B7280] text-[13px] leading-relaxed cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link
                        href="/orbit-card#terms"
                        className="text-[#111111] underline hover:no-underline"
                      >
                        Terms &amp; Conditions
                      </Link>
                      .
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={status === "processing"}
                      data-testid="orbit-card-checkout-submit-button"
                      className="w-full px-6 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      {status === "processing"
                        ? "Processing..."
                        : "Confirm Order — ₹9,999"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT — Order summary */}
            <div className="w-full lg:w-[45%] lg:pt-2">
              <h2 className="text-[13px] uppercase tracking-[0.15em] text-[#A1A1A1] font-semibold mb-5">
                Order Summary
              </h2>

              <div className="mb-6">
                {/* Starts on the back face since that's where the live name/
                    designation preview now lives (front is wordmark-only) —
                    still flippable to see the front. */}
                <OrbitCardVisual
                  compact
                  interactive
                  defaultSide="back"
                  name={formData.name}
                  designation={formData.company}
                />
              </div>

              <div className="bg-[#121212] border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex justify-between text-[15px] text-[#F5F5F5] mb-3">
                  <span>Orbit Card — Lifetime Membership</span>
                  <span>₹9,999</span>
                </div>
                <div className="flex justify-between text-[15px] text-[#A1A1A1] mb-3">
                  <span>Shipping</span>
                  <span className="text-[#D4FF3F]">Free</span>
                </div>
                <div className="flex justify-between text-[15px] text-[#A1A1A1] mb-4 pb-4 border-b border-white/10">
                  <span>Subtotal</span>
                  <span>₹9,999</span>
                </div>
                <div className="flex justify-between text-[18px] font-bold text-[#F5F5F5] mb-1">
                  <span>Total</span>
                  <span className="text-[#D4FF3F]">₹9,999</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Inclusive of all taxes
                </div>
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
      </div>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="orbit-card-checkout-success-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md bg-[#FFFFFF] rounded-2xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="w-20 h-20 bg-[#D4FF3F]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-[#86A810]"
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
              <h2 className="text-2xl font-bold text-[#111111] mb-3">
                Order Initiated
              </h2>
              <p className="text-[#6B7280] mb-2 leading-relaxed">
                Your Orbit Card order has been initiated — we&apos;ve emailed
                your confirmation and receipt. Your physical card is being
                prepared and will be delivered to the address you provided.
              </p>
              <p
                data-testid="orbit-card-checkout-order-reference"
                className="text-[#111111] text-sm font-mono mb-8"
              >
                Order Reference: {orderReference}
              </p>
              <Link
                href="/"
                data-testid="orbit-card-checkout-success-home-button"
                className="inline-block w-full px-6 py-4 bg-[#111111] text-[#FFFFFF] rounded-full font-bold text-[16px] tracking-wide hover:scale-[1.03] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              >
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function OrbitCardCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] flex items-center justify-center text-[#A1A1A1] font-glacial">
          Loading...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

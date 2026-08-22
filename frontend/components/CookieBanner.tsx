"use client";

/**
 * @file CookieBanner.tsx
 * @description React component for the Business Orbit Community application.
 * @architecture Presentational UI component.
 */

import CookieConsent from "react-cookie-consent";
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

export default function CookieBanner() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
            .font-glacial {
              font-family: 'Glacial Indifference', sans-serif;
            }
          `,
        }}
      />
      <CookieConsent
        location="bottom"
        buttonText="Got it!"
        cookieName="businessOrbitSessionConsent"
        disableStyles={true}
        containerClasses="fixed bottom-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center justify-between p-5 md:px-12 md:py-6 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
        contentClasses="text-[#F5F5F5] opacity-90 font-glacial text-[16px] md:text-[18px] mb-5 md:mb-0 text-center md:text-left pr-0 md:pr-8"
        buttonClasses={`${bebas.className} px-[32px] py-[12px] bg-[#D4FF3F] text-black rounded-full text-[18px] md:text-[20px] uppercase font-normal tracking-wide hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(212,255,63,0.4)] transition-all whitespace-nowrap shrink-0`}
        expires={365}
      >
        This site uses cookies for session management and to provide you with a
        better experience. By continuing, you agree to our use of cookies.
      </CookieConsent>
    </>
  );
}

"use client";

// ============================================
// ClarityScript
// Injects Microsoft Clarity only when:
//   1. Consent is 'granted'
//   2. NEXT_PUBLIC_CLARITY_ID is set
// Rendered as a client component so it can read the consent context.
// Add data-clarity-mask="true" to any element containing PII.
// ============================================

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAnalyticsConsent } from "@/lib/providers/analytics-consent";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";
const BLOCKED_ROUTES = ["/login", "/signup", "/auth", "/privacy", "/settings", "/profile", "/onboarding"];

export function ClarityScript() {
  const { consent } = useAnalyticsConsent();
  const pathname = usePathname();

  const isBlocked = BLOCKED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!CLARITY_ID || consent !== "granted" || isBlocked) return null;

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${CLARITY_ID}");
        `.trim(),
      }}
    />
  );
}

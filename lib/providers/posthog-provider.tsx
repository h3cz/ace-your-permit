"use client";

// ============================================
// PostHog Provider
// Initialises PostHog only when:
//   1. Consent is 'granted'
//   2. NEXT_PUBLIC_POSTHOG_KEY is set
// Portfolio rollout counts page views only; recordings and autocapture stay off.
// ============================================

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalyticsConsent } from "@/lib/providers/analytics-consent";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function PostHogInit({ children }: { children: React.ReactNode }) {
  const { consent } = useAnalyticsConsent();
  const pathname = usePathname();

  useEffect(() => {
    if (!POSTHOG_KEY || consent !== "granted") return;

    if (!posthog.__loaded) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        ui_host: POSTHOG_HOST,
        person_profiles: "never",
        autocapture: false, capture_pageleave: false, disable_surveys: true,
        advanced_disable_feature_flags: true, save_campaign_params: false, save_referrer: false, cross_subdomain_cookie: false,
        capture_pageview: "history_change",
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: "[data-private]",
        },
        // Keep the shared portfolio project limited to page analytics.
        disable_session_recording: true,
        before_send: (event) => {
          if (!event || event.event !== "$pageview") return null;
          try {
            if (localStorage.getItem("aceyourpermit:analytics-consent") !== "granted") return null;
          } catch { return null; }
          event.properties.app = "driver";
          for (const name of Object.keys(event.properties)) {
            if (name === "$title") delete event.properties[name];
            if (/^(?:\$initial_)?(?:utm_|gclid|fbclid|msclkid)/.test(name)) delete event.properties[name];
            if (name.endsWith("pathname")) event.properties[name] = String(event.properties[name]).replace(/\/[a-f0-9-]{36}(?=\/|$)/gi, "/:id");
            if (name.includes("url") || name.includes("referrer")) {
              try { const url = new URL(String(event.properties[name])); event.properties[name] = url.origin + url.pathname.replace(/\/[a-f0-9-]{36}(?=\/|$)/gi, "/:id"); } catch { delete event.properties[name]; }
            }
          }
          return event;
        },
      });
    }
  }, [consent, pathname]);

  // Opt out entirely when consent is revoked
  useEffect(() => {
    if (!posthog.__loaded) return;

    if (consent !== "granted") {
      posthog.opt_out_capturing();
    } else {
      posthog.opt_in_capturing();
    }
  }, [consent]);

  return <>{children}</>;
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) {
    // Key not configured — render children without analytics wrapper
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogInit>{children}</PostHogInit>
    </PostHogProvider>
  );
}

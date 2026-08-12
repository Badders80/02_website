"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";

// FIX: audit C4 — client component, initializes in useEffect, not RSC body
export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      session_recording: {
        maskAllInputs: true, // don't record form inputs (KYC data)
        maskTextSelector: "[data-ph-mask]",
      },
    });

    initialized.current = true;
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}

export { posthog };

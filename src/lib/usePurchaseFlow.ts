"use client";

import { useState } from "react";
import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";

interface PurchaseParams {
  hltId: string;
  sharesToBuy: number;
  allDocumentsChecked: boolean;
  sharesAvailable: number;
}

export function usePurchaseFlow() {
  const { user, kycStatus, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const purchase = async ({ hltId, sharesToBuy, allDocumentsChecked, sharesAvailable }: PurchaseParams) => {
    if (authLoading) return;

    if (!user) {
      // Gate 1: Login required
      router.push(`/auth/login?redirect=/marketplace/${hltId}`);
      return;
    }

    if (kycStatus !== "verified") {
      // Gate 2: KYC required
      router.push("/auth/verify");
      return;
    }

    if (!allDocumentsChecked) {
      setErrorMsg("Please read and accept all three legal documents before purchasing.");
      return;
    }

    if (sharesToBuy <= 0 || sharesToBuy > sharesAvailable) {
      setErrorMsg(`Please select a quantity between 1 and ${sharesAvailable}.`);
      return;
    }

    setIsRedirecting(true);
    setErrorMsg("");

    const isBypassStripe = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true";

    if (isBypassStripe) {
      // Simulate network request/Stripe redirect delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(`/mystable?success=true`);
      return;
    }

    try {
      // Call local Next.js proxy route to create Stripe checkout session
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          hlt_id: hltId,
          shares_to_buy: sharesToBuy,
          bypass_kyc: true, // Allow test mode bypass for dev purposes
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Checkout error: ${res.status}` }));
        throw new Error(errorData.error || `Checkout failed: ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout URL not returned");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to initiate Stripe Checkout session");
      setIsRedirecting(false);
    }
  };

  return {
    purchase,
    isRedirecting,
    errorMsg,
    setErrorMsg,
  };
}

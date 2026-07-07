"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SandboxPurchaseEsign() {
  const { user } = useAuth();
  const [step, setStep] = useState<"terms" | "pds" | "sa" | "checkout">("terms");
  const [shares, setShares] = useState(1);
  const [signedName, setSignedName] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pricePerShare = 292.50;
  const totalPrice = shares * pricePerShare;

  const handleNextStep = () => {
    if (step === "terms") {
      setStep("pds");
    } else if (step === "pds") {
      if (!isSigned || !signedName.trim()) {
        alert("Please sign your name and agree to the PDS to continue.");
        return;
      }
      setIsSigned(false); // Reset signature state for next document
      setSignedName("");
      setStep("sa");
    } else if (step === "sa") {
      if (!isSigned || !signedName.trim()) {
        alert("Please sign your name and agree to the Syndicate Agreement to continue.");
        return;
      }
      setStep("checkout");
    }
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      alert("Please log in to proceed.");
      return;
    }
    setIsRedirecting(true);
    setErrorMsg("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hlt_id: "prudentia",
          shares_to_buy: shares,
          user_email: user.email,
          bypass_kyc: true, // For sandbox testing bypass
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create checkout session" }));
        throw new Error(err.error || "Failed to create checkout session");
      }

      const data = await res.json();
      if (data.session_url) {
        window.location.href = data.session_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to start checkout. Check console.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Sandbox Environment</span>
            <h1 className="text-xl font-light">E-Sign & Purchase Sandbox</h1>
          </div>
          <Link href="/marketplace" className="text-xs text-neutral-400 hover:text-white transition">
            Exit Sandbox
          </Link>
        </div>

        {/* User state check */}
        {!user && (
          <div className="bg-amber-950/40 border border-amber-900/50 text-amber-200 text-xs p-4 rounded-xl">
            ⚠️ You are not logged in. You can click through the e-sign steps, but initiating Checkout requires logging in.
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span className={step === "terms" ? "text-white font-bold" : ""}>1. Term Sheet</span>
          <span>→</span>
          <span className={step === "pds" ? "text-white font-bold" : ""}>2. PDS</span>
          <span>→</span>
          <span className={step === "sa" ? "text-white font-bold" : ""}>3. Agreement</span>
          <span>→</span>
          <span className={step === "checkout" ? "text-white font-bold" : ""}>4. Checkout</span>
        </div>

        {/* STEP 1: TERM SHEET */}
        {step === "terms" && (
          <div className="space-y-4">
            <h2 className="text-md font-light text-neutral-300">Review Plain English Terms</h2>
            <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-3 text-sm font-light">
              <div className="flex justify-between"><span className="text-neutral-500">Horse:</span><span>Prudentia</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Price/Share:</span><span>${pricePerShare} NZD</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Investor Return:</span><span>100% of stakes won</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Ownership Length:</span><span>24 Months</span></div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-neutral-500">Shares:</span>
              <input 
                type="number" 
                value={shares} 
                min={1} 
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-neutral-950 border border-neutral-800 text-center py-1.5 rounded-lg text-sm text-white" 
              />
              <span className="text-sm font-light ml-auto text-amber-500">${totalPrice.toLocaleString()} NZD</span>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-white text-black py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition"
            >
              Accept & Continue
            </button>
          </div>
        )}

        {/* STEP 2: PDS SIGNING */}
        {step === "pds" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-light text-neutral-300">Acknowledge Product Disclosure Statement</h2>
              <button 
                onClick={() => {
                  setIsSigned(true);
                  setSignedName(user?.displayName || "John Doe");
                }}
                className="text-[10px] text-amber-500 uppercase tracking-wider hover:underline"
              >
                Skip to signature
              </button>
            </div>
            
            <div className="h-48 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-[10px] text-neutral-500 leading-relaxed font-mono">
              [PRODUCT DISCLOSURE STATEMENT PREVIEW - SCROLLABLE CONTENT]
              <br/><br/>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
              <br/><br/>
              Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum.
              <br/><br/>
              [BOTTOM OF PDS - ACKNOWLEDGEMENT SECTION]
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-xs text-neutral-400">
                <input 
                  type="checkbox" 
                  checked={isSigned} 
                  onChange={(e) => setIsSigned(e.target.checked)} 
                  className="rounded border-neutral-800 bg-neutral-950 text-amber-500 focus:ring-0" 
                />
                I have read and agree to the PDS terms.
              </label>

              <input 
                type="text"
                placeholder="Type your full name to electronically sign"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("terms")}
                className="w-1/3 border border-neutral-800 text-neutral-400 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 hover:text-white transition"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-grow bg-white text-black py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition"
              >
                Sign & Next Document
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SA SIGNING */}
        {step === "sa" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-light text-neutral-300">Acknowledge Syndicate Agreement</h2>
              <button 
                onClick={() => {
                  setIsSigned(true);
                  setSignedName(user?.displayName || "John Doe");
                }}
                className="text-[10px] text-amber-500 uppercase tracking-wider hover:underline"
              >
                Skip to signature
              </button>
            </div>
            
            <div className="h-48 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-[10px] text-neutral-500 leading-relaxed font-mono">
              [SYNDICATE AGREEMENT PREVIEW - SCROLLABLE CONTENT]
              <br/><br/>
              Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis.
              <br/><br/>
              Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
              <br/><br/>
              [BOTTOM OF SA - ACKNOWLEDGEMENT SECTION]
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-xs text-neutral-400">
                <input 
                  type="checkbox" 
                  checked={isSigned} 
                  onChange={(e) => setIsSigned(e.target.checked)} 
                  className="rounded border-neutral-800 bg-neutral-950 text-amber-500 focus:ring-0" 
                />
                I agree to be bound by the Syndicate Agreement.
              </label>

              <input 
                type="text"
                placeholder="Type your full name to electronically sign"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("pds")}
                className="w-1/3 border border-neutral-800 text-neutral-400 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 hover:text-white transition"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-grow bg-white text-black py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition"
              >
                Sign & Finalize
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHECKOUT CONFIRM */}
        {step === "checkout" && (
          <div className="space-y-4">
            <h2 className="text-md font-light text-neutral-300">Ready for Payment</h2>
            
            <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 space-y-4 text-xs font-light text-neutral-400">
              <p className="text-neutral-200">✅ PDS electronically signed.</p>
              <p className="text-neutral-200">✅ Syndicate Agreement electronically signed.</p>
              <p className="text-neutral-500 italic mt-2">
                * Note: Your e-signatures will be stamped onto the official agreements and emailed to you at {user?.email || "[your email]"} post-payment.
              </p>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-500 bg-red-950/20 border border-red-900/50 p-3 rounded-xl">
                Error: {errorMsg}
              </div>
            )}

            <button
              onClick={handleStripeCheckout}
              disabled={isRedirecting || !user}
              className="w-full bg-amber-500 text-black py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-600 transition"
            >
              {isRedirecting ? "Connecting to Stripe..." : "Proceed to Payment"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

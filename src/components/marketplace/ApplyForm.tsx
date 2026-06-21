"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface ApplyFormProps {
  hltId: string;
  horseName: string;
}

export function ApplyForm({ hltId, horseName }: ApplyFormProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    units_requested: 1,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.uid,
          hlt_id: hltId,
          email: formData.email,
          name: formData.name,
          units_requested: formData.units_requested,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Application error: ${res.status}` }));
        throw new Error(errorData.error || `Application failed: ${res.status}`);
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: user?.displayName || "",
        email: user?.email || "",
        units_requested: 1,
        message: "",
      });
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-[18px] font-medium text-white">Application Submitted!</h3>
        <p className="text-[14px] text-white/60">
          We've received your application for {horseName}. Our team will review it and contact you at {formData.email} shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-[11px] uppercase tracking-wider text-white/40 hover:text-white/70 transition"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Widget Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
        
        {/* Header */}
        <div>
          <h3 className="text-[16px] font-light text-white tracking-tight">Apply for Ownership</h3>
          <p className="text-[12px] text-white/40 mt-1">
            Submit an application to own a stake in {horseName}
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#d4a964] transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#d4a964] transition-colors"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Units Requested */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2">
            Units Requested
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, units_requested: Math.max(1, formData.units_requested - 1) })}
              className="w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
              disabled={formData.units_requested <= 1}
            >
              −
            </button>
            <span className="text-lg font-medium text-white min-w-[32px] text-center">
              {formData.units_requested}
            </span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, units_requested: formData.units_requested + 1 })}
              className="w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-white/30 mt-2">
            Minimum 1 unit, Maximum 10 units per application
          </p>
        </div>

        {/* Optional Message */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#d4a964] transition-colors resize-none"
            placeholder="Why are you interested in this horse?"
            rows={3}
          />
        </div>

        {/* Error Message */}
        {errorMsg && (
          <p className="text-xs font-light text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
            {errorMsg}
          </p>
        )}

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting || !user}
          className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-[#d4a964] text-black hover:bg-[#c49954] disabled:border disabled:border-white/10 disabled:text-white/30 disabled:bg-transparent disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>

        {/* Info */}
        <p className="text-[10px] font-light leading-relaxed text-white/20 text-center">
          Applications are reviewed by our team. You will receive an email notification when your application is processed.
        </p>
      </div>
    </form>
  );
}

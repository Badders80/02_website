"use client";

interface RegistrationGateProps {
  horseName: string;
  title?: string;
  description?: string;
  onSignIn: () => void;
  className?: string;
}

export function RegistrationGate({
  horseName,
  title = "Register to view this information",
  description = "Create a free account to view full profiles, pedigrees, race records, and investment opportunities.",
  onSignIn,
  className = "",
}: RegistrationGateProps) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6 ${className}`}>
      <div>
        {horseName && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
            {horseName}
          </p>
        )}
        <h4 className="text-[18px] font-light text-white tracking-tight">
          {title}
        </h4>
      </div>
      <p className="text-[12px] font-light text-white/50 leading-relaxed">
        {description}
      </p>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onSignIn}
          className="w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98]"
        >
          Sign In / Register
        </button>
        <p className="text-[10px] text-white/30 text-center font-light">
          It takes less than a minute
        </p>
      </div>
    </div>
  );
}
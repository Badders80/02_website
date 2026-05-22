'use client';

import { useEffect, useRef, useState } from 'react';

export const AboutSection = () => {
  const ctaAnchorRef = useRef<HTMLDivElement>(null);
  const [ctaHeight, setCtaHeight] = useState<number | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isOverMission, setIsOverMission] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ctaCopy =
    'Unlock the thrill of ownership with early access and behind-the-scenes coverage - it is easier than you think.';
  const shouldShowCta = !isDismissed && !hasSubmitted;

  useEffect(() => {
    const submitted = localStorage.getItem('es_cta_submitted') === 'true';
    setHasSubmitted(submitted);

    if (!submitted && sessionStorage.getItem('es_cta_dismissed') === 'true') {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    const updateSticky = () => {
      if (isDismissed || hasSubmitted) {
        setIsSticky(false);
        return;
      }

      const anchor = ctaAnchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const midpoint = window.innerHeight / 2;
      const shouldStick = rect.top <= midpoint;
      setIsSticky(shouldStick);

      if (ctaHeight === null && rect.height > 0) {
        setCtaHeight(rect.height);
      }
    };

    updateSticky();
    window.addEventListener('scroll', updateSticky, { passive: true });
    window.addEventListener('resize', updateSticky);

    return () => {
      window.removeEventListener('scroll', updateSticky);
      window.removeEventListener('resize', updateSticky);
    };
  }, [ctaHeight, hasSubmitted, isDismissed]);

  useEffect(() => {
    if (!isSticky || !shouldShowCta) {
      setIsOverMission(false);
      return;
    }

    const updateOverlap = () => {
      const mission = document.getElementById('mission');
      if (!mission) {
        setIsOverMission(false);
        return;
      }

      const rect = mission.getBoundingClientRect();
      const midpoint = window.innerHeight / 2;
      setIsOverMission(rect.top <= midpoint && rect.bottom >= midpoint);
    };

    updateOverlap();
    window.addEventListener('scroll', updateOverlap, { passive: true });
    window.addEventListener('resize', updateOverlap);

    return () => {
      window.removeEventListener('scroll', updateOverlap);
      window.removeEventListener('resize', updateOverlap);
    };
  }, [isSticky, shouldShowCta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate submission - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setEmail('');
    setHasSubmitted(true);
    localStorage.setItem('es_cta_submitted', 'true');
    window.dispatchEvent(new CustomEvent('es_cta_submitted'));
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsDismissed(true);
    sessionStorage.setItem('es_cta_dismissed', 'true');
  };

  return (
    <section
      className="bg-black py-64 text-foreground"
      id="about"
      data-cta-overlay="off"
    >
      <div className="mx-auto max-w-6xl px-12 md:px-16 lg:px-20">
        <p className="mb-16 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
          ABOUT
        </p>

        <h2 className="mb-8 text-[36px] font-light tracking-tight text-white md:text-[48px]">
          Own the Experience
        </h2>

        <div className={`mt-6 ${shouldShowCta ? 'space-y-20' : 'space-y-8'}`}>
          <p className="text-[18px] font-light leading-[1.85] text-white/65">
            Racehorse ownership has changed. Evolution Stables removes the barriers that once made it
            complex and inaccessible — opening the door for first-timers and seasoned fans alike to not
            just watch, but own the experience.
          </p>

          {shouldShowCta ? (
            <div
              ref={ctaAnchorRef}
              style={isSticky && ctaHeight ? { minHeight: ctaHeight } : undefined}
            >
              {isSticky ? (
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[3px] pointer-events-none" />
              ) : null}
              <div
                className={
                  isSticky
                    ? 'fixed left-1/2 top-1/2 z-50 w-full max-w-[760px] -translate-x-1/2 -translate-y-1/2 px-4 text-center'
                    : 'w-[calc(100%+6rem)] -mx-12 px-4 text-center max-w-[760px] sm:mx-auto sm:w-full sm:max-w-[760px]'
                }
              >
                <div
                  className={`relative rounded-lg bg-black px-12 py-12 shadow-[0_0_120px_rgba(0,0,0,0.98)] border transition-colors duration-500 ${
                    isOverMission ? 'border-white/25' : 'border-white/10'
                  }`}
                >
                  {isSticky ? (
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Dismiss"
                      className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
                    >
                      ×
                    </button>
                  ) : null}
                  <h4 className="mb-6 text-[21px] font-light leading-tight text-white">
                    {ctaCopy}
                  </h4>

                  <div className="mx-auto mt-0 w-full max-w-[620px]">
                    <form onSubmit={handleSubmit} className="relative group">
                      {hasSubmitted ? (
                        <div
                          className="flex w-full items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm tracking-wide text-white animate-fade-in"
                          role="status"
                          aria-live="polite"
                        >
                          Welcome to the Evolution
                        </div>
                      ) : (
                        <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 w-full md:rounded-full md:border md:border-white/[0.06] md:bg-zinc-900/60 md:p-1.5 md:overflow-hidden transition-all duration-500 group-focus-within:border-white/30 group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                          <div className="absolute inset-0 opacity-20 transition-opacity duration-700 pointer-events-none mix-blend-overlay group-hover:opacity-40 group-focus-within:opacity-40">
                            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-xl animate-border-shimmer -skew-x-12" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            className="w-full md:flex-1 rounded-full border border-white/[0.06] bg-zinc-900/60 pl-6 pr-6 md:pr-32 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none font-light relative z-10 md:border-0 md:bg-transparent"
                            aria-label="Email address"
                            disabled={isSubmitting}
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="static w-full md:w-auto md:absolute md:right-1.5 md:top-1/2 md:-translate-y-1/2 md:z-20 relative overflow-hidden rounded-full px-6 py-2.5 text-[11px] font-light uppercase tracking-wider text-white border border-white/20 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:scale-[1.03] cursor-pointer disabled:cursor-not-allowed"
                          >
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute -inset-y-4 -inset-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-30 blur-xl animate-border-shimmer" />
                            </div>
                            <span className="relative z-10">Join the Evolution</span>
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[18px] font-light leading-[1.85] text-white/65">
              {ctaCopy}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

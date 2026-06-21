export function LatestUpdateSection() {
  return (
    <section id="innovation" className="py-56 bg-background">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Label */}
        <p className="text-[10px] font-mono tracking-widest-2 uppercase mb-12 text-muted-foreground">
          LATEST UPDATE
        </p>

        {/* Story Content */}
        <div className="mb-24 space-y-6">
          <h2 className="text-[36px] md:text-[48px] leading-tight text-foreground font-semibold tracking-tight mb-6">
            Prudentia Scores <br />
            Gutsy Victory
          </h2>
          <p className="text-[18px] leading-relaxed font-normal text-foreground/90 max-w-3xl">
            Great news for Evolution Stables investors — Prudentia has scored a
            tough, gutsy victory in Race 7 (BM65, 1300m) at Te Rapa this
            afternoon on a Heavy 10 track.
          </p>
          <p className="text-[16px] leading-relaxed font-normal text-muted max-w-3xl">
            She showed her class, coming from deep in the field at the halfway
            mark, running the perfect race to take the lead where it counted and
            fighting hard all the way to the line under Masa Hashizume.
          </p>
          <div className="pt-4">
            <a
              href="https://x.com/EvolutionStable/status/2045096014466760782"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest text-muted hover:text-foreground transition-colors duration-300"
            >
              View on X
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

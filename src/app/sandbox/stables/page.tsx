import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import stablesData from "@/dna/content/stables.json";

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "open": "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    "sold-out": "bg-white/10 text-white/50 border border-white/10",
    "coming-soon": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${styles[status as keyof typeof styles] || styles["sold-out"]}`}>
      {status.replace("-", " ")}
    </span>
  );
}

export default function SandboxStablesPage() {
  return (
    <>
      <NavBar />
      <main className="bg-black text-white min-h-screen">
        {/* Hero */}
        <section className="py-24 px-6 md:px-12 border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-clamp-xl font-normal tracking-tight leading-[1.1] mb-6">
              The stables<br />
              <span className="text-white/40">not the spreadsheet.</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              Every horse in the Evolution network is in a trainer's yard. That means real people, 
              real routines, real mornings. These are the campaigns — open, sold, or coming soon.
            </p>
          </div>
        </section>

        {/* Stables List */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-5xl mx-auto space-y-20">
            {stablesData.stables.map((stable, index) => (
              <article 
                key={stable.id} 
                className="group border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.03] transition-colors duration-500"
              >
                {/* Trainer */}
                <div className="p-8 md:p-12 border-b border-white/[0.06]">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                      {stable.trainer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium tracking-wide text-white mb-1">
                        {stable.trainer.name}
                      </h3>
                      <p className="text-sm text-white/40">{stable.trainer.location}</p>
                      <p className="text-sm text-white/40 mt-1">
                        {stable.trainer.wins} wins · {stable.trainer.strikeRate} strike rate · {stable.trainer.stakesWins} stakes wins
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-white/50 leading-relaxed max-w-2xl text-sm">
                    {stable.trainer.bio}
                  </p>
                </div>

                {/* Horse */}
                <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-[4/3] rounded-xl bg-white/[0.04] flex items-center justify-center text-white/20 text-sm border border-white/[0.06]">
                      {/* Replace with Image component when photo exists */}
                      <span>Photo incoming</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <StatusBadge status={stable.horse.campaign.status} />
                      {stable.horse.campaign.tokensSold > 0 && (
                        <span className="text-xs text-white/30">
                          {stable.horse.campaign.tokensSold} / {stable.horse.campaign.totalTokens} units taken
                        </span>
                      )}
                    </div>
                    <h4 className="text-2xl font-serif tracking-tight mb-3">
                      {stable.horse.name}
                    </h4>
                    <p className="text-sm text-white/40 mb-4">
                      {stable.horse.age} · {stable.horse.sex} · {stable.horse.sire} / {stable.horse.dam}
                    </p>
                    <p className="text-white/60 leading-relaxed mb-6 text-sm">
                      {stable.horse.story}
                    </p>
                    
                    {/* Race record */}
                    {stable.horse.campaign.races.length > 0 && (
                      <div className="mb-6 p-4 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                        <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Race Record</p>
                        <div className="space-y-2">
                          {stable.horse.campaign.races.map((race, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-white/70">{race.date} · {race.venue}</span>
                              <span className={`${race.result === "1st" ? "text-emerald-400" : "text-white/50"} font-medium`}>
                                {race.result} ({race.race})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {stable.horse.campaign.status === "open" && (
                        <Link
                          href={`/sandbox/marketplace/${stable.id}`}
                          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider bg-white text-black hover:bg-white/90 transition-colors"
                        >
                          Buy stake natively
                        </Link>
                      )}
                      {stable.horse.campaign.status === "sold-out" && (
                        <button
                          disabled
                          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider border border-white/10 text-white/30"
                        >
                          Sold Out
                        </button>
                      )}
                      {stable.horse.campaign.status === "coming-soon" && (
                        <a
                          href="#"
                          className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider border border-white/20 text-white hover:border-white/40 hover:bg-white/[0.03] transition-all"
                        >
                          Join waitlist
                        </a>
                      )}
                      {stable.horse.campaign.nextRace && (
                        <span className="text-xs text-white/30 self-center">
                          Next: {stable.horse.campaign.nextRace}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Track Record Summary */}
        <section className="py-24 px-6 md:px-12 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-white/30 mb-6">Track Record</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <p className="text-4xl font-serif text-white mb-1">{stablesData.trackRecord.wins}</p>
                <p className="text-xs text-white/30 uppercase tracking-wider">Wins</p>
              </div>
              <div>
                <p className="text-4xl font-serif text-white mb-1">{stablesData.trackRecord.places}</p>
                <p className="text-xs text-white/30 uppercase tracking-wider">Places</p>
              </div>
              <div>
                <p className="text-4xl font-serif text-white mb-1">{stablesData.trackRecord.totalRuns}</p>
                <p className="text-xs text-white/30 uppercase tracking-wider">Total Runs</p>
              </div>
              <div>
                <p className="text-4xl font-serif text-white mb-1">${(stablesData.trackRecord.earnings / 1000).toFixed(0)}k</p>
                <p className="text-xs text-white/30 uppercase tracking-wider">Prize Money</p>
              </div>
            </div>
            <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
              One winner from limited starts. Every horse currently in the stable is either in campaign 
              or pre-training. The story is being written.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

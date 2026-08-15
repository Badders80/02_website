"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PedigreeTable } from "./PedigreeTable";
import { RegistrationGate } from "./RegistrationGate";
import { getCampaignStatus, type CampaignStatus } from "@/lib/campaign-status";
import { normalizePedigreeName } from "@/lib/pedigree-name";

import { type Race } from "@/lib/types";

interface DetailTabsProps {
  horseName: string;
  sireName: string;
  damName: string;
  damSireName?: string;
  sex: string;
  colour: string;
  age?: number;
  wins: string;
  placed: string;
  loveracingId?: string;
  breedingUrl?: string | null;
  performanceProfileUrl?: string | null;
  trainer: {
    name: string;
    stable_name: string;
    contact_name?: string;
    location: string;
    nztr_license_number?: string;
    bio?: string;
    website?: string;
    phone?: string;
    email?: string;
    image_path?: string;
    people?: Array<{
      slug: string;
      name: string;
      roles?: string[];
      bio?: string;
      website?: string;
    }>;
  };
  horseSlug: string;
  listingStatus?: string;
  hasTermsSheet?: boolean;
  sharesTotal?: number;
  sharesSold?: number;
  foalingDate?: string;
  pedigreeData?: any;
  story?: string;
  pedigreeBlurb?: string;
  trainerCommentary?: string;
  raceLog?: Race[];
  trainerBio?: string;
}

function getRaceRecordEmptyMessage(status: CampaignStatus): string {
  if (status === "completed") {
    return "No recent starts recorded in our timeline. View the Full NZTR Record for complete race history.";
  }
  if (status === "fully_subscribed") {
    return "No recent starts recorded yet. Horse may be in early campaign or pre-race preparation.";
  }
  return "No recent starts recorded. Horse is currently in pre-training preparation.";
}

function TabAccessOverlay({
  title,
  description,
  onSignIn,
}: {
  title: string;
  description: string;
  onSignIn: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-surface-base backdrop-blur-[4px] rounded-xl border border-border" />
      <div className="relative z-10 w-full max-w-sm px-6">
        <RegistrationGate
          horseName=""
          title={title}
          description={description}
          onSignIn={onSignIn}
          className="border-border bg-surface-base backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)]"
        />
      </div>
    </div>
  );
}

function DocumentsAccessOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-canvas/20 backdrop-blur-[8px] rounded-xl border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
      <div className="relative z-10 text-center px-6 max-w-sm">{children}</div>
    </div>
  );
}

const LEGAL_DOCUMENTS = [
  {
    name: "Product Disclosure Statement (PDS)",
    subtitle: "PDF · Financial Disclosures",
    filename: "pds.pdf",
  },
  {
    name: "Syndicate Agreement",
    subtitle: "PDF · Operational Syndicate Structure",
    filename: "sa.pdf",
  },
] as const;

function LegalDocumentCards({
  horseSlug,
  interactive,
}: {
  horseSlug: string;
  interactive: boolean;
}) {
  return (
    <div className={`space-y-3 ${interactive ? "" : "pointer-events-none select-none"}`}>
      {LEGAL_DOCUMENTS.map((doc) => (
        <div
          key={doc.filename}
          className="flex justify-between items-center border border-border bg-surface-base rounded-xl p-4"
        >
          <div>
            <p className="text-xs font-medium text-heading">{doc.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{doc.subtitle}</p>
          </div>
          <a
            href={`/documents/${horseSlug}/${doc.filename}`}
            target="_blank"
            rel="noreferrer"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            className="text-[10px] font-medium uppercase tracking-widest text-accent hover:underline shrink-0"
          >
            View
          </a>
        </div>
      ))}
    </div>
  );
}

function FormattedText({ text, className = "" }: { text?: string; className?: string }) {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("---") && !l.startsWith("*Sources:"));

  return (
    <div className={`space-y-3 ${className}`}>
      {lines.map((line, lineIdx) => {
        const isBullet = line.startsWith("- ") || line.startsWith("* ");
        const rawContent = isBullet ? line.replace(/^[-*]\s+/, "") : line;

        // Parse inline **bold** markers
        const parts = rawContent.split(/(\*\*.*?\*\*)/g);
        const formatted = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <strong key={pIdx} className="font-semibold text-heading">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2 text-foreground">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{formatted}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed text-foreground">
            {formatted}
          </p>
        );
      })}
    </div>
  );
}

type UserTier = "guest" | "auth" | "kyc";

export function DetailTabs({
  horseName,
  sireName,
  damName,
  damSireName,
  sex,
  colour,
  age,
  wins,
  placed,
  loveracingId,
  breedingUrl,
  performanceProfileUrl,
  trainer,
  horseSlug,
  listingStatus,
  hasTermsSheet,
  sharesTotal = 0,
  sharesSold = 0,
  foalingDate,
  pedigreeData,
  story,
  pedigreeBlurb,
  trainerCommentary,
  raceLog,
  trainerBio,
}: DetailTabsProps) {
  const { user, kycStatus } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"trainer" | "pedigree" | "race-record" | "documents">("trainer");

  const normalizedSireName = normalizePedigreeName(sireName);
  const normalizedDamName = normalizePedigreeName(damName);

  const handleSignInRedirect = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/marketplace/${horseSlug}`)}`);
  };

  // Determine races to show
  const races = raceLog && raceLog.length > 0 ? raceLog : [];

  // Determine status (first-class campaign_status when present; else inference)
  const status: CampaignStatus = getCampaignStatus({
    listing_status: listingStatus || "draft",
    shares_total: sharesTotal,
    shares_sold: sharesSold,
    has_terms_sheet: hasTermsSheet,
  });

  // Determine user tier
  const tier: UserTier = !user ? "guest" : kycStatus === "verified" ? "kyc" : "auth";

  // Documents are accessible only to KYC'd users for eligible statuses
  const docsEligibleStatuses: CampaignStatus[] = ["coming_soon_details", "listed"];
  const canAccessDocs = tier === "kyc" && docsEligibleStatuses.includes(status);
  const isComingSoon =
    status === "coming_soon" || status === "coming_soon_details";

  const activeBio = trainerBio || trainer.bio || "A professional racing operation with proven training methodologies and patient horse development.";

  return (
    <div className="space-y-8">
      {/* Tab Nav */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {(["trainer", "pedigree", "race-record", "documents"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 text-xs uppercase tracking-widest font-light transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
              activeTab === tab
                ? "border-accent text-accent font-medium"
                : "border-transparent text-muted-foreground hover:text-frost"
            }`}
          >
            {tab.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="pt-2 min-h-[220px]">
        {/* Trainer Panel */}
        {activeTab === "trainer" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-md font-medium text-heading">
                  {trainer.stable_name || trainer.name || "—"}
                </h4>
                {trainer.location && (
                  <p className="text-xs text-muted-foreground mt-0.5">{trainer.location}</p>
                )}
              </div>
              {trainer.website && (
                <a
                  href={trainer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest font-mono text-accent hover:underline shrink-0"
                >
                  Official Website ↗
                </a>
              )}
            </div>

            <div className="space-y-6 font-light text-sm leading-[1.8] text-foreground">
              {/* Single Unified Profile Narrative */}
              <div className="prose prose-invert max-w-none text-sm font-light leading-relaxed text-foreground">
                <FormattedText text={activeBio} />
              </div>
            </div>
          </div>
        )}

        {/* Pedigree Panel */}
        {activeTab === "pedigree" && (
          <div className="relative min-h-[280px] space-y-4">
            <div className={tier === "guest" ? "opacity-30 pointer-events-none select-none blur-[2px]" : ""}>
              <PedigreeTable
                horseName={horseName}
                sireName={normalizedSireName}
                damName={normalizedDamName}
                damSireName={damSireName}
                sex={sex}
                colour={colour}
                age={age}
                foalingDate={foalingDate}
                breedingUrl={breedingUrl}
                pedigreeData={pedigreeData}
              />
            </div>
            {pedigreeBlurb && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-zinc-300 leading-relaxed font-light mt-4">
                <span className="text-amber-400 font-medium uppercase text-[10px] tracking-wider block mb-1">Pedigree Insight</span>
                {pedigreeBlurb}
              </div>
            )}
            {tier === "guest" && (
              <TabAccessOverlay
                title="Register to view pedigree"
                description="Create a free account to explore the full 4-generation family tree and breeding records."
                onSignIn={handleSignInRedirect}
              />
            )}
          </div>
        )}

        {/* Race Record Panel */}
        {activeTab === "race-record" && (
          <div className="relative space-y-6 animate-fade-in min-h-[280px]">
            <div className={tier === "guest" ? "opacity-30 pointer-events-none select-none blur-[2px]" : ""}>
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h4 className="text-md font-medium text-heading">Race Timeline & Starts</h4>
                <p className="text-xs text-muted-foreground mt-1">Summary: {wins || "0"} Win{Number(wins) !== 1 ? "s" : ""} · {placed || "0"} Place{Number(placed) !== 1 ? "s" : ""}</p>
              </div>
              {(breedingUrl || performanceProfileUrl) && (
                <div className="flex gap-4">
                  {breedingUrl && (
                    <a
                      href={breedingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest font-mono text-accent hover:underline"
                    >
                      Breeding Record ↗
                    </a>
                  )}
                  {performanceProfileUrl && (
                    <a
                      href={performanceProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest font-mono text-accent hover:underline"
                    >
                      Full NZTR Record ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {races.length === 0 ? (
              <p className="text-sm text-muted-foreground font-light py-4">{getRaceRecordEmptyMessage(status)}</p>
            ) : (
              <div className="space-y-4 pt-2">
                {races.map((race, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-border pb-3 text-sm font-light"
                  >
                    <div className="space-y-1">
                      <p className="text-foreground">{race.venue} · <span className="text-muted-foreground text-xs">{race.date}</span></p>
                      <p className="text-xs text-muted-foreground">{race.race} {race.trackCondition ? `(${race.trackCondition})` : ""}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      race.result.toLowerCase() === "1st"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-surface-base text-foreground"
                    }`}>
                      {race.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
            </div>
            {tier === "guest" && (
              <TabAccessOverlay
                title="Register to view race record"
                description="Create a free account to view race timelines, results, and NZTR performance links."
                onSignIn={handleSignInRedirect}
              />
            )}
          </div>
        )}

        {/* Documents Panel */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-heading">Legal Disclosures & Documents</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Ownership is bound by regulated legal documentation. We strongly recommend downloading and reviewing the DSL parameters prior to committing stakes.
            </p>

            <div className="relative pt-2 min-h-[200px]">
              <LegalDocumentCards horseSlug={horseSlug} interactive={canAccessDocs} />
              {!canAccessDocs && (
                <DocumentsAccessOverlay>
                  {isComingSoon ? (
                    <>
                      <p className="text-[18px] font-light tracking-tight text-foreground">Coming Soon</p>
                      <p className="mt-2 text-[11px] font-light text-muted-foreground leading-relaxed">
                        Documents will be available when this offering goes live.
                      </p>
                    </>
                  ) : tier === "guest" ? (
                    <>
                      <p className="text-[15px] font-medium tracking-tight text-foreground">Register to Access</p>
                      <p className="mt-2 text-[11px] font-light text-muted-foreground leading-relaxed">
                        Create an account and complete verification to view legal documents.
                      </p>
                    </>
                  ) : tier === "auth" ? (
                    <>
                      <p className="text-[15px] font-medium tracking-tight text-foreground">Verification Required</p>
                      <p className="mt-2 text-[11px] font-light text-muted-foreground leading-relaxed">
                        Complete identity verification to access legal disclosures and documents.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-medium tracking-tight text-foreground">Restricted: Investors Only</p>
                      <p className="mt-2 text-[11px] font-light text-muted-foreground leading-relaxed">
                        Documents for this campaign are restricted to verified investors.
                      </p>
                    </>
                  )}
                </DocumentsAccessOverlay>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
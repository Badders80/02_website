"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PedigreeTable } from "./PedigreeTable";
import { RegistrationGate } from "./RegistrationGate";
import { getCampaignStatus, type CampaignStatus } from "@/lib/campaign-status";

interface Race {
  date: string;
  venue: string;
  race: string;
  trackCondition?: string;
  result: string;
  margin?: string;
}

interface DetailTabsProps {
  horseName: string;
  sireName: string;
  damName: string;
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
  };
  horseSlug: string;
  listingStatus?: string;
  hasTermsSheet?: boolean;
  sharesTotal?: number;
  sharesSold?: number;
  foalingDate?: string;
  pedigreeData?: any;
}

function getRaceRecordEmptyMessage(status: CampaignStatus): string {
  if (status === "term-completed") {
    return "No recent starts recorded in our timeline. View the Full NZTR Record for complete race history.";
  }
  if (status === "fully-subscribed") {
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
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[4px] rounded-xl border border-white/[0.04]" />
      <div className="relative z-10 w-full max-w-sm px-6">
        <RegistrationGate
          horseName=""
          title={title}
          description={description}
          onSignIn={onSignIn}
          className="border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)]"
        />
      </div>
    </div>
  );
}

function DocumentsGateOverlay({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</p>
          <h4 className="text-[16px] font-light text-white leading-snug">{title}</h4>
          <p className="text-[11px] font-light text-white/45 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

const LEGAL_DOCUMENTS = [
  {
    name: "HLT Term Sheet",
    subtitle: "PDF · Summary of Lease Parameters",
    filename: "term-sheet.pdf",
  },
  {
    name: "Product Disclosure Statement (PDS)",
    subtitle: "PDF · Financial Disclosures",
    filename: "pds.pdf",
  },
  {
    name: "Syndicate Agreement",
    subtitle: "PDF · Operational Syndicate Structure",
    filename: "syndicate-agreement.pdf",
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
          className="flex justify-between items-center border border-white/[0.06] bg-white/[0.01] rounded-xl p-4"
        >
          <div>
            <p className="text-xs font-medium text-white/95">{doc.name}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{doc.subtitle}</p>
          </div>
          <a
            href={`/documents/${horseSlug}/${doc.filename}`}
            target="_blank"
            rel="noreferrer"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            className="text-[10px] font-medium uppercase tracking-widest text-[#d4a964] hover:underline shrink-0"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}

// Hardcoded historical races for Prudentia
const PRUDENTIA_RACES: Race[] = [
  { date: "15 Mar 2025", venue: "Tauranga", race: "1400m", trackCondition: "Heavy", result: "1st" },
  { date: "05 Feb 2025", venue: "Te Rapa", race: "1400m", trackCondition: "Good", result: "2nd" },
  { date: "18 Jan 2025", venue: "Matamata", race: "1300m", trackCondition: "Soft", result: "3rd" },
  { date: "12 Dec 2024", venue: "Te Aroha", race: "1250m", trackCondition: "Good", result: "5th" },
  { date: "08 Nov 2024", venue: "Rotorua", race: "1400m", trackCondition: "Slow", result: "7th" },
];

// Hardcoded historical races for First Gear (from loveracing.nz ID 428364)
const FIRST_GEAR_RACES: Race[] = [
  { date: "28 Dec 2024", venue: "Otaki", race: "1600m", trackCondition: "Good", result: "1st" },
  { date: "14 Dec 2024", venue: "Trentham", race: "1400m", trackCondition: "Good", result: "3rd" },
  { date: "23 Nov 2024", venue: "Wanganui", race: "1340m", trackCondition: "Soft", result: "2nd" },
  { date: "09 Nov 2024", venue: "Trentham", race: "1200m", trackCondition: "Good", result: "4th" },
  { date: "26 Oct 2024", venue: "Trentham", race: "1200m", trackCondition: "Soft", result: "2nd" },
];

// Trainer-specific copy
const TRAINER_COPY: Record<string, { bio: string; stableDescription: string }> = {
  "Wexford Stables": {
    bio: "Renowned for training top-tier middle-distance stayers, Wexford Stables utilizes world-class preparation environments, equine swimming resources, and patience-first horse education structures.",
    stableDescription: "out of Matamata",
  },
  "Stephen Gray Racing": {
    bio: "With 24 years of experience in Singapore and now based in New Zealand, Stephen Gray brings a proven track record of developing precocious talent. Copper Belt Lodge provides a patient-first environment with proven swimming and education facilities.",
    stableDescription: "out of Palmerston North",
  },
  "Logan Racing": {
    bio: "Logan Racing is a professional racing operation known for developing young horses through patient preparation and proven training methodologies.",
    stableDescription: "out of Cambridge",
  },
};

function getTrainerCopy(stableName: string): { bio: string; stableDescription: string } {
  return TRAINER_COPY[stableName] || {
    bio: "A professional racing operation with proven training methodologies and patient horse development.",
    stableDescription: `out of ${stableName}`,
  };
}

// Gender-aware pronouns
function getPronouns(sex: string): { subject: string; possessive: string } {
  const lower = sex.toLowerCase();
  if (lower === "gelding") return { subject: "he", possessive: "his" };
  if (lower === "mare" || lower === "filly") return { subject: "she", possessive: "her" };
  if (lower === "colt" || lower === "stallion" || lower === "horse") return { subject: "he", possessive: "his" };
  return { subject: "this horse", possessive: "its" };
}

// Status-aware overview text
function getOverviewCopy(
  horseName: string,
  sireName: string,
  damName: string,
  sex: string,
  status: CampaignStatus,
): { para1: string; para2: string } {
  const pronouns = getPronouns(sex);

  const para1 = `${horseName} represents a strategic leasehold campaign within the Evolution syndicate network. Sired by ${sireName || "—"} out of ${damName || "—"}, ${pronouns.possessive} breeding carries proven speed and durability profiles suited for domestic New Zealand benchmark competition.`;

  let para2: string;
  if (status === "term-completed") {
    para2 = `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} has completed ${pronouns.possessive} lease campaign under professional preparations, demonstrating adaptability across track conditions throughout ${pronouns.possessive} racing career.`;
  } else if (status === "fully-subscribed") {
    para2 = `Trained under professional preparations, ${pronouns.subject} has shown great adaptability to track variations and is in active campaign.`;
  } else if (status === "become-an-owner") {
    para2 = `Trained under professional preparations, ${pronouns.subject} has shown great adaptability to track variations and is being built toward late-season stakes qualifications.`;
  } else {
    // coming-soon
    para2 = `Trained under professional preparations, ${pronouns.subject} has shown great adaptability to track variations and is being built toward late-season stakes qualifications.`;
  }

  return { para1, para2 };
}

type UserTier = "guest" | "auth" | "kyc";

export function DetailTabs({
  horseName,
  sireName,
  damName,
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
}: DetailTabsProps) {
  const { user, kycStatus } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "pedigree" | "trainer" | "race-record" | "documents">("overview");

  const handleSignInRedirect = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/marketplace/${horseSlug}`)}`);
  };

  // Determine which races to show
  const races = horseSlug === "prudentia" ? PRUDENTIA_RACES
    : horseSlug === "first-gear" ? FIRST_GEAR_RACES
    : [];

  // Determine status
  const status: CampaignStatus = listingStatus === "draft"
    ? (hasTermsSheet ? "coming-soon-with-details" : "coming-soon")
    : getCampaignStatus({
        listing_status: listingStatus || "draft",
        shares_total: sharesTotal,
        shares_sold: sharesSold,
        has_terms_sheet: hasTermsSheet,
      });

  // Determine user tier
  const tier: UserTier = !user ? "guest" : kycStatus === "verified" ? "kyc" : "auth";

  // Documents are accessible only to KYC'd users for eligible statuses
  const docsEligibleStatuses: CampaignStatus[] = ["coming-soon-with-details", "become-an-owner"];
  const canAccessDocs = tier === "kyc" && docsEligibleStatuses.includes(status);
  const isComingSoon = listingStatus === "draft";

  const trainerCopy = getTrainerCopy(trainer.stable_name || trainer.name || "");
  const overviewCopy = getOverviewCopy(horseName, sireName, damName, sex, status);

  return (
    <div className="space-y-8">
      {/* Tab Nav */}
      <div className="flex border-b border-white/[0.06] overflow-x-auto scrollbar-none">
        {(["overview", "pedigree", "trainer", "race-record", "documents"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 text-xs uppercase tracking-widest font-light transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
              activeTab === tab
                ? "border-[#d4a964] text-[#d4a964] font-medium"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="pt-2 min-h-[220px]">
        {/* Overview Panel */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in font-light">
            <h4 className="text-md font-medium text-white">Expanded Pedigree</h4>
            <div className="space-y-4">
              <p className="text-sm leading-[1.8] text-white/60">
                {overviewCopy.para1}
              </p>
              <p className="text-sm leading-[1.8] text-white/60">
                {overviewCopy.para2}
              </p>
            </div>
          </div>
        )}

        {/* Pedigree Panel */}
        {activeTab === "pedigree" && (
          <div className="relative min-h-[280px]">
            <div className={tier === "guest" ? "opacity-30 pointer-events-none select-none blur-[2px]" : ""}>
              <PedigreeTable
                horseName={horseName}
                sireName={sireName}
                damName={damName}
                sex={sex}
                colour={colour}
                age={age}
                foalingDate={foalingDate}
                breedingUrl={breedingUrl}
                pedigreeData={pedigreeData}
              />
            </div>
            {tier === "guest" && (
              <TabAccessOverlay
                title="Register to view pedigree"
                description="Create a free account to explore the full 4-generation family tree and breeding records."
                onSignIn={handleSignInRedirect}
              />
            )}
          </div>
        )}

        {/* Trainer Panel */}
        {activeTab === "trainer" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white">Trainer Profile</h4>
            <div className="space-y-4 font-light text-sm leading-[1.8] text-white/60">
              <p>
                <span className="text-white font-normal">{trainer.stable_name || trainer.name || "—"}</span> {trainerCopy.stableDescription}.
                {" "}{trainerCopy.bio}
              </p>
              {trainer.contact_name && (
                <p className="text-xs text-white/40">
                  Contact: <span className="text-white/60">{trainer.contact_name}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Race Record Panel */}
        {activeTab === "race-record" && (
          <div className="relative space-y-6 animate-fade-in min-h-[280px]">
            <div className={tier === "guest" ? "opacity-30 pointer-events-none select-none blur-[2px]" : ""}>
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
              <div>
                <h4 className="text-md font-medium text-white">Race Timeline & Starts</h4>
                <p className="text-xs text-white/40 mt-1">Summary: {wins || "0"} Win{Number(wins) !== 1 ? "s" : ""} · {placed || "0"} Place{Number(placed) !== 1 ? "s" : ""}</p>
              </div>
              {(breedingUrl || performanceProfileUrl) && (
                <div className="flex gap-4">
                  {breedingUrl && (
                    <a
                      href={breedingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest font-mono text-[#d4a964] hover:underline"
                    >
                      Breeding Record ↗
                    </a>
                  )}
                  {performanceProfileUrl && (
                    <a
                      href={performanceProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest font-mono text-[#d4a964] hover:underline"
                    >
                      Full NZTR Record ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {races.length === 0 ? (
              <p className="text-sm text-white/40 font-light py-4">{getRaceRecordEmptyMessage(status)}</p>
            ) : (
              <div className="space-y-4 pt-2">
                {races.map((race, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-white/[0.04] pb-3 text-sm font-light"
                  >
                    <div className="space-y-1">
                      <p className="text-white/80">{race.venue} · <span className="text-white/45 text-xs">{race.date}</span></p>
                      <p className="text-xs text-white/45">{race.race} {race.trackCondition ? `(${race.trackCondition})` : ""}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      race.result.toLowerCase() === "1st"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.04] text-white/60"
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
            <h4 className="text-md font-medium text-white">Legal Disclosures & Documents</h4>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Ownership is bound by regulated legal documentation. We strongly recommend downloading and reviewing the HLT parameters prior to committing stakes.
            </p>

            <div className="relative pt-2 min-h-[320px]">
              <LegalDocumentCards horseSlug={horseSlug} interactive={canAccessDocs} />
              {!canAccessDocs && (
                isComingSoon ? (
                  <DocumentsGateOverlay
                    label="Coming Soon"
                    title="Documents will be available when this offering goes live."
                    description="We strongly recommend reviewing the HLT parameters prior to committing stakes."
                  />
                ) : tier === "guest" ? (
                  <DocumentsGateOverlay
                    label="Register to Access"
                    title="Create an account to view legal documents."
                    description="Complete verification to download PDS and syndicate agreements."
                  />
                ) : tier === "auth" ? (
                  <DocumentsGateOverlay
                    label="Verification Required"
                    title="Complete identity verification to access documents."
                    description="Legal disclosures are available to verified investors only."
                  />
                ) : (
                  <DocumentsGateOverlay
                    label="Restricted"
                    title="Documents for this campaign are restricted to verified investors."
                    description="Contact us if you believe you should have access."
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminButton, AdminInput, AdminSelect, AdminForm } from "@/components/admin";
import { createHorse, extractFromLoveracing } from "@/lib/api";

interface LoveracingRef {
  loveracing_id: number;
  name_slug: string;
  life_number: string;
  sire_name: string;
  dam_name: string;
  colour: string;
  sex: string;
  foaling_date: string;
  breeder: string;
  brands: string;
  source_url: string;
}

export default function NewHorsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loveracingLoading, setLoveracingLoading] = useState(false);
  const [loveracingRef, setLoveracingRef] = useState<LoveracingRef | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    microchip: "",
    name: "",
    foaling_date: "",
    sex: "",
    colour: "",
    sire_name: "",
    dam_name: "",
    family_number: "",
    breeder: "",
    left_shoulder_brand: "",
    right_shoulder_brand: "",
    trainer_id: "",
    status: "active" as "active" | "retired" | "deceased",
  });

  const handleLoveracingLookup = async () => {
    setLoveracingLoading(true);
    try {
      const url = prompt("Enter the full loveracing.nz Stud Book URL:\n(e.g., https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx)");
      if (!url) return;

      // Validate URL format
      const urlMatch = url.match(/https?:\/\/loveracing\.nz\/Breeding\/(\d+)\/(.+)\.aspx/i);
      if (!urlMatch) {
        setError("Invalid loveracing.nz URL. Must be format: https://loveracing.nz/Breeding/{ID}/{NameSlug}.aspx");
        return;
      }

      // Call the real scraping API
      const extractedData = await extractFromLoveracing(url);

      setLoveracingRef({
        loveracing_id: extractedData.loveracing_id,
        name_slug: extractedData.name_slug,
        life_number: extractedData.life_number,
        sire_name: extractedData.sire_name || "",
        dam_name: extractedData.dam_name || "",
        colour: extractedData.colour || "",
        sex: extractedData.sex || "",
        foaling_date: extractedData.foaling_date.split('T')[0] || "",
        breeder: extractedData.breeder || "",
        brands: "",
        source_url: url,
      });

      // Auto-populate Step 2 form with extracted data
      setForm(prev => ({
        ...prev,
        microchip: extractedData.microchip || "",
        name: extractedData.name || "",
        foaling_date: extractedData.foaling_date.split('T')[0] || "",
        sex: extractedData.sex || "",
        colour: extractedData.colour || "",
        sire_name: extractedData.sire_name || "",
        dam_name: extractedData.dam_name || "",
        breeder: extractedData.breeder || "",
      }));

      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to extract data from loveracing.nz");
    } finally {
      setLoveracingLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate microchip (15 digits)
      if (!/^\d{15}$/.test(form.microchip)) {
        throw new Error("Microchip must be 15 digits");
      }

      const payload = {
        ...form,
        loveracing_ref: loveracingRef ? {
          loveracing_id: loveracingRef.loveracing_id,
          name_slug: loveracingRef.name_slug,
          source_url: loveracingRef.source_url,
        } : undefined,
      };

      await createHorse(payload);
      router.push("/admin/horses");
    } catch (err: any) {
      setError(err.message || "Failed to register horse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Register New Horse</h1>
        <p className="mt-1 text-sm text-muted">Start with the loveracing.nz Stud Book URL, then verify details.</p>
      </div>

      {/* Step 1: Loveracing.nz URL Entry */}
      <div className="rounded-xl border border-white/[0.06] bg-panel p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Step 1: Import from Stud Book</h2>
        <p className="text-sm text-muted">Paste the full URL from loveracing.nz to auto-fill horse details.</p>
        
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLoveracingLookup}
            disabled={loveracingLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gold-hover disabled:opacity-50"
          >
            {loveracingLoading ? "Extracting..." : "🔗 Import from loveracing.nz"}
          </button>
          {loveracingRef && (
            <span className="text-sm text-success-text">✓ Data extracted</span>
          )}
        </div>

        {loveracingRef && (
          <div className="rounded-lg border border-success-border bg-success-bg p-4">
            <p className="text-sm text-success-text">
              <strong>Source:</strong> <a href={loveracingRef.source_url} target="_blank" rel="noreferrer" className="underline">{loveracingRef.source_url}</a>
            </p>
            {form.name && (
              <p className="text-sm text-success-text mt-1">
                <strong>Horse:</strong> {form.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Verify & Complete */}
      <div className="rounded-xl border border-white/[0.06] bg-panel p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Step 2: Verify & Complete Registration</h2>
        <p className="text-sm text-muted mb-6">Confirm the extracted details and add the microchip (primary identifier).</p>

        <AdminForm onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Microchip - Primary Key */}
            <div className="rounded-xl border border-gold/[0.3] bg-gold/[0.05] p-4">
              <AdminInput
                required
                label="Microchip (Primary Identifier)"
                value={form.microchip}
                onChange={(e) => setForm({ ...form, microchip: e.target.value })}
                placeholder="982000123456789"
                pattern="\d{15}"
              />
            </div>

            <AdminInput
              required
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Prudentia NZ"
            />

            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Foaling Date"
                type="date"
                value={form.foaling_date}
                onChange={(e) => setForm({ ...form, foaling_date: e.target.value })}
              />
              <AdminSelect
                label="Sex"
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
                options={[
                  { value: "", label: "Select..." },
                  { value: "Filly", label: "Filly" },
                  { value: "Colt", label: "Colt" },
                  { value: "Gelding", label: "Gelding" },
                  { value: "Mare", label: "Mare" },
                  { value: "Stallion", label: "Stallion" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Sire"
                value={form.sire_name}
                onChange={(e) => setForm({ ...form, sire_name: e.target.value })}
                placeholder="Sire name"
              />
              <AdminInput
                label="Dam"
                value={form.dam_name}
                onChange={(e) => setForm({ ...form, dam_name: e.target.value })}
                placeholder="Dam name"
              />
            </div>

            <AdminInput
              label="Colour"
              value={form.colour}
              onChange={(e) => setForm({ ...form, colour: e.target.value })}
              placeholder="Bay, Chestnut, etc."
            />

            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Left Shoulder Brand"
                value={form.left_shoulder_brand}
                onChange={(e) => setForm({ ...form, left_shoulder_brand: e.target.value })}
              />
              <AdminInput
                label="Right Shoulder Brand"
                value={form.right_shoulder_brand}
                onChange={(e) => setForm({ ...form, right_shoulder_brand: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Breeder"
                value={form.breeder}
                onChange={(e) => setForm({ ...form, breeder: e.target.value })}
                placeholder="Breeder name"
              />
              <AdminInput
                label="Family Number"
                value={form.family_number}
                onChange={(e) => setForm({ ...form, family_number: e.target.value })}
                placeholder="Family number"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <AdminButton type="submit" isLoading={loading}>
              {loading ? "Registering..." : "Register Horse"}
            </AdminButton>
            <Link href="/admin/horses" className="text-sm text-muted hover:text-foreground">
              Cancel
            </Link>
          </div>
        </AdminForm>
      </div>
    </div>
  );
}

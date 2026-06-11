"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://australia-southeast1-evolution-engine.cloudfunctions.net";

interface EndpointResult {
  label: string;
  method: string;
  path: string;
  status: "ok" | "fail" | "pending";
  ms: number | null;
  data: unknown;
  error: string | null;
}

const ENDPOINTS: { label: string; method: string; path: string; body?: unknown }[] = [
  { label: "SSOT — Horses", method: "GET", path: "/ssot/horses" },
  { label: "SSOT — HLTs (resolved)", method: "GET", path: "/ssot/hlts?resolve=true" },
  { label: "SSOT — Owners", method: "GET", path: "/ssot/owners" },
  { label: "SSOT — Trainers", method: "GET", path: "/ssot/trainers" },
  { label: "SSOT — Content", method: "GET", path: "/ssot/content?status=published" },
  { label: "Assets — Retrieve", method: "GET", path: "/assets/retrieve" },
  { label: "KYC — Create Session", method: "POST", path: "/kyc/create-session", body: { user_id: "handshake-test" } },
];

async function pingEndpoint(
  method: string,
  path: string,
  body?: unknown
): Promise<{ ms: number; data: unknown; error: string | null }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const ms = Math.round(performance.now() - start);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ms, data, error: `${res.status} ${res.statusText}` };
    }
    return { ms, data, error: null };
  } catch (err: unknown) {
    const ms = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);
    return { ms, data: null, error: message };
  }
}

export default function HandshakePage() {
  const [results, setResults] = useState<EndpointResult[]>(
    ENDPOINTS.map((e) => ({
      ...e,
      status: "pending",
      ms: null,
      data: null,
      error: null,
    }))
  );
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function runAll() {
      for (let i = 0; i < ENDPOINTS.length; i++) {
        if (cancelled) return;
        const ep = ENDPOINTS[i];
        const { ms, data, error } = await pingEndpoint(ep.method, ep.path, ep.body);
        if (cancelled) return;
        setResults((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: error ? "fail" : "ok", ms, data, error };
          return next;
        });
      }
    }
    runAll();
    return () => { cancelled = true; };
  }, []);

  const okCount = results.filter((r) => r.status === "ok").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const pendingCount = results.filter((r) => r.status === "pending").length;

  return (
    <main className="min-h-screen bg-black text-white font-mono p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">
            01_evolution ↔ 02_website
          </p>
          <h1 className="text-2xl font-light tracking-tight mb-2">Handshake Status</h1>
          <p className="text-xs text-white/40">
            {API_BASE}
          </p>
        </div>

        {/* Summary bar */}
        <div className="flex gap-6 mb-8 text-xs">
          <span className="text-emerald-400">
            {okCount} OK
          </span>
          <span className="text-red-400">
            {failCount} FAIL
          </span>
          <span className="text-white/20">
            {pendingCount} PENDING
          </span>
        </div>

        {/* Endpoint rows */}
        <div className="space-y-px">
          {results.map((r, i) => (
            <div key={i}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                {/* Status dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    r.status === "ok"
                      ? "bg-emerald-400"
                      : r.status === "fail"
                      ? "bg-red-400"
                      : "bg-white/10 animate-pulse"
                  }`}
                />
                {/* Method badge */}
                <span className="text-[10px] font-bold uppercase tracking-wider w-10 text-white/30">
                  {r.method}
                </span>
                {/* Path */}
                <span className="text-sm font-light flex-1 truncate">{r.path}</span>
                {/* Timing */}
                {r.ms !== null && (
                  <span className="text-xs text-white/30 tabular-nums">{r.ms}ms</span>
                )}
                {/* Chevron */}
                <span className="text-white/20 text-xs">{expanded === i ? "▾" : "▸"}</span>
              </button>

              {/* Expanded detail */}
              {expanded === i && (
                <div className="px-4 py-4 border-x border-b border-white/[0.06] bg-white/[0.01]">
                  {r.error && (
                    <div className="mb-3 text-xs text-red-400 font-mono">
                      ERROR: {r.error}
                    </div>
                  )}
                  <pre className="text-[11px] text-white/50 font-mono leading-relaxed overflow-x-auto max-h-64">
                    {r.data !== null
                      ? JSON.stringify(r.data, null, 2)
                      : r.status === "pending"
                      ? "…"
                      : "null"}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-[10px] text-white/20 leading-relaxed">
          This page tests every backend endpoint defined in{" "}
          <code className="text-white/30">HANDSHAKE.md</code>. Green = live, red =
          unreachable. No auth required — raw wire check only.
        </p>
      </div>
    </main>
  );
}

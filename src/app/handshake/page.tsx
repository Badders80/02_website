import { NextResponse } from "next/server";

/**
 * DORMANT — GCP Cloud Functions retired (billing delinquent).
 * This page was a backend connectivity diagnostic that pinged GCP Cloud Functions
 * via the /api/proxy route. The backend is gone.
 * Redirect to homepage — the handshake tool no longer serves a purpose.
 */

export default function HandshakePage() {
  return (
    <meta httpEquiv="refresh" content="0;url=/" />
  );
}
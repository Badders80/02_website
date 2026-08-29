import { supabase } from '@/lib/supabase';

/**
 * Supabase auth token verification (server-side, service-role).
 *
 * Replaces Firebase ID-token verification. Supabase access tokens are
 * opaque strings — verification happens by asking GoTrue who the token
 * belongs to (auth.getUser(jwt)). The service role key is required and
 * this module must only be imported from server code.
 */

export type DecodedToken = {
  uid: string;
  email?: string;
  [key: string]: unknown;
};

/**
 * Verify a Supabase access token (Bearer) and return the user identity.
 * Throws on any invalid/expired token — callers wrap in try/catch as before.
 */
export async function verifyIdToken(token: string): Promise<DecodedToken> {
  const { data, error } = await supabase().auth.getUser(token);

  if (error || !data?.user) {
    throw new Error(error?.message || 'Invalid or expired token');
  }

  const user = data.user;
  return {
    uid: user.id,
    email: user.email ?? undefined,
    // "Claims" analogue: KYC status / role live in app_metadata.
    ...(user.app_metadata ?? {}),
    ...user.user_metadata,
  };
}

/**
 * Set user "claims" — KYC status / role — on a Supabase user.
 * Replaces Firebase setCustomClaims: same call shape, writes to
 * auth.users.app_metadata via the service-role admin API.
 */
export async function setCustomClaims(
  uid: string,
  claims: Record<string, unknown>,
): Promise<void> {
  // Merge into existing app_metadata so unrelated admin keys survive.
  const { data: existing } = await supabase().auth.admin.getUserById(uid);
  const merged = { ...(existing?.user?.app_metadata ?? {}), ...claims };
  const { error } = await supabase().auth.admin.updateUserById(uid, {
    app_metadata: merged,
  });

  if (error) {
    throw new Error(`Failed to set user claims: ${error.message}`);
  }

  console.log(`[supabase-admin-auth] claims updated for ${uid}:`, claims);
}
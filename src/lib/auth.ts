import { createBrowserClient } from "@/lib/supabase";

/** Sign out via Supabase GoTrue (replaces the previous Firebase signOut). */
export async function signOut(): Promise<void> {
  await createBrowserClient().auth.signOut();
}
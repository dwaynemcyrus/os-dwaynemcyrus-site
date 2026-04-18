import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const env = getSupabaseEnv();

  if (!env) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient(env.url, env.key);

  return browserClient;
}

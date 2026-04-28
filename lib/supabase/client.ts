import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null | undefined;

function isLocalDevelopmentHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

function getLocalDevelopmentStorageKey(url: string) {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isLocalDevelopmentHost(window.location.hostname)) {
    return null;
  }

  const projectRef = new URL(url).hostname.split(".")[0] ?? "supabase";
  return `os-dwaynemcyrus-site-${projectRef}-${window.location.host}-auth-token`;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const env = getSupabaseEnv();

  if (!env) {
    browserClient = null;
    return browserClient;
  }

  const storageKey = getLocalDevelopmentStorageKey(env.url);

  browserClient = createClient(env.url, env.key, {
    auth: storageKey
      ? {
          storageKey,
        }
      : undefined,
  });

  return browserClient;
}

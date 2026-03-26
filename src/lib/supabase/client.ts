import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser Supabase client.
 *
 * The URL and anon key are injected as public env vars at build time
 * by the Vercel integration (populated from 1Password during CI).
 * They are safe to expose — Row Level Security protects the data.
 */
export function createSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  client = createBrowserClient<Database>(url, anonKey);
  return client;
}

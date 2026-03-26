import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSecrets } from "@/lib/secrets";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = await getSecrets([
    "supabaseUrl",
    "supabaseAnonKey",
  ]);

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored when called from a Server Component
        }
      },
    },
  });
}

/** Admin client with service role key — use only in server actions / API routes. */
export async function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = await getSecrets([
    "supabaseUrl",
    "supabaseServiceRoleKey",
  ]);

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored when called from a Server Component
        }
      },
    },
  });
}

import { createClient } from "@1password/sdk";

// ---------------------------------------------------------------------------
// 1Password SDK client (singleton per server instance)
// ---------------------------------------------------------------------------

let sdkClient: Awaited<ReturnType<typeof createClient>> | null = null;

async function getClient() {
  if (!sdkClient) {
    const serviceAccountToken = process.env.OP_SERVICE_ACCOUNT_TOKEN;
    if (!serviceAccountToken) {
      throw new Error(
        "OP_SERVICE_ACCOUNT_TOKEN is not set. " +
          "This is the only env var needed — all other secrets are fetched from 1Password."
      );
    }
    sdkClient = await createClient({
      auth: serviceAccountToken,
      integrationName: "Puppy Chat",
      integrationVersion: "0.1.0",
    });
  }
  return sdkClient;
}

// ---------------------------------------------------------------------------
// TTL cache — secrets are resolved once per server instance and reused until
// the TTL expires.  This avoids hitting 1Password on every request while still
// picking up rotated secrets within a reasonable window.
// ---------------------------------------------------------------------------

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// In-flight dedup: if two concurrent requests both need the same secret
// before the cache is populated, we reuse the same pending promise.
const inflight = new Map<string, Promise<string>>();

async function resolveWithCache(secretRef: string): Promise<string> {
  const cached = cache.get(secretRef);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  const existing = inflight.get(secretRef);
  if (existing) return existing;

  const promise = (async () => {
    const client = await getClient();
    const value = await client.secrets.resolve(secretRef);
    cache.set(secretRef, { value, expiresAt: Date.now() + DEFAULT_TTL_MS });
    inflight.delete(secretRef);
    return value;
  })();

  inflight.set(secretRef, promise);
  return promise;
}

/**
 * Resolve a 1Password secret reference like:
 *   "op://vault-name/item-name/field-name"
 */
export async function resolveSecret(secretRef: string): Promise<string> {
  return resolveWithCache(secretRef);
}

// ---------------------------------------------------------------------------
// Named secrets — single source of truth for vault paths
// ---------------------------------------------------------------------------

const SECRET_REFS = {
  supabaseUrl: "op://PuppyChat/Supabase/url",
  supabaseAnonKey: "op://PuppyChat/Supabase/anon-key",
  supabaseServiceRoleKey: "op://PuppyChat/Supabase/service-role-key",
  resendApiKey: "op://PuppyChat/Resend/api-key",
} as const;

export type SecretKey = keyof typeof SECRET_REFS;

/** Fetch a named secret from 1Password (cached). */
export async function getSecret(key: SecretKey): Promise<string> {
  return resolveSecret(SECRET_REFS[key]);
}

/** Fetch multiple secrets at once (cached, deduped). */
export async function getSecrets<K extends SecretKey>(
  keys: K[]
): Promise<Record<K, string>> {
  const entries = await Promise.all(
    keys.map(async (key) => [key, await getSecret(key)] as const)
  );
  return Object.fromEntries(entries) as Record<K, string>;
}

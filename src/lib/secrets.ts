import { createClient } from "@1password/sdk";

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

/**
 * Resolve a 1Password secret reference like:
 *   "op://vault-name/item-name/field-name"
 */
export async function resolveSecret(secretRef: string): Promise<string> {
  const client = await getClient();
  return client.secrets.resolve(secretRef);
}

/** All secret references — single source of truth for vault paths. */
const SECRET_REFS = {
  supabaseUrl: "op://PuppyChat/Supabase/url",
  supabaseAnonKey: "op://PuppyChat/Supabase/anon-key",
  supabaseServiceRoleKey: "op://PuppyChat/Supabase/service-role-key",
  resendApiKey: "op://PuppyChat/Resend/api-key",
} as const;

export type SecretKey = keyof typeof SECRET_REFS;

/** Fetch a named secret from 1Password. */
export async function getSecret(key: SecretKey): Promise<string> {
  return resolveSecret(SECRET_REFS[key]);
}

/** Fetch multiple secrets at once. */
export async function getSecrets<K extends SecretKey>(
  keys: K[]
): Promise<Record<K, string>> {
  const entries = await Promise.all(
    keys.map(async (key) => [key, await getSecret(key)] as const)
  );
  return Object.fromEntries(entries) as Record<K, string>;
}

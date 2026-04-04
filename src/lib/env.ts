const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

const PUBLIC_ENV = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
} satisfies Record<RequiredEnvKey, string | undefined>;

function readRequiredEnv(key: RequiredEnvKey) {
  const value = PUBLIC_ENV[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Copy .env.example to .env.local and fill in the value.`,
    );
  }

  return value;
}

export function getPublicAppUrl() {
  return readRequiredEnv("NEXT_PUBLIC_APP_URL");
}

export function getSupabaseUrl() {
  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey() {
  return readRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
}

export function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function getConfiguredEnvKeys() {
  return REQUIRED_ENV_KEYS.filter((key) => Boolean(PUBLIC_ENV[key]));
}

export function getBizKitHubBaseUrl() {
  return process.env.BIZKITHUB_API_BASE_URL ?? "";
}

export function getBizKitHubApiKey() {
  return process.env.BIZKITHUB_API_KEY ?? "";
}

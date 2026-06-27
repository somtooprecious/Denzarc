/** Resolve env vars with common alternate names (Vercel misconfiguration). */

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}

export function getSupabaseUrl(): string | undefined {
  const raw = firstNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL);
  if (!raw) return undefined;
  let url = raw.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
}

export function getSupabaseAnonKey(): string | undefined {
  return firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY
  );
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return firstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export function getMissingSupabaseServerVars(): string[] {
  const missing: string[] = [];
  if (!getSupabaseUrl()) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!getSupabaseServiceRoleKey()) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}

export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );
}

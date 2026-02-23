/**
 * Ensures the URL uses HTTPS in production so the browser always shows the secure padlock.
 * If the URL is for our app (denzarc.com) or any production host, force https.
 */
export function ensureHttps(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.replace(/\/$/, '');
  if (trimmed.startsWith('http://') && !trimmed.includes('localhost')) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  return trimmed;
}

export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://denzarc.com';
  return ensureHttps(raw);
}

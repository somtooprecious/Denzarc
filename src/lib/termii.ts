const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER = process.env.TERMII_SENDER_ID ?? 'Businesstool';

export function normalizeNgPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
}

export async function sendTermiiMessage(to: string, message: string): Promise<{ ok: boolean; error?: string }> {
  if (!TERMII_API_KEY) return { ok: false, error: 'Termii not configured' };
  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: normalizeNgPhone(to),
        from: TERMII_SENDER,
        sms: message,
        type: 'plain',
        api_key: TERMII_API_KEY,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.code !== 'ok') {
      return { ok: false, error: data?.message ?? `Termii error (${res.status})` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'SMS send failed' };
  }
}

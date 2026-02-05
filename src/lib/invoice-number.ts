export function nextInvoiceNumber(
  existingNumbers: string[],
  prefix: string = 'INV'
): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const base = `${prefix}-${y}${m}-`;
  const sameMonth = existingNumbers.filter((n) => n.startsWith(base));
  const maxSeq = sameMonth.reduce((max, n) => {
    const seq = parseInt(n.replace(base, ''), 10);
    return isNaN(seq) ? max : Math.max(max, seq);
  }, 0);
  const seq = String(maxSeq + 1).padStart(4, '0');
  return `${base}${seq}`;
}

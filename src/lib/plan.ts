export type Plan = 'free' | 'pro';

export const FREE_INVOICE_LIMIT = 5;

export function isPro(plan: Plan | null | undefined): boolean {
  return plan === 'pro';
}

export function canCreateInvoice(plan: Plan | null | undefined, countThisMonth: number): boolean {
  if (isPro(plan)) return true;
  return countThisMonth < FREE_INVOICE_LIMIT;
}

export function canRemoveBranding(plan: Plan | null | undefined): boolean {
  return isPro(plan);
}

export function hasProfitDashboard(plan: Plan | null | undefined): boolean {
  return isPro(plan);
}

export function hasCustomerManagement(plan: Plan | null | undefined): boolean {
  return isPro(plan);
}

export function hasInventory(plan: Plan | null | undefined): boolean {
  return isPro(plan);
}

export function hasAIInsights(plan: Plan | null | undefined): boolean {
  return isPro(plan);
}

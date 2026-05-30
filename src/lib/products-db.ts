/** User-facing message when Supabase catalog columns are missing (migration 009). */
export const PRODUCT_CATALOG_MIGRATION_HINT =
  'Database update needed: In Supabase SQL Editor, run the script supabase/RUN_PRODUCT_CATALOG_SETUP.sql (or migration 009), then try again.';

export function formatProductDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('schema cache') ||
    (lower.includes('column') && (lower.includes('category') || lower.includes('image_url') || lower.includes('is_listed')))
  ) {
    return PRODUCT_CATALOG_MIGRATION_HINT;
  }
  return message;
}

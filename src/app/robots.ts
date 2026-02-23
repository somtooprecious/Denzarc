import { MetadataRoute } from 'next';

import { getAppUrl } from '@/lib/url';
const baseUrl = getAppUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/invoices', '/customers', '/expenses', '/inventory', '/sales', '/profit', '/settings', '/notifications', '/ai-insights', '/admin', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

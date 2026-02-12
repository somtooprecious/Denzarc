import { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://denzarc.com').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/invoices', '/customers', '/expenses', '/inventory', '/sales', '/profit', '/settings', '/notifications', '/ai-insights', '/admin', '/api/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

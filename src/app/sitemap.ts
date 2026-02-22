import { MetadataRoute } from 'next';

import { getAppUrl } from '@/lib/url';
const baseUrl = getAppUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = [
    '',
    '/about',
    '/contact',
    '/pricing',
    '/sign-in',
    '/sign-up',
  ];

  return publicPaths.map((path) => ({
    url: path ? `${baseUrl}${path}` : `${baseUrl}/`,
    lastModified: new Date(),
    changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));
}

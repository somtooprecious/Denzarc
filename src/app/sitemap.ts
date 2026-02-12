import { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://denzarc.com').replace(/\/$/, '');

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

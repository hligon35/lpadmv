import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/siteUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  // Keep this list minimal and stable; add pages here as they become public.
  const routes = ['/', '/about', '/book', '/contact'];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}

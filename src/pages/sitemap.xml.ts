import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString() || 'https://username.github.io/personal-site';
  
  const pages = [
    '',
    '/books',
    '/builds',
    '/projects',
    '/reading',
    '/stack',
    '/now',
    '/today',
    '/stats'
  ];

  const posts = await getCollection('publish', ({ data }) => {
    return data.publish === true;
  });

  const postUrls = posts.map(post => ({
    url: `/${post.slug}/`,
    lastmod: post.data.date
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${postUrls.map(({ url, lastmod }) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};

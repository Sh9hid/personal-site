import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: string }) {
  const posts = await getCollection('publish', ({ data }) => {
    return data.publish === true;
  });

  return rss({
    title: 'Abdullah Shahid',
    description: 'Personal site of Abdullah Shahid',
    site: context.site || 'https://username.github.io/personal-site',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.abstract,
      link: `/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}

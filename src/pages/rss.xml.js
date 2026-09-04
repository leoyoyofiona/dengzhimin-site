import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';

export async function GET(context) {
  const posts = (
    await Promise.all([
      getCollection('teaching'),
      getCollection('research'),
      getCollection('work'),
      getCollection('life'),
    ])
  )
    .flat()
    .filter((p) => !p.data.draft && !p.slug.startsWith('maoxuan/'))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${post.slug}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}

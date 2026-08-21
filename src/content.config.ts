import { defineCollection, z } from 'astro:content';

/** 文章（Markdown）通用 schema，各栏目共用 */
const post = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** 每日文摘细分主题（对应 TOPICS slug），仅 research 栏目使用 */
    topics: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    /** 排序权重：越小越靠前（用于置顶），默认按日期倒序 */
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  teaching: post,
  research: post,
  work: post,
  life: post,
  papers: post,
  github: post,
};

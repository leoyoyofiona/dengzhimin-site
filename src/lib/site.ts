/** 站点全局配置 —— 修改这里即可更新全站信息 */

export const SITE = {
  name: 'LEODENG',
  tagline: '随手记下一些思考与日常，慢慢分享给路过的你。',
  description: 'LEODENG 的个人站点：随手记录一些思考与日常，慢慢分享。',
  url: 'https://www.dengzhimin.cn',
  email: 'leooelcn@gmail.com',
  github: 'leoyoyofiona',
  domain: 'www.dengzhimin.cn',
} as const;

export interface Section {
  slug: 'teaching' | 'research' | 'work' | 'life' | 'papers' | 'github';
  title: string;
  en: string;
  description: string;
  icon: string;
  gradient: string;
  color: string;
}

/** 六大栏目 */
export const SECTIONS: Section[] = [
  {
    slug: 'teaching',
    title: '黑/白板前的冥想',
    en: 'Teaching',
    description: '在黑板、白板前，偶尔想清楚一些事情',
    icon: 'book',
    gradient: 'linear-gradient(120deg, #0a84ff, #00c6ff)',
    color: '#3b82f6',
  },
  {
    slug: 'research',
    title: '每日文摘搬运',
    en: 'Reads',
    description: '每天精选 5 条高价值信息：教育、AI、电商、研究动态',
    icon: 'doc',
    gradient: 'linear-gradient(120deg, #5e5ce6, #8f7bf7)',
    color: '#6366f1',
  },
  {
    slug: 'papers',
    title: '文献精选',
    en: 'Papers',
    description: '精读过的论文与方法论，记下值得反复看的',
    icon: 'flask',
    gradient: 'linear-gradient(120deg, #0e7490, #22d3ee)',
    color: '#0891b2',
  },
  {
    slug: 'github',
    title: 'GitHub热门搬运',
    en: 'GitHub Trending',
    description: 'GitHub 上值得关注的热门项目，搬过来看看',
    icon: 'github',
    gradient: 'linear-gradient(120deg, #24292f, #57606a)',
    color: '#374151',
  },
  {
    slug: 'work',
    title: '快乐之源',
    en: 'Work',
    description: '写写代码，折腾点小东西',
    icon: 'code',
    gradient: 'linear-gradient(120deg, #c63bd4, #ff6ec7)',
    color: '#a855f7',
  },
  {
    slug: 'life',
    title: '不胡思乱想',
    en: 'Thoughts',
    description: '想清楚了的，才值得记下来',
    icon: 'coffee',
    gradient: 'linear-gradient(120deg, #ff9f0a, #ff6b6b)',
    color: '#f59e0b',
  },
];

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** 每日文摘的细分主题（tracking topics） */
export interface Topic {
  slug: string;
  title: string;
  en: string;
  color: string;
}

export const TOPICS: Topic[] = [
  { slug: 'ai-edu', title: 'AI 与教育技术', en: 'AI & EdTech', color: '#3b82f6' },
  { slug: 'univ-ai', title: '高校教学改革与 AI 素养', en: 'Univ AI Literacy', color: '#6366f1' },
  { slug: 'crossborder', title: '跨境电商与数字贸易', en: 'Cross-border', color: '#10b981' },
  { slug: 'consumer-ecom', title: '消费者行为与电商研究', en: 'Consumer & Ecom', color: '#f59e0b' },
  { slug: 'genai-research', title: '生成式 AI 与科研工具', en: 'GenAI for Research', color: '#8b5cf6' },
  { slug: 'hss-methods', title: '人文社科研究方法与学术发表', en: 'HSS Methods', color: '#ec4899' },
  { slug: 'edu-policy', title: '中国教育政策与高等教育', en: 'Edu Policy', color: '#ef4444' },
  { slug: 'ai-industry', title: '全球科技与 AI 产业动态', en: 'AI Industry', color: '#06b6d4' },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

/** GitHub 热门项目分类（常规分类，不过多） */
export interface GhCategory {
  slug: string;
  title: string;
  en: string;
  color: string;
}

export const GH_CATEGORIES: GhCategory[] = [
  { slug: 'ai', title: 'AI 与机器学习', en: 'AI & ML', color: '#8b5cf6' },
  { slug: 'learning', title: '学习与面试', en: 'Learning', color: '#3b82f6' },
  { slug: 'tools', title: '开发工具', en: 'Dev Tools', color: '#10b981' },
  { slug: 'web', title: '前端 / 后端', en: 'Web Dev', color: '#f59e0b' },
  { slug: 'security', title: '安全与系统', en: 'Security', color: '#ef4444' },
  { slug: 'ecommerce', title: '电子商务', en: 'E-commerce', color: '#0ea5e9' },
  { slug: 'edtech', title: '教育技术', en: 'EdTech', color: '#6366f1' },
  { slug: 'vibecoding', title: 'Vibe Coding', en: 'Vibe Coding', color: '#ec4899' },
  { slug: 'research', title: '科研', en: 'Research', color: '#14b8a6' },
];

export function getGhCategory(slug: string): GhCategory | undefined {
  return GH_CATEGORIES.find((c) => c.slug === slug);
}

/** 从 Markdown 正文中提取第一张图片 URL（markdown 或 html 形式） */
export function firstImage(body: string): string | null {
  const m =
    body.match(/!\[[^\]]*\]\(([^)]+)\)/) ||
    body.match(/<img[^>]*src="([^"]+)"/);
  return m ? m[1] : null;
}

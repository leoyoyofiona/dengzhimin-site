# LEODENG · 个人网站

一个极简、大气、渐变风格的**静态个人网站**，借鉴苹果设计的精髓（留白、材质、克制的动效），
用于记录与分享**黑板前的冥想 · 好文分享 · 快乐之源 · 不胡思乱想**。

- 🌐 域名：<https://www.dengzhimin.cn>
- 📮 邮箱：leooelcn@gmail.com
- 🚀 技术栈：**Astro 5 + Markdown + Git**，纯静态，无需数据库

## 特性

- 四大栏目（黑板前的冥想 / 好文分享 / 快乐之源 / 不胡思乱想），Markdown 写作，开箱即用
- 作品页：展示 GitHub 上的 Vibe Coding 项目
- 关于页：自我介绍 + 联系方式
- 深色 / 浅色模式（跟随系统，可手动切换，记忆偏好）
- 品牌渐变、玻璃拟态、细腻动效
- RSS 订阅、站点地图（sitemap）、SEO 元信息、404 页
- 响应式布局，移动端友好

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（热更新）
npm run build      # 构建到 dist/
npm run preview    # 本地预览构建结果
```

## 目录结构

```
dengzhimin-site/
├── astro.config.mjs          # 站点配置（site 域名在此）
├── public/                   # 静态资源（favicon、robots）
└── src/
    ├── components/           # 组件（Header / Footer / 卡片 / 图标…）
    ├── content/              # Markdown 文章（四个栏目）
    │   ├── teaching/
    │   ├── research/
    │   ├── work/
    │   └── life/
    ├── data/works.ts         # 「作品」页数据
    ├── layouts/BaseLayout.astro
    ├── lib/site.ts           # ★ 站点信息（姓名/邮箱/GitHub/栏目）
    ├── pages/                # 页面路由
    └── styles/global.css     # ★ 设计系统（颜色/渐变/排版）
```

## 如何写一篇文章

在对应的栏目目录下新建一个 `.md` 文件，例如 `src/content/teaching/xxx.md`：

```markdown
---
title: "文章标题"
description: "一句话摘要（会显示在卡片上）"
date: 2025-01-20
tags: ["思考", "心得"]
featured: false   # 设为 true 会显示「精选」徽章
draft: false      # 设为 true 则暂不发布
---

正文从这里开始，使用标准 Markdown 语法……
```

保存后刷新即可看到。文章会按 `date` 倒序排列。

## 个性化配置

| 想改什么 | 去哪里改 |
| --- | --- |
| 姓名 / 邮箱 / GitHub 用户名 / 域名 | `src/lib/site.ts` 的 `SITE` |
| 四大栏目的名称 / 描述 / 图标 / 渐变色 | `src/lib/site.ts` 的 `SECTIONS` |
| 「作品」页的项目 | `src/data/works.ts` |
| 网站整体配色 / 渐变 / 字体 / 圆角 | `src/styles/global.css`（`--xxx` 变量） |
| 站点域名（用于 sitemap / RSS） | `astro.config.mjs` 的 `site` |

> ⚠️ 上线前请务必把 `src/lib/site.ts` 里的 `github` 改成你的**真实 GitHub 用户名**，
> 并把 `src/data/works.ts` 里的示例项目替换成你的真实项目。

## 部署

见 [DEPLOY.md](./DEPLOY.md) —— 包含部署到腾讯云轻量服务器 + Nginx + 域名解析 + HTTPS 的完整步骤。

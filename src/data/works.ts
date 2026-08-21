/**
 * 「si码如山」页数据 —— 我在 GitHub 上的项目。
 *
 * 字段：
 *   title       项目名称
 *   description 一句话简介（卡片上显示）
 *   detail      详细介绍（暂未用于页面展示）
 *   url         GitHub 仓库地址
 *   site        公网访问地址（Render 等部署），没有则留空
 *   siteAlt     备用公网地址（如主地址异常时的替代站点）
 *   tags        技术/主题标签
 *   featured    是否在首页展示（建议 3 个）
 */

export interface Work {
  title: string;
  description: string;
  detail: string;
  url: string;
  site?: string;
  /** 备用公网地址（如主地址异常时的替代站点） */
  siteAlt?: string;
  /** 作品海报图（public/images/works/ 下的文件名） */
  poster?: string;
  /** 高清全貌预览图（public/images/works/hd/ 下的文件名） */
  posterHd?: string;
  tags: string[];
  featured?: boolean;
}

export const works: Work[] = [
  {
    title: '大乐透',
    description: '超级大乐透走势分析与预测面板。',
    detail:
      '基于历史开奖数据构建的超级大乐透走势分析与预测面板。对号码频率、冷热走势、区间分布做可视化统计，辅助选号参考。数据更新、图表渲染都做成了可复用模块，方便扩展其他彩种。',
    url: 'https://github.com/leoyoyofiona/super-lotto-trend-model',
    site: 'https://super-lotto-trend-model.onrender.com',
    tags: ['彩票', '数据分析', '预测'],
    featured: true,
    poster: 'poster-lotto.png',
    posterHd: 'poster-lotto.png',
  },
  {
    title: '福彩',
    description: '福利彩票相关的玩法记录与分析小工具。',
    detail:
      '面向福利彩票的玩法记录与分析小工具。支持开奖数据录入、历史查询、简单的号码统计与走势查看，把繁琐的整理工作自动化。',
    url: 'https://github.com/leoyoyofiona/leo-welfare-lottery',
    site: 'https://leo-welfare-lottery.onrender.com',
    tags: ['彩票', '工具'],
    poster: 'poster-welfare.png',
    posterHd: 'poster-welfare.png',
  },
  {
    title: '足彩',
    description: '足球彩票相关的数据与计算小工具。',
    detail:
      '足球彩票相关的数据整理与计算小工具。围绕比赛数据进行清洗、汇总与计算，辅助赛果分析，减少手工算来算去的时间。',
    url: 'https://github.com/leoyoyofiona/leo-football-lottery',
    site: 'https://leo-football-lottery.onrender.com',
    tags: ['足球', '彩票', '工具'],
    poster: 'poster-football.png',
    posterHd: 'poster-football.png',
  },
  {
    title: '世界杯',
    description: '2026 世界杯预测 Web 应用。',
    detail:
      '2026 世界杯预测 Web 应用。整合球队实力、历史交锋与赛程数据，用统一的数据模型给出赛事预测，界面交互简洁，赛事数据一目了然。',
    url: 'https://github.com/leoyoyofiona/worldcup-prediction',
    site: 'https://worldcup-prediction-peur.onrender.com',
    tags: ['世界杯', '足球', '预测'],
    poster: 'poster-worldcup.png',
    posterHd: 'poster-worldcup.png',
  },
  {
    title: '小红书',
    description: '小红书收藏相关的小工具。',
    detail:
      '围绕小红书收藏场景做的小工具，帮助整理、归类与检索收藏内容，把散落的收藏变成可以快速找到的资料库。',
    url: 'https://github.com/leoyoyofiona/xiaohongshu-favorites',
    tags: ['小红书', '内容', '工具'],
    poster: 'poster-xiaohongshu.jpg',
    posterHd: 'poster-xiaohongshu.jpg',
  },
  {
    title: '周星驰',
    description: '周星驰作品欣赏：时间线、人物关系与影迷互动。',
    detail:
      '周星驰作品欣赏站点：以时间线梳理作品脉络，展示人物关系，并留有影迷互动的入口。献给喜欢星爷电影的每一个观众。',
    url: 'https://github.com/leoyoyofiona/stephen-chow-works-mainland',
    site: 'https://stephen-chow-works-mainland.onrender.com',
    siteAlt: 'https://stephen-chow-works-2026.leodengyoyofiona.chatgpt.site',
    tags: ['周星驰', '电影'],
    poster: 'poster-stephen.jpg',
    posterHd: 'poster-stephen.jpg',
  },
  {
    title: '中英泰翻译',
    description: '中英泰三语互译小工具。',
    detail:
      '中英泰三语互译小工具。支持中、英、泰三种语言两两互译，输入即译，适合日常快速查词与简单交流场景。',
    url: 'https://github.com/leoyoyofiona/ZH-EN-TH-translate',
    tags: ['翻译', '中英泰', '工具'],
    featured: true,
    poster: 'poster-translate.png',
    posterHd: 'poster-translate.png',
  },
  {
    title: '三空格翻译',
    description: '三空格排版的中英对照翻译小工具。',
    detail:
      '三空格排版的中英对照翻译小工具。把原文与译文按"三空格"格式对齐排布，适合学习外语时对照精读，也方便导出分享。',
    url: 'https://github.com/leoyoyofiona/triple-space-translator',
    tags: ['翻译', '排版', '工具'],
    poster: 'poster-triple.png',
    posterHd: 'poster-triple.png',
  },
  {
    title: 'macOS快捷键',
    description: '按住一键，显示当前应用的快捷键。',
    detail:
      '按住一个键，即时显示当前应用最常用的快捷键清单。不用背快捷键，需要时看一眼就知道。效率小工具，省时省心。',
    url: 'https://github.com/leoyoyofiona/LEO-MACOS-Shortcut-Assistant',
    tags: ['macOS', '效率', '快捷键'],
    featured: true,
    poster: 'poster-macos.png',
    posterHd: 'poster-macos.png',
  },
  {
    title: '怎么改你都懂',
    description: '中文渲染相关的小工具集。',
    detail:
      '面向中文渲染场景的小工具集：处理排版、字体、显示等常见问题，把"怎么改"变成"点一下就行"。',
    url: 'https://github.com/leoyoyofiona/cn-obfuscator',
    site: 'https://cn-obfuscator.onrender.com',
    tags: ['中文', '渲染', '工具'],
    poster: 'poster-render.png',
    posterHd: 'poster-render.png',
  },
  {
    title: 'learn vlog',
    description: '像刷短视频一样学英语（待推送）。',
    detail:
      '像刷短视频一样学英语：把学习内容做成短平快的视频节奏，降低坚持学习的门槛。代码仓库还在整理，即将推送上线。',
    url: 'https://github.com/leoyoyofiona',
    tags: ['英语', '短视频', '学习'],
    poster: 'poster-vlog.png',
    posterHd: 'poster-vlog.png',
  },
  {
    title: 'WorkBuddy 指南',
    description: 'WorkBuddy 中文学习指南：从第一次使用到可复用的 AI 工作流。',
    detail:
      '独立维护的非官方中文学习网站，从认识工具、基本场景到进阶放大，30 个案例 + 可直接复制的提示词 + 完成检查点，把 WorkBuddy 用成自己的 AI 工作流。',
    url: 'https://github.com/leoyoyofiona/workbuddy-guide',
    tags: ['WorkBuddy', '教程', 'AI工作流'],
    poster: 'poster-workbuddy.jpg',
    posterHd: 'poster-workbuddy.jpg',
  },
];

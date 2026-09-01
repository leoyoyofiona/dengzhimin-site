---
title: "生成式 AI 使用与生活满意度：AI 素养的中介作用（香港成人横断面研究）"
description: "论文精读：Fong 等（2026）基于香港 1800 名成人样本，用 SEM 揭示感知 AI 有用性通过行为意向、GenAI 使用与 AI 素养影响生活满意度的链式路径。"
date: 2026-09-01
tags: ["文献", "医学健康", "生成式AI", "AI素养", "生活满意度", "心理健康"]
category: health
featured: true
---

**文献**：Fong, T. C. T., Chan, C. H., Kwok, A. P. K., Chan, R. T. H., Tang, R. L. M., Wen, M., & Yip, P. S. F. (2026). *Relationship between generative AI use and life satisfaction and the mediating role of AI literacy among Hong Kong adults: Cross-sectional study*. Journal of Medical Internet Research, 28, e88362. DOI 10.2196/88362。

**研究问题**：生成式 AI（如 ChatGPT、DALL-E）已渗透到生活的各个领域，但既有文献对"GenAI 使用与生活满意度"的关系报告不一（有的正相关、有的无关联）。论文要回答：在普通成人中，GenAI 使用与生活满意度的关系究竟是什么？AI 素养在其中扮演什么角色？

**论证思路**：综合**技术接受模型（TAM）**与**自我决定理论（SDT）**，构建"感知 AI 有用性 → 行为意向 → GenAI 使用 → AI 素养 → 生活满意度"的链式中介模型，用 SEM 在全样本及性别、年龄亚组中检验。

<figure>
  <img src="/images/papers/health-genai-fig1.png" alt="原文图1 概念模型" loading="lazy" />
  <figcaption>图1（原文 Figure 1）研究概念模型</figcaption>
</figure>

## 一、样本与方法

- **样本**：2024 年春，香港两阶段随机抽样，1,800 名社区成人（平均年龄 49.3 岁，SD 14.9；女性 55.3%）
- **测量**：GenAI 使用、感知 AI 有用性、使用行为意向、AI 素养、生活满意度（SWLS）
- **分析**：MANCOVA 检验性别/年龄差异 + SEM 检验链式路径 + 亚组分析

**基本发现**：38.5%（693/1800）的受访者过去一年使用过 GenAI。感知 AI 有用性、行为意向、GenAI 使用与 AI 素养均呈现**从青年到老年递减**的年龄趋势。每日使用 GenAI 超过 2 小时的用户，在感知有用性、行为意向、AI 素养与生活满意度上均显著高于非用户。

<figure>
  <img src="/images/papers/health-genai-fig2.png" alt="原文图2 估计边际均值" loading="lazy" />
  <figcaption>图2（原文 Figure 2）各变量在不同群体中的估计边际均值与 95% CI</figcaption>
</figure>

## 二、核心发现

### 1. 直接效应不显著，间接效应显著

SEM 结果显示：**GenAI 使用对生活满意度的直接效应不显著**——用没用 AI 本身并不直接决定生活满意度。但存在显著的链式间接路径：**感知 AI 有用性 → 行为意向 → GenAI 使用 → AI 素养 → 生活满意度**（αβ = 0.186, 95% CI 0.134–0.242）。

也就是说：**AI 素养是关键的"翻译器"**——只有当用户通过实际使用 GenAI 提升了 AI 素养，AI 才能转化为更高的生活满意度。

<figure>
  <img src="/images/papers/health-genai-fig3.png" alt="原文图3 SEM标准化效应" loading="lazy" />
  <figcaption>图3（原文 Figure 3）SEM 标准化效应（括号内为 SE）</figcaption>
</figure>

### 2. 亚组差异显著（原文 Table 6）

<div class="table-wrap">
<table>
<thead>
<tr><th>亚组</th><th>总间接效应 αβ (95% CI)</th><th>经 AI 素养路径</th><th>经 GenAI 使用→AI素养路径</th></tr>
</thead>
<tbody>
<tr><td>全样本</td><td>0.186 (0.134–0.242)</td><td>0.146 (0.103–0.193)</td><td>0.040 (0.029–0.055)</td></tr>
<tr><td><strong>男性</strong></td><td><strong>0.260 (0.177–0.348)</strong></td><td>0.201 (0.134–0.273)</td><td>0.059 (0.037–0.087)</td></tr>
<tr><td>女性</td><td>0.112 (0.055–0.180)</td><td>0.087 (0.041–0.144)</td><td>0.026 (0.013–0.042)</td></tr>
<tr><td><strong>年长成人</strong></td><td><strong>0.227 (0.113–0.367)</strong></td><td>0.118 (0.077–0.166)</td><td>0.056 (0.045–0.068)</td></tr>
<tr><td>青年成人</td><td>0.124 (0.038–0.214)</td><td>0.107 (0.031–0.186)</td><td>0.017 (0.005–0.034)</td></tr>
<tr><td>在职</td><td>0.170 (0.116–0.231)</td><td>0.130 (0.086–0.180)</td><td>0.040 (0.027–0.057)</td></tr>
<tr><td>非在职</td><td>0.172 (0.084–0.268)</td><td>0.141 (0.066–0.225)</td><td>0.032 (0.015–0.058)</td></tr>
</tbody>
</table>
</div>

**性别差异**：男性的总间接效应（0.260）是女性（0.112）的 2 倍以上；
**年龄差异**：年长成人（0.227）高于青年成人（0.124）——对年长者而言，"会用 AI"转化为生活满意度的收益更明显。

## 三、对实践与研究的启示

**对普通用户**：用 AI 本身不会自动带来更满意的生活——**把 AI 用出"素养"**（会提问、会判断、会整合进生活）才是关键。与其停留在尝鲜式使用，不如系统提升自己的 AI 素养。

**对教育者**：AI 素养教育应面向全年龄，尤其是青年到中老年的过渡群体；帮助老年人跨越"会用"与"用好"的差距，可能带来更显著的生活质量收益。

**对研究者**：TAM × SDT 的链式框架提供了"技术使用 → 素养 → 幸福感"的完整机制解释；亚组分析揭示了性别、年龄的调节作用，提示未来研究应关注群体异质性。

## 精读笔记

**核心论点**：GenAI 使用与生活满意度的关系**不是直接的，而是通过 AI 素养中介的**——"会用 AI"（素养）才是技术转化为幸福感的桥梁；这一收益在男性与年长成人中尤为显著。

**方法要点**：
- 链式中介 SEM + 亚组分析（性别/年龄/工作/慢病）是本文的方法骨架
- 两阶段随机抽样、1,800 人规模，代表性好
- 95% CI 报告间接效应，统计严谨

**局限与边界**：
- 横断面设计，因果方向（是 AI 素养提升了满意度，还是高满意度者更愿学 AI？）无法确定
- 自报 AI 素养与 GenAI 使用，可能存在测量偏差
- 香港样本，跨文化推广需谨慎

**可延伸方向**：
- 纵向追踪，检验 AI 素养提升与生活满意度的时序关系
- 干预研究：AI 素养培训能否提升特定群体的生活满意度？
- 扩展到中国大陆、内地城市样本，比较数字化环境差异的影响

## 原文地址

- DOI：[10.2196/88362](https://doi.org/10.2196/88362)
- 期刊：Journal of Medical Internet Research（Q1），2026 年 7 月
- 图表来源：原文 Figure 1、Figure 2、Figure 3、Table 6（开放获取）

# demands_agent 案例集

<div class="hero">
  <div class="eyebrow">fisherever</div>
  <h1>让 AI 在交付这件事上不撒谎</h1>
  <div class="sub">一个数据需求 Agent 的工程实践</div>
  <div class="pull">不是让 AI 变得更可信，而是用工程边界让"不可信"这件事变得可验证、可拦截、可恢复。</div>
  <a class="cta" href="00-电梯演讲.html">从 00 电梯演讲开始 →</a>
</div>

<div class="project-card">
  <div class="label">角色</div>
  <div class="value">独立设计与开发</div>
  <div class="label">周期</div>
  <div class="value">v0.1 → v1.0-rc，十几个 minor 版本迭代</div>
  <div class="label">技术栈</div>
  <div class="value">
    <span class="tag">Python</span><span class="tag">Typer</span><span class="tag">Nebula 血缘</span><span class="tag">StarRocks</span><span class="tag">Hive</span><span class="tag">Presto</span><span class="tag">MySQL</span>
  </div>
  <div class="label">规模证据</div>
  <div class="value">21 篇 postmortem · 16 个能力模块 · 5 层架构 · 1500+ 行工程契约文档</div>
</div>

## 目录

<div class="toc-grid">
  <a class="toc-card" href="00-电梯演讲.html">
    <span class="num">00</span>
    <div class="title">电梯演讲</div>
    <div class="desc">三个最锋利的判断 + 一个最贵的教训</div>
    <div class="time">2 分钟</div>
  </a>
  <a class="toc-card" href="01-痛点与设计.html">
    <span class="num">01</span>
    <div class="title">痛点与设计</div>
    <div class="desc">这事为什么难，四道边界怎么压住</div>
    <div class="time">5 分钟</div>
  </a>
  <a class="toc-card" href="02-工程系统全景.html">
    <span class="num">02</span>
    <div class="title">工程系统全景</div>
    <div class="desc">五层结构 + 16 个能力 + 产物契约分层</div>
    <div class="time">7 分钟</div>
  </a>
  <a class="toc-card" href="03-可迁移法则.html">
    <span class="num">03</span>
    <div class="title">可迁移法则</div>
    <div class="desc">10 条法则卡片（最值钱的产出）</div>
    <div class="time">8 分钟</div>
  </a>
  <a class="toc-card" href="04-真实复盘.html">
    <span class="num">04</span>
    <div class="title">真实复盘</div>
    <div class="desc">21 篇 postmortem 选 5 篇讲透</div>
    <div class="time">8 分钟</div>
  </a>
  <a class="toc-card" href="05-演进史.html">
    <span class="num">05</span>
    <div class="title">演进史</div>
    <div class="desc">v0.1 → v1.0-rc 六个里程碑</div>
    <div class="time">5 分钟</div>
  </a>
  <a class="toc-card" href="06-收获与边界.html">
    <span class="num">06</span>
    <div class="title">收获与边界</div>
    <div class="desc">三个收获 + 五个局限 + 下一步</div>
    <div class="time">4 分钟</div>
  </a>
  <a class="toc-card" href="07-什么是Agent与研究笔记.html">
    <span class="num">07</span>
    <div class="title">什么是 Agent</div>
    <div class="desc">定义 + 设计要素 + 工业鲁棒性（研究型长文）</div>
    <div class="time">10 分钟</div>
  </a>
</div>

<div class="about-section">
<details>
<summary>关于这个案例集</summary>

这是关于一个内部数据需求 Agent 项目的工程实践提炼。项目本身解决的核心问题不是"让 LLM 写 SQL"，而是"怎么让一个会写 SQL 的 AI 不在交付这件事上撒谎"。

案例集不复制代码，而是提炼设计思想、工程结构、可迁移方法论、真实事故复盘、版本演进。

**脱敏说明**：所有内容已脱敏，不包含库名 / 表名 / 字段真实值 / SQL 正文 / 凭证 / 业务方名 / 内部路径 / 任何 PII。保留通用开源技术名和通用业务概念作为技术深度的证据。

**技术实现**：Markdown 源（Obsidian 友好，mermaid 原生渲染）经自建转换器（Node.js + marked）生成静态 HTML，部署在 GitHub Pages。仓库见 [github.com/fisherever/agent-case-study](https://github.com/fisherever/agent-case-study)。

</details>
</div>

# agent-case-study

> 一个数据需求自动分析与实现 Agent 的深度复盘案例集。
> 公开站点：https://fisherever.github.io/agent-case-study/README.html

## 这是什么

这是一份关于一个内部数据需求 Agent 项目的分层案例集。项目本身解决的核心问题不是"让 LLM 写 SQL"，而是"怎么让一个会写 SQL 的 AI 不在交付这件事上撒谎"。

案例集不复制代码，而是提炼：项目的设计思想、工程结构、可迁移的方法论、真实事故复盘、版本演进。目标是作为个人作品集 / 简历的素材来源。

## 目录结构

```
agent-case-study/
├── src/                   # markdown 源（Obsidian 友好，mermaid 原生渲染）
│   ├── README.md          # 案例集导航
│   ├── 00-电梯演讲.md      # 30 秒 hook
│   ├── 01-痛点与设计.md
│   ├── 02-工程系统全景.md
│   ├── 03-可迁移法则.md    # 10 条法则（最值钱的一篇）
│   ├── 04-真实复盘.md      # 21 篇 postmortem 选 5 篇讲透
│   ├── 05-演进史.md        # v0.1 → v1.0-rc
│   ├── 06-收获与边界.md
│   └── 07-什么是Agent与研究笔记.md   # 研究型长文
├── docs/                  # 静态站点（GitHub Pages 部署根）
└── scripts/
    ├── build_html.mjs     # markdown → html 转换器
    └── package.json
```

## 本地预览

```bash
# 方式 1：直接打开 html
open docs/README.html

# 方式 2：起本地服务（更接近线上）
python3 -m http.server 8000 --directory docs
# 访问 http://localhost:8000/README.html
```

## 重新生成 html

修改 `docs/*.md` 后，重新生成全部 html：

```bash
cd scripts
npm install        # 首次需要
cd ..
node scripts/build_html.mjs
```

## 阅读顺序建议

- **招聘者 / 30 秒读者**：00-电梯演讲
- **想理解 Agent 怎么运作**：01-痛点与设计 → 02-工程系统全景
- **想挖方法论**：03-可迁移法则
- **想看真实事故**：04-真实复盘
- **想看"什么是 Agent"的深度研究**：07-什么是Agent与研究笔记

## 脱敏说明

案例集所有内容已脱敏：不包含库名 / 表名 / 字段真实值 / SQL 正文 / 凭证 / 业务方名 / 内部路径 / 任何 PII。保留通用开源技术名（StarRocks / Hive / Presto / MySQL / Nebula）和通用业务概念作为技术深度的证据。

## 技术栈

- 源格式：Markdown（mermaid 图表）
- 站点：纯静态 HTML（mermaid.js CDN 渲染）
- 转换器：Node.js + marked
- 部署：GitHub Pages

#!/usr/bin/env node
// build_html.mjs — 把 docs/ 下的 markdown 批量转成 html/ 下的静态页面
// 用法: node scripts/build_html.mjs
// 依赖: marked (npm install)
// 设计要点:
//   1. mermaid 块用 HTML 注释占位, 避免 marked 把 __MERMAID_0__ 解析成 <em>
//   2. wikilink [[xx]] 转相对链接 xx.html (Obsidian 风格 → web 风格)
//   3. 每篇提取 H1 做页头, 提取"上一篇/下一篇"做底部导航

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname); // 仓库根
const SRC = join(ROOT, 'src');    // md 源目录
const OUT = join(ROOT, 'docs');   // html 输出目录（GitHub Pages source）

// === 1. 样式 ===
const CSS = `
:root {
  --bg:#fafaf7; --card:#ffffff; --ink:#1f2328; --muted:#57606a;
  --accent:#b45309; --accent-soft:#fef3c7; --rule:#e5e3dd;
  --code-bg:#f6f3ee; --border:#d6d3c7;
}
*{box-sizing:border-box}
body{margin:0;padding:2.5rem 1rem 4rem;background:var(--bg);color:var(--ink);
  font-family:-apple-system,"PingFang SC","Noto Sans CJK SC","Helvetica Neue",sans-serif;
  line-height:1.75;font-size:16px}
.wrap{max-width:820px;margin:0 auto}
header.essay{text-align:center;margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--rule)}
header.essay .eyebrow{font-size:.8rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);font-weight:600}
header.essay h1{font-size:2rem;margin:.5rem 0;letter-spacing:-.01em}
header.essay .sub{color:var(--muted);font-size:.95rem}
h1{font-size:1.8rem;margin:2rem 0 .8rem;padding-bottom:.4rem;border-bottom:2px solid var(--accent);display:inline-block}
h2{font-size:1.4rem;margin:2.5rem 0 .8rem;padding-bottom:.4rem;border-bottom:1px solid var(--rule)}
h3{font-size:1.15rem;margin:1.8rem 0 .5rem}
h4{font-size:1rem;margin:1.2rem 0 .4rem;color:var(--accent)}
p{margin:.6rem 0}
strong{color:var(--ink)} em{color:var(--accent);font-style:normal;font-weight:600}
blockquote{margin:1.2rem 0;padding:.9rem 1.2rem;background:var(--accent-soft);
  border-left:4px solid var(--accent);border-radius:0 6px 6px 0;color:#78350f}
blockquote p{margin:.3rem 0}
ul,ol{padding-left:1.4rem} li{margin:.3rem 0}
code{background:var(--code-bg);padding:.1rem .4rem;border-radius:3px;
  font-family:"SF Mono","JetBrains Mono",Consolas,monospace;font-size:.88em;color:#92400e}
pre{background:#1f2328;color:#e6edf3;padding:1rem 1.2rem;border-radius:8px;
  overflow-x:auto;font-size:.85rem;line-height:1.5}
pre code{background:none;color:inherit;padding:0}
table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.9rem}
th,td{border:1px solid var(--border);padding:.6rem .8rem;text-align:left;vertical-align:top}
th{background:var(--code-bg);font-weight:600}
tr:nth-child(even) td{background:#fcfbf7}
.mermaid{margin:1.5rem 0;text-align:center;background:var(--card);
  padding:1rem;border-radius:8px;border:1px solid var(--rule);
  cursor:zoom-in;position:relative;transition:box-shadow .15s}
.mermaid:hover{box-shadow:0 0 0 2px var(--accent)}
.mermaid::after{content:"点击放大";position:absolute;top:.4rem;right:.6rem;
  font-size:.7rem;color:var(--muted);opacity:.7}
/* lightbox：点击 mermaid 后的全屏遮罩 */
.lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);
  z-index:9999;overflow:auto;padding:2rem;cursor:zoom-out}
.lightbox.open{display:flex;align-items:center;justify-content:center}
.lightbox .mermaid-holder{background:var(--card);border-radius:8px;padding:1.5rem;
  display:inline-block;cursor:default}
.nav{display:flex;justify-content:space-between;margin:3rem 0 0;padding:1.2rem 0 0;
  border-top:1px solid var(--rule);font-size:.9rem}
.nav a{color:var(--accent);text-decoration:none}
.nav a:hover{text-decoration:underline}
hr{border:none;border-top:1px solid var(--rule);margin:2rem 0}
a{color:var(--accent)}

/* === 作品集封面样式 === */
/* 深色 Hero 区 */
.hero{background:#1a1a1a;color:#f5f5f4;padding:3.5rem 2rem;margin:-2.5rem -1rem 2.5rem;
  text-align:center;border-bottom:4px solid var(--accent)}
.hero .eyebrow{font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--accent);font-weight:600;margin-bottom:.6rem}
.hero h1{font-size:2.6rem;line-height:1.2;margin:.4rem auto .5rem;max-width:14em;
  border:none;padding:0;color:#fff;display:block;letter-spacing:-.02em}
.hero .sub{font-size:1.1rem;color:#a8a29e;margin-bottom:1.8rem}
.hero .pull{font-size:1rem;color:#e7e5e4;max-width:32em;margin:0 auto 1.8rem;
  font-style:italic;line-height:1.6}
.hero .pull::before{content:open-quote;font-size:1.5rem;color:var(--accent);margin-right:.1em}
.hero .pull::after{content:close-quote;font-size:1.5rem;color:var(--accent);margin-left:.1em}
.hero .cta{display:inline-block;padding:.7rem 1.8rem;background:var(--accent);color:#fff;
  text-decoration:none;border-radius:6px;font-weight:600;font-size:.95rem;
  transition:transform .15s,background .15s}
.hero .cta:hover{background:#92400e;transform:translateY(-1px)}
/* 项目卡片 */
.project-card{background:var(--card);border:1px solid var(--border);border-radius:10px;
  padding:1.6rem 1.8rem;margin:0 auto 2.5rem;max-width:680px;
  display:grid;grid-template-columns:auto 1fr;gap:.8rem 1.5rem;align-items:start;font-size:.92rem}
.project-card .label{color:var(--muted);font-weight:600;white-space:nowrap}
.project-card .value{color:var(--ink)}
/* 技术栈 tag */
.tag{display:inline-block;background:var(--code-bg);color:#92400e;padding:.15rem .6rem;
  border-radius:10px;font-size:.78rem;margin:.15rem .25rem .15rem 0;
  font-family:"SF Mono",Consolas,monospace}
/* 目录卡片网格 */
.toc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin:1.5rem 0 2.5rem}
.toc-card{display:block;background:var(--card);border:1px solid var(--border);
  border-radius:8px;padding:1rem 1.2rem;text-decoration:none;color:var(--ink);
  transition:border-color .15s,transform .15s;position:relative;padding-left:3.2rem}
.toc-card:hover{border-color:var(--accent);transform:translateY(-2px)}
.toc-card .num{position:absolute;left:1rem;top:1rem;background:var(--accent);color:#fff;
  width:1.8rem;height:1.8rem;border-radius:6px;display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:.85rem}
.toc-card .title{font-weight:600;font-size:.98rem;margin-bottom:.2rem}
.toc-card .desc{color:var(--muted);font-size:.82rem;line-height:1.4}
.toc-card .time{color:var(--accent);font-size:.75rem;margin-top:.4rem;font-weight:600}
/* 关于小节（折叠） */
.about-section{margin-top:3rem;padding:1.5rem;background:#fcfbf7;border-radius:8px;
  border:1px solid var(--rule);font-size:.9rem;color:var(--muted)}
.about-section h2{font-size:1.1rem;color:var(--ink);margin:0 0 .8rem;border:none;padding:0;
  display:block}
.about-section details summary{cursor:pointer;color:var(--accent);font-weight:600}
/* 继续阅读卡片 */
.continue-reading{margin:2.5rem 0;padding:1.5rem;background:var(--card);
  border:1px solid var(--border);border-radius:10px}
.continue-reading .label{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);font-weight:600;margin-bottom:.8rem}
.continue-reading .next-link{display:block;font-size:1.05rem;font-weight:600;color:var(--accent)}
.continue-reading .next-desc{font-size:.85rem;color:var(--muted);margin-top:.3rem}
@media(max-width:640px){
  .toc-grid{grid-template-columns:1fr}
  .hero h1{font-size:1.9rem}
  .project-card{grid-template-columns:1fr}
}
`;

// === 2. mermaid 块提取（HTML 注释占位, marked 不动它） ===
function extractMermaid(md) {
  const blocks = [];
  const out = md.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const idx = blocks.length;
    blocks.push(code.trim());
    return `<!--MERMAID_PLACEHOLDER_${idx}-->`;
  });
  return { out, blocks };
}

// === 3. wikilink 转相对链接 ===
function convertWikilinks(html) {
  return html.replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
    const [target, label] = inner.split('|');
    const [page] = target.split('#');
    const href = page.trim().replace(/\.md$/, '') + '.html';
    const text = (label || target).replace(/\.md$/, '').replace(/#/g, ' › ');
    return '<a href="' + href + '">' + text + '</a>';
  });
}

// === 4. 页头提取 ===
function makeHeader(md, filename) {
  const h1Match = md.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : basename(filename, '.md');
  const subMatch = md.match(/^>\s*(.+)/m);
  const sub = subMatch ? subMatch[1].trim() : '';
  const num = filename.match(/^(\d+)/);
  const eyebrow = num ? '第 ' + num[1] + ' 篇' : '案例集';
  return { title, sub, eyebrow };
}

// === 5. 底部导航提取 ===
function extractNav(md) {
  const navMatch = md.match(/上一篇[：:]\s*\[\[([^\]]+)\]\]\s*[｜|]\s*下一篇[：:]\s*\[\[([^\]]+)\]\]/);
  if (navMatch) {
    return {
      prev: navMatch[1].replace(/\.md$/, '').replace(/#.*/, ''),
      next: navMatch[2].replace(/\.md$/, '').replace(/#.*/, '')
    };
  }
  const nextOnly = md.match(/下一篇[：:]\s*\[\[([^\]]+)\]\]/);
  if (nextOnly) return { prev: null, next: nextOnly[1].replace(/\.md$/, '').replace(/#.*/, '') };
  const prevOnly = md.match(/上一篇[：:]\s*\[\[([^\]]+)\]\]/);
  if (prevOnly) return { prev: prevOnly[1].replace(/\.md$/, '').replace(/#.*/, ''), next: null };
  return null;
}

function buildNavHtml(nav) {
  if (!nav) return '';
  let prevHtml = '<span></span>';
  let nextHtml = '<span></span>';
  if (nav.prev) prevHtml = '<a href="' + nav.prev + '.html">← 上一篇：' + nav.prev + '</a>';
  if (nav.next) nextHtml = '<a href="' + nav.next + '.html">下一篇：' + nav.next + ' →</a>';
  return '<div class="nav">' + prevHtml + nextHtml + '</div>';
}

// === 6. 单文件转换 ===
function convertOne(mdPath) {
  const md = readFileSync(mdPath, 'utf8');
  const filename = basename(mdPath);
  const hdr = makeHeader(md, filename);
  const extracted = extractMermaid(md);
  let body = extracted.out.replace(/^#\s+.+\n?/m, '');
  marked.setOptions({ gfm: true, breaks: false });
  let htmlBody = marked.parse(body);
  htmlBody = convertWikilinks(htmlBody);
  for (let i = 0; i < extracted.blocks.length; i++) {
    const placeholder = '<!--MERMAID_PLACEHOLDER_' + i + '-->';
    const div = '<div class="mermaid">' + extracted.blocks[i] + '</div>';
    htmlBody = htmlBody.split(placeholder).join(div);
  }
  const navHtml = buildNavHtml(extractNav(md));

  const parts = ['<!DOCTYPE html>', '<html lang="zh-CN">', '<head>',
    '<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + hdr.title + '</title>',
    '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>',
    '<script>document.addEventListener("DOMContentLoaded",()=>{',
    '  mermaid.initialize({startOnLoad:true,theme:"neutral",securityLevel:"loose"});',
    '  // lightbox：点击 mermaid 块 → 全屏放大；点遮罩关闭；ESC 关闭',
    '  // 关键：mermaid 渲染后会把 .mermaid 里的文本替换成 svg，所以点击时',
    '  // 要在 lightbox 里重建一个 .mermaid div 放原始文本，再调用 mermaid.run() 重新渲染',
    '  const lb=document.createElement("div");lb.className="lightbox";document.body.appendChild(lb);',
    '  // 保存每张图的原始 mermaid 代码（渲染前抓取）',
    '  const sources=new Map();',
    '  document.querySelectorAll(".mermaid").forEach((m,i)=>{',
    '    sources.set(i,m.textContent);m.dataset.src=i;',
    '  });',
    '  document.querySelectorAll(".mermaid").forEach((m,i)=>{',
    '    m.addEventListener("click",async()=>{',
    '      const srcId=m.dataset.src;',
    '      const code=sources.get(Number(srcId));',
    '      const holder=document.createElement("div");',
    '      holder.className="mermaid-holder";',
    '      lb.innerHTML="";lb.appendChild(holder);lb.classList.add("open");',
    '      // 用 mermaid.render 拿 svg 字符串（不依赖 .mermaid class，避免 run() 的 class 识别问题）',
    '      try{',
    '        const {svg}=await mermaid.render("lb"+Date.now(),code);',
    '        holder.innerHTML=svg;',
    '        const s=holder.querySelector("svg");',
    '        // 从 viewBox 解析原始内容尺寸，强制设为绝对像素（覆盖 mermaid 的 width:100%/max-width 限制）',
    '        const vb=(s.getAttribute("viewBox")||"").split(" ");',
    '        const w=parseFloat(vb[2]),h=parseFloat(vb[3]);',
    '        if(w&&h){s.removeAttribute("style");s.setAttribute("width",w);s.setAttribute("height",h);}',
    '      }catch(e){console.error("lightbox render failed",e);holder.textContent="渲染失败: "+e.message}',
    '    });',
    '  });',
    '  lb.addEventListener("click",()=>lb.classList.remove("open"));',
    '  document.addEventListener("keydown",e=>{if(e.key==="Escape")lb.classList.remove("open")});',
    '})</script>',
    '<style>' + CSS + '</style>', '</head>', '<body>', '<div class="wrap">',
    '<header class="essay">', '<div class="eyebrow">' + hdr.eyebrow + '</div>',
    '<h1>' + hdr.title + '</h1>'];
  if (hdr.sub) parts.push('<div class="sub">' + hdr.sub + '</div>');
  parts.push('</header>', htmlBody, navHtml, '</div>', '</body>', '</html>');
  return parts.join('\n');
}

// === 7. 批量执行 ===
mkdirSync(OUT, { recursive: true });
if (!existsSync(SRC)) {
  console.error('Error: docs/ directory not found at', SRC);
  process.exit(1);
}

const mds = readdirSync(SRC).filter(f => f.endsWith('.md')).sort();
if (mds.length === 0) {
  console.error('Error: no .md files in', SRC);
  process.exit(1);
}

console.log('Building HTML from', SRC, '→', OUT);
let ok = 0, fail = 0;
for (const f of mds) {
  try {
    const html = convertOne(join(SRC, f));
    const outName = basename(f, '.md') + '.html';
    writeFileSync(join(OUT, outName), html, 'utf8');
    const mermaidCount = (html.match(/class="mermaid"/g) || []).length;
    console.log('  ✓', outName, '(' + (html.length / 1024).toFixed(1) + ' KB, mermaid:' + mermaidCount + ')');
    ok++;
  } catch (e) {
    console.error('  ✗', f, ':', e.message);
    fail++;
  }
}
console.log('Done:', ok, 'ok,', fail, 'failed');

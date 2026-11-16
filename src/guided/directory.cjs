'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {escape,inline,heading} = require('./format.cjs');
const {urlFor,chapterURL} = require('./catalog.cjs');
const assistantScript = ['../study-state.js','../study-assistant.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n');
const groups = [
  ['first','偏好与选择',1,4],
  ['decisions','消费、生产与定价',5,7],
  ['exchange','分配与交换',8,10],
  ['later','市场如何运转',11,14],
  ['games','博弈与机制',15,17],
  ['collective','匹配与集体选择',18,20],
];
const num = n=>String(n).padStart(2,'0');
const revealHash = `function showDirectoryAnchor(){const box=document.getElementById(location.hash.slice(1));if(box?.matches('details'))box.open=true}window.addEventListener('hashchange',showDirectoryAnchor);showDirectoryAnchor();`;

function part(id,label,meta,links,open=false){
  return `<details class="directory-part" name="directory-section" id="${id}"${open?' open':''}><summary><strong>${label}</strong><span>${meta}</span></summary><div class="entry-list">${links}</div></details>`;
}

function chapter(ch,content,page){
  function list(items){
    return items.map(m=>`<a class="unit-row" data-unit-key="${escape(m.key)}" href="${urlFor(m.key)}"><span class="idx">${m.id}</span><strong>${heading(content[m.key].title)}</strong><span aria-hidden="true">↗</span></a>`).join('');
  }
  const lead = `<header class="hub-head"><nav class="crumbs" aria-label="当前位置"><a href="learn.html">全书目录</a><span>/</span>第 ${ch.number} 章</nav><h1>${heading(ch.title)}</h1><p class="hub-lead">${inline(ch.question)}</p><div class="hub-actions"><a href="review-${ch.number}.html">4h 速通本章公式与命题 →</a><a href="formula-4h.html#hour-${ch.number<=5?1:ch.number<=7?2:ch.number<=14?3:4}">查看本组一小时计划 →</a></div><div id="study-resume" class="study-resume-banner" hidden></div><div class="study-filter-bar" data-study-filter><span class="study-bar-label">按掌握状态筛选</span><button type="button" data-filter="all" aria-pressed="true">全部</button><button type="button" data-filter="confused" aria-pressed="false">还没懂</button><button type="button" data-filter="done" aria-pressed="false">已独立做过</button><button type="button" data-filter="seen" aria-pressed="false">已看过</button></div></header>`;
  const choices = part('sections','学一个概念',ch.sections.length+' 个小节',list(ch.sections),true) + part('problems','做一道习题',ch.problems.length+' 道习题',list(ch.problems));
  return page({title:'第 '+ch.number+' 章 · '+ch.title,main:`<div class="directory">${lead}<div class="directory-parts">${choices}</div></div>`,scripts:`<script>${revealHash}\n${assistantScript}</script>`,footer:''});
}

function index(chapters,content,page,searchEntries=null){
  const entries = searchEntries || chapters.flatMap(ch=>[...ch.sections,...ch.problems].map(m=>({kind:m.kind,id:m.id,title:content[m.key].title,label:m.kind+' '+m.id,chapterTitle:ch.title,chapter:ch.number,theme:m.theme,url:urlFor(m.key),altUrl:`review-${ch.number}.html#${m.kind==='习题'?'p'+m.id:'section-'+m.id}`,altLabel:m.kind==='习题'?'速通批注':'4h 公式'})));
  const shelves = groups.map(([id,label,start,end])=>{
    const links=chapters.slice(start-1,end).map(ch=>`<a class="chapter-card" href="${chapterURL(ch.number)}"><span class="chapter-number">${num(ch.number)}</span><strong>${heading(ch.title)}</strong><span aria-hidden="true">↗</span></a>`).join('');
    return part(id,label,'第 '+start+'–'+end+' 章',links,start===1);
  }).join('');
  const data=JSON.stringify(entries).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const search=`<section data-atlas-search data-hide-target="topics"><form class="search-box" role="search" onsubmit="return false"><label for="find">查题号、命题或主题（生活理解版 + 4h 速通 + 作业全库直达）</label><input type="search" id="find" placeholder="例如：命题17.1、习题7.8、WARP、VCG、信息租金、豆浆" autocomplete="off"></form><div id="match-count" data-search-count role="status" aria-live="polite"></div><section id="results" class="results"><ul id="matches" class="atlas-result-list" data-search-results hidden></ul></section></section>`;
  const backup=`<details class="study-backup" data-study-backup hidden><summary>学习记录管理（仅存于本机浏览器）</summary><div class="study-backup-actions"><button type="button" data-export-study>导出学习进度 JSON ↓</button><button type="button" data-clear-study>清空本机学习记录</button><span class="backup-status" data-backup-status role="status"></span></div></details>`;
  const script=`<script type="application/json" id="entries">${data}</script><script>${revealHash}\n${assistantScript}</script>`;
  const intro=`<header class="hub-head"><p class="eyebrow">Osborne–Rubinstein · 中级微观经济学</p><h1>全书随题图解</h1><p class="hub-lead">今天想弄懂哪个问题？</p><a href="formula-4h.html">转到 4h 速通公式版 →</a><div id="study-resume" class="study-resume-banner" hidden></div>${backup}</header>`;
  return page({title:'全书随题图解',main:`<div class="directory">${intro}${search}<div class="directory-parts" id="topics">${shelves}</div></div>`,scripts:script,footer:''});
}
module.exports={chapter,index};

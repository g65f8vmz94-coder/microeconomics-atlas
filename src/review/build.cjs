'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {inline,escape} = require('../guided/format.cjs');
const {givenPoints, proofRows, answerSheet, formula} = require('../guided/unit-flow.cjs');
const {urlFor} = require('../guided/catalog.cjs');
const {manuscript, renderMath} = require('../insurance-lesson/build.cjs');
const {formulaRoute} = require('../formula-route.cjs');
const {sectionNotes,claimNotes,reviewControls} = require('./formal-render.cjs');
const assignments = [
  [5,'支出函数','习题 5','56'],[5,'时间偏好与借贷','习题 8','57'],[6,'鲁滨逊的生产与消费','习题 4','66–67'],
  [7,'隐性歧视的最优菜单','习题 7','78'],[8,'产权分配与竞争均衡','例 8.1 扩展','82']
];
const chapterURL = n => `review-${n}.html`;
const workURL = i => `review-hw3-${i+1}.html`;
const folder = path.join(__dirname,'homework');
function readClaims(items) {
  return items.filter(item=>/^(Proposition|Lemma) /.test(item.id));
}
function chapterDirectory(chapters) {
  return `<section class="review-index" id="chapters"><h2>按章查阅</h2><p>按原书结构查定义、公式、符号、命题证明与习题批注。四小时安排重点复习，全书内容可随时查阅。</p><div class="chapter-shelf">${chapters.map(ch=>`<a href="${chapterURL(ch.number)}"><small>${String(ch.number).padStart(2,'0')}</small><span>${escape(ch.title)}</span></a>`).join('')}</div></section>`;
}
function workList(filter) {
  return `<ul class="review-list">${assignments.map(([ch,title,ref,p],i)=>!filter||ch===filter?`<li><a href="${workURL(i)}">第 ${ch} 章 · ${ref}　${title}</a><small>中文本第 ${p} 页</small></li>`:'').join('')}</ul>`;
}
function question(meta,unit) {
  const url=urlFor(meta.key);
  const insurance=meta.key==='p3.9';
  const given=insurance?'有事故和无事故两种状态。给定初始财富、损失、事故概率和赔付倍率，选保费。分别在公平价与保险有加价时判断应否全保。':givenPoints(unit.given).points.map(inline).join('');
  const rows=insurance?manuscript().replaceAll('href="#check-',`href="${url}#check-`):answerSheet(meta,unit,proofRows(unit),{lessonURL:url,idPrefix:meta.key+'-'});
  return `<details class="review-problem" id="p${meta.id}"><summary><small>习题 ${meta.id}</small><strong>题干、解答与批注</strong></summary><div class="review-inside"><div class="given-box"><b>题目条件</b><p>${given}</p><small>英文本第 ${meta.page} 页 · 本站参考解答</small></div>${rows}<a href="${url}">从头看这道题的图解 →</a></div></details>`;
}
function chapterPage(ch,content,claims) {
  const sections = ch.sections.map((meta,i)=>sectionNotes(meta,i===0)).join('');
  const records=claims.filter(x=>x.chapter===ch.number);
  const statements=records.map(claimNotes).join('');
  const hasHomework=assignments.some(([n])=>n===ch.number);
  return `<main class="sprint review" id="main"><header><a href="formula-4h.html#chapters">← 四小时通道 · 全书目录</a><p class="folio">第 ${ch.number} 章</p><h1>${escape(ch.title)}</h1><p>本章 ${ch.sections.length} 节 · ${records.length} 条命题与引理 · ${ch.problems.length} 道章末习题。先读条件，再核对符号和推导。</p><nav class="section-tabs"><a href="#principles">小节 ${ch.sections.length}</a><a href="#claims">命题与引理 ${records.length}</a><a href="#problems">章末题 ${ch.problems.length}</a>${hasHomework?'<a href="#assigned">课堂作业</a>':''}</nav></header>
${reviewControls(ch)}<section id="principles"><h2>定义、公式与推导</h2>${sections}</section><section id="claims"><h2>命题与引理</h2>${statements}</section>
${hasHomework?`<section id="assigned"><h2>课堂作业</h2><p>第三次作业 · 更正后的题目与加问</p>${workList(ch.number)}</section>`:''}
<section id="problems"><h2>章末习题与批注</h2><p>点题号看整份答卷。批注解释每一步为什么这样写。</p>${ch.number===3?'<p><small>英文本本章题号从 5 跳至 7，沿用原书编号。</small></p>':''}${ch.problems.map(m=>question(m,content[m.key])).join('')}</section><footer><a href="formula-4h.html#chapters">← 换一章复习</a></footer></main>`;
}
function buildReview({chapters,content,items,page,out}) {
  const claims=readClaims(items);
  page('formula-4h.html','4h 速通公式版',formulaRoute(chapters,chapterDirectory(chapters)));
  for(const ch of chapters)page(chapterURL(ch.number),`第 ${ch.number} 章 · ${ch.title} · 速通`,chapterPage(ch,content,claims));
  page('review-homework.html','课堂作业与批注',`<main class="sprint review" id="main"><header><a href="formula-4h.html">← 四小时通道</a><h1>课堂作业与批注</h1><p>刘岩老师 · 第三次作业</p></header><section><h2>按老师更正后的题单复习</h2><p>按 2026 年 11 月 1 日的更正和中文教材页码整理。点开一题可看全部小问、推导和易漏步骤。解答与批注由本站整理。</p>${workList()}<p><a href="formula-4h.html#chapters">查全书章末题 →</a></p></section></main>`);
  for(const [i,[ch,title,ref,p]] of assignments.entries()){
    const src=fs.readFileSync(path.join(folder,`assignment3-${i+1}.html`),'utf8');
    page(workURL(i),`${title} · 第三次作业`,`<main class="sprint review hw-paper" id="main"><header><a href="review-homework.html">← 课堂作业</a><p class="folio">第三次作业 · 第 ${i+1} 题</p><h1>${title}</h1><small>中文本第 ${ch} 章${ref} · 印刷第 ${p} 页 · 本站参考解答与批注</small></header><section>${renderMath(src)}</section><footer><a href="review-homework.html">作业题单</a>　<a href="${chapterURL(ch)}">复习第 ${ch} 章</a>${i+1<assignments.length?`　<a href="${workURL(i+1)}">下一题 →</a>`:''}</footer></main>`);
  }
  for(const name of ['expenditure','intertemporal','robinson'])fs.copyFileSync(path.join(folder,name+'.png'),path.join(out,'assets','review-'+name+'.png'));
}
module.exports={buildReview};

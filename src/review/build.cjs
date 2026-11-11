'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {inline,escape} = require('../guided/format.cjs');
const {givenPoints, proofRows, answerSheet, formula} = require('../guided/unit-flow.cjs');
const {urlFor} = require('../guided/catalog.cjs');
const {manuscript, renderMath} = require('../insurance-lesson/build.cjs');
const {formulaRoute} = require('../formula-route.cjs');
const assignments = [
  [5,'支出函数','习题 5','56'],[5,'时间偏好与借贷','习题 8','57'],[6,'鲁滨逊的生产与消费','习题 4','66–67'],
  [7,'三种菜单怎样定价','习题 7','78'],[8,'四个人怎样分四间房','例 8.1 扩展','82']
];
const chapterURL = n => `review-${n}.html`;
const workURL = i => `review-hw3-${i+1}.html`;
const folder = path.join(__dirname,'homework');
function readClaims(items) {
  const rows = fs.readFileSync(path.join(__dirname,'propositions.txt'),'utf8').trim().split('\n').filter(line=>line && !line.startsWith('#'));
  const entries = new Map();
  for(const line of rows) {
    const [id,title,statement,cue,...extra] = line.split('|');
    const key = id.startsWith('L')?'Lemma '+id.slice(1):'Proposition '+id;
    if(!cue || extra.length || entries.has(key)) throw Error('Invalid review notes: '+id);
    entries.set(key,{title,statement,cue});
  }
  const claims = items.filter(item=>/^(Proposition|Lemma) /.test(item.id));
  if(entries.size!==claims.length || claims.some(item=>!entries.has(item.id)))throw Error('Review notes differ from the textbook inventory');
  return claims.map(item=>({...item,...entries.get(item.id)}));
}
function chapterDirectory(chapters) {
  return `<section class="review-index" id="chapters"><h2>按章查阅</h2><p>每章收齐小节、编号命题与引理、章末题的参考解答。四小时只安排精选练习，其余可按需翻阅。</p><div class="chapter-shelf">${chapters.map(ch=>`<a href="${chapterURL(ch.number)}"><small>${String(ch.number).padStart(2,'0')}</small><span>${escape(ch.title)}</span></a>`).join('')}</div></section>`;
}
function workList(filter) {
  return `<ul class="review-list">${assignments.map(([ch,title,ref,p],i)=>!filter||ch===filter?`<li><a href="${workURL(i)}">第 ${ch} 章 · ${ref}　${title}</a><small>中文本第 ${p} 页</small></li>`:'').join('')}</ul>`;
}
function question(meta,unit) {
  const url=urlFor(meta.key);
  const insurance=meta.key==='p3.9';
  const given=insurance?'有事故和无事故两种状态。给定初始财富、损失、事故概率和赔付倍率，选保费。分别在公平价与保险有加价时判断应否全保。':givenPoints(unit.given).points.map(inline).join('');
  const rows=insurance?manuscript().replaceAll('href="#check-',`href="${url}#check-`):answerSheet(meta,unit,proofRows(unit),{lessonURL:url,idPrefix:meta.key+'-'});
  return `<details class="review-problem" id="p${meta.id}"><summary><small>习题 ${meta.id}</small><strong>${escape(unit.title)}</strong></summary><div class="review-inside"><div class="given-box"><b>题目条件</b><p>${given}</p><small>英文本第 ${meta.page} 页 · 本站参考解答</small></div>${rows}<a href="${url}">从头看这道题的图解 →</a></div></details>`;
}
function chapterPage(ch,content,claims) {
  const sections = ch.sections.map(meta=>{
    const u=content[meta.key];
    return `<details><summary><small>§ ${meta.id}</small><strong>${escape(meta.theme)}</strong></summary><div class="review-inside"><p>${inline(u.given)}</p>${proofRows(u).map(r=>`<div class="section-line"><b>${inline(r.method)}</b>${formula(r.tex)}<p>${inline(r.why)}</p></div>`).join('')}<a href="${urlFor(meta.key)}">看本节图解 →</a></div></details>`;
  }).join('');
  const records=claims.filter(x=>x.chapter===ch.number);
  const statements=records.map(r=>{
    const [kind,id]=r.id.split(' ');
    return `<article class="claim" id="${kind.toLowerCase()}-${id}"><small>${kind==='Lemma'?'引理':'命题'} ${id} · 英文本第 ${r.printedPage} 页</small><h3>${escape(r.title)}</h3><p>${inline(r.statement)}</p><div class="claim-cue"><b>证明起笔</b> ${inline(r.cue)}</div><a href="${escape(r.evidence[0].entry)}">对照模型与原例 →</a></article>`;
  }).join('');
  const hasHomework=assignments.some(([n])=>n===ch.number);
  return `<main class="sprint review" id="main"><header><a href="formula-4h.html#chapters">← 四小时通道 · 全书目录</a><p class="folio">第 ${ch.number} 章</p><h1>${escape(ch.title)}</h1><p>${escape(ch.question)}</p><nav class="section-tabs"><a href="#principles">小节 ${ch.sections.length}</a><a href="#claims">命题与引理 ${records.length}</a><a href="#problems">章末题 ${ch.problems.length}</a>${hasHomework?'<a href="#assigned">课堂作业</a>':''}</nav></header>
<section id="principles"><h2>小节与公式</h2>${sections}</section><section id="claims"><h2>命题与引理</h2>${statements}</section>
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

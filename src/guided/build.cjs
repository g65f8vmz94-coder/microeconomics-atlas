const fs=require('node:fs');
const path=require('node:path');
const routeMotionHead=require('../route-motion.cjs').head();
const {escape,inline,heading}=require('./format.cjs');
const {axisPlot,relationDiagram,amountsIn,miniScale,cups,tickets,payoffTable,holdingBoard}=require('./figure.cjs');
const {catalog,urlFor,chapterURL,loadChapters}=require('./catalog.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
const css=read('../insurance-lesson/lesson.css')+'\n'+read('style.css');
const motion=read('../amicro-motion.js'),motionLicense=read('../vendor/AMICRO-LICENSE.txt');
const player=read('player.js');
const insurance={title:'少交一元保费，会怎样？'};
const online='https://microeconomics-atlas-mingze.synb636.chatgpt.site/';
const github='https://github.com/g65f8vmz94-coder/microeconomics-atlas';
const json=v=>JSON.stringify(v).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const extLink=(href,label)=>`<a data-site href="${escape(href)}">${escape(label)}</a>`;
const rowNumber=n=>String(n).padStart(2,'0');

function frameData(unit) {
  const scales = unit.columns.map((label, i) => amountsIn(label, unit.frames, i));
  const scaleNote = scales.some(Boolean) ? '<p class="scale-note">短条用本栏固定刻度，可与上一步比较。</p>' : '';
  function figureAt(i) {
    let figure = '';
    if (unit.payoff) figure = payoffTable({...unit.payoff, frames: [unit.payoff.frames[i]]}).replace('class="selected"', 'class="selected" aria-current="true"');
    else if (unit.holds) figure = holdingBoard({...unit.holds, frames: [unit.holds.frames[i]]});
    else if (unit.portions) figure = cups({...unit.portions, frames: [unit.portions.frames[i]]});
    else if (unit.tickets) figure = tickets({...unit.tickets, counts: [unit.tickets.counts[i]]});
    else if (unit.plot) figure = axisPlot({...unit.plot, dots: [unit.plot.dots[i]]});
    else if (unit.network) {
      // Keep the complete edge set so that two-way arrows keep their curvature.
      figure = relationDiagram({...unit.network, frames: [unit.network.frames[i], ...unit.network.frames]});
    }
    // Each snapshot has its own SVG definitions in the same HTML document.
    return i ? figure.replace(/id="(chart-clip|plot-dot|arrow)"/g, `id="$1-${i+1}"`).replace(/url\(#(chart-clip|arrow)\)/g, `url(#$1-${i+1})`) : figure;
  }
  return unit.frames.map(([action, values, why], i) => {
    const cells = unit.columns.map((name, col) => {
      const previous = unit.frames[i - 1]?.[1][col];
      const changed = i > 0 && previous !== values[col];
      const scale = scales[col];
      return `<div class="state-cell${changed ? ' changed' : ''}"><dt>${inline(name)}</dt><dd><div class="value">${inline(values[col])}</div>${scale ? miniScale({...scale, values: [scale.values[i]]}) : ''}${changed ? '<div class="before">原先 ' + inline(previous) + '</div>' : ''}</dd></div>`;
    }).join('');
    return {action, why: inline(why), cells, figure: figureAt(i), scaleNote};
  });
}
function page({title,main,footer='',footerHTML,headExtra='',scripts='',skip='main'}) {
  const defaultFooter = `<footer class="wrap foot"><div>${footer}</div><nav class="resource-links" aria-label="课外资源"><a href="learn.html">全书目录</a><a href="${github}">开源代码 ↗</a></nav></footer>`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="从生活里的选择到可复用的微观经济学解题步骤。"><title>${escape(title)} · 中微动态图谱</title><style>${css}</style>${routeMotionHead}${headExtra}</head><body class="guide"><a class="skip" href="#${skip}">跳到主要内容</a><header class="mast"><div class="wrap mast-inner"><a class="brand" data-site href="index.html"><i aria-hidden="true"></i>中微动态模型图谱</a><a href="learn.html">全书图解 ↗</a></div></header><main class="wrap" id="main">${main}</main>${footerHTML ?? defaultFooter}<script>if(location.protocol==='file:'){for(const a of document.querySelectorAll('a[data-site]'))a.href=new URL(a.getAttribute('href'),${json(online)});}</script>${scripts}</body></html>`;
}
function resourceLinks(meta, references) {
  const label = meta.related ? '本节菜单模型' : meta.kind === '习题' ? '原题模型与演算' : '本节原图与模型';
  const links = [extLink(meta.classic, label), ...meta.extras.map(e => extLink(e.href, e.label))];
  if (meta.models?.length) {
    links.push(...meta.models.map(m => extLink(m.href, m.label)));
  }
  links.push(extLink('learn.html', '全书目录'), extLink(github, '开源代码 ↗'));
  const pages = references.length ? references.map(inline).join('') : '印刷第 ' + escape(meta.page) + ' 页。';
  return `<details class="guided-resources"><summary>教材与原模型</summary><p>Osborne–Rubinstein，《Models in Microeconomic Theory》，${meta.kind} ${meta.id}。</p><p>${pages}</p><nav class="source-models" aria-label="模型与小问">${links.join('')}</nav></details>`;
}

function renderUnit(meta, unit, chapter, siblings) {
  const {givenPoints, proofRows, sceneId, formula, compareLink, answerSheet, transferForm, stepMarkup, fragmentStyle} = require('./unit-flow.cjs');
  const homework = meta.kind === '习题';
  const rows = proofRows(unit);
  const frames = frameData(unit);
  const {points: given, references} = givenPoints(unit.given);
  const givenTitle = homework ? '题目条件' : '情境与条件';
  const conditions = given.map((point, i) => {
    // Old links to an individual condition still land on the full question.
    const alias = i ? ` id="given-${i + 1}"` : '';
    const oldTitle = i ? `<span id="given-${i + 1}-title"></span>` : '';
    return `<li${alias}>${oldTitle}${inline(point)}</li>`;
  }).join('');
  const card = `<aside class="condition-card" aria-labelledby="given-heading" tabindex="-1">
<header class="condition-head"><h2 id="given-heading">${givenTitle}</h2><button type="button" class="condition-size" aria-controls="condition-text" aria-expanded="false" hidden>展开全题</button></header>
<div class="condition-text" id="condition-text" tabindex="0" role="region" aria-labelledby="given-heading"><ul>${conditions}</ul></div></aside>`;
  const steps = [{id: 'given-start', kind: 'given', phase: '读题', title: givenTitle}];
  for (const [i, part] of (unit.preparation || []).entries()) {
    const ledger = part.lines.map(([label, tex]) => `<div><dt>${inline(label)}</dt><dd>${formula(tex)}</dd></div>`).join('');
    steps.push({id: 'account-' + (i+1), kind:'account', phase:'算一算', title:part.title,
      body:`<p>${inline(part.text)}</p><dl class="guided-ledger">${ledger}</dl>` + (part.result ? '<p>'+inline(part.result)+'</p>' : '')});
  }
  frames.forEach((frame, i) => {
    const match = rows.find(row => row.frame === i);
    const target = match?.id || 'solution';
    steps.push({
      id: sceneId(i), kind: 'scene', phase: '图景 ' + (i + 1) + ' / ' + frames.length, title: frame.action,
      body: `<p class="guided-scene-why"${i === 0 ? ' id="scene-why"' : ''}>${frame.why}</p><div class="visual-pane"${i === 0 ? ' id="scene-1"' : ''}>${frame.figure}<dl class="state-grid" aria-label="这一步的画面">${frame.cells}</dl>${frame.scaleNote}</div>${i===0 && unit.preparation?.length ? '<a class="scene-back ledger-link" href="#account-1">回看两张订单怎么算 →</a>' : ''}<a class="scene-back" data-return href="#${target}">查看对应${homework ? '推理' : '结论'} →</a>`
    });
  });
  rows.forEach((row, i) => {
    row.fragments.forEach((point, j) => {
      const id = j ? row.id + '-' + (j + 1) : row.id;
      steps.push({
        id, kind: homework ? 'reasoning' : 'conclusion',
        phase: homework ? '推理' : '结论',
        title: row.label + row.method,
        body: (i === 0 && j === 0 ? '<span id="solution"></span>' : '') +
          (j === 0 ? formula(row.tex) : '') + '<p>' + inline(point) + '</p>' + compareLink(row, id)
      });
    });
  });
  if (homework) steps.push({
    id: 'answer', kind: 'answer', phase: '整理作答', title: '完整手写答卷',
    body: answerSheet(meta, unit, rows)
  });
  steps.push({id: 'practice', kind: 'practice', phase: '迁移练习', title: '换个条件，你会怎样判断？', body: transferForm(unit)});
  const position = siblings.findIndex(m => m.key === meta.key);
  const navLink = (m, action) => m ? extLink(urlFor(m.key), action + '　' + m.kind + ' ' + m.id) : '';
  const chapterHref = chapterURL(chapter.number);
  const main = `<header class="unit-head"><nav class="crumbs" aria-label="当前位置">${extLink(chapterHref, '第 ' + chapter.number + ' 章 · ' + chapter.title)}<span>/</span><span>${meta.kind} ${meta.id}</span><span>书中第 ${meta.page} 页</span></nav><h1>${heading(unit.title)}</h1><details class="guided-jumps"><summary>跳到…</summary><nav class="unit-nav" aria-label="本页学习入口"><a href="#given">读条件</a><a href="#scene">看图景</a><a href="#solution">${homework ? '逐步推理' : '读结论'}</a><a href="#practice">换道题试试</a></nav></details></header>
<div class="study-desk" id="given">${card}<div class="guided-flow" data-unit="${escape(meta.key)}">${steps.map((step, i) => stepMarkup(steps, step, i)).join('')}</div></div>
<nav class="guide-pager" aria-label="相邻图解">${navLink(siblings[position - 1], '← 上一篇')}${extLink(chapterHref, '本章目录')}${navLink(siblings[position + 1], '下一篇 →')}</nav>`;
  const [,,correct, reason] = unit.practice;
  const scripts = `<script type="text/plain" id="amicro-license">${motionLicense}</script><script>${motion}</script><script id="guide-data" type="application/json">${json({correct, explain:inline(reason)})}</script><script>${player}</script>`;
  const footer = `<footer class="wrap foot">${resourceLinks(meta, references)}<a download="${urlFor(meta.key)}" href="">下载本页，离线复习 ↓</a></footer>`;
  return page({title: meta.kind + ' ' + meta.id + ' ' + unit.title, main, scripts,
    footerHTML: footer, headExtra: fragmentStyle, skip: 'given'});
}
const directory = require('./directory.cjs');
function renderChapter(ch,content) { return directory.chapter(ch,content,page); }
function renderIndex(chapters,content) { return directory.index(chapters,content,page); }
async function buildGuides(out,coverage) {
  const chapters=catalog(coverage);
  const content=Object.assign({'p3.9':insurance},...await loadChapters(chapters));
  const roster=chapters.flatMap(ch=>[...ch.sections,...ch.problems].map(m=>m.key));
  const errors=[...roster.filter(k=>!content[k]).map(k=>'missing '+k),...Object.keys(content).filter(k=>!roster.includes(k)).map(k=>'extra '+k)];
  if(errors.length)throw new Error('Guided inventory: '+errors.join(', '));
  const write=(name,body)=>fs.writeFileSync(path.join(out,name),body);
  for(const ch of chapters){
    const units=[...ch.sections,...ch.problems];
    for(const m of units)if(m.key!=='p3.9'){
      try{write(urlFor(m.key),renderUnit(m,content[m.key],ch,units));}
      catch(err){throw new Error(m.key+': '+err.message,{cause:err});}
    }
    write(chapterURL(ch.number),renderChapter(ch,content));
  }
  write('learn.html',renderIndex(chapters,content));
  return {chapters, content};
}
module.exports={buildGuides,renderUnit,renderChapter,renderIndex};

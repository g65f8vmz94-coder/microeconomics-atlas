const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const routeMotionHead=require('../route-motion.cjs').head();
const {escape,inline,heading}=require('./format.cjs');
const {previewProse, matchGivenItems}=require('./unit-flow.cjs');
const {axisPlot,relationDiagram,amountsIn,miniScale,cups,tickets,payoffTable,holdingBoard,screeningFigure,exchangeFigure,matchingFigure}=require('./figure.cjs');
const {catalog,urlFor,chapterURL,loadChapters}=require('./catalog.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
const minCss=require('../compact-css.cjs');
const css=minCss(read('../insurance-lesson/lesson.css')+'\n'+read('style.css'));
const motion=read('../amicro-motion.js'),motionLicense=read('../vendor/AMICRO-LICENSE.txt');
const player=read('../study-state.js')+'\n'+read('player.js');
const gzipReader=read('../vendor/fflate/gunzip.min.js').replace(/<\/script/gi,'<\\/script');
const fflateLicense=read('../vendor/fflate/LICENSE');
const packedPlayer=zlib.gzipSync(Buffer.from(motion+'\n'+player,'utf8'),{level:9,mtime:0}).toString('base64');
const playerRuntime=`<script type="text/plain" id="fflate-license">${fflateLicense}</script><script>${gzipReader}</script><script type="text/plain" id="guide-runtime-gzip">${packedPlayer}</script><script>(()=>{const raw=atob(document.getElementById('guide-runtime-gzip').textContent);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const script=document.createElement('script');script.textContent=atlasUnpack(bytes);document.currentScript.after(script);})();</script>`;
const insurance={title:'少交一元保费，会怎样？'};
const online='https://microeconomics-atlas-mingze.synb636.chatgpt.site/';
const github='https://github.com/g65f8vmz94-coder/microeconomics-atlas';
const json=v=>JSON.stringify(v).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const extLink=(href,label)=>`<a data-site href="${escape(href)}">${escape(label)}</a>`;
const rowNumber=n=>String(n).padStart(2,'0');

function frameData(unit, given = [], citations = {}) {
  const scales = unit.columns.map((label, i) => amountsIn(label, unit.frames, i));
  const scaleNote = scales.some(Boolean) ? '<p class="scale-note">短条用本栏固定刻度，可与上一步比较。</p>' : '';
  function figureAt(i) {
    let figure = '';
    if (unit.screening) figure = screeningFigure(unit.screening, i);
    else if (unit.exchange) figure = exchangeFigure(unit.exchange, i);
    else if (unit.matchingTrace) figure = matchingFigure(unit.matchingTrace, i);
    else if (unit.payoff) figure = payoffTable({...unit.payoff, frames: [unit.payoff.frames[i]]}).replace('class="selected"', 'class="selected" aria-current="true"');
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
      return `<div class="state-cell${changed ? ' changed' : ''}"><dt>${inline(name)}</dt><dd><div class="value">${inline(values[col])}</div>${scale ? miniScale({...scale, values: [scale.values[i]]}, 'scale-' + col) : ''}${changed ? '<div class="before">原先 ' + inline(previous) + '</div>' : ''}</dd></div>`;
    }).join('');
    const note = unit.frameNotes?.[i] || {};
    const auto = previewProse(why);
    const summary = note.summary || auto.summary;
    const detail = note.detail !== undefined ? note.detail : (note.summary ? (why.trim() === note.summary.trim() ? '' : why) : auto.detail);
    const citeItems = note.citeItems || citations[i] || [];
    return {
      action, why: inline(why), summary, detail,
      task: note.task || '',
      citeLabel: note.citeLabel || '',
      citeItems,
      citeRows: note.citeRows || [],
      hideGrid: Boolean(unit.hideGrid),
      cells, figure: figureAt(i), scaleNote
    };
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
  const {points: given, references} = givenPoints(unit.given);
  const citations = require('./condition-citations.cjs')[meta.key] || {};
  const frames = frameData(unit, given, citations.frames);
  const givenTitle = homework ? '题目条件' : '情境与条件';
  const conditions = given.map((point, i) => {
    // Old links to an individual condition still land on the full question.
    const alias = i ? ` id="given-${i + 1}"` : '';
    const oldTitle = i ? `<span id="given-${i + 1}-title"></span>` : '';
    return `<li${alias} data-item-idx="${i}">${oldTitle}${inline(point)}</li>`;
  }).join('');
  const extraTables = (unit.givenTables || []).map(t =>
    `<table class="condition-table"><caption>${inline(t.caption)}</caption><thead><tr>${t.headers.map(h => `<th scope="col">${inline(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r => `<tr data-row-key="${escape(r[0])}">${r.map((c, idx) => idx === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  ).join('');
  const givenTables = extraTables ? `<div class="condition-tables">${extraTables}</div>` : '';
  const card = `<aside class="condition-card" aria-labelledby="given-heading" tabindex="-1">
<header class="condition-head"><h2 id="given-heading">${givenTitle}</h2><button type="button" class="condition-size" aria-controls="condition-text" aria-expanded="false" hidden>展开全题</button></header>
<div class="condition-cite" id="condition-cite" hidden><span class="cite-tag">本步条件</span><span class="cite-text"></span><button type="button" class="cite-locate" hidden>在原题高亮</button></div>
<div class="condition-text" id="condition-text" tabindex="0" role="region" aria-labelledby="given-heading"><ul>${conditions}</ul>${givenTables}</div></aside>`;
  const steps = [{id: 'given-start', kind: 'given', phase: '读题', title: givenTitle}];
  for (const [i, part] of (unit.preparation || []).entries()) {
    const ledger = part.lines.map(([label, tex]) => `<div><dt>${inline(label)}</dt><dd>${formula(tex)}</dd></div>`).join('');
    const citeInline = part.citeLabel ? `<p class="step-cite-inline"><strong>用到条件：</strong><span class="cite-val">${inline(part.citeLabel)}</span></p>` : '';
    steps.push({id: 'account-' + (i+1), kind:'account', phase:'算一算', title:part.title,
      task: part.task || '', citeLabel: part.citeLabel || '', citeItems: part.citeItems || [],
      body:`${citeInline}<p>${inline(part.text)}</p><dl class="guided-ledger">${ledger}</dl>` + (part.result ? '<p>'+inline(part.result)+'</p>' : '')});
  }
  frames.forEach((frame, i) => {
    const match = rows.find(row => row.frame === i);
    const target = match?.id || 'solution';
    const citeInline = frame.citeLabel ? `<p class="step-cite-inline"><strong>用到条件：</strong><span class="cite-val">${inline(frame.citeLabel)}</span></p>` : '';
    const detailBox = frame.detail ? `<details class="guided-detail"><summary>展开本步详细计算与过程</summary><div class="guided-detail-body">${inline(frame.detail)}</div></details>` : '';
    const visualBox = `<div class="visual-pane"${i === 0 ? ' id="scene-1"' : ''}>${frame.figure}${frame.hideGrid ? '' : `<dl class="state-grid" aria-label="这一步的画面">${frame.cells}</dl>${frame.scaleNote}`}</div>`;
    const backLinks = `<div class="scene-links">${i===0 && unit.preparation?.length ? '<a class="scene-back ledger-link" href="#account-1">回看两张订单怎么算 →</a>' : ''}<a class="scene-back" data-return href="#${target}">查看对应${homework ? '推理' : '结论'} →</a></div>`;
    steps.push({
      id: sceneId(i), kind: 'scene', phase: '图景 ' + (i + 1) + ' / ' + frames.length, title: frame.action,
      task: frame.task, citeLabel: frame.citeLabel, citeItems: frame.citeItems, citeRows: frame.citeRows,
      body: `<p class="guided-scene-why"${i === 0 ? ' id="scene-why"' : ''}>${inline(frame.summary)}</p>${citeInline}${visualBox}${detailBox}${backLinks}`
    });
  });
  rows.forEach((row, i) => {
    row.fragments.forEach((point, j) => {
      const id = j ? row.id.replace('proof-', 'reason-') + '-' + (j + 1) : row.id;
      const aliases = row.legacyAnchors.filter(a => a.fragment === j && a.id !== id).map(a => '<span id="' + a.id + '" data-legacy-proof></span>').join('');
      const auto = previewProse(point, 145);
      const summary = j === 0 && row.summary ? row.summary : auto.summary;
      const detail = j === 0 && row.detail !== undefined ? row.detail : (j === 0 && row.summary ? (point.trim() === row.summary.trim() ? '' : point) : auto.detail);
      const detailBox = detail ? `<details class="guided-detail"><summary>展开详细推导与边界检验</summary><div class="guided-detail-body">${inline(detail)}</div></details>` : '';
      const citeInline = row.citeLabel ? `<p class="step-cite-inline"><strong>用到条件：</strong><span class="cite-val">${inline(row.citeLabel)}</span></p>` : '';
      const rowCiteItems = row.citeItems || citations.proof?.[i] || [];
      steps.push({
        id, kind: homework ? 'reasoning' : 'conclusion',
        phase: homework ? '推理' : '结论',
        title: row.label + row.method,
        task: j === 0 ? (row.task || '') : '',
        citeLabel: row.citeLabel || '', citeItems: rowCiteItems, citeRows: row.citeRows || [],
        body: aliases + (i === 0 && j === 0 ? '<span id="solution"></span>' : '') +
          (j === 0 ? formula(row.tex) : '') + citeInline + '<p>' + inline(summary) + '</p>' + detailBox + compareLink(row, id)
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
  const reviewHref = 'review-' + chapter.number + '.html#' + (homework ? 'p' + meta.id : 'section-' + meta.id);
  const statusBar = `<div class="study-status-bar" id="study-status-bar" hidden><span class="study-bar-label">掌握标记</span><button type="button" class="study-status-btn" data-study-status="seen" aria-pressed="false">已看过</button><button type="button" class="study-status-btn" data-study-status="confused" aria-pressed="false">还没懂</button><button type="button" class="study-status-btn" data-study-status="done" aria-pressed="false">已独立做过</button><span class="study-status-note" id="study-status-note" role="status"></span></div>`;
  const shareBar = `<div class="step-share-bar" id="step-share-bar" hidden><button type="button" data-copy-step>复制本步链接</button><button type="button" data-copy-issue>复制纠错模板</button><a class="issue-external" data-issue-link href="${github}/issues/new" target="_blank" rel="noopener" hidden>去 GitHub 反馈 ↗</a><span class="share-status" id="share-status" role="status"></span></div>`;
  const main = `<header class="unit-head"><nav class="crumbs" aria-label="当前位置">${extLink(chapterHref, '第 ' + chapter.number + ' 章 · ' + chapter.title)}<span>/</span><span>${meta.kind} ${meta.id}</span><span>书中第 ${meta.page} 页</span></nav><h1>${heading(unit.title)}</h1><details class="guided-jumps"><summary>跳到…</summary><nav class="unit-nav" aria-label="本页学习入口"><a href="#given">读条件</a><a href="#scene">看图景</a><a href="#solution">${homework ? '逐步推理' : '读结论'}</a>${homework ? '<a href="#answer">完整答卷</a>' : ''}<a href="#practice">换道题试试</a>${extLink(reviewHref, homework ? '4h 速通命题与批注 ↗' : '4h 速通公式与推导 ↗')}</nav></details>${statusBar}</header>
<div class="study-desk" id="given">${card}<div class="guided-flow" data-unit="${escape(meta.key)}">${steps.map((step, i) => stepMarkup(steps, step, i, {hasPaper: homework})).join('')}${shareBar}</div></div>
<nav class="guide-pager" aria-label="相邻图解">${navLink(siblings[position - 1], '← 上一篇')}${extLink(chapterHref, '本章目录')}${extLink(reviewHref, '本章 4h 速通 ↗')}${navLink(siblings[position + 1], '下一篇 →')}</nav>`;
  const [,choices,correct, reason] = unit.practice;
  const diag = unit.practiceDiagnostics || {};
  const scripts = `<script type="text/plain" id="amicro-license">${motionLicense}</script><script id="guide-data" type="application/json">${json({key: meta.key, title: unit.title, label: meta.kind + ' ' + meta.id, url: urlFor(meta.key), github, correct, choices: choices.map(inline), explain: inline(reason), wrongReasons: (diag.wrongReasons || []).map(s => s ? inline(s) : ''), hint: diag.hint ? inline(diag.hint) : ''})}</script>${playerRuntime}`;
  const footer = `<footer class="wrap foot">${resourceLinks(meta, references)}<a download="${urlFor(meta.key)}" href="">下载本页，离线复习 ↓</a></footer>`;
  return page({title: meta.kind + ' ' + meta.id + ' ' + unit.title, main: main.replace(/<a data-site href="review-/g, '<a data-site data-review-route href="review-'), scripts,
    footerHTML: footer, headExtra: fragmentStyle, skip: 'given'});
}
const directory = require('./directory.cjs');
function renderChapter(ch,content) { return directory.chapter(ch,content,page); }
function renderIndex(chapters,content,searchIndex=null) { return directory.index(chapters,content,page,searchIndex); }
async function buildGuides(out,coverage) {
  const {buildSearchIndex}=require('../study-index.cjs');
  const chapters=catalog(coverage);
  const content=Object.assign({'p3.9':insurance},...await loadChapters(chapters));
  const roster=chapters.flatMap(ch=>[...ch.sections,...ch.problems].map(m=>m.key));
  const errors=[...roster.filter(k=>!content[k]).map(k=>'missing '+k),...Object.keys(content).filter(k=>!roster.includes(k)).map(k=>'extra '+k)];
  if(errors.length)throw new Error('Guided inventory: '+errors.join(', '));
  const searchIndex=buildSearchIndex({chapters,content,coverageItems:coverage.items||[]});
  const write=(name,body)=>fs.writeFileSync(path.join(out,name),body);
  for(const ch of chapters){
    const units=[...ch.sections,...ch.problems];
    for(const m of units)if(m.key!=='p3.9'){
      try{write(urlFor(m.key),renderUnit(m,content[m.key],ch,units));}
      catch(err){throw new Error(m.key+': '+err.message,{cause:err});}
    }
    write(chapterURL(ch.number),renderChapter(ch,content));
  }
  write('learn.html',renderIndex(chapters,content,searchIndex));
  return {chapters, content, searchIndex};
}
module.exports={buildGuides,renderUnit,renderChapter,renderIndex};

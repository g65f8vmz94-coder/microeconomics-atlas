const fs=require('node:fs');
const path=require('node:path');
const {escape,inline,equation}=require('./format.cjs');
const {axisPlot,relationDiagram,amountsIn,miniScale,cups,tickets}=require('./figure.cjs');
const {catalog,urlFor,chapterURL}=require('./catalog.cjs');
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
  return unit.frames.map(([action,values,why])=>({action:inline(action),values:values.map(inline),why:inline(why)}));
}
function page({title,main,footer='',scripts='',skip='main'}) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="从生活里的选择到可复用的微观经济学解题步骤。"><title>${escape(title)} · 中微动态图谱</title><style>${css}</style></head><body class="guide"><a class="skip" href="#${skip}">跳到主要内容</a><header class="mast"><div class="wrap mast-inner"><a class="brand" data-site href="index.html"><i aria-hidden="true"></i>中微动态模型图谱</a><a href="learn.html">前十章图解 ↗</a></div></header><main class="wrap" id="main">${main}</main><footer class="wrap foot"><div>${footer}</div><nav class="resource-links" aria-label="课外资源"><a href="learn.html">前十章目录</a><a href="${github}">开源代码 ↗</a></nav></footer><script>if(location.protocol==='file:'){for(const a of document.querySelectorAll('a[data-site]'))a.href=new URL(a.getAttribute('href'),${json(online)});}</script>${scripts}</body></html>`;
}
function resourceLinks(meta) {
  let details=extLink(meta.classic,meta.related?'查看本节的菜单模型 ↗':meta.kind==='习题'?'看原题模型与演算 ↗':'看本节原图与全部模型 ↗');
  if(meta.extras.length)details+=meta.extras.map(e=>extLink(e.href,e.label)).join('');
  if(meta.models?.length)details+=`<details class="all-models"><summary>本节还有哪些情形？</summary><div>${meta.models.map(m=>extLink(m.href,m.label)).join('')}</div></details>`;
  return `<nav class="source-models" aria-label="原课程与小问">${details}${meta.qualified?'<p class="qualification">原题的严格断言有附加条件。本题解答与原模型都列出了相应边界。</p>':''}</nav>`;
}
function renderUnit(meta,unit,chapter,siblings) {
  const frames=frameData(unit),first=frames[0];
  const [question,choices,correct,reason]=unit.practice;
  const scene=unit.portions?cups(unit.portions):unit.tickets?tickets(unit.tickets):unit.plot?axisPlot(unit.plot):unit.network?relationDiagram(unit.network):'';
  const scales=unit.columns.map((label,i)=>amountsIn(label,unit.frames,i));
  const cells=unit.columns.map((name,i)=>`<div class="state-cell"><dt>${inline(name)}</dt><dd><div class="value">${first.values[i]}</div>${miniScale(scales[i])}<div class="before"></div></dd></div>`).join('');
  const proof=unit.proof.map(([name,tex,why,k],i)=>`<article class="proof-row"><div class="proof-no" aria-hidden="true">${rowNumber(i+1)}</div><div class="proof-body"><h3>${inline(name)}</h3><p>${inline(why)}</p><a id="proof-${i+1}" class="proof-action" data-proof-step="${k}" href="#scene">${tex?'<span class="eq">'+equation(tex)+'</span>':''}<span class="cue">对照第 ${k+1} 步 ↗</span></a></div></article>`).join('');
  const position=siblings.findIndex(x=>x.key===meta.key);
  const navLink=(m,action)=>m?`<a href="${urlFor(m.key)}"><span>${action}</span>　${m.kind} ${m.id}</a>`:'';
  const main=`<header class="unit-head"><nav class="crumbs" aria-label="当前位置"><a href="${chapterURL(chapter.number)}">第 ${chapter.number} 章 · ${escape(chapter.title)}</a><span>/</span><span>${meta.kind} ${meta.id}</span><span>书中第 ${meta.page} 页</span></nav><h1>${inline(unit.title)}</h1><nav class="unit-nav" aria-label="本页学习入口"><a href="#solution">直接看解答 ↓</a><a href="#practice">换道题试试 ↓</a></nav></header>
<section class="given" aria-labelledby="given-heading"><h2 id="given-heading">${meta.kind==='习题'?'题目条件':'情境与条件'}</h2><p>${inline(unit.given)}</p></section>
<section class="scene-board${scene?' with-figure':''}" id="scene" tabindex="-1" aria-labelledby="scene-title"><div class="scene-body"><div class="visual-pane">${scene}<dl class="state-grid" aria-label="当前画面">${cells}</dl>${scales.some(Boolean)?'<p class="scale-note">短条用本栏固定刻度，比较前后两步。</p>':''}</div><div class="narration"><div class="step-kicker"><span id="counter">第 1 / ${frames.length} 步</span><span class="pips" aria-hidden="true">${frames.map((_,i)=>`<i class="${i===0?'on':''}"></i>`).join('')}</span></div><h2 id="scene-title">${first.action}</h2><p id="scene-why">${first.why}</p><div class="player-actions"><button type="button" class="primary" id="next">看下一步 →</button><button type="button" id="previous" disabled>上一步</button><button type="button" id="play">连续播放</button></div><a class="scene-back" id="back-to-proof" href="#solution">看这一步怎样写进答案 ↓</a></div></div><p role="status" id="announce" class="sr"></p><noscript><ol>${frames.map(f=>`<li><b>${f.action}</b> · ${f.values.join('，')}。${f.why}</li>`).join('')}</ol></noscript></section>
<section class="solution-layout" aria-labelledby="solution"><header><p class="eyebrow">从画面到答题纸</p><h2 id="solution" tabindex="-1">${meta.kind==='习题'?'这道题怎么写？':'为什么能这样判断？'}</h2><p>每行解答都能跳回对应的画面。</p></header><div class="proof-rows">${proof}${resourceLinks(meta)}</div></section>
<section class="transfer-layout" id="practice" aria-labelledby="practice-heading"><header><p class="eyebrow">换个条件</p><h2 id="practice-heading">这次你来判断。</h2></header><form class="transfer-form" id="transfer"><fieldset><legend>${inline(question)}</legend><div class="transfer-options">${choices.map((x,i)=>`<label><input type="radio" name="choice" value="${i}"><span>${inline(x)}</span></label>`).join('')}</div></fieldset><div class="practice-actions"><button type="submit" class="primary">核对我的判断</button><button type="button" id="reveal" class="quiet" aria-expanded="false" aria-controls="worked">直接看做法</button></div><p class="feedback" id="feedback" role="status"></p><div id="worked" hidden><strong>${inline(choices[correct])}</strong><p>${inline(reason)}</p></div><noscript><details><summary>看做法</summary><p>${inline(choices[correct])}。${inline(reason)}</p></details></noscript></form></section>
<nav class="guide-pager" aria-label="相邻图解">${navLink(siblings[position-1],'← 上一篇')}<a href="${chapterURL(chapter.number)}">本章目录</a>${navLink(siblings[position+1],'下一篇 →')}</nav>`;
  const scripts=`<script type="text/plain" id="amicro-license">${motionLicense}</script><script>${motion}</script><script id="guide-data" type="application/json">${json({frames,correct,explain:inline(reason)})}</script><script>${player}</script>`;
  return page({title:meta.kind+' '+meta.id+' '+unit.title,main,scripts,skip:'scene',footer:`<strong>教材与算例</strong><p>Osborne–Rubinstein，《Models in Microeconomic Theory》，${meta.kind} ${meta.id}，印刷第 ${meta.page} 页。本站用中文重述，生活情境与明确标出的算例用于讲解。</p><a download="${urlFor(meta.key)}" href="${urlFor(meta.key)}">下载本页，离线复习 ↓</a>`});
}
function renderChapter(ch,content) {
  const renderList=(title,id,items)=>`<section id="${id}"><h2>${title} <small>${items.length}</small></h2>${items.map(m=>`<a class="unit-row" href="${urlFor(m.key)}"><span class="idx">${m.id}</span><span><strong>${inline(content[m.key].title)}</strong><small>${m.kind==='小节'?escape(m.theme):'原书第 '+m.page+' 页'}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</section>`;
  return page({title:'第 '+ch.number+' 章 · '+ch.title,main:`<div class="directory"><header class="hub-head"><nav class="crumbs" aria-label="当前位置"><a href="learn.html">前十章</a><span>/</span><span>第 ${ch.number} 章</span></nav><h1>${escape(ch.title)}</h1><p class="hub-lead">${escape(ch.question)}</p><nav class="unit-nav"><a href="#sections">小节讲解 ↓</a><a href="#problems">按题号找习题 ↓</a></nav></header><div class="dir-columns">${renderList('小节讲解','sections',ch.sections)}${renderList('章末习题','problems',ch.problems)}</div></div>`,footer:'<strong>本章复习</strong><p>每个入口都包含题设、逐步画面、解答和一道迁移练习。</p>'});
}
function renderIndex(chapters,content) {
  const total=k=>chapters.reduce((n,ch)=>n+ch[k].length,0);
  const search=chapters.flatMap(ch=>[...ch.sections,...ch.problems].map(m=>({title:content[m.key].title,label:m.kind+' '+m.id,chapter:ch.title,theme:m.theme,url:urlFor(m.key)})));
  const cards=chapters.map(ch=>`<a class="chapter-card" href="${chapterURL(ch.number)}"><span class="chapter-number">${rowNumber(ch.number)}</span><span><strong>${escape(ch.title)}</strong><small>${escape(ch.question)}</small><span class="catalog-numbers">${ch.sections.length} 小节 · ${ch.problems.length} 道习题</span></span><span aria-hidden="true">↗</span></a>`).join('');
  const script=`<script type="application/json" id="entries">${json(search)}</script><script>
const entries=JSON.parse(document.getElementById('entries').textContent);
const entrySearch=document.getElementById('find'),list=document.getElementById('matches'),msg=document.getElementById('match-count');
entrySearch.addEventListener('input',()=>{const term=entrySearch.value.trim().toLowerCase().replace(/\\s+/g,'');list.replaceChildren();document.getElementById('results').hidden=!term;if(!term){msg.textContent='';return;}const tokens=term.replace(/^第/,'').replace(/^章末题|^题(?!目)/,'习题');let hits=entries.filter(e=>{const packed=(e.label+e.title+e.chapter+e.theme).toLowerCase().replace(/\\s+/g,'');const number=/^(习题|小节)?(\\d+\\.\\d+)$/.exec(tokens);return number?e.label.replace(/\\s/g,'')===(number[1]||e.label.split(' ')[0])+number[2]:packed.includes(tokens)});for(const e of hits){const li=document.createElement('li'),a=document.createElement('a');a.href=e.url;a.textContent=e.label+' · '+e.title;li.append(a);list.append(li);}msg.textContent=hits.length?'找到 '+hits.length+' 个入口':'没有匹配的题号或主题。';});</script>`;
  return page({title:'前十章随题图解',scripts:script,main:`<div class="directory"><header class="hub-head"><p class="eyebrow">Osborne–Rubinstein · 第 1—10 章</p><h1>前十章随题图解</h1><p class="hub-lead">挑一个生活里的问题，看它一步步变成卷面上的答案。这里收录 ${total('sections')} 个小节和原书实际编号的 ${total('problems')} 道章末题。</p></header><div class="search-box"><label for="find">按题号或内容找</label><input type="search" id="find" placeholder="例如 3.9、保费、奶茶"></div><div role="status" id="match-count"></div><section id="results" class="results" hidden><h2>匹配的图解</h2><ul id="matches"></ul></section><div class="chapter-deck">${cards}</div></div>`,footer:'<strong>教材与题号</strong><p>小节与章末习题分别编号。第 3 章的原书习题从 5 跳到 7。</p>'});
}
function buildGuides(out,coverage) {
  const chapters=catalog(coverage);
  const content=Object.assign({'p3.9':insurance},...chapters.map(ch=>require('./ch'+rowNumber(ch.number)+'.cjs')));
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
}
module.exports={buildGuides,renderUnit,renderChapter,renderIndex};

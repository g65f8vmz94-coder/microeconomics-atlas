'use strict';
const {escape,inline,heading} = require('./format.cjs');
const {urlFor,chapterURL} = require('./catalog.cjs');
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
    return items.map(m=>`<a class="unit-row" href="${urlFor(m.key)}"><span class="idx">${m.id}</span><strong>${heading(content[m.key].title)}</strong><span aria-hidden="true">↗</span></a>`).join('');
  }
  const lead = `<header class="hub-head"><nav class="crumbs" aria-label="当前位置"><a href="learn.html">全书目录</a><span>/</span>第 ${ch.number} 章</nav><h1>${heading(ch.title)}</h1><p class="hub-lead">${inline(ch.question)}</p><a href="formula-4h.html#hour-${ch.number<=5?1:ch.number<=7?2:ch.number<=14?3:4}">已懂直觉，转到本组公式 →</a></header>`;
  const choices = part('sections','学一个概念',ch.sections.length+' 个小节',list(ch.sections),true) + part('problems','做一道习题',ch.problems.length+' 道习题',list(ch.problems));
  return page({title:'第 '+ch.number+' 章 · '+ch.title,main:`<div class="directory">${lead}<div class="directory-parts">${choices}</div></div>`,scripts:`<script>${revealHash}</script>`,footer:''});
}

function index(chapters,content,page){
  const entries = chapters.flatMap(ch=>[...ch.sections,...ch.problems].map(m=>({title:content[m.key].title,label:m.kind+' '+m.id,chapter:ch.title,number:ch.number,theme:m.theme,url:urlFor(m.key)})));
  const shelves = groups.map(([id,label,start,end])=>{
    const links=chapters.slice(start-1,end).map(ch=>`<a class="chapter-card" href="${chapterURL(ch.number)}"><span class="chapter-number">${num(ch.number)}</span><strong>${heading(ch.title)}</strong><span aria-hidden="true">↗</span></a>`).join('');
    return part(id,label,'第 '+start+'–'+end+' 章',links,start===1);
  }).join('');
  const data=JSON.stringify(entries).replace(/</g,'\\u003c');
  const search=`<form class="search-box" role="search" onsubmit="return false"><label for="find">查题号或主题</label><input type="search" id="find" placeholder="例如：习题 7.8、豆浆、垄断" autocomplete="off"></form><div id="match-count" role="status" aria-live="polite"></div><section id="results" class="results" aria-label="搜索结果" hidden><ul id="matches"></ul></section>`;
  const script=`<script type="application/json" id="entries">${data}</script><script>
    ${revealHash}
    const entries=JSON.parse(document.getElementById('entries').textContent);
    const field=document.getElementById('find'),results=document.getElementById('results'),list=document.getElementById('matches'),statusText=document.getElementById('match-count'),groups=document.getElementById('topics');
    function runSearch(){
      const q=field.value.trim().toLowerCase().replace(/\\s+/g,'').replace(/^第/,'').replace(/^(章末题|题)(?=\\d)/,'习题');
      list.replaceChildren();groups.hidden=!!q;results.hidden=!q;statusText.textContent='';if(!q)return;
      const id=/^(习题|小节)?(\\d+\\.\\d+)$/.exec(q);
      const found=entries.filter(e=>id?e.label.split(' ')[1]===id[2]&&(!id[1]||e.label.startsWith(id[1])):/^\\d+章$/.test(q)?e.number===parseInt(q,10):(e.label+e.title+e.chapter+e.theme).toLowerCase().replace(/\\s+/g,'').includes(q));
      for(const e of found){const li=document.createElement('li'),a=document.createElement('a');a.href=e.url;a.textContent=e.label+'　'+e.title;li.append(a);list.append(li)}
      statusText.textContent=found.length?'找到 '+found.length+' 项':'换个题号或关键词试试。';
    }field.addEventListener('input',runSearch);window.addEventListener('pageshow',runSearch);
  </script>`;
  const intro='<header class="hub-head"><p class="eyebrow">Osborne–Rubinstein · 中级微观经济学</p><h1>全书随题图解</h1><p class="hub-lead">今天想弄懂哪个问题？</p><a href="formula-4h.html">转到 4h 速通公式版 →</a></header>';
  return page({title:'全书随题图解',main:`<div class="directory">${intro}${search}<div class="directory-parts" id="topics">${shelves}</div></div>`,scripts:script,footer:''});
}
module.exports={chapter,index};

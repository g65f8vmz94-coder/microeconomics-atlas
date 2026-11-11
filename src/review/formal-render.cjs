'use strict';
const {inline,escape,math} = require('../guided/format.cjs');
const {formula} = require('../guided/unit-flow.cjs');
const {urlFor} = require('../guided/catalog.cjs');
const outline=require('../book-outline.json');
const {textbookFigure}=require('./figures.cjs');
const records=['formal-1-7.json','formal-8-14.json','formal-15-20.json'].map(f=>require('./'+f));
const sections=Object.assign({},...records.map(r=>r.sections));
const claims=Object.assign({},...records.map(r=>r.claims));
const originals=new Map(outline.chapters.flatMap(c=>c.sections.map(s=>[s.id,s])));
function list(rows,ordered=false){const t=ordered?'ol':'ul';return `<${t} class="formal-${ordered?'steps':'conditions'}">${rows.map(r=>`<li>${inline(r)}</li>`).join('')}</${t}>`;}
function symbols(rows){rows=rows.filter(([tex],i)=>rows.findIndex(([other])=>other===tex)===i);return rows.length?`<div class="formal-symbols"><h4>符号含义</h4><dl>${rows.map(([tex,meaning])=>`<div><dt>${math(tex)}</dt><dd>${inline(meaning)}</dd></div>`).join('')}</dl></div>`:'';}
function sectionNotes(meta,open){
 const r=sections[meta.id];if(!r)throw Error('Missing formal section '+meta.id);
 const source=originals.get(meta.id);
 return `<details class="formal-section" id="section-${meta.id}"${open?' open':''}><summary><small>§ ${meta.id}</small><strong>${escape(meta.theme)}</strong></summary><div class="review-inside"><p class="formal-lead">${inline(r.summary)}</p><div class="formal-source">原书 §${meta.id} · 英文本印刷第 ${source.printedPage} 页起 · 本站整理</div><div class="formal-assumptions"><h4>适用条件</h4>${list(r.conditions)}</div><div class="formal-layout"><div>${r.formulas.length?`<h4>核心公式</h4>${r.formulas.map((f,i)=>`<div class="formal-equation"><span class="equation-index">${meta.id} · ${i+1}</span>${formula(f.tex)}<p>${inline(f.why)}</p></div>`).join('')}`:''}</div>${symbols(r.symbols)}</div><h4>推导顺序</h4>${list(r.derivation,true)}${textbookFigure(meta.id,r.figure)}<a class="formal-crosslink" href="${urlFor(meta.key)}">需要直觉时，切到本节生活理解版 →</a></div></details>`;
}
function claimNotes(meta){
 const r=claims[meta.id];if(!r)throw Error('Missing formal claim '+meta.id);
 const [kind,id]=meta.id.split(' ');
 return `<article class="claim formal-claim" id="${kind.toLowerCase()}-${id}"><small>${kind==='Lemma'?'引理':'命题'} ${id} · 英文本第 ${meta.printedPage} 页 · 本站整理</small><h3>${escape(r.title)}</h3><div class="formal-assumptions"><h4>前提</h4>${list(r.conditions)}</div><h4>结论</h4><p class="formal-result">${inline(r.statement)}</p><details class="claim-notation"><summary>本命题符号含义 · ${r.symbols.length} 项</summary>${symbols(r.symbols)}</details><h4>证明思路</h4>${list(r.steps,true)}<a class="formal-crosslink" href="${escape(meta.evidence[0].entry)}">查看对应模型图解 →</a></article>`;
}
function reviewControls(ch){return `<nav class="formal-jump" aria-label="本章小节">${ch.sections.map(m=>`<a href="#section-${m.id}">§${m.id} ${escape(m.theme)}</a>`).join('')}</nav><div class="formal-tools"><button type="button" data-review-expand hidden>展开全部小节</button><button type="button" data-review-collapse hidden>收起全部小节</button><span>命题证明直接列在小节之后；习题可按题号展开。</span></div><script>(function(){const sections=[...document.querySelectorAll('.formal-section')];function jump(){const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);if(target?.matches('details'))target.open=true;}function ready(){for(const [selector,open]of [['[data-review-expand]',true],['[data-review-collapse]',false]]){const button=document.querySelector(selector);if(!button)continue;button.hidden=false;button.addEventListener('click',()=>document.querySelectorAll('.formal-section').forEach(d=>d.open=open));}jump();}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();addEventListener('hashchange',jump);})();</script>`;}
module.exports={sectionNotes,claimNotes,reviewControls};

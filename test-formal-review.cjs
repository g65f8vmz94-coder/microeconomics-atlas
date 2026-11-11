'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {math,inline}=require('./src/guided/format.cjs');
const outline=require('./src/book-outline.json'),coverage=require('./coverage.json');
const sets=['1-7','8-14','15-20'].map(g=>require('./src/review/formal-'+g+'.json'));
const sections=Object.assign({},...sets.map(s=>s.sections)),claims=Object.assign({},...sets.map(s=>s.claims));
assert.deepEqual(Object.keys(sections).sort(),outline.chapters.flatMap(c=>c.sections.map(s=>s.id)).sort());
assert.deepEqual(Object.keys(claims).sort(),coverage.items.filter(i=>/^(Proposition|Lemma) /.test(i.id)).map(i=>i.id).sort());
let formulas=0,symbols=0,steps=0;
function clean(x){if(typeof x==='string')assert.doesNotMatch(x,/[\x00-\x1f]/,'control character in formal notes');else if(Array.isArray(x))x.forEach(clean);else if(x&&typeof x==='object')Object.values(x).forEach(clean);}
clean(sets);
for(const [id,r]of Object.entries({...sections,...claims})){
 assert(r.conditions.length>0,id+' conditions');assert(r.symbols.length>0,id+' symbols');
 for(const [tex,meaning]of r.symbols){assert(tex&&meaning);math(tex);inline(meaning);symbols++;}
 for(const f of r.formulas||[]){assert(f.tex&&f.why,id);math(f.tex);inline(f.why);formulas++;}
 const rows=r.derivation||r.steps;assert(rows.length>=3,id+' derivation');rows.forEach(inline);steps+=rows.length;
 for(const v of [r.summary,r.statement,...r.conditions].filter(Boolean))inline(v);
}
let figures=0;
for(let ch=1;ch<=20;ch++){
 const html=fs.readFileSync('dist/review-'+ch+'.html','utf8');
 assert(!/<merror>|katex-error|NaN/.test(html));assert(html.includes('符号含义'));
 const body=html.slice(html.indexOf('<section id="principles">'),html.indexOf('<section id="problems">'));
 assert.doesNotMatch(body,/豆浆|大妈|包子|米豆订单/,'life examples in theory');
 figures+=(html.match(/data-textbook-figure=/g)||[]).length;
 for(const section of outline.chapters[ch-1].sections)assert(html.includes('id="section-'+section.id+'"'));
}
const home=fs.readFileSync('dist/formula-4h.html','utf8');
const minutes=[...home.matchAll(/class="sprint-time">(\d+) 分钟/g)].map(m=>+m[1]);assert.equal(minutes.length,20);assert.equal(minutes.reduce((a,b)=>a+b,0),240);
assert.equal(figures,5);
console.log({sections:Object.keys(sections).length,claims:Object.keys(claims).length,formulas,symbolEntries:symbols,derivationSteps:steps,textbookFigures:figures,minutes:240});

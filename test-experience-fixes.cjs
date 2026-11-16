'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const compact=require('./src/compact-css.cjs');
const study=require('./src/study-state.js');
const {scopedSymbols}=require('./src/review/scoped-symbols.cjs');
const {catalog,loadChapters}=require('./src/guided/catalog.cjs');
const {proofRows,matchGivenItems}=require('./src/guided/unit-flow.cjs');
(async()=>{
 assert.match(compact('.guide :is(a,button):focus-visible { color: red; }'),/\.guide :is/);
 assert.match(compact('.x{content:"a  b : c";width:calc(100% - 2px)}'),/"a  b : c"/);
 assert.match(compact('.x{width:calc(100% - 2px)}'),/100% - 2px/);
 const vars=[['r','rate'],['m','income'],['p','price'],['C','cost'],['MC','marginal'],['y_i','quantity'],['y_i^*','optimum']];
 assert.deepEqual(scopedSymbols('\\frac{m}{p}',vars).map(x=>x[0]),['m','p']);
 assert.deepEqual(scopedSymbols('MC(y_i)',vars).map(x=>x[0]),['MC','y_i']);
 assert.deepEqual(scopedSymbols('y_i^*',vars).map(x=>x[0]),['y_i^*']);
 const original={units:{'s7.4':{status:'confused'}}};
 const migrated=study.migrate(original,{'7.4':{practiced:true},'1.1':{opened:true},'2.1':{practiced:true}});
 assert.equal(migrated.units['s7.4'].status,'confused');
 assert.equal(migrated.units['s1.1'].status,'seen');assert.equal(migrated.units['s2.1'].status,'done');
 assert.deepEqual(study.migrate(migrated,{'7.4':{practiced:true}}),migrated);
 const wrong=study.attempt({},1,false),correct=study.attempt(JSON.parse(JSON.stringify(wrong)),0,true);
 assert.equal(correct.firstCorrect,false);assert.equal(study.verdict(correct),'订正后通过');
 const assisted=study.attempt(study.exposure({},'answerViewed'),0,true);
 assert.equal(assisted.firstIndependent,false);assert.equal(study.verdict(assisted),'看过做法后通过');
 assert.equal(study.attempt(study.exposure({},'hintViewed'),0,true).firstIndependent,false);
 const memory=study.create(()=>{throw Error('blocked');});memory.write({...memory.read(),last:{key:'s7.4'}});assert.equal(memory.read().last.key,'s7.4');
 assert.deepEqual(matchGivenItems(['收入10元','价格2元'],'无关内容'),[]);
 const chapters=catalog(require('./coverage.json')),units=Object.assign({},...await loadChapters(chapters));
 let aliases=0;
 for(const [key,unit]of Object.entries(units))for(const row of proofRows(unit)){
   assert.equal(row.fragments.join(''),row.why);
   for(const alias of row.legacyAnchors){
     const before=row.fragments.slice(0,alias.fragment).join('').length;
     const after=before+row.fragments[alias.fragment].length;
     const offset=row.why.indexOf(alias.text);assert.ok(offset>=before&&offset<after,key+' '+alias.id);aliases++;
   }
 }
 const tasks=require('./src/review/sprint-tasks.cjs');assert.equal(Object.keys(tasks).length,20);
 for(const ch of chapters){const t=tasks[ch.number];assert.ok(ch.sections.some(s=>s.id===t.condition));assert.ok(ch.sections.some(s=>s.id===t.derivation));assert.ok(ch.problems.some(p=>p.id===t.problem));assert.ok(t.reason.length>10);}
 console.log(JSON.stringify({passed:true,legacyAnchors:aliases,chapters:20,regressions:'R01,R02,R04,R05,R06,R07,R09'}));
})().catch(e=>{console.error(e);process.exitCode=1});

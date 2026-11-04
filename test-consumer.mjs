import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
import * as m from './src/consumer.mjs';
let checks=0;const ok=(v,msg)=>{checks++;assert.ok(v,msg)},eq=(x,y,tol=1e-7)=>ok(Math.abs(x-y)<tol,`${x} != ${y}`);
// Global utility comparison against independent samples of the whole boundary
// and the interior. This also checks the nonmonotone satiation example.
for(const model of ['cd','product','linear','complement','quasi','ideal','giffen','max','quadratic'])for(const p of [.5,1,1.5,2,4])for(const q of [.5,1,2,4])for(const w of [.5,4,10,12,24]){
 const r=m.demandC(model,p,q,w,.3);ok(r.bundle.every(x=>x>=-1e-8));ok(r.spending<=w+1e-7);if(model!=='ideal')eq(r.spending,w);
 for(let i=0;i<=40;i++)for(const fill of [.5,1]){const x=w/p*i/40*fill,y=(w-p*(w/p*i/40))/q*fill;ok(m.utilityC(model,x,y,.3)<=r.u+1e-7,model+' globally optimal');}
}
for(const rule of ['cheaper','equal','half','cap','expensive'])for(const p of [.5,1,2])for(const q of [.5,1,2])for(const w of [1,7,12,24])for(const l of [.25,2,4]){
 const r=m.demandC(rule,p,q,w),scaled=m.demandC(rule,l*p,l*q,l*w);eq(r.spending,w);r.bundle.forEach((x,i)=>eq(x,scaled.bundle[i]));
}
eq(m.demandC('cap',1,1,12).bundle[0],7);eq(m.demandC('cap',1,1,4).bundle[1],0);
ok(m.rationalizationC('cheaper','linear',1,1,12).globalKnown);
ok(!m.rationalizationC('cheaper','max',1,1,12).currentConsistent);
ok(!m.rationalizationC('cheaper','quadratic',1,1,12).currentConsistent);
for(const p of [.5,1,2,4])for(const q of [.5,1,2,4])for(const w of [1,4,12]){
 ok(m.rationalizationC('cheaper','linear',p,q,w).currentConsistent);ok(m.rationalizationC('half','product',p,q,w).currentConsistent);
}
const warp=m.sourceWarp();ok(m.warpC(warp.first,warp.second).violation);
ok(!m.warpC({prices:[1,1],w:2,bundle:[2,0]},{prices:[1,1],w:2,bundle:[0,2]}).violation);
ok(!m.warpC({prices:[1,1],w:2,bundle:[2,0]},{prices:[2,1],w:4,bundle:[2,0]}).violation);
// Rational choice must not generate strict revealed-preference cycles.
for(const model of ['cd','product','linear','complement','quasi','giffen'])for(const p of [.5,1,1.5,2,4])for(const w of [1,4,10,12,24]){
 const a=m.demandC(model,p,1,w),b=m.demandC(model,2,1,12);ok(!m.warpC({prices:[p,1],w,bundle:a.bundle},{prices:[2,1],w:12,bundle:b.bundle}).violation);
}
// Hicks expenditure: reaches target, and no sampled cheaper bundle attains it.
for(const model of ['cd','product','linear','complement','quasi','giffen'])for(const p of [.5,1,1.5,2,4])for(const w of [1,4,10,12,24]){
 const old=m.demandC(model,1,1,w,.3),h=m.hicksC(model,p,1,old.u,.3);eq(m.utilityC(model,...h.bundle,.3),old.u);eq(h.expenditure,p*h.bundle[0]+h.bundle[1]);
 for(let i=0;i<=40;i++){const cost=h.expenditure*(1-1e-5),x=cost/p*i/40,y=cost-p*x;ok(m.utilityC(model,x,y,.3)<old.u+1e-8,'Hicks cost is minimal');}
 for(const method of ['slutsky','hicks']){const r=m.slutskyC(model,1,p,1,w,.3,method);eq(r.sub+r.income,r.total);if(p>1)ok(r.sub<1e-7,'compensated own-price direction');if(p<1)ok(r.sub> -1e-7);if(method==='hicks')eq(r.B.u,r.A.u);else eq(r.wealth,p*r.A.bundle[0]+r.A.bundle[1]);}
}
for(const p of [1.1,1.3,1.5,1.9])for(const w of [8,10,11])if(w>4*p){const r=m.localDerivativesC('giffen',p,1,w);ok(r.own>0&&r.income<0);eq(r.own,(12-w)/(3-p)**2);eq(r.income,-1/(3-p));eq(r.compensated,0);eq(r.identity,0);}
for(const model of ['cd','quasi','product','complement'])for(const p of [.6,1.3,3.7])for(const w of [1,8,24]){const r=m.localDerivativesC(model,p,1,w,.3);ok(!r.jump);eq(r.identity,0,1e-5);}
const corner=m.demandC('quasi',3,1,1);eq(corner.bundle[0],0);ok(m.mrsC('quasi',...corner.bundle)<=3);
for(const model of ['cd','quasi'])for(const p of [.5,2,4])for(const w of [1,4,12]){const r=m.normalMRSC(model,p,1,w,4);ok(r.next.bundle[0]>=r.old.bundle[0]-1e-8);ok(r.mrsVertical>=r.mrsOld-1e-8);}
for(const endowed of [false,true]){const r=m.budgetC(2,3,12,2,endowed);r.current.forEach((x,i)=>eq(x,r.scaled[i]));if(endowed)eq(r.wealth,20);}
const ex=m.existenceCounter(.999);ok(ex.nextUtility>ex.utility&&ex.nextUtility<ex.supremum);eq(m.demandC('ideal',1,1,12).spending,6);
for(let i=1;i<=6;i++){const html=fs.readFileSync(`dist/downloads/lesson-5-${i}.html`,'utf8'),scripts=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];ok(scripts.length===1);ok(!/^import /m.test(scripts[0][1]));const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:scripts[0][1],encoding:'utf8'});ok(r.status===0,r.stderr);ok(!/<script[^>]+src=/.test(html));}
fs.writeFileSync('qa/consumer-models.json',JSON.stringify({passed:true,checks,scope:'Nine global optimization models; five rules homogeneity; original cap7 and tie counterexamples; rational WARP and double equality; independent Hicks cost samples; both compensation decompositions; Giffen derivative/Slutsky identity; corner MRS; normal-good geometry; satiation/nonexistence; six self-contained module syntax checks'},null,2));console.log({passed:true,checks});

import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';import * as m from './src/economy.mjs';
let checks=0;const ok=(v,msg)=>{checks++;assert.ok(v,msg)},eq=(x,y)=>ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);
for(const alpha of [.5,1,4,8,10])for(const beta of [.5,1,4,8,10])for(const kind of ['substitutes','complements','product'])for(const t of [0,.1,.5,.9,1])for(const share of [0,.5,1]){
 const r=m.textbookExchange(kind,{alpha,beta,t,share,trade:share*Math.min(alpha,beta)});
 if(r.status==='unbounded'){ok((t===0||t===1)&&kind!=='complements');continue}
 r.bundles.forEach((a,i)=>{ok(a.every(x=>x>=0));eq(r.spending[i],r.wealth[i]);
  // Independently sample the entire positive-price budget boundary, not the
  // formula used by the implementation, and compare utility maxima.
  if(t>0&&t<1)for(let j=0;j<=20;j++){const x=r.wealth[i]/t*j/20,y=(r.wealth[i]-t*x)/(1-t),u=kind==='substitutes'?x+y:kind==='product'?x*y:Math.min(x,y);ok(u<=r.utility[i]+1e-7,'chosen demand globally optimal');}
 });eq(r.walras,0);
 if(kind==='substitutes')ok(r.clears===(t===.5));if(kind==='complements')ok(r.clears===(alpha===beta||t===0&&alpha>beta||t===1&&beta>alpha));
}
for(const kind of ['substitutes','complements','product'])for(const alpha of [.5,1,4,8,10])for(const beta of [.5,1,4,8,10]){const t=kind==='substitutes'?.5:kind==='product'?beta/(alpha+beta):alpha>beta?0:alpha<beta?1:.5;ok(m.textbookExchange(kind,{alpha,beta,t,trade:0}).clears);}
const d=m.destroyedEndowment(2);eq(d.original.utility[0],0);eq(d.after.utility[0],2);ok(d.after.clears&&d.gain>0);
for(const gamma of [.1,2,3.9,4,4.1,8])ok(m.destroyedEndowment(gamma).after.clears);
for(const symmetric of [false,true])for(const t of [.1,.5,.9])for(let a=0;a<2;a++)for(let b=0;b<2;b++){const r=m.nonconvexExchange(symmetric,t,a,b);r.bundles.forEach(([x,y],i)=>{const u=x*x+y*y,w=r.wealth[i];for(let j=0;j<=40;j++){const q=w/t*j/40,z=(w-t*q)/(1-t);ok(q*q+z*z<=u+1e-7);}});if(symmetric)ok(!r.clears);}
ok(m.nonconvexExchange(false,.5,0,1).clears);
for(let j=1;j<100;j++){const t=j/100,r=m.fourPersonCore(t);for(let k=0;k<2;k++)eq(r.allocation.reduce((v,a)=>v+a[k],0),2);if(t<.5){const w=m.fourPersonCore(t,r.witness);ok(w.blocking);for(let k=0;k<2;k++)eq(w.proposal.reduce((v,a)=>v+a[k],0),w.resources[k]);}else if(t>.5)ok(r.singletonBlock&&r.utilities[2]<1);else ok(r.inCore);}
const core=m.fourPersonCore(.1,.2);eq(core.after[0],.2);eq(core.after[2],2.2);ok(core.blocking&&core.individuallyRational&&core.paretoStable);
for(let j=0;j<=20;j++){const r=m.externalityExchange(.8,j/20);eq(r.A[0]+r.B[0],1);eq(r.A[1]+r.B[1],1);if(j)ok(r.gains.every(x=>x>0));ok(r.endowmentIsEquilibrium);}ok(!m.externalityExchange(.5).endowmentIsEquilibrium);ok(!m.externalityExchange(1.1).endowmentIsEquilibrium);
for(const alpha of [1,4,8])for(const beta of [1,4,8])for(const p of [.1,.25,.5,1,2,4]){const r=m.nonrationalDemand(alpha,beta,p);r.bundles.forEach((a,i)=>eq(p*a[0]+a[1],i?beta:p*alpha));ok(r.clears===(p>=1||Math.abs(p-beta/alpha)<1e-9));}
for(const k of [.2,1,3,5]){const r=m.linearReport(k);eq(r.allocation[0][0]+r.allocation[1][0],1);eq(r.allocation[0][1]+r.allocation[1][1],1);eq(k*r.allocation[0][0]+r.allocation[0][1],k);eq(k*r.allocation[1][0]+r.allocation[1][1],1);eq(r.trueUtilities[0],r.allocation[0][0]+r.allocation[0][1]);if(k>1)ok(r.gain>0);}eq(m.linearReport(3).trueUtilities[0],1.5);
for(let j=-8;j<=8;j++)for(const a of [1,2,5]){const p=a*10**j,r=m.multipleExcess(p);ok(r.demand.every(x=>x>=0));eq(p*r.demand[0]+r.demand[1],5*p+5);eq(2*r.demand[0]-10,r.z);}for(const p of [1,2,3])eq(m.multipleExcess(p).z,0);
for(const delta of [0,.2,1])for(const n of [1,2,4])for(const all of [false,true]){const r=m.spendingContradiction(delta,n,all);eq(r.proposedCost-r.baselineCost,2*delta*(all?n:1));}
for(let n=1;n<=9;n++){const html=fs.readFileSync(`dist/downloads/lesson-10-${n}.html`,'utf8'),module=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)][0]?.[1];ok(!!module);ok(!/^import /m.test(module),'standalone has no imports');const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:module,encoding:'utf8'});ok(r.status===0,r.stderr);}
fs.writeFileSync('qa/exchange-cases-models.json',JSON.stringify({passed:true,checks,scope:'Source examples10.1–10.6, zero-price and nonconvex boundaries,4-person coalition resource/utility witnesses, externality, budget-balanced multi-root construction, nine standalone script syntax checks'},null,2));console.log({passed:true,checks});

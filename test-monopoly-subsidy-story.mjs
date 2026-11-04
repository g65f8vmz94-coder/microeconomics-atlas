import assert from 'node:assert/strict';
import {linearM,subsidyM,subsidyTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const m=linearM(),frames=Array.from({length:5},(_,i)=>subsidyTeachingM(m,i));
near(frames[0].t,0);near(frames[0].q,m.qm);near(frames[2].q,m.qc);near(frames[4].q,m.qc);assert.ok(frames[3].q>m.qc);assert.ok(frames[3].netWelfare<frames[2].netWelfare);assert.ok(frames[4].consumerGain>0);assert.ok(frames[4].netConsumerGain<0);
let checks=0;
for(const p of [{a:100,b:1,c:20,k:.4},{a:10,b:1,c:0,k:0},{a:80,b:2,c:75,k:1.5},{a:20,b:1,c:25,k:0}]){
 const z=linearM(p);for(let i=0;i<=400;i++){
  const f=subsidyTeachingM(z,i/100),r=subsidyM(z,f.t),base=subsidyM(z,0);
  near(f.q,r.q);near(f.price,z.P(f.q));near(f.fiscal,f.t*f.q);near(f.profit,z.profit(f.q)+f.fiscal);near(f.netWelfare,z.TS(f.q));near(f.profit+f.consumerSurplus-f.fiscal,f.netWelfare);
  if(z.qc>0){near(f.consumerGain,f.consumerSurplus-base.consumerSurplus);near(f.netConsumerGain,f.consumerGain-f.fiscal);}
  for(let j=0;j<=20;j++)assert.ok(z.profit(z.choke*j/20)+f.t*z.choke*j/20<=f.profit+1e-6);
  checks++;
 }
}
const cap=linearM({a:10,b:1,c:0,k:0});near(subsidyTeachingM(cap,3).q,cap.choke);assert.match(subsidyTeachingM(cap,3).narration,/未超过社会最优/);
const shut=subsidyTeachingM(linearM({a:20,b:1,c:25,k:0}),0);near(shut.q,0);assert.match(shut.narration,/社会最优产量为零/);
console.log(JSON.stringify({passed:true,parameterSets:4,continuousStates:checks,gridComparisons:checks*21,fundingAndBoundaries:true}));

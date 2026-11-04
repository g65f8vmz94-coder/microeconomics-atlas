import assert from 'node:assert/strict';
import {linearM,welfareM,welfareTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const m=linearM(),f=Array.from({length:4},(_,i)=>welfareTeachingM(m,i));
near(f[0].q,m.qm);near(f[1].q,(m.qm+m.qc)/2);near(f[2].q,m.qc);near(f[3].q,m.qm);
assert.ok(f[0].dwl>f[1].dwl&&f[1].dwl>f[2].dwl-1e-8);near(f[2].dwl,0);
for(let j=0;j<=300;j++){
 const x=welfareTeachingM(m,j/100),r=welfareM(m,x.q);
 assert.ok(x.q>=m.qm-1e-8&&x.q<=m.qc+1e-8);near(x.cs,r.cs);near(x.profit,r.profit);near(x.ts,r.ts);near(x.dwl,r.dwl);near(x.cs+x.profit,x.ts);
 // The geometric gold area between demand and marginal cost equals welfare loss.
 near(x.dwl,(m.P(x.q)-m.MC(x.q))*(m.qc-x.q)/2);
}
const noTrade=welfareTeachingM(linearM({a:10,b:1,c:12,k:.4}),2);assert.equal(noTrade.q,0);near(noTrade.dwl,0);assert.match(noTrade.narration,/没有正的/);
console.log(JSON.stringify({passed:true,frames:4,transitionSamples:301,qMonopoly:m.qm,qEfficient:m.qc,deadweightLoss:f[0].dwl,boundaryChecked:true}));

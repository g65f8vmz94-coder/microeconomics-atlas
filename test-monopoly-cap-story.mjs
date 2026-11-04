import assert from 'node:assert/strict';
import {linearM,capM,capTeachingM} from './src/monopoly.mjs';
const m=linearM(),near=(a,b,eps=1e-7)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);
const frames=Array.from({length:5},(_,i)=>capTeachingM(m,i));
near(frames[0].q,m.qm);near(frames[1].q,m.qm);near(frames[2].q,m.qc);near(frames[4].q,m.qc);
assert.ok(frames[3].q<m.qm);assert.ok(frames[3].cap<frames[2].cap);
for(let i=0;i<=400;i++){
 const r=capTeachingM(m,i/100),exact=capM(m,r.cap),h=1e-5;
 near(r.q,exact.q);near(r.profit,exact.profit);near(r.price,r.priceAt(r.q));
 for(let j=0;j<=1000;j++)assert.ok(r.profit+1e-7>=r.profitAt(m.choke*j/1000),'global profit');
 if(r.kink>h&&r.kink<m.choke-h){
  near((r.priceAt(r.kink-h)*(r.kink-h)-r.priceAt(r.kink-2*h)*(r.kink-2*h))/h,r.cap,1e-5);
  near((r.priceAt(r.kink+2*h)*(r.kink+2*h)-r.priceAt(r.kink+h)*(r.kink+h))/h,m.MR(r.kink),1e-4);
 }
}
const flat=linearM({k:0}),flatResult=capM(flat,flat.c);
near(flatResult.optimalInterval[0],0);near(flatResult.optimalInterval[1],flat.qc);
assert.equal(capTeachingM(flat,2).title,'先检查模型边界');
assert.equal(capTeachingM(linearM({a:20,c:30}),2).q,0);
console.log(JSON.stringify({passed:true,frames:5,transitionSamples:401,profitGridChecks:401401,flatBoundaryChecked:true}));

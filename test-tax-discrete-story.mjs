import assert from 'node:assert/strict';
import {taxDiscreteM,taxDiscreteTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const frames=Array.from({length:5},(_,i)=>taxDiscreteTeachingM(i));
near(frames[0].tax,0);assert.equal(frames[0].outcome.after.q,2);near(frames[0].outcome.after.price,.6);
near(frames[1].tax,.1);assert.equal(frames[1].outcome.after.q,2);near(frames[1].outcome.after.profit,1);
near(frames[2].tax,.25);assert.equal(frames[2].outcome.after.q,1);near(frames[2].outcome.after.profit,.75);near(frames[2].outcome.rise,.4);assert.ok(frames[2].outcome.overshift);
near(frames[3].tax,1.1);assert.equal(frames[3].outcome.after.q,0);assert.equal(frames[3].outcome.after.price,null);assert.equal(frames[3].outcome.rise,null);
assert.equal(frames[4].outcome.after.q,1);
for(let i=0;i<=400;i++){
 const f=taxDiscreteTeachingM(i/100),r=taxDiscreteM(.6,f.tax);assert.equal(f.outcome.after.q,r.after.q);near(f.outcome.after.profit,Math.max(0,1-f.tax,2*(.6-f.tax)));assert.equal(f.outcome.after.price,r.after.price);
}
assert.deepEqual(taxDiscreteM(.6,.2).after.qs,[1,2]);assert.equal(taxDiscreteM(.6,.2).after.q,2);
assert.deepEqual(taxDiscreteM(.6,1).after.qs,[0,1]);assert.equal(taxDiscreteM(.6,1).after.q,1);
assert.equal(taxDiscreteM(.6,1.001).after.price,null);assert.equal(taxDiscreteM(.6,.4).overshift,false);
let general=0;
for(const v of [.51,.55,.6,.65])for(let i=1;i<=99;i++){
 const low=2*v-1,high=1-v,t=low+(high-low)*i/100,r=taxDiscreteM(v,t);
 assert.equal(r.before.q,2);assert.equal(r.after.q,1);assert.ok(r.overshift);near(r.rise,1-v);general++;
}
console.log(JSON.stringify({passed:true,continuousStates:401,strictGeneralCases:general,switchAndShutdownTies:true,noPriceWhenStopped:true}));

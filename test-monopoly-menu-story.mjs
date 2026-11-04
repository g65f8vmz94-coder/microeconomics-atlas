import assert from 'node:assert/strict';
import {menuM,menuTeachingM,menuOutcomeM} from './src/monopoly.mjs';
const z=menuM('standard'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
near(z.qstar,.625);near(z.ml,.7421875);near(z.mh,1.3703125);
near(z.high,1.8);near(z.pool,2);near(z.separate,2.1125);
for(let j=0;j<=1000;j++){
 const q=j/1000,ps=z.prices(q),revenue=ps.ml+ps.mh;
 near(revenue,1.8+q-.8*q*q);
 assert.ok(revenue<=z.separate+1e-8);
}
const f=Array.from({length:5},(_,i)=>menuTeachingM(z,i));
assert.equal(f[0].outcome.H.chosen,1);
assert.equal(f[0].outcome.L.chosen,1);
assert.ok(f[0].outcome.icH<0);
assert.equal(f[1].outcome.H.chosen,2);
assert.deepEqual(f[1].outcome.H.tied,[1,2]);
assert.deepEqual(f[1].outcome.L.tied,[0,1]);
near(f[1].outcome.icH,0);near(f[1].outcome.irL,0);
assert.ok(f[2].outcome.rent<f[1].outcome.rent);
near(f[3].outcome.profit,z.separate);
assert.ok(z.separate>z.high&&z.separate>z.pool);
for(let j=0;j<=400;j++){
 const r=menuTeachingM(z,j/100),real=menuOutcomeM(z,r.q,r.ml,r.mh,'seller');
 near(real.profit,r.outcome.profit);near(real.irL,0);
 for(const [consumer,V] of [[real.H,z.VH],[real.L,z.VL]]){
  near(consumer.best,Math.max(0,V(r.q)-r.ml,V(1)-r.mh));
  near(consumer.payment,consumer.chosen===0?0:consumer.chosen===1?r.ml:r.mh);
 }
}
const buyer=menuOutcomeM(z,f[1].q,f[1].ml,f[1].mh,'buyer');
assert.equal(buyer.H.chosen,1);assert.equal(buyer.L.chosen,0);
assert.ok(buyer.profit<f[1].outcome.profit);
console.log(JSON.stringify({passed:true,frames:5,transitionSamples:401,indifferentChoiceChecked:true}));

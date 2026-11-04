import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
assert.equal(consumerStories.budget.frames.length,7);
const f=Array.from({length:7},(_,i)=>consumerFrame('budget',i).state);
near(f[0].w/f[0].p,6);near(f[0].w/f[0].q,12);
near(f[2].w/f[2].p,6);near(f[2].w/f[2].q,12);
near(f[4].w,16);near(f[4].p*4+f[4].q*4,16);
near(f[6].w/f[6].p,4);near(f[6].w/f[6].q,12);
assert.ok(2*3+4<=12);assert.ok(2*5+4>12);
for(let i=1;i<100;i++){
 const t=i/100,scale=consumerFrame('budget',1+t).state;
 near(scale.w/scale.p,6);near(scale.w/scale.q,12);
 for(const phase of [2+t,3+t,4+t]){const e=consumerFrame('budget',phase).state;assert.deepEqual(e.endowment,[4,4]);near(e.w,e.p*4+e.q*4);}
 const cash=consumerFrame('budget',5+t).state;near(cash.w,12);near(cash.q,1);near(cash.p,2+t);near(cash.w/cash.q,12);
}
console.log(JSON.stringify({passed:true,frames:7,transitionSamples:495,initialIntercepts:[6,12],cashAfterRise:[4,12],endowment:[4,4]}));

import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {costsP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const z=costsP({F:0,c:1,k:1});
assert.equal(producerStories.costs.frames.length,7);
for(const [i,y] of [[3,2],[4,.5],[5,.05],[6,.05]]){const f=producerFrame('costs',i);near(f.state.y,y);near(z.AC(y),1+y/2);near(z.MC(y),1+y);assert.ok(producerReadout('costs',f).includes('平均'));}
let n=0,last=2;for(let b=3;b<5;b++)for(let i=1;i<=100;i++){const f=producerFrame('costs',b+i/100),y=f.state.y;assert.ok(y>0&&y<=last+1e-12);near(z.AC(y)-1,y/2);near(z.MC(y)-1,y);last=y;n++}
for(const phase of [.5,1.5,2.5,5.5])assert.ok(producerFrame('costs',phase));
assert.equal(z.AC(0),Infinity);near(z.C(0),0);near(z.MC(0),1);
const withFee=costsP({F:4,c:1,k:1});assert.ok(withFee.AC(.001)>4000);
console.log(JSON.stringify({passed:true,frames:7,transitionStates:n,zeroUndefined:true,fixedCostContrast:true}));

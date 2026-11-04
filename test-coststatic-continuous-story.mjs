import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {costStaticsP,costsP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(producerStories.coststatic.frames.length,3);
for(const [p,qpi,qout] of [[0,3,6],[1,5,10],[2,7,14]]){const f=producerFrame('coststatic',p),s=f.state,z=costStaticsP({p:s.p??4,newP:s.effectiveP??(s.case==='price'?s.newP:s.p??4),c:1,k:1,F:0,factor:s.effectiveFactor??(s.case==='tech'?s.factor:1)});near(z.after.qProfit,qpi);near(z.after.qOutput,qout);assert.ok(producerReadout('coststatic',f).includes(String(qout)));}
let checks=0;for(let b=0;b<2;b++)for(let i=1;i<100;i++){const t=i/100,s=producerFrame('coststatic',b+t).state,p=s.effectiveP,k=s.effectiveFactor,z=costStaticsP({p:4,newP:p,c:1,k:1,F:0,factor:k});assert.ok(p>=4&&p<=6&&k>=.5&&k<=1);near(z.after.MC(z.after.qProfit),p);near(z.after.AC(z.after.qOutput),p);near(z.after.profit(z.after.qOutput),0);if(b===1&&t<.5)near(k,1);if(b===1&&t>=.5)near(p,4);checks++;}
const old=costsP({F:0,c:1,k:1,p:4}),changed=costsP({F:100,c:.5,k:.5,p:4});near(old.qProfit,3);near(changed.qProfit,0);assert.ok(changed.MC(3)<old.MC(3));
console.log(JSON.stringify({passed:true,transitionStates:checks,priceResetChecked:true,fixedCostCounterexample:true}));

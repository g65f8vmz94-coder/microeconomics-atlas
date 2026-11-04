import assert from 'node:assert/strict';
import {producerFrame} from './src/producer-story.mjs';
import {shiftedP,finitePlansP,planChoiceP} from './src/producer.mjs';

const model=shiftedP({A:2,b:0,p:2,w:1});let checks=0;
for(let i=1;i<200;i++){
 const phase=i/100,frame=producerFrame('profit',phase),a=frame.state.trial;
 assert.ok(a>=1&&a<=16);assert.ok(Math.abs(model.profit(a)-(4*Math.sqrt(a)-a))<1e-10);
 assert.ok(model.profit(a)<=model.profit(4)+1e-10);
 if(phase<1)assert.ok(a<4);else if(phase>1)assert.ok(a>4);
 checks+=4;
}
assert.equal(producerFrame('profit',0).state.trial,1);
assert.equal(producerFrame('profit',1).state.trial,4);
assert.equal(producerFrame('profit',2).state.trial,16);
assert.equal(model.profit(1),3);assert.equal(model.profit(4),4);assert.equal(model.profit(16),0);
assert.equal(model.p*model.mp(4),model.w);
// At a zero corner a derivative equality is not required: all positive inputs lose.
const zero=shiftedP({A:1,b:1,p:1,w:2});
assert.equal(zero.aProfit,0);for(const a of [.01,.1,1,10])assert.ok(zero.profit(a)<0);
let priceComparisons=0;
for(let i=1;i<=20;i++)for(let j=i+1;j<=21;j++)for(const w of [.5,1,2]){
 const low=planChoiceP(i/10,w),high=planChoiceP(j/10,w);
 for(const x of low.winners)for(const y of high.winners){
  assert.ok(finitePlansP[y].y>=finitePlansP[x].y-1e-9);
  assert.ok(finitePlansP[y].a>=finitePlansP[x].a-1e-9);priceComparisons++;
 }
}
console.log(JSON.stringify({passed:true,continuousFrames:199,checks,maximizer:4,profit:4,zeroCorner:true,priceComparisons}));

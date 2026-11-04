import assert from 'node:assert/strict';
import {producerGoalsP} from './src/producer.mjs';
import {producerFrame, producerReadout} from './src/producer-story.mjs';
const plans=producerGoalsP().plans;
assert.deepEqual(plans.map(x=>x.N),[0,50,65,100,144,170,196]);
assert.deepEqual(plans.map(x=>x.profit),[-8,1,1.5,2,1.6,1,.4]);
for (const [i,N] of [100,144,196].entries()) {
 const f=producerFrame('goals',i), z=producerGoalsP(f.state.lambda);
 assert.deepEqual(z.winners.map(x=>x.N),[N]);
 assert.ok(producerReadout('goals',f).includes(String(N)));
}
let last=0;
for(let k=0;k<=1000;k++){
 const z=producerGoalsP(k/10000), first=z.winners[0].N;
 assert.ok(first>=last);last=first;
}
const tie=producerGoalsP(.4/44);
assert.deepEqual(tie.winners.map(x=>x.N),[100,144]);
for(let k=0;k<=1000;k++){
 const phase=2*k/1000,frame=producerFrame('goals',phase),lambda=frame.state.lambda;
 const ranked=plans.map(x=>({N:x.N,value:x.profit-lambda*(196-x.N)}));
 const best=Math.max(...ranked.map(x=>x.value));
 assert.deepEqual(producerGoalsP(lambda).winners.map(x=>x.N),ranked.filter(x=>Math.abs(x.value-best)<1e-8).map(x=>x.N));
 if(k>0&&k<1000)assert.match(frame.narration,/假想|自主/);
}
const secondTie=.6/26;
assert.deepEqual(producerGoalsP(secondTie).winners.map(x=>x.N),[144,170,196]);
assert.deepEqual(producerGoalsP(producerFrame('goals',secondTie/.015).state.lambda).winners.map(x=>x.N),[144,170,196]);
console.log(JSON.stringify({passed:true,sourcePlans:plans.length,frames:3,weightCases:1001,transitionCases:1001,firstTie:[100,144],secondTie:[144,170,196]}));

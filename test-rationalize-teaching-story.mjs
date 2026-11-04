import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {demandC,rationalizationC,utilityC,warpC} from './src/consumer.mjs';

const frames=consumerStories.rationalize.frames;
assert.equal(frames.length,6);
for(const [i,rule,candidate,p,q,w,choice] of [
 [0,'cheaper','linear',1,2,12,[12,0]],
 [1,'cheaper','linear',1,2,12,[12,0]],
 [2,'half','product',2,1,12,[3,6]],
 [4,'cheaper','linear',1,1,12,[6,6]],
 [5,'cheaper','max',1,1,12,[6,6]]
]){
 const s=frames[i].state;assert.equal(s.rule,rule);assert.equal(s.candidate,candidate);
 assert.equal(s.p,p);assert.equal(s.q,q);assert.equal(s.w,w);
 assert.deepEqual(demandC(rule,p,q,w).bundle,choice);
}
let checked=0;
for(const p of [.5,1,2,3,5])for(const q of [.5,1,2,3,5])for(const w of [1,3,12,20]){
 const cheaper=rationalizationC('cheaper','linear',p,q,w);
 const half=rationalizationC('half','product',p,q,w);
 assert.ok(cheaper.currentConsistent&&half.currentConsistent);
 assert.ok(Math.abs(cheaper.observed.spending-w)<1e-8&&Math.abs(half.observed.spending-w)<1e-8);
 checked++;
}
const max=rationalizationC('cheaper','max',1,1,12),square=rationalizationC('cheaper','quadratic',1,1,12);
assert.equal(max.currentConsistent,false);assert.equal(max.observedUtility,6);assert.equal(max.optimal.u,12);
assert.equal(square.currentConsistent,false);assert.equal(square.observedUtility,72);assert.equal(square.optimal.u,144);
const samePrice=rationalizationC('cheaper','linear',1,1,12);
assert.equal(samePrice.currentConsistent,true);assert.equal(utilityC('linear',12,0),12);assert.equal(utilityC('linear',6,6),12);
const first={prices:[1,2],w:12,bundle:demandC('expensive',1,2,12).bundle},second={prices:[2,1],w:12,bundle:demandC('expensive',2,1,12).bundle};
const contradiction=warpC(first,second);assert.equal(contradiction.validObservation,true);assert.equal(contradiction.violation,true);assert.deepEqual(contradiction.cross,[6,6]);
for(let k=1;k<100;k++){const t=k/100,s=consumerFrame('rationalize',t).state;assert.equal(s.rule,'cheaper');assert.ok(Math.abs(s.reveal-t)<1e-12);}
for(let i=1;i<5;i++)for(const t of [.2,.5,.8])assert.deepEqual(consumerFrame('rationalize',i+t).state,frames[i].state);
console.log(JSON.stringify({passed:true,frames:6,positiveBudgetCases:checked,revealSamples:99,tieMax:[6,12],tieQuadratic:[72,144]}));

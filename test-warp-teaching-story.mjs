import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {sourceWarp,warpC} from './src/consumer.mjs';

const frames=consumerStories.warp.frames;
assert.equal(frames.length,5);
const {first,second}=sourceWarp(),source=warpC(first,second);
assert.equal(source.validObservation,true);assert.equal(source.violation,true);
assert.deepEqual(source.cross,[1,1]);assert.deepEqual(source.strict,[true,true]);
const tieA={prices:[1,1],w:1,bundle:[0,1]},tieB={prices:[1,1],w:1,bundle:[1,0]};
const tie=warpC(tieA,tieB);
assert.equal(tie.validObservation,true);assert.equal(tie.violation,false);
assert.deepEqual(tie.cross,[1,1]);assert.deepEqual(tie.strict,[false,false]);
for(const [a,b,expected] of [[first,tieB,[true,false]],[tieA,second,[false,true]]]){
 const result=warpC(a,b);assert.equal(result.validObservation,true);assert.equal(result.violation,true);assert.deepEqual(result.strict,expected);
}
const tiebreakUtility=([x,y])=>x+y;
assert.equal(tiebreakUtility(tieA.bundle),tiebreakUtility(tieB.bundle));
const extra=[1.2,.2];
assert.ok(extra[0]>second.bundle[0] && extra[1]>second.bundle[1]);
assert.ok(first.prices[0]*extra[0]+first.prices[1]*extra[1]<first.w);
assert.equal(frames[3].state.showC,true);
let samples=0;
for(let k=1;k<100;k++){
 const t=k/100,s=consumerFrame('warp',t).state;
 assert.equal(s.scenario,'source');assert.equal(s.stage,1);assert.ok(Math.abs(s.revealB-t)<1e-12);
 samples++;
}
for(let base=1;base<4;base++)for(const t of [.1,.5,.9])assert.deepEqual(consumerFrame('warp',base+t).state,frames[base].state);
assert.equal(frames[4].state.scenario,'tie');
console.log(JSON.stringify({passed:true,frames:5,revealSamples:samples,sourceStrict:source.strict,bothEqual:tie.strict,oneStrictCases:2}));

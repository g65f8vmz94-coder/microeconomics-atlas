import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {demandC,utilityC} from './src/consumer.mjs';

assert.equal(consumerStories.optimum.frames.length,4);
assert.deepEqual(consumerFrame('optimum',0).state.candidate,[2,8]);
assert.deepEqual(demandC('cd',2,1,12,.5).bundle,[3,6]);
assert.deepEqual(demandC('complement',2,1,12).bundle,[4,4]);
let last=0,samples=0;
for(let k=0;k<100;k++){
 const t=k/100,{state:s}=consumerFrame('optimum',t),[x,y]=s.candidate;
 assert.ok(Math.abs(2*x+y-12)<1e-9 && x>=0 && y>=0);
 const utility=utilityC('cd',x,y,.5);
 assert.ok(utility>=last-1e-10 && utility<=Math.sqrt(18)+1e-9);
 last=utility;samples++;
}
for(let x=0;x<=6;x+=.03)for(let y=0;y<=12;y+=.06){
 if(2*x+y<=12+1e-9){
  assert.ok(utilityC('cd',x,y,.5)<=Math.sqrt(18)+1e-8);
  assert.ok(utilityC('complement',x,y)<=4+1e-8);
 }
}
for(let x=0;x<=12;x+=.1)assert.ok(Math.abs(utilityC('linear',x,12-x)-12)<1e-9);
for(const t of [1.1,1.5,1.9,2.1,2.5,2.9])assert.deepEqual(consumerFrame('optimum',t).state,consumerStories.optimum.frames[Math.floor(t)].state);
console.log(JSON.stringify({passed:true,frames:4,continuousSamples:samples,cd:[3,6],complement:[4,4],linearBudgetOptimal:true}));

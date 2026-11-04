import assert from 'node:assert/strict';
import {consumerStories,consumerFrame} from './src/consumer-story.mjs';
import {demandC} from './src/consumer.mjs';

assert.equal(consumerStories.homogeneous.frames.length,5);
let samples=0;
for(let base=0;base<4;base++)for(let n=0;n<=100;n++){
 const frame=consumerFrame('homogeneous',base+n/100),{p,q,w}=frame.state;
 const [x,y]=demandC('half',p,q,w).bundle;
 assert.ok(Math.abs(p*x+q*y-w)<1e-8);
 if(base<3){
  assert.ok(Math.abs(p-q)<1e-8 && Math.abs(w-12*p)<1e-8);
  assert.ok(Math.abs(x-6)<1e-8 && Math.abs(y-6)<1e-8);
 }else{
  assert.equal(q,1);assert.equal(w,12);
  assert.ok(Math.abs(x-6/p)<1e-8 && Math.abs(y-6)<1e-8);
 }
 samples++;
}
assert.deepEqual(demandC('half',2,1,12).bundle,[3,6]);
console.log(JSON.stringify({passed:true,frames:5,transitionSamples:samples,baseline:[6,6],priceOnly:[3,6]}));

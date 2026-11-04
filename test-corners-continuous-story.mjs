import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {demandC,utilityC,mrsC} from './src/consumer.mjs';

assert.equal(consumerStories.corners.frames.length,5);
for(const [i,w,x,y] of [[0,1,0,1],[1,1,0,1],[2,6,1.25,2.25],[3,2.25,0,2.25],[4,6,1.25,2.25]]){
 const s=consumerFrame('corners',i).state,z=demandC('quasi',s.p,s.q,s.w).bundle;
 assert.equal(s.w,w);assert.ok(Math.abs(z[0]-x)<1e-10&&Math.abs(z[1]-y)<1e-10);
}
const boundary=demandC('quasi',3,1,2.25).bundle;
assert.equal(boundary[0],0);assert.equal(mrsC('quasi',...boundary),3);
let samples=0;
for(let base=0;base<4;base++)for(let k=1;k<100;k++){
 const {state:s}=consumerFrame('corners',base+k/100),[x,y]=demandC('quasi',s.p,s.q,s.w).bundle;
 assert.ok(x>=0&&y>=0&&Math.abs(3*x+y-s.w)<1e-9);
 if(s.w<=2.25)assert.ok(Math.abs(x)<1e-9 && Math.abs(y-s.w)<1e-9);
 else assert.ok(x>0 && Math.abs(y-2.25)<1e-9 && Math.abs(mrsC('quasi',x,y)-3)<1e-9);
 samples++;
}
for(const w of [1,2.249,2.25,2.251,6]){
 const [x,y]=demandC('quasi',3,1,w).bundle,best=utilityC('quasi',x,y);
 for(let k=0;k<=1000;k++){
  const trialX=w/3*k/1000,trialY=w-3*trialX;
  assert.ok(utilityC('quasi',trialX,trialY)<=best+1e-8);
 }
}
console.log(JSON.stringify({passed:true,frames:5,transitionSamples:samples,boundary:2.25,corner:[0,2.25],inner:[1.25,2.25]}));

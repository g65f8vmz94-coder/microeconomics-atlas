import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {demandC,utilityC,mrsC} from './src/consumer.mjs';

const frames=consumerStories.mrs.frames;
assert.equal(frames.length,5);
assert.deepEqual(frames[0].state.candidate,[2,8]);
assert.deepEqual(frames[3].state.candidate,[4,4]);
assert.deepEqual(demandC('product',2,1,12).bundle,[3,6]);
let samples=0;
for(let base=0;base<4;base++)for(let k=1;k<100;k++){
 const t=k/100,{state:s}=consumerFrame('mrs',base+t);
 const [x,y]=s.candidate||demandC('product',s.p,s.q,s.w).bundle;
 assert.ok(x>0&&y>0&&Math.abs(s.p*x+s.q*y-s.w)<1e-9);
 const slope=mrsC('product',x,y),u=utilityC('product',x,y);
 assert.ok(Math.abs(slope-y/x)<1e-9 && u<=18+1e-9);
 if(base===0||base===3)assert.ok(slope>=(base===0?2:1)-1e-9);
 if(base===2)assert.ok(slope<=2+1e-9);
 if(base===1)assert.deepEqual(s,frames[1].state);
 samples++;
}
for(const [x,y,sign] of [[2,8,1],[3,6,0],[4,4,-1]]){
 const h=1e-5,u0=utilityC('product',x,y),u1=utilityC('product',x+h,y-2*h);
 assert.ok(sign===0?u1<u0:Math.sign(u1-u0)===sign);
}
console.log(JSON.stringify({passed:true,frames:5,transitionSamples:samples,ratioAtA:4,ratioAtOptimum:2,ratioAtB:1}));

import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {demandC} from './src/consumer.mjs';

const frames=consumerStories.curves.frames;
assert.equal(frames.length,8);
const expected=[['own',2,12,3],['own',1,12,6],['cross',1,12,6],['engel',1,12,6],['engel',1,4,2],['engel',1,16,8],['cross',2,12,6],['cross',1,12,6]];
for(let i=0;i<expected.length;i++){
 const {curve,p,q,w}=consumerFrame('curves',i).state,[kind,price,wealth,quantity]=expected[i];
 assert.equal(curve,kind);assert.equal(p,price);assert.equal(q,1);assert.equal(w,wealth);
 assert.ok(Math.abs(demandC('half',p,q,w).bundle[kind==='cross'?1:0]-quantity)<1e-9);
}
let samples=0;
for(let base=0;base<7;base++)for(let k=1;k<100;k++){
 const t=k/100,frame=consumerFrame('curves',base+t),s=frame.state;
 const [x,y]=demandC('half',s.p,s.q,s.w).bundle;
 assert.ok(Math.abs(s.p*x+s.q*y-s.w)<1e-8 && s.p>0 && s.q>0);
 if(base===0||base===6){assert.ok(Math.abs(s.p-(2-t))<1e-8);assert.equal(s.w,12);assert.ok(Math.abs(y-6)<1e-8);}
 if(base===3||base===4){assert.equal(s.p,1);assert.equal(s.q,1);assert.ok(Math.abs(x-s.w/2)<1e-8);}
 if([1,2,5].includes(base))assert.deepEqual(s,frames[base].state);
 samples++;
}
console.log(JSON.stringify({passed:true,frames:8,transitionSamples:samples,own:[[2,3],[1,6]],engel:[[4,2],[16,8]],cross:6}));

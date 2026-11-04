import assert from 'node:assert/strict';
import {consumerStories, consumerFrame} from './src/consumer-story.mjs';
import {demandC} from './src/consumer.mjs';

const frames=consumerStories.rules.frames;
assert.equal(frames.length,7);
const expected=[null,[12,0],[4,4],[3,6],[7,5],[6,6],[5,0]];
let checks=0;
for(let i=0;i<frames.length;i++){
 const f=consumerFrame('rules',i),{rule,p,q,w}=f.state;
 if(expected[i]){
  const d=demandC(rule,p,q,w);
  assert.deepEqual(d.bundle,expected[i]);
  assert.ok(d.bundle.every(x=>x>=0) && d.spending<=w+1e-9);
  checks+=2;
 }
}
for(const p of [.5,1,2,4]) for(const q of [.5,1,2,4]) for(const w of [1,7,10,12,30]){
 for(const rule of ['cheaper','equal','half','cap']){
  const {bundle:[x,y],spending}=demandC(rule,p,q,w);
  assert.ok(x>=0 && y>=0 && Math.abs(spending-w)<1e-8);
  const scaled=demandC(rule,3*p,3*q,3*w).bundle;
  assert.ok(Math.abs(x-scaled[0])<1e-8 && Math.abs(y-scaled[1])<1e-8);
  if(rule==='equal') assert.ok(Math.abs(x-y)<1e-8);
  if(rule==='half') assert.ok(Math.abs(p*x-w/2)<1e-8 && Math.abs(q*y-w/2)<1e-8);
  if(rule==='cap') assert.ok(Math.abs(x-Math.min(7,w/p))<1e-8);
  if(rule==='cheaper' && p===q) assert.ok(Math.abs(p*x-w/2)<1e-8 && Math.abs(q*y-w/2)<1e-8);
  checks+=2;
 }
}
console.log(JSON.stringify({passed:true,frames:frames.length,modelChecks:checks,ruleComparisons:320}));

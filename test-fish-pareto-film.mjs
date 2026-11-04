import assert from 'node:assert/strict';
import {fishingParetoFilmState} from './src/expectations.mjs';

// At every frame all agents trade the same aggregate amount, and the
// coordinated price is between actual unit cost and consumer value.
for (const [v,k,fraction] of [[6,1,.5],[2,1.2,.8],[8,1.3,.25]]) {
 let previous=Infinity;
 for(let i=0;i<=100;i++) {
  const r=fishingParetoFilmState({v,k,fraction,phase:i/100});
  assert.ok(r.T<=previous+1e-12); previous=r.T;
  assert.ok(Math.abs(r.T-r.fishers*r.y)<1e-10);
  assert.ok(Math.abs(r.T-r.consumers*r.x)<1e-10);
  assert.ok(r.y<=r.L && r.x<=1);
  assert.ok(Math.abs(r.c-k*r.T)<1e-10);
  if(i===0){assert.ok(Math.abs(r.T-v/k)<1e-10);assert.equal(r.consumer,0);assert.equal(r.fisher,0)}
  else {
   assert.ok(r.c<r.p && r.p<v);
   assert.ok(r.consumer>0 && r.fisher>0);
   assert.ok(Math.abs(r.consumer*r.consumers+r.fisher*r.fishers-r.totalSurplus)<1e-9);
  }
 }
}
console.log(JSON.stringify({passed:true,parameterSets:3,states:303}));

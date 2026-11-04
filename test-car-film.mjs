import assert from 'node:assert/strict';
import {carFilmState,cars} from './src/expectations.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
for(const alpha of [1.1,1.2,1.5,2,2.4]){
 const base=cars({alpha});
 const expected=[6,3,2,1,base.maximal.n];
 for(let phase=0;phase<5;phase++){
  const r=carFilmState({alpha,phase}),m=r.chosen.n;
  assert.equal(m,expected[phase]);assert.equal(r.buyerCount,8);
  near(r.chosen.mean,r.q.slice(0,m).reduce((a,b)=>a+b,0)/m);
  near(r.chosen.p,alpha*r.chosen.mean);
  const accepted=r.q.slice(0,m).every(q=>q<=r.chosen.p+1e-9);
  const stay=r.q.slice(m).every(q=>q>=r.chosen.p-1e-9);
  assert.equal(r.chosen.sellsAccepted,accepted);assert.equal(r.chosen.excludedStay,stay);
  assert.equal(r.chosen.valid,accepted&&stay);
 }
 const end=carFilmState({alpha,phase:4});assert.equal(end.chosen.valid,true);
 assert.equal(end.maximal.n,Math.max(...end.candidates.filter(c=>c.sellsAccepted).map(c=>c.n)));
}
const frames=Array.from({length:5},(_,phase)=>carFilmState({phase}));
assert.deepEqual(frames.map(r=>r.chosen.n),[6,3,2,1,2]);
assert.deepEqual(frames.map(r=>r.chosen.valid),[false,false,true,true,true]);
near(frames[2].chosen.p*10,1.125);near(frames[3].chosen.p*10,.75);
assert.throws(()=>carFilmState({phase:1.5}),/invalid/);
console.log(JSON.stringify({passed:true,parameterSets:5,integerFrames:25,multipleEquilibriaChecked:true}));

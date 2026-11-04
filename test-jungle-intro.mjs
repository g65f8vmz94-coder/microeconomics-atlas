import assert from 'node:assert/strict';
import {jungleIntro,sourcePrefs,sourceAllocation,sourceEquilibrium,houses,permutations,strictEq} from './src/jungle.mjs';
assert.deepEqual(sourcePrefs,[[1,2,3,0],[1,3,0,2],[0,1,2,3],[1,2,0,3]]);
assert.deepEqual(sourceAllocation,[3,0,2,1]);
for(const k of ['d81','d82','e81','d83'])for(let t=0;t<=4;t++){
 const f=jungleIntro(k,t);assert.equal(f.assignment.length,4);assert.deepEqual(f.counts,houses.map((_,h)=>f.assignment.filter(x=>x===h).length));
 assert.equal(f.feasible,new Set(f.assignment).size===4);assert.ok(f.title&&f.narration);
 if(f.candidate){const {actor,owner,house}=f.candidate;assert.equal(f.assignment[owner],house);assert.ok(sourcePrefs[actor].indexOf(house)<sourcePrefs[actor].indexOf(f.assignment[actor]));assert.equal(f.canTake,actor<owner)}
}
for(let n=0;n<256;n++){const a=Array.from({length:4},(_,i)=>(n>>2*i)&3),isAllocation=new Set(a).size===4;assert.equal(a.every((_,h)=>a.filter(v=>v===h).length===1),isAllocation)}
assert.deepEqual(jungleIntro('d82',1).counts,[1,2,1,0]);assert.equal(jungleIntro('d82',1).feasible,false);assert.equal(jungleIntro('d82',3).feasible,true);
assert.equal(jungleIntro('d83',2).canTake,true);assert.equal(jungleIntro('d83',3).canTake,false);assert.equal(strictEq(sourcePrefs,[0,1,2,3],sourceAllocation),false);assert.equal(strictEq(sourcePrefs,[0,1,2,3],sourceEquilibrium),true);
console.log('8.1 source profile, 20 story states, 256 assignments and both power checks passed');

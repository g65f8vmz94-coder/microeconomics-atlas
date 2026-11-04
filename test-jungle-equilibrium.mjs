import assert from 'node:assert/strict';
import {jungleEquilibrium,jungleBlockers,sourcePrefs,sourceAllocation,sourceEquilibrium,serial,strictEq,permutations} from './src/jungle.mjs';
const order=[0,1,2,3];
for(const k of ['d84','e82','serial','q81','q82'])for(let t=0;t<=5;t++){
 const f=jungleEquilibrium(k,t);assert.equal(f.assignment.length,4);assert.deepEqual(f.blockers,jungleBlockers(sourcePrefs,order,f.assignment));assert.ok(f.narration&&f.title);if(f.blockers!==null)assert.equal(f.blockers.length===0,strictEq(sourcePrefs,order,f.assignment));
 if(['serial','q81'].includes(k))assert.deepEqual(f.assignment,serial(sourcePrefs,order).steps[Math.min(4,t)]);
 if(f.candidate){const c=f.candidate;assert.equal(f.assignment[c.owner],c.house);assert.ok(sourcePrefs[c.actor].indexOf(c.house)<sourcePrefs[c.actor].indexOf(f.assignment[c.actor]));assert.equal(f.canTake,c.actor<c.owner)}
}
assert.ok(jungleBlockers(sourcePrefs,order,sourceAllocation).some(x=>x.actor===0&&x.owner===3));assert.equal(jungleBlockers(sourcePrefs,order,sourceEquilibrium).length,0);assert.equal(jungleBlockers(sourcePrefs,order,[-1,-1,-1,-1]),null);assert.equal(jungleBlockers(sourcePrefs,order,[0,0,1,2]),null);
let f=jungleEquilibrium('q82',3);assert.deepEqual(f.witness,{actor:1,owner:3,house:3});assert.equal(f.assignment[0],f.alternate[0]);assert.notEqual(f.assignment[1],f.alternate[1]);
let count=0;const p=permutations([0,1,2]);for(const p0 of p)for(const p1 of p)for(const p2 of p){const prefs=[p0,p1,p2];for(const o of p)for(const a of p){assert.equal(jungleBlockers(prefs,o,a).length===0,strictEq(prefs,o,a));count++;}}
console.log(JSON.stringify({passed:true,storyStates:30,strictProfilesAndAllocationChecks:count,blockingWitness:true,partialNotEquilibrium:true}));

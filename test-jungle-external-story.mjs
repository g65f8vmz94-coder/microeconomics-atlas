import assert from 'node:assert/strict';
import {jungleExternalStory,externalEqSeats,externalUtility3,externalUtility4,externalRotations,permutations} from './src/jungle.mjs';
const people=[0,1,2], all=permutations(people), next=(a,p)=>a[(a.indexOf(p)+1)%3];
for(const a of all){
 const independent3=(a,i)=>i===2?0:Number(next(a,i===0?1:0)===i);
 const blockers=people.flatMap((i)=>people.filter(j=>i<j).map(j=>{let b=a.slice(),x=b.indexOf(i),y=b.indexOf(j);[b[x],b[y]]=[b[y],b[x]];return independent3(b,i)>independent3(a,i)}));
 assert.equal(externalEqSeats(a,people,externalUtility3).ok,!blockers.some(Boolean));
 assert.equal(blockers.some(Boolean),true,'all six allocations admit a profitable forced swap');
}
for(const [r,a] of externalRotations.entries()){
 assert.deepEqual(a,[[0,2,1],[1,0,2],[2,1,0]][r]);
 assert(people.every(i=>next(a,[1,2,0][i])===i));
 assert.equal(externalEqSeats(a,people,externalUtility4).ok,true);
 if(r)assert(people.every(i=>externalUtility4(externalRotations[0],i)>externalUtility4(a,i)));
}
let s0=jungleExternalStory('d86',0),s2=jungleExternalStory('d86',2);
assert.equal(s0.seats.indexOf(0),s2.seats.indexOf(0));assert(externalUtility3(s2.seats,0)>externalUtility3(s0.seats,0));
for(const k of ['d88','e83'])for(const t of [2,4]){
 let a=jungleExternalStory(k,t-1),b=jungleExternalStory(k,t);assert.deepEqual(a.eq.next,b.seats);assert(a.eq.i<a.eq.j);assert(externalUtility3(b.seats,a.eq.i)>externalUtility3(a.seats,a.eq.i));
}
for(const k of ['d86','d87','d88','e83','e84'])for(let t=0;t<6;t++){
 const f=jungleExternalStory(k,t);assert.equal(f.step,t);assert.deepEqual([...f.seats].sort(),people);assert(f.narration&&f.title);
}
console.log('external stories: 30 states, 6 independent blocking checks, 3 source rotations, and 4 real swaps verified');

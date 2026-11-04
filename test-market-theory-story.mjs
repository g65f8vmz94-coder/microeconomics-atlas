import assert from 'node:assert/strict';
import {marketTheoryStory,identity,example92,permutations,tradingPartition,checkEquilibrium} from './src/market.mjs';
const houses=identity,all=permutations(houses),independent=(prefs,e,a,p)=>new Set(a).size===4&&a.every((h,i)=>h===prefs[i].find(q=>p[q]<=p[e[i]]));
for(const a of all)for(const b of all){const cycles=tradingPartition(a,b),mapped=Array(4).fill(-1);for(const c of cycles)c.forEach((i,j)=>mapped[i]=a[c[(j+1)%c.length]]);assert.deepEqual(mapped,b);assert.deepEqual(cycles.flat().slice().sort(),identity);}
let commonEq=0,distinctEq=0,sourceEq=0;
const common=marketTheoryStory('e94',0),distinct=marketTheoryStory('e95',0);
for(let A=0;A<4;A++)for(let B=0;B<4;B++)for(let C=0;C<4;C++)for(let D=0;D<4;D++)for(const a of all){
 const p=[A,B,C,D];
 if(independent(common.prefs,identity,a,p)){commonEq++;assert.deepEqual(a,identity)}
 if(independent(distinct.prefs,identity,a,p)){distinctEq++;assert.deepEqual(a,distinct.prefs.map(x=>x[0]))}
 if(independent(example92,identity,a,p)){sourceEq++;for(const c of tradingPartition(identity,a))assert(c.every(i=>p[i]===p[c[0]]));}
 assert.equal(independent(example92,identity,a,p),checkEquilibrium(example92,identity,a,p,identity));
}
assert(commonEq&&distinctEq&&sourceEq);for(const k of ['e94','e95','d93','l91','q91'])for(let t=0;t<6;t++){const f=marketTheoryStory(k,t);assert.equal(f.step,t);assert(f.narration);assert(f.equilibrium);if(['d93','l91','q91'].includes(k)){assert.deepEqual(f.partition,[[0,3,1],[2]]);assert.equal(f.arrows.length,Math.min(t,3));assert.equal(f.showSelf,t>=4)}}
console.log(JSON.stringify({storyStates:30,allocationPairs:576,prices:256,allocationsPerPrice:24,commonEq,distinctEq,sourceEq,allMarketChecks:true}));

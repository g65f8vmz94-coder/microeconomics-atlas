import assert from 'node:assert/strict';
import fs from 'node:fs';
import {marketWelfareStory,checkEquilibrium,paretoImprovements} from './src/market.mjs';

// Independent small-market oracle: do not use the TTC construction to decide
// which allocations satisfy budgets or Pareto-improve another allocation.
const perms=x=>x.length?x.flatMap((v,i)=>perms(x.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];
const people=[0,1,2],allocations=perms(people);
const improves=(prefs,b,a)=>people.every(i=>prefs[i].indexOf(b[i])<=prefs[i].indexOf(a[i]))&&people.some(i=>prefs[i].indexOf(b[i])<prefs[i].indexOf(a[i]));
let profiles=0,priceAllocationChecks=0,equilibria=0,stableEndowmentEquilibria=0,unstableEndowmentEquilibria=0;
for(const p0 of allocations)for(const p1 of allocations)for(const p2 of allocations){
 const prefs=[p0,p1,p2];profiles++;
 for(const e of allocations){
  const initialStable=!allocations.some(b=>improves(prefs,b,e));
  for(let x=1;x<=3;x++)for(let y=1;y<=3;y++)for(let z=1;z<=3;z++){
   const prices=[x,y,z];
   for(const a of allocations){
    priceAllocationChecks++;
    const eq=people.every(i=>a[i]===prefs[i].find(h=>prices[h]<=prices[e[i]]));
    assert.equal(checkEquilibrium(prefs,e,a,prices,people),eq,'model and direct budget test disagree');
    if(!eq)continue;
    equilibria++;
    assert(!allocations.some(b=>improves(prefs,b,a)),'equilibrium must be Pareto stable');
    assert(people.every(i=>prices[a[i]]===prices[e[i]]),'each equilibrium house has initial-house price');
    if(initialStable){stableEndowmentEquilibria++;assert.deepEqual(a,e,'stable initial allocation cannot trade');}
    else{unstableEndowmentEquilibria++;assert(a.filter((h,i)=>h!==e[i]).length>=2,'unstable endowment requires at least two traders');}
   }
  }
 }
}
let storyStates=0;
for(const k of ['q93','q94','reopen94','policy94'])for(let t=0;t<6;t++){
 const f=marketWelfareStory(k,t);storyStates++;
 assert.equal(f.step,t);assert(f.narration&&f.title);
 for(const a of [f.initial,f.current,f.candidate,f.endowment])assert.deepEqual([...a].sort(),[0,1,2,3]);
 assert(f.eq);assert.equal(f.better.length,0);
 assert.equal(f.sumCurrent,f.sumCandidate);
 for(let i=0;i<4;i++)assert.equal(f.current[i],f.prefs[i].find(h=>f.prices[h]<=f.prices[f.endowment[i]]));
 assert.equal(paretoImprovements(f.prefs,f.current).length,0);
 if(k==='q93'&&t>=1){assert.deepEqual(f.changes,['same','worse','better','same']);assert.equal(f.prices[f.candidate[2]],4);assert.equal(f.prices[f.endowment[2]],3);assert.equal(f.sumCurrent,15);assert(!checkEquilibrium(f.prefs,f.endowment,f.candidate,f.prices));}
 if(k==='q94'&&t>=2){assert.deepEqual(f.changes,['worse','better','same','same']);assert(!checkEquilibrium(f.prefs,f.endowment,f.candidate,f.prices));assert.equal(f.sumCurrent,10);}
 if(['reopen94','policy94'].includes(k))assert.deepEqual(f.endowment,t<2?[0,1,2,3]:[3,0,2,1]);
}
assert.throws(()=>marketWelfareStory('unknown'));
assert.equal(marketWelfareStory('q93',-5).step,0);assert.equal(marketWelfareStory('q93',99).step,5);
const out={passed:true,storyStates,profiles,endowments:6,priceVectors:27,allocations:6,priceAllocationChecks,equilibria,stableEndowmentEquilibria,unstableEndowmentEquilibria,scope:'All three-person strict preference profiles, all initial allocations, positive integer prices 1..3, and all final allocations. Finite checks supplement the general proofs; they do not establish them.'};
fs.writeFileSync('qa/market-welfare-models.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out));

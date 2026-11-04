import assert from 'node:assert/strict';
import fs from 'node:fs';
import {example91,example92,identity,permutations,tradingPartition,topTrading,checkEquilibrium,paretoImprovements,strictDominates,cases,casesBySection} from './src/market.mjs';
let checks=0;const ok=(condition,message)=>{assert.ok(condition,message);checks++};const same=(a,b,message)=>{assert.deepEqual(a,b,message);checks++};
const a=topTrading(example91),b=topTrading(example92);
same(a.allocation,[1,0,2,3],'Example 9.6 allocation');same(a.rounds.map(r=>r.cycle),[[0,1],[2],[3]],'Example 9.6 first order');
same(b.allocation,[3,0,2,1],'Example 9.7 allocation; book last line typo');same(b.rounds.map(r=>r.cycle),[[0,3,1],[2]],'Example 9.7 cycles');
ok(checkEquilibrium(example91,identity,a.allocation,a.price),'Example 9.6 equilibrium');ok(checkEquilibrium(example92,identity,b.allocation,b.price),'Example 9.7 equilibrium');
same(tradingPartition(identity,[2,3,0,1]),[[0,2],[1,3]],'two bilateral trading cycles');same(tradingPartition(identity,[3,0,2,1]),[[0,3,1],[2]],'three person trading cycle');
let candidateSupports=0,equilibriumSupports=0;
for(let pa=1;pa<=4;pa++)for(let pb=1;pb<=4;pb++)for(let pc=1;pc<=4;pc++)for(let pd=1;pd<=4;pd++){
 const p=[pa,pb,pc,pd];if(checkEquilibrium(example92,identity,[2,3,0,1],p))candidateSupports++;if(checkEquilibrium(example92,identity,[3,0,2,1],p))equilibriumSupports++;
}
same(candidateSupports,0,'Example 9.3 bilateral allocation cannot be supported');ok(equilibriumSupports>0,'Example 9.3 TTC allocation is supportable');
for(let n=2;n<=3;n++){
 const houses=Array.from({length:n},(_,i)=>i),prefs=permutations(houses),endowments=permutations(houses),orders=permutations(houses);
 const profiles=(prefix=[])=>prefix.length===n?[prefix]:prefs.flatMap(p=>profiles([...prefix,p]));
 for(const profile of profiles())for(const endowment of endowments){const outcomes=new Set();for(const order of orders){const r=topTrading(profile,endowment,order);ok(checkEquilibrium(profile,endowment,r.allocation,r.price),`n${n} equilibrium`);same(r.allocation.slice().sort(),houses,'allocation bijection');same(r.rounds.flatMap(x=>x.cycle).slice().sort(),houses,'everyone trades once');ok(!paretoImprovements(profile,r.allocation).length,'Pareto stable');for(const round of r.rounds){const p=round.cycle.map(i=>r.price[endowment[i]]);ok(p.every(v=>v===p[0]),'equal prices in cycle');}outcomes.add(r.allocation.join(''))}same(outcomes.size,1,'unique equilibrium allocation across top-cycle selection orders')}
}
let seed=9;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};const perms4=permutations(identity);
for(let t=0;t<120;t++){const p=identity.map(()=>perms4[Math.floor(random()*24)]),e=perms4[Math.floor(random()*24)],outcomes=new Set();for(const order of perms4){const r=topTrading(p,e,order);ok(checkEquilibrium(p,e,r.allocation,r.price),'4-person equilibrium');ok(!paretoImprovements(p,r.allocation).length,'4-person Pareto stability');outcomes.add(r.allocation.join(''))}same(outcomes.size,1,'4-person allocation invariant across 24 starts')}
const original=[[1,2,0,3],[3,2,1,0],[1,2,3,0],[2,0,3,1]],old=topTrading(original).allocation,removed=topTrading(original,identity,[0,1,3]).allocation;
same(old,[0,3,1,2],'problem 3 original');same(removed,[1,3,-1,0],'problem 3 removed market');ok(original[0].indexOf(removed[0])<original[0].indexOf(old[0]),'one better after removal');ok(original[3].indexOf(removed[3])>original[3].indexOf(old[3]),'another worse after removal');
const liftedOwn=original.map(p=>p.slice());liftedOwn[0]=[1,0,2,3];same(topTrading(liftedOwn).allocation,old,'problem 4a unchanged');
const liftedOther=original.map(p=>p.slice());liftedOther[1]=[0,3,2,1];const improved=topTrading(liftedOther).allocation;same(improved,[1,0,2,3],'problem 4b construction');ok(original[0].indexOf(improved[0])<original[0].indexOf(old[0]),'owner 1 strictly improves');
const p2cEndowment=[3,2,1,0];for(const fav of identity){const p=[[0,1,2,3],[0,1,2,3],[3,0,1,2],[fav,...identity.filter(h=>h!==fav)]];const r=topTrading(p,p2cEndowment,[3,0,1,2]);same(r.allocation[3],fav,'problem 2c fourth owner gets favorite')}
for(let person=0;person<4;person++){const honest=topTrading(example91).allocation[person];for(const report of perms4){const p=example91.map(x=>x.slice());p[person]=report;const outcome=topTrading(p).allocation[person];ok(example91[person].indexOf(honest)<=example91[person].indexOf(outcome),'no profitable misreport in source profile')}}
for(let t=0;t<2000;t++){const p=identity.map(()=>perms4[Math.floor(random()*24)]),base=topTrading(p).allocation,rank=p[1].indexOf(0);for(let pos=0;pos<rank;pos++){const q=p.map(x=>x.slice());q[1].splice(rank,1);q[1].splice(pos,0,0);const newer=topTrading(q).allocation;ok(p[0].indexOf(newer[0])<=p[0].indexOf(base[0]),'problem 4b monotonicity sample')}}
for(let mask=1;mask<16;mask++){const coalition=identity.filter(i=>mask&(1<<i)),originalHouses=coalition.map(i=>i);for(const h of permutations(originalHouses)){ok(!coalition.every((i,j)=>example92[i].indexOf(h[j])<example92[i].indexOf(b.allocation[i])),'source equilibrium core')}}
const weakPreferences=[[[0,1]],[[0],[1]]];const weakRank=(i,h)=>weakPreferences[i].findIndex(tier=>tier.includes(h));
const weakEq=(allocation,price)=>[0,1].every(i=>[0,1].filter(h=>price[h]<=price[i]).every(h=>weakRank(i,allocation[i])<=weakRank(i,h)));
ok(weakEq([0,1],[2,1]),'weak-preference inefficient equilibrium');ok(weakEq([1,0],[1,1]),'weak-preference second equilibrium');ok(weakRank(0,1)===weakRank(0,0)&&weakRank(1,0)<weakRank(1,1),'second allocation Pareto dominates first');
const allCases=Object.values(casesBySection).flat();same(new Set(allCases).size,allCases.length,'distinct chapter 9 cases');same(allCases.filter(k=>!['wealth','reopen94','policy94','prices95','strict95'].includes(k)).length,29,'textbook items, two procedures and seven problems with parts');ok(['wealth','reopen94','policy94','prices95','strict95'].every(k=>allCases.includes(k)),'auxiliary stories are separately labeled');ok(allCases.every(k=>cases[k]),'all scenarios have source metadata');
const out={chapter:9,passed:true,checks,caseCount:allCases.length,sourceExamples:{example91:a.allocation,example92:b.allocation,nonSupportablePriceVectors:256,equilibriumSupportVectors:equilibriumSupports},enumeration:{threePersonAllStrictProfiles:216,threePersonAllEndowments:6,threePersonAllStartOrders:6,fourPersonRandomProfiles:120,fourPersonStartOrders:24,monotonicitySamples:2000},sourceCorrection:'Example 9.7 printed last allocation (D,A,B,C) is inconsistent with its own stepwise text and Example 9.2; the model uses (D,A,C,B).',limitations:['finite checks illustrate but do not replace general proofs','problem 4b property sampled, not exhausted over every four-person profile']};
fs.writeFileSync('qa/market-models.json',JSON.stringify(out,null,2));console.log(JSON.stringify({passed:true,checks,caseCount:allCases.length}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {marketExerciseCases,marketExerciseStory,marketResidualMenu} from './src/market-exercises.mjs';
import {marketExerciseContent} from './src/market-exercises-content.mjs';
import {topTrading,tradingPartition} from './src/market.mjs';
const permute=xs=>xs.length?xs.flatMap((x,i)=>permute(xs.filter((_,j)=>j!==i)).map(t=>[x,...t])):[[]];
const people=[0,1,2],orders=permute(people),weaklyBetter=(prefs,b,a,who)=>who.every(i=>prefs[i].indexOf(b[i])<=prefs[i].indexOf(a[i]));
const eq=(prefs,e,a,p,who)=>new Set(who.map(i=>a[i])).size===who.length&&who.every(i=>a[i]===prefs[i].find(h=>who.some(j=>e[j]===h)&&p[h]<=p[e[i]]));
let storyStates=0,improvementPairs=0,ownFavoriteChecks=0,distinctPriceEquilibria=0,corePlans=0,ownPromotionChecks=0;
for(const key of marketExerciseCases)for(let t=0;t<6;t++){
 const f=marketExerciseStory(key,t),c=marketExerciseContent[key];storyStates++;assert.equal(f.step,t);assert.equal(c.steps.length,6);assert(c.proof.length>=3&&c.question&&c.conditions&&c.formula);
 assert.equal(new Set(f.current.filter(h=>h>=0)).size,f.current.filter(h=>h>=0).length);
 if(key==='p1'){assert(weaklyBetter(f.prefs,f.after,f.before,[0,1,2,3]));assert(f.cycle.length>1);assert(f.cycle.every(i=>f.prefs[i].indexOf(f.after[i])<f.prefs[i].indexOf(f.before[i])));assert.deepEqual(f.cycle,[0,2,1]);}
 if(key==='p2a')assert(eq(f.prefs,f.e,f.current,f.prices,f.people));
 if(key==='p2b')assert.equal(eq(f.prefs,f.e,f.current,f.prices,f.people),t!==2);
 if(key==='p2c'&&t>0){assert.equal(f.after[3],f.favorite);assert(f.cycle.includes(3));assert.deepEqual(f.cycle,[ [3],[3,2,0],[3,1],[3,0] ][Math.min(3,t-1)]);}
 if(key==='p3'){assert(eq(f.prefs,f.e,f.current,f.prices,f.people));if(t>=2){assert.deepEqual(f.current,[1,3,-1,0]);assert(f.grades[0]>0&&f.grades[3]<0);assert.deepEqual(f.departed,{person:2,house:2});}}
 if(key==='p4a'){assert.deepEqual(f.before,f.after);assert(eq(t?f.afterPrefs:f.prefs,f.e,f.current,f.prices,f.people));}
 if(key==='p4b'){assert.deepEqual(f.before,[0,3,1,2]);assert.deepEqual(f.after,[1,0,2,3]);assert(f.menus.old.houses.every(h=>f.menus.new.houses.includes(h)));assert(f.prefs[0].indexOf(f.after[0])<f.prefs[0].indexOf(f.before[0]));}
 if(key==='p5'){assert.equal(f.before[0],1);assert.equal(f.prefs[0][0],2);assert.deepEqual(f.menus.menu.houses,[0,1]);assert.equal(f.reportResults.filter(r=>r.house===0).length,12);assert.equal(f.reportResults.filter(r=>r.house===1).length,12);assert.equal(f.reportResults.filter(r=>f.prefs[0].indexOf(r.house)<f.prefs[0].indexOf(f.before[0])).length,0);}
 if(key==='p6'){assert.equal(f.ownedValue,7);assert.equal(f.proposalValue,7);assert(f.coalitionPlans.every(p=>!p.allBetter));if(t>=3)assert(f.grades[0]<0&&f.grades[2]>0);}
 if(key==='p7'){
  const actual=f.current.every((h,i)=>f.prices[h]<=f.prices[f.e[i]]&&f.e.filter(j=>f.prices[j]<=f.prices[f.e[i]]).every(j=>f.ranks[i][h]<=f.ranks[i][j]));assert.equal(actual,f.isEquilibrium);
  assert(f.before.every((h,i)=>f.ranks[i][f.after[i]]<=f.ranks[i][h]));assert(f.before.some((h,i)=>f.ranks[i][f.after[i]]<f.ranks[i][h]));
 }
}
for(const p0 of orders)for(const p1 of orders)for(const p2 of orders){
 const prefs=[p0,p1,p2];
 for(const a of orders)for(const b of orders){
  if(weaklyBetter(prefs,b,a,people)&&people.some(i=>a[i]!==b[i])){
   const cycles=tradingPartition(a,b);assert(cycles.some(c=>c.length>1));for(const c of cycles.filter(c=>c.length>1))assert(c.every(i=>prefs[i].indexOf(b[i])<prefs[i].indexOf(a[i])));improvementPairs++;
  }
 }
 for(const e of orders){
  const result=topTrading(prefs,e,people);assert(eq(prefs,e,result.allocation,result.price,people));
  for(const i of people)if(e[i]===prefs[i][0]){assert.equal(result.allocation[i],e[i]);ownFavoriteChecks++;}
  for(const prices of orders){const p=prices.map(x=>x+1);for(const a of orders)if(eq(prefs,e,a,p,people)){assert.deepEqual(a,e);distinctPriceEquilibria++;}}
  for(let mask=1;mask<8;mask++){
   const who=people.filter(i=>mask&(1<<i));for(const plan of permute(who.map(i=>e[i]))){
    assert(!who.every((i,j)=>prefs[i].indexOf(plan[j])<prefs[i].indexOf(result.allocation[i])));corePlans++;
   }
  }
  for(const i of people){const h=result.allocation[i],rank=prefs[i].indexOf(h);for(let to=0;to<rank;to++){
   const newPrefs=prefs.map(p=>p.slice());newPrefs[i].splice(rank,1);newPrefs[i].splice(to,0,h);
   assert(eq(newPrefs,e,result.allocation,result.price,people));assert.deepEqual(topTrading(newPrefs,e,people).allocation,result.allocation);ownPromotionChecks++;
  }}
 }
}
let favoriteTableCompletions=0;
const tails=h=>permute([0,1,2,3].filter(x=>x!==h)).map(t=>[h,...t]);
for(const a of tails(0))for(const b of tails(0))for(const c of tails(3))for(let favorite=0;favorite<4;favorite++)for(const d of tails(favorite)){
 const result=topTrading([a,b,c,d],[3,2,1,0],[3,0,1,2]);assert.equal(result.allocation[3],favorite);favoriteTableCompletions++;
}
assert.throws(()=>marketResidualMenu([[0,0],[1,0]],[0,1],0));
assert.throws(()=>marketResidualMenu([[0,1],[1,0]],[0,1],0,[[0]]));
const out={passed:true,storyStates,improvementPairs,ownFavoriteChecks,distinctPriceEquilibria,corePlans,ownPromotionChecks,favoriteTableCompletions,scope:'All 60 story states; general proof ingredients checked on all strict three-person profiles/endowments; all completions of the 9.2(c) partial preference table. Finite checks do not replace proofs.'};
fs.writeFileSync('qa/market-exercises-story-models.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));

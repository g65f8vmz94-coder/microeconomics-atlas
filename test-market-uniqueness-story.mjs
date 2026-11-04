import assert from 'node:assert/strict';
import fs from 'node:fs';
import {marketUniquenessStory,equilibriumUniquenessTrace,checkEquilibrium,example91,identity} from './src/market.mjs';
const perms=xs=>xs.length?xs.flatMap((x,i)=>perms(xs.filter((_,j)=>i!==j)).map(ys=>[x,...ys])):[[]];
const three=[0,1,2],orders=perms(three),prices=[];
for(let a=1;a<=3;a++)for(let b=1;b<=3;b++)for(let c=1;c<=3;c++)prices.push([a,b,c]);
let markets=0,priceAllocations=0,certificates=0,roundChecks=0;
for(const a of orders)for(const b of orders)for(const c of orders)for(const e of orders){
 const prefs=[a,b,c],supported=[];markets++;
 for(const p of prices)for(const alloc of orders){
  priceAllocations++;
  // Direct budget oracle, independent of TTC and of the proof trace.
  if(three.every(i=>alloc[i]===prefs[i].find(h=>p[h]<=p[e[i]])))supported.push({p,alloc});
 }
 assert(supported.length>0);assert.equal(new Set(supported.map(x=>x.alloc.join(','))).size,1);
 for(const x of supported)for(const y of supported){
  certificates++;const f=equilibriumUniquenessTrace(prefs,e,x.p,y.p);assert.deepEqual(f.a,x.alloc);assert.deepEqual(f.b,y.alloc);
  let active=three.slice();
  for(const round of f.rounds){
   roundChecks++;assert.deepEqual(round.active,active);assert(round.cycle.length>0);
   assert(round.cycle.every(i=>x.p[e[i]]===Math.max(...active.map(j=>x.p[e[j]]))));
   for(let j=0;j<round.cycle.length;j++){
    const i=round.cycle[j],next=round.cycle[(j+1)%round.cycle.length];
    assert.equal(x.alloc[i],e[next]);assert.equal(y.alloc[i],e[next]);
    assert.equal(x.alloc[i],prefs[i].find(h=>active.some(m=>e[m]===h)));
    assert.equal(y.p[e[i]],y.p[e[next]]);
   }
   active=active.filter(i=>!round.cycle.includes(i));assert.deepEqual(round.remaining,active);
   for(const z of [x,y])for(const i of active)assert.equal(z.alloc[i],prefs[i].find(h=>active.some(j=>e[j]===h)&&z.p[h]<=z.p[e[i]]));
  }
  assert.equal(active.length,0);
 }
}
let storyStates=0;
for(const k of ['q95','prices95','strict95'])for(let t=0;t<6;t++){
 const f=marketUniquenessStory(k,t);storyStates++;assert.equal(f.step,t);assert(f.eqP&&f.eqQ);assert(f.narration&&f.title);
 assert(f.shownB.every((h,i)=>h===(f.revealed.includes(i)?f.b[i]:-1)));
 if(k==='strict95'){
  assert.notDeepEqual(f.a,f.b);
  for(const [price,alloc] of [[f.p,f.a],[f.q,f.b]])for(const i of f.initial){
   const affordable=f.initial.filter(h=>price[h]<=price[f.initial[i]]);
   assert(affordable.includes(alloc[i]));assert.equal(f.ranks[i][alloc[i]],Math.min(...affordable.map(h=>f.ranks[i][h])));
  }
 }else{assert.deepEqual(f.a,[1,0,2,3]);assert.deepEqual(f.a,f.b);}
 if(k==='prices95')assert.equal(JSON.stringify(f.p)===JSON.stringify(f.q),t<2);
}
assert.deepEqual(marketUniquenessStory('q95',2).shownB,[1,-1,-1,-1]);
assert.deepEqual(marketUniquenessStory('q95',3).shownB,[1,0,-1,-1]);
assert.deepEqual(marketUniquenessStory('q95',4).removed,[0,1]);
assert.deepEqual(marketUniquenessStory('q95',5).shownB,[1,0,2,3]);
let transitionChecks=0;
for(let i=0;i<=500;i++){
 const t=i/500,q=[4,4,3-t,2+t],scaled=[4*(1+t),4*(1+t),2*(1+t),3*(1+t)];
 for(const p of [q,scaled]){assert(checkEquilibrium(example91,identity,[1,0,2,3],p));transitionChecks++;}
}
assert.throws(()=>equilibriumUniquenessTrace([[0,0],[0,1]],[0,1],[2,1],[1,1]));
assert.throws(()=>equilibriumUniquenessTrace(example91,identity,[4,4,3,2],[2,2,3,4]));
assert.throws(()=>marketUniquenessStory('bad'));assert.equal(marketUniquenessStory('q95',99).step,5);
const out={passed:true,storyStates,markets,priceAllocations,certificates,roundChecks,transitionChecks,scope:'All three-person strict preference profiles and initial allocations; all 1..3 price vectors and all pairs that support equilibria. Independent budget and removal checks. Finite checks accompany the general textbook proof; weak preferences are tested with a separate rank oracle.'};
fs.writeFileSync('qa/market-uniqueness-models.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));

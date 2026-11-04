import assert from 'node:assert/strict';
import {fishingEquilibriumFilmState} from './src/expectations.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);
let states=0;
for(const [v,k] of [[6,1],[2,1.2],[8,1.3],[8,2],[2,.9]]){
 const frame=phase=>fishingEquilibriumFilmState({v,k,phase});
 const low=frame(1),high=frame(2),equal=frame(3),above=frame(4),below=frame(5),end=frame(6);
 assert.equal(low.branch,'full');assert.equal(low.bestTotal,low.fishers*low.L);assert.equal(low.consistent,false);
 assert.equal(high.branch,'none');assert.equal(high.bestTotal,0);assert.equal(high.consistent,false);
 for(const r of [equal,end]){assert.equal(r.branch,'indifferent');assert.equal(r.consumerBranch,'indifferent');assert.equal(r.consistent,true);near(r.T,r.eqT);near(r.c,v);near(r.trialPrice,v);near(r.y*r.fishers,r.x*r.consumers)}
 assert.ok(above.trialPrice>v);near(above.T,0);assert.equal(above.consumerBranch,'none');assert.equal(above.branch,'full');assert.equal(above.consistent,false);
 assert.ok(below.trialPrice<v);near(below.T,below.fishers*below.L);assert.equal(below.consumerBranch,'full');assert.equal(below.branch,'none');assert.equal(below.consistent,false);
 for(let i=0;i<=600;i++){
  const r=frame(i/100),cap=r.fishers*r.L;states++;
  assert.ok(r.T>=0&&r.T<=cap);near(r.c,k*r.T);assert.ok(r.trialPrice>0);
  if(r.branch==='full'){assert.ok(r.c<r.trialPrice);near(r.bestTotal,cap)}
  if(r.branch==='none'){assert.ok(r.c>r.trialPrice);near(r.bestTotal,0)}
  if(r.branch==='indifferent'){near(r.c,r.trialPrice);assert.equal(r.bestTotal,null)}
  if(r.consumerBranch==='full'){assert.ok(r.trialPrice<v);near(r.bestDemand,r.consumers)}
  if(r.consumerBranch==='none'){assert.ok(r.trialPrice>v);near(r.bestDemand,0)}
  if(r.consumerBranch==='indifferent'){near(r.trialPrice,v);assert.equal(r.bestDemand,null)}
  const supply=r.bestTotal===null?r.T<=cap:Math.abs(r.bestTotal-r.T)<1e-10;
  const demand=r.bestDemand===null?r.T<=r.consumers:Math.abs(r.bestDemand-r.T)<1e-10;
  assert.equal(r.consistent,supply&&demand);
 }
}
console.log(JSON.stringify({passed:true,parameterSets:5,states}));

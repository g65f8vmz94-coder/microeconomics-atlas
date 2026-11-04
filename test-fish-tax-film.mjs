import assert from 'node:assert/strict';
import {fishingTaxFilmState} from './src/expectations.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);

for(const [v,k,fraction] of [[6,1,.5],[2,1.2,.8],[8,1.3,.25]]){
 let previousTotal=Infinity,previousTransfer=0;
 for(let i=0;i<=200;i++){
  const r=fishingTaxFilmState({v,k,fraction,phase:i/100});
  assert.ok(r.T<=previousTotal+1e-10);previousTotal=r.T;
  assert.ok(r.transfer>=previousTransfer-1e-10);previousTransfer=r.transfer;
  near(r.c+r.tax,v);near(r.revenue,r.tax*r.T);
  near(r.revenue,r.transfer*(r.consumers+r.fishers)+r.retained);
  near(r.consumer,r.transfer);near(r.fisher,r.transfer);
  near(r.T,r.x*r.consumers);near(r.T,r.y*r.fishers);
  assert.ok(r.x<=1&&r.y<=r.L);
  if(i<=100)near(r.transfer,0);
  if(i===100){assert.ok(r.revenue>0);near(r.retained,r.revenue)}
  if(i===200){assert.ok(r.transfer>0);near(r.retained,0)}
 }
}
console.log(JSON.stringify({passed:true,parameterSets:3,states:603}));

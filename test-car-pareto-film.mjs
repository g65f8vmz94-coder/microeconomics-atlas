import assert from 'node:assert/strict';
import {carParetoFilmState} from './src/expectations.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
let eligible=0,invalid=0,allSold=0;
for(const alpha of [1.1,1.2,1.5,2,2.4])for(let m=1;m<=6;m++)for(const phase of [0,1]){
 const r=carParetoFilmState({alpha,m,phase});
 assert.equal(r.eligible,r.chosen.valid&&r.untraded.length>0);
 if(!r.chosen.valid)invalid++;
 if(r.chosen.valid&&!r.untraded.length)allSold++;
 if(r.eligible){eligible++;near(r.quality,r.q[m]);near(r.buyerValue,alpha*r.quality);assert.ok(r.quality<r.bilateralPrice&&r.bilateralPrice<r.buyerValue);near(r.sellerGain,r.bilateralPrice-r.quality);near(r.buyerGain,r.buyerValue-r.bilateralPrice);assert.ok(r.sellerGain>0&&r.buyerGain>0);assert.ok(r.buyerCount>m)}
 else assert.equal(r.bilateralPrice,null);
}
const example=carParetoFilmState({phase:1});
near(example.chosen.p*10,1.125);near(example.quality*10,2);near(example.buyerValue*10,3);near(example.bilateralPrice*10,2.5);near(example.sellerGain*10,.5);near(example.buyerGain*10,.5);
assert.throws(()=>carParetoFilmState({phase:.5}),/invalid/);
assert.ok(eligible&&invalid&&allSold);
console.log(JSON.stringify({passed:true,states:60,eligible,invalid,allSold,example:'2万、3万、2.5万、双方各得0.5万'}));

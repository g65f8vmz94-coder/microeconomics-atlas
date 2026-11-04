import assert from 'node:assert/strict';
import {taxLinearM,taxLinearTeachingM} from './src/monopoly.mjs';
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);
for(const [phase,t,q,p] of [[0,0,4,6],[1,2,3,7],[2,4,2,8],[3,9,0,null],[4,2,3,7]]){const f=taxLinearTeachingM(phase);near(f.tax,t);near(f.outcome.q,q);assert.equal(f.outcome.p,p)}
for(let i=0;i<=400;i++){const f=taxLinearTeachingM(i/100),r=taxLinearM(10,1,2,f.tax);near(f.outcome.q,r.q);assert.equal(f.outcome.p,r.p);if(r.q>0){near(r.rise,f.tax/2);near(r.net,6-f.tax/2)}else{assert.equal(r.p,null);assert.equal(r.rise,null);assert.equal(r.net,null)}}
let n=0;for(const a of [6,10,15])for(const b of [.5,1,2])for(const c of [0,2,4])for(let i=0;i<=20;i++){if(a<=c)continue;const t=(a-c)*i/20,r=taxLinearM(a,b,c,t);if(i<20){near(r.rise,t/2);near(r.net-r.p0,-t/2);const best=(r.p-c-t)*r.q;for(const q of [0,r.q/2,r.q,r.q*1.5,(a-c-t)/b])assert.ok(best+1e-8>=(a-b*q-c-t)*q)}else{assert.equal(r.q,0);assert.equal(r.p,null);assert.equal(r.rise,null)}n++}
assert.equal(taxLinearM(10,1,2,8).p,null);assert.equal(taxLinearM(10,1,2,9).p,null);
console.log(JSON.stringify({passed:true,continuousStates:401,generalCases:n,zeroOutputBoundary:true,globalProfitComparisons:true}));

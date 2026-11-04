import assert from 'node:assert/strict';
import {discreteRevenueTeachingM,discreteRevenueM} from './src/monopoly.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const steps=[0,1,2,3].map(discreteRevenueTeachingM),base=discreteRevenueM();
for(let i=0;i<3;i++){assert.equal(steps[i].q,i+1);close(steps[i].price,base.values[i]);close(steps[i].revenue,base.revenue[i+1]);close(steps[i].delta,base.marginal[i+1]);}
assert.equal(steps[3].q,3);close(steps[3].delta,3);close(steps[1].loss,4);close(steps[1].newPayment,6);close(steps[2].loss,2);close(steps[2].newPayment,5);
for(let i=0;i<=3000;i++){
 const f=discreteRevenueTeachingM(i/1000),q=f.values.filter(v=>f.price<=v+1e-9).length;assert.equal(f.q,q);assert.equal(f.buyers.filter(Boolean).length,q);close(f.oldPayment+f.newPayment,f.revenue);close(f.delta,f.revenue-f.priorRevenue);close(f.oldPayment,f.priorQ*f.price);if(f.phase>0&&f.phase<1)assert.equal(f.q,1);if(f.phase>1&&f.phase<2)assert.equal(f.q,2);
}
assert.match(discreteRevenueTeachingM(.5).narration,/销量没增加/);assert.match(discreteRevenueTeachingM(1.5).narration,/销量不变/);assert.match(steps[3].narration,/不保证/);
console.log(JSON.stringify({passed:true,continuousStates:3001,thresholds:[10,6,5],revenue:base.revenue.slice(1),marginal:base.marginal.slice(1),discreteBuyers:true}));

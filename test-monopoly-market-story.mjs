import assert from 'node:assert/strict';
import {marketTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const s={a1:100,a2:80,c:20,k:.4};
const high=marketTeachingM(s,0),low=marketTeachingM(s,1),mid=marketTeachingM(s,2),again=marketTeachingM(s,3);
near(high.price,70);near(high.quantities[0],30);near(high.quantities[1],10/1.2);
near(low.price,50);near(low.quantities[0],50);near(low.quantities[1],25);
near(low.total,75);near(low.revenue,3750);near(low.cost,2625);near(low.profit,1125);
assert.ok(high.profit>low.profit);assert.ok(mid.profit>high.profit);near(again.profit,low.profit);
let checks=0;
for(const p of [s,{a1:120,a2:10,c:30,k:0},{a1:50,a2:140,c:0,k:1.5}])for(let i=0;i<=300;i++){
 const z=marketTeachingM(p,i/100);near(z.quantities[0],Math.max(0,p.a1-z.price));near(z.quantities[1],Math.max(0,(p.a2-z.price)/1.2));near(z.total,z.quantities[0]+z.quantities[1]);near(z.cost,p.c*z.total+p.k*z.total*z.total/2);near(z.revenue,z.price*z.total);near(z.profit,z.revenue-z.cost);checks+=6;
}
const closed=marketTeachingM({a1:100,a2:10,c:20,k:.4},0);assert.equal(closed.quantities[1],0);
console.log(JSON.stringify({passed:true,parameterSets:3,states:903,numericChecks:checks,zeroDemandChecked:true}));

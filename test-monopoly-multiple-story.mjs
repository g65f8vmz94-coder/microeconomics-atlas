import assert from 'node:assert/strict';
import {multipleM,multipleTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
let checks=0;
for(const r of [2.6,2.8,3,3.2,3.3]){
 const m=multipleM(r),f=[0,1,2,3,4].map(i=>multipleTeachingM(m,i));
 near(f[0].q,0);near(f[1].q,1);near(f[2].q,2);near(f[3].q,r);near(f[4].q,m.best.at(-1));
 for(const x of [1,2,r])near(m.MR(x),m.MC(x));
 assert.ok(m.profit(1)>m.profit(2));assert.ok(m.profit(r)>m.profit(2));
 for(let j=0;j<=400;j++){const v=multipleTeachingM(m,j/100);assert.ok(v.q>=0&&v.q<=m.choke);near(v.profit,m.profit(v.q));near(v.mr,m.MR(v.q));near(v.mc,m.MC(v.q));near(v.price,m.P(v.q));if(v.q>1e-5&&v.q<m.choke-1e-5){const h=1e-5;near((m.profit(v.q+h)-m.profit(v.q-h))/(2*h),v.mr-v.mc);}checks++;}
 if(r===3){assert.equal(m.best.length,2);assert.match(f[4].narration,/多个同样好/)}else assert.equal(m.best.length,1);
}
console.log(JSON.stringify({passed:true,parameterSets:5,continuousStates:checks,candidateAndBoundaryChecks:true,tieChecked:true}));

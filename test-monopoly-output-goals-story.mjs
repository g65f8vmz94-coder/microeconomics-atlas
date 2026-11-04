import assert from 'node:assert/strict';
import {linearM,outputGoalsTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const m=linearM(),f=[0,1,2,3].map(x=>outputGoalsTeachingM(m,x));near(f[0].q,m.qm);near(f[1].q,m.qc);near(f[2].q,m.qo);near(f[3].q,m.qm);near(f[2].profit,0);near(m.P(m.qc),m.MC(m.qc));near(m.P(m.qo),m.AC(m.qo));assert.ok(m.qm<m.qc&&m.qc<m.qo);assert.ok(m.TS(m.qc)>m.TS(m.qo));
let count=0;for(const params of [{a:100,b:1,c:20,k:.4},{a:10,b:1,c:0,k:0},{a:50,b:1.5,c:25,k:1.5},{a:20,b:1,c:25,k:0}]){
 const z=linearM(params);for(let i=0;i<=300;i++){const x=outputGoalsTeachingM(z,i/100);assert.ok(x.q>=0&&x.q<=z.choke);near(x.profit,z.profit(x.q));near(x.totalSurplus,z.TS(x.q));if(x.q>0)near(x.price,z.P(x.q));else assert.equal(x.price,null);if(z.qm>0)assert.ok(x.profit>=-1e-7);count++;}
}
const equal=outputGoalsTeachingM(linearM({a:10,b:1,c:0,k:0}),2);assert.match(equal.narration,/重合/);const zero=outputGoalsTeachingM(linearM({a:20,b:1,c:25,k:0}),1);assert.equal(zero.q,0);assert.match(zero.narration,/平均成本没有定义/);
console.log(JSON.stringify({passed:true,parameterSets:4,continuousStates:count,profitMax:m.qm,socialMax:m.qc,breakEvenOutput:m.qo,constantCostAndZeroChecked:true}));

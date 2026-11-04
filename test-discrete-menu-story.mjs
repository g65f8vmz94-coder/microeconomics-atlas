import assert from 'node:assert/strict';
import {discreteTeachingM,discreteMenuM,discreteValuesM,optimalDiscreteMenuM,uniformDiscreteM,singleOptionM} from './src/monopoly.mjs';
const qty=(p,o)=>p.chosen?o[p.chosen-1].q:0;
const anchors=[[20,1,1],[21,2,1],[16,2,0],[26,2,2],[27,2,1],[10,1,0],[27,2,1]];
for(let i=0;i<=6;i++){const f=discreteTeachingM(i),[profit,h,l]=anchors[i];assert.equal(f.outcome.profit,profit);assert.equal(qty(f.outcome.H,f.options),h);assert.equal(qty(f.outcome.L,f.options),l)}
for(let j=0;j<=600;j++){const f=discreteTeachingM(j/100),r=discreteMenuM(f.values,f.options,f.tie);assert.deepEqual(f.outcome,r);assert.equal(f.options.length,f.mode==='single'?1:2);assert.equal(f.tie,j>=500&&j<600?'buyer':'seller');assert.equal(f.outcome.profit,f.outcome.H.payment+f.outcome.L.payment)}
for(const [step,mode] of [[1.999,'uniform'],[2,'single'],[3.999,'single'],[4,'menu']])assert.equal(discreteTeachingM(step).mode,mode);
const values=discreteValuesM.discount;assert.equal(uniformDiscreteM(values).best.profit,21);assert.equal(singleOptionM(values).profit,26);assert.equal(optimalDiscreteMenuM(values).best,27);
for(let n=0;n<=12000;n++){const p=n/1000,r=discreteMenuM(values,[{q:1,m:p},{q:2,m:2*p}]);assert.ok(r.profit<=21+1e-8)}
for(let q=1;q<=2;q++)for(let n=0;n<=20000;n++){const r=discreteMenuM(values,[{q,m:n/1000}]);assert.ok(r.profit<=26+1e-8)}
console.log('7.7 anchors, 601 states, boundaries, and 52003 uniform/single price checks passed');

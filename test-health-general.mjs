import assert from 'node:assert/strict';
import {health, survival} from './src/expectations.mjs';

// In the constructed example check the individual optimum separately from
// the collective change; this is numerical evidence, not a general proof.
for(const [m,p] of [[10,2],[8,3],[13,1.5]]){
 const r=health({m,p}),y=r.privateY,h=1e-5;
 const privateU=x=>(m-p*x)*survival(x,y);
 const collectiveU=x=>(m-p*x)*survival(x,x);
 const privateSlope=(privateU(y+h)-privateU(y-h))/(2*h);
 const collectiveSlope=(collectiveU(y+h)-collectiveU(y-h))/(2*h);
 assert.ok(Math.abs(privateSlope)<1e-7);
 assert.ok(collectiveSlope>0);
 for(const delta of [1e-4,1e-3,.01]){
  assert.ok(privateU(y+delta)<=privateU(y)+1e-10);
  assert.ok(collectiveU(y+delta)>collectiveU(y));
 }
}
// If the average quantity has no effect, the positive externality step is
// absent: the same private optimum is also the common-choice optimum.
const m=10,p=2,a=y=>.1+.35*(1-Math.exp(-y));
const derivative=y=>-p*a(y)+(m-p*y)*.35*Math.exp(-y);
let lo=0,hi=m/p;for(let i=0;i<100;i++){const x=(lo+hi)/2;if(derivative(x)>0)lo=x;else hi=x}
const y=(lo+hi)/2,u=x=>(m-p*x)*a(x);
assert.ok(u(y+.01)<u(y));
console.log(JSON.stringify({passed:true,parameterSets:3,positiveExternality:true,zeroExternalityCounterexample:true}));

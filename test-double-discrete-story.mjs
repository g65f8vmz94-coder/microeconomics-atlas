import assert from 'node:assert/strict';
import {doubleDiscreteM,doubleDiscreteTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const frames=Array.from({length:5},(_,i)=>doubleDiscreteTeachingM(i));
assert.ok(frames[0].direct);near(frames[1].wholesale,4);assert.equal(frames[1].outcome.q,2);near(frames[1].outcome.producer,8);near(frames[1].outcome.retailer,8);
near(frames[2].wholesale,6);assert.deepEqual(frames[2].outcome.tied,[1,2]);near(frames[2].outcome.producer,12);
near(frames[3].wholesale,7);assert.equal(frames[3].outcome.q,1);near(frames[3].outcome.producer,7);
near(frames[4].wholesale,6);assert.equal(frames[4].outcome.q,2);
for(let i=0;i<=400;i++){
 const f=doubleDiscreteTeachingM(i/100);
 if(f.direct){assert.equal(f.wholesale,null);continue;}
 const actual=doubleDiscreteM(f.wholesale,'two');assert.equal(f.outcome.q,actual.q);near(f.outcome.producer,actual.producer);near(f.outcome.retailer,Math.max(0,10-f.wholesale,16-2*f.wholesale));
 assert.ok(f.outcome.producer<=12+1e-8);
}
for(const epsilon of [.1,.01,.001,.0001]){
 const f=doubleDiscreteM(6-epsilon,'one');assert.equal(f.q,2);near(f.producer,12-2*epsilon);assert.ok(f.producer<12);
}
assert.equal(doubleDiscreteM(6,'one').q,1);near(doubleDiscreteM(6,'one').producer,6);
assert.equal(doubleDiscreteM(10,'one').q,0);assert.equal(doubleDiscreteM(10,'two').q,1);
console.log(JSON.stringify({passed:true,continuousStates:401,wholesaleTieAt6:true,exitTieAt10:true,noMaximumUnderSmallerTie:true}));

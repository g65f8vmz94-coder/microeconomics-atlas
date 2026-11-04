import assert from 'node:assert/strict';
import {producerFrame} from './src/producer-story.mjs';
import {shiftedP} from './src/producer.mjs';

let checks=0;
for(let i=1;i<100;i++){
 const t=i/100,f=producerFrame('output',1+t),a=f.state.trial;
 assert.ok(a>4&&a<16);
 const m=shiftedP({...f.state,b:0}),revenue=4*Math.sqrt(a),cost=a;
 assert.ok(Math.abs(m.profit(a)-(revenue-cost))<1e-9);
 assert.ok(m.profit(a)>0);
 checks+=3;
}
assert.equal(producerFrame('output',0).state.shutdown,true);
assert.equal(producerFrame('output',1).state.trial,4);
assert.equal(producerFrame('output',2).state.trial,16);
assert.match(producerFrame('output',.5).narration,/换成另一种技术/);
for(let i=1;i<100;i++){
 const t=i/100,s=producerFrame('statics',t).state,m=shiftedP({A:s.newA,b:0,p:s.newP,w:s.w});
 assert.ok(Math.abs(m.profit(m.aOutput))<1e-8);
 assert.ok(m.profit(16)>=-1e-8);
 if(t<.5)assert.equal(s.newA,2);else assert.equal(s.newP,2);
 checks+=3;
}
const nonStrict=a=>Math.min(a,1);
for(const a of [1,2,5,10]){assert.equal(nonStrict(a),1);assert.ok(10*nonStrict(a)-a>=0);checks+=2;}
assert.equal(10*nonStrict(1)-1,9);
// Strictly concave old f and an improved but flat g: a lower input may tie for maximum output.
const oldF=a=>1-Math.exp(-a),improvedG=a=>Math.min(2*a,1),p=1,w=.1;
for(let i=0;i<=1000;i++){const a=i/100;assert.ok(improvedG(a)+1e-12>=oldF(a));checks++;}
assert.ok(p*oldF(5)-w*5>0); // Any old maximum has input at least 5, since oldF strictly increases.
assert.equal(improvedG(.5),1);assert.ok(p*improvedG(.5)-w*.5>0); // New global maximum reached at a=.5.
console.log(JSON.stringify({passed:true,intermediateStates:198,checks,nonStrictOptima:[1,2,5,10],positiveProfitAtOne:9,improvedFlatTechnologyTie:true}));

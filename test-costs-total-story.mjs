import assert from 'node:assert/strict';
import {producerFrame} from './src/producer-story.mjs';
import {costsP} from './src/producer.mjs';

const z=costsP({F:4,c:1,k:1}),f=n=>4+n+n*n/2;let last=1,checks=0;
assert.equal(z.C(0),0);assert.equal(z.C(1),5.5);assert.equal(z.C(2),8);
assert.equal(z.C(2)-z.C(1),2.5);assert.equal(z.MC(1),2);
for(let i=1;i<100;i++){
 const frame=producerFrame('costs',i/100),y=frame.state.trial;
 assert.ok(y>last&&y<2);last=y;
 assert.ok(Math.abs(z.C(y)-f(y))<1e-10);
 assert.ok(Math.abs(z.AC(y)-z.C(y)/y)<1e-10);
 assert.ok(Math.abs(z.MC(y)-(1+y))<1e-10);checks+=4;
}
assert.equal(producerFrame('costs',0).state.trial,1);
assert.equal(producerFrame('costs',1).state.curves,true);
assert.ok(!Number.isFinite(z.AC(0)));
console.log(JSON.stringify({passed:true,continuousFrames:99,checks,shutdownCost:0,startupFee:4,finiteIncrement:2.5,marginalAtOne:2}));

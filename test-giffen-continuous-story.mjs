import assert from 'node:assert/strict';
import {consumerFrame} from './src/consumer-story.mjs';
import {demandC} from './src/consumer.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let previous=0;
for(let i=0;i<=200;i++){
 const phase=i/100,frame=consumerFrame('giffen',phase),p=frame.state.p,z=demandC('giffen',p,1,10);
 near(p,phase<=1?1.2+.3*phase:1.5+.2*(phase-1));
 near(p*z.bundle[0]+z.bundle[1],10);
 near(3*z.bundle[0]+z.bundle[1],12);
 near(z.bundle[0],2/(3-p));
 assert.ok(z.bundle[0]>=previous-1e-8);previous=z.bundle[0];
}
const p12=demandC('giffen',1.2,1,10).bundle,p17=demandC('giffen',1.7,1,10).bundle;
near(p12[0],10/9);near(p17[0],20/13);assert.ok(p17[1]<p12[1]);
console.log(JSON.stringify({passed:true,frames:3,intermediateStates:201,start:p12,end:p17}));

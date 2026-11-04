import assert from 'node:assert/strict';
import {consumerFrame} from './src/consumer-story.mjs';
import {demandC,slutskyC} from './src/consumer.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const base=slutskyC('product',1,2,1,12);
near(base.A.bundle[0],6);near(base.B.bundle[0],4.5);near(base.C.bundle[0],3);
near(base.wealth,18);near(base.sub,-1.5);near(base.income,-1.5);near(base.total,-3);
for(let i=1;i<100;i++){
 const t=i/100,first=consumerFrame('slutsky',t),p=first.state.p1,z=slutskyC('product',1,p,1,12);
 near(p,1+t);near(z.wealth,p*6+6);near(p*z.A.bundle[0]+z.A.bundle[1],z.wealth);
 const second=consumerFrame('slutsky',1+t);near(second.state.reveal,t);near(second.state.p1,2);
 const third=consumerFrame('slutsky',2+t),w=third.state.incomeW,b=demandC('product',2,1,w).bundle;
 near(w,18-6*t);near(2*b[0]+b[1],w);near(b[0],w/4);near(b[1],w/2);
}
console.log(JSON.stringify({passed:true,frames:4,transitionSamples:297,A:base.A.bundle,B:base.B.bundle,C:base.C.bundle}));

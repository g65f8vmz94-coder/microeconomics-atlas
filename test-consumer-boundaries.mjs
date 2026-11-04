import assert from 'node:assert/strict';
import {demandC,utilityC,existenceCounter} from './src/consumer.mjs';
import {consumerFrame} from './src/consumer-story.mjs';
import {quasiIndifferenceY} from './src/consumer-story-ui.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(let phase=0;phase<3;phase++){
 const {state}=consumerFrame('corners',phase), z=demandC('quasi',state.p,state.q,state.w);
 const [x,y]=z.bundle;near(quasiIndifferenceY(x,z.u),y);
 near(utilityC('quasi',x,quasiIndifferenceY(x,z.u)),z.u);
 assert.equal(x===0,phase<2);
 for(let i=0;i<=100;i++){let t=z.u*i/100, yy=quasiIndifferenceY(t,z.u);near(utilityC('quasi',t,yy),z.u);}
 assert.ok(Number.isNaN(quasiIndifferenceY(z.u+.1,z.u)));
}
const threshold=9/4;near(demandC('quasi',3,1,threshold).bundle[0],0);
for(const x of [.8,.95,.99]){const z=existenceCounter(x);assert.ok(z.nextUtility>z.utility&&z.nextUtility<z.supremum);assert.equal(z.boundaryUtility,0);}
for(let i=1;i<100;i++){
 const t=i/100,f0=consumerFrame('existence',t),f1=consumerFrame('existence',1+t);
 near(f0.state.progress,.8+.15*t);near(f1.state.progress,.95+.04*t);
 assert.ok(f0.state.progress<1&&f1.state.progress<1);
}
console.log(JSON.stringify({passed:true,quasiFrames:3,indifferenceChecks:303,thresholdCorner:true,noncontinuousExamples:3,existenceTransitionSamples:198}));

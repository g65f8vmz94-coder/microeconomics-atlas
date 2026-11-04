import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {costsP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const z=costsP({F:4,c:1,k:1});assert.equal(producerStories.acproof.frames.length,4);
const values=[[1,5.5,2],[Math.sqrt(8),1+Math.sqrt(8),1+Math.sqrt(8)],[5,4.3,6]];
for(let i=0;i<3;i++){const f=producerFrame('acproof',i),[y,ac,mc]=values[i];near(f.state.y,y);near(z.AC(y),ac);near(z.MC(y),mc);assert.ok(producerReadout('acproof',f).includes('平均'));}
let checks=0;
for(let base=0;base<3;base++)for(let i=1;i<100;i++){
 const t=i/100,f=producerFrame('acproof',base+t),y=f.state.y;assert.ok(y>0);const h=1e-5,approx=(z.AC(y+h)-z.AC(y-h))/(2*h),analytic=(z.MC(y)-z.AC(y))/y;near(analytic,approx);
 if(base===0)assert.ok(analytic<0);if(base===1)assert.ok(analytic>0);if(base===2)near(y,5);checks++;
}
const y=1;assert.notEqual(z.C(y+1)-z.C(y),z.MC(y));
console.log(JSON.stringify({passed:true,frames:4,transitionChecks:checks,lowest:Math.sqrt(8),continuousVsDiscreteChecked:true}));

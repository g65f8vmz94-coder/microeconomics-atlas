import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {firingP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(producerStories.firing.frames.length,4);
for(const [i,l,a] of [[0,0,1],[1,.3,1/.49],[2,.5,4],[3,.6,4]]){const f=producerFrame('firing',i),z=firingP(f.state);near(f.state.loss,l);near(z.chosen,a);near(z.ordinary,1);assert.ok(producerReadout('firing',f).includes('现金最优'));}
let checks=0,last=1;for(let b=0;b<3;b++)for(let i=1;i<100;i++){const frame=producerFrame('firing',b+i/100),z=firingP(frame.state),l=frame.state.loss;near(z.ordinary,1);assert.ok(z.chosen>=last-1e-8&&z.chosen<=4+1e-8);if(l<.5)near(z.chosen,1/(1-l)**2);else near(z.chosen,4);for(let j=0;j<=100;j++)assert.ok(z.subjective(j/10)<=z.subjective(z.chosen)+1e-8);last=z.chosen;checks++;}
console.log(JSON.stringify({passed:true,frames:4,transitionStates:checks,globalComparisons:checks*101}));

import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {factoriesP} from './src/producer.mjs';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
assert.equal(producerStories.factories.frames.length,5);
for(const [i,y,one,two] of [[0,1,3,4.5],[1,2,6,6],[2,3,11,8.5]]){const f=producerFrame('factories',i),z=factoriesP(f.state.y,2,.5);near(z.y,y);near(z.one,one);near(z.two,two);assert.ok(producerReadout('factories',f));}
assert.deepEqual(factoriesP(2,2).optimal,[1,2]);assert.deepEqual(factoriesP(0,2).optimal,[0]);near(factoriesP(0,2).C(0),0);
let transitions=0;for(let base=0;base<4;base++)for(let i=1;i<100;i++){const t=i/100,f=producerFrame('factories',base+t),y=f.state.y,z=factoriesP(y,2,.5);if(base<2)near(y,1+base+t);else near(y,3);near(z.C(y),Math.min(2+y*y,4+y*y/2));if(y<2-1e-8)assert.deepEqual(z.optimal,[1]);if(y>2+1e-8)assert.deepEqual(z.optimal,[2]);transitions++;}
let allocations=0;for(const k of [.2,1,2,5])for(let i=1;i<=100;i++){const y=i/10,z=factoriesP(y,k,.5);near(z.threshold,Math.sqrt(2*k));near(z.cost,Math.min(k+y*y,2*k+y*y/2));for(let j=0;j<=100;j++){const a=y*j/100,b=y-a;assert.ok(a*a+b*b+1e-10>=y*y/2);allocations++;}}
console.log(JSON.stringify({passed:true,frames:5,transitionStates:transitions,allocationComparisons:allocations,zeroAndTie:true}));

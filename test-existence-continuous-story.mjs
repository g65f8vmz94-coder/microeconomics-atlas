import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {jumpCostP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
assert.equal(producerStories.existence.frames.length,4);
for(const [i,y] of [[0,.5],[1,.9],[2,.99],[3,1]]){const f=producerFrame('existence',i),z=jumpCostP(2,y);near(f.state.y,y);assert.equal(z.feasible,y<1);assert.ok(producerReadout('existence',f).includes(y<1?'不亏钱':'亏损'));}
let checks=0,last=.5;for(let base=0;base<3;base++)for(let i=1;i<100;i++){const f=producerFrame('existence',base+i/100),y=f.state.y,z=jumpCostP(2,y);assert.ok(y>=last&&y<1);near(z.C(y),y*y);assert.ok(z.profit(y)>0);last=y;checks++;}
for(let y=1;y<=4;y+=.01)assert.ok(jumpCostP(2,y).profit(y)<=-1+1e-9);
const z=jumpCostP(2,1);near(z.C(1),3);near(z.profit(1),-1);assert.equal(z.exists,false);
console.log(JSON.stringify({passed:true,frames:4,transitionStates:checks,jumpAndNoMaximum:true}));

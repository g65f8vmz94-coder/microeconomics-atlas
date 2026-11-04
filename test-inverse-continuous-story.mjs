import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {inverseP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
assert.equal(producerStories.inverse.frames.length,3);
for(let i=0;i<=100;i++){const frame=producerFrame('inverse',i/100),y=2+i/100,z=inverseP(frame.state.kind,frame.state.A,frame.state.w,frame.state.y);near(frame.state.y,y);near(z.a,(y/2)**2);near(z.f(z.a),y);near(z.cost,(y/2)**2);assert.ok(producerReadout('inverse',frame).includes('成本'));}
const hold=producerFrame('inverse',1.5);assert.equal(hold.state.kind,'sqrt');near(hold.state.y,3);
const sat=producerFrame('inverse',2),z=inverseP(sat.state.kind,sat.state.A,sat.state.w,sat.state.y);near(z.f(z.a),1.8);near(z.a,Math.log(10));assert.equal(z.input(2),Infinity);assert.ok(z.input(1.99)>z.input(1.9));assert.ok(sat.formula.includes('e^{-a}'));
console.log(JSON.stringify({passed:true,transitionStates:101,finiteCeilingChecked:true,technologySwitchHeld:true}));

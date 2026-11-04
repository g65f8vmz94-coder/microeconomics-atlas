import assert from 'node:assert/strict';
import {producerFrame} from './src/producer-story.mjs';
import {powerP,objectivesP} from './src/producer.mjs';

let last=1,checks=0;
for(let i=1;i<100;i++){
 const frame=producerFrame('technology',i/100),a=frame.state.a,m=powerP(frame.state.A,frame.state.r),h=1e-5;
 assert.ok(a>last&&a<3);last=a;
 assert.ok(Math.abs(m.f(a)-2*Math.sqrt(a))<1e-12);
 assert.ok(Math.abs(m.mp(a)-(m.f(a+h)-m.f(a-h))/(2*h))<1e-8);
 assert.ok(m.mp(a)<=1&&m.mp(a)>0);
 assert.equal(frame.state.tangent,true);checks+=5;
}
const a=producerFrame('technology',1),b=producerFrame('technology',2);
assert.equal(a.state.a,3);assert.equal(b.state.a,3);assert.equal(a.state.tangent,true);assert.equal(b.state.secant,true);
const q=objectivesP({A:2,b:0,p:2,w:1,lower:5,minimum:1}).rows;
for(const [i,input,output,profit] of [[0,4,4,4],[1,16,8,0],[2,6.25,5,3.75],[3,1,2,3]]){
 assert.ok(Math.abs(q[i].a-input)<1e-10);assert.ok(Math.abs(q[i].y-output)<1e-10);assert.ok(Math.abs(q[i].profit-profit)<1e-10);checks+=3;
}
assert.equal(q[3].perMember,3);
console.log(JSON.stringify({passed:true,continuousFrames:99,checks,objectiveInputs:q.map(x=>x.a),tangentAndSecantSharePoint:true}));

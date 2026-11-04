import assert from 'node:assert/strict';
import {consumerFrame,consumerStories} from './src/consumer-story.mjs';
import {demandC,normalMRSC} from './src/consumer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(consumerStories.normal.frames.length,4);
for(const wealth of [2,4,8,10,12,20]){
 const [x,y]=demandC('cd',1,1,wealth,.5).bundle;
 near(x,wealth/2);near(y,wealth/2);
 for(let k=0;k<=100;k++){const xx=wealth*k/100;assert.ok(x*y+1e-8>=xx*(wealth-xx));}
}
let n=0;
for(let k=1;k<100;k++){
 const t=k/100,s=consumerFrame('normal',t).state,z=normalMRSC('cd',1,1,8,s.extraW,.5);
 near(s.extraW,4*t);near(z.vertical[0],4);near(z.vertical[1],4+4*t);
 near(z.vertical[0]+z.vertical[1],8+s.extraW);near(z.mrsVertical,1+t);
 const b=consumerFrame('normal',1+t).state,[x,y]=b.candidate;
 near(x,4+2*t);near(y,8-2*t);near(x+y,12);assert.ok(x*y>=32 && x*y<=36);assert.ok(y/x>=1);
 assert.equal(consumerFrame('normal',2+t).state.stage,'optimal');n+=3;
}
assert.deepEqual(consumerFrame('normal',0).state.stage,'initial');
assert.deepEqual(consumerFrame('normal',1).state.stage,'budget');
assert.deepEqual(consumerFrame('normal',2).state.candidate,[6,6]);
console.log(JSON.stringify({passed:true,frames:4,intermediateStates:n,independentBudgetChecks:606}));

import assert from 'node:assert/strict';
import {splitForPlayer2,finiteBargaining,oneSidedImmediate,oneSidedDeadlock,discountedOneSided,alternatingBargaining,bargainingStory} from './src/bargaining-story.mjs';
import {bargainingStoryContent,bargainingStoryKeys} from './src/bargaining-story-content.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);checks++;};
eq(splitForPlayer2(.3),[.7,.3]);eq(finiteBargaining(3).allocation,[1,0]);eq(finiteBargaining(4).allocation,[0,1]);eq(finiteBargaining(5).lastProposer,1);
for(let T=1;T<=12;T++){const f=finiteBargaining(T);eq(f.timeline.length,T);eq(f.timeline.at(-1).proposer,f.lastProposer);eq(f.allocation[f.lastProposer-1],1);}
eq(oneSidedImmediate(.3,.2).accept,false);eq(oneSidedImmediate(.3,.3).accept,true);eq(oneSidedImmediate(.3,.4).accept,true);
eq(oneSidedDeadlock([[1,0],[1,0]]).pathPayoff,[0,0]);eq(oneSidedDeadlock([[1,0],[.7,.3]]).accept,false);eq(oneSidedDeadlock([[1,0],[0,1]]).accept,true);
near(discountedOneSided(.6,.3,.181).waitUpper,.18);eq(discountedOneSided(.6,.3,.181).strictAccept,true);eq(discountedOneSided(.6,.3,.179).strictAccept,false);
for(const [alpha,beta] of [[.8,.6],[.5,.5],[.9,.9],[.2,.8]]){const r=alternatingBargaining(alpha,beta);near(r.x[0]+r.x[1],1);near(r.y[0]+r.y[1],1);near(r.x[1],r.player2Threshold);near(r.y[0],r.player1Threshold);near(r.x[0],(1-beta)/(1-alpha*beta));near(r.y[1],(1-alpha)/(1-alpha*beta));}
near(alternatingBargaining(.8,.6).x[0],.4/.52);near(alternatingBargaining(.5,.5).x[0],2/3);near(alternatingBargaining(.9,.9).x[0],1/1.9);
for(const key of bargainingStoryKeys){const c=bargainingStoryContent[key];eq(c.steps.length,6);assert.ok(c.question&&c.conditions&&c.proof.length>=3&&c.template&&c.source.includes('印刷'),key);checks++;for(let i=0;i<6;i++){const f=bargainingStory(key,i);eq(f.identity,c.steps[i][0]);eq(f.narration,c.steps[i][1]);near(f.offer[0]+f.offer[1],1);if(!['ultimatum','ultimatumProof'].includes(key))near(f.next[0]+f.next[1],1);}}
console.log({passed:true,checks,cases:bargainingStoryKeys.length,frames:bargainingStoryKeys.length*6});

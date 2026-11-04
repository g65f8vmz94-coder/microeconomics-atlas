import assert from 'node:assert/strict';
import {publicProjectUtility,publicProjectPayoffs,compensatingTransfer,publicProjectStory} from './src/public-project-story.mjs';
import {publicProjectContent,publicProjectKeys} from './src/public-project-content.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
eq(publicProjectUtility(8,0,0),0);eq(publicProjectUtility(8,1,0),8);eq(publicProjectUtility(8,1,-2),6);eq(publicProjectUtility(8,0,-2),-2);eq(publicProjectUtility(-5,1,5),0);eq(compensatingTransfer(8),-8);eq(compensatingTransfer(-5),5);eq(publicProjectPayoffs([8,-5,0],1,[-8,5,0]),[0,0,0]);
for(const values of [[8,-5,-1],[-2,3,0],[0,0,0]])for(const t of [[0,0,0],[-4,2,1]])for(let i=0;i<3;i++){eq(publicProjectUtility(values[i],1,t[i])-publicProjectUtility(values[i],0,t[i]),values[i]);}
for(const key of publicProjectKeys){const c=publicProjectContent[key];eq(c.steps.length,6);assert.ok(c.question&&c.conditions&&c.proof.length>=3&&c.template&&c.source.includes('印刷'),key);checks++;for(let step=0;step<6;step++){const f=publicProjectStory(key,step);eq(f.identity,c.steps[step][0]);eq(f.narration,c.steps[step][1]);eq(f.utility,publicProjectPayoffs(f.values,f.decision,f.transfers));eq(f.totalValue,f.values.reduce((a,b)=>a+b,0));}}
eq(publicProjectStory('intro',5).rule,'本节尚未指定决策规则');eq(publicProjectStory('transfer',2).decision,0);eq(publicProjectStory('transfer',2).utility[0],-8);eq(publicProjectStory('d172',2).utility[0],6);eq(publicProjectStory('d172',3).utility[0],-2);eq(publicProjectStory('d172',5).utility[1],0);
console.log({passed:true,checks,cases:publicProjectKeys.length,frames:publicProjectKeys.length*6});

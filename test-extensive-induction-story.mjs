import assert from 'node:assert/strict';
import {figure163Tree,figure163Solutions,oneDeviationExample,extensiveInductionStory} from './src/extensive-induction-story.mjs';
import {extensiveInductionContent,extensiveInductionKeys} from './src/extensive-induction-content.mjs';
import {treeNodes,treeOutcome,treeAudit} from './src/games.mjs';

const {root,h,i,diameters}=figure163Solutions();let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
eq(diameters,{root:3,afterA:1,afterB:2,afterBG:1});
eq(Object.fromEntries(treeNodes(root).map(n=>[n.id,n.children.length])),{root:2,afterA:2,afterB:2,afterBG:3});
eq(h.policy,{afterA:0,afterBG:0,afterB:0,root:0});eq(i.policy,{afterA:0,afterBG:2,afterB:1,root:1});
eq(treeOutcome(root,h.policy).payoff,[2,3,5]);eq(treeOutcome(root,i.policy).payoff,[3,3,2]);
eq(treeOutcome(root,h.policy).path.map(e=>e.label),['A','C']);eq(treeOutcome(root,i.policy).path.map(e=>e.label),['B','G','I']);
eq(treeAudit(root,h.policy).spe,true);eq(treeAudit(root,i.policy).spe,true);
const solutions=[];for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)for(let d=0;d<3;d++){const p={root:a,afterA:b,afterB:c,afterBG:d};if(treeAudit(root,p).spe)solutions.push(p);}eq(solutions,[h.policy,i.policy].map(p=>({root:p.root,afterA:p.afterA,afterB:p.afterB,afterBG:p.afterBG})));
const ex=oneDeviationExample();eq(ex.baseline.payoff[0],2);eq(ex.switchFirst.payoff[0],1);eq(ex.switchBoth.payoff[0],3);eq(ex.audit.one.find(n=>n.id==='h').gain,0);eq(ex.audit.one.find(n=>n.id==='hprime').gain,2);
for(const key of extensiveInductionKeys){const c=extensiveInductionContent[key];eq(c.steps.length,6);assert(c.question&&c.conditions&&c.formula&&c.proof.length>=3&&c.source.includes('印刷'));checks++;for(let step=0;step<6;step++){const frame=extensiveInductionStory(key,step);eq(frame.focus!==undefined,true);eq(frame.identity,c.steps[step][0]);eq(frame.narration,c.steps[step][1]);eq(frame.audit.spe,true);}}
console.log({passed:true,checks,cases:extensiveInductionKeys.length,frames:extensiveInductionKeys.length*6});

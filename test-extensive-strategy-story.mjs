import assert from 'node:assert/strict';
import {extensiveStrategyStory as frame,strategyModel,naturalPlan,strategyGroupCounts} from './src/extensive-strategy-story.mjs';
import {extensiveStrategyContent,extensiveStrategyKeys} from './src/extensive-strategy-content.mjs';
import {treeNodes,treeOutcome} from './src/games.mjs';
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
assert.deepEqual(extensiveStrategyKeys,['intro','slots','actual','count','belief','boundary']);checks++;
for(const key of extensiveStrategyKeys){const c=extensiveStrategyContent[key];ok(c.steps.length===6&&c.question&&c.conditions&&c.formula&&c.proof.length&&c.template&&c.trap&&c.source,key+' teaching layers');for(let i=0;i<6;i++){const f=frame(key,i);ok(f.identity&&f.narration&&f.focus&&f.plan.length===3,key+' frame '+i);assert.deepEqual(f.actual,treeOutcome(f.root,f.policy));checks++;ok(['S','C'].includes(f.optimalP2AtC1),key+' P2 continuation '+i);}}
assert.deepEqual(strategyGroupCounts(3),[4,2,1,1]);checks++;assert.deepEqual(strategyGroupCounts(4),[8,4,2,1,1]);checks++;
const all=Array.from({length:8},(_,mask)=>Array.from({length:3},(_,i)=>mask&(1<<i)?'C':'S'));
ok(new Set(all.map(p=>p.join(''))).size===8,'eight full personal strategies');
for(const p of all){const m=strategyModel(p);ok(treeNodes(m.root).filter(x=>x.player===0).length===3,'three P1 histories');ok(m.natural===naturalPlan(p),'natural projection');if(p[0]==='S')ok(m.actual.leaf==='stop0','first S always yields S0');}
const book=strategyModel(['S','C','C']),plain=strategyModel(['S','S','S']);assert.deepEqual(book.actual.payoff,[0,0]);checks++;assert.deepEqual(plain.actual.payoff,[0,0]);checks++;ok(book.optimalP2AtC1==='C'&&plain.optimalP2AtC1==='S','offpath P1 choice changes P2 continuation best response');assert.deepEqual(book.suffix.payoff,[1,4]);checks++;assert.deepEqual(plain.suffix.payoff,[-1,2]);checks++;
console.log({passed:true,checks,cases:extensiveStrategyKeys.length,frames:36});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {exchangeModelKeys,exchangeModelStory,exchangeModelBudget,exchangeModelAssignment,exchangeModelBudgetPlot} from './src/exchange-model-story.mjs';
import {exchangeModelContent} from './src/exchange-model-content.mjs';
let storyStates=0,budgetPoints=0,scaleChecks=0,geometryChecks=0;
for(const k of exchangeModelKeys)for(let t=0;t<6;t++){
 const f=exchangeModelStory(k,t),c=exchangeModelContent[k];storyStates++;assert.equal(c.steps.length,6);assert(c.proof.length>=3&&c.formula&&c.conditions);assert(f.resources.sourceValid);
 if(k==='goods101'||k==='trade101')assert(f.resources.allocation);
 if(k==='preferences101'){assert.equal(f.utility,Math.min(...f.point));if(t===1)assert.equal(f.utility,2);if(t===2)assert.equal(f.utility,3);}
 if(k==='budget101'){assert(f.budget.affordable([8,2]));assert.equal(f.budget.wealth,t<2?10:18);if(t===4)assert.equal(f.affordable,false);}
 if(k==='scale101'){assert.equal(f.budget.wealth,18*f.factor);assert(f.affordable);}
 if(k==='zero101'){assert.equal(f.budget.valid,t!==4);if(t===1||t===2||t===5){assert(f.budget.affordable([1e6,2]));assert(!f.budget.affordable([0,2.5]));assert.deepEqual(f.plot.unbounded,['x1']);}if(t===3){assert(f.budget.affordable([8,1e6]));assert(!f.budget.affordable([8.5,0]));}}
 if(k==='allocation101'){assert.equal(f.resources.allocation,![2,4].includes(t));if(t===2)assert.deepEqual(f.resources.gap,[2,0]);if(t===4)assert.deepEqual(f.resources.gap,[-2,0]);}
 if(k==='optimal101'){assert(f.affordable);if(t<2)assert.equal(f.pointCost,9);if(t===2)assert.equal(f.pointCost,18);if(t===3)assert.equal(f.utility,18);}
}
for(const a of [0,.5,1,2,3])for(const b of [0,.5,1,2,3]){
 if(a===0&&b===0)continue;
 for(let e1=0;e1<=10;e1+=2)for(let e2=0;e2<=10;e2+=2){
  const p=[a,b],e=[e1,e2],budget=exchangeModelBudget(p,e),graph=exchangeModelBudgetPlot(p,e);assert(budget.valid);assert(budget.affordable(e));
  for(const z of graph.polygon){assert(z.every(v=>v>=-1e-9&&v<=20+1e-9));assert(a*z[0]+b*z[1]<=a*e1+b*e2+1e-8);geometryChecks++;}
  for(const z of graph.boundary){assert(Math.abs(a*z[0]+b*z[1]-budget.wealth)<1e-8);geometryChecks++;}
  for(let x=0;x<=20;x+=.5)for(let y=0;y<=20;y+=.5){
   const expected=a*x+b*y<=a*e1+b*e2;assert.equal(budget.affordable([x,y]),expected);budgetPoints++;
   for(const factor of [.5,2,10]){assert.equal(exchangeModelBudget([a*factor,b*factor],e).affordable([x,y]),expected);scaleChecks++;}
  }
 }
}
assert(!exchangeModelBudget([0,0],[8,2]).valid);assert(!exchangeModelBudget([-1,2],[8,2]).valid);assert(!exchangeModelBudget([1,1],[-1,2]).valid);
assert(exchangeModelAssignment([[0,0],[10,10]],[[0,0],[10,10]]).allocation);
assert(!exchangeModelAssignment([[0,0],[0,10]],[[0,0],[0,10]]).sourceValid);
assert(!exchangeModelAssignment([[8,2],[2,8]],[[6,4],[-1,6]]).assignmentValid);
const out={passed:true,storyStates,budgetPoints,scaleChecks,geometryChecks,scope:'All eight six-step stories; independent budget arithmetic, positive scaling, zero-price directions, nonnegative assignments and exact resource conservation. Plot clipping is tested separately from economic bounds.'};
fs.writeFileSync('qa/exchange-model-story-models.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));

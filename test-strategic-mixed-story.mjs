import assert from 'node:assert/strict';
import {strategicMixedContent,strategicMixedKeys} from './src/strategic-mixed-content.mjs';
import {mixedStory,attritionPayoff,discreteExpected,holeWeights,endWeights} from './src/strategic-mixed-story.mjs';
import {matrixAnalysis,attrition} from './src/games.mjs';
let checks=0;const ok=(condition,label)=>{assert.ok(condition,label);checks++;};
const near=(a,b,label)=>ok(Math.abs(a-b)<1e-9,label+' '+a+' ≠ '+b);
assert.deepEqual(strategicMixedKeys,['intro','distribution','expected','support','pure','pennies','bach','attrition','noHoles','noEnd','geometric','tail']);checks++;
for(const key of strategicMixedKeys){
 const c=strategicMixedContent[key];ok(c.question&&c.conditions&&c.formula&&c.proof?.length&&c.template&&c.trap&&c.source,key+' content');ok(c.steps.length===6,key+' six frames');
 for(let step=0;step<6;step++){const f=mixedStory(key,step);ok(f.identity&&f.narration&&f.kind,key+' frame '+step);if(f.kind==='matrix'){ok(f.p1>=0&&f.p1<=1&&f.p2>=0&&f.p2<=1,key+' proportions');near(f.model.mixed.eu[0],f.p1*f.model.mixed.rows[0]+(1-f.p1)*f.model.mixed.rows[1],key+' player1 EU');near(f.model.mixed.eu[1],f.p2*f.model.mixed.cols[0]+(1-f.p2)*f.model.mixed.cols[1],key+' player2 EU');}if(f.kind==='geometric-war'){near(f.model.prob.reduce((a,b)=>a+b,0)+f.model.tail,1,key+' full distribution');ok(f.focus<12,key+' valid visible period');}}
}
const p=matrixAnalysis('pennies',0,0,.5,.5);near(p.mixed.pStar,.5,'pennies p1');near(p.mixed.qStar,.5,'pennies p2');near(p.mixed.eu[0],.5,'pennies player1');near(p.mixed.eu[1],.5,'pennies player2');ok(p.pure.length===0,'pennies has no pure NE');
const b=matrixAnalysis('bach',0,0,2/3,1/3);near(b.mixed.pStar,2/3,'Bach p1');near(b.mixed.qStar,1/3,'Bach p2');near(b.mixed.eu[0],2/3,'Bach player1');near(b.mixed.eu[1],2/3,'Bach player2');near((2/3)*(1/3)+(1/3)*(2/3),4/9,'Bach meeting rate');assert.deepEqual(b.pure,[[0,0],[1,1]]);checks++;
const d=matrixAnalysis('pd',1,1,0,0);ok(d.pure.some(([i,j])=>i===1&&j===1),'prisoners dilemma pure NE');ok(d.mixed.gains.every(x=>x<1e-9),'pure distribution passes support test');
near(attritionPayoff(0,3,.25),0,'war quitter');near(attritionPayoff(3,0,.25),.75,'war winner pays extra period');ok(!attrition(.25,0,2).pureNE&&attrition(.25,0,3).pureNE,'war pure threshold');
near(holeWeights.reduce((a,b)=>a+b,0),1,'hole hypothetical distribution');near(endWeights.reduce((a,b)=>a+b,0),1,'end hypothetical distribution');near(discreteExpected(1,holeWeights,.25)-discreteExpected(2,holeWeights,.25),.2,'hole strict gain');near(discreteExpected(3,endWeights,.25)-discreteExpected(2,endWeights,.25),.3,'end strict gain');
for(const cost of [.1,.25,.5,.9]){const r=attrition(cost,0,0,12);near(r.prob.reduce((a,b)=>a+b,0)+r.tail,1,'geometric sum '+cost);near(r.tail,(1-cost)**12,'infinite tail '+cost);for(const eu of r.eu)near(eu,0,'war expected payoff '+cost);}
console.log({passed:true,checks,cases:strategicMixedKeys.length,frames:strategicMixedKeys.length*6});

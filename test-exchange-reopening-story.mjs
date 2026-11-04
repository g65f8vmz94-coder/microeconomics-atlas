import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {reopeningKeys,reopeningStory,reopeningInspect} from './src/exchange-reopening-story.mjs';
import {reopeningContent} from './src/exchange-reopening-content.mjs';
import {equilibriumInspect} from './src/exchange-equilibrium-story.mjs';
const require=createRequire(import.meta.url),katex=require('./src/vendor/katex/katex.min.js'),formatter=require('./src/math-format.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let states=0,gridChecks=0,families=0,budgetChecks=0,formulas=0;const expected=[];
for(const key of reopeningKeys){const c=reopeningContent[key];assert.equal(c.steps.length,6);assert(c.question&&c.conditions&&c.template&&c.source&&c.proof.length>=5);
 for(const raw of [c.formula,c.changedFormula].filter(Boolean))for(const tex of formatter.splitMath(raw)){katex.renderToString(formatter.toTex(tex),{throwOnError:true,strict:'ignore'});formulas++;}
 for(let step=0;step<6;step++){
  const f=reopeningStory(key,step);assert(f.check.allocation);assert(f.proof.before.equilibrium&&f.proof.after.equilibrium&&f.proof.sameBudgets);
  const eq=key==='home104'?step!==0:key==='again104'?true:step!==0&&step!==5;assert.equal(f.check.equilibrium,eq,key+step);
  for(let i=0;i<2;i++){
   const a=f.assignment[i],p=f.prices,w=p[0]*f.endowments[i][0]+p[1]*f.endowments[i][1];
   near(f.check.people[i].wealth,w);near(f.check.people[i].cost,p[0]*a[0]+p[1]*a[1]);
   // Independent grid witnesses and maxima; includes free-rice values beyond
   // the drawing window, so a truncated plot cannot create a fake optimum.
   let best=-Infinity;for(let x=0;x<=24;x+=.5)for(let y=0;y<=12;y+=.5)if(p[0]*x+p[1]*y<=w+1e-10){best=Math.max(best,f.kind==='product'?x*y:f.kind==='min'?Math.min(x,y):x+y);gridChecks++;}
   near(best,f.check.people[i].best);
   if(f.check.people[i].optimal)near(best,f.check.people[i].utility);else assert(best>f.check.people[i].utility);
  }
  states++;expected.push({key,step,phase:c.steps[step][0],narration:c.steps[step][1],equilibrium:eq,optimal:f.check.individualOptimal,assignment:f.assignment,prices:f.prices});
 }
}
// Entire indifference families, including endpoints; outside gives negatives.
for(let n=0;n<=160;n++){
 const t=-1+n/40,b=[[7-t,1+t],[1+t,3-t]],r=reopeningInspect('linear',[1,1],[[8,0],[0,4]],[[7,1],[1,3]],b);assert(r.after.equilibrium);assert.deepEqual(r.utilityChange,[0,0]);near(r.net[0][1],t);families++;
 const s=n/40,a=[[s,0],[8-s,4]],z=reopeningInspect('min',[0,1],[[8,0],[0,4]],[[2,0],[6,4]],a);assert(z.after.equilibrium);families++;
}
for(const t of [-1.001,3.001])assert(!equilibriumInspect('linear',[1,1],[[7,1],[1,3]],[[7-t,1+t],[1+t,3-t]]).equilibrium);
for(const s of [-.001,4.001])assert(!equilibriumInspect('min',[0,1],[[2,0],[6,4]],[[s,0],[8-s,4]]).equilibrium);
// Common-price rescaling preserves budgets, old/new membership and equilibrium.
for(const scale of [.01,.5,1,3,100])for(const key of reopeningKeys){const f=reopeningStory(key,3),p=f.support.map(x=>x*scale),r=reopeningInspect(f.kind,p,f.original,f.settled);assert(r.before.equilibrium&&r.after.equilibrium&&r.sameBudgets);
 for(let i=0;i<2;i++)for(let x=0;x<=20;x++)for(let y=0;y<=12;y++){assert.equal(p[0]*x+p[1]*y<=r.oldWealth[i]+1e-9,p[0]*x+p[1]*y<=r.newWealth[i]+1e-9);budgetChecks++;}}
const changed=reopeningStory('free104',5);assert(changed.changedPrice&&!changed.check.individualOptimal&&changed.check.allocation);assert.deepEqual(changed.check.people.map(x=>x.best),[1,5]);
assert.throws(()=>reopeningStory('bad'));assert.equal(reopeningStory('home104',999).step,5);
const report={passed:true,states,gridChecks,families,budgetChecks,formulas,scope:'Analytic model plus independent grid witnesses, full one-dimensional equilibrium families and budget membership; general proof separately supplied'};
fs.writeFileSync('qa/exchange-reopening-models.json',JSON.stringify(report,null,2));fs.writeFileSync('qa/exchange-reopening-expected.json',JSON.stringify(expected,null,2));console.log(report);

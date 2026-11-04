import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {welfareKeys,welfareStory,welfareUtility,welfareAssessment,welfareExternalDemand} from './src/exchange-welfare-story.mjs';
import {welfareContent} from './src/exchange-welfare-content.mjs';
const require=createRequire(import.meta.url),katex=require('./src/vendor/katex/katex.min.js'),format=require('./src/math-format.js');
const near=(a,b)=>assert(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let states=0,formulas=0,externalPrices=0,externalBestResponses=0,allocationChecks=0,sharingChecks=0,stableAllocationChecks=0;const expected=[];
const improve={cost105:[0,0,0,0,0,0],external105:[0,0,1,1,1,1],price105:[0,0,0,0,0,0],convex105:[0,1,1,1,1,1],strong105:[0,1,1,1,1,1],boundary105:[0,1,1,0,1,1],redistribute105:[0,0,0,0,0,0]};
for(const key of welfareKeys){const c=welfareContent[key];assert(c.question&&c.conditions&&c.template&&c.trap&&c.source);assert.equal(c.steps.length,6);assert(c.proof.length>=4);
 for(const tex of format.splitMath(c.formula)){katex.renderToString(format.toTex(tex),{throwOnError:true,strict:'ignore'});formulas++;}
 for(let step=0;step<6;step++){
  const f=welfareStory(key,step),ck=f.check;assert(ck.valid);assert.equal(ck.paretoImprovement,!!improve[key][step],key+step);states++;
  for(let k=0;k<2;k++){near(ck.totals[k],f.assignment[0][k]+f.assignment[1][k]);assert(ck.totals[k]<=f.limit||f.view==='price');}
  f.assignment.forEach((a,i)=>{if(f.costs)near(f.costs[i],f.prices[0]*a[0]+f.prices[1]*a[1]);near(ck.gains[i],ck.after[i]-ck.before[i]);});
  expected.push({key,step,phase:c.steps[step][0],narration:c.steps[step][1],feasible:ck.feasible,allWeak:ck.allWeak,improvement:ck.paretoImprovement,allStrict:ck.allStrict,eq:f.demand?.eq??null,assignment:f.assignment,utilities:ck.after});
 }
}
// Independent LP derivation by comparing private utility at budget endpoints.
for(const p of [.0001,.2,.5,2/3,2/3-1e-10,2/3+1e-10,.8,1,1-1e-10,1+1e-10,1.2,3,100]){
 const r=welfareExternalDemand(p);externalPrices++;
 for(let i=0;i<2;i++){
  const w=i?1:p,coeff=i?[2,3]:[1,1],best=Math.max(coeff[0]*w/p,coeff[1]*w);
  for(const a of i?r.B:r.A){near(p*a[0]+a[1],w);near(coeff[0]*a[0]+coeff[1]*a[1],best);externalBestResponses++;}
  for(let n=0;n<=100;n++){const x=w/p*n/100,y=w*(1-n/100);assert(coeff[0]*x+coeff[1]*y<=best+1e-8);externalBestResponses++;}
 }
 assert.equal(r.eq,p>=2/3&&p<=1);
}
// At either tie price, feasibility forces the tied agent to take the endowment.
for(let n=0;n<=100;n++){
 const v=n/100,lowerA=[1,0],lowerB=[1.5*v,1-v],upperA=[1-v,v],upperB=[0,1];
 const lower=lowerA[0]+lowerB[0]===1&&lowerA[1]+lowerB[1]===1,upper=upperA[0]+upperB[0]===1&&upperA[1]+upperB[1]===1;assert.equal(lower,n===0);assert.equal(upper,n===0);allocationChecks+=2;
}
// Real externality gains, fixed total resources, and budget-spending failure.
for(let n=0;n<=200;n++){
 const t=n/200,A=[1-t,.5*t],B=[t,1-.5*t],r=welfareAssessment(['external','weighted'],[[1,0],[0,1]],[A,B],[1,1],true);
 assert(r.feasible);near(r.after[0],-1+.5*t);near(r.after[1],3+.5*t);assert.equal(r.allStrict,n>0);near(.8*A[0]+A[1]+.8*B[0]+B[1],1.8);allocationChecks++;
}
// Convex + interior: whole family of positive mixes and small transfers.
for(let n=1;n<100;n++){
 const l=n/100,d=Math.min(l,1-l)/4,c=[[1+l-d,1-l-d],[2-l+d,2+l+d]],r=welfareAssessment(['first','linear'],[[1,1],[2,2]],c,[3,3]);assert(r.feasible&&r.allStrict);assert(c.flat().every(x=>x>0));sharingChecks++;
}
// Strong monotonicity route works even when donor holds just one good.
for(let n=1;n<100;n++){
 const d=.5*n/100,c=[[d,2],[1-d,0]],r=welfareAssessment(['linear','weighted'],[[1,1],[0,1]],c,[1,2]);assert(r.feasible&&r.allStrict);sharingChecks++;
}
// Boundary counterexample: global resource bound, not only a searched witness.
for(let i=0;i<=100;i++)for(let j=0;j<=100;j++){
 const x=i/100,y=2*j/100,a=[[x,y],[1-x,2-y]],r=welfareAssessment(['min','second'],[[1,1.5],[0,.5]],a,[1,2]);assert(r.feasible);assert(r.after[0]<=1);assert(!r.allStrict);allocationChecks++;
 const linear=welfareAssessment(['linear','linear'],[[6,6],[4,4]],[[10*x,5*y],[10-10*x,10-5*y]],[10,10]);assert(!linear.paretoImprovement);near(linear.after[0]+linear.after[1],20);stableAllocationChecks++;
}
assert(welfareStory('boundary105',1).check.paretoImprovement);assert(!welfareStory('boundary105',3).check.allWeak);
const before=welfareStory('cost105',0),impossible=welfareStory('cost105',2);assert(before.check.feasible&&before.costs.every(x=>x===2));near(impossible.costs.reduce((a,b)=>a+b,0),4.4);assert(!impossible.check.feasible&&impossible.check.allWeak);
assert.throws(()=>welfareExternalDemand(0));assert.throws(()=>welfareStory('missing'));assert.equal(welfareStory('cost105',99).step,5);
const report={passed:true,states,formulas,externalPrices,externalBestResponses,allocationChecks,sharingChecks,stableAllocationChecks,scope:'All story states; independent budget LP endpoints, tie-price demand sets, external utility identities, sharing constructions and resource-bound counterexample; general proofs supplied separately'};
fs.writeFileSync('qa/exchange-welfare-models.json',JSON.stringify(report,null,2));fs.writeFileSync('qa/exchange-welfare-expected.json',JSON.stringify(expected,null,2));console.log(report);

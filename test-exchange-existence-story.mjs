import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {existenceKeys,existenceStory,existenceCurve,existenceBracket,existenceQuadraticCheck} from './src/exchange-existence-story.mjs';
import {existenceContent} from './src/exchange-existence-content.mjs';
import {equilibriumInspect} from './src/exchange-equilibrium-story.mjs';
const require=createRequire(import.meta.url),katex=require('./src/vendor/katex/katex.min.js'),formatter=require('./src/math-format.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let states=0,prices=0,utilityComparisons=0,complementMarkets=0,quadraticCases=0,formulas=0;const expected=[];
const eq={demand103:[0,0,1,0,0,1],continuity103:[0,0,0,0,0,null],root103:[0,0,0,0,0,1],bridge103:[0,1,1,1,0,1],multiple103:[null,null,null,null,null,null],nonunique103:[1,1,1,1,1,1],boundary103:[1,0,0,0,0,0]};
for(const key of existenceKeys){
 const c=existenceContent[key];assert(c.question&&c.conditions&&c.template&&c.trap&&c.source);assert.equal(c.steps.length,6);assert(c.proof.length>=3);
 for(const tex of formatter.splitMath(c.formula)){katex.renderToString(formatter.toTex(tex),{throwOnError:true,strict:'ignore'});formulas++;}
 for(let step=0;step<6;step++){
  const f=existenceStory(key,step);states++;assert.equal(f.check?.equilibrium??null,eq[key][step]===null?null:!!eq[key][step],`${key}:${step}`);
  if(f.check?.allBudgetLines)near(f.check.excessValue,0);
  if(f.assignment)assert(f.assignment.flat().every(v=>Number.isFinite(v)&&v>=0));
  if(f.view==='curve'){assert(f.price>=f.xRange[0]&&f.price<=f.xRange[1]);assert(f.value>=f.yRange[0]&&f.value<=f.yRange[1]);}
  if(key==='continuity103'&&step<2)near(f.value,existenceCurve(step?'B':'A',f.price));
  expected.push({key,step,phase:c.steps[step][0],equilibrium:f.check?.equilibrium??null,optimal:f.check?.individualOptimal??null,allocation:f.check?.allocation??null,price:f.price,value:f.value});
 }
}
// Independently derive individual optimum through expenditures rather than
// reproducing the model's price -> quantity calls. Check both markets/Walras.
for(let j=0;j<=200;j++){
 const p=.2+4.8*j/200,e=[[8,2],[2,8]],d=e.map(a=>{const w=p*a[0]+a[1];return[w/(2*p),w/2]});prices++;
 const r=equilibriumInspect('product',[p,1],e,d);assert(r.individualOptimal);near(r.excess[0],existenceCurve('sum',p));near(r.excess[1],5*p-5);near(p*r.excess[0]+r.excess[1],0);
 near(d[0][0]-8,existenceCurve('A',p));near(d[1][0]-2,existenceCurve('B',p));
 for(let i=0;i<2;i++){const w=p*e[i][0]+e[i][1],u=d[i][0]*d[i][1];for(let n=0;n<=100;n++){const spend=w*n/100;assert(spend/p*(w-spend)<=u+1e-8);utilityComparisons++;}}
}
for(const n of [0,1,2,3,4,8,16,24]){const b=existenceBracket(n);assert(b.low<=1&&b.high>=1);assert(existenceCurve('sum',b.low)>=0&&existenceCurve('sum',b.high)<=0);near(b.high-b.low,4.8/2**n);for(const q of b.steps)assert(q.mid>q.low&&q.mid<q.high);}
assert.deepEqual(existenceBracket(4).steps.map(x=>+x.mid.toFixed(8)),[2.6,1.4,.8,1.1]);
// Each completed frame shows the retained interval AFTER that frame's trial,
// matching the narration rather than showing the previous iteration's bracket.
for(let step=0;step<6;step++){
 const f=existenceStory('root103',step),b=[[.2,5],[.2,2.6],[.2,1.4],[.8,1.4],[.8,1.1],[.8,1.1]][step];near(f.interval.low,b[0]);near(f.interval.high,b[1]);
}
for(const p of [.2,.99,1,1.000000001,5])assert(existenceCurve('jump',p)!==0);
for(const p of [1,2,3])near(existenceCurve('multiple',p),0);
assert(existenceCurve('multiple',.5)>0&&existenceCurve('multiple',3.5)<0);
assert.throws(()=>existenceCurve('sum',0));assert.throws(()=>existenceStory('missing',0));
for(const a of [.25,.5,1,2,4])for(const b of [.25,.5,1,2,4]){
 const e=[[8,0],[0,8]],d=e.map(x=>{const q=(a*x[0]+b*x[1])/(a+b);return[q,q]});assert(equilibriumInspect('min',[a,b],e,d).equilibrium);complementMarkets++;
 const scaled=e.map(x=>{const q=(3*a*x[0]+3*b*x[1])/(3*a+3*b);return[q,q]});d.flat().forEach((v,i)=>near(v,scaled.flat()[i]));
}
// All four same-price corner assignments, and both unequal-price directions.
for(const a of [[3,0],[0,3]])for(const b of [[3,0],[0,3]]){const r=existenceQuadraticCheck([1,1],[[2,1],[2,1]],[a,b]);assert(r.individualOptimal&&!r.equilibrium);quadraticCases++;}
for(const p of [[2,1],[1,2],[.5,3],[3,.5]]){
 const w=2*p[0]+p[1],a=p[0]<p[1]?[w/p[0],0]:[0,w/p[1]],r=existenceQuadraticCheck(p,[[2,1],[2,1]],[a,a]);assert(r.individualOptimal&&!r.allocation);quadraticCases++;
 for(let k=0;k<=100;k++){const x=k/100*w/p[0],y=(w-p[0]*x)/p[1];assert(x*x+y*y<=r.people[0].best+1e-8);utilityComparisons++;}
}
for(const p of [[0,1],[1,0]]){const r=existenceQuadraticCheck(p,[[2,1],[2,1]],[[0,0],[0,0]]);assert(!r.individualOptimal);assert(r.people.every(x=>!x.attained));quadraticCases++;}
for(const a of [.25,1,2,7])for(const b of [.25,1,2,7]){assert(existenceQuadraticCheck([1,1],[[a,0],[0,b]],[[a,0],[0,b]]).equilibrium);quadraticCases++;}
fs.writeFileSync('qa/exchange-existence-expected.json',JSON.stringify(expected,null,2)+'\n');
const result={passed:true,states,prices,utilityComparisons,complementMarkets,quadraticCases,formulas,scope:'Section 10.3 seven stories, analytic identities and boundaries. Finite checks supplement the included general proofs. No complete Problem 5(d) certification.'};
fs.writeFileSync('qa/exchange-existence-models.json',JSON.stringify(result,null,2)+'\n');console.log(result);

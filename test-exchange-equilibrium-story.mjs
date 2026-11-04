import assert from 'node:assert/strict';
import fs from 'node:fs';
import {equilibriumStoryKeys,equilibriumStory,equilibriumBest,equilibriumInspect} from './src/exchange-equilibrium-story.mjs';
import {equilibriumStoryContent} from './src/exchange-equilibrium-content.mjs';
import {textbookExchange} from './src/economy.mjs';
import {createRequire} from 'node:module';
const katex=createRequire(import.meta.url)('./src/vendor/katex/katex.min.js');
const expected={gates102:[0,0,0,1,1,1],prices102:[0,0,1,1,1,1],linear102:[1,1,1,0,0,1],complements102:[0,0,0,1,1,1],surplus102:[1,1,1,0,1,1],destroy102:[1,1,1,1,1,1],walras102:[0,0,0,0,0,0],product102:[0,0,0,1,1,1]};
let states=0,gridComparisons=0,knownMarkets=0,zeroPriceSets=0,valueAccounts=0,formulas=0;
for(const key of equilibriumStoryKeys){
 const c=equilibriumStoryContent[key];assert.equal(c.steps.length,6);assert(c.conditions&&c.question&&c.proof.length>=3&&c.trap&&c.template&&c.source);
 const formatter=createRequire(import.meta.url)('./src/math-format.js');for(const tex of formatter.splitMath(c.formula)){katex.renderToString(formatter.toTex(tex),{throwOnError:true,strict:'ignore'});formulas++;}
 for(let s=0;s<6;s++){
  const f=equilibriumStory(key,s);states++;assert.equal(f.check.equilibrium,!!expected[key][s],`${key}:${s}`);
  for(const a of [...f.endowments,...(f.assignment||[])])assert(a.every(v=>v>=0&&v<=f.limit),'All finite plotted quantities stay in fixed viewport');
  if(f.check.allBudgetLines)assert(Math.abs(f.check.excessValue)<1e-7);
  if(f.check.allocation)assert(f.net.every((z,i)=>i===0||z.every((v,k)=>Math.abs(v+f.net[0][k])<1e-7)));
 }
}
// Independent brute-force budget comparisons: maximum grid utility is a lower
// bound on the continuous optimum, attained on grid when the known demand lies there.
for(const kind of ['linear','min','product'])for(const p of [[1,1],[2,1],[1,3],[.5,1]])for(const e of [[0,0],[8,0],[0,4],[2,3]]){
 const w=p[0]*e[0]+p[1]*e[1],check=equilibriumBest(kind,p,e,[0,0]);let bestGrid=-1;
 for(let x=0;x<=36;x+=.25)for(let y=0;y<=36;y+=.25){if(p[0]*x+p[1]*y>w+1e-8)continue;const u=kind==='linear'?x+y:kind==='min'?Math.min(x,y):x*y;assert(u<=check.best+1e-7);bestGrid=Math.max(bestGrid,u);gridComparisons++;}
 assert(bestGrid>=0);
 const a=kind==='linear'?(p[0]<=p[1]?[w/p[0],0]:[0,w/p[1]]):kind==='min'?[w/(p[0]+p[1]),w/(p[0]+p[1])]:[w/(2*p[0]),w/(2*p[1])];assert(equilibriumBest(kind,p,e,a).optimal);
}
// General textbook families over unequal, equal, and symmetric endowments.
for(const alpha of [.5,1,2,4,8,10])for(const beta of [.5,1,2,4,8,10]){
 const end=[[alpha,0],[0,beta]];
 for(const eps of [0,.25,.5,.75,1].map(t=>t*Math.min(alpha,beta))){assert(equilibriumInspect('linear',[1,1],end,[[alpha-eps,eps],[eps,beta-eps]]).equilibrium);knownMarkets++;}
 for(const r of [.25,.5,1,2,4]){
  const product=end.map(e=>{const w=r*e[0]+e[1];return [w/(2*r),w/2]});assert.equal(equilibriumInspect('product',[r,1],end,product).equilibrium,Math.abs(r-beta/alpha)<1e-8);knownMarkets++;
  const d=end.map(e=>{const q=(r*e[0]+e[1])/(r+1);return[q,q]});assert.equal(equilibriumInspect('min',[r,1],end,d).equilibrium,alpha===beta);knownMarkets++;
 }
 const eqp=beta/alpha;assert(equilibriumInspect('product',[eqp,1],end,[[alpha/2,beta/2],[alpha/2,beta/2]]).equilibrium);
 const zeroP=alpha>=beta?[0,1]:[1,0];
 for(let j=0;j<=20;j++){
  const share=j/20,legacy=textbookExchange('complements',{alpha,beta,t:zeroP[0],share});assert(equilibriumInspect('min',zeroP,end,legacy.bundles).equilibrium);zeroPriceSets++;
 }
 // Both zero-price directions when aggregate quantities coincide.
 if(alpha===beta)for(const p of [[0,1],[1,0]]){const a=p[0]===0?[[0,0],[alpha,beta]]:[[alpha,beta],[0,0]];assert(equilibriumInspect('min',p,end,a).equilibrium);zeroPriceSets++;}
}
for(const p of [[1,1],[2,1],[1,3]])for(let a=0;a<=8;a+=.5)for(let b=0;b<=4;b+=.5){
 const e=[[8,0],[0,4]],ay=(8-a)*p[0]/p[1],bx=(4-b)*p[1]/p[0],r=equilibriumInspect('min',p,e,[[a,ay],[bx,b]]);
 assert(r.allBudgetLines);assert(Math.abs(r.excessValue)<1e-7);assert.equal(r.clearing[0],r.clearing[1]);valueAccounts++;
}
const slack=equilibriumStory('walras102',4).check;assert(!slack.allBudgetLines);assert.deepEqual(slack.clearing,[true,false]);
const zero=equilibriumStory('walras102',5).check;assert(zero.individualOptimal&&zero.allBudgetLines);assert.deepEqual(zero.clearing,[false,true]);
assert(!equilibriumBest('linear',[0,1],[0,0],[100,0]).attained);
assert(equilibriumBest('product',[0,1],[8,0],[100,0]).optimal);
assert(!equilibriumBest('product',[0,1],[0,4],[100,4]).attained);
assert.throws(()=>equilibriumBest('min',[0,0],[1,1],[1,1]));
assert(!equilibriumBest('min',[1,1],[0,0],[-1,1]).affordable);
const result={passed:true,states,gridComparisons,knownMarkets,zeroPriceSets,valueAccounts,formulas,scope:'Section 10.2 eight six-step stories and analytic boundary checks. Finite tests supplement the general proofs, not a full-book or visual certification.'};
fs.writeFileSync('qa/exchange-equilibrium-models.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {exercise5Cases,p5Dot,p5Utility,p5Demand,p5Orthogonal,p5Hicks,p5FoodV,p5FoodMarginal,p5Food,p5Borrow,p5TimeUtility,p5TimeGradient,p5TimeDemand,p5TimeSwap} from './src/consumer-exercises.mjs';
let checks=0;const ok=(v,s)=>{checks++;assert.ok(v,s)},near=(a,b,s)=>ok(Math.abs(a-b)<1e-7,s),eq=(a,b,s)=>{checks++;assert.deepEqual(a,b,s)};
eq(Object.keys(exercise5Cases).length,14);
eq(p5Orthogonal(1,2,0).violation,false,'identical origin observations do not violate WARP');
for(const p of [.5,1,2,4])for(const q of [.5,1,2,4])for(const w of [0,1,10,20,30,60]){
 const lex=p5Demand('lex',p,q,w);eq(lex,[w/p,0]);
 for(const kind of ['cd','sqrt','cap','weak-cap'])for(const a of [.2,.5,.8]){const A=p5Demand(kind,p,q,w,a),u=p5Utility(kind,...A,a);near(p5Dot([p,q],A),w,'budget equality');ok(A.every(x=>x>=-1e-9),'nonnegative choice');for(let k=0;k<=100;k++){const B=[k/100*w/p,(1-k/100)*w/q];ok(p5Utility(kind,...B,a)<=u+1e-7,'global budget-line optimization')}if(kind==='cd')near(p*A[0],a*w,'exact CD spending fraction');if(kind==='cap')ok(A[0]<=10);if(kind==='sqrt'&&w>0)near(p*A[0]/(q*A[1]),q/p,'expenditure ratio not quantity ratio');}
 const o=p5Orthogonal(p,q,w);near(p5Dot([p,q],o.A),w);near(o.gap,w*(p-q)**2/(p*p+q*q));if(p!==q&&w>0)ok(o.cross.every(c=>c<w),'strict WARP counterexample');
}
for(const model of ['cd','linear','complement'])for(const p of [.5,1,2,4])for(const q of [.5,1,2,4])for(const ref of [[1,1],[2,3],[4,2]]){
 const h=p5Hicks(model,p,q,ref);near(p5Utility(model,...h.h),h.u,'target utility attained');
 const expected=model==='cd'?2*h.u*Math.sqrt(p*q):model==='linear'?h.u*Math.min(p,q):h.u*(p+q);near(h.e,expected,'independent closed-form expenditure');
 for(const delta of [.1,1,3])ok(p5Hicks(model,p+delta,q,ref).e>=h.e-1e-9,'expenditure nondecreasing');
 for(const lam of [.25,.5,2,3]){const b=p5Hicks(model,lam*p,lam*q,ref);near(b.e,lam*h.e,'degree-one homogeneity');b.h.forEach((x,i)=>near(x,h.h[i],'same chosen cost minimizer'));}
 for(let k=1;k<=100;k++){const x=h.h[0]+k/10,y=model==='cd'?h.u*h.u/x:model==='linear'?Math.max(0,h.u-x):Math.max(h.u,h.h[1]);if(p5Utility(model,x,y)>=h.u-1e-8)ok(p*x+q*y>=h.e-1e-8,'other upper-contour boundary not cheaper');}
}
near(p5Hicks('linear',3,1,[2,2]).e,p5Hicks('linear',2,1,[2,2]).e,'strict price rise can leave expense flat');
for(const kind of ['log','exp','linear'])for(const a of [1,2,4])for(const M of [1,5,12])for(const price of [.5,1,2,4]){
 const A=p5Food(kind,price,M,a);near(A.m+price*A.z,M);ok(A.interval[0]>=0&&A.interval[1]<=M/price+1e-9);
 for(let k=0;k<=200;k++){const z=M/price*k/200;ok(M-price*z+p5FoodV(kind,z,a)<=A.u+1e-8,'global food optimum with corners');}
 for(const delta of [.1,1,2]){const B=p5Food(kind,price+delta,M,a);ok(B.interval[1]<=A.interval[0]+1e-8,'any optimal high-price quantity <= any optimal low-price quantity');}
 if(A.z>0&&A.z<M/price)near(A.marginal,price,'interior marginal condition');
}
eq(p5Food('linear',2,12,2).interval,[0,6],'full optimal interval retained');
for(const r of [.05,.2,.8])for(const delta of [.05,.5,2])for(const y of [1,5,10])for(const a of [.2,.5,.65,.8]){
 const t=p5Borrow(r,r+delta,y,a);near(t.wealthGap,delta*(t.A.bundle[0]-y),'endowment-based compensation wealth');ok(t.C[0]<=t.A.bundle[0]+1e-8,'WARP compensated decrease');
 if(t.initiallyBorrows){ok(t.B.bundle[0]<t.C[0],'strict normality actual less than compensated');ok(t.B.borrow<t.A.borrow,'strict borrower decrease');}
 if(t.initiallyLends)ok(t.B.borrow<0,'lender remains lender');
 const fraction=.6,H=[y+fraction*(t.B.w/t.B.p-y),y*(1-fraction)];near(p5Dot([t.B.p,1],H),t.B.w);if(t.initiallyLends){ok(p5Dot([t.B.p,1],t.A.bundle)<t.B.w);ok(p5Dot([t.A.p,1],H)<t.A.w,'hypothetical borrower WARP cross-budget contradiction')}
}
const weak=p5Borrow(.1,.2,6,.65,'weak-cap');near(weak.A.borrow,4);near(weak.B.borrow,4,'weak-normality boundary permits unchanged borrowing');
for(const kind of ['neutral','weighted','cubic'])for(let x=0;x<=10;x+=.5)for(let y=0;y<=10;y+=.5){
 const u=p5TimeUtility(kind,x,y),g=p5TimeGradient(kind,x,y),h=1e-5;ok(g.every(v=>v>0),'strictly increasing utility');near((p5TimeUtility(kind,x+h,y)-p5TimeUtility(kind,x-h,y))/(2*h),g[0],'analytic first partial');near((p5TimeUtility(kind,x,y+h)-p5TimeUtility(kind,x,y-h))/(2*h),g[1],'analytic second partial');
 if(x>y){if(kind==='neutral')near(u,p5TimeUtility(kind,y,x),'time neutral reflection');else ok(u>p5TimeUtility(kind,y,x),'strict present bias');if(kind==='cubic')near(u-p5TimeUtility(kind,y,x),.04*(x-y)**3/(1+x+y)**2,'exact asymmetric cubic difference');}
 if(x===y)near(g[0]/g[1],kind==='weighted'?2:1,'MRS=1 with strict present bias is possible');
 const z=(x-y)/(1+x+y),f=1-.12*z*z+.02*z*z*z,df=-.24*z+.06*z*z,d2=-.24+.12*z;ok(f>=.86-1e-9&&Math.abs(df)<=.3+1e-9&&d2<0,'global concave-perspective bounds');
}
for(const kind of ['neutral','weighted','cubic'])for(const r of [-.8,-.5,0,.2,1,2])for(const y of [1,5,10]){
 const A=p5TimeDemand(kind,r,y),p=1+r,w=(2+r)*y,u=p5TimeUtility(kind,...A);near(p5Dot([p,1],A),w);if(r<=0&&kind!=='neutral')ok(A[0]>=A[1]-1e-8,'nonpositive rate implies present consumption at least future');for(let k=0;k<=200;k++){const B=[w/p*k/200,w*(1-k/200)];ok(p5TimeUtility(kind,...B)<=u+1e-8,'time demand is global maximum along budget')}
}
for(const model of ['weighted','cubic'])for(const r of [-.8,-.4,0])for(const y of [1,5,10])for(const fraction of [0,.2,.5,.9]){const t=p5TimeSwap(r,y,fraction,model);ok(t.A[1]>t.A[0]);ok(t.slack>=-1e-9,'swap affordable');ok(t.utilityGain>0,'swap strictly preferred');near(t.costs[1]-t.costs[0],r*(t.A[1]-t.A[0]));}
for(const s of [0,1,3])for(const gap of [.1,1,4])for(let i=0;i<=100;i++){const x=s+gap*i/100,y=(1+s)*(1+s+gap)/(1+x)-1;near(p5TimeUtility('neutral',x,y),p5TimeUtility('neutral',s,s+gap),'animated point follows exact indifference curve')}
const require=createRequire(import.meta.url),katex=require('./src/vendor/katex/katex.min.js'),math=require('./src/math-format.js');let formulas=0;
for(const x of fs.readFileSync('src/consumer-exercises-ui.js','utf8').matchAll(/String\.raw`([^`]+)`/g)){for(const tex of math.splitMath(x[1]))ok(katex.renderToString(math.toTex(tex),{output:'mathml',throwOnError:true}).includes('<math'),'actual UI formula render');formulas++}
const navigation=fs.readFileSync('dist/exercises.html','utf8');for(const route of ['lesson-5-6.html?case=p57b','lesson-5-6.html?case=p59c','lesson-16-3.html?case=p167b','lesson-16-2.html?case=p1610b'])ok(navigation.includes('href="'+route+'"'),'subparts in different sections link to actual evidence routes');
console.log(JSON.stringify({passed:true,checks,originalProblems:9,cases:14,formulas,spendingFlatBoundary:true,weakNormalBorrowingBoundary:true,strictPresentBiasWithUnitDiagonalMRS:true}));

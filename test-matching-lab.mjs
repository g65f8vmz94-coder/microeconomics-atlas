import assert from 'node:assert/strict';
import {examples,cases,gs,analysis,blockers,paretoDominates,permutations,capacityPrefs,capacityGS,capacityBlockers,roomPrefs,roomAssignments,roomBlockers} from './src/matching-lab.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},ok=x=>{assert.ok(x);checks++};
eq(Object.keys(cases).length,21);
const book=examples.book,bx=gs(book.X,book.Y,'X'),by=gs(book.X,book.Y,'Y');
eq(bx.matching,[0,2,1,3]);eq(by.matching,[0,2,1,3]);eq(bx.trace.length-1,3);eq(by.trace.length-1,5);
eq(bx.trace[1].rejections,[[2,3]]);eq(bx.trace[2].rejections,[[1,1]]);
const ex=examples.unstable,a=analysis(ex.X,ex.Y);eq(a.serial,[0,1,2]);eq(blockers(ex.X,ex.Y,a.serial),[[1,0],[2,0],[2,1]]);
ok(!a.all.some(m=>paretoDominates(ex.X,ex.Y,m,a.serial)));
for(const [key,p] of Object.entries(examples)){
 const x=gs(p.X,p.Y,'X'),y=gs(p.X,p.Y,'Y');
 ok(x.trace.length-1<=p.X.length*p.Y.length);ok(y.trace.length-1<=p.X.length*p.Y.length);
 eq(blockers(p.X,p.Y,x.matching).length,0);eq(blockers(p.X,p.Y,y.matching).length,0);
 ok(x.matching.every(i=>i>=0));
 if(p.X.length===p.Y.length){const aa=analysis(p.X,p.Y);ok(aa.stable.some(m=>JSON.stringify(m)===JSON.stringify(x.matching)));
  for(const m of aa.stable){
   for(let i=0;i<p.X.length;i++)ok(p.X[i].indexOf(x.matching[i])<=p.X[i].indexOf(m[i]));
   for(let j=0;j<p.Y.length;j++)ok(p.Y[j].indexOf(x.matching.indexOf(j))>=p.Y[j].indexOf(m.indexOf(j)));
  }
 }
}
eq(gs(examples.sameX.X,examples.sameX.Y,'X').trace.length-1,3);
eq(gs(examples.sameX.X,examples.sameX.Y,'X').matching,gs(examples.sameX.X,examples.sameX.Y,'Y').matching);
eq(gs(examples.oneA.X,examples.oneA.Y,'X').matching,gs(examples.oneA.X,examples.oneA.Y,'Y').matching);
ok(JSON.stringify(gs(examples.unequal.X,examples.unequal.Y,'X').matching)!==JSON.stringify(gs(examples.unequal.X,examples.unequal.Y,'Y').matching));
for(const key of ['oneA','unequal']){const p=examples[key];for(const side of ['X','Y']){const m=gs(p.X,p.Y,side).matching;for(let i=0;i<p.X.length;i++)ok(p.X[i].indexOf(m[i])<p.X.length)}}
const trueP=examples.manipulate,truth=gs(trueP.X,trueP.Y,'X').matching,lie=gs(trueP.X,[[1,2,0],...trueP.Y.slice(1)],'X').matching;
eq(truth,[0,1,2]);eq(lie,[1,0,2]);ok(trueP.Y[0].indexOf(lie.indexOf(0))<trueP.Y[0].indexOf(truth.indexOf(0)));
const wp=examples.weakPareto,wpGS=gs(wp.X,wp.Y,'X').matching,wpBetter=[1,2,0];eq(wpGS,[0,2,1]);
ok(wpBetter.some((y,i)=>wp.X[i].indexOf(y)<wp.X[i].indexOf(wpGS[i])));
ok(wpBetter.every((y,i)=>wp.X[i].indexOf(y)<=wp.X[i].indexOf(wpGS[i])));
ok(!analysis(wp.X,wp.Y).all.some(m=>m.every((y,i)=>wp.X[i].indexOf(y)<wp.X[i].indexOf(wpGS[i]))));
const cr=capacityGS(capacityPrefs.students,capacityPrefs.programs,2);eq(cr.matching,[0,2,0,1,1,2]);eq(capacityBlockers(capacityPrefs.students,capacityPrefs.programs,2,cr.matching),[]);
for(const m of roomAssignments)ok(roomBlockers(roomPrefs,m).length>0);
// Problem 18.4(c): every strict 2×3 profile, both proposal directions.
const aOrders=permutations([0,1,2]),bOrders=permutations([0,1]);
for(const a of aOrders)for(const b of aOrders)for(const c of bOrders)for(const d of bOrders)for(const e of bOrders){
 const X=[a,b],Y=[c,d,e];for(const side of ['X','Y']){
  const m=gs(X,Y,side).matching;ok(m.every(y=>y>=0));eq(blockers(X,Y,m),[]);
  for(let i=0;i<2;i++)ok(X[i].indexOf(m[i])<2);
 }
}
// Exhaust every 2×2 strict profile and sample the six-order 3×3 space.
for(const n of [2,3]){
 const ranks=permutations(Array.from({length:n},(_,i)=>i)),count=n===2?64:2400;
 let seed=17;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(let trial=0;trial<count;trial++){
  const X=Array.from({length:n},()=>ranks[Math.floor(random()*ranks.length)]),Y=Array.from({length:n},()=>ranks[Math.floor(random()*ranks.length)]),a=analysis(X,Y),mx=gs(X,Y,'X').matching,my=gs(X,Y,'Y').matching;
  ok(a.stable.length>0);eq(blockers(X,Y,mx),[]);eq(blockers(X,Y,my),[]);
  for(const m of a.stable){for(let i=0;i<n;i++)ok(X[i].indexOf(mx[i])<=X[i].indexOf(m[i]));for(let j=0;j<n;j++)ok(Y[j].indexOf(mx.indexOf(j))>=Y[j].indexOf(m.indexOf(j)))}
 }
}
console.log(JSON.stringify({checks,examples:Object.keys(examples).length,cases:Object.keys(cases).length,profilesSampled:2464,ok:true}));

import assert from 'node:assert/strict';
import {linearM,twoPartM,twoPartTeachingM} from './src/monopoly.mjs';
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-7,`${x} != ${y}`);
for(const [i,p,A,q,profit,accepted] of [[0,7,0,3,12.75,true],[1,7,4.5,3,17.25,true],[2,7,5.4,0,0,false],[3,7,4.5,3,17.25,true],[4,14/3,128/9,16/3,64/3,true]]){let f=twoPartTeachingM(i);near(f.p,p);near(f.r.A,A);near(f.r.q,q);near(f.r.profit,profit);assert.equal(f.r.accepted,accepted)}
for(let i=0;i<=400;i++){let f=twoPartTeachingM(i/100),r=twoPartM(f.m,f.p,f.factor);near(f.r.A,r.A);near(f.r.q,r.q);near(f.r.profit,r.profit);assert.equal(f.r.accepted,r.accepted);if(r.accepted){near(r.profit+r.consumerUtility,f.m.TS(r.q));assert.ok(r.A<=r.surplus+1e-7)}else{near(r.q,0);near(r.profit,0);near(r.consumerUtility,0)}assert.ok(r.profit<=f.m.TS(f.m.qc)+1e-7)}
let n=0;for(const a of [4,10,16])for(const b of [.5,1,2])for(const c of [0,2,4])for(const k of [0,.5,2]){const m=linearM({a,b,c,k});for(let i=0;i<=30;i++){const p=a*i/30;for(const t of [0,.5,1,1.01]){const r=twoPartM(m,p,t);assert.ok(r.profit<=m.TS(m.qc)+1e-7);if(r.accepted)near(r.profit+r.consumerUtility,m.TS(r.q));n++}}}
const equal=twoPartTeachingM(1),reject=twoPartTeachingM(2);assert.equal(equal.r.accepted,true);near(equal.r.consumerUtility,0);assert.equal(reject.r.accepted,false);assert.ok(reject.r.A>reject.r.surplus);near(equal.m.P(equal.m.qc),equal.m.MC(equal.m.qc));
console.log(JSON.stringify({passed:true,continuousStates:401,generalCases:n,participationTieAndRejection:true,profitUpperBound:true}));

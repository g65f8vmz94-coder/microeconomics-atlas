import assert from 'node:assert/strict';
import {segmentsM,segmentsTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const m=segmentsM(),frames=Array.from({length:5},(_,i)=>segmentsTeachingM(m,i));
assert.ok(frames[0].mr[0]>frames[0].mr[1]);near(frames[1].mr[0],frames[1].mr[1]);
assert.ok(frames[2].mr[0]<frames[2].mr[1]);near(frames[3].mr[0],m.mc);near(frames[3].mr[1],m.mc);
assert.ok(frames[1].profit>frames[0].profit&&frames[3].profit>frames[2].profit);
for(let j=0;j<=400;j++){
 const f=segmentsTeachingM(m,j/100);near(f.qs[0]+f.qs[1],m.Q);near(f.profit,m.profitAt(...f.qs));
 f.qs.forEach((q,i)=>{assert.ok(q>=0&&q<=m.A[i]/m.B[i]);near(f.mr[i],m.A[i]-2*m.B[i]*q)});
}
const closed=segmentsM({a1:100,a2:10,c:20,k:.4});assert.ok(closed.exit[1]);assert.match(segmentsTeachingM(closed,0).narration,/退出市场/);
console.log(JSON.stringify({passed:true,frames:5,transitionSamples:401,Q:m.Q,mc:m.mc,optimalQuantities:m.qs,closedMarketChecked:true}));

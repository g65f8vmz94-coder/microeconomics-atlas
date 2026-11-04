import assert from 'node:assert/strict';
import {linearM,linearTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const m=linearM(),frames=Array.from({length:5},(_,i)=>linearTeachingM(m,i));
assert.ok(frames[0].q<frames[1].q&&frames[1].q<frames[2].q);
near(frames[2].q,m.qm);near(frames[4].q,m.qm);
assert.ok(frames[3].q>m.qm&&frames[3].q<m.choke);
assert.ok(frames[0].mr>frames[0].mc&&frames[1].mr>frames[1].mc);
near(frames[2].mr,frames[2].mc);assert.ok(frames[3].mr<frames[3].mc);
assert.ok(frames[2].profit>frames[0].profit&&frames[2].profit>frames[1].profit&&frames[2].profit>frames[3].profit);
for(const f of frames){near(f.price,m.P(f.q));near(f.profit,m.profit(f.q));near(f.mr,m.MR(f.q));near(f.mc,m.MC(f.q));}
for(let j=0;j<=400;j++){const f=linearTeachingM(m,j/100);near(f.price,m.P(f.q));near(f.profit,m.profit(f.q));near(f.mr,m.MR(f.q));near(f.mc,m.MC(f.q));if(j%100)assert.match(f.narration,/产量正在变化/);}
const shut=linearTeachingM(linearM({a:10,b:1,c:10,k:.4}),3);assert.equal(shut.q,0);assert.equal(shut.price,null);assert.match(shut.narration,/没有实际成交价格/);
console.log(JSON.stringify({passed:true,frames:frames.length,transitionSamples:401,optimalQuantity:m.qm,optimalPrice:m.P(m.qm),boundaryChecked:true}));

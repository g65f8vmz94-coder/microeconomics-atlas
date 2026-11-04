import assert from 'node:assert/strict';
import { producerFrame, producerReadout } from './src/producer-story.mjs';
import { costsP, inverseP, costStaticsP, factoriesP } from './src/producer.mjs';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);
for (let i=0;i<3;i++) {
 const frame=producerFrame('inverse',i), s=frame.state;
 const z=inverseP(s.kind,s.A,s.w,s.y);
 near(z.f(z.a),z.y); near(z.cost,s.w*z.a);
 assert.ok(producerReadout('inverse',frame).includes('成本'));
}
const saturation=inverseP('saturating',2,1,1.8);
assert.equal(saturation.input(2),Infinity);
assert.ok(saturation.C(1.999)>saturation.C(1.9));

for (const name of ['costs','acproof','supply']) for(let i=0;i<3;i++) {
 const frame=producerFrame(name,i),s=frame.state;
 const z=costsP({F:s.F ?? 4,c:s.c ?? 1,k:s.k ?? 1,p:s.p ?? 5});
 assert.ok(producerReadout(name,frame));
 if(z.F>0) { near(z.AC(z.minACAt),z.MC(z.minACAt)); assert.ok(z.AC(z.minACAt-.5)>z.minAC);assert.ok(z.AC(z.minACAt+.5)>z.minAC); }
 if(name==='supply') { near(z.qProfit,4); near(z.profit(z.qProfit),4); near(z.qOutput,4+Math.sqrt(8)); near(z.profit(z.qOutput),0); }
}
const zero=costsP({F:0});assert.ok(zero.AC(2)>zero.AC(1));
const tiePrice=1+Math.sqrt(8),tie=costsP({F:4,c:1,k:1,p:tiePrice});
assert.equal(tie.tie,true); near(tie.profit(tie.qProfit),tie.profit(0));
// A valid increasing cost curve whose AC has a stationary inflection, not a minimum.
const AC=y=>10+(y-2)**3, MC=y=>AC(y)+3*y*(y-2)**2;
near(AC(2),MC(2));assert.ok(AC(1)<AC(2)&&AC(3)>AC(2));
for(let y=0;y<10;y+=.01)assert.ok(MC(y)>0);
for (let i=0;i<3;i++) {
 const frame=producerFrame('coststatic',i),s=frame.state;
 const z=costStaticsP({p:s.p,newP:s.case==='price'?s.newP:s.p,c:s.c,k:s.k,F:0,factor:s.case==='tech'?s.factor:1});
 near(z.before.qProfit,3);near(z.before.qOutput,6);
 near(z.after.qProfit,[3,5,7][i]);near(z.after.qOutput,[6,10,14][i]);
 assert.ok(producerReadout('coststatic',frame).includes(String(z.after.qOutput)));
 const f=producerFrame('factories',i),m=factoriesP(f.state.y,f.state.k,f.state.share);
 near(m.C(f.state.y),m.cost);near(m.threshold,2);
}
assert.deepEqual(factoriesP(2,2).optimal,[1,2]);
console.log(JSON.stringify({passed:true,inverseFrames:3,costFrames:9,staticFrames:3,factoryFrames:3,outputAtPrice5:4+Math.sqrt(8),stationaryInflectionChecked:true}));

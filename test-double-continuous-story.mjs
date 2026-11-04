import assert from 'node:assert/strict';
import {doubleMarginsM,doubleMarginsTeachingM} from './src/monopoly.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const frames=Array.from({length:5},(_,i)=>doubleMarginsTeachingM(i)),base=doubleMarginsM();
assert.ok(frames[0].direct);near(base.direct.q,1/4);near(base.direct.p,3/4);near(base.direct.profit,1/8);
near(frames[1].wholesale,1/2);near(frames[1].outcome.current.q,1/4);
near(frames[2].wholesale,2/3);near(frames[2].outcome.current.q,1/6);near(frames[2].outcome.current.retail,5/6);near(frames[2].outcome.current.producer,1/12);near(frames[2].outcome.current.retailer,1/36);
near(frames[3].wholesale,.8);near(frames[3].outcome.current.q,.1);near(frames[3].outcome.current.producer,.07);
let transitions=0;
for(let i=0;i<=400;i++){
 const f=doubleMarginsTeachingM(i/100);if(f.direct){assert.equal(f.wholesale,null);continue;}
 const r=doubleMarginsM({wholesale:f.wholesale});near(f.outcome.current.q,r.current.q);near(f.outcome.current.producer,r.current.producer);near(f.outcome.current.retailer,r.current.retailer);near(r.current.retail,1-r.current.q);transitions++;
}
let comparisons=0,zeroOutput=false;
for(const A of [.5,1,2])for(const B of [.5,1,2])for(const C of [q=>q*q,q=>.12*q+.4*Math.max(0,q-.2),q=>0,q=>3*q]){
 const n=400,step=A/B/n,D=q=>A*q-B*q*q-C(q),I=q=>A*q-2*B*q*q-C(q);
 let direct=0,indirect=0;for(let i=0;i<=n;i++){const q=i*step;if(D(q)>D(direct)+1e-12)direct=q;if(i<=n/2&&I(q)>I(indirect)+1e-12)indirect=q;}
 assert.ok(indirect<=direct+1e-8,`${indirect} > ${direct}`);if(direct===0&&indirect===0)zeroOutput=true;
 if(indirect>direct)assert.ok(D(indirect)-D(direct)>=B*(indirect**2-direct**2)-1e-8);
 comparisons++;
}
assert.ok(zeroOutput);
console.log(JSON.stringify({passed:true,frames:5,continuousStates:transitions,convexCostCases:comparisons,kinkAndShutdownChecked:true}));

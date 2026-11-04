import assert from 'node:assert/strict';
import {cases,casesBySection,service,servicePareto,cars,fishing,raffle,matching,survival,health} from './src/expectations.mjs';
const near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<eps,String(a)+' versus '+String(b));
const ids=Object.values(casesBySection).flat();
assert.equal(ids.length,32);
assert.equal(new Set(ids).size,ids.length);
for(const id of ids){
 assert.ok(cases[id]?.label&&cases[id]?.page&&cases[id]?.kind&&cases[id]?.note,id);
}
for(const a of [.3,.7,1,1.8])for(const b of [.4,1,2,2.8]){
 const r=service({a,b,z:.45});
 const fixed=service({a,b,z:r.eq});
 near(fixed.left(r.eq),fixed.right(r.eq));
 near(r.eq,fixed.cut);
 assert.ok(r.eq>0&&r.eq<1);
 assert.ok(r.eqLoss>=r.socialLoss-1e-9);
 near(r.aggregate(r.social),r.socialLoss);
}
const base=service({a:1,b:2,z:.5});
near(base.eq,.6);near(base.social,.625);
const baseFixed=service({a:1,b:2,z:base.eq});
near(baseFixed.left(base.eq),baseFixed.right(base.eq));
near(service({a:1,b:2,z:.5,lambda:2,mode:'all'}).eq,base.eq);
assert.notEqual(service({a:1,b:2,z:.5,lambda:2,mode:'wait'}).eq,base.eq);
for(const shift of [-.2,-.1,.1,.2]){
 const r=servicePareto({shift});
 assert.ok(r.worse,'Pareto witness '+shift);
}
assert.equal(servicePareto({shift:0}).worse,false);
const faster=service({a:.5,b:2,z:.5});
assert.ok(faster.eq>base.eq);
assert.ok(faster.eqWait[0]<faster.eqWait[1]);
const car=cars();
assert.deepEqual(car.q,[.05,.1,.2,.6,.8,1]);
assert.equal(car.maximal.n,2);
assert.equal(car.chosen.valid,true);
for(const candidate of car.candidates){
 near(candidate.p,1.5*candidate.mean);
 if(candidate.valid)assert.ok(candidate.sellsAccepted&&candidate.excludedStay);
}
assert.ok(cars({m:2}).untraded.length>0);
assert.ok(cars({m:2}).lostGain>0);
assert.equal(cars({noTrade:true}).chosen.n,0);
const fish=fishing();
near(fish.eqT,6);near(fish.c,fish.v);near(fish.p,fish.v);
assert.equal(fish.clears,true);assert.equal(fish.beliefCorrect,true);
const fishPareto=fishing({mode:'pareto'});
assert.ok(fishPareto.consumer>fish.consumer);
assert.ok(fishPareto.fisher>fish.fisher);
assert.ok(fishPareto.totalSurplus>fish.totalSurplus);
const fishTax=fishing({mode:'tax',rebate:true});
assert.ok(fishTax.consumer>0&&fishTax.fisher>0);
near(fishTax.revenue,fishTax.transfer*(fishTax.fishers+fishTax.consumers));
const fishNoRebate=fishing({mode:'tax',rebate:false});
near(fishNoRebate.consumer,0);near(fishNoRebate.fisher,0);
const draw=raffle();
near(draw.fixed,300);near(draw.utilityL,draw.utilityH);assert.equal(draw.consistent,true);
assert.equal(raffle({guess:250}).consistent,false);
const venue=matching();
near(venue.p[0],2/3);near(venue.p[1],2/3);
near(venue.q[0],1);near(venue.q[1],1);
assert.equal(venue.correctedEquilibrium,true);
assert.equal(venue.printedNormalization,false);
assert.equal(matching({oneVenue:true}).correctedEquilibrium,true);
assert.equal(matching({a:4,b:4,oneVenue:true}).printedNormalization,true);
for(const y of [0,.5,1,2])for(const s of [0,.5,1,2]){
 const p=survival(y,s);
 assert.ok(p>0&&p<1);
 assert.ok(survival(y+.1,s)>p&&survival(y,s+.1)>p);
}
const h=health();
assert.ok(h.privateY<h.socialY);
assert.ok(h.socialUtility>h.privateUtility);
near(h.privateFOC,0,1e-6);
assert.ok(h.socialMarginalAtPrivate>0);
console.log('Chapter 13: 32 cases, bank, cars, fish, raffle, matching, health checked');

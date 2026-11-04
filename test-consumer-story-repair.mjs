import assert from 'node:assert/strict';
import {demandC,normalMRSC,slutskyC,warpC,utilityC} from './src/consumer.mjs';
import {consumerFrame,consumerReadout} from './src/consumer-story.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const n=normalMRSC('cd',1,1,8,4,.5);
assert.deepEqual(n.old.bundle,[4,4]);assert.deepEqual(n.vertical,[4,8]);assert.deepEqual(n.next.bundle,[6,6]);
near(n.mrsOld,1);near(n.mrsVertical,2);
const a={prices:[1,2],w:12,bundle:[0,6]},b={prices:[2,1],w:12,bundle:[6,0]},z=warpC(a,b);
assert.deepEqual(z.cross,[6,6]);assert.equal(z.violation,true);assert.deepEqual(z.strict,[true,true]);
// Mutually affordable with no strict budget slack is not a WARP violation by this definition.
const tie=warpC({prices:[1,1],w:2,bundle:[2,0]},{prices:[1,1],w:2,bundle:[0,2]});
assert.deepEqual(tie.affordable,[true,true]);assert.deepEqual(tie.strict,[false,false]);assert.equal(tie.violation,false);
for(const p of [1.1,1.2,1.5,1.7,1.8]){
 const x=demandC('giffen',p,1,10);near(x.bundle[0],2/(3-p));near(x.spending,10);
 near(3*x.bundle[0]+x.bundle[1],12);near(x.u,utilityC('giffen',...x.bundle));
}
for(let i=0;i<3;i++){const f=consumerFrame('giffen',i),x=demandC('giffen',f.state.p,1,10);assert.ok(consumerReadout('giffen',f).includes(x.bundle[0].toFixed(2).replace(/0$/,'')));}
const s=slutskyC('product',1,2,1,12);assert.deepEqual(s.A.bundle,[6,6]);assert.deepEqual(s.B.bundle,[4.5,9]);assert.deepEqual(s.C.bundle,[3,6]);
assert.deepEqual([s.sub,s.income,s.total],[-1.5,-1.5,-3]);
console.log(JSON.stringify({passed:true,warpStrictBoundary:true,normalMRS:[n.mrsOld,n.mrsVertical],giffenPrices:5,slutsky:true}));

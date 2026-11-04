import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {priceProofP,finitePlansP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(producerStories.priceproof.frames.length,4);
for(let i=0;i<=110;i++){const phase=i/110,f=producerFrame('priceproof',phase),w=f.state.newPrice,z=priceProofP({p:1,w:1,other:w,which:'w',i:3,j:0});near(w,1+1.1*phase);const profits=finitePlansP.map(x=>x.y-w*x.a),best=Math.max(...profits);for(const id of z.after.winners)near(profits[id],best);for(const id of z.after.winners){const v=priceProofP({p:1,w:1,other:w,which:'w',i:3,j:id});assert.ok(v.first>=-1e-8&&v.second>=-1e-8);near(v.first+v.second,(w-1)*(3-finitePlansP[id].a));}assert.ok(producerReadout('priceproof',f).includes('当前最优'));}
const tie=producerFrame('priceproof',10/11),z=priceProofP({p:1,w:1,other:tie.state.newPrice,which:'w'});near(tie.state.newPrice,2);assert.deepEqual(z.after.winners,[0,1,3]);
const end=priceProofP({p:1,w:1,other:2.1,which:'w',i:3,j:0});near(end.first,3);near(end.second,.3);near(end.first+end.second,3.3);
for(const phase of [1.5,2.5])assert.equal(producerFrame('priceproof',phase).state.newPrice,2.1);
console.log(JSON.stringify({passed:true,transitionStates:111,tieWinners:z.after.winners,inequalitySum:3.3}));

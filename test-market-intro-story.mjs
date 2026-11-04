import assert from 'node:assert/strict';
import {marketIntroStory,example91,example92,identity,checkEquilibrium,paretoImprovements} from './src/market.mjs';
const independent=(prefs,allocation,price)=>new Set(allocation).size===4&&identity.every(i=>allocation[i]===prefs[i].find(h=>price[h]<=price[i]));
const a=[2,3,0,1],b=[3,0,2,1];let count=0,bCount=0;
for(let A=0;A<=3;A++)for(let B=0;B<=3;B++)for(let C=0;C<=3;C++)for(let D=0;D<=3;D++){
 const p=[A,B,C,D];assert.equal(checkEquilibrium(example92,identity,a,p,identity),independent(example92,a,p));assert.equal(checkEquilibrium(example92,identity,b,p,identity),independent(example92,b,p));if(independent(example92,a,p))count++;if(independent(example92,b,p))bCount++;
}
assert.equal(count,0);assert(bCount>0);assert(checkEquilibrium(example92,identity,b,[4,4,3,4],identity));assert.equal(paretoImprovements(example92,a).length,0);
assert.deepEqual(example91,[[1,2,3,0],[0,1,2,3],[0,2,3,1],[0,3,1,2]]);
assert.deepEqual(example92,[[3,2,0,1],[0,3,2,1],[0,2,3,1],[1,2,3,0]]);
for(const k of ['d91','e91','e92','d92','e93'])for(let t=0;t<6;t++){const v=marketIntroStory(k,t);assert.equal(v.step,t);assert(v.narration);assert.equal(v.initial.length,4);if(k==='d92'&&t<5)assert.equal(v.equilibrium,null);}
assert.deepEqual(marketIntroStory('e92',2).displayed,a);assert.deepEqual(marketIntroStory('e92',4).displayed,b);
assert.deepEqual(marketIntroStory('d92',5).displayed,b);assert.equal(marketIntroStory('d92',5).equilibrium,true);
assert.equal(marketIntroStory('e93',3).choices[0],3);assert.equal(marketIntroStory('e93',4).choices[1],0);assert.equal(marketIntroStory('e93',5).equilibrium,true);
console.log(JSON.stringify({storyStates:30,priceSystems:256,allocationA:count,allocationB:bCount,pairwiseExampleAndPriceCases:true}));

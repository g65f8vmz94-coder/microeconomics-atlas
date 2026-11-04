import assert from 'node:assert/strict';
import {strategicEconomicsKeys,strategicEconomicsContent} from './src/strategic-economics-content.mjs';
import {economicStory,auctionPayoff,firstPriceTwoBidNE} from './src/strategic-economics-story.mjs';
import {cournot,locationShares,bertrand} from './src/games.mjs';

assert.equal(strategicEconomicsKeys.length,14);
for(const key of strategicEconomicsKeys){
 const content=strategicEconomicsContent[key];assert.equal(content.steps.length,6,key);
 assert.ok(content.question&&content.conditions&&content.formula&&content.proof.length&&content.template&&content.source,key);
 for(let i=0;i<6;i++){const frame=economicStory(key,i);assert.equal(frame.key,key);assert.equal(frame.step,i);assert.ok(frame.identity&&frame.narration,key+' '+i);}
}
assert.equal(auctionPayoff('first',[8,2]).bookIffCandidate,true);
assert.equal(firstPriceTwoBidNE([8,2]),false);
assert.deepEqual(auctionPayoff('first',[8,2]).u,[2,0]);
assert.deepEqual(auctionPayoff('first',[2,2]).u,[8,0]);
for(const p of [5,7,10])assert.equal(firstPriceTwoBidNE([p,p]),true);
for(const pair of [[4.9,4.9],[8,2],[10.1,10.1]])assert.equal(firstPriceTwoBidNE(pair),false);
for(const pair of [[7,7],[8,2],[3,12],[10,5]])assert.equal(auctionPayoff('second',pair).ne,true);
assert.equal(auctionPayoff('second',[3,12]).payment,3);
assert.equal(auctionPayoff('second',[3,12]).u[1],2);
assert.deepEqual(locationShares([.5,.5]).shares,[.5,.5]);
for(const key of ['location','location3'])for(let i=0;i<6;i++){const f=economicStory(key,i);if(f.deviation)assert.ok(f.deviation.gain>0,key+' '+i);}
assert.deepEqual(economicStory('effort',4).model.equilibrium,[1,1]);
assert.equal(cournot(1,1,0).ne,true);
assert.equal(cournot(1/3,1/3,0).ne,true);
assert.equal(cournot(1,1,.2).ne,false);
for(let i=0;i<6;i++){const f=economicStory('cournotN',i);assert.ok(Math.abs(f.profit-f.q*f.q)<1e-12);assert.ok(f.price>f.c);if(i)assert.ok(f.price<economicStory('cournotN',i-1).price);}
assert.equal(bertrand(.2,.2,.2).ne,true);
assert.equal(bertrand(.5,.5,.2).ne,false);
console.log({passed:true,cases:14,frames:84,sourceBoundaryChecks:2});

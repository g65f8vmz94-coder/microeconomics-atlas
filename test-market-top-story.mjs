import assert from 'node:assert/strict';
import {marketTopStory,topTrading,identity,permutations,example91,example92} from './src/market.mjs';
const orders=permutations(identity),rot=i=>identity.slice(i).concat(identity.slice(0,i));let profiles=0,runs=0;
for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++)for(let d=0;d<4;d++){
 const prefs=[rot(a),rot(b),rot(c),rot(d)], outcomes=new Set();profiles++;
 for(const order of orders){const r=topTrading(prefs,identity,order);runs++;assert.equal(new Set(r.allocation).size,4);
  for(let i=0;i<4;i++){const affordable=identity.filter(h=>r.price[h]<=r.price[i]),best=prefs[i].find(h=>affordable.includes(h));assert.equal(r.allocation[i],best)}
  for(let j=0;j<r.rounds.length;j++){const round=r.rounds[j];assert(round.cycle.length>0);for(const i of round.cycle){const available=round.active.map(x=>identity[x]);const best=prefs[i].find(h=>available.includes(h));assert.equal(round.allocation[i],best);assert.equal(round.price[i],round.level)}if(j)assert(r.rounds[j-1].level>round.level)}
  outcomes.add(r.allocation.join(','));
 }
 assert.equal(outcomes.size,1,'different cycle orders must preserve allocation under strict preferences');
}
for(const k of ['d94','proc91','proc92','q92','e96','e97','wealth'])for(let n=0;n<6;n++){const f=marketTopStory(k,n);assert.equal(f.step,n);assert(f.narration);if(f.complete){assert.equal(new Set(f.allocation).size,4);for(let i=0;i<4;i++)assert.equal(f.allocation[i],f.prefs[i].find(h=>f.prices[h]<=f.prices[i]));}else assert(f.allocation.some(x=>x<0));}
assert.deepEqual(marketTopStory('proc91',3).arrows,[[2,0],[0,1],[1,0]]);assert.deepEqual(marketTopStory('proc91',3).circle,[0,1]);
assert.deepEqual(marketTopStory('e96',2).allocation,[1,0,2,3]);assert.deepEqual(marketTopStory('e96',4).allocation,[1,0,2,3]);assert.deepEqual(marketTopStory('e96',2).prices,[4,4,3,2]);assert.deepEqual(marketTopStory('e96',4).prices,[4,4,2,3]);
const rich=marketTopStory('wealth',5);assert.deepEqual(rich.prefs.map(p=>p[0]),[0,0,0,3]);assert.deepEqual(rich.prices,[3,2,1,4]);assert.deepEqual(rich.allocation,[0,1,2,3]);assert(rich.prices[3]>rich.prices[0]);const richAlt=topTrading(rich.prefs,identity,[0,3,1,2]);assert.deepEqual(richAlt.allocation,rich.allocation);assert(richAlt.price[0]>richAlt.price[3]);
assert.deepEqual(marketTopStory('e97',4).allocation,[3,0,2,1]);assert.deepEqual(marketTopStory('e97',4).prices,[4,4,3,4]);
assert.deepEqual(topTrading(example91,identity,[2,0,1,3]).rounds[0].path,[2,0,1]);assert.deepEqual(topTrading(example92,identity,identity).rounds[0].cycle,[0,3,1]);
console.log(JSON.stringify({storyStates:42,profiles,orderRuns:runs,tailAndExampleChecks:true,priceOrderAndBudget:true}));

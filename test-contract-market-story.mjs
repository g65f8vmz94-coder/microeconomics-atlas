import assert from 'node:assert/strict';
import {contractEquilibrium,contractMarketStory} from './src/contract-market-story.mjs';
import {contractMarketContent,contractMarketKeys} from './src/contract-market-content.mjs';

let checks=0;
for(const v of [0.5,1,4,8,13]){
  const wages=[0,v/4,v/2,v,1.25*v];
  const menus=[[]];for(const x of wages)menus.push([x]);for(let i=0;i<wages.length;i++)for(let j=i+1;j<wages.length;j++)menus.push([wages[i],wages[j]]);
  for(const W of menus){const r=contractEquilibrium(W,v),expected=W.length===1&&W[0]===v;assert.equal(r.equilibrium,expected,`v=${v}, W=${W}`);if(r.witness!==null){assert.ok(r.witness>Math.max(0,...W));assert.ok(r.witness<v);assert.ok(v-r.witness>0);}checks++;}
}
for(const key of contractMarketKeys){assert.equal(contractMarketContent[key].steps.length,6);for(let step=0;step<6;step++){const f=contractMarketStory(key,step);assert.equal(f.identity,contractMarketContent[key].steps[step][0]);assert.equal(f.narration,contractMarketContent[key].steps[step][1]);assert.ok(f.W.every(w=>w>=0));if(f.entryChosen)assert.ok(f.entry>Math.max(0,...f.W)||f.W.length===0);checks++;}}
assert.equal(contractMarketStory('simple',2).entryProfit,1.5);
assert.equal(contractMarketStory('simpleEntry',0).market.III,false);
assert.equal(contractMarketStory('simpleEntry',1).market.I,false);
assert.equal(contractMarketStory('simpleEntry',2).market.II,false);
assert.equal(contractMarketStory('simpleEntry',5).market.equilibrium,true);
console.log({passed:true,checks,frames:12,menus:80});

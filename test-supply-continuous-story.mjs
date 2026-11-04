import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {costsP} from './src/producer.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const min=1+Math.sqrt(8);assert.equal(producerStories.supply.frames.length,6);
for(let i=0;i<6;i++){const f=producerFrame('supply',i);assert.ok(producerReadout('supply',f));if(i===3)near(f.state.p,min);}
let transitionChecks=0;
for(let base=0;base<5;base++)for(let k=1;k<100;k++){
 const t=k/100,s=producerFrame('supply',base+t).state,z=costsP({F:4,c:1,k:1,p:s.p});
 if(base<2){near(s.p,5);near(z.qProfit,4);near(z.qOutput,4+Math.sqrt(8));}
 if(base===2){near(s.p,5+(min-5)*t);assert.ok(z.qProfit>0&&z.qOutput!==null);near(z.MC(z.qProfit),s.p);near(z.AC(z.qOutput),s.p);assert.ok(z.profit(z.qProfit)>=-1e-8);}
 if(base===3){near(s.p,min+(3-min)*t);assert.equal(z.qProfit,0);assert.equal(z.qOutput,null);}
 if(base===4)near(s.p,3);
 transitionChecks++;
}
const at=costsP({F:4,c:1,k:1,p:min});assert.equal(at.tie,true);near(at.qProfit,Math.sqrt(8));near(at.qOutput,Math.sqrt(8),1e-7);near(at.profit(at.qProfit),0);
for(const p of [2,3,min,4,5,6]){const z=costsP({F:4,c:1,k:1,p});for(let i=1;i<=10000;i++){const y=i/1000;assert.ok(z.profit(z.qProfit)+1e-7>=z.profit(y));if(z.qOutput!==null&&y>z.qOutput+1e-7)assert.ok(z.profit(y)<1e-7);}}
console.log(JSON.stringify({passed:true,frames:6,transitionChecks,independentGridComparisons:60000,tieOutput:Math.sqrt(8)}));

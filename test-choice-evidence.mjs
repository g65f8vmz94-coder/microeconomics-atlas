import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evCameras,evDominates,evRows,evDistribution,evExpected,evDominance,evFrameCells,evMental,evPairedLowerBound,evRates,evLastPhase} from './src/choice-evidence.mjs';
import {evContent} from './src/choice-evidence-content.mjs';
let checks=0;const eq=(a,b,msg)=>{checks++;assert.deepEqual(a,b,msg)},ok=(a,msg)=>{checks++;assert.ok(a,msg)};
eq(evCameras,[{id:'A',rating:9.1,megapixels:6},{id:'B',rating:8.3,megapixels:9},{id:'C',rating:8.1,megapixels:7}]);
eq(evCameras.flatMap(a=>evCameras.filter(b=>evDominates(a,b)).map(b=>a.id+b.id)),['BC']);
eq(evRates.attention,{AB:[48,52],ABC:[30,68,2]});eq(evRates.framing,{A:51,D:93});eq(evRates.mental,{ticket:65,cash:79});
// Independent transcription of the original two source tables.
const source={A:[['白',90,0],['红',6,45],['绿',1,30],['黄',3,-15]],B:[['白',90,0],['红',7,45],['绿',1,-10],['黄',2,-15]],C:[['白',90,0],['红',6,45],['黑',1,30],['绿',1,-15],['黄',2,-15]],D:[['白',90,0],['红',6,45],['黑',1,45],['绿',1,-10],['黄',2,-15]]};
for(const label of Object.keys(source)){eq(evRows(label).map(r=>[r.color,r.percent,r.payoff]),source[label]);eq(evRows(label).reduce((s,r)=>s+r.percent,0),100);eq(new Set(evFrameCells(label).map(r=>r.id)).size,evRows(label).length);}
const ac=[{payoff:-15,percent:3},{payoff:0,percent:90},{payoff:30,percent:1},{payoff:45,percent:6}],bd=[{payoff:-15,percent:2},{payoff:-10,percent:1},{payoff:0,percent:90},{payoff:45,percent:7}];
for(const k of ['A','C']){eq(evDistribution(k),ac);eq(evExpected(k),2.55)}for(const k of ['B','D']){eq(evDistribution(k),bd);eq(evExpected(k),2.75)}
eq(evDominance().map(r=>[r.percent,r.gain,r.aligned]),[[90,0,true],[6,0,true],[1,15,true],[1,5,true],[2,0,true]]);
// A's yellow3% becomes green1% plus yellow2%, both paying-15.
eq(evRows('C').filter(r=>r.payoff===-15).reduce((s,r)=>s+r.percent,0),3);
// B's red7% becomes red6% plus black1%, both paying45.
eq(evRows('D').filter(r=>r.payoff===45).reduce((s,r)=>s+r.percent,0),7);
// Evaluate several increasing utility functions on100 equally weighted atoms.
// This checks distribution identity independently of event names/partition.
for(const u of [x=>x,x=>Math.sqrt(x+16),x=>Math.log(x+16),x=>-Math.exp(-x/20),x=>x**3]){
 const means=Object.fromEntries(Object.entries(source).map(([k,rows])=>[k,rows.flatMap(([,p,x])=>Array(p).fill(x)).reduce((s,x)=>s+u(x),0)/100]));
 ok(Math.abs(means.A-means.C)<1e-8);ok(Math.abs(means.B-means.D)<1e-8);ok(means.D>means.C);
}
for(const price of [0,.25,1,40,60,100,1000]){const v=evMental(price);eq(v.buy,{wealthChange:-2*price,attends:true});eq(v.skip,{wealthChange:-price,attends:false});eq(v.skip.wealthChange-v.buy.wealthChange,price);eq(v.additionalBuy-v.additionalSkip,price);eq(v.alreadyLost,price);}
for(const bad of [-1,NaN,Infinity]){checks++;assert.throws(()=>evMental(bad));}
// Construct all feasible2x2 paired tables for selected marginals, rather than
// treating the source's two survey percentages as an observed individual path.
for(const [p,q]of [[51,93],[0,93],[100,93],[48,68],[65,79],[50,50]]){const candidates=[];for(let joint=0;joint<=100;joint++){const cells=[joint,p-joint,q-joint,100-p-q+joint];if(cells.every(x=>x>=0))candidates.push(joint);}eq(evPairedLowerBound(p,q),Math.min(...candidates));}
eq(evPairedLowerBound(51,93),44);eq([44+7,44+49,44+7+49], [51,93,100]);
for(const [mode,c]of Object.entries(evContent)){eq(c.phases.length,evLastPhase[mode]+1);ok(c.intro.length>40&&c.end.length>40);ok(c.proofs.length>=4);}
fs.writeFileSync('qa/choice-evidence-models.json',JSON.stringify({passed:true,checks,sourceTables:'Independent transcription of printed25–26',scope:'Three source examples; exact probabilities, payout distributions, common partition dominance, wealth accounting, conditional paired lower bounds. No fabricated individual survey records.',wholeBookComplete:false},null,2));console.log({passed:true,checks});

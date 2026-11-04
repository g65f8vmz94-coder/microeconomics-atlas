import assert from 'node:assert/strict';
import {cases,casesBySection,simpleWage,workerChoice,signal,certificate,schoolChoice,schools} from './src/signaling-lab.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' ≠ '+b);
assert.equal(casesBySection['14.1'].length,2);
assert.equal(casesBySection['14.2'].length,19);
for(const ids of Object.values(casesBySection))for(const id of ids)assert.ok(cases[id]?.page);
let wage=simpleWage({v:8,w:5,entry:6});
assert.equal(wage.entryChosen,true);near(wage.entryProfit,2);
assert.equal(simpleWage({v:8,w:8,entry:9}).entrantWitness,null);
assert.equal(simpleWage({v:8,w:9,entry:10}).currentViable,false);
const low=signal({alphaL:.65}),high=signal({alphaL:.2}),edge=signal({alphaL:1/3});
near(low.tH,2);near(low.m,8);near(low.threshold,1/3);
assert.equal(low.choices.L.id,'L');assert.equal(low.choices.H.id,'H');
assert.equal(low.equilibrium,true);assert.equal(high.equilibrium,false);assert.equal(edge.equilibrium,true);
assert.equal(high.separatingWitness.profit>0,true);
assert.equal(low.poolingWitness.H,'H专属');assert.equal(low.poolingWitness.L,'混同');
assert.equal(low.poolingWitness.profit>0,true);
assert.equal(workerChoice([{id:'L',t:0,w:4},{id:'H',t:2,w:10}],3).id,'L');
assert.equal(workerChoice([{id:'L',t:0,w:4},{id:'H',t:2,w:10}],1).id,'H');
let cert=certificate({pPlus:20,pMinus:10});
assert.equal(cert.choiceH,'+');assert.equal(cert.choiceL,'-');
near(cert.profitPlus,0);near(cert.profitMinus,0);assert.equal(cert.uniqueEquilibrium,true);
assert.equal(certificate({pPlus:19.5,pMinus:15}).choiceH,'+');
assert.equal(certificate({pPlus:19.5,pMinus:15}).choiceL,'-');
assert.equal(schools({mode:'empty'}).equilibrium,true);
for(let d=0;d<=12;d+=.5){
 const r=schools({mode:'single',dA:d});
 assert.equal(r.equilibrium,d<5);
 if(d>=5)assert.equal(r.entrantOnlyFits,true,'single A '+d);
}
for(let a=0;a<=12;a+=.5)for(let b=0;b<=8;b+=.5){
 const r=schools({mode:'pair',dA:a,dB:b});
 assert.equal(r.equilibrium,a===5&&b===0);
 if(r.witness)assert.equal(r.entrantOnlyFits,true,'pair A='+a+' B='+b);
}
assert.equal(schoolChoice([{id:'A',style:'A',d:5},{id:'B',style:'B',d:0}],1),'A');
assert.equal(schoolChoice([{id:'A',style:'A',d:5},{id:'B',style:'B',d:0}],2),'B');
console.log(JSON.stringify({cases:21,schoolGrid:25*17,threshold:'inclusive',certificate:'separates',ok:true}));

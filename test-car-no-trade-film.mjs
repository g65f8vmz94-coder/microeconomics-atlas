import assert from 'node:assert/strict';
import {carNoTradeFilmState} from './src/expectations.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
let priceChecks=0;
for(const alpha of [1.1,1.2,1.5,2,2.4]){
 const frames=[0,1,2].map(phase=>carNoTradeFilmState({alpha,phase}));
 const [badBelief,credible,minimumPrice]=frames;
 near(badBelief.minimum,.05);near(badBelief.chosen.p,.025);near(badBelief.belief,0);near(badBelief.buyerValue,0);
 assert.equal(badBelief.noTradeSupported,true);assert.equal(badBelief.forcedSellers,0);assert.equal(badBelief.buyerWants,false);
 near(credible.chosen.p,.025);near(credible.belief,.05);near(credible.buyerValue,alpha*.05);assert.equal(credible.buyerWants,true);assert.equal(credible.noTradeSupported,false);
 near(minimumPrice.chosen.p,.05);near(minimumPrice.belief,.05);assert.equal(minimumPrice.forcedSellers,0);assert.equal(minimumPrice.buyerWants,true);assert.equal(minimumPrice.noTradeSupported,false);
 for(let i=0;i<=200;i++){
  const p=.05*i/100,belief=.05,strictSeller=p>.05+1e-9,strictBuyer=alpha*belief>p+1e-9;
  assert.ok(strictSeller||strictBuyer,`credible no-trade possible at ${p} and alpha=${alpha}`);priceChecks++;
 }
}
const a=carNoTradeFilmState(),b=carNoTradeFilmState({phase:1}),c=carNoTradeFilmState({phase:2});
near(a.chosen.p*10,.25);near(b.buyerValue*10,.75);near(c.chosen.p*10,.5);
assert.throws(()=>carNoTradeFilmState({phase:.5}),/invalid/);
console.log(JSON.stringify({passed:true,parameterSets:5,frames:15,priceChecks}));

import assert from 'node:assert/strict';
import {carMarketContent, carMarketKeys} from './src/car-market-content.mjs';
import {carCandidate, carMarketModel, carMarketStory} from './src/car-market-story.mjs';

const expected=['intro132','d134','fig131','d135','q133','carNone','carPareto','carOnlyLow'];
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);
assert.deepEqual(carMarketKeys,expected);

let contentChecks=0,economicChecks=0;
for(const key of carMarketKeys){
 const content=carMarketContent[key];
 assert.equal(content.steps.length,6,`${key} must have six frames`);
 for(const field of ['title','question','conditions','formula','template','trap','source','view']){assert.ok(String(content[field]).trim(),`${key} missing ${field}`);contentChecks++;}
 assert.ok(content.proof.length>=4,`${key} proof route too short`);contentChecks++;
 assert.match(content.source,/印刷\d+/);contentChecks++;
 for(let step=0;step<6;step++){
  const frame=carMarketStory(key,step);
  assert.equal(frame.key,key);assert.equal(frame.step,step);assert.equal(frame.identity,content.steps[step][0]);assert.equal(frame.narration,content.steps[step][1]);assert.ok(frame.verdict&&frame.scope);contentChecks+=6;
 }
}

const one=carCandidate(1);near(one.belief,.05);near(one.price,.075);assert.equal(one.valid,true);economicChecks+=3;
const two=carCandidate(2);near(two.belief,.075);near(two.price,.1125);assert.equal(two.valid,true);economicChecks+=3;
const three=carCandidate(3);near(three.belief,7/60);near(three.price,.175);assert.equal(three.sellersAccepted,false);economicChecks+=3;
const model=carMarketModel();assert.equal(model.maximal.m,2);economicChecks++;

const intro=carMarketStory('intro132',5);assert.equal(intro.m,2);assert.equal(intro.valid,true);economicChecks+=2;
const figure=carMarketStory('fig131',5);near(figure.belief,.075);near(figure.price,.1125);assert.equal(figure.sold.length,2);economicChecks+=3;
const ledger=carMarketStory('d135',5);assert.ok(ledger.buyersIndifferent&&ledger.sellersAccepted&&ledger.excludedStay&&ledger.clears&&ledger.averageCorrect);economicChecks+=5;
const constructionFail=carMarketStory('q133',2);assert.equal(constructionFail.m,3);assert.equal(constructionFail.sellersAccepted,false);economicChecks+=2;
const construction=carMarketStory('q133',5);assert.equal(construction.maximal.m,2);assert.equal(construction.valid,true);economicChecks+=2;
const noTrade=carMarketStory('carNone',4);assert.equal(noTrade.supported,true);near(noTrade.price,.04);near(noTrade.buyerValue,.03);economicChecks+=3;
const bounded=carMarketStory('carNone',5);assert.equal(bounded.boundedBelief,true);assert.equal(bounded.supported,false);assert.ok(bounded.buyerValue>bounded.price);economicChecks+=3;
const pareto=carMarketStory('carPareto',5);near(pareto.quality,.2);near(pareto.buyerValue,.3);near(pareto.transfer,.25);near(pareto.sellerGain,.05);near(pareto.buyerGain,.05);assert.equal(pareto.paretoImprovement,true);economicChecks+=6;
const lowOne=carMarketStory('carOnlyLow',0);assert.equal(lowOne.marginalSells,true);economicChecks++;
const lowTwo=carMarketStory('carOnlyLow',1);assert.equal(lowTwo.m,2);assert.equal(lowTwo.marginalSells,false);economicChecks+=2;
const lowFinal=carMarketStory('carOnlyLow',5);assert.equal(lowFinal.m,1);assert.equal(lowFinal.conclusion,true);assert.equal(lowFinal.printedScaleMismatch,true);economicChecks+=3;

assert.ok(carMarketContent.carOnlyLow.trap.includes('尺度不一致'));contentChecks++;
assert.ok(carMarketContent.carNone.trap.includes('离轨信念'));contentChecks++;
const existenceNote = carMarketContent.q133.trap;
assert.match(existenceNote, /至少一个正交易均衡/);
for (const candidate of [one, two]) {
  assert.ok(existenceNote.includes(`m=${candidate.m}`), 'the example identifies both valid trading equilibria');
}
contentChecks += 3;

console.log(JSON.stringify({section:'13.2',cases:carMarketKeys.length,states:carMarketKeys.length*6,contentChecks,economicChecks,status:'passed'}));

import assert from 'node:assert/strict';
import {fishMarketContent, fishMarketKeys} from './src/fish-market-content.mjs';
import {fishEquilibriumModel, fishMarketStory, healthExampleModel, survivalProbability} from './src/fish-market-story.mjs';

const expected=['d136','d137','q134','fishPareto','fishTax','p5a','p5b'];
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);
assert.deepEqual(fishMarketKeys,expected);

let contentChecks=0,economicChecks=0;
for(const key of fishMarketKeys){
 const content=fishMarketContent[key];
 assert.equal(content.steps.length,6,`${key} must have six frames`);
 for(const field of ['title','question','conditions','formula','template','trap','source','view']){assert.ok(String(content[field]).trim(),`${key} missing ${field}`);contentChecks++;}
 assert.ok(content.proof.length>=4,`${key} proof route too short`);contentChecks++;
 assert.match(content.source,/印刷\d+/);contentChecks++;
 for(let step=0;step<6;step++){
  const frame=fishMarketStory(key,step);
  assert.equal(frame.key,key);assert.equal(frame.step,step);assert.equal(frame.identity,content.steps[step][0]);assert.equal(frame.narration,content.steps[step][1]);assert.ok(frame.verdict&&frame.scope);contentChecks+=6;
 }
}

const eq=fishEquilibriumModel();
assert.equal(eq.fishers,5);assert.equal(eq.consumers,10);assert.equal(eq.L,2);near(eq.equilibriumTotal,6);near(eq.consumerQuantity,.6);near(eq.fisherQuantity,1.2);assert.equal(eq.endpointsValid,true);economicChecks+=7;

const external=fishMarketStory('d136',5);near(external.total,6);near(external.cost,6);near(external.industryCost,36);assert.equal(external.totalCostIsUnitTimesQuantity,true);economicChecks+=4;
const ledger=fishMarketStory('d137',5);assert.ok(ledger.consumerOptimal&&ledger.fisherOptimal&&ledger.clears&&ledger.beliefCorrect&&ledger.allLedgersClose);near(ledger.x,.6);near(ledger.y,1.2);economicChecks+=7;
const high=fishMarketStory('q134',3);assert.equal(high.branch,'priceHigh');assert.equal(high.contradiction,true);assert.equal(high.demand,0);assert.equal(high.supply,10);economicChecks+=4;
const low=fishMarketStory('q134',4);assert.equal(low.branch,'priceLow');assert.equal(low.contradiction,true);assert.equal(low.safeLowerPriceSplit,true);economicChecks+=3;
const unique=fishMarketStory('q134',5);near(unique.trialPrice,6);near(unique.trialTotal,6);assert.equal(unique.uniqueIntersection,true);economicChecks+=3;

const pareto=fishMarketStory('fishPareto',5);near(pareto.total,3);near(pareto.cost,3);near(pareto.price,4.5);near(pareto.consumerGain,.45);near(pareto.fisherGain,.9);assert.ok(pareto.priceBetween&&pareto.transferBalanced&&pareto.paretoImprovement);economicChecks+=8;
const taxHeld=fishMarketStory('fishTax',4);near(taxHeld.tax,3);near(taxHeld.revenue,9);near(taxHeld.rebate,.3);near(taxHeld.retained,4.5);assert.equal(taxHeld.budgetBalanced,true);economicChecks+=5;
const tax=fishMarketStory('fishTax',5);near(tax.total,3);near(tax.netFisherPrice,3);near(tax.revenue,9);near(tax.rebate,.6);near(tax.retained,0);assert.ok(tax.taxImplementsTarget&&tax.budgetBalanced&&tax.allStrictlyBetter);economicChecks+=8;

const health=healthExampleModel();assert.ok(health.privateY<health.socialY);assert.ok(health.socialUtility>health.privateUtility);near(health.privateFOC,0,1e-7);assert.ok(health.collectiveSlopeAtPrivate>0);economicChecks+=4;
const healthPrivate=fishMarketStory('p5a',5);near(healthPrivate.currentY,health.privateY);assert.equal(healthPrivate.constructedFunction,true);economicChecks+=2;
const healthCommon=fishMarketStory('p5b',5);near(healthCommon.currentY,health.socialY);assert.ok(healthCommon.strictImprovement&&healthCommon.positiveExternalEffect&&healthCommon.feasibleCommonIncrease);economicChecks+=4;
const base=survivalProbability(.7,.8);assert.ok(survivalProbability(.8,.8)>base&&survivalProbability(.7,.9)>base);economicChecks+=2;

assert.ok(fishMarketContent.q134.trap.includes('定义域'));contentChecks++;
assert.ok(fishMarketContent.fishTax.trap.includes('税本身'));contentChecks++;
assert.ok(fishMarketContent.p5a.source.includes('不属于13.3正文'));contentChecks++;
assert.ok(fishMarketContent.p5b.trap.includes('共同调整'));contentChecks++;

console.log(JSON.stringify({section:'13.3',cases:fishMarketKeys.length,states:fishMarketKeys.length*6,contentChecks,economicChecks,status:'passed'}));

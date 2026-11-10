import assert from 'node:assert/strict';
import fs from 'node:fs';
import {productionEconomyContent, productionEconomyKeys} from './src/production-economy-content.mjs';
import {productionEconomyStory} from './src/production-economy-story.mjs';

const peClose = (a, b, eps = 1e-8) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);
let economicChecks = 0;
let formulaChecks = 0;
const snapshots = {};

assert.deepEqual(productionEconomyKeys, ['d121', 'd122', 'd123', 'd124', 'd125', 'q121', 'fig122', 'p1a', 'p1b', 'p1c', 'p1d', 'p4', 'p5']);
for (const key of productionEconomyKeys) {
  const content = productionEconomyContent[key];
  assert.equal(content.steps.length, 6);
  assert.ok(content.question.length > 12);
  assert.ok(content.conditions.length > 12);
  assert.ok(content.proof.length >= 4);
  assert.ok(content.formula.length > 8);
  assert.ok(/印刷/.test(content.source));
  formulaChecks += 5;
  snapshots[key] = [];
  for (let step = 0; step < 6; step++) {
    const frame = productionEconomyStory(key, step);
    assert.equal(frame.key, key);
    assert.equal(frame.step, step);
    assert.ok(frame.identity && frame.narration && frame.verdict);
    snapshots[key].push({step, identity: frame.identity, verdict: frame.verdict, kind: frame.kind});
  }
}

const technology = productionEconomyStory('d121', 4);
assert.ok(technology.disposed[0] < technology.frontier[0]);
assert.ok(technology.disposed[1] < technology.frontier[1]);
assert.equal(technology.focus, 'disposal');
economicChecks += 3;

for (const key of ['d122', 'd123', 'd124']) {
  const first = productionEconomyStory(key, 0), last = productionEconomyStory(key, 5);
  assert.ok(Math.abs(first.gap[0]) > 1e-3);
  peClose(last.gap[0], 0);
  peClose(last.gap[1], 0);
  assert.equal(last.clears, true);
  peClose(last.q * last.supply[0] + last.supply[1], last.profit);
  peClose(last.q * last.demand[0] + last.demand[1], last.profit);
  economicChecks += 6;
}

const pareto = productionEconomyStory('d125', 5);
peClose(pareto.totals[0], 4);
peClose(pareto.totals[1], 4);
assert.ok(pareto.currentU[0] > pareto.initialU[0]);
assert.ok(pareto.currentU[1] > pareto.initialU[1]);
economicChecks += 4;

const proof = productionEconomyStory('q121', 5);
assert.ok(proof.alternativeConsumptionValue > proof.alternativeProductionCeiling);
assert.equal(proof.contradiction, true);
economicChecks += 2;

for (let step = 0; step < 6; step++) {
  const frame = productionEconomyStory('fig122', step);
  assert.equal(frame.consumerMatches, false);
  assert.ok(frame.producerChoice.length >= 1);
  economicChecks += 2;
}

const specialization = productionEconomyStory('p1b', 5);
assert.deepEqual(specialization.people.map(x => x.mode), ['good1', 'tie', 'good2']);
const frontierNote = productionEconomyContent.p1b.trap;
assert.match(frontierNote, /tᵢ=p₁\/p₂.*生产前沿.*产出价值.*等于cᵢ/);
assert.match(frontierNote, /生产—消费计划.*偏好.*消费束/);
economicChecks += 2;

const noTrade = productionEconomyStory('p1c', 5);
assert.equal(noTrade.tradeVolume, 0);
noTrade.people.forEach((person, i) => assert.deepEqual(person.output, noTrade.consumption[i]));
economicChecks += 4;

const mixed = productionEconomyStory('p1d', 5);
assert.ok(mixed.people[0].production.every(x => x > 0));
peClose(mixed.production[0], mixed.consumption[0]);
peClose(mixed.production[1], mixed.consumption[1]);
economicChecks += 3;

const chain = productionEconomyStory('p4', 5);
peClose(chain.x, chain.firmDemand);
peClose(chain.marketGap, 0);
peClose(chain.sellerY + chain.profit, chain.g);
economicChecks += 3;

const pollution = productionEconomyStory('p5', 5);
assert.equal(pollution.equilibrium, true);
assert.equal(pollution.showAlternative, true);
assert.ok(pollution.alternativeUtility > pollution.privateUtility);
economicChecks += 3;

const report = {
  passed: true,
  section: '12.1',
  cases: productionEconomyKeys.length,
  states: productionEconomyKeys.length * 6,
  formulaChecks,
  economicChecks,
  sourceBoundary: 'Definitions 12.1–12.5, Proposition 12.1, Figures 12.1–12.2, Problems 12.1, 12.4 and 12.5',
  caveats: [
    'Problem 12.1(b) supports equal market value for every bundle on the production frontier when t_i=p1/p2; consumption indifference requires additional preference assumptions.',
    'The ellipse in Figure 12.1 and the coordinates a=(1,4), b=(4,1) in the Figure 12.2 mechanism are autonomous visual constructions.',
    'Problem 12.4 uses square-root technologies and Cobb–Douglas preferences only for its numerical picture; the proof route retains the general feasibility conditions.'
  ]
};
fs.mkdirSync('qa', {recursive: true});
fs.writeFileSync('qa/production-economy-models.json', JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync('qa/production-economy-expected.json', JSON.stringify(snapshots, null, 2) + '\n');
console.log(JSON.stringify(report));

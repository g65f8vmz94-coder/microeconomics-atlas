import assert from 'node:assert/strict';
import {laborEconomyContent, laborEconomyKeys} from './src/labor-economy-content.mjs';
import {laborEconomyStory} from './src/labor-economy-story.mjs';
import {production} from './src/production-market.mjs';

const near = (a, b, tol = 1e-8) => assert.ok(Math.abs(a - b) < tol, `${a} differs from ${b}`);
const expected = ['d126', 'd127', 'd128', 'd129', 'q122', 'p2', 'p3c', 'p3w'];
assert.deepEqual(laborEconomyKeys, expected);

let formulaChecks = 0, economicChecks = 0;
for (const key of laborEconomyKeys) {
  const content = laborEconomyContent[key];
  assert.equal(content.steps.length, 6, `${key} must have six frames`);
  for (const field of ['title', 'question', 'conditions', 'formula', 'template', 'trap', 'source', 'view']) {
    assert.ok(String(content[field]).trim(), `${key} missing ${field}`);
  }
  assert.ok(content.proof.length >= 4, `${key} proof route too short`);
  assert.ok(/印刷\d+/.test(content.source), `${key} missing printed source page`);
  for (let step = 0; step < 6; step++) {
    const frame = laborEconomyStory(key, step);
    assert.equal(frame.key, key);
    assert.equal(frame.step, step);
    assert.equal(frame.identity, content.steps[step][0]);
    assert.equal(frame.narration, content.steps[step][1]);
    assert.ok(frame.verdict && frame.scope);
    formulaChecks += 5;
  }
}

const modelFinal = laborEconomyStory('d126', 5);
near(modelFinal.workerLabor, 0.5); economicChecks++;
assert.equal(modelFinal.clears, true); economicChecks++;

const planFinal = laborEconomyStory('d127', 5);
assert.equal(planFinal.timeFeasible, true); economicChecks++;
assert.equal(planFinal.goodsFeasible, true); economicChecks++;
near(planFinal.a + planFinal.l, 1); economicChecks++;
near(planFinal.x + planFinal.z, production(planFinal.a, 4)); economicChecks++;

const paretoFinal = laborEconomyStory('d128', 5);
assert.ok(paretoFinal.alternative.workerUtility > paretoFinal.initial.workerUtility); economicChecks++;
assert.ok(paretoFinal.alternative.z > paretoFinal.initial.z); economicChecks++;
near(paretoFinal.alternative.a + paretoFinal.alternative.l, 1); economicChecks++;
near(paretoFinal.alternative.x + paretoFinal.alternative.z, paretoFinal.alternative.output); economicChecks++;

const equilibriumFinal = laborEconomyStory('d129', 5);
assert.equal(equilibriumFinal.clears, true); economicChecks++;
near(equilibriumFinal.firmLabor, equilibriumFinal.workerLabor); economicChecks++;
near(equilibriumFinal.output, equilibriumFinal.workerConsumption + equilibriumFinal.profit); economicChecks++;

const proofFinal = laborEconomyStory('q122', 5);
assert.equal(proofFinal.contradiction, true); economicChecks++;
assert.ok(proofFinal.feasibleProfitCeiling < proofFinal.eq.profit); economicChecks++;
assert.ok(proofFinal.claimedProfit > proofFinal.eq.profit); economicChecks++;
near(proofFinal.outputPrime - proofFinal.workerBudgetFloor, proofFinal.feasibleProfitCeiling); economicChecks++;

const outputFinal = laborEconomyStory('p2', 5);
assert.equal(outputFinal.showAlternative, true); economicChecks++;
near(outputFinal.workerUtility, outputFinal.alternativeUtility); economicChecks++;
assert.ok(outputFinal.zAlt > 0); economicChecks++;
near(outputFinal.outputMaxLabor, outputFinal.a); economicChecks++;

const capitalFinal = laborEconomyStory('p3c', 5);
assert.ok(capitalFinal.newOutput > capitalFinal.oldOutput); economicChecks++;
assert.ok(capitalFinal.newWage > capitalFinal.oldWage); economicChecks++;
assert.ok(capitalFinal.capitalChange < 0); economicChecks++;
assert.ok(capitalFinal.workerChange > 0); economicChecks++;

const workerFinal = laborEconomyStory('p3w', 5);
assert.ok(workerFinal.newOutput > workerFinal.oldOutput); economicChecks++;
assert.ok(workerFinal.newWage < workerFinal.oldWage); economicChecks++;
assert.ok(workerFinal.workerChange < 0); economicChecks++;
assert.ok(workerFinal.capitalChange > 0); economicChecks++;

assert.ok(laborEconomyContent.d127.formula.includes('a=1-l')); formulaChecks++;
assert.ok(laborEconomyContent.d127.formula.includes('f(a)=x+z')); formulaChecks++;
assert.ok(laborEconomyContent.q122.formula.includes("f(a')-w^*a'")); formulaChecks++;
assert.ok(laborEconomyContent.p2.formula.includes('f(a)-wa\\ge0')); formulaChecks++;
assert.ok(laborEconomyContent.p3c.formula.includes('<0')); formulaChecks++;
assert.ok(laborEconomyContent.p3w.formula.includes('1-3a^*')); formulaChecks++;

console.log(JSON.stringify({section: '12.2', cases: laborEconomyKeys.length, states: laborEconomyKeys.length * 6, formulaChecks, economicChecks, status: 'passed'}));

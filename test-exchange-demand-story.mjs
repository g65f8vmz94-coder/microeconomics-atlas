import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {
  demandKeys,
  demandStory,
  evaluateExample105
} from './src/exchange-demand-story.mjs';
import {demandContent} from './src/exchange-demand-content.mjs';

const require = createRequire(import.meta.url);
const katex = require('./src/vendor/katex/katex.min.js');
const format = require('./src/math-format.js');

const near = (a, b) => assert(Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

let states = 0;
let formulas = 0;
let clearingChecks = 0;
let regimeChecks = 0;
const expected = [];

// 1. Content and story integrity
for (const key of demandKeys) {
  const c = demandContent[key];
  assert(c.title && c.question && c.conditions && c.template && c.trap && c.source);
  assert.equal(c.steps.length, 6, `Scenario ${key} must have exactly 6 steps`);
  assert(c.proof.length >= 4, `Scenario ${key} proof must have at least 4 items`);

  // KaTeX formula parsing
  for (const tex of format.splitMath(c.formula)) {
    katex.renderToString(format.toTex(tex), {throwOnError: true, strict: 'ignore'});
    formulas++;
  }

  // 6 Frames per scenario
  for (let step = 0; step < 6; step++) {
    const f = demandStory(key, step);
    assert.equal(f.key, key);
    assert.equal(f.step, step);
    assert(f.view);
    assert(f.identity);
    assert(f.scope);
    assert(f.verdict);
    assert(f.ev);
    states++;

    expected.push({
      key,
      step,
      view: f.view,
      identity: f.identity,
      phase: c.steps[step][0],
      narration: c.steps[step][1],
      p1: f.ev.p1,
      isEquilibrium: f.ev.isEquilibrium
    });
  }
}

// 2. Example 10.5 High-Price Equilibria (p1 >= 1)
// For ANY alpha > 0, beta > 0, every p1 >= 1 gives a competitive equilibrium with no trade
for (const alpha of [0.5, 1, 2, 5]) {
  for (const beta of [0.5, 1, 2, 5]) {
    for (const p1 of [1.0, 1.2, 1.5, 2.0, 5.0]) {
      const res = evaluateExample105(p1, alpha, beta);
      assert.equal(res.isEquilibrium, true, `Must be equilibrium for p1 >= 1: alpha=${alpha}, beta=${beta}, p1=${p1}`);
      assert.equal(res.eqType, 'no-trade');
      near(res.d1[0], alpha);
      near(res.d1[1], 0);
      near(res.d2[0], 0);
      near(res.d2[1], beta);
      near(res.totalDemand[0], alpha);
      near(res.totalDemand[1], beta);
      clearingChecks++;
    }
  }
}

// 3. Example 10.5 Low-Price Swap Equilibrium (p1 < 1 and beta < alpha)
// When beta < alpha, unique equilibrium at p1 = beta / alpha < 1
for (const [alpha, beta] of [[2, 1], [3, 1], [4, 2], [5, 1.5], [10, 3]]) {
  const pStar = beta / alpha;
  assert(pStar < 1, 'Candidate price must be strictly less than 1');
  const res = evaluateExample105(pStar, alpha, beta);
  assert.equal(res.isEquilibrium, true, `Swap equilibrium must clear at p1 = ${pStar}`);
  assert.equal(res.eqType, 'swap');
  near(res.d1[0], 0);
  near(res.d1[1], beta);
  near(res.d2[0], alpha);
  near(res.d2[1], 0);
  near(res.totalDemand[0], alpha);
  near(res.totalDemand[1], beta);
  clearingChecks++;

  // Any other price in (0, 1) must NOT clear
  for (const offset of [-0.05, 0.05]) {
    const pOther = pStar + offset;
    if (pOther > 0 && pOther < 1) {
      const otherRes = evaluateExample105(pOther, alpha, beta);
      assert.equal(otherRes.isEquilibrium, false, `Price ${pOther} should not clear`);
      clearingChecks++;
    }
  }
}

// 4. Example 10.5 Non-existence of Low-Price Equilibrium when beta >= alpha
// When beta >= alpha, show that for all p1 in (0, 1), excess demand is strictly non-zero
for (const [alpha, beta] of [[2, 2], [1, 2], [2, 3], [1, 5]]) {
  for (const p1 of [0.2, 0.4, 0.6, 0.8, 0.95]) {
    const res = evaluateExample105(p1, alpha, beta);
    assert.equal(res.isEquilibrium, false, `No equilibrium should exist for p1 < 1 when beta >= alpha: alpha=${alpha}, beta=${beta}, p1=${p1}`);
    // Individual 2 demands beta / p1 > beta >= alpha of good 1
    assert(res.totalDemand[0] > alpha, 'Good 1 demand must exceed supply');
    // Individual 1 demands alpha * p1 < alpha <= beta of good 2
    assert(res.totalDemand[1] < beta, 'Good 2 demand must fall short of supply');
    regimeChecks++;
  }
}

// 5. Error handling tests
assert.throws(() => demandStory('unknownKey'));
assert.throws(() => evaluateExample105(0));
assert.throws(() => evaluateExample105(-1));
assert.throws(() => evaluateExample105(1, 0, 1));
assert.throws(() => evaluateExample105(1, 1, -2));
assert.equal(demandStory('model107', 99).step, 5);
assert.equal(demandStory('model107', -5).step, 0);

const report = {
  passed: true,
  states,
  formulas,
  clearingChecks,
  regimeChecks,
  scope: 'All Section 10.7 story states, KaTeX rendering, high-price no-trade equilibria, low-price swap equilibria (beta < alpha), and non-existence proof (beta >= alpha) verified'
};

fs.writeFileSync('qa/exchange-demand-models.json', JSON.stringify(report, null, 2));
fs.writeFileSync('qa/exchange-demand-expected.json', JSON.stringify(expected, null, 2));

console.log(report);

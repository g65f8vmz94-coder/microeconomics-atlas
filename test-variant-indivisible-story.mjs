import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {indivisibleContent, indivisibleKeys} from './src/variant-indivisible-content.mjs';
import {indivisibleStory} from './src/variant-indivisible-story.mjs';

const require = createRequire(import.meta.url);
const katex = require('./src/vendor/katex/katex.min.js');
const math = require('./src/math-format.js');
let states = 0, formulas = 0, economicChecks = 0;
const expected = [];

assert.deepEqual(indivisibleKeys, ['d111','d112','e111','q111','q112','q113','p1','p2','p3a','p3b','p4','p5','p6']);
for (const key of indivisibleKeys) {
  const c = indivisibleContent[key];
  assert(c.title && c.question && c.conditions && c.template && c.trap && c.source && c.formula);
  assert.equal(c.steps.length, 6, `${key} must have six authored frames`);
  assert(c.proof.length >= 4, `${key} needs a reusable proof or calculation route`);
  for (const tex of math.splitMath(c.formula)) {
    const rendered = katex.renderToString(math.toTex(tex), {throwOnError: true, strict: 'ignore'});
    assert(!rendered.includes('katex-error'), `${key} formula must render`);
    formulas++;
  }
  for (let step = 0; step < 6; step++) {
    const f = indivisibleStory(key, step);
    assert.equal(f.key, key);
    assert.equal(f.step, step);
    assert.equal(f.view, c.view);
    assert(f.identity && f.narration && f.verdict && f.scope);
    assert(Array.isArray(f.people) && f.people.length >= 2);
    expected.push({key, step, view: f.view, identity: f.identity, verdict: f.verdict, price: f.price, interval: f.intervalText});
    states++;
  }
}

// Definition 11.2 and Proposition 11.1: the four-person example clears exactly on [4,6].
for (const [p, clears] of [[3.99,false],[4,true],[5,true],[6,true],[6.01,false]]) {
  const f = indivisibleStory('d112', p < 4 ? 2 : p > 6 ? 3 : p === 6 ? 4 : 5);
  assert.equal(f.result.equilibrium, clears);
  economicChecks++;
}
assert.deepEqual(indivisibleStory('q111', 5).interval, [4, 6]); economicChecks++;

// Example 11.1: p=100 clears with 14 selected among 17 indifferent buyers; adjacent prices fail.
assert.equal(indivisibleStory('e111', 1).result.equilibrium, false);
assert.equal(indivisibleStory('e111', 2).result.equilibrium, true);
assert.equal(indivisibleStory('e111', 2).result.allocation.filter(x => x.has).length, 14);
assert.equal(indivisibleStory('e111', 4).result.equilibrium, false);
economicChecks += 4;

// Problem 2: the exact cash-constrained interval is (5,6].
for (const [step, clears] of [[0,false],[1,false],[2,true],[3,true],[4,true],[5,false]]) {
  const f = indivisibleStory('p2', step);
  assert.equal(f.result.equilibrium, clears, `p2 step ${step}`);
  assert.equal(f.intervalText, '(5, 6]');
  economicChecks += 2;
}

// Comparative statics: raising a valuation never lowers the lower endpoint;
// adding a buyer shifts the interval weakly up, adding a seller weakly down.
const raised = indivisibleStory('p3a', 3).comparison;
assert(raised.after[0] >= raised.before[0]);
const buyerEntry = indivisibleStory('p3b', 1).comparison;
const sellerEntry = indivisibleStory('p3b', 3).comparison;
assert(buyerEntry.after[0] >= buyerEntry.before[0]);
assert(sellerEntry.after[1] <= sellerEntry.before[1]);
economicChecks += 3;

// Pareto cash constraint and transaction-cost transformations.
assert.equal(indivisibleStory('q112', 2).transfer.possible, false);
assert.equal(indivisibleStory('q112', 3).transfer.possible, true);
const cost = indivisibleStory('p5', 3);
assert.equal(cost.comparison.cost, 2);
for (const p of cost.people) assert.equal(p.v, p.rawV + (p.own ? 2 : -2));
economicChecks += 2 + cost.people.length;

// Problem 4 calibration and Problem 6 construction are explicitly separated.
assert.equal(indivisibleStory('p4', 0).manipulation.originalUnique, true);
assert.equal(indivisibleStory('p4', 0).manipulation.trueGain, 0);
assert.equal(indivisibleStory('p4', 5).manipulation.originalUnique, false);
const exit = indivisibleStory('p6', 5).exit;
assert(exit.afterSurplus > exit.beforeSurplus);
assert.equal(exit.afterSurplus, 7.5);
economicChecks += 5;

assert.throws(() => indivisibleStory('not-a-case'));
assert.equal(indivisibleStory('d111', -2).step, 0);
assert.equal(indivisibleStory('d111', 99).step, 5);

const report = {
  passed: true,
  cases: indivisibleKeys.length,
  states,
  formulas,
  economicChecks,
  sourceScope: 'Osborne–Rubinstein Section 11.1, printed pp. 157–164 and Problems 1–6 on pp. 171–172',
  studentMastery: 'not asserted'
};
fs.writeFileSync('qa/variant-indivisible-models.json', JSON.stringify(report, null, 2));
fs.writeFileSync('qa/variant-indivisible-expected.json', JSON.stringify(expected, null, 2));
console.log(report);

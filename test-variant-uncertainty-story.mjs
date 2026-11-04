import assert from 'node:assert/strict';
import fs from 'node:fs';
import {uncertaintyContent, uncertaintyKeys} from './src/variant-uncertainty-content.mjs';
import {uncertaintyStory} from './src/variant-uncertainty-story.mjs';

const close = (a, b, eps = 1e-8) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);
let economicChecks = 0;
let formulaChecks = 0;
const snapshots = {};

assert.deepEqual(uncertaintyKeys, ['d113', 'd114', 'q114', 'q115', 'q116', 'e112', 'p7a', 'p7b', 'p8', 'p9a', 'p9b', 'p10a', 'p10b']);
for (const key of uncertaintyKeys) {
  const content = uncertaintyContent[key];
  assert.equal(content.steps.length, 6);
  assert.ok(content.question.length > 12);
  assert.ok(content.conditions.length > 12);
  assert.ok(content.proof.length >= 4);
  assert.ok(content.formula.length > 8);
  assert.ok(/印刷/.test(content.source));
  formulaChecks += 5;
  snapshots[key] = [];
  for (let step = 0; step < 6; step++) {
    const frame = uncertaintyStory(key, step);
    assert.equal(frame.key, key);
    assert.equal(frame.step, step);
    assert.ok(frame.identity && frame.narration && frame.verdict);
    snapshots[key].push({step, identity: frame.identity, verdict: frame.verdict, kind: frame.kind});
  }
}

const d113 = uncertaintyStory('d113', 4);
assert.match(d113.axisNote, /状态1消费较多.*边际替代率.*低于概率比/);
economicChecks++;

for (const key of ['d114', 'q114']) {
  const f = uncertaintyStory(key, 5);
  close(f.current[0][0] + f.current[1][0], 10);
  close(f.current[0][1] + f.current[1][1], 10);
  f.budgetCheck.forEach(x => close(x, 0));
  economicChecks += 4;
}
const q114 = uncertaintyStory('q114', 5);
q114.final.forEach(x => close(x[0], x[1]));
close(q114.priceRatio, q114.fairRatio);
economicChecks += 3;

const q115 = uncertaintyStory('q115', 5);
assert.ok(q115.priceRatio > q115.fairRatio);
q115.final.forEach(x => assert.ok(x[0] < x[1]));
close(q115.final[0][0] + q115.final[1][0], 5);
close(q115.final[0][1] + q115.final[1][1], 10);
economicChecks += 5;

const q116full = uncertaintyStory('q116', 2);
const q116partial = uncertaintyStory('q116', 5);
assert.equal(q116full.activeCase, 'full');
assert.equal(q116full.full.full, true);
assert.ok(q116full.richCapital >= q116full.threshold);
assert.equal(q116partial.activeCase, 'partial');
assert.equal(q116partial.partial.full, false);
assert.ok(q116partial.poorCapital < q116partial.threshold);
assert.ok(q116partial.partial.p > q116partial.partial.fair);
close(q116partial.partial.insurerBundle[0], 0);
close(q116partial.partial.x1, q116partial.poorCapital / q116partial.m);
economicChecks += 9;

for (let step = 0; step < 6; step++) {
  const f = uncertaintyStory('e112', step);
  close(f.totals[0], 2);
  close(f.totals[1], 2);
  economicChecks += 2;
}

const p7a = uncertaintyStory('p7a', 5);
p7a.final.flat().forEach(x => close(x, 100));
close(p7a.priceShare, 0.7);
economicChecks += 5;

const p7b = uncertaintyStory('p7b', 5);
assert.ok(p7b.final[0][0] > p7b.final[0][1]);
assert.ok(p7b.final[1][0] < p7b.final[1][1]);
close(p7b.totals[0], 200);
close(p7b.totals[1], 200);
assert.ok(p7b.generalPriceOdds[0] < p7b.generalPriceOdds[1]);
economicChecks += 5;

const p8 = uncertaintyStory('p8', 5);
assert.deepEqual(p8.interval, [6.5, 7.5]);
assert.equal(p8.supply, 2);
assert.equal(p8.result.equilibrium, true);
assert.deepEqual(p8.people.map(x => x.v), [9, 7.5, 6.5, 4, 2]);
economicChecks += 4;

const p9a = uncertaintyStory('p9a', 5);
close(p9a.totalRevenue, p9a.payoutA);
close(p9a.totalRevenue, p9a.payoutB);
assert.equal(p9a.pairCount, 4);
economicChecks += 3;
for (const step of [2, 3, 4]) {
  const f = uncertaintyStory('p9b', step);
  assert.equal(f.result.equilibrium, true);
  economicChecks++;
}
assert.deepEqual(uncertaintyStory('p9b', 3).interval, [0.6, 0.7]);
assert.equal(uncertaintyStory('p9b', 1).result.equilibrium, false);
assert.equal(uncertaintyStory('p9b', 5).result.equilibrium, false);
economicChecks += 3;

for (const key of ['p10a', 'p10b']) {
  const f = uncertaintyStory(key, 5);
  close(f.priceRatio, 1 / 0.6);
  close(f.final[0][0], 1 / 1.6);
  close(f.final[1][0], 0.6 / 1.6);
  close(f.totals[0], 1);
  close(f.totals[1], 1);
  assert.ok(f.final[0][0] > f.final[1][0]);
  economicChecks += 6;
}
assert.equal(uncertaintyStory('p10b', 5).directCalculation, true);
economicChecks++;

const report = {
  passed: true,
  section: '11.2',
  cases: uncertaintyKeys.length,
  states: uncertaintyKeys.length * 6,
  formulaChecks,
  economicChecks,
  sourceBoundary: 'Definitions 11.3–11.4, Propositions 11.4–11.6, Example 11.2, Problems 7–10 and subparts',
  caveats: [
    'The repeated x1<x2 clause before Figure 11.4 is corrected to x1>x2 and visibly labeled as a source typo.',
    'Problem 7(b) uses logarithmic utility only for its numerical picture; the proof remains general.',
    'Problem 8 five-person values are an autonomous visualization of the general ordering result.'
  ]
};
fs.mkdirSync('qa', {recursive: true});
fs.writeFileSync('qa/variant-uncertainty-models.json', JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync('qa/variant-uncertainty-expected.json', JSON.stringify(snapshots, null, 2) + '\n');
console.log(JSON.stringify(report));

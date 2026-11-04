// Unit tests for Section 10.9 Edgeworth Box Story Model
import assert from 'node:assert/strict';
import {
  edgeworthKeys,
  edgeworthNames,
  BOX_TOTAL,
  ENDOWMENT,
  evaluateEdgeworth,
  edgeworthStory
} from './src/exchange-edgeworth-story.mjs';
import { getEdgeworthContent } from './src/exchange-edgeworth-content.mjs';

let checks = 0;

// 1. Keys and Names
assert.equal(edgeworthKeys.length, 5);
checks++;
for (const k of edgeworthKeys) {
  assert.ok(typeof edgeworthNames[k] === 'string' && edgeworthNames[k].length > 0);
  checks++;
}

// 2. Box & Endowment Geometry
assert.equal(BOX_TOTAL.omega1, 10);
assert.equal(BOX_TOTAL.omega2, 10);
assert.deepEqual(ENDOWMENT.e1, [8, 2]);
assert.deepEqual(ENDOWMENT.e2, [2, 8]);
assert.equal(ENDOWMENT.e1[0] + ENDOWMENT.e2[0], BOX_TOTAL.omega1);
assert.equal(ENDOWMENT.e1[1] + ENDOWMENT.e2[1], BOX_TOTAL.omega2);
checks += 6;

// 3. Competitive Equilibrium Evaluation (p1 = 1, p2 = 1)
{
  const ev = evaluateEdgeworth(1.0, 1.0);
  assert.equal(ev.pRatio, 1.0);
  assert.equal(ev.w1, 10);
  assert.equal(ev.w2, 10);
  assert.deepEqual(ev.a1, [5, 5]);
  assert.deepEqual(ev.a2, [5, 5]);
  assert.deepEqual(ev.d2InBox, [5, 5]);
  assert.equal(ev.dist, 0);
  assert.deepEqual(ev.totalDemand, [10, 10]);
  assert.deepEqual(ev.excessDemand, [0, 0]);
  assert.equal(ev.u1, 25);
  assert.equal(ev.u2, 25);
  assert.equal(ev.resU1, 16);
  assert.equal(ev.resU2, 16);
  assert.equal(ev.isEquilibrium, true);
  checks += 14;
}

// 4. Disequilibrium Evaluation: Rice Overpriced (p1 = 2, p2 = 1)
{
  const ev = evaluateEdgeworth(2.0, 1.0);
  assert.equal(ev.pRatio, 2.0);
  assert.equal(ev.w1, 18);
  assert.equal(ev.w2, 12);
  assert.deepEqual(ev.a1, [4.5, 9]);
  assert.deepEqual(ev.a2, [3, 6]);
  assert.deepEqual(ev.d2InBox, [7, 4]);
  assert.ok(ev.dist > 5.0);
  assert.deepEqual(ev.totalDemand, [7.5, 15]);
  assert.deepEqual(ev.excessDemand, [-2.5, 5.0]);
  assert.equal(ev.isEquilibrium, false);
  // Walras' Law Check: p1*z1 + p2*z2 = 0
  const walrasSum = ev.p[0] * ev.excessDemand[0] + ev.p[1] * ev.excessDemand[1];
  assert.ok(Math.abs(walrasSum) < 1e-10, 'Walras Law must hold');
  checks += 11;
}

// 5. Disequilibrium Evaluation: Rice Underpriced (p1 = 0.5, p2 = 1)
{
  const ev = evaluateEdgeworth(0.5, 1.0);
  assert.equal(ev.pRatio, 0.5);
  assert.equal(ev.w1, 6);
  assert.equal(ev.w2, 9);
  assert.deepEqual(ev.a1, [6, 3]);
  assert.deepEqual(ev.a2, [9, 4.5]);
  assert.deepEqual(ev.d2InBox, [1, 5.5]);
  assert.deepEqual(ev.totalDemand, [15, 7.5]);
  assert.deepEqual(ev.excessDemand, [5.0, -2.5]);
  assert.equal(ev.isEquilibrium, false);
  // Walras' Law Check
  const walrasSum = ev.p[0] * ev.excessDemand[0] + ev.p[1] * ev.excessDemand[1];
  assert.ok(Math.abs(walrasSum) < 1e-10, 'Walras Law must hold');
  checks += 10;
}

// 6. Test all 5 scenarios x 6 steps = 30 story frames
for (const k of edgeworthKeys) {
  for (let step = 0; step < 6; step++) {
    const f = edgeworthStory(k, step);
    assert.equal(f.key, k);
    assert.equal(f.step, step);
    assert.equal(f.totalSteps, 6);
    assert.ok(f.frame.title && f.frame.title.length > 0);
    assert.ok(f.frame.desc && f.frame.desc.length > 0);
    assert.ok(f.frame.formula && f.frame.formula.length > 0);
    assert.ok(f.ev);
    checks += 7;
  }
}

// 7. Test content structures
for (const k of edgeworthKeys) {
  const c = getEdgeworthContent(k);
  assert.ok(c.focusQuestion && c.focusQuestion.length > 0);
  assert.ok(c.briefUpfront && c.briefUpfront.length > 0);
  assert.equal(c.steps.length, 3);
  assert.ok(c.fullNarrative && c.fullNarrative.length > 100);
  assert.ok(c.mathFormulas.length >= 3);
  assert.ok(c.examTraps.length >= 2);
  checks += 6;
}

console.log(JSON.stringify({
  passed: true,
  section: '10.9',
  checks,
  scenarios: edgeworthKeys.length,
  totalFrames: edgeworthKeys.length * 6,
  equilibriumVerified: true,
  walrasLawVerified: true
}, null, 2));

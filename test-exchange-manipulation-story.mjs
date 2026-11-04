import assert from 'node:assert/strict';
import {
  manipulationKeys,
  evaluateExample106,
  evaluatePriceTension,
  manipulationStory
} from './src/exchange-manipulation-story.mjs';
import {manipulationContent} from './src/exchange-manipulation-content.mjs';

let checks = 0;
const ok = (v, msg) => { checks++; assert.ok(v, msg); };
const eq = (a, b, msg) => { checks++; assert.equal(a, b, msg); };

// 1. Honest Baseline Tests
{
  const h = evaluateExample106(1.0);
  eq(h.p[0], 1.0, 'Honest p1 should be 1');
  eq(h.p[1], 1.0, 'Honest p2 should be 1');
  eq(h.a1[0], 0.5, 'Honest a1[0] should be 0.5');
  eq(h.a1[1], 0.5, 'Honest a1[1] should be 0.5');
  eq(h.a2[0], 0.5, 'Honest a2[0] should be 0.5');
  eq(h.a2[1], 0.5, 'Honest a2[1] should be 0.5');
  eq(h.trueU1, 1.0, 'Honest true U1 should be 1.0');
  eq(h.u2, 0.5, 'Honest U2 should be 0.5');
  eq(h.gainU1, 0.0, 'Honest gain should be 0');
  ok(Math.abs(h.excessGood1) < 1e-9, 'Honest good 1 clears');
  ok(Math.abs(h.excessGood2) < 1e-9, 'Honest good 2 clears');
}

// 2. Textbook Strategic Case (k = 3) Tests
{
  const s = evaluateExample106(3.0);
  eq(s.p[0], 3.0, 'Strategic p1 should be 3');
  eq(s.p[1], 1.0, 'Strategic p2 should be 1');
  eq(s.a1[0], 0.75, 'Strategic a1[0] should be 3/4 = 0.75');
  eq(s.a1[1], 0.75, 'Strategic a1[1] should be 3/4 = 0.75');
  eq(s.a2[0], 0.25, 'Strategic a2[0] should be 1/4 = 0.25');
  eq(s.a2[1], 0.25, 'Strategic a2[1] should be 1/4 = 0.25');
  eq(s.trueU1, 1.5, 'Strategic true U1 should be 1.5');
  eq(s.u2, 0.25, 'Strategic U2 should be 0.25');
  eq(s.gainU1, 0.5, 'Strategic net gain should be +0.5');
  ok(Math.abs(s.costReported1 - s.w1) < 1e-9, 'Strategic reported budget clears');
  ok(Math.abs(s.excessGood1) < 1e-9, 'Strategic good 1 clears');
  ok(Math.abs(s.excessGood2) < 1e-9, 'Strategic good 2 clears');
}

// 3. Price Tension / Excess Demand Tests
{
  // For k = 1:
  const tHigh = evaluatePriceTension(1.5, 1.0);
  ok(tHigh.excess[1] > 0, 'Excess good 2 when p1 > 1');
  const tLow = evaluatePriceTension(0.6, 1.0);
  ok(tLow.excess[0] > 0, 'Excess good 1 when p1 < 1');
  const tEq = evaluatePriceTension(1.0, 1.0);
  ok(Math.abs(tEq.excess[0]) < 1e-9 && Math.abs(tEq.excess[1]) < 1e-9, 'Clears when p1 = 1');

  // For k = 3:
  const t3High = evaluatePriceTension(4.0, 3.0);
  ok(t3High.excess[1] > 0, 'Excess good 2 when p1 > 3');
  const t3Low = evaluatePriceTension(2.0, 3.0);
  ok(t3Low.excess[0] > 0, 'Excess good 1 when p1 < 3');
  const t3Eq = evaluatePriceTension(3.0, 3.0);
  ok(Math.abs(t3Eq.excess[0]) < 1e-9 && Math.abs(t3Eq.excess[1]) < 1e-9, 'Clears when p1 = 3');
}

// 4. Monotonicity of True Utility w.r.t Multiplier k
{
  const ks = [1.0, 1.5, 2.0, 3.0, 5.0, 7.0, 10.0, 50.0];
  let prevU1 = -1;
  for (const k of ks) {
    const res = evaluateExample106(k);
    ok(res.trueU1 > prevU1, `True U1 must be strictly increasing in k (at k=${k}, u=${res.trueU1})`);
    ok(res.trueU1 < 2.0, `True U1 must be strictly less than 2.0 (at k=${k})`);
    prevU1 = res.trueU1;
  }
}

// 5. Film States & Story Integration Tests
{
  for (const k of manipulationKeys) {
    const c = manipulationContent[k];
    ok(c, `Content must exist for ${k}`);
    eq(c.steps.length, 6, `${k} must have exactly 6 film steps`);
    ok(c.title && c.title.length > 5, `Title for ${k}`);
    ok(c.question && c.question.length > 5, `Question for ${k}`);
    ok(c.conditions && c.conditions.length > 5, `Conditions for ${k}`);
    ok(c.proof && c.proof.length >= 3, `Proof for ${k}`);
    ok(c.template && c.template.length > 5, `Template for ${k}`);
    ok(c.trap && c.trap.length > 5, `Trap for ${k}`);
    ok(c.formula && c.formula.length > 5, `Formula for ${k}`);
    ok(c.source && c.source.includes('150'), `Source citation for ${k}`);

    for (let step = 0; step < 6; step++) {
      const f = manipulationStory(k, step);
      eq(f.key, k, `Story key matches at step ${step}`);
      eq(f.step, step, `Story step matches at step ${step}`);
      ok(f.ev, `Story ev exists for ${k} step ${step}`);
    }
  }
}

console.log(JSON.stringify({
  passed: true,
  checks,
  scenarios: manipulationKeys.length,
  statesTested: manipulationKeys.length * 6,
  theoremVerified: 'Example 10.6 Manipulability: Honest U1=1.0 vs Manipulated U1=1.5'
}, null, 2));

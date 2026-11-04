// Mathematical and property tests for Chapter 6 Producer Theory stories
import assert from 'node:assert/strict';
import { producerStories, producerFrame, producerReadout } from './src/producer-story.mjs';
import {
 powerP, shiftedP, objectivesP, technologyP, finitePlansP, priceProofP,
 inverseP, costsP, acP, costStaticsP, factoriesP, firingP, jumpCostP, crusoeP
} from './src/producer.mjs';

let checks = 0;
const ok = (cond, msg) => {
 assert.ok(cond, msg);
 checks++;
};

console.log('Testing Chapter 6 Producer Theory stories and mathematical properties...');

// 1. Stories structure verification
const expectedModes = [
 'technology', 'objectives', 'output', 'statics', 'profit', 'priceproof',
 'techchange', 'inverse', 'costs', 'acproof', 'supply', 'coststatic',
 'factories', 'firing', 'crusoe', 'harmony', 'goals', 'existence'
];

ok(Object.keys(producerStories).length >= expectedModes.length, 'all 18 producer story modes defined');

for (const mode of expectedModes) {
 const story = producerStories[mode];
 ok(story, `story ${mode} exists`);
 ok(story.id && story.id.startsWith('6.'), `story ${mode} has valid chapter 6 id`);
 ok(story.title && story.title.length > 5, `story ${mode} has descriptive title`);
 ok(story.intro && story.intro.length > 10, `story ${mode} has clear intro`);
 ok(story.end && story.end.length > 10, `story ${mode} has clear conclusion`);
 ok(Array.isArray(story.frames) && story.frames.length >= 3, `story ${mode} has at least 3 authored film frames`);

 for (let i = 0; i < story.frames.length; i++) {
  const frame = story.frames[i];
  ok(frame.title && frame.title.length > 2, `${mode} frame ${i} has title`);
  ok(frame.narration && frame.narration.length > 15, `${mode} frame ${i} has narration`);
  ok(frame.formula && frame.formula.length > 2, `${mode} frame ${i} has formula`);
  ok(frame.source && frame.source.includes('原书'), `${mode} frame ${i} cites textbook source`);

  const readout = producerReadout(mode, frame);
  ok(readout && typeof readout === 'string', `${mode} frame ${i} readout generated`);

  // Verify frame lookup helper
  const lookedUp = producerFrame(mode, i);
  ok(lookedUp === frame, `${mode} producerFrame lookup matches`);
 }
}

// 2. Production technology & Definition 6.1 (§6.1)
{
 const mConcave = powerP(2, 0.5);
 ok(mConcave.valid, 'power r=0.5 satisfies Definition 6.1');
 ok(mConcave.concave, 'r=0.5 is concave');
 ok(Math.abs(mConcave.f(4) - 4) < 1e-9, 'f(4) = 2 * sqrt(4) = 4');
 ok(Math.abs(mConcave.mp(4) - 0.5) < 1e-9, 'mp(4) = 2 * 0.5 * 4^(-0.5) = 0.5');

 const mConvex = powerP(2, 1.5);
 ok(!mConvex.valid, 'power r=1.5 violates Definition 6.1');
 ok(!mConvex.concave, 'r=1.5 is strictly convex, not concave');
}

// 3. Objectives & Profit vs Output Maximization (§6.1, §6.2)
{
 const o = objectivesP({ A: 2, b: 0, p: 2, w: 1, lower: 0, minimum: 1 });
 ok(o.m.aProfit < o.m.aOutput, 'output maximization input strictly exceeds profit maximization input');
 ok(Math.abs(o.m.profit(o.m.aProfit) - 4) < 1e-9, 'max profit is 4 at a=4');
 ok(Math.abs(o.m.profit(o.m.aOutput)) < 1e-9, 'profit at breakeven output is exactly 0');
}

// 4. Comparative statics without derivatives (Proposition 6.4, §6.3)
{
 const wUp = priceProofP({ which: 'w', other: 2.0, i: 3, j: 0 });
 ok(wUp.first >= -1e-9, 'wage increase old optimum inequality holds');
 ok(wUp.second >= -1e-9, 'wage increase new optimum inequality holds');
 // In priceProofP, product is (w - w')(a - a') <= 0 when wage increases and input falls
 ok(wUp.product <= 1e-9, 'revealed profitability cross-product (w - w\')(a - a\') <= 0');

 const pDown = priceProofP({ which: 'p', other: 0.5, i: 3, j: 0 });
 ok(pDown.first >= -1e-9, 'price change old optimum inequality holds');
 ok(pDown.second >= -1e-9, 'price change new optimum inequality holds');
 ok(pDown.product <= 1e-9, 'revealed profitability price cross-product (p\' - p)(y - y\') <= 0');
}

// 5. Technological change counterexample (Figure 6.2b, §6.3)
{
 const t = technologyP({ kind: 'early', p: 1, w: 0.29, delta: 0.7 });
 ok(t.yg < t.yf, 'under early improvement delta=0.7, optimal output strictly decreases');
 ok(t.ag < t.af, 'under early improvement delta=0.7, optimal input strictly decreases');
 ok(t.pg >= t.pf - 1e-9, 'maximum profit does not decrease despite lower output and input');
}

// 6. Cost function, AC, MC, and Proposition 6.5 (§6.4)
{
 const c = costsP({ F: 4, c: 1, k: 1, p: 5, fraction: 0.5, sunk: false });
 ok(c.qProfit === 4, 'optimal positive candidate is y=(5-1)/1 = 4');
 ok(c.profitBest > 0, 'firm earns positive profit of 4 at y=4, so it operates');
 ok(Math.abs(c.minAC - (1 + 2 * Math.sqrt(2))) < 1e-5, 'min AC is c + sqrt(2kF) = 1 + 2*sqrt(2)');
 ok(Math.abs(c.minACAt - Math.sqrt(8)) < 1e-5, 'min AC occurs at y=sqrt(2F/k) = sqrt(8)');

 // Proposition 6.5 derivative identity
 const acProof = acP('convex', 0);
 const yTest = 2.0;
 const expectedSlope = (acProof.MC(yTest) - acProof.AC(yTest)) / yTest;
 ok(Math.abs(acProof.slope(yTest) - expectedSlope) < 1e-9, 'AC slope exactly equals (MC - AC)/y');
}

// 7. Problem 6.2: Two factories allocation (§6.4)
{
 const f = factoriesP(3, 2, 0.5);
 ok(Math.abs(f.threshold - 2.0) < 1e-9, 'two-factory activation threshold y = sqrt(2k) = 2');
 ok(f.two < f.one, 'for y=3 > 2, operating 2 factories is strictly cheaper than 1 factory');
 ok(f.optimal.includes(2), '2 factories is optimal for y=3');
}

// 8. Problem 6.3: Firing worker friction (§6.3)
{
 const fire = firingP({ a0: 4, w: 1, loss: 0.6, integer: false });
 ok(fire.ordinary === 1, 'ordinary cash profit optimal employment is 1');
 ok(fire.chosen > fire.ordinary, 'moral friction reduces layoffs: employment chosen > 1');
 ok(fire.fired < 3, 'fewer workers fired than the unconstrained 3');
}

// 9. Problem 6.4: Robinson Crusoe economy (§6.3)
{
 const rc = crusoeP({ A: 1, r: 0.5, theta: 1, leisure: 0.5, w: Math.sqrt(3) / 2, goal: 'profit' });
 ok(Math.abs(rc.lStar - 2 / 3) < 1e-9, 'integrated optimal leisure l* = 2/3');
 ok(Math.abs(rc.wStar - Math.sqrt(3) / 2) < 1e-9, 'decentralized clearing wage w* = sqrt(3)/2');
 ok(rc.inHarmony, 'at w*, labor market clears (demand = supply)');
}

// 10. Jump cost counterexample (§6.2, §6.4)
{
 const j = jumpCostP(2, 0.9);
 ok(!j.exists, 'maximum breakeven output does not exist when J=2');
 ok(j.sup === 1, 'supremum of breakeven output set is 1');
 ok(j.feasible, 'output y=0.9 is profitable and feasible');
}

console.log(`All ${checks} Chapter 6 Producer Theory tests passed successfully.`);

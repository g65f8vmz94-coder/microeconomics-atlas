// Mathematical and property tests for Chapter 5 Consumer Demand stories
import assert from 'node:assert/strict';
import { consumerStories, consumerFrame, consumerReadout } from './src/consumer-story.mjs';
import { utilityC, demandC, hicksC, slutskyC, warpC, sourceWarp, rationalizationC, mrsC, localDerivativesC, normalMRSC, budgetC, existenceCounter } from './src/consumer.mjs';

let checks = 0;
const ok = (cond, msg) => {
 assert.ok(cond, msg);
 checks++;
};

console.log('Testing Chapter 5 Consumer Demand stories and mathematical properties...');

// 1. Stories structure verification
const expectedModes = [
 'budget', 'rules', 'homogeneous', 'optimum', 'existence', 'mrs', 'corners',
 'rationalize', 'warp', 'curves', 'normal', 'slutsky', 'property', 'giffen'
];

ok(Object.keys(consumerStories).length >= expectedModes.length, 'all 14 consumer story modes defined');

for (const mode of expectedModes) {
 const story = consumerStories[mode];
 ok(story, `story ${mode} exists`);
 ok(story.id && story.id.startsWith('5.'), `story ${mode} has valid chapter 5 id`);
 ok(story.title && story.title.length > 5, `story ${mode} has descriptive title`);
 ok(story.intro && story.intro.length > 10, `story ${mode} has clear intro`);
 ok(story.end && story.end.length > 10, `story ${mode} has clear conclusion`);
 ok(Array.isArray(story.frames) && story.frames.length >= 3, `story ${mode} has at least 3 authored film frames`);

 for (let i = 0; i < story.frames.length; i++) {
  const frame = story.frames[i];
  ok(frame.title && frame.title.length > 2, `${mode} frame ${i} has title`);
  ok(frame.narration && frame.narration.length > 15, `${mode} frame ${i} has narration`);
  ok(frame.formula && frame.formula.length > 2, `${mode} frame ${i} has formula`);
  ok(frame.source && (frame.source.includes('原书') || frame.source.includes('教材') || frame.source.includes('模型')), `${mode} frame ${i} cites textbook source`);

  const readout = consumerReadout(mode, frame);
  ok(readout && typeof readout === 'string', `${mode} frame ${i} readout generated`);

  // Verify frame lookup helper
  const lookedUp = consumerFrame(mode, i);
  ok(lookedUp === frame, `${mode} consumerFrame lookup matches`);
 }
}

// 2. Budget set mathematical verification (§5.1)
{
 const b = budgetC(2, 1, 12, 2, false);
 ok(b.wealth === 12, 'base wealth is 12');
 ok(b.current[0] === 6, 'horizontal intercept w/p1 = 6');
 ok(b.current[1] === 12, 'vertical intercept w/p2 = 12');
 ok(b.scaled[0] === 6 && b.scaled[1] === 12, 'scale invariance holds: intercepts unchanged');
 ok(b.scaledPrices[0] === 4 && b.scaledPrices[1] === 2, 'scaled prices (4, 2)');
 ok(b.scaledWealth === 24, 'scaled wealth 24');

 const bEndow = budgetC(2, 1, 12, 1, true);
 ok(bEndow.wealth === 2 * 4 + 1 * 4, 'endowment value at prices (2, 1) is 12');
 ok(bEndow.current[0] === 6 && bEndow.current[1] === 12, 'endowment intercepts match');
}

// 3. Demand rules and zero-homogeneity verification (§5.2)
{
 const w = 12;
 // Cheaper rule
 const dCheap1 = demandC('cheaper', 1, 2, w);
 ok(dCheap1.bundle[0] === 12 && dCheap1.bundle[1] === 0, 'cheaper rule selects (12, 0) when p1 < p2');
 const dCheap2 = demandC('cheaper', 2, 1, w);
 ok(dCheap2.bundle[0] === 0 && dCheap2.bundle[1] === 12, 'cheaper rule selects (0, 12) when p1 > p2');
 const dCheapTie = demandC('cheaper', 1, 1, w);
 ok(dCheapTie.bundle[0] === 6 && dCheapTie.bundle[1] === 6, 'cheaper rule splits equally when p1 = p2');

 // Equal amounts rule
 const dEqual = demandC('equal', 2, 1, w);
 ok(dEqual.bundle[0] === 4 && dEqual.bundle[1] === 4, 'equal amounts rule chooses (4, 4)');

 // Half wealth rule
 const dHalf = demandC('half', 2, 1, w);
 ok(dHalf.bundle[0] === 3 && dHalf.bundle[1] === 6, 'half wealth rule chooses (3, 6)');

 // Cap at 7 rule
 const dCapLow = demandC('cap', 1, 1, 5);
 ok(dCapLow.bundle[0] === 5 && dCapLow.bundle[1] === 0, 'cap rule buys all good 1 when under 7');
 const dCapHigh = demandC('cap', 1, 1, 12);
 ok(dCapHigh.bundle[0] === 7 && dCapHigh.bundle[1] === 5, 'cap rule buys 7 units of good 1 and remainder on good 2');

 // Homogeneity of degree zero
 for (const rule of ['cheaper', 'equal', 'half', 'cap']) {
  for (const lambda of [0.5, 2, 3]) {
   const base = demandC(rule, 2, 1, 12);
   const scaled = demandC(rule, 2 * lambda, 1 * lambda, 12 * lambda);
   ok(Math.abs(base.bundle[0] - scaled.bundle[0]) < 1e-9, `${rule} good 1 is homogeneous of deg 0 for lambda=${lambda}`);
   ok(Math.abs(base.bundle[1] - scaled.bundle[1]) < 1e-9, `${rule} good 2 is homogeneous of deg 0 for lambda=${lambda}`);
  }
 }
}

// 4. Utility maximization and existence verification (§5.3)
{
 const w = 12;
 // Cobb-Douglas optimum
 const dCD = demandC('cd', 2, 1, w, 0.5);
 ok(dCD.bundle[0] === 3 && dCD.bundle[1] === 6, 'CD optimum is (3, 6)');
 ok(Math.abs(2 * dCD.bundle[0] + 1 * dCD.bundle[1] - w) < 1e-9, 'CD optimum spends all wealth');

 // Complement optimum
 const dComp = demandC('complement', 2, 1, w);
 ok(dComp.bundle[0] === 4 && dComp.bundle[1] === 4, 'complement optimum is (4, 4)');

 // Linear optimum
 const dLinDiff = demandC('linear', 2, 1, w);
 ok(dLinDiff.bundle[0] === 0 && dLinDiff.bundle[1] === 12, 'linear optimum buys cheaper good 2');
 const dLinTie = demandC('linear', 1, 1, w);
 ok(dLinTie.optimalEndpoints.length === 2, 'linear optimum has interval of optimal endpoints when prices equal');

 // Discontinuous counterexample
 const ex = existenceCounter(0.9);
 ok(ex.supremum === 1, 'supremum is 1');
 ok(ex.utility === 0.9, 'current utility 0.9');
 ok(ex.nextUtility > ex.utility && ex.nextUtility < 1, 'next point improves utility toward 1');
 ok(ex.boundaryUtility === 0, 'boundary point utility is 0');
}

// 5. MRS and Corner Solutions (§5.4)
{
 // Product MRS
 const mrsProd = mrsC('product', 3, 6);
 ok(mrsProd === 2, 'product MRS at (3, 6) is 6/3 = 2');

 // Quasilinear MRS
 const mrsQuasi = mrsC('quasi', 5, 4);
 ok(mrsQuasi === 4, 'quasilinear MRS at (5, 4) is 2*sqrt(4) = 4');

 // Quasilinear corner vs interior
 const dQuasiCorner = demandC('quasi', 3, 1, 1);
 ok(dQuasiCorner.bundle[0] === 0 && dQuasiCorner.bundle[1] === 1, 'quasilinear corner solution (0, 1) at wealth 1');
 const dQuasiInterior = demandC('quasi', 3, 1, 6);
 ok(Math.abs(dQuasiInterior.bundle[1] - 2.25) < 1e-9, 'quasilinear interior locks x2 at 2.25 at wealth 6');
 ok(Math.abs(dQuasiInterior.bundle[0] - 1.25) < 1e-9, 'quasilinear interior allocates remaining wealth to x1 = 1.25');
}

// 6. Rationalization and WARP (§5.5)
{
 // Rationalization checks
 const rCheaper = rationalizationC('cheaper', 'linear', 1, 2, 12);
 ok(rCheaper.currentConsistent, 'cheaper rule rationalized by linear utility');

 const rHalf = rationalizationC('half', 'product', 2, 1, 12);
 ok(rHalf.currentConsistent, 'half wealth rule rationalized by product utility');

 // WARP checks
 const warpData = sourceWarp();
 const warpResult = warpC(warpData.first, warpData.second);
 ok(warpResult.violation === true, 'source WARP example correctly detected as violating WARP');
 ok(warpResult.affordable[0] === true && warpResult.affordable[1] === true, 'both bundles mutually affordable');
 ok(warpResult.strict[0] === true && warpResult.strict[1] === true, 'both bundles strictly interior to alternate budget');
}

// 7. Normal goods and Slutsky decomposition (§5.6)
{
 // Normal good MRS property
 const norm = normalMRSC('cd', 1, 1, 8, 4, 0.5);
 ok(norm.old.bundle[0] === 4 && norm.next.bundle[0] === 6, 'CD demand for good 1 increases from 4 to 6 with wealth');
 ok(norm.mrsVertical > norm.mrsOld, 'MRS along vertical shift is larger than at old optimum');

 // Slutsky decomposition for CD
 const sDec = slutskyC('cd', 1, 2, 1, 12, 0.5, 'slutsky');
 ok(sDec.A.bundle[0] === 6 && sDec.A.bundle[1] === 6, 'initial bundle A = (6, 6)');
 ok(sDec.wealth === 18, 'Slutsky compensated wealth is 2*6 + 1*6 = 18');
 ok(sDec.B.bundle[0] === 4.5 && sDec.B.bundle[1] === 9, 'compensated bundle B = (4.5, 9)');
 ok(sDec.C.bundle[0] === 3 && sDec.C.bundle[1] === 6, 'final bundle C = (3, 6)');
 ok(sDec.sub === -1.5, 'substitution effect is negative: -1.5');
 ok(sDec.income === -1.5, 'income effect is negative: -1.5');
 ok(sDec.total === -3, 'total effect is -3 = -1.5 + (-1.5)');

 // Giffen good locally upward sloping demand
 const gLowP = demandC('giffen', 1.3, 1, 10);
 const gHighP = demandC('giffen', 1.6, 1, 10);
 ok(gHighP.bundle[0] > gLowP.bundle[0], `Giffen good demand increases with price: ${gLowP.bundle[0]} -> ${gHighP.bundle[0]}`);
}

console.log(JSON.stringify({
 passed: true,
 checks,
 chapter: 5,
 totalStories: expectedModes.length,
 verifiedCases: expectedModes
}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prefStories,prefFrame,prefReadout} from './src/pref-story.mjs';
import {prefU,compareP,blend,caseSections} from './src/preferences.mjs';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const eq = (a, b, msg) => { ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} vs ${b}`); };

const expectedCases = Object.values(caseSections).flat();
ok(expectedCases.length === 19, 'Exactly 19 cases across Sections 4.1 to 4.6');

for (const key of expectedCases) {
 const story = prefStories[key];
 ok(story, `Story exists for ${key}`);
 ok(typeof story.intro === 'string' && story.intro.length > 20, `${key} intro text present`);
 ok(typeof story.end === 'string' && story.end.length > 20, `${key} end text present`);
 ok(Array.isArray(story.frames) && story.frames.length >= 3, `${key} has at least 3 frames`);

 story.frames.forEach((frame, idx) => {
  ok(typeof frame.title === 'string' && frame.title.length > 0, `${key}[${idx}] title present`);
  ok(typeof frame.narration === 'string' && frame.narration.length > 15, `${key}[${idx}] narration present`);
  ok(typeof frame.formula === 'string' && frame.formula.length > 0, `${key}[${idx}] formula present`);
  ok(typeof frame.source === 'string' && (frame.source.includes('原书') || frame.source.includes('命题') || frame.source.includes('定义') || frame.source.includes('总结')), `${key}[${idx}] source attribution valid`);

  const readout = prefReadout(key, frame);
  ok(readout.title === frame.title, `${key}[${idx}] readout title matches`);
 });

 const fFirst = prefFrame(key, 0);
 const fLast = prefFrame(key, story.frames.length - 1);
 const fOver = prefFrame(key, 999);
 ok(fFirst === story.frames[0], `${key} first frame correct`);
 ok(fLast === story.frames[story.frames.length - 1], `${key} last frame correct`);
 ok(fOver === story.frames[story.frames.length - 1], `${key} clamp upper bound correct`);
}

// Specific mathematical assertions for Chapter 4 models:
// 1. Bundle convex combination
const bStory = prefStories.bundle;
const bState = bStory.frames[2].state;
const bMid = blend(bState.a, bState.b, bState.lambda);
eq(bMid[0], 5, 'Bundle M_1 is 5');
eq(bMid[1], 5, 'Bundle M_2 is 5');

// 2. Examples: Leontief min
eq(prefU('min', 3, 5), 3, 'min(3, 5) = 3');
eq(prefU('min', 5, 5), 5, 'min(5, 5) = 5');
eq(prefU('threshold', 5, 2), 5, 'threshold <= 10');
eq(prefU('threshold', 12, 4), 15, 'threshold > 10 gives 11 + 4 = 15');

// 3. Monotonicity: Leontief is weak monotone, not strong monotone
ok(compareP('min', [3, 2], [2, 2]) === 0, 'min: (3, 2) ~ (2, 2), weak but not strong monotone');
ok(compareP('linear', [3, 2], [2, 2], 1.3) === 1, 'linear: (3, 2) > (2, 2), strong monotone');

// 4. Continuity counterexample: Lexicographic
const lexFirst = compareP('lex', [1, 2], [1, 0]);
ok(lexFirst === 1, '(1, 2) >_lex (1, 0)');
const lexRev = compareP('lex', [0.8, 2], [1, 0]);
ok(lexRev === -1, '(0.8, 2) <_lex (1, 0) even though within 0.4 of (1, 2)');

// 5. Intermediate bundle root
const inter = prefStories.intermediate.frames[2].state;
const interZ = blend([8, 8], [1, 1], inter.t);
eq(prefU('product', ...interZ), 20, 'Intermediate root hits target utility 20 exactly');

// 6. Concave: (min{x1, x2})^2 is not concave
const sqMid = prefU('minSquared', 1, 1);
const sqAvg = 0.5 * prefU('minSquared', 0, 0) + 0.5 * prefU('minSquared', 2, 2);
ok(sqMid < sqAvg, 'minSquared is non-concave at midpoint');

// 7. Declining MRS
const a = [10, 10], b = [11, 100/11], c = [12, 100/12];
const beta = a[1] - b[1], gamma = b[1] - c[1];
ok(beta > gamma, 'beta > gamma (declining marginal rate of substitution)');

// 8. Exercises
ok(prefU('distance', 3, 3) < 6, 'Problem 4.1a distance midpoint below endpoints');
ok(compareP('sumlex', [3.5, 3.5], [1, 6]) === 1, 'Problem 4.1c sumlex convex');
ok(prefU('max', 3.5, 3.5) < 6, 'Problem 4.2a max non-convex');
eq(prefU('quasi', 4, 3) - prefU('quasi', 4, 1), 2, 'Problem 4.4 vertical shift exact');

const payload = {
 passed: true,
 checks,
 chapter: 4,
 totalStories: expectedCases.length,
 verifiedCases: expectedCases
};

fs.writeFileSync(new URL('./qa/pref-story-models.json', import.meta.url), JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload));

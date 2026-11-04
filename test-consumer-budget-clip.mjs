import assert from 'node:assert/strict';
import {clipConsumerBudget} from './src/consumer-story-ui.js';

const epsilon = 1e-9;
const close = (a, b) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

// Slutsky compensation: the vertical intercept is 18, above a 14-unit plot.
// The true line meets the plot at (2,14) and (9,0), not (0,14) and (9,0).
const compensated = clipConsumerBudget(2, 1, 18, 14);
assert.deepEqual(compensated.line, [[2, 14], [9, 0]]);

// Both intercepts lie beyond the plot; each crossing must still satisfy the budget.
assert.deepEqual(clipConsumerBudget(1, 1, 18, 14).line, [[4, 14], [14, 4]]);
assert.deepEqual(clipConsumerBudget(1, 1, 30, 14), {
 line: null, polygon: [[0, 0], [14, 0], [14, 14], [0, 14]]
});
assert.deepEqual(clipConsumerBudget(2, 1, 12, 14).line, [[0, 12], [6, 0]]);
assert.throws(() => clipConsumerBudget(0, 1, 10, 14));

let checked = 0;
for (const p of [0.5, 1, 2, 3]) for (const q of [0.5, 1, 2, 3]) for (const w of [0, 4, 12, 18, 28, 42, 84]) {
 const limit = 14, {line, polygon} = clipConsumerBudget(p, q, w, limit);
 for (const [x, y] of polygon) {
  assert.ok(x >= -epsilon && x <= limit + epsilon && y >= -epsilon && y <= limit + epsilon);
  assert.ok(p * x + q * y <= w + epsilon);
 }
 if (line) for (const [x, y] of line) close(p * x + q * y, w);
 else assert.ok(w > (p + q) * limit);
 checked++;
}
console.log(JSON.stringify({passed: true, budgets: checked, clippedSlutskyExample: compensated.line}));

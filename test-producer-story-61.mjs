import assert from 'node:assert/strict';
import {producerFrame, producerReadout} from './src/producer-story.mjs';
import {objectivesP, powerP} from './src/producer.mjs';

// A valid plateau shows why the book's conditions do not imply strict
// increase or differentiability everywhere.
const plateau = a => Math.min(a, 1);
assert.equal(plateau(0), 0);
assert.equal(plateau(2), plateau(3));
for (const a of [0, 0.5, 1, 2, 10]) for (const b of [0, 0.5, 1, 2, 10]) {
 assert.ok(plateau((a + b) / 2) >= (plateau(a) + plateau(b)) / 2);
}
assert.equal(plateau(1001) - plateau(1000), 0);

const tech = producerFrame('technology', 0);
assert.match(tech.narration, /不要求严格凹或处处可微/);
const m = powerP(tech.state.A, tech.state.r);
assert.ok(m.valid);
assert.ok(Math.abs(m.mp(3) - 1 / Math.sqrt(3)) < 1e-12);
assert.ok(m.f(3) / 3 > m.mp(3));

for (const [phase, index, expectedInput] of [[0, 0, 4], [1, 1, 16], [2, 2, 6.25], [3, 3, 1]]) {
 const frame = producerFrame('objectives', phase);
 const rows = objectivesP({A: frame.state.A, b: 0, p: frame.state.p, w: frame.state.w, lower: frame.state.lower ?? 5, minimum: 1}).rows;
 assert.equal(rows[index].a, expectedInput);
 assert.ok(producerReadout('objectives', frame).includes(String(expectedInput)));
}
console.log(JSON.stringify({passed: true, plateauPairs: 25, objectiveFrames: 4, exampleInputs: [4, 16, 6.25, 1]}));

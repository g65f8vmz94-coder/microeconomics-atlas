import assert from 'node:assert/strict';
import {producerFrame, producerReadout} from './src/producer-story.mjs';
import {shiftedP} from './src/producer.mjs';

const zero = producerFrame('output', 0);
const zeroModel = shiftedP(zero.state);
assert.equal(zeroModel.mp(0), 0.5);
assert.equal(zeroModel.aOutput, 0);
for (const a of [.001, .1, 1, 10, 100]) assert.ok(zeroModel.profit(a) < 0);
assert.match(producerReadout('output', zero), /投入 0/);

for (const phase of [1, 2]) {
 const frame = producerFrame('output', phase), m = shiftedP({...frame.state, b: 0});
 assert.equal(m.aOutput, 16);
 assert.ok(Math.abs(m.profit(m.aOutput)) < 1e-10);
 assert.match(producerReadout('output', frame), /投入 16/);
}
for (const phase of [0, 1, 2]) {
 const s = producerFrame('statics', phase).state;
 const old = shiftedP({A:s.A ?? 2,b:0,p:s.p,w:s.w});
 const next = shiftedP({A:s.newA ?? s.A ?? 2,b:0,p:s.newP ?? s.p,w:s.w});
 assert.equal(old.aOutput, 16);
 assert.equal(next.aOutput, 36);
 assert.ok(Math.abs(old.profit(old.aOutput)) < 1e-10);
 assert.ok(Math.abs(next.profit(next.aOutput)) < 1e-10);
 assert.match(producerReadout('statics', producerFrame('statics', phase)), /16 → 36/);
}
// A price increase need not change a zero optimum when marginal revenue stays below cost.
const old = shiftedP({A:1,b:1,p:1,w:2}), next = shiftedP({A:1,b:1,p:2,w:2});
assert.equal(old.aOutput, 0);
assert.equal(next.aOutput, 0);
console.log(JSON.stringify({passed:true,shutdownSamples:5,positiveFrames:2,comparisonFrames:3,zeroOptimumCanPersist:true}));

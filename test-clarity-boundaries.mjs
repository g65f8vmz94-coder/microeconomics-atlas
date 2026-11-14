// Mathematical edge cases used to review the November 14 explanation pass.
import assert from 'node:assert/strict';
import {p15GuessPay} from './src/strategic-exercises.mjs';
import {projectOutcome,trueUtility} from './src/mechanism.mjs';

// The prize goes to a nearest integer in the allowed set, not the nearest
// submitted report. It is possible for every player to lose.
assert.deepEqual(p15GuessPay([8,8,8]).winners,[0,0,0]);
assert.deepEqual(p15GuessPay([8,8,5]).winners,[0,0,1]);

// A false report can change the decision without changing utility at the
// zero-total-value boundary. Truthfulness is weak, not strict dominance.
const honest=projectOutcome([-4,4]),lie=projectOutcome([-3,4]);
assert.equal(honest.decision,0);
assert.equal(lie.decision,1);
assert.equal(trueUtility(-4,honest),trueUtility(-4,lie));
let comparisons=0;
for(const value of [-8,-4,0,4,8])for(const other of [-8,-4,0,4,8])for(const report of [-9,-4,0,4,9]){
  assert.ok(trueUtility(value,projectOutcome([value,other]))>=trueUtility(value,projectOutcome([report,other])));
  comparisons++;
}
console.log(JSON.stringify({guessBoundaryCases:2,vcgTieCase:true,vcgDeviationComparisons:comparisons}));

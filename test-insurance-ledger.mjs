import assert from 'node:assert/strict';
import model from './src/insurance-lesson/model.js';
import build from './src/insurance-lesson/build.cjs';
import { insurance } from './src/uncertainty.mjs';

const {contracts, transfer, ledger} = model;
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, a + ' differs from ' + b);
for (const [contract, premiums, safe, accident, means] of [
  [contracts.loaded, [20,19,19.99], [80,81,80.01], [80,79.5,79.995], [80,80.25,80.0025]],
  [contracts.fair, [0,10,20], [100,90,80], [60,70,80], [80,80,80]],
  [transfer, [20,19], [100,101], [100,99.8], [100,100.4]]
]) {
  for (const [i,premium] of premiums.entries()) {
    const row = ledger(contract, premium);
    near(row.safe, safe[i]); near(row.accident, accident[i]); near(row.mean, means[i]);
    near(row.ownAfterLoss + row.payout, row.accident);
    near(row.utility, (Math.sqrt(safe[i])+Math.sqrt(accident[i]))/2);
  }
  const {wealth,loss,probability,rate} = contract;
  const original = insurance(wealth,loss,probability,rate);
  near(ledger(contract,original.choice).utility, original.value);
}
const {fair,loaded} = contracts;
assert.ok(ledger(fair,0).utility < ledger(fair,10).utility);
assert.ok(ledger(fair,10).utility < ledger(fair,20).utility);
const h = 0.0001;
const slope = (ledger(loaded,20-h).utility - ledger(loaded,20+h).utility)/(2*h);
near(slope, (1-loaded.probability*loaded.rate)/(2*Math.sqrt(80)));
const markup = build.insurancePage();
assert.ok(markup.includes('<mfrac>') && markup.includes('<msqrt>') && markup.includes('<msub>'));
assert.ok(!/<tex>|\{\{\w+\}\}|katex-error/.test(markup));
assert.ok(!/<script\s+src=|<link\s+rel="stylesheet"/i.test(markup));
console.log('Insurance ledger, transfer, local slope, original model and offline math passed.');

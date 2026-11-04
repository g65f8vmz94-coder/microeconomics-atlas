import assert from 'node:assert/strict';
import {serviceEconomyContent, serviceEconomyKeys} from './src/service-economy-content.mjs';
import {serviceEconomyStory, serviceModel} from './src/service-economy-story.mjs';

const expected=['d131','d132','l131','l132','q131','d133','q132','p1a','p1b','p1c','p1d','p2','p3a','p3b','p4a','p4b','p4c'];
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);
assert.deepEqual(serviceEconomyKeys,expected);

let contentChecks=0,economicChecks=0;
for(const key of serviceEconomyKeys){
 const c=serviceEconomyContent[key];
 assert.equal(c.steps.length,6,`${key} must have six frames`);
 for(const field of ['title','question','conditions','formula','template','trap','source','view']){assert.ok(String(c[field]).trim(),`${key} missing ${field}`);contentChecks++;}
 assert.ok(c.proof.length>=4,`${key} proof route too short`);contentChecks++;
 assert.match(c.source,/印刷\d+/);contentChecks++;
 for(let step=0;step<6;step++){
  const frame=serviceEconomyStory(key,step);
  assert.equal(frame.key,key);assert.equal(frame.step,step);assert.equal(frame.identity,c.steps[step][0]);assert.equal(frame.narration,c.steps[step][1]);assert.ok(frame.verdict&&frame.scope);contentChecks+=6;
 }
}

const base=serviceModel();near(base.eq,.6);near(base.eqWait[0],.6);near(base.eqWait[1],.8);economicChecks+=3;
const consistency=serviceEconomyStory('d132',5);near(consistency.z,.6);near(consistency.cut,.6);assert.equal(consistency.consistent,true);economicChecks+=3;
const crossing=serviceEconomyStory('l131',5);near(crossing.eq,.6);economicChecks++;
const sorting=serviceEconomyStory('l132',5);assert.ok(sorting.leftAtX<=sorting.rightAtX);assert.ok(sorting.leftAtY<sorting.rightAtY);economicChecks+=2;
const unique=serviceEconomyStory('q131',5);assert.equal(unique.unique,true);assert.equal(unique.unusedBranchRejected,true);economicChecks+=2;
const stable=serviceEconomyStory('d133',5);assert.ok(stable.newLoss>stable.oldLoss);assert.equal(stable.witnessWorse,true);economicChecks+=2;
const proof=serviceEconomyStory('q132',5);assert.ok(proof.increasedLeft);assert.ok(proof.witnessWorse);economicChecks+=2;
const improve=serviceEconomyStory('p1a',5);near(improve.oldEq,.6);near(improve.newEq,2/3);assert.ok(improve.newEq>improve.oldEq);economicChecks+=3;
const compare=serviceEconomyStory('p1b',5);assert.ok(compare.eqWait[0]<compare.eqWait[1]);near(compare.waitDifference,.2);economicChecks+=2;
const allScale=serviceEconomyStory('p1c',5);near(allScale.eq,.6);assert.equal(allScale.unchanged,true);economicChecks+=2;
const waitScale=serviceEconomyStory('p1d',5);near(waitScale.eq,7/11);assert.ok(waitScale.eq>.6);economicChecks+=2;
const social=serviceEconomyStory('p2',5);near(social.eq,.6);near(social.social,.625);near(social.eqTotal,.94);near(social.socialTotal,.9375);assert.ok(social.socialTotal<social.eqTotal);economicChecks+=5;
const raffle=serviceEconomyStory('p3b',5);assert.equal(raffle.nL,300);assert.equal(raffle.nH,900);assert.ok(raffle.lStay>=raffle.lDeviate);assert.ok(raffle.hStay>=raffle.hDeviate);assert.equal(raffle.equilibrium,true);economicChecks+=5;
const ratio=serviceEconomyStory('p4a',5);near(ratio.p[0],.6);near(ratio.p[1],.6);near(ratio.q[0],1);near(ratio.q[1],1);economicChecks+=4;
const interior=serviceEconomyStory('p4b',5);assert.equal(interior.interior,true);near(interior.ratio[0],.6);near(interior.ratio[1],.6);economicChecks+=3;
const one=serviceEconomyStory('p4c',5);assert.equal(one.allVenueOne,true);near(one.p[0],.6);near(one.q[0],1);near(one.p[1],0);near(one.q[1],0);assert.notEqual(one.normalizedP,1);economicChecks+=6;

assert.ok(serviceEconomyContent.p2.trap.includes('f₁(z)'));contentChecks++;
assert.ok(serviceEconomyContent.p4a.trap.includes('冲突'));contentChecks++;

console.log(JSON.stringify({section:'13.1',cases:serviceEconomyKeys.length,states:serviceEconomyKeys.length*6,contentChecks,economicChecks,status:'passed'}));

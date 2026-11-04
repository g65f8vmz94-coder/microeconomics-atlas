import assert from 'node:assert/strict';
import {strategicInterpretationContent,strategicInterpretationKeys} from './src/strategic-interpretation-content.mjs';
import {interpretationStory,interpretationState} from './src/strategic-interpretation-story.mjs';
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;},near=(a,b,message)=>ok(Math.abs(a-b)<1e-9,message+' '+a+' != '+b);
assert.deepEqual(strategicInterpretationKeys,['norm','deviation','noPure','population','beliefs','mixed','pd','boundary']);checks++;
for(const key of strategicInterpretationKeys){const c=strategicInterpretationContent[key];ok(c.question&&c.conditions&&c.formula&&c.proof.length&&c.template&&c.trap&&c.source,key+' complete content');ok(c.steps.length===6,key+' frames');for(let k=0;k<6;k++){const f=interpretationStory(key,k);ok(f.identity&&f.narration,key+' narration '+k);for(const n of [f.p1,f.p2,f.b1,f.b2])ok(n>=0&&n<=1,key+' valid share '+k);const again=interpretationState(f.game,f.p1,f.p2,f.b1,f.b2);assert.deepEqual(f.support,again.support);checks++;assert.deepEqual(f.correct,again.correct);checks++;ok(f.steady===(f.correct.every(Boolean)&&f.support.every(Boolean)),key+' conjunctive steady '+k);}}
ok(interpretationState('bach',1,1,1,1).steady,'Bach B/B pure norm');ok(interpretationState('bach',0,0,0,0).steady,'Bach S/S pure norm');ok(!interpretationState('bach',0,1,1,0).steady,'Bach mismatch');
for(const a of [0,1])for(const b of [0,1])ok(!interpretationState('pennies',a,b,b,a).steady,'pennies no pure '+a+b);
const half=interpretationState('pennies',.5,.5,.5,.5);ok(half.steady,'pennies half steady');near(half.rows[0],.5,'player1 H');near(half.rows[1],.5,'player1 T');near(half.cols[0],.5,'player2 H');near(half.cols[1],.5,'player2 T');
const mistaken=interpretationState('pennies',.5,.5,.8,.5);ok(!mistaken.correct[0]&&mistaken.correct[1],'belief mismatch separated');ok(!mistaken.support[0],'H user wants to switch');near(mistaken.rows[0],.2,'wrong belief H payoff');near(mistaken.rows[1],.8,'wrong belief T payoff');
const actualShift=interpretationState('pennies',.7,.5,.5,.7);ok(actualShift.correct.every(Boolean),'correct beliefs can coexist with non-equilibrium');ok(!actualShift.support[1]&&!actualShift.steady,'second group used action not optimal');
ok(interpretationState('pd',0,0,0,0).steady,'PD D/D pure norm');ok(!interpretationState('pd',1,1,1,1).steady,'PD C/C deviation');
console.log({passed:true,checks,cases:strategicInterpretationKeys.length,frames:strategicInterpretationKeys.length*6});

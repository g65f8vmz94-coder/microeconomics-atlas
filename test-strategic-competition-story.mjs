import assert from 'node:assert/strict';
import {strategicCompetitionContent,strategicCompetitionKeys} from './src/strategic-competition-content.mjs';
import {competitionStory,analyzeCompetitionMatrix} from './src/strategic-competition-story.mjs';
import {locationShares} from './src/games.mjs';
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;};
assert.deepEqual(strategicCompetitionKeys,['intro','representation','maxmin','bach','location','proof','samePayoff','noExistence']);checks++;
for(const key of strategicCompetitionKeys){const c=strategicCompetitionContent[key];ok(c.question&&c.conditions&&c.formula&&c.proof.length&&c.template&&c.trap&&c.source,key+' content');ok(c.steps.length===6,key+' frame count');for(let step=0;step<6;step++){const f=competitionStory(key,step);ok(f.identity&&f.narration,key+' '+step);if(f.kind==='street'){ok(Math.abs(f.model.shares.reduce((a,b)=>a+b,0)-1)<1e-9,key+' shares');ok(Math.abs(f.zeroSumRepresentation.reduce((a,b)=>a+b,0))<1e-9,key+' representation');}else ok(f.model.u===f.model.M[f.pair[0]][f.pair[1]],key+' payoff');}}
const bach=analyzeCompetitionMatrix('pessimism',0,1);ok(!bach.competitive,'Bach variant not strict');assert.deepEqual(bach.pure,[[0,0],[1,1]]);checks++;assert.deepEqual(bach.maxmin,[[0],[1]]);checks++;ok(bach.gains[0]===.5&&bach.gains[1]===.5,'B/S both can improve');
const saddle=analyzeCompetitionMatrix('saddle',1,1);ok(saddle.competitive,'saddle strict');assert.deepEqual(saddle.pure,[[1,1]]);checks++;assert.deepEqual(saddle.maxmin,[[1],[1]]);checks++;ok(saddle.u[0]===2&&saddle.u[1]===-2,'saddle payoff');
const equal=analyzeCompetitionMatrix('equalSaddles');assert.deepEqual(equal.pure,[[0,0],[0,1]]);checks++;ok(equal.pure.every(([i,j])=>equal.M[i][j][0]===0&&equal.M[i][j][1]===0),'NE same payoff');
const pennies=analyzeCompetitionMatrix('pennies');ok(pennies.competitive&&pennies.pure.length===0,'strict competition need not have pure NE');
const street=locationShares([.6,.55]);ok(Math.abs(street.shares[0]-.425)<1e-9&&Math.abs(street.shares[1]-.575)<1e-9,'printed .6/.55 location counterfactual');
const center=locationShares([.5,.5]);assert.deepEqual(center.shares,[.5,.5]);checks++;
for(let i=0;i<=100;i++){const rival=i/100,share=locationShares([.5,rival]).shares[0];ok(share>=.5-1e-10,'center guarantee '+rival);}
console.log({passed:true,checks,cases:strategicCompetitionKeys.length,frames:strategicCompetitionKeys.length*6});

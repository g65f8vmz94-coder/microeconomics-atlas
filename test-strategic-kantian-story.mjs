import assert from 'node:assert/strict';
import {strategicKantianContent,strategicKantianKeys} from './src/strategic-kantian-content.mjs';
import {kantianStory} from './src/strategic-kantian-story.mjs';
import {kantian,cournot} from './src/games.mjs';
let checks=0;const ok=(x,msg)=>{assert.ok(x,msg);checks++;};
assert.deepEqual(strategicKantianKeys,['intro','definition','derive','line','compare','boundary']);checks++;
for(const key of strategicKantianKeys){const c=strategicKantianContent[key];ok(c.question&&c.conditions&&c.formula&&c.proof.length&&c.template&&c.trap&&c.source,key+' content');ok(c.steps.length===6,key+' steps');for(let k=0;k<6;k++){const f=kantianStory(key,k);ok(f.identity&&f.narration,key+' frame '+k);ok(f.q1>=0&&f.q2>=0&&f.q1<=1&&f.q2<=1&&f.lambda>0&&f.lambda*f.q1<=1+1e-9&&f.lambda*f.q2<=1+1e-9,key+' feasible '+k);ok(Math.abs(f.model.initial[0]-f.q1*Math.max(0,1-f.total))<1e-9,key+' baseline');ok(Math.abs(f.model.joint[0]-f.lambda*f.q1*Math.max(0,1-f.lambda*f.total))<1e-9,key+' joint');}}
for(let k=0;k<=10;k++){const q1=k/20,q2=.5-q1;const r=kantian(q1,q2,1);ok(r.isKantian,'full KE line '+q1);if(q1>0&&q2>0){ok(Math.abs(r.jointOpt-1)<1e-9,'peak 1');for(const lambda of [.25,.5,.75,1.25,1.5,2])ok(r.initial[0]>=kantian(q1,q2,lambda).joint[0]-1e-9,'KE profit dominates');}}
const ke=kantian(.25,.25,1.5);ok(ke.isKantian&&!cournot(.25,.25,0).ne,'quarter KE only');ok(Math.abs(ke.initial[0]-.125)<1e-9,'quarter baseline');ok(Math.abs(ke.single[0]-9/64)<1e-9,'quarter unilateral improvement');ok(Math.abs(ke.joint[0]-3/32)<1e-9,'quarter joint deterioration');
const ne=kantian(1/3,1/3,.75);ok(cournot(1/3,1/3,0).ne&&!ne.isKantian,'third NE only');ok(Math.abs(ne.joint[0]-.125)<1e-9&&Math.abs(ne.initial[0]-1/9)<1e-9,'third joint improvement');
const boundary=kantian(1,1,.25);ok(cournot(1,1,0).ne&&!boundary.isKantian,'zero price boundary NE');ok(boundary.initial[0]===0&&Math.abs(boundary.joint[0]-.125)<1e-9,'joint scale escape');
for(let k=0;k<=100;k++){const qi=k/100;ok(cournot(qi,1,0).u[0]===0,'against 1 every deviation yields zero');}
console.log({passed:true,checks,cases:strategicKantianKeys.length,frames:strategicKantianKeys.length*6});

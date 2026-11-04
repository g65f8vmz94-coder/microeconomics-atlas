import assert from 'node:assert/strict';
import {strategicExistenceContent,strategicExistenceKeys} from './src/strategic-existence-content.mjs';
import {existenceStory,originalFigure154a,figure154b} from './src/strategic-existence-story.mjs';
import {symmetricBR,finiteBR,monotoneTrace} from './src/games.mjs';

assert.equal(strategicExistenceKeys.length,9);
for(const key of strategicExistenceKeys){const c=strategicExistenceContent[key];assert.equal(c.steps.length,6,key);assert.ok(c.question&&c.conditions&&c.formula&&c.proof.length&&c.template&&c.source,key);for(let i=0;i<6;i++){const f=existenceStory(key,i);assert.equal(f.key,key);assert.equal(f.step,i);assert.ok(f.identity&&f.narration,key+' '+i);}}
for(const x of [.2,.5,.8])assert.ok(Math.abs(symmetricBR('increasing',x)-x)<1e-12);
let prev=-1;for(let i=0;i<=10000;i++){const v=symmetricBR('increasing',i/10000);assert.ok(v>=0&&v<=1);assert.ok(v>prev);prev=v;}
assert.deepEqual(originalFigure154a,finiteBR);
assert.deepEqual(finiteBR.one,[2,2,4,6,6,6,7]);
assert.deepEqual(finiteBR.two,[1,3,4,4,5,5,6,7]);
assert.deepEqual(monotoneTrace(),[[1,1],[2,1],[2,3],[4,3],[4,4],[6,4],[6,5]]);
assert.equal(existenceStory('fig154a',5).ne,true);
assert.deepEqual(figure154b.intervals,[[1,3],[4,5],[6,6],[7,8]]);
assert.deepEqual(figure154b.a,[4,7,7,8]);
assert.equal(existenceStory('proofPartition',5).ne,true);
for(let i=0;i<6;i++){const f=existenceStory('ex1512',i);assert.ok(Math.abs(f.x+f.y-1)<1e-12);assert.deepEqual(existenceStory('ties',i).payoff,[0,0]);}
console.log({passed:true,cases:9,frames:54,figure154aPoints:15,finiteTrace:7});

import assert from 'node:assert/strict';
import katex from './src/vendor/katex/katex.min.js';
import {strategicFoundationsContent,strategicFoundationsKeys} from './src/strategic-foundations-content.mjs';
import {strategicFoundationsStory,analyzeFoundationGame} from './src/strategic-foundations-story.mjs';

let checks=0;
assert.deepEqual(strategicFoundationsKeys,['d151','ordinal151','d152','d153','tie151']);checks++;
for(const key of strategicFoundationsKeys){
 const c=strategicFoundationsContent[key];
 assert.equal(c.steps.length,6,key);assert.ok(c.question&&c.conditions&&c.proof.length>=3&&c.template&&c.trap&&c.source,key);
 assert.ok(c.source.includes('§15.1')&&!c.source.includes('例15.1'),key);katex.renderToString(c.formula,{throwOnError:true,strict:'ignore'});checks+=4;
 for(let step=0;step<6;step++){
  const f=strategicFoundationsStory(key,step),{M}=f.game,[i,j]=f.selected;
  assert.equal(f.step,step);assert.equal(f.identity,c.steps[step][0]);assert.equal(f.narration,c.steps[step][1]);assert.deepEqual(f.audit.u,M[i][j]);
  const rowMax=Math.max(M[0][j][0],M[1][j][0]),colMax=Math.max(M[i][0][1],M[i][1][1]);
  assert.equal(f.audit.gains[0],rowMax-M[i][j][0]);assert.equal(f.audit.gains[1],colMax-M[i][j][1]);checks+=6;
 }
}
const base=strategicFoundationsStory('d153',5).audit;
assert.deepEqual(base.brRow,[[0],[1]]);assert.deepEqual(base.brCol,[[0],[1]]);assert.deepEqual(base.ne,[[0,0],[1,1]]);checks+=3;
const tied=strategicFoundationsStory('tie151',2).audit;
assert.deepEqual(tied.brRow[0],[0,1]);assert.equal(tied.isNE,false);assert.deepEqual(tied.ne,[[0,0],[1,1]]);checks+=3;
const before=strategicFoundationsStory('ordinal151',0),after=strategicFoundationsStory('ordinal151',5);
assert.deepEqual(after.audit.ne,before.audit.ne);for(let i=0;i<2;i++)for(let j=0;j<2;j++){assert.equal(after.game.M[i][j][0],2*before.game.M[i][j][0]+1);assert.equal(after.game.M[i][j][1],3*before.game.M[i][j][1]+2);checks+=2;}
const nash=strategicFoundationsStory('d152',5);assert.deepEqual(nash.deviation.gains,[1,1]);assert.equal(nash.audit.isNE,true);checks+=2;
assert.throws(()=>analyzeFoundationGame({row:['x','y'],col:['x','y'],M:[[[0,0]]]}));checks++;
console.log({passed:true,cases:strategicFoundationsKeys.length,frames:30,checks});

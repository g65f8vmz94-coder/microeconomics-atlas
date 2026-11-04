import assert from 'node:assert/strict';
import {healthFilmState, survival} from './src/expectations.mjs';

// Every interpolated point is an actual feasible outcome of the shared model.
for (const [m,p] of [[10,2],[8,3],[13,1.5]]) {
 const start=healthFilmState({m,p,phase:1}),end=healthFilmState({m,p,phase:2});
 assert.ok(start.privateY<end.socialY && end.socialY<m/p);
 assert.ok(Math.abs(start.collectiveY-start.privateY)<1e-9);
 assert.ok(Math.abs(end.collectiveY-end.socialY)<1e-9);
 let previous=-Infinity;
 for(let i=0;i<=100;i++){
  const r=healthFilmState({m,p,phase:1+i/100});
  const expected=(m-p*r.collectiveY)*survival(r.collectiveY,r.collectiveY);
  assert.ok(Math.abs(r.collectiveUtility-expected)<1e-10);
  assert.ok(r.collectiveY>=r.privateY && r.collectiveY<=r.socialY);
  assert.ok(r.collectiveUtility>=previous-1e-10);
  previous=r.collectiveUtility;
 }
}
console.log(JSON.stringify({passed:true,parameterSets:3,intermediateStates:303}));

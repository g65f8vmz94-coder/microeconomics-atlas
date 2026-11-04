import assert from 'node:assert/strict';
import {consumerStories,consumerFrame} from './src/consumer-story.mjs';
import {warpC} from './src/consumer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(consumerStories.property.frames.length,4);
let transitionChecks=0;
for(let k=1;k<100;k++){
 const t=k/100,s=consumerFrame('property',t).state,p=s.p1,comp=6*p+6;
 assert.ok(p>=1&&p<=2);near(p*6+6,comp);
 if(s.candidate){const [x,y]=s.candidate;near(p*x+y,comp);assert.ok(x>=6&&x<=8&&y>=2);if(x>6+1e-9)assert.ok(x+y<12);else near(x+y,12);}
 transitionChecks++;
}
const a={prices:[1,1],w:12,bundle:[6,6]},b={prices:[2,1],w:18,bundle:[8,2]},z=warpC(a,b);
assert.deepEqual(z.cross,[10,18]);assert.equal(z.violation,true);
let generalChecks=0;
for(const p of [.5,1,3])for(const q of [.5,1,2])for(const delta of [.1,1,3])for(const x of [1,3,6])for(const y of [1,5]){
 const w=p*x+q*y,newP=p+delta,comp=newP*x+q*y;
 for(const fraction of [.1,.3,.7]){
  const bx=x+fraction*q*y/newP,by=(comp-newP*bx)/q;
  assert.ok(bx>x&&by>=0);near(newP*bx+q*by,comp);assert.ok(p*bx+q*by<w);
  assert.equal(warpC({prices:[p,q],w,bundle:[x,y]},{prices:[newP,q],w:comp,bundle:[bx,by]}).violation,true);
  generalChecks++;
 }
}
console.log(JSON.stringify({passed:true,frames:4,transitionChecks,generalChecks}));

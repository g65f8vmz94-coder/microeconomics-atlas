import assert from 'node:assert/strict';
import {producerFrame, producerReadout} from './src/producer-story.mjs';
import {shiftedP, technologyP, priceProofP, finitePlansP, firingP, crusoeP} from './src/producer.mjs';

const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(let i=0;i<3;i++){
 const s=producerFrame('profit',i).state;
 const m=shiftedP({A:s.A ?? 2,b:s.b ?? 0,p:s.p ?? 2,w:s.w ?? 1});
 near(m.aProfit,4);near(m.profit(m.aProfit),4);near(m.p*m.mp(m.aProfit),m.w);
 assert.match(producerReadout('profit',producerFrame('profit',i)),/投入 4/);
}
// Equality at a non-strictly concave corner can leave a whole interval tied.
const plateau=a=>Math.min(a,1);
for(const a of [0,.25,.5,1])near(plateau(a)-a,0);

for(let i=0;i<4;i++){
 const frame=producerFrame('priceproof',i),s=frame.state;
 const z=priceProofP({p:s.p,w:s.w,other:s.newPrice,which:s.which,i:3,j:i===0?3:0});
 assert.deepEqual(z.before.winners,[3]);assert.deepEqual(z.after.winners,i===0?[3]:[0]);
 assert.ok(z.first>=0&&z.second>=0);
 assert.ok((s.p-s.p)*(z.B.y-z.A.y)-(s.newPrice-s.w)*(z.B.a-z.A.a)>=0);
 assert.match(producerReadout('priceproof',frame),/旧最优方案 3/);
}
// The two inequalities cannot be assumed for arbitrary unchosen plans.
const arbitrary=priceProofP({p:1,w:1,other:2.1,which:'w',i:0,j:3});
assert.ok(arbitrary.first<0);
assert.equal(finitePlansP[3].a,3);

for(let i=0;i<4;i++){
 const frame=producerFrame('techchange',i),s=frame.state;
 const z=technologyP({p:1,w:.29,delta:s.delta,kind:s.kind});
 near(z.p*z.mpf(z.af),z.w,1e-8);near(z.p*z.mpg(z.ag),z.w,1e-8);
 assert.ok(z.pg>=z.pf);
 if(i===0){near(z.ag,z.af,1e-8);near(z.yg,z.yf,1e-8);near(z.pg,z.pf,1e-8);}
 else if(s.kind==='early'){
  near(z.af,2.972651605,1e-8);near(z.ag,1.726874374,1e-8);
  assert.ok(z.ag<z.af&&z.yg<z.yf);
  assert.match(producerReadout('techchange',frame),/最优投入/);
 }else{
  near(z.ag,8.590963139,1e-8);assert.ok(z.ag>z.af&&z.yg>z.yf);
  assert.match(producerReadout('techchange',frame),/最优投入/);
 }
}
for(let i=0;i<4;i++){
 const frame=producerFrame('firing',i),z=firingP(frame.state);
 const expected=[1,1/(.7*.7),4,4][i];near(z.ordinary,1);near(z.chosen,expected);near(z.subjective(4),0);near(z.subjective(1),1-3*frame.state.loss);
 if(i>=2){assert.ok(frame.state.w-frame.state.loss<=frame.state.p*z.m.mp(frame.state.a0));assert.ok(frame.state.p*z.m.mp(frame.state.a0)<=frame.state.w);}
 for(let j=0;j<=1000;j++)assert.ok(z.subjective(j/100)<=z.subjective(z.chosen)+1e-9);
 assert.match(producerReadout('firing',frame),/现金最优 1 单位/);
}
for(let i=0;i<3;i++){
 const frame=producerFrame('crusoe',i),z=crusoeP(frame.state);
 near(z.lStar,2/3);near(z.cStar,1/Math.sqrt(3));
 near(z.currentC,z.frontier(frame.state.leisure));
 for(let j=0;j<=100;j++)assert.ok(z.U(j/100,z.frontier(j/100))<=z.utilityStar+1e-9);
}
for(let i=0;i<3;i++){
 const frame=producerFrame('harmony',i),z=crusoeP(frame.state);
 assert.ok(z.inHarmony);near(z.firmX,z.laborSupply,1e-8);near(z.firmY,z.cConsumer,1e-8);
 if(frame.state.goal==='output'){near(z.firmX,.5);assert.ok(z.consumerUtility<z.utilityStar);}
 else near(z.firmX,1/3);
}
console.log(JSON.stringify({passed:true,profitFrames:3,priceProofFrames:4,technologyFrames:4,firingFrames:4,crusoeFrames:3,harmonyFrames:3,earlyInput:1.726874374,marginalInput:8.590963139}));

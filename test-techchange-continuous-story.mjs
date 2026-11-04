import assert from 'node:assert/strict';
import {producerStories,producerFrame,producerReadout} from './src/producer-story.mjs';
import {technologyP} from './src/producer.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(producerStories.techchange.frames.length,4);
let checks=0,last=Infinity;
for(let i=0;i<=100;i++){const t=i/100,f=producerFrame('techchange',t),s=f.state,z=technologyP({p:1,w:.29,delta:s.delta,kind:s.kind});near(s.delta,.7*t);near(z.p*z.mpg(z.ag),z.w);assert.ok(z.ag<=last+1e-8);assert.ok(z.pg>=z.pf-1e-8);for(let j=1;j<=2000;j++){const a=j/100,g2=-1/(4*a**1.5)+s.delta*(a-2)*Math.exp(-a);assert.ok(z.g(a)>=z.f(a)-1e-10&&z.mpg(a)>0&&g2<0);assert.ok(z.p*z.g(a)-z.w*a<=z.pg+1e-8);}last=z.ag;checks++;}
const old=producerFrame('techchange',0),end=producerFrame('techchange',1),f=technologyP({delta:end.state.delta}),alt=producerFrame('techchange',3),g=technologyP({delta:alt.state.delta,kind:alt.state.kind});near(old.state.delta,0);assert.ok(f.ag<f.af&&f.yg<f.yf&&f.pg>f.pf);assert.ok(g.ag>g.af&&g.yg>g.yf);assert.match(producerReadout('techchange',end),/利润/);assert.ok(end.formula.includes('e^{-a}'));
console.log(JSON.stringify({passed:true,transitionStates:checks,gridPoints:checks*2000,shrinkAndProfitChecked:true,alternateTechnologyChecked:true}));

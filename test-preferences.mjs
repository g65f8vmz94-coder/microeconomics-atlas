import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prefU,compareP,blend,monotoneWitness,lexContinuity,utilityGap,intermediateP,convexP,diminishingP,localP,problem1P,relativeP,caseSections,caseNames} from './src/preferences.mjs';
let checks=0;const ok=(b,m)=>{assert.ok(b,m);checks++},eq=(a,b,m)=>{ok(Math.abs(a-b)<1e-8,m+': '+a+' vs '+b)};
const all=Object.values(caseSections).flat();ok(all.length===19,'19 source-specific cases');ok(new Set(all).size===all.length,'unique cases');for(const k of all)ok(!!caseNames[k],k+' named');
for(const k of ['linear','neutral','threshold','min','ideal','lex']){
 const z=monotoneWitness(k);ok(z.comparison===(z.weak?z.strong?1:0:-1),k+' witness');
}
for(let v=.2;v<=3;v+=.2)for(let x=0;x<=9;x++)for(let y=0;y<=9;y++){
 const a=[x,y],b=[x+.3,y+.4];ok(compareP('linear',b,a,v)===1,'linear strong monotonicity');ok(compareP('min',b,a)>=0,'min monotonicity');ok(compareP('lex',b,a)===1,'lex strong monotonicity');
}
for(const e of [.001,.01,.1,.5,1]){const z=lexContinuity(e);ok(z.first===1&&z.reversed===-1&&z.distance<e,'lex continuity counterexample')}
for(let t=0;t<=1;t+=.05){const z=utilityGap(t);ok(z.ua>z.ux-z.third&&z.ub<z.uy+z.third&&z.ua>z.ub,'continuity gap');const q=intermediateP(t);eq(q.uz,(1+7*t)**2,'IVT path');}
const mid=intermediateP(intermediateP().root);eq(mid.uz,mid.target,'intermediate exact root');
for(let t=.05;t<1;t+=.05){for(const k of ['min','ideal','lex']){const z=convexP(k,t);ok(z.zVersusB>=0,k+' convex segment')}const z=convexP('max',t);if(t>.2&&t<.8)ok(z.zVersusB<0,'max nonconvex interior');}
for(const t of [.1,.25,.5,.75,.9]){const z=blend([0,0],[2,2],t),u=prefU('minSquared',...z),avg=t*prefU('minSquared',0,0)+(1-t)*prefU('minSquared',2,2);ok(u<avg,'min squared not concave');ok(compareP('minSquared',z,[0,0])===compareP('min',z,[0,0]),'same ordinal preference')}
const d=diminishingP();ok(d.beta>d.gamma&&d.umiddle>d.ub,'decreasing exchange amounts and midpoint above exact indifference for CD');
const l=localP(1,-.6,.2);ok(l.dot>0&&l.productGain>0&&l.kinkDot>0&&l.minGain<0,'smooth vs kink direction');
for(const k of ['distance','balanced','sumlex']){const z=problem1P(k);ok(z.a.length===2&&z.z.length===2,k+' endpoints');}
ok(problem1P('distance').zb<0,'distance not convex');ok(problem1P('balanced').zb<0,'balanced not convex');ok(problem1P('sumlex').zb>0,'sumlex convex witness');
for(let a=.1;a<=3;a+=.2)for(let b=0;b<=6;b+=.2){const z=relativeP(a,b);if(z.A>=0)ok(z.B===1,'problem4.7 implication');ok(z.lex===-1,'lex antecedent false')}
const payload={passed:true,checks,chapter:4,cases:all.length,scope:'pure-model properties, source counterexamples, chapter-end problem witnesses; finite grids do not prove unrestricted theorems'};
fs.writeFileSync(new URL('./qa/preference-models.json',import.meta.url),JSON.stringify(payload,null,2));
console.log(JSON.stringify(payload));

import assert from 'node:assert/strict';
import {cases,distribute,proofProfile,shapleyLayers,arrivals,close,changeAudit,permutationAudit,axiomWitness,shapleyAxiomWitness,sum} from './src/social-lab.mjs';
let checks=0;const yes=(v,msg)=>{checks++;assert.ok(v,msg)};
const profiles=n=>{const a=[];function go(prefix){if(prefix.length===n){a.push(prefix);return}for(let x=0;x<=4;x++)go([...prefix,x])}go([]);return a};
for(const [k,c] of Object.entries(cases)){const r=distribute(c.profile,c.rule);yes(r.feasible,'case feasible '+k);yes(close(sum(r.input),1),'input=1 '+k)}
for(const n of [2,3,4])for(const lambda of profiles(n))for(const rule of ['equal-own','max-own','equal-equal','social','one-one','proportional','min-equal','dictator','low-share','high-share','min-own','shapley','priority-shapley',...(n===2?['cross']:[])]){
 const r=distribute(lambda,rule);yes(r.feasible,rule+' feasible '+lambda);yes(close(sum(r.wealth),r.total),rule+' wealth conservation '+lambda);
}
const base=[3,6,9];
const expected={
 'equal-own':{input:[1/3,1/3,1/3],wealth:[1,2,3]},
 'max-own':{input:[0,0,1],wealth:[0,0,9]},
 'equal-equal':{input:[1/3,1/3,1/3],wealth:[2,2,2]},
 social:{input:[0,0,1],wealth:[3,3,3]},
 'one-one':{input:[1,0,0],wealth:[0,3,0]},
 proportional:{input:[0,0,1],wealth:[1.5,3,4.5]}
};
for(const [rule,e] of Object.entries(expected)){const r=distribute(base,rule);e.input.forEach((v,i)=>yes(close(r.input[i],v),rule+' input '+i));e.wealth.forEach((v,i)=>yes(close(r.wealth[i],v),rule+' wealth '+i))}
const prop={
 efficiency:(r)=>close(r.total,r.max),
 symmetry:(r)=>r.lambda.every((x,i)=>r.lambda.every((y,j)=>!close(x,y)||close(r.wealth[i],r.wealth[j]))),
 own:(lambda,rule)=>lambda.every((_,i)=>[1,2].every(d=>changeAudit(lambda,rule,i,d).own)),
 others:(lambda,rule)=>lambda.every((_,i)=>[1,2].every(d=>changeAudit(lambda,rule,i,d).others))
};
const expectedFailures={'min-equal':'efficiency',dictator:'symmetry','low-share':'own','high-share':'others'};
for(const [rule,miss] of Object.entries(expectedFailures)){
 const w=axiomWitness(rule);yes(w.miss.length>0,'witness '+rule);
 let found=false;
 for(const lambda of profiles(3)){
  const r=distribute(lambda,rule);
  for(const key of ['efficiency','symmetry','own','others']){
   const pass=key==='efficiency'||key==='symmetry'?prop[key](r):prop[key](lambda,rule);
   if(key===miss&&!pass)found=true;
   if(key!==miss)yes(pass,rule+' must satisfy '+key+' '+lambda);
  }
 }
 yes(found,rule+' must fail '+miss);
}
for(const lambda of profiles(3)){
 yes(proofProfile(lambda,2).every(v=>v===Math.max(...lambda)),'proof endpoint for any maximum position '+lambda);
 const r=distribute(lambda,'social');yes(r.efficient,'social efficient');yes(prop.symmetry(r),'social symmetric');yes(prop.own(lambda,'social'),'social own monotone');yes(prop.others(lambda,'social'),'social others monotone');
}
const shapleyMarginal=(lambda,rule)=>{
 const M=Math.max(...lambda),tops=lambda.map((v,i)=>v===M?i:-1).filter(i=>i>=0),base=distribute(lambda,rule).wealth;
 for(let mask=1;mask<(1<<tops.length);mask++)for(const delta of [1,2]){
  const add=lambda.map(()=>0);tops.forEach((i,k)=>{if(mask&(1<<k))add[i]=delta});
  const raised=distribute(lambda.map((x,i)=>x+add[i]),rule).wealth,increment=distribute(add,rule).wealth;
  for(const i of tops)if(add[i]&&!close(raised[i],base[i]+increment[i]))return false;
 }return true;
};
const props3={
 efficiency:r=>r.efficient,
 symmetry:r=>prop.symmetry(r),
 zero:r=>r.lambda.every((v,i)=>v!==0||close(r.wealth[i],0)),
 marginal:(l,rule)=>shapleyMarginal(l,rule)
};
const shapleyFailures={'min-equal':'efficiency','priority-shapley':'symmetry',social:'zero',proportional:'marginal'};
for(const [rule,miss] of Object.entries(shapleyFailures)){
 yes(shapleyAxiomWitness(rule).miss.length>0,'Shapley witness '+rule);let found=false;
 for(const lambda of profiles(3)){
  const r=distribute(lambda,rule);
  for(const key of ['efficiency','symmetry','zero','marginal']){
   const pass=key==='marginal'?props3[key](lambda,rule):props3[key](r);
   if(key===miss&&!pass)found=true;
   if(key!==miss)yes(pass,rule+' must satisfy '+key+' '+lambda);
  }
 }
 yes(found,rule+' must fail '+miss);
}
for(const lambda of profiles(3))for(const who of [0,1,2])for(const d of [1,2])for(const rule of ['max-own','proportional']){
 const a=changeAudit(lambda,rule,who,d);if(a.before.wealth[who]>1e-9)yes(a.after.wealth[who]>a.before.wealth[who]+1e-9,'strong own '+rule+lambda);
}
const sh2=shapleyLayers([1,3]).wealth;yes(close(sh2[0],.5)&&close(sh2[1],2.5),'problem19.3a');
const sh4=shapleyLayers([1,3,6,10]).wealth,a4=arrivals([1,3,6,10]);yes(a4.orders.length===24,'24 permutations');a4.average.forEach((v,i)=>yes(close(v,sh4[i]),'problem19.3c average '+i));yes(close(sum(sh4),10),'problem19.3b sum');
const cross=distribute([2,4],'cross');yes(close(cross.wealth[0],2)&&close(cross.wealth[1],1),'problem19.1b relative counterexample');
yes(permutationAudit([2,4,6],'one-one',[1,2,0]).anonymous===false,'fixed roles violate anonymity');
yes(changeAudit([2,3,6],'min-own',0,3).own===false,'definition19.8 counterexample');
yes(changeAudit([3,2,1],'max-own',1,2).others===false,'definition19.9 counterexample');
console.log(JSON.stringify({passed:true,checks,cases:Object.keys(cases).length,shapley2:sh2,shapley4:sh4,arrivalOrders:a4.orders.length}));

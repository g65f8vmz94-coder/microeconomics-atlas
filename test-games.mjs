import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as g from './src/games.mjs';
let checks=0;const ok=(v,msg)=>{checks++;assert.ok(v,msg)},eq=(a,b,msg)=>ok(Math.abs(a-b)<1e-8,msg||`${a} != ${b}`);
for(const [game,expected] of Object.entries({intro:[[0,1]],pd:[[1,1]],bach:[[0,0],[1,1]],pennies:[],gates:[[0,0],[1,1],[2,2]],saddle:[[1,1]]})){checks++;assert.deepEqual(g.matrixAnalysis(game).pure,expected);}
for(const game of ['bach','pennies']){const r=g.matrixAnalysis(game).mixed;g.matrixAnalysis(game,0,0,r.pStar,r.qStar).mixed.gains.forEach(x=>eq(x,0));}
let travelerNE=[];for(let a=180;a<=300;a++)for(let b=180;b<=300;b++){const r=g.traveler(a,b);if(r.gains.every(x=>x===0))travelerNE.push([a,b]);for(let i=0;i<2;i++)ok(r.gains[i]>=0);}
checks++;assert.deepEqual(travelerNE,[[180,180]]);
for(let a=0;a<=16;a+=.5)for(let b=0;b<=16;b+=.5)for(const rule of ['first','second']){
 const r=g.auction(rule,[a,b]);eq(r.u.reduce((a,b)=>a+b,0)+r.payment,[10,5][r.winner]);
 for(let i=0;i<2;i++){let sampleBest=-Infinity;for(let bid=0;bid<=16;bid+=.25){const bids=[a,b];bids[i]=bid;const win=bids[0]>=bids[1]?0:1,pay=rule==='first'?bids[win]:bids[1-win];const u=win===i?[10,5][i]-pay:0;sampleBest=Math.max(sampleBest,u);}
  ok(r.best[i]>=sampleBest-1e-8,'auction bound');const bids=[a,b];bids[i]=r.witnesses[i].bid;eq(g.auction(rule,bids).u[i]-r.u[i],r.witnesses[i].gain);if(r.gains[i]>1e-6)ok(r.witnesses[i].gain>0,'auction witness');
 }
 ok(r.equilibrium===r.gains.every(x=>x<1e-8));
}
eq(g.auction('first',[8,2]).witnesses[0].gain,6);ok(g.auction('second',[10,5]).equilibrium);
for(const rival of Array.from({length:65},(_,i)=>i/4))for(let who=0;who<2;who++){const truth=[rival,rival];truth[who]=[10,5][who];const u=g.auction('second',truth).u[who];for(let bid=0;bid<=16;bid+=.25){const alt=[...truth];alt[who]=bid;ok(g.auction('second',alt).u[who]<=u+1e-9,'truth weak dominance');}}
for(let a=0;a<=10;a++)for(let b=0;b<=10;b++)for(let d=0;d<=10;d++){const pos=[a/10,b/10,d/10],r=g.locationShares(pos);eq(r.shares.reduce((a,b)=>a+b,0),1);ok(pos.some((_,i)=>g.locationDeviation(pos,i).gain>1e-8),'three locations no pure NE');}
eq(g.locationDeviation([.5,.5],0).gain,0);
for(let c=.1;c<=.9;c+=.2)for(let a=0;a<=1;a+=.1)for(let b=0;b<=1;b+=.1){const r=g.cournot(a,b,c);for(let i=0;i<2;i++)for(let x=0;x<=1;x+=.02)ok(x*(Math.max(0,1-x-[b,a][i])-c)<=r.u[i]+r.gains[i]+1e-8);}
for(const c of [0,.1,.5,.9]){const q=(1-c)/3;ok(g.cournot(q,q,c).ne);ok(g.bertrand(c,c,c).ne);g.effort(c,c,c).gains.forEach(x=>eq(x,0));}
ok(g.cournot(1,1,0).ne);ok(!g.cournot(1,1,.1).ne);ok(!g.cournot(1,0,0).ne);
for(const c of [0,.2,.9])for(let a=0;a<=1.2;a+=.1)for(let b=0;b<=1.2;b+=.1){const r=g.bertrand(a,b,c);for(let i=0;i<2;i++)for(let x=0;x<=1.2;x+=.02){const prices=[a,b];prices[i]=x;ok(g.bertrand(...prices,c).u[i]<=r.best[i]+1e-8,'Bertrand supremum');}}
const trace=g.monotoneTrace();for(let i=1;i<trace.length;i++)ok(trace[i].every((v,j)=>v>=trace[i-1][j]));checks++;assert.deepEqual(trace.at(-1),[6,5]);
for(const x of [.2,.5,.8])eq(g.symmetricBR('increasing',x),x);for(let i=0;i<=100;i++)eq(g.symmetricBR('decreasing',g.symmetricBR('decreasing',i/100)),i/100);
for(const a of [.1,.2,.3,.4]){const b=.5-a;ok(g.kantian(a,b,1).isKantian);for(let l=.1;l<=2;l+=.1){const r=g.kantian(a,b,l);ok(r.joint[0]<=r.initial[0]+1e-9);ok(r.joint[1]<=r.initial[1]+1e-9)}}
for(const c of [.1,.25,.5,.9]){const r=g.attrition(c);eq(r.prob.reduce((a,b)=>a+b,0)+r.tail,1);r.eu.forEach(x=>eq(x,0));ok(g.attrition(c,0,r.threshold).pureNE);if(r.threshold>0)ok(!g.attrition(c,0,r.threshold-1).pureNE);}
// Independently enumerate complete strategies in every subgame. This checks the
// one-deviation implementation against the definition, including off-path nodes.
function allPolicies(root){const n=g.treeNodes(root).reduce((n,x)=>n*x.children.length,1);return Array.from({length:n},(_,i)=>g.policyFromIndex(root,i));}
for(const root of [g.makeTree('entry'),g.makeTree('entry',2,3,3),g.makeTree('ultimatum',2),g.makeTree('centipede',2,3)]){
 const policies=allPolicies(root);for(const [index,policy] of policies.entries()){
  eq(g.policyIndex(root,policy),index);const audit=g.treeAudit(root,policy);let spe=true;
  for(const n of g.treeNodes(root))for(let player=0;player<2;player++){
   const base=g.treeOutcome(n,policy).payoff[player];for(const alt of policies){const merged={...policy};for(const owned of g.treeNodes(root).filter(x=>x.player===player))merged[owned.id]=alt[owned.id];if(g.treeOutcome(n,merged).payoff[player]>base+1e-9)spe=false;}
  }ok(audit.spe===spe,'SPE vs full strategy enumeration');if(spe)ok(audit.nash);
 }for(const tie of [false,true])ok(g.treeAudit(root,g.backwardTree(root,tie).policy).spe);
}
const entry=g.makeTree('entry'),threat=g.treeAudit(entry,g.policyFromIndex(entry,0));ok(threat.nash&&!threat.spe);
const ultima=g.makeTree('ultimatum',2),spe=allPolicies(ultima).filter(p=>g.treeAudit(ultima,p).spe).map(p=>g.treeOutcome(ultima,p).payoff.join(','));checks++;assert.deepEqual([...new Set(spe)].sort(),['1,1','2,0']);
for(const a of [.1,.5,.95])for(const b of [.1,.5,.95]){const r=g.bargaining('alternating',a,b);eq(r.x[0]+r.x[1],1);eq(r.y[0]+r.y[1],1);eq(r.x[1],b*r.y[1]);eq(r.y[0],a*r.x[0]);}
for(let T=1;T<=8;T++)eq(g.bargaining('finite',.8,.8,T).winner,(T-1)%2);
for(const b of [.1,.5,.95])for(const share of [0,.5,.9]){const r=g.bargaining('discountOne',.8,b,3,share,3);ok(r.profitableOffer>b*(1-share));ok(r.profitableOffer<1-share);eq(r.bound,b**3);}
fs.writeFileSync('qa/games-models.json',JSON.stringify({passed:true,checks,scope:'Analytic bounds, independent finite best responses, all complete strategies in small trees and every subgame; source boundary counterexamples included.'},null,2));console.log({passed:true,checks});

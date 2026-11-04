import assert from 'node:assert/strict';
import {vcgStoryContent,vcgStoryKeys} from './src/vcg-story-content.mjs';
import {vcgStoryFrame} from './src/vcg-story.mjs';
import {bookProfiles,budgetGrid,projectOutcome,trueUtility,auctionOutcome} from './src/mechanism.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
eq(vcgStoryKeys,['d175','e173','p171','nonexec','rebate','fairness','q171a','q171b','q172a','q172b','q173']);
for(const key of vcgStoryKeys){const c=vcgStoryContent[key];eq(c.steps.length,6);assert.ok(c.question&&c.conditions&&c.proof.length>=3&&c.template&&c.source.includes('印刷'),key);checks++;for(let step=0;step<6;step++){const f=vcgStoryFrame(key,step);eq(f.identity,c.steps[step][0]);eq(f.narration,c.steps[step][1]);if(f.kind==='project'){const result=projectOutcome(f.reports,'vcg',f.cost);eq(f.outcome,result);if(f.values!==null&&f.rebate===undefined)eq(f.focusUtility,trueUtility(f.values[f.focus],result,f.focus));if(f.cost)eq(f.outcome.share,f.cost/f.reports.length);}else if(f.kind==='fairness'){eq(f.outcome.total,200-f.poor);eq(f.outcome.decision,+(f.poor<200));}else if(f.kind==='grid'){eq(f.rows,budgetGrid());eq(f.selected.decision,+(f.selected.x+f.selected.y>0));}else{eq(f.outcome,auctionOutcome(f.bids,f.values,f.rule));}}}
for(let i=0;i<4;i++)eq(vcgStoryFrame('e173',i).reports,bookProfiles[i]);
eq(vcgStoryFrame('d175',1).outcome.transfers[0],-6);eq(vcgStoryFrame('d175',2).outcome.decision,0);eq(vcgStoryFrame('d175',4).outcome.transfers[0],-6);
eq(vcgStoryFrame('nonexec',4).outcome.transfers,[-4,0,0,0,0]);
eq(vcgStoryFrame('rebate',0).focusUtility,1);eq(vcgStoryFrame('rebate',4).focusUtility,5);eq(vcgStoryFrame('rebate',4).rebate,4);
eq(vcgStoryFrame('fairness',0).outcome.transfers.every(x=>x===0),true);
eq(vcgStoryFrame('q171a',0).rows.filter(r=>r.transfers.some(t=>t<0)).length,4);
eq(vcgStoryFrame('q171a',0).rows.find(r=>r.x===4&&r.y===-5).transfers,[0,-4]);
eq(vcgStoryFrame('q171a',0).rows.find(r=>r.x===-5&&r.y===4).transfers,[-4,0]);
eq(vcgStoryFrame('q172a',4).outcome.winner,0);eq(vcgStoryFrame('q172a',4).outcome.payment,5);
eq(vcgStoryFrame('q172b',0).outcome.utility[0],0);eq(vcgStoryFrame('q172b',1).outcome.utility[0],4);
eq(vcgStoryFrame('q173',0).outcome.net,[7,1,-2]);eq(vcgStoryFrame('q173',0).outcome.transfers,[ -1,0,0]);eq(vcgStoryFrame('q173',0).focusUtility,6);
for(const value of [0,1,3,5,7])for(const b of [0,3,5])for(const c of [0,3,5])for(const report of [0,1,3,5,7,9]){const vals=[value,b,c],honest=auctionOutcome(vals,vals,'second'),alternative=auctionOutcome([report,b,c],vals,'second');assert.ok(honest.utility[0]>=alternative.utility[0],JSON.stringify({value,b,c,report}));checks++;}
console.log({passed:true,checks,cases:vcgStoryKeys.length,frames:vcgStoryKeys.length*6});

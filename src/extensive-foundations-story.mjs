import {makeTree,treeNodes,treeOutcome,treeAudit,backwardTree} from './games.mjs';
import {extensiveFoundationsContent} from './extensive-foundations-content.mjs';

const entryPlans={threat:{root:0,in:0},inFight:{root:1,in:0},outCoop:{root:0,in:1},comply:{root:1,in:1}};
export function figure162Tree(){return {id:'root',player:0,children:[{label:'A',node:{id:'afterA',player:1,children:[{label:'C',node:{id:'u',terminal:'u'}},{label:'D',node:{id:'v',terminal:'v'}}]}},{label:'B',node:{id:'afterB',player:2,children:[{label:'E',node:{id:'w',terminal:'w'}},{label:'F',node:{id:'x',terminal:'x'}},{label:'G',node:{id:'afterBG',player:0,children:[{label:'H',node:{id:'y',terminal:'y'}},{label:'I',node:{id:'z',terminal:'z'}}]}}]}}]};}
export const figure162Plan={root:0,afterA:0,afterB:2,afterBG:1};
export function continuation(root,historyId,policy){let history=[];function find(n){if(n.id===historyId)return n;for(const c of n.children||[]){history.push(c.label);const match=find(c.node);if(match)return match;history.pop();}return null;}const start=find(root);if(!start)throw Error('Missing history');const out=treeOutcome(start,policy);return {history:[...history,...out.path.map(x=>x.label)],leaf:out.leaf};}
export function ultimatumPlan(K,variant='allY'){const root=makeTree('ultimatum',K),policy={root:variant==='allY'?K:variant==='lastN'?K-1:variant==='selectFirst'?0:K};for(let i=0;i<=K;i++)policy['offer'+i]=variant==='allY'?0:variant==='lastN'&&i===K?1:variant==='selectFirst'&&i>0?1:variant==='allN'?1:0;return {root,policy};}
export function centipedePlan(T,stopAt=0){const root=makeTree('centipede',2,T),policy={};for(let t=0;t<2*T;t++)policy['c'+t]=t===stopAt?0:1;return {root,policy};}
const entryRoutes={
 intro:['threat','threat','inFight','comply','threat','comply'],d161:['comply','comply','comply','comply','comply','comply'],info:['comply','comply','comply','comply','threat','comply'],
 d162:['threat','threat','threat','threat','threat','threat'],d164:['threat','threat','threat','threat','threat','threat'],d165:['threat','threat','threat','outCoop','outCoop','threat'],
 d166:['threat','threat','threat','threat','threat','comply'],entry:['threat','threat','threat','comply','comply','comply']
};
const focusRoutes={
 intro:['root','out','fight','coop','in','in'],d161:['root','root','out','in','coop','root'],info:['root','in','in','coop','in','root'],d162:['root','in','in','root','out','in'],
 fig162:['root','afterA','afterB','afterBG','afterBG','root'],d163:['root','root','afterA','u','afterBG','u'],d164:['root','root','in','root','in','in'],
 d165:['root','in','in','in','out','in'],d166:['root','root','in','fight','coop','root'],entry:['root','in','in','in','root','root'],
 ultimatumRules:['root','offer0','offer1','offer2','root','root'],ultimatumNE:['offer0','root','root','offer0','offer2','root'],ultimatumSPE:['offer0','offer1','offer2','root','root','root'],ultimatumK:['root','offer0','offer0','offer4','offer4','root'],
 centipedeRules:['c0','c0','c1','c3','c5','end'],centipedeNE:['c2','c1','c5','c0','c0','c1'],centipedeSPE:['c5','c4','c3','c2','c1','c0'],centipedeBehavior:['c0','c0','c2','c2','c2','c0']
};
export function extensiveFoundationsStory(key,step=0){
 const c=extensiveFoundationsContent[key];if(!c)throw Error('Unknown §16.1 case');const k=Math.max(0,Math.min(5,Math.round(step))),base={key,step:k,identity:c.steps[k][0],narration:c.steps[k][1],focus:focusRoutes[key]?.[k]};
 if(key in entryRoutes){const root=makeTree('entry'),variant=entryRoutes[key][k],policy=entryPlans[variant],audit=treeAudit(root,policy);return {...base,kind:'entry',root,policy,variant,audit,continuation:continuation(root,'in',policy)};}
 if(key==='fig162'||key==='d163'){const root=figure162Tree(),policy={...figure162Plan,afterBG:key==='d163'?0:1},outcome=treeOutcome(root,policy),fromB=continuation(root,'afterB',policy);return {...base,kind:'figure',root,policy,outcome,fromB};}
 if(key.startsWith('ultimatum')){const K=key==='ultimatumK'?4:2,variant=key==='ultimatumRules'?'allY':key==='ultimatumNE'?['selectFirst','selectFirst','selectFirst','selectFirst','allN','allN'][k]:key==='ultimatumSPE'?(k>=4?'lastN':'allY'):(k>=4?'lastN':'allY'),{root,policy}=ultimatumPlan(K,variant),audit=treeAudit(root,policy);return {...base,kind:'ultimatum',K,root,policy,variant,audit};}
 const T=3;let plan,variant;
 if(key==='centipedeRules'){const stopAt=[0,1,2,3,5,6][k];plan=centipedePlan(T,stopAt);variant='stop'+stopAt;}
 else if(key==='centipedeNE'){const stopAt=[3,3,6,0,0,0][k];plan=centipedePlan(T,stopAt);if(k>=3){plan.policy.c0=0;plan.policy.c1=0;}variant='stop'+stopAt;}
 else if(key==='centipedeSPE'){const root=makeTree('centipede',2,T),policy=Object.fromEntries(treeNodes(root).map(n=>[n.id,1])),solved=backwardTree(root).steps.slice(0,k+1);for(const node of solved)policy[node.id]=node.choice;plan={root,policy};variant='backward'+(k+1);}
 else if(key==='centipedeBehavior'){const stopAt=[0,0,2,2,2,0][k];plan=centipedePlan(T,stopAt);if(stopAt===0)plan.policy.c1=0;variant='illustrative'+stopAt;}
 else throw Error('Missing §16.1 route');
 const {root,policy}=plan,audit=treeAudit(root,policy);return {...base,kind:'centipede',T,root,policy,variant,audit,historyCount:2*T,terminalCount:2*T+1};
}

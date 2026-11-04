import {makeTree,treeNodes,treeOutcome} from './games.mjs';
import {extensiveStrategyContent} from './extensive-strategy-content.mjs';

export const strategyHistories=['c0','c2','c4'];
export function naturalPlan(plan){const first=plan.indexOf('S');return first<0?'始终继续':`第${first+1}次机会首次停止`;}
export function strategyGroupCounts(T=3){const groups=Array.from({length:T+1},()=>0);for(let mask=0;mask<2**T;mask++){const p=Array.from({length:T},(_,i)=>mask&(1<<i)?'C':'S');const first=p.indexOf('S');groups[first<0?T:first]++;}return groups;}
export function strategyModel(plan=['S','C','C']){
 if(plan.length!==3||plan.some(x=>!['S','C'].includes(x)))throw Error('T=3 player 1 needs three S/C actions');
 const root=makeTree('centipede',2,3),nodes=treeNodes(root),c1=nodes.find(n=>n.id==='c1');
 const p1=Object.fromEntries(strategyHistories.map((h,i)=>[h,plan[i]==='S'?0:1]));
 let best=null;for(let mask=0;mask<8;mask++){
  const p2={c1:mask&1?1:0,c3:mask&2?1:0,c5:mask&4?1:0},policy={...p1,...p2},suffix=treeOutcome(c1,policy);
  if(!best||suffix.payoff[1]>best.suffix.payoff[1])best={p2,policy,suffix};
 }
 const actual=treeOutcome(root,best.policy),stopAtC1=treeOutcome(c1,{...best.policy,c1:0}),all=Array.from({length:8},(_,mask)=>Array.from({length:3},(_,i)=>mask&(1<<i)?'C':'S'));
 return {root,plan:[...plan],policy:best.policy,actual,suffix:best.suffix,stopAtC1,optimalP2AtC1:best.p2.c1===0?'S':'C',natural:naturalPlan(plan),groupCounts:strategyGroupCounts(3),all};
}
const routes={intro:['SCC','SCC','SCC','SCC','SCC','SCC'],slots:['SCC','SCC','SCC','SCC','SCC','SCC'],actual:['SSS','SSC','SCS','SCC','SCC','SCC'],count:['SSS','SCC','CSS','CCS','CCC','SCC'],belief:['SSS','SSS','SSS','SCC','SCC','SCC'],boundary:['SCC','SSS','CSS','SCC','SCC','SCC']};
const focus={intro:['c0','c0','c2','c4','c1','c0'],slots:['c0','c0','c2','c4','c2','c0'],actual:['c0','c4','c2','c4','c0','c1'],count:['c0','c0','c2','c4','c4','c0'],belief:['c1','c1','c2','c1','c3','c1'],boundary:['c0','c2','c0','c1','c2','c0']};
export function extensiveStrategyStory(key,step=0){const c=extensiveStrategyContent[key];if(!c)throw Error('Unknown §16.2 case');const k=Math.max(0,Math.min(5,Math.round(step))),plan=routes[key][k].split(''),model=strategyModel(plan);return {...model,key,step:k,identity:c.steps[k][0],narration:c.steps[k][1],focus:focus[key][k]};}

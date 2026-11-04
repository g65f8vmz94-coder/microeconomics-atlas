import {treeNodes,policyFromIndex,treeOutcome,treeAudit,backwardTree} from './games.mjs';
// Original interactive models, Osborne--Rubinstein ch16, printed275--278.
export const exercise16Cases={
 p161a:{section:'16.1',label:'习题16.1 · 信任与逆向归纳',page:275,kind:'trust'},
 p161b:{section:'16.2',label:'习题16.1 · NE策略与SPE结果',page:275,kind:'trust-ne'},
 p161c:{section:'16.3',label:'习题16.1 · 重复三次',page:275,kind:'trust-repeat'},
 p162:{section:'16.3',label:'习题16.2 · 两个可帕累托排序的SPE',page:275,kind:'two-spe'},
 p163:{section:'16.2',label:'习题16.3 · 好NE与唯一差SPE',page:275,kind:'good-ne'},
 p164:{section:'16.3',label:'习题16.4 · 提高叶子收益反而变差',page:275,kind:'comparative'},
 p165a:{section:'16.3',label:'习题16.5(a) · 现金限制与所有成交价',page:276,kind:'auction'},
 p165b:{section:'16.3',label:'习题16.5(b) · 3元成交的完整计划',page:276,kind:'auction-low'},
 p165c:{section:'16.3',label:'习题16.5(c) · 8元成交的完整计划',page:276,kind:'auction-high'},
 p166:{section:'16.1',label:'习题16.6 · 所罗门机制与真主人',page:276,kind:'solomon'},
 p167a:{section:'16.1',label:'习题16.7(a) · 三人通信树',page:276,kind:'communication-tree'},
 p167b:{section:'16.3',label:'习题16.7(b) · 任意人数的传递链',page:276,kind:'communication'},
 p168:{section:'16.3',label:'习题16.8 · 竞赛的逆推与平局边界',page:277,kind:'race'},
 p169:{section:'16.3',label:'习题16.9 · 无限期单点偏离反例',page:277,kind:'infinite'},
 p1610a:{section:'16.1',label:'习题16.10(a) · 顺序出资与等号条件',page:277,kind:'sequential-project'},
 p1610b:{section:'16.2',label:'习题16.10(b) · 同时出资的失败均衡',page:278,kind:'simultaneous-project'},
 p1611:{section:'16.4',label:'习题16.11 · 不同固定等待成本',page:278,kind:'unequal-cost'},
 p1612a:{section:'16.4',label:'习题16.12(a) · 相同成本的协议族',page:278,kind:'equal-cost'},
 p1612b:{section:'16.4',label:'习题16.12(b) · 允许延迟的历史策略',page:278,kind:'delay'}
};
const p16leaf=(id,u)=>({id,payoff:u});
export function p16SmallTree(kind='two-spe',parameter=1,owner=0){
 if(kind==='two-spe')return{id:'r',player:0,children:[{label:'L',node:p16leaf('L',[1,1])},{label:'R',node:{id:'r2',player:1,children:[{label:'A',node:p16leaf('A',[0,2])},{label:'B',node:p16leaf('B',[2,2])}]}}]};
 if(kind==='good-ne')return{id:'r',player:0,children:[{label:'D',node:p16leaf('D',[1,1])},{label:'C',node:{id:'r2',player:1,children:[{label:'C',node:p16leaf('CC',[2,2])},{label:'D',node:{id:'r3',player:0,children:[{label:'惩罚',node:p16leaf('P',[-1,0])},{label:'放过',node:p16leaf('A',[0,3])}]}}]}}]};
 if(kind==='comparative')return{id:'r',player:1,children:[{label:'L',node:p16leaf('L',[2,2])},{label:'R',node:{id:'r2',player:0,children:[{label:'A',node:p16leaf('A',[3,3])},{label:'B',node:p16leaf('B',[parameter,0])}]}}]};
 if(kind==='solomon'){const H=8,L=2,M=5,values=owner===0?[H,L]:[L,H];return{id:'r',player:0,children:[{label:'他的',node:p16leaf('his',[0,values[1]])},{label:'我的',node:{id:'r2',player:1,children:[{label:'他的',node:p16leaf('yield',[values[0],0])},{label:'我的',node:p16leaf('claim',[-parameter,values[1]-M])}]}}]}}
 if(kind==='communication-tree'){const c=parameter;return{id:'r',player:0,children:[{label:'停止',node:p16leaf('stop',[0,0,0])},...[1,2].map(j=>({label:'给'+(j+1),node:{id:'to'+j,player:j,children:[{label:'停止',node:p16leaf('s'+j,[-c,0,0])},{label:'给'+(4-j),node:p16leaf('end'+j,j===1?[1-c,1-c,1]:[1-c,1,1-c])}]}}))]}}
 throw Error('unknown finite tree '+kind);
}
export function p16SmallAnalysis(root){
 const nodes=treeNodes(root),count=nodes.reduce((v,n)=>v*n.children.length,1),profiles=Array.from({length:count},(_,index)=>{const policy=policyFromIndex(root,index),audit=treeAudit(root,policy);for(let player=2;player<audit.outcome.payoff.length;player++){const owned=nodes.filter(n=>n.player===player);let best=audit.outcome.payoff[player];function choices(k,p){if(k===owned.length){best=Math.max(best,treeOutcome(root,p).payoff[player]);return}const n=owned[k];n.children.forEach((_,a)=>choices(k+1,{...p,[n.id]:a}))}choices(0,policy);audit.normalGains.push(best-audit.outcome.payoff[player])}audit.nash=audit.normalGains.every(x=>x<1e-9);return{index,policy,...audit}});
 return{nodes,count,profiles,spe:profiles.filter(x=>x.spe),ne:profiles.filter(x=>x.nash)};
}
export function p16Trust(x=0,rho=0){const returned=3*x*rho;return{x,rho,received:3*x,returned,u:[10-x+returned,3*x-returned],player2Gain:returned,linearPolicyNE:x===0&&rho<=1/3,linearPolicySPE:x===0&&rho===0}}
// Set-valued backward induction. For each candidate continuation, select the
// least favourable credible continuation for the actor at every OTHER action.
// This characterizes outcomes supportable by some pure SPE, including ties.
export function p16SolveOptions(root){
 const cache=new Map();let states=0;
 function solve(node){if(node.u)return[{...node,path:[],action:null}];if(cache.has(node.key))return cache.get(node.key);states++;
  const branches=node.edges.map(edge=>solve(edge.child).map(next=>({...next,u:next.u.map((v,i)=>v-(edge.cost?.[i]||0)),next,edge}))),minimum=branches.map(xs=>Math.min(...xs.map(v=>v.u[node.player]))),out=[];
  branches.forEach((xs,a)=>xs.forEach(candidate=>{if(minimum.every((v,b)=>a===b||candidate.u[node.player]>=v-1e-9))out.push({...candidate,node,action:a,support:branches.map((ys,b)=>b===a?candidate:ys.reduce((x,y)=>x.u[node.player]<=y.u[node.player]?x:y)),path:[{state:node.key,player:node.player,action:a,label:node.edges[a].label},...candidate.next.path]})}));
  const unique=new Map();for(const o of out){const key=[o.action,o.winner,o.price,...o.u.map(v=>v.toFixed(8))].join('|');if(!unique.has(key))unique.set(key,o)}const result=[...unique.values()];cache.set(node.key,result);return result;
 }
 const outcomes=solve(root);return{root,outcomes,states,cache};
}
export function p16Auction(){
 const nodes=new Map(),cash=[9,6];
 function state(b,player){const key=b+':'+player;if(nodes.has(key))return nodes.get(key);const winner=b===0?-1:1-player,u=[0,0];if(winner>=0)u[winner]=b<=cash[winner]?12-b:-100;
  const node={key,player,edges:[{label:b?'不加价':'不出价',child:{u,winner,price:b}}]};nodes.set(key,node);
  for(let next=Math.max(3,b+1);next<=12;next++)node.edges.push({label:'报'+next,child:state(next,1-player)});return node;
 }
 return p16SolveOptions(state(0,0));
}
export function p16AuctionCertificate(solution,chosen){
 const rows=[];
 function walk(node,outcome,history='起点'){
  if(node.u)return;
  const values=outcome.support.map(x=>x.u[node.player]);rows.push({history,player:node.player,action:outcome.action,value:outcome.u[node.player],gains:Math.max(...values)-outcome.u[node.player]});
  outcome.support.forEach((branch,a)=>walk(node.edges[a].child,branch.next,history+'→'+node.edges[a].label));
 }
 walk(solution.root,chosen);return rows;
}
export function p16Race(A=3,B=3,P=7){
 const nodes=new Map();
 function state(a,b,player,stayed){const key=[a,b,player,stayed].join(':');if(nodes.has(key))return nodes.get(key);const node={key,player,edges:[]};nodes.set(key,node);
  node.edges.push({label:'停留',child:stayed?{u:[0,0],winner:-1,price:0}:state(a,b,1-player,true)});
  for(const [move,cost]of [[1,2],[2,4.5]]){const d=player===0?a:b,after=d-move,costs=[0,0];costs[player]=cost;const u=[0,0];u[player]=P;
   node.edges.push({label:'前进'+move,cost:costs,child:after<=0?{u,winner:player,price:0}:state(player===0?after:a,player===1?after:b,1-player,false)});
  }return node;
 }
 return p16SolveOptions(state(A,B,0,false));
}
export function p16Permutations(xs){return xs.length?xs.flatMap((x,i)=>p16Permutations(xs.filter((_,j)=>i!==j)).map(t=>[x,...t])):[[]]}
export function p16Communication(n=3,c=.2,order=0,step=n-1){const orders=p16Permutations(Array.from({length:n-1},(_,i)=>i+1)),path=[0,...orders[order%orders.length]],received=path.slice(0,step+1),u=path.map((_,i)=>i===n-1?1:1-c);return{orders,path,received,complete:step===n-1,finalWealth:Array.from({length:n},(_,i)=>u[path.indexOf(i)])}}
export function p16Project(v1=60,v2=70,a=0,b=0){const hired=a+b>=100;return{hired,u:hired?[v1-a,v2-b]:[0,0],sequential:[Math.max(0,100-v2),Math.min(100,v2)],fundedRange:[Math.max(0,100-v2),Math.min(100,v1)],zeroNE:v1<=100&&v2<=100}}
export function p16FixedCosts(c1=.1,c2=.2,x=1){const y=Math.max(0,x-c1),thresholds=[Math.max(0,x-c1),Math.max(0,1-y-c2)],own=[x,1-y],best=[Math.max(1-thresholds[1],y-c1),Math.max(1-thresholds[0],1-x-c2)];return{x,y,offers:[[x,1-x],[y,1-y]],thresholds,own,gains:best.map((v,i)=>v-own[i]),permanentDisagreement:'negative-infinity'}}
export function p16Delay(c=.2,offer=1){const baseline=[1-2*c,0],deviation=offer===1?baseline[0]:offer<=c?offer:-c;return{initialOffer:[1,0],nextOffer:[1-c,c],baseline,bestDeviation:c,deviation,valid:c<=1/3+1e-9,rootGain:Math.max(0,c-baseline[0])}}

// Source-led models for Chapters 15–16. All payoffs are explicit; discrete
// examples are kept distinct from continuous bidding and infinite horizons.
export const matrixGames={
 intro:{title:'定义15.1–15.3的收益表',row:['上T','下B'],col:['左L','右R'],M:[[[5,0],[-1,1]],[[3,7],[-2,0]]]},
 pd:{title:'例15.2 · 囚徒困境',row:['合作C','背叛D'],col:['合作C','背叛D'],M:[[[6,6],[0,7]],[[7,0],[1,1]]]},
 bach:{title:'例15.3 / 15.14 · 巴赫或斯特拉文斯基',row:['巴赫B','斯氏S'],col:['巴赫B','斯氏S'],M:[[[2,1],[0,0]],[[0,0],[1,2]]]},
 pennies:{title:'例15.4 / 15.13 · 匹配硬币',row:['正面H','反面T'],col:['正面H','反面T'],M:[[[0,1],[1,0]],[[1,0],[0,1]]]},
 gates:{title:'例15.5 · 三个入口的协调',row:['黄门Y','蓝门B','绿门G'],col:['黄门Y','蓝门B','绿门G'],M:Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>[+(i===j),+(i===j)]))},
 pessimism:{title:'§15.5 · 悲观选择不一定协调',row:['巴赫B','斯氏S'],col:['巴赫B','斯氏S'],M:[[[2,1],[.5,.5]],[[0,0],[1,2]]]},
 saddle:{title:'独立构造 · 有鞍点的零和博弈',row:['上','下'],col:['左','右'],M:[[[3,-3],[1,-1]],[[4,-4],[2,-2]]]}
};
export const argmax=(a)=>{const m=Math.max(...a);return a.flatMap((v,i)=>Math.abs(v-m)<1e-9?[i]:[])};
export function matrixAnalysis(game,i=0,j=0,p=.5,q=.5){
 const {M}=matrixGames[game],n=M.length,m=M[0].length,pure=[];
 const br1=Array.from({length:m},(_,j)=>argmax(M.map(row=>row[j][0]))),br2=M.map(row=>argmax(row.map(x=>x[1])));
 for(let a=0;a<n;a++)for(let b=0;b<m;b++)if(br1[b].includes(a)&&br2[a].includes(b))pure.push([a,b]);
 const u=M[i][j],gains=[Math.max(...M.map(r=>r[j][0]))-u[0],Math.max(...M[i].map(x=>x[1]))-u[1]],rowWorst=M.map(row=>Math.min(...row.map(x=>x[0]))),colWorst=Array.from({length:m},(_,j)=>Math.min(...M.map(row=>row[j][1])));
 let mixed=null;
 if(n===2&&m===2){const rows=M.map(row=>q*row[0][0]+(1-q)*row[1][0]),cols=[0,1].map(j=>p*M[0][j][1]+(1-p)*M[1][j][1]),eu=[p*rows[0]+(1-p)*rows[1],q*cols[0]+(1-q)*cols[1]],denq=M[0][0][0]-M[0][1][0]-M[1][0][0]+M[1][1][0],denp=M[0][0][1]-M[1][0][1]-M[0][1][1]+M[1][1][1],pStar=(M[1][1][1]-M[1][0][1])/denp,qStar=(M[1][1][0]-M[0][1][0])/denq;
  mixed={rows,cols,eu,gains:[Math.max(...rows)-eu[0],Math.max(...cols)-eu[1]],pStar,qStar,interior:pStar>0&&pStar<1&&qStar>0&&qStar<1};
 }
 const cells=M.flat();let competitive=true;for(const a of cells)for(const b of cells)if(Math.sign(a[0]-b[0])!==-Math.sign(a[1]-b[1]))competitive=false;
 return {M,n,m,u,pure,br1,br2,gains,rowWorst,colWorst,maxmin:[argmax(rowWorst),argmax(colWorst)],competitive,mixed};
}
export function traveler(a=300,b=300,reward=5){
 const payoff=(x,y)=>x<y?x+reward:x===y?x:y-reward,actions=Array.from({length:121},(_,i)=>180+i),curves=[actions.map(x=>payoff(x,b)),actions.map(y=>payoff(y,a))],best=curves.map(xs=>argmax(xs).map(i=>actions[i])),u=[payoff(a,b),payoff(b,a)];
 return {actions,curves,best,u,gains:[Math.max(...curves[0])-u[0],Math.max(...curves[1])-u[1]]};
}
export function auction(rule,bids=[8,2],values=[10,5]){
 const winner=bids[0]>=bids[1]?0:1,payment=rule==='first'?bids[winner]:bids[1-winner],u=[0,0];u[winner]=values[winner]-payment;
 const best=values.map((v,i)=>Math.max(0,v-bids[1-i])),gains=best.map((v,i)=>Math.max(0,v-u[i]));
 const witnesses=values.map((v,i)=>{const t=bids[1-i],eps=Math.max(1e-7,(v-t-u[i])/2),candidates=[0,t,Math.max(0,t-eps),t+eps,v];let chosen=bids[i],gain=0;for(const x of candidates){const win=i===0?x>=t:x>t,z=win?v-(rule==='first'?x:t):0;if(z-u[i]>gain+1e-9){chosen=x;gain=z-u[i]}}return {bid:chosen,gain}});
 const equilibrium=rule==='first'?Math.abs(bids[0]-bids[1])<1e-9&&bids[0]>=values[1]&&bids[0]<=values[0]:gains.every(x=>x<1e-8);
 return {winner,payment,u,best,gains,witnesses,equilibrium};
}
export function locationShares(positions){
 const unique=[...new Set(positions)].sort((a,b)=>a-b),regions=unique.map((x,j)=>({x,left:j?(unique[j-1]+x)/2:0,right:j===unique.length-1?1:(x+unique[j+1])/2,players:positions.flatMap((v,i)=>v===x?[i]:[])})),shares=positions.map(x=>{const r=regions.find(r=>r.x===x);return (r.right-r.left)/r.players.length});return {regions,shares};
}
export function locationDeviation(positions,i){
 const current=locationShares(positions).shares[i],others=positions.filter((_,j)=>j!==i),candidates=[0,.5,1,...others,...others.flatMap(x=>[Math.max(0,x-.0001),Math.min(1,x+.0001)]),...others.map(x=>(x+positions[i])/2)];let value=current,choice=positions[i];
 for(const x of candidates){const next=[...positions];next[i]=x;const u=locationShares(next).shares[i];if(u>value+1e-9){value=u;choice=x}}return {choice,value,gain:value-current};
}
export function effort(a,b,c){const u=[a*(c+b)-a*a,b*(c+a)-b*b],br=[(c+b)/2,(c+a)/2];return {u,br,gains:[br[0]*(c+b)-br[0]**2-u[0],br[1]*(c+a)-br[1]**2-u[1]],equilibrium:[c,c]};}
export function cournot(a,b,c){const price=Math.max(0,1-a-b),u=[a*(price-c),b*(price-c)],br=[Math.max(0,(1-c-b)/2),Math.max(0,(1-c-a)/2)],gains=br.map((v,i)=>v*(Math.max(0,1-v-[b,a][i])-c)-u[i]);return {price,u,br,gains,ne:gains.every(x=>x<1e-8),positivePriceNE:(1-c)/3,zeroCostExtraNE:c===0};}
export function bertrand(a,b,c){const prices=[a,b],quantities=a===b?[(Math.max(0,1-a))/2,(Math.max(0,1-a))/2]:a<b?[Math.max(0,1-a),0]:[0,Math.max(0,1-b)],u=prices.map((p,i)=>(p-c)*quantities[i]),monopoly=(1+c)/2;
 const best=prices.map((_,i)=>{const t=prices[1-i];return t<=c?0:(Math.min(t,monopoly)-c)*(1-Math.min(t,monopoly))});return {u,quantities,best,gains:best.map((x,i)=>Math.max(0,x-u[i])),ne:Math.abs(a-c)<1e-9&&Math.abs(b-c)<1e-9,monopoly};}
export function symmetricBR(mode,x){return mode==='decreasing'?1-x:x-.8*(x-.2)*(x-.5)*(x-.8)};
export const finiteBR={one:[2,2,4,6,6,6,7],two:[1,3,4,4,5,5,6,7]};
export function monotoneTrace(){let x=1,y=1,states=[[x,y]],turn=0;for(let k=0;k<30;k++){if(x===finiteBR.one[y-1]&&y===finiteBR.two[x-1])break;if(turn===0)x=finiteBR.one[y-1];else y=finiteBR.two[x-1];states.push([x,y]);turn=1-turn}return states;}
export function kantian(a,b,lambda){const payoff=(x,y)=>x*Math.max(0,1-x-y);return {initial:[payoff(a,b),payoff(b,a)],joint:[payoff(lambda*a,lambda*b),payoff(lambda*b,lambda*a)],single:[payoff(lambda*a,b),payoff(lambda*b,a)],jointOpt:1/(2*(a+b)),singleOpt:Math.max(0,(1-b)/(2*a)),isKantian:Math.abs(a+b-.5)<1e-8,nash:cournot(a,b,0).ne};}
export function attrition(c=.25,T=3,S=0,K=12){const payoff=(a,b)=>a<=b?-a*c:1-(b+1)*c,prob=t=>c*(1-c)**t,eu=t=>{let out=-t*c*(1-c)**t;for(let j=0;j<t;j++)out+=prob(j)*(1-(j+1)*c);return out};return {u:[payoff(T,S),payoff(S,T)],prob:Array.from({length:K},(_,t)=>prob(t)),tail:(1-c)**K,eu:Array.from({length:K},(_,t)=>eu(t)),threshold:Math.ceil((1-c)/c-1e-9),pureNE:(T===0&&c*(S+1)>=1-1e-9)||(S===0&&c*(T+1)>=1-1e-9),tieProbability:c/(2-c)};}

// Perfect-information finite trees. Every decision node has a history ID.
export function makeTree(kind='entry',units=2,T=3,fight=0){
 if(kind==='entry')return {id:'root',player:0,children:[{label:'不进入 Out',node:{id:'out',payoff:[1,5]}},{label:'进入 In',node:{id:'in',player:1,children:[{label:'对抗 F',node:{id:'fight',payoff:[0,fight]}},{label:'合作 C',node:{id:'coop',payoff:[2,2]}}]}}]};
 if(kind==='ultimatum')return {id:'root',player:0,children:Array.from({length:units+1},(_,i)=>({label:`(${i},${units-i})`,node:{id:'offer'+i,player:1,children:[{label:'接受 Y',node:{id:'yes'+i,payoff:[i,units-i]}},{label:'拒绝 N',node:{id:'no'+i,payoff:[0,0]}}]}}))};
 const grow=(t,pay)=>t===2*T?{id:'end',payoff:pay}:{id:'c'+t,player:t%2,children:[{label:'停止 S',node:{id:'stop'+t,payoff:pay}},{label:'继续 C',node:grow(t+1,pay.map((v,i)=>v+(i===t%2?-1:2)))}]};return grow(0,[0,0]);
}
export function treeNodes(root){const a=[];function walk(n,depth=0){if(n.children){a.push({...n,depth});n.children.forEach(c=>walk(c.node,depth+1))}}walk(root);return a;}
export function historyDiameter(history){return history.children?1+Math.max(...history.children.map(edge=>historyDiameter(edge.node))):0;}
export function policyFromIndex(root,index=0){const policy={};for(const n of treeNodes(root)){policy[n.id]=index%n.children.length;index=Math.floor(index/n.children.length)}return policy;}
export function policyIndex(root,policy){let mult=1,out=0;for(const n of treeNodes(root)){out+=mult*policy[n.id];mult*=n.children.length}return out;}
export function treeOutcome(root,policy){const path=[];let n=root;while(n.children){const k=policy[n.id]??0;path.push({id:n.id,action:k,label:n.children[k].label,player:n.player});n=n.children[k].node}return {path,leaf:n.id,payoff:n.payoff};}
export function backwardTree(root,lastTie=false){const policy={},steps=[];function solve(n){if(!n.children)return n.payoff;const values=n.children.map(c=>solve(c.node)),best=argmax(values.map(x=>x[n.player])),choice=lastTie?best.at(-1):best[0];policy[n.id]=choice;steps.push({id:n.id,player:n.player,values,best,choice,payoff:values[choice]});return values[choice]}const value=solve(root);return {policy,steps,value};}
export function treeAudit(root,policy){const nodes=treeNodes(root),one=nodes.map(n=>{const baseline=treeOutcome(n,policy).payoff[n.player],alternatives=n.children.map((_,k)=>treeOutcome(n,{...policy,[n.id]:k}).payoff[n.player]);return {id:n.id,player:n.player,baseline,alternatives,gain:Math.max(...alternatives)-baseline}}),outcome=treeOutcome(root,policy);
 const normalGains=[0,1].map(player=>{const owned=nodes.filter(n=>n.player===player);let best=outcome.payoff[player];function enumerate(k,candidate){if(k===owned.length){best=Math.max(best,treeOutcome(root,candidate).payoff[player]);return}const n=owned[k];n.children.forEach((_,a)=>enumerate(k+1,{...candidate,[n.id]:a}))}enumerate(0,policy);return best-outcome.payoff[player]});
 return {outcome,one,normalGains,nash:normalGains.every(x=>x<1e-9),spe:one.every(x=>x.gain<1e-9)};
}
export function bargaining(model='alternating',alpha=.8,beta=.8,rounds=3,share=.5,step=0){
 const x=[(1-beta)/(1-alpha*beta),beta*(1-alpha)/(1-alpha*beta)],y=[alpha*(1-beta)/(1-alpha*beta),(1-alpha)/(1-alpha*beta)];
 if(model==='finite'){const winner=(rounds-1)%2;return {allocation:winner===0?[1,0]:[0,1],winner,solved:Math.min(rounds,step),rounds};}
 if(model==='one')return {allocation:[share,1-share],threshold:1-share};
 if(model==='stalemate')return {allocation:[0,0],agreement:false};
 if(model==='discountOne')return {allocation:[1,0],bound:beta**step,oldThreshold:1-share,profitableOffer:(1+beta)*(1-share)/2};
 if(model==='ultimatum')return {allocation:[1,0],epsilon:.5**(step+1)};
 return {allocation:x,x,y,respond:[y[0],x[1]],discounted:[alpha**step*x[0],beta**step*x[1]]};
}

export const utility=(x,y,a)=>Math.max(0,x)**a*Math.max(0,y)**(1-a);
export function cdExchange({X=10,Y=10,e1=8,e2=2,a=.5,b=.5,p=1,report=a}) {
 const eq=(report*e2+b*(Y-e2))/((1-report)*e1+(1-b)*(X-e1));
 const demand=price=>{const wA=price*e1+e2,wB=price*(X-e1)+Y-e2;return {A:[report*wA/price,(1-report)*wA],B:[b*wB/price,(1-b)*wB],wealth:[wA,wB]}};
 const at=demand(p),equilibrium=demand(eq),excess=[at.A[0]+at.B[0]-X,at.A[1]+at.B[1]-Y];
 const curve=x=>b*(1-a)*Y*x/(a*(1-b)*(X-x)+b*(1-a)*x);
 const u=[utility(...at.A,a),utility(...at.B,b)],initial=[utility(e1,e2,a),utility(X-e1,Y-e2,b)];
 return {eq,at,equilibrium,excess,u,initial,curve,demand,walras:p*excess[0]+excess[1]};
}
export function allocationCheck({X=10,Y=10,e1=8,e2=2,a=.5,b=.5,x=5,y=5}) {
 const uA=utility(x,y,a),uB=utility(X-x,Y-y,b),initialA=utility(e1,e2,a),initialB=utility(X-e1,Y-e2,b);
 const cy=b*(1-a)*Y*x/(a*(1-b)*(X-x)+b*(1-a)*x),efficient=Math.abs(y-cy)<1e-7;
 let witness=null;
 for(let i=0;i<=1000;i++){const xx=X*i/1000,yy=b*(1-a)*Y*xx/(a*(1-b)*(X-xx)+b*(1-a)*xx);if(utility(xx,yy,a)>uA+1e-7&&utility(X-xx,Y-yy,b)>uB+1e-7){witness=[xx,yy];break}}
 return {uA,uB,initialA,initialB,efficient,individuallyRational:uA>=initialA-1e-8&&uB>=initialB-1e-8,core:efficient&&uA>=initialA-1e-8&&uB>=initialB-1e-8,witness};
}
export function manipulatedExchange(config,report){const base=cdExchange({...config,report:config.a}),man=cdExchange({...config,report});return{base,man,honestUtility:utility(...base.equilibrium.A,config.a),reportedAllocationUtility:utility(...man.equilibrium.A,config.a)}}

// Chapter 10 source cases. Prices (t,1-t) include the endpoints; no division by
// zero is used to invent a selected demand when no maximizer exists.
export function textbookExchange(kind='substitutes',{alpha=8,beta=4,t=.5,share=.5,trade=1}={}){
 const prices=[t,1-t],endowments=[[alpha,0],[0,beta]],wealth=[t*alpha,(1-t)*beta];let bundles,status='finite',description='';
 if(kind==='substitutes'){
  if(t===0||t===1)return {prices,endowments,wealth,status:'unbounded',reason:'有正效用的商品免费，预算内效用无上界，最优选择不存在。'};
  bundles=t===.5?[[alpha-trade,trade],[trade,beta-trade]]:wealth.map(w=>t<.5?[w/t,0]:[0,w/(1-t)]);
 }else if(kind==='product'){
  if(t===0||t===1)return {prices,endowments,wealth,status:'unbounded',reason:'至少一人可花正收入购买收费商品，再无上限增加免费商品；没有可行均衡。'};
  bundles=wealth.map(w=>[w/(2*t),w/(2*(1-t))]);
 }else if(t>0&&t<1)bundles=wealth.map(w=>[w,w]);
 else if(t===0){bundles=alpha>=beta?[[share*(alpha-beta),0],[alpha-share*(alpha-beta),beta]]:[[0,0],[beta,beta]];description='商品1免费；B需要至少β单位商品1，A对所有(x,0)无差异。';}
 else {bundles=beta>=alpha?[[alpha,beta-share*(beta-alpha)],[0,share*(beta-alpha)]]:[[alpha,alpha],[0,0]];description='商品2免费；A需要至少α单位商品2，B对所有(0,y)无差异。';}
 const totals=[bundles[0][0]+bundles[1][0],bundles[0][1]+bundles[1][1]],excess=[totals[0]-alpha,totals[1]-beta];
 return {prices,endowments,wealth,bundles,totals,excess,status,description,clears:excess.every(x=>Math.abs(x)<1e-9),utility:bundles.map(([x,y])=>kind==='substitutes'?x+y:kind==='product'?x*y:Math.min(x,y)),spending:bundles.map(([x,y])=>t*x+(1-t)*y),walras:t*excess[0]+(1-t)*excess[1]};
}
export function destroyedEndowment(gamma=2){const original=textbookExchange('complements',{alpha:8,beta:4,t:0,share:1}),t=gamma<4?1:gamma>4?0:.5,after=textbookExchange('complements',{alpha:gamma,beta:4,t,share:1});return {original,after,gamma,destroyed:8-gamma,gain:after.utility[0]-original.utility[0]};}
export function nonconvexExchange(symmetric=false,t=.5,choiceA=0,choiceB=1){const endowments=symmetric?[[2,1],[2,1]]:[[2,0],[0,1]],totals=[endowments[0][0]+endowments[1][0],endowments[0][1]+endowments[1][1]],prices=[t,1-t];
 if(t===0||t===1)return {status:'unbounded',endowments,totals,prices};
 const wealth=endowments.map(([x,y])=>t*x+(1-t)*y),sets=wealth.map(w=>t===.5?[[w/t,0],[0,w/(1-t)]]:t<.5?[[w/t,0]]:[[0,w/(1-t)]]),bundles=sets.map((set,i)=>set.length===1?set[0]:set[i===0?choiceA:choiceB]),excess=[0,1].map(k=>bundles[0][k]+bundles[1][k]-totals[k]);return {status:'finite',endowments,totals,prices,wealth,sets,bundles,excess,clears:excess.every(x=>Math.abs(x)<1e-9)};
}
export function fourPersonCore(t=.1,r=.2){const initial=[[1,0],[1,0],[0,1],[0,1]],allocation=[[t,t],[t,t],[1-t,1-t],[1-t,1-t]],utilities=[t,t,2*(1-t),2*(1-t)],coalition=[0,1,2],proposal=[[r,r],[r,r],[2-2*r,1-2*r]],after=[r,r,3-4*r],gains=after.map((v,i)=>v-utilities[i]),witness=t<.5?.125+.75*t:null;
 return {initial,allocation,utilities,coalition,proposal,after,gains,witness,resources:[2,1],blocking:proposal.every(row=>row.every(x=>x>=0))&&gains.every(x=>x>1e-9),individuallyRational:utilities[2]>=1-1e-9,inCore:Math.abs(t-.5)<1e-9,paretoStable:true,singletonBlock:t>.5};}
export function externalityExchange(ratio=.8,progress=0){const A=[1-progress,.5*progress],B=[progress,1-.5*progress],utilities=[A[0]+A[1]-2*B[1],2*B[0]+3*B[1]],before=[-1,3],costs=[ratio*A[0]+A[1],ratio*B[0]+B[1]];return {A,B,utilities,before,costs,gains:utilities.map((x,i)=>x-before[i]),endowmentIsEquilibrium:ratio>=2/3-1e-9&&ratio<=1+1e-9,ratio};}
export function nonrationalDemand(alpha=8,beta=4,ratio=1.5){const bundles=ratio>=1?[[alpha,0],[0,beta]]:[[0,alpha*ratio],[beta/ratio,0]],excess=[bundles[0][0]+bundles[1][0]-alpha,bundles[0][1]+bundles[1][1]-beta];return {bundles,excess,ratio,alpha,beta,clears:excess.every(x=>Math.abs(x)<1e-8),additional:beta<alpha?beta/alpha:null};}
export function linearReport(k=3){const allocation=[[k/(1+k),k/(1+k)],[1/(1+k),1/(1+k)]],trueUtilities=[2*k/(1+k),1/(1+k)];return {k,price:[k,1],allocation,trueUtilities,honest:[[.5,.5],[.5,.5]],gain:trueUtilities[0]-1,spending:[k,1]};}
export function multipleExcess(p=2){const z=-.1*(p-1)*(p-2)*(p-3)/(1+((p-2)/2)**6);return {z,demand:[5+z/2,5-p*z/2],walras:p*z-p*z,roots:[1,2,3]};}
export function spendingContradiction(delta=.2,members=2,allImprove=false){const added=2*delta*(allImprove?members:1);return {resources:[members,members],baselineCost:2*members,proposedCost:2*members+added,excessValue:added,baselineUtility:1,strictImprovement:1+delta,strictBundle:[1+delta,1+delta]};}

// Chapter 12, Osborne–Rubinstein, printed pp. 175–185.
// Numerical functions below are clearly labeled constructed illustrations,
// except for the technologies and parameters explicitly given in Problems 12.1 and 12.5.
export const casesBySection={
 '12.1':['d121','d122','d123','d124','d125','q121','fig122','p1a','p1b','p1c','p1d','p4','p5'],
 '12.2':['d126','d127','d128','d129','q122','p2','p3c','p3w']
};
export const cases={
 d121:{label:'定义12.1 技术集合与自由处置',page:176,kind:'technology',note:'原书要求技术集合闭、有界、凸、可自由处置；图中的椭圆技术是本站的数值构造。'},
 d122:{label:'定义12.2 生产经济与利润归属',page:177,kind:'economy',note:'生产者利润全部按固定所有权份额归消费者；所有权的形成过程不在原模型内。'},
 d123:{label:'定义12.3 生产—消费计划',page:177,kind:'plan',note:'每种商品分别要求消费总量等于生产总量；图中非均衡选择不得称为可行计划。'},
 d124:{label:'定义12.4 竞争均衡三重条件',page:178,kind:'economy',note:'生产者利润最大、消费者预算最优、两种商品出清，三个条件必须同时成立。'},
 d125:{label:'定义12.5 帕累托稳定',page:178,kind:'pareto',note:'改善只比较消费者偏好；生产改变必须仍在技术内，且总消费等于总产出。'},
 q121:{label:'命题12.1 均衡计划为何稳定',page:179,kind:'proof',note:'原书证明把消费者的价格支出与生产者最大利润相比较；凸性不用于这一蕴含，但会影响存在性。'},
 fig122:{label:'图12.2 非凸技术可能无均衡',page:179,kind:'nonconvex',note:'按原书图12.2的机制构造两个臂状的非凸、自由处置技术；最优产量在a或b，互补消费者想要等量两种商品。'},
 p1a:{label:'习题12.1(a) 个人生产与消费的均衡',page:184,kind:'specialization',note:'每个人同时生产并消费；生产预算来自自己的产出价值，市场按两种商品分别出清。'},
 p1b:{label:'习题12.1(b) 比较优势与专业化',page:184,kind:'specialization',note:'原题技术tᵢy₁+y₂≤cᵢ；tᵢ低于价格比时产商品1，高于时产商品2，相等时对生产前沿无差异。'},
 p1c:{label:'习题12.1(c) 同好偏好与无贸易均衡',page:184,kind:'linear',note:'所有人偏好t x₁+x₂时取p₁/p₂=t；消费者可选择恰好消费自己的产出。'},
 p1d:{label:'习题12.1(d) 比较优势并非完全专业化',page:184,kind:'leontief',note:'原题要求t₁<t₂但1号仍生产两种商品；网站给出精确可核对的两人构造。'},
 p4:{label:'习题12.4 两级生产链',page:184,kind:'chain',note:'第一人用时间生产X，第二人用X生产Y；图中的平方根函数和CD偏好为本站构造，原题只给严格凹等条件。'},
 p5:{label:'习题12.5 污染外部性',page:185,kind:'pollution',note:'技术2y₁+y₂=2、污染指数为平均商品2消费的1.5倍、个人效用x₁+x₂−z均为原题。'},
 d126:{label:'定义12.6 资本家与工人的经济',page:180,kind:'labor',note:'资本家生产函数递增凹、f(0)=0；工人用一单位时间在工作与休闲间分配。平方根和CD为本站数值构造。'},
 d127:{label:'定义12.7 劳动与产出的可行计划',page:181,kind:'laborPlan',note:'必须同时满足a=1−l和f(a)=x+z；资本家的产出先付工资，剩余为利润。'},
 d128:{label:'定义12.8 劳资经济的帕累托稳定',page:182,kind:'laborPareto',note:'资本家看z，工人看休闲与消费；两者弱改善且至少一者严格改善才是帕累托改进。'},
 d129:{label:'定义12.9 工资竞争均衡',page:182,kind:'labor',note:'给定正工资，工人选最优休闲/消费，资本家选最大利润的劳动，最终劳动供需相等。'},
 q122:{label:'命题12.2 均衡与帕累托稳定',page:182,kind:'laborProof',note:'原书证明把工人至少同样满意所需消费与资本家利润最大化比较，得到严格矛盾。'},
 p2:{label:'习题12.2 改为保本产量最大化',page:184,kind:'output',note:'资本家在利润非负约束下最大化产出；此目标的均衡可以不是帕累托稳定。'},
 p3c:{label:'习题12.3 技术改善后资本家更差',page:184,kind:'techCapital',note:'本站构造f₁(a)=4√a+0.8a²/(1+a)，处处不低于原技术且保持递增凹；均衡工资上升、利润下降。'},
 p3w:{label:'习题12.3 技术改善后工人更差',page:184,kind:'techWorker',note:'本站构造f₁(a)=4√a+a exp(−3a)，处处不低于原技术且保持递增凹；均衡工资下降、利润上升。'}
};
const positive=(x,name)=>{if(!Number.isFinite(x)||x<=0)throw Error(name+' must be positive')};
export function productionEconomy({A=8,B=6,share=.5,thetaA=.7,thetaB=.3,mult=1}={}){
 [A,B,mult].forEach((x,i)=>positive(x,['A','B','mult'][i]));
 if(!(share>0&&share<1&&thetaA>0&&thetaA<1&&thetaB>0&&thetaB<1))throw Error('shares and utility weights must lie in (0,1)');
 const theta=share*thetaA+(1-share)*thetaB,qStar=B/A*Math.sqrt(theta/(1-theta)),q=qStar*mult;
 const profit=Math.hypot(A*q,B),supply=[A*A*q/profit,B*B/profit];
 const income=[share*profit,(1-share)*profit];
 const consumers=[
  [thetaA*income[0]/q,(1-thetaA)*income[0]],
  [thetaB*income[1]/q,(1-thetaB)*income[1]]
 ];
 const demand=[consumers[0][0]+consumers[1][0],consumers[0][1]+consumers[1][1]];
 return{A,B,share,thetaA,thetaB,theta,qStar,q,profit,supply,income,consumers,demand,gap:[demand[0]-supply[0],demand[1]-supply[1]],clears:Math.abs(demand[0]-supply[0])<1e-8};
}
export function technology(A=8,B=6,fraction=.6){
 positive(A,'A');positive(B,'B');
 if(!(fraction>=0&&fraction<=1))throw Error('fraction outside [0,1]');
 const frontier=[A*Math.cos(Math.PI/4),B*Math.sin(Math.PI/4)];
 return{A,B,frontier,disposed:[frontier[0]*fraction,frontier[1]*fraction],
  feasible:(x,y)=>x>=0&&y>=0&&(x/A)**2+(y/B)**2<=1+1e-9};
}
export function paretoExample(){
 const initial=[[2,2],[2,2]],alternative=[[3,1.5],[1,2.5]],theta=[.8,.2];
 const utility=(x,t)=>x[0]**t*x[1]**(1-t);
 return{initial,alternative,theta,initialU:initial.map((x,i)=>utility(x,theta[i])),
  alternativeU:alternative.map((x,i)=>utility(x,theta[i])),aggregate:[4,4]};
}
export function nonconvex(q=1){
 positive(q,'q');
 const a=[1,4],b=[4,1],values=[q*a[0]+a[1],q*b[0]+b[1]],best=Math.max(...values);
 const producerChoice=values.map((v,i)=>Math.abs(v-best)<1e-9?(i?'b':'a'):null).filter(Boolean);
 const equalBundle=[best/(q+1),best/(q+1)];
 return{q,a,b,values,best,producerChoice,equalBundle,
  consumerMatches:producerChoice.some(k=>{const x=k==='a'?a:b;return Math.abs(x[0]-equalBundle[0])<1e-9&&Math.abs(x[1]-equalBundle[1])<1e-9})};
}
export function comparative(q=2,tech=[1,2,3],capacity=[4,2,1]){
 positive(q,'q');
 if(tech.length!==capacity.length)throw Error('length mismatch');
 const people=tech.map((t,i)=>{positive(t,'t');positive(capacity[i],'c');
  const mode=t<q-1e-9?'good1':t>q+1e-9?'good2':'tie';
  const output=mode==='good1'?[capacity[i]/t,0]:mode==='good2'?[0,capacity[i]]:[capacity[i]/(2*t),capacity[i]/2];
  return{t,c:capacity[i],mode,output,revenue:q*output[0]+output[1]}});
 return{q,people,total:[0,1].map(j=>people.reduce((a,x)=>a+x.output[j],0))};
}
export function noTrade(t=2){
 positive(t,'t');
 const r=comparative(t,[1,2,3],[4,2,1]);
 return{...r,consumption:r.people.map(x=>x.output),tradeVolume:0};
}
export function leontiefException(){
 const q=1,people=[{t:1,c:4,production:[2.5,1.5],consumption:[2,2]},
                   {t:3,c:1,production:[0,1],consumption:[.5,.5]}];
 return{q,people,production:[2.5,2.5],consumption:[2.5,2.5],utility:[2,.5]};
}
export function chain({A=2,B=4,beta=.5}={}){
 [A,B].forEach((x,i)=>positive(x,['A','B'][i]));
 if(!(beta>0&&beta<1))throw Error('beta outside (0,1)');
 const t=(1-beta)/(1+beta),x=A*Math.sqrt(t),p=B/(2*Math.sqrt(x)),g=B*Math.sqrt(x);
 const sellerY=p*x,profit=g-p*x,leisure=1-t,workerU=leisure**beta*sellerY**(1-beta);
 return{A,B,beta,t,x,p,g,sellerY,profit,leisure,workerU,
  sellerBest:t,firmDemand:(B/(2*p))**2,marketGap:x-(B/(2*p))**2};
}
export function pollution(q=1.5){
 positive(q,'q');
 const seller=q<2-1e-9?'good2':q>2+1e-9?'good1':'tie';
 const buyer=q<1-1e-9?'good1':q>1+1e-9?'good2':'tie';
 const equilibrium=q>=1-1e-9&&q<=2+1e-9;
 return{q,seller,buyer,equilibrium,privateBundle:[0,2],privatePollution:3,privateUtility:-1,
  alternativeBundle:[1,0],alternativePollution:0,alternativeUtility:1};
}
export function production(a,A=4,kind='base',strength=1){
 if(a<0||!Number.isFinite(a))throw Error('labor must be nonnegative');
 const base=A*Math.sqrt(a);
 if(kind==='capital')return base+strength*a*a/(1+a);
 if(kind==='worker')return base+strength*a*Math.exp(-3*a);
 return base;
}
export function marginalProduct(a,A=4,kind='base',strength=1){
 if(a<=0)return Infinity;
 const base=A/(2*Math.sqrt(a));
 if(kind==='capital')return base+strength*a*(2+a)/(1+a)**2;
 if(kind==='worker')return base+strength*Math.exp(-3*a)*(1-3*a);
 return base;
}
export function labor({A=4,beta=.5,kind='base',strength=1,mult=1}={}){
 positive(A,'A');positive(mult,'mult');
 if(!(beta>0&&beta<1))throw Error('beta outside (0,1)');
 const aStar=1-beta,wStar=marginalProduct(aStar,A,kind,strength),w=wStar*mult;
 if(kind==='capital'&&w<=strength)throw Error('wage at or below asymptotic marginal product');
 let lo=1e-10,hi=100;
 for(let i=0;i<90;i++){const m=(lo+hi)/2;if(marginalProduct(m,A,kind,strength)>w)lo=m;else hi=m}
 const firmLabor=(lo+hi)/2,workerLabor=aStar,output=production(firmLabor,A,kind,strength),
  profit=output-w*firmLabor,workerConsumption=w*workerLabor;
 return{A,beta,kind,strength,mult,aStar,wStar,w,firmLabor,workerLabor,
  laborGap:firmLabor-workerLabor,output,profit,workerConsumption,
  clears:Math.abs(firmLabor-workerLabor)<1e-7};
}
export function laborPlan({A=4,a=.5,l=.5,workerShare=.5}={}){
 const output=production(a,A),x=workerShare*output,z=(1-workerShare)*output;
 return{a,l,A,workerShare,output,x,z,timeFeasible:Math.abs(a+l-1)<1e-9,goodsFeasible:Math.abs(output-x-z)<1e-9};
}
export function laborPareto({A=4,beta=.5,alternativeLabor=.4}={}){
 const eq=labor({A,beta}),a=eq.aStar,l=1-a,x=eq.w*a,z=production(a,A)-x;
 const lAlt=1-alternativeLabor;
 if(!(lAlt>0))throw Error('alternative leisure must be positive');
 const xRequired=x*(l/lAlt)**(beta/(1-beta));
 const zAvailable=production(alternativeLabor,A)-xRequired;
 return{eq,a,l,x,z,alternativeLabor,lAlt,xRequired,zAvailable,capitalGain:zAvailable-z,
  alternativeFeasible:zAvailable>=0};
}
export function outputCapitalist({A=4,beta=.5,reduction=.2}={}){
 positive(A,'A');
 if(!(beta>0&&beta<1&&reduction>0&&reduction<1))throw Error('parameters outside range');
 const a=1-beta,w=A/Math.sqrt(a),x=production(a,A),l=1-a,U=l**beta*x**(1-beta);
 const aAlt=a*(1-reduction),lAlt=1-aAlt,xNeeded=x*(l/lAlt)**(beta/(1-beta));
 const zAlt=production(aAlt,A)-xNeeded;
 return{A,beta,reduction,a,w,x,l,U,z:0,aAlt,lAlt,xNeeded,zAlt,
  outputMaxLabor:(A/w)**2,profitAtAlternative:production(aAlt,A)-w*aAlt};
}
export function technologyImprovement(kind='capital',strength=kind==='capital'?.8:1,beta=.5){
 if(!['capital','worker'].includes(kind))throw Error('kind must be capital or worker');
 const old=labor({A:4,beta,kind:'base'}),newState=labor({A:4,beta,kind,strength});
 const a=old.aStar,oldOutput=production(a,4),newOutput=production(a,4,kind,strength);
 const oldProfit=oldOutput-old.w*a,newProfit=newOutput-newState.w*a;
 const oldWorker=old.w*a,newWorker=newState.w*a;
 return{kind,strength,beta,a,oldOutput,newOutput,oldWage:old.w,newWage:newState.w,
  oldProfit,newProfit,oldWorker,newWorker,capitalChange:newProfit-oldProfit,
  workerChange:newWorker-oldWorker};
}

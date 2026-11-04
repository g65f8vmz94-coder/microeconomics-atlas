// Chapter 13, Osborne–Rubinstein, printed pp. 187–201.
// Explicit functions for bank congestion, fish costs, and health survival are
// either directly assigned in the exercises or marked as constructed examples.
export const casesBySection={
 '13.1':['d131','d132','l131','l132','q131','d133','q132','p1a','p1b','p1c','p1d','p2','p3a','p3b','p4a','p4b','p4c'],
 '13.2':['intro132','d134','fig131','d135','q133','carNone','carPareto','carOnlyLow'],
 '13.3':['d136','d137','q134','fishPareto','fishTax','p5a','p5b']
};
export const cases={
 d131:{label:'定义13.1 网点、居民与等待技术',page:188,kind:'service',note:'原书为连续居民、两端网点和递增连续等待函数；线性等待仅是本站及习题13.2采用的示例。'},
 d132:{label:'定义13.2 最优选择与预期一致',page:189,kind:'service',note:'每位居民把自己对拥堵的影响视为零，预期等待必须等于实际客流决定的等待。'},
 l131:{label:'引理13.1 唯一交点',page:190,kind:'crossing',note:'左总时间随分界严格上升，右总时间严格下降，端点次序相反。'},
 l132:{label:'引理13.2 左右居民排序',page:190,kind:'sorting',note:'同一等待预期下，若x偏好左网点，则所有更靠左的居民严格偏好左网点。'},
 q131:{label:'命题13.1 均衡存在且唯一',page:191,kind:'service',note:'唯一性仅差无差异分界点本身的分配；有限人数的离散模型不能直接套用。'},
 d133:{label:'定义13.3 帕累托稳定',page:192,kind:'pareto',note:'比较任何另一分配时必须用新客流重算两边等待，不可固定旧等待。'},
 q132:{label:'命题13.2 网点均衡为何稳定',page:192,kind:'pareto',note:'若把更多居民送往一边，从另一边转来的正质量居民中有人会变差。'},
 p1a:{label:'习题13.1(a) 一侧提效与客流',page:199,kind:'improve',note:'一侧等待技术在所有正客流处改善时，均衡分界向该侧移动。'},
 p1b:{label:'习题13.1(b) 较快网点的等待',page:199,kind:'compare',note:'更高效网点会吸引更多人，但在均衡时其实际等待仍较低。'},
 p1c:{label:'习题13.1(c) 全时间等比夸大',page:199,kind:'allScale',note:'两种选择的通勤加等待时间同时乘相同正数，不改变最优选择或均衡客流。'},
 p1d:{label:'习题13.1(d) 只夸大等待',page:199,kind:'waitScale',note:'只放大等待而不放大通勤，会改变分界；方向依赖两网点的等待技术。'},
 p2:{label:'习题13.2 个体稳定与总时间最小',page:200,kind:'social',note:'原题给f₀(z)=z、f₁(z)=2z；题面第二个积分误写f₁(z)，实际右客流应为1−z。'},
 p3a:{label:'习题13.3(a) 抽奖人数与预期',page:200,kind:'raffle',note:'正人数候选中，L票中奖效用为v/nL、H票为1/nH；预期票数必须与实际选择一致。'},
 p3b:{label:'习题13.3(b) v=1/3的抽奖均衡',page:200,kind:'raffle',note:'1,200人、v=1/3时，正人数均衡为300张L票、900张H票。'},
 p4a:{label:'习题13.4(a) 两场馆按比例分配',page:201,kind:'matching',note:'原题同时要求各场馆条件匹配概率跨场馆相加为1，与本问给出的q₁=q₂=1冲突；下图按逐场馆条件概率解释。'},
 p4b:{label:'习题13.4(b) 双方都去两场馆',page:201,kind:'matching',note:'正人数内点下，两馆的B/A比例相同才使两类人在两馆都无差异；原题概率归一化矛盾另列。'},
 p4c:{label:'习题13.4(c) 全去第一场馆',page:201,kind:'matchingOne',note:'逐场馆条件概率解释下，全体去第一场馆是均衡；按原题附加的跨馆归一化，a>b时一般不满足。'},
 intro132:{label:'第13.2节引言 逆向选择',page:192,kind:'carIntro',note:'统一价格与私人质量信息使高质量车更不愿进入待售集合；这是逆向选择的核心因果链。'},
 d134:{label:'定义13.4 二手车质量与私人信息',page:193,kind:'cars',note:'卖家知道每车质量，买家只知道出售集合的平均质量；买家人数多于车辆，α>1。'},
 fig131:{label:'图13.1 出售车辆的质量排序',page:194,kind:'cars',note:'借鉴原图红色出售点、均值与统一价格的关系；质量数值为本站构造，不复刻原图坐标。'},
 d135:{label:'定义13.5 四项均衡条件',page:194,kind:'cars',note:'同时检验卖家选择、买家选择、交易数量相等、正交易时质量信念正确。'},
 q133:{label:'命题13.3 正交易存在与低质先卖',page:195,kind:'carProof',note:'从最低质量开始，取满足αA(m)≥qₘ的最大m，价格αA(m)且部分买家无差异成交。'},
 carNone:{label:'无人交易：悲观信念的边界',page:195,kind:'carNone',note:'原书允许无人交易时信念不受实际质量限制；若要求信念在真实质量范围内，此结果被排除。'},
 carPareto:{label:'未售高质量车的交易损失',page:195,kind:'carPareto',note:'若有未售车，可在卖家质量q和买家估值αq之间私下定价使双方受益；这超出匿名统一价格的信息机制。'},
 carOnlyLow:{label:'整数质量例 只剩最低质量车',page:196,kind:'carOnlyLow',note:'若质量为1到|S|且α<4/3，任何正交易均衡只卖最低质量车；整数质量尺度与定义13.4的(0,1]标准化不一致但可等比缩放。'},
 d136:{label:'定义13.6 渔业经济与总成本',page:196,kind:'fish',note:'渔民捕鱼上限L，单位成本c(T)随全社会捕捞T上升；线性c(T)=kT为本站可计算示例。'},
 d137:{label:'定义13.7 价格、选择、出清与预期',page:197,kind:'fish',note:'给定价格和预计单位成本，每位渔民利润最大；消费者最优；总量出清；预计成本与实际总捕捞一致。'},
 q134:{label:'命题13.4 唯一竞争均衡',page:198,kind:'fish',note:'在原书边界条件下，内点均衡有p=v=c(T)，捕鱼和消费总量相等。'},
 fishPareto:{label:'捕捞外部性与帕累托改进',page:199,kind:'fishPareto',note:'减产后单位成本下降，协商价严格位于新成本与消费者价值之间，消费者和渔民都受益。'},
 fishTax:{label:'单位税与税款返还',page:199,kind:'fishTax',note:'税改变渔民面对的单位成本与均衡产量；若未把税款实际返还，不能声称每个人改善。'},
 p5a:{label:'习题13.5(a) 健康服务均衡方程',page:201,kind:'health',note:'原题给出生存概率递增且凹；(a)另假设可微与正消费。本站的概率函数和固定价格是自主数值示例。'},
 p5b:{label:'习题13.5(b) 忽略他人健康收益',page:201,kind:'healthExternal',note:'个人把平均服务量视为给定；可微内点下，正的平均量外部影响和可行的共同调整支持严格改善。'}
};
const finite=x=>Number.isFinite(x);
const requirePositive=(x,label)=>{if(!finite(x)||x<=0)throw Error(label+' must be positive')};
export function service({a=1,b=2,z=.3,lambda=1,mode='base'}={}){
 [a,b,lambda].forEach((x,i)=>requirePositive(x,['a','b','lambda'][i]));
 if(!(z>=0&&z<=1))throw Error('z outside [0,1]');
 if(!['base','all','wait'].includes(mode))throw Error('unknown exaggeration mode');
 const scale=mode==='wait'?lambda:1,eq=(1+scale*b)/(2+scale*(a+b));
 const beliefs=[a*z,b*(1-z)],cut=Math.max(0,Math.min(1,(1+scale*(beliefs[1]-beliefs[0]))/2));
 const eqWait=[a*eq,b*(1-eq)];
 const travelScale=mode==='all'?lambda:1,waitScale=mode==='base'?1:lambda;
 const left=x=>travelScale*x+waitScale*a*z;
 const right=x=>travelScale*(1-x)+waitScale*b*(1-z);
 const aggregate=x=>.5*(x*x+(1-x)**2)+a*x*x+b*(1-x)**2;
 const social=(b+.5)/(a+b+1),eqLoss=aggregate(eq),socialLoss=aggregate(social);
 return{a,b,z,lambda,mode,scale,beliefs,cut,eq,eqWait,gap:cut-z,social,eqLoss,socialLoss,
  totalLoss:aggregate(z),left,right,aggregate};
}
export function servicePareto({a=1,b=2,shift=.1}={}){
 const r=service({a,b,z:.5}),old=r.eq,next=Math.max(.01,Math.min(.99,old+shift));
 const switched=(next>old)?(old+next)/2:(old+next)/2;
 const oldBranch=next>old?1:0,newBranch=1-oldBranch;
 const oldLoss=oldBranch===0?switched+a*old:1-switched+b*(1-old);
 const newLoss=newBranch===0?switched+a*next:1-switched+b*(1-next);
 return{...r,next,switched,oldBranch,newBranch,oldLoss,newLoss,worse:newLoss>oldLoss+1e-9};
}
const defaultQualities=[.05,.1,.2,.6,.8,1];
export function cars({qualities=defaultQualities,alpha=1.5,m=2,noTrade=false}={}){
 requirePositive(alpha,'alpha');if(alpha<=1)throw Error('alpha must exceed 1');
 const q=[...qualities].sort((x,y)=>x-y);q.forEach(x=>{if(!(x>0&&x<=1))throw Error('quality outside (0,1]')});
 if(!Number.isInteger(m)||m<1||m>q.length)throw Error('invalid candidate size');
 const candidates=q.map((_,i)=>{
  const n=i+1,mean=q.slice(0,n).reduce((u,v)=>u+v,0)/n,p=alpha*mean;
  return{n,mean,p,valid:p+1e-9>=q[i]&&(i===q.length-1||p<=q[i+1]+1e-9),
   sellsAccepted:p+1e-9>=q[i],excludedStay:i===q.length-1||p<=q[i+1]+1e-9};
 });
 const eligible=candidates.filter(x=>x.p+1e-9>=q[x.n-1]);
 const maximal=eligible.at(-1),chosen=noTrade?{n:0,mean:0,p:q[0]/2,valid:true}:candidates[m-1];
 const untraded=q.slice(chosen.n),lostGain=untraded.reduce((u,v)=>u+(alpha-1)*v,0);
 return{q,alpha,m,candidates,maximal,chosen,noTrade,belief:noTrade?0:chosen.mean,
  buyerCount:q.length+2,untraded,lostGain,tradeGain:q.slice(0,chosen.n).reduce((u,v)=>u+(alpha-1)*v,0)};
}
// Compare discrete hypothetical seller sets. A transition is not a market
// adjustment path and never invents a fractional car or intermediate belief.
export function carFilmState({alpha=1.5,phase=0}={}){
 if(!Number.isInteger(phase)||phase<0||phase>4)throw Error('invalid car film phase');
 const base=cars({alpha}),candidates=[base.q.length,3,2,1,base.maximal.n];
 return {...cars({alpha,m:candidates[phase]}),mode:'carFilm',phase,candidateSequence:candidates};
}
// Compare the anonymous-market equilibrium to a feasible, targeted transfer.
// This is a welfare witness, not an implementable anonymous-market mechanism.
export function carParetoFilmState({alpha=1.5,m=2,phase=0}={}){
 if(!Number.isInteger(phase)||phase<0||phase>1)throw Error('invalid car Pareto phase');
 const base=cars({alpha,m}),eligible=base.chosen.valid&&base.untraded.length>0;
 const quality=eligible?base.untraded[0]:null,buyerValue=eligible?alpha*quality:null;
 const bilateralPrice=eligible?(quality+buyerValue)/2:null;
 return {...base,mode:'carParetoFilm',phase,eligible,quality,buyerValue,bilateralPrice,
  sellerGain:eligible?bilateralPrice-quality:null,buyerGain:eligible?buyerValue-bilateralPrice:null};
}
// No-trade candidates: zero belief, a minimum-quality belief at the same
// price, then the minimum-quality belief at the lowest owner's reservation.
export function carNoTradeFilmState({alpha=1.5,phase=0}={}){
 if(!Number.isInteger(phase)||phase<0||phase>2)throw Error('invalid no-trade phase');
 const base=cars({alpha,noTrade:true}),minimum=base.q[0],price=phase===2?minimum:minimum/2;
 const belief=phase===0?0:minimum,buyerValue=alpha*belief;
 const forcedSellers=base.q.filter(q=>price>q+1e-9).length;
 const buyerWants=buyerValue>price+1e-9;
 return {...base,mode:'carNoTradeFilm',phase,minimum,belief,buyerValue,forcedSellers,buyerWants,
  noTradeSupported:forcedSellers===0&&!buyerWants,chosen:{...base.chosen,p:price,valid:forcedSellers===0&&!buyerWants}};
}
export function fishing({v=6,k=1,fraction=.5,mode='equilibrium',rebate=true,fishers=5,consumers=10,L=2}={}){
 [v,k,fishers,consumers,L].forEach((x,i)=>requirePositive(x,['v','k','fishers','consumers','L'][i]));
 if(!(fraction>0&&fraction<1))throw Error('fraction outside (0,1)');
 if(!(k*fishers*L>v&&fishers*L<=consumers))throw Error('source boundary assumptions fail');
 const eqT=v/k,T=mode==='equilibrium'?eqT:eqT*fraction,c=k*T;
 const tax=mode==='tax'?v-c:0,p=mode==='pareto'?(v+c)/2:v;
 const revenue=tax*T,transfer=mode==='tax'&&rebate?revenue/(fishers+consumers):0;
 const consumer=(v-p)*T/consumers+transfer,fisher=(p-c-tax)*T/fishers+transfer;
 return{v,k,fraction,mode,rebate,fishers,consumers,L,eqT,T,c,tax,p,revenue,transfer,
  y:T/fishers,x:T/consumers,consumer,fisher,socialOptimal:v/(2*k),
  totalSurplus:(v-c)*T,beliefCorrect:true,clears:true};
}
// Each frame checks a proposed price and aggregate catch. Participants take
// price and the implied unit-cost belief as given; moving between hypotheses
// is not a claim that the market follows this path over time.
export function fishingEquilibriumFilmState({v=6,k=1,phase=0}={}){
 const base=fishing({v,k}),p=Number(phase);if(!Number.isFinite(p))throw Error('invalid film phase');
 const t=Math.max(0,Math.min(6,p)),cap=base.fishers*base.L,spread=Math.min(v/4,(k*cap-v)/4);
 const points=[0,base.eqT*2/3,(base.eqT+cap)/2,base.eqT,0,cap,base.eqT],prices=[v,v,v,v,v+spread,v-spread,v];
 const i=Math.min(5,Math.floor(t)),u=t-i,candidate=points[i]+(points[i+1]-points[i])*u,trialPrice=prices[i]+(prices[i+1]-prices[i])*u,cost=k*candidate;
 const equal=Math.abs(cost-trialPrice)<1e-10,branch=equal?'indifferent':cost<trialPrice?'full':'none';
 const consumerBranch=Math.abs(trialPrice-v)<1e-10?'indifferent':trialPrice<v?'full':'none';
 const bestTotal=branch==='full'?cap:branch==='none'?0:null,bestDemand=consumerBranch==='full'?base.consumers:consumerBranch==='none'?0:null;
 const supplyFits=bestTotal===null?candidate<=cap:Math.abs(bestTotal-candidate)<1e-10;
 const demandFits=bestDemand===null?candidate<=base.consumers:Math.abs(bestDemand-candidate)<1e-10;
 return {...base,mode:'candidate',phase:t,T:candidate,c:cost,trialPrice,branch,consumerBranch,bestTotal,bestDemand,consistent:supplyFits&&demandFits,points,prices};
}
// A comparison of feasible allocations; it does not assert a market dynamic.
export function fishingParetoFilmState({v=6,k=1,fraction=.5,phase=0}={}){
 if(!(fraction>0&&fraction<1))throw Error('target fraction outside (0,1)');
 const t=Math.max(0,Math.min(1,Number(phase)));
 if(!Number.isFinite(t))throw Error('invalid film phase');
 const current=1-(1-fraction)*t;
 if(current===1)return {...fishing({v,k}),phase:t,targetFraction:fraction};
 return {...fishing({v,k,fraction:current,mode:'pareto'}),phase:t,targetFraction:fraction};
}
// Phase 0→1 changes the per-unit tax and corresponding equilibrium; phase
// 1→2 distributes the revenue. Until actually paid out it remains with the
// government and is not included in either group's gains.
export function fishingTaxFilmState({v=6,k=1,fraction=.5,phase=0}={}){
 if(!(fraction>0&&fraction<1))throw Error('target fraction outside (0,1)');
 const t=Number(phase);if(!Number.isFinite(t))throw Error('invalid film phase');
 const progress=Math.max(0,Math.min(1,t)),share=Math.max(0,Math.min(1,t-1));
 const current=1-(1-fraction)*progress;
 const r=current===1?{...fishing({v,k}),mode:'tax'}:fishing({v,k,fraction:current,mode:'tax',rebate:false});
 const transfer=r.revenue*share/(r.fishers+r.consumers);
 return {...r,phase:t,rebate:share===1,rebateShare:share,transfer,retained:r.revenue*(1-share),consumer:(r.v-r.p)*r.x+transfer,fisher:(r.p-r.c-r.tax)*r.y+transfer};
}
export function raffle({v=1/3,guess=300,N=1200}={}){
 if(!(v>0&&v<1&&Number.isInteger(N)&&N>1&&guess>0&&guess<N))throw Error('invalid raffle parameters');
 const fixed=N*v/(1+v),nH=N-guess,utilityL=v/guess,utilityH=1/nH;
 return{v,guess,N,nH,utilityL,utilityH,fixed,consistent:Math.abs(guess-fixed)<1e-8};
}
function matchChance(own,other){
 if(own===0&&other===0)return 0;
 if(own===0)return 1;
 return Math.min(1,other/own);
}
export function matching({a=6,b=4,shareA=.5,shareB=.5,oneVenue=false}={}){
 if(!(a>=b&&b>0&&shareA>=0&&shareA<=1&&shareB>=0&&shareB<=1))throw Error('matching parameters outside range');
 const A=oneVenue?[a,0]:[a*shareA,a*(1-shareA)],B=oneVenue?[b,0]:[b*shareB,b*(1-shareB)];
 const p=A.map((n,i)=>matchChance(n,B[i])),q=B.map((n,i)=>matchChance(n,A[i]));
 const optimalA=A.every((n,i)=>n<=1e-9||p[i]>=p[1-i]-1e-9),optimalB=B.every((n,i)=>n<=1e-9||q[i]>=q[1-i]-1e-9);
 const correctedEquilibrium=optimalA&&optimalB;
 return{a,b,A,B,p,q,optimalA,optimalB,correctedEquilibrium,
  printedNormalization:Math.abs(p[0]+p[1]-1)<1e-9&&Math.abs(q[0]+q[1]-1)<1e-9,
  sumP:p[0]+p[1],sumQ:q[0]+q[1]};
}
export function survival(y,s){
 if(y<0||s<0)throw Error('health service cannot be negative');
 return .1+.35*(1-Math.exp(-y))+.2*(1-Math.exp(-s));
}
export function health({m=10,p=2}={}){
 requirePositive(m,'m');requirePositive(p,'p');
 const upper=m/p;
 const derivative=(y,s,collective)=>-p*survival(y,s)+(m-p*y)*Math.exp(-y)*(.35+(collective?.2:0));
 function root(collective){let lo=0,hi=upper;for(let j=0;j<90;j++){const mid=(lo+hi)/2;if(derivative(mid,mid,collective)>0)lo=mid;else hi=mid}return(lo+hi)/2}
 const privateY=root(false),socialY=root(true);
 const U=y=>(m-p*y)*survival(y,y);
 return{m,p,privateY,socialY,privateUtility:U(privateY),socialUtility:U(socialY),
  privateAlpha:survival(privateY,privateY),socialAlpha:survival(socialY,socialY),
  privateFOC:derivative(privateY,privateY,false),socialMarginalAtPrivate:derivative(privateY,privateY,true)};
}
// The moving point always evaluates the same common-service objective as the
// curves. Phase is presentation time, not a claim about a real adjustment path.
export function healthFilmState({m=10,p=2,phase=0}={}){
 const r=health({m,p}),t=Math.max(0,Math.min(1,Number(phase)-1));
 const y=r.privateY+(r.socialY-r.privateY)*t;
 return {...r,phase:Number(phase),collectiveY:y,collectiveUtility:(m-p*y)*survival(y,y)};
}

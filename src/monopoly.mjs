const tolM=1e-9;
const clampM=(x,a,b)=>Math.max(a,Math.min(b,x));
export function linearM({a=100,b=1,c=20,k=.4}={}){
 const choke=a/b,P=x=>a-b*x,MR=x=>a-2*b*x,MC=x=>c+k*x,AC=x=>c+k*x/2,cost=x=>c*x+k*x*x/2,R=x=>P(x)*x,profit=x=>R(x)-cost(x),W=x=>a*x-b*x*x/2,TS=x=>W(x)-cost(x);
 const qm=clampM((a-c)/(2*b+k),0,choke),qc=clampM((a-c)/(b+k),0,choke),qo=clampM((a-c)/(b+k/2),0,choke);
 return {a,b,c,k,choke,P,MR,MC,AC,cost,R,profit,W,TS,qm,qc,qo};
}
// A fixed lesson timeline; every label and point is derived from the same model.
export function linearTeachingM(m,step=0){
 const num=x=>Number(x.toFixed(2));
 const phase=Math.max(0,Math.min(4,Number(step)||0)),i=Math.floor(phase),t=phase-i;
 const anchors=[m.qm*.25,m.qm*.65,m.qm,Math.min(m.choke,m.qm*1.5),m.qm];
 const q=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*t;
 const titles=['先想一想：多卖一杯能多赚多少','先多卖一点，比较新增收入和成本','增产到两条线相遇','再多卖，利润反而会下降','从需求线上读出价格'];
 const texts=[
  `老太太卖豆浆，想多卖一点就要给所有顾客降价。现在先做${num(q)}杯：多卖一杯能多收多少钱，又要多花多少成本？`,
  `现在做${num(q)}杯，多做一杯带来的新增收入约${num(m.MR(q))}元，比新增成本${num(m.MC(q))}元高；老太太再多做一点还能多赚。`,
  `做到${num(q)}杯时，新增收入和新增成本都约为${num(m.MC(q))}元。本例利润曲线先升后降，所以这里是利润最大的产量。`,
  `如果继续做到${num(q)}杯，新增收入约${num(m.MR(q))}元，低于新增成本${num(m.MC(q))}元；利润从最优时约${num(m.profit(m.qm))}元降到${num(m.profit(q))}元。`,
  `回到${num(m.qm)}杯：沿竖线找到需求线，读出每杯约${num(m.P(m.qm))}元。先用 MR=MC 找产量，再沿需求线找售价。`
 ];
 if(m.qm<=tolM)return {step:i,q:0,title:'边界情况：不生产',narration:'本例的需求截距不高于边际成本截距，最优产量为零。此时没有实际成交价格，不能套用正产量内点的 MR=MC。',price:null,mr:m.MR(0),mc:m.MC(0),profit:0};
 const changing=t>1e-9;
 const title=changing?'跟着产量变化':titles[i];
 const narration=changing?`产量正在变化，目前约${num(q)}；边际收益约${num(m.MR(q))}，边际成本约${num(m.MC(q))}。三条曲线和对应数值根据同一产量计算。`:texts[i];
 return {step:phase,q,title,narration,price:m.P(q),mr:m.MR(q),mc:m.MC(q),profit:m.profit(q)};
}
export function welfareM(m,q,price=m.P(q)){const cs=m.W(q)-price*q,profit=price*q-m.cost(q),ts=m.TS(q);return {cs,profit,ts,dwl:m.TS(m.qc)-ts,quantity:q,price};}
export function welfareTeachingM(m,step=0){
 const num=x=>Number(x.toFixed(2)),phase=Math.max(0,Math.min(3,Number(step)||0)),i=Math.floor(phase),t=phase-i;
 const anchors=[m.qm,(m.qm+m.qc)/2,m.qc,m.qm];
 const q=anchors[i]+(anchors[Math.min(i+1,3)]-anchors[i])*t,r=welfareM(m,q);
 if(m.qc<=tolM)return {step:phase,q:0,...r,title:'边界：没有正的有效交易',narration:'本例的需求截距不高于成本截距，社会最优和利润最大产量均为零；图中没有正的无谓损失三角形。'};
 const titles=['老太太少做的豆浆，损失了什么？','再做一点：还有值得完成的交易','到达社会最优：最后一杯刚好值得','回看金色区域：哪些好处没有实现'];
 const texts=[
  `老太太为了自己最赚钱，做${num(m.qm)}杯。但后面还有人愿付的钱比多做一杯的成本高；这些没有完成的交易，少创造了多少好处？`,
  `假设豆浆增加到${num(q)}杯，更多人能买到。新增几杯的支付意愿仍高于制作成本，大家的总剩余增加；金色损失缩小到约${num(r.dwl)}元。`,
  `做到${num(m.qc)}杯时，最后一杯的支付意愿等于新增成本；再往右成本会更高。按本例的总剩余口径，这里是社会最优。`,
  `回到老太太自己选的${num(m.qm)}杯。金色面积约${num(r.dwl)}元，是本例未完成交易少创造的净好处，既不是她的利润，也不是顾客付款总额。`
 ];
 const changing=t>1e-9;
 return {step:phase,q,...r,title:changing?'跟着产量和损失变化':titles[i],narration:changing?`当前交易量约${num(q)}，相对于社会最优的损失约${num(r.dwl)}。金色区域和各项数值按同一产量计算。`:texts[i]};
}
// Compare three objectives while the same output moves along one fixed model.
export function outputGoalsTeachingM(m,step=0){
 const phase=clampM(Number(step)||0,0,3),i=Math.floor(phase),t=phase-i,anchors=[m.qm,m.qc,m.qo,m.qm],q=anchors[i]+(anchors[Math.min(i+1,3)]-anchors[i])*t,num=x=>Number(x.toFixed(2));
 if(m.qm<=tolM)return {phase,q:0,price:null,profit:0,totalSurplus:0,title:'先看边界：不生产',narration:'本例需求截距不高于成本截距，三种目标都可以选择零产量；零产量的平均成本没有定义，不能机械套正产量的交点。'};
 const price=m.P(q),profit=m.profit(q),totalSurplus=m.TS(q),same=Math.abs(m.qo-m.qc)<tolM;
 const titles=['阿姨只想自己赚得最多','换成看所有交易创造的净好处','只求不亏钱，还想尽量多卖','回看：目标不同，停的位置不同'];
 const texts=[`阿姨先选自己利润最大的产量：做约${num(m.qm)}杯，每杯${num(m.P(m.qm))}元，利润约${num(m.profit(m.qm))}元。此例正内点由边际收益等于边际成本求出。`,`如果比较顾客愿付的钱与真实生产成本，做到约${num(m.qc)}杯时，本例净总剩余最大。此时支付意愿等于边际成本，和阿姨自己利润最大的杯数不同。`,same?`只求不亏钱并尽量多卖时，本例最多做约${num(m.qo)}杯，与社会最优碰巧重合；这里边际成本是常数，不能把严格大于当成无条件结论。`:`如果阿姨只求不亏钱并尽量多卖，本例最多做约${num(m.qo)}杯，平均每杯成本刚好等于售价，利润为零。它超过社会最优，后面一些豆浆的成本高于顾客愿付的钱。`,`回到阿姨利润最大时的${num(m.qm)}杯。三个问题分别比较利润、净总剩余和非亏损的最大产量；先认目标，再选择方程，还要检查边界。`];
 return {phase,q,price,profit,totalSurplus,title:t>tolM?'同一摊位，沿产量继续比较':titles[i],narration:t>tolM?`当前做约${num(q)}杯，售价约${num(price)}元，阿姨利润约${num(profit)}元，净总剩余约${num(totalSurplus)}元。需求和成本没变，只是在比较不同产量。`:texts[i]};
}
export function capM(m,cap=50,tie='max'){
 const kink=clampM((m.a-cap)/m.b,0,m.choke),price=q=>Math.min(cap,m.P(q)),profit=q=>price(q)*q-m.cost(q),candidates=[0,kink,m.choke];
 if(m.k>0){const x=(cap-m.c)/m.k;if(x>=0&&x<=kink)candidates.push(x)}if(m.qm>=kink)candidates.push(m.qm);
 const best=Math.max(...candidates.map(profit)),optima=[...new Set(candidates.filter(q=>profit(q)>=best-tolM))].sort((a,b)=>a-b),q=tie==='min'?optima[0]:optima.at(-1),flat=m.k===0&&Math.abs(cap-m.c)<tolM;
 return {q,price:price(q),profit:profit(q),kink,priceAt:price,profitAt:profit,optima,optimalInterval:flat?[0,kink]:null};
}
// The cap changes along a single timeline; each intermediate optimum is solved.
export function capTeachingM(m,step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,num=x=>Number(x.toFixed(2));
 if(m.qm<=tolM||m.k<=tolM){const cap=m.P(m.qc),result=capM(m,cap);return {phase,cap,...result,title:'先检查模型边界',narration:'这个模型的初始销量为零或边际成本为常数。限价下可能存在多个最优产量，不能把本例的唯一产量结论直接套用。'};}
 const pc=m.P(m.qc),pm=m.P(m.qm),anchors=[m.a,pm,pc,m.c+.3*(pc-m.c),pc],cap=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*t,r=capM(m,cap);
 const titles=['先看：不管价格，豆浆摊会怎么卖','限价刚碰到原来的售价','限得合适，反而能多卖','限价太低，豆浆做少了','再看一遍：折点为什么重要'];
 const texts=[
  `老太太自己算过：每杯卖${num(pm)}元、做${num(m.qm)}杯最赚钱。政府把上限设在${num(cap)}元，高于她原本的售价，所以她不用改变做法。`,
  `上限降到每杯${num(pm)}元，刚好碰到原来的售价；她仍做${num(m.qm)}杯。接下来如果再压低价格，就要重新算卖多少杯最赚钱。`,
  `上限降到每杯${num(pc)}元，她会做${num(m.qc)}杯，比原先多。此时多做一杯的成本与顾客愿付的价格相等；按本例口径，这恰是社会最优产量。`,
  `上限再压到每杯${num(cap)}元，老太太只愿做${num(r.q)}杯，比原来的${num(m.qm)}杯还少。限价降低了成交价。再看卖方愿意提供几件，才知道多少人买得到。`,
  `再把上限调回${num(pc)}元。看金圈：圈左边多卖一杯能收限价；圈右边想多卖，还得顺着需求降价。做题时要把这个折点与驻点、边界一起比较利润。`
 ];
 const changing=t>1e-9;
 return {phase,cap,...r,title:changing?'限价改变，老太太重新算账':titles[i],narration:changing?`每杯最高价正变到约${num(cap)}元。按这个上限重新算，老太太愿意做约${num(r.q)}杯；图中的线、金圈和数值一起变化。`:texts[i]};
}
export function subsidyM(m,t=0){const q=clampM((m.a+t-m.c)/(2*m.b+m.k),0,m.choke),price=m.P(q),fiscal=t*q;return {q,price,fiscal,profit:m.profit(q)+fiscal,netWelfare:m.TS(q),consumerSurplus:m.W(q)-price*q};}
// A subsidy is a transfer: producer revenue, consumer payment and fiscal outlay stay distinct.
export function subsidyTeachingM(m,step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),u=phase-i,optimal=m.b*m.qc,targets=[0,optimal*.5,optimal,optimal*1.5,optimal],t=targets[i]+(targets[Math.min(i+1,4)]-targets[i])*u,r=subsidyM(m,t),base=subsidyM(m,0),num=x=>Number(x.toFixed(2));
 if(m.qc<=tolM)return {...r,phase,t,optimal,base,consumerGain:0,netConsumerGain:0,title:'先看边界：没有正的有效产量',narration:'本例的需求截距不高于成本截距，社会最优产量为零；不要机械套用正产量的补贴结论。'};
 const consumerGain=r.consumerSurplus-base.consumerSurplus,netConsumerGain=consumerGain-r.fiscal;
 const titles=['没有补贴：阿姨先按自己的利润选择','每卖一杯多补一点，产量上升','补到合适程度：产量达到社会最优','补得过多，可能做出不值得的豆浆','补贴从哪来，决定谁真正受益'];
 const text=[`阿姨只靠卖豆浆收钱，自己最赚钱时做${num(r.q)}杯，每杯卖${num(r.price)}元。还有顾客愿付的钱高于多做一杯的成本，却没有买到。`,`政府每卖一杯补${num(t)}元，阿姨现在做约${num(r.q)}杯，顾客按需求曲线每杯付${num(r.price)}元。政府补的钱并不是凭空出现的收入。`,`每杯补约${num(t)}元时，本例做到${num(r.q)}杯，正好是支付意愿等于边际成本的产量。政府一共付${num(r.fiscal)}元；不能把这笔转移重复算成社会净收益。`,r.q>m.qc+tolM?`补贴提高到${num(t)}元，阿姨做到${num(r.q)}杯，超过本例社会最优${num(m.qc)}杯。多出来的部分，顾客愿付的钱低于生产成本。`:`补贴提高到${num(t)}元，但本例产量受到非负价格和需求范围限制，未超过社会最优；不能把“过量生产”当成所有边界情形的结论。`,`回到每杯补${num(t)}元。按本例，消费者购买剩余增加约${num(consumerGain)}元，政府共支出${num(r.fiscal)}元。如果这些消费者以不改变需求的固定总额负担全部补贴，他们合计扣款后的变化约为${num(netConsumerGain)}元；换成别的筹资人或税制，结果也会变。`];
 return {...r,phase,t,optimal,base,consumerGain,netConsumerGain,title:u>1e-9?'补贴改变，卖家重新算账':titles[i],narration:u>1e-9?`政府每杯补约${num(t)}元，阿姨做约${num(r.q)}杯，顾客每杯付约${num(r.price)}元；财政支出约${num(r.fiscal)}元。曲线、数量和账目按同一补贴重算。`:text[i]};
}
export function multipleM(r=3.2,c=1){
 const sum=3+r,pair=2+3*r,product=2*r,profit=q=>-(q**4)/4+sum*q**3/3-pair*q*q/2+product*q,P=q=>c+product-pair*q/2+sum*q*q/3-q**3/4,MR=q=>c-(q-1)*(q-2)*(q-r),slope=q=>-pair/2+2*sum*q/3-3*q*q/4;
 let low=0,high=10;for(let i=0;i<90;i++){const mid=(low+high)/2;if(P(mid)>0)low=mid;else high=mid}const choke=(low+high)/2,candidates=[0,1,2,r,choke],max=Math.max(...candidates.map(profit)),best=candidates.filter(q=>profit(q)>=max-tolM);
 return {r,c,profit,P,MR,MC:()=>c,slope,choke,candidates,best};
}
// The same quantity moves through each stationary candidate; profit is recomputed, not interpolated.
export function multipleTeachingM(m,step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,anchors=[0,1,2,m.r,m.best.at(-1)],q=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*t,num=x=>Number(x.toFixed(3)),profit=m.profit(q),mr=m.MR(q),mc=m.MC(q);
 const bestList=m.best.map(num).join(' 和 '),titles=['先从不开摊的账开始','第一个交点：赚到一个小高峰','第二个交点：反而是一个低谷','第三个交点：另一个小高峰','比完所有候选和边界，再下结论'];
 const texts=[`不开摊产量为0，利润是0。接下来慢慢增加产量，左图看每多做一点的收入与成本，右图看累积利润怎样变化。`,`做到1杯时，边际收益和边际成本都等于1，利润约${num(m.profit(1))}元。左边高、右边低，所以这是本例的一个局部高点；它未必是最高的那座山。`,`做到2杯时两条边际线又相等，利润约${num(m.profit(2))}元。前面利润在降，后面又会升：这个交点反而是局部低点。`,`做到${num(m.r)}杯时再次相等，利润约${num(m.profit(m.r))}元，是另一个局部高点。仍要把它与第一个高点、停产和允许范围的另一端比较。`,`比较三个交点和两个边界后，本例全局最优产量为${bestList}杯；最大利润约${num(m.profit(m.best[0]))}元。${m.best.length>1?'这里有多个同样好的最优产量。':'这组数值下它是唯一最优。'}一般题还需检查所有边界和不可导点。`];
 return {phase,q,profit,mr,mc,price:m.P(q),best:m.best,title:t>tolM?'同一产量继续移动':titles[i],narration:t>tolM?`当前产量约${num(q)}杯，边际收益约${num(mr)}元、边际成本${num(mc)}元；利润约${num(profit)}元。左图的边际差决定右图利润此刻是上升还是下降。`:texts[i]};
}
export function discreteRevenueM(cost=0){const values=[10,6,5],revenue=[0,10,12,15],marginal=[0,10,2,3],profits=revenue.map((v,i)=>v-cost*i),max=Math.max(...profits);return {values,revenue,marginal,profits,best:profits.flatMap((v,i)=>v>=max-tolM?[i]:[])};}
// Example 7.1: uniform price moves continuously; indivisible purchases change only at thresholds.
export function discreteRevenueTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,3),price=phase<=1?10-4*phase:phase<=2?6-(phase-1):5,values=[10,6,5],buyers=values.map(v=>price<=v+tolM),q=buyers.filter(Boolean).length,revenue=q*price;
 const first=phase<=tolM,priorQ=first?0:phase<=1?1:2,priorPrice=first?0:phase<=1?10:6,priorRevenue=priorQ*priorPrice,oldPayment=priorQ*price,newPayment=(q-priorQ)*price,loss=priorRevenue-oldPayment,changed=q>priorQ,delta=revenue-priorRevenue,num=x=>Number(x.toFixed(2));
 let title,narration;
 if(first){title='先卖一杯：第一位顾客愿意买';narration='阿姨标价10元，第一位顾客的最高支付意愿正好是10元；按本题约定，他仍然买。其他两位还嫌贵，因此收入10元。';}
 else if(phase<1){title='慢慢降价，第二位还在等';narration=`价格降到${num(price)}元时，仍只有第一位顾客买。他少付了${num(loss)}元；第二位最多愿付6元，价格还没降到，他暂时不买。此刻销量没增加，不能把收入变化当成第二杯的边际收益。`;}
 else if(phase===1){title='第二位加入：新卖6元，旧顾客少付4元';narration='标价降到6元时，第二位顾客也买了。新的一杯收到6元，可第一杯从10元降到6元，少收4元；总收入从10元变12元，新增收入只有2元。';}
 else if(phase<2){title='继续降价，第三位还在等';narration=`价格降到${num(price)}元，两位老顾客各买一杯；他们一共比原先少付${num(loss)}元。第三位最多愿付5元，价格还没到，他暂时不买。销量不变时，先不要计算第三杯的离散边际收益。`;}
 else if(phase===2){title='第三位加入：新卖5元，两位老顾客各少付1元';narration='标价降到5元时，第三位也买了。新的一杯收到5元，两位老顾客各少付1元；总收入从12元变15元，新增收入是3元。';}
 else{title='对比：价格下降，新增收入却回升';narration='两次降价的新增收入分别是2元和3元。价格从6元继续降到5元，新增收入却从2元升到3元：需求价格下降，不保证离散边际收益一直下降。';}
 return {phase,price,values,buyers,q,revenue,priorQ,priorPrice,priorRevenue,oldPayment,newPayment,loss,changed,delta,title,narration};
}
export function segmentsM({a1=100,a2=80,b1=1,b2=1.2,c=20,k=.4}={}){
 const A=[a1,a2],B=[b1,b2],quantity=t=>A.map((a,i)=>Math.max(0,(a-t)/(2*B[i])));let low=c,high=Math.max(c,...A);
 for(let i=0;i<90;i++){const t=(low+high)/2,Q=quantity(t).reduce((a,b)=>a+b,0);if(t<c+k*Q)low=t;else high=t}const mc=(low+high)/2,qs=quantity(mc),Q=qs[0]+qs[1],prices=qs.map((q,i)=>A[i]-B[i]*q),cost=x=>c*x+k*x*x/2,profit=(q1,q2)=>(a1-b1*q1)*q1+(a2-b2*q2)*q2-cost(q1+q2);
 // Uniform price has a distinct active set between adjacent choke prices.
 const breaks=[...new Set([0,...A])].sort((a,b)=>a-b),candidates=[...breaks];for(let j=0;j<breaks.length-1;j++){const mid=(breaks[j]+breaks[j+1])/2,active=A.flatMap((a,i)=>a>mid?[i]:[]),aa=active.reduce((v,i)=>v+A[i]/B[i],0),bb=active.reduce((v,i)=>v+1/B[i],0);if(bb){const p=(aa+bb*c+k*bb*aa)/(2*bb+k*bb*bb);if(p>=breaks[j]&&p<=breaks[j+1])candidates.push(p)}}
 const uniformAt=p=>{const qs=A.map((a,i)=>Math.max(0,(a-p)/B[i])),Q=qs[0]+qs[1];return {p,qs,Q,profit:p*Q-cost(Q)}};const uniform=candidates.map(uniformAt).reduce((a,b)=>a.profit>=b.profit?a:b);
 return {A,B,c,k,qs,Q,prices,mc,profit:profit(...qs),profitAt:profit,quantityAtMR:quantity,uniform,exit:qs.map(q=>q<tolM)};
}
// An authored common-price introduction: buyers respond at the same displayed price.
export function marketTeachingM({a1=100,a2=80,c=20,k=.4}={},step=0){
 const phase=clampM(Number(step)||0,0,3),i=Math.floor(phase),t=phase-i,anchors=[.7,.5,.65,.5].map(v=>a1*v),price=anchors[i]+(anchors[Math.min(i+1,3)]-anchors[i])*t;
 const quantities=[Math.max(0,a1-price),Math.max(0,(a2-price)/1.2)],total=quantities[0]+quantities[1],cost=c*total+k*total*total/2,revenue=price*total,profit=revenue-cost,f=x=>Number(x.toFixed(2));
 const titles=['一个卖家，两个集市','同一个价格降低，顾客各自决定买多少','提价后，收入和利润一定增加吗？','再看：销量、成本和目标要一起考虑'];
 const text=[`街上只有阿姨一家卖豆浆，她先在两个集市都标价${f(price)}元。第一个集市买${f(quantities[0])}杯，第二个买${f(quantities[1])}杯；顾客决定买多少，她不能只靠自己定价决定销量。`,`同一标价降到${f(price)}元，两个集市分别买${f(quantities[0])}和${f(quantities[1])}杯。阿姨一共要准备${f(total)}杯，成本要按这一个总量计算。`,`把价格改成${f(price)}元，收入是${f(revenue)}元，成本${f(cost)}元，利润${f(profit)}元。价格更高并不自动意味着利润更高，要把顾客反应与成本一起算。`,`回到${f(price)}元时，总销量${f(total)}杯，利润${f(profit)}元。如果阿姨追求利润和追求销量，比较的目标就不同；算出这两个候选价格的利润，再与其他可行价格比较。`];
 return {phase,price,quantities,total,cost,revenue,profit,title:t>1e-9?'标价改变，顾客分别作出选择':titles[i],narration:t>1e-9?`同一价格正变到约${f(price)}元，两个集市分别买约${f(quantities[0])}和${f(quantities[1])}杯；总成本和利润按当前总量重算。`:text[i]};
}
export const menuPresetsM={standard:{a:2,d:.2,label:'沿用原演示：分离菜单'},high:{a:3.4,d:.2,label:'高型估值很高：只服务高型'},close:{a:1.6,d:.5,label:'两类接近：同一选项'}};
export function reallocateM(r,share=0){const lower=Math.max(-r.qs[0],r.qs[1]-r.A[1]/r.B[1]),upper=Math.min(r.qs[1],r.A[0]/r.B[0]-r.qs[0]),s=clampM(share,-1,1),delta=s>=0?s*upper:(-s)*lower,qs=[r.qs[0]+delta,r.qs[1]-delta];return {qs,delta,lower,upper,profit:r.profitAt(...qs)};}
export function segmentsTeachingM(r,step=0){
 const num=x=>Number(x.toFixed(2)),phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,anchors=[-.35,0,.35,0,0];
 const share=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*t,closed=r.exit.some(Boolean),z=reallocateM(r,closed?0:share),mr=z.qs.map((q,j)=>r.A[j]-2*r.B[j]*q),peak=Math.max(r.mc,...r.A.map(a=>a*.8)),sumLevel=phase>=3?r.mc+(peak-r.mc)*Math.sin(Math.PI*Math.min(1,phase-3)):r.mc,sumQuantities=r.quantityAtMR(sumLevel);
 if(closed)return {step:phase,...z,mr,sumLevel:r.mc,sumQuantities:r.quantityAtMR(r.mc),title:'先检查退出市场',narration:r.exit.every(Boolean)?'这组参数下两个市场都不销售：从零销量开始，任一市场多卖一杯的边际收入都不超过边际成本。':'本组参数下，整体利润最优时至少一个市场不销售（退出市场）：正销量市场才要求边际收益等于共同边际成本，未销售市场要检查边界条件。'};
 const titles=['同一批货，两处市场怎么分？','先把货移向边际收益更高的市场','移过头，会发生什么？','回到两个市场的平衡','把两条边际收益曲线横向相加'];
 const texts=[
  `老太太总共做${num(r.Q)}杯，分给两个集市。集市1多卖一点带来的新增收入约${num(mr[0])}元，集市2约${num(mr[1])}元；把一点豆浆从2挪到1，总成本不变，收入会增加。`,
  `现在集市1卖${num(z.qs[0])}杯、集市2卖${num(z.qs[1])}杯，两边新增收入都约${num(r.mc)}元。总杯数不变时，再挪一点也不能提高收入。`,
  `如果继续往集市1挪，那边新增收入降到${num(mr[0])}元，集市2反而升到${num(mr[1])}元；这次应往回挪，利润也比平衡时低。`,
  `回到平衡。这次事先选的总杯数${num(r.Q)}恰好是本例整体最优，所以两边新增收入还等于共同边际成本${num(r.mc)}元；两个集市的售价分别约${num(r.prices[0])}和${num(r.prices[1])}元。`,
  `最后想想总共做多少：在同一新增收入高度，把两个集市对应的杯数横着相加，再与总量的边际成本比较。只对实际有销量的市场使用等式。`
 ];
 const changing=t>1e-9,adding=phase>3&&phase<4;
 return {step:phase,...z,mr,sumLevel,sumQuantities,title:adding?'在同一高度横向相加':changing?'同一批豆浆正在重新分配':titles[i],narration:adding?`先假想共同边际收益为${num(sumLevel)}元，两边分别贡献${num(sumQuantities[0])}和${num(sumQuantities[1])}杯，横着相加是${num(sumQuantities[0]+sumQuantities[1])}杯；若高度高于某市场零销量时的MR，它贡献零杯。这是在构造加总曲线，不是说眼前实际总量已经改变。`:changing?`总杯数仍是${num(r.Q)}。集市1的边际收益约${num(mr[0])}元，集市2约${num(mr[1])}元；挪动时两边销量与利润一起重算。`:texts[i]};
}
export function menuM(preset='standard'){
 const {a,d}=menuPresetsM[preset],VH=q=>a*q-d*q*q,VL=q=>1.5*q-.5*q*q,qstar=clampM((3-a)/(2*(1-d)),0,1),prices=q=>({ml:VL(q),mh:VH(1)-VH(q)+VL(q)}),ps=prices(qstar),high=VH(1),pool=2*VL(1),separate=ps.ml+ps.mh,best=Math.max(high,pool,separate);
 return {a,d,VH,VL,qstar,prices,...ps,high,pool,separate,best,winners:[high,pool,separate].flatMap((x,i)=>x>=best-tolM?[i]:[]),rent:VH(qstar)-VL(qstar)};
}
export function choicesM(values,options,tie='seller'){
 const utilities=[0,...options.map(({q,m})=>values(q)-m)],best=Math.max(...utilities),tied=utilities.flatMap((u,i)=>u>=best-tolM?[i]:[]),payment=i=>i?options[i-1].m:0;
 const chosen=tied.reduce((a,b)=>(tie==='seller'?payment(a)>=payment(b):payment(a)<=payment(b))?a:b),payments=tied.map(payment);
 return {chosen,tied,utilities,best,payment:payment(chosen),minPayment:Math.min(...payments),maxPayment:Math.max(...payments)};
}
export function menuOutcomeM(z,q=.625,ml=z.prices(q).ml,mh=z.prices(q).mh,tie='seller'){
 const options=[{q,m:ml},{q:1,m:mh}],H=choicesM(z.VH,options,tie),L=choicesM(z.VL,options,tie),irL=z.VL(q)-ml,irH=z.VH(1)-mh,icH=irH-(z.VH(q)-ml),icL=irL-(z.VL(1)-mh);
 return {options,H,L,profit:H.payment+L.payment,minProfit:H.minPayment+L.minPayment,maxProfit:H.maxPayment+L.maxPayment,irL,irH,icH,icL,rent:z.VH(q)-z.VL(q)};
}
// Continuous authored inputs; consumers' choices are recomputed, never interpolated.
export function menuTeachingM(z,step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,num=x=>Number(x.toFixed(4));
 const quantities=[z.qstar,z.qstar,z.qstar*.55,z.qstar,z.qstar],markups=[.12,0,0,0,0];
 const lerp=a=>a[i]+(a[Math.min(i+1,4)]-a[i])*t,q=lerp(quantities),ps=z.prices(q),ml=ps.ml,mh=ps.mh+lerp(markups),outcome=menuOutcomeM(z,q,ml,mh,'seller');
 const titles=['大桶豆浆太贵，顾客会怎么选','降价到爱喝豆浆的人愿意买大桶','缩小小桶，少让出一些好处','回到本例的分离菜单','老太太还要比较另外两种卖法'];
  const text=[
  `老太太卖两桶豆浆：小桶 ${num(q)} 升收 ${num(ml)} 元（低类型估值 V_L(${num(q)})=${num(ml)} 元），大桶 1 升收 ${num(mh)} 元。爱喝豆浆的顾客 1 对大桶估值 ${num(z.VH(1))} 元、对小桶估值 ${num(z.VH(q))} 元：买小桶可净剩 ${num(z.VH(q)-ml)} 元，买大桶却只剩 ${num(z.VH(1)-mh)} 元，于是改买小桶。`,
  `大桶降到 ${num(mh)}=${num(z.VH(1))}−${num(z.VH(q)-ml)} 元。此时爱喝豆浆的顾客买大桶净剩 ${num(z.VH(1)-mh)} 元，与买小桶完全相同；低类型买小桶净得 ${num(z.VL(q)-ml)} 元、不买也是 0。按“无差异选让阿姨收入较高项”的约定，两人各选一档。`,
  `把小桶缩到 ${num(q)} 升、价压到 V_L(${num(q)})=${num(ml)} 元。爱喝豆浆的顾客改买小桶只能多剩 ${num(outcome.rent)} 元，大桶可涨到 ${num(mh)} 元；但低类型本身肯为小桶出的钱也同时减少了，需要在 V_H(1)+2V_L(q)−V_H(q) 里权衡。`,
  `调回最赚钱的小桶 q*=${num(q)} 升（收 V_L=${num(ml)} 元）和大桶 1 升（收 ${num(mh)} 元），总收入达到 V_H(1)+2V_L(q*)−V_H(q*)=${num(z.separate)} 元；高类型拿走的信息租金为 V_H(q*)−V_L(q*)=${num(outcome.rent)} 元。`,
  `求出分离候选还不算完，必须与另外两种单档做法比总收入：只卖给爱喝豆浆的人收 V_H(1)=${num(z.high)} 元；同一桶两人都买收 2V_L(1)=${num(z.pool)} 元；两桶分卖收 ${num(z.separate)} 元。本例分卖最高，但换参数可能倒过来。`
 ];
 const changing=t>1e-9;
 return {phase,q,ml,mh,outcome,title:changing?'老太太正在调整豆浆菜单':titles[i],narration:changing?`小桶${num(q)}升、${num(ml)}元，大桶${num(mh)}元。两位顾客会把大小桶和不买都比较一遍，图上的结果随当前菜单重算。`:text[i]};
}
export function doubleMarginsM({a=1,b=1,c=0,k=2,wholesale=.5}={}){
 const m=linearM({a,b,c,k}),qd=clampM((a-c)/(4*b+k),0,m.choke),r=a-2*b*qd,retail=a-b*qd,chosenQ=clampM((a-wholesale)/(2*b),0,m.choke);
 return {m,direct:{q:m.qm,p:m.P(m.qm),profit:m.profit(m.qm)},chain:{q:qd,wholesale:r,retail,producer:r*qd-m.cost(qd),retailer:b*qd*qd},current:{q:chosenQ,wholesale,retail:m.P(chosenQ),producer:wholesale*chosenQ-m.cost(chosenQ),retailer:b*chosenQ*chosenQ}};
}
// The original 7.1(c) functions remain fixed as wholesale pricing changes.
export function doubleMarginsTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,anchors=[.5,.5,2/3,.8,2/3],w=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*t,direct=phase<1,r=doubleMarginsM({wholesale:w}),num=x=>Number(x.toFixed(4)),moving=t>1e-9&&!direct;
 const titles=['厂家直接卖，先算自己的利润','中间商按进货价决定卖多少','厂家找到最赚钱的批发价','批发价更高，销量会怎样？','回到最优，比较两种卖法'];
 const texts=[
  '厂家自己面对顾客：数量是1/4，零售价3/4，厂家利润1/8。先记住这个点，后面用同一张图比较。',
  '现在厂家每单位向中间商收1/2。中间商自己决定卖1/4，顾客付3/4；两层各有自己的收入和成本。',
  '厂家把批发价定为2/3，中间商选择卖1/6，顾客付5/6。厂家利润1/12，中间商利润1/36。',
  '批发价升到0.8，中间商只卖0.1，顾客价格升到0.9。厂家虽然每单位收得更多，总利润却降为0.07。',
  '回到批发价2/3：经过中间商，销量1/6，小于直接销售的1/4。这个数值例子和下方的一般证明要分开看。'
 ];
 const narration=moving?`批发价变为${num(w)}，中间商据此选择销量${num(r.current.q)}，顾客价格${num(r.current.retail)}；厂家利润${num(r.current.producer)}，中间商利润${num(r.current.retailer)}。`:texts[i];
 return {phase,direct,wholesale:direct?null:w,outcome:r,title:moving?'批发价变化，两层选择同步重算':titles[i],narration};
}
export function doubleDiscreteM(r=6,tie='two'){
 const retailer=[0,10-r,16-2*r],best=Math.max(...retailer),tied=retailer.flatMap((x,i)=>x>=best-tolM?[i]:[]),q=tie==='two'?Math.max(...tied):Math.min(...tied),retail=q===2?8:q===1?10:null;
 return {q,retail,retailer:best,producer:r*q,tied,direct:{q:2,p:8,profit:16},optimalWholesale:tie==='two'?6:null,maximumExists:tie==='two',producerSupremum:12};
}
// The wholesale price moves continuously; the retailer's discrete choice is
// always recomputed from its profits, including at the indifference point.
export function doubleDiscreteTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,anchors=[4,4,6,7,6],wholesale=anchors[i]+(anchors[Math.min(4,i+1)]-anchors[i])*t;
 const direct=phase<1,r=doubleDiscreteM(wholesale,'two'),num=x=>Number(x.toFixed(3)),moving=t>1e-9&&!direct;
 const titles=['厂家直接卖，怎样定价？','多了一位中间商','批发价到6元，出现平局','批发价再涨，少卖一件','回到6元，检查平局'];
 const texts=[
  '厂家自己卖：标价10元只卖一件，收入10元；标价8元能卖两件，收入16元。零成本下，8元比10元更赚钱。',
  '厂家先向中间商每件收4元。中间商卖一件的利润是10−4=6元；卖两件是16−8=8元，所以会卖两件。厂家收8元，中间商赚8元。',
  '批发价每件6元时，中间商卖一件和卖两件都赚4元。这里先假设平局时卖两件，厂家收到12元；如果选卖一件，厂家只收到6元。',
  '批发价升到7元，中间商卖一件赚3元，卖两件赚2元，于是只卖给愿付10元的顾客。厂家收入降为7元。',
  '回到6元：若平局选两件，厂家最多收12元；若平局选一件，厂家可以把批发价设得比6元略低，使收入无限接近12元，但不能真正达到12元。'
 ];
 const narration=moving?`批发价正在变为每件${num(wholesale)}元。中间商卖一件赚${num(10-wholesale)}元，卖两件赚${num(16-2*wholesale)}元；按当前利润比较，他选择卖${r.q}件。`:texts[i];
 return {phase,direct,wholesale:direct?null:wholesale,outcome:r,title:moving?'批发价改变，中间商重新比较':titles[i],narration};
}
export function taxDiscreteM(v=.6,t=.25){const solve=t=>{const profits=[0,1-t,2*(v-t)],best=Math.max(...profits),qs=profits.flatMap((x,i)=>x>=best-tolM?[i]:[]),q=Math.max(...qs);return {q,price:q===2?v:q===1?1:null,profit:best,qs}};const before=solve(0),after=solve(t);return {v,t,before,after,rise:after.price===null?null:after.price-before.price,overshift:after.price!==null&&after.price-before.price>t+tolM};}
// Tax moves continuously; the seller's discrete profit-maximizing choice is
// recomputed at each point, including switch and shutdown ties.
export function taxDiscreteTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),t=phase-i,anchors=[0,.1,.25,1.1,.25],tax=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*t,r=taxDiscreteM(.6,tax),num=x=>Number(x.toFixed(4)),moving=t>1e-9;
 const titles=['不收税时，阿姨卖给两人','税很小时，阿姨仍卖给两人','卖法改变，价格跳了上去','税太高，也可能停卖','回到例子：涨价为什么超过税？'];
 const texts=[
  '不收税时，标价0.6元卖给两人，利润1.2元；标价1元只卖给一人，利润1元。阿姨选择卖给两人。',
  '每杯税0.1元时，卖两人赚1元，只卖一人赚0.9元。阿姨仍标价0.6元，销量没有改变。',
  '每杯税0.25元时，卖两人只赚0.7元，只卖一人赚0.75元。阿姨改为标价1元、只卖一杯：顾客价上涨0.4元，比税0.25元还多。',
  '每杯税升到1.1元，卖一人或两人的利润都小于零，阿姨选择不卖；这时没有实际成交价格，不能继续计算价格涨幅。',
  '回到税0.25元：价格从0.6跳到1元，关键是阿姨换了服务对象。代入本例的需求和成本，比较税额与涨价幅度，就能看到超额转嫁。'
 ];
 const narration=moving?`每杯税正在变为${num(tax)}元：卖两人利润${num(2*(.6-tax))}元，只卖一人利润${num(1-tax)}元。阿姨${r.after.q?'选择卖'+r.after.q+'杯，顾客价'+num(r.after.price)+'元':'选择停卖，没有实际成交价'}。`:texts[i];
 return {phase,tax,outcome:r,title:moving?'税变化，卖家重新比较':titles[i],narration};
}
export function taxLinearM(a=10,b=1,c=2,t=2){const q0=Math.max(0,(a-c)/(2*b)),q=Math.max(0,(a-c-t)/(2*b));return {q0,q,p0:q0?(a+c)/2:null,p:q?(a+c+t)/2:null,rise:q?t/2:null,net:q?(a+c-t)/2:null,t};}
// Linear-tax story varies only the tax; every frame uses the existing model.
export function taxLinearTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),fraction=phase-i,anchors=[0,2,4,9,2],tax=anchors[i]+(anchors[Math.min(i+1,4)]-anchors[i])*fraction,r=taxLinearM(10,1,2,tax),n=x=>Number(x.toFixed(4));
 const titles=['先看没有税的豆浆摊','每杯征税2元，顾客价涨1元','税再加2元，价格再涨1元','税过高，阿姨不卖了','回看税由谁承担'];
 const texts=['没有税时，阿姨每杯成本2元。她算出最赚钱的销量是4杯，顾客每杯付6元。','每卖一杯要交2元税，阿姨每杯面临的成本加税变成4元。最优销量降到3杯，顾客价从6涨到7元，阿姨每杯税后留下5元。','税增至4元，最优销量降到2杯，顾客每杯付8元，比税前高2元；阿姨扣税后每杯留下4元，比税前少2元。','每杯税9元时，卖出一杯的成本加税已高于顾客最高愿付的10元；阿姨选择停卖。没有成交价，不能继续套用涨价一半。','回到税2元：顾客每杯多付1元，阿姨每杯税后少留1元。结论只针对税前税后都有正销量、线性需求和固定单位成本。'];
 const narration=fraction>1e-9?`每杯税正在变为${n(tax)}元，成本加税为${n(2+tax)}元。${r.q>0?`阿姨最优卖${n(r.q)}杯，顾客付${n(r.p)}元，卖家扣税后留${n(r.net)}元。`:'阿姨选择停卖，没有实际成交价。'}`:texts[i];
 return {phase,tax,outcome:r,title:fraction>1e-9?'税变化，重新计算最优选择':titles[i],narration};
}
export function fairnessM(a1=10,a2=6,q=3){const equal=Math.min(a2,(a1+a2)/4),profit=t=>(a1+a2)*t-2*t*t,current=clampM(q,0,a2);return {equal,qs:[equal,equal],prices:[a1-equal,a2-equal],cs:equal*equal/2,profit:profit(equal),current:{q:current,cs:current*current/2,profit:profit(current)},unrestricted:{qs:[a1/2,a2/2],prices:[a1/2,a2/2],cs:[a1*a1/8,a2*a2/8],profit:(a1*a1+a2*a2)/4}};}
// A source-specific story: the first transition is deliberately not yet fair.
export function fairnessTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),f=phase-i,a1=10,a2=6,points=[[5,3],[4,4],[3,3],[5,5],[4,4]],next=points[Math.min(i+1,4)],q1=points[i][0]+(next[0]-points[i][0])*f,q2=points[i][1]+(next[1]-points[i][1])*f,p1=a1-q1,p2=a2-q2,cs1=q1*q1/2,cs2=q2*q2/2,profit=p1*q1+p2*q2,optimal=fairnessM(a1,a2),n=x=>Number(x.toFixed(4));
 const title=['先看只追求利润','两个集市的顾客省下一样多','两边都少卖，利润怎样','两边都多卖，利润怎样','把公平约束和利润一起算'];
 const text=['只追求利润时，集市1卖5杯、价格5元，集市2卖3杯、价格3元。两边消费者剩余分别是12.5元和4.5元；总利润34元。','让两边各卖4杯，价格分别为6元和2元；每边消费者剩余都是8元，总利润32元。相等的是剩余，不是价格。','如果两边各卖3杯，消费者剩余仍然相等，但利润是30元，比各卖4杯少。','如果两边各卖5杯，消费者剩余仍相等，但利润是30元，也比各卖4杯少。','公平要求两边销量相同；在这条约束下比较利润，最优是各卖4杯、利润32元。和原来的34元相比少2元。'];
 const narration=f>1e-9?`现在集市1卖${n(q1)}杯、价格${n(p1)}元，顾客剩余${n(cs1)}元；集市2卖${n(q2)}杯、价格${n(p2)}元，顾客剩余${n(cs2)}元。${Math.abs(q1-q2)<1e-8?'两边剩余相等。':'两边剩余还不相等，正在向公平方案调整。'}利润是${n(profit)}元。`:text[i];
 return {phase,q1,q2,p1,p2,cs1,cs2,profit,optimal,title:f>1e-9?'两地销量与价格一起改变':title[i],narration};
}
export const discreteValuesM={discount:{H:[0,12,19],L:[0,10,13],label:'第二单位更便宜'},premium:{H:[0,8,20],L:[0,6,7],label:'第二单位更贵'}};
export function discreteMenuM(values=discreteValuesM.discount,options=[{q:1,m:10},{q:2,m:17}],tie='seller'){
 const H=choicesM(q=>values.H[q],options,tie),L=choicesM(q=>values.L[q],options,tie);return {H,L,profit:H.payment+L.payment,minProfit:H.minPayment+L.minPayment,maxProfit:H.maxPayment+L.maxPayment,options,values};
}
export function optimalDiscreteMenuM(values=discreteValuesM.discount){
 // Enumerate the vertices of the IR/IC payment polygon for every quantity
 // assignment. This covers continuous payments, not just an integer price grid.
 const rows=[];for(let qH=0;qH<=2;qH++)for(let qL=0;qL<=2;qL++){
  const constraints=[[1,0,values.H[qH]],[0,1,values.L[qL]],[1,-1,values.H[qH]-values.H[qL]],[-1,1,values.L[qL]-values.L[qH]],[-1,0,0],[0,-1,0]];
  for(let i=0;i<constraints.length;i++)for(let j=i+1;j<constraints.length;j++){const [a,b,c]=constraints[i],[d,e,f]=constraints[j],det=a*e-b*d;if(!det)continue;const mh=(c*e-b*f)/det,ml=(a*f-c*d)/det;if(constraints.every(([a,b,c])=>a*mh+b*ml<=c+tolM))rows.push({qH,qL,mh,ml,profit:mh+ml});}
 }const best=Math.max(...rows.map(r=>r.profit)),winners=rows.filter(r=>r.profit>=best-tolM);return {best,winners,rows};
}
// A single menu and both buyers' choices are recalculated at every frame.
export function nonlinearTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),f=phase-i,mix=i===1?f:i>=2?1:0,values={H:[0,12-4*mix,19+mix],L:[0,10-4*mix,13-6*mix]},first=10-4*mix,second=i===0?9-2*f:i===1?7+5*f:i===2?12+2*f:i===3?14-2*f:12,options=[{q:1,m:first},{q:2,m:first+second}],outcome=discreteMenuM(values,options,'seller'),opt=optimalDiscreteMenuM(values),n=x=>Number(x.toFixed(3));
 const titles=['第一杯10元，第二杯加9元','把第二杯降到7元','换一组顾客，第二杯可以更贵','第二杯再涨，会有人改选','回到第二种最优菜单'];
 const texts=['第一组顾客：爱喝者对一杯、两杯的总估值是12、19元；另一位是10、13元。第一杯10元、第二杯加9元时，两人都只买一杯，收入20元。','第二杯加7元时，爱喝者买一杯和两杯的净好处都是2元；另一位买一杯和不买都得0。假设无差异时选对卖家收入较高的选项，两人分别买两杯和一杯，收入27元。','换成第二组顾客：爱喝者对一杯、两杯的总估值为8、20元，另一位为6、7元。第一杯6元、第二杯加12元，两人分别买两杯和一杯，收入24元。','第二杯加14元时，爱喝者更愿意只买一杯；另一位也买一杯，总收入12元。把新价格乘上新销量，再比较收入。','回到第一杯6元、第二杯加12元，假设无差异时选对卖家有利的方案，两人的选择让阿姨收入24元。这一组的最优第二杯反而更贵。'];
 const changing=f>1e-9,bridge=i===1&&changing,phrase=bridge?'现在只是在两组自主构造的顾客之间过渡，不是说价格变化会改变顾客偏好。':'两位顾客都重新比较不买、一杯和两杯的净好处。',title=changing?(bridge?'换一组顾客，重新比较':'菜单改变，顾客重新选择'):titles[i];
 const narration=changing?`第一杯${n(first)}元，第二杯追加${n(second)}元，两杯总价${n(first+second)}元。${phrase}阿姨当前收入${n(outcome.profit)}元。`:texts[i];
 return {phase,values,first,second,options,outcome,opt,title,narration,bridge};
}
export function uniformDiscreteM(values=discreteValuesM.discount,p=7){const solve=p=>{const options=[{q:1,m:p},{q:2,m:2*p}],r=discreteMenuM(values,options);return {...r,p}};
 const candidates=new Set([0]);for(const V of [values.H,values.L]){candidates.add(V[1]);candidates.add(V[2]/2);candidates.add(V[2]-V[1])}const results=[...candidates].filter(p=>p>=0).map(solve),best=results.reduce((a,b)=>a.profit>=b.profit?a:b);
 return {current:solve(p),best,candidates:results};
}
export function singleOptionM(values=discreteValuesM.discount){const rows=[];for(const q of [1,2])for(const price of [values.H[q],values.L[q]]){const out=discreteMenuM(values,[{q,m:price}]);rows.push({q,m:price,profit:out.profit})}return {...rows.reduce((a,b)=>a.profit>=b.profit?a:b),candidates:rows};}
// Exercise 7.7: switches in available tools and tie rules are discrete;
// prices within each tool change continuously and choices are recalculated.
export function discreteTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,6),i=Math.floor(phase),f=phase-i,values=discreteValuesM.discount;
 const mode=i<2?'uniform':i<4?'single':'menu',tie=i===5?'buyer':'seller';
 const price=mode==='uniform'?(i===0?10-3*f:7):mode==='single'?(i===2?16-3*f:13):null;
 const options=mode==='uniform'?[{q:1,m:price},{q:2,m:2*price}]:mode==='single'?[{q:2,m:price}]:[{q:1,m:10},{q:2,m:17}];
 const outcome=discreteMenuM(values,options,tie),n=x=>Number(x.toFixed(3));
 const titles=['先看统一单价','统一价降到7元','换成只卖两杯套餐','两杯套餐降到13元','两项菜单让顾客自选','换个平局规则','回到卖家有利的平局规则'];
 const texts=['每杯10元时，两位顾客各买一杯，阿姨收20元。','每杯7元时，爱喝者买一杯和两杯都得到5元净好处；按卖家有利的平局约定，他买两杯，另一位买一杯，共收21元。','现在只提供两杯16元的套餐，一杯不单卖。爱喝者买，另一位不买，收入16元。','两杯13元时，另一位买与不买都得0；按卖家有利的平局约定，两人各买两杯，共收26元。','菜单是一杯10元或两杯17元。按卖家有利的平局约定，爱喝者买两杯，另一位买一杯，收入27元。','菜单没有变，但无差异时改选支付较少的方案：爱喝者买一杯，另一位不买，收入10元。','仍是同一张菜单，改回无差异时选支付较多的方案，收入又是27元。'];
 const narration=f>1e-9&&i===0?`统一单价正在降到7元，目前每杯${n(price)}元。两位顾客各自比较不买、一杯和两杯，当前收入${n(outcome.profit)}元。`:f>1e-9&&i===2?`只提供两杯套餐，价格正在降到13元，目前${n(price)}元；一杯不单卖。两人重新比较，当前收入${n(outcome.profit)}元。`:texts[i];
 return {phase,values,mode,tie,price,options,outcome,title:titles[i],narration};
}
export function bundlingM(mode='bundle'){
 const values=mode==='bundle'?[[10,1],[1,10]]:[[10,1],[10,10]],bestPrice=vs=>[...new Set([0,...vs])].map(p=>({p,quantity:vs.filter(v=>v>=p).length,revenue:p*vs.filter(v=>v>=p).length})).reduce((a,b)=>a.revenue>=b.revenue?a:b),A=bestPrice(values.map(v=>v[0])),B=bestPrice(values.map(v=>v[1])),bundle=bestPrice(values.map(v=>v[0]+v[1]));return {values,A,B,bundle,separate:A.revenue+B.revenue};
}
// Compare separate sales and pure bundles for the same buyers at every frame.
export function bundlingTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),f=phase-i,mix=i===1?f:i>=2?1:0,values=[[10,1],[1+9*mix,10]],bundlePrice=i===0?9+2*f:i===1?11:i===2?11+9*f:i===3?20-9*f:11;
 const bestPrice=vs=>[...new Set([0,...vs])].map(p=>({p,quantity:vs.filter(v=>v>=p).length,revenue:p*vs.filter(v=>v>=p).length})).reduce((a,b)=>a.revenue>=b.revenue?a:b),A=bestPrice(values.map(x=>x[0])),B=bestPrice(values.map(x=>x[1])),bundle=bestPrice(values.map(x=>x[0]+x[1])),separate=values.map(x=>({A:x[0]>=A.p,B:x[1]>=B.p})),bundleBuy=values.map(x=>x[0]+x[1]>=bundlePrice),bundleRevenue=bundlePrice*bundleBuy.filter(Boolean).length,separateRevenue=A.revenue+B.revenue,n=x=>Number(x.toFixed(3));
 const titles=['两样早餐分卖，套餐先标9元','套餐11元，两位都买','换一组顾客，分卖更好','套餐涨价，只剩一人','回到最优比较'];
 const texts=['第一组：顾客1对豆浆和包子分别愿付10和1元，顾客2分别愿付1和10元。分开卖各标10元，共收20元；套餐先标9元，两人都买，收18元。','把套餐价升到11元，两位顾客各自的整包估值都是11元；假设价格等于估值时购买，两人都买，套餐收入22元，高于分卖最优的20元。','换第二组：顾客1估值仍为10和1元，顾客2变为10和10元。分卖时豆浆10元卖两份、包子10元卖一份，共30元；最佳纯套餐收入22元。','若套餐标20元，只有第二位顾客购买，套餐收入20元；分卖最优仍是30元。不能只看较高的套餐单价，还要数清买家。','回到套餐11元：两人都买，套餐收入22元；分卖最优收入30元。两组顾客的估值结构不同，所以两种卖法各有可能更好。'];
 const changing=f>1e-9,bridge=i===1&&changing,title=changing?(bridge?'换一组顾客，再比较两种卖法':'套餐价格变化，顾客重新选择'):titles[i],narration=changing?`当前豆浆单价${n(A.p)}元、包子单价${n(B.p)}元，分别出售收入${n(separateRevenue)}元；套餐价${n(bundlePrice)}元，有${bundleBuy.filter(Boolean).length}人买，收入${n(bundleRevenue)}元。${bridge?'现在是在对照两组不同估值，不是价格改变了顾客偏好。':'两种售卖方式分别比较，并未同时提供单品与套餐。'}`:texts[i];
 return {phase,values,A,B,bundle,separate,bundleBuy,bundlePrice,bundleRevenue,separateRevenue,title,narration,bridge};
}
export function twoPartM(m,p=m.MC(m.qc),feeFactor=1){const q=clampM((m.a-p)/m.b,0,m.choke),surplus=m.W(q)-p*q,A=feeFactor*surplus,accepted=q>0&&surplus-A>=-tolM,actual=accepted?q:0;return {p,A,q:actual,demandBeforeFee:q,surplus,accepted,consumerUtility:accepted?surplus-A:0,profit:accepted?A+p*q-m.cost(q):0,efficient:{q:m.qc,p:m.MC(m.qc),A:m.b*m.qc*m.qc/2,profit:m.TS(m.qc)}};}

// Fee and per-unit price follow one timeline; participation is solved afresh.
export function twoPartTeachingM(step=0){
 const phase=clampM(Number(step)||0,0,4),i=Math.floor(phase),f=phase-i,m=linearM({a:10,b:1,c:2,k:.5}),prices=[7,7,7,7,14/3],factors=[0,1,1.2,1,1],p=prices[i]+(prices[Math.min(i+1,4)]-prices[i])*f,factor=factors[i]+(factors[Math.min(i+1,4)]-factors[i])*f,r=twoPartM(m,p,factor),n=x=>Number(x.toFixed(3));
 const titles=['先不收入场费','把入场费提到顾客刚好愿意接受','再加一点，顾客不进店','把入场费调回参与上限','再调整每杯价格，找到最优数量'];
 const texts=['每杯标7元，不收入场费。顾客按杯价愿意买3杯，购买前后的净好处是4.5元；阿姨收入扣成本后利润12.75元。','入场费提高到4.5元，顾客买3杯所得的剩余恰好被入场费抵消。这里约定净好处为零时仍进店，阿姨利润增至17.25元。','入场费提高到5.4元，超过顾客按杯价购买前可获得的4.5元剩余；他选择不进店，实际销量和阿姨利润都为0。','回到入场费4.5元，顾客刚好愿意进店并买3杯；这个约定让阿姨能把剩余全部作为入场费。','把每杯价格调到约4.667元，并把入场费同步设为顾客买前剩余约14.222元。顾客买约5.333杯；此时愿付价等于边际成本，阿姨利润约21.333元。'];
 const changing=f>1e-9,adjustPrice=i===3&&changing,title=changing?(adjustPrice?'同时调整杯价与参与上限':'入场费变化，顾客重新选择'):titles[i],narration=changing?`每杯标价${n(p)}元，入场费标价${n(r.A)}元；若参加，顾客会买${n(r.demandBeforeFee)}杯，入场前剩余${n(r.surplus)}元。${r.accepted?'按约定顾客参加，实际购买'+n(r.q)+'杯，':'入场费超过剩余，顾客不参加，实际不买，'}阿姨利润${n(r.profit)}元。${adjustPrice?'杯价变化时，入场费同时调整为剩余上限。':''}`:texts[i];
 return {phase,m,p,factor,r,title,narration,adjustPrice};
}

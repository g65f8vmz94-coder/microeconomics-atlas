// Chapter 11, Osborne–Rubinstein, printed pp. 157–173.
// Each named case is tied to a textbook definition, result, example, or problem.
export const casesBySection={
 '11.1':['d111','d112','e111','q111','q112','q113','p1','p2','p3a','p3b','p4','p5','p6'],
 '11.2':['d113','d114','q114','q115','q116','e112','p7a','p7b','p8','p9a','p9b','p10a','p10b']
};
export const cases={
 d111:{label:'定义11.1 不可分商品与估值',page:158,kind:'market',note:'一人至多持有一件，货币可分；原模型要求潜在买者有足够现金。'},
 d112:{label:'定义11.2 价格均衡与无差异',page:159,kind:'market',note:'价格给定时每人最优选择；无差异者可选择买卖或保留；总持有量必须等于供给。'},
 e111:{label:'例11.1 14张票与17位买者',page:160,kind:'tickets',note:'唯一均衡价格100，但只能从17位无差异买者中选14位成交。'},
 q111:{label:'命题11.1 均衡价格区间',page:160,kind:'market',note:'估值从高到低排序，s件物品的价格恰在第s+1与第s个估值之间。'},
 q112:{label:'命题11.2 帕累托稳定与现金',page:162,kind:'pareto',note:'判别式含未持有者手中的现金；估值更高不一定能作可行的帕累托改进。'},
 q113:{label:'命题11.3 核心与共同价格',page:163,kind:'core',note:'交易双方支付额不一致时，某买卖配对可以携初始资源退出并同时改进。'},
 p1:{label:'习题11.1 均衡使总效用最大',page:171,kind:'welfare',note:'拟线性效用相加后，货币总额固定，只需把物品分给最高估值者。'},
 p2:{label:'习题11.2 买者现金不足',page:171,kind:'cash',note:'原书五人数据：现金不足使均衡价变成(5,6]，不能直接套无约束排序公式。'},
 p3a:{label:'习题11.3(a) 估值上升',page:171,kind:'comparative',note:'将某人估值提高，新均衡价格的下界不低于旧唯一价格。'},
 p3b:{label:'习题11.3(b) 增加买者或卖者',page:171,kind:'entry',note:'增加买者不降价，增加卖者不涨价；图中同时标出区间端点。'},
 p4:{label:'习题11.4 唯一价假设与虚报：条件校准',page:171,kind:'manipulation',note:'按定义11.1—11.2，原均衡价格唯一时，任一人仅改变自己的估值报告不能严格获利。一般证明与删去唯一性后的获利对照分别给出；不把价格选择唯一误作均衡价格唯一。'},
 p5:{label:'习题11.5 进场交易成本',page:172,kind:'cost',note:'卖者有效估值v+c，买者有效估值v−c；在场不成交仍损失c。'},
 p6:{label:'习题11.6 付钱让对手退出',page:172,kind:'exit',note:'补偿对手退出可降低买方竞争与选定均衡价格；示例依赖均衡价格的选择。'},
 d113:{label:'定义11.3 两种状态的或有支付',page:165,kind:'states',note:'两种“商品”是分别在状态1或状态2发生时支付1单位的钱。'},
 d114:{label:'定义11.4 状态价格的竞争均衡',page:166,kind:'states',note:'给定状态价格，每人按期望效用最优选择，且两种状态分别资源守恒。'},
 q114:{label:'命题11.4 互保与确定结果',page:166,kind:'pool',note:'共同概率、严格凹效用与两状态总财富相同，才得到完全保险和价格比等于概率比。'},
 q115:{label:'命题11.5 总量灾难无法互保消除',page:167,kind:'disaster',note:'状态1总财富更少时，其相对价格高于概率比，每人最终在灾难状态消费更少。'},
 q116:{label:'命题11.6 保险人资本门槛',page:168,kind:'insurer',note:'风险中性保险人资本充足才完全保险；资本不足时理赔资源用尽。'},
 e112:{label:'例11.2 不同信念下的交易',page:170,kind:'belief',note:'两人风险中性、初始各(1,1)；价格反映边际买卖一方的信念。'},
 p7a:{label:'习题11.7(a) 相同信念',page:172,kind:'beliefRisk',note:'相同严格凹效用与相同信念下，两人维持(100,100)，状态价格比等于概率比。'},
 p7b:{label:'习题11.7(b) 不同信念',page:172,kind:'beliefRisk',note:'用对数效用构造严格风险厌恶例子：更看好黄队的1号买入更多黄队赢时支付的票。'},
 p8:{label:'习题11.8 演出取消与门票',page:173,kind:'show',note:'门票不退款，但观看效用仅在演出举行时获得；个人货币估值为10tᵢ。'},
 p9a:{label:'习题11.9(a) 对赌配对',page:173,kind:'bets',note:'一个A赌注与一个B赌注合计收1、必有一个支付1；配对人数相等可使做市方无状态风险。'},
 p9b:{label:'习题11.9(b) 八人的均衡价',page:173,kind:'bets',note:'八个原题信念排序后，A赌注恰有4人时的价格区间为[0.6,0.7]。'},
 p10a:{label:'习题11.10(a) 两期代际交易',page:173,kind:'time',note:'共同严格凹效用与时间权重δ<1：两期价格比1/δ，先持有第1期钱的一代更富。'},
 p10b:{label:'习题11.10(b) 平方根计算',page:173,kind:'time',note:'u(x)=√x时也可直接计算：第一代两期各1/(1+δ)，第二代各δ/(1+δ)。'}
};
export const basePeople=[
 {id:'卖者S₀',v:0,own:1,cash:0},{id:'卖者S₆',v:6,own:1,cash:0},
 {id:'买者B₄',v:4,own:0,cash:20},{id:'买者B₁₀',v:10,own:0,cash:20}
];
export const cashPeople=[
 {id:'1',v:2,cash:13,own:0},{id:'2',v:10,cash:6,own:0},{id:'3',v:8,cash:5,own:0},
 {id:'4',v:4,cash:2,own:1},{id:'5',v:6,cash:10,own:1}
];
export function market(people,price=5,cashBound=false){
 if(!Number.isFinite(price)||price<0)throw Error('price must be nonnegative');
 const p=price,eps=1e-9,s=people.reduce((a,x)=>a+x.own,0);
 const sorted=[...people].sort((a,b)=>b.v-a.v||b.own-a.own||String(a.id).localeCompare(String(b.id)));
 const lo=sorted[s]?.v??0,hi=sorted[s-1]?.v??0;
 const mandatory=[],optional=[],excluded=[];
 for(const x of people){const affordable=x.own||!cashBound||x.cash+eps>=p;
  if(!affordable||x.v<p-eps)excluded.push(x);else if(x.v>p+eps)mandatory.push(x);else optional.push(x)}
 const equilibrium=mandatory.length<=s&&s<=mandatory.length+optional.length;
 const selected=new Set([...mandatory,...optional.sort((a,b)=>b.own-a.own||String(a.id).localeCompare(String(b.id)))].slice(0,s).map(x=>x.id));
 const allocation=people.map(x=>{const has=selected.has(x.id)?1:0,money=x.cash+p*(x.own-has);return{...x,has,money,gain:(x.v-p)*(has-x.own),utility:money+x.v*has}});
 return{people,sorted,s,lo,hi,price:p,mandatory:mandatory.length,optional:optional.length,equilibrium,allocation,trades:allocation.filter(x=>!x.own&&x.has).length,totalValue:allocation.reduce((z,x)=>z+x.v*x.has,0)};
}
export const manipulationPeople=[{id:'S₀',v:0,own:1,cash:0},{id:'S₅',v:5,own:1,cash:0},{id:'B₅',v:5,own:0,cash:20},{id:'B₁₀',v:10,own:0,cash:20}];
export function valuationManipulation(people=manipulationPeople,actor=0,report=8){
 if(!Number.isFinite(report)||report<0||!people[actor])throw RangeError('nonnegative report and existing actor required');
 if(!people[actor].own&&report>people[actor].cash)throw RangeError('reported economy must satisfy buyer cash assumption');
 const oldRange=market(people,0),oldPrice=(oldRange.lo+oldRange.hi)/2,before=market(people,oldPrice),reported=people.map((p,i)=>i===actor?{...p,v:report}:{...p}),range=market(reported,0),price=(range.lo+range.hi)/2,after=market(reported,price),real=people[actor],old=before.allocation[actor],now=after.allocation[actor],trueBefore=old.money+real.v*old.has,trueAfter=now.money+real.v*now.has;
 return{people,actor,report,reported,before,after,oldPrice,price,uniqueOriginal:Math.abs(oldRange.hi-oldRange.lo)<1e-9,trueBefore,trueAfter,gain:trueAfter-trueBefore,oldHighCount:people.filter(p=>p.v>=oldPrice-1e-9).length,oldStrictHighCount:people.filter(p=>p.v>oldPrice+1e-9).length};
}
export function pareto(cash=2){const holder=4,buyer=8,offer=(holder+Math.min(buyer,cash))/2,possible=holder<Math.min(buyer,cash)-1e-9;return{holder,buyer,cash,possible,offer:possible?offer:null,criterion:holder>=Math.min(buyer,cash)-1e-9}}
export function pooled(pi=.4,shock=1){const e=[[8*shock,2],[2*shock,8]],c1=10*shock,c2=10,priceRatio=pi*c2/((1-pi)*c1),a=e.map(x=>{const w=priceRatio*x[0]+x[1];return[pi*w/priceRatio,(1-pi)*w]});return{e,a,pi,c1,c2,priceRatio,fairRatio:pi/(1-pi)}}
export function insurer(pi=.4,capital=1,m=3){const fair=pi/(1-pi),threshold=m*(1-pi);let p,x1,x2,insurerBundle;if(capital>=threshold){p=fair;x1=1-pi;x2=1-pi;insurerBundle=[capital-m*x1,capital+m*(1-x2)]}else{x1=capital/m;const f=q=>{const z=1-q*x1;return q-fair*Math.sqrt(Math.max(0,z/x1))};let l=fair,h=1/x1;for(let k=0;k<80;k++){const mid=(l+h)/2;if(f(mid)<0)l=mid;else h=mid}p=(l+h)/2;x2=1-p*x1;insurerBundle=[0,capital+m*(1-x2)]}return{pi,capital,m,threshold,p,fair,x1,x2,insurerBundle,full:Math.abs(x1-x2)<1e-8}}
export function beliefs(t=.8,s=.6){if(!(0<s&&s<t&&t<1))throw Error('require 0<s<t<1');const q=Math.min(t,Math.max(s,.5));let high,low;if(s>.5){high=[1/s,0];low=[2-1/s,2]}else if(t<.5){high=[2,2-1/(1-t)];low=[0,1/(1-t)]}else{high=[2,0];low=[0,2]}return{t,s,q,high,low}}
export function beliefRisk(t=.7,s=.3){if(!(0<s&&s<=t&&t<1))throw Error('require 0<s<=t<1');const q=(t+s)/2;return{t,s,q,one:[100*t/q,100*(1-t)/(1-q)],two:[100*s/q,100*(1-s)/(1-q)]}}
export function timeEconomy(delta=.6){return{delta,priceRatio:1/delta,first:1/(1+delta),second:delta/(1+delta)}}
export const bets=[.95,.9,.8,.7,.6,.4,.1,0];
export function betMarket(price=.65,values=bets){const eps=1e-9,strict=values.filter(v=>v>price+eps).length,ties=values.filter(v=>Math.abs(v-price)<=eps).length,n=values.length/2;return{price,strict,ties,n,equilibrium:strict<=n&&n<=strict+ties,interval:[values[n],values[n-1]]}}

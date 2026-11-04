import {total,clamp,indivisible,insurance,production,labor,bank,lemons,fishing,wages,signaling} from './markets.mjs';
const $=id=>document.getElementById(id),meta=window.LESSON,key=meta.engine;
const C={g:'#177468',r:'#c35f43',p:'#7a6594',i:'#213d37',m:'#9baa9b',grid:'#dce1d5'};
const f=x=>typeof x==='number'?(Math.abs(x)<1e-8?'0':x.toLocaleString('zh-CN',{maximumFractionDigits:3})):x;
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),S=(k,label,options,value)=>({k,label,options,value});
let spec=[],state={},timer=null,last={};
if(key==='indivisible')spec=[S('case','市场情境',{four:'四人交易 · 课本导入',tickets:'14张票，17位买家',noTrade:'卖家估值全都较高'},'four'),R('buyer','B2的估值',0,14,.5,10),R('price','尝试价格',0,14,.5,5)];
if(key==='insurance')spec=[S('mode','不确定性情境',{pool:'总财富不变 · 互相保险',aggregate:'灾难减少总财富',insurer:'风险中性保险人与3位投保人',belief:'风险中性者的不同信念'},'pool'),R('pi','状态1概率 / 甲的信念',.1,.9,.05,.4),R('shock','灾难后总财富比例',.15,1,.05,.5),R('capital','保险人的初始资本',.1,4,.1,1),R('belief','乙对状态1的信念',.1,.9,.05,.7),R('progress','从禀赋到均衡的交易比例',0,1,.05,0)];
if(key==='production-economy')spec=[R('A','商品1生产边界截距',3,12,.5,8),R('B','商品2生产边界截距',3,12,.5,6),R('share','甲的所有权份额',.1,.9,.05,.5),R('alpha','甲在商品1的支出份额',.15,.85,.05,.7),R('beta','乙在商品1的支出份额',.15,.85,.05,.3),R('mult','尝试价格 / 均衡价格',.5,1.5,.05,.7)];
if(key==='labor')spec=[R('A','技术系数 A',2,10,.5,5),R('beta','工人对闲暇的效用份额 β',.15,.85,.05,.4),R('mult','尝试工资 / 均衡工资',.5,1.6,.05,.7)];
if(key==='bank')spec=[R('a','左网点单位客流等待系数',.2,5,.2,1),R('b','右网点单位客流等待系数',.2,5,.2,2),R('z','假设去左网点的居民比例',0,1,.001,.3),S('view','观察方式',{cost:'个人选择与预期一致',fixed:'均衡分界的唯一交点'},'cost')];
if(key==='lemons')spec=[S('case','六辆车的质量分布',{gap:'低质量与高质量之间有断层',even:'质量均匀分布',tiny:'最低质量很低'},'gap'),R('alpha','买方相对卖方的估值倍数 α',1.05,3,.05,1.5),R('m','尝试交易的最低质量车数',1,6,1,3),S('mode','交易情境',{trade:'候选正交易均衡',none:'悲观信念下无人交易'},'trade')];
if(key==='fishing')spec=[R('v','每单位鱼的消费者价值 v',2,8,.5,6),R('k','成本斜率 k',.85,2,.05,1),S('mode','比较情境',{equilibrium:'无税竞争均衡',pareto:'减产并协商新价格',tax:'单位税与税收返还'},'equilibrium'),R('fraction','协商产量 / 原均衡产量',.1,.95,.05,.5),R('tax','单位税 / 消费者价值',0,.9,.05,.5),S('rebate','税款分配',{yes:'向10位消费者和5位渔民等额返还',no:'暂不返还，列为公共税收'},'yes')];
if(key==='contracts')spec=[R('v','所有工人的生产率',2,12,.5,8),R('w','当前唯一工资报价',0,14,.5,5),R('entry','新进入者的工资报价',0,14,.5,6)];
if(key==='signaling')spec=[S('menu','当前合同集合',{separate:'候选分离合同',pool:'零教育的混同合同'},'separate'),R('low','低类型在总体中的比例',.05,.95,.05,.5),R('bH','高类型单位教育成本',.3,2.7,.1,1),R('t','新合同要求的教育量 t',0,4,.05,1),R('w','新合同支付的工资 w',0,12,.1,6)];
spec.forEach(c=>state[c.k]=c.value);
$('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label}<output id="out-${c.k}"></output></label><input id="${c.k}" data-key="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');
function txt(x,y,t,color=C.i,size=13,anchor='middle'){const scale=Math.min(1.8,Math.max(1,560/Math.max(280,$('plot').clientWidth)));return `<text x="${x}" y="${y}" fill="${color}" font-size="${size*scale}" text-anchor="${anchor}">${t}</text>`}
function dot(x,y,color,id){return `<circle data-motion="${id}" cx="${x}" cy="${y}" r="6" fill="${color}" stroke="#fffdf7" stroke-width="2"/>`}
function chart(xmax,ymax,xlabel,ylabel,xticks=null){
 const X=x=>60+480*x/xmax,Y=y=>300-245*y/ymax;
 let svg='';for(let i=0;i<=4;i++){const y=ymax*i/4;svg+=`<path d="M60 ${Y(y)}H540" stroke="${C.grid}" fill="none"/>`+txt(48,Y(y)+5,f(y),C.m,11,'end')}
 for(const x of xticks||[0,1,2,3,4].map(i=>xmax*i/4))svg+=`<path d="M${X(x)} 55V300" stroke="${C.grid}" fill="none"/>`+txt(X(x),328,f(x),C.m,11);
 svg+=`<path d="M60 42V300H556" fill="none" stroke="${C.m}"/>`+txt(540,367,xlabel,C.i,12,'end')+txt(60,26,ylabel,C.i,12,'start');
 const line=(a,b,color,dash='')=>`<path d="M${X(a[0])} ${Y(a[1])}L${X(b[0])} ${Y(b[1])}" stroke="${color}" stroke-width="2" fill="none" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
 const curve=(fn,color,end=xmax)=>`<path d="${Array.from({length:101},(_,i)=>{const x=end*i/100;return `${i?'L':'M'}${X(x)},${Y(fn(x))}`}).join(' ')}" stroke="${color}" stroke-width="2.5" fill="none"/>`;
 return {X,Y,svg,line,curve};
}
function bars(labels,series,max){const low=Math.min(0,...series.flatMap(s=>s.values)),hi=max||Math.max(1,...series.flatMap(s=>s.values))*1.2,Y=x=>280-(x-low)/(hi-low)*225,group=480/labels.length,w=Math.min(55,group/(series.length+1));let out=`<path d="M50 ${Y(0)}H550" stroke="${C.m}"/>`;
 labels.forEach((label,i)=>{const center=60+group*(i+.5);series.forEach((s,j)=>{const x=center+(j-(series.length-1)/2)*w-w*.43,y=Y(s.values[i]),zero=Y(0);out+=`<rect data-motion="bar-${s.name}-${i}" x="${x}" y="${Math.min(y,zero)}" width="${w*.86}" height="${Math.max(.1,Math.abs(zero-y))}" fill="${s.color}" rx="3"/>`+txt(x+w*.43,s.values[i]>=0?y-10:y+25,f(s.values[i]),s.color,12)});out+=txt(center,330,label,C.i,12)});return out}
const table=(heads,rows)=>`<table><thead><tr>${heads.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function disable(k,b){if($(k))$(k).disabled=b}
function render(){
 let svg='',metrics=[],reading='',formula='',extra='',legend='',boundary=meta.boundary;const s=state;
 if(key==='indivisible'){
  const c=spec.find(x=>x.k==='price');c.max=s.case==='tickets'?120:14;c.step=s.case==='tickets'?5:.5;$('price').max=c.max;$('price').step=c.step;s.price=Math.min(s.price,c.max);disable('buyer',s.case!=='four');
  const r=indivisible(s.case,s.buyer,s.price),max=s.case==='tickets'?120:16,cs=chart(r.people.length+1,max,'估值由高到低的个人','估值 / 价格',s.case==='tickets'?[1,7,14,21,31]:[1,2,3,4]);svg=cs.svg;
  svg+=`<rect x="60" y="${cs.Y(r.hi)}" width="480" height="${Math.max(2,cs.Y(r.lo)-cs.Y(r.hi))}" fill="${C.g}" opacity=".12"/>`;
  r.sorted.forEach((p,i)=>{svg+=dot(cs.X(i+1),cs.Y(p.v),p.own?C.p:C.g,p.id)});
  svg+=cs.line([0,s.price],[r.people.length+1,s.price],C.r)+cs.line([r.s+.5,0],[r.s+.5,max],C.m,'5 5');
  metrics=[['均衡价格区间',`[${f(r.lo)}, ${f(r.hi)}]`],['尝试价格是否可出清',r.equilibrium?'可以':'不可以'],['必须持有 / 最多可持有',`${r.strict} / ${r.weak}`],['已有物品总数',r.s]];
  reading=r.equilibrium?'当前价格允许出清。边界上估值恰等于价格的人无差异，需要选择合适的持有者；不能把所有无差异买家都强制算作购买。':'当前价格不能出清。即使把物品分给估值最高的人，仍会有人不愿接受这套配置。移动价格进入绿色区间，再检查个人最优。';
  formula='按估值排序 v₁ ≥ … ≥ vₙ；s件物品的均衡价格满足 vₛ₊₁ ≤ p ≤ vₛ';legend='绿色点：原买方　紫色点：原卖方　红线：尝试价格　虚线：前s人的界线';
  extra=table(['个人','估值','初始持有','分给前s人后','货币净流入','效用变化'],r.allocation.map(x=>[x.id,x.v,x.own,x.has,x.money,x.gain]))+'<p>表格始终展示“给前s人”的可行分配；仅当当前价格在均衡区间中，它才同时满足每个人最优。买方有足够现金，无并列时持有者唯一，价格仍可能不唯一。</p>';last=r;
 }else if(key==='insurance'){
  disable('shock',s.mode!=='aggregate');disable('capital',s.mode!=='insurer');disable('belief',s.mode!=='belief');
  const r=insurance(s.mode,s.pi,s.shock,s.capital,s.belief,s.progress);svg=bars(r.names,[{name:'state1',values:r.shown.map(x=>x[0]),color:C.r},{name:'state2',values:r.shown.map(x=>x[1]),color:C.g}]);
  metrics=[['状态价格比 p₁/p₂',r.p],['概率比 π/(1−π)',r.fair],['交易进度',f(s.progress*100)+'%'],['终点是否完全保险',Math.abs(r.a[0][0]-r.a[0][1])<1e-7?'第一位完全保险':'第一位仍有状态差异']];
  reading={pool:'总财富在两种状态都为10。互相承担风险后，每人的两根柱子重合；共同信念、严格风险厌恶和总财富不变共同支撑完全保险。',aggregate:'灾难毁掉的是总财富。交换只能重新分担风险，不能创造已经消失的资源；灾难状态的支付更稀缺，状态价格比高于概率比。',insurer:'保险人的资本能否覆盖灾难赔付，决定了能否完全保险。资本不足时保险人在状态1恰好用尽资源，投保人保留部分风险。',belief:'两人看待同一事件的概率不同。这里是风险中性者的投机交易，各自认为自己占优；两根柱子的差距不等于“客观收益增加”。'}[s.mode];
  formula=s.mode==='insurer'?'πu′(x₁) / [(1−π)u′(x₂)] = p₁/p₂；资本充足条件：α ≥ 3(1−π)':'预算：p₁x₁+p₂x₂=p₁e₁+p₂e₂；逐状态资源守恒';legend='红色：状态1的支付　绿色：状态2的支付（同一次未来只实现一种状态）';
  extra=table(['个体','初始(状态1,状态2)','当前(状态1,状态2)','初始期望效用','当前期望效用'],r.names.map((n,i)=>[n,r.e[i].map(f).join(' / '),r.shown[i].map(f).join(' / '),r.eu0[i],r.eu[i]]))+`<p>${r.note} 中间进度是沿预算线的交易插值，不宣称是一条价格调整过程。</p>`;last=r;
 }else if(key==='production-economy'){
  const eq=production(1,s.A,s.B,s.share,s.alpha,s.beta).eq,r=production(eq*s.mult,s.A,s.B,s.share,s.alpha,s.beta),p=eq*s.mult,cs=chart(s.A*1.55,s.B*1.55,'商品1','商品2');svg=cs.svg+cs.curve(x=>s.B*Math.sqrt(Math.max(0,1-(x/s.A)**2)),C.g,s.A);
  const end=Math.min(s.A*1.55,r.profit/p),start=Math.max(0,(r.profit-s.B*1.55)/p);svg+=cs.line([start,r.profit-p*start],[end,r.profit-p*end],C.m,'5 5');
  svg+=dot(cs.X(r.supply[0]),cs.Y(r.supply[1]),C.g,'supply')+dot(cs.X(r.demand[0]),cs.Y(r.demand[1]),C.r,'demand');
  metrics=[['尝试价格 p₁/p₂',p],['出清价格',r.eq],['商品1超额需求',r.excess[0]],['生产者利润',r.profit]];
  reading=Math.abs(r.excess[0])<1e-7?'绿色生产点与红色总需求点重合。生产者利润最大、两位消费者各自最优、总供需一致，三项条件同时成立。':'生产者和消费者都在给定价格下作最优选择，但总需求与生产仍不一致。把价格倍数调到1，观察两点汇合；个体最优本身不保证市场出清。';
  formula='技术：y₁²/A²+y₂²/B² ≤ 1；利润 π=py₁+y₂；消费者财富=所有权份额×π';legend='绿线：生产边界　绿点：利润最大产出　红点：消费者总需求　虚线：价值相同';
  extra=table(['消费者','所有权份额','利润收入','商品1需求','商品2需求'],r.bundles.map((b,i)=>[i?'乙':'甲',i?1-s.share:s.share,r.income[i],...b]));last=r;
 }else if(key==='labor'){
  const r=labor(s.A,s.beta,s.mult),xmax=Math.max(1.2,r.demand*1.15),ymax=s.A*Math.sqrt(xmax)*1.2,cs=chart(xmax,ymax,'劳动时间 a','产量 / 劳动支出');svg=cs.svg+cs.curve(x=>s.A*Math.sqrt(x),C.g)+cs.curve(x=>r.w*x,C.r,Math.min(xmax,ymax/r.w));
  svg+=cs.line([r.supply,0],[r.supply,s.A*Math.sqrt(r.supply)],C.p,'5 5')+dot(cs.X(r.demand),cs.Y(r.output),C.g,'employment');
  metrics=[['劳动供给',r.supply],['劳动需求',r.demand],['尝试工资',r.w],['出清工资',r.eq]];
  reading=Math.abs(r.excess)<1e-8?'劳动供给等于劳动需求。工人得到工资收入，资本家取得产出扣除工资后的部分；总产出恰好分给双方。':'图中绿色点是资本家想雇用的劳动，紫色线是工人愿意提供的劳动。两者不相同，因此当前是互不兼容的意愿，不能把它们当成已经实现的生产分配。';
  formula='f(a)=A√a；工人 u(l,x)=lᵝx¹⁻ᵝ；aˢ=1−β；aᵈ=(A/(2w))²';legend='绿线：总产量　红线：工资支出　紫线：工人愿意工作的时间';
  extra=table(['当前意愿','数值'],[['工人闲暇',r.leisure],['工人按自身计划的消费',r.workerConsumption],['资本家按雇工计划的利润',r.profit],['劳动需求−供给',r.excess]])+'<p>本例无劳动以外的收入，CD偏好使劳动供给不随工资变动。它不是一般劳动供给定律。资本家可计划雇用超过1的劳动，但单个工人只能提供最多1，故此时不可能出清。</p>';last=r;
 }else if(key==='bank'){
  const r=bank(s.a,s.b,s.z),ymax=Math.max(s.a,s.b)+1.2,cs=chart(1,ymax,'街道位置 / 分界 z','通勤 + 等待时间');svg=cs.svg;
  if(s.view==='cost')svg+=cs.curve(x=>x+r.t[0],C.g)+cs.curve(x=>1-x+r.t[1],C.p);else svg+=cs.curve(x=>(1+s.a)*x,C.g)+cs.curve(x=>(1+s.b)*(1-x),C.p);
  svg+=cs.line([s.z,0],[s.z,ymax],C.m,'4 5')+dot(cs.X(s.view==='cost'?r.cut:r.eq),cs.Y(s.view==='cost'?r.cut+r.t[0]:(1+s.a)*r.eq),C.r,'cut');
  metrics=[['假设去左边的比例',s.z],['按这个预期实际想去左边',r.cut],['唯一均衡分界',r.eq],['预期一致性差值',r.gap]];
  reading=s.view==='cost'?'先假设客流分界，再据此计算等待时间。居民比较两条时间线，红色交点决定新的选择分界。只有选择分界等于原假设，预期才自我实现。':'绿线 z+az 严格上升，紫线 (1−z)+b(1−z) 严格下降；端点的大小关系相反，所以恰有一个交点。降低一侧的等待系数，会吸引更多居民使用该网点。';
  formula='f₀(z)=az，f₁(1−z)=b(1−z)；z*=(1+b)/(2+a+b)';legend='绿色：左网点总时间　紫色：右网点总时间　灰虚线：假设分界　红点：无差异位置';
  extra=table(['左网点等待','右网点等待','全体总时间','使总时间最小的分界'],[[...r.t,r.totalCost,r.social]])+'<p>教材的帕累托稳定与“总时间最小”不是同一概念。改变分界即使降低总时间，也可能让部分居民变差。图中未把迭代最好反应当作一定收敛的现实动态。</p>';last=r;
 }else if(key==='lemons'){
  disable('m',s.mode==='none');const r=lemons(s.case,s.alpha,s.m,s.mode==='none'),cs=chart(7,Math.max(1.2,r.chosen.p*1.15),'按质量递增的汽车编号','质量 / 价格',[1,2,3,4,5,6]);svg=cs.svg;
  r.q.forEach((q,i)=>svg+=`<rect data-motion="car-${i}" x="${cs.X(i+1)-18}" y="${cs.Y(q)}" width="36" height="${300-cs.Y(q)}" fill="${i<r.chosen.n?C.g:C.m}" rx="3"/>`);
  svg+=cs.line([0,r.chosen.p],[7,r.chosen.p],C.r);
  metrics=[['本候选的交易数量',r.chosen.n],['预期质量',r.chosen.mean],['候选价格',r.chosen.p],['均衡条件',r.chosen.valid?'满足':'不满足']];
  reading=s.mode==='none'?'教材的定义在无人交易时不限制质量信念。令价格低于所有卖方保留价，买方又预期质量为零，就能支撑无人交易；若额外要求信念落在真实质量范围内，这个结果便被排除。':r.chosen.valid?'价格等于买方对平均质量的估值，所有买家无差异；选取恰好足够的买家成交。卖方也各自愿意接受当前是否出售的安排，因此这是正交易均衡。':'这个候选不满足卖方的选择条件：可能有被纳入的卖方不肯卖，或者有被排除的卖方也想卖。不能仅凭“价格等于平均估值”就认定均衡。';
  formula='qₘ ≤ p=α·平均(q₁,…,qₘ) ≤ qₘ₊₁；最后一辆车之后无上界';legend='绿色：尝试出售的车　灰色：保留的车　红线：候选价格';
  extra=table(['候选辆数','平均质量','价格','通过卖方检验'],r.candidates.map(c=>[c.n,c.mean,c.p,c.valid?'是':'否']))+`<p>买方共8人，车共6辆，无现金限制；买方必须能在无差异时只选择部分人成交。候选销售集合对应的总交易增益 ${f(r.surplus)}，其余车辆的潜在增益 ${f(r.lost)}；候选不满足均衡条件时，不能视为已实现的交易。正交易均衡不必唯一。</p>`;last=r;
 }else if(key==='fishing'){
  disable('fraction',s.mode!=='pareto');disable('tax',s.mode!=='tax');disable('rebate',s.mode!=='tax');const r=fishing(s.v,s.k,s.mode,s.fraction,s.tax,s.rebate==='yes'),cs=chart(10,Math.max(10,s.v*1.7),'总捕捞量 T','每单位价值 / 成本');svg=cs.svg+cs.curve(x=>s.k*x,C.g,Math.min(10,Math.max(10,s.v*1.7)/s.k))+cs.curve(x=>2*s.k*x,C.p,Math.min(10,Math.max(10,s.v*1.7)/(2*s.k)))+cs.line([0,s.v],[10,s.v],C.r);
  if(r.tax)svg+=cs.curve(x=>s.k*x+r.tax,C.m,Math.min(10,(Math.max(10,s.v*1.7)-r.tax)/s.k));svg+=dot(cs.X(r.T),cs.Y(r.c),C.g,'catch')+cs.line([r.T,0],[r.T,r.p],C.m,'4 5');
  metrics=[['当前总捕捞量',r.T],['最大总净收益的产量',r.optimal],['每位消费者净收益',r.consumer],['每位渔民净收益',r.fisher]];
  reading=s.mode==='equilibrium'?'竞争均衡中，价格、消费者价值和渔民相信的单位成本相等。个人都把总捕捞造成的成本当成既定，因此没有计入增加捕捞对其他人的影响。':s.mode==='pareto'?'减少捕捞后，单位成本下降。把交易价格放在新成本与消费者价值之间，消费者和渔民都严格受益；这是可行的帕累托改进，不是原制度下的新竞争均衡。':s.rebate==='yes'?'税提高渔民面对的单位成本并减少捕捞。税前个人剩余仍为零；本页把税款等额返还，才使每个消费者和渔民获得正收益。':'税降低捕捞量，但未返还时个人剩余仍为零。公共部门保留了税收，不能把这部分收入直接算作每个人已经得到的改善。';
  formula='c(T)=kT；原均衡 v=kT；社会边际成本=2kT；税后 v=kT+τ';legend='绿线：单位私人成本　紫线：社会边际成本　红线：消费者价值　灰线：含税成本';
  extra=table(['交易价','税率','税收总额','每人返还','总净收益'],[[r.p,r.tax,r.revenue,r.transfer,r.surplus]])+'<p>固定5位渔民，每人上限2；10位消费者，每人上限1。参数范围保证原均衡在容量内。渔民接受成本预期，不把本模型误解为考虑自身影响的有限人纳什博弈。</p>';last=r;
 }else if(key==='contracts'){
  const r=wages(s.v,s.w,s.entry);svg=bars(['生产率','现有报价','新报价'],[{name:'wages',values:[s.v,s.w,s.entry],color:C.g}],16);
  metrics=[['原雇主每人利润',r.profit],['新合同是否被选',r.entryAccepted?'会':'不会严格转向'],['新雇主每人利润',r.entryProfit],['现有集合是否均衡',r.stable?'是':'否']];
  reading=r.stable?'工资等于生产率。降低报价无人接受；提高报价虽然能吸引工人，却亏损。现有合同无人想撤回，也没有可盈利的新合同。':r.withdraw?'当前工资超过生产率，雇主每雇一人都亏损，因此会撤回报价。':'当前工资低于生产率。新雇主只要稍微提高工资、仍低于生产率，就既能吸引工人又能盈利；图中某个新报价失败，不代表没有其他进入机会。';
  formula='均衡报价集合 W*={v}；若 w<v，则 w<w′<v 的新报价可盈利进入';legend='同一单位：每位工人的产出 / 工资';extra='<p>工人同质，雇主可自由提出新合同，外部选择为零。这里的均衡是合同集合，而不是特定工人与特定企业的配对名单。</p>';last=r;
 }else if(key==='signaling'){
  const r=signaling(4,10,3,s.bH,s.low,s.menu,s.t,s.w),cs=chart(4,12,'教育要求 t','工资 w');svg=cs.svg;
  const baseU=r.before.map((c,i)=>c.w-(i?s.bH:3)*c.t);
  svg+=cs.curve(x=>baseU[0]+3*x,C.p,Math.min(4,(12-baseU[0])/3))+cs.curve(x=>baseU[1]+s.bH*x,C.g,Math.min(4,(12-baseU[1])/s.bH));
  r.base.forEach(c=>svg+=dot(cs.X(c.t),cs.Y(c.w),C.i,'base-'+c.id));svg+=dot(cs.X(s.t),cs.Y(s.w),C.r,'entrant');
  metrics=[['低类型会选择',r.after[0].id],['高类型会选择',r.after[1].id],['新合同每位雇员利润',r.profit],['当前合同集合',s.menu==='pool'?'总可被筛选进入':r.candidateStable?'满足全域进入检验':'存在混同进入机会']];
  reading=s.menu==='pool'?'混同工资等于平均生产率。选取位于两条无差异线之间的新合同：高类型愿意接受，低类型不接受；只要工资低于高类型生产率，进入者就赚钱。':r.candidateStable?'这组参数下，候选分离合同抵挡所有新合同。高类型工资为10，低类型工资为4；教育并不提高生产率，作用是使低类型不愿模仿。':'这组参数下，分离候选虽满足自我选择和零利润，仍不是均衡。新雇主能给出零教育、略高于高类型原净收益的工资，吸引两类工人并获利。';
  formula='tᴴ=(vᴴ−vᴸ)/βᴸ=2；uᴴ=10−2βᴴ；本线性模型：分离均衡存在 ⇔ αᴸ ≥ βᴴ/βᴸ';legend='黑点：现有合同　红点E：新合同　紫线：低类型等净收益　绿线：高类型等净收益';
  extra=table(['类型','原选择','加入新合同后的选择','新合同净收益'],[['L',r.before[0].id,r.after[0].id,s.w-3*s.t],['H',r.before[1].id,r.after[1].id,s.w-s.bH*s.t]])+`<p>L / H 是分离合同，P 是混同合同，E 是进入者。净收益相同时按教材优先选择教育更少的合同；完全相同的报价不构成独立的新机会。潜在雇员平均生产率 ${f(r.entryProductivity)}。上方存在条件由书中进入检验推导：平均生产率必须不高于高类型分离净收益；仅拖动有限样本不作为全域证明。</p>`;last=r;
 }
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 600 390" role="img" aria-label="${meta.title}动态模型" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);
 $('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${f(v)}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('legend').textContent=legend;$('extra').innerHTML=extra;
 spec.forEach(c=>{$(c.k).value=state[c.k];if($('out-'+c.k))$('out-'+c.k).value=f(state[c.k])});
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function advance(){
 if(key==='insurance'){state.progress=state.progress>=1?0:Math.min(1,state.progress+.2);render();return state.progress>=1}
 if(key==='indivisible'){const r=indivisible(state.case,state.buyer,state.price);state.price=[r.lo,(r.lo+r.hi)/2,r.hi].find(v=>v>state.price+1e-8)??r.lo;render();return true}
 if(key==='production-economy'||key==='labor'){state.mult=state.mult===1?.5:1;render();return true}
 if(key==='bank'){state.z=bank(state.a,state.b,state.z).eq;render();return true}
 if(key==='lemons'){state.mode='trade';state.m=state.m===6?1:state.m+1;render();return state.m===6}
 if(key==='fishing'){state.mode=state.mode==='equilibrium'?'pareto':state.mode==='pareto'?'tax':'equilibrium';render();return true}
 if(key==='contracts'){state.entry=state.w<state.v?(state.w+state.v)/2:state.v+.5;render();return true}
 if(key==='signaling'){
  const r=signaling(4,10,3,state.bH,state.low,state.menu,state.t,state.w);
  if(state.menu==='pool'){state.t=Math.min(1,(10-r.mean)/(3+state.bH));state.w=r.mean+(3+state.bH)*state.t/2}
  else if(!r.candidateStable){state.t=0;state.w=(r.mean+r.hUtility)/2}
  else {state.t=2;state.w=10.1}render();return true;
 }
 return true;
}
$('fields').addEventListener('input',e=>{const c=spec.find(c=>c.k===e.target.dataset.key);if(!c)return;stop();state[c.k]=c.options?e.target.value:+e.target.value;render()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}const done=advance();if(done||window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance())stop()},1400);$('play').textContent='暂停变化'};
$('reset').onclick=()=>{stop();spec.forEach(c=>state[c.k]=c.value);render()};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',render);
window.demo={meta,state,spec,draw:render,get last(){return last}};render();

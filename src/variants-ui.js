import {cases,casesBySection,basePeople,cashPeople,market,pareto,pooled,insurer,beliefs,beliefRisk,timeEconomy,bets,betMarket} from './variants.mjs';
import './variant-indivisible-ui.js';
import './variant-uncertainty-ui.js';
const valuationRequest=new URLSearchParams(location.search).get('case')||window.VARIANT_DEFAULT;
if(window.LESSON.id==='11.1')window.startIndivisibleStory(valuationRequest);
else if(window.LESSON.id==='11.2')window.startUncertaintyStory(valuationRequest);
else {
// The same people or state claims persist while a parameter changes.
const $=id=>document.getElementById(id),meta=window.LESSON,available=casesBySection[meta.id];
const query=new URLSearchParams(location.search).get('case');
const colors={ink:'#213d37',green:'#177468',red:'#c35f43',purple:'#7a6594',muted:'#758778',grid:'#dce2d5',paper:'#fffdf7'};
const fmt=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)).toLocaleString('zh-CN',{maximumFractionDigits:d}):String(n);
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slider=(key,label,min,max,step,value)=>({key,label,min,max,step,value});
const select=(key,label,items,value)=>({key,label,items,value});
let name='',state={},controls=[],stage=0,timer=null,last={};
function spec(k){switch(k){
 case 'market':return[slider('price','尝试价格',0,12,.25,5),slider('buyer','买者B₄的估值',1,10,.25,4)];
 case 'tickets':return[slider('price','尝试价格',90,105,1,100)];
 case 'cash':return[slider('price','尝试价格',4,7,.1,5.5)];
 case 'pareto':return[slider('cash','未持有者手中的现金',0,8,.25,2)];
 case 'comparative':return[slider('valuation','某位卖者的新估值',5,9,.25,7)];
 case 'entry':return[select('newcomer','加入市场的人',{buyer:'增加一个高估值买者',seller:'增加一个低估值卖者'},'buyer')];
 case 'cost':return[slider('cost','每人进场成本 c',0,6,.25,2)];
 case 'exit':return[slider('payment','补偿退出买者的金额',.5,5,.5,2),slider('afterPrice','对手退出后的均衡价格',0,8,.5,1)];
 case 'states':case 'pool':case 'disaster':{const fields=[slider('pi','状态1概率 π₁',.15,.85,.05,.4)];if(k!=='pool')fields.push(slider('shock','状态1总财富比例',.2,1,.05,k==='disaster'?.5:1));fields.push(slider('progress','从禀赋到终点',0,1,.1,0));return fields}
 case 'insurer':return[slider('pi','灾难概率 π₁',.15,.85,.05,.4),slider('capital','保险人的资本 α',.15,3,.05,1),slider('progress','从禀赋到均衡',0,1,.1,0)];
 case 'belief':return[select('region','信念所在区间',{above:'两人都更看好状态1',cross:'两人看好不同状态',below:'两人都更看好状态2'},'cross'),slider('spread','信念差距',.05,.3,.05,.2)];
 case 'beliefRisk':return name==='p7a'?[slider('t','双方共同认为黄队赢的概率',.5,.9,.05,.7)]:[slider('t','1号认为黄队赢的概率 t',.5,.9,.05,.7),slider('s','2号认为黄队赢的概率 s',.1,.5,.05,.3)];
 case 'show':return[slider('chance','3号认为演出举行的概率',.3,.85,.05,.65),slider('price','尝试票价',3,9,.25,7)];
 case 'bets':return[slider('price','A赌注价格 p',0,1,.025,.65)];
 case 'time':return[slider('delta','第二期权重 δ',.2,.95,.05,.6)];
 default:return[];
}}
function fields(){const first=`<div class="field"><label for="case">教材原题或知识点</label><select id="case" aria-label="切换第11章实验">${available.map(k=>`<option value="${k}" ${name===k?'selected':''}>${htmlEscape(cases[k].label)}</option>`).join('')}</select></div>`;
 $('fields').innerHTML=first+controls.map(c=>c.items?`<div class="field"><label for="${c.key}">${c.label}</label><select id="${c.key}" data-key="${c.key}">${Object.entries(c.items).map(([v,l])=>`<option value="${v}" ${state[c.key]===v?'selected':''}>${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.key}">${c.label}<output id="out-${c.key}">${fmt(state[c.key])}</output></label><input type="range" id="${c.key}" data-key="${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${state[c.key]}"></div>`).join('');
}
const text=(x,y,s,size=13,color=colors.ink,anchor='middle')=>{const scale=Math.min(2,Math.max(1,620/Math.max(280,$('plot').clientWidth)));return`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size*scale}">${htmlEscape(s)}</text>`};
const dot=(x,y,color,id,r=7)=>`<circle data-motion="${id}" cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${colors.paper}" stroke-width="2"/>`;
function frame(xlabel,ylabel){let svg='';for(let i=0;i<=4;i++)svg+=`<path d="M60 ${300-i*58}H610" stroke="${colors.grid}"/>`;svg+=`<path d="M60 45V300H612" fill="none" stroke="${colors.muted}" stroke-width="1.5"/>${xlabel?text(605,350,xlabel,12,colors.ink,'end'):''}${text(60,27,ylabel,13,colors.ink,'start')}`;return svg}
function valuationPlot(r,max=12,marker=null){const y=v=>300-245*Math.max(0,Math.min(max,v))/max,x=i=>85+505*(i+.5)/r.sorted.length;
 let svg=frame('','货币估值 v / 价格 p');
 for(let v=0;v<=max;v+=max/4)svg+=text(46,y(v)+4,fmt(v),11,colors.muted,'end');
 r.sorted.forEach((p,i)=>{svg+=dot(x(i),y(p.v),p.own?colors.purple:colors.green,'person-'+String(p.id),r.sorted.length>20?4:7);if(r.sorted.length<=8)svg+=text(x(i),326,p.id.replace(/^(卖者|买者)/,''),12,p.own?colors.purple:colors.green)});
 svg+=`<path d="M60 ${y(r.price)}H610" stroke="${colors.red}" stroke-width="2.5"/>${text(602,y(r.price)-8,'p='+fmt(r.price),12,colors.red,'end')}`;
 if(marker!==null)svg+=`<path d="M${x(marker-.5)} 48V300" stroke="${colors.muted}" stroke-dasharray="5 6"/>`;
 return svg;
}
function beliefPlot(values,price){const y=v=>300-245*v,x=i=>92+495*i/(values.length-1);let svg=frame('','主观概率 α / A赌注价格 p');for(const v of [0,.25,.5,.75,1])svg+=text(45,y(v)+4,fmt(v,2),11,colors.muted,'end');values.forEach((v,i)=>{const color=v>price+1e-8?colors.green:v<price-1e-8?colors.red:colors.purple;svg+=dot(x(i),y(v),color,'bettor-'+i,8)+text(x(i),326,String(i+1),12)});svg+=`<path d="M60 ${y(price)}H610" stroke="${colors.ink}" stroke-width="2"/>${text(602,y(price)-9,'p='+fmt(price,3),12,colors.ink,'end')}`;return svg}
function stateBars(labels,initial,final,progress,maxOverride){const hi=maxOverride||Math.max(1,...initial.flat(),...final.flat())*1.18,base=290,range=230,n=labels.length,gap=510/n;
 let svg=frame('','未来实现时得到的钱');for(let v=0;v<=hi;v+=hi/4)svg+=text(46,base-range*v/hi+4,fmt(v,1),11,colors.muted,'end');
 labels.forEach((label,i)=>{const center=80+(i+.5)*gap;[0,1].forEach((j)=>{const amount=initial[i][j]+progress*(final[i][j]-initial[i][j]),h=range*amount/hi,x=center+(j?4:-42);svg+=`<rect data-motion="state-${i}-${j}" x="${x}" y="${base-h}" width="37" height="${h}" rx="4" fill="${j?colors.green:colors.red}"/>${text(x+18.5,base-h-8,fmt(amount,1),12,j?colors.green:colors.red)}`});svg+=text(center,326,label,13)});return svg}
function comparisonBars(labels,values){const top=Math.max(...values.map(Math.abs),1)*1.18,n=labels.length,w=510/n,svgStart=frame('','价值、收益或数量');let svg=svgStart;
 labels.forEach((l,i)=>{const x=75+i*w,v=values[i],h=Math.max(2,220*Math.abs(v)/top);svg+=`<rect data-motion="comparison-${i}" x="${x}" y="${v>=0?290-h:290}" width="${Math.min(65,w-15)}" height="${h}" rx="4" fill="${i%2?colors.green:colors.red}"/>${text(x+Math.min(65,w-15)/2,v>=0?278-h:310+h,fmt(v),12)}${text(x+Math.min(65,w-15)/2,329,l,11)}`});return svg}
const row=(heads,rows)=>`<table><thead><tr>${heads.map(x=>`<th scope="col">${htmlEscape(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(c=>`<tr>${c.map(x=>`<td>${htmlEscape(fmt(x))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function panel(){const c=cases[name],s=state,k=c.kind;let svg='',metrics=[],reading='',formula='',extra='',legend='',boundary=c.note,result={};
 const add=(label,value)=>metrics.push([label,fmt(value)]);
 if(['market','tickets','cash','welfare','comparative','entry','cost','show','bets'].includes(k)){
  let people=basePeople.map(x=>({...x})),p=s.price??5,cashBound=false,max=12;
  if(k==='market')people[2].v=s.buyer;
  if(k==='tickets'){people=[...Array.from({length:14},(_,i)=>({id:'S'+(i+1),v:0,own:1,cash:0})),...Array.from({length:17},(_,i)=>({id:'B'+(i+1),v:100,own:0,cash:100}))];max=105}
  if(k==='cash'){people=cashPeople.map(x=>({...x}));cashBound=true}
  if(k==='comparative'||k==='entry'){people=[{id:'S₀',v:0,own:1,cash:0},{id:'S₅',v:k==='comparative'&&stage>=2?s.valuation:5,own:1,cash:0},{id:'B₅',v:5,own:0,cash:20},{id:'B₁₀',v:10,own:0,cash:20}];if(k==='entry'&&stage>=2)people.push(s.newcomer==='buyer'?{id:'新增B₈',v:8,own:0,cash:20}:{id:'新增S₁',v:1,own:1,cash:0});p=5}
  if(k==='cost'){people=people.map(x=>({...x,v:x.v+(x.own?s.cost:-s.cost)}));const r0=market(people,0);p=(r0.lo+r0.hi)/2}
  if(k==='show'){people=[.9,.75,s.chance,.4,.2].map((t,i)=>({id:String(i+1),v:10*t,own:i===0||i===4?1:0,cash:20}));max=10}
  if(k==='bets'){people=bets.map((v,i)=>({id:String(i+1),v,own:i<4?1:0,cash:2}));max=1;p=s.price}
  if(k==='welfare')p=5;if(k==='comparative'||k==='entry')p=stage<2?5:market(people,0).lo;
  const r=market(people,p,cashBound);result=r;svg=valuationPlot(r,max,r.s);
  add('均衡价格区间',k==='cash'?'(5, 6]':`[${fmt(r.lo)}, ${fmt(r.hi)}]`);add('尝试价格能否出清',r.equilibrium?'可以':'不可以');add('当前成交量',r.equilibrium?r.trades:'—');
  legend='绿色：初始买者　紫色：初始卖者　红线：尝试价格';
  formula=k==='cash'?String.raw`5<p\le 6`:k==='bets'?String.raw`\alpha_{(5)}\le p\le\alpha_{(4)}\quad \Longrightarrow\quad 0.6\le p\le 0.7`:String.raw`v_{s+1}\le p\le v_s`;
  reading=r.equilibrium?'该价格能够让每个人作出最优选择，同时物品恰好分完。等于价格者可以任选，实际成交量取决于他们如何配对。':'当前价格下，必须持有的人数或愿意持有的人数与供给不符；可行分配不能自动成为价格均衡。';
  extra=row(['个人','估值','初始持有','当前持有','成交后货币','效用变化'],r.allocation.map(x=>[x.id,x.v,x.own,x.has,x.money,x.gain]));
  if(k==='tickets'){reading='当价格低于100，17位买者都想要票而只有14张；高于100无人想买。等于100时，17位买者都无差异，选14位成交。';formula=String.raw`p^{*}=100,\quad 14\text{ 张票分给 }17\text{ 位无差异买者中的 }14\text{ 位}`;add('无差异买者',17)}
  if(k==='cash'){reading='5元时2号和3号都能且愿意购买，只有4号卖出；稍高于5元时3号现金不够，2号购买、4号卖出。6元仍可出清；不能套用无现金约束的排序公式。';formula=String.raw`5<p\le 6`+'\n'+String.raw`e_1(3)=5,\quad v^3=8`;add('3号现金',5)}
  if(k==='welfare'){const initial=people.reduce((z,x)=>z+x.v*x.own,0),opt=r.totalValue,shown=stage<2?initial:opt;svg=comparisonBars(['初始产权','重新分配后'],[initial,shown]);reading=stage<2?'初始产权两件物品的估值和只有'+fmt(initial)+'。按“下一步”让物品流向估值最高的两人。':'均衡把物品给估值最高的两人。所有人的货币效用之和固定，因此总效用增加恰等于物品估值和增加。';metrics=[];add('初始总估值',initial);add('当前总估值',shown);add('增加的总效用',shown-initial);formula=String.raw`\sum_i u_i(a(i))=\sum_i a_1(i)+\sum_i v^i a_2(i)`;extra=row(['个人','初始持有','均衡持有','估值'],people.map(x=>[x.id,x.own,r.allocation.find(a=>a.id===x.id).has,x.v]))}
  if(k==='comparative'){reading=stage<2?'旧均衡唯一价格是5。按“下一步”提高某位卖者的估值，观察新区间。':'某位卖者估值提高之后，价格区间向上扩展或保持原下界；图形只展示有限例子，一般结论来自估值的次序统计。';add('旧均衡价格',5);formula=String.raw`p^{*}_{\text{旧}}=5,\qquad p_{\text{新}}\ge 5`}
  if(k==='entry'){reading=stage<2?'旧市场的均衡价格唯一，为5。按“下一步”加入一位买者或卖者。':s.newcomer==='buyer'?'增加估值8的买者后，价格下界不低于旧价格5。新增需求把价格区间推向右侧。':'增加估值1的卖者后，价格上界不高于旧价格5。新增供给把价格区间推向左侧。';add('旧均衡价格',5)}
  if(k==='cost'){reading='每人进场都要付c；不交易只会白付成本，因此等效为卖者保留物品的估值增加c、买者购买估值减少c。成本高到一定程度时交易消失。';formula=String.raw`v^{\text{有效}}_S=v_S+c,\qquad v^{\text{有效}}_B=v_B-c`;add('每笔交易的总进场成本',2*s.cost)}
  if(k==='show'){reading='持票观看的10单位效用只有演出举行时才得到，门票取消不退款；所以个人预计效用差等于10乘以主观开演概率。票应流向最高估值的两人。';formula=String.raw`v^i=10t^i,\qquad v_{3}\le p\le v_{2}`}
  if(k==='bets'){const b=betMarket(p);svg=beliefPlot(bets,p);metrics=[];add('严格选择A的人数',b.strict);add('在价格上无差异的人数',b.ties);add('能否恰好四人选A',b.equilibrium?'能':'不能');legend='绿色：严格选A　红色：严格选B　紫色：无差异';reading='每人比较押A与押B的预期净收益：押A当且仅当自己的A胜出概率不低于价格p；价格边界上的人可以选择任一边。';formula=String.raw`\alpha^i-p\ge (1-\alpha^i)-(1-p)`+'\n'+String.raw`\Longleftrightarrow\quad \alpha^i\ge p`;extra=row(['下注者','认为A赢的概率','在当前价格的选择'],bets.map((v,i)=>[i+1,v,v>p+1e-8?'A':v<p-1e-8?'B':'A或B']))+'<p>A和B各四人的配对相当于四组完整的或有支付：每组先收1元、最终必支付1元。这里不预设下注者最初持有哪些“票”。</p>';if(name==='p9a')reading+=' A与B每配一对，先收1元且最终必支付1元。';if(name==='p9b')reading+=' 原题八人的均衡价为0.6至0.7（含端点）。'}
 }else if(k==='pareto'){const r=pareto(s.cash);result=r;svg=comparisonBars(['持有估值','未持估值','可用现金'],[4,8,s.cash]);add('可行改进',r.possible?'存在':'不存在');add('可用最高支付',Math.min(r.buyer,r.cash));reading=r.possible?`未持有者愿付且付得起的金额高于持有者估值4。例如转账${fmt(r.offer)}，双方都严格变好。`:'即使未持有者估值8更高，他现在最多只能拿出'+fmt(s.cash)+'，不足以补偿持有者失去物品的4。';formula=String.raw`v^i\ge\min\{v^j,a_1(j)\}`;extra='<p>图中只突出一对潜在交换者。完整判别必须对每个“持有者 i、未持有者 j”配对检验；此处还保留一位估值0、仅持钱的第三人来维持资源守恒。</p>';
 }else if(k==='core'){const unequal=stage<2,paid=unequal?[5,7]:[6,6],received=unequal?[5,7]:[6,6];svg=comparisonBars(['买甲付','买乙付','卖甲收','卖乙收'],[...paid,...received]);add('支付是否统一',unequal?'不统一':'统一为6');reading=unequal?'买者乙付7，却有卖者甲只收5。两人退出原配置、携自己的初始资源按6交易，都会比当前更好；因此原配置不在核心。':'四人都按6交易，买者与卖者的各自最优选择和可行性相容。本构造中的均衡配置属于核心。';formula=String.raw`p_i=p_j=p\quad\text{对所有实际交易者}`;extra=row(['参与者','当前支付/收到','脱离后按6交易'],[['买者乙',paid[1],6],['卖者甲',received[0],6]]);
 }else if(k==='exit'){const before=market([{id:'S₀',v:0,own:1,cash:0},{id:'B₁₀',v:10,own:0,cash:20},{id:'B₉',v:9,own:0,cash:20}],9),after=market([{id:'S₀',v:0,own:1,cash:0},{id:'B₁₀',v:10,own:0,cash:20}],s.afterPrice),active=stage>=2,net=10-s.afterPrice-s.payment;result={before,after};svg=comparisonBars(['原收益','退出后','对手补偿'],[1,active?net:0,active?s.payment:0]);add('新价能否出清',after.equilibrium?'能':'不能');add('退出后B₁₀净收益',active?net:'尚未支付');reading=active?'B₁₀已提出补偿，B₉拿钱退出；新市场选定的价格为'+fmt(s.afterPrice)+'。B₁₀的真实净收益为'+fmt(net)+'，请与原来1比较。':'原来选定价格9，B₁₀净收益1，B₉未获票且收益0。按“下一步”请B₉退出，再观察价格与两人的收益。';formula=String.raw`10-p_{\text{新}}-\text{补偿}>10-9=1`;boundary+=' 仅给出一组可行均衡价格的构造，原题没有指定统一的价格选择机制。';
 }else if(['states','pool','disaster'].includes(k)){const shock=k==='disaster'?s.shock:k==='pool'?1:s.shock,r=pooled(s.pi,shock);result=r;svg=stateBars(['甲','乙'],r.e,r.a,s.progress);add('状态1总资源',r.c1);add('状态2总资源',r.c2);add('价格比 p₁/p₂',r.priceRatio);add('概率比 π₁/π₂',r.fairRatio);legend='红色：状态1的支付　绿色：状态2的支付';reading=k==='disaster'?'灾难使状态1的总资源减少。合同只能交换风险，不能把状态1缺少的财富凭空补回，所以均衡状态1更贵、每个人最终在该状态消费更少。':r.c1===r.c2?'两个状态总财富相同，互保把初始资源从各人高收入的状态移向低收入状态；终点两人各自获得确定金额。':'现在两个状态总量不同。切换到总量相同，才满足完全保险命题的资源前提。';formula=String.raw`U_i(x_1,x_2)=\pi_1u_i(x_1)+\pi_2u_i(x_2)`+'\n'+String.raw`p_1x_1+p_2x_2=p_1e_1(i)+p_2e_2(i)`;extra=row(['个体','初始状态1','初始状态2','终点状态1','终点状态2'],r.e.map((a,i)=>['甲乙'[i],...a,...r.a[i]]))+'<p>数值图采用对数伯努利效用。中间帧是沿预算线的可行交易插值，不是市场真实调整轨迹。</p>';if(k==='pool'&&r.c1===r.c2)formula=String.raw`\frac{p_1}{p_2}=\frac{\pi_1}{\pi_2},\qquad a_1(i)=a_2(i)=\pi_1e_1(i)+\pi_2e_2(i)`;
 }else if(k==='insurer'){const r=insurer(s.pi,s.capital),e=[[0,1],[s.capital,s.capital]],a=[[r.x1,r.x2],r.insurerBundle];result=r;svg=stateBars(['每位投保人','保险人'],e,a,s.progress,Math.max(2.5,...a.flat())*1.15);add('资本门槛 3π₂',r.threshold);add('实际资本 α',s.capital);add('状态价格比',r.p);add('投保人是否完全保险',r.full?'是':'否');legend='红色：灾难状态　绿色：正常状态；投保人柱表示每人';reading=r.full?'资本足够，保险人可在灾难状态完成赔付；三位投保人最终都在两种状态取得相同的财富。':'资本不足时，保险人灾难状态的财富降到0；投保人仍保留部分风险。灾难状态价格比概率比更高。';formula=r.full?String.raw`\alpha\ge 3\pi_2\quad \Longrightarrow\quad a(i)=(\pi_2,\pi_2)`:String.raw`\alpha<3\pi_2`+'\n'+String.raw`a_1(i)=\frac{\alpha}{3}`+'\n'+String.raw`a_2(i)=1-\frac{\alpha p_1}{3p_2}`;extra=row(['对象','初始状态1','初始状态2','均衡状态1','均衡状态2'],[['每位投保人',0,1,r.x1,r.x2],['保险人',s.capital,s.capital,...r.insurerBundle]])+'<p>投保人使用平方根效用；保险人风险中性、按给定价格选择。保险人的柱子代表整个保险人，不能与单个投保人直接相加。</p>';
 }else if(k==='belief'){let t=s.region==='above'?.75+s.spread/2:s.region==='below'?.34+s.spread/2:.5+s.spread/2,low=s.region==='above'?.75-s.spread/2:s.region==='below'?.34-s.spread/2:.5-s.spread/2;const r=beliefs(t,low);result=r;svg=stateBars(['1号','2号'],[[1,1],[1,1]],[r.high,r.low],1);add('1号状态1信念',t);add('2号状态1信念',low);add('状态1价格份额',r.q);reading='两人都风险中性，但对状态1的概率判断不同；更看好状态1的人拿到更多状态1支付。即使双方都主观获益，最终资源仍逐状态守恒。';formula=String.raw`p_1+p_2=1,\qquad a_1(1)+a_1(2)=a_2(1)+a_2(2)=2`;legend='红色：状态1　绿色：状态2';extra=row(['个体','初始(状态1,状态2)','终点(状态1,状态2)'],[['1号','1 / 1',r.high.map(x=>fmt(x)).join(' / ')],['2号','1 / 1',r.low.map(x=>fmt(x)).join(' / ')]]);
 }else if(k==='beliefRisk'){const t=name==='p7a'?s.t:s.t,low=name==='p7a'?s.t:s.s,r=beliefRisk(t,low);result=r;svg=stateBars(['1号','2号'],[[100,100],[100,100]],[r.one,r.two],1,190);add('均衡状态1价格份额',r.q);add('1号黄队赢时支付票',r.one[0]);add('1号黄队输时支付票',r.one[1]);reading=t===low?'相同信念、相同严格凹效用与相同禀赋使两人维持各100张两类票；价格份额等于共同信念。':'1号认为黄队赢更可能。状态1价格份额处于两人信念之间，1号的最优束中“赢时支付票”多于“输时支付票”。';formula=String.raw`q=\frac{t+s}{2},\quad x_1^{(1)}=\frac{100t}{q},\quad x_2^{(1)}=\frac{100(1-t)}{1-q}`;boundary+=' 此处用 u(x)=log x 的严格凹例子；原题结论对满足条件的一般效用也成立。';
 }else if(k==='time'){const r=timeEconomy(s.delta);result=r;svg=stateBars(['第1代','第2代'],[[1,0],[0,1]],[[r.first,r.first],[r.second,r.second]],1,1.2);add('第1期/第2期价格比',r.priceRatio);add('第1代每期消费',r.first);add('第2代每期消费',r.second);reading='两代人有同样的时间偏好，但初始的钱落在不同期。第1期钱的价格更高，第1代的终点财富与两期消费都较高。';formula=String.raw`\frac{p_1}{p_2}=\frac1\delta`+'\n'+String.raw`a(1)=\left(\frac1{1+\delta},\frac1{1+\delta}\right)`+'\n'+String.raw`a(2)=\left(\frac\delta{1+\delta},\frac\delta{1+\delta}\right)`;legend='红色：第1期　绿色：第2期';boundary+=' 共同严格凹且递增的伯努利效用支持该均衡分配；平方根效用可直接代入复核。';
 }
 $('legend').textContent=legend;$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=`教材印刷页${c.page}：${boundary}`;$('extra').innerHTML=extra;$('metrics').innerHTML=metrics.map(([a,b])=>`<div class="metric"><label>${htmlEscape(a)}</label><strong>${htmlEscape(b)}</strong></div>`).join('');
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 650 365" role="img" aria-label="${htmlEscape(c.label)}动态图" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);
 controls.forEach(x=>{if($('out-'+x.key))$('out-'+x.key).value=fmt(state[x.key]);if($(x.key))$(x.key).value=state[x.key]});last={case:name,stage,state:{...state},result};
}
function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='播放变化'}
function setup(k){stop();name=k;stage=0;controls=spec(cases[k].kind);state=Object.fromEntries(controls.map(c=>[c.key,c.value]));fields();history.replaceState(null,'',location.pathname+'?case='+k);panel()}
function advance(){const k=cases[name].kind;if(['states','pool','disaster','insurer'].includes(k)){state.progress=state.progress>=1?0:Math.min(1,+(state.progress+.2).toFixed(2));stage=Math.round(state.progress*5)}else if(['core','welfare','comparative','entry','exit'].includes(k))stage=(stage+1)%4;else if(k==='market'||k==='tickets'||k==='cash'||k==='show'||k==='bets'){const r=last.result;const targets=k==='cash'?[5,5.1,5.5,6,6.1]:k==='bets'?[.5,.6,.65,.7,.8]:[r.lo,(r.lo+r.hi)/2,r.hi];const current=state.price??0;state.price=targets.find(v=>v>current+1e-8)??targets[0];stage++}else if(k==='pareto'){state.cash=state.cash>=8?0:Math.min(8,state.cash+2);stage++}else if(k==='cost'){state.cost=state.cost>=6?0:Math.min(6,state.cost+1);stage++}else if(k==='time'){state.delta=state.delta>=.9?.2:+(state.delta+.15).toFixed(2);stage++}else if(k==='belief'){state.region=state.region==='above'?'cross':state.region==='cross'?'below':'above';stage++}else if(k==='beliefRisk'){if(name==='p7a')state.t=state.t>=.9?.5:+(state.t+.1).toFixed(2);else state.s=state.s>=.5?.1:+(state.s+.1).toFixed(2);stage++}panel();return stage>=5}
const manualStage=()=>['comparative','entry','exit'].includes(cases[name].kind)?2:0;
$('fields').addEventListener('change',e=>{if(e.target.id==='case'){setup(e.target.value);return}if(e.target.dataset.key){stop();const c=controls.find(x=>x.key===e.target.dataset.key);state[c.key]=c.items?e.target.value:+e.target.value;stage=manualStage();panel()}});
$('fields').addEventListener('input',e=>{if(!e.target.dataset.key||e.target.tagName!=='INPUT')return;stop();state[e.target.dataset.key]=+e.target.value;stage=manualStage();panel()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}advance();if(window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance())stop()},1300);$('play').textContent='暂停变化'};$('reset').onclick=()=>setup(name);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',panel);
window.demo={get caseName(){return name},get state(){return state},get last(){return last},draw:panel};setup(available.includes(query)?query:available[0]);

}

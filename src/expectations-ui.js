import {cases,casesBySection,service,servicePareto,cars,carFilmState,carParetoFilmState,carNoTradeFilmState,fishing,fishingEquilibriumFilmState,fishingParetoFilmState,fishingTaxFilmState,raffle,matching,healthFilmState,survival} from './expectations.mjs';
import {startServiceEconomyStory} from './service-economy-ui.js';
import {startCarMarketStory} from './car-market-ui.js';
import {startFishMarketStory} from './fish-market-ui.js';
if(window.LESSON?.id==='13.1'){
 startServiceEconomyStory();
}else if(window.LESSON?.id==='13.2'){
 startCarMarketStory();
}else if(window.LESSON?.id==='13.3'){
 startFishMarketStory();
}else{
const $=id=>document.getElementById(id),meta=window.LESSON,available=casesBySection[meta.id];
const query=new URLSearchParams(location.search).get('case');
const C={ink:'#213d37',green:'#177468',red:'#c35f43',purple:'#7a6594',gold:'#b68b37',muted:'#758778',grid:'#dce2d5',paper:'#fffdf7',wash:'#e8eee4'};
const fmt=(n,d=3)=>Number.isFinite(n)?Number(n.toFixed(d)).toLocaleString('zh-CN',{maximumFractionDigits:d}):String(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(key,label,min,max,step,value)=>({key,label,min,max,step,value});
const T=(...lines)=>lines.join('\n');
let name='',state={},controls=[],stage=0,timer=null,last={};
function spec(kind){
 if(['service','crossing','sorting','pareto','improve','compare','allScale','waitScale','social'].includes(kind)){
  if(kind==='improve')return[R('a','改善后的左网点等待系数',.2,.95,.05,.6)];
  if(kind==='allScale'||kind==='waitScale')return[R('lambda','主观夸大倍数 λ',1,3,.1,1.8)];
  if(kind==='sorting')return[R('person','观察居民的位置 x',.05,.95,.05,.45),R('z','预期去左边的比例',.1,.9,.05,.5)];
  if(kind==='pareto')return[R('shift','另一分配的分界变化',-.2,.2,.05,.1)];
  if(kind==='social')return[R('z','尝试去左边的比例',.2,.8,.025,.6)];
  return[R('a','左网点等待系数 a',.3,2.5,.1,1),R('b','右网点等待系数 b',.4,3,.1,2),R('z','预期去左边的比例',.1,.9,.05,.5)];
 }
 if(kind==='raffle')return name==='p3b'?[R('guess','当前选择L票的人数',100,700,10,300)]:[R('guess','当前选择L票的人数',100,700,10,300),R('v','L奖效用 v',.2,.8,.05,1/3)];
 if(kind==='matching')return[R('shareA','A类去第一场馆的比例',.2,.8,.05,.5),R('shareB','B类去第一场馆的比例',.2,.8,.05,.5)];
 if(kind==='matchingOne')return[R('a','A类总人数',4,10,1,6),R('b','B类总人数',2,4,1,4)];
 if(kind==='carNone')return[R('alpha','买家估值倍数 α',1.1,2.4,.05,1.5),R('filmStep','讲解画面',0,2,1,0)];
 if(['cars','carProof'].includes(kind))return[R('alpha','买家估值倍数 α',1.1,2.4,.05,1.5),R('m','尝试出售的最低质量车数',1,6,1,2),R('filmStep','讲解画面',0,4,1,0)];
 if(kind==='carPareto')return[R('alpha','买家估值倍数 α',1.1,2.4,.05,1.5),R('m','尝试出售的最低质量车数',1,6,1,2),R('filmStep','讲解画面',0,1,1,0)];
 if(kind==='fish')return[R('v','消费者单位价值 v',2,8,.5,6),R('k','单位成本斜率 k',.9,2,.05,1),R('filmStep','讲解画面',0,6,.1,0)];
 if(['fishPareto','fishTax'].includes(kind))return[R('v','消费者单位价值 v',2,8,.5,6),R('k','单位成本斜率 k',.9,2,.05,1),R('fraction','减产后 / 原均衡产量',.25,.8,.05,.5),R('filmStep','讲解画面',0,kind==='fishTax'?2:1,.1,0)];
 if(['health','healthExternal'].includes(kind))return[R('p','每单位健康服务价格 p',1.5,3,.1,2),R('m','初始财富 m',8,13,.5,10),R('filmStep','讲解画面',0,2,.1,0)];
 return[];
}
function fields(){let out='<div class="field"><label for="case">教材原题或知识点</label><select id="case" aria-label="切换第13章实验">';
 for(const k of available)out+='<option value="'+k+'" '+(k===name?'selected':'')+'>'+esc(cases[k].label)+'</option>';
 out+='</select></div>';
 $('fields').innerHTML=out+controls.map(c=>'<div class="field"><label for="'+c.key+'">'+esc(c.label)+'<output id="out-'+c.key+'">'+fmt(state[c.key])+'</output></label><input id="'+c.key+'" data-key="'+c.key+'" type="range" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+state[c.key]+'"></div>').join('');
}
function E(tag,attrs={},body=null){const a=Object.entries(attrs).map(([k,v])=>k+'="'+esc(v)+'"').join(' ');return'<'+tag+(a?' '+a:'')+(body===null?'/':'>'+body+'</'+tag)+'>'}
function txt(x,y,s,size=13,color=C.ink,anchor='middle'){const scale=Math.min(1.6,Math.max(1,620/Math.max(320,$('plot').clientWidth)));return E('text',{x,y,'text-anchor':anchor,fill:color,'font-size':size*scale},esc(s))}
const dot=(x,y,color,id,r=7)=>E('circle',{'data-motion':id,cx:x,cy:y,r,fill:color,stroke:C.paper,'stroke-width':2});
const P=(d,color,width=2,dash='',fill='none')=>E('path',{d,stroke:color,'stroke-width':width,'stroke-dasharray':dash,fill});
function axes(xlabel,ylabel,x0=60,y0=300,x1=612,y1=43){let svg='';for(let i=1;i<5;i++)svg+=P('M'+x0+' '+(y0-i*58)+'H'+x1,C.grid,1);return svg+P('M'+x0+' '+y1+'V'+y0+'H'+x1,C.muted,1.5)+txt(x0,y1-14,ylabel,12,C.ink,'start')+txt(x1,y0+45,xlabel,12,C.ink,'end')}
function curve(fn,start,end,X,Y,n=100){let d='';for(let i=0;i<=n;i++){const x=start+(end-start)*i/n,y=fn(x);if(Number.isFinite(y))d+=(d?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2)}return d}
function table(heads,rows){return'<table><thead><tr>'+heads.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(typeof x==='number'?fmt(x):x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function servicePlot(r,kind,phase,compare=null){
 const X=x=>65+535*x,yMax=Math.max(4.5,(r.mode==='all'?r.lambda:1)*(1+r.scale*Math.max(r.a,r.b))*1.12),Y=y=>286-215*y/yMax;
 let svg=axes('街道位置 x / 左侧客流比例 z','通勤 + 等待时间');
 const crossing=['crossing','q131','compare','improve','allScale','waitScale'].includes(kind);
 const plotA=(r.mode==='all'?r.lambda:1)*(1+r.scale*r.a),plotB=(r.mode==='all'?r.lambda:1)*(1+r.scale*r.b);
 if(crossing){svg+=P(curve(x=>plotA*x,0,1,X,Y),C.green,2.5)+P(curve(x=>plotB*(1-x),0,1,X,Y),C.purple,2.5);}
 else{svg+=P(curve(x=>r.left(x),0,1,X,Y),C.green,2.5)+P(curve(x=>r.right(x),0,1,X,Y),C.purple,2.5);}
 const crossingX=crossing?r.eq:r.cut,crossingY=crossing?plotA*r.eq:r.left(crossingX);
 svg+=P('M'+X(r.z)+' 286V'+Y(r.left(r.z)),C.muted,1.5,'5 4');
 if(phase>=1)svg+=dot(X(crossingX),Y(crossingY),C.red,'choice-boundary')+txt(X(crossingX)+9,Y(crossingY)-15,crossing?'均衡分界':'按预期选择的分界',11,C.red,'start');
 if(compare&&phase>=2)svg+=dot(X(compare.eq),Y((1+compare.scale*compare.a)*compare.eq),C.gold,'old-boundary')+txt(X(compare.eq)-8,Y((1+compare.scale*compare.a)*compare.eq)+25,'原均衡',11,C.gold,'end');
 svg+=P('M65 325H600',C.muted,1.5)+txt(65,355,'网点0',11,C.green,'start')+txt(600,355,'网点1',11,C.purple,'end');
 if(kind==='sorting'&&phase>=2)svg+=dot(X(state.person),325,C.gold,'resident')+txt(X(state.person),345,'居民x',11,C.gold);
 return svg
}
function paretoPlot(r,phase){const X=x=>65+535*x,Y=y=>290-180*y/2.1;let svg=axes('居民位置 x','实际总时间');
 const left=x=>x+r.a*r.eq,right=x=>1-x+r.b*(1-r.eq);
 svg+=P(curve(x=>x<=r.eq?left(x):right(x),0,1,X,Y),C.green,2.5);
 if(phase>=1)svg+=P(curve(x=>x<=r.next?x+r.a*r.next:1-x+r.b*(1-r.next),0,1,X,Y),C.red,2,'6 4');
 if(phase>=2)svg+=dot(X(r.switched),Y(r.oldLoss),C.green,'old-loss')+dot(X(r.switched),Y(r.newLoss),C.red,'new-loss')+P('M'+X(r.switched)+' '+Y(r.oldLoss)+'V'+Y(r.newLoss),C.gold,2);
 return svg}
function socialPlot(r,phase){const X=x=>65+535*x,Y=y=>292-210*(y-.8)/.9;let svg=axes('左侧客流比例 z','全体总时间');
 svg+=P(curve(x=>r.aggregate(x),.25,.85,X,Y),C.green,3);
 svg+=dot(X(r.eq),Y(r.eqLoss),C.red,'private-boundary')+txt(X(r.eq)-8,Y(r.eqLoss)-14,'个体均衡',11,C.red,'end');
 if(phase>=2)svg+=dot(X(r.social),Y(r.socialLoss),C.purple,'minimum')+txt(X(r.social)+8,Y(r.socialLoss)+24,'总时间最小',11,C.purple,'start');
 svg+=P('M'+X(state.z)+' 292V'+Y(r.aggregate(state.z)),C.muted,1.3,'5 5');return svg}
function rafflePlot(r,phase){const X=x=>65+535*(x-100)/650,yMax=Math.max(.0045,r.v/100*1.1),Y=y=>290-200*y/yMax;let svg=axes('选择L票的人数','单人中奖的期望效用');
 svg+=P(curve(x=>r.v/x,100,750,X,Y),C.green,2.5)+P(curve(x=>1/(r.N-x),100,750,X,Y),C.purple,2.5);
 svg+=dot(X(r.guess),Y(r.utilityL),C.green,'lottery-L')+dot(X(r.guess),Y(r.utilityH),C.purple,'lottery-H');
 if(phase>=2)svg+=dot(X(r.fixed),Y(r.v/r.fixed),C.red,'lottery-equilibrium')+txt(X(r.fixed)+8,Y(r.v/r.fixed)-13,'预期一致',11,C.red,'start');
 return svg}
function matchingPlot(r,phase){const baseX=[195,465],max=8;let svg=txt(195,42,'场馆1',15)+txt(465,42,'场馆2',15);
 for(let i=0;i<2;i++){const x=baseX[i],hA=170*r.A[i]/max,hB=170*r.B[i]/max;
  svg+=E('rect',{x:x-70,y:245-hA,width:54,height:hA,rx:4,fill:C.green,'data-motion':'A-'+i})
      +E('rect',{x:x+16,y:245-hB,width:54,height:hB,rx:4,fill:C.purple,'data-motion':'B-'+i})
      +txt(x-43,268,'A '+fmt(r.A[i]),12,C.green)+txt(x+43,268,'B '+fmt(r.B[i]),12,C.purple);
  if(phase>=1)svg+=txt(x,307,'A匹配 '+fmt(r.p[i]),11,C.green)+txt(x,329,'B匹配 '+fmt(r.q[i]),11,C.purple);
 }
 svg+=P('M75 245H590',C.muted,1.5);return svg}
function carPlot(r,phase){const compare=r.mode==='carParetoFilm',none=r.mode==='carNoTradeFilm',inset=compare||none,end=inset?380:600,X=i=>76+(inset?280:475)*i/(r.q.length-1),Y=y=>280-205*y/Math.max(1.35,r.chosen.p*1.15,(r.buyerValue||0)*1.1);let svg=axes('汽车按质量从低到高','保留价 / 市场价格（10万元）',60,300,inset?385:612,43);
 for(let i=0;i<r.q.length;i++){svg+=P('M'+X(i)+' 280V'+Y(r.q[i]),i<r.chosen.n?C.red:C.muted,3)+dot(X(i),Y(r.q[i]),i<r.chosen.n?C.red:C.muted,'car-'+i,6)+txt(X(i),307,String(i+1),11)}
 if(r.mode==='carFilm'||compare||none||phase>=1){svg+=P('M60 '+Y(r.chosen.p)+'H'+end,C.gold,2,'5 5')+txt(end,Y(r.chosen.p)-10,'统一价格',11,C.gold,'end')}
 if((r.mode==='carFilm'||compare||phase>=2)&&r.chosen.n>0)svg+=P('M60 '+Y(r.chosen.mean)+'H'+end,C.green,1.8,'4 5')+txt(end,Y(r.chosen.mean)+20,'售车均质',11,C.green,'end');
 if(compare&&r.eligible){svg+=E('rect',{x:408,y:75,width:204,height:176,rx:10,fill:C.wash})+txt(422,101,'这辆车的账',14,C.ink,'start')+txt(422,140,'车主保留 '+fmt(r.quality*10,4)+'万元',13,C.ink,'start')+txt(422,181,'双边价格 '+(phase>=1?fmt(r.bilateralPrice*10,4)+'万元':'待商量'),13,C.purple,'start')+txt(422,222,'买家价值 '+fmt(r.buyerValue*10,4)+'万元',13,C.ink,'start');if(phase>=1){const x=X(r.chosen.n);svg+=P('M'+x+' '+Y(r.quality)+'V'+Y(r.buyerValue),C.purple,4)+E('circle',{'data-motion':'bilateral-price','data-seller-value':r.quality,'data-buyer-value':r.buyerValue,'data-bilateral-price':r.bilateralPrice,cx:x,cy:Y(r.bilateralPrice),r:7,fill:C.purple,stroke:C.paper,'stroke-width':2});}}
 if(none){svg+=P('M60 '+Y(r.buyerValue)+'H'+end,C.purple,2,'3 4')+E('rect',{x:408,y:70,width:204,height:184,rx:10,fill:C.wash})+txt(422,97,'不交易的账',14,C.ink,'start')+txt(422,133,'最低保留 '+fmt(r.minimum*10,4)+'万元',13,C.ink,'start')+txt(422,169,'市场价格 '+fmt(r.chosen.p*10,4)+'万元',13,C.gold,'start')+txt(422,205,'买家愿付 '+fmt(r.buyerValue*10,4)+'万元',13,C.purple,'start')+txt(422,238,r.noTradeSupported?'双方可不交易':'买卖选择不一致',13,C.ink,'start');svg=E('g',{'data-model-price':r.chosen.p,'data-model-belief':r.belief,'data-model-willingness':r.buyerValue,'data-model-no-trade':r.noTradeSupported},svg);}
 return svg}
function fishPlot(r,phase){const ymax=r.mode==='candidate'?Math.max(17,r.k*10*1.05,r.trialPrice*1.1):17,X=x=>65+535*x/10,Y=y=>290-205*y/ymax;let svg=axes('总捕捞量 T','消费者价值 / 单位成本');
 svg+=P(curve(x=>r.k*x,0,10,X,Y),C.green,2.5)+(r.mode==='candidate'?'':P(curve(x=>2*r.k*x,0,Math.min(10,17/(2*r.k)),X,Y),C.purple,2.5))+P('M65 '+Y(r.v)+'H600',C.red,2);
 if(r.mode==='candidate'&&Math.abs(r.trialPrice-r.v)>1e-10)svg+=P('M65 '+Y(r.trialPrice)+'H600','#4f78a0',2,'6 4');
 if(r.mode==='tax'&&phase>0)svg+=P(curve(x=>r.k*x+r.tax,0,Math.min(10,(17-r.tax)/r.k),X,Y),C.gold,2,'5 4');
 if(r.mode!=='candidate')svg+=dot(X(r.eqT),Y(r.v),C.red,'old-catch');
 if(r.mode==='candidate'){
  svg+=P('M'+X(r.T)+' 290V'+Y(r.c),C.muted,1.2,'4 4');
  svg+=E('circle',{'data-motion':'candidate-catch','data-model-total':r.T,'data-model-cost':r.c,'data-model-price':r.trialPrice,'data-model-branch':r.branch,'data-model-consumer-branch':r.consumerBranch,'data-model-consistent':r.consistent,cx:X(r.T),cy:Y(r.c),r:7,fill:C.gold,stroke:C.paper,'stroke-width':2});
  svg+=txt(Math.min(580,X(r.T)+9),Y(r.c)-12,'假设总量',11,C.gold,'start');
 }else if(r.mode==='pareto'&&phase>0){
  svg+=P('M'+X(r.T)+' '+Y(r.c)+'V'+Y(r.v),C.gold,2.5)+P('M65 '+Y(r.p)+'H'+X(r.T),C.gold,1.4,'4 4');
  svg+=E('circle',{'data-motion':'new-catch','data-model-total':r.T,'data-model-cost':r.c,'data-model-price':r.p,cx:X(r.T),cy:Y(r.c),r:7,fill:C.green,stroke:C.paper,'stroke-width':2});
  svg+=dot(X(r.T),Y(r.p),C.gold,'agreed-price')+txt(X(r.T)+10,Y(r.p)-10,'协商价',11,C.gold,'start');
 }else if(phase>0&&r.mode==='tax'){
  svg+=P('M'+X(r.T)+' '+Y(r.c)+'V'+Y(r.v),C.gold,2.5);
  svg+=E('circle',{'data-motion':'tax-equilibrium','data-model-total':r.T,'data-model-cost':r.c,'data-model-tax':r.tax,'data-model-revenue':r.revenue,'data-model-transfer':r.transfer,cx:X(r.T),cy:Y(r.v),r:7,fill:C.gold,stroke:C.paper,'stroke-width':2});
  svg+=dot(X(r.T),Y(r.c),C.green,'tax-base-cost')+txt(X(r.T)+9,Y(r.v)-12,'含税均衡',11,C.gold,'start');
 }
 return svg}
function healthPlot(r,phase){const X=x=>65+535*x/3.2,yMax=Math.max(4.5,r.privateUtility*1.2,r.socialUtility*1.2),Y=y=>290-205*y/yMax;let svg=axes('每人健康服务 y','货币 × 存活概率');
 const privateObjective=x=>(r.m-r.p*x)*survival(x,r.privateY),socialObjective=x=>(r.m-r.p*x)*survival(x,x);
 svg+=P(curve(privateObjective,0,Math.min(3.2,r.m/r.p),X,Y),C.green,2.5);
 if(phase>=1)svg+=P(curve(socialObjective,0,Math.min(3.2,r.m/r.p),X,Y),C.purple,2.5,'6 4');
 svg+=dot(X(r.privateY),Y(r.privateUtility),C.green,'private-health');
 if(phase>=1)svg+=E('circle',{'data-motion':'collective-health','data-model-y':r.collectiveY,'data-model-utility':r.collectiveUtility,cx:X(r.collectiveY),cy:Y(r.collectiveUtility),r:7,fill:C.purple,stroke:C.paper,'stroke-width':2});
 return svg}
function panel(){
 const c=cases[name],k=c.kind,s=state;
 let svg='',metrics=[],reading='',formula='',extra='',legend='',result=null;
 const add=(label,value)=>metrics.push([label,typeof value==='number'?fmt(value):value]);
 if(['service','crossing','sorting','pareto','improve','compare','allScale','waitScale','social'].includes(k)){
  legend='绿色：左网点　紫色：右网点　红色：选择或均衡　金色：比较';
  if(k==='pareto'){
   const r=servicePareto({shift:s.shift});result=r;svg=paretoPlot(r,stage);
   add('旧均衡分界',r.eq);add('新分配的分界',r.next);add('转移者原总时间',r.oldLoss);add('转移者新总时间',r.newLoss);
   reading=Math.abs(s.shift)<1e-9?'分界没有变化，所以这仍是同一个配置；帕累托改进需要至少一人严格更好。':stage<2?'试把居民重新分配。每改变一侧客流，都要重新计算两边的等待。':'被改派的居民原本选择更好的网点；新网点客流方向又让他更不利，因此这个新分配不是帕累托改进。';
   formula=Math.abs(s.shift)<1e-9?'l^{\\prime}=l^*,\\quad L_x(l^{\\prime}(x),l^{\\prime})=L_x(l^*(x),l^*)':T('L_x(0,l)=x+f_0(\\alpha(l,0)),\\quad L_x(1,l)=1-x+f_1(\\alpha(l,1))','L_x(l^{\\prime}(x),l^{\\prime})>L_x(l^*(x),l^*)\\quad\\text{对某个转移者}');
   extra=table(['配置','左侧客流比例','所选转移者总时间'],[['均衡',r.eq,r.oldLoss],['另一分配',r.next,r.newLoss]])+(Math.abs(s.shift)<1e-9?'<p>分界未变化，两个配置相同。</p>':'<p>标出的居民是新旧分界之间的一位示例；一般证明考虑正质量的转移居民，而非只看这一点。</p>')
  }else if(k==='social'){
   const r=service({a:1,b:2,z:s.z});result=r;svg=socialPlot(r,stage);
   add('个体均衡分界',r.eq);add('总时间最小分界',r.social);add('均衡总时间',r.eqLoss);add('最小总时间',r.socialLoss);
   reading=stage<2?'原题指定左网点等待z、右网点等待2(1−z)。个体均衡在z=0.6。':'总时间最小在z=0.625，比个体均衡的总时间略低；但若强制改派，部分人可能更差，故不与帕累托稳定矛盾。';
   formula=T('D(z)=\\int_0^z[x+z]dx+\\int_z^1[(1-x)+2(1-z)]dx','z^{eq}=0.6,\\qquad z^{min}=0.625');
   extra='<p>原题第二个积分印成f₁(z)；右网点实际客流是1−z，动态计算采用f₁(1−z)。</p>'+table(['分界','总时间'],[['个体均衡',r.eqLoss],['总时间最小',r.socialLoss],['尝试分界',r.totalLoss]])
  }else if(k==='improve'){
   const old=service({a:1,b:2,z:.5}),r=service({a:s.a,b:2,z:.5});result=r;svg=servicePlot(r,'improve',stage,old);
   add('原左侧比例',old.eq);add('提效后左侧比例',r.eq);add('新左侧等待',r.eqWait[0]);add('新右侧等待',r.eqWait[1]);
   reading=stage<2?'把左侧等待技术从f₀(n)=n改为f̂₀(n)='+fmt(s.a)+'n；左侧正客流的等待更短。':'绿线变平，和右侧线的交点右移；更多居民去左网点。个体对自己的拥堵影响仍可忽略。';
   formula='\\widehat f_0(n)<f_0(n)\\ (n>0)\\quad\\Longrightarrow\\quad\\widehat z^*>z^*';
   extra='<p>这里用线性技术显示一般比较静态；原题并未限制等待函数必须线性。</p>'
  }else if(k==='allScale'||k==='waitScale'){
   const mode=k==='allScale'?'all':'wait',old=service({a:1,b:2,z:.5}),r=service({a:1,b:2,z:.5,lambda:s.lambda,mode});result=r;
   svg=servicePlot(r,k,stage,old);add('原分界',old.eq);add('主观倍率 λ',s.lambda);add('新的分界',r.eq);add('与原分界之差',r.eq-old.eq);
   reading=k==='allScale'?'把两个备选网点的全部通勤加等待时间同乘λ，大小比较不变，均衡客流也不变。':'只夸大等待、不夸大通勤时，拥堵差异的权重上升。右侧等待技术更慢，均衡居民会更多地选择左侧。';
   formula=k==='allScale'?T('\\lambda(x+t_0)\\le\\lambda(1-x+t_1)\\Longleftrightarrow x+t_0\\le1-x+t_1','z^*=(1+b)/(2+a+b)'):T('x+\\lambda az=1-x+\\lambda b(1-z)','z^*(\\lambda)=\\frac{1+\\lambda b}{2+\\lambda(a+b)}');
   extra='<p>主观夸大只改变决策比较；展示的真实等待时间仍由实际客流决定。若两侧等待技术相同，只夸大等待也不会移动对称分界。</p>'
  }else{
   const r=service({a:s.a,b:s.b,z:s.z});result=r;svg=servicePlot(r,k==='service'&&name==='q131'?'crossing':k,stage);
   add('预期左侧客流',r.z);add('按预期想去左侧',r.cut);add('唯一均衡分界',r.eq);add('预期一致性差值',r.gap);
   if(k==='compare'){
    add('左网点均衡等待',r.eqWait[0]);add('右网点均衡等待',r.eqWait[1]);
    reading=s.a<s.b?'左侧等待技术更快，会吸引更多居民；但均衡时左侧等待仍比右侧短。可拖动系数检验。':s.a>s.b?'右侧等待技术更快，会吸引更多居民；但均衡时右侧等待仍比左侧短。可拖动系数检验。':'两侧等待技术相同，均衡分界和等待时间都对称。';
    formula='f_1(1-z^*)-f_0(z^*)=\\frac{b-a}{2+a+b}';
    extra=table(['网点','等待系数','均衡等待'],[['左',s.a,r.eqWait[0]],['右',s.b,r.eqWait[1]]])
   }else if(k==='sorting'){
    const x=s.person,zero=x+r.beliefs[0],one=1-x+r.beliefs[1];
    add('观察居民位置',x);add('其去左总时间',zero);add('其去右总时间',one);
    reading='固定同一组等待预期，居民位置越靠左，去左的通勤时间越短、去右越长。若某人愿去左边，所有更靠左的人也会去左边。';
    formula=T('x+t_0\\le1-x+t_1','y<x\\Longrightarrow y+t_0<x+t_0\\le1-x+t_1<1-y+t_1');
    extra='<p>拖动“观察居民的位置”看两边总时间；图中金点是该居民，不是新增服务网点。</p>'
   }else if(k==='crossing'){
    reading='让左边客流比例z从0向1变化：左网点的总时间严格上升，右网点严格下降。两条线从相反端点出发，恰好交一次。';
    formula='z+f_0(z)=1-z+f_1(1-z)\\quad\\text{有且仅有一个解 }z^*';
    extra='<p>图中的直线是f₀(n)=an、f₁(n)=bn的可计算例子；唯一交点的证明适用于原书给出的连续递增等待函数。</p>'
   }else{
    reading=name==='q131'?'先用两条反向的总时间曲线确定唯一分界；再把分界两侧居民分别送到各自更好的网点，并检验等待预期与实际客流一致。':stage<2?'先假设去左侧的居民比例，形成两边等待预期；比较每个人通勤加等待的总时间。':'红点表示按预期会选择左侧的人口分界。只有它与预期客流比例重合，居民选择和等待预期才互相一致。';
    formula=T('t_0=f_0(z),\\quad t_1=f_1(1-z)','z^*=\\frac{1+b}{2+a+b},\\quad z^*+t_0=1-z^*+t_1');
    extra=table(['左网点等待','右网点等待','当前总时间','均衡总时间'],[[...r.beliefs,r.totalLoss,r.eqLoss]])+'<p>居民是连续人口；分界点本身对客流没有影响，因此均衡分配的唯一性允许该点选择任意一侧。银行位置和等待技术固定，不是银行自己的最优化问题。</p>'
   }
  }
 }else if(k==='raffle'){
  const r=raffle({v:s.v??1/3,guess:s.guess});result=r;svg=rafflePlot(r,stage);
  add('L票人数',r.guess);add('H票人数',r.nH);add('L票期望效用',r.utilityL.toFixed(6));add('H票期望效用',r.utilityH.toFixed(6));
  reading=stage<2?'每类票只抽中一张。同类票越多人买，自己中该奖的概率就越低；比较L的v/nL和H的1/nH。':'两类票的期望效用相等、并且预期人数等于实际人数时，才构成正人数均衡。v=1/3时是300张L、900张H。';
  formula=T('EU(L)=\\frac{v}{n_L},\\quad EU(H)=\\frac{1}{1200-n_L}','n_L^*=\\frac{1200v}{1+v};\\quad v=\\frac{1}{3}\\Rightarrow n_L^*=300');
  extra='<p>人数必须是整数；滑块中的任意v只显示连续比例固定点的参考值。原题v=1/3恰给整数300，可以直接核对有限人数均衡。</p>'
  legend='绿色：L票期望效用　紫色：H票期望效用　红点：预期一致'
 }else if(k==='matching'||k==='matchingOne'){
  const one=k==='matchingOne',r=matching({a:s.a??6,b:s.b??4,shareA:s.shareA,shareB:s.shareB,oneVenue:one});result=r;svg=matchingPlot(r,stage);
  add('A类总人数',r.a);add('B类总人数',r.b);add('逐场馆选择均衡',r.correctedEquilibrium?'满足':'不满足');add('原题跨馆归一化',r.printedNormalization?'满足':'冲突');
  reading=one?'所有人去场馆1，空场馆的逐场馆条件匹配概率为0；任何已有参与者都没有动力离开。原文额外的概率求和条件在a>b时通常不成立。':r.correctedEquilibrium?'两类人分到两馆的比例相同。每馆A类匹配概率都为b/a，B类都为1，任何人换馆也不会更好。':'两馆比例不一致，正人数的两类中至少有一类会更愿意换馆；所以这个候选不是逐场馆条件概率下的均衡。';
  formula=T('p_j=\\min\\{1,\\frac{b_j}{a_j}\\},\\qquad q_j=\\min\\{1,\\frac{a_j}{b_j}\\}','\\frac{b_1}{a_1}=\\frac{b_2}{a_2}=\\frac{b}{a}\\quad\\text{为双馆正人数均衡}');
  extra=table(['场馆','A类人数','B类人数','A匹配概率','B匹配概率'],[[1,r.A[0],r.B[0],r.p[0],r.q[0]],[2,r.A[1],r.B[1],r.p[1],r.q[1]]])+'<p>原题又写p₁+p₂=1、q₁+q₂=1；但(a)同时要求q₁=q₂=1，两句互相矛盾。上图按更符合题意的“各场馆内条件匹配概率”计算，并保留这处原文矛盾，不能把修订解释冒称原题严格解。</p>';
  legend='绿色：A类人数　紫色：B类人数；下方显示各自进馆后匹配成功概率'
 }else if(['cars','carProof','carNone','carPareto'].includes(k)){
  const carStory=['cars','carProof'].includes(k),r=carStory?carFilmState({alpha:s.alpha,phase:s.filmStep}):k==='carPareto'?carParetoFilmState({alpha:s.alpha,m:s.m,phase:s.filmStep}):k==='carNone'?carNoTradeFilmState({alpha:s.alpha,phase:s.filmStep}):cars({alpha:s.alpha,m:s.m});if(carStory||k==='carPareto'||k==='carNone')stage=r.phase;result=r;svg=carPlot(r,stage);
  if(k==='carNone'){add('候选出售辆数',0);add('最低车主保留价',fmt(r.minimum*10,4)+'万元');add('市场价格',fmt(r.chosen.p*10,4)+'万元');add('买家预计愿付',fmt(r.buyerValue*10,4)+'万元');add('无人交易是否成立',r.noTradeSupported?'是':'否')}else{add('候选出售辆数',r.chosen.n);add('售车平均质量',carStory?'约'+fmt(r.chosen.mean,4):r.chosen.mean);add('统一价格',carStory||k==='carPareto'?fmt(r.chosen.p*10,4)+'万元':r.chosen.p);add('候选是否均衡',r.chosen.valid?'是':'否')}
  if(carStory){
   const unwilling=r.q.slice(0,r.chosen.n).filter(q=>q>r.chosen.p+1e-9),excluded=r.q.slice(r.chosen.n).filter(q=>q<r.chosen.p-1e-9),m=r.chosen.n,price=fmt(r.chosen.p*10,4),avg=fmt(r.chosen.mean,4);
   const sellerVerdict=unwilling.length?'其中有'+unwilling.length+'位车主觉得售价低于自家车的保留价，不愿卖，所以这个猜测站不住。':excluded.length?'有'+excluded.length+'位本来没算进去的车主发现售价高于自己的保留价，也想卖，所以这个猜测站不住。':'愿卖和不愿卖的车主都支持这个猜测；买家在此价格无差异，可安排恰好'+m+'位买家成交。';
   reading='假设质量最低的'+m+'辆车出售，它们的平均质量约为'+avg+'，买家统一愿付'+price+'万元。'+sellerVerdict+'这只是检验一组猜测，不是市场必然沿此顺序变化。';
   formula=T('A(m)=\\frac{1}{m}\\sum_{i=1}^m Q(s_i)',m===r.q.length?'p=\\alpha A(m),\\quad Q(s_m)\\le p':'p=\\alpha A(m),\\quad Q(s_m)\\le p\\le Q(s_{m+1})');
   extra=table(['候选车数','平均质量','统一价（万元）','双方是否支持'],r.candidates.map(x=>[x.n,fmt(x.mean,4),fmt(x.p*10,4),x.valid?'是':'否']))+'<section aria-label="二手车做题步骤"><h3>遇到这种题怎么做</h3><p><strong>第一步：按质量排序。</strong>从低到高列出车主保留价。买家人数多于车辆，每人最多买一辆；买家无法识别单辆质量。</p><p><strong>第二步：先猜谁来卖。</strong>逐个猜前 m 辆车出售，求它们的平均质量 A(m)，再算买方愿付的统一价格 p=αA(m)。这是让正交易时无差异买家恰好与卖车数相等的候选价格。</p><p><strong>第三步：核对两边车主。</strong>售车者的保留价不能高于价格；未售车主的保留价不能低于价格。相等时车主无差异，允许其卖或不卖；所有车都卖时不用检查下一辆。</p><p><strong>第四步：别漏掉别的均衡。</strong>当前例子中，出售 '+r.candidates.filter(x=>x.valid).map(x=>x.n).join('、')+' 辆均可成为正交易均衡。原书证明至少存在一个正交易均衡，并不说正交易均衡一定唯一。要找命题构造的均衡，可取满足 αA(m)≥第 m 辆质量的最大 m，再检查下一辆与买卖数量。</p><p><strong>为什么最大车数一定可用？</strong>最低质量为正、买家估值倍数大于1，所以只卖最低质量车一定满足卖方条件，候选集合非空。取最大候选后，若还有下一辆，把它加入后的平均质量不低于原平均；由于更大的候选不满足卖方条件，下一辆的质量必高于当前价格。因此已选车主愿卖，未选车主愿留；买家在该价格无差异，可以选出等量买家成交。</p><p><strong>为什么较低质量先卖？</strong>任一正交易均衡都有买家购买；买家人数多于车数，也至少有买家不买。两边最优性迫使价格等于买家对平均质量的估值。每辆已售车的质量不高于价格，未售车的质量不低于价格，因此已售质量不高于未售质量；相同质量的车可以因无差异作不同选择。</p><p>表中价格以万元计，其他质量是教材模型的无量纲数值；每单位质量对应10万元的车主保留价值。人数、质量和倍数均为本站举例。</p></section>';
  }else if(k==='carNone'){
   const sellerText=r.chosen.p<r.minimum?'价格低于最低车主保留价，所以车主都不愿卖。':'价格等于最低保留价，最低价车主无差异，可以选择不卖。';
   const buyerText=r.buyerWants?'买家愿付'+fmt(r.buyerValue*10,4)+'万元，高于市场价'+fmt(r.chosen.p*10,4)+'万元，所以买家想买。':'买家预计愿付'+fmt(r.buyerValue*10,4)+'万元，低于市场价'+fmt(r.chosen.p*10,4)+'万元，所以买家不买。';
   reading='当前假设无人卖车，买家对待售车质量的预期为'+fmt(r.belief,4)+'。'+sellerText+buyerText+(r.noTradeSupported?'双方都可以不交易；原书在空集合时没有要求预期与实际售车均值一致。':'买家想买而假设没有车出售，买卖选择与无人交易无法同时成立。');
   formula=stage===0?T('\\widehat q=0,\\quad p=\\frac{1}{2}q_{\\min}','p<q_{\\min},\\quad p>\\alpha\\widehat q'):T('\\widehat q=q_{\\min},\\quad \\alpha>1','p\\le q_{\\min}<\\alpha\\widehat q');
   extra='<section aria-label="无人交易证明"><h3>这类题怎么做</h3><p><strong>第一步：检查车主。</strong>无人卖车时，每位车主都必须愿意留车；若价格超过最低保留价，就有车主严格愿卖。因此无人交易需要价格不高于最低保留价，等于时最低价车主无差异。</p><p><strong>第二步：检查买家。</strong>若价格低于买家对质量的预期价值，买家严格想买；无人购买需要价格至少等于该预期价值。等于时买家无差异，可以不买。</p><p><strong>第三步：区分预期条件。</strong>教材定义在没有车成交时不要求质量预期等于空集合的平均质量。预期为0、价格严格低于最低保留价时，买卖双方都不想交易，符合原定义。</p><p><strong>第四步：加上知道质量下限的条件。</strong>若预期至少等于最低真实质量，且 α&gt;1，那么买家预期价值严格高于最低保留价。要让车主都不卖，价格不能超过最低保留价；但此时买家严格想买，矛盾。若价格再高，最低价车主又会严格愿卖。因此在这个附加条件下，无人交易不构成均衡。</p><p>这里改变预期与价格是在比较不同候选，不表示现实买家会自动沿此路径改变信念；例子的6辆车、8位买家与数值为本站构造。</p></section>'
  }else if(k==='carPareto'){
   if(r.eligible){add('未售车主保留价值',fmt(r.quality*10,4)+'万元');add('买家对该车的价值',fmt(r.buyerValue*10,4)+'万元');if(stage>=1){add('假想双边价格',fmt(r.bilateralPrice*10,4)+'万元');add('车主与买家各增益',fmt(r.sellerGain*10,4)+'万元')}}
   reading=!r.chosen.valid?'当前售车数不满足市场均衡条件，不能用它代表原均衡。':!r.untraded.length?'这个候选中所有车已售出，没有未售车辆可用于下面的证明。':stage===0?'原均衡已有'+r.chosen.n+'辆车按统一价格成交；一位未出售的车主保留价值为'+fmt(r.quality*10,4)+'万元，一位还没买车的买家对这辆车的价值为'+fmt(r.buyerValue*10,4)+'万元。他们能不能另外达成一笔双方都愿意的交易？':'假想双方能识别并交易这辆特定的车，协商价为'+fmt(r.bilateralPrice*10,4)+'万元。车主多得'+fmt(r.sellerGain*10,4)+'万元，买家多得'+fmt(r.buyerGain*10,4)+'万元；其他人的配置不变，因此这是帕累托改进。它是福利比较，不表示匿名市场能自动实现。';
   formula='q<p^{\\text{双边}}<\\alpha q\\quad(\\alpha>1)';
   extra='<section aria-label="二手车福利证明"><h3>这类题怎么证明</h3><p><strong>第一步：先核对原均衡。</strong>出售车辆和未出售车辆的车主都愿意按统一价格作出原选择，买卖数量相等，买家的质量预期与售出车辆的平均质量一致。</p><p><strong>第二步：找一辆未卖车和一位未购车的买家。</strong>车主留车的价值是 q，买家对这辆车的价值是 αq。由于 α&gt;1，中间存在双方都接受的价格。</p><p><strong>第三步：算两笔增益。</strong>设双边价格在 q 和 αq 之间，车主比留车多得“价格减 q”，买家比不买车多得“αq 减价格”；都严格为正，其他人的配置保持不变。资金和车辆一一转移，没有凭空增加资源。</p><p><strong>注意条件：</strong>先要有未售车辆，且有未购车的买家。这个假想配置可用于检验帕累托效率；它假设能识别并安排特定车辆的转移，不能声称原来的匿名统一价格机制已经实现它。全卖时不能用这辆未售车构造证明。</p></section>'
  }else if(k==='carProof'){
   add('可行候选中的最大售车数',r.maximal.n);
   reading=stage<2?'从最低质量车开始，依次计算前m辆平均质量A(m)和买方统一支付αA(m)。':'取满足αA(m)≥第m辆质量的最大m。第m+1辆保留价高于这个价格；所有买家在p=αA(m)时无差异，选恰好m个成交。';
   formula=T('A(m)=\\frac{1}{m}\\sum_{i=1}^m Q(s_i)','m^*=\\max\\{m:\\alpha A(m)\\ge Q(s_m)\\},\\quad p^*=\\alpha A(m^*)');
   extra=table(['候选m','平均质量','买方价格','卖家条件通过'],r.candidates.map(x=>[x.n,x.mean,x.p,x.valid?'是':'否']))
  }else{
   reading=stage<2?'把车辆按质量排序。卖家知道自己的质量；买家只按待售车辆的平均质量估计买到的车。':'红点是候选出售集合；红车质量都不高于价格，未售车质量都不低于价格；买家在统一价α乘售车平均质量时无差异。';
   formula=T('Q(s_1)\\le\\cdots\\le Q(s_n)','Q(s_m)\\le p=\\alpha\\widehat q\\le Q(s_{m+1})');
   extra=table(['候选m','平均质量','价格','符合均衡'],r.candidates.map(x=>[x.n,x.mean,x.p,x.valid?'是':'否']))+'<p>本站质量数值是独立构造。买方数比车多两人，正交易时可恰好选m个无差异买家成交；有效正交易均衡不一定唯一。</p>'
  }
  legend=k==='carNone'?'灰色：假设未出售的车　金线：市场价　紫线：买家预计愿付的价格':k==='carPareto'?'红色：原均衡出售车辆　灰色：原均衡未售车辆　金线：原统一价　绿线：售车均质　紫色：假想交易的双方价值与协商价':'红色：候选出售车辆　灰色：保留车辆　金线：统一价格　绿线：待售平均质量'
 }else if(['fish','fishPareto','fishTax'].includes(k)){
  const r=k==='fishPareto'?fishingParetoFilmState({v:s.v,k:s.k,fraction:s.fraction,phase:s.filmStep}):k==='fishTax'?fishingTaxFilmState({v:s.v,k:s.k,fraction:s.fraction,phase:s.filmStep}):fishingEquilibriumFilmState({v:s.v,k:s.k,phase:s.filmStep});stage=r.phase;result=r;svg=fishPlot(r,stage);
  if(k==='fish'){add('假设总捕捞',r.T);add('对应单位成本',r.c);add('当前价格',r.trialPrice);add('消费者单位价值',r.v);add('渔民最优总捕捞',r.branch==='indifferent'?'可在0至10之间':r.bestTotal);add('消费者最优总购买',r.consumerBranch==='indifferent'?'可在0至10之间':r.bestDemand)}else{add('原均衡总捕捞',r.eqT);add('当前总捕捞',r.T);add('每人消费者收益',r.consumer);add('每人渔民收益',r.fisher)}
  if(k==='fishPareto'){
   reading=stage===0?'原均衡时，每单位鱼的价格、消费者价值和渔民单位成本都是'+fmt(r.v)+'元，双方净收益都为0。':'大家一起少捕，当前总量为'+fmt(r.T)+'，每单位成本降至'+fmt(r.c)+'元。协商价'+fmt(r.p)+'元位于成本和'+fmt(r.v)+'元价值之间；只要减产且总量仍为正，双方都获得正收益。';
   formula=stage===0?'p^*=v=c(T^*)':'0<\\widehat T<T^*,\\qquad c(\\widehat T)<\\widehat p<v';
   extra=table(['计划','总捕捞','每消费者增益','每渔民增益'],[['原均衡',r.eqT,0,0],['当前协商计划',r.T,r.consumer,r.fisher]])+'<section aria-label="减产证明"><h3>这类题怎么证明</h3><p><strong>第一步：算原来的账。</strong>均衡时，价格、消费者价值和单位成本相等，每单位鱼对双方的净收益都是0。</p><p><strong>第二步：一起少捕。</strong>选一个大于0且低于原均衡的总量，并让每位渔民、每位消费者按相同比例缩减；成本函数递增，因此新单位成本低于消费者价值。</p><p><strong>第三步：在中间谈价格。</strong>选择高于新成本、低于消费者价值的协商价。每位渔民每单位的收益是协商价减去成本，每位消费者每单位的收益是价值减去协商价；正数量下双方严格受益，交易总额收支相等。</p><p><strong>注意：</strong>这里改由双方协商，考察另一种可行分配。线性成本、人数和把总量减半都是本站示例；一般证明不依赖减半。</p></section>';
  }else if(k==='fishTax'){
   add('每单位税',r.tax);add('税收总额',r.revenue);add('每人已返还',r.transfer);add('尚未返还税款',r.retained);
   reading=stage===0?'先看没有税的原均衡：价格、消费者价值和单位成本相等，税收与双方收益都是0。':stage<=1?'每单位税为'+fmt(r.tax)+'元，含税成本曲线上移，当前均衡捕捞为'+fmt(r.T)+'。政府收了'+fmt(r.revenue)+'元，但此时还没有返还，两方个人净收益仍为0。':'当前税款每人已收到'+fmt(r.transfer)+'元，政府仍留存'+fmt(r.retained)+'元。只有实际返还后，接受返还的人才获得这部分收益。';
   formula=T('p=v=c(T)+\\tau','R=\\tau T,\\quad R=\\text{已返还}+\\text{政府留存}');
   extra=table(['项目','当前数值'],[['捕鱼量',r.T],['每单位捕鱼成本',r.c],['每单位税',r.tax],['税收总额',r.revenue],['已返还比例',fmt(r.rebateShare*100)+'%'],['每人已返还',r.transfer],['政府留存',r.retained]])+'<section aria-label="税收推导"><h3>做题时分清三笔账</h3><p><strong>第一笔：原均衡。</strong>在教材的条件下，价格、消费者单位价值与捕鱼单位成本相等，双方净收益为0。</p><p><strong>第二笔：征税后的市场。</strong>要把捕捞量压到指定的正数量，就让每单位税等于消费者价值减去该数量下的单位成本。新均衡中，捕鱼单位成本加税等于价格；税收等于每单位税乘总捕捞。</p><p><strong>第三笔：税款去哪里。</strong>在本例中，消费者的交易净收益与渔民缴税后的利润仍为0。税款留在政府时不能算成个人收入；本站演示把税款均分给10位消费者和5位渔民，只有实际分到钱后，对应个人的收益才提高。</p><p><strong>注意：</strong>均分是本站为说明账目所作的选择；一般结论要明确谁获得多少返还。连续改变税率是在比较不同政策下的均衡，不是在断言现实必然如何调整。</p></section>';
  }else{
   const fishChoice=r.branch==='full'?'每位渔民想捕满'+fmt(r.L)+'单位，合计'+fmt(r.fishers*r.L)+'单位':r.branch==='none'?'每位渔民都不愿捕，合计0单位':'每位渔民对0到'+fmt(r.L)+'单位都无差异';
   const buyerChoice=r.consumerBranch==='full'?'每位消费者都想买满1单位':r.consumerBranch==='none'?'每位消费者都不买':'每位消费者对0到1单位都无差异';
   reading='当前假设总捕捞'+fmt(r.T)+'，单位成本'+fmt(r.c)+'元，价格'+fmt(r.trialPrice)+'元。'+fishChoice+'；'+buyerChoice+'。'+(r.consistent?'这时可让每位渔民捕'+fmt(r.y)+'、每位消费者买'+fmt(r.x)+'，双方总量都为'+fmt(r.eqT)+'。':'这些最优选择无法同时支持刚才假设的总量，因此不是均衡。');
   formula=r.consumerBranch==='none'?'p>v,\\quad x=0':r.consumerBranch==='full'?'p<v,\\quad x=1':r.consistent?'p^*=v=c(T^*),\\quad T^*=|J|y^*=|I|x^*':'p=v,\\quad \\widehat c=c(T)';
   extra='<p>5位渔民、10位消费者与线性成本是本站举例。图上的价格和总捕捞用于检验假设，不是市场实际调整的轨迹。</p><section aria-label="渔业模型条件"><h3>教材里的模型和均衡条件</h3><p><strong>谁做什么：</strong>消费者各买0至1单位，渔民各捕0至L单位；一位渔民捕y单位时，总成本是 c(T)y，其中T是所有渔民的总捕捞。每位消费者从鱼和货币中得到的效用写作 vx+m。</p><p><strong>成本与容量：</strong>教材模型中的单位成本随总量连续、严格递增；零捕捞的单位成本低于v，所有渔民满产时高于v，渔民总产能不超过消费者的最大总需求。正文先以零捕捞成本为0引入；正式定义只需它低于v。</p><p><strong>四个条件一起检查：</strong>给定价格，消费者各自最优；给定价格和预期单位成本，渔民各自最优；总购买等于总捕捞；预期单位成本等于实际总捕捞决定的成本。教材均衡定义用同类参与者相同的数量。</p></section><section aria-label="渔业均衡证明"><h3>考试怎么证明价格与成本相等</h3><p><strong>第一步：价格高于价值行不行？</strong>消费者都不买，出清要求捕捞为0；此时单位成本低于价格，渔民却想捕满，矛盾。</p><p><strong>第二步：价格低于价值行不行？</strong>消费者都买满，总需求达到消费者人数。若需求超过最大产能，不能出清；即使刚好等于产能，满产成本仍高于价值和价格，渔民不会捕满，也矛盾。</p><p><strong>第三步：价格等于价值后。</strong>若成本低于价格，渔民想捕满，但满产时成本高于价值；若成本高于价格，渔民想停捕，但零产量成本低于价值。两种情况均与正确预期冲突，只能成本等于价格。</p><p><strong>最后检查存在与唯一：</strong>零产量成本低于价值、满产成本高于价值，成本连续，所以介值定理保证两者之间存在总量 T^*，使 c(T*)=v；严格递增保证它唯一。每位渔民捕 T*/(|J|)，每位消费者买 T*/(|I|)；在教材的容量条件下，两者都不超过各自上限，双方无差异，总量出清且成本预期正确。这里的数值只是示例。</p></section>'
  }
  legend=k==='fishPareto'?'绿线：捕鱼单位成本　紫线：本线性例子的社会边际成本　红线：消费者单位价值　金点：协商价':k==='fishTax'?'绿线：捕鱼单位成本　紫线：本例社会边际成本　金线：成本加单位税　红线：消费者单位价值　金点：含税均衡':'绿线：单位成本　红线：消费者价值　蓝色虚线：价格（相等时与红线重合）　金点：正在检验的总量'
 }else if(['health','healthExternal'].includes(k)){
  const r=healthFilmState({m:s.m,p:s.p,phase:s.filmStep});result=r;stage=r.phase;svg=healthPlot(r,stage);
  add('私人均衡服务量',r.privateY);add('共同改善服务量',r.socialY);add('私人均衡效用',r.privateUtility);add('共同改善后效用',r.socialUtility);
  if(stage>=1){add('当前共同服务量',r.collectiveY);add('当前每人效用',r.collectiveUtility)}
  reading=k==='health'?'每个人把社会平均服务量当作给定，选择自己的服务量，使“剩余金钱×存活概率”最大。对称均衡要求各人的选择又恰好等于平均量。':'若所有人都多购买一点服务，平均量也上升，私人选择没有计入给他人带来的好处。本例存在人人更好的共同调整；一般情形还需可微、外部影响严格为正且共同调整可行等条件。';
  formula=k==='health'?T('y^*\\in\\arg\\max_{0\\le y\\le \\frac{m}{p}}(m-py)\\alpha(y,y^*)','p\\alpha(y^*,y^*)=(m-py^*)\\alpha_1(y^*,y^*)'):T('p\\alpha(y^*,y^*)=(m-py^*)\\alpha_1(y^*,y^*)','\\frac{dU(y,y)}{dy}\\big|_{y=y^*}=(m-py^*)\\alpha_2(y^*,y^*)>0');
  extra=table(['配置','每人服务量','存活概率','每人效用'],[['私人均衡',r.privateY,r.privateAlpha,r.privateUtility],['共同提高',r.socialY,r.socialAlpha,r.socialUtility]])+'<p>本站构造α(y,s)=0.1+0.35(1−e⁻ʸ)+0.2(1−e⁻ˢ)，始终在0与1之间且对两个变量递增凹；原题没有指定这个函数。</p>'+
   '<section aria-label="做题步骤"><h3>这类题怎么做</h3><p><strong>第一步：先定义均衡。</strong>每个人把预期平均量当成给定，在预算内选择最优服务量；所有人的实际平均量还要等于这个预期。若题目另给供给或市场出清条件，也要一并检查。对称情形下，每人的选择与平均量相等。</p><p><strong>第二步：先按住平均量。</strong>自己的服务量是y，大家的平均量是s。给定正价格p和财富m，个人在 0≤y≤m/p 中最大化 (m−py)α(y,s)。若对称解在内部且可微，列出 pα(y*,y*)=(m−py*)α₁(y*,y*)；一阶条件是必要条件，仍需检查边界和最优性。</p><p><strong>第三步：让大家一起变。</strong>共同变化时s也跟着y变化。在可微内点，将个人一阶条件代入共同效用的导数，留下 (m−py*)α₂(y*,y*)：这是个人选择时没有计入的外部收益。</p><p><strong>第四步：检查条件再下结论。</strong>若剩余货币为正、存活概率对平均量的偏导严格为正，并且小幅共同增加在预算、供给和资源上可行，那么导数为正，附近存在人人变好的共同调整。若不可微、偏导为零或调整不可行，不能直接套用这一步。这里的2元价格和具体函数是本站举例；教材原题没有给出完整的供给函数，不能用这组数值直接确定市场价格。</p></section>';
  legend='绿色：把平均量固定时的私人目标　紫色：所有人同时变化的目标'
 }
 const carCase=['cars','carProof'].includes(k),carParetoCase=k==='carPareto',carNoneCase=k==='carNone',healthCase=['health','healthExternal'].includes(k),fishCase=k==='fish',fishParetoCase=k==='fishPareto',fishTaxCase=k==='fishTax',plot=$('plot');
 const title=$('film-title');let context=$('expectations-context');
 if(title&&!context){context=document.createElement('p');context.id='expectations-context';context.setAttribute('aria-label','情境和问题');Object.assign(context.style,{whiteSpace:'pre-line',borderLeft:'3px solid var(--green, #177468)',padding:'10px 12px',margin:'0 0 16px',background:'var(--surface-soft, #eef4ec)',fontSize:'14px',lineHeight:'1.7'});title.insertAdjacentElement('afterend',context)}
 if(context){context.hidden=!(carCase||carParetoCase||carNoneCase||healthCase||fishCase||fishParetoCase||fishTaxCase);if(!context.hidden)context.textContent=carCase?'情境与条件｜6位车主的保留价依次是0.5、1、2、6、8、10万元；8位买家不能辨认单车质量，每人最多买1辆，愿付价格是待售车平均质量对应价值的'+fmt(s.alpha)+'倍。人数和数字为本站构造。\n问题｜猜哪些车来卖时，统一价格能让买卖双方都愿意照办？':carParetoCase?'情境与条件｜6位车主的保留价为0.5、1、2、6、8、10万元；8位买家各最多买1辆，对实际车况的价值是保留价的'+fmt(s.alpha)+'倍。原市场买家无法辨认单车质量。人数和数值为本站构造。\n问题｜在原均衡外，是否存在让一位未售车主和一位未购车买家都变好的可行配置？':carNoneCase?'情境与条件｜6位车主的保留价为0.5、1、2、6、8、10万元；8位买家各最多买1辆，无法辨认单车质量。买家对预期质量对应价值的估值为'+fmt(s.alpha)+'倍；人数与数值为本站构造。\n问题｜无人交易何时符合教材定义？知道最低质量后为何会改变？':healthCase?'情境与条件｜每人有'+fmt(s.m)+'元，服务单价'+fmt(s.p)+'元；存活概率由个人服务量与大家平均服务量共同决定。具体函数是本站构造。\n问题｜'+(k==='health'?'个人怎样选，均衡时平均量又如何与选择一致？':'大家一起多买一点，何时能让每个人更好？'):'情境与条件｜5位渔民每人最多捕2单位，10位邻居每人最多买1单位；每单位价值'+fmt(s.v)+'元，单位成本为'+fmt(s.k)+'×总捕捞。人数与线性成本为本站举例。\n问题｜'+(fishCase?'什么价格和总量能让各人的选择、总量出清与成本预期同时一致？':fishParetoCase?'一起减少捕捞并协商价格，能否让双方都变好？':'征税减少捕捞后，税款何时才真正让个人受益？')}
 const download=document.querySelector('.lesson-end a[download]');
 if(download){if(!download.dataset.originalHref)download.dataset.originalHref=download.getAttribute('href');download.setAttribute('href',carNoneCase?download.dataset.originalHref.replace(/lesson-13-2\.html$/,'ch13-car-no-trade.html'):carParetoCase?download.dataset.originalHref.replace(/lesson-13-2\.html$/,'ch13-car-pareto.html'):carCase&&name==='q133'?download.dataset.originalHref.replace(/lesson-13-2\.html$/,'ch13-car-equilibrium.html'):healthCase?download.dataset.originalHref.replace(/lesson-13-3\.html$/,`ch13-health-${name}.html`):fishParetoCase?download.dataset.originalHref.replace(/lesson-13-3\.html$/,'ch13-fish-pareto.html'):fishTaxCase?download.dataset.originalHref.replace(/lesson-13-3\.html$/,'ch13-fish-tax.html'):fishCase&&name==='q134'?download.dataset.originalHref.replace(/lesson-13-3\.html$/,'ch13-fish-equilibrium.html'):download.dataset.originalHref)}
 const guides=carCase?['先认清谁知道质量：车主了解自己的车，买家不能分辨单车，只能依据待售集合的平均质量估价。','先猜售出的车，计算平均质量和统一价格，再核对每位车主是否愿意按这个价格做出所猜的选择。','买家人数多于车数，正交易价格等于平均质量对应的买家估值；本例可以有多个均衡，不能以一次猜测代替一般证明。']:carParetoCase?['先核对原均衡：售出车辆、统一价格和未购车买家的存在。','假设能识别一辆未售车辆，比较它的车主保留价、买家价值和中间的协商价。','两人都严格更好，其他人不变；这是可行配置的福利检验，不是说匿名市场自动完成交易。']:carNoneCase?['先假设没有车出售，分别比较价格与最低保留价、买家预计愿付的价格。','空集合没有可观察的售车均值，教材定义不约束这时的质量预期；预期为0可支持无人交易。','如果买家知道质量下限，预期至少等于最低质量；无论价格怎么选，都无法同时让双方不交易。']:healthCase?[
  '先看一个人：每人有'+fmt(s.m)+'元，每单位健康服务花'+fmt(s.p)+'元；自己的服务量和大家的平均服务量都会影响存活概率。',
  '绿线把大家的平均服务量先按住，看个人怎样选择；紫线看所有人同时增加服务时，每个人的效用怎样变化。',
  '私人均衡时，个人只比较自己的得失；本例中大家一起多买一点还能互相带来好处。这个结论要看外部影响为正等条件。'
 ]:fishCase?['先看5位渔民和10位消费者的上限；人数与线性成本是本站举例。','先令价格等于消费者价值，检验偏低、偏高及一致的总量；再分别检验价格高于和低于价值的假设。','每次都看买卖双方的最优选择、出清与成本预期是否一致；移动的点是不同假设，并不是实际调整路径。']:fishParetoCase?['先读条件：5位渔民、10位消费者；每人捕鱼上限2，消费者每单位价值'+fmt(s.v)+'元。线性成本和人数是本站举例。','从原均衡一起减少捕捞：总量降低，单位成本随之降低；金点是介于成本与价值之间的协商价。','检查数量出清、每人的正收益和交易收支平衡；按协商方案重新计算每个人的结果。']:fishTaxCase?['先认清买卖双方和原来的单位成本；人数与线性成本是本站举例。','税额抬高金线，含税成本与价值相等的位置移向更低的捕鱼量。','先数税收，再区分政府留存和实际返还；没有收到返还的人不能把税款算进自己的收益。']:null;
 for(let i=0;i<3;i++){const el=$('guide-'+i);if(!el)continue;if(!el.dataset.originalGuide)el.dataset.originalGuide=el.textContent;el.textContent=guides?guides[i]:el.dataset.originalGuide}
 if(carCase){
  plot.dataset.filmIntro='阿姨去二手车市场：每位车主知道自家车况，买家却分不清，只能根据待售车的平均质量出价。先猜6辆都卖，再试不同的售车集合，看看车主会不会同意。车辆数值和买家估值倍数是本站构造。';
  plot.dataset.filmNarration=reading;
  plot.dataset.filmConclusion='本例可核对的最大候选是前'+fmt(result.maximal.n)+'辆，统一价'+fmt(result.maximal.p*10,4)+'万元；仍要逐个比较其他候选，正交易均衡不一定唯一。图中切换是检验假设，不是现实市场必然发生的调整顺序。';
 }else if(carParetoCase){
  plot.dataset.filmIntro='二手车市场已经达到一个均衡：愿意按统一价卖车的车主都找到了买家。但还有车没卖、买家没买。假设我们能把其中一辆车认出来，让双方单独商量，有没有可能两人都变好？';
  plot.dataset.filmNarration=reading;
  plot.dataset.filmConclusion=result.eligible?'在本例中，选一位未卖车主和一位未购车买家，以'+fmt(result.bilateralPrice*10,4)+'万元转移该车，两人分别多得'+fmt(result.sellerGain*10,4)+'万元和'+fmt(result.buyerGain*10,4)+'万元，其他人不变。均衡可以成立，却仍有帕累托改进；识别和安排双边交易并非原匿名机制自动完成。':'先确认原候选是均衡且有未售车，才能用这项交易构造改进。';
 }else if(carNoneCase){
  plot.dataset.filmIntro='阿姨来到二手车市场，却一辆车都没看到。车主说价格太低不愿卖，买家又担心看不到的车质量太差不肯买。没有车成交时，买家的猜测受什么约束？若知道最低质量，结论会怎样？';
  plot.dataset.filmNarration=reading;
  plot.dataset.filmConclusion='原书允许在无人出售时采用未被成交数据约束的悲观预期，因此可以构造无人交易均衡；若另外要求预期不低于最低真实质量，价格无法同时让车主与买家都不交易。';
 }else if(healthCase){
  plot.dataset.filmIntro='假设大家各有'+fmt(s.m)+'元，每单位健康服务要'+fmt(s.p)+'元。自己买服务影响存活机会，大家的平均购买量也会影响它。一个人该买多少？如果大家一起多买一点，又会怎样？这里的具体概率函数是本站构造。';
  plot.dataset.filmNarration=stage<1?'先把大家的平均购买量按住。绿线表示一个人买不同数量时，“剩下的钱 × 存活概率”怎样变化。':stage<2?'紫线表示大家一起买同样多的服务：此时平均购买量也跟着变，和绿线固定平均量的比较不同。':'紫点沿共同效用曲线移动到本例的共同改善结果；绿点仍是私人均衡。一个人单独选择时，没有算进自己给别人带来的好处。';
  plot.dataset.filmConclusion='本例里私人均衡约为每人'+fmt(result.privateY)+'单位；大家共同提高到约'+fmt(result.socialY)+'单位时，每人的效用提高。一般结论仍要检查题目的外部影响、可行范围和内点条件。';
 }else if(fishCase){
  plot.dataset.filmIntro='湖边有5位渔民和10位邻居，渔民每人最多捕2单位鱼，邻居每人最多买1单位，邻居对每单位鱼的价值是'+fmt(s.v)+'元。假设总共捕 T 单位，每单位成本是总量的'+fmt(s.k)+'倍（元）。先令价格等于价值，再试更高或更低的价格：买卖双方的选择能同时支持我们的猜测吗？人数与线性成本是本站举例。';
  const fisherText=result.branch==='full'?'售价高于单位成本，渔民都想捕满':result.branch==='none'?'售价低于单位成本，渔民都不愿捕鱼':'售价等于单位成本，渔民对可行捕捞量无差异';
  const buyerText=result.consumerBranch==='full'?'售价低于价值，邻居都想买满':result.consumerBranch==='none'?'售价高于价值，邻居都不买':'售价等于价值，邻居对可行购买量无差异';
  plot.dataset.filmNarration='当前正在检验：总捕捞'+fmt(result.T)+'、单位成本'+fmt(result.c)+'元、售价'+fmt(result.trialPrice)+'元。'+fisherText+'；'+buyerText+'。'+(result.consistent?'这组选择可以支持假设，并让买卖总量相等。':'这些选择无法同时支持假设的总量，因此不是均衡。')+'每个点对应一组假设，沿图比较两种假设下的结果。';
  plot.dataset.filmConclusion='本例价格与单位成本都为'+fmt(s.v)+'元时，总捕捞为'+fmt(result.eqT)+'单位；5位渔民各捕'+fmt(result.y)+'，10位消费者各买'+fmt(result.x)+'。一般证明还须核对成本严格递增、连续、端点和容量条件。';
 }else if(fishParetoCase){
  const target=fishing({v:s.v,k:s.k,fraction:s.fraction,mode:'pareto'});
  plot.dataset.filmIntro='湖边有5位渔民和10位买鱼的邻居，每人最多买1单位鱼，渔民每人最多捕2单位。这里假设总共捕 T 单位鱼时，每单位成本是总量的'+fmt(s.k)+'倍（元），邻居每单位愿付'+fmt(s.v)+'元。原来总共捕'+fmt(result.eqT)+'单位，双方都没净赚到；如果大家一起少捕，能不能让双方都更好？人数和线性成本是本站举例。';
  plot.dataset.filmNarration='跟着绿点看：大家一起从原来的'+fmt(result.eqT)+'单位减到'+fmt(target.T)+'单位，捕鱼成本随总量降低。金点是成本与价值之间的协商价；消费者少付一些，渔民每单位也有余额。';
  plot.dataset.filmConclusion='本例减到'+fmt(target.T)+'单位时，每单位成本'+fmt(target.c)+'元，协商价'+fmt(target.p)+'元；每位消费者和渔民都获得正收益。一般地，只要正产量低于原均衡且成本严格下降，就可在成本和价值之间选价；这是协商分配，不是自动调整的均衡。';
 }else if(fishTaxCase){
  const target=fishing({v:s.v,k:s.k,fraction:s.fraction,mode:'tax'});
  plot.dataset.filmIntro='湖边有5位渔民、10位买鱼的邻居，每位渔民最多捕2单位、每位邻居最多买1单位。每单位鱼价值'+fmt(s.v)+'元；单位捕鱼成本是总量的'+fmt(s.k)+'倍（元）。原来总共捕'+fmt(result.eqT)+'单位。政府准备按每单位鱼征税，再把税款分给大家：税款没发到手时，大家真的变好了吗？人数、线性成本和均分方式是本站举例。';
  plot.dataset.filmNarration=stage<=1?'先看征税：每单位税增加到'+fmt(target.tax)+'元，捕鱼量降到'+fmt(target.T)+'单位；政府收到'+fmt(target.revenue)+'元，但这一步尚未返还给个人。':'再看返还：把已收到的税款均分给15人，每人得到'+fmt(target.transfer)+'元；个人收益增加来自实际拿到的返还。';
  plot.dataset.filmConclusion='本例税率为每单位'+fmt(target.tax)+'元，捕鱼'+fmt(target.T)+'单位，税收'+fmt(target.revenue)+'元；全部均分后每人得到'+fmt(target.transfer)+'元。税款若不返还，不能直接说每个人都改善。';
 }else{delete plot.dataset.filmIntro;delete plot.dataset.filmNarration;delete plot.dataset.filmConclusion}
 $('legend').textContent=legend;$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent='教材印刷页'+c.page+'：'+c.note;
 $('extra').innerHTML=extra;$('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');
 const chart=E('svg',{viewBox:'0 0 650 365',role:'img','aria-label':c.label+'动态图',xmlns:'http://www.w3.org/2000/svg'},svg);
 if(healthCase||fishCase||fishParetoCase||fishTaxCase)plot.innerHTML=chart;else window.microMotion.chart(plot,chart);
 controls.forEach(x=>{if($('out-'+x.key))$('out-'+x.key).value=fmt(state[x.key]);if($(x.key))$(x.key).value=state[x.key]});
 last={case:name,stage,state:{...state},result}
}
function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='播放变化'}
function setup(k){stop();name=k;stage=0;controls=spec(cases[k].kind);state=Object.fromEntries(controls.map(x=>[x.key,x.value]));fields();history.replaceState(null,'',location.pathname+'?case='+k);panel()}
function advance(){if(['fishPareto','carPareto'].includes(cases[name].kind)){state.filmStep=1;panel();return true}if(['cars','carProof','carNone','health','healthExternal','fishTax','fish'].includes(cases[name].kind)){const end=cases[name].kind==='fish'?6:['cars','carProof'].includes(cases[name].kind)?4:2;state.filmStep=Math.min(end,Math.floor(state.filmStep+1e-9)+1);panel();return state.filmStep===end}stage=(stage+1)%4;panel();return stage===3}
$('fields').addEventListener('change',e=>{if(e.target.id==='case'){setup(e.target.value);return}if(e.target.dataset.key){stop();state[e.target.dataset.key]=+e.target.value;stage=3;panel()}});
$('fields').addEventListener('input',e=>{if(!e.target.dataset.key||e.target.tagName!=='INPUT')return;stop();state[e.target.dataset.key]=+e.target.value;stage=3;panel()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}advance();if(window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance())stop()},1300);$('play').textContent='暂停变化'};$('reset').onclick=()=>setup(name);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',panel);
window.demo={get caseName(){return name},get state(){return state},get last(){return last},draw:panel};setup(available.includes(query)?query:available[0]);
}

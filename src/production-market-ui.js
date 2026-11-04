import {cases,casesBySection,productionEconomy,technology,paretoExample,nonconvex,comparative,noTrade,leontiefException,chain,pollution,production,labor,laborPlan,laborPareto,outputCapitalist,technologyImprovement} from './production-market.mjs';
import {startProductionEconomyStory} from './production-economy-ui.js';
import {startLaborEconomyStory} from './labor-economy-ui.js';
if(window.LESSON?.id==='12.1'){
 window.startProductionEconomyStory();
}else if(window.LESSON?.id==='12.2'){
 window.startLaborEconomyStory();
}else{
const $=id=>document.getElementById(id),meta=window.LESSON,available=casesBySection[meta.id];
const query=new URLSearchParams(location.search).get('case');
const C={ink:'#213d37',green:'#177468',red:'#c35f43',purple:'#7a6594',gold:'#b68b37',muted:'#758778',grid:'#dce2d5',paper:'#fffdf7',wash:'#e8eee4'};
const fmt=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)).toLocaleString('zh-CN',{maximumFractionDigits:d}):String(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S=(key,label,min,max,step,value)=>({key,label,min,max,step,value});
const T=(...lines)=>lines.join('\n');
let name='',state={},controls=[],stage=0,timer=null,last={};
function spec(kind){return({
 technology:[S('A','商品1最大产量 A',5,10,.5,8),S('B','商品2最大产量 B',4,9,.5,6),S('fraction','自由处置后保留比例',.2,1,.05,.6)],
 economy:[S('share','甲的所有权份额',.15,.85,.05,.5),S('thetaA','甲偏好商品1的份额',.2,.8,.05,.7),S('thetaB','乙偏好商品1的份额',.2,.8,.05,.3),S('mult','价格比 / 出清价格比',.55,1.45,.05,1)],
 plan:[S('mult','价格比 / 出清价格比',.55,1.45,.05,.8)],
 nonconvex:[S('q','商品1相对价格',.5,1.5,.05,1)],
 specialization:[S('q','商品1相对价格',.6,3.4,.1,2)],
 linear:[S('t','共同偏好权重 t',1.5,2.5,.1,2)],
 chain:[S('beta','第一人闲暇偏好份额 β',.3,.7,.05,.5)],
 pollution:[S('q','商品1相对价格',.6,2.4,.1,1.5)],
 labor:[S('beta','工人闲暇偏好份额 β',.3,.7,.05,.5),S('mult','尝试工资 / 出清工资',.7,1.4,.05,1)],
 laborPlan:[S('a','资本家计划雇用的时间',.2,.8,.05,.5),S('l','工人保留的休闲',.2,.8,.05,.5),S('workerShare','给工人的产出比例',.2,.8,.05,.5)],
 laborPareto:[S('alternativeLabor','另一计划的劳动 a′',.2,.8,.05,.4)],
 output:[S('reduction','替代计划减少劳动比例',.05,.35,.05,.2)],
 techCapital:[S('strength','新增技术强度',.2,1.5,.1,.8)],
 techWorker:[S('strength','新增技术强度',.2,1.5,.1,1)]
})[kind]||[]}
function fields(){let first='<div class="field"><label for="case">教材原题或知识点</label><select id="case" aria-label="切换第12章实验">';
 for(const k of available)first+='<option value="'+k+'" '+(name===k?'selected':'')+'>'+esc(cases[k].label)+'</option>';
 first+='</select></div>';
 $('fields').innerHTML=first+controls.map(c=>'<div class="field"><label for="'+c.key+'">'+c.label+'<output id="out-'+c.key+'">'+fmt(state[c.key])+'</output></label><input type="range" id="'+c.key+'" data-key="'+c.key+'" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+state[c.key]+'"></div>').join('')}
function E(tag,attrs={},body=null){const a=Object.entries(attrs).map(([k,v])=>k+'="'+esc(v)+'"').join(' ');return'<'+tag+(a?' '+a:'')+(body===null?'/':'>'+body+'</'+tag)+'>'}
function txt(x,y,s,size=13,color=C.ink,anchor='middle'){const scale=Math.min(1.65,Math.max(1,620/Math.max(320,$('plot').clientWidth)));return E('text',{x,y,'text-anchor':anchor,fill:color,'font-size':size*scale},esc(s))}
const dot=(x,y,color,id,r=7)=>E('circle',{'data-motion':id,cx:x,cy:y,r,fill:color,stroke:C.paper,'stroke-width':2});
const P=(d,color,width=2,dash='',fill='none')=>E('path',{d,stroke:color,'stroke-width':width,'stroke-dasharray':dash,fill});
function axes(xlabel,ylabel){let svg='';for(let i=1;i<5;i++)svg+=P('M60 '+(300-i*58)+'H610',C.grid,1);return svg+P('M60 43V300H612',C.muted,1.5)+txt(60,27,ylabel,13,C.ink,'start')+(xlabel?txt(605,348,xlabel,12,C.ink,'end'):'')}
function curve(f,x0,x1,X,Y,n=100){let d='';for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=f(x);if(Number.isFinite(y))d+=(d?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2)}return d}
function table(heads,rows){return'<table><thead><tr>'+heads.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(typeof x==='number'?fmt(x):x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function bars(labels,values,title='数量或效用'){const max=Math.max(1,...values.map(Math.abs))*1.2,w=510/labels.length;let svg=axes('',title);labels.forEach((label,i)=>{const x=78+i*w,bw=Math.min(72,w-14),v=values[i],h=210*Math.abs(v)/max,y=v>=0?290-h:290;svg+=E('rect',{'data-motion':'bar-'+i,x,y,width:bw,height:h,rx:4,fill:[C.green,C.red,C.purple,C.gold][i%4]})+txt(x+bw/2,v>=0?y-8:Math.min(335,300+h+18),fmt(v),12)+txt(x+bw/2,328,label,11)});return svg}
function economyPlot(r,phase,free=false){const X=x=>60+550*x/(r.A*1.55),Y=y=>300-245*y/(r.B*1.52);let svg=axes('商品1数量','商品2数量');const front=curve(x=>r.B*Math.sqrt(Math.max(0,1-(x/r.A)**2)),0,r.A,X,Y);svg+=P('M60 300L60 '+Y(r.B)+front.slice(front.indexOf('L'))+'L60 300Z','none',0,'',C.wash)+P(front,C.green,2.5);
 if(free){const t=technology(r.A,r.B,state.fraction),[a,b]=t.frontier,[c,d]=t.disposed;svg+=E('rect',{x:60,y:Y(b),width:X(a)-60,height:300-Y(b),fill:C.green,opacity:.12})+dot(X(a),Y(b),C.purple,'frontier')+txt(X(a)+10,Y(b)-13,'可生产点',12,C.purple,'start');if(phase>=1)svg+=dot(X(c),Y(d),C.red,'disposed')+txt(X(c)+10,Y(d)+22,'处置后',12,C.red,'start')}
 else{const[a,b]=r.supply,[c,d]=r.demand;svg+=P(curve(x=>r.profit-r.q*x,0,Math.min(r.A*1.55,r.profit/r.q),X,Y),C.gold,2,'6 5');if(phase>=1)svg+=dot(X(a),Y(b),C.green,'production-supply')+txt(X(a)+8,Y(b)-13,'生产 Y',12,C.green,'start');if(phase>=3){svg+=dot(X(c),Y(d),C.red,'aggregate-demand',r.clears?5:8)+txt(X(c)+8,Y(d)+22,r.clears?'消费 X＝Y':'总需求 X',12,C.red,'start');if(!r.clears)svg+=P('M'+X(a)+' '+Y(b)+'L'+X(c)+' '+Y(d),C.red,2,'4 4')}}
 return svg}
function nonconvexPlot(r,phase){const X=x=>60+550*x/5,Y=y=>300-245*y/5;let svg=axes('商品1数量','商品2数量')+P('M60 300V'+Y(4)+'H'+X(1)+'V'+Y(1)+'H'+X(4)+'V300Z',C.green,2.5,'',C.wash);svg+=dot(X(1),Y(4),C.green,'a')+txt(X(1)+5,Y(4)-12,'a',14,C.green,'start')+dot(X(4),Y(1),C.green,'b')+txt(X(4)+5,Y(1)-12,'b',14,C.green,'start');if(phase>=1)svg+=dot(X(r.equalBundle[0]),Y(r.equalBundle[1]),C.red,'wish')+txt(X(r.equalBundle[0])+8,Y(r.equalBundle[1])-12,'等量需求',11,C.red,'start');return svg}
function specializationPlot(r,consumption=null){const X=x=>60+550*x/5,Y=y=>300-245*y/5,colors=[C.green,C.purple,C.gold];let svg=axes('商品1产量','商品2产量');r.people.forEach((p,i)=>{svg+=P('M60 '+Y(p.c)+'L'+X(p.c/p.t)+' 300',colors[i],2)+dot(X(p.output[0]),Y(p.output[1]),colors[i],'person-'+i)+txt(X(p.output[0])+(i%2?9:-9),Y(p.output[1])-10,(i+1)+'号',11,colors[i],i%2?'start':'end');if(consumption){const c=consumption[i];svg+=dot(X(c[0]),Y(c[1]),C.red,'consumer-'+i,4)}});return svg}
function chainPlot(r,phase){const L=t=>60+245*t,R=x=>370+205*x/Math.max(1.5,r.x*1.5),Yx=y=>295-205*y/Math.max(2.6,r.x*1.5),Yy=y=>295-205*y/Math.max(5,r.g*1.25),max=Math.max(1.5,r.x*1.5);let svg=P('M60 65V295H310M370 65V295H605',C.muted,1.5)+txt(60,43,'第一人：时间 → X',13,C.ink,'start')+txt(370,43,'第二人：X → Y',13,C.ink,'start');svg+=P(curve(t=>r.A*Math.sqrt(t),0,1,L,Yx),C.green,2.5)+P(curve(x=>r.B*Math.sqrt(x),0,max,R,Yy),C.purple,2.5)+P(curve(x=>r.p*x,0,max,R,Yy),C.red,2)+dot(L(r.t),Yx(r.x),C.green,'chain-X')+txt(L(r.t),322,'t*='+fmt(r.t),11);if(phase>=1)svg+=P('M'+L(r.t)+' '+Yx(r.x)+'C300 150 345 150 '+R(r.x)+' '+Yy(r.g),C.gold,1.5,'5 6');if(phase>=2)svg+=dot(R(r.x),Yy(r.g),C.purple,'chain-Y')+dot(R(r.x),Yy(r.p*r.x),C.red,'chain-cost')+txt(R(r.x)+9,Yy(r.g)-8,'g(x)',11,C.purple,'start')+txt(R(r.x)+9,Yy(r.p*r.x)+18,'p·x',11,C.red,'start');return svg}
function pollutionPlot(r,phase){const X=x=>60+550*x/1.2,Y=y=>300-245*y/2.5;let svg=axes('商品1 / 人','商品2 / 人')+P(curve(x=>2-2*x,0,1,X,Y),C.green,3)+dot(X(0),Y(2),C.red,'private')+txt(X(0)+10,Y(2)-14,'私人均衡',12,C.red,'start');if(phase>=1)svg+=P('M'+X(0)+' '+Y(2)+'L'+X(1)+' '+Y(0),C.gold,1.5,'6 5');if(phase>=2)svg+=dot(X(1),Y(0),C.purple,'social')+txt(X(1)-7,Y(0)-14,'无污染计划',11,C.purple,'end');return svg}
function laborPlot(r,phase,{alt=null,changed=false,output=false}={}){const maxA=1.22,f=a=>production(a,r.A,r.kind||'base',r.strength||0),maxY=Math.max(5.2,f(maxA)*1.2,r.w*maxA*1.15),X=a=>60+550*a/maxA,Y=v=>300-245*v/maxY;let svg=axes('劳动 a；休闲 l＝1−a','商品产出 / 工资支出');if(changed)svg+=P(curve(a=>production(a,4),0,maxA,X,Y),C.muted,2,'5 5');svg+=P(curve(f,0,maxA,X,Y),C.green,3);const firm=output?r.a:r.firmLabor,worker=output?r.a:r.workerLabor,w=r.w;if(phase>=1)svg+=P(curve(a=>w*a,0,maxA,X,Y),C.red,2);if(phase>=2)svg+=P('M'+X(worker)+' 46V300',C.purple,1.5,'5 5')+dot(X(firm),Y(f(firm)),C.green,'firm-choice')+dot(X(worker),Y(w*worker),C.purple,'worker-choice')+txt(X(worker)+8,320,'供给 '+fmt(worker),11,C.purple,'start');if(phase>=3&&Math.abs(firm-worker)<1e-6)svg+=P('M'+X(firm)+' '+Y(f(firm))+'V'+Y(w*firm),C.gold,3)+txt(X(firm)+13,(Y(f(firm))+Y(w*firm))/2,'利润 z',11,C.gold,'start');if(alt)svg+=dot(X(alt.a),Y(f(alt.a)),C.gold,'other-output')+dot(X(alt.a),Y(alt.x),C.red,'other-worker')+P('M'+X(alt.a)+' '+Y(f(alt.a))+'V'+Y(alt.x),C.gold,3)+txt(X(alt.a)+10,Y(alt.x)+21,'另一计划',11,C.red,'start');return svg}
function panel(){const c=cases[name],s=state,k=c.kind;let svg='',metrics=[],reading='',formula='',extra='',legend='',result=null;
 const add=(a,b)=>metrics.push([a,typeof b==='number'?fmt(b):b]);
 if(['technology','economy','plan','proof'].includes(k)){
  const r=productionEconomy({A:k==='technology'?s.A:8,B:k==='technology'?s.B:6,share:s.share??.5,thetaA:s.thetaA??.7,thetaB:s.thetaB??.3,mult:s.mult??1});result=r;
  svg=k==='proof'?bars(['均衡产值','假设改善所需','可生产上限'],[r.profit,r.profit+.8,r.profit],'同一价格下的总价值'):economyPlot(r,stage,k==='technology');
  legend='绿色：技术与生产　红色：消费需求　金色：产出价值线';
  if(k==='technology'){
   const t=technology(s.A,s.B,s.fraction);
   add('处置后仍在技术内',t.feasible(...t.disposed)?'是':'否');add('可生产点的商品1',t.frontier[0]);add('处置后商品1',t.disposed[0]);
   reading=stage<1?'闭、有界、凸的技术集合包含原点；选定产量后向左下方减少商品仍可行。':'绿色矩形显示从选定产量向左下方的自由处置范围。椭圆是本站构造的示例技术。';
   formula=T('T=\\{(y_1,y_2)\\ge0:(\\frac{y_1}{A})^2+(\\frac{y_2}{B})^2\\le1\\}','0\\le z_1\\le y_1,\\ 0\\le z_2\\le y_2\\Rightarrow z\\in T');
   extra='<p>原书定义描述一类技术，图中的椭圆不是原书给定的唯一函数。</p>'
  }else if(k==='proof'){
   add('均衡总消费价值',r.profit);add('生产者能给出的最大价值',r.profit);
   reading=['企业已让产出价值最大；任何别的可行产量在同一价格下价值不更高。','反证假设：另一可行计划令每个消费者至少同样满意，且一人严格更好。','消费最优性意味着另一计划的总消费价格值必须严格更高。','但另一计划要求消费等于产出，生产者又不能提供更高价值，出现矛盾。'][stage];
   formula=T('p\\sum_i x_i^{\\prime}>p\\sum_i x_i','=p\\sum_j y_j\\ge p\\sum_j y_j^{\\prime}=p\\sum_i x_i^{\\prime}');
   extra='<p>红柱多出的0.8只是“假设有改进”所需的价格差，不表示有真实可行的改进计划。原证明的这一蕴含不使用凸性；非凸会使均衡可能不存在。</p>'
  }else{
   add('生产者利润 π',r.profit);add('甲的利润收入',r.income[0]);add('乙的利润收入',r.income[1]);add('商品1超额需求',r.gap[0]);add('两种商品出清',r.clears?'是':'否');
   reading=k==='plan'?(r.clears?'总需求红点和总产出绿点重合，两种商品逐一出清，构成可行生产—消费计划。':'红点和绿点不重合；各人的预算最优意愿不能自动拼成可行计划。'):['企业先在给定价格下选择产值最高的绿点。','产值π作为利润，按固定所有权份额分给甲乙。','两位消费者用各自的利润收入选最优商品束。','甲乙需求之和是红点；只有它与绿点重合才同时满足三项均衡条件。'][stage];
   formula=T('\\pi=p_1y_1+p_2y_2,\\quad m_i=\\alpha_i\\pi','\\sum_i x_i=\\sum_j y_j\\quad\\text{逐商品出清}');
   extra=table(['对象','商品1','商品2','价值'],[['生产者产出',...r.supply,r.profit],['甲的需求',...r.consumers[0],r.income[0]],['乙的需求',...r.consumers[1],r.income[1]],['总需求',...r.demand,r.profit]])+'<p>本站数值构造使用椭圆技术与Cobb–Douglas偏好；商品2价格归一化为1。所有权或偏好变化会移动出清价格。</p>'
  }
 }else if(k==='pareto'){
  const r=paretoExample(),X=x=>60+550*x/4.5,Y=y=>300-245*y/4.5;result=r;svg=axes('商品1','商品2');
  r.initial.forEach((x,i)=>{svg+=dot(X(x[0]),Y(x[1]),C.muted,'old-'+i,6);if(stage>=2){const a=r.alternative[i],co=i?C.purple:C.green;svg+=P('M'+X(x[0])+' '+Y(x[1])+'L'+X(a[0])+' '+Y(a[1]),co,2)+dot(X(a[0]),Y(a[1]),co,'new-'+i)+txt(X(a[0])+9,Y(a[1])-10,i?'乙':'甲',12,co,'start')}});
  add('甲原效用',r.initialU[0]);add('甲新效用',stage>=2?r.alternativeU[0]:r.initialU[0]);add('乙原效用',r.initialU[1]);add('乙新效用',stage>=2?r.alternativeU[1]:r.initialU[1]);
  reading=stage<2?'起点两人各消费(2,2)。预测能否重新分配同样的总产量，让两人都更好。':'商品1更多给偏好它的甲，商品2更多给偏好它的乙。总量仍为(4,4)，两人都严格改善，原配置不是帕累托稳定。';
  formula='x_\\text{甲}^{\\text{原}}+x_\\text{乙}^{\\text{原}}=x_\\text{甲}^{\\text{新}}+x_\\text{乙}^{\\text{新}}=(4,4)';
  extra=table(['消费者','原配置','另一可行配置','原效用','新效用'],[['甲','(2,2)','(3,1.5)',r.initialU[0],r.alternativeU[0]],['乙','(2,2)','(1,2.5)',r.initialU[1],r.alternativeU[1]]])
 }else if(k==='nonconvex'){
  const r=nonconvex(s.q);result=r;svg=nonconvexPlot(r,stage);
  add('生产者利润最大点',r.producerChoice.join(' 与 '));add('消费者想买的等量束',r.equalBundle.map(x=>fmt(x)).join(' / '));add('能否同时最优并出清',r.consumerMatches?'是':'否');
  reading=stage<1?'非凸技术的两条臂允许产a或b；企业选择在给定价格下价值最大的端点。':'消费者偏好min{x₁,x₂}，想买等量两种商品；企业任何正价格下的最优端点都不是等量束，因此没有竞争均衡。';
  formula=T('T=([0,1]\\times[0,4])\\cup([0,4]\\times[0,1])','u(x_1,x_2)=\\min\\{x_1,x_2\\}');
  extra='<p>这是按原书图12.2机制构造的简化非凸技术；原图没有给出这些精确坐标。均衡若存在则稳定的证明仍然成立。</p>'
 }else if(['specialization','linear','leontief'].includes(k)){
  const r=k==='leontief'?leontiefException():k==='linear'?noTrade(s.t):comparative(s.q);result=r;
  const display=k==='leontief'?{people:r.people.map(x=>({t:x.t,c:x.c,output:x.production}))}:r;
  svg=specializationPlot(display,k==='leontief'?r.people.map(x=>x.consumption):k==='linear'?r.consumption:null);
  if(k==='specialization'){
   add('商品1相对价格',r.q);add('只产商品1的人数',r.people.filter(x=>x.mode==='good1').length);add('只产商品2的人数',r.people.filter(x=>x.mode==='good2').length);
   reading='每条斜线是个人的生产前沿。比较生产商品1的机会成本tᵢ与市场相对价格：低于价格就产商品1，高于价格就产商品2，相等时生产前沿任一点都给相同产值。';
   formula=T('t_i<\\frac{p_1}{p_2}\\Rightarrow y_2^i=0','t_i>\\frac{p_1}{p_2}\\Rightarrow y_1^i=0');
   extra=table(['个人','tᵢ','商品1产出','商品2产出','最优方向'],r.people.map((x,i)=>[i+1,x.t,...x.output,{good1:'只产1',good2:'只产2',tie:'前沿任意混合'}[x.mode]]))+'<p>原题等号情形仅对最优生产束无差异；不能据此断言对所有消费束无差异。个人生产最优还不是完整市场均衡。</p>'
  }else if(k==='linear'){
   add('共同偏好权重 t',s.t);add('交易量',0);
   reading='若所有人的偏好均为t x₁+x₂，取价格比t，每个人都可以消费恰好自己生产的束；即使生产方向不同，零交易也能出清。';
   formula=T('\\frac{p_1}{p_2}=t','x(i)=y(i)');
   extra=table(['个人','商品1产出','商品2产出','消费等于产出'],r.people.map((x,i)=>[i+1,...x.output,'是']))
  }else{
   add('生产总量',r.production.map(x=>fmt(x)).join(' / '));add('消费总量',r.consumption.map(x=>fmt(x)).join(' / '));add('1号是否生产两种','是');
   reading=stage<2?'t₁=1<t₂=3，但价格比恰为1，使1号在整条生产前沿上无差异。':'1号生产(2.5,1.5)、消费(2,2)；2号生产(0,1)、消费(0.5,0.5)。预算最优且逐商品出清，1号确实两种都生产。';
   formula=T('p=(1,1),\\ y(1)=(2.5,1.5),\\ y(2)=(0,1)','x(1)=(2,2),\\ x(2)=(0.5,0.5)');
   extra=table(['个人','tᵢ、cᵢ','产出','消费','预算价值'],[['1号','1, 4','(2.5,1.5)','(2,2)',4],['2号','3, 1','(0,1)','(0.5,0.5)',1]])
  }
 }else if(k==='chain'){
  const r=chain({beta:s.beta});result=r;svg=chainPlot(r,stage);
  add('第一人工作时间 t*',r.t);add('X供给 / 需求',r.x);add('X相对价格 p*',r.p);add('第二人利润',r.profit);
  reading=stage<1?'第一人在休闲与出售X换来的Y之间选择；他生产的X成为第二人的投入。':stage<2?'第二人按g(x)−px选择投入需求，市场价格必须令X供给等于需求。':'X出清后，最终Y分为第一人的销售收入与第二人的利润。任何帕累托改进都会违背一方的最优选择。';
  formula=T('f(t)=2\\sqrt t,\\quad g(x)=4\\sqrt x','f(t^*)=x^*,\\quad g^{\\prime}(x^*)=p^*');
  extra=table(['对象','决定','Y价值'],[['生产者1','t='+fmt(r.t)+'，X='+fmt(r.x),r.sellerY],['生产者2','投入X='+fmt(r.x),r.profit]])+'<p>平方根技术和Cobb–Douglas偏好为本站的可计算构造；原题只规定一般性质。</p>'
 }else if(k==='pollution'){
  const r=pollution(s.q);result=r;svg=pollutionPlot(r,stage);
  add('当前价格能否对称出清',r.equilibrium?'能':'不能');add('私人均衡每人效用',r.privateUtility);add('替代计划每人效用',r.alternativeUtility);
  reading=stage<2?'生产者最大化自己产值，消费者把污染当作给定；价格比在[1,2]时全体生产商品2可以对称出清。':'全体改产并消费(1,0)后，污染指数从3降至0，每人效用从−1升至1。因此任何对称均衡结果都非帕累托稳定。';
  formula=T('2y_1+y_2=2,\\quad z=1.5\\,\\overline{x_2}','u(0,2)=-1<1=u(1,0)');
  extra=table(['对称配置','商品1','商品2','污染z','每人效用'],[['私人均衡',0,2,3,-1],['替代计划',1,0,0,1]])+'<p>个人选择时把污染当给定；比较整个社会计划时必须重新计算所有人造成的污染。</p>'
 }
 else if(['labor','laborPlan','laborPareto','laborProof','output','techCapital','techWorker'].includes(k)){
  legend='绿色：生产曲线　红色：工资支出　紫色：工人选择';
  if(k==='laborPlan'){
   const l=stage>=2?1-s.a:s.l,r=laborPlan({a:s.a,l,workerShare:s.workerShare});result=r;
   const base=labor();svg=laborPlot({...base,A:4,w:2.8,firmLabor:s.a,workerLabor:1-l},stage);
   add('劳动与休闲合计',r.a+r.l);add('总产出',r.output);add('工人消费',r.x);add('资本家消费',r.z);add('可行计划',r.timeFeasible&&r.goodsFeasible?'是':'否');
   reading=r.timeFeasible?'劳动和休闲之和为1，产出也全部分配；此时是可行计划，仍须另行检验双方最优。':'劳动和休闲之和不为1。即使商品配平也不能叫可行计划；点击“下一步”让休闲回到1−a。';
   formula='a=1-l,\\qquad f(a)=x+z';
   extra=table(['变量','当前量'],[['劳动a',r.a],['休闲l',r.l],['工人消费x',r.x],['资本家消费z',r.z]])
  }else if(k==='laborPareto'||k==='laborProof'){
   const a2=k==='laborProof' ? 0.4 : s.alternativeLabor,r=laborPareto({alternativeLabor:a2});result=r;
   svg=laborPlot(r.eq,stage,{alt:stage>=2?{a:a2,x:r.xRequired}:null});
   add('均衡资本家所得 z*',r.z);add('另一计划可给资本家',r.zAvailable);add('资本家变化',r.capitalGain);add('另一计划可行',r.alternativeFeasible?'是':'否');
   reading=stage<2?'从工资竞争均衡出发：新计划若让工人至少同样满意，必须给足与新休闲水平相配的消费。':r.alternativeFeasible?'这个数值替代计划维持工人效用，却让资本家剩余低于均衡；一般证明要对所有计划做同一价值比较。':'维持工人效用需要的消费超过新产量；此替代连可行计划也不是。';
   formula=k==='laborProof'?T("x'\\ge w^*a',\\quad z'\\ge z^*","f(a')-w^*a'\\ge z'\\ge z^*=f(a^*)-w^*a^*"):T("a'=1-l'","x'+z'=f(a')");
   extra=table(['计划','劳动a','工人消费x','资本家所得z'],[['均衡',r.a,r.x,r.z],['保持工人效用的另一计划',a2,r.xRequired,r.zAvailable]])
  }else if(k==='output'){
   const r=outputCapitalist({reduction:s.reduction});result=r;
   svg=laborPlot({A:4,kind:'base',w:r.w,a:r.a,firmLabor:r.a,workerLabor:r.a},stage,{alt:stage>=2?{a:r.aAlt,x:r.xNeeded}:null,output:true});
   add('保本最大产量的劳动',r.a);add('资本家均衡剩余',0);add('另一计划给资本家',r.zAlt);add('工人效用降低','否');
   reading=stage<2?'资本家在不亏损约束下尽量增产；均衡工资使最大保本劳动量恰等于工人供给量，资本家剩余为0。':'少雇劳动、给工人更多休闲；从新产量里给他刚好维持原效用的商品后，资本家仍得正剩余。此均衡非帕累托稳定。';
   formula=T('a^*=(\\frac{A}{w})^2=1-\\beta,\\quad z^*=0',"a'<a^*,\\quad u(l',x')=u(l^*,x^*),\\quad z'>0");
   extra=table(['计划','劳动','工人消费','资本家所得'],[['保本产量最大均衡',r.a,r.x,0],['减少劳动的可行计划',r.aAlt,r.xNeeded,r.zAlt]])
  }else if(k==='techCapital'||k==='techWorker'){
   const kind=k==='techCapital'?'capital':'worker',r=technologyImprovement(kind,s.strength),active=stage>=2;result=r;
   svg=laborPlot(active?labor({kind,strength:s.strength}):labor(),stage,{changed:active});
   add('旧均衡工资',r.oldWage);add('新均衡工资',r.newWage);add('资本家利润变化',r.capitalChange);add('工人工资收入变化',r.workerChange);
   reading=stage<2?'旧技术f₀(a)=4√a。固定工人偏好，预测增产后两人的收入如何变化。':kind==='capital'?'新技术处处产出更多，但均衡边际产量增加更快，工资上涨超过资本家留下的新增产值；资本家反而更差。':'新技术处处产出更多，却使均衡劳动量附近的边际产量变低，工资下降；工人休闲不变、消费减少，反而更差。';
   formula=kind==='capital'?T('f_1(a)=4\\sqrt a+\\varepsilon\\frac{a^2}{1+a}\\ge f_0(a)','z_1-z_0=-\\varepsilon\\frac{a^{*2}}{(1+a^*)^2}<0'):T('f_1(a)=4\\sqrt a+\\varepsilon a e^{-3a}\\ge f_0(a)','w_1-w_0=\\varepsilon e^{-3a^*}(1-3a^*)<0');
   extra=table(['技术','均衡劳动','产出','工资','资本家利润'],[['旧技术',r.a,r.oldOutput,r.oldWage,r.oldProfit],['新技术',r.a,r.newOutput,r.newWage,r.newProfit]])+'<p>两种技术函数均为本站构造，不是原书原函数；在展示强度下保持递增凹。</p>'
  }else{
   const r=labor({beta:s.beta,mult:s.mult});result=r;svg=laborPlot(r,stage);
   add('资本家劳动需求',r.firmLabor);add('工人劳动供给',r.workerLabor);add('工资 w',r.w);add('劳动出清',r.clears?'是':'否');
   reading=stage<1?'资本家面对给定工资，沿生产曲线选择利润最大的雇佣量。':stage<2?'红线是工资支出，与绿线的垂直距离是资本家利润。':'工人用一单位时间在工作与休闲间分配；只有愿供的劳动等于企业想雇的劳动，才能构成竞争均衡。';
   formula=T('a_D\\in\\arg\\max_a\\{f(a)-wa\\}','a_S=1-l^*,\\quad a_D=a_S\\quad\\text{才出清}');
   extra=table(['一方','意愿劳动','给定工资下的结果'],[['资本家',r.firmLabor,'计划产出 '+fmt(r.output)],['工人',r.workerLabor,'预计工资 '+fmt(r.workerConsumption)]])+'<p>未出清的两方意愿不是已经实现的可行计划。平方根技术与Cobb–Douglas工人偏好为本站示例。</p>'
  }
 }
 $('legend').textContent=legend;$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent='教材印刷页'+c.page+'：'+c.note;
 $('extra').innerHTML=extra;$('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');
 window.microMotion.chart($('plot'),E('svg',{viewBox:'0 0 650 365',role:'img','aria-label':c.label+'动态图',xmlns:'http://www.w3.org/2000/svg'},svg));
 controls.forEach(x=>{if($('out-'+x.key))$('out-'+x.key).value=fmt(state[x.key]);if($(x.key))$(x.key).value=state[x.key]});last={case:name,stage,state:{...state},result}
}
function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='播放变化'}
function setup(k){stop();name=k;stage=0;controls=spec(cases[k].kind);state=Object.fromEntries(controls.map(x=>[x.key,x.value]));fields();history.replaceState(null,'',location.pathname+'?case='+k);panel()}
function advance(){stage=(stage+1)%4;panel();return stage===3}
function manualStage(){return ['technology','economy','plan','nonconvex','specialization','linear','chain','pollution','labor','laborPareto','output','techCapital','techWorker'].includes(cases[name].kind)?3:0}
$('fields').addEventListener('change',e=>{if(e.target.id==='case'){setup(e.target.value);return}if(e.target.dataset.key){stop();state[e.target.dataset.key]=+e.target.value;stage=manualStage();panel()}});
$('fields').addEventListener('input',e=>{if(!e.target.dataset.key||e.target.tagName!=='INPUT')return;stop();state[e.target.dataset.key]=+e.target.value;stage=manualStage();panel()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}advance();if(window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance())stop()},1300);$('play').textContent='暂停变化'};$('reset').onclick=()=>setup(name);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',panel);
window.demo={get caseName(){return name},get state(){return state},get last(){return last},draw:panel};setup(available.includes(query)?query:available[0]);
}

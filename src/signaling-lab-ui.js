import {cases,casesBySection,simpleWage,workerChoice,signal,certificate,schools} from './signaling-lab.mjs';
import {startContractMarketStory} from './contract-market-ui.js';
import {startEducationMarketStory} from './education-market-ui.js';
if(window.LESSON.id==='14.1'){
 window.startContractMarketStory(new URLSearchParams(location.search).get('case'));
}else if(window.LESSON.id==='14.2'){
 window.startEducationMarketStory(new URLSearchParams(location.search).get('case'));
}else{
const $=id=>document.getElementById(id),meta=window.LESSON,available=casesBySection[meta.id];
const query=new URLSearchParams(location.search).get('case');
const C={ink:'#213d37',green:'#177468',red:'#c35f43',purple:'#7a6594',gold:'#b68b37',muted:'#758778',grid:'#dce2d5',paper:'#fffdf7',wash:'#e8eee4'};
const fmt=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)).toLocaleString('zh-CN',{maximumFractionDigits:d}):String(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(key,label,min,max,step,value)=>({key,label,min,max,step,value});
const S=(key,label,options,value)=>({key,label,options,value});
let name='',state={},controls=[],stage=0,timer=null,last={};
function spec(kind){
 if(kind==='simple')return[R('v','工人生产率 v',4,12,.5,8),R('w','当前工资 w',0,12,.5,5),R('entry','新报价 w′',0,12,.5,6)];
 if(kind==='certificate')return[R('pPlus','有证书价格 p₊',14,24,.5,20),R('pMinus','无证书价格 p₋',5,17,.5,10)];
 if(kind==='schoolSingle')return[R('dA','A校距城 d_A / 公里',0,12,.5,4)];
 if(kind==='schoolPair')return[R('dA','A校距城 d_A / 公里',0,12,.5,5),R('dB','B校距城 d_B / 公里',0,8,.5,0)];
 if(kind==='schoolEmpty')return[];
 if(kind==='edge')return[R('vH','高类型生产率 v_H',7,14,.5,10)];
 if(kind==='proof')return[R('alphaL','低类型占比 α_L',.05,.95,.05,.65)];
 return[R('alphaL','低类型占比 α_L',.05,.95,.05,.65),R('betaH','高类型单位教育成本 β_H',.3,2.7,.1,1)];
}
function fields(){
 let html='<div class="field"><label for="case">本章知识点或原题</label><select id="case" aria-label="切换第14章实验">';
 for(const k of available)html+='<option value="'+k+'" '+(k===name?'selected':'')+'>'+esc(cases[k].label)+'</option>';
 html+='</select></div>';
 for(const c of controls){
  html+='<div class="field"><label for="'+c.key+'">'+esc(c.label)+'<output id="out-'+c.key+'">'+fmt(state[c.key])+'</output></label>';
  if(c.options){html+='<select id="'+c.key+'" data-key="'+c.key+'">'+Object.entries(c.options).map(([v,label])=>'<option value="'+v+'">'+esc(label)+'</option>').join('')+'</select>'}
  else html+='<input id="'+c.key+'" data-key="'+c.key+'" type="range" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+state[c.key]+'">';
  html+='</div>';
 }
 $('fields').innerHTML=html;
}
function E(tag,attrs={},body=null){const a=Object.entries(attrs).map(([k,v])=>k+'="'+esc(v)+'"').join(' ');return'<'+tag+(a?' '+a:'')+(body===null?'/':'>'+body+'</'+tag)+'>'}
const path=(d,color,width=2,dash='',fill='none')=>E('path',{d,fill,stroke:color,'stroke-width':width,'stroke-dasharray':dash});
const dot=(x,y,color,key,r=7)=>E('circle',{cx:x,cy:y,r,fill:color,stroke:C.paper,'stroke-width':2,'data-motion':key});
const text=(x,y,s,size=13,color=C.ink,anchor='middle')=>E('text',{x,y,fill:color,'font-size':size,'text-anchor':anchor},esc(s));
function base(xlabel,ylabel){let s='';for(let i=1;i<=4;i++)s+=path('M70 '+(300-53*i)+'H600',C.grid,1);return s+path('M70 45V300H600',C.muted,1.4)+text(70,28,ylabel,13,C.ink,'start')+text(600,335,xlabel,13,C.ink,'end')}
function table(heads,rows){return'<table><thead><tr>'+heads.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function wagePlot(r){
 const Y=w=>300-235*w/14;
 let s=base('报价 / 工资','每个工人的收入与雇主利润');
 s+=path('M70 '+Y(r.v)+'H600',C.green,2,'5 4')+text(595,Y(r.v)-8,'生产率 v = '+fmt(r.v),12,C.green,'end');
 s+=dot(205,Y(r.w),C.purple,'wage-current',9)+text(205,Y(r.w)-14,'现有 w',13,C.purple);
 if(stage>=1)s+=dot(415,Y(r.entry),C.red,'wage-entry',9)+text(415,Y(r.entry)-14,'进入 w′',13,C.red);
 if(stage>=2&&r.entrantWitness!==null)s+=path('M205 '+Y(r.w)+'L415 '+Y(r.entrantWitness),C.gold,2,'4 5');
 return s;
}
function signalPlot(r,kind){
 const maxT=Math.max(4.4,r.tH*1.8),maxW=Math.max(12,r.vH*1.12),X=t=>70+500*t/maxT,Y=w=>300-235*w/maxW;
 let s=base('教育要求 t','工资 w');
 const line=(intercept,slope,color,dash='')=>path('M'+X(0)+' '+Y(intercept)+'L'+X(maxT)+' '+Y(intercept+slope*maxT),color,2,dash);
 if(stage>=1){
  s+=line(r.vL,r.betaL,C.purple,'4 4')+line(r.m,r.betaH,C.gold,'4 4');
  s+=text(575,72,'L等收入线',12,C.purple,'end')+text(575,92,'H等收入线',12,C.gold,'end');
 }
 s+=path('M'+X(0)+' '+Y(r.avg)+'H'+X(maxT),C.grid,1.5,'4 4');
 s+=dot(X(0),Y(r.vL),C.green,'contract-L')+text(X(0)+12,Y(r.vL)+20,'cL',12,C.green,'start');
 s+=dot(X(r.tH),Y(r.vH),C.red,'contract-H')+text(X(r.tH)+10,Y(r.vH)-12,'cH',12,C.red,'start');
 if(kind==='pool'||kind==='d143'||kind==='d144'){
  s+=dot(X(0),Y(r.avg),C.purple,'pooling')+text(X(0)+12,Y(r.avg)-10,'混同',12,C.purple,'start');
  if(stage>=2){const a=r.poolingWitness.contract;s+=dot(X(a.t),Y(a.w),C.gold,'pooling-entrant')+text(X(a.t)+10,Y(a.w)-12,'只吸引H',12,C.gold,'start')}
 }
 if((kind==='threshold'||kind==='q141'||kind==='proof'||kind==='signal')&&stage>=2&&r.separatingWitness){
  s+=dot(X(0),Y(r.separatingWitness.w),C.gold,'separating-entrant')+text(X(0)+12,Y(r.separatingWitness.w)+22,'新混同报价',12,C.gold,'start');
 }
 s+=text(578,Y(r.avg)-8,'平均生产率 '+fmt(r.avg),11,C.muted,'end');
 return s;
}
function certificatePlot(r){
 const Y=v=>305-210*(v+6)/30,X=(type,sign)=>type==='H'?(sign==='+'?195:285):(sign==='+'?425:515);
 let s=base('生产者类型 / 报价','净收入 p − 证书成本');
 s+=path('M70 '+Y(0)+'H600',C.muted,1.3,'4 4');
 for(const type of ['H','L'])for(const sign of ['+','-']){
  const v=sign==='+'?r.pPlus-(type==='H'?4:12):r.pMinus;
  const chosen=type==='H'?r.choiceH===sign:r.choiceL===sign;
  s+=path('M'+X(type,sign)+' '+Y(0)+'V'+Y(v),chosen?C.green:C.grid,14);
  s+=dot(X(type,sign),Y(v),chosen?C.green:sign==='+'?C.red:C.purple,type+sign,6);
  s+=text(X(type,sign),Y(v)-13,fmt(v),12,chosen?C.green:C.muted);
 }
 s+=text(240,337,'高质量 H',13)+text(470,337,'低质量 L',13);
 s+=text(195,356,'有证',11,C.red)+text(285,356,'无证',11,C.purple)+text(425,356,'有证',11,C.red)+text(515,356,'无证',11,C.purple);
 if(stage>=2)s+=text(350,74,'绿点：该类型的实际选择',12,C.green);
 return s;
}
function schoolPlot(r){
 const X=d=>65+520*d/15;
 let s=base('距城距离 / 公里','学校选址与学生去向');
 s+=text(70,320,'城市',12,C.ink,'start');
  for(const c of r.current){const y=c.style==='A'?125:220;s+=path('M'+X(c.d)+' 300V'+y,c.style==='A'?C.red:C.purple,2,'4 4')+dot(X(c.d),y,c.style==='A'?C.red:C.purple,'school-'+c.style,11)+text(X(c.d),y-17,c.style+'校：'+fmt(c.d)+'公里',13,c.style==='A'?C.red:C.purple)}
 if(r.witness&&stage>=2){const y=r.witness.style==='A'?125:220;s+=dot(X(r.witness.d),y,C.gold,'new-school',11)+text(X(r.witness.d),y+28,'新'+r.witness.style+'校',12,C.gold)}
 s+=text(87,58,'1型偏好A：可多走10 km',12,C.red,'start')+text(87,79,'2型偏好B：只愿为A多走5 km',12,C.purple,'start');
 s+=text(92,275,'1型 → '+r.choice1+'　　2型 → '+r.choice2,13,C.ink,'start');
 return s;
}
function panel(){
 const c=cases[name],s=state,k=c.kind,metrics=[],add=(a,b)=>metrics.push([a,typeof b==='number'?fmt(b):b]);
 let svg='',reading='',formula='',extra='',legend='',result;
 if(k==='simple'){
  const r=simpleWage(s);result=r;svg=wagePlot(r);
  add('现有雇主利润',r.currentProfit);add('工人会改选新报价',r.entryChosen?'是':'否');
  add('新雇主利润',r.entryProfit);add('唯一均衡工资',r.v);
  reading=r.w>r.v?'当前报价高于工人生产率，雇主亏损，违反条件 II。':r.w<r.v?'当前报价低于生产率；更高但仍低于生产率的新报价会吸引工人并获利，违反条件 III。':'工资恰好等于生产率；更高的报价会亏损，更低的报价抢不到工人。';
  if(stage<2)reading='从现有工资开始：先算雇主盈亏，再检查是否有人能报出更高但仍有利润的工资。';
  formula='\\pi(w)=v-w;\\quad C^*=\\{v\\};\\quad w<v\\Rightarrow w<w^\\prime<v';
  extra=table(['条件','当前判断'],[['I：报价被接受','是'],['II：不亏损',r.currentViable?'是':'否'],['III：无盈利进入',r.w<r.v?'否：可报 '+fmt(r.entrantWitness):'是']]);
  legend='紫色：现有工资　红色：你设置的进入工资　绿色：工人生产率';
 }else if(k==='certificate'){
  const r=certificate(s);result=r;svg=certificatePlot(r);
  add('H型选择',r.choiceH==='+'?'有证书':'无证书');add('L型选择',r.choiceL==='+'?'有证书':'无证书');
  add('有证书雇主利润',r.profitPlus);add('无证书雇主利润',r.profitMinus);
  reading=r.uniqueEquilibrium?'唯一均衡：H取得证书获20，扣4后净得16；L不取证书获10。两家交易者均零利润。':'比较两类卖家的净收入与交易者实际买到的质量；当前报价只是候选。原题完整均衡只在有证20、无证10。';
  formula='U_H(+)=p_+-4,\\quad U_L(+)=p_+-12;\\quad U_X(-)=p_-';
  extra=table(['报价','实际到来的类型','交易者利润'],[['有证书',r.attendeesPlus.join('、')||'无人',fmt(r.profitPlus)],['无证书',r.attendeesMinus.join('、')||'无人',fmt(r.profitMinus)]])+
  '<p>完整排除：两类都无证时，19&lt;p₊&lt;20的证书报价只吸引H并获利（在零利润混同价15下）；两类都拿证时，存在只吸引L或同时吸引两类的无证盈利报价。单交叉排除L拿证、H不拿证。分离后，竞争把有证H价推至20、无证L价推至10。数值滑块只是检验工具，结论来自这些连续区间的进入论证。</p>';
  legend='绿色：当前被选择的报价　红色：证书报价　紫色：无证报价';
 }else if(k.startsWith('school')){
  const mode=k==='schoolEmpty'?'empty':k==='schoolSingle'?'single':'pair',r=schools({mode,...s});result=r;svg=schoolPlot(r);
  add('1型选择',r.choice1);add('2型选择',r.choice2);add('是否均衡',r.equilibrium?'是':'否');
  if(r.witness){add('可进入的新校',r.witness.style+'，距城'+fmt(r.witness.d));add('新校只收合适类型',r.entrantOnlyFits?'是':'否')}
  reading=mode==='empty'?'没有学校时，任何一家新校独自进入都会吸引两类学生；新校必须只吸引适合其风格的类型，所以无人能够进入。':mode==='single'?(r.equilibrium?'A校距城小于5公里，两类都愿来；新B校无法单独吸引2型，靠近的A校又会吸引两类，故现有混合A校稳定。':'A校距离达到5公里后，B校可在合适位置单独吸引2型，故不是均衡。'):(r.equilibrium?'A校距城5公里、B校在城内；1型去A、2型去B。任何A校向城内移动都会混入2型，B校不能比0更近。':'两校必须分别服务1型与2型；如果距离差超过5，靠近的A校可只吸引1型；若B校不在0，靠近的B校可只吸引2型。');
  formula=mode==='empty'?'C=\\varnothing\\quad\\text{满足题面进入规则}':mode==='single'?'\\{(A,d)\\}\\text{为均衡}\\iff 0\\le d<5':'\\{(A,5),(B,0)\\}\\text{是唯一双校均衡}';
  extra='<p>按原题字面规则，全部均衡为：空学校集；一所A校且0≤d&lt;5；以及{(A,5),(B,0)}。现有学校允许吸引混合学生，新学校只允许吸引与风格相符的学生；若另加“必须至少有一所学校”的前提，才排除空集。</p>';
  if(mode==='pair')extra+=table(['距离差 d_A−d_B','两类选择 / 结果'],[['小于5','两类都去A，B关闭'],['等于5','1型去A、2型去B；B还须在0'],['大于5且小于10','分离，但新A校可进入'],['至少10','两类都去B，A关闭']]);
  legend='红色：A校　紫色：B校　金色：可以进入的新学校';
 }else if(k==='edge'){
  const vH=s.vH,r=signal({vH});result=r;svg=signalPlot(r,'signal');
  add('定义允许的边界', 'α_L=0');add('反例合同','(0,v_H)');add('进入者能获利','不能');
  reading='原定义允许某类型比例为零。若低类型比例恰为0，单一合同(0,v_H)满足三项均衡条件：任何想吸引高类型的新合同须付高于v_H的工资，都会亏损。故“没有混同均衡”要把两类均为正比例写作前提。';
  formula='\\alpha_L=0,\\quad C=\\{(0,v_H)\\},\\quad\\pi=0';
  extra='<p>这是对原书边界写法的校准，不改变正比例参数下的图14.2与命题14.1教学结论。</p>';
  legend='原定义第205页允许零比例；图中的正比例参数只是几何背景';
 }else{
  const r=signal({alphaL:s.alphaL??.65,betaH:s.betaH??1});result=r;svg=signalPlot(r,k);
  add('低类型比例 α_L',r.alphaL);add('两类平均生产率',r.avg);
  add('高类型净收入 m',r.m);add('分离均衡存在',r.equilibrium?'是':'否');
  const formulas={
   d141:'v_L<v_H,\\quad 0<\\beta_H<\\beta_L;\\quad\\bar v=\\alpha_Lv_L+(1-\\alpha_L)v_H',
   d142:'U_X(t,w)=w-\\beta_Xt;\\quad U_X(c)=U_X(c^\\prime)\\Rightarrow\\text{选更少教育}',
   d143:'\\pi(t,w)=\\begin{cases}v_H-w&H\\text{独来}\\\\v_L-w&L\\text{独来}\\\\\\bar v-w&H,L\\text{都来}\\end{cases}',
   d144:'I:\\text{每份合同有人选择};\\quad II:\\pi(c)\\ge0;\\quad III:\\nexists c^\\prime\\text{盈利进入}',
   pool:'\\bar v<v_H;\\quad\\bar v+\\beta_Ht<w<\\min\\{\\bar v+\\beta_Lt,v_H\\}',
   q141:'c_L^*=(0,v_L),\\quad c_H^*=\\left(\\frac{v_H-v_L}{\\beta_L},v_H\\right)',
   proof1:'U_X=0\\text{ 且失业时，选 }0<w<v_L\\text{ 的新报价可盈利}',
   proof2:'\\bar v+\\beta_Ht<w<\\bar v+\\beta_Lt\\quad\\text{且 }w<v_H',
   proof3:'\\pi(c_L)=v_L-w_L\\ge0,\\quad\\pi(c_H)=v_H-w_H\\ge0',
   proof4:'c_L^*=(0,v_L)',
   proof5:'v_H-\\beta_Lt_H=v_L,\\quad U_H(c_H)>U_H(c_L)',
   threshold:'\\bar v\\le m\\iff\\alpha_L\\ge\\frac{\\beta_H}{\\beta_L}',
  };
  formula=formulas[name]||formulas.q141;
  if(k==='pool'){
   reading=stage<2?'两类都接受零教育工资等于平均生产率的混同合同。想象一个要求少量教育、稍高工资的新合同。':'新合同让H的净收入升高、L的净收入下降，因此只吸引H。工资低于v_H，进入雇主获利；原混同合同不是均衡。';
   add('H专属报价工资',r.poolingWitness.contract.w);add('H专属进入利润',r.poolingWitness.profit);
   extra=table(['类型','改选新报价'],[['H',r.poolingWitness.H==='H专属'?'是':'否'],['L',r.poolingWitness.L==='H专属'?'是':'否']]);
  }else if(k==='threshold'){
   reading=r.equilibrium?'平均生产率不高于高类型在分离菜单下的净收入m。不存在能同时吸引两类、又严格盈利的零教育报价；等号时进入利润恰为0，按定义不打破均衡。':'平均生产率超过m。给出介于m与平均生产率之间的零教育工资，会同时吸引两类，进入雇主仍获利；分离候选被打破，没有其他均衡形状。';
   if(r.separatingWitness)add('混同进入工资',r.separatingWitness.w),add('进入利润',r.separatingWitness.profit);
   extra=table(['边界','当前值'],[['类型比例阈值 β_H/β_L',fmt(r.threshold)],['α_L − 阈值',fmt(r.alphaL-r.threshold)]])+'<p>原书第211页叙述“严格小于/严格大于”，未写等号；依定义III只禁止严格盈利，等号归入存在均衡一侧。</p>';
  }else if(k==='proof'){
   const explanations={
    proof1:'若某类完全不接受报价，给一个正但低于最低生产率的工资，会被他接受且进入者获利；所以均衡中两类都就业。',
    proof2:'混同报平均生产率，向上移动且略增教育，可让H愿意来、L不愿来，而工资仍低于H生产率。',
    proof3:'在分离结果中，L合同只吸引L，H合同只吸引H；雇主不亏损，所以工资不能高于各自生产率。',
    proof4:'若L合同要求教育或工资低于v_L，竞争者可给低教育且略高净收入的报价，只吸引L并获利；最终L合同为(0,v_L)。',
    proof5:'H合同工资被竞争推到v_H；其教育量正好让L在两合同净收入相同，按少教育平局规则选L。'
   };reading=explanations[name];extra='<p>证明中的每一次“可以进入”都须同时核对工人改选和雇主利润。图上两条虚线分别表示L与H的等净收入线。</p>';
  }else{
   reading={
    d141:'高类型生产率更高，但单位教育成本更低。教育是信号，不提高任何人的真实产出；比例改变雇主面对的混同平均生产率。',
    d142:'同一合同对H和L的净收入不同；相同净收入时，工人选要求教育更少的合同。图中L恰在两份分离合同间无差异，却选择cL。',
    d143:'先判断合同吸引了谁，再按真实类型计算雇主利润。混同合同的盈亏取决于两类人口比例，不能把工资与某个单一生产率直接比较。',
    d144:'均衡是合同集合。被选、无亏损、无盈利进入要同时成立；一套分离合同满足工人自我选择，仍可能被混同合同打破。',
    q141:'如果均衡存在，它只能是两份分离合同：L在零教育拿vL；H拿vH并接受刚好阻止L模仿的教育量。命题只刻画形状，还须查存在性。'
   }[name];
   extra=table(['合同','教育','工资','L净收入','H净收入'],[['cL',0,fmt(r.vL),fmt(r.vL),fmt(r.vL)],['cH',fmt(r.tH),fmt(r.vH),fmt(r.vH-r.betaL*r.tH),fmt(r.m)]]);
  }
  legend='绿色：L合同　红色：H合同　紫虚线：L等收入　金虚线：H等收入';
 }
 $('legend').textContent=legend;$('reading').textContent=reading;$('formula').textContent=formula;
 $('boundary').textContent='教材印刷页'+c.page+'：'+c.note;
 $('extra').innerHTML=extra;$('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');
 window.microMotion.chart($('plot'),E('svg',{viewBox:'0 0 650 370',role:'img','aria-label':c.label+'动态图',xmlns:'http://www.w3.org/2000/svg'},svg));
 for(const x of controls){if($('out-'+x.key))$('out-'+x.key).value=fmt(state[x.key]);if($(x.key))$(x.key).value=state[x.key]}
 last={case:name,stage,state:{...state},result};
}
function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='播放变化'}
function setup(k){stop();name=k;stage=0;controls=spec(cases[k].kind);state=Object.fromEntries(controls.map(x=>[x.key,x.value]));fields();history.replaceState(null,'',location.pathname+'?case='+k);panel()}
function advance(){stage=(stage+1)%4;panel();return stage===3}
$('fields').addEventListener('change',e=>{if(e.target.id==='case'){setup(e.target.value);return}if(e.target.dataset.key){stop();state[e.target.dataset.key]=e.target.tagName==='SELECT'?e.target.value:+e.target.value;stage=3;panel()}});
$('fields').addEventListener('input',e=>{if(!e.target.dataset.key||e.target.tagName!=='INPUT')return;stop();state[e.target.dataset.key]=+e.target.value;stage=3;panel()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}advance();if(window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance())stop()},1300);$('play').textContent='暂停变化'};$('reset').onclick=()=>setup(name);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',panel);
document.body.classList.add('signaling-lab-page');
window.demo={get caseName(){return name},get state(){return state},get last(){return last},draw:panel};setup(available.includes(query)?query:available[0]);
}

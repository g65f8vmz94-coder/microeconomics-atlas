import {cases,casesBySection,ruleNames,sum,close,proofProfile,distribute,shapleyLayers,permutationAudit,changeAudit,arrivals,axiomWitness,shapleyAxiomWitness} from './social-lab.mjs';
import {startSocialFoundationsStory} from './social-foundations-ui.js';
import {startSocialPropertiesStory} from './social-properties-ui.js';
import {startSocialCharacterizationStory} from './social-characterization-ui.js';
if(window.LESSON?.id==='19.1'){
 document.body.classList.add('social-lab-page');
 startSocialFoundationsStory(new URLSearchParams(location.search).get('case'));
}else if(window.LESSON?.id==='19.2'){
 document.body.classList.add('social-lab-page');
 startSocialPropertiesStory(new URLSearchParams(location.search).get('case'));
}else if(window.LESSON?.id==='19.3'){
 document.body.classList.add('social-lab-page');
 startSocialCharacterizationStory(new URLSearchParams(location.search).get('case'));
}else{
const $=id=>document.getElementById(id),meta=window.LESSON,available=casesBySection[meta.id],query=new URLSearchParams(location.search).get('case');
document.body.classList.add('social-lab-page');
const C={ink:'#213d37',green:'#177468',gold:'#b68b37',red:'#c35f43',muted:'#758778',wash:'#e7eddf',paper:'#fffdf7',purple:'#7a6594'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isInteger(n)?String(n):(+n.toFixed(3)).toString();
const R=(key,label,min,max,step,value)=>({key,label,min,max,step,value}),S=(key,label,options,value)=>({key,label,options,value});
const standardRules=Object.fromEntries(['equal-own','max-own','equal-equal','social','one-one','proportional'].map(k=>[k,ruleNames[k]]));
const axioms={eff:'效率',sym:'对称性',own:'自身单调',other:'他人单调'};
const parts={eff:'min-equal',sym:'dictator',own:'low-share',other:'high-share'};
const shapleyParts={eff:'min-equal',sym:'priority-shapley',zero:'social',marginal:'proportional'};
let name='',controls=[],state={},timer=null,last={};
function caseSpec(key){
 const c=cases[key],kind=c.kind,p=c.profile,allRules={...standardRules,'min-own':ruleNames['min-own'],'min-equal':ruleNames['min-equal'],'high-share':ruleNames['high-share'],'low-share':ruleNames['low-share'],dictator:ruleNames.dictator};
 if(kind==='independence')return[S('axiom','移去哪一条公理',axioms,'eff'),R('step','反例变化（如适用）',0,1,1,0)];
 if(kind==='shapley-independence')return[S('axiom','要排除的公理',{eff:'效率',sym:'对称性',zero:'零贡献',marginal:'边际贡献'},'eff'),R('step','反例变化（如适用）',0,1,1,0)];
 if(kind==='proof')return[R('step','证明步骤',0,3,1,0),...p.map((v,i)=>R('l'+i,(i+1)+'号生产率',0,12,1,v))];
 if(kind==='arrival')return[R('order','到达顺序编号',1,24,1,3),R('step','依次到达人数',0,p.length,1,0)];
 if(kind==='shapley')return[R('step','累计边际层数',0,shapleyLayers(p).layers.length,1,0)];
 if(kind==='own'||kind==='others'||kind==='strong-own')return[S('rule','制度规则',kind==='own'?{'min-own':ruleNames['min-own'],social:ruleNames.social,'equal-own':ruleNames['equal-own']}:kind==='strong-own'?{'max-own':ruleNames['max-own'],proportional:ruleNames.proportional,social:ruleNames.social}: {'max-own':ruleNames['max-own'],social:ruleNames.social,proportional:ruleNames.proportional},c.rule),S('who','谁的生产率上升',Object.fromEntries(p.map((_,i)=>[i,(i+1)+'号'])),String(c.who)),R('delta','上升幅度',0,8,1,c.delta)];
 if(kind==='cross')return[p.map((v,i)=>R('l'+i,(i+1)+'号生产率',0,12,1,v))].flat();
 const list=kind==='anonymity'||kind==='symmetry'||kind==='relative'||kind==='efficiency'?allRules:standardRules;
 const fields=[S('rule','制度规则',list,c.rule),...p.map((v,i)=>R('l'+i,(i+1)+'号生产率',0,12,1,v))];
 if(kind==='anonymity')fields.push(S('phase','身份顺序',{'0':'原顺序','1':'把身份整体轮换'},'0'));
 return fields;
}
function fields(){
 let html='<div class="field"><label for="case">原书条目 / 习题小问</label><select id="case" aria-label="切换第19章实验">'+available.map(k=>'<option value="'+k+'" '+(k===name?'selected':'')+'>'+esc(cases[k].label)+'</option>').join('')+'</select></div>';
 html+=controls.map(c=>c.options?'<div class="field"><label for="'+c.key+'">'+esc(c.label)+'</label><select id="'+c.key+'" data-key="'+c.key+'">'+Object.entries(c.options).map(([v,t])=>'<option value="'+v+'">'+esc(t)+'</option>').join('')+'</select></div>':'<div class="field"><label for="'+c.key+'">'+esc(c.label)+'<output id="out-'+c.key+'">'+fmt(state[c.key])+'</output></label><input id="'+c.key+'" data-key="'+c.key+'" type="range" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+state[c.key]+'"></div>').join('');
 $('fields').innerHTML=html;controls.forEach(c=>$(c.key).value=state[c.key]);
}
const E=(tag,a,b=null)=>'<'+tag+' '+Object.entries(a).map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+(b===null?'/>' :'>'+b+'</'+tag+'>');
const txt=(x,y,s,size=13,color=C.ink,anchor='start')=>E('text',{x,y,fill:color,'font-size':size,'text-anchor':anchor},esc(s));
const rect=(x,y,w,h,fill,key='',rx=3)=>E('rect',{x,y,width:Math.max(0,w),height:h,fill,rx,'data-motion':key});
const line=(x1,y1,x2,y2,color=C.wash,width=1,dash='')=>E('line',{x1,y1,x2,y2,stroke:color,'stroke-width':width,'stroke-dasharray':dash});
const table=(heads,rows)=>'<table><thead><tr>'+heads.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
function plot(data,{previous=null,wealth=null,phase='',highlight=[],arrivalIds=null,cumulative=false}={}){
 const compact=innerWidth<=620,W=compact?360:680,n=data.lambda.length,H=102+n*(compact?75:78)+25,xL=compact?70:98,wL=compact?105:205,xR=compact?215:386,wR=compact?107:190;
 const M=Math.max(1,data.max,previous?.max||0,...(wealth||data.wealth)),scale1=v=>v/M*wL,scale2=v=>v/M*wR;
 let out=rect(5,16,W-10,H-27,C.paper,'canvas',10)+txt(xL,48,arrivalIds?'已到场生产率':compact?'生产 λ / 实产 q':'生产率 λ 与实际产出 q',compact?12:15,C.ink)+txt(xR,48,arrivalIds?'本序边际贡献':cumulative?'累计分配':compact?'分得财富 w':'财富配置 w',compact?12:15,C.ink);
 out+=line(compact?196:352,32,compact?196:352,H-32,C.wash,2)+txt(W/2,51,'→',compact?16:21,C.gold,'middle');
 for(let i=0;i<n;i++){
  const y=86+i*(compact?75:78),q=data.output[i],v=(wealth||data.wealth)[i],old=previous?.wealth[i],changed=highlight.includes(i);
  out+=txt(compact?18:36,y+4,(i+1)+'号',compact?12:14,C.ink)+line(18,y+40,W-18,y+40,C.wash,1);
  out+=rect(xL,y-12,scale1(data.lambda[i]),19,C.wash,'potential-'+i)+rect(xL,y-12,scale1(arrivalIds?(arrivalIds.includes(i)?data.lambda[i]:0):q),19,C.green,'output-'+i);
  out+=txt(xL,y+28,arrivalIds?(arrivalIds.includes(i)?'已到达':'待到达'):'α='+fmt(data.input[i])+' · q='+fmt(q),compact?10:12,C.muted);
  if(old!==undefined)out+=rect(xR,y-12,scale2(old),19,'#d6ddd2','old-wealth-'+i);
  out+=rect(xR,y-12,scale2(v),19,changed?C.red:C.gold,'wealth-'+i);
  out+=txt(xR+wR+6,y+3,fmt(v),compact?11:13,changed?C.red:C.ink);
 }
 out+=txt(18,H-16,phase||'同一组人 · 先生产，再分配',compact?11:13,C.muted);
 return E('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':cases[name].label+'投入、生产与财富图',xmlns:'http://www.w3.org/2000/svg'},out);
}
function stateLambda(c){return c.profile.map((v,i)=>Object.hasOwn(state,'l'+i)?+state['l'+i]:v)}
function load(k){stop();name=available.includes(k)?k:available[0];controls=caseSpec(name);state=Object.fromEntries(controls.map(c=>[c.key,c.value]));fields();history.replaceState(null,'',location.pathname+'?case='+name);draw()}
function draw(){
 const c=cases[name],kind=c.kind,s=state;let lambda=stateLambda(c),rule=s.rule||c.rule,now=null,previous=null,wealth=null,phase='',reading='',formula='',extra='',metrics=[],highlight=[],result={};
 if(kind==='independence'||kind==='shapley-independence'){
  rule=(kind==='independence'?parts:shapleyParts)[s.axiom];const witness=kind==='independence'?axiomWitness(rule):shapleyAxiomWitness(rule);lambda=witness.lambda;
  if(witness.who!==undefined){const audit=changeAudit(lambda,rule,witness.who,witness.delta);previous=audit.before;now=+s.step?audit.after:audit.before;highlight=+s.step?audit.gains.map((v,i)=>v<0?i:-1).filter(i=>i>=0):[];result={audit,witness};phase=+s.step?'生产率提高后':'原生产率';}
  else{now=distribute(lambda,rule);result={now,witness};phase='固定反例 · '+witness.miss+'失效';}
  reading=(kind==='independence'?'原书命题19.2：':'习题19.3(d)的构造：')+ruleNames[rule]+'。'+witness.detail+' 这里给出一处违反的具体证据；其余公理成立要靠规则对所有生产率的代数检查。';
  formula=kind==='independence'?String.raw`\bigl(E,S,O,H\bigr)\setminus\{\text{所选公理}\}\quad\text{仍成立}`:String.raw`\bigl(E,S,Z,C\bigr)\setminus\{\text{所选公理}\}\quad\text{仍成立}`;
  const rows=kind==='independence'?Object.entries(parts).map(([a,r])=>[axioms[a],ruleNames[r]]):Object.entries(shapleyParts).map(([a,r])=>[{eff:'效率',sym:'对称性',zero:'零贡献',marginal:'边际贡献'}[a],ruleNames[r]]);
  extra=table(['缺少的公理','满足另外三条的完整规则'],rows);$('step').disabled=witness.who===undefined;
  if(kind==='shapley-independence'&&rule==='proportional'){
   const base=distribute(lambda,rule),raised=distribute([1,3],rule),increment=distribute([0,1],rule);
   extra+='<p>2号的对照：F₂(1,3)='+fmt(raised.wealth[1])+'，而 F₂(1,2)+F₂(0,1)='+fmt(base.wealth[1])+'+'+fmt(increment.wealth[1])+'='+fmt(base.wealth[1]+increment.wealth[1])+'。两边不相等。</p>';
  }
 }else if(kind==='proof'){
  const M=Math.max(...lambda),step=+s.step,raised=proofProfile(lambda,step);now=distribute(raised,'social');previous=step?distribute(lambda,'social'):null;result={M,raised,step,now};phase=['原状态 λ','提高其余人的生产率','全部生产率等于 M','效率把上界锁成等式'][step];
  const steps=['取原最大生产率 M。要证明的是任意满足四公理的制度 F，而图上平分最大产出的财富条仅作为满足条件的参照。','提高一人的生产率。由他人单调或自身单调，任何人的财富都不能因为向共同最大值靠近而降低。','共同状态 (M,…,M) 下，由对称性与可行性，每人最多取得 M/n。因此原状态任一人的财富也不超过 M/n。','效率要求原状态的财富总和恰好为 M。每人的财富都不超过 M/n，而 n 人之和是 M，所以每人恰好 M/n。'];
  reading=steps[step]+(name==='q191c'?' 反向检验：平分最大产出本身满足效率、对称性、自身及他人单调。':'');
  formula=step<2?String.raw`M=\max_i\lambda_i,\quad \lambda_i\le M`:step===2?String.raw`F_i(\lambda)\le F_i(M,\ldots,M)\le\frac{M}{n}`:String.raw`\sum_iF_i(\lambda)=M,\quad F_i(\lambda)\le\frac{M}{n}\Rightarrow F_i(\lambda)=\frac{M}{n}`;
  extra=table(['原生产率','第'+step+'步状态','当前参照规则财富'],lambda.map((v,i)=>[(i+1)+'号：'+fmt(v),fmt(raised[i]),fmt(now.wealth[i])]));
 }else if(kind==='arrival'){
  const a=arrivals(lambda),idx=+s.order-1,order=a.orders[idx],step=+s.step,sequence=a.values[idx],partial=Array(lambda.length).fill(0);
  sequence.slice(0,step).forEach(([i,v])=>partial[i]=v);
  now=distribute(lambda,'shapley');wealth=partial;result={a,idx,order,step,partial,now};phase='顺序 '+s.order+' / 24 · 已到 '+step+' 人';
  reading='按选定顺序让人依次到达；每人带来“到达后最高生产率减去到达前最高生产率”。默认使用原题举例的(1,3,2,4)，其贡献为(1,0,5,4)。这条路径的贡献随顺序改变；对全部24种顺序逐人取平均，才得到Shapley配置。';
  formula=String.raw`\phi_i=\frac{1}{24}\sum_{\pi\in\Pi_4}\bigl(\max_{j\preceq_\pi i}\lambda_j-\max_{j\prec_\pi i}\lambda_j\bigr);\quad F(1,3,6,10)=\left(\frac14,\frac{11}{12},\frac{29}{12},\frac{77}{12}\right)`;
  extra=table(['到达次序','本次边际贡献'],sequence.map(([i,v],j)=>[j+1+' · '+(i+1)+'号',fmt(v)]))+table(['个人','24种顺序的平均','Shapley层级结果'],a.average.map((v,i)=>[(i+1)+'号',fmt(v),fmt(now.wealth[i])]));
 }else if(kind==='shapley'){
  const sh=shapleyLayers(lambda),step=+s.step;now=distribute(lambda,'shapley');wealth=step?sh.layers[step-1].wealth:Array(lambda.length).fill(0);result={sh,step,now};phase='完成 '+step+' / '+sh.layers.length+' 层边际增量';
  reading='按生产率阈值逐层增加可生产财富。每层增量由仍能达到该阈值的人平分。滑到最后一层得到完整配置；中间显示的是计算过程的累计值，不是另一套最终制度。';
  formula=String.raw`F_i(\lambda)=\sum_{k:\lambda_i\ge t_k}\frac{t_k-t_{k-1}}{|\{j:\lambda_j\ge t_k\}|}`+(lambda.length===2?String.raw`;\quad F(1,3)=\left(\frac12,\frac52\right)`:String.raw`;\quad F(1,3,6,10)=\left(\frac14,\frac{11}{12},\frac{29}{12},\frac{77}{12}\right)`);
  extra=table(['生产率层','本层增量','参与人数','各人本层所得'],sh.layers.map(x=>[fmt(x.from)+' → '+fmt(x.to),fmt(x.delta),x.active.length,x.shares.map(fmt).join('，')]));
 }else if(kind==='anonymity'){
  const order=lambda.map((_,i)=>(i+1)%lambda.length),a=permutationAudit(lambda,rule,order);now=+s.phase?a.after:a.before;previous=+s.phase?a.before:null;result=a;phase=+s.phase?'身份轮换后 · 应比较同一个人':'原身份顺序';
  reading='匿名性跨两个生产率状态比较：把“名字”整体轮换，跟着原来的人看其财富是否也等量轮换。它强于同一状态下同生产率者同财富的对称性。固定1号受益的规则可作为反例。';
  formula=String.raw`\hat\lambda_{\sigma(i)}=\lambda_i\Rightarrow F_{\sigma(i)}(\hat\lambda)=F_i(\lambda)`;
  extra=table(['新位置','对应原位置','原财富应搬到','实际新财富'],order.map((old,j)=>[(j+1)+'号',(old+1)+'号',fmt(a.expected[j]),fmt(a.after.wealth[j])]));
 }else if(kind==='own'||kind==='others'||kind==='strong-own'){
  const audit=changeAudit(lambda,rule,+s.who,+s.delta);previous=audit.before;now=audit.after;result=audit;phase=(+s.who+1)+'号生产率增加 '+fmt(+s.delta);highlight=audit.gains.map((v,i)=>v<0?i:-1).filter(i=>i>=0);
  const target=(+s.who+1)+'号';
  if(kind==='own')reading=target+'的生产率从 '+fmt(lambda[+s.who])+' 增加到 '+fmt(audit.next[+s.who])+'。自身单调要求该人财富不下降。本例 '+(audit.own?'未违反':'已违反')+'；若规则为“最低者投入，各取所产”，最低者身份可以在上升后丢失。';
  else if(kind==='others')reading=target+'生产率增加时，观察其他人的财富。最高生产率者各取所产的规则中，旧冠军可能被新冠军取代，旧冠军财富会下降。有限数值仅能提供违反的证据，不能证明一套规则处处满足。';
  else reading='强自身单调的前提是原财富严格为正。前提成立时，增加自身生产率必须严格增加自身财富。按生产率分配最大产出与“最强者各取所产”是两种不同的合格规则；平分最大产出不满足该强性质。';
  formula=kind==='strong-own'?String.raw`F_i(\lambda)>0\Rightarrow F_i(\lambda_i+\Delta,\lambda_{-i})>F_i(\lambda)`:kind==='own'?String.raw`F_i(\lambda_i+\Delta,\lambda_{-i})\ge F_i(\lambda)`:String.raw`j\ne i\Rightarrow F_j(\lambda_i+\Delta,\lambda_{-i})\ge F_j(\lambda)`;
  extra=table(['个人','原生产率','新生产率','原财富','新财富','变化'],lambda.map((v,i)=>[(i+1)+'号',fmt(v),fmt(audit.next[i]),fmt(previous.wealth[i]),fmt(now.wealth[i]),fmt(audit.gains[i])]));
 }else{
  now=distribute(lambda,rule);result={now};phase=ruleNames[rule];
  const descriptions={
   flow:'投入份额决定个人产出；制度再指定谁拿走产出。切换六种原书规则，保持同一生产率档案，可直接比较“生产得多”与“分得多”的区别。',
   feasible:'可行财富配置必须非负，而且全员财富总和恰好等于某份总投入为1的分配所生产的财富。改变制度时同时看 α、产出和财富总和。',
   system:'制度 F 是对每一种可能生产率档案给出财富配置的完整规则；当前只显示其中一个状态。改变生产率后，同一规则必须再次计算，不能只记住这张图。',
   efficiency:'效率要求没有可行配置能让某些人更富而无人更穷。在本线性技术中，恰等价于总财富达到最高生产率 M；平分投入通常达不到。',
   symmetry:'对称性只在同一个状态中检查同生产率的人是否获得同财富。设两人生产率相同，切换固定受益者的规则，观察两人财富是否相同。',
   relative:'相对单调性比较同一状态中的两个人：生产率较高者不能更穷。它与“提高自己生产率后自己不变穷”是不同的条件。',
   cross:'两人平分投入后交换各自所产。F₁=λ₂/2，F₂=λ₁/2；各自的财富与自身生产率无关，所以自身单调成立。同生产率时同财富，但较高生产率的人反而更穷，故相对单调失败。原书印刷307页的一句叙述与310页习题19.1(b)要求相冲突；本站按题目要求展示可行反例。'
  };
  reading=descriptions[kind]||descriptions.flow;
  formula=kind==='cross'?String.raw`F_1(\lambda)=\frac{\lambda_2}{2},\quad F_2(\lambda)=\frac{\lambda_1}{2}`:kind==='efficiency'?String.raw`\sum_iF_i(\lambda)=\max_i\lambda_i\iff\text{有效率}`:kind==='symmetry'?String.raw`\lambda_i=\lambda_j\Rightarrow F_i(\lambda)=F_j(\lambda)`:kind==='relative'?String.raw`\lambda_i\ge\lambda_j\Rightarrow F_i(\lambda)\ge F_j(\lambda)`:kind==='system'?String.raw`F:\lambda\mapsto(w_1,\ldots,w_n)`:String.raw`\sum_i\alpha_i=1,\quad q_i=\alpha_i\lambda_i,\quad\sum_iw_i=\sum_iq_i`;
  if(['flow','feasible','system'].includes(kind)){
   const rules={
    'equal-own':String.raw`F_i(\lambda)=\frac{\lambda_i}{n}`,
    'max-own':String.raw`T=\{j:\lambda_j=M\},\quad F_i(\lambda)=\begin{cases}\frac{M}{|T|}&i\in T\\0&i\notin T\end{cases}`,
    'equal-equal':String.raw`F_i(\lambda)=\frac{\sum_j\lambda_j}{n^2}`,
    social:String.raw`F_i(\lambda)=\frac{\max_j\lambda_j}{n}`,
    'one-one':String.raw`F_2(\lambda)=\lambda_1,\quad F_i(\lambda)=0\ (i\ne2)`,
    proportional:String.raw`F_i(\lambda)=\frac{M\lambda_i}{\sum_j\lambda_j}\quad(\sum_j\lambda_j>0)`
   };formula+=';'+rules[rule];
  }
  extra=table(['个人','生产率 λ','投入 α','个人产出 αλ','分得财富 w'],lambda.map((v,i)=>[(i+1)+'号',fmt(v),fmt(now.input[i]),fmt(now.output[i]),fmt(now.wealth[i])]));
 }
 if(!now)throw Error('未生成当前状态');
 const vis=plot(now,{previous,wealth,phase,highlight,arrivalIds:kind==='arrival'?result.order.slice(0,result.step):null,cumulative:kind==='shapley'});window.microMotion.chart($('plot'),vis);
 const displayed=wealth||now.wealth,top=now.max,total=sum(displayed);
 if(!metrics.length)metrics=[['实际产出',fmt(now.total)],['最大可生产',fmt(top)],['当前展示财富',fmt(total)],['制度财富守恒',now.feasible?'是':'否']];
 if(kind==='shapley'){metrics[2]=['当前累计分配',fmt(total)];metrics[3]=['最终Shapley财富和',fmt(sum(now.wealth))]}
 if(kind==='arrival')metrics=[['已到达人数',result.step+' / 4'],['当前可生产量',fmt(Math.max(0,...result.order.slice(0,result.step).map(i=>lambda[i])))],['已计边际贡献',fmt(total)],['平均值财富和',fmt(sum(now.wealth))]];
 if(kind==='anonymity')metrics[3]=['本例匿名性',result.anonymous?'满足':'违反'];
 if(kind==='efficiency'||kind==='independence'||kind==='shapley-independence')metrics[1]=['效率检查',now.efficient?'达上界':'未达上界'];
 if(kind==='own'||kind==='others'||kind==='strong-own')metrics=[['原财富总和',fmt(sum(previous.wealth))],['新财富总和',fmt(sum(now.wealth))],['自身不下降',result.own?'是':'否'],['他人不下降',result.others?'是':'否']];
 $('legend').textContent=kind==='arrival'?'灰色：待到场生产率　绿色：已到场生产率　金色：本序累计边际贡献':'灰色：潜在产量 / 旧财富　绿色：实际生产　金色：当前财富　红色：财富下降';
 $('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');
 $('reading').textContent=reading;$('formula').textContent=formula;
 $('boundary').textContent='原书第19章 §'+c.section+'，印刷第'+c.page+'页。生产率非负，总投入为1，产出与投入成正比，个人努力外生；图中数值是例子，普遍公理须按全部状态检验。';
 $('extra').innerHTML=extra;last={case:name,kind,rule,lambda,now,previous,displayed,result};
 controls.forEach(q=>{if($('out-'+q.key))$('out-'+q.key).value=fmt(s[q.key]);$(q.key).value=s[q.key]});
}
function stop(){if(timer)clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function advance(){let c=controls.find(x=>x.key==='step'&&!$(x.key).disabled)||controls.find(x=>x.key==='axiom')||controls.find(x=>x.key==='phase')||controls.find(x=>x.key==='rule')||controls.find(x=>x.key==='l0');if(!c)return true;
 if(c.options){const keys=Object.keys(c.options),idx=keys.indexOf(String(state[c.key]));state[c.key]=keys[(idx+1)%keys.length];draw();return idx===keys.length-2}
 state[c.key]=state[c.key]>=c.max?c.min:+state[c.key]+c.step;draw();return state[c.key]>=c.max;
}
$('fields').addEventListener('input',e=>{if(e.target.id==='case'){load(e.target.value);return}const c=controls.find(x=>x.key===e.target.dataset.key);if(!c)return;stop();state[c.key]=c.options?e.target.value:+e.target.value;if(c.key==='order')state.step=0;draw()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}if(window.microMotion.reduced.matches){advance();return}if(advance())return;timer=setInterval(()=>{if(advance())stop()},1300);$('play').textContent='暂停变化'};
$('reset').onclick=()=>load(name);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',draw);
window.demo={get name(){return name},get state(){return state},get last(){return last},load,draw};load(query||available[0]);
}

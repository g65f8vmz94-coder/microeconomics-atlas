import {sum,project,reportComparison,profiles,galeShapley,blockingPairs,matchingAnalysis,distribution,wealthChecks} from './models.mjs';
const $=id=>document.getElementById(id),meta=window.LESSON,key=meta.engine;
const f=x=>typeof x==='number'?x.toLocaleString('zh-CN',{maximumFractionDigits:2}):x;
const g='#16766a',red='#c66045',purple='#7a6594',ink='#243f3c',muted='#99a9a1';
const range=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),select=(k,label,options,value)=>({k,label,options,value});
const state={},spec=[];let timer=null;
if(['public','strategyproof','vcg'].includes(key)) {
 spec.push(select('rule','决策规则',{majority:'多数规则 · 无转移',sum:'报告求和 · 无转移',vcg:'VCG · 关键人付款'},key==='public'?'majority':key==='strategyproof'?'sum':'vcg'));
 for(let i=1;i<=5;i++)spec.push(range('v'+i,'居民'+i+'真实净估值',-12,12,.5,i===1?5:-1));
 spec.push(select('honest','居民1的报告',{yes:'报告真实估值',no:'尝试其他报告'},'yes'),range('report','居民1尝试报告',-20,20,.5,8));
}else if(key==='matching') {
 spec.push(select('profile','偏好档案',Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,v.label])),'textbook'));
 spec.push(select('method','匹配方法',{gsx:'X申请的延迟接受',gsy:'Y申请的延迟接受',serial:'X顺序独裁',rank:'总名次最小',greedy:'逐次选最优一对',manual:'枚举所有匹配'},'gsx'));
 spec.push(range('step','算法进度',0,16,1,0),range('allocation','枚举匹配编号',0,23,1,0));
}else {
 spec.push(range('a','甲的生产率',0,12,.5,3),range('b','乙的生产率',0,12,.5,6),range('c','丙的生产率',0,12,.5,9));
 if(key==='social')spec.push(select('rule','制度规则',{'equal-own':'等投入 · 各取所产','max-own':'最强者投入 · 各取所产','equal-equal':'等投入 · 平分财富','max-equal':'最强者投入 · 平分财富','one-one':'甲生产 · 乙取得','proportional':'有效生产 · 按生产率分配','min-equal':'最低产出 · 平分财富','max-first':'有效生产 · 甲全部取得','max-lowest':'有效生产 · 最弱者取得'},'max-equal'),select('who','提高谁的生产率',{0:'甲',1:'乙',2:'丙'},'0'),range('delta','提高的幅度',0,12,.5,5));
 else spec.push(range('step','抬升到共同最大值M',0,3,1,0),select('axiom','去掉哪条公理',{all:'保留全部四条公理',eff:'去掉效率',sym:'去掉对称性',own:'去掉自身单调',other:'去掉他人单调'},'all'));
}
spec.forEach(c=>state[c.k]=c.value);
$('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}" ${v===String(c.value)?'selected':''}>${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label}<output id="out-${c.k}">${f(c.value)}</output></label><input id="${c.k}" data-key="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');
const text=(x,y,t,fill=ink,size=14,anchor='middle')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size*Math.max(1,600/Math.max(270,$('plot').clientWidth))}" text-anchor="${anchor}">${t}</text>`;
const line=(x,y,X,Y,color=g,width=2,dash='')=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
function bars(labels,series){const W=560,n=labels.length,values=series.flatMap(s=>s.values),lo=Math.min(0,...values),hi=Math.max(1,...values),ys=y=>270-(y-lo)/(hi-lo||1)*230,zero=ys(0);let svg=line(20,zero,580,zero,muted,1);labels.forEach((l,i)=>{const x=20+i*W/n;svg+=text(x+W/n/2,330,l);series.forEach((s,j)=>{const v=s.values[i],w=W/n/(series.length+1),xx=x+w*(j+.5),yy=ys(Math.max(0,v));svg+=`<rect data-motion="bar-${i}-${j}" x="${xx}" y="${yy}" width="${w*.8}" height="${Math.abs(ys(v)-zero)}" rx="3" fill="${s.color}" opacity=".83"/>`+text(xx+w*.4,v>=0?yy-10:ys(v)+18,f(v),s.color,12)})});return svg}
const table=(headers,rows)=>`<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
let last;
function render(){let svg='',metrics=[],reading='',formula='',extra='',boundary=meta.boundary,legend='';
 if(['public','strategyproof','vcg'].includes(key)){
  const values=[1,2,3,4,5].map(i=>state['v'+i]),report=state.honest==='yes'?values[0]:state.report,c=reportComparison(values,report,state.rule),p=c.actual;
  svg=bars(['居民1','居民2','居民3','居民4','居民5'],[{values:c.reports,color:g},{values:p.transfers,color:red}]);
  metrics=[['当前决定',p.decision?'实施项目':'不实施'],['诚实报告效用',c.honestUtility],['当前真实效用',c.actualUtility],['谎报增益',c.gain]];
  legend='绿色：报告值　赤色：向个人的转移（负数是付款）';
  formula='uᵢ = vᵢ·d + tᵢ；VCG：tᵢ = d·Σⱼ≠ᵢxⱼ − max(0, Σⱼ≠ᵢxⱼ)';
  reading=state.rule==='vcg'?'先去掉自己，再比较其他人会选的结果；改变结果的人承担给他人带来的损失。总转移通常不为零，不能默认把收款返还。':state.rule==='sum'?'报告求和考虑强度，却允许某些人夸大报告来改变结果。真实效用始终用真实估值计算，不能用谎报值替代。':'多数规则只使用报告的正负，不使用强度。在这个二元项目、无转移的模型中，真实报告弱最优；但决定未必让总净估值最大。';
  extra=table(['居民','真实值','报告值','无本人时的总报告','转移','真实效用'],values.map((v,i)=>[i+1,v,c.reports[i],f(p.total-c.reports[i]),f(p.transfers[i]),f(v*p.decision+p.transfers[i])]));last=c;
 }else if(key==='matching'){
  const pr=profiles[state.profile],side=state.method==='gsy'?'Y':'X',gs=galeShapley(pr.X,pr.Y,side),analysis=matchingAnalysis(pr.X,pr.Y),step=Math.min(state.step,gs.trace.length-1),t=gs.trace[step],isGS=state.method.startsWith('gs');
  const m=isGS?t.matching:state.method==='serial'?analysis.serial:state.method==='rank'?analysis.rankMinimum:state.method==='greedy'?analysis.greedy:analysis.all[state.allocation];
  const blocking=blockingPairs(pr.X,pr.Y,m),complete=m.every(x=>x>=0);
  for(let x=0;x<4;x++){const y=80+x*65;svg+=`<circle cx="115" cy="${y}" r="22" fill="#dfede3"/><circle cx="485" cy="${y}" r="22" fill="#f1e4d9"/>`+text(115,y+5,'X'+(x+1))+text(485,y+5,'Y'+(x+1));}
  m.forEach((y,x)=>{if(y>=0)svg+=line(140,80+x*65,460,80+y*65,g,3).replace('<line','<line data-motion="match-'+x+'-'+y+'"')});
  if(isGS&&step>0)for(const [p,r]of t.rejections){const x=side==='X'?p:r,y=side==='X'?r:p;svg+=line(140,80+x*65,460,80+y*65,red,1.5,'5 5')}
  if(!isGS&&blocking.length){const[x,y]=blocking[0];svg+=line(140,80+x*65,460,80+y*65,red,4,'7 4')}
  svg+=text(300,30,isGS?`第${step}轮 / 共${gs.trace.length-1}轮`:complete?'完整匹配':'暂未匹配');
  metrics=[['匹配人数',m.filter(y=>y>=0).length+' / 4'],['完整配置的阻挡对',complete?blocking.length:'等待终态'],['全部稳定匹配',analysis.stable.length],['当前稳定性',!complete?'未结束':blocking.length?'不稳定':'稳定']];
  const fmtPref=(p,letter)=>p.map(x=>letter+(x+1)).join(' ≻ ');
  extra=table(['X成员','对Y的排序','Y成员','对X的排序'],pr.X.map((p,i)=>['X'+(i+1),fmtPref(p,'Y'),'Y'+(i+1),fmtPref(pr.Y[i],'X')]))+table(['稳定匹配（X1至X4依次对应）','X方名次','Y方名次'],analysis.stable.map(a=>[a.map(y=>'Y'+(y+1)).join('，'),a.map((y,x)=>pr.X[x].indexOf(y)+1).join('，'),pr.Y.map((p,y)=>p.indexOf(a.indexOf(y))+1).join('，')]));
  reading=isGS?'绿色连接表示当前暂时匹配，红色虚线表示本轮拒绝。接收方只会换成更偏好的对象，申请方永远不向已拒绝自己的人重新申请。':'绿色为当前配对；若有红色虚线，两端都更喜欢彼此，它就是这次配置不稳定的具体证据。总名次最小与稳定性是不同标准。';
  formula='阻挡对：(x,y)不在当前匹配中，且 y ≻ₓ μ(x)、x ≻ᵧ μ⁻¹(y)';legend='绿色：暂时/最终配对　赤色虚线：拒绝或阻挡对';last={m,blocking,complete,gs,analysis,step};
  const stepControl=spec.find(c=>c.k==='step');stepControl.max=gs.trace.length-1;state.step=step;$(stepControl.k).max=stepControl.max;
  $('step').disabled=!isGS;$('allocation').disabled=state.method!=='manual';
 }else if(key==='social'){
  const lambda=[state.a,state.b,state.c],r=wealthChecks(lambda,state.rule,+state.who,state.delta);
  svg=bars(['甲','乙','丙'],[{values:r.before.wealth,color:muted},{values:r.after.wealth,color:g}]);
  metrics=[['原总产出',r.before.output],['变化后总产出',r.after.output],['该人的财富不减',r.own?'本例满足':'本例违反'],['其他人财富不减',r.others?'本例满足':'本例违反']];
  extra=table(['个人','原生产率','原投入份额','原财富','新生产率','新财富'],lambda.map((v,i)=>['甲乙丙'[i],v,f(r.before.input[i]),f(r.before.wealth[i]),r.next[i],f(r.after.wealth[i])]))+`<p>当前原配置：总财富 ${f(sum(r.before.wealth))}，最大可生产量 ${f(r.before.max)}。${r.before.efficient?'达到了产出上界。':'还存在生产效率损失。'}</p>`;
  formula='Σαᵢ=1；产出=Σαᵢλᵢ；Σwᵢ=产出；最大产出=max λᵢ';
  reading='同一套生产技术可以配上不同的分配规则。检查公理时，要区分“在这个数值例子成立”和“对所有可能生产率成立”。用反例推翻规则比用几个样本证明规则容易。';legend='灰色：原财富　绿色：单人生产率提高后的财富';last=r;
 }else {
  const lambda=[state.a,state.b,state.c],M=Math.max(...lambda),step=state.step,next=lambda.map((x,i)=>i<step?M:x),rule={all:'max-equal',eff:'min-equal',sym:'max-first',own:'max-lowest',other:'max-own'}[state.axiom],r=distribution(next,rule);
  svg=bars(['甲','乙','丙'],[{values:next,color:muted},{values:r.wealth,color:g}]);
  const stages=['从原生产率出发，固定原最大值M。','先抬升甲的生产率。其他人财富不能因此下降。','再抬升乙。持续使用相应的单调性条件。','全体生产率等于M。对称性与可行性锁定每人M/3；效率再锁定原状态。'];
  metrics=[['原最大值 M',M],['证明上界 M/3',M/3],['当前总财富',sum(r.wealth)],['当前步骤',step+' / 3']];
  reading=stages[step]+' '+(state.axiom==='all'?'此图用满足四公理的规则显示路径。一般证明是：任意候选规则若满足单调性，每人的原财富不能超过共同终态的M/3；效率要求总和=M，故人人恰为M/3。':'当前切换到书中公理独立性的反例规则：它保留另三条公理，但失去被删除的一条。请与19.2联动改变参数寻找具体违反。');
  formula='Fᵢ(λ) ≤ Fᵢ(M,…,M)=M/n；ΣFᵢ(λ)=M ⇒ 对所有i，Fᵢ(λ)=M/n';
  extra=table(['被去掉的公理','仍满足另三条的规则'],[['效率','把最低可生产总量平均分配'],['对称性','有效生产，全部财富给固定的甲'],['自身单调','有效生产，财富给生产率最低者'],['他人单调','有效生产，财富给生产率最高者']]);legend='灰色：当前生产率　绿色：当前规则的财富';last={lambda,next,M,rule,...r};
 }
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 600 360" role="img" aria-label="${meta.title}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);
 $('legend').textContent=legend;$('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${f(v)}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('extra').innerHTML=extra;
 spec.forEach(c=>{if($('out-'+c.k))$('out-'+c.k).value=f(state[c.k]);$(c.k).value=state[c.k]});
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='自动推演'}
function advance(){const c=spec.find(c=>c.k==='step')||spec.find(c=>c.k==='report')||spec.find(c=>c.k==='delta');if(c){if(c.k==='report')state.honest='no';state[c.k]=state[c.k]>=c.max?c.min:Math.min(c.max,state[c.k]+(c.step===1?1:(c.max-c.min)/8));}render();return c?state[c.k]>=c.max:true}
$('fields').addEventListener('input',e=>{const c=spec.find(c=>c.k===e.target.dataset.key);if(!c)return;stop();state[c.k]=c.options?e.target.value:+e.target.value;render()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}if(window.microMotion.reduced.matches){advance();return}if(advance())return;timer=setInterval(()=>{if(advance())stop()},1300);$('play').textContent='暂停推演'};
$('reset').onclick=()=>{stop();spec.forEach(c=>state[c.k]=c.value);render()};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);
window.addEventListener('resize',render);window.demo={meta,state,spec,draw:render,get last(){return last}};render();

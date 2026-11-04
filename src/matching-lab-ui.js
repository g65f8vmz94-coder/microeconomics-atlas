import {examples,cases,casesBySection,gs,analysis,blockers,paretoDominates,capacityPrefs,capacityGS,capacityBlockers,roomPrefs,roomAssignments,roomBlockers} from './matching-lab.mjs';
import {startMatchingFoundationsStory} from './matching-foundations-ui.js';
import {startMatchingAlgorithmStory} from './matching-algorithm-ui.js';
import {startMatchingStabilityStory} from './matching-stability-ui.js';
if(window.LESSON?.id==='18.1'){
 document.body.classList.add('matching-lab-page');
 startMatchingFoundationsStory(new URLSearchParams(location.search).get('case'));
}else if(window.LESSON?.id==='18.2'){
 document.body.classList.add('matching-lab-page');
 startMatchingAlgorithmStory(new URLSearchParams(location.search).get('case'));
}else if(window.LESSON?.id==='18.3'){
 document.body.classList.add('matching-lab-page');
 startMatchingStabilityStory(new URLSearchParams(location.search).get('case'));
}else{
const $=id=>document.getElementById(id),meta=window.LESSON,available=casesBySection[meta.id],query=new URLSearchParams(location.search).get('case');
document.body.classList.add('matching-lab-page');
const C={ink:'#213d37',green:'#177468',red:'#c35f43',purple:'#7a6594',gold:'#b68b37',muted:'#758778',grid:'#dce2d5',paper:'#fffdf7',wash:'#e8eee4'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=m=>m.map(y=>y<0?'—':'Y'+(y+1)).join('，');
const R=(key,label,min,max,value=0)=>({key,label,min,max,value}),S=(key,label,options,value)=>({key,label,options,value});
let name='',controls=[],state={},timer=null,last={};
function caseSpec(k){
 const c=cases[k],kind=c.kind;
 if(kind==='roommate')return[S('allocation','四人两两配对',{'0':'(1,2) + (3,4)','1':'(1,3) + (2,4)','2':'(1,4) + (2,3)'},'0')];
 if(kind==='capacity')return[R('step','延迟接受轮次',0,5,0),S('capacity','每个项目容量',{'1':'1 · 只观察首批','2':'2 · 原题 n=2'},'2')];
 let method=kind==='serial'||kind==='unstable'||kind==='pareto'?'serial':kind==='rank'?'rank':kind==='greedy'?'greedy':kind==='matching'||kind==='stable'?'manual':'gsx';
 if(kind==='xBest'||kind==='yWorst'||kind==='gsStable')method='gsx';
 const methods=kind==='unequal'?{gsx:'A 申请 · 延迟接受',gsy:'B 申请 · 延迟接受'}:kind==='manipulate'?{gsx:'X 申请 · 延迟接受'}:{gsx:'X 申请 · 延迟接受',gsy:'Y 申请 · 延迟接受',serial:'X 顺序独裁',rank:'总名次最小',greedy:'逐次选最优一对',manual:'枚举完整匹配'};
 const x=[S('method','运行方法',methods,method)];
 if(kind==='unequal')x.unshift(S('profile','人数情形',{oneA:'一位 A、三位 B · (a)',unequal:'两位 A、三位 B · (b)(c)'},'unequal'));
 if(kind==='manipulate')x.unshift(S('report','Y1 向算法报告的排序',{true:'诚实：X2 ≻ X1 ≻ X3',lie:'谎报：X2 ≻ X3 ≻ X1'},'true'));
 x.push(R('step','过程进度',0,16,0));
 if(!['unequal','manipulate'].includes(kind))x.push(R('allocation','枚举匹配编号',1,24,1));
 return x;
}
function fields(){
 let h='<div class="field"><label for="case">原书条目 / 章末题</label><select id="case" aria-label="切换第18章实验">';
 for(const k of available)h+='<option value="'+k+'" '+(k===name?'selected':'')+'>'+esc(cases[k].label)+'</option>';
 h+='</select></div>';
 h+=controls.map(c=>c.options?'<div class="field"><label for="'+c.key+'">'+esc(c.label)+'</label><select id="'+c.key+'" data-key="'+c.key+'">'+Object.entries(c.options).map(([v,l])=>'<option value="'+v+'">'+esc(l)+'</option>').join('')+'</select></div>':'<div class="field"><label for="'+c.key+'">'+esc(c.label)+'<output id="out-'+c.key+'">'+state[c.key]+'</output></label><input id="'+c.key+'" data-key="'+c.key+'" type="range" min="'+c.min+'" max="'+c.max+'" step="1" value="'+state[c.key]+'"></div>').join('');
 $('fields').innerHTML=h;controls.forEach(c=>$(c.key).value=state[c.key]);
}
const E=(tag,attrs,body=null)=>'<'+tag+' '+Object.entries(attrs).map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+(body===null?'/>' :'>'+body+'</'+tag+'>');
const txt=(x,y,s,size=13,color=C.ink,anchor='middle')=>E('text',{x,y,'text-anchor':anchor,fill:color,'font-size':size},esc(s));
const path=(d,color,width=2,dash='',key='')=>E('path',{d,stroke:color,'stroke-width':width,'stroke-dasharray':dash,fill:'none','data-motion':key});
const circle=(x,y,r,color,key)=>E('circle',{cx:x,cy:y,r,fill:color,'data-motion':key});
const svg=(body,height=410,width=650)=>E('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':cases[name].label+'配对过程图',xmlns:'http://www.w3.org/2000/svg'},body);
const table=(heads,rows)=>'<table><thead><tr>'+heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
const pref=(p,letter)=>p.map(i=>letter+(i+1)).join(' ≻ ');
function matchingPlot(p,m,proposals=[],rejections=[],blocking=[],step=0,total=0){
 const compact=innerWidth<=620,W=compact?360:650,H=compact?425:410,nx=p.X.length,ny=p.Y.length,n=Math.max(nx,ny),dy=compact?Math.min(82,305/Math.max(1,n-1)):Math.min(68,292/Math.max(1,n-1)),top=compact?88:73,left=compact?74:145,right=compact?286:505,r=compact?24:22;
 let out=E('rect',{x:compact?8:35,y:28,width:compact?344:580,height:compact?365:355,rx:10,fill:C.paper})+txt(left,50,'X 方',compact?15:14,C.green)+txt(right,50,'Y 方',compact?15:14,C.gold);
 const point=(x,y)=>[x===0?left:right,top+y*dy],a=left+r+2,b=right-r-2;
 for(let i=0;i<nx;i++){const [x,y]=point(0,i);out+=circle(x,y,r,C.wash,'x-'+i)+txt(x,y+5,'X'+(i+1),compact?15:14)}
 for(let j=0;j<ny;j++){const [x,y]=point(1,j);out+=circle(x,y,r,'#f3e6d8','y-'+j)+txt(x,y+5,'Y'+(j+1),compact?15:14)}
 for(const [v,w] of proposals){const x=state.method==='gsy'?w:v,y=state.method==='gsy'?v:w;out+=path('M'+a+' '+point(0,x)[1]+' L'+b+' '+point(1,y)[1],C.purple,2,'4 6','proposal-'+x+'-'+y)}
 for(let x=0;x<m.length;x++)if(m[x]>=0)out+=path('M'+a+' '+point(0,x)[1]+' L'+b+' '+point(1,m[x])[1],C.green,4,'','match-'+x+'-'+m[x]);
 for(const [v,w] of rejections){const x=state.method==='gsy'?w:v,y=state.method==='gsy'?v:w;out+=path('M'+a+' '+point(0,x)[1]+' L'+b+' '+point(1,y)[1],C.red,2,'5 4','reject-'+x+'-'+y)}
 for(const [x,y] of blocking.slice(0,2))out+=path('M'+a+' '+point(0,x)[1]+' L'+b+' '+point(1,y)[1],C.red,4,'7 4','block-'+x+'-'+y);
 out+=txt(W/2,H-10,total?'第 '+step+' / '+total+' 轮':'当前匹配',14,C.ink);return svg(out,H,W);
}
function capacityPlot(m,proposals,rejections,step,total,cap){
 const compact=innerWidth<=620,W=compact?360:650,left=compact?74:115,right=compact?287:530,edgeL=left+(compact?20:20),edgeR=right-(compact?27:25),sy=i=>74+i*58,py=j=>105+j*120;
 let out=E('rect',{x:compact?8:30,y:25,width:compact?344:590,height:380,rx:9,fill:C.paper});
 out+=txt(left,48,'学生',15,C.green)+txt(right,48,'项目 · 容量'+cap,15,C.gold);
 for(let i=0;i<6;i++)out+=circle(left,sy(i),compact?20:17,C.wash,'student-'+i)+txt(left,sy(i)+5,'S'+(i+1),compact?13:12);
 for(let j=0;j<3;j++)out+=circle(right,py(j),compact?27:23,'#f3e6d8','program-'+j)+txt(right,py(j)+5,'P'+(j+1),14);
 for(const [i,j] of proposals)out+=path('M'+edgeL+' '+sy(i)+' L'+edgeR+' '+py(j),C.purple,2,'4 6','apply-'+i+'-'+j);
 m.forEach((j,i)=>{if(j>=0)out+=path('M'+edgeL+' '+sy(i)+' L'+edgeR+' '+py(j),C.green,3,'','hold-'+i+'-'+j)});
 for(const [i,j] of rejections)out+=path('M'+edgeL+' '+sy(i)+' L'+edgeR+' '+py(j),C.red,2,'5 4','reject-'+i+'-'+j);
 out+=txt(W/2,427,'第 '+step+' / '+total+' 轮 · 每个项目暂留至多 '+cap+' 人',compact?12:14,C.ink);return svg(out,440,W);
}
function roommatePlot(m,blocks,idx){
 const compact=innerWidth<=620,W=compact?360:650,pos=compact?[[86,95],[274,95],[86,310],[274,310]]:[[150,95],[490,95],[150,310],[490,310]];let out=E('rect',{x:compact?8:38,y:32,width:compact?344:574,height:348,rx:9,fill:C.paper});
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(m[i]===j)out+=path('M'+pos[i][0]+' '+pos[i][1]+' L'+pos[j][0]+' '+pos[j][1],C.green,5,'','room-match-'+i+'-'+j);
 for(const [i,j] of blocks)out+=path('M'+pos[i][0]+' '+pos[i][1]+' L'+pos[j][0]+' '+pos[j][1],C.red,4,'7 5','room-block-'+i+'-'+j);
 pos.forEach(([x,y],i)=>{out+=circle(x,y,27,i===3?'#f3e6d8':C.wash,'room-person-'+i)+txt(x,y+6,''+(i+1),18)});
 out+=txt(W/2,401,'第 '+(idx+1)+' 种完整分组 · 红虚线为阻挡对',compact?12:14,C.ink);return svg(out,410,W);
}
function load(k){stop();name=available.includes(k)?k:available[0];controls=caseSpec(name);state=Object.fromEntries(controls.map(c=>[c.key,c.value]));fields();history.replaceState(null,'',location.pathname+'?case='+name);draw()}
function draw(){
 const c=cases[name],kind=c.kind,s=state;let plot='',metrics=[],reading='',formula='',extra='',legend='',result={};
 if(kind==='roommate'){
  const idx=+s.allocation,m=roomAssignments[idx],b=roomBlockers(roomPrefs,m);plot=roommatePlot(m,b,idx);result={m,blockers:b};
  metrics=[['完整分组',idx+1+' / 3'],['阻挡对',b.map(([a,z])=>(a+1)+'–'+(z+1)).join('、')],['稳定分组',roomAssignments.filter(v=>!roomBlockers(roomPrefs,v).length).length]];
  reading='无论四人怎样两两配对，总有一对成员彼此更喜欢对方。逐一切换全部三种完整分组，看红虚线如何换位置。这里没有 X/Y 两侧，不能直接把两侧延迟接受的存在性结论搬过来。';
  formula=String.raw`\forall\mu\in\mathcal M,\quad B(\mu)\ne\varnothing`;
  extra=table(['成员','偏好顺序'],roomPrefs.map((p,i)=>[i+1,p.map(j=>j+1).join(' ≻ ')]));legend='绿线：同室；红虚线：两人互相更想同室';
 }else if(kind==='capacity'){
  const cap=+s.capacity,r=capacityGS(capacityPrefs.students,capacityPrefs.programs,cap),max=r.trace.length-1,step=Math.min(s.step,max),t=r.trace[step],b=step===max?capacityBlockers(capacityPrefs.students,capacityPrefs.programs,cap,t.matching):[];
  if(s.step!==step)s.step=step;plot=capacityPlot(t.matching,t.proposals,t.rejections,step,max,cap);result={r,t,b};
  metrics=[['轮次',step+' / '+max],['已暂留学生',t.matching.filter(x=>x>=0).length+' / 6'],['项目容量',cap],['终态阻挡对',step===max?b.length:'待运行']];
  reading=cap===2?'原题的一个可操作实例：6名学生分配到3个项目，各收2名。未暂留者按偏好继续申请；项目始终暂留最喜欢的至多2人。终态若有学生与某项目互相愿意改配，才构成阻挡对。':'容量1只是对比情形：6名学生大于3个名额，必有人无法入选。请把容量调回2观察原题的完整分配。';
  formula=String.raw`|\mu^{-1}(p)|\le n,\quad |B(\mu)|=0`;
  extra=table(['学生','项目偏好'],capacityPrefs.students.map((p,i)=>['S'+(i+1),pref(p,'P')]))+table(['项目','学生偏好'],capacityPrefs.programs.map((p,i)=>['P'+(i+1),pref(p,'S')]));legend='绿线：暂留；紫虚线：本轮申请；红虚线：本轮拒绝';
  const ctrl=controls.find(x=>x.key==='step');ctrl.max=max;ctrl.value=0;$('step').max=max;
 }else{
  let p=examples[c.profile],label=p.label;
  if(kind==='unequal'){p=examples[s.profile];label=p.label}
  if(kind==='manipulate'&&s.report==='lie')p={...p,Y:[[1,2,0],...p.Y.slice(1)]};
  const X=p.X,Y=p.Y,n=X.length,equal=n===Y.length,study=equal?analysis(X,Y):null;
  const method=s.method,gsRun=method==='gsy'?gs(X,Y,'Y'):gs(X,Y,'X'),gsx=gs(X,Y,'X'),gsy=gs(X,Y,'Y');
  let m=[],proposals=[],rejections=[],max=0,step=0;
  if(method==='gsx'||method==='gsy'){
   max=gsRun.trace.length-1;step=Math.min(s.step,max);const t=gsRun.trace[step];m=t.matching;proposals=t.proposals;rejections=t.rejections;
  }else if(equal&&method==='serial'){
   max=n;step=Math.min(s.step,max);m=study.serial.map((y,i)=>i<step?y:-1);
  }else if(equal&&method==='greedy'){
   max=n;step=Math.min(s.step,max);m=step?study.greedyTrace[step-1].matching:Array(n).fill(-1);
  }else if(equal&&method==='rank'){
   max=n;step=Math.min(s.step,max);m=study.rankMinimum.map((y,i)=>i<step?y:-1);
  }else if(equal){m=study.all[Math.min(+s.allocation-1,study.all.length-1)];step=0}
  else{m=gsRun.matching;step=max}
  if(s.step!==step)s.step=step;
  const complete=m.every(y=>y>=0),b=complete?blockers(X,Y,m):[];
  plot=matchingPlot(p,m,proposals,rejections,b,step,max);result={p,m,b,complete,gsx,gsy,study,step,max};
  metrics=[['过程进度',max?step+' / '+max:'完整配置'],['当前已配',m.filter(y=>y>=0).length+' / '+n],['阻挡对',complete?b.length:'待终态'],['稳定匹配数',equal?study.stable.length:'见条件']];
  legend='绿线：当前配对；紫虚线：申请；红虚线：本轮拒绝或终态阻挡对';
  formula=String.raw`(x,y)\in B(\mu)\iff y\succ_x\mu(x),\ x\succ_y\mu^{-1}(y)`;
  reading='先读取两侧排序，再沿着同一组人物观察配对如何变化。红线标出的阻挡对表示双方都想从当前配对中离开。';
  if(kind==='society')reading='社会由人数相同的 X、Y 两侧构成。每个 X 严格排列全部 Y，每个 Y 严格排列全部 X；改变方法时，偏好档案不变，只改变配对规则。';
  if(kind==='matching'){reading='匹配必须让每个 X 恰好对应一个 Y，且任何两个 X 不能占用同一个 Y。枚举完整匹配可见不同合法结果；合法不等于稳定。';formula=String.raw`\mu:X\to Y,\quad x\ne x'\Rightarrow\mu(x)\ne\mu(x')`}
  if(kind==='method')reading='匹配方法以整份偏好档案为输入，输出一个完整配对。切换方法，观察同一份偏好如何得到不同结果；方法定义并不自动保证稳定。';
  if(kind==='serial'||kind==='unstable')reading='X 按编号依次选择仍可用的 Y；只参考 X 的排序。原书例18.5中终态是 X1–Y1、X2–Y2、X3–Y3，但 X2 与 Y1 更喜欢彼此，因此顺序独裁不保证稳定。';
  if(kind==='rank')reading='每一对的“不满意度”取两侧名次之和，枚举完整匹配后使总和最小。原书允许任意对两侧名次均递增的函数；这里具体取 α(a,b)=a+b。分数最小与阻挡对为零是两项不同检查。';
  if(kind==='greedy')reading='逐次选当前两侧名次和最小的一对，然后移走两人。与“先枚举全部匹配再选总分最低”不同，局部最优不保证全局总分最低；同分时按编号固定顺序选择。';
  if(kind==='gs')reading='原书例18.4：X 方提议经过3轮，Y 方提议经过5轮，最后均为 X1–Y1、X2–Y3、X3–Y2、X4–Y4。它们在这份档案恰好相同；其他档案可能不同。';
  if(kind==='terminate'){reading='每次继续至少产生一次新的拒绝，而任一申请人最多向每位接收人申请一次。若某申请人被全部接收人拒绝，全部接收人已持有别人，与两侧等人数矛盾；故算法有限轮终止并得到完整匹配。';formula=String.raw`\#\text{申请}\le |X||Y|`}
  if(kind==='stable')reading='只有终态才判断稳定。切到顺序独裁并走到末轮，红虚线显示阻挡对；再切换延迟接受比较。两端都严格偏好彼此，才算阻挡对。';
  if(kind==='gsStable')reading='若 X 更喜欢某 Y 胜过终态对象，那么 X 必曾更早向 Y 申请并被拒绝。Y 此后只会换到更偏好的 X，因此 Y 在终态不会也更喜欢这个 X；阻挡对不存在。';
  if(kind==='xBest'||kind==='yWorst'){
   reading=kind==='xBest'?'枚举本例所有稳定匹配。X 方提议结果给每个 X 在稳定集合中的最好对象；切换 Y 方提议可见 X 方可能变差。这个结论只在稳定匹配之间比较。':'与 X 方最优相对，X 方提议结果使每个 Y 在稳定集合里拿到最差的对象。切换提议方观察各人的名次，不要把“最差”理解成所有合法匹配中的最差。';
   formula=kind==='xBest'?String.raw`\forall x,\ \forall\psi\in\mathcal S:\ \mu_{GSX}(x)\succeq_x\psi(x)`:String.raw`\forall y,\ \forall\psi\in\mathcal S:\ \psi^{-1}(y)\succeq_y\mu_{GSX}^{-1}(y)`;
  }
  if(kind==='pareto'){
   const serial=study.serial,stable=study.stable[0],serialDominated=study.all.some(a=>paretoDominates(X,Y,a,serial));
   reading='(a) 若另一个匹配使所有人不差、有人更好，任何变动的配对双方都严格更喜欢新搭档，便构成原匹配的阻挡对；稳定匹配因此帕累托稳定。(b) 原书例18.5的顺序独裁终态虽有阻挡对，却没有一份让所有人不差且至少一人更好的完整匹配。';
   metrics[3]=['顺序独裁帕累托被支配',serialDominated?'是':'否'];extra=table(['比较','X1–X3 的 Y 对象','阻挡对'],[['顺序独裁',fmt(serial),blockers(X,Y,serial).map(([a,z])=>'X'+(a+1)+'–Y'+(z+1)).join('、')],['稳定结果',fmt(stable),'无']]);
  }
  if(kind==='xPareto'){
   reading='原题的“弱帕累托稳定”只排除所有 X 都严格变好。若存在这样的替代匹配，每个 X 都必曾向其替代搭档申请并被拒绝；可是算法最后一轮会给此前一直空着的 Y 首次配对，她从未拒绝任何人，矛盾。注意弱与强的区别：切换为“枚举匹配”第4号，X1、X3都变好，X2不变；这份结果却有阻挡对。';
   formula=String.raw`\nexists\nu:\ \forall x\in X,\ \nu(x)\succ_x\mu_{GSX}(x)`;
   extra=table(['比较','X1–X3 对象','X1–X3 名次','阻挡对'],[['GSX',fmt(gsx.matching),gsx.matching.map((y,i)=>X[i].indexOf(y)+1).join('，'),'无'],['Roth 反例：部分 X 改善',fmt([1,2,0]),[1,2,0].map((y,i)=>X[i].indexOf(y)+1).join('，'),blockers(X,Y,[1,2,0]).map(([x,y])=>'X'+(x+1)+'–Y'+(y+1)).join('、')]]);
  }
  if(kind==='sameX'){
   reading='(a) 全体 X 都先申请共同第一的 Y，每一轮仅新增一个暂留位，故 GSX 恰好 n 轮。(b) 对照的顺序独裁应让共同第一的 Y 先按自己偏好选 X，再轮到共同第二，依次类推；这等于让这些 Y 依次“独裁”选 X。(c) 此情形稳定匹配唯一，所以 GSX 与 GSY 终态一致。';
   formula=String.raw`T_{GSX}=|X|,\quad\mu_{GSX}=\mu_{GSY}`;
  }
  if(kind==='unequal'){
   reading=s.profile==='oneA'?'(a) 只有一位 A，双方提议最终都把他配给他最喜欢的 B。其余 B 可以未匹配。':'(b) 两位 A、三位 B 时，本页构造的 GSA 为 A1–B1、A2–B2；GSB 为 A1–B2、A2–B1。(c) 无论谁提议，任何 A 都不会落到自己第 m 名之后：若其前 m 个 B 都已配给别人，只剩 m−1 个其他 A，不可能占满 m 个位置。';
   formula=String.raw`|A|=m<|B|=n,\quad \operatorname{rank}_a(\mu(a))\le m`;
   metrics[3]=['A 方最差名次',complete?Math.max(...m.map((y,i)=>p.X[i].indexOf(y)+1))+' / '+n:'待终态'];
   extra=table(['算法','A方得到的B'],[['GSA',fmt(gsx.matching).replaceAll('Y','B')],['GSB',fmt(gsy.matching).replaceAll('Y','B')]]);
  }
  if(kind==='manipulate'){
   const truthful=gs(examples.manipulate.X,examples.manipulate.Y,'X').matching,lieY=[[1,2,0],...examples.manipulate.Y.slice(1)],lied=gs(examples.manipulate.X,lieY,'X').matching;
   reading='原书习题的“1”须指接收方 Y1：GSX 的 X 提议方不靠谎报获益。Y1 真排序 X2 ≻ X1 ≻ X3；诚实报告时得到 X1。把排序谎报为 X2 ≻ X3 ≻ X1 后得到 X2，按真实偏好严格更好。图中接收规则使用报告，效用比较始终使用真偏好。';
   formula=String.raw`X_2\succ_{Y_1}X_1`;
   extra=table(['Y1 报告','最终配对','Y1 真偏好名次'],[['诚实',fmt(truthful),examples.manipulate.Y[0].indexOf(truthful.indexOf(0))+1],['谎报',fmt(lied),examples.manipulate.Y[0].indexOf(lied.indexOf(0))+1]]);
  }
  if(!extra&&equal)extra=table(['X','对 Y 的排序','Y','对 X 的排序'],X.map((a,i)=>['X'+(i+1),pref(a,'Y'),'Y'+(i+1),pref(Y[i],'X')]))+table(['匹配','X1 至 Xn 对象','两侧名次和','阻挡对'],[['当前',fmt(m),complete?study.score(m):'待终态',complete?b.length:'待终态'],['GSX',fmt(gsx.matching),study.score(gsx.matching),0],['GSY',fmt(gsy.matching),study.score(gsy.matching),0]]);
  if((kind==='xBest'||kind==='yWorst'||kind==='gsStable')&&equal)extra+=table(['稳定匹配','X 方各人名次','Y 方各人名次'],study.stable.map(a=>[fmt(a),a.map((y,x)=>X[x].indexOf(y)+1).join(' / '),Y.map((v,y)=>v.indexOf(a.indexOf(y))+1).join(' / ')]));
  if(kind==='xPareto'&&equal)extra+=table(['X方全员严格变好的匹配数','穷举结果'],[[study.all.filter(a=>a.every((y,x)=>X[x].indexOf(y)<X[x].indexOf(gsx.matching[x]))).length,'相对 GSX 终态']]);
  const stepCtrl=controls.find(q=>q.key==='step');if(stepCtrl){stepCtrl.max=max;$('step').max=max;$('step').disabled=method==='manual'}
  const allocCtrl=controls.find(q=>q.key==='allocation');if(allocCtrl){allocCtrl.max=study?.all.length||1;$('allocation').max=allocCtrl.max;$('allocation').disabled=method!=='manual'}
 }
 last=result;window.microMotion.chart($('plot'),plot);$('legend').textContent=legend;$('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent='教材§'+c.section+'，印刷第'+c.page+'页。图中的有限偏好档案用于理解机制；命题的一般证明须结合文字条件。两侧默认严格排序，均愿意匹配；不等人数与室友题按各自条件解释。';$('extra').innerHTML=extra;
 controls.forEach(q=>{if($('out-'+q.key))$('out-'+q.key).value=s[q.key];$(q.key).value=s[q.key]});
}
function stop(){if(timer)clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function advance(){let key=state.method==='manual'?'allocation':controls.some(c=>c.key==='step')?'step':controls.some(c=>c.key==='allocation')?'allocation':'method';const ctrl=controls.find(c=>c.key===key);if(!ctrl)return true;if(ctrl.options){const keys=Object.keys(ctrl.options),i=keys.indexOf(String(state[key]));state[key]=keys[(i+1)%keys.length]}else state[key]=state[key]>=ctrl.max?ctrl.min:state[key]+1;draw();return !ctrl.options&&state[key]>=ctrl.max}
$('fields').addEventListener('input',e=>{if(e.target.id==='case'){load(e.target.value);return}const ctrl=controls.find(c=>c.key===e.target.dataset.key);if(!ctrl)return;stop();state[ctrl.key]=ctrl.options?e.target.value:+e.target.value;if(ctrl.key==='method'||ctrl.key==='profile'||ctrl.key==='report'||ctrl.key==='capacity')state.step=0;draw()});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}if(window.microMotion.reduced.matches){advance();return}if(advance())return;timer=setInterval(()=>{if(advance())stop()},1400);$('play').textContent='暂停变化'};
$('reset').onclick=()=>load(name);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',draw);
window.demo={get name(){return name},get state(){return state},get last(){return last},draw,load};load(query||available[0]);
}

import {matrixGames,argmax,matrixAnalysis,traveler,auction,locationShares,locationDeviation,effort,cournot,bertrand,symmetricBR,finiteBR,monotoneTrace,kantian,attrition,makeTree,treeNodes,historyDiameter,policyFromIndex,policyIndex,treeOutcome,backwardTree,treeAudit,bargaining} from './games.mjs';
import {exercise15Cases} from './strategic-exercises.mjs';
import {startStrategicExercises} from './strategic-exercises-ui.js';
import {startStrategicFoundationsStory} from './strategic-foundations-ui.js';
import {startStrategicBasicsStory} from './strategic-basics-ui.js';
import {startStrategicEconomicsStory} from './strategic-economics-ui.js';
import {startStrategicExistenceStory} from './strategic-existence-ui.js';
import {startStrategicCompetitionStory} from './strategic-competition-ui.js';
import {startStrategicKantianStory} from './strategic-kantian-ui.js';
import {startStrategicMixedStory} from './strategic-mixed-ui.js';
import {startStrategicInterpretationStory} from './strategic-interpretation-ui.js';
import {startExtensiveFoundationsStory} from './extensive-foundations-ui.js';
import {startExtensiveStrategyStory} from './extensive-strategy-ui.js';
import {startExtensiveInductionStory} from './extensive-induction-ui.js';
import {startBargainingStory} from './bargaining-story-ui.js';
import {exercise16Cases} from './extensive-exercises.mjs';
import {startExtensiveExercises} from './extensive-exercises-ui.js';
const exerciseRequest=new URLSearchParams(location.search).get('case')||window.EXERCISE_DEFAULT;
if(exerciseRequest in exercise15Cases)startStrategicExercises(exerciseRequest);
else if(exerciseRequest in exercise16Cases)startExtensiveExercises(exerciseRequest);
else if(window.LESSON?.id==='15.1')window.startStrategicFoundationsStory(exerciseRequest);
else if(window.LESSON?.id==='15.2')window.startStrategicBasicsStory(exerciseRequest);
else if(window.LESSON?.id==='15.3')window.startStrategicEconomicsStory(exerciseRequest);
else if(window.LESSON?.id==='15.4')window.startStrategicExistenceStory(exerciseRequest);
else if(window.LESSON?.id==='15.5')window.startStrategicCompetitionStory(exerciseRequest);
else if(window.LESSON?.id==='15.6')window.startStrategicKantianStory(exerciseRequest);
else if(window.LESSON?.id==='15.7')window.startStrategicMixedStory(exerciseRequest);
else if(window.LESSON?.id==='15.8')window.startStrategicInterpretationStory(exerciseRequest);
else if(window.LESSON?.id==='16.1')window.startExtensiveFoundationsStory(exerciseRequest);
else if(window.LESSON?.id==='16.2'&&(!exerciseRequest||exerciseRequest==='centipede'||['intro','slots','actual','count','belief','boundary'].includes(exerciseRequest)))window.startExtensiveStrategyStory(exerciseRequest);
else if(window.LESSON?.id==='16.3'&&(!exerciseRequest||exerciseRequest==='centipede'||['intro','diameter','initialize','figure','tie','deviation','proof','equivalence','existence','boundary'].includes(exerciseRequest)))window.startExtensiveInductionStory(exerciseRequest);
else if(window.LESSON?.id==='16.4')window.startBargainingStory(exerciseRequest);
else {
const $=id=>document.getElementById(id),meta=window.LESSON,key=meta.engine,section=meta.id;
const C={g:'#177468',p:'#7a6594',r:'#c35f43',m:'#95a493',ink:'#213d37',line:'#dce1d5',paper:'#fffdf7'};
const f=x=>typeof x==='number'?(Math.abs(x)<1e-12?'0':Math.abs(x)<.005?String(Number(x.toPrecision(3))):x.toLocaleString('zh-CN',{maximumFractionDigits:3})):x;
const fp=x=>typeof x==='number'?(Math.abs(x)<1e-12?'0':Math.abs(x)<.005?String(Number(x.toPrecision(3))):x.toLocaleString('zh-CN',{maximumFractionDigits:2})):x;
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),S=(k,label,options,value)=>({k,label,options,value});
const modes=key==='strategic'?Object.fromEntries((section==='15.2'?['traveler','pd','bach','pennies','gates']:section==='15.5'?['pessimism','saddle','pennies']:section==='15.7'?['pennies','bach','pd','attrition']:section==='15.8'?['pennies','bach','pd']:['intro','pd','bach','pennies','gates']).map(k=>[k,k==='traveler'?'例15.1 · 旅行者困境':k==='attrition'?'例15.15 · 消耗战':matrixGames[k].title])):
 key==='economic-games'?{first:'例15.6 · 第一价格拍卖',second:'例15.7 · 第二价格拍卖',location:'例15.8 · 两家选址',location3:'三家选址的无均衡反例',effort:'例15.9 · 努力互补',cournot:'例15.10 · 数量竞争',cournotN:'数量竞争 · 企业数量增加',bertrand:'例15.11 · 价格竞争'}:
 key==='existence'?{increasing:'连续递增最佳反应 · 多重交点',decreasing:'例15.12 · 非对称均衡',finite:'有限非递减最佳反应'}:
 key==='kantian'?{compare:'单方改变 / 同比共同改变'}:
 key==='extensive'?{entry:'市场进入 · 不可信威胁',centipede:'例16.2 · 蜈蚣博弈',ultimatum:'例16.1 · 整数分配的最后通牒'}:
 {ultimatum:'16.4.1 · 连续最后通牒',finite:'16.4.2 · 有限轮流提议',one:'16.4.3 · 无限单方提议，无折现',stalemate:'16.4.3 · 永远不达成协议',discountOne:'16.4.4 · 单方提议与折现',alternating:'16.4.5 · 轮流提议与折现'};
let initialMode=key==='extensive'?(section==='16.1'?'entry':'centipede'):Object.keys(modes)[0];
const requested=new URLSearchParams(location.search).get('case');if(requested in modes)initialMode=requested;
let state={},spec=[],timer=null,last={},turn=0,playSteps=0;
function configure(mode){
 spec=[S('mode','选择实验',modes,mode)];
 if(key==='strategic'){
  if(mode==='traveler')spec.push(R('a','玩家1报告金额',180,300,1,300),R('b','玩家2报告金额',180,300,1,300));
  else if(mode==='attrition')spec.push(R('cost','每期争夺成本 c',.1,.9,.05,.25),R('T','玩家1计划退出期',0,12,1,3),R('S','玩家2计划退出期',0,12,1,0),S('view','观察内容',{mixed:'无限支持的混合均衡',pure:'确定退出计划'},'mixed'));
  else {const g=matrixGames[mode];if(['15.7','15.8'].includes(section))spec.push(R('p','实际：行玩家选第一行动的概率 p',0,1,.01,.5),R('q','实际：列玩家选第一行动的概率 q',0,1,.01,.5));else spec.push(S('row','行玩家的当前行动',Object.fromEntries(g.row.map((x,i)=>[i,x])),'0'),S('col','列玩家的当前行动',Object.fromEntries(g.col.map((x,i)=>[i,x])),'0'));
   if(section==='15.8')spec.push(R('beliefP','列玩家相信的 p',0,1,.01,.5),R('beliefQ','行玩家相信的 q',0,1,.01,.5));}
 }else if(key==='economic-games'){
  if(['first','second'].includes(mode))spec.push(R('a','玩家1出价（估值10）',0,16,.1,8),R('b','玩家2出价（估值5）',0,16,.1,2),S('who','观察谁的单方偏离',{0:'玩家1',1:'玩家2'},'0'));
  else if(mode.startsWith('location')){spec.push(R('a','商家1的位置',0,1,.01,.2),R('b','商家2的位置',0,1,.01,.8));if(mode==='location3')spec.push(R('d','商家3的位置',0,1,.01,.5));spec.push(S('who','观察谁的单方偏离',mode==='location3'?{0:'商家1',1:'商家2',2:'商家3'}:{0:'商家1',1:'商家2'},'0'));}
  else if(mode==='effort')spec.push(R('a','玩家1努力',0,4,.05,.4),R('b','玩家2努力',0,4,.05,1.6),R('c','基础收益系数 c',.2,2,.1,1));
  else if(mode==='cournotN')spec.push(R('n','企业数量',2,30,1,2),R('c','每单位生产成本',.05,.9,.05,.2));
  else spec.push(R('a',mode==='cournot'?'企业1产量':'企业1价格',0,1.2,.01,.4),R('b',mode==='cournot'?'企业2产量':'企业2价格',0,1.2,.01,.4),R('c','每单位生产成本',0,.9,.05,.2));
 }else if(key==='existence')spec.push(mode==='finite'?R('step','构造进度',0,10,1,0):R('x','当前考察的行动 x',0,1,.01,.3));
 else if(key==='kantian')spec.push(R('a','企业1初始产量',.1,.6,.01,.25),R('b','企业2初始产量',.1,.6,.01,.25),R('scale','产量变动倍数 λ',.05,3,.05,1));
 else if(key==='extensive'){
  if(mode==='entry')spec.push(R('fight','原企业在对抗时的收益',0,4,.5,0));
  if(mode==='centipede')spec.push(R('T','每位玩家的行动次数',2,4,1,3));
  if(mode==='ultimatum')spec.push(R('units','可分配的整数单位数',1,4,1,2));
  spec.push(R('policy','完整策略组合编号',0,255,1,mode==='centipede'?60:0),R('step','逆向归纳进度',0,8,1,0),S('tie','收益相同时如何选择',{first:'选排在前面的行动',last:'选排在后面的行动'},'first'));
 }else{
  if(mode==='finite')spec.push(R('rounds','最后可提议的轮次 T',1,8,1,3));
  if(['one','discountOne'].includes(mode))spec.push(R('share','候选安排中玩家1的份额',0,1,.05,.5));
  if(mode==='one')spec.push(R('offer','新报价给玩家2的份额',0,1,.05,.3));
  if(mode==='stalemate')spec.push(S('signal','是否偏离原强硬报价',{no:'一直要求自己拿全部',yes:'曾经给对方正份额'},'no'));
  if(mode==='alternating')spec.push(R('alpha','玩家1的折现因子 α',.1,.95,.05,.8));
  if(['discountOne','alternating'].includes(mode))spec.push(R('beta','玩家2的折现因子 β',.1,.95,.05,.8));
  if(!['one','stalemate'].includes(mode))spec.push(R('step',mode==='finite'?'从最后一期向前求解':mode==='alternating'?'延迟期数':'推演步骤',0,mode==='finite'?8:10,1,0));
 }
 state=Object.fromEntries(spec.map(c=>[c.k,c.value]));turn=0;$('plot').innerHTML='';
 $('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label}<output id="out-${c.k}"></output></label><input id="${c.k}" data-key="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');
}
function txt(x,y,t,color=C.ink,size=14,anchor='middle'){const scale=Math.min(2.15,Math.max(1,650/Math.max(280,$('plot').clientWidth)));return `<text x="${x}" y="${y}" fill="${color}" font-size="${size*scale}" text-anchor="${anchor}">${t}</text>`}
function dot(x,y,color,id,r=6){return `<circle ${id?`data-motion="${id}"`:''} cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${C.paper}" stroke-width="2"/>`}
function openDot(x,y,color){return `<circle cx="${x}" cy="${y}" r="5" fill="${C.paper}" stroke="${color}" stroke-width="2"/>`}
function axes(xmax=1,ymax=1,xlabel='',ylabel='',xmin=0,ymin=0){const X=x=>85+450*(x-xmin)/(xmax-xmin),Y=y=>305-245*(y-ymin)/(ymax-ymin);let svg='';for(let i=0;i<5;i++){const x=xmin+(xmax-xmin)*i/4,y=ymin+(ymax-ymin)*i/4;svg+=`<path d="M${X(x)} 60V305M85 ${Y(y)}H535" stroke="${C.line}" fill="none"/>`+txt(X(x),334,fp(x),C.m,11)+txt(73,Y(y)+5,fp(y),C.m,11,'end')}
 svg+=txt(65,28,ylabel,C.ink,12,'start')+txt(535,374,xlabel,C.ink,12,'end');const line=(x1,y1,x2,y2,color,dash='')=>`<path d="M${X(x1)} ${Y(y1)}L${X(x2)} ${Y(y2)}" stroke="${color}" stroke-width="2.5" fill="none" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const curve=(fn,color,lo=xmin,hi=xmax)=>`<path d="${Array.from({length:121},(_,i)=>{const x=lo+(hi-lo)*i/120;return `${i?'L':'M'}${X(x)},${Y(fn(x))}`}).join(' ')}" stroke="${color}" stroke-width="2.5" fill="none"/>`;return {X,Y,svg,line,curve};}
const table=(heads,rows)=>`<table><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${f(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function matrixFigure(g,r,i,j){let svg='';const w=420/r.m,h=225/r.n;for(let a=0;a<r.n;a++)for(let b=0;b<r.m;b++)svg+=`<rect x="${110+b*w}" y="${70+a*h}" width="${w}" height="${h}" fill="${C.paper}" stroke="${C.line}"/>`+txt(110+(b+.36)*w,70+(a+.57)*h,f(r.M[a][b][0]),r.br1[b].includes(a)?C.g:C.m,19)+txt(110+(b+.64)*w,70+(a+.57)*h,f(r.M[a][b][1]),r.br2[a].includes(b)?C.p:C.m,19);
 g.row.forEach((l,a)=>svg+=txt(92,70+(a+.55)*h,l,C.ink,12,'end'));g.col.forEach((l,b)=>svg+=txt(110+(b+.5)*w,48,l,C.ink,13));svg+=`<rect data-motion="selected-cell" x="${110+j*w+4}" y="${70+i*h+4}" width="${w-8}" height="${h-8}" rx="5" fill="none" stroke="${C.r}" stroke-width="3"/>`;return svg;}
function pie(y,values,label,id){return txt(60,y,label,C.ink,13,'start')+`<rect data-motion="${id}-1" x="60" y="${y+16}" width="${480*values[0]}" height="36" fill="${C.g}"/><rect data-motion="${id}-2" x="${60+480*values[0]}" y="${y+16}" width="${480*values[1]}" height="36" fill="${C.p}"/>`+txt(60,y+83,'玩家1：'+fp(values[0]),C.g,13,'start')+txt(540,y+83,'玩家2：'+fp(values[1]),C.p,13,'end')}
function fieldMax(k,max){const c=spec.find(c=>c.k===k);c.max=max;$(k).max=max;state[k]=Math.min(state[k],max)}
function render(){const s=state,mode=s.mode;let svg='',height=390,metrics=[],reading='',formula='',extra='',legend='',boundary=meta.boundary;
 if(key==='strategic'){
  if(mode==='traveler'){
   const r=traveler(s.a,s.b),a=axes(300,310,'玩家1可报告的金额','玩家1收益',180,170);svg=a.svg;
   r.actions.forEach((x,i)=>svg+=dot(a.X(x),a.Y(r.curves[0][i]),C.g,null,2));svg+=dot(a.X(s.a),a.Y(r.u[0]),C.r,'chosen');
   metrics=[['当前玩家1收益',r.u[0]],['当前玩家2收益',r.u[1]],['玩家1最佳报告',r.best[0].join(' / ')],['玩家1可增加的收益',r.gains[0]]];reading='报告金额限定为180至300的整数。双方都报300时，单方改成299可以多拿4；对方固定后再比较全部121个行动，才是最佳反应。检验同报是否为均衡，要看单独改报能否多赚钱。';formula='x<y：x+5；x=y：x；x>y：y−5。唯一纳什均衡：(180,180)。';extra='<button data-preset="traveler-ne">比较均衡 (180,180)</button><p>每个点都是一个合法整数报告；不把点之间的连线当成可选金额。这里假设只在意个人金钱，不据此预测真实受试者一定选择180。</p>';legend='绿点：固定玩家2时的全部报告收益　红点：当前报告';last=r;
  }else if(mode==='attrition'){
   const r=attrition(s.cost,s.T,s.S),max=Math.max(.4,s.cost*1.2),a=axes(13,max,'退出期 t（右端为尾部）','退出概率');svg=a.svg;
   [...r.prob,r.tail].forEach((v,i)=>svg+=`<rect data-motion="prob-${i}" x="${a.X(i)-10}" y="${a.Y(v)}" width="20" height="${305-a.Y(v)}" fill="${i===12?C.p:C.g}"/>`);svg+=txt(a.X(12),355,'≥12',C.p,11);
   metrics=[['纯计划是否为NE',r.pureNE?'是':'否'],['玩家1 / 玩家2收益',r.u.map(f).join(' / ')],['当前图未展开的尾部',r.tail],['同时退出概率',r.tieProbability]];
   $('T').disabled=$('S').disabled=s.view==='mixed';
   if(s.view==='pure'){const a=axes(12,1,'玩家1单方计划退出期','玩家1收益',0,-12*s.cost),pay=t=>t<=s.S?-t*s.cost:1-(s.S+1)*s.cost;svg=a.svg;for(let t=0;t<=12;t++)svg+=dot(a.X(t),a.Y(pay(t)),C.g,null,4);svg+=dot(a.X(s.T),a.Y(r.u[0]),C.r,'pure-exit');}
   else metrics=[['立即退出概率 α(0)',s.cost],['所有更晚期的尾部概率',r.tail],['任意确定退出期的期望收益',0],['同时退出概率',r.tieProbability]];
   reading=s.view==='mixed'?'混合均衡对每一期都给正概率。绿色是前12期，紫色合并了所有更晚退出的概率，没有把无限游戏截断为12期。面对该分布，任何确定退出期的期望收益都为零。':'纯均衡一方立即退出，另一方计划坚持到足够晚，使立即退出者不值得再等更久。输家与赢家的成本不同：赢家要额外再等一期才能拿到物品。';formula='α(t)=c(1−c)ᵗ；P(t≥K)=(1−c)ᴷ；(0,t)为纯NE当且仅当 c(t+1)≥1。';legend=s.view==='mixed'?'绿色：逐期概率　紫色：无限尾部的总概率':'绿点：固定对手后各整数退出期的收益　红点：当前退出计划';extra=table(['计划退出期','对几何分布的期望收益'],r.eu.map((v,i)=>[i,v]));last=r;
  }else{
   const mixed=['15.7','15.8'].includes(section),i=+(s.row||0),j=+(s.col||0),r=matrixAnalysis(mode,i,j,s.p??.5,s.q??.5),g=matrixGames[mode];
   if(mixed){const a=axes(1,Math.max(...r.M.flat().map(x=>x[0]),1)+.5,'列玩家实际选第一行动的概率 q','行玩家选择纯行动的期望收益');svg=a.svg+a.curve(q=>r.M[0][0][0]*q+r.M[0][1][0]*(1-q),C.g)+a.curve(q=>r.M[1][0][0]*q+r.M[1][1][0]*(1-q),C.p)+dot(a.X(s.q),a.Y(r.mixed.rows[0]),C.g,'row-one')+dot(a.X(s.q),a.Y(r.mixed.rows[1]),C.p,'row-two');
    metrics=[['行玩家期望收益',r.mixed.eu[0]],['列玩家期望收益',r.mixed.eu[1]],['行玩家可获偏离增益',r.mixed.gains[0]],['列玩家可获偏离增益',r.mixed.gains[1]]];
    reading='自己的混合概率应当让对手对其使用的纯行动无差异；不是让双方的收益相等。若某个行动严格更好，它就应取得全部概率。';formula=r.mixed.interior?`完全混合均衡：p*=${f(r.mixed.pStar)}，q*=${f(r.mixed.qStar)}；另有${r.pure.length}个纯策略均衡。`:`该矩阵无完全混合均衡；纯策略均衡有${r.pure.length}个。`;legend='绿线：行玩家第一行动的收益　紫线：第二行动的收益';
    if(section==='15.8'){
     const believed=matrixAnalysis(mode,0,0,s.beliefP,s.beliefQ),gains=[Math.max(...believed.mixed.rows)-(s.p*believed.mixed.rows[0]+(1-s.p)*believed.mixed.rows[1]),Math.max(...believed.mixed.cols)-(s.q*believed.mixed.cols[0]+(1-s.q)*believed.mixed.cols[1])],consistent=Math.abs(s.p-s.beliefP)<1e-8&&Math.abs(s.q-s.beliefQ)<1e-8;
     metrics=[['行群体按信念的偏离增益',gains[0]],['列群体按信念的偏离增益',gains[1]],['信念是否与真实比例一致',consistent?'一致':'不一致'],['是否为群体稳态',consistent&&gains.every(v=>v<1e-8)?'是':'否']];
     reading='p、q也可以表示两个匿名群体中采取第一行动的人数比例。分别从两群体独立抽人；稳态要求信念正确，且每个实际有人使用的行动都是最佳反应。图上的曲线采用实际比例，表格另列人们相信的收益。';
     extra=table(['行第一行动','行第二行动','列第一行动','列第二行动'],[[...believed.mixed.rows,...believed.mixed.cols]]);last={...r,believed,consistent,gains};
    }else last=r;
    extra+=table(['行 / 列',...g.col],r.M.map((row,i)=>[g.row[i],...row.map(x=>x.map(f).join(', '))]))+'<button data-preset="mixed-ne">代入均衡概率</button>';
   }else{
    svg=matrixFigure(g,r,i,j);metrics=[['当前收益 (行,列)',r.u.map(f).join(', ')],['行玩家最大偏离增益',r.gains[0]],['列玩家最大偏离增益',r.gains[1]],['纯策略NE数量',r.pure.length]];
    reading='固定列玩家，只在同一列比较行玩家的收益；固定行玩家，只在同一行比较列玩家的收益。两边都不能靠单独换行动获益，当前格子才是纳什均衡。共同换行动变好并不否定它是NE。';formula='aᵢ ∈ BRᵢ(a₋ᵢ)，对每一位玩家都成立。';legend='每格左数：行玩家；右数：列玩家　绿色/紫色数字：相应最佳反应　红框：当前组合';
    extra=table(['可直接选择的组合','双方收益','是NE吗'],r.M.flatMap((row,a)=>row.map((v,b)=>[`<button data-cell="${a},${b}">${g.row[a]} / ${g.col[b]}</button>`,v.map(f).join(', '),r.pure.some(x=>x[0]===a&&x[1]===b)?'是':'否'])));
    if(section==='15.2'){
     const symmetric=g.row.length===g.col.length&&g.row.every((a,k)=>a===g.col[k])&&r.M.every((row,a)=>row.every((u,b)=>u[0]===r.M[b][a][1]));
     metrics[3]=['交换两位玩家后偏好相同',symmetric?'是':'否'];
     reading+=' 对称博弈还要求交换玩家身份后，行动集与收益关系一致。改变当前格子，看玩家1的收益是否等于交换行动后玩家2的收益；会面博弈两人各偏好不同的音乐，所以不对称。';
     formula=String.raw`A_1=A_2,\quad u_1(a,b)=u_2(b,a)\quad\text{（在该收益表示下）}`;
     extra+=table(['当前行动 (a,b)','玩家1收益 u₁(a,b)','交换后玩家2收益 u₂(b,a)','全表是否对称'],[[`${g.row[i]} / ${g.col[j]}`,r.M[i][j][0],r.M[j]?.[i]?.[1]??'行动集不匹配',symmetric?'是':'否']]);
    }
    if(section==='15.5'){const mm=[r.maxmin[0][0],r.maxmin[1][0]];metrics=[['是否严格竞争',r.competitive?'是':'否'],['行玩家最大保底收益',Math.max(...r.rowWorst)],['列玩家最大保底收益',Math.max(...r.colWorst)],['两方保底行动是否是NE',r.pure.some(x=>x[0]===mm[0]&&x[1]===mm[1])?'是':'否']];reading='先找自己每个行动最糟的可能结果，再选择最好的保底值。严格竞争且存在纯策略NE时，均衡行动具有保底最优性质；若没有纯NE，不能用这个命题凭空推出一个。';formula='maxₐ minᵦ u₁(a,b)；maxᵦ minₐ u₂(a,b)。严格竞争的均衡收益相同，需要均衡存在。';extra+=table(['行各行动的最坏收益','列各行动的最坏收益'],[[r.rowWorst.map(f).join(' / '),r.colWorst.map(f).join(' / ')]])+'<button data-preset="maxmin">代入双方保底行动</button>';}
    last=r;
   }
  }
 }else if(key==='economic-games'){
  if(['first','second'].includes(mode)){
   const r=auction(mode,[s.a,s.b]),i=+s.who,other=[s.b,s.a][i],v=[10,5][i],a=axes(16,11,'该玩家单方面改报的价格','该玩家收益',0,-12);svg=a.svg+a.line(0,0,other,0,C.m)+a.line(other,v-other,16,mode==='first'?v-16:v-other,C.g);
   svg+=openDot(a.X(other),a.Y(i===0?0:v-other),i===0?C.m:C.g)+dot(a.X(other),a.Y(i===0?v-other:0),C.p,'tie')+dot(a.X([s.a,s.b][i]),a.Y(r.u[i]),C.r,'bid');
   metrics=[['当前赢家','玩家'+(r.winner+1)],['赢家支付',r.payment],['玩家1 / 玩家2收益',r.u.map(f).join(' / ')],['是否纳什均衡',r.equilibrium?'是':'否']];
   reading=mode==='first'?'最高出价相同时玩家1获胜。若玩家1独自报得更高，就可能降低出价仍赢得物品。因此“赢家出价介于5和10”只是必要条件，还必须有人与他并列最高。':'赢家支付对方的出价。真实报出估值是弱占优，但均衡不只这一种：允许被弱支配的高报价时，低估值者也可能在某些NE中获胜。';
   formula=mode==='first'?'本两人模型的NE：b₁=b₂ ∈ [5,10]。':'赢：uᵢ=vᵢ−bⱼ；输：uᵢ=0；如实报价10和5为一个NE。';legend='灰线：未获物品时收益　绿线：获胜收益　紫点：恰好同价时的真实收益　红点：当前报价';
   extra=table(['玩家','估值','目前收益','可验证的改报','改报增益'],[0,1].map(j=>['玩家'+(j+1),[10,5][j],r.u[j],r.witnesses[j].bid,r.witnesses[j].gain]))+`<button data-preset="auction-truth">双方如实报价</button> <button data-preset="auction-tie">双方报5</button> <button data-preset="auction-low">比较 (3,12)</button><p>连续报价，图中断点按固定平局规则处理；“略高一点”未必存在最小可行加价，所以收益上确界不一定能被某个报价取得。</p>`;
   if(mode==='first')extra+='<p class="boundary">原书校准：2020.12.21版印刷页224末句遗漏了“赢家不能降价仍胜出”的条件。例：估值(10,5)、出价(8,2)满足该句列出的不等式，却可由玩家1改报2使收益从2升至8。这里按完整偏离检验修正；已核对原PDF页面。</p>';last=r;
  }else if(mode.startsWith('location')){
   const positions=mode==='location3'?[s.a,s.b,s.d]:[s.a,s.b],r=locationShares(positions),i=+s.who,d=locationDeviation(positions,i);svg=txt(60,35,'均匀分布的居民 · 每位选择最近商家',C.ink,13,'start');
   r.regions.forEach((reg,k)=>{const x=60+480*reg.left,w=480*(reg.right-reg.left);reg.players.forEach((player,j)=>svg+=`<rect data-motion="region-${player}" x="${x}" y="${125+j*80/reg.players.length}" width="${w}" height="${80/reg.players.length-3}" fill="${[C.g,C.p,C.r][player]}" opacity=".35"/>`)});
   positions.forEach((x,j)=>{svg+=dot(60+480*x,130+j*25,[C.g,C.p,C.r][j],'shop-'+j,8)+txt(80+480*x,135+j*25,j+1,[C.g,C.p,C.r][j],13)});svg+=`<path d="M60 225H540" stroke="${C.m}"/>`+[0,.25,.5,.75,1].map(x=>txt(60+480*x,255,x,C.m,12)).join('');
   metrics=positions.map((_,j)=>['商家'+(j+1)+'市场份额',r.shares[j]]);metrics.push(['被选商家的偏离增益',d.gain]);reading=mode==='location3'?'三家时没有纯策略NE：同址聚在一起可向一侧挪动争取更多；分开时存在一位独占边缘位置的商家，可以向另外两家靠近。用“下一步”检验当前选中的商家，不把某一个人的无利可图误当成所有人都无利可图。':'两家同时位于中点是唯一纯NE，也各自保住至少一半客流。位置不同时，向对方靠近可以扩张自己的份额；同址在非中点时，向中点移动可获益。';formula='相邻商家的客流边界是位置的中点；同址商家均分该位置的客流。';legend='绿色：商家1　紫色：商家2　红色：商家3（如有）';extra=table(['当前商家','改报位置','改报后份额'],[['商家'+(i+1),d.choice,d.value]])+'<button data-preset="location-middle">全部移到中点，检查偏离</button><p>同址区域分行显示，表示同一批居民被均分，而非重复计算人数。程序展示一个具体有利移动，不把很小的步长当作连续模型中必定存在的最佳反应。</p>';last={...r,d,positions};
  }else if(mode==='cournotN'){
   const q=(1-s.c)/(s.n+1),p=s.c+q,a=axes(30,1,'企业数 n','均衡价格');svg=a.svg+a.curve(n=>s.c+(1-s.c)/(n+1),C.g,2,30)+a.line(0,s.c,30,s.c,C.p,'5 5')+dot(a.X(s.n),a.Y(p),C.r,'n');metrics=[['每家产量',q],['总产量',s.n*q],['均衡价格',p],['每家利润',q*q]];reading='加入更多相同企业会降低每家的均衡产量，但提高总产量。正边际成本下，价格趋近成本，每家的利润趋近零；这是一组不同市场结构的比较，不是同一企业进入过程的动态证明。';formula='qᵢ*=(1−c)/(n+1)；p*=c+(1−c)/(n+1)。';legend='绿线：不同企业数下的价格　紫虚线：边际成本';last={q,p};
  }else if(mode==='bertrand'){
   const r=bertrand(s.a,s.b,s.c),a=axes(1.2,.3,'企业1价格','企业1利润',0,-1),t=s.b;svg=a.svg+a.curve(p=>(p-s.c)*Math.max(0,1-p),C.g,0,Math.min(t,1.2))+a.line(t,0,1.2,0,C.m)+openDot(a.X(t),a.Y((t-s.c)*Math.max(0,1-t)),C.g)+openDot(a.X(t),a.Y(0),C.m)+dot(a.X(t),a.Y((t-s.c)*Math.max(0,1-t)/2),C.p,'tie')+dot(a.X(s.a),a.Y(r.u[0]),C.r,'price');
   metrics=[['企业1利润',r.u[0]],['企业2利润',r.u[1]],['是否NE',r.ne?'是':'否'],['共同边际成本',s.c]];reading='只差一点价格就可能从均分需求变为独占需求；同价点用紫点表示，不能用一条光滑曲线抹掉跳跃。把双方价格都降到成本，任何单方降价会亏损、提价仍为零利润。';formula='p₁=p₂=c 为唯一NE。消费者总需求 max(0,1−p)，同价均分。';legend='绿线：企业1独占需求的利润　紫点：同价利润　红点：当前利润';extra='<button data-preset="bertrand-ne">把双方价格设为成本</button><p>对方价格在成本与垄断价格之间时，略低于对方可获高利润，但可能没有取得最大值的最优报价。这里不把离散滑块搜索结果当成连续模型的最佳反应。</p>';last=r;
  }else{
   if(mode==='cournot'){fieldMax('a',1);fieldMax('b',1)}
   const isEffort=mode==='effort',r=isEffort?effort(s.a,s.b,s.c):cournot(s.a,s.b,s.c),max=isEffort?4:1,a=axes(max,max,isEffort?'玩家1努力':'企业1产量',isEffort?'玩家2努力':'企业2产量');svg=a.svg;
   if(isEffort)svg+=a.line(s.c/2,0,(s.c+max)/2,max,C.g)+a.curve(x=>(s.c+x)/2,C.p);
   else {svg+=a.line(0,1-s.c,(1-s.c)/2,0,C.g)+a.line(0,1-s.c,0,1,C.g)+a.curve(x=>Math.max(0,(1-s.c-x)/2),C.p);if(s.c===0)svg+=a.line(0,1,1,1,C.g)+a.line(1,0,1,1,C.p);}
   svg+=dot(a.X(s.a),a.Y(s.b),C.r,'action-pair');metrics=[['玩家1 / 企业1收益',r.u[0]],['玩家2 / 企业2收益',r.u[1]],['第一方最佳反应（一个）',r.br[0]],['第二方最佳反应（一个）',r.br[1]]];
   reading=isEffort?'对方更努力会提高自己的努力回报，所以两条最佳反应相互促进。交点(c,c)同时满足两人的最优条件；按按钮轮流改变一方，只是一种演示构造。':'先把对方产量当作固定量，再找自己的利润最大点。正成本下唯一均衡为各产(1−c)/3；零成本与价格下限同时存在时，要额外检查零价格的无差异情形。';
   formula=isEffort?'uᵢ=aᵢ(c+aⱼ)−aᵢ²；BRᵢ=(c+aⱼ)/2；NE=(c,c)。':'P=max(0,1−q₁−q₂)；c>0时 BRᵢ=max(0,(1−c−qⱼ)/2)。';legend='绿线：第一方最佳反应　紫线：第二方最佳反应　红点：当前行动组合';
   extra='<button data-preset="response-ne">代入内部均衡</button>';if(!isEffort)extra+='<button data-preset="cournot-zero">检查零成本与 (1,1)</button><p class="boundary">原书边界校准：例15.10允许c=0、产量各在[0,1]，并把负价格截为0。因此(1,1)也是NE：任何人单独减产都无法让价格转正，收益仍为0。本页在c=0时按实际收益检验，不沿用“唯一均衡”的无条件表述。</p>';last=r;
  }
 }else if(key==='existence'){
  if(mode==='finite'){const trace=monotoneTrace();fieldMax('step',trace.length-1);const [x,y]=trace[s.step],a=axes(8,7,'玩家1行动','玩家2行动',1,1);svg=a.svg;finiteBR.one.forEach((v,j)=>svg+=dot(a.X(v),a.Y(j+1),C.g,null,5));finiteBR.two.forEach((v,i)=>svg+=dot(a.X(i+1),a.Y(v),C.p,null,5));svg+=dot(a.X(x),a.Y(y),C.r,'construct',8);metrics=[['当前玩家1行动',x],['当前玩家2行动',y],['已经构造的步数',s.step],['互为最佳反应',x===finiteBR.one[y-1]&&y===finiteBR.two[x-1]?'是':'否']];reading='从两人最小行动开始轮流取最佳反应。非递减性保证序列只向上；有限行动集合保证最终停止。停止点两人都已是最佳反应，从而构成NE。此构造是命题15.2的另一种证明路径。';formula='a¹≤a²≤…；有限有序集合中单调序列终止 ⇒ 互为最佳反应。';extra=table(['构造步','玩家1','玩家2'],trace.slice(0,s.step+1).map((p,i)=>[i,...p]));legend='绿点：BR₁　紫点：BR₂　红点：当前构造位置';last={trace,x,y};
  }else{const br=x=>symmetricBR(mode,x),a=axes(1,1,'对方行动 x','最佳反应 BR(x)');svg=a.svg+a.line(0,0,1,1,C.m,'5 5')+a.curve(br,C.g)+dot(a.X(s.x),a.Y(br(s.x)),C.r,'test-x');metrics=[['当前 x',s.x],['BR(x)',br(s.x)],['BR(x)−x',br(s.x)-s.x],['对称均衡',mode==='decreasing'?'(0.5,0.5)':'(0.2,0.2), (0.5,0.5), (0.8,0.8)']];reading=mode==='decreasing'?'最佳反应BR(x)=1−x与对角线只交一次，但这只识别对称均衡。任何(a,1−a)都互为最佳反应，所以存在一整条非对称均衡。':'BR把闭区间映回自身，在左端BR(x)−x≥0、右端≤0。连续性保证至少有一个零点；本例中曲线与对角线有三个交点，对应三个对称均衡。收益可取−[aᵢ−BR(aⱼ)]²来实现图中的唯一最佳反应。';formula=mode==='decreasing'?'uᵢ=−|1−a₁−a₂|；所有 a₁+a₂=1 均为NE。':'g(x)=BR(x)−x 连续；g(0)≥0，g(1)≤0 ⇒ 存在g(x*)=0。';legend='绿线：共同最佳反应　灰虚线：对角线　红点：考察位置';last={x:s.x,br:br(s.x)};}
 }else if(key==='kantian'){
  const max=Math.min(3,1/s.a,1/s.b);fieldMax('scale',max);const r=kantian(s.a,s.b,s.scale),a=axes(max,.3,'产量倍数 λ','企业1利润');svg=a.svg+a.curve(l=>kantian(s.a,s.b,l).joint[0],C.g)+a.curve(l=>kantian(s.a,s.b,l).single[0],C.p)+dot(a.X(s.scale),a.Y(r.joint[0]),C.g,'joint')+dot(a.X(s.scale),a.Y(r.single[0]),C.p,'single');metrics=[['原利润',r.initial[0]],['同比共同改变后的利润',r.joint[0]],['只改变自己后的利润',r.single[0]],['当前原配置',r.isKantian?'是康德均衡':r.nash?'是纳什均衡':'两者都不是']];reading='两条曲线回答不同的问题：绿色假设对方也按同一倍数改产量，紫色固定对方不动。在(1/4,1/4)处，同增产无利可图，却能靠自己增产获利，所以它是康德均衡而不是NE。';formula='λ* =1/[2(a₁+a₂)]；康德均衡要求 λ*=1，即 a₁+a₂=1/2。';legend='绿色：双方同比改变　紫色：仅企业1改变（其他不动）';extra='<button data-preset="kantian-ne">比较 (1/3,1/3)</button> <button data-preset="kantian-ke">比较 (1/4,1/4)</button><p>c=0，正产量、每人产量不超过1，所有缩放必须保持行动合法。这里的(1/3,1/3)是正价格NE；价格截为0的模型还有(1,1)这一边界NE，见15.3的边界校准。</p>';last=r;
 }else if(key==='extensive'){
  const root=makeTree(mode,s.units||2,s.T||3,s.fight||0),nodes=treeNodes(root),count=nodes.reduce((a,n)=>a*n.children.length,1);fieldMax('policy',count-1);fieldMax('step',nodes.length);const base=policyFromIndex(root,s.policy),bi=backwardTree(root,s.tie==='last'),policy={...base};bi.steps.slice(0,s.step).forEach(st=>policy[st.id]=st.choice);const r=treeAudit(root,policy),path=new Set(r.outcome.path.map(x=>x.id)),solved=new Set(bi.steps.slice(0,s.step).map(x=>x.id)),focus=s.step?bi.steps[s.step-1].id:null;
  const node=(n,x,y)=>dot(x,y,r.one.find(q=>q.id===n.id)?.gain>1e-8?C.r:solved.has(n.id)?C.g:C.p,'node-'+n.id,focus===n.id?11:8);
  const edge=(n,k,x1,y1,x2,y2)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${policy[n.id]===k?C.g:C.m}" opacity="${path.has(n.id)?1:.55}" stroke-width="${policy[n.id]===k?4:1.4}" fill="none"/>`;
  if(mode==='entry'){const child=root.children[1].node;height=410;svg=edge(root,0,280,60,100,315)+edge(root,1,280,60,440,155)+edge(child,0,440,155,330,340)+edge(child,1,440,155,540,340)+node(root,280,60)+node(child,440,155)+txt(280,32,'玩家1')+txt(440,128,'玩家2')+txt(110,180,'不进入',C.ink,13)+txt(375,87,'进入',C.ink,13)+txt(315,245,'对抗',C.ink,13)+txt(535,245,'合作',C.ink,13)+txt(100,355,'(1,5)',C.ink,16)+txt(330,380,`(0,${f(s.fight)})`,C.ink,16)+txt(540,380,'(2,2)',C.ink,16);}
  else if(mode==='centipede'){height=130+80*nodes.length;nodes.forEach((n,i)=>{const y=55+80*i;svg+=edge(n,0,170,y,430,y)+edge(n,1,170,y,170,y+80)+node(n,170,y)+txt(56,y+6,'P'+(n.player+1),C.ink,16)+txt(295,y-12,'停止 S',C.ink,13)+txt(450,y+6,n.children[0].node.payoff.map(f).join(', '),C.ink,15,'start')+txt(205,y+47,'C',C.ink,13);});svg+=txt(170,65+80*nodes.length,bi.steps[0].values.at(-1).map(f).join(', '),C.ink,15);}
  else {height=100+100*(s.units+1);const mid=height/2;svg=node(root,40,mid)+txt(40,mid-24,'P1',C.ink,14);root.children.forEach((c,i)=>{const y=60+100*i,n=c.node;svg+=edge(root,i,40,mid,180,y)+node(n,180,y)+txt(145,y-25,c.label,C.ink,13)+edge(n,0,180,y,350,y-16)+edge(n,1,180,y,500,y+25)+txt(275,y-30,'接受',C.ink,12)+txt(370,y-12,n.children[0].node.payoff.join(','),C.ink,14)+txt(390,y+55,'拒绝',C.ink,12)+txt(525,y+30,'0,0',C.ink,14)});}
  metrics=[['从起点实际到达的收益',r.outcome.payoff.map(f).join(', ')],['是否纳什均衡',r.nash?'是':'否'],['是否子博弈精炼均衡',r.spe?'是':'否'],['尚有利可图的单点偏离',r.one.filter(x=>x.gain>1e-8).length]];
  reading=section==='16.2'?'完整策略为每个决策节点写下行动，包括按自己原计划根本到不了的节点。修改“未到达”的行动可能不改变本次结果，却会改变别人对后续的判断，以及是否满足子博弈精炼。':s.step===0?'绿色粗线是当前计划，透明分支不在实际路径上。NE只从起点检查整套策略偏离；SPE还检查每一个可能的后续节点。红色节点表示在那里只改这一次行动就能获益。':`已从叶子向前处理${s.step}个节点。当前求解节点：${focus}；替换它的行动前，先读取已经求解的后续收益。所有节点都通过单点偏离检验后，有限博弈中便得到SPE。`;
  formula='完整策略：每个自己行动的历史 → 一个行动；有限树上：单点偏离性质 ⇔ SPE ⇔ 逆向归纳可生成。';legend='绿色粗边：计划行动　淡化：未在实际路径上　红节点：有利单点偏离　较大节点：本步求解';
  extra=table(['节点 / 玩家','当前计划','从该节点出发的收益','单点偏离增益','修改原计划'],nodes.map(n=>[n.id+' / P'+(n.player+1),n.children[policy[n.id]].label,treeOutcome(n,policy).payoff.map(f).join(', '),r.one.find(x=>x.id===n.id).gain,`<button data-node="${n.id}">换一个行动</button>`]))+`<p>共有${nodes.length}个决策节点、${count}个完整策略组合。当前从起点经过${r.outcome.path.length}个决策节点。同收益时可保留不同最优行动；这里的逆推从终点开始，沿有限博弈树逐层选取最优行动。</p>`;
  if(mode==='centipede')extra+=`<p>每人有${s.T}次机会，个人完整策略有2^${s.T}=${2**s.T}种；只记录第一次停止时间的自然行动计划只有${s.T+1}种。每次继续，行动者损失1，对方获得2。</p>`;
  if(section==='16.3'){
   const d=historyDiameter(root);metrics[3]=['起始历史的直径',d];
   reading+=` 历史直径是从当前历史到终点还可能采取的最多行动数。起点为${d}，最末端为0；逆向归纳先处理直径较小的历史。`;
   formula='D(h)=1+max_a D(h,a)';
   extra+=table(['历史 / 决策节点','从此处到终点最多行动数'],nodes.map(n=>[n.id,historyDiameter(n)]).concat([['终点',0]]));
  }
  if(mode==='ultimatum')extra+='<p>整数模型中，对零份额可以接受也可以拒绝，因而有两种SPE分配。切换平局选择并完成逆向归纳即可比较；连续分割的结论不同，见16.4。</p>';last={root,nodes,base,policy,bi,...r};
 }else {
  if(mode==='finite')fieldMax('step',s.rounds);const r=bargaining(mode,s.alpha||.8,s.beta||.8,s.rounds||3,s.share??.5,s.step);
  if(mode==='finite'){height=110+s.rounds*130;for(let t=1;t<=s.rounds;t++){const solved=t>s.rounds-s.step,y=30+(t-1)*130;svg+=solved?pie(y,r.allocation,`第${t}期 · 玩家${t%2?1:2}提议`,'period-'+t):txt(60,y+45,`第${t}期 · 等待从后向前推导`,C.m,14,'start')}metrics=[['最后提议者','玩家'+(r.winner+1)],['SPE中最后提议者的份额',1],['已推导的期数',r.solved],['协议是否必须立即达成','不一定']];reading='这里没有等待成本。最后一期提议者能拿全部，因此他在前面的每一期都可以坚持同样的份额。改变最后一期的奇偶，会翻转全部谈判力量；不同SPE可能有不同路径和达成时间，但收益相同。';formula='不折现、最多T期：最后一期提议者在每个SPE中得到整个饼。';}
  else if(mode==='alternating'){height=550;svg=pie(45,r.x,'玩家1提议时的份额 x*','x')+pie(205,r.y,'玩家2提议时的份额 y*','y')+pie(365,r.discounted,`同一x*延迟${s.step}期的效用现值`,'delayed');metrics=[['玩家1接受的最低份额',r.y[0]],['玩家2接受的最低份额',r.x[1]],['延迟后的玩家1现值',r.discounted[0]],['延迟后的玩家2现值',r.discounted[1]]];reading='对方拒绝后，下期会成为提议者。今天给他的份额必须至少抵得上他等待一期的价值；两个接受门槛互相决定，解出两组提议。协议在均衡路径上立即达成，延迟滑块只是比较等待损失；第三行是效用现值，实物份额并未消失。';formula='y₁*=αx₁*，x₂*=βy₂*；x₁*=(1−β)/(1−αβ)，y₂*=(1−α)/(1−αβ)。';extra=table(['门槛检验','现在接受','再等一期的价值'],[['玩家1',r.y[0],s.alpha*r.x[0]],['玩家2',r.x[1],s.beta*r.y[1]]]);}
  else if(mode==='discountOne'){svg=pie(50,[1-r.bound,r.bound],`第${s.step}步：玩家2可能收益的上界`,'bound')+pie(220,[1,0],'唯一SPE的立即协议','limit');metrics=[['当前上界 Mₖ',r.bound],['原候选给玩家2的份额',r.oldThreshold],['能打破旧拒绝计划的报价',r.profitableOffer],['等一期才拿旧份额的价值',s.beta*r.oldThreshold]];reading='只要玩家2会折现，旧的正份额门槛就能被一个“现在稍少、仍多于明天现值”的报价打破。把所有SPE中玩家2收益的上界记为M，可推出M≤βM；因β<1，只能M=0。有限步显示的是上界收缩，不是声称第几步已经严格等于零。';formula='0≤M≤βM，0<β<1 ⇒ M=0；提议者得到全部并立即达成协议。';}
  else if(mode==='stalemate'){const changed=s.signal==='yes',a=changed?[0,1]:[0,0];svg=pie(60,a,changed?'偏离强硬报价后：最终协议':'沿原计划永远不达成协议','stalemate');for(let k=0;k<4;k++){const x=90+130*k;svg+=dot(x,265,C.m,'period-'+k)+txt(x,305,(changed?['稍让步','拒绝','(0,1)','接受']:['(1,0)','拒绝','(1,0)','拒绝'])[k],C.ink,13);if(k<3)svg+=`<path d="M${x+10} 265H${x+120}" stroke="${C.m}"/>`}if(!changed)svg+=txt(565,270,'…',C.m,16);metrics=[['玩家1最终收益',0],['玩家2最终收益',changed?1:0],['等待成本',0],['原路径是否达成协议','永不达成']];reading='原书构造：只要过去一直提出(1,0)，就继续这样提议、对方继续拒绝；一旦出现别的报价，后续改为只接受并提出(0,1)。玩家1偏离也不能获得正收益，所以僵局可以是SPE。';formula='双方等待都没有代价。按题中的续局策略，单方面改口无利可图，所以一直谈不拢也能成为子博弈精炼均衡。';}
  else if(mode==='one'){svg=pie(65,r.allocation,'既有计划每期都提议 x*','share')+pie(220,[1-s.offer,s.offer],'偏离测试：眼前的新报价','offer');metrics=[['玩家1既定份额',r.allocation[0]],['玩家2接受门槛',r.threshold],['面对新报价',s.offer>=r.threshold?'接受':'拒绝，等待x*'],['均衡是否唯一','否']];reading='玩家1一直提出x*，玩家2只接受给自己至少x₂*的报价。在没有折现时，拒绝较差报价等下期不会损失；对每一份划分都能构造这样的SPE。改变新报价，比较现在接受与下一期得到既定份额。';formula='玩家1始终提议x*；玩家2接受 y 当且仅当 y₂≥x₂*。';}
  else {svg=pie(65,[1-r.epsilon,r.epsilon],`若拒绝零份额：仍可把正报价继续减半`,'epsilon')+pie(220,[1,0],'连续最后通牒的唯一SPE','ultimatum');metrics=[['当前给玩家2的正份额 ε',r.epsilon],['再减半仍为正',r.epsilon/2],['提议者可增加的份额',r.epsilon/2],['SPE中零份额是否接受','接受']];reading='任何正份额都会被只关心自身份额的回应者接受。若他拒绝零份额，提议者对任意正报价都能再减半，因而没有最优提议。这排除了“拒绝零”的SPE，区别于只能给整数单位的模型。';formula='ε>0 ⇒ ε/2>0 且 1−ε/2>1−ε；唯一SPE提议(1,0)，并接受零份额。';}
  if(mode==='discountOne'&&r.oldThreshold===0){metrics[2]=['当前候选安排','已给玩家1全部'];reading+=' 当前候选已经给玩家2零份额，无法再用这种报价严格改进；前面的偏离论证针对原门槛为正的情形。'}
  legend='绿色：玩家1　紫色：玩家2；份额与折现后的效用分别显示';boundary+=' 当前期作为折现起点，延迟k期乘δᵏ；有限期无折现模型允许不同协议时点。';last=r;
 }
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 600 ${height}" role="img" aria-label="${meta.title}交互模型" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);
 $('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${f(v)}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('legend').textContent=legend;$('extra').innerHTML=extra;
 spec.forEach(c=>{$(c.k).value=state[c.k];if($('out-'+c.k))$('out-'+c.k).value=f(state[c.k])});
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放推演'}
function advance(){
 if(key==='bargaining'&&state.mode==='one'){state.offer=state.offer>=1-state.share?Math.max(0,1-state.share-.1):1-state.share;render();return true}
 if(key==='bargaining'&&state.mode==='stalemate'){state.signal=state.signal==='no'?'yes':'no';render();return true}
 if(key==='extensive'||key==='bargaining'||key==='existence'&&state.mode==='finite'){const c=spec.find(c=>c.k==='step');state.step=Math.min(c.max,state.step+1);render();return state.step>=c.max}
 if(key==='existence'){state.x=state.x>=.99?0:Math.min(1,state.x+.1);render();return state.x>=1}
 if(key==='kantian'){state.scale=state.scale===1?Math.min(last.singleOpt,spec.find(x=>x.k==='scale').max):1;render();return true}
 if(key==='strategic'){
  if(state.mode==='traveler'){if(turn===0)state.a=last.best[0][0];else state.b=last.best[1][0];turn=1-turn;render();return last.gains.every(x=>x<1e-8)}
  if(state.mode==='attrition'){state.view='pure';state.T=Math.max(1,last.threshold);state.S=0;render();return true}
  if(['15.7','15.8'].includes(section)){applyPreset('mixed-ne');return true}
  if(turn===0)state.row=String(last.br1[+state.col][0]);else state.col=String(last.br2[+state.row][0]);turn=1-turn;render();return last.gains.every(x=>x<1e-8);
 }
 if(key==='economic-games'){
  if(['first','second'].includes(state.mode)){state[+state.who?'b':'a']=last.witnesses[+state.who].bid;render();return true}
  if(state.mode.startsWith('location')){state[['a','b','d'][+state.who]]=last.d.choice;render();return true}
  if(state.mode==='cournotN'){state.n=Math.min(30,state.n+1);render();return state.n===30}
  if(state.mode==='bertrand'){applyPreset('bertrand-ne');return true}
  state[turn?'b':'a']=last.br[turn];turn=1-turn;render();return last.gains.every(x=>x<1e-7);
 }
 return true;
}
function applyPreset(name){
 if(name==='traveler-ne')state.a=state.b=180;
 if(name==='mixed-ne'){state.p=last.mixed.interior?last.mixed.pStar:last.pure[0][0]===0?1:0;state.q=last.mixed.interior?last.mixed.qStar:last.pure[0][1]===0?1:0;if(section==='15.8'){state.beliefP=state.p;state.beliefQ=state.q}}
 if(name==='maxmin'){state.row=String(last.maxmin[0][0]);state.col=String(last.maxmin[1][0])}
 if(name==='auction-truth'){state.a=10;state.b=5}if(name==='auction-tie')state.a=state.b=5;if(name==='auction-low'){state.a=3;state.b=12}
 if(name==='location-middle'){state.a=state.b=.5;if(state.d!==undefined)state.d=.5}
 if(name==='bertrand-ne')state.a=state.b=state.c;
 if(name==='response-ne')state.a=state.b=state.mode==='effort'?state.c:(1-state.c)/3;
 if(name==='cournot-zero'){state.a=state.b=1;state.c=0}
 if(name==='kantian-ne'){state.a=state.b=1/3;state.scale=1}if(name==='kantian-ke'){state.a=state.b=.25;state.scale=1}render();
}
$('fields').addEventListener('input',e=>{const c=spec.find(c=>c.k===e.target.dataset.key);if(!c)return;stop();if(c.k==='mode'){configure(e.target.value);render();$('mode').focus();return}state[c.k]=c.options?e.target.value:+e.target.value;if(key==='extensive'&&c.k!=='step')state.step=0;render()});
$('extra').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;stop();const kind=['preset','cell','node'].find(k=>b.dataset[k]),value=b.dataset[kind];if(b.dataset.preset)applyPreset(b.dataset.preset);if(b.dataset.cell){[state.row,state.col]=b.dataset.cell.split(',');render()}if(b.dataset.node){const p={...last.policy},node=last.nodes.find(x=>x.id===b.dataset.node);p[node.id]=(p[node.id]+1)%node.children.length;state.policy=policyIndex(last.root,p);state.step=0;render()}if(kind)$('extra').querySelector(`[data-${kind}="${value}"]`)?.focus({preventScroll:true})});
$('advance').onclick=()=>{stop();return advance()};$('play').onclick=()=>{if(timer){stop();return}playSteps=0;if(advance()||window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance()||++playSteps>=8)stop()},1500);$('play').textContent='暂停推演'};$('reset').onclick=()=>{stop();configure(initialMode);render()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',render);window.demo={meta,get state(){return state},get spec(){return spec},draw:render,get last(){return last}};configure(initialMode);render();
}

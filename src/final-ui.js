import {orders,allProfiles,singlePeakedProfiles,profileNumber,relationCheck,formation,pairs,experiment,employment,profits,producerGoals,housing,aggregate,aggregationAudit,socialWinner,manipulation,manipulationAudit,arrowSteps,gsSteps} from './final-topics.mjs';
import {exercise20Cases} from './aggregation-exercises.mjs';
import {startAggregationExercises} from './aggregation-exercises-ui.js';
import {startSocialPreferencesStory} from './social-preferences-ui.js';
import {startAggregationMethodsStory} from './aggregation-methods-ui.js';
import {startAggregationPropertiesStory} from './aggregation-properties-ui.js';
import {startArrowProofStory} from './arrow-proof-ui.js';
import {startSocialChoiceStory} from './social-choice-ui.js';
const exercise20Request=new URLSearchParams(location.search).get('case')||window.EXERCISE_DEFAULT;
if(window.LESSON.id==='20.1')startSocialPreferencesStory(exercise20Request);
else if(window.LESSON.id==='20.2')startAggregationMethodsStory(exercise20Request);
else if(window.LESSON.id==='20.3')startAggregationPropertiesStory(exercise20Request);
else if(window.LESSON.id==='20.4')startArrowProofStory();
else if(window.LESSON.id==='20.5')startSocialChoiceStory(exercise20Request);
else if(window.LESSON.id.startsWith('20.')&&exercise20Request in exercise20Cases&&exercise20Cases[exercise20Request].section===window.LESSON.id)startAggregationExercises(exercise20Request);
else {
const $=id=>document.getElementById(id),meta=window.LESSON,key=meta.engine;
const C={g:'#177468',p:'#7a6594',r:'#c35f43',m:'#69786b',line:'#d9dfd1',paper:'#fffdf7'},names=['a','b','c'];
const f=x=>typeof x==='number'?(Math.abs(x)<1e-10?'0':x.toLocaleString('zh-CN',{maximumFractionDigits:3})):x;
const orderLabel=r=>r.map(x=>names[x]).join(' ≻ '),rankOptions=Object.fromEntries(orders.map((r,i)=>[i,orderLabel(r)]));
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),S=(k,label,options,value)=>({k,label,options,value});
const rules={majority:'成对多数（可能不传递）',plurality:'例20.1 · 首选计票',borda:'例20.2 · Borda计分2/1/0',weighted:'例20.2 · 计分4/1/0',copeland:'例20.3 · 成对胜场计分',external:'例20.4 · 固定外部排序',dictator:'例20.5 · 个人1的排序'};
const fields=key==='formation'?[S('mode','如何形成比较',{value:'加权数值',distance:'离理想点越近越好',lex:'字典序：先看第一特征',unanimity:'两个特征一致同意',majority:'三个标准的多数'},'value'),R('b','b 的第一特征',0,4,.1,2),R('weight','数值规则：第一特征权重',0,1,.05,.5)]:
 key==='experiment'?[R('question','当前比较题',0,2,1,0),S('ab','a 与 b',{1:'a ≻ b',0:'a ∼ b','-1':'b ≻ a'},'0'),S('bc','b 与 c',{1:'b ≻ c',0:'b ∼ c','-1':'c ≻ b'},'1'),S('ac','a 与 c',{1:'a ≻ c',0:'a ∼ c','-1':'c ≻ a'},'1')]:
 key==='producer-goals'?[R('lambda','每裁减1人的主观损失（百万美元）',0,.05,.001,0),R('chosen','查看第几个就业方案',0,6,1,3)]:
 key==='housing-unique'?[...Array.from({length:3},(_,i)=>S('r'+i,'居民'+(i+1)+'的严格排序',rankOptions,String([3,5,0][i]))),S('ties','是否严格偏好',{strict:'严格：每栋房屋排序不同',indifferent:'放宽：所有房屋都无差异'},'strict'),R('price','价格组合编号',0,26,1,0),R('allocation','配置编号',0,5,1,0),R('step','TTC逐轮移除',0,3,1,0)]:
 key==='social-choice'?[S('rule','选择一个方案的规则',{plurality:'首选票：同票按a、b、c',borda:'Borda：同分按a、b、c',dictator:'选个人1首选',constant:'固定选a'},'plurality'),R('profile','真实偏好组合编号',0,215,1,4),S('who','谁改变报告',{0:'个人1',1:'个人2',2:'个人3'},'0'),S('report','他的报告',rankOptions,'0'),R('proof','定理证明进度',0,6,1,0)]:
 key==='arrow'?[S('rule','检查哪一种汇总规则',rules,'borda'),R('profile','偏好组合编号',0,215,1,48),R('step','Arrow五步证明',0,5,1,0),R('pivotal','示意中的关键个人 i*',1,3,1,2),R('support','已把 b 从末位抬到首位的人数',0,3,1,0)]:
 [S('rule','汇总规则',rules,meta.id==='20.1'?'majority':'borda'),R('profile','偏好组合编号',0,215,1,48),S('domain','允许的个人排序',{all:'全部严格排序',single:'限定单峰：b不在末位'},'all'),...(key==='aggregation-properties'?[S('property','查看哪条性质',{neutrality:'中立性：交换方案名称',anonymity:'匿名性：交换两个人',responsive:'正向响应：抬高一个方案',pareto:'Pareto：一致同意',iia:'IIA：成对比较不变'},'iia')]:[])];
if(['aggregation','aggregation-properties','arrow'].includes(key))fields.find(c=>c.k==='profile').value=162;
let state=Object.fromEntries(fields.map(x=>[x.k,x.value])),timer=null,last={};
$('fields').innerHTML=fields.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label}<output id="out-${c.k}"></output></label><input id="${c.k}" data-key="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');
function txt(x,y,text,color=C.m,size=14,anchor='middle'){const scale=Math.min(2.1,Math.max(1,640/Math.max(280,$('plot').clientWidth)));return `<text x="${x}" y="${y}" font-size="${size*scale}" fill="${color}" text-anchor="${anchor}">${text}</text>`}
const dot=(x,y,color,id,r=7)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${id?`data-motion="${id}"`:''}/>`;
const table=(head,rows)=>`<table><thead><tr>${head.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const profileTable=p=>table(['个人1','个人2','个人3'],[p.map(orderLabel)]);
const relation=(R,a,b)=>R[a][b]&&R[b][a]?'∼':R[a][b]?'≻':R[b][a]?'≺':'不可比';
function network(R,y=0){const pts=[[110,75+y],[470,75+y],[290,275+y]];let svg='';for(const [a,b] of pairs){const [x1,y1]=pts[a],[x2,y2]=pts[b],rel=relation(R,a,b),color=rel==='不可比'?C.line:rel==='∼'?C.p:C.g;svg+=`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="2" ${rel==='不可比'?'stroke-dasharray="5 5"':''}/>`+txt((x1+x2)/2,(y1+y2)/2-14,names[a]+(rel==='不可比'?' ⋈ ':` ${rel} `)+names[b],color,13);}pts.forEach(([x,z],i)=>svg+=dot(x,z,C.g,'node-'+i+'-'+y,8)+txt(x,z+36,names[i],C.g,19));return svg}
function rankBars(result,y=0,label='社会得分'){let svg=txt(60,30+y,label,C.m,13,'start');const max=Math.max(...result.score,1);result.score.forEach((v,i)=>{svg+=txt(60,85+i*80+y,names[i],C.m,19)+`<rect data-motion="score-${i}" x="95" y="${55+i*80+y}" width="${400*v/max}" height="35" fill="${[C.g,C.p,C.r][i]}"/>`+txt(535,83+i*80+y,f(v),C.m,16)});return svg}
function currentAggregation(){const p=state.domain==='single'?singlePeakedProfiles[state.profile%singlePeakedProfiles.length]:allProfiles[state.profile],weights=state.rule==='weighted'?[4,1,0]:[2,1,0];return {p,weights,r:aggregate(p,state.rule,weights)};}
function render(){let svg='',height=390,metrics=[],reading='',formula='',extra='',legend='',boundary=meta.boundary;const s=state;
 if(key==='formation'){
  const r=formation(s.mode,s.b,s.weight);svg=network(r.R);metrics=[['完备性',r.complete?'满足':'不满足'],['传递性',r.transitive?'满足':'不满足'],['是否构成偏好关系',r.complete&&r.transitive?'是':'否']];
  reading={value:'先把两个特征压缩为同一个数值，再比较数值。数值可以逐对比较，也遵守传递性；权重改变可能改变排序。',distance:'理想点固定为(2,3)，距离越小越好。取效用为负距离便能表示这种排序。',lex:'只有第一特征完全一样时才比较第二特征。把b的第一特征从2稍微改动，检查是否仍需看第二特征；这里不是用“大权重”近似字典序。',unanimity:'只有两个特征都不差时，才认定至少一样好。特征冲突的两个方案可能不可比；不可比与无差异是不同关系。',majority:'三套标准各自完整且传递：a≻b≻c、b≻c≻a、c≻a≻b。逐对取多数得到a≻b≻c≻a，不能拼成传递的个人偏好。'}[s.mode];
  formula=s.mode==='value'?'v=w·第一特征+(1−w)·第二特征':s.mode==='distance'?'v=−√[(第一特征−2)²+(第二特征−3)²]':s.mode==='lex'?'先比较第一特征；相等才用第二特征':s.mode==='unanimity'?'x≽y ⇔ x 的两个特征均不低于 y':'每对至少两套标准支持 ⇒ 成对多数';
  $('b').disabled=s.mode==='majority';$('weight').disabled=s.mode!=='value';extra=table(['方案','第一特征','第二特征',s.mode==='distance'?'负距离':'加权数值（仅用于数值规则）'],r.points.map((p,i)=>[names[i],...p,r.scores[i]]));legend='绿色：严格比较　紫色：无差异　灰虚线：不可比；文字直接标明比较方向';last=r;
 }else if(key==='experiment'){
  const r=experiment([+s.ab,+s.bc,+s.ac]),[a,b]=pairs[s.question];svg=network(r.R);metrics=[['当前题',names[a]+' 对 '+names[b]],['传递性',r.transitive?'满足':'不满足'],['被违反的传递条件',r.violations.length]];
  reading='a、b实际是同一个巴黎周末套餐：4星酒店、餐饮指标17、574美元，仅描述顺序不同；c为3—4星、餐饮20、560美元。请逐对记录自己的判断，再一起检查；即使没有三个严格箭头构成的环，无差异不传递也会违反偏好公理。';
  formula=r.violations.length?r.violations.map(([a,b,c])=>`${names[a]}≽${names[b]} 且 ${names[b]}≽${names[c]}，却非 ${names[a]}≽${names[c]}`).join('；'):'当前回答符合完备性和传递性。';
  extra=`<p>当前比较 ${names[a]} 与 ${names[b]}：</p><button data-answer="1">更喜欢前者</button> <button data-answer="0">无差异</button> <button data-answer="-1">更喜欢后者</button><p><button data-action="experiment-counter">查看“无差异也会出问题”</button></p><p>这是从教材三套餐情境改写的本地练习；完整原问卷为9选项、36题。教材报告截至2018年4月约1300份回应中15%无传递性违反；84组三元组中，违反数中位数6、均值9.5、样本最高66。这些是历史实验描述，不是本页用户统计。</p>`;legend='先逐对回答，再看整张比较图；≽包括严格更好与无差异';last=r;
 }else if(key==='producer-goals'){
  const r=producerGoals(s.lambda),X=x=>90+440*x/196,Y=y=>310-230*(y+8)/10;for(const y of [-8,-4,0,2])svg+=`<path d="M90 ${Y(y)}H530" stroke="${C.line}"/>`+txt(73,Y(y)+5,y,C.m,12,'end');
  employment.forEach((x,i)=>svg+=dot(X(x),Y(profits[i]),r.chosen.includes(i)?C.g:r.dominated[i]?C.line:C.p,'job-'+i,r.chosen.includes(i)?10:6));svg+=dot(X(employment[s.chosen]),Y(profits[s.chosen]),C.r,'selected',7)+txt(90,30,'年利润（百万美元）',C.m,13,'start')+txt(530,370,'继续雇用人数',C.m,13,'end');for(const x of [0,100,196])svg+=txt(X(x),340,x,C.m,12);
  metrics=[['当前最优的就业人数',r.chosen.map(i=>employment[i]).join(' / ')],['查看方案的裁员人数',196-employment[s.chosen]],['查看方案的年利润',profits[s.chosen]],['此方案是否被双重支配',r.dominated[s.chosen]?'是':'否']];reading='教材提供的是7个离散就业方案。只看利润时选100人；同时在意裁员时，最优方案可能改变。绿色为当前目标的所有最优点，灰点在利润和就业上都被别的方案压过；未用连线虚构中间就业方案的利润。';formula='演示目标：U=年利润−λ×裁员人数；λ是独立构造的偏好参数，并非教材估计值。';extra=table(['就业人数','裁员人数','年利润','演示目标值'],employment.map((n,i)=>[n,196-n,profits[i],r.scores[i]]));boundary+=' 教材对不同学科学生的差异只是观察，不能凭它区分自我选择与教学影响。';legend='绿点：当前目标最优　紫点：其余不被支配方案　灰点：被支配　红点：正在查看';last=r;
 if(key==='producer-goals')extra+='<details><summary>怎样理解“企业利润最大化”这个假设</summary><p>规范判断是在说企业应该追求什么；描述性判断是在说实际企业通常追求什么；建模便利是在说明研究者为何选择一个容易推导的目标；教育影响则是在追问长期只讲利润目标是否会影响人的判断。这四类说法不能互相替代。教材对不同学科学生的差异没有区分自我选择与教学影响，因此不能由这张图推出因果结论。这里的权重目标只是帮助比较偏好，并非实证估计。</p></details>';
 }else if(key==='housing-unique'){
  const p=[0,1,2].map(i=>orders[+s['r'+i]]),r=housing(p,s.ties==='indifferent'),a=r.allocations[s.allocation],prices=r.prices[s.price],check=r.check(a,prices),solved=r.trace.slice(0,s.step).flatMap(x=>x.cycle);height=470;
  for(let i=0;i<3;i++){const x=100+200*i,z=100+200*a[i];svg+=dot(x,90,solved.includes(i)?C.g:C.p,'person-'+i,10)+txt(x,48,'居民'+(i+1),C.m,14)+txt(x,129,'原有'+names[i],C.m,13)+`<path d="M${x} 145L${z} 225" stroke="${check[i].affordable&&!check[i].better.length?C.g:C.r}" stroke-width="3"/>`+txt(x,268,'房屋'+names[i],C.m,16)+`<rect data-motion="price-${i}" x="${x-35}" y="${405-35*prices[i]}" width="70" height="${35*prices[i]}" fill="${C.g}"/>`+txt(x,440,'价格 '+prices[i],C.m,13);}
  metrics=[['当前配置是否均衡',check.every(x=>x.affordable&&!x.better.length)?'是':'否'],['枚举得到的均衡配置数',r.allocationKeys.length],['找到的价格与配置组合数',r.equilibria.length]];reading=s.ties==='strict'?'严格偏好下，配置唯一不意味着价格唯一。三个正价格等级足够为三人TTC移除顺序构造支持价格；本页完整枚举6种配置与27组价格，独立比较预算可负担性及最优选择。绿色居民为已经完成的交易循环。':'放宽为所有房屋都无差异，在等价格下六种配置都能构成均衡。严格偏好是唯一性结论的关键条件；本页没有用严格偏好的TTC平局处理来宣称唯一。';formula='p(分得房屋)≤p(原有房屋)，且没有更喜欢而买得起的房屋。';
  extra=profileTable(p)+table(['居民','分得房屋','收入','支出','更喜欢且买得起'],check.map((z,i)=>[i+1,names[a[i]],prices[i],prices[a[i]],s.ties==='indifferent'?'无差异':z.better.map(h=>names[h]).join(' / ')||'无']))+'<button data-action="housing-eq">代入一个真实均衡</button> <button data-action="housing-price">换一组均衡价格</button>'+table(['TTC轮次','移除循环','本轮分配'],r.trace.map((t,i)=>[i+1,t.cycle.map(i=>i+1).join('→'),t.cycle.map(i=>`${i+1}得${names[t.result[i]]}`).join('；')]))+'<p>一般证明：在任一均衡中取最高价交易循环，每个人得到仍在市场中的唯一最爱；在另一均衡中，这个循环的分配必须相同。移除该循环，向剩余市场归纳，得到所有配置相同。有限枚举是例子，归纳论证才适用于任意人数。</p>';legend='上方：居民及初始产权　连线：分配　下方：房屋价格；绿色居民为已处理循环';last={...r,p,a,prices};
 }else if(key==='social-choice'){
  const p=allProfiles[s.profile],r=manipulation(p,+s.who,orders[+s.report],s.rule),audit=manipulationAudit(s.rule);height=440;svg=txt(60,32,'个人'+(+s.who+1)+'真实偏好：'+orderLabel(p[+s.who]),C.m,14,'start');
  for(const [row,winner] of [r.before,r.after].entries()){const y=130+190*row,color=row?C.p:C.g;svg+=txt(60,y-50,row?'改报之后选中':'诚实报告选中',color,14,'start');for(let i=0;i<3;i++)svg+=dot(110+190*i,y,C.line,null,7)+txt(110+190*i,y+48,names[i],C.m,20);svg+=`<circle data-motion="winner-${row}" cx="${110+190*winner}" cy="${y}" r="20" fill="none" stroke="${color}" stroke-width="4"/>`+dot(110+190*winner,y,color,'winning-dot-'+row,9);}
  metrics=[['诚实报告选中',names[r.before]],['改报后选中',names[r.after]],['按真实排序是否更好',r.improved?'是：有利操纵':'否'],['全216种输入中找到操纵',audit.witness?'有':'无']];reading='先固定真实偏好，再让一位参与者改变报告。绿圈与紫圈分别标出诚实报告和改报后的结果；是否更好始终按上方真实排序判断，不能按谎报后的排序自我评价。规则用固定字母顺序打破平局。';formula='防策略操纵：对所有真实输入、所有人、所有改报，诚实结果都至少一样好。';
  const step=gsSteps[s.proof];extra=profileTable(p)+'<p>改变报告后：</p>'+profileTable(r.changed)+(audit.witness?'<button data-action="manipulation">代入可验证的操纵反例</button>':'<p>这个规则在全部输入与单人改报中均无有利操纵；仍需另查一致同意。</p>')+`<h3>证明第${s.proof}步：${step[0]}</h3><p>${step[1]}</p><p>一致同意：${audit.unanimity?'有反例（不是所有人首选都能选中）':'216个输入未发现违反'}。对一般有限人数的结论见证明；216个三人输入的检查只验证本例。</p><details><summary>为什么两个方案时不受该结论限制？</summary><p>仅有a、b时，以固定人数门槛K决定是否选b：喜欢b者不能通过谎报a提高b的票数，喜欢a者不能通过谎报b降低b的票数。因此对K=1、2、3都防操纵；这依赖只有两个方案。</p></details>`;legend='绿圈：诚实结果　紫圈：改报结果；是否获益按真实排序判断';last={p,r,audit};
 }else if(key==='arrow'){
  const p=allProfiles[s.profile],weights=s.rule==='weighted'?[4,1,0]:[2,1,0],r=aggregate(p,s.rule,weights),audit=aggregationAudit(s.rule,weights),step=arrowSteps[s.step];height=460;const demo=[0,1,2].map(i=>i<s.support?[1,0,2]:[0,2,1]),social=s.support>=s.pivotal?[1,0,2]:[0,2,1];
  demo.forEach((row,i)=>{const x=110+i*190;svg+=txt(x,40,'个人'+(i+1)+(i+1===s.pivotal?'*':''),i+1===s.pivotal?C.r:C.m,14);row.forEach((a,k)=>svg+=txt(x,95+k*55,names[a],a===1?C.g:C.m,20));});svg+=txt(60,305,'关键个人示意：社会排序',C.m,13,'start')+txt(300,370,orderLabel(social),C.g,22);
  metrics=[['当前规则满足输出传递性',audit.witnesses.preference?'有反例':'216输入通过'],['满足Pareto',audit.witnesses.pareto?'有反例':'216输入通过'],['满足IIA',audit.witnesses.iia?'有反例':'216输入通过']];reading='上图展示证明中的关键个人如何使b的社会位置跳变，采用指定i*的独裁规则作一个满足条件的例子；其他规则的性质检查在下方。关键个人不是每个现实投票规则里都会出现，推导依赖整套前提。';formula='全部严格输入 + 完备传递输出 + Pareto + IIA + |X|≥3 ⇒ 同一位个人决定全部社会排序。';
  extra=`<h3>第${s.step}步：${step[0]}</h3><p>${step[1]}</p><p>完整论证参见教材印刷页319—322。改变进度依次查看五个推理环节；反例或有限枚举本身不证明不可能定理。</p>`+profileTable(p)+table(['规则','当前社会成对关系'],[[rules[s.rule],pairs.map(([a,b])=>names[a]+relation(r.R,a,b)+names[b]).join('；')]])+'<p>Arrow没有宣称不能汇总偏好。例如Borda允许社会比较受第三方案位置影响，从而放宽IIA；限制为单峰偏好则放宽了全部输入的要求。</p>';legend='上图只示意关键个人阈值；*为指定关键个人；规则条件检查独立列出';last={p,r,audit};
 }else{
  const limit=s.domain==='single'?63:215;state.profile=Math.min(state.profile,limit);$('profile').max=limit;fields.find(c=>c.k==='profile').max=limit;
  const {p,weights,r}=currentAggregation(),audit=aggregationAudit(s.rule,weights);let after=null,witness=null;
  if(key==='aggregation-properties'){witness=audit.witnesses[s.property];svg=network(r.R);if(witness&&profileNumber(p)===profileNumber(witness.before)){after=witness.after;if(after){height=740;svg+=network(aggregate(after,s.rule,weights).R,380);}}}
  else svg=s.rule==='majority'?network(r.R):rankBars(r);
  metrics=[['当前社会关系完备',r.complete?'是':'否'],['当前社会关系传递',r.transitive?'是':'否'],['规则在全216输入均输出偏好',audit.witnesses.preference?'否':'是（本三人模型）']];
  reading=key==='aggregation-properties'?'性质是针对整个函数的要求，需要比较不同输入。图首先显示你当前选择的输入；如果查找到反例，可点击“代入反例”，用上下两张图比较变化前后。没有反例时，说明本三人模型已经检查所有216个输入。':'成对多数先比较每一对，可能出现循环；其余规则用一个总得分排序或直接采用固定/个人排序，输出可含无差异。首选计票让无人首选的方案并列，Borda利用所有名次，胜场计分则把循环转换为得分。';
  formula=s.rule==='majority'?'x≽y ⇔ 支持x的票数≥支持y的票数':s.rule==='plurality'?'得分=把它列在首位的人数':s.rule==='copeland'?'每击败一个其他方案得1分；平局得半分':s.rule==='external'?'无论输入如何，社会固定 a≻b≻c':s.rule==='dictator'?'社会排序=个人1的完整排序':'得分=各人按名次赋予的分数之和';extra=profileTable(p)+(s.rule==='majority'?table(['方案对','支持前者','支持后者'],pairs.map(([a,b])=>[names[a]+' / '+names[b],r.counts[a][b],r.counts[b][a]])):table(['方案','社会得分'],r.score.map((v,i)=>[names[i],v])));
  if(s.domain==='single')extra+='<p>单峰域中只允许4种个人排序，共64个输入；b不在末位。三人多数在这个受限域上全部传递，可与不受限域的循环对照。这是教材习题20.2的三方案版本。</p>';
  if(key==='aggregation-properties'){
   extra+=`<h3>${$('property').selectedOptions[0]?.textContent||''}</h3><p>${witness?'找到了反例。点击下面按钮，将图和参数切换到反例的原输入。':'全216种输入检查未发现违反（仅认证这个三人三方案规则）。'}</p>`+(witness?'<button data-action="aggregate-witness">代入反例，上下对照</button>':'');
   if(witness)extra+='<p>反例的原输入：</p>'+profileTable(witness.before)+(witness.after?'<p>反例变化后的输入：</p>'+profileTable(witness.after):'')+(witness.pair?`<p>检查的方案对：${witness.pair.map(x=>names[x]).join(' 与 ')}。</p>`:'');
   extra+='<p>正向响应按教材定义：把x在一个人的排序中抬高一位后，原先社会不高于x的其他方案现在必须严格低于x。原书318页将该性质推广到前述规则的表述过强：首选计票中，将末位c抬到中位仍可能使b、c都零票，并未从无差异变成严格偏好。本程序给出具体反例，而不是将单调性与正向响应混为一谈。</p>';
  }
  legend=key==='aggregation-properties'?'上图：当前输入；若出现下图，为该反例变化后的关系':'紫色：无差异　绿色：严格比较；多数得票来自独立个人排序';last={p,r,audit,witness};
 }
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 600 ${height}" role="img" aria-label="${meta.title}交互图" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);$('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${f(v)}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('extra').innerHTML=extra;$('legend').textContent=legend;
 fields.forEach(c=>{$(c.k).value=s[c.k];if($('out-'+c.k))$('out-'+c.k).value=f(s[c.k])});
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function advance(){const name=key==='arrow'?'step':key==='social-choice'?'proof':key==='housing-unique'?'step':key==='experiment'?'question':key==='producer-goals'?'lambda':key==='formation'?'mode':'profile',field=fields.find(c=>c.k===name);if(field.options){const options=Object.keys(field.options);state[name]=options[(options.indexOf(state[name])+1)%options.length]}else state[name]=Math.min(field.max,state[name]+(name==='lambda'?.01:1));render();return !field.options&&state[name]>=field.max;}
$('fields').addEventListener('input',e=>{const c=fields.find(x=>x.k===e.target.dataset.key);if(!c)return;stop();state[c.k]=c.options?e.target.value:+e.target.value;render()});
$('extra').addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;stop();const {action,answer}=button.dataset;
 if(answer!==undefined)state[['ab','bc','ac'][state.question]]=answer;
 if(action==='experiment-counter'){state.ab=state.bc='0';state.ac='1'}
 if(action==='aggregate-witness'&&last.witness){state.domain='all';state.profile=profileNumber(last.witness.before);}
 if(action==='housing-eq'||action==='housing-price'){const eq=last.equilibria,now=eq.findIndex(x=>x.priceIndex===state.price&&x.allocationIndex===state.allocation),next=eq[action==='housing-price'?(now+1)%eq.length:0];state.price=next.priceIndex;state.allocation=next.allocationIndex;}
 if(action==='manipulation'&&last.audit.witness){const w=last.audit.witness;state.profile=profileNumber(w.profile);state.who=String(w.who);state.report=String(orders.findIndex(r=>r.join()===w.report.join()));}
 render();const selector=answer!==undefined?`[data-answer="${answer}"]`:`[data-action="${action}"]`;$('extra').querySelector(selector)?.focus({preventScroll:true});
});
$('advance').onclick=()=>{stop();return advance()};$('reset').onclick=()=>{stop();state=Object.fromEntries(fields.map(c=>[c.k,c.value]));render()};$('play').onclick=()=>{if(timer){stop();return}if(advance()||window.microMotion.reduced.matches)return;let n=0;timer=setInterval(()=>{if(advance()||++n>=8)stop()},1400);$('play').textContent='暂停'};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',render);window.demo={meta,get state(){return state},get spec(){return fields},get last(){return last},draw:render};render();

}

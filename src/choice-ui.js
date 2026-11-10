import {startChoiceExercises} from './choice-exercises-ui.js';
import {cxResolve} from './choice-exercises.mjs';
import {startChoiceEvidence} from './choice-evidence-ui.js';
import {startSequentialChoice} from './sequential-ui.js';
import {startAlphaLab} from './alpha-ui.js';
import {startRationalizationLab} from './rationalization-ui.js';
import {startChoiceIntroLab} from './choice-intro-ui.js';
import {caseSections,caseNames,menus,members,table24,alphaFailures,rankFromAlpha,chooseByRank,medianChoice,satisficingChoice,satisficingRank,originalSatisficing,menuChoice,frameData,outcomeDistribution,sourceRates,problem1Witnesses} from './choice.mjs';
const $=id=>document.getElementById(id),meta=window.LESSON,cases=caseSections[meta.id],query=new URLSearchParams(location.search).get('case')||window.CHOICE_EXERCISE_DEFAULT;
const C={ink:'#334b40',muted:'#65796e',green:'#177468',purple:'#7a6594',red:'#c35f43',gold:'#a27619',paper:'#fffdf7',rule:'#dbe2d4'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>typeof n==='number'?n.toLocaleString('zh-CN',{maximumFractionDigits:2}):String(n);
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value});
const S=(k,label,options,value)=>({k,label,options,value});
const alphabet='abcd',name=i=>alphabet[i],setName=(mask,n)=>'{'+members(mask,n).map(name).join(', ')+'}';
if(meta.id==='2.1'){startChoiceIntroLab(query||window.CHOICE_INTRO_DEFAULT||cases[0]);}else if(meta.id==='2.2'){startRationalizationLab(query||window.RZ_DEFAULT||cases[0]);}else if(meta.id==='2.3'){startAlphaLab(query||window.ALPHA_DEFAULT||cases[0]);}else if(meta.id==='2.4'||meta.id==='2.5'){startSequentialChoice(query||window.SD_DEFAULT||cases[0]);}else if(meta.id==='2.6'&&['attention','framing','mental'].includes(query||window.EVIDENCE_DEFAULT||cases[0])){startChoiceEvidence(query||window.EVIDENCE_DEFAULT||cases[0]);}else if(meta.id==='2.6'&&cxResolve(query||window.CHOICE_EXERCISE_DEFAULT,new URLSearchParams(location.search).get('variant')||'a')){startChoiceExercises(query||window.CHOICE_EXERCISE_DEFAULT);}else{
$('fields').insertAdjacentHTML('beforebegin',`<div class="field"><label for="experiment">本节的具体实验</label><select id="experiment">${cases.map(k=>`<option value="${k}">${caseNames[k]}</option>`).join('')}</select></div>`);
let mode='',spec=[],state={},last={},timer=null;
function setup(k){stop();mode=k;$('experiment').value=k;
 spec=[R('step','推演步骤',0,2,1,0)];
 if(['rationalaction','rationalize','example1'].includes(k))spec=[R('table','选择表编号',0,23,1,0),R('menu','菜单编号',0,6,1,6)];
 if(k==='constructrank')spec=[R('table','选择表编号',0,23,1,0),R('step','剥离步骤',0,2,1,0)];
 if(k==='choiceproblem')spec=[R('menu','菜单编号',0,6,1,6)];
 if(k==='median')spec=[R('step','菜单缩小',0,1,1,0)];
 if(['restaurant','party','attention','framing','mental','p6'].includes(k))spec=[R('step','切换情境',0,1,1,0)];
 if(['satisficing','satisficingrank','p3','p4'].includes(k))spec=[R('step','考察步骤',0,3,1,0),R('threshold','满意门槛',-2,3,1,0)];
 if(k==='moneypump')spec=[R('step','交易轮次',0,3,1,0),R('fee','每次支付',1,5,1,1)];
 if(k==='p1')spec=[S('variant','五种程序',{a:'a 字母顺序局部峰',b:'b 篮球胜场',c:'c 字典式标准',d:'d 效用门槛',e:'e 颜色多数'},'a'),R('step','菜单缩小',0,1,1,0)];
 if(k==='p7')spec=[R('size','有限图示的备选项数',3,8,1,5),R('step','证明步骤',0,2,1,0)];
 if(k==='p8')spec=[R('step','交易步骤',0,2,1,0),R('price','每件价格',1,5,1,2)];
 state=Object.fromEntries(spec.map(c=>[c.k,c.value]));$('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,t])=>`<option value="${v}">${esc(t)}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label} <output id="out-${c.k}">${fmt(c.value)}</output></label><input id="${c.k}" data-key="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');draw();}
function stage(){const small=$('plot').clientWidth<500,W=small?360:560,H=small?320:280;let shapes=`<rect width="${W}" height="${H}" fill="${C.paper}"/>`;
 const text=(x,y,s,color=C.ink,size=small?13:16,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif">${esc(s)}</text>`;
 const line=(x,y,X,Y,color=C.rule,w=2)=>`<path d="M${x} ${y}L${X} ${Y}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
 const add=s=>shapes+=s;
 const cards=(labels,visible,selected,sub='')=>{const n=labels.length,span=W-44,cell=span/n,cy=H*.53;labels.forEach((label,i)=>{let x=22+i*cell+cell/2,active=visible.includes(i);add(`<rect data-motion="choice-card-${i}" x="${x-cell*.39}" y="${cy-42}" width="${cell*.78}" height="84" rx="10" fill="${active?i===selected?C.green:'#edf2ea':'#f4f2ed'}" stroke="${active?i===selected?C.green:C.rule:'#e8e7df'}" opacity="${active?1:.45}"/>${text(x,cy+7,label,active&&i===selected?C.paper:C.ink,small?14:17)}`)});if(selected!==null&&selected!==undefined){let x=22+selected*cell+cell/2;add(`<circle data-motion="choice-focus" cx="${x}" cy="${cy+58}" r="8" fill="${C.gold}" stroke="${C.paper}" stroke-width="2"/>`)}if(sub)add(text(W/2,H*.18,sub,C.muted,small?12:15));};
 const bars=(labels,vals,colors)=>{const n=labels.length,base=H-57,top=65,cell=(W-56)/n;vals.forEach((v,i)=>{let x=28+i*cell+cell*.15,bw=cell*.7,h=Math.max(3,(base-top)*v/100);add(`<rect data-motion="choice-bar-${i}" x="${x}" y="${base-h}" width="${bw}" height="${h}" rx="5" fill="${colors?.[i]||C.green}" opacity=".83"/>${text(x+bw/2,base+24,labels[i],C.ink,small?13:15)}${text(x+bw/2,base-h-10,fmt(v)+'%',C.ink,small?14:16)}`)});};
 return {W,H,small,text,line,add,cards,bars,html:()=>`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(caseNames[mode])}动态图" xmlns="http://www.w3.org/2000/svg">${shapes}</svg>`};}
function draw(){
 const g=stage(),step=state.step??0,metrics=[];let reading='',formula='',extra='',boundary=`原教材第2章，印刷页17—29。图中逐项列出本例的菜单与选择。`,result={};
 const add=(k,v)=>metrics.push([k,v]);
 if(['choiceproblem','rationalaction','rationalize','example1'].includes(mode)){
  const list=menus(3),mask=list[state.menu],table=mode==='choiceproblem'?table24(0):table24(state.table),bad=alphaFailures(table,3),rank=rankFromAlpha(table,3),chosen=table[mask];
  g.cards(['a','b','c'],members(mask,3),chosen,`当前菜单 ${setName(mask,3)} · 只能从菜单内选`);
  add('菜单',setName(mask,3));add('选择',name(chosen));add('性质 α',bad.length?'不满足':'满足');
  if(mode==='choiceproblem'){reading='选择函数必须给每一个非空菜单指定恰好一个菜单内的选项。三选项共有7个非空菜单；当前用固定排序 a≻b≻c 展示定义。';formula='c(A)∈A，A⊆X 且 A≠∅';}
  if(mode==='rationalaction'){reading='“理性”在本书指行为可由一张固定偏好排序解释，并不保证偏好内容符合日常意义上的福利判断。若当前选择表违反 α，就无法用固定排序解释。';formula='c(A)=A 中按固定偏好唯一最优的选项';}
  if(mode==='rationalize'){reading=bad.length?`这张选择表在 ${setName(bad[0].A,3)} 与 ${setName(bad[0].B,3)} 上冲突：删去一些备选后，原赢家仍在却被换掉。`:`这张表可由严格排序 ${rank.map(name).join('≻')} 解释；原书要求被选项是唯一最优，而不只是最优者之一。`;formula='c(A)≻y（所有 y∈A 且 y≠c(A)）';}
  if(mode==='example1'){reading=bad.length?'当前表包含选择冲突。教材给出的三选项循环是 a胜b、b胜c、c胜a；它不可能由传递偏好表示。':`当前表与 ${rank.map(name).join('≻')} 一致。三选项有24张可能选择表，恰好6张能由严格排序理性化。`;formula='三对二选一 × 三选一 = 2³×3 = 24；可理性化 3! = 6';}
  add('表编号',mode==='choiceproblem'?'固定':state.table);if(rank)add('固定排序',rank.map(name).join(' ≻ '));result={mask,table,bad,rank,chosen};
 }else if(['median','restaurant','party','alpha','rationalalpha'].includes(mode)){
  let labels,visible,chosen,full,small;
  if(mode==='median'){labels=['a₁','a₂','a₃','a₄','a₅'];full=31;small=28;visible=step?small:full;chosen=medianChoice(visible,5);reading='全菜单选五个中的 a₃；缩小为 {a₃,a₄,a₅} 后选 a₄。a₃ 仍在菜单中却失去胜出地位。若改把“位置”视为备选项，可用偏好“中位位置优先”解释；但这已改变了备选集合。';formula='c({a₁,…,a₅})=a₃；c({a₃,a₄,a₅})=a₄';boundary='例2.2，印刷页19—20。图中五个候选的位置固定，缩小菜单改变其相对位置。';}
  if(mode==='restaurant'){labels=['三文鱼','牛排','蜗牛','蛙腿'];full=15;small=3;visible=step?full:small;chosen=step?1:0;reading='加入两道自己厌恶的菜后，点餐者改选牛排。书中解释是新菜单让“牛排”被理解为较高品质；若把高品质与低品质牛排当成不同备选项，行为便可用新的固定排序解释。';formula='c({三文鱼,牛排})=三文鱼；c(四道菜)=牛排';boundary='例2.3，印刷页20。价格与故事来自教材引述；图像强调菜单改变选项含义。';}
  if(mode==='party'){labels=['A','B₁','B₂'];full=7;small=3;visible=step?full:small;chosen=step?0:1;reading='只有 A 与 B₁ 邀请时参加 B₁；B₂ 也邀请时，怕得罪另一位朋友，转而参加 A。B₁ 的社会含义随 B₂ 是否在场而改变。';formula='c({A,B₁})=B₁；c({A,B₁,B₂})=A';boundary='例2.4，印刷页21。把情境也写进选项，再检查能否用同一个排序解释两次选择。';}
  if(mode==='alpha'){labels=['a','b','c'];full=7;small=5;visible=step?small:full;chosen=step?2:0;reading='α 要求：大菜单选了 a，只要缩小菜单仍包含 a，就必须继续选 a。这里缩小到 {a,c} 后改选 c，是直接反例。';formula='B⊂A 且 c(A)∈B ⇒ c(B)=c(A)';boundary='定义2.3，印刷页21。反例的数据为本站自主构造。';}
  if(mode==='rationalalpha'){labels=['a','b','c'];full=7;small=5;visible=step?small:full;chosen=0;reading='若 a 在大菜单是唯一最优，那么在包含 a 的任何小菜单里，它仍优于其中每个备选，所以选择不变。这正是命题2.1的一般证明结构。';formula='∀y∈A：a≽y；B⊂A 且 a∈B ⇒ ∀y∈B：a≽y';boundary='命题2.1，印刷页21。图只展示一个包含关系；文字给出一般论证。';}
  g.cards(labels,members(visible,labels.length),chosen,step?'缩小或扩展后的菜单':'最初菜单');add('菜单',visible===full?'完整/扩展':'缩小/原始');add('选中',labels[chosen]);result={visible,chosen,full,small};
 }else if(mode==='constructrank'){
  const table=table24(state.table),bad=alphaFailures(table,3),rank=rankFromAlpha(table,3),remaining=rank?rank.slice(Math.min(step,2)):members(bad[0].A,3),selected=rank?rank[Math.min(step,2)]:bad[0].large;
  g.cards(['a','b','c'],remaining,selected,rank?`第${Math.min(step,2)+1}轮：从剩余菜单选出 ${name(selected)}`:'出现 α 冲突，不能构造固定排序');
  add('α 检查',bad.length?'失败':'通过');if(rank)add('剥离排序',rank.map(name).join(' ≻ '));
  reading=rank?`有限集合依次令 a₁=c(X)，删去 a₁ 后令 a₂=c(X\{a₁})，直到排完。由于 α，从任意菜单所选者必是此序列里最靠前的成员。当前排序 ${rank.map(name).join('≻')}。`:`当前表违反 α：在 ${setName(bad[0].A,3)} 选 ${name(bad[0].large)}，缩到 ${setName(bad[0].B,3)} 却选 ${name(bad[0].small)}；不能套用命题2.2。`;
  formula='a₁=c(X)，a₂=c(X\\{a₁})，…；有限 X 且 α ⇒ 可理性化';boundary='命题2.2，印刷页22。此命题的正文前提是有限 X；无限扩展见习题2.7。';result={table,bad,rank,remaining,selected};
 }else if(['satisficing','satisficingrank','p3','p4'].includes(mode)){
  const values=originalSatisficing.values,threshold=state.threshold,rank=satisficingRank(values,threshold,undefined,mode==='p4'?'best':'last'),selected=mode==='p4'?satisficingChoice(15,values,threshold,undefined,'best'):satisficingChoice(15,values,threshold),current=Math.min(step,3);
  const shown=mode==='p3'&&step>=1?[1,2,3]:mode==='p4'&&step>=2?[0,1]:[0,1,2,3],shownMask=shown.reduce((a,i)=>a|(1<<i),0),shownChoice=satisficingChoice(shownMask,values,threshold,undefined,mode==='p4'?'best':'last');
  g.cards(['a','b','c','d'],shown,current===3||mode==='satisficingrank'||mode==='p3'&&step>=1||mode==='p4'&&step>=2?shownChoice:null,`字母顺序检查 · 分数 ${values.join(' / ')} · 门槛 ${threshold}`);
  if(mode==='satisficing'||mode==='satisficingrank')g.add(`<circle data-motion="choice-scan" cx="${22+current*(g.W-44)/4+(g.W-44)/8}" cy="${g.H*.53-58}" r="7" fill="${C.gold}"/>`);
  const firstQualified=shown.find(i=>values[i]>=threshold);add('首个合格',firstQualified===undefined?'没有':name(firstQualified));add('当前菜单选择',name(shownChoice));add('构造的排序',rank.map(name).join(' ≻ '));
  if(mode==='satisficing'){reading='按字母顺序面试，遇到第一个达到门槛的候选人就停止。若所有候选都未达标，则选最后一个。滑动门槛可看到“好”与“够好”不同。';formula='c(A)=首个 v(x)≥v* 的 x；若没有，取 A 中最后一个';}
  if(mode==='satisficingrank'){reading='把所有合格者按面试顺序放在前面，不合格者按面试顺序的反序放在后面。此固定排序对每个菜单都复现满意原则。';formula='X⁺ 按 O 排序 ≻ X⁻ 按 O 的逆序';boundary='命题2.3，印刷页23。教材例子门槛为0，候选评分为−1、−2、1、3。';}
  if(mode==='p3'){const A=15,B=14,x=satisficingChoice(A,values,threshold),inB=!!(B&(1<<x));reading=`从 {a,b,c,d} 缩到 {b,c,d}。${inB?'原赢家仍在小菜单，结果保持不变，体现 α。':'原赢家被删掉，α 的前提不成立；不能把这一步算作违规。'} 从“最早合格/无合格时最后一个”的规则可以对任意包含原赢家的小菜单做同样论证。`;formula='c(A)∈B⊂A ⇒ c(B)=c(A)';add('原赢家仍在B',inB?'是':'否');boundary='习题2.3，印刷页28。图是论证例子；结论需要分别处理有/无合格者。';}
  if(mode==='p4'){reading='改为无人达标时选评分最高者。固定排序仍存在：合格者按面试顺序在前，不合格者按评分从高到低在后；若评分相同，教材须补一个固定的破同分规则。';formula='X⁺ 按 O 排序 ≻ X⁻ 按 v 值降序';boundary='习题2.4，印刷页28。显示评分互异；同分时采用固定破同分规则。';}
  result={values,threshold,rank,selected:shownChoice,current,shown};
 }else if(mode==='moneypump'){
  const path=[0,2,1,0],selected=path[step],paid=step*state.fee;
  g.cards(['a','b','c'],[0,1,2],selected,`持有 ${name(selected)} · 已付 ${paid} 美元`);
  g.add(g.text(g.W*.15,g.H-38,'累计费用',C.muted,g.small?12:14,'start')+`<rect x="${g.W*.15}" y="${g.H-28}" width="${g.W*.7}" height="8" rx="4" fill="${C.rule}"/><rect data-motion="choice-paid" x="${g.W*.15}" y="${g.H-28}" width="${g.W*.7*step/3}" height="8" rx="4" fill="${C.red}"/>`);
  add('交易次数',step);add('持有物品',name(selected));add('累计支付',`$${paid}`);
  reading=step===0?'假设从 a 开始，并愿意为每次“更喜欢”的换物至少支付指定费用。':step===3?'三次交易后重新持有 a，却少了钱。重复循环需进一步假设此人在损失后仍未察觉并持续愿意支付。':'a→c→b→a 形成物品循环；钱每一步都单向流出。';
  formula='a → c → b → a；三次后同物品、少 3×手续费';boundary='§2.5，印刷页23—24。每次至少愿付1美元是教材额外假设；金钱泵的说服力还取决于当事人是否发现操纵。';result={path,selected,paid};
 }else if(mode==='attention'){
  const labels=step?['A','B','C']:['A','B'],rates=step?sourceRates.attention.ABC:sourceRates.attention.AB;
  g.bars(labels,rates,[C.purple,C.green,C.gold]);add('实验菜单',step?'A、B、C':'A、B');add('B 的群体占比',rates[1]+'%');
  reading='加入被 B 在两个指标上都压过的 C 后，选择 B 的比例从52%升至68%。两道题由各约1300名参与者回答；比例属于群体结果，不能据此断定某一名参与者违反 α。';formula='B 支配 C；P(B|{A,B})=52%，P(B|{A,B,C})=68%';boundary='§2.6.1，印刷页24—25。相机参数和比例是原教材记录的历史在线实验，不是本站重新调查。';result={labels,rates};
  extra='<details><summary>查看教材中三台相机的参数</summary><table><thead><tr><th>相机</th><th>平均评分</th><th>像素</th></tr></thead><tbody><tr><th>A</th><td>9.1</td><td>600万</td></tr><tr><th>B</th><td>8.3</td><td>900万</td></tr><tr><th>C</th><td>8.1</td><td>700万</td></tr></tbody></table><p>B 的评分和像素都高于 C；A 与 B 各有优势。</p></details>';
 }else if(mode==='framing'){
  const labels=step?['C','D']:['A','B'],rates=step?[7,93]:[sourceRates.framing.A,49],left=step?'C':'A',right=step?'D':'B';g.bars(labels,rates,[C.purple,C.green]);
  add('当前表述',labels.join(' 对 '));add('同结果分布','A=C，B=D');
  reading=step?'把红、黄事件拆成更细的颜色后，D 在每个对应颜色事件上不劣于 C，且在黑、绿事件上更好；教材记录约93%选 D。':'A 与 C、B 与 D 分别给出相同的最终收益分布。原表述下教材记录约51%选 A；换表述后选择比例改变。';
  formula='F_A=F_C，F_B=F_D';
  extra=`<details><summary>查看教材中的颜色、概率和收益</summary><table><thead><tr><th>转盘</th><th>颜色：概率→收益</th></tr></thead><tbody>${labels.map(l=>`<tr><th>${l}</th><td>${frameData[l].map(([color,p,v])=>`${color} ${Math.round(p*100)}% → $${v}`).join('；')}</td></tr>`).join('')}</tbody></table></details>`;
  boundary='§2.6.2，印刷页25—26。F 表示最终收益分布；51%与93%是教材历史群体结果。比较时先核对两张彩票的最终收益分布，再看参与者实际选了哪张。';result={labels,rates,distributionLeft:outcomeDistribution(frameData[left]),distributionRight:outcomeDistribution(frameData[right])};
 }else if(mode==='mental'){
  const buy=step?sourceRates.mental.cash:sourceRates.mental.ticket;g.bars(['再买票','不买票'],[buy,100-buy],[C.green,C.purple]);add('描述',step?'丢失40美元':'丢失40美元的票');add('愿意买票',buy+'%');
  reading='两种情境的最终选项都是“比出门前少80美元并看演出”或“少40美元且不看演出”。教材中的不同群体分别有65%与79%愿意再买票；这提示心理账户与表述可能改变判断。';formula='P(T)=0.65；P(C)=0.79';boundary='§2.6.3，印刷页26—27。T表示丢票组、C表示丢现金组；两个群体人数相近但不同，群体比例不证明同一人自相矛盾。';result={buy};
 }else if(mode==='p1'){
  const v=state.variant,w=problem1Witnesses[v];let labels,mask,chosen;
  if(w){labels=v==='a'?['a','b','c','d']:['a','b','c'];mask=step?w.B:w.A;chosen=step?w.small:w.large;reading=w.description;formula=`c(${setName(w.A,labels.length)})=${name(w.large)}；c(${setName(w.B,labels.length)})=${name(w.small)}；违反 α`;
  }else if(v==='c'){labels=['a','b','c'];mask=step?5:7;chosen=2;reading='按有先后顺序的二元标准逐轮筛选，等价于字典式固定排序。令 a=(1,0)、b=(0,1)、c=(1,1)，则 c≻a≻b。';formula='先比标准1，再比标准2 ⇒ 字典式偏好可理性化';}
  else{labels=['a','b','c'];mask=step?5:7;chosen=0;reading='若最高 u 值已达到10，就选 u 最高者；否则选 v 最高者。固定排序可构造为：高 u 组在前且按 u 降序，低 u 组在后且按 v 降序。本例 u=(12,11,4)，v=(1,10,9)。';formula='u≥10 组按 u 排序 ≻ u<10 组按 v 排序';}
  g.cards(labels,members(mask,labels.length),chosen,`程序 ${v} · ${step?'子菜单':'大菜单'}`);add('是否可理性化',w?'否':'是');add('当前选择',labels[chosen]);boundary='习题2.1，印刷页27—28。a、b、e 给 α 反例；c、d 给固定排序。评分和颜色是对原题规则的自主构造。';result={variant:v,mask,chosen,witness:w||null};
 }else if(mode==='p2'){
  const masks=[3,6,7],mask=masks[step],chosen=1;g.cards(['a','b','c'],members(mask,3),chosen,`两个菜单交叉 · ${setName(mask,3)}`);add('A 的选择','b');add('B 的选择','b');
  reading='设 x=c(A)∈B、y=c(B)∈A。考察 A∪B 的选择 z：若 z∈A，则 α 使 z=x；又 x∈B，α 再使 c(B)=x。若 z∈B 对称处理。故 x=y。';formula='c(A)∈B 且 c(B)∈A ⇒ c(A)=c(B)';boundary='习题2.2，印刷页28。图给一组排序 b≻a≻c；证明文字适用于任意两个菜单。';result={mask,chosen};
 }else if(mode==='p5'){
  const masks=[5,10,15],rank=[2,0,3,1],mask=masks[step],chosen=chooseByRank(mask,rank);g.cards(['a','b','c','d'],members(mask,4),chosen,`先分两组，再比较组内胜者 · 第${step+1}步`);
  add('A 组选择','c');add('B 组选择','d');add('合并选择','c');reading='若从固定偏好选择，分组后各自的最优者再对决，与直接合并选择一致。反过来，路径无关取 A=B⊔(A\B)，并用原赢家仍在 B 的条件推出 α，进而可理性化。';formula='c(A∪B)=c({c(A),c(B)})，其中 A∩B=∅';boundary='习题2.5，印刷页28—29。等价结论依赖全菜单域与题设的单值选择。';result={mask,rank,chosen};
 }else if(mode==='p6'){
  const mask=step?3:7,rule={kind:'caring',u:[0,1,2],v:[2,1,0],threshold:1},chosen=menuChoice(rule,mask);
  g.cards(['a','b','c'],members(mask,3),chosen,`u=(0,1,2)，v=(2,1,0)，v*=1`);
  add('当前菜单',setName(mask,3));add('当前选择',name(chosen));reading='全菜单里 u 最高的 c 使自己得到 v(c)=0，低于门槛，于是改选 v 最高的 a。缩到 {a,b} 后，u 最高的 b 达到门槛，改选 b；a 仍在场，因此违反 α。';formula='c({a,b,c})=a；c({a,b})=b；a∈{a,b}';boundary='习题2.6，印刷页29。这是原题要求的一个非理性化构造；u 可理解为朋友福利，v 为自身福利。';result={mask,chosen,rule};
 }else if(mode==='p7'){
  const n=state.size,visible=Array.from({length:n},(_,i)=>i),subset=step===0?[0,1]:step===1?[0,1,2]:visible,chosen=0;
  g.cards(visible.map(i=>i<26?String.fromCharCode(97+i):String(i)),subset,chosen,`有限图示 ${n} 项 · 从两两比较扩到任意菜单`);
  add('图示项数',n);add('图中最优','a');reading='一般证明从每对 {x,y} 的选择定义 x≽y。α 排除三元偏好循环：三项菜单的赢家在所有含它的两项菜单中仍赢；再用 α 说明任意菜单的选择压过其中每个选项。图中依次列出前 n 项；一般论证对任意 n 成立。';formula='x≽y ⇔ c({x,y})=x；∀A，c(A)≽y（y∈A）';boundary='习题2.7，印刷页29。X 可无限，图仅显示3至8项；证明使用定义在每个非空子集上的选择函数。';result={n,subset,chosen};
 }else if(mode==='p8'){
  const n=step===0?2:step===1?5:5,unit=g.W/9,start=(g.W-6*unit)/2;
  for(let i=0;i<6;i++)g.add(`<rect data-motion="choice-unit-${i}" x="${start+i*unit}" y="${g.H*.5}" width="${unit*.78}" height="${unit*.78}" rx="6" fill="${i<n?C.green:'#e6d8d1'}" opacity="${i<n?1:.35}"/>`);
  g.add(g.text(g.W/2,g.H*.28,step===0?'先收到 2 件':step===1?'再收到 3 件':'实际 5 件；却按 6 件结算',C.ink,g.small?17:20));
  add('实际件数',n);add('误计件数',step===2?6:n);add('多付',step===2?`$${state.price}`:'$0');reading='若交易者把2+3误算为6，可能按6件付款却只收到5件。在单价固定且无法核对货物时，每次交易多付一件的价钱；但“必定破产”还需要关于交易、纠错和环境的额外假设。';formula='2+3=5；按6件付款 − 实得5件价值 = 多付1件价格';boundary='习题2.8，印刷页29。题目是开放式讨论；沿交易环走一遍，核对换回原物时累计支付了多少。';result={actual:n,perceived:step===2?6:n,overpaid:step===2?state.price:0};
 }
 window.microMotion.chart($('plot'),g.html());$('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${esc(k)}</label><strong>${esc(fmt(v))}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('extra').innerHTML=extra;$('legend').textContent='绿色表示当前选项或群体比例；金色标记持续追踪的对象；淡色表示暂时不在菜单中。';for(const c of spec){$(c.k).value=state[c.k];if($('out-'+c.k))$('out-'+c.k).value=fmt(state[c.k])}last=result;
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function next(){const c=spec.find(x=>x.k==='step')||spec.find(x=>x.k==='menu')||spec[0];if(!c)return true;if(c.options){const keys=Object.keys(c.options),i=keys.indexOf(state[c.k]);state[c.k]=keys[(i+1)%keys.length]}else state[c.k]=state[c.k]>=c.max?c.min:Math.min(c.max,state[c.k]+c.step);draw();return !c.options&&state[c.k]>=c.max}
$('experiment').addEventListener('change',ev=>{setup(ev.target.value);const u=new URL(location.href);u.searchParams.set('case',mode);history.replaceState(null,'',u)});
$('fields').addEventListener('input',ev=>{const c=spec.find(x=>x.k===ev.target.dataset.key);if(!c)return;stop();state[c.k]=c.options?ev.target.value:+ev.target.value;draw()});
$('advance').onclick=()=>{stop();return next()};$('reset').onclick=()=>setup(mode);$('play').onclick=()=>{if(timer){stop();return}if(next()||window.microMotion.reduced.matches)return;let n=0;timer=setInterval(()=>{if(next()||++n>=8)stop()},1100);$('play').textContent='暂停'};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',draw);window.demo={meta,get caseName(){return mode},get state(){return state},get last(){return last}};setup(cases.includes(query)?query:cases[0]);

}

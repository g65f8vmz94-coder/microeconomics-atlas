import {alphaCases,alphaOrders,alphaDecode,alphaEncode,alphaFromOrder,alphaTable,alphaStudy,alphaSourceWitness} from './alpha.mjs';
import {alphaProofs} from './alpha-content.mjs';
import {menus,members} from './choice.mjs';

export function startAlphaLab(initial){
 document.body.classList.add('alpha-page');
 const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const titles={alpha:'定义2.3 · 删掉落选项，原赢家还在吗',rationalalpha:'命题2.1 · 从唯一最好推出α',constructrank:'命题2.2 · 逐轮删除，再检查所有菜单'};
 let mode=alphaCases.includes(initial)?initial:'alpha',timer=null,urlTimer=null;
 let state={n:3,A:7,B:5,target:5,edit:7,order:0,phase:0,peel:0,table:mode==='alpha'?2:0,context:'generic',...(window.ALPHA_INITIAL||{})};
 for(let n=1;n<=6;n++)state['data'+n]=alphaEncode(alphaFromOrder(alphaOrders(n)[0]),n);
 state.data3=alphaEncode(alphaTable(state.table),3);
 const int=(key,lo,hi)=>{if(q.has(key)&&Number.isFinite(Number(q.get(key))))state[key]=Math.max(lo,Math.min(hi,Math.round(Number(q.get(key)))))};
 int('n',1,6);int('table',0,23);int('phase',0,3);
 if(['generic','median','restaurant','party'].includes(q.get('context')))state.context=q.get('context');
 if(state.context!=='generic')state.n=alphaSourceWitness(state.context).n;
 for(let n=1;n<=6;n++){const x=q.get('data'+n);if(x&&x.length===menus(n).length&&/^[0-5u]+$/.test(x))state['data'+n]=x;}
 if(state.context!=='generic'&&!q.has('data'+state.n)&&!q.has('answers')){const w=alphaSourceWitness(state.context);state['data'+state.n]=alphaEncode(w.data,state.n);state.A=w.A;state.B=w.B;state.target=w.B;}
 if(state.n===3&&q.has('table')&&!q.has('data3')&&!q.has('answers'))state.data3=alphaEncode(alphaTable(state.table),3);
 const code=q.get('answers')||window.ALPHA_INITIAL?.answers;if(code&&code.length===menus(state.n).length&&/^[0-5u]+$/.test(code))state['data'+state.n]=code;
 if(state.context==='generic'&&!q.has('A')&&!Object.hasOwn(window.ALPHA_INITIAL||{},'A'))state.A=(1<<state.n)-1;
 if(!q.has('edit')&&!Object.hasOwn(window.ALPHA_INITIAL||{},'edit'))state.edit=(1<<state.n)-1;
 for(const k of['A','B','target','edit'])int(k,k==='edit'?1:0,63);
 int('order',0,alphaOrders(state.n).length-1);int('peel',0,state.n);
 for(const k of['A','B','target','edit'])state[k]=Math.max(k==='edit'?1:0,state[k]&((1<<state.n)-1));
 state.order=Math.max(0,Math.min(alphaOrders(state.n).length-1,state.order));
 if(q.has('step')&&!q.has('peel')&&mode==='constructrank')state.peel=Math.max(0,Math.min(state.n,Number(q.get('step'))||0));
 if(q.has('step')&&!q.has('phase')&&mode!=='constructrank')state.phase=Number(q.get('step'))>0?3:0;
 let contextNames=()=>state.context==='generic'?'abcdef'.slice(0,state.n).split(''):state.context==='party'?['A聚会','B₁聚会','B₂聚会']:alphaSourceWitness(state.context).names;
 const name=i=>i===null||i===undefined?'未答':contextNames()[i]??'界外'+i;
 const tex=i=>i===null||i===undefined?String.raw`\text{未答}`:state.context==='median'?'a_'+(i+1):state.context==='restaurant'?['S','T','N','F'][i]??String.raw`\text{界外答复}`:state.context==='party'?['H_A','B_1','B_2'][i]??String.raw`\text{界外答复}`:'abcdef'[i]??String.raw`\text{界外答复}`;
 const set=A=>'{'+members(A,state.n).map(name).join('、')+'}',setTex=A=>String.raw`\{`+members(A,state.n).map(tex).join(',')+String.raw`\}`;
 const table=()=>alphaDecode(state['data'+state.n],state.n),order=()=>alphaOrders(state.n)[state.order];
 const eq=s=>`<div class="equation">${esc(s)}</div>`;
 const proof=key=>{const p=alphaProofs[key];return`<details class="alpha-proof"><summary>${esc(p.title)}</summary><ol>${p.steps.map(([h,b,f])=>`<li><h4>${esc(h)}</h4><p>${esc(b)}</p>${eq(f)}</li>`).join('')}</ol></details>`};
 const options=(empty=false)=>Object.fromEntries([...(empty?[0]:[]),...menus(state.n)].map(A=>[A,A?set(A):'空菜单（无c值）']));
 const select=(k,label,opts,value=state[k])=>`<div class="field"><label for="al-${k}">${esc(label)}</label><select id="al-${k}" data-al="${k}">${Object.entries(opts).map(([v,t])=>`<option value="${v}" ${String(value)===v?'selected':''}>${esc(t)}</option>`).join('')}</select></div>`;
 const range=(k,label,min,max,v=state[k])=>`<div class="field"><label for="al-${k}">${esc(label)} <output id="alo-${k}">${v+(k==='phase'?1:0)}</output></label><input id="al-${k}" data-al="${k}" type="range" min="${min+(k==='phase'?1:0)}" max="${max+(k==='phase'?1:0)}" step="1" value="${v+(k==='phase'?1:0)}" ${min===max?'disabled':''}></div>`;
 const button=(action,label)=>`<button id="al-action-${action}" type="button" data-al-action="${action}">${esc(label)}</button>`;
 function controls(){
  const focus=document.activeElement?.id,data=table(),answer=data[state.edit],answers={u:'尚未回答',...Object.fromEntries(contextNames().map((x,i)=>[i,x]))};if(answer!==null&&answer>=state.n)answers[answer]=name(answer)+'（界外答复）';
  let html=select('case','选择本节概念',titles,mode)+select('n','有限样例的备选项数',{1:'1项',2:'2项',3:'3项',4:'4项',5:'5项',6:'6项'});
  html+=mode==='constructrank'?range('peel','已经排出几项',0,state.n)+select('target','排完后核对的任意目标菜单 C',options(true)):range('phase','讲解走到第几步',0,3)+select('A','大菜单 A',options(true))+select('B','想比较的小菜单 B',options(true));
  if(state.n===3)html+=range('table','载入24张完整表之一（替换自填）',0,23);
  html+=select('edit','要编辑哪一行选择',options())+select('answer','给该行一个答案（可以故意选错）',answers,answer??'u');
  if(mode==='rationalalpha')html+=range('order','试一张固定排序的编号',0,alphaOrders(state.n).length-1)+`<p class="alpha-note" id="al-order-description">当前排序：${esc(order().map(name).join(' ＞ '))}。编号只是索引。</p>`+button('generate','按这张排序生成全部菜单选择');
  html+=button('positive','载入 a、b、c 的完整正例')+button('hidden-cycle','只留循环二选一，全菜单未答');
  if(mode==='alpha')html+=select('source','回看原文的α反例',{generic:'选择一例载入',median:'例2.2 中位',restaurant:'例2.3 餐馆',party:'例2.4 聚会'},'generic');
  $('fields').innerHTML=html;const aside=$('fields').closest('aside');aside.querySelector('h2').textContent=mode==='constructrank'?'先排顺序，再证明':'原赢家还在吗';aside.querySelector('p').textContent='改一行选择或一份菜单，核对前提和结论。讲解进度重置时保留输入。';
  $('play').textContent=timer?'暂停':mode==='constructrank'?'逐轮演示':'分步讲解';$('advance').textContent=mode==='constructrank'?'排出下一项':'下一步 / 比较';$('reset').textContent='恢复讲解（保留输入）';if(focus&&$(focus))$(focus).focus({preventScroll:true});
 }
 function canvas(label,H=370){const small=$('plot').clientWidth<520,W=small?360:560;let s=`<rect width="${W}" height="${H}" fill="#fffdf7"/>`;const add=x=>s+=x,text=(x,y,t,color='#334b40',size=20,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${color}">${esc(t)}</text>`;return{small,W,H,add,text,finish:()=>`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${s}</svg>`};}
 function pairPlot(v){
  const g=canvas('同一备选位置固定；上排大菜单A，下排待核对菜单B',390),x=i=>40+(g.W-80)*(state.n===1?.5:i/(state.n-1));
  g.add(g.text(18,31,'大菜单 A','#334b40',21,'start')+g.text(18,207,'比较菜单 B','#334b40',21,'start'));
  for(const[j,A,c]of[[0,state.A,v.pair.a],[1,state.B,v.pair.b]]){const y=j?270:96,ready=j===0||state.phase>=1,showChoice=j===0||state.phase>=2;g.add(`<path d="M${x(0)} ${y}H${x(state.n-1)}" stroke="#dbe2d4" stroke-width="2"/>`);for(let i=0;i<state.n;i++){const active=ready&&!!(A&(1<<i));g.add(`<circle data-motion="alpha-member-${j}-${i}" cx="${x(i)}" cy="${y}" r="${active?10:6}" fill="${active?'#177468':'#dbe2d4'}"/>`+g.text(x(i),y+38,name(i),active?'#334b40':'#8b9689',state.n>4?20:23));}if(j===0&&c!==null&&c<state.n)g.add(`<circle data-motion="alpha-original-winner" cx="${x(c)}" cy="${y}" r="18" fill="none" stroke="${A&(1<<c)?'#a27619':'#c35f43'}" stroke-width="3"/>`);if(j===1&&ready&&v.pair.a!==null&&v.pair.a<state.n&&(A&(1<<v.pair.a)))g.add(`<circle data-motion="alpha-retained-winner" cx="${x(v.pair.a)}" cy="${y}" r="18" fill="none" stroke="#a27619" stroke-width="3"/>`);if(j===1&&showChoice&&c!==null&&c<state.n)g.add(`<circle data-motion="alpha-small-choice" cx="${x(c)}" cy="${y}" r="25" fill="none" stroke="${A&(1<<c)?'#7a6594':'#c35f43'}" stroke-width="3" stroke-dasharray="6 4"/>`);g.add(g.text(g.W/2,y+77,!ready?'下一步再看B':!A?'空菜单：无需c值':showChoice?'记录选 '+name(c):'先想想：会继续选原赢家吗','#65796e',20));}
  g.add(g.text(g.W/2,380,'位置只对齐身份，不表示偏好高低','#65796e',19));return g.finish();
 }
 function peelPlot(v){
  const g=canvas('原身份固定；逐轮记录优先序后，对照目标C、尾集、排序预测和真实记录',430),p=v.peel,k=Math.min(state.peel,p.rows.length),current=p.rows[k],remaining=current?.menu??p.remaining,finished=k===state.n&&p.complete,t=finished?v.tail:null,x=i=>40+(g.W-80)*(state.n===1?.5:i/(state.n-1));
  g.add(g.text(18,31,'上排：原来的身份位置','#334b40',21,'start'));
  for(let i=0;i<state.n;i++){const active=!!(remaining&(1<<i));g.add(`<circle data-motion="alpha-peel-item-${i}" cx="${x(i)}" cy="100" r="${active?11:6}" fill="${active?'#177468':'#dbe2d4'}"/>`+g.text(x(i),139,name(i),active?'#334b40':'#8b9689',23));}
  if(current)g.add(`<circle data-motion="alpha-next-selection" cx="${x(current.winner)}" cy="100" r="20" fill="none" stroke="#a27619" stroke-width="3"/>`);
  g.add(g.text(g.W/2,182,current?'下一项从剩余菜单选 '+name(current.winner):p.stop?'下一轮缺合法答案，构造停下':'全部排完；还要核对全表','#65796e',20));
  g.add(g.text(18,237,'下排：已经排出的优先序','#334b40',21,'start'));
  for(let j=0;j<state.n;j++){const ready=j<k,inC=finished&&!!(state.target&(1<<p.order[j]));g.add(`<rect data-motion="alpha-rank-slot-${j}" x="${x(j)-19}" y="265" width="38" height="42" rx="4" fill="${inC?'#eee9f1':ready?'#e8efe7':'#f0efeb'}"/>`+g.text(x(j),295,ready?name(p.order[j]):'·',inC?'#7a6594':ready?'#177468':'#8b9689',24)+g.text(x(j),338,'第'+(j+1),'#65796e',19));}
  if(t){g.add(`<path data-motion="alpha-tail" d="M${x(t.m)-19} 355H${x(state.n-1)+19}" stroke="#65796e" stroke-width="3"/><circle data-motion="alpha-target-prediction" cx="${x(t.m)}" cy="286" r="24" fill="none" stroke="#a27619" stroke-width="3"/>`);const observedIndex=p.order.indexOf(t.observed);if(observedIndex>=0)g.add(`<circle data-motion="alpha-target-observation" cx="${x(observedIndex)}" cy="286" r="30" fill="none" stroke="${state.target&(1<<t.observed)?'#7a6594':'#c35f43'}" stroke-width="3" stroke-dasharray="6 4"/>`);}
  g.add(g.text(g.W/2,385,finished?(t?'紫底：C成员；金圈：序列预测':'C为空：此处不定义c(C)'):'下排从左到右是构造的严格优先序','#65796e',18));
  g.add(g.text(g.W/2,415,finished?(t?'虚线圈：记录；下划线：剩余尾集':'请选择非空C，再核对剩余尾集'):'先逐轮排完，再检验任意目标 C','#65796e',18));return g.finish();
 }
 const pairLabels={'empty-or-invalid-large':'A不是非空合法菜单','invalid-small':'B不是合法子集','empty-small':'空菜单没有c值','same-menu':'同一菜单，不是严格收缩','not-subset':'B带入新项，不是收缩','invalid-answer':'先修正菜单外答案','unanswered-large':'大菜单未答，前提未知','winner-removed':'原赢家被删，前提不成立','unanswered-small':'赢家仍在，小菜单待答',preserved:'前提成立，赢家保持',violated:'前提成立却换人：α反例'};
 function globalStatus(a){return a.invalid.length?'先修正：不是合法选择表':a.complete?(a.alphaComplete?'完整函数满足α':'完整函数违反α'):a.failures.length?'已有直接α反例':a.canCompleteAlpha?'未见直接违例；仍是部分记录':'未见直接违例，但无法补成α函数';}
 function pairFormula(p){if(p.kind==='same-menu')return String.raw`B=A\Rightarrow c(B)=c(A)`;if(p.kind==='not-subset')return String.raw`B\not\subseteq A`;if(p.kind==='empty-small')return String.raw`B=\varnothing,\quad c(B)\text{未定义}`;if(p.kind==='empty-or-invalid-large')return String.raw`A\notin 2^X\setminus\{\varnothing\}`;if(p.kind==='invalid-answer')return String.raw`c(A)\notin A\quad\text{或}\quad c(B)\notin B`;if(p.kind==='winner-removed')return String.raw`c(A)=${tex(p.a)}\notin B`;if(p.kind==='unanswered-large')return String.raw`c(A)=\text{未答}`;if(p.kind==='unanswered-small')return String.raw`c(A)=${tex(p.a)}\in B,\quad c(B)=\text{未答}`;return String.raw`c(A)=${tex(p.a)}\in B\subsetneq A;\quad c(B)=${tex(p.b)}${p.pass?'=':String.raw`\ne `}c(A)`;}
 function records(data,predicted){return`<details class="alpha-records"><summary>候选选择表：${menus(state.n).length}个非空菜单</summary><table class="alpha-table"><thead><tr><th>菜单</th><th>记录</th>${predicted?'<th>候选序预测</th>':''}</tr></thead><tbody>${menus(state.n).map(A=>`<tr><th>${esc(set(A))}</th><td>${esc(name(data[A]))}</td>${predicted?`<td>${esc(name(predicted.find(x=>A&(1<<x))))}${data[A]===null?'（待观察）':data[A]===predicted.find(x=>A&(1<<x))?' ✓':'，不符'}</td>`:''}</tr>`).join('')}</tbody></table></details>`;}
 function draw(defer=false){
  $('plot').tabIndex=-1;$('plot').setAttribute('role','region');$('plot').setAttribute('aria-label',mode==='constructrank'?'逐轮构造与目标菜单C的核对':'大小菜单A、B的选择比较');
  const opened=new Set([...$('extra').querySelectorAll('details[open]')].map(x=>x.querySelector('summary')?.textContent)),data=table(),v=alphaStudy(data,state.n,state.A,state.B,state.target,order()),a=v.analysis,p=v.pair,metrics=[];let reading='',formula='',extra='',legend='';const put=(k,value)=>metrics.push([k,value]);
  const source=state.context==='generic'?null:alphaSourceWitness(state.context),sourceSame=source&&alphaEncode(source.data,state.n)===state['data'+state.n];
  put('记录来源',sourceSame?'原例反证用的两行':source?'自主修改或补填原例':'自主有限样例');
  if(mode==='constructrank'){
   const peel=v.peel,k=Math.min(state.peel,peel.rows.length),finished=state.peel>=state.n&&peel.complete,t=v.tail;window.microMotion.chart($('plot'),peelPlot(v));
   put('实际已排出',k+' / '+state.n);put('全表α检查',globalStatus(a));put('命题2.2前提',v.canUseProposition22?'完整合法且满足α':'尚不能套用');put('排出的序解释全表',!finished?'排完后核对':a.invalid.length?'先修正非法答案':!peel.comparison.fits?'否：已知记录不符':!a.complete?'仅已知相符，仍待填全':'是');put('目标 C',set(state.target));
   if(finished&&t){put('C中最早的一项',name(t.x));put('C的真实记录',name(t.observed));put('当前目标是否相符',t.observed===null?'待答':t.matches?'是':'否');}
   reading=!finished?(peel.stop&&k>=peel.rows.length?'实际构造停在 '+set(peel.stop.menu)+'：这一行还没有合法答案。先补这一行，再继续；不能凭空排下一名。':'先从当前剩余菜单选一项，记下来，再删去它。上排身份位置不变，灰色已排出；下排逐项记录顺序。即使能排完，也要再核对这个序是否解释所有菜单。'):(v.canUseProposition22?'现在任取目标C，找它在构造序中最早出现的一项。C包含于该轮剩余菜单，且保留该轮赢家；相等时直接用构造，真包含时用α。这样才从“排完”走到“解释每个菜单”。':'虽然已经排出一个序，命题前提仍未通过。把它对各菜单的预测与真实记录比较；局部碰巧相符不能补上全域α。');
   if(!finished){const row=peel.rows[k];formula=row?String.raw`M_{${k+1}}=${setTex(row.menu)},\quad r_{${k+1}}=c(M_{${k+1}})=${tex(row.winner)}`:peel.stop?String.raw`M_{${k+1}}=${setTex(peel.stop.menu)},\quad c(M_{${k+1}})=\text{待修正或未答}`:String.raw`M_{n+1}=\varnothing`;}
   else{formula=peel.order.map(tex).join(String.raw`\succ `);if(t)formula+='\n'+String.raw`C=${setTex(t.A)},\quad M_{${t.m+1}}=${setTex(t.tail)},\quad r_{${t.m+1}}=${tex(t.x)}`+'\n'+String.raw`c(C)=${tex(t.observed)}${t.observed===null?'':t.matches?'=':String.raw`\ne `}${t.observed===null?'':tex(t.x)}`;}
   if(finished&&!state.target){reading='C为空菜单，不属于本定义的选择问题。请选择非空目标C，才能寻找它在构造序中最早的成员；不要求给c(空集)一个值。';formula+='\n'+String.raw`C=\varnothing`;}
   extra=`<p>本页把教材的第k轮赢家a_k改记r_k。有限样例为自主构造；每一步都调用同一张选择表。${finished&&t?(t.sameMenu?'当前C恰好等于该轮剩余菜单，直接由构造取值，不需要把α用于相等集合。':'当前C真包含于该轮剩余菜单且保留其赢家。是否能用全域α，还要看完整函数前提。'):''}</p><table class="alpha-table"><caption>本步及此前的实际选择</caption><thead><tr><th>轮次</th><th>剩余菜单</th><th>选中</th></tr></thead><tbody>${peel.rows.slice(0,k+1).map(r=>`<tr><th>${r.round}</th><td>${esc(set(r.menu))}</td><td>${esc(name(r.winner))}</td></tr>`).join('')}</tbody></table>`+((!a.invalid.length&&peel.comparison?.rows.find(r=>!r.match))?'<button type="button" data-al-target="'+peel.comparison.rows.find(r=>!r.match).A+'">查看一个已知不符的目标 C</button>':'')+records(data,peel.complete?peel.order:null)+proof('construct')+proof('limits')+proof('partial');legend=finished?'构造序保持不变，紫底标出目标C；金圈是C中最早项的排序预测，虚线圈是实际记录（红色表示菜单外）。下划线标出包含C的剩余尾集；预测和记录分别核对。':'上排横向位置固定，仅对齐身份；金圈是本轮剩余菜单的实际赢家。下排按选出顺序记录各项，逐份菜单核对排序预测与实际赢家。';
  }else{
   window.microMotion.chart($('plot'),pairPlot(v));put('A的记录',state.A?name(p.a):'空菜单无c值');put('B的记录',state.phase<2?'第3步展示':state.B?name(p.b):'空菜单无c值');put('原赢家仍在B',p.a===null?'未知':p.winnerInSmall?'是':'否');put('本次菜单对',state.phase<2?'先核对前提':pairLabels[p.kind]);put('全域α状态',state.phase<3?'第4步核对':globalStatus(a));
   if(mode==='rationalalpha'){put('候选序解释全表',state.phase<3?'第4步核对':v.canUseProposition21?'是':'尚未满足');put('符合已知菜单',v.comparison.matched+' / '+v.comparison.total);}
   else put('满足α的完整补全数',state.phase<3?'第4步核对':a.alphaCompletions);
   if(state.phase===0)reading='把同一组方案放在大菜单A里，先记它实际选了谁。下一步拿走一些方案；先想想原赢家是否还在。购物比喻是自主讲解，原文反例可从左侧另行载入。';
   else if(state.phase===1)reading='现在把A与B对齐。先只问两件事：B真的是A的子集吗？A原先选中的那一项还留在B里吗？先别因为换了答案就立即判错。';
   else{reading=pairLabels[p.kind]+'。'+(p.kind==='winner-removed'?'原赢家没了，α并没有要求继续选它，不能把换选记作反例。':p.kind==='violated'?'原赢家还在，却换成另一个菜单内方案；这一对已经足以否定全域α。':p.kind==='preserved'?'这一对按要求保留赢家；完整函数还要检查其他所有符合前提的菜单对。':'先处理本次菜单或答复的条件，再谈结论。');if(state.phase===3)reading+=' 全表检查：'+globalStatus(a)+'。';}
   if(state.phase===3&&mode==='rationalalpha')reading+=v.canUseProposition21?'当前同一候选序确实解释全表。对剩下的每个对手，原赢家仍严格更好，因此仍是唯一最好；这个推理不要求X有限。':'当前候选序尚未解释一张完整合法表，不能把它当作命题2.1的已核准前提。可以按该序生成完整表，再改菜单比较。';
   if(source&&state.phase<2)reading='当前以固定备选核对'+source.source+'；大小菜单按包含关系排列。'+reading;
   if(source&&state.phase>=2)reading+=' '+(sourceSame?'当前只载入原例反证用到的两行。':'当前已自主修改原例记录。')+(state.context==='restaurant'?'此处A是故事后来的大菜单，B是先前的小菜单；包含方向与时间方向分开。':'');
   formula=pairFormula(p);extra=records(data,mode==='rationalalpha'?order():null)+proof(mode==='rationalalpha'?'rational':'definition')+proof('examples')+proof('partial')+proof('limits');legend='同一备选前后位置固定；金圈追踪A原赢家，紫圈为B的当前记录，灰点不在菜单。圈和对齐位置不表示偏好强度；菜单外答案标红。';
  }
  if(state.context==='party')extra='<p>公式用H_A记参加举办者A的聚会；大写A、B仍指两个菜单。这里仍按固定举办者识别备选。</p>'+extra;
  $('metrics').innerHTML=metrics.map(([k,x])=>`<div class="metric"><label>${esc(k)}</label><strong>${esc(x).replace(/满足α|违反α/g,'<span class="alpha-term">$&</span>')}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('legend').textContent=legend;$('extra').innerHTML=extra;
  for(const d of $('extra').querySelectorAll('details'))if(opened.has(d.querySelector('summary')?.textContent))d.open=true;
  $('boundary').textContent='Osborne–Rubinstein §2.3，印刷21—22页、原文件40—41页；两端相邻2.2与2.4排除。命题2.1不要求有限；本节命题2.2的逐轮构造以有限X、完整合法函数和全域α为前提。屏幕1—6项是自主有限例，一般证明另列。';
  if(window.katex)window.microMath?.refresh();clearTimeout(urlTimer);if(defer)urlTimer=setTimeout(sync,150);else sync();
 }
 function downloadName(){if(mode==='alpha'){if(state.context!=='generic')return state.context;if(state.n===3&&state.data3==='012021u')return'partial-cycle';if(state.n===3&&state.data3===alphaEncode(alphaTable(0),3)&&state.A===7&&state.B===6)return'winner-removed';}if(mode==='constructrank'){if(state.n===6)return'construct-six';if(state.n===3&&state.data3===alphaEncode(alphaTable(0),3)&&state.target===6)return'tail-equality';}return mode;}
 function sync(){clearTimeout(urlTimer);const data=state['data'+state.n];try{const u=new URL(location.href);u.search='';u.searchParams.set('case',mode);for(const[k,x]of Object.entries(state))u.searchParams.set(k,x);u.searchParams.set('answers',data);u.searchParams.set('step',mode==='constructrank'?state.peel:state.phase?1:0);history.replaceState(null,'',u);}catch{}const link=document.querySelector('.lesson-end a[download]');if(link)link.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch2-alpha-'+downloadName()+'.html';}
 function stop(){clearInterval(timer);timer=null;$('play').textContent=mode==='constructrank'?'逐轮演示':'分步讲解';}
 function refresh(){controls();draw();}
 function advance(){if(mode==='constructrank'){const p=alphaStudy(table(),state.n).peel;if(state.peel<p.rows.length)state.peel++;refresh();return state.peel>=p.rows.length;}state.phase=Math.min(3,state.phase+1);refresh();return state.phase===3;}
 function loadSource(kind){const w=alphaSourceWitness(kind);Object.assign(state,{n:w.n,A:w.A,B:w.B,target:w.B,edit:w.A,context:kind,phase:0,peel:0,order:0});state['data'+w.n]=alphaEncode(w.data,w.n);}
 $('fields').addEventListener('input',e=>{const k=e.target.dataset.al;if(e.target.type!=='range')return;stop();state[k]=Number(e.target.value)-(k==='phase'?1:0);if(k==='table')state.data3=alphaEncode(alphaTable(state.table),3);if(k==='order'&&$('al-order-description'))$('al-order-description').textContent='当前排序：'+order().map(name).join(' ＞ ')+'。编号只是索引。';const out=$('alo-'+k);if(out)out.textContent=state[k]+(k==='phase'?1:0);draw(true);});
 $('fields').addEventListener('change',e=>{const k=e.target.dataset.al;if(!k)return;if(e.target.type==='range'){sync();return}stop();if(k==='case')mode=e.target.value;else if(k==='source'){if(e.target.value!=='generic')loadSource(e.target.value)}else if(k==='answer'){const d=table();d[state.edit]=e.target.value==='u'?null:Number(e.target.value);state['data'+state.n]=alphaEncode(d,state.n);}else if(k==='n'){state.n=Number(e.target.value);state.context='generic';const full=(1<<state.n)-1;for(const key of['A','B','target','edit'])state[key]&=full;state.edit=Math.max(1,state.edit);state.order=Math.min(state.order,alphaOrders(state.n).length-1);state.peel=Math.min(state.peel,state.n);}else state[k]=Number(e.target.value);refresh();});
 $('fields').addEventListener('click',e=>{const action=e.target.closest('[data-al-action]')?.dataset.alAction;if(!action)return;stop();if(action==='generate')state['data'+state.n]=alphaEncode(alphaFromOrder(order()),state.n);if(action==='positive'||action==='hidden-cycle'){Object.assign(state,{n:3,A:7,B:5,target:5,edit:7,context:'generic',table:action==='positive'?0:2,order:0,phase:0,peel:0});state.data3=action==='positive'?alphaEncode(alphaTable(0),3):'012021u';}refresh();});
 $('extra').addEventListener('click',e=>{const b=e.target.closest('[data-al-target]');if(!b)return;stop();state.target=Number(b.dataset.alTarget);state.peel=state.n;refresh();$('plot').focus();});
 $('advance').onclick=()=>{stop();return advance();};$('reset').onclick=()=>{stop();state.phase=0;state.peel=0;refresh();};$('play').onclick=()=>{if(timer){stop();return}if(advance()||window.microMotion.reduced.matches)return;timer=setInterval(()=>{if(advance())stop()},1700);$('play').textContent='暂停';};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',stop);window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',()=>draw());$('extra').addEventListener('toggle',()=>window.microMath?.refresh(),true);refresh();
}

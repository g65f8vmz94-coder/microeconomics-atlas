import {sdOrders,sdSatisficing,sdPump} from './sequential-choice.mjs';
import {sdProofs} from './sequential-content.mjs';
import {menus,members,table24,alphaFailures} from './choice.mjs';
import {alphaEncode} from './alpha.mjs';
export function startSequentialChoice(initial){
 const $=id=>document.getElementById(id),pump=window.LESSON.id==='2.5',cases=pump?['moneypump']:['satisficing','satisficingrank'],q=new URLSearchParams(location.search);
 document.body.classList.add('sequential-page');let mode=cases.includes(initial)?initial:cases[0],timer=null;
 const defaults=pump?{pump:'cycle',table:1,A:7,B:3,fee:1,willing:1,cash:9,notice:-1,decay:0,limit:3,step:0}:{A:15,order:0,threshold:0,v0:-1,v1:-2,v2:1,v3:3,step:0};
 let state={...defaults,...(window.SD_INITIAL||{})};
 const bounds=pump?{table:[0,23],A:[0,7],B:[0,7],fee:[0,5],willing:[0,5],cash:[0,30],notice:[-1,24],step:[0,24],decay:[0,1]}:{A:[0,15],order:[0,23],threshold:[-5,5],v0:[-4,4],v1:[-4,4],v2:[-4,4],v3:[-4,4],step:[0,4]};
 for(const[k,[lo,hi]]of Object.entries(bounds))if(q.has(k)&&Number.isFinite(+q.get(k)))state[k]=Math.max(lo,Math.min(hi,+q.get(k)));
 if(pump){if(['cycle','menu'].includes(q.get('pump')))state.pump=q.get('pump');if([2,3,6,12,24].includes(+q.get('limit')))state.limit=+q.get('limit');if(q.has('fee')){if(!q.has('willing'))state.willing=Math.max(1,state.fee);if(!q.has('cash'))state.cash=Math.max(9,3*state.fee)}for(const k of ['fee','willing'])state[k]=Math.round(state[k]*4)/4;state.cash=Math.round(state.cash);for(const k of['step','table','A','B','notice','decay'])state[k]=Math.round(state[k]);state.step=Math.min(state.step,state.limit)}else for(const k of Object.keys(bounds))state[k]=Math.round(state[k]);
 const names='abcd',name=i=>i===null||i===undefined?'未定义':names[i],set=(A,n=pump?3:4)=>'{'+members(A,n).map(name).join('、')+'}',texSet=(A,n=pump?3:4)=>String.raw`\{`+members(A,n).map(name).join(',')+String.raw`\}`;
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),f=x=>typeof x==='number'?x===0?'0':Number(x.toPrecision(10)).toLocaleString('zh-CN',{maximumFractionDigits:12}):String(x);
 const numberTex=x=>f(x).replaceAll(',','');
 const select=(k,label,opts)=>`<div class="field"><label for="sd-${k}">${esc(label)}</label><select id="sd-${k}" data-sd="${k}">${Object.entries(opts).map(([v,t])=>`<option value="${v}" ${String(state[k])===v?'selected':''}>${esc(t)}</option>`).join('')}</select></div>`;
 const range=(k,label,min,max,step=1)=>`<div class="field"><label for="sd-${k}">${esc(label)} <output id="sdo-${k}">${f(state[k])}</output></label><input id="sd-${k}" data-sd="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${state[k]}" ${min===max?'disabled':''}></div>`;
 const button=(k,t)=>`<button type="button" id="sd-action-${k}" data-sd-action="${k}">${esc(t)}</button>`;
 const values=()=>[0,1,2,3].map(i=>state['v'+i]),study=()=>pump?sdPump({type:state.pump,...state,steps:state.step,decay:!!state.decay}):sdSatisficing(values(),state.threshold,sdOrders(4)[state.order],state.A);
 const maxStep=v=>pump?state.limit:mode==='satisficingrank'?3:v.interview.rows.length,controlMax=()=>pump?state.limit:mode==='satisficingrank'?3:members(state.A,4).length;
 function controls(){const focus=document.activeElement?.id,settingsOpen=$('fields').querySelector('.sd-settings')?.open,v=study();state.step=Math.min(state.step,maxStep(v));
  let html='';if(!pump){html+=`<div class="field"><label for="sd-case">选择本节概念</label><select id="sd-case" data-sd="case">${cases.map(k=>`<option value="${k}" ${mode===k?'selected':''}>${k==='satisficing'?'定义2.4 · 一位位面试':'命题2.3 · 从规则构造固定排序'}</option>`).join('')}</select></div>`;
   html+=select('A','本次实际候选菜单',{0:'空菜单（不作选择）',...Object.fromEntries(menus(4).map(A=>[A,set(A)]))})+range('threshold','够好的门槛 v*',-5,5)+select('order','固定面试顺序 O',Object.fromEntries(sdOrders(4).map((o,i)=>[i,o.map(name).join(' → ')])))+range('step',mode==='satisficing'?'已经面试了几位':'构造讲解进度',0,controlMax());
   html+='<details class="sd-settings"><summary>设置四位候选人的评分</summary>'+[0,1,2,3].map(i=>range('v'+i,'候选 '+name(i)+' 的评分 v',-4,4)).join('')+'</details>'+button('source','载入原书评分和顺序')+button('none','让所有人都没过线')+button('all','让所有人都合格');
  }else{
   html+=select('pump','从哪种换物情境开始',{cycle:'原文：a → c → b → a',menu:'原文一般构造：B与A交替'})+range('step','显示到第几次交易尝试',0,state.limit)+select('limit','观察窗口（笔数）',{2:'2笔：两菜单一圈',3:'3笔：原三项一圈',6:'6笔',12:'12笔',24:'24笔'});
   if(state.pump==='menu')html+=range('table','自主三项完整表编号',0,23)+select('A','大菜单 A',{0:'空菜单',...Object.fromEntries(menus(3).map(A=>[A,set(A)]))})+select('B','小菜单 B',{0:'空菜单',...Object.fromEntries(menus(3).map(A=>[A,set(A)]))})+button('witness','寻找当前表的一个α反例');
   html+=range('fee','第一笔收多少美元',0,5,.25)+range('willing','本页假设：第一笔最高愿付',0,5,.25)+range('cash','起始钱包（自主设定）',0,30,1)+select('notice','何时识破并停止付费（自主约定）',Object.fromEntries([[-1,'一直未识破'],[0,'开始就拒绝'],...Array.from({length:24},(_,i)=>[i+1,'完成'+(i+1)+'笔后'])]))+select('decay','后续收费与最高愿付',{0:'固定收费与愿付：本站设置',1:'每次减半：自主边界例'})+button('source','恢复原例1美元支付设定');
  }
  $('fields').innerHTML=html;if(settingsOpen&&$('fields').querySelector('.sd-settings'))$('fields').querySelector('.sd-settings').open=true;if(pump&&state.pump==='menu')$('sd-action-witness').disabled=!alphaFailures(table24(state.table),3).length;$(focus)?.focus({preventScroll:true});
 }
 function canvas(label,H=440){const W=innerWidth<650?280:640;let body='';return{W,H,add:s=>body+=s,text:(x,y,t,c='#334b40',z=16,a='middle')=>`<text x="${x}" y="${y}" fill="${c}" font-size="${z}" text-anchor="${a}">${esc(t)}</text>`,finish:()=>`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${body}</svg>`};}
 function satisPlot(v){const g=canvas('固定身份与面试顺序；评分与解释优先序分开',430),order=sdOrders(4)[state.order],x=i=>32+order.indexOf(i)*(g.W-64)/3,rank=mode==='satisficingrank',seen=v.interview.rows.slice(0,state.step).map(r=>r.candidate),finished=v.interview.valid&&state.step>=(rank?3:v.interview.rows.length);
  g.add(g.text(16,26,'按 O 面试：'+order.map(name).join(' → '),'#334b40',18,'start'));
  for(const i of order){const present=!!(state.A&(1<<i)),show=rank||seen.includes(i),current=finished&&i===v.interview.choice;
   g.add(`<rect data-motion="sd-person-${i}" x="${x(i)-27}" y="58" width="54" height="90" rx="4" opacity="${present?1:.22}" fill="${show?(values()[i]>=state.threshold?'#e3f0e6':'#eee9e3'):'#f2f4ef'}"/>`+g.text(x(i),88,name(i),'#334b40',24)+g.text(x(i),118,!present?'不在A':show?'v='+values()[i]:'未面试','#65796e',14));
   if(current)g.add(`<circle data-motion="sd-winner" cx="${x(i)}" cy="84" r="25" fill="none" stroke="#a27619" stroke-width="3"/>`);
  }
  g.add(g.text(g.W/2,182,!v.interview.valid?'空菜单：不定义 c(A)':rank?'当前菜单的规则选择：'+name(v.interview.choice):finished?(v.interview.fallback?'全没过线，选最后的':'首个够好，停在')+name(v.interview.choice):'已面试 '+seen.length+' 位；没有偷看下一位','#334b40',g.W<400?15:18));
  if(rank){g.add(g.text(16,231,state.step===0?'先按是否过线分组':state.step===1?'合格者按 O 优先':state.step===2?'不合格者按逆 O 接在后面':'对每一个菜单比较真实规则与预测','#334b40',g.W<400?14:16,'start'));
   if(state.step>=1)for(let j=0;j<4;j++){const i=v.rank[j],rx=32+j*(g.W-64)/3,good=values()[i]>=state.threshold;g.add(`<rect data-motion="sd-rank-${i}" x="${rx-25}" y="268" width="50" height="54" rx="4" fill="${good?'#e3f0e6':'#eee9e3'}" opacity="${good||state.step>=2?1:.22}"/>`+g.text(rx,302,name(i),'#334b40',23)+g.text(rx,348,'第'+(j+1), '#65796e',14));}
   g.add(g.text(g.W/2,391,'解释序按优先排列，不表示评分大小','#65796e',g.W<400?13:16));
  }else{g.add(g.text(16,245,'绿色合格；米色不合格','#65796e',g.W<400?14:16,'start')+g.text(16,276,'淡色不在菜单；金圈是选择','#65796e',g.W<400?13:16,'start'));if(finished&&v.interview.skipped.length)g.add(g.text(16,327,'后面 '+v.interview.skipped.map(name).join('、')+' 没有继续面试','#334b40',16,'start'));}
  return g.finish();
 }
 function pumpPlot(v){const g=canvas('物品身份固定；钱包曲线来自实际已执行交易',440),x=i=>40+i*(g.W-80)/2;g.add(g.text(16,26,'同一个人持有：'+name(v.held),'#334b40',19,'start'));
  for(let i=0;i<3;i++)g.add(`<circle data-motion="sd-object-${i}" cx="${x(i)}" cy="83" r="25" fill="#e7eee6"/>`+g.text(x(i),91,name(i),'#334b40',23));if(v.held!==null)g.add(`<circle data-motion="sd-holding" cx="${x(v.held)}" cy="83" r="31" fill="none" stroke="#a27619" stroke-width="3"/>`);
  const offer=v.proposal;g.add(g.text(16,145,offer.menu?'下一次菜单 '+set(offer.menu)+'；记录选 '+name(offer.to):'先找到满足条件的α反例','#65796e',g.W<400?14:17,'start'));
  const L=42,R=g.W-24,T=214,D=384,y=w=>D-w/Math.max(1,state.cash)*(D-T),px=k=>L+k/state.limit*(R-L);
  g.add(g.text(L,192,'剩余钱包（美元）','#334b40',14,'start')+`<path d="M${L} ${T}V${D}H${R}" fill="none" stroke="#a6b4aa"/>`+g.text(L-8,D+4,'0','#65796e',12,'end')+g.text(L-8,T+4,f(Math.max(1,state.cash)),'#65796e',12,'end'));
  const points=v.states.flatMap((s,i)=>i?[px(s.step)+','+y(v.states[i-1].cash),px(s.step)+','+y(s.cash)]:[px(s.step)+','+y(s.cash)]).join(' ');g.add(`<polyline data-motion="sd-wallet" points="${points}" fill="none" stroke="#177468" stroke-width="3"/>`+`<circle data-motion="sd-wallet-point" cx="${px(v.completed)}" cy="${y(v.cash)}" r="5" fill="#177468"/>`);
  const cashLabel=Number.isInteger(v.cash)?f(v.cash):'≈'+Number(v.cash.toPrecision(5)),halfWidth=cashLabel.length*5;
  g.add(g.text(L,D+23,'0','#65796e',13)+g.text(R,D+23,state.limit,'#65796e',13)+g.text(R,431,'已完成的交易次数','#334b40',14,'end')+g.text(Math.max(L+halfWidth,Math.min(R-halfWidth,px(v.completed))),Math.max(T+18,y(v.cash)-12),cashLabel,'#177468',17));return g.finish();
 }
 const stopText={'not-an-alpha-witness':'这对菜单不构成α反例，不能启动所说的两步构造','noticed-and-refuses':'已识破，按本页约定拒绝再付费','no-chosen-replacement':'没有按记录选中的新物品','not-willing-to-pay':'收费超过最高愿付，拒绝本笔','cannot-afford':'钱包不足，付不起下一笔'};
 // Each sentence describes the exact model state on screen. Keep authored
 // narration beside its model adapter, so the shared player never guesses
 // a winner, payment, or stopping condition from an animated picture.
 function narrate(v){
  let intro,phase,text,conclusion;
  if(!pump){
   const order=sdOrders(4)[state.order].map(name).join('、'),rank=mode==='satisficingrank',last=v.interview.rows[Math.min(state.step,v.interview.rows.length)-1],done=state.step>=v.interview.rows.length;
   intro=`假设你在招人，按 ${order} 的顺序看。评分至少 ${f(state.threshold)} 分就够好，等于也算。遇到第一个够好的就停；都不够好，就选最后一位。只面试这次名单里的 ${set(state.A)}。`;
   if(rank){
    intro=`假设面试顺序固定为 ${order}，门槛是 ${f(state.threshold)} 分。这套边看边停的招聘办法，能不能用一张事先排好的名单来解释？接下来评分、门槛和顺序都不变，只把选择理由整理出来。`;
    phase=['先分两组','第一组：够好的，先来先得','第二组：不够好的，倒着排','用同一张名单核对'][state.step];
    text=[`先看门槛 ${f(state.threshold)}。够好的有 ${v.good.map(name).join('、')||'零人'}；不够好的有 ${v.bad.map(name).join('、')||'零人'}。评分只用来分组。`,
     `先摆够好的这一组：${v.good.map(name).join(' → ')||'这一组为空'}。为什么先来先得？因为一遇到够好的，面试就会停，后面的人没有机会。`,
     `再接上不够好的这一组：${[...v.bad].reverse().map(name).join(' → ')||'这一组为空'}。为什么要倒过来？因为一个也没过线时，规则让我们选最后见到的。`,
     `排好后是 ${v.rank.map(name).join(' → ')}。换不同的候选名单，这张顺序也不变。下方 ${v.rows.length} 份非空名单逐一核对，规则选择与排序预测有 ${v.matched} 份一致；通用证明就在下面。`][state.step];
   }else if(!v.interview.valid){phase='先有候选人，才谈得上选择';text='名单是空的，既没有人可以面试，也没有“最后一位”。这个定义没有要求从空名单中选人。';}
   else if(!last){phase='从第一位开始';text='先别找最高分。我们只问眼前这位：有没有达到门槛？';}
   else{phase=done?'在这里停下':'还不够好，继续看';text=`第 ${state.step} 位看的是 ${name(last.candidate)}，评分 ${f(last.value)}，门槛 ${f(state.threshold)}。`+(last.satisfactory?(last.value===state.threshold?'正好压线，也算合格。':'已经过线。')+`所以现在选 ${name(last.candidate)}，停止面试。`+(v.interview.skipped.length?`后面的 ${v.interview.skipped.map(name).join('、')} 还没看，不会为了找最高分再继续。`:''):done?`一个也没过线，按规则仍要选最后见到的 ${name(v.interview.choice)}。注意，这不是从低分里挑最高分。`:'还没过线，所以现在不选，接着看名单里的下一位。');}
   conclusion=!v.interview.valid?text:rank?'记住“合格顺排，不合格倒排”。它解释的是固定评分、门槛和面试顺序下的所有非空名单；下面分“有合格者”和“没有合格者”两种情况证明。':v.interview.fallback?`这次选 ${name(v.interview.choice)}，原因是“全没过线，取最后”，不是它评分最高。规则不同，选择理由就不同。下一段把这套办法变成一张固定排序。`:`这次选 ${name(v.interview.choice)}，原因是“第一个够好”，不是“全场最高分”。早早停下，也可能被一张固定偏好排序解释；下一段就来把它排出来。`;
  }else{
   const last=v.rows.at(-1),start=name(v.route.start),cost=state.decay?'后面每次减半':'每次相同';
   intro=`你先拿着 ${start}，钱包有 ${f(state.cash)} 美元。每次按给定选择记录换物，第一笔收费 ${f(state.fee)} 美元，${cost}。我们同时盯住手里的东西和钱包；愿付、钱够不够、是否识破，都要另外检查。`;
   phase=v.completed?'第 '+v.completed+' 笔：换物，再记账':'先看手里和钱包';
   text=last?`刚才拿 ${name(last.from)}，这次面前是 ${set(last.menu)}，按选择记录换成 ${name(last.to)}。这一笔付 ${f(last.fee)} 美元，钱包从 ${f(last.cash)} 变成 ${f(last.remaining)} 美元。`+(v.returned?`东西回到最初的 ${start}，累计已经付出 ${f(v.paid)} 美元。`:`当前拿着 ${name(v.held)}；${v.cycles?'已完成 '+v.cycles+' 圈，现在又离开了起点。':'还未完成一圈。'}${v.stop?'':'接着看下一次。'}`):intro;
   if(v.stop){phase='在这里停下，不能继续扣钱';text+=(last?' 下一笔：':' ')+stopText[v.stop]+'。没有执行的交易，不记进收支账。';}
   conclusion=v.stop?`${stopText[v.stop]}。实际只完成 ${v.completed} 笔，共付 ${f(v.paid)} 美元，剩 ${f(v.cash)} 美元。循环选择不等于可以无条件一直收费。`:v.completed&&v.paid===0?`这次完成 ${v.completed} 笔，但每笔都是免费交换，钱包仍有 ${f(v.cash)} 美元。物品即使绕成一圈，也没有发生货币损失；收费条件不能省略。`:state.decay?`这次完成 ${v.completed} 笔，共付约 ${f(v.paid)} 美元。每笔费用都减半，越往后越少；总和不会超过 ${f(2*state.fee)} 美元。这是自主边界例，不是教材“每次至少愿付1美元”的假设。`:v.returned?`东西回到 ${start}，钱包却少了 ${f(v.paid)} 美元。记住：物品绕一圈，钱没有绕回来。但要继续亏钱，还得继续愿付、付得起，并且没有识破后停止。`:`这个观察窗口内完成 ${v.completed} 笔，付出 ${f(v.paid)} 美元，此刻没有停在起始物品上。先认清所处位置，不能说每一个观察窗口的末尾都刚好回到起点。`;
  }
  Object.assign($('plot').dataset,{filmIntro:intro,filmPhase:phase,filmNarration:text,filmConclusion:conclusion});
 }
 function proof(k){const p=sdProofs[k];return`<details class="sd-proof"><summary>${esc(p.title)}</summary><ol>${p.steps.map(([h,b,t])=>`<li><h4>${esc(h)}</h4><p>${esc(b)}</p><div class="equation">${esc(t)}</div></li>`).join('')}</ol></details>`;}
 const grid=(headers,rows)=>`<div class="sd-table-scroll" tabindex="0" role="region" aria-label="逐项计算记录"><table class="alpha-table"><thead><tr>${headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+row.map(x=>`<td>${esc(x)}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;
 function draw(){const open=new Set([...$('extra').querySelectorAll('details[open]')].map(d=>d.querySelector('summary').textContent)),v=study(),metrics=[];const put=(a,b)=>metrics.push([a,b]);let formula,reading,extra,legend;
  if(!pump){state.step=Math.min(state.step,maxStep(v));const src=state.threshold===0&&state.order===0&&values().every((x,i)=>x===[-1,-2,1,3][i]),finished=v.interview.valid&&state.step>=v.interview.rows.length;window.microMotion.chart($('plot'),satisPlot(v));
   put('评分与顺序来源',src?'原书四项示例':'自主改动原规则参数');put('本次面试人数',mode==='satisficing'?state.step+' / '+members(state.A,4).length:'构造序核对');put('规则最终选择',v.interview.valid?(mode==='satisficing'&&!finished?'面试完再看':name(v.interview.choice)):'空菜单不定义');put('全表同一解释序',v.matched+' / '+v.rows.length);put('全表α反例',v.alphaFailures.length);if(mode==='satisficingrank')put('当前菜单的排序预测',name(v.prediction));
   reading=mode==='satisficingrank'?'把“够好”与“不够好”分成两组：前一组越早越优先，后一组越晚越优先。这张序对所有菜单同时复现原规则；它不一定按评分v从高到低。':!v.interview.valid?'没有候选人，便没有本定义下的选择；这个空名单是用来说明定义边界的。':!state.step?'你是招聘者。按给定顺序看人，够好就停；先预测一下会不会选评分最高的人，再逐位面试。':!finished?'已看过的都没过线，继续下一位；不在菜单的人直接跳过。':v.interview.fallback?'每个人都没过线，按原定义仍要选最后面试的人。这不是选择最高分；正是这个兜底规则决定了解释序的反向尾部。':'遇到第一个达到门槛的人，已经停下；后面即使有人评分更高，也不会再面试。早停与能被固定偏好解释可以同时成立。';
   formula=mode==='satisficingrank'?v.rank.map(name).join(String.raw`\succ `)+'\n'+String.raw`X^+=${texSet(v.good.reduce((M,i)=>M|(1<<i),0))},\quad X^-=${texSet(v.bad.reduce((M,i)=>M|(1<<i),0))}`:String.raw`v^*=${state.threshold},\quad A=${texSet(state.A)}`+(finished?'\n'+String.raw`c(A)=${name(v.interview.choice)}`:'');
   const removed=members(state.A,4).find(i=>i!==v.interview.choice),small=removed===undefined?state.A:state.A&~(1<<removed),alphaUrl='lesson-2-3.html?case=alpha&n=4&A='+state.A+'&B='+small+'&phase=3&answers='+alphaEncode(v.data,4);extra='<p>评分v不是工资，也不自动是解释偏好的效用。本段固定评分、门槛和面试顺序，图中只按实际面试进度揭开评分。其他示例可以使用不同设定，不能把不同设定下的选择混成同一套记录。</p><p><a href="'+alphaUrl+'">把当前规则生成的表带到α页核对 →</a> · <a href="lesson-2-6.html?case=p3">习题2.3入口</a></p><details><summary>全部15个非空菜单的实际规则与排序预测</summary>'+grid(['菜单','满意规则','解释序预测'],v.rows.map(r=>[set(r.menu),name(r.choice),name(r.predicted)]))+'</details>'+proof('satisficing')+proof('alpha');legend='上排位置按固定面试顺序O，淡色不在菜单；颜色标是否过线，金圈为实际选择。解释序与评分大小分开。';$('boundary').textContent='Osborne–Rubinstein §2.4，印刷22—23页；原文件41—42页；有限X，固定v、v*与O，等号合格，无合格者取O中最后一项。原例与自主改值分别标注。';
  }else{window.microMotion.chart($('plot'),pumpPlot(v));put('实际执行 / 观察窗口',v.completed+' / '+state.limit);put('当前物品',name(v.held));put('累计支付（美元）',f(v.paid));put('剩余钱包（美元）',f(v.cash));put('完整循环次数',v.cycles);put('当前回到起始物品',v.completed?(v.returned?'是':'否'):'尚未交易');put('下一笔条件',v.stop?'不满足':'满足');
   reading=v.stop?stopText[v.stop]+'。'+(v.completed?'前面已执行的账保留，但不能凭空继续扣钱。':'还没有执行交换，也没有扣钱。'):!v.completed?'手里先有一个物品。老板每次摆出一份菜单，问你愿不愿意换，并收费用。先猜：物品回原处时，钱包会怎样？':v.returned?(v.paid?'物品回到起点，钱包却少了 '+f(v.paid)+' 美元。':'物品回到起点，但这次是免费交换，钱包没有减少。')+'继续重复还要逐笔检查愿付、资金和是否识破；对象循环本身没有给出这些付费条件。':'物品按真实菜单记录改变，钱只在本笔被接受且付得起时扣除。已经完成 '+v.cycles+' 次完整循环；目前没有停在起始物品上。';
   if(state.decay)reading+=' 当前收费和最高愿付都逐次减半，是撤去统一正下界的自主连续金额例；累计费用不超过 '+f(2*state.fee)+'，不是原文每步至少愿付1的设定。';
   formula=state.pump==='cycle'?String.raw`a\to c\to b\to a;\qquad W_N=W_0-\sum_{j=1}^{N}t_j`:v.route.valid?String.raw`x=c(A)=${name(v.route.start)},\quad y=c(B)=${name(v.route.data[state.B])};\qquad x\xrightarrow{B}y\xrightarrow{A}x`:String.raw`\text{先核对 }c(A)\in B\subsetneq A,\quad c(B)\ne c(A)`;
   const relation=state.decay?String.raw`\approx`:'=';formula+='\n'+String.raw`N=${v.completed},\quad\sum_{j=1}^{N}t_j${relation}${numberTex(v.paid)},\quad W_N${relation}${numberTex(v.cash)}`;
   extra='<p>原文给出的三条二选一记录不包含全菜单答案。一般两步情境用自主完整表演示，按整份B、整份A选择；不能偷偷缩成同一个二选一。最高愿付、等号接受、有限钱包与识破后停止是本页显式设置，不由无偿换物记录推出。本页先按对象记录选出想换的物品，再额外检查带钱交易的愿付与资金。小数显示会四舍五入，原计算保留精度。不同示例使用各自独立的起始条件，账目不能跨示例相加。</p>'+(state.pump==='menu'?'<p>当前A='+esc(set(state.A))+'、B='+esc(set(state.B))+'；这对是否是α反例：'+(v.route.valid?'是':'否')+'。这里检查的是当前这一对菜单；不能仅因选择表不能理性化，就宣布任意一对菜单都能启动。</p>':'')+'<details><summary>逐笔菜单、换物与收支账</summary>'+grid(['笔数','整份菜单','换物','收费','最高愿付','剩余'],v.rows.map(r=>[r.step,set(r.menu),name(r.from)+' → '+name(r.to),f(r.fee),f(r.willing),f(r.remaining)]))+'</details>'+proof('pump');legend='金圈跟随同一个人的持有物；a、b、c身份位置固定。下图横轴为已执行交易次数，纵轴为剩余美元，零点不变；窗口选择明确改变横轴范围。';$('boundary').textContent='Osborne–Rubinstein §2.5，印刷23—24页；原文件42—43页。原三笔1美元循环与一般α反例构造均保留；持续付费、资金、未察觉与金额下界需单独说明。下降愿付等为自主边界例，不视作仅由选择函数推出。';
  }
  narrate(v);$('metrics').innerHTML=metrics.map(([k,x])=>`<div class="metric"><label>${esc(k)}</label><strong>${esc(x)}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('extra').innerHTML=extra;$('legend').textContent=legend;for(const d of $('extra').querySelectorAll('details'))if(open.has(d.querySelector('summary').textContent))d.open=true;
  const limit=maxStep(v),disabled=state.step>=limit||(pump&&!v.proposal.allowed)||(!pump&&limit===0);$('advance').disabled=disabled;$('play').disabled=disabled&&!timer;for(const[k,x]of Object.entries(state)){const el=$('sd-'+k);if(el){el.value=x;if(k==='step')el.max=controlMax()}if($('sdo-'+k))$('sdo-'+k).textContent=f(x)}$('plot').tabIndex=-1;$('plot').setAttribute('role','region');$('plot').setAttribute('aria-label',pump?'换物与钱包记录':'面试、停止与固定解释序');window.microMath?.refresh();sync();
 }
 function sync(){try{const u=new URL(location.href);u.search='';u.searchParams.set('case',mode);for(const[k,x]of Object.entries(state))u.searchParams.set(k,x);history.replaceState(null,'',u)}catch{}const a=document.querySelector('.lesson-end a[download]');if(a){const preset=(window.SD_DOWNLOADS||[]).find(v=>v.mode===mode&&Object.entries({...defaults,...v.initial}).every(([k,x])=>k==='step'||state[k]===x)),fallback=pump?(state.pump==='menu'?'menu':'cycle'):mode;a.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch2-sequential-'+(preset?.name||fallback)+'.html';a.textContent=preset?'下载本段独立代码 ↓':'下载本类基础示例 ↓';a.title=preset?'包含本段的情境设定，打开后从头讲解':'自定义参数保留在本页地址中；此文件是本类的基础示例';}}
 function stop(){clearInterval(timer);timer=null;$('play').textContent=pump?'逐笔尝试':mode==='satisficing'?'逐位面试':'分步构造';const v=study();$('play').disabled=state.step>=maxStep(v)||(pump&&!v.proposal.allowed);}
 function refresh(){controls();draw();}
 function advance(){const v=study();if(state.step>=maxStep(v)||(pump&&!v.proposal.allowed))return true;state.step++;refresh();const next=study();return state.step>=maxStep(next)||(pump&&!next.proposal.allowed);}
 $('fields').addEventListener('input',e=>{const k=e.target.dataset.sd;if(e.target.type!=='range')return;stop();state[k]=Number(e.target.value);if(k!=='step')state.step=0;draw();});
 $('fields').addEventListener('change',e=>{const k=e.target.dataset.sd;if(!k||e.target.type==='range')return;stop();if(k==='case'){mode=e.target.value;state.step=0}else{state[k]=k==='pump'?e.target.value:Number(e.target.value);if(k==='limit')state.step=Math.min(state.step,state.limit);else state.step=0;}refresh();});
 $('fields').addEventListener('click',e=>{const action=e.target.closest('[data-sd-action]')?.dataset.sdAction;if(!action)return;stop();if(action==='source'){state={...defaults};}else if(action==='none'){state.threshold=5;state.step=0}else if(action==='all'){state.threshold=-5;state.step=0}else if(action==='witness'){const bad=alphaFailures(table24(state.table),3)[0];if(bad){state.A=bad.A;state.B=bad.B;state.step=0}}refresh();$('sd-action-'+action)?.focus({preventScroll:true});});
 $('advance').onclick=()=>{stop();return advance()};$('reset').onclick=()=>{stop();state.step=0;refresh()};$('play').onclick=()=>{if(timer){stop();return}if(advance()||window.microMotion.reduced.matches){stop();return}timer=setInterval(()=>{if(advance())stop()},1700);$('play').textContent='暂停';};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',stop);window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',draw);$('reset').textContent='重看过程（保留设定）';$('fields').closest('aside').querySelector('h2').textContent=pump?'物品兜一圈，钱去了哪里':'够好了，就停下来';$('fields').closest('aside').querySelector('p').textContent=pump?'先选换物情境，再逐项改变支付条件。':'先预测会选谁，再逐位面试。';$('extra').addEventListener('toggle',()=>window.microMath?.refresh(),true);refresh();stop();
}

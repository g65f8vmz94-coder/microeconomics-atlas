import {allais} from './uncertainty.mjs';
import {allaisStories,allaisFrame,allaisReadout} from './allais-story.mjs';

const alEl=id=>document.getElementById(id);
const alColors=['#c35f43','#7a6594','#177468'];
const alInk='#334b40',alMuted='#65796e',alRule='#cbd7cf',alPale='#edf2ec',alGold='#a27619';
const alEsc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const alNum=(n,d=2)=>Number(Number(n).toFixed(d)).toString();
const alText=(x,y,s,size=14,color=alInk,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${alEsc(s)}</text>`;
const alLine=(a,b,c,d,color=alRule,width=1,dash='')=>`<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash?`stroke-dasharray="${dash}"`:''}/>`;

function alRow(p,name,y,W,small,key,highlightCommon=false){
 const left=small?40:64,width=W-left-(small?18:36);
 let out=alText(left-8,y+18,name,small?12:14,alInk,'end');
 out+=`<rect x="${left}" y="${y}" width="${width}" height="26" rx="6" fill="${alPale}"/>`;
 let x=left;
 p.forEach((v,i)=>{
  const w=width*v;
  out+=`<rect data-motion="al-${key}-${i}" x="${x}" y="${y}" width="${Math.max(.1,w)}" height="26" fill="${alColors[i]}" opacity=".88"/>`;
  if(w>36)out+=alText(x+w/2,y+18,`${alNum(v*100,0)}%`,small?10:12,'#fffdf7','middle');
  x+=w;
 });
 if(highlightCommon){
  const commonW=width*.75;
  out+=`<rect x="${left}" y="${y-2}" width="${commonW}" height="30" rx="5" fill="none" stroke="${alGold}" stroke-width="2" stroke-dasharray="4 3"/>`;
 }
 return out;
}

function alChart(frame,readout,small){
 const W=small?320:700,H=small?455:425,left=small?40:64,right=W-(small?18:36);
 const highlightCommon=['decompose','eu-same','eu-r'].includes(frame.focus);
 let svg=alText(W/2,26,highlightCommon?'金框标出共同混入的 75% [$0] 分支：独立性要求上下两组同向':'Allais 四张彩票在 {$0, $3000, $4000} 上的概率分布',small?11:15,alInk,'middle');

 svg+=alText(left,52,'问题一（低概率区：L₁ = 0.25L₂ ⊕ 0.75[$0]，R₁ = 0.25R₂ ⊕ 0.75[$0]）',small?10:12,alMuted);
 svg+=alRow(allais.L1,'L₁',60,W,small,'L1',highlightCommon);
 svg+=alRow(allais.R1,'R₁',94,W,small,'R1',highlightCommon);

 svg+=alText(left,146,'问题二（高概率/确定性区：L₂ 对比 100% 确定得 $3,000 的 R₂）',small?10:12,alMuted);
 svg+=alRow(allais.L2,'L₂',154,W,small,'L2',false);
 svg+=alRow(allais.R2,'R₂',188,W,small,'R2',false);

 if(highlightCommon){
  svg+=alText((left+left+(right-left)*.75)/2,130,'共同背景分支：0.75 · [$0]（独立性下相消）',small?10:12,alGold,'middle');
 }

 // Bottom panel: joint response matrix & EU comparison bar
 const boxTop=238,boxH=124,midX=small?162:350;
 svg+=`<rect x="${small?16:36}" y="${boxTop}" width="${W-(small?32:72)}" height="${boxH}" rx="8" fill="#f7f9f4" stroke="${alRule}"/>`;
 svg+=alText(small?88:190,boxTop+22,'教材 7,932 人联合选择表',small?11:13,alInk,'middle');
 svg+=alText(small?68:145,boxTop+44,'L₂',small?11:12,alMuted,'middle')+alText(small?124:235,boxTop+44,'R₂',small?11:12,alMuted,'middle');
 svg+=alText(small?34:90,boxTop+70,'L₁',small?11:12,alMuted,'middle');
 svg+=alText(small?68:145,boxTop+70,'20% (EU)',small?11:12,'#177468','middle');
 svg+=alText(small?124:235,boxTop+70,'44% (悖论)',small?11:12,alGold,'middle');
 svg+=alText(small?34:90,boxTop+98,'R₁',small?11:12,alMuted,'middle');
 svg+=alText(small?68:145,boxTop+98,'5% (悖论)',small?11:12,'#c35f43','middle');
 svg+=alText(small?124:235,boxTop+98,'31% (EU)',small?11:12,'#177468','middle');

 svg+=alLine(midX,boxTop+12,midX,boxTop+boxH-12,alRule,1);
 const rightCenter=(midX+W-(small?16:36))/2;
 svg+=alText(rightCenter,boxTop+22,`期望效用检验 (设 v($3000)=${alNum(frame.v3000,2)})`,small?11:13,alInk,'middle');
 svg+=alText(rightCenter,boxTop+50,`问题一：U(L₁)=${alNum(readout.uL1,4)} ${readout.rel1} U(R₁)=${alNum(readout.uR1,4)}`,small?10:12,'#177468','middle');
 svg+=alText(rightCenter,boxTop+76,`问题二：U(L₂)=${alNum(readout.uL2,4)} ${readout.rel2} U(R₂)=${alNum(readout.uR2,4)}`,small?10:12,'#7a6594','middle');
 svg+=alText(rightCenter,boxTop+102,`差值关系：U(L₁)−U(R₁) = 0.25 × [U(L₂)−U(R₂)]`,small?10:12,alGold,'middle');

 const legendY=small?436:406;
 allaisStories.allais.labels.forEach((label,i)=>{
  const x=(i+.5)*W/3;
  svg+=`<rect x="${x-38}" y="${legendY-10}" width="9" height="9" fill="${alColors[i]}"/>`;
  svg+=alText(x-24,legendY-1,label,small?10:12,alMuted);
 });
 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alEsc(frame.title)}；L1与R1关系 ${readout.rel1}；L2与R2关系 ${readout.rel2}">${svg}</svg>`;
}

const allaisProof=String.raw`<details class="sd-proof" open><summary>做题：怎样检验这两次选择是否违反独立性？</summary><ol>
<li><strong>先写题目：</strong>第一题在低概率的 L₁ 和 R₁ 之间选；第二题在 L₂ 和确定拿到3000美元的 R₂ 之间选。先把四张彩票的中奖概率写全。<div class="equation">L_1=0.2[4000]\oplus0.8[0],\quad R_1=0.25[3000]\oplus0.75[0]</div><div class="equation">L_2=0.8[4000]\oplus0.2[0],\quad R_2=[3000]</div></li>
<li><strong>找共同部分：</strong>第一题两张票都是把第二题对应的票保留25%，再混入75%的零奖金。<div class="equation">L_1=0.25L_2\oplus0.75[0],\quad R_1=0.25R_2\oplus0.75[0]</div></li>
<li><strong>用独立性：</strong>两边混入相同的彩票，不应改变排序。因此，若偏好满足独立性，第一题和第二题对左、右的排序应相同。用期望效用也能看到：<div class="equation">U(L_1)-U(R_1)=0.25\bigl(U(L_2)-U(R_2)\bigr)</div>正数乘以0.25不会变负数；选左边的 L₁ 又选右边的 R₂，方向就矛盾。</li>
<li><strong>解释结果，留意范围：</strong>书中44%的人选了 L₁ 和 R₂，这组回答与独立性冲突。书中提出对确定性的重视以及对低概率差异的感受，作为可能的解释；回答比例本身不能证明这些心理原因。另有51%的回答在这两题上同向，但两题不够证明一个人的全部偏好都符合期望效用。</li>
</ol></details>`;

export function renderAllaisStory(mode,phase){
 const story=allaisStories[mode],frame=allaisFrame(mode,phase),readout=allaisReadout(frame),small=alEl('plot').clientWidth<500;
 const plot=alEl('plot');
 let context=alEl('allais-situation');
 if(!context){context=document.createElement('section');context.id='allais-situation';context.setAttribute('aria-label','抽奖条件与问题');alEl('legend').before(context);}
 const situation='<p class="reading"><strong>第一题：</strong>选 L₁：20%机会得4000美元，否则得零；或选 R₁：25%机会得3000美元，否则得零。</p><p class="reading"><strong>第二题：</strong>选 L₂：80%机会得4000美元，否则得零；或选 R₂：确定得到3000美元。</p><p class="reading"><strong>这张图要回答：</strong>如果第一题选 L₁、第二题却选 R₂，为什么和独立性公理冲突？先看每张票的概率，再找两题之间共同的零奖金部分。概率与历史回答比例来自教材，自主讲解用于辅助理解。</p>';
 if(context.dataset.signature!==situation){context.dataset.signature=situation;context.innerHTML=situation;}

 Object.assign(plot.dataset,{filmIntro:story.intro,filmPhase:frame.title,filmNarration:frame.narration,filmConclusion:story.end,phase:String(phase)});
 window.microMotion.chart(plot,alChart(frame,readout,small));
 alEl('legend').textContent='红、紫、绿分别对应 $0、$3,000、$4,000 的真实概率份额；金色虚线框标出第一组共同掺入的 75% [$0] 分支。';
 const metrics=[
  ['当前画面',`${phase+1} / ${story.frames.length}`],
  ['同向（这两题相容）',`${readout.consistent}%（L₁L₂ 20% + R₁R₂ 31%）`],
  ['反向（这两题冲突）',`${readout.paradox}%（L₁R₂ 44% + R₁L₂ 5%）`]
 ];
 alEl('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${alEsc(k)}</label><strong>${alEsc(v)}</strong></div>`).join('');
 alEl('reading').textContent=frame.narration;
 alEl('formula').textContent=frame.formula;
 alEl('boundary').textContent=`Osborne–Rubinstein §3.4，印刷38—39页／PDF57—58。${frame.source}。7,932 名学生的联合回答比例引自原书报告的在线实验，不属于本站采集或当前读者统计。第39页下方起进入§3.5风险厌恶。`;
 alEl('extra').innerHTML=allaisProof;
 alEl('step').value=phase;alEl('advance').disabled=phase>=story.frames.length-1;alEl('play').disabled=phase>=story.frames.length-1;
 const link=document.querySelector('.lesson-end a[download]');
 if(link){link.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch3-allais.html`;link.textContent='下载本段完整动画代码 ↓';}
 window.microMath?.refresh();
 return {mode,phase,readout};
}

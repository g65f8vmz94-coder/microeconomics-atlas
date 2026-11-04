import {preferenceStories,preferenceFrame,preferenceReadout} from './preference-story.mjs';

const prefEl=id=>document.getElementById(id);
const prefColors=['#177468','#7a6594','#a27619'];
const prefInk='#334b40',prefMuted='#65796e',prefRule='#cbd7cf',prefPale='#edf2ec';
const prefEsc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const prefNum=n=>n===.001||n===.999?Number(n).toFixed(3):Number(Number(n).toFixed(3)).toString();
const prefText=(x,y,s,size=15,color=prefInk,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${prefEsc(s)}</text>`;
const prefLine=(a,b,c,d,color=prefRule,width=1)=>`<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none"/>`;

function prefBar(p,row,W,small,labels,key){
 const left=small?25:47,width=W-left*2,top=row.y;
 let result=prefText(left,top-13,row.title,small?14:16,prefInk)+prefText(W-left,top-13,`(${p.map(prefNum).join('，')})`,small?12:14,prefMuted,'end');
 result+=`<rect x="${left}" y="${top}" width="${width}" height="29" rx="7" fill="${prefPale}"/>`;
 let x=left;
 p.forEach((prob,i)=>{
  const w=width*prob;
  result+=`<rect data-motion="pref-${key}-${i}" x="${x}" y="${top}" width="${w}" height="29" fill="${prefColors[i]}"/>`;
  if(prob>0&&prob<.005)result+=prefLine(x+w,top-6,x+w,top+36,'#a27619',2);
  x+=w;
 });
 result+=prefLine(left,top+43,W-left,top+43)+prefText(left,top+61,'0',small?11:12,prefMuted)+prefText(W-left,top+61,'1',small?11:12,prefMuted,'end');
 return result;
}

function prefChart(mode,frame,readout,small){
 const W=small?320:700,compound=mode==='compound',H=compound?(small?555:490):(small?390:350);
 const story=preferenceStories[mode],labels=story.labels,first=small?90:92,second=small?215:208;
 let body=prefText(W/2,30,compound?'先选盒子，再把路径合并':'同一组奖品上的两张彩票',small?15:18,prefInk,'middle');
 const pTitle=compound?`先选 p：${prefNum(frame.alpha*100)}%`:'甲票 p';
 const qTitle=compound?`先选 q：${prefNum((1-frame.alpha)*100)}%`:'乙票 q';
 body+=prefBar(frame.p,{y:first,title:pTitle},W,small,labels,'p');
 body+=prefBar(frame.q,{y:second,title:qTitle},W,small,labels,'q');
 if(compound){
  const third=small?360:338;
  const mid=W/2;
  body+=prefLine(W*.36,second+76,mid,third-28,prefRule,1.5)+prefLine(W*.64,second+76,mid,third-28,prefRule,1.5);
  body+=prefBar(readout.values,{y:third,title:'最后真正得到的分布'},W,small,labels,'final');
  body+=prefText(mid,small?500:460,`路径合并：(${readout.values.map(prefNum).join('，')})`,small?13:15,'#177468','middle');
 }else{
  const relation=readout.relation||'∼';
  body+=prefText(W/2,small?315:313,`按此规则：甲 ${relation} 乙`,small?15:17,relation==='≺'?'#a27619':'#177468','middle');
 }
 const legendY=compound?(small?542:483):(small?368:340);
 labels.forEach((label,i)=>{
  const x=(i+.5)*W/3;
  body+=`<rect x="${x-43}" y="${legendY-10}" width="9" height="9" fill="${prefColors[i]}"/>`;
  body+=prefText(x-28,legendY-1,label,small?11:12,prefMuted);
 });
 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${prefEsc(frame.title)}；甲票 ${frame.p.map(prefNum).join('、')}；乙票 ${frame.q.map(prefNum).join('、')}${compound?'；最终'+readout.values.map(prefNum).join('、'):''}">${body}</svg>`;
}

const prefProofs={
 pessimist:String.raw`<details class="sd-proof" open><summary>做题：先找最差的正概率奖品</summary><ol><li>按确定奖品排出好坏，再逐张票列出严格正概率的奖品。</li><li>每张票只取支撑集里的最差奖品，比较这两个最差奖品；基础规则不比较最差奖品的概率大小。</li><li>反例：让坏奖品概率趋近零，仍未等于零；连续性在此跳变。独立性反例用原书的 0.6a+0.4b 与 [b]。</li></ol></details>`,
 goodbad:String.raw`<details class="sd-proof" open><summary>做题：证明好坏规则满足独立性</summary><ol><li>固定“好”集合，先算每张票落入好集合的总概率 G。</li><li>给两张票加入同一分支，公共项相减抵消：<div class="equation">G(P)-G(Q)=\alpha_k\bigl(G(p)-G(q)\bigr)</div></li><li>替换分支权重严格为正时，乘法保留差的符号。若权重为零，不能做逆向推论。</li></ol></details>`,
 support:String.raw`<details class="sd-proof" open><summary>做题：只数“可能”，别数概率大小</summary><ol><li>列出所有严格正概率的奖品；零概率删除，小正数保留。</li><li>比较支撑集成员数；越少越好。</li><li>独立性反例：确定 a 与确定 b 都只含一种结果，本来无差异；共同掺入 b 后，一边多出一个可能结果。</li></ol></details>`,
 continuity:String.raw`<details class="sd-proof" open><summary>做题：连续性先查前提，再找内部点</summary><ol><li>只有存在三个严格排序的确定奖品 <span class="equation">[a]\succ[b]\succ[c]</span> 才触发定义。</li><li>检查是否存在 <span class="equation">0<\alpha<1</span>，使中等确定奖品与好、差混合彩票无差异。</li><li>本站线性评分例子可解 <span class="equation">\alpha=(6-2)/(10-2)=0.5</span>；一般定义不预设这组数。悲观者没有内部点；两级规则是前提空真。</li></ol></details>`,
 compound:String.raw`<details class="sd-proof" open><summary>做题：沿路径乘，再按奖品加</summary><ol><li>检查第一层盒子权重非负且合计为一；每个盒子自己的奖品概率也要合计为一。</li><li>对每个奖品 z，把“先走盒子 k，后走奖品 z”的联合概率相加：<div class="equation">P(z)=\sum_{k=1}^{K}\alpha_kp_k(z)</div></li><li>最后再检查每项非负、所有奖品合计为一。不要把奖品 W、D、L 的标签当作可加的数字。</li></ol></details>`,
 independence:String.raw`<details class="sd-proof" open><summary>做题：保留共同分支，核对被替换分支</summary><ol><li>标出两张票唯一不同的那个分支与其权重；其他分支必须完全相同。把被替换的分支记为 r，把替换前后整张票记为 P、Q。</li><li>先比较替换前后的分支，再比较整张票；独立性要求两个比较等价：<div class="equation">[z_k]\succeq r\quad\Longleftrightarrow\quad P\succeq Q</div></li><li>正权重使逆向成立。教材第35页证明用 <span class="equation">\alpha_k>0</span>；若权重为零，整张票根本看不到这一支，不能倒推原分支排序。</li></ol></details>`,
 monotonic:String.raw`<details class="sd-proof" open><summary>证明模板：独立性推出两奖品单调</summary><ol><li>设 <span class="equation">[a]\succ[b]</span> 且 <span class="equation">0\le\beta<\alpha\le1</span>，记 <span class="equation">p_\alpha=\alpha[a]+(1-\alpha)[b]</span>。</li><li>先用独立性得到 <span class="equation">p_\alpha\succ[b]</span>。若 β=0，这已经是所需结论。</li><li>若 <span class="equation">0<\beta<\alpha</span>，再用正权重 <span class="equation">\beta/\alpha</span> 混合两边：左侧仍为 pα，右侧压平后是 pβ。α=β 是同一票；反向用交换 α、β 得到。</li></ol></details>`
};

export function renderPreferenceStory(mode,phase){
 const story=preferenceStories[mode],frame=preferenceFrame(mode,phase),readout=preferenceReadout(frame),small=prefEl('plot').clientWidth<500;
 const plot=prefEl('plot');
 Object.assign(plot.dataset,{filmIntro:story.intro,filmPhase:frame.title,filmNarration:frame.narration,filmConclusion:story.end,phase:String(phase)});
 window.microMotion.chart(plot,prefChart(mode,frame,readout,small));
 prefEl('legend').textContent=mode==='compound'?'每段柱长按真实概率绘制；两条路径的概率相加，得到同一组奖品上的最终彩票。':'柱长按真实概率绘制；始终比较同一组奖品。极小正概率有定位线，但没有被放大。';
 const displayScore=value=>readout.kind==='worst'?({1:'差 c',2:'中 b',3:'好 a'}[value]):readout.kind==='good'||readout.kind==='monotonic'?`${prefNum(value*100)}%`:prefNum(value);
 const metrics=readout.kind==='compound'?[['当前画面',`${phase+1} / ${story.frames.length}`],['先走 p',`${prefNum(frame.alpha*100)}%`],['最终 W、D、L',`(${readout.values.map(prefNum).join('，')})`]]:[['当前画面',`${phase+1} / ${story.frames.length}`],[readout.kind==='worst'?'最差奖品':readout.kind==='support'?'可能结果数':readout.kind==='linear'?'示例评分':readout.kind==='monotonic'?'a 的概率':'好结果概率',`甲 ${displayScore(readout.left)}；乙 ${displayScore(readout.right)}`],['按当前规则',`甲 ${readout.relation} 乙`]];
 prefEl('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${prefEsc(k)}</label><strong>${prefEsc(v)}</strong></div>`).join('');
 prefEl('reading').textContent=frame.narration;
 prefEl('formula').textContent=frame.formula;
 prefEl('boundary').textContent=`Osborne–Rubinstein §3.2，印刷32—35页／PDF51—54。${frame.source}。图示的购物、天气、评分与阶段概率若非原书数值，均已标注为自主情境。独立性涉及替换分支时按正权重理解；零权重边界另作校准。第35页下方起进入§3.3。`;
 prefEl('extra').innerHTML=prefProofs[mode];
 prefEl('step').value=phase;prefEl('advance').disabled=phase>=story.frames.length-1;prefEl('play').disabled=phase>=story.frames.length-1;
 const link=document.querySelector('.lesson-end a[download]');
 if(link){link.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch3-pref-${mode}.html`;link.textContent='下载本段完整动画代码 ↓';}
 window.microMath?.refresh();
 return {mode,phase,readout};
}

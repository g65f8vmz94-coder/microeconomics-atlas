import {euStories,euFrame,euReadout} from './eu-story.mjs';

const euEl=id=>document.getElementById(id);
const euColors=['#177468','#7a6594','#a27619'];
const euInk='#334b40',euMuted='#65796e',euRule='#cbd7cf',euPale='#edf2ec';
const euEsc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const euNum=n=>Number(Number(n).toFixed(3)).toString();
const euText=(x,y,s,size=15,color=euInk,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${euEsc(s)}</text>`;
const euLine=(a,b,c,d,color=euRule,width=1,dash='')=>`<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash?`stroke-dasharray="${dash}"`:''}/>`;

function euProbBar(p,row,W,small,key){
 const left=small?24:46,width=W-left*2,top=row.y;
 let result=euText(left,top-11,row.title,small?13:15,euInk)+euText(W-left,top-11,`(${p.map(euNum).join('，')})`,small?11:13,euMuted,'end');
 result+=`<rect x="${left}" y="${top}" width="${width}" height="24" rx="6" fill="${euPale}"/>`;
 let x=left;
 p.forEach((prob,i)=>{
  const w=width*prob;
  result+=`<rect data-motion="eu-${key}-${i}" x="${x}" y="${top}" width="${w}" height="24" fill="${euColors[i]}"/>`;
  x+=w;
 });
 return result;
}

function euChart(mode,frame,readout,small){
 const W=small?320:700,H=small?435:405,left=small?26:48,right=W-left,span=right-left;
 const story=euStories[mode],labels=story.labels;
 const titleMap={
  eu:'两张彩票的概率分布与期望效用刻度',
  euimplies:'期望效用 → 连续性权重与独立性同支比较',
  eurep:'把任意多奖品彩票折算到 M/m 二元标准尺',
  affine:'伯努利函数的刻度变换与彩票排序对照'
 };
 let body=euText(W/2,28,titleMap[mode],small?13:17,euInk,'middle');
 body+=euProbBar(frame.p,{y:small?72:74,title:`甲票 p · U(p)=${euNum(readout.left)}`},W,small,'p');
 body+=euProbBar(frame.q,{y:small?148:150,title:`乙票 q · U(q)=${euNum(readout.right)}`},W,small,'q');

 const vMin=Math.min(...frame.v,readout.left,readout.right),vMax=Math.max(...frame.v,readout.left,readout.right);
 const flat=Math.abs(vMax-vMin)<1e-9;
 const xOf=val=>flat?(left+right)/2:left+((val-vMin)/(vMax-vMin))*span;
 const axisY=small?262:260,pY=axisY-22,qY=axisY+24;

 body+=euText(W/2,axisY-48,flat?'所有奖品伯努利数相等：期望效用刻度坍缩为同一点':'同一期望效用刻度轴：圆点位置 = ∑ p(z)v(z)',small?11:13,euMuted,'middle');
 body+=euLine(left,axisY,right,axisY,euRule,2);
 frame.v.forEach((vv,i)=>{
  const vx=xOf(vv);
  body+=euLine(vx,axisY-7,vx,axisY+7,euColors[i],2);
  if(!flat&&(i!==1||(Math.abs(vx-xOf(frame.v[0]))>28&&Math.abs(vx-xOf(frame.v[2]))>28))){
   body+=euText(vx,axisY+48,`v=${euNum(vv)}`,small?10:11,euColors[i],'middle');
  }
 });
 const px=xOf(readout.left),qx=xOf(readout.right);
 body+=euLine(px,pY,px,axisY,'#177468',1.5,'3 3')+euLine(qx,qY,qx,axisY,'#7a6594',1.5,'3 3');
 body+=`<circle data-motion="eu-axis-p" cx="${px}" cy="${pY}" r="7" fill="#177468" stroke="#fffdf7" stroke-width="2.5"/>`;
 body+=`<circle data-motion="eu-axis-q" cx="${qx}" cy="${qY}" r="7" fill="#7a6594" stroke="#fffdf7" stroke-width="2.5"/>`;
 body+=euText(Math.min(right-24,Math.max(left+24,px)),pY-11,`U(p)=${euNum(readout.left)}`,small?11:12,'#177468','middle');
 body+=euText(Math.min(right-24,Math.max(left+24,qx)),qY+20,`U(q)=${euNum(readout.right)}`,small?11:12,'#7a6594','middle');

 const relColor=readout.relation==='≺'?'#a27619':'#177468';
 body+=euText(W/2,small?356:344,`比较结果：U(p) = ${euNum(readout.left)} ， U(q) = ${euNum(readout.right)}  ⇒  甲 ${readout.relation} 乙`,small?12:15,relColor,'middle');

 const legendY=small?412:385;
 labels.forEach((label,i)=>{
  const x=(i+.5)*W/3;
  body+=`<rect x="${x-(small?46:58)}" y="${legendY-10}" width="9" height="9" fill="${euColors[i]}"/>`;
  body+=euText(x-(small?33:44),legendY-1,`${label} (${euNum(frame.v[i])})`,small?10:12,euMuted);
 });
 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${euEsc(frame.title)}；甲票效用 ${euNum(readout.left)}；乙票效用 ${euNum(readout.right)}；结论 甲 ${readout.relation} 乙">${body}</svg>`;
}

const euProofs={
 eu:String.raw`<details class="sd-proof" open><summary>做题模板：三步写出期望效用表示</summary><ol><li>先区分两个定义域：伯努利函数 <span class="equation">v:Z\to\mathbb{R}</span> 定义在确定奖品上，期望效用 <span class="equation">U:L(Z)\to\mathbb{R}</span> 定义在彩票上。</li><li>对退化彩票必有 <span class="equation">U([z])=v(z)</span>；对一般彩票按正概率支撑集加权求和：<div class="equation">U(p)=\sum_{z\in Z}p(z)v(z)</div></li><li>切忌把 <span class="equation">\sum_{z\in Z}p(z)v(z)</span> 误写成 <span class="equation">v\bigl(\sum_{z\in Z}p(z)z\bigr)</span>；奖品甚至不必是货币金额。</li></ol></details>`,
 euimplies:String.raw`<details class="sd-proof" open><summary>证明模板：命题3.1（期望效用 ⇒ 连续性与独立性）</summary><ol><li><strong>连续性</strong>：设 <span class="equation">[a]\succ[b]\succ[c]</span>，则 <span class="equation">v(a)>v(b)>v(c)</span>。令 <div class="equation">\alpha=\frac{v(b)-v(c)}{v(a)-v(c)}\in(0,1)</div> 则 <span class="equation">U(\alpha\cdot a\oplus(1-\alpha)\cdot c)=\alpha v(a)+(1-\alpha)v(c)=v(b)=U([b])</span>，故 <span class="equation">\alpha\cdot a\oplus(1-\alpha)\cdot c\sim[b]</span>。</li><li><strong>独立性</strong>：比较仅第 <span class="equation">k</span> 支不同的两张复合彩票，展开 <span class="equation">U</span> 后两边相同的公共项 <span class="equation">\sum_{j\ne k}\alpha_j v(z_j)</span> 相减消去。</li><li>利用正权重 <span class="equation">\alpha_k>0</span> 同除两边，得 <span class="equation">\alpha_k v(z_k)\ge \alpha_k(\beta v(a)+(1-\beta)v(b))\iff v(z_k)\ge \beta v(a)+(1-\beta)v(b)</span>。若 <span class="equation">\alpha_k=0</span>，不可做逆向除法。</li></ol></details>`,
 eurep:String.raw`<details class="sd-proof" open><summary>证明模板：命题3.2（有限奖品集上 连续性+独立性 ⇒ 期望效用）</summary><ol><li><strong>排好纯奖品</strong>：令 <span class="equation">[z_1]\succeq\cdots\succeq[z_K]</span>，记最好奖品 <span class="equation">M=z_1</span>、最差奖品 <span class="equation">m=z_K</span>。</li><li><strong>主情形 <span class="equation">[M]\succ[m]</span></strong>：对每个 <span class="equation">z_k</span>，由连续性存在、由引理3.1（单调性）唯一存在 <span class="equation">v(z_k)\in[0,1]</span> 使 <span class="equation">[z_k]\sim v(z_k)\cdot M\oplus(1-v(z_k))\cdot m</span>。</li><li><strong>连续用 <span class="equation">K</span> 次独立性并压平</strong>：将任意彩票 <span class="equation">p</span> 中的每项 <span class="equation">z_k</span> 替换为上述二元彩票，压平得 <div class="equation">p\sim\Bigl(\sum_{k=1}^K p(z_k)v(z_k)\Bigr)\cdot M\oplus\Bigl(1-\sum_{k=1}^K p(z_k)v(z_k)\Bigr)\cdot m</div> 再由引理3.1知比较 <span class="equation">p,q</span> 等价于比较 <span class="equation">\sum_k p(z_k)v(z_k)</span>。</li><li><strong>莫漏边界情形 <span class="equation">[M]\sim[m]</span></strong>：由独立性知所有彩票均与 <span class="equation">[M]</span> 无差异，取 <span class="equation">v(z_k)=0</span> 即得常数表示 <span class="equation">U(p)=0</span>。</li></ol></details>`,
 affine:String.raw`<details class="sd-proof" open><summary>做题模板：正仿射唯一性与非线性反例</summary><ol><li>若 <span class="equation">w(z)=\alpha v(z)+\beta</span>（<span class="equation">\alpha>0</span>），利用 <span class="equation">\sum_{z\in Z}p(z)=1</span> 得：<div class="equation">\tilde U(p)=\sum_{z\in Z}p(z)\bigl(\alpha v(z)+\beta\bigr)=\alpha U(p)+\beta</div> 因 <span class="equation">\alpha>0</span>，对任意彩票都有 <span class="equation">\tilde U(p)\ge\tilde U(q)\iff U(p)\ge U(q)</span>。</li><li>逆命题同样成立：表示同一偏好的两个伯努利函数必相差一个正仿射变换。</li><li>与第1章序数效用对比：严格递增的非线性变换（如平方、立方、指数）虽保持确定奖品排序，但改变了效用差的比例 <span class="equation">(v(b)-v(c))/(v(a)-v(c))</span>，从而会改变无差异混合概率并翻转彩票排序。</li></ol></details>`
};

export function renderEuStory(mode,phase){
 const story=euStories[mode],frame=euFrame(mode,phase),readout=euReadout(frame),small=euEl('plot').clientWidth<500;
 const plot=euEl('plot');
 Object.assign(plot.dataset,{filmIntro:story.intro,filmPhase:frame.title,filmNarration:frame.narration,filmConclusion:story.end,phase:String(phase)});
 window.microMotion.chart(plot,euChart(mode,frame,readout,small));
 euEl('legend').textContent='上方两排柱长按真实概率绘制；下方刻度轴用同一个圆点跟踪每张彩票的期望效用 ∑p(z)v(z)。';
 const thirdMetric=mode==='euimplies'&&frame.kind==='continuity'?['连续性无差异权重 α',euNum(readout.alpha)]:mode==='eurep'&&readout.reducedP?['折算后获 M 概率',`甲 ${euNum(readout.reducedP[0]*100)}%；乙 ${euNum(readout.reducedQ[0]*100)}%`]:['按当前伯努利数',`甲 ${readout.relation} 乙`];
 const metrics=[
  ['当前画面',`${phase+1} / ${story.frames.length}`],
  ['期望效用',`甲 ${euNum(readout.left)}；乙 ${euNum(readout.right)}`],
  thirdMetric
 ];
 euEl('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${euEsc(k)}</label><strong>${euEsc(v)}</strong></div>`).join('');
 euEl('reading').textContent=frame.narration;
 euEl('formula').textContent=frame.formula;
 euEl('boundary').textContent=`Osborne–Rubinstein §3.3，印刷35—38页／PDF54—57。${frame.source}。沿图中的概率权重求和，可逐项核对公共项抵消、二元折算与仿射变换；第38页下方起进入§3.4。`;
 euEl('extra').innerHTML=euProofs[mode];
 euEl('step').value=phase;euEl('advance').disabled=phase>=story.frames.length-1;euEl('play').disabled=phase>=story.frames.length-1;
 const link=document.querySelector('.lesson-end a[download]');
 if(link){link.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch3-eu-${mode}.html`;link.textContent='下载本段完整动画代码 ↓';}
 window.microMath?.refresh();
 return {mode,phase,readout};
}

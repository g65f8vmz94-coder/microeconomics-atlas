import {riskStories,riskFrame,riskReadout} from './risk-story.mjs';

const rkEl=id=>document.getElementById(id);
const rkColors=['#177468','#7a6594','#a27619','#c35f43'];
const rkInk='#334b40',rkMuted='#65796e',rkRule='#cbd7cf',rkPale='#edf2ec',rkGold='#a27619';
const rkEsc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const rkNum=(n,d=2)=>Number(Number(n).toFixed(d)).toString();
const rkText=(x,y,s,size=14,color=rkInk,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${rkEsc(s)}</text>`;
const rkLine=(a,b,c,d,color=rkRule,width=1,dash='')=>`<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash?`stroke-dasharray="${dash}"`:''}/>`;

function rkCurvePlot(fn,xMin,xMax,choice,title,loLabel,hiLabel,W,H,small,highlightX=null){
 const left=small?36:60,right=W-(small?20:40),top=54,bottom=H-58;
 const N=101,xs=Array.from({length:N},(_,i)=>xMin+(xMax-xMin)*i/(N-1)),ys=xs.map(fn);
 const yMin=Math.min(...ys),yMax=Math.max(...ys),spanY=yMax-yMin||1;
 const sx=x=>left+(x-xMin)/(xMax-xMin)*(right-left);
 const sy=y=>bottom-(y-yMin)/spanY*(bottom-top);
 let svg=rkText(W/2,28,title,small?13:16,rkInk,'middle');
 svg+=rkLine(left,bottom,right,bottom,rkMuted,1);
 svg+=rkLine(left,top-10,left,bottom,rkRule,1);
 svg+=rkText(left,bottom+20,loLabel,small?10:12,rkMuted);
 svg+=rkText(right,bottom+20,hiLabel,small?10:12,rkMuted,'end');
 const pathData=xs.map((x,i)=>`${i===0?'M':'L'}${sx(x).toFixed(1)} ${sy(ys[i]).toFixed(1)}`).join(' ');
 svg+=`<path data-motion="rk-curve" d="${pathData}" fill="none" stroke="${rkColors[0]}" stroke-width="3"/>`;
 if(Number.isFinite(choice)){
  const cx=sx(choice),cy=sy(fn(choice));
  svg+=rkLine(cx,bottom,cx,cy,rkGold,1.5,'4 3');
  svg+=`<circle data-motion="rk-opt" cx="${cx}" cy="${cy}" r="6" fill="${rkGold}" stroke="#fffdf7" stroke-width="2"/>`;
  svg+=rkText(cx,cy-12,`x* = ${rkNum(choice,2)}`,small?11:13,rkGold,'middle');
 }
 if(Number.isFinite(highlightX)){
  const hx=sx(highlightX),hy=sy(fn(highlightX));
  svg+=rkLine(hx,bottom,hx,hy,'#c35f43',1.5,'3 3');
  svg+=`<circle cx="${hx}" cy="${hy}" r="5" fill="#c35f43"/>`;
 }
 return svg;
}

function rkChart(mode,frame,readout,small){
 const W=small?320:700,H=small?380:350;
 let svg='';

 if(mode==='risk'||mode==='jensen'){
  const left=small?40:70,right=W-(small?25:50),top=55,bottom=H-60;
  const isNeutral=frame.gamma===1;
  const xMin=0,xMax=20,yMin=0,yMax=isNeutral?20:Math.sqrt(20);
  const sx=x=>left+(x-xMin)/(xMax-xMin)*(right-left);
  const sy=y=>bottom-(y-yMin)/(yMax-yMin)*(bottom-top);
  const fn=x=>isNeutral?x:Math.sqrt(x);
  svg+=rkText(W/2,28,mode==='risk'?'风险厌恶：期望金额与确定等价的关系':'Jensen 不等式：割线恒在凹曲线下方',small?13:16,rkInk,'middle');
  svg+=rkLine(left,bottom,right,bottom,rkMuted,1);
  svg+=rkLine(left,top-10,left,bottom,rkRule,1);
  svg+=rkText(left,bottom+20,'$0',small?10:12,rkMuted);
  svg+=rkText(right,bottom+20,'$20',small?10:12,rkMuted,'end');
  const N=81;
  const pathD=Array.from({length:N},(_,i)=>{
   const x=xMin+(xMax-xMin)*i/(N-1);
   return `${i===0?'M':'L'}${sx(x).toFixed(1)} ${sy(fn(x)).toFixed(1)}`;
  }).join(' ');
  svg+=`<path data-motion="rk-v-curve" d="${pathD}" fill="none" stroke="${rkColors[0]}" stroke-width="3"/>`;

  // Points (4, v(4)) and (16, v(16))
  const x1=4,x2=16,y1=fn(x1),y2=fn(x2);
  const p1=[sx(x1),sy(y1)],p2=[sx(x2),sy(y2)];
  svg+=rkLine(p1[0],p1[1],p2[0],p2[1],rkColors[1],2,'4 3');
  svg+=`<circle cx="${p1[0]}" cy="${p1[1]}" r="5" fill="${rkColors[1]}"/>`;
  svg+=`<circle cx="${p2[0]}" cy="${p2[1]}" r="5" fill="${rkColors[1]}"/>`;
  svg+=rkText(p1[0],p1[1]-10,'(4, v(4))',small?10:11,rkMuted,'middle');
  svg+=rkText(p2[0],p2[1]-10,'(16, v(16))',small?10:11,rkMuted,'middle');

  // Mean E(p) = 10
  const meanX=readout.mean,meanChordY=(y1+y2)/2,meanCurveY=fn(meanX);
  const pmX=sx(meanX),pmChordY=sy(meanChordY),pmCurveY=sy(meanCurveY);
  svg+=rkLine(pmX,bottom,pmX,pmCurveY,rkGold,1.5,'3 3');
  svg+=`<circle data-motion="rk-mean-chord" cx="${pmX}" cy="${pmChordY}" r="6" fill="${rkColors[1]}"/>`;
  svg+=`<circle data-motion="rk-mean-curve" cx="${pmX}" cy="${pmCurveY}" r="6" fill="${rkColors[0]}"/>`;
  svg+=rkText(pmX,bottom+20,`E(p)=$${rkNum(meanX,0)}`,small?10:12,rkGold,'middle');

  if(!isNeutral){
   // Jensen Gap
   svg+=rkLine(pmX+14,pmChordY,pmX+14,pmCurveY,rkColors[3],2);
   svg+=rkText(pmX+20,(pmChordY+pmCurveY)/2+4,`Gap: ${rkNum(readout.jensenGap,2)}`,small?10:12,rkColors[3]);

   // Certainty equivalent
   const ceX=sx(readout.certain);
   svg+=rkLine(ceX,bottom,ceX,pmChordY,rkColors[2],1.5,'3 3');
   svg+=`<circle cx="${ceX}" cy="${pmChordY}" r="5" fill="${rkColors[2]}"/>`;
   svg+=rkText(ceX,bottom+36,`CE=$${rkNum(readout.certain,1)}`,small?10:11,rkColors[2],'middle');
  }
 }
 else if(mode==='p1'){
  svg+=rkText(W/2,28,'习题3.1 · 最可能奖品的概率 m(p)=max p(z)',small?13:16,rkInk,'middle');
  const left=small?30:60,width=W-left*2,barW=width/3,top=80,maxH=180;
  const probs=readout.p;
  probs.forEach((prob,i)=>{
   const bx=left+i*barW+barW*.18,bw=barW*.64,bh=maxH*prob;
   const by=top+maxH-bh;
   const isMode=readout.prizes.includes(i);
   svg+=`<rect data-motion="rk-p1-bar-${i}" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${isMode?rkColors[0]:rkPale}" stroke="${rkRule}" stroke-width="1.5"/>`;
   svg+=rkText(bx+bw/2,by-10,`${rkNum(prob*100,0)}%`,small?12:14,isMode?rkColors[0]:rkMuted,'middle');
   svg+=rkText(bx+bw/2,top+maxH+24,['奖品 a','奖品 b','奖品 c'][i],small?11:13,rkInk,'middle');
  });
  svg+=rkLine(left,top+maxH,W-left,top+maxH,rkMuted,1);
  svg+=rkText(W/2,top+maxH+54,`最高单点概率 m(p) = ${rkNum(readout.highest*100,0)}%（所有退化彩票 [z] 的 m([z]) 均为 100%）`,small?11:13,rkGold,'middle');
 }
 else if(mode==='p2'){
  svg+=rkText(W/2,28,'习题3.2 · 父母偏好抛硬币 vs 期望效用刚性约束',small?13:16,rkInk,'middle');
  const left=small?30:60,width=W-left*2,barW=width/3,top=80,baseY=240;
  const items=[
   {title:'确定给孩子 A [A]',val:1,col:rkColors[0],sub:'v(A) = 1.0'},
   {title:'确定给孩子 B [B]',val:1,col:rkColors[1],sub:'v(B) = 1.0'},
   {title:'公平抛硬币 0.5[A]⊕0.5[B]',val:frame.state==='conflict'||frame.state==='parent'?1.4:1.0,col:rkGold,sub:frame.state==='conflict'||frame.state==='parent'?'真实偏好严格更好 (≻)':'EU 计算强制要求 = 1.0'}
  ];
  items.forEach((it,i)=>{
   const bx=left+i*barW+barW*.15,bw=barW*.7,bh=it.val*90,by=baseY-bh;
   svg+=`<rect data-motion="rk-p2-bar-${i}" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${it.col}" opacity=".88"/>`;
   svg+=rkText(bx+bw/2,by-10,it.val>1?'严格胜出 ≻':'效用 1.0',small?11:13,it.col,'middle');
   svg+=rkText(bx+bw/2,baseY+20,it.title,small?10:12,rkInk,'middle');
   svg+=rkText(bx+bw/2,baseY+38,it.sub,small?9:11,rkMuted,'middle');
  });
  svg+=rkLine(left,baseY,W-left,baseY,rkMuted,1);
  svg+=rkLine(left,baseY-90,W-left,baseY-90,rkColors[3],1,'4 3');
  svg+=rkText(W-left,baseY-96,'EU 期望效用基准线',small?10:11,rkColors[3],'end');
 }
 else if(mode==='p3'){
  svg+=rkText(W/2,28,frame.variant==='four'?'习题3.3 · 4个严格奖品时连续性必然失败':'习题3.3 · 按唯一的最高概率奖品排序',small?13:16,rkInk,'middle');
  const left=small?30:60,width=W-left*2,n=frame.variant==='four'?4:3,barW=width/n,top=80,maxH=160;
  const probs=frame.variant==='four'?[.5,0,0,.5]:[.5,0,.5];
  const names=frame.variant==='four'?['z₁ (最好)','z₂ (中高)','z₃ (中低)','z₄ (最差)']:['a (最好)','b (中间)','c (最差)'];
  probs.forEach((p,i)=>{
   const bx=left+i*barW+barW*.15,bw=barW*.7,bh=maxH*p,by=top+maxH-bh;
   svg+=`<rect data-motion="rk-p3-bar-${i}" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${p>0?rkGold:rkPale}" stroke="${rkRule}"/>`;
   svg+=rkText(bx+bw/2,by-8,`${rkNum(p*100,0)}%`,small?11:13,p>0?rkGold:rkMuted,'middle');
   svg+=rkText(bx+bw/2,top+maxH+20,names[i],small?10:12,rkInk,'middle');
  });
  svg+=rkLine(left,top+maxH,W-left,top+maxH,rkMuted,1);
  const notice=frame.variant==='four'?'0.5[z₁]⊕0.5[z₄] 发生并列；无法同时无差异于不相等的 [z₂] 与 [z₃]！':'0.5[a]⊕0.5[c] 可定义为与唯一中间奖品 [b] 无差异，保留连续性';
  svg+=rkText(W/2,top+maxH+50,notice,small?11:13,frame.variant==='four'?'#c35f43':'#177468','middle');
 }
 else if(mode==='p4'){
  svg+=rkText(W/2,28,'习题3.4 · 两种奖品 {a, b} 上满足独立性的三种偏好',small?13:16,rkInk,'middle');
  const left=small?40:80,right=W-(small?30:60),top=70,bottom=H-70;
  svg+=rkLine(left,bottom,right,bottom,rkMuted,1);
  svg+=rkLine(left,top,left,bottom,rkRule,1);
  svg+=rkText(left,bottom+22,'p(a) = 0.0 ([b])',small?10:12,rkMuted);
  svg+=rkText(right,bottom+22,'p(a) = 1.0 ([a])',small?10:12,rkMuted,'end');

  // Plot three cases
  const sy=v=>bottom-v*(bottom-top);
  // 1: [a] > [b] (green, rising)
  svg+=rkLine(left,sy(0),right,sy(1),rkColors[0],3);
  svg+=rkText(right-40,sy(0.9)-8,'① [a] ≻ [b]（严格递增）',small?10:12,rkColors[0],'end');
  // 2: [b] > [a] (purple, falling)
  svg+=rkLine(left,sy(1),right,sy(0),rkColors[1],3);
  svg+=rkText(right-40,sy(0.1)+18,'② [b] ≻ [a]（严格递减）',small?10:12,rkColors[1],'end');
  // 3: [a] ~ [b] (gold, flat)
  svg+=rkLine(left,sy(0.5),right,sy(0.5),rkGold,3,'5 4');
  svg+=rkText(right-40,sy(0.5)-8,'③ [a] ∼ [b]（全无差异）',small?10:12,rkGold,'end');

  // Current pointer
  const px=left+readout.p*(right-left);
  svg+=rkLine(px,top,px,bottom,rkColors[3],1.5,'3 3');
  svg+=`<circle cx="${px}" cy="${sy(readout.score)}" r="6" fill="${rkColors[3]}"/>`;
  svg+=rkText(px,top-10,`当前 p(a)=${rkNum(readout.p*100,0)}%`,small?11:12,rkColors[3],'middle');
 }
 else if(mode==='p5'){
  svg+=rkText(W/2,28,frame.variant==='a1'?'习题3.5 · 满足 A1 但违反 A2（概率非线性缩放）':frame.variant==='a2'?'习题3.5 · 满足 A2 但违反 A1（奖品字典序）':'习题3.5 · 期望效用同时满足 A1 与 A2',small?13:16,rkInk,'middle');
  const left=small?30:60,width=W-left*2,barW=width/4,top=80,baseY=240;
  const barsData=frame.variant==='a1'?[
   {name:'(0.5, x)',score:.5,col:rkColors[0]},
   {name:'(0.4, y)',score:.32,col:rkColors[1]},
   {name:'(1.0, x)',score:1.0,col:rkColors[0]},
   {name:'(0.8, y)',score:1.28,col:rkColors[1]}
  ]:frame.variant==='a2'?[
   {name:'(0, y)',score:0,col:rkPale},
   {name:'(0.2, x)',score:1.0,col:rkColors[0]},
   {name:'(0.8, x)',score:1.0,col:rkColors[0]},
   {name:'(0.01, y)',score:2.0,col:rkColors[1]}
  ]:[
   {name:'(0.5, x)',score:.5,col:rkColors[0]},
   {name:'(0.4, y)',score:.8,col:rkColors[1]},
   {name:'(1.0, x)',score:1.0,col:rkColors[0]},
   {name:'(0.8, y)',score:1.6,col:rkColors[1]}
  ];
  barsData.forEach((b,i)=>{
   const bx=left+i*barW+barW*.15,bw=barW*.7,bh=b.score*80,by=baseY-bh;
   svg+=`<rect data-motion="rk-p5-bar-${i}" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${b.col}" stroke="${rkRule}"/>`;
   svg+=rkText(bx+bw/2,by-8,rkNum(b.score,2),small?11:13,rkInk,'middle');
   svg+=rkText(bx+bw/2,baseY+22,b.name,small?10:12,rkInk,'middle');
  });
  svg+=rkLine(left,baseY,W-left,baseY,rkMuted,1);
  const sub=frame.variant==='a1'?'除以 0.5 缩放后比较发生逆转：(0.5,x) ≻ (0.4,y)，但 (1,x) ≺ (0.8,y)！':frame.variant==='a2'?'正概率永远偏爱 y，故无法找到 α 使 (α,y) ∼ (1,x)，A1 失败':'EU 下 U(α,z)=αv(z)，两边同除以 α>0 保持不等号，A1 与 A2 均成立';
  svg+=rkText(W/2,baseY+50,sub,small?11:13,frame.variant==='a1'?'#c35f43':'#177468','middle');
 }
 else if(mode==='p7'){
  svg+=rkText(W/2,28,'习题3.7 · 严格凹性保证逐项拒绝 ±1 公平噪音',small?13:16,rkInk,'middle');
  const left=small?40:80,right=W-(small?30:60),top=70,bottom=H-70;
  const sx=x=>left+(x-8)/(16-8)*(right-left);
  const sy=y=>bottom-(y-Math.sqrt(8))/(Math.sqrt(16)-Math.sqrt(8))*(bottom-top);
  svg+=rkLine(left,bottom,right,bottom,rkMuted,1);
  const N=51;
  const pData=Array.from({length:N},(_,i)=>{
   const x=8+8*i/(N-1);
   return `${i===0?'M':'L'}${sx(x).toFixed(1)} ${sy(Math.sqrt(x)).toFixed(1)}`;
  }).join(' ');
  svg+=`<path d="${pData}" fill="none" stroke="${rkColors[0]}" stroke-width="3"/>`;

  // Original point z=10 and noise points 9, 11
  const z=10,zL=9,zR=11;
  const pZ=[sx(z),sy(Math.sqrt(z))],pZL=[sx(zL),sy(Math.sqrt(zL))],pZR=[sx(zR),sy(Math.sqrt(zR))];
  const chordMidY=(sy(Math.sqrt(zL))+sy(Math.sqrt(zR)))/2;
  svg+=rkLine(pZL[0],pZL[1],pZR[0],pZR[1],rkColors[1],2,'4 3');
  svg+=`<circle cx="${pZ[0]}" cy="${pZ[1]}" r="6" fill="${rkColors[0]}"/>`;
  svg+=`<circle cx="${pZ[0]}" cy="${chordMidY}" r="6" fill="${rkColors[1]}"/>`;
  svg+=rkLine(pZ[0],chordMidY,pZ[0],pZ[1],rkColors[3],2);
  svg+=rkText(pZ[0],pZ[1]-12,'v(z) 原效用',small?11:13,rkColors[0],'middle');
  svg+=rkText(pZ[0],chordMidY+20,'0.5 v(z-1) + 0.5 v(z+1)',small?10:12,rkColors[1],'middle');
  svg+=rkText(W/2,bottom+28,'对每个原奖品 z 均有 v(z) > 0.5v(z-1)+0.5v(z+1)，加权求和得 U(p) > U(q)',small?11:13,rkGold,'middle');
 }
 else if(mode==='p8'){
  const w=10,alpha=readout.alpha,dec=readout.decreasing;
  const f=z=>dec?-(alpha*(w+2*z)**2+(1-alpha)*(w-z)**2):alpha*Math.sqrt(w+2*z)+(1-alpha)*Math.sqrt(w-z);
  svg+=rkCurvePlot(f,0,w,readout.choice,dec?'习题3.8 · 反例 v(z)=-z²：胜率升高下注反减少':'习题3.8 · v\'>0 严格递增：胜率升高下注增加','下注 $0',`下注 $${w}`,W,H,small);
 }
 else if(mode==='p9'){
  const w=10,D=2,p=.2,lambda=readout.lambda,dec=readout.decreasing;
  const f=x=>{
   const no=w-x,yes=w-D-x+lambda*x;
   if(no<0||yes<0)return -Infinity;
   return dec?-((1-p)*no*no+p*yes*yes):(1-p)*Math.sqrt(no)+p*Math.sqrt(yes);
  };
  const title=dec?'习题3.9 · 反例 v(z)=-z²：导致超额保险 λx* > D':readout.lambda===5?'习题3.9(a) · 公平保费 λ=1/p：全额保险 λx* = D':'习题3.9(b) · 非公平保费 pλ<1：不足额保险 λx* < D';
  svg+=rkCurvePlot(f,0,2,readout.choice,title,'保费 $0','保费 $2',W,H,small);
 }

 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${rkEsc(frame.title)}">${svg}</svg>`;
}

const riskProofs={
 risk:String.raw`<details class="sd-proof" open><summary>做题模板：定义3.6 风险态度的三类判断</summary><ol>
<li><strong>计算彩票的期望值</strong>：<div class="equation">E(p)=\sum_{z\in Z}p(z)z</div></li>
<li><strong>检验退化彩票 [E(p)] 与彩票 p 的排序</strong>：
<ul>
<li><strong>风险厌恶</strong>：对所有 <span class="equation">p</span>，<span class="equation">[E(p)]\succeq p</span>。</li>
<li><strong>严格风险厌恶</strong>：对所有非退化彩票（至少含两种奖品），<span class="equation">[E(p)]\succ p</span>；等价于风险溢价 <span class="equation">\pi = E(p)-CE(p) > 0</span>。</li>
<li><strong>风险中性</strong>：对所有 <span class="equation">p</span>，<span class="equation">[E(p)]\sim p</span>。</li>
</ul></li>
<li><strong>核心概念边界</strong>：定义3.6仅使用偏好排序，<strong>适用于任意彩票偏好</strong>，不预设期望效用理论。</li>
</ol></details>`,
 jensen:String.raw`<details class="sd-proof" open><summary>证明模板：命题3.3（期望效用下 风险厌恶 ⇔ 伯努利函数凹）</summary><ol>
<li><strong>正向（⇒ 凹性）</strong>：设偏好是风险厌恶的。对任意金额 <span class="equation">x, y\in\mathbb{R}_+</span> 和任意权重 <span class="equation">\alpha\in[0,1]</span>，考虑二元彩票 <span class="equation">p=\alpha[x]\oplus(1-\alpha)[y]</span>。由风险厌恶：<div class="equation">[\alpha x+(1-\alpha)y]\succeq \alpha\cdot x\oplus(1-\alpha)\cdot y</div>两边代入期望效用表示 <span class="equation">U</span>，即得 <span class="equation">v(\alpha x+(1-\alpha)y)\ge \alpha v(x)+(1-\alpha)v(y)</span>，故 <span class="equation">v</span> 是凹函数。</li>
<li><strong>反向（⇐ 风险厌恶）</strong>：设 <span class="equation">v</span> 是凹函数。由有限 Jensen 不等式，对任意彩票 <span class="equation">p</span>：<div class="equation">v\left(\sum_{z\in Z}p(z)z\right)\ge \sum_{z\in Z}p(z)v(z)</div>左边即 <span class="equation">U([E(p)])</span>，右边即 <span class="equation">U(p)</span>，故 <span class="equation">[E(p)]\succeq p</span>，证明偏好是风险厌恶的。</li>
</ol></details>`,
 p1:String.raw`<details class="sd-proof" open><summary>证明模板：习题3.1（最可能奖品的概率）</summary><ol>
<li><strong>连续性（空真成立）</strong>：对任意确定奖品 <span class="equation">z</span>，退化彩票 <span class="equation">[z]</span> 的最高概率为 <span class="equation">m([z])=1</span>。因此所有退化彩票两两无差异，不存在 <span class="equation">[a]\succ[b]\succ[c]</span>，定义3.2的前件不成立，故<strong>连续性空真满足</strong>。</li>
<li><strong>独立性（失败）</strong>：取两个不同奖品 <span class="equation">a, b</span>，有 <span class="equation">[a]\sim[b]</span>（得分均为 1）。若独立性成立，混合后应有 <span class="equation">0.5[a]\oplus 0.5[b]\sim [b]</span>。但 <span class="equation">0.5[a]\oplus 0.5[b]</span> 的最高概率降为 <span class="equation">0.5</span>，严格差于 <span class="equation">[b]</span> 的 1，<strong>矛盾于独立性</strong>。</li>
</ol></details>`,
 p2:String.raw`<details class="sd-proof" open><summary>证明模板：习题3.2（偏好随机抛硬币的父母）</summary><ol>
<li><strong>假设符合期望效用</strong>：由 <span class="equation">[A]\sim[B]</span> 可知伯努利效用相等：<span class="equation">v(A)=v(B)</span>。</li>
<li><strong>计算抛硬币的期望效用</strong>：<div class="equation">U(0.5[A]\oplus 0.5[B])=0.5v(A)+0.5v(B)=0.5v(A)+0.5v(A)=v(A)=U([A])</div></li>
<li><strong>导出矛盾</strong>：期望效用要求 <span class="equation">0.5[A]\oplus 0.5[B]\sim [A]</span>，而父母真实偏好是 <span class="equation">0.5[A]\oplus 0.5[B]\succ [A]</span>。两者矛盾，故<strong>无法被期望效用表示</strong>。</li>
</ol></details>`,
 p3:String.raw`<details class="sd-proof" open><summary>证明模板：习题3.3（按众数奖品比较）</summary><ol>
<li><strong>独立性（必然失败）</strong>：设 <span class="equation">a\succ^* b</span>，则 <span class="equation">[a]\succ[b]</span>。给两边加入共同分支 <span class="equation">0.6[c]</span>，两张新彩票唯一众数均为 <span class="equation">c</span>，导致无差异，违反独立性。</li>
<li><strong>连续性（题干未定义平局）</strong>：
<ul>
<li>若 <span class="equation">|Z|=3</span> 且 <span class="equation">a\succ^* b\succ^* c</span>，若规定平局 <span class="equation">0.5[a]\oplus 0.5[c]\sim [b]</span>，则连续性可成立。</li>
<li>若 <span class="equation">|Z|\ge 4</span> 且 <span class="equation">z_1\succ^* z_2\succ^* z_3\succ^* z_4</span>，平局彩票 <span class="equation">0.5[z_1]\oplus 0.5[z_4]</span> 无法同时无差异于不等的 <span class="equation">[z_2]</span> 与 <span class="equation">[z_3]</span>，连续性必失败。</li>
</ul></li>
</ol></details>`,
 p4:String.raw`<details class="sd-proof" open><summary>证明模板：习题3.4（两奖品上满足独立性的三类偏好）</summary><ol>
<li><strong>彩票单参数化</strong>：在 <span class="equation">Z=\{a,b\}</span> 上，任意彩票完全由 <span class="equation">\alpha=p(a)\in[0,1]</span> 决定：<span class="equation">p_\alpha=\alpha[a]\oplus(1-\alpha)[b]</span>。</li>
<li><strong>完备性分类</strong>：纯奖品之间只有三种互斥关系：
<ul>
<li>若 <span class="equation">[a]\succ[b]</span>：由引理3.1，<span class="equation">\alpha>\beta\iff p_\alpha\succ p_\beta</span>（按 <span class="equation">p(a)</span> 严格递增）。</li>
<li>若 <span class="equation">[b]\succ[a]</span>：由引理3.1，<span class="equation">\alpha>\beta\iff p_\alpha\prec p_\beta</span>（按 <span class="equation">p(a)</span> 严格递减）。</li>
<li>若 <span class="equation">[a]\sim[b]</span>：由独立性，<span class="equation">p_\alpha\sim \alpha[b]\oplus(1-\alpha)[b]=[b]</span>，所有彩票完全无差异。</li>
</ul></li>
<li><strong>结论</strong>：独立性严格限定了彩票排序，故<strong>不多不少正好三类</strong>。</li>
</ol></details>`,
 p5:String.raw`<details class="sd-proof" open><summary>证明模板：习题3.5（简单彩票公理 A1 与 A2）</summary><ol>
<li><strong>小问 (a) 期望效用</strong>：<span class="equation">U(\alpha,z)=\alpha v(z)</span> (<span class="equation">v>0</span>)。A1 取 <span class="equation">\alpha=v(x)/v(y)</span> 满足；A2 在 <span class="equation">\alpha\ge\beta</span> 且 <span class="equation">\alpha>0</span> 时同除以 <span class="equation">\alpha</span> 即得两边等价。</li>
<li><strong>小问 (b) 构造反例</strong>：
<ul>
<li><strong>满足 A1、违反 A2</strong>：<span class="equation">f(\alpha,x)=\alpha, f(\alpha,y)=2\alpha^2</span>。在 <span class="equation">\alpha=1/\sqrt{2}</span> 处满足 A1；但在 <span class="equation">\alpha=0.5,\beta=0.4</span> 时 <span class="equation">0.5>0.32</span>，缩放后 <span class="equation">1<1.28</span>，逆转导致 A2 失败。</li>
<li><strong>满足 A2、违反 A1</strong>：正概率按奖品字典序，零概率视为同一无奖品。缩放保持奖品比较故 A2 成立；但正概率 <span class="equation">y</span> 恒严格优于纯 <span class="equation">x</span>，A1 失败。</li>
</ul></li>
</ol></details>`,
 p7:String.raw`<details class="sd-proof" open><summary>证明模板：习题3.7（严格风险厌恶拒绝 ±1 噪音）</summary><ol>
<li><strong>严格凹性</strong>：严格风险厌恶等价于伯努利函数 <span class="equation">v</span> 严格凹。对任意 <span class="equation">z\ge 1</span>（保证 <span class="equation">z-1\in\mathbb{R}_+</span>）：<div class="equation">v(z)>\frac{1}{2}v(z-1)+\frac{1}{2}v(z+1)</div></li>
<li><strong>逐项加权求和</strong>：两边乘以 <span class="equation">p(z)</span> 并对所有奖品求和：<div class="equation">U(p)=\sum_z p(z)v(z)>\sum_z p(z)\left[\frac{v(z-1)+v(z+1)}{2}\right]=U(q)</div></li>
<li><strong>结论</strong>：<span class="equation">U(p)>U(q)</span>，故严格风险厌恶者<strong>严格拒绝该提议</strong>。</li>
</ol></details>`,
 p8:String.raw`<details class="sd-proof" open><summary>证明与校准：习题3.8（赌场下注与 v'>0 缺口）</summary><ol>
<li><strong>教材条件校准</strong>：原题仅写“风险厌恶”，但必须补充<strong>效用严格递增（<span class="equation">v'>0</span>）</strong>！若无此条件，反例 <span class="equation">v(z)=-z^2</span> 严格凹（<span class="equation">v''=-2<0</span>），但最优下注 <span class="equation">x^*(\alpha)=\max\{0, w(1-3\alpha)/(1+3\alpha)\}</span> 随胜率 <span class="equation">\alpha</span> 升高而<strong>递减</strong>！</li>
<li><strong>标准证明（补充 <span class="equation">v'>0</span>）</strong>：目标函数 <span class="equation">V(x)=\alpha v(w+2x)+(1-\alpha)v(w-x)</span>。
<ul>
<li>一阶导数：<span class="equation">V'(x)=2\alpha v'(w+2x)-(1-\alpha)v'(w-x)</span>。</li>
<li>二阶导数：<span class="equation">V''(x)=4\alpha v''(w+2x)+(1-\alpha)v''(w-x)<0</span>（严格凹）。</li>
<li>交叉导数：<span class="equation">\frac{\partial V'}{\partial \alpha}=2v'(w+2x)+v'(w-x)>0</span>（利用了 <span class="equation">v'>0</span>）。</li>
</ul></li>
<li><strong>由隐函数定理</strong>：<div class="equation">\frac{dx^*}{d\alpha}=-\frac{\partial V'/\partial \alpha}{V''(x)}>0</div>最优下注金额随胜率严格递增。</li>
</ol></details>`,
 p9:String.raw`<details class="sd-proof" open><summary>证明与校准：习题3.9（公平与非公平保险）</summary><ol>
<li><strong>小问 (a) 公平保险</strong>：<span class="equation">\lambda=1/p</span>。目标函数 <span class="equation">U(x)=(1-p)v(w-x)+pv(w-D+(\lambda-1)x)</span>。
<ul>
<li>求导得：<span class="equation">U'(x)=-(1-p)v'(w-x)+p(\lambda-1)v'(w-D+(\lambda-1)x)=(1-p)\bigl[v'(w-D+(\lambda-1)x)-v'(w-x)\bigr]</span>。</li>
<li>由 <span class="equation">v</span> 严格凹，<span class="equation">v'</span> 单调减，故 <span class="equation">U'(x)=0\iff w-x=w-D+(\lambda-1)x\iff \lambda x^*=D</span>，即<strong>全额保险 <span class="equation">x^*=pD</span></strong>。</li>
</ul></li>
<li><strong>小问 (b) 非公平保险（<span class="equation">p\lambda<1</span>）</strong>：必须补充 <span class="equation">v'>0</span> 条件（否则 <span class="equation">v=-z^2</span> 在 <span class="equation">p=0.2,\lambda=4</span> 下给出超额保险 <span class="equation">\lambda x^*=64/13>2=D</span> 反例）。
<ul>
<li>在全额保险点 <span class="equation">\lambda x=D</span> 处，两状态财富相等，记为 <span class="equation">W_0</span>。</li>
<li>代入一阶导数：<span class="equation">U'(x)|_{\lambda x=D}=-(1-p)v'(W_0)+p(\lambda-1)v'(W_0)=(p\lambda-1)v'(W_0)<0</span>（利用了 <span class="equation">v'>0</span>）。</li>
<li>由 <span class="equation">U''(x)<0</span>，最优保费必满足 <span class="equation">\lambda x^* < D</span>，即<strong>不足额保险</strong>。</li>
</ul></li>
</ol></details>`
};

export function renderRiskStory(mode,phase){
 const story=riskStories[mode],frame=riskFrame(mode,phase),readout=riskReadout(mode,frame),small=rkEl('plot').clientWidth<500;
 const plot=rkEl('plot');
 Object.assign(plot.dataset,{filmIntro:story.intro,filmPhase:frame.title,filmNarration:frame.narration,filmConclusion:story.end,phase:String(phase)});
 window.microMotion.chart(plot,rkChart(mode,frame,readout,small));
 rkEl('legend').textContent='绿色代表效用/当前状态；紫色为参照彩票/割线；金色标记最优解、期望值或特征点。';
 const metrics=[
  ['当前画面',`${phase+1} / ${story.frames.length}`],
  ['本节场景',mode],
  ['核心指标',mode==='risk'||mode==='jensen'?`E=$${rkNum(readout.mean,1)}, CE=$${rkNum(readout.certain,1)}, π=$${rkNum(readout.premium,1)}`:mode==='p1'?`最高概率 ${rkNum(readout.highest*100,0)}%`:mode==='p4'?`p(a)=${rkNum(readout.p*100,0)}%`:mode==='p8'?`x*=${rkNum(readout.choice,2)}`:mode==='p9'?`x*=${rkNum(readout.choice,3)}, λx*=${rkNum(readout.coverage,3)}`:'理论分析']
 ];
 rkEl('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${rkEsc(k)}</label><strong>${rkEsc(v)}</strong></div>`).join('');
 rkEl('reading').textContent=frame.narration;
 rkEl('formula').textContent=frame.formula;
 rkEl('boundary').textContent=`Osborne–Rubinstein §3.5 与第3章习题3.1—3.9，印刷39—43页／PDF58—62。${frame.source}。原教材无习题3.6；习题3.8与3.9(b)缺漏了“v\'>0（效用严格递增）”前提，本站已补充严格证明并构造反例校准。`;
 rkEl('extra').innerHTML=riskProofs[mode];
 rkEl('step').value=phase;rkEl('advance').disabled=phase>=story.frames.length-1;rkEl('play').disabled=phase>=story.frames.length-1;
 const link=document.querySelector('.lesson-end a[download]');
 if(link){link.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch3-risk-${mode}.html`;link.textContent='下载本段完整动画代码 ↓';}
 window.microMath?.refresh();
 return {mode,phase,readout};
}

import {prefStories,prefFrame,prefReadout} from './pref-story.mjs';
import {prefU,compareP,blend} from './preferences.mjs';

const pEl=id=>document.getElementById(id);
const pInk='#334b40',pMuted='#65796e',pRule='#cbd7cf',pPale='#edf2ec',pGold='#a27619',pGreen='#177468',pPurple='#7a6594',pRed='#c35f43';
const pEsc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const pNum=(n,d=2)=>Number(Number(n).toFixed(d)).toString();
const pText=(x,y,s,size=14,color=pInk,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${pEsc(s)}</text>`;
const pLine=(a,b,c,d,color=pRule,width=1,dash='')=>`<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash?`stroke-dasharray="${dash}"`:''}/>`;

function pChart(mode,frame,small){
 const W=small?330:640,H=small?340:370;
 const left=small?38:52,right=W-(small?18:35),bottom=H-(small?42:50),top=small?35:42;
 const maxCoord=12;
 const sx=v=>left+Math.max(0,Math.min(maxCoord,v))/maxCoord*(right-left);
 const sy=v=>bottom-Math.max(0,Math.min(maxCoord,v))/maxCoord*(bottom-top);

 let svg=`<rect width="${W}" height="${H}" fill="#fffdf7"/>`;
 svg+=pText(W/2,24,frame.title,small?13:15,pInk,'middle');

 // Grid and axes
 [0,2,4,6,8,10,12].forEach(v=>{
  svg+=`<path d="M${sx(v)} ${sy(0)}V${sy(maxCoord)}M${sx(0)} ${sy(v)}H${sx(maxCoord)}" stroke="#e6ece2" stroke-width="1"/>`;
  svg+=pText(sx(v),sy(0)+16,String(v),small?10:11,pMuted,'middle');
  if(v>0)svg+=pText(sx(0)-8,sy(v)+4,String(v),small?10:11,pMuted,'end');
 });
 svg+=pLine(sx(0),sy(0),sx(maxCoord)+8,sy(0),pInk,1.5);
 svg+=pLine(sx(0),sy(0),sx(0),sy(maxCoord)-8,pInk,1.5);
 svg+=pText(sx(maxCoord)+12,sy(0)+4,'x₁',small?11:13,pInk);
 svg+=pText(sx(0)-4,sy(maxCoord)-12,'x₂',small?11:13,pInk);

 const state=frame.state||{};

 function drawPoint(x,y,label,color=pGreen,r=6,key='pt'){
  const cx=sx(x),cy=sy(y);
  let res=`<circle data-motion="${key}" cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#fffdf7" stroke-width="2"/>`;
  if(label)res+=pText(cx+8,cy-8,label,small?11:13,color);
  return res;
 }

 function drawIndifference(kind,uVal,color=pGreen,dash=''){
  const N=81;
  const pts=[];
  for(let i=0;i<=N;i++){
   const x=maxCoord*i/N;
   let y=NaN;
   if(kind==='linear')y=uVal-1.3*x;
   else if(kind==='neutral')y=uVal;
   else if(kind==='threshold')y=uVal<=10?NaN:uVal-11;
   else if(kind==='min')y=x>=uVal?uVal:NaN;
   else if(kind==='product')y=x>0.05?uVal/x:NaN;
   else if(kind==='quasi')y=uVal-Math.sqrt(x);
   else if(kind==='distance')y=x<=uVal?Math.sqrt(uVal*uVal-x*x):NaN;
   else if(kind==='log')y=Math.exp(uVal)/(1+x)-1;
   else if(kind==='bad')y=x-uVal;
   if(Number.isFinite(y)&&y>=0&&y<=maxCoord)pts.push([x,y]);
  }
  let pathD='';
  if(kind==='min'){
   const k=uVal;
   if(k>=0&&k<=maxCoord){
    pathD=`M${sx(k)} ${sy(maxCoord)}L${sx(k)} ${sy(k)}L${sx(maxCoord)} ${sy(k)}`;
   }
  }else if(kind==='ideal'){
   const d=Math.abs(uVal);
   pathD=`M${sx(5-d)} ${sy(5)}L${sx(5)} ${sy(5+d)}L${sx(5+d)} ${sy(5)}L${sx(5)} ${sy(5-d)}Z`;
  }else if(kind==='max'){
   pathD=`M${sx(0)} ${sy(uVal)}L${sx(uVal)} ${sy(uVal)}L${sx(uVal)} ${sy(0)}`;
  }else if(pts.length>1){
   pathD=pts.map((p,i)=>`${i===0?'M':'L'}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(' ');
  }
  if(pathD)return `<path data-motion="curve-${kind}" d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  return '';
 }

 // Mode-specific overlays
 if(mode==='bundle'){
  const a=state.a||[2,8],b=state.b||[8,2],lambda=state.lambda??.5;
  const m=blend(a,b,lambda);
  svg+=pLine(sx(a[0]),sy(a[1]),sx(b[0]),sy(b[1]),pPurple,2,'4 4');
  svg+=drawPoint(a[0],a[1],'A (2, 8)',pPurple,7,'pt-a');
  svg+=drawPoint(b[0],b[1],'B (8, 2)',pPurple,7,'pt-b');
  svg+=drawPoint(m[0],m[1],`M (${pNum(m[0],1)}, ${pNum(m[1],1)})`,pGreen,8,'pt-m');
 }else if(mode==='examples'){
  const kind=state.kind||'linear',b=state.bundle||[3,5];
  const u=kind==='lex'?null:prefU(kind,...b);
  if(u!==null)svg+=drawIndifference(kind,u,pGreen);
  svg+=drawPoint(b[0],b[1],`束 (${b[0]}, ${b[1]})`,pGreen,7,'pt-ex');
  if(kind==='threshold'&&u>10){
   svg+=`<circle cx="${sx(10)}" cy="${sy(u-11)}" r="5" fill="#fffdf7" stroke="${pGreen}" stroke-width="2"/>`;
  }
  if(kind==='ideal')svg+=drawPoint(5,5,'理想点 x*',pGold,7,'pt-ideal');
 }else if(mode==='monotone'){
  if(state.kind==='min'){
   svg+=drawIndifference('min',2,pPale);
   svg+=drawPoint(2,2,'原束 (2, 2)',pPurple,7,'pt-mono-a');
   svg+=drawPoint(3,2,'加多商品1 (3, 2)',pGreen,7,'pt-mono-b');
   svg+=pLine(sx(2),sy(2),sx(3),sy(2),pGold,2,'3 3');
  }else if(state.kind==='linear'){
   svg+=drawIndifference('linear',prefU('linear',2,2),pPale);
   svg+=drawPoint(2,2,'原束 (2, 2)',pPurple,7,'pt-mono-a');
   svg+=drawPoint(3,2,'强单调点 (3, 2)',pGreen,7,'pt-mono-b');
   svg+=pLine(sx(2),sy(2),sx(3),sy(2),pGreen,2,'3 3');
  }else{
   svg+=drawPoint(4,4,'基准束',pGold,7,'pt-mid');
   svg+=`<rect x="${sx(4)}" y="${sy(12)}" width="${sx(12)-sx(4)}" height="${sy(4)-sy(12)}" fill="${pGreen}" opacity=".15"/>`;
   svg+=pText(sx(6),sy(8),'强单调区 (严格更好)',small?11:13,pGreen);
  }
 }else if(mode==='continuity'){
  const x=state.x||[1,2],y=state.y||[1,0],a=state.a||[.8,2],eps=state.eps||.4;
  svg+=`<circle cx="${sx(x[0])}" cy="${sy(x[1])}" r="${(right-left)/maxCoord*eps}" fill="${pGreen}" opacity=".15" stroke="${pGreen}" stroke-dasharray="3 3"/>`;
  svg+=drawPoint(x[0],x[1],'x (1, 2)',pGreen,7,'pt-cx');
  svg+=drawPoint(y[0],y[1],'y (1, 0)',pPurple,7,'pt-cy');
  if(state.a)svg+=drawPoint(a[0],a[1],`a_ε (${pNum(a[0],2)}, 2)`,pRed,7,'pt-ca');
 }else if(mode==='continuityproof'){
  const x=[5,5],y=[2,2];
  svg+=drawPoint(x[0],x[1],'x (5, 5)',pGreen,7,'pt-px');
  svg+=drawPoint(y[0],y[1],'y (2, 2)',pPurple,7,'pt-py');
  svg+=`<circle cx="${sx(x[0])}" cy="${sy(x[1])}" r="${(right-left)/maxCoord*.9}" fill="${pGreen}" opacity=".12"/>`;
  svg+=`<circle cx="${sx(y[0])}" cy="${sy(y[1])}" r="${(right-left)/maxCoord*.9}" fill="${pPurple}" opacity=".12"/>`;
  svg+=pText(sx(x[0]),sy(x[1])+22,'u(a) > u(x) - ε',small?10:12,pGreen,'middle');
  svg+=pText(sx(y[0]),sy(y[1])-14,'u(b) < u(y) + ε',small?10:12,pPurple,'middle');
 }else if(mode==='intermediate'){
  const a=[8,8],c=[1,1],b=[4,5],t=state.t||.496;
  const z=blend(a,c,t);
  svg+=drawIndifference('product',20,pGreen);
  svg+=pLine(sx(a[0]),sy(a[1]),sx(c[0]),sy(c[1]),pPurple,2,'3 3');
  svg+=drawPoint(a[0],a[1],'a (8, 8)',pPurple,6,'pt-ia');
  svg+=drawPoint(c[0],c[1],'c (1, 1)',pPurple,6,'pt-ic');
  svg+=drawPoint(b[0],b[1],'目标束 b (4, 5)',pGold,7,'pt-ib');
  svg+=drawPoint(z[0],z[1],`交点 z (${pNum(z[0],2)}, ${pNum(z[1],2)})`,pGreen,8,'pt-iz');
 }else if(mode==='convex'||mode==='upper'||mode==='concave'){
  const kind=state.kind||state.model||'min';
  const a=kind==='max'?[6,1]:kind==='ideal'?[3,7]:[3,8];
  const b=kind==='max'?[1,6]:kind==='ideal'?[7,3]:[8,3];
  const lambda=state.lambda??.5;
  const m=blend(a,b,lambda);
  const uB=prefU(kind==='minSquared'?'min':kind,...b);
  svg+=drawIndifference(kind==='minSquared'?'min':kind,uB,pPurple);
  svg+=pLine(sx(a[0]),sy(a[1]),sx(b[0]),sy(b[1]),pGold,2,'3 3');
  svg+=drawPoint(a[0],a[1],'A',pPurple,6,'pt-ca');
  svg+=drawPoint(b[0],b[1],'B',pPurple,6,'pt-cb');
  svg+=drawPoint(m[0],m[1],`混合点 M (${pNum(m[0],1)}, ${pNum(m[1],1)})`,pGreen,7,'pt-cm');
 }else if(mode==='declining'){
  const a=[10,10],b=[11,100/11],c=[12,100/12];
  const m=[11,10-(10-100/12)/2];
  svg+=drawIndifference('product',100,pGreen);
  svg+=drawPoint(a[0],a[1],'a (10, 10)',pPurple,6,'pt-da');
  svg+=drawPoint(b[0],b[1],`b (11, ${pNum(b[1],2)})`,pGreen,7,'pt-db');
  svg+=drawPoint(c[0],c[1],`c (12, ${pNum(c[1],2)})`,pPurple,6,'pt-dc');
  svg+=pLine(sx(a[0]),sy(a[1]),sx(c[0]),sy(c[1]),pRule,1.5,'3 3');
  svg+=drawPoint(m[0],m[1],`中点 M (11, ${pNum(m[1],2)})`,pRed,7,'pt-dm');
 }else if(mode==='local'||mode==='partial'){
  const z=[4,4],dx=state.dx??1,dy=state.dy??-.6,step=state.step??.2;
  const q=[z[0]+step*dx,z[1]+step*dy];
  if(state.kind==='min'){
   svg+=drawIndifference('min',4,pPurple);
  }else{
   svg+=drawIndifference('product',16,pPurple);
   svg+=pLine(sx(1),sy(7),sx(7),sy(1),pGold,1.5,'4 4'); // Tangent line MRS=1
  }
  svg+=drawPoint(z[0],z[1],'z (4, 4)',pPurple,7,'pt-lz');
  svg+=pLine(sx(z[0]),sy(z[1]),sx(q[0]),sy(q[1]),pGreen,2);
  svg+=drawPoint(q[0],q[1],`扰动点 q (${pNum(q[0],2)}, ${pNum(q[1],2)})`,pGreen,7,'pt-lq');
 }else if(mode==='problems1'){
  if(state.kind==='distance'){
   svg+=drawIndifference('distance',6,pPurple);
   svg+=drawPoint(6,0,'(6, 0)',pPurple,6,'pt-p1a');
   svg+=drawPoint(0,6,'(0, 6)',pPurple,6,'pt-p1b');
   svg+=pLine(sx(6),sy(0),sx(0),sy(6),pGold,2,'3 3');
   svg+=drawPoint(3,3,'中点 (3, 3) 劣于两端',pRed,7,'pt-p1m');
  }else{
   svg+=drawPoint(2,2,'(2, 2)',pPurple,6,'pt-p1a');
   svg+=drawPoint(0,10,'(0, 10)',pPurple,6,'pt-p1b');
  }
 }else if(mode==='problems2'){
  if(state.kind==='max'){
   svg+=drawIndifference('max',6,pPurple);
   svg+=pLine(sx(6),sy(1),sx(1),sy(6),pGold,2,'3 3');
   svg+=drawPoint(3.5,3.5,'中点 (3.5, 3.5) 非凸',pRed,7,'pt-p2m');
  }else if(state.kind==='log'){
   svg+=drawIndifference('log',prefU('log',3,3),pGreen);
   svg+=drawPoint(3,3,'(3, 3) 严格凹曲面',pGreen,7,'pt-p2log');
  }
 }else if(mode==='problems4'){
  const v1=prefU('quasi',2,2),v2=v1+2;
  svg+=drawIndifference('quasi',v1,pPurple);
  svg+=drawIndifference('quasi',v2,pGreen);
  svg+=pLine(sx(4),sy(v1-2),sx(4),sy(v2-2),pGold,2,'3 3');
  svg+=pText(sx(4)+8,sy((v1+v2)/2-2),'垂直平移 k 单位',small?10:12,pGold);
 }else if(mode==='problems7'){
  const a=[5,5],b=[4,6.5];
  svg+=drawPoint(a[0],a[1],'基准 a (5, 5)',pPurple,7,'pt-p7a');
  svg+=drawPoint(b[0],b[1],'换后 b (4, 6.5)',pGreen,7,'pt-p7b');
  svg+=pLine(sx(a[0]),sy(a[1]),sx(b[0]),sy(b[1]),pGold,2,'3 3');
 }

 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${pEsc(frame.title)}">${svg}</svg>`;
}

const prefProofs={
 bundle:String.raw`<details class="sd-proof" open><summary>教材定义与几何公理：商品束与凸组合</summary><ol>
<li><strong>消费集合定义</strong>：<span class="equation">X = \mathbb{R}_+^2</span> 是非负二维向量空间，束 <span class="equation">x=(x_1, x_2)</span> 代表两件商品的数量。</li>
<li><strong>凸组合公式</strong>：对任意两束 <span class="equation">a, b \in X</span> 与权重 <span class="equation">\lambda \in [0, 1]</span>，<div class="equation">M(\lambda) = \lambda a + (1-\lambda)b = (\lambda a_1 + (1-\lambda)b_1, \lambda a_2 + (1-\lambda)b_2)</div>构成了连接 <span class="equation">a</span> 与 <span class="equation">b</span> 的闭线段。</li>
<li><strong>经济学抽象</strong>：商品不限于实体物品，亦可为闲暇、未来消费、环境质量或注意力分配。</li>
</ol></details>`,

 examples:String.raw`<details class="sd-proof" open><summary>六种经典偏好数学表达与等高线特征</summary><ol>
<li><strong>例4.1 完全替代（固定交换率）</strong>：<span class="equation">u(x)=v_1 x_1+v_2 x_2</span>，斜率恒为 <span class="equation">-v_1/v_2</span> 的平行线。</li>
<li><strong>例4.2 中性商品</strong>：<span class="equation">u(x)=x_2</span>，等高线为水平线，增加商品1效用不变。</li>
<li><strong>例4.3 阈值偏好</strong>：<span class="equation">x_1 \le 10 \implies u=x_1;\ x_1 > 10 \implies u=11+x_2</span>，在 <span class="equation">x_1=10</span> 发生跳跃，高水平集为左开半线。</li>
<li><strong>例4.4 完全互补（Leontief）</strong>：<span class="equation">u(x)=\min\{x_1, x_2\}</span>，L 形折线，拐角在对角线上。</li>
<li><strong>例4.5 曼哈顿理想点</strong>：<span class="equation">u(x)=-(|x_1-5|+|x_2-5|)</span>，以 (5, 5) 为中心的菱形。</li>
<li><strong>例4.6 字典式偏好</strong>：<span class="equation">x \succ y \iff x_1 > y_1</span> 或 <span class="equation">(x_1=y_1 \land x_2>y_2)</span>。每个无差异集仅含单点，无法用连续效用函数表示（命题1.2）。</li>
</ol></details>`,

 monotone:String.raw`<details class="sd-proof" open><summary>单调性（弱单调）与强单调性的严格公理区分</summary><ol>
<li><strong>定义4.2 单调性（弱单调）</strong>：<span class="equation">x \ge y \implies x \succeq y</span> 且 <span class="equation">x \gg y \implies x \succ y</span>。只有两个坐标都严格更多时才保证严格偏好。</li>
<li><strong>定义4.3 强单调性</strong>：<span class="equation">x \ge y</span> 且 <span class="equation">x \ne y \implies x \succ y</span>。只要任意一个坐标增加且不完全相同，就必须严格偏好。</li>
<li><strong>分界检验（完全互补品）</strong>：取 <span class="equation">x=(2, 2)</span> 与 <span class="equation">y=(3, 2)</span>，有 <span class="equation">y \ge x</span> 且 <span class="equation">y \ne x</span>。但 <span class="equation">\min(3, 2) = 2 = \min(2, 2) \implies y \sim x</span>，故完全互补品<strong>满足弱单调，但不满足强单调</strong>！</li>
</ol></details>`,

 continuity:String.raw`<details class="sd-proof" open><summary>严格证明：字典式偏好违反连续性公理</summary><ol>
<li><strong>定义4.4 连续性要求</strong>：若 <span class="equation">x \succ y</span>，则存在 <span class="equation">\epsilon > 0</span> 使得所有 <span class="equation">a \in B_\epsilon(x)</span> 与 <span class="equation">b \in B_\epsilon(y)</span> 满足 <span class="equation">a \succ b</span>。</li>
<li><strong>反例构造</strong>：令 <span class="equation">x=(1, 2)</span>，<span class="equation">y=(1, 0)</span>。因第一坐标相等而第二坐标 2>0，按字典序 <span class="equation">x \succ y</span>。</li>
<li><strong>任意小邻域内的扰动</strong>：对任意给定的 <span class="equation">\epsilon > 0</span>，取 <span class="equation">a_\epsilon = (1-\epsilon/2, 2)</span>。欧氏距离 <span class="equation">d(a_\epsilon, x) = \epsilon/2 < \epsilon</span>。</li>
<li><strong>矛盾产生</strong>：因第一坐标 <span class="equation">1-\epsilon/2 < 1</span>，由字典序第一坐标决定论，恒有 <span class="equation">a_\epsilon \prec y = (1, 0)</span>！故不存在满足条件的 <span class="equation">\epsilon</span> 邻域，字典序<strong>不连续</strong>。</li>
</ol></details>`,

 continuityproof:String.raw`<details class="sd-proof" open><summary>命题4.1 证明：连续实值效用函数表示的偏好必为连续偏好</summary><ol>
<li><strong>设定间隙</strong>：设 <span class="equation">x \succ y</span>，由 <span class="equation">u</span> 表示 ≽，必有实数正差值 <span class="equation">u(x) > u(y)</span>。令 <span class="equation">\epsilon = \frac{1}{3}(u(x) - u(y)) > 0</span>。</li>
<li><strong>连续性邻域选择</strong>：由 <span class="equation">u</span> 连续，存在 <span class="equation">\delta > 0</span>，使得：
<ul>
<li>当 <span class="equation">d(a, x) < \delta</span> 时，<span class="equation">u(a) > u(x) - \epsilon</span>；</li>
<li>当 <span class="equation">d(b, y) < \delta</span> 时，<span class="equation">u(b) < u(y) + \epsilon</span>。</li>
</ul></li>
<li><strong>链式放缩</strong>：<div class="equation">u(a) > u(x) - \epsilon = u(y) + 2\epsilon > u(y) + \epsilon > u(b)</div>
因此恒有 <span class="equation">u(a) > u(b) \implies a \succ b</span>，命题4.1证毕。</li>
</ol></details>`,

 intermediate:String.raw`<details class="sd-proof" open><summary>定理与证明：连续偏好的线段中间束存在性</summary><ol>
<li><strong>命题内容</strong>：设 ≽ 为连续偏好，且 <span class="equation">a \succ b \succ c</span>。则在连接 <span class="equation">a</span> 与 <span class="equation">c</span> 的线段上，必存在 <span class="equation">\lambda \in (0, 1)</span> 使得 <span class="equation">\lambda a + (1-\lambda)c \sim b</span>。</li>
<li><strong>证明思路</strong>：由命题4.1，偏好可用连续函数 <span class="equation">u</span> 表示。<span class="equation">u(a) > u(b) > u(c)</span>。定义线段上的连续一元函数 <span class="equation">g(\lambda) = u(\lambda a + (1-\lambda)c)</span>。</li>
<li><strong>由介值定理（IVT）</strong>：<span class="equation">g(1)=u(a) > u(b) > u(c)=g(0)</span>，由实数介值定理，必存在 <span class="equation">\lambda^* \in (0, 1)</span> 使得 <span class="equation">g(\lambda^*) = u(b)</span>，即 <span class="equation">\lambda^* a + (1-\lambda^*)c \sim b</span>。</li>
</ol></details>`,

 convex:String.raw`<details class="sd-proof" open><summary>定义4.5 凸偏好与严格凸偏好的数学公理</summary><ol>
<li><strong>凸偏好定义</strong>：<span class="equation">a \succeq b \implies \lambda a + (1-\lambda)b \succeq b,\quad \forall \lambda \in (0, 1)</span>。</li>
<li><strong>严格凸定义</strong>：<span class="equation">a \succeq b</span> 且 <span class="equation">a \ne b \implies \lambda a + (1-\lambda)b \succ b,\quad \forall \lambda \in (0, 1)</span>。</li>
<li><strong>典型比较</strong>：完全互补品 <span class="equation">\min\{x_1, x_2\}</span> 弱凸非严格凸；字典式偏好严格凸（第一分量内点仍严格大于较差端点）；<span class="equation">\max\{x_1, x_2\}</span> 非凸。</li>
</ol></details>`,

 upper:String.raw`<details class="sd-proof" open><summary>命题4.2 证明：偏好凸当且仅当所有上优集为几何凸集</summary><ol>
<li><strong>充分性（偏好凸 ⇒ 上优集凸）</strong>：设 <span class="equation">a, b \in B(x^*) = \{x : x \succeq x^*\}</span>，不妨设 <span class="equation">a \succeq b</span>。由传递性 <span class="equation">b \succeq x^*</span>。由偏好凸性，<span class="equation">\lambda a + (1-\lambda)b \succeq b \succeq x^*</span>，故内点落在 <span class="equation">B(x^*)</span> 内。</li>
<li><strong>必要性（上优集凸 ⇒ 偏好凸）</strong>：设所有上优集为凸集。任取 <span class="equation">a \succeq b</span>，则 <span class="equation">a, b \in B(b) = \{x : x \succeq b\}</span>。由集合凸性，<span class="equation">\lambda a + (1-\lambda)b \in B(b) \implies \lambda a + (1-\lambda)b \succeq b</span>。</li>
</ol></details>`,

 concave:String.raw`<details class="sd-proof" open><summary>命题4.3 与反例：凹效用函数是充分条件，但非必要条件！</summary><ol>
<li><strong>充分性证明（命题4.3）</strong>：设 <span class="equation">u</span> 为凹函数，<span class="equation">a \succeq b \implies u(a) \ge u(b)</span>。由凹函数定义：<div class="equation">u(\lambda a + (1-\lambda)b) \ge \lambda u(a) + (1-\lambda)u(b) \ge u(b) \implies \lambda a + (1-\lambda)b \succeq b</div>故偏好必然为凸偏好。</li>
<li><strong>非必要性反例</strong>：考察 <span class="equation">\tilde{u}(x) = (\min\{x_1, x_2\})^2</span>。它是序数等价的变换，偏好完全凸。但在 <span class="equation">a=(0,0)</span> 与 <span class="equation">b=(2,2)</span> 间，中点 <span class="equation">\tilde{u}(1,1)=1 < 2 = 0.5\tilde{u}(a)+0.5\tilde{u}(b)</span>，函数<strong>非凹</strong>！证明了偏好凸无法反推效用函数凹。</li>
</ol></details>`,

 declining:String.raw`<details class="sd-proof" open><summary>边际替代率递减的几何反证法（无需导数）</summary><ol>
<li><strong>设定</strong>：取 <span class="equation">a=(10,10) \sim b=(11, 10-\beta) \sim c=(12, 10-\beta-\gamma)</span>。</li>
<li><strong>反设递增</strong>：假设 <span class="equation">\beta < \gamma</span>，则 <span class="equation">\beta < \frac{\beta+\gamma}{2} \implies 10 - \frac{\beta+\gamma}{2} < 10 - \beta</span>。</li>
<li><strong>中点矛盾</strong>：中点 <span class="equation">M = \frac{1}{2}a + \frac{1}{2}c = (11, 10-\frac{\beta+\gamma}{2})</span>。
<ul>
<li>由强单调性，纵坐标更少意味着 <span class="equation">M \prec b = (11, 10-\beta)</span>。</li>
<li>由凸性，<span class="equation">a \sim c \implies M \succeq c \sim b</span>。</li>
</ul>
两式矛盾！故假设不成立，必有 <span class="equation">\beta \ge \gamma</span>（边际替代率递减）。</li>
</ol></details>`,

 local:String.raw`<details class="sd-proof" open><summary>定义4.6 局部估值与平滑切线公理</summary><ol>
<li><strong>局部估值定义</strong>：若存在 <span class="equation">(v_1(z), v_2(z)) \ge 0</span>，使得 <span class="equation">v_1 \delta_1 + v_2 \delta_2 > 0 \implies \exists \epsilon > 0,\ z + \epsilon(\delta_1, \delta_2) \succ z</span>。</li>
<li><strong>几何实质</strong>：支撑超平面。在平滑点切线斜率确定；在折点（如 <span class="equation">\min\{x_1, x_2\}</span> 在对角线上），任意支撑线下方都有改善受阻区域，不存在单一局部估值对。</li>
</ol></details>`,

 partial:String.raw`<details class="sd-proof" open><summary>命题4.4 证明结论：连续偏导数即为局部估值向量</summary><ol>
<li><strong>命题结论</strong>：若偏好单调凸，且效用函数 <span class="equation">u</span> 具有连续偏导数，则 <span class="equation">(u_1(z), u_2(z)) = (\partial u/\partial x_1, \partial u/\partial x_2)</span> 是合法的局部估值。</li>
<li><strong>边际替代率</strong>：<span class="equation">MRS_{12} = \frac{u_1}{u_2} = -\left.\frac{dx_2}{dx_1}\right|_{u=\text{const}}</span>。</li>
<li><strong>比例不变性</strong>：对任意 <span class="equation">\alpha > 0</span>，<span class="equation">(\alpha u_1, \alpha u_2)</span> 亦为合法局部估值，符合序数效用理论。</li>
</ol></details>`,

 problems1:String.raw`<details class="sd-proof" open><summary>习题4.1 解析：三种偏好的单调性、连续性与凸性</summary><ol>
<li><strong>(a) 离原点距离 <span class="equation">\sqrt{x_1^2+x_2^2}</span></strong>：强单调、连续，但<strong>非凸</strong>（反例：(6,0) 与 (0,6) 效用均为 6，中点 (3,3) 效用仅 <span class="equation">3\sqrt{2} \approx 4.24 < 6</span>）。</li>
<li><strong>(b) 平衡束优先</strong>：对角线效用跳跃，<strong>不连续、非凸</strong>。</li>
<li><strong>(c) sumlex（先比总量再比第一分量）</strong>：强单调、<strong>严格凸</strong>（类似字典序，内点总量或分量必有优势），但扰动破坏总量比较，<strong>不连续</strong>。</li>
</ol></details>`,

 problems2:String.raw`<details class="sd-proof" open><summary>习题4.2 解析：三种效用函数性质核验</summary><ol>
<li><strong>(a) <span class="equation">\max\{x_1, x_2\}</span></strong>：单调、连续，但<strong>非凸</strong>（反例：(6,1) 与 (1,6) 效用为 6，中点 (3.5, 3.5) 效用 3.5<6）。</li>
<li><strong>(b) <span class="equation">x_1 - x_2</span></strong>：商品2为坏品，<strong>不满足单调性</strong>。</li>
<li><strong>(c) <span class="equation">\ln(1+x_1) + \ln(1+x_2)</span></strong>：梯度处处为正（强单调），Hessian 负定（严格凹），故<strong>强单调、连续且严格凸</strong>。</li>
</ol></details>`,

 problems3:String.raw`<details class="sd-proof" open><summary>习题4.3 证明：对角线上的无差异束存在性</summary><ol>
<li><strong>边界夹逼</strong>：对任意 <span class="equation">x</span>，<span class="equation">(0,0) \le x \le (M, M)</span>，其中 <span class="equation">M=\max\{x_1, x_2\}</span>。由单调性：<span class="equation">(0,0) \preceq x \preceq (M, M)</span>。</li>
<li><strong>介值定理</strong>：沿对角线考察连续函数 <span class="equation">g(t) = u(t, t)</span>，<span class="equation">g(0) \le u(x) \le g(M)</span>。由介值定理必存在 <span class="equation">t^* \in [0, M]</span> 使得 <span class="equation">(t^*, t^*) \sim x</span>。若偏好强单调，<span class="equation">t^*</span> 严格唯一。</li>
</ol></details>`,

 problems4:String.raw`<details class="sd-proof" open><summary>习题4.4 证明：拟线性偏好无差异曲线为垂直平移</summary><ol>
<li><strong>方程解出</strong>：<span class="equation">u = x_2 + v(x_1) \iff x_2 = u - v(x_1)</span>。</li>
<li><strong>平移性质</strong>：效用增加 <span class="equation">k</span> 单位，纵坐标整体平移 <span class="equation">k</span> 单位：<span class="equation">\partial x_2/\partial u = 1</span>。斜率 <span class="equation">MRS = v'(x_1)</span> 与 <span class="equation">x_2</span> 完全无关。</li>
</ol></details>`,

 problems5:String.raw`<details class="sd-proof" open><summary>习题4.5 证明：完全互补品 <span class="equation">\min\{x_1, x_2\}</span> 为凸偏好</summary><ol>
<li><strong>凹性证明</strong>：两个仿射函数 <span class="equation">f(x)=x_1</span> 与 <span class="equation">g(x)=x_2</span> 为凹函数。由极小值性质，<span class="equation">\min\{f, g\}</span> 满足凹函数定义。</li>
<li><strong>应用命题4.3</strong>：凹函数表示的偏好必为凸偏好，故 <span class="equation">\min\{x_1, x_2\}</span> 必为凸偏好（弱凸非严格凸）。</li>
</ol></details>`,

 problems6:String.raw`<details class="sd-proof" open><summary>习题4.6 证明：负曼哈顿距离理想点偏好连续且凸</summary><ol>
<li><strong>连续性</strong>：绝对值与负和处处连续，由命题4.1偏好连续。</li>
<li><strong>凹性证明</strong>：由三角不等式，<span class="equation">|x_i - x_i^*|</span> 凸，故相反数凹，和函数 <span class="equation">u</span> 凹。由命题4.3偏好为凸。</li>
</ol></details>`,

 problems7:String.raw`<details class="sd-proof" open><summary>习题4.7 证明与校准：相对更偏爱商品1的公理分析</summary><ol>
<li><strong>公理前件</strong>：<span class="equation">(a_1-\alpha, a_2+\beta) \succeq_1 a \implies (a_1-\alpha, a_2+\beta) \succ_2 a</span>。</li>
<li><strong>完全替代判定</strong>：若个体1效用为 <span class="equation">v_1 x_1+x_2</span>，个体2为 <span class="equation">w_1 x_1+x_2</span>。前件要求 <span class="equation">\beta/\alpha \ge v_1</span>，后件要求 <span class="equation">\beta/\alpha > w_1</span>。充要条件为 <span class="equation">w_1 < v_1</span>（个体1相对更看重商品1）。</li>
<li><strong>边界校准</strong>：字典序下少拿商品1永不改善，前件永远为假，极端序关系需特别除外讨论。</li>
</ol></details>`
};

export function renderPrefStory(mode,phase){
 const story=prefStories[mode]||prefStories.bundle;
 const frame=prefFrame(mode,phase);
 const readout=prefReadout(mode,frame);
 const small=pEl('plot').clientWidth<500;
 const plot=pEl('plot');

 Object.assign(plot.dataset,{filmIntro:story.intro,filmPhase:frame.title,filmNarration:frame.narration,filmConclusion:story.end,phase:String(phase)});
 window.microMotion.chart(plot,pChart(mode,frame,small));
 pEl('legend').textContent='绿色代表当前分析对象/无差异集；紫色为比较基准/端点；金色标记混合束、折中点或切线；红色为反例或矛盾点。';

 const metrics=[
  ['当前画面',`${phase+1} / ${story.frames.length}`],
  ['本节场景',mode],
  ['核心指标',mode==='bundle'?`λ=${frame.state.lambda??.5}`:mode==='intermediate'?`λ*≈${pNum(frame.state.t,3)}`:mode==='continuity'?`ε=${frame.state.eps}`:'理论分析']
 ];
 pEl('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${pEsc(k)}</label><strong>${pEsc(v)}</strong></div>`).join('');
 pEl('reading').textContent=frame.narration;
 pEl('formula').textContent=frame.formula;
 pEl('boundary').textContent=`Osborne–Rubinstein §4.1—4.6，印刷45—56页／PDF64—75。${frame.source}。`;
 pEl('extra').innerHTML=prefProofs[mode]||'';

 pEl('step').value=phase;
 pEl('advance').disabled=phase>=story.frames.length-1;
 pEl('play').disabled=phase>=story.frames.length-1;

 const link=document.querySelector('.lesson-end a[download]');
 if(link){
  link.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch4-${mode}.html`;
  link.textContent='下载本段完整动画代码 ↓';
 }
 window.microMath?.refresh();
 return {mode,phase,readout};
}

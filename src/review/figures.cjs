'use strict';
const {inline,escape}=require('../guided/format.cjs');
const green='#196b5b',red='#aa543e',blue='#486b9e',muted='#7c8878';
const line=(x1,y1,x2,y2,color=muted,dash='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="2" fill="none"${dash?' stroke-dasharray="'+dash+'"':''}/>`;
const text=(x,y,label,color='#253d37',anchor='middle')=>`<text x="${x}" y="${y}" fill="${color}" font-size="20" text-anchor="${anchor}">${escape(label)}</text>`;
const dot=(x,y,color=green)=>`<circle cx="${x}" cy="${y}" r="4.5" fill="${color}"/>`;
function curve(fn,x0,x1,sx,sy,color){const values=Array.from({length:121},(_,i)=>{const x=x0+(x1-x0)*i/120;return (i?'L':'M')+sx(x).toFixed(2)+' '+sy(fn(x)).toFixed(2)});return `<path d="${values.join('')}" fill="none" stroke="${color}" stroke-width="3"/>`;}
const frame=(body,title)=>`<svg viewBox="0 0 560 350" role="img" aria-label="${escape(title)}">${body}</svg>`;
function risk(){const sx=x=>65+410*x,sy=y=>295-230*y,f=x=>Math.sqrt(x);const a=.08,b=.88,l=.47,m=l*a+(1-l)*b,ev=l*f(a)+(1-l)*f(b);return frame(line(60,35,60,295)+line(60,295,510,295)+text(520,317,'z')+text(55,24,'v(z)')+curve(f,0,1,sx,sy,green)+line(sx(a),sy(f(a)),sx(b),sy(f(b)),red)+line(sx(m),295,sx(m),sy(f(m)),muted,'4 5')+dot(sx(m),sy(f(m)))+dot(sx(m),sy(ev),red)+text(310,43,'凹函数在弦上方',green)+text(sx(m)+15,sy(f(m))-10,'v(E(p))',green,'start')+text(sx(m)+15,sy(ev)+23,'Σ p(z)v(z)',red,'start')+text(sx(m),326,'E(p)'),'伯努利效用的凹性与期望效用比较');}
function budget(){return frame(`<path d="M90 290V58L460 290Z" fill="#e2ead8"/>`+line(90,35,90,290)+line(90,290,505,290)+line(90,58,460,290,green)+text(78,29,'x₂')+text(518,300,'x₁')+text(73,315,'0')+text(72,62,'w/p₂',green,'end')+text(458,319,'w/p₁',green)+text(220,226,'p₁x₁+p₂x₂ ≤ w',green)+text(345,106,'斜率 −p₁/p₂',green),'正价格和非负财富下的预算集');}
function monopoly(){const sx=y=>70+365*y,sy=v=>290-235*v,P=y=>1-y,MR=y=>1-2*y,MC=y=>.6*y,ym=1/2.6,yc=1/1.6;
return frame(`<path d="M${sx(ym)} ${sy(P(ym))}L${sx(yc)} ${sy(P(yc))}L${sx(ym)} ${sy(MC(ym))}Z" fill="#e4bd6d" opacity=".55"/>`+line(70,25,70,290)+line(70,290,490,290)+curve(P,0,1,sx,sy,red)+curve(MR,0,.5,sx,sy,green)+curve(MC,0,1,sx,sy,blue)+line(sx(ym),290,sx(ym),sy(P(ym)),muted,'4 5')+line(sx(yc),290,sx(yc),sy(P(yc)),muted,'4 5')+line(70,sy(P(ym)),sx(ym),sy(P(ym)),muted,'4 5')+text(54,29,'$')+text(505,297,'y')+text(sx(ym),321,'y*')+text(sx(yc),321,'y꜀')+text(450,134,'MC(y)',blue)+text(411,257,'P(y)',red)+text(205,278,'MR(y)',green)+text(287,171,'DWL','#845c25')+text(57,sy(P(ym))+7,'P(y*)',red,'end'),'统一价格垄断产量、效率产量与无谓损失');}
function edgeworth(){const sx=x=>85+x*38,sy=y=>290-y*28,k=20;return frame(`<rect x="85" y="66" width="380" height="224" fill="none" stroke="${muted}"/>`+line(85,66,465,290,muted)+curve(x=>k/x,2.5,10,sx,sy,green)+curve(x=>8-k/(10-x),0,7.5,sx,sy,blue)+dot(sx(5),sy(4))+dot(sx(3),sy(5.6),red)+text(sx(3)-17,sy(5.6)-12,'e',red)+text(sx(5)+21,sy(4)+23,'a*')+text(63,319,'O₁')+text(483,58,'O₂')+text(315,326,'x₁¹ →')+text(278,36,'← x₁²')+text(52,173,'↑ x₂¹')+text(504,181,'x₂² ↓')+text(395,241,'预算线',muted)+text(396,147,'个体 1',green)+text(187,111,'个体 2',blue),'埃奇沃思盒中的共同价格、初始禀赋与均衡配置');}
function deviation(){return frame(line(270,55,140,135,red)+line(270,55,390,135)+line(390,135,295,235,red)+line(390,135,480,235)+dot(270,55)+dot(390,135)+text(270,35,'h : i')+text(410,119,'h′ : i')+text(190,85,'a',red)+text(346,81,'a′')+text(330,183,'b',red)+text(453,182,'b′')+text(140,165,'uⁱ')+text(295,268,'wⁱ')+text(485,268,'vⁱ')+text(290,326,'若 vⁱ > wⁱ，则在 h′ 存在一次有利偏离',red),'单次偏离性质证明中的历史与后续行动');}
// Each item is traced to a figure actually used by the primary textbook.
const plates={
 '3.5':{number:'3.2',page:40,draw:risk,caption:'凹性让确定均值的效用不低于彩票的期望效用。图中弦与加权点补示命题 3.3 的证明：$v(E(p))\\ge\\sum_z p(z)v(z)$。'},
 '5.1':{number:'5.1',page:58,draw:budget,caption:'横、纵截距分别是 $\\frac{w}{p_1}$、$\\frac{w}{p_2}$；边界斜率是 $-\\frac{p_1}{p_2}$。阴影连同边界组成预算集。'},
 '7.2':{number:'7.2',page:93,draw:monopoly,caption:'在图示单交点情形，$MR=MC$ 定出 $y^*$，再到需求线上读价格；$P=MC$ 定出 $y_c$。两产量之间需求线与边际成本线夹住的面积是无谓损失。'},
 '10.9':{number:'10.4(a)',page:152,draw:edgeworth,caption:'同一个点按两个相反的原点读出双方消费。预算线通过初始禀赋 $e$；共同切点 $a^*$ 同时满足双方最优与资源相容。此图用于说明光滑内点情形，均衡的定义仍是预算最优与市场出清。'},
 '16.3':{number:'16.4',page:261,draw:deviation,caption:'固定其他人的策略。若把多次偏离压缩到最后一个需改变的历史后仍能提高收益，就产生一次有利偏离；这与单次偏离性质矛盾。收益符号按原书使用 $u^i,w^i,v^i$。'}
};
function textbookFigure(id){const f=plates[id];if(!f)return '';return `<figure class="formal-figure" data-textbook-figure="${f.number}">${f.draw()}<figcaption>${inline(f.caption)}<small>Osborne–Rubinstein · 图 ${f.number} · 英文本第 ${f.page} 页。本站按教材结构用代码重绘，曲线形状示意；不附加数值题设。</small></figcaption></figure>`;}
module.exports={textbookFigure,plates};

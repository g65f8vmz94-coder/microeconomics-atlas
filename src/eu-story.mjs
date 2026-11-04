/* Section 3.3: Expected utility, authored scenes from Osborne–Rubinstein 2020.12.21(h), printed pp.35–38 (PDF pp.54–57).
 * Every displayed probability and utility is computed from the section's pure model functions.
 * Site-authored numerical values and everyday contexts are explicitly labeled in `source`.
 */
import {lottery,mixture,support,expected,continuityWeight} from './uncertainty.mjs';

export const euBaseBernoulli=[10,6,2];
export const euCanonicalBernoulli=[1,.5,0];

export function affineBernoulli(v,alpha,beta){
 if(!Number.isFinite(alpha)||!Number.isFinite(beta))throw Error('仿射参数必须为有限实数');
 return v.map(x=>alpha*x+beta);
}

export function canonicalReduction(p,v){
 lottery(p);
 if(p.length!==v.length||v.some(x=>!Number.isFinite(x)||x<0||x>1))throw Error('标准折算权重必须在 [0,1] 内');
 const mBest=expected(p,v);
 return lottery([mBest,0,1-mBest]);
}

export const euStories=(()=>{
 const P=(a,b,c=0)=>[a,b,c];
 const A=P(1,0,0),B=P(0,1,0),C=P(0,0,1);
 const scene=(title,narration,p,q,v,formula,source,extra={})=>({title,narration,p,q,v,formula,source,...extra});
 return {
  eu:{
   intro:'抽盲盒或商场代金券时，你心里会先给每种奖品打一个“满意分”（伯努利数）。评价整张抽奖券，就是把每种奖品的满意分按抽中概率加权相加。',
   end:'定义3.5把“确定奖品的伯努利函数 v(z)”与“彩票的期望效用函数 U(p)=∑p(z)v(z)”分开：先给每个确定结果赋实数 v(z)，再对概率求加权和，以此比较任意两张彩票。',
   labels:['特等奖 a','二等奖 b','参与奖 c'],
   frames:[
    scene('先给每个确定奖品赋伯努利数','设奖品集合为 Z={a,b,c}。伯努利函数 v:Z→ℝ 给每个确定奖品一个实数（自主示例取 v(a)=10、v(b)=6、v(c)=2）。对确定拿到 a 的退化彩票 [a]，期望效用就是 U([a])=v(a)=10；确定拿到 b 则是 U([b])=v(b)=6。',A,B,[10,6,2],String.raw`U([z])=v(z),\quad v:Z\to\mathbb{R}`,'原书定义3.5 · 印刷35—36页（v取值为自主示例）',{kind:'eu'}),
    scene('按概率加权求和得到彩票效用','甲票 p=(0.5, 0.3, 0.2) 把三项贡献 0.5×10、0.3×6、0.2×2 相加，得 U(p)=7.2；乙票 q=(0.2, 0.6, 0.2) 得 U(q)=6.0。因为 7.2>6.0，甲票严格优于乙票。',P(.5,.3,.2),P(.2,.6,.2),[10,6,2],String.raw`U(p)=\sum_{z\in Z}p(z)v(z)=7.2>6.0=U(q)`,'原书定义3.5 · 自主数值',{kind:'eu'}),
    scene('概率向更好奖品移动，总效用连续上升','把甲票特等奖 a 的机会从 0.5 提高到 0.7、二等奖 b 降到 0.1，确定奖品的伯努利数 v(z) 保持不变，甲票期望效用升至 U(p)=8.0。',P(.7,.1,.2),P(.2,.6,.2),[10,6,2],String.raw`p\succeq q\iff \sum_{z\in Z}p(z)v(z)\ge\sum_{z\in Z}q(z)v(z)`,'原书定义3.5 · 印刷36页',{kind:'eu'}),
    scene('分布不同但加权和相等，两票无差异','甲票 p=(0.4, 0.2, 0.4) 更分散，乙票 q=(0.1, 0.8, 0.1) 更集中，但两者的加权和都是 6.0。在期望效用偏好下，只要总期望效用相等，两张彩票就无差异。',P(.4,.2,.4),P(.1,.8,.1),[10,6,2],String.raw`U(p)=4+1.2+0.8=6=U(q)\iff p\sim q`,'原书定义3.5 · 自主对照',{kind:'eu'}),
    scene('零概率奖品对期望效用的贡献为零','当甲票不再包含参与奖 c，即 p=(0.5, 0.5, 0)，c 那一项的权重为 0，加权和只由正概率支撑集中的 a、b 决定，得 U(p)=8.0。',P(.5,.5,0),P(.2,.6,.2),[10,6,2],String.raw`p(c)=0\implies p(c)v(c)=0,\quad U(p)=\sum_{z\in\operatorname{supp}(p)}p(z)v(z)`,'原书定义3.5 · 自主边界',{kind:'eu'}),
    scene('分清伯努利函数 v 与期望效用 U','v(z) 定义在确定奖品 Z 上，称为伯努利函数；U(p) 定义在彩票集合 L(Z) 上，是对 v(z) 求期望。即便奖品是金额，比较的也是 E_p[v(z)]，而非先算平均金额再代入 v。',P(.5,0,.5),B,[10,6,2],String.raw`v:Z\to\mathbb{R}\text{（伯努利函数）},\quad U(p)=\sum_{z\in Z}p(z)v(z)\text{（彩票效用）}`,'原书定义3.5 · 印刷36页',{kind:'eu'})
   ]
  },
  euimplies:{
   intro:'一旦按“伯努利数加权和”比较彩票，为什么不会像悲观者那样在边界断崖跳变，也不会因掺入共同分支而翻盘？命题3.1用两步代数直接给出证明。',
   end:'命题3.1证明期望效用必满足连续性与独立性：连续性用 α=(v(b)−v(c))/(v(a)−v(c))∈(0,1) 精确解出无差异混合；独立性消去公共分支后，用正权重 αₖ>0 保持不等号方向。',
   labels:['好奖品 a','中奖品 b','差奖品 c'],
   frames:[
    scene('连续性第一步：严格三层纯奖品转成实数不等式','设确定奖品满足 [a]≻[b]≻[c]。因为 U([z])=v(z) 表示偏好，这等价于三个实数严格递减 v(a)>v(b)>v(c)（自主示例取 10>6>2）。',A,B,[10,6,2],String.raw`[a]\succ[b]\succ[c]\iff v(a)>v(b)>v(c)`,'原书命题3.1证明 · 印刷36页',{kind:'continuity'}),
    scene('连续性第二步：解线性方程得内部权重 α','混合票 α·a⊕(1−α)·c 的期望效用是 αv(a)+(1−α)v(c)。令它等于 v(b)，唯一解为 α=(v(b)−v(c))/(v(a)−v(c))。代入 10、6、2 得 α=0.5∈(0,1)。',P(.5,0,.5),B,[10,6,2],String.raw`\alpha=\frac{v(b)-v(c)}{v(a)-v(c)}=\frac{6-2}{10-2}=0.5\in(0,1)`,'原书命题3.1证明 · 印刷36页（数值为自主示例）',{kind:'continuity'}),
    scene('连续性第三步：只要 v(a)>v(b)>v(c)，α 必在 (0,1) 内','若中奖品的伯努利数改为 v(b)=8（仍满足 10>8>2），公式给出 α=(8−2)/(10−2)=0.75∈(0,1)。一般地，分子 v(b)−v(c)>0 且严格小于分母 v(a)−v(c)，故 0<α<1 恒成立。',P(.75,0,.25),B,[10,8,2],String.raw`0<v(b)-v(c)<v(a)-v(c)\implies 0<\alpha=\frac{v(b)-v(c)}{v(a)-v(c)}<1`,'原书命题3.1证明 · 印刷36页',{kind:'continuity'}),
    scene('独立性第一步：先比较被替换的单一分支','考虑被替换分支 [zₖ]（取 [b]，效用 6）与二元票 r=β·a⊕(1−β)·c（取 β=0.75，效用 8）。在放入复合彩票前，先有 v(zₖ)=6 < 8=βv(a)+(1−β)v(c)。',B,P(.75,0,.25),[10,6,2],String.raw`[z_k]\succeq \beta\cdot a\oplus(1-\beta)\cdot c\iff v(z_k)\ge \beta v(a)+(1-\beta)v(c)`,'原书命题3.1证明 · 印刷36—37页',{kind:'independence',alphaK:1,common:P(0,0,1)}),
    scene('独立性第二步：装入共同分支，公共项代数相消','把两支分别装进权重 αₖ=0.5 的分支，其余 0.5 走同一公共分布（0.6a+0.4c，贡献 3.4）。左票 P=(0.3, 0.5, 0.2) 得 6.4，右票 Q=(0.675, 0, 0.325) 得 7.4；两边的公共项 3.4 在相减时完全抵消。',P(.3,.5,.2),P(.675,0,.325),[10,6,2],String.raw`U(P)-U(Q)=\alpha_k\bigl(v(z_k)-\beta v(a)-(1-\beta)v(c)\bigr)`,'原书命题3.1证明 · 印刷36—37页（注：36页末行末项误印为 α_K·q_K，37页首行恢复为 α_K v(z_K)）',{kind:'independence',alphaK:.5,common:P(.6,0,.4)}),
    scene('独立性第三步：正权重 αₖ>0 保证双向等价','教材第37页写明 since αₖ>0：在不等式两边同乘或同除以严格正数 αₖ，不等号方向不变，因此复合彩票比较 P≽Q 与单支比较 [zₖ]≽r 双向等价。',P(.3,.5,.2),P(.675,0,.325),[10,6,2],String.raw`\alpha_k>0:\quad \alpha_kv(z_k)\ge \alpha_k\bigl(\beta v(a)+(1-\beta)v(c)\bigr)\iff v(z_k)\ge \beta v(a)+(1-\beta)v(c)`,'原书命题3.1证明 · 印刷37页',{kind:'independence',alphaK:.5,common:P(.6,0,.4)}),
    scene('零权重边界校准：αₖ=0 时不可除以零逆推','若被替换分支权重 αₖ=0，左票与右票都退化为公共分支本身（效用均为 6.8），此时 P∼Q 恒成立，不能除以 0 倒推 [zₖ]∼r。教材证明中的 αₖ>0 正是这一步的充要保障。',P(.6,0,.4),P(.6,0,.4),[10,6,2],String.raw`\alpha_k=0\implies P=Q,\quad\text{不可由 }U(P)=U(Q)\text{ 除以 }0\text{ 逆推}`,'原书证明条件校准 · 印刷37页',{kind:'independence',alphaK:0,common:P(.6,0,.4)})
   ]
  },
  eurep:{
   intro:'反过来，如果只知道一个人的偏好满足连续性和独立性，手头还没有任何分值，怎样无中生有造出伯努利函数？命题3.2用“最好奖品 M 与最差奖品 m 的标准二元尺”完成了构造。',
   end:'命题3.2（本章核心定理）：有限奖品集上，连续性与独立性推出期望效用表示。当 [M]≻[m] 时，每个奖品的伯努利数 v(z) 就是与 [z] 无差异的 M/m 二元彩票中 M 的唯一概率；当 [M]∼[m] 时，所有彩票无差异，取 v(z)=0。',
   labels:['最好 M','中间 z₂','最差 m'],
   frames:[
    scene('第一步：在有限奖品集上排出最好 M 与最差 m','设有限奖品集 Z={z₁,…,z_K} 按确定彩票排为 [z₁]≽⋯≽[z_K]，记最好奖品 z₁=M、最差奖品 z_K=m。先证主情形 [M]≻[m]（三奖品示例 [M]≻[z₂]≻[m]）。',A,C,[1,.5,0],String.raw`[z_1]\succeq\cdots\succeq[z_K],\quad z_1=M,\ z_K=m,\quad [M]\succ[m]`,'原书命题3.2证明 · 印刷37页',{kind:'eurep',stage:'order'}),
    scene('第二步：用连续性与单调性标定每个奖品的 v(z)','对每个奖品 z，由连续性存在 v(z)∈[0,1] 使 [z]∼v(z)·M⊕(1−v(z))·m；再由引理3.1（单调性），该数值唯一！端点 v(M)=1、v(m)=0，示例中间奖品满足 [z₂]∼0.5·M⊕0.5·m，故 v(z₂)=0.5。',B,P(.5,0,.5),[1,.5,0],String.raw`[z]\sim v(z)\cdot M\oplus(1-v(z))\cdot m,\quad v(M)=1,\ v(z_2)=0.5,\ v(m)=0`,'原书命题3.2证明 · 印刷37页（v(z₂)=0.5为自主示例）',{kind:'eurep',stage:'calibrate'}),
    scene('第三步：任取两张待比较的多奖品彩票 p 与 q','现在要比较任意两张彩票，如甲票 p=(0.5, 0.4, 0.1) 与乙票 q=(0.4, 0.2, 0.4)。它们同时含有 M、z₂、m 三种奖品，还不能直接套用两奖品单调性。',P(.5,.4,.1),P(.4,.2,.4),[1,.5,0],String.raw`p=p(z_1)\cdot z_1\oplus\cdots\oplus p(z_K)\cdot z_K`,'原书命题3.2证明 · 印刷37页（p,q为自主示例）',{kind:'eurep',stage:'compare'}),
    scene('第四步：连续应用 K 次独立性，逐项替换纯奖品','把 p 中的每个纯奖品 zₖ 替换成与它无差异的二元彩票 v(zₖ)·M⊕(1−v(zₖ))·m。连续应用 K 次独立性后，原彩票 p 与替换后的复合彩票保持无差异。',P(.5,.4,.1),P(.7,0,.3),[1,.5,0],String.raw`p\sim p(z_1)\cdot\bigl(v(z_1)M\oplus(1-v(z_1))m\bigr)\oplus\cdots\oplus p(z_K)\cdot\bigl(v(z_K)M\oplus(1-v(z_K))m\bigr)`,'原书命题3.2证明 · 印刷37页',{kind:'eurep',stage:'replace'}),
    scene('第五步：压平复合彩票，汇总得到 M 的总概率','按复合彩票规则把所有通向 M 的路径概率相加，原彩票 p=(0.5, 0.4, 0.1) 压平为只含 M 和 m 的二元彩票 (0.70, 0, 0.30)，其中 M 的总概率恰好是 ∑p(zₖ)v(zₖ)=0.70。',P(.7,0,.3),P(.5,0,.5),[1,.5,0],String.raw`p\sim\Bigl(\sum_{k=1}^K p(z_k)v(z_k)\Bigr)\cdot M\oplus\Bigl(1-\sum_{k=1}^K p(z_k)v(z_k)\Bigr)\cdot m`,'原书命题3.2证明 · 印刷37页',{kind:'eurep',stage:'collapse'}),
    scene('第六步：由引理3.1（单调性）完成表示定理','乙票 q=(0.4, 0.2, 0.4) 同样压平为 0.50·M⊕0.50·m。已知 [M]≻[m]，引理3.1给出：p≽q 当且仅当折算后 M 的概率更高，即 ∑p(zₖ)v(zₖ) ≥ ∑q(zₖ)v(zₖ)（0.70>0.50 ⇒ p≻q）。',P(.7,0,.3),P(.5,0,.5),[1,.5,0],String.raw`p\succeq q\iff \sum_{k=1}^K p(z_k)v(z_k)\ge\sum_{k=1}^K q(z_k)v(z_k)`,'原书命题3.2证明 · 印刷37—38页',{kind:'eurep',stage:'lemma'}),
    scene('第七步：补齐边界情形 [M]∼[m]','教材第38页指出：若 [M]∼[m]，则所有确定奖品彼此无差异；由独立性可知任意彩票 p∼[M]，即所有彩票全都无差异。此时令 v(zₖ)=0，常数函数 U(p)=0 同样表示该偏好。',P(.5,.4,.1),P(.4,.2,.4),[0,0,0],String.raw`[M]\sim[m]\implies (\forall p\in L(Z))\ p\sim[M],\quad v(z_k)=0,\ U(p)=0`,'原书命题3.2证明末段 · 印刷38页',{kind:'eurep',stage:'flat'})
   ]
  },
  affine:{
   intro:'把温度从摄氏度改成华氏度（乘正数再加常数），哪天更热不会改变；但如果把每个奖品的伯努利数直接平方，两张彩票的高低还会保持不变吗？',
   end:'教材第38页 Comment：伯努利函数 v 与 w 表示同一期望效用偏好，当且仅当存在 α>0 与 β 使 w(z)=αv(z)+β。这与第1章确定性效用允许任意严格递增非线性变换有本质区别。',
   labels:['特等奖 a','二等奖 b','参与奖 c'],
   frames:[
    scene('基准刻度：在 [0,1] 尺上比较两张彩票','先取命题3.2构造出的基准伯努利数 v=(1, 0.5, 0)。甲票 p=(0.35, 0.10, 0.55) 的期望效用为 U(p)=0.40；乙票 q=(0.10, 0.70, 0.20) 的期望效用为 U(q)=0.45，故 p≺q。',P(.35,.10,.55),P(.10,.70,.20),[1,.5,0],String.raw`v=(1,0.5,0),\quad U(p)=0.40<0.45=U(q)\implies p\prec q`,'原书§3.3 Comment · 自主示例',{kind:'affine',alpha:1,beta:0,base:[1,.5,0]}),
    scene('正仿射变换：同乘正数 α=8 再加 β=2','令 w(z)=8v(z)+2=(10, 6, 2)。因为彩票概率之和 ∑p(z)=1，新期望效用恰好是 Ũ(p)=8U(p)+2：甲票变为 5.2，乙票变为 5.6，差值乘以正数 8，p≺q 严格保持。',P(.35,.10,.55),P(.10,.70,.20),[10,6,2],String.raw`w(z)=\alpha v(z)+\beta\ (\alpha>0)\implies \tilde U(p)=\alpha U(p)+\beta`,'原书§3.3 Comment · 印刷38页',{kind:'affine',alpha:8,beta:2,base:[1,.5,0]}),
    scene('平移到负数区间：α=0.5、β=−1 仍保序','再取 α=0.5>0、β=−1，得 w(z)=(−0.5, −0.75, −1)。伯努利数取负值毫不影响比较：Ũ(p)=−0.80 < −0.775=Ũ(q)，所有彩票的偏好次序完全不变。',P(.35,.10,.55),P(.10,.70,.20),[-.5,-.75,-1],String.raw`\alpha>0:\quad \tilde U(p)-\tilde U(q)=\alpha\bigl(U(p)-U(q)\bigr)\text{ 符号不变}`,'原书§3.3 Comment · 自主示例',{kind:'affine',alpha:.5,beta:-1,base:[1,.5,0]}),
    scene('双向唯一性：同一偏好的伯努利函数只差正仿射变换','教材第38页指出逆命题同样成立（原书省略证明）：若 v 与 w 都是同一偏好关系的期望效用表示中的伯努利函数，则必存在 α>0 和 β 使 w(z)=αv(z)+β 对所有 z∈Z 成立。',P(.35,.10,.55),P(.10,.70,.20),[10,6,2],String.raw`v,w\text{ 表示同一 }\succeq\iff \exists\,\alpha>0,\beta\in\mathbb{R}\text{ 使 }(\forall z\in Z)\ w(z)=\alpha v(z)+\beta`,'原书§3.3 Comment · 印刷38页',{kind:'affine',alpha:8,beta:2,base:[1,.5,0]}),
    scene('反例一：若缩放系数 α<0，偏好方向彻底反转','若误取 α=−2<0、β=10，则 w(z)=(8, 9, 10)，确定奖品顺序颠倒，且 Ũ(p)=9.2 > 9.1=Ũ(q)，原 p≺q 被反转为 p≻q。因此 α>0 不可省去。',P(.35,.10,.55),P(.10,.70,.20),[8,9,10],String.raw`\alpha<0\implies \tilde U(p)-\tilde U(q)=\alpha\bigl(U(p)-U(q)\bigr)\text{ 符号反转}`,'原书条件校准 · 印刷38页',{kind:'negative',alpha:-2,beta:10,base:[1,.5,0]}),
    scene('反例二：对比第1章，非线性严格递增变换会改写彩票排序','取严格递增非线性变换 h(z)=(2v(z))³=(8, 1, 0)。确定奖品仍满足 a≻b≻c，但中等奖品与两端效用差的比例被改写：甲票 Ũ(p)=2.90 > 1.50=Ũ(q)，排序从 p≺q 翻转为 p≻q！',P(.35,.10,.55),P(.10,.70,.20),[8,1,0],String.raw`h(z)=(2v(z))^3:\quad h(a)>h(b)>h(c),\ \text{但 }\tilde U(p)=2.90>1.50=\tilde U(q)`,'对比第1章命题1.3 · 刘岩第3讲讲义强调',{kind:'nonlinear',base:[1,.5,0]})
   ]
  }
 };
})();

export function euFrame(mode,phase){
 const story=euStories[mode];
 if(!story||!Number.isInteger(phase)||phase<0||phase>=story.frames.length)throw Error('3.3 分镜越界');
 const frame=story.frames[phase];
 lottery(frame.p);lottery(frame.q);
 if(!Array.isArray(frame.v)||frame.v.length!==3||frame.v.some(x=>!Number.isFinite(x)))throw Error('伯努利向量无效');
 if(frame.kind==='continuity'){
  const alpha=continuityWeight(frame.v[0],frame.v[1],frame.v[2]);
  if(phase>0&&Math.abs(frame.p[0]-alpha)>1e-10)throw Error('连续性权重与公式不一致');
 }
 if(frame.kind==='affine'){
  const checked=affineBernoulli(frame.base,frame.alpha,frame.beta);
  if(checked.some((x,i)=>Math.abs(x-frame.v[i])>1e-10))throw Error('正仿射变换数值不一致');
 }
 return frame;
}

export function euReadout(frame){
 const {p,q,v,kind}=frame;
 const left=expected(p,v),right=expected(q,v),diff=left-right;
 const relation=Math.abs(diff)<1e-10?'∼':diff>0?'≻':'≺';
 const out={kind,left,right,diff,relation,v};
 if(kind==='continuity')out.alpha=continuityWeight(v[0],v[1],v[2]);
 if(kind==='eurep'&&v[0]===1&&v[2]===0){
  out.reducedP=canonicalReduction(p,v);
  out.reducedQ=canonicalReduction(q,v);
 }
 return out;
}

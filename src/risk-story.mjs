/* Section 3.5: Risk aversion and Chapter 3 Exercises 3.1–3.9.
 * Authored from Osborne–Rubinstein 2020.12.21(h), printed pp.39–43 (PDF pp.58–62).
 * Every numerical measure and optimization is computed through pure functions in uncertainty.mjs.
 */
import {lottery,mixture,expected,modeProbability,modePrizes,powerUtility,riskMeasures,maximize,casino,casinoDecreasing,insurance,insuranceDecreasingCounterexample,simpleLotteryScore} from './uncertainty.mjs';

export const riskStories=(()=>{
 const scene=(title,narration,formula,source,extra={})=>({title,narration,formula,source,...extra});
 return {
  risk:{
   intro:'如果一张彩票平均能拿 10 万元，但有可能是 4 万或 16 万，你愿意稳拿 10 万元来换走这张彩票吗？经济学中，“风险厌恶”不是一种心理情绪，而是对确定均值与随机彩票之间的偏好次序。',
   end:'定义3.6：若对任意彩票 p，确定拿期望值 [E(p)] 弱优于 p，则称偏好是风险厌恶的；若对多奖品彩票都有严格偏好 [E(p)] ≻ p，则是严格风险厌恶；若无差异 [E(p)] ∼ p，则是风险中性。此定义适用于任意偏好，不预设期望效用。',
   labels:['确定期望值 [E(p)]','随机彩票 p'],
   frames:[
    scene('奖品域与彩票期望值','设奖品集合为非负实数 Z=ℝ₊，奖品 z 表示金额 $z。对任意彩票 p，期望值定义为 E(p)=∑ p(z)z。设彩票以 0.5 概率得 $4、0.5 概率得 $16，则期望值为 0.5×4 + 0.5×16 = $10。',String.raw`Z=\mathbb{R}_+,\quad E(p)=\sum_{z\in Z}p(z)z=10`,'原书§3.5 · 印刷39—40页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('定义3.6：风险厌恶与确定等价','风险厌恶要求确定拿期望金额 [E(p)] 至少与参与彩票 p 一样好，即 [$10] ≽ p。个人愿意接受的最低确定金额称为确定等价 CE(p)；若伯努利函数为 v(z)=√z，则期望效用为 0.5×2+0.5×4=3，对应确定等价 CE=3²=$9。',String.raw`[E(p)]\succeq p\iff CE(p)\le E(p),\quad \pi=E(p)-CE(p)\ge 0`,'原书定义3.6 · 印刷40页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('严格风险厌恶与风险溢价','若对每一个包含多个奖品的非退化彩票都有严格偏好 [E(p)] ≻ p，则称个体是严格风险厌恶的。此时风险溢价 π = E(p) − CE(p) = 10 − 9 = $1 > 0，代表个体为了消除风险甘愿放弃的预期收益。',String.raw`[E(p)]\succ p\iff \pi=E(p)-CE(p)>0`,'原书定义3.6 · 印刷40页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('定义3.6：风险中性','若个体只在乎彩票的期望金额，对任意彩票都有 [E(p)] ∼ p，则称个体是风险中性的。其偏好可由 E(p) 表示，符合期望效用模型且对应线性伯努利函数 v(z)=z，此时风险溢价恒等于 0。',String.raw`[E(p)]\sim p\iff v(z)=z,\quad \pi=0`,'原书定义3.6 · 印刷40页',{low:4,high:16,pHigh:.5,gamma:1}),
    scene('经济行为映射：买保险 vs 赌博','原书指出：严格风险厌恶者愿意支付正金额用期望值替代彩票，因此购买保险（通常减少但未消除风险）表明严格风险厌恶；相反，赌博用确定财富换取期望值更低的彩票，表明偏好不是风险厌恶。',String.raw`\text{购买保险 }\Rightarrow\text{ 严格风险厌恶};\quad \text{参与赌场赌博 }\Rightarrow\text{ 非风险厌恶}`,'原书行为讨论 · 印刷40页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('概念的独立性：定义3.6不依赖期望效用','定义3.6只用到了彩票与其退化期望值彩票的偏好比较 [E(p)] ≽ p，它适用于彩票集合 L(Z) 上的任意偏好关系，无论该偏好能否被期望效用表示。',String.raw`\text{定义3.6适用于任意偏好关系 }\succeq\text{，无论是否符合期望效用}`,'原书核心说明 · 印刷40页',{low:4,high:16,pHigh:.5,gamma:.5})
   ]
  },
  jensen:{
   intro:'为什么在期望效用模型中，“风险厌恶”正好等价于“伯努利函数是凹函数”？连接两者的关键数学桥梁是 Jensen 不等式。',
   end:'命题3.3：若偏好符合期望效用，则偏好是风险厌恶的当且仅当伯努利函数 v 是凹函数。正向由二元彩票即得弦在弧下；反向由 Jensen 不等式推出。严格风险厌恶对应严格凹；风险中性对应仿射函数。',
   labels:['确定值效用 v(E(p))','期望效用 E[v(p)]'],
   frames:[
    scene('命题3.3陈述：风险厌恶 ⇔ 伯努利函数凹','设 Z=ℝ₊，偏好 ≽ 符合期望效用且伯努利函数为 v。命题3.3指出：≽ 是风险厌恶的，当且仅当 v 是凹函数。图3.2展示了一条典型的凹函数曲线 v(z)。',String.raw`\succeq\text{ 是风险厌恶的}\iff v\text{ 是凹函数}`,'原书命题3.3 · 印刷41页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('充分性证明（反向）：Jensen 不等式','若 v 是凹函数，由 Jensen 不等式，凹函数的期望值不超过期望值的函数值：v(∑ p(z)z) ≥ ∑ p(z)v(z)。左边正是退化彩票 [E(p)] 的期望效用，右边是彩票 p 的期望效用，故立即得到 [E(p)] ≽ p！',String.raw`v\left(\sum_{z\in Z}p(z)z\right)\ge \sum_{z\in Z}p(z)v(z)\implies [E(p)]\succeq p`,'原书命题3.3反向证明 · 印刷41页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('必要性证明（正向）：二元彩票检验','设 ≽ 是风险厌恶的。对任意两个奖品 x,y 和任意权重 α∈[0,1]，考虑二元彩票 α·x ⊕ (1-α)·y。风险厌恶要求 [αx+(1-α)y] ≽ α·x ⊕ (1-α)·y，代入期望效用即得 v(αx+(1-α)y) ≥ αv(x)+(1-α)v(y)，即 v 是凹函数！',String.raw`[\alpha x+(1-\alpha)y]\succeq \alpha\cdot x\oplus(1-\alpha)\cdot y\implies v(\alpha x+(1-\alpha)y)\ge \alpha v(x)+(1-\alpha)v(y)`,'原书命题3.3正向证明 · 印刷41页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('几何视角：割线永在曲线下方','连接点 (x,v(x)) 与 (y,v(y)) 的割线代表随机彩票在不同概率下的期望效用 αv(x)+(1-α)v(y)；而曲线上方的点代表确定拿期望金额的效用 v(E)。凹性保证割线始终在曲线下方，垂直差距就是 Jensen 差。',String.raw`\text{Jensen Gap}=v(E(p))-E_p[v(z)]\ge 0`,'原书图3.2几何解释 · 印刷40—41页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('严格风险厌恶与严格凹','若对所有多奖品彩票都有严格偏好 [E(p)] ≻ p，则对应伯努利函数 v 是严格凹函数（二阶导数 v\'\'(z)<0）。此时 Jensen Gap 严格为正，确定等价严格小于期望值。',String.raw`\text{严格风险厌恶}\iff v\text{ 严格凹}\quad (v''<0)`,'原书命题3.3推论 · 印刷41页',{low:4,high:16,pHigh:.5,gamma:.5}),
    scene('风险中性与仿射函数','若 v 是线性或仿射函数 v(z)=az+b (a>0)，割线与曲线完全重合，Jensen Gap 恒等于 0，v(E(p)) = E[v(p)]，个体对任意彩票与其期望值均无差异，表现为风险中性。',String.raw`v(z)=az+b\iff v(E(p))=E[v(p)]\iff\text{风险中性}`,'原书命题3.3特例 · 印刷40—41页',{low:4,high:16,pHigh:.5,gamma:1})
   ]
  },
  p1:{
   intro:'习题3.1：如果一个人评价彩票时只看“最可能出现的奖品的概率”，完全不管奖品是什么，这合理吗？它是否满足连续性或独立性？',
   end:'习题3.1：该偏好由 m(p)=max_z p(z) 评分。当 |Z|≥3 时：连续性空真满足（因为所有退化彩票 [z] 的最高概率均为 1，不存在严格三层 [a]≻[b]≻[c]）；独立性失败（[a]∼[b]，但 0.5[a]⊕0.5[b] 的最高概率降为 0.5，严格差于 [b]）。',
   labels:['奖品 a','奖品 b','奖品 c'],
   frames:[
    scene('题目设定与现实解释','个体按 m(p)=max_z p(z) 评价彩票。原书指出：这在个体对所有奖品无差异（如相似度假地）且只能为一种情况做准备的情境下是合理的（对比第3.3例中想应对所有情况而偏好支撑集更小）。',String.raw`p\succeq q\iff \max_{z\in Z}p(z)\ge \max_{z\in Z}q(z)`,'原书习题3.1 · 印刷41页',{p:[.6,.2,.2]}),
    scene('退化彩票评分恒为 1','对任意确定奖品 z，退化彩票 [z] 将 100% 概率放在 z 上，因此最高概率均为 m([z])=1。也就是说，所有确定奖品在此偏好下完全无差异：[a] ∼ [b] ∼ [c]！',String.raw`\forall z\in Z:\quad m([z])=1\implies [a]\sim[b]\sim[c]`,'原书习题3.1分析 · 印刷41页',{p:[1,0,0]}),
    scene('连续性空真满足（Vacuously Satisfied）','定义3.2要求：存在确定奖品 [a]≻[b]≻[c] 时，能在两端之间找到内部无差异混合。但这里所有确定彩票均无差异，根本不存在任何严格三层排列！因此连续性条件空真成立。',String.raw`\nexists\, a,b,c\text{ 使得 }[a]\succ[b]\succ[c]\implies\text{连续性空真满足}`,'原书习题3.1证明 · 印刷41页',{p:[.5,.25,.25]}),
    scene('独立性必然失效：平局混合稀释众数','取确定彩票 [a] 与 [b]，有 [a] ∼ [b]（得分均为 1）。若独立性成立，各取 0.5 混合应有 0.5[a]⊕0.5[b] ∼ [b]。但混合后彩票为 (0.5, 0.5, 0)，最高概率降至 0.5，得分严格低于 [b] 的 1，发生逆转！',String.raw`[a]\sim[b],\text{ 但 }0.5[a]\oplus0.5[b]\prec[b]\quad (0.5<1)`,'原书习题3.1独立性反例 · 印刷41页',{p:[.5,.5,0]}),
    scene('结论归纳与答题要点','习题3.1证明核心：① 讲清为什么连续性空真成立（指出定义3.2的前件不成立）；② 构造 0.5[a]⊕0.5[b] 给出独立性的明确反例。',String.raw`|Z|\ge 3:\quad \text{满足连续性（空真），违反独立性}`,'原书习题3.1结论 · 印刷41页',{p:[.7,.2,.1]})
   ]
  },
  p2:{
   intro:'习题3.2：一位父母有两个孩子 A 和 B，手里只有一件礼物。父母觉得给谁都一样，但如果能抛一枚公平硬币决定给谁，父母会觉得更欣慰。这种偏好能用期望效用表示吗？',
   end:'习题3.2：期望效用无法表示！若 [A]∼[B]，则 v(A)=v(B)；期望效用计算抛硬币得到 0.5v(A)+0.5v(B)=v(A)，必然强制要求 0.5[A]⊕0.5[B] ∼ [A]，无法容纳父母对“随机抛硬币过程本身”的程序公平偏好。',
   labels:['确定给 A','确定给 B','抛公平硬币'],
   frames:[
    scene('父母的偏好：偏好随机程序本身','父母在孩子 A 与 B 之间无偏爱：[A] ∼ [B]。但面对 0.5[A]⊕0.5[B]，父母严格偏爱抛硬币，因为硬币带来了程序公平与不偏不倚的免责感：0.5[A]⊕0.5[B] ≻ [A]。',String.raw`[A]\sim[B],\quad 0.5[A]\oplus 0.5[B]\succ[A]`,'原书习题3.2 · 印刷41页',{state:'parent'}),
    scene('期望效用模型的刚性推演','假设施加期望效用模型。由 [A] ∼ [B] 知 U([A])=U([B])，即伯努利函数满足 v(A)=v(B)。',String.raw`[A]\sim[B]\implies v(A)=v(B)`,'原书习题3.2反证推导 · 印刷41页',{state:'eu'}),
    scene('计算抛硬币的期望效用','抛硬币彩票的期望效用为两项加权和：U(0.5[A]⊕0.5[B]) = 0.5 v(A) + 0.5 v(B) = 0.5 v(A) + 0.5 v(A) = v(A) = U([A])。',String.raw`U(0.5[A]\oplus 0.5[B])=0.5v(A)+0.5v(B)=v(A)=U([A])`,'原书习题3.2代数计算 · 印刷41页',{state:'calc'}),
    scene('不可调和的矛盾：相等与严格偏好冲突','期望效用严格推导出 0.5[A]⊕0.5[B] ∼ [A]，但父母的真实偏好是严格偏爱 0.5[A]⊕0.5[B] ≻ [A]。两者直接冲突，故该偏好不能被期望效用表示！',String.raw`U\implies 0.5[A]\oplus0.5[B]\sim[A]\quad\text{矛盾于}\quad 0.5[A]\oplus0.5[B]\succ[A]`,'原书习题3.2结论 · 印刷41页',{state:'conflict'}),
    scene('经济学洞见：结果主义与程序偏好','期望效用假定个体是“纯粹结果主义者”，彩票的价值只来自最终落入口袋的奖品期望；而现实中人们常常对抽签、轮换等“决策程序本身的公平性”具有内在价值评价。',String.raw`\text{期望效用只评价最终结果，无法捕捉程序公平（Procedural Fairness）}`,'原书习题3.2深层评注 · 印刷41页',{state:'summary'})
   ]
  },
  p3:{
   intro:'习题3.3：如果有某种基础偏好 ≿*，当两张彩票都有唯一的最高概率奖品时，个体直接比较这两个“众数奖品”。这种偏好满足连续性或独立性吗？',
   end:'习题3.3：独立性必不满足（混合公共分支后两边众数可同时被劫持为该分支）；连续性取决于并列众数如何排序：若有4个严格排序奖品，连续性必失败；3个奖品时若将平局合理补全，可满足连续性。',
   labels:['奖品 a','奖品 b','奖品 c','奖品 d'],
   frames:[
    scene('题目规则：按唯一的最高概率奖品排序','奖品集上有一偏好 ≿*。若两张彩票各存在唯一的最高概率奖品（众数），则根据它们的众数在 ≿* 下的高低进行比较。设 a ≻* b ≻* c。',String.raw`\operatorname{mode}(p)\succ^*\operatorname{mode}(q)\implies p\succ q`,'原书习题3.3 · 印刷41页',{variant:'three',step:'def'}),
    scene('独立性失效：公共分支掩盖原比较','取 [a] ≻ [b]。给两边共同混入 60% 的奖品 c：新彩票分别为 0.4[a]⊕0.6[c] 与 0.4[b]⊕0.6[c]。此时两张新彩票的唯一众数都是 c，因此新彩票无差异！原严格偏好被抹平，违反独立性。',String.raw`[a]\succ[b],\text{ 但 }0.4[a]\oplus0.6[c]\sim 0.4[b]\oplus0.6[c]\ (\text{众数均为 }c)`,'原书习题3.3独立性反例 · 印刷41页',{variant:'three',step:'indep'}),
    scene('连续性问题：题干未规定众数并列时的排序','当出现多个奖品概率并列最高时（如 0.5[a]⊕0.5[c]），题干的规则未定义。因此连续性是否成立，完全取决于我们如何补全这种并列情况的排序。',String.raw`0.5[a]\oplus 0.5[c]\text{ 存在并列众数，规则未完全定义}`,'原书习题3.3连续性前置分析 · 印刷41页',{variant:'three',step:'tie'}),
    scene('3个奖品时的补全可能满足连续性','若 Z={a,b,c} 且 a ≻* b ≻* c。若我们规定并列彩票 0.5[a]⊕0.5[c] 与唯一的中间奖品 [b] 无差异，则在 [a] 到 [c] 的线段上，唯一可能满足 [b] ∼ α[a]+(1-α)[c] 的就是 α=0.5，此时连续性成立！',String.raw`|Z|=3:\quad 0.5[a]\oplus0.5[c]\sim[b]\implies \text{连续性可满足}`,'原书习题3.3三奖品构造 · 印刷41页',{variant:'three',step:'three-pass'}),
    scene('4个严格奖品时连续性必然失败！','若有4个奖品 z₁ ≻* z₂ ≻* z₃ ≻* z₄。考虑 [z₁] ≻ [z₂] ≻ [z₄] 与 [z₁] ≻ [z₃] ≻ [z₄]。连续性要求存在 α,β 使两式分别无差异。唯一平局点是 0.5[z₁]⊕0.5[z₄]，但同一张彩票不能同时与不无差异的 [z₂] 和 [z₃] 无差异，矛盾！',String.raw`|Z|\ge 4:\quad 0.5[z_1]\oplus0.5[z_4]\text{ 无法同时无差异于 }z_2\text{ 与 }z_3\implies\text{连续性失败}`,'原书习题3.3四奖品反例 · 印刷41页',{variant:'four',step:'four-fail'}),
    scene('结论总结与考场规范','回答习题3.3：明确指出独立性不满足；对于连续性，务必指出题干对并列众数未作定义的漏洞，并区分 3 奖品与 ≥4 奖品的本质区别。',String.raw`\text{独立性必不满足；连续性取决于并列定义，}|Z|\ge 4\text{ 时必不满足}`,'原书习题3.3总结 · 印刷41页',{variant:'four',step:'summary'})
   ]
  },
  p4:{
   intro:'习题3.4：如果世界上只有两种奖品 a 和 b，在所有满足独立性的偏好关系中，到底一共有几种不同的偏好？答案出奇地简单：只有三种。',
   end:'习题3.4：只有三种偏好满足独立性：① [a]≻[b]，按 p(a) 严格递增；② [b]≻[a]，按 p(a) 严格递减；③ [a]∼[b]，所有彩票完全无差异。由引理3.1（独立性推出单调性）即可直接完整证明。',
   labels:['奖品 a','奖品 b'],
   frames:[
    scene('两奖品彩票的几何性质：线段参数化','当 Z={a,b} 时，任意彩票 p 只有两个分量 p(a) 与 p(b)=1-p(a)。因此整张彩票完全由实数 α=p(a)∈[0,1] 唯一决定：p_α = α[a] ⊕ (1-α)[b]。',String.raw`Z=\{a,b\}:\quad p_\alpha=\alpha[a]\oplus(1-\alpha)[b],\quad \alpha\in[0,1]`,'原书习题3.4 · 印刷41—42页',{rule:'a',p:.65}),
    scene('第一类偏好：偏好 a，由引理3.1严格递增','设 [a] ≻ [b]。由引理3.1（独立性推单调性），对任意 α,β，有 α>β ⇔ p_α ≻ p_β。因此彩票排序完全由 a 的概率 α 决定，α 越大越好。这是第一种偏好。',String.raw`[a]\succ[b]\iff (\alpha>\beta\iff p_\alpha\succ p_\beta)`,'原书习题3.4第一类 · 印刷42页',{rule:'a',p:.65}),
    scene('第二类偏好：偏好 b，由引理3.1严格递减','设 [b] ≻ [a]。对称地应用引理3.1，对任意 α,β，有 α>β ⇔ p_α ≺ p_β。彩票排序依然由 α 决定，但 α 越大越差（b 的概率越大越好）。这是第二种偏好。',String.raw`[b]\succ[a]\iff (\alpha>\beta\iff p_\alpha\prec p_\beta)`,'原书习题3.4第二类 · 印刷42页',{rule:'b',p:.65}),
    scene('第三类偏好：两奖品无差异，所有彩票全无差异','设 [a] ∼ [b]。对任意 α∈(0,1)，由独立性，将 [a] 换成 [b] 得 α[a]⊕(1-α)[b] ∼ α[b]⊕(1-α)[b] = [b]。因此所有彩票彼此无差异。这是第三种偏好。',String.raw`[a]\sim[b]\implies p_\alpha\sim [b]\implies \forall p,q:\ p\sim q`,'原书习题3.4第三类 · 印刷42页',{rule:'flat',p:.65}),
    scene('证明完整性：完备性排除了任何其他可能','根据完备性，[a] 与 [b] 的相对关系只有 [a]≻[b]、[b]≻[a] 或 [a]∼[b] 三种互斥可能。独立性在每种情况下都唯一确定了整个彩票集 L(Z) 上的偏好，因此不多不少，正好只有这三种！',String.raw`\text{完备性}\implies\text{仅此三类，无其他满足独立性的偏好}`,'原书习题3.4总结 · 印刷42页',{rule:'a',p:.65})
   ]
  },
  p5:{
   intro:'习题3.5：考察“简单彩票” (α, z)——以概率 α 获得物品 z，否则一无所获。公理 A1 是连续性雏形，A2 是概率缩放不变性。期望效用能同时满足它们吗？若只满足其一会怎样？',
   end:'习题3.5：(a) 期望效用 U(α,z)=αv(z) (v>0) 同时满足 A1 与 A2；(b) f(α,x)=α, f(α,y)=2α² 满足 A1 但违反 A2；物品字典序满足 A2 但违反 A1。注意 A2 中 β/α 隐含要求 α>0。',
   labels:['(α, x)','(β, y)'],
   frames:[
    scene('简单彩票与公理 A1/A2 定义','简单彩票 (α,z) 表示以 α 概率得 z、以 1-α 概率得“什么都没有”。A1 规定：若 (1,y)≻(1,x)，存在 α 使 (α,y)∼(1,x)。A2 规定：当 α≥β 时，(α,x)≽(β,y) 当且仅当 (1,x)≽(β/α, y)。',String.raw`\text{A1: }\exists\alpha\text{ s.t. }(\alpha,y)\sim(1,x);\quad\text{A2: }(\alpha,x)\succeq(\beta,y)\iff(1,x)\succeq(\beta/\alpha,y)`,'原书习题3.5 · 印刷42页',{variant:'eu'}),
    scene('小问 (a)：期望效用同时满足 A1 与 A2','设 v(z)>0 且效用为 αv(z)。对 A1：设 v(y)>v(x)，取 α=v(x)/v(y)∈(0,1)，则 αv(y)=v(x)，A1 成立！对 A2：当 α≥β 且 α>0 时，两边同除以 α 即得 αv(x)≥βv(y) ⇔ v(x)≥(β/α)v(y)，A2 成立！',String.raw`U(\alpha,z)=\alpha v(z)\implies \text{A1: }\alpha=\frac{v(x)}{v(y)};\quad \text{A2: 同除以 }\alpha>0`,'原书习题3.5(a)证明 · 印刷42页',{variant:'eu'}),
    scene('小问 (b)：满足 A1 但违反 A2 的构造','构造评分函数：f(α,x)=α，f(α,y)=2α²。因为 f(1,y)=2 > 1=f(1,x)，取 α=1/√2 即有 2(1/2)=1=f(1,x)，故 A1 成立。',String.raw`f(\alpha,x)=\alpha,\quad f(\alpha,y)=2\alpha^2\implies\text{A1 在 }\alpha=\frac{1}{\sqrt{2}}\text{ 成立}`,'原书习题3.5(b)构造一 · 印刷42页',{variant:'a1'}),
    scene('检验 A2 为何在此构造下失效','取 α=0.5, β=0.4。比较 (0.5, x) 与 (0.4, y)：f(0.5,x)=0.5 > 2(0.16)=0.32=f(0.4,y)，前者更好。但按 A2 缩放后比较 (1, x) 与 (0.8, y)：f(1,x)=1 < 2(0.64)=1.28=f(0.8,y)，顺序彻底反转！A2 失败。',String.raw`f(0.5,x)=0.5>0.32=f(0.4,y),\text{ 但 }f(1,x)=1<1.28=f(0.8,y)`,'原书习题3.5(b)反例验证 · 印刷42页',{variant:'a1'}),
    scene('小问 (b)：满足 A2 但违反 A1 的构造','构造字典序：对所有 α>0，只要奖品 y≻x，则恒有 (α,y) ≻ (β,x)（无论 α,β 大小）；若奖品相同，则按概率大小排序；所有零概率彩票 (0,z) 视为无差异。',String.raw`\forall\alpha,\beta>0:\quad (\alpha,y)\succ(\beta,x)\iff y\succ x`,'原书习题3.5(b)构造二 · 印刷42页',{variant:'a2'}),
    scene('检验 A2 成立而 A1 失败','该规则下，缩放 β/α 仍保持正概率，比较只看奖品种类，故 A2 成立；但对任意正概率 α>0 均有 (α,y) ≻ (1,x)，永远不可能无差异，故 A1 失败。注意：A2 中 β/α 隐含要求 α>0。',String.raw`\forall\alpha>0:\ (\alpha,y)\succ(1,x)\implies\text{A1 失败；A2 成立}`,'原书习题3.5(b)总结 · 印刷42页',{variant:'a2'})
   ]
  },
  p7:{
   intro:'习题3.7：如果你手头有一张彩票，有人提议：等彩票抽出金额 z 后，再抛一枚硬币，让你有一半机会多拿 1 元、一半机会少拿 1 元。严格风险厌恶者会接受吗？',
   end:'习题3.7：严格风险厌恶者绝不会接受！由伯努利函数严格凹，对每个 z≥1 均有 v(z) > 0.5 v(z+1) + 0.5 v(z-1)。加权求和即得原彩票效用 U(p) 严格大于新彩票 U(q)。注意定义域要求原奖品至少为 1。',
   labels:['原彩票 p 的效用','附加硬币后的彩票 q'],
   frames:[
    scene('题目提议：对每个奖品叠加 ±1 公平噪音','个体面临货币彩票 p。提议：彩票实现金额 z 后，再以 1/2 概率得 z+1、1/2 概率得 z-1，构成复合彩票 q。问严格风险厌恶者是否接受。',String.raw`q=\sum_{z\in\operatorname{supp}(p)}p(z)\left(\frac12[z+1]\oplus\frac12[z-1]\right)`,'原书习题3.7 · 印刷42页',{p:.55}),
    scene('严格风险厌恶的数学刻画：严格凹性','个体符合期望效用且严格风险厌恶，由命题3.3，其伯努利函数 v 是严格凹函数。',String.raw`\text{严格风险厌恶}\iff v\text{ 严格凹}`,'原书习题3.7理论依据 · 印刷42页',{p:.55}),
    scene('对每个确定的 z 应用严格凹性','对任意 z≥1（保证 z-1 仍在非负实数域 Z=ℝ₊ 内），点 z 恰是 z-1 与 z+1 的中点。由严格凹性：v(z) > 0.5 v(z-1) + 0.5 v(z+1)。即留在确定金额 z 严格优于参与这一轮抛硬币！',String.raw`\forall z\ge 1:\quad v(z)>\frac12 v(z-1)+\frac12 v(z+1)`,'原书习题3.7核心不等式 · 印刷42页',{p:.55}),
    scene('逐项加权求和：U(p) 严格大于 U(q)','将上式两边同乘以概率 p(z) 并对所有 z 求和：左边加总得到原彩票的期望效用 U(p)；右边加总得到接受提议后的期望效用 U(q)。由于存在正概率奖品，严格不等号保持：U(p) > U(q)！',String.raw`U(p)=\sum_z p(z)v(z)>\sum_z p(z)\left[\frac{v(z-1)+v(z+1)}{2}\right]=U(q)`,'原书习题3.7加总推导 · 印刷42页',{p:.55}),
    scene('结论与答题边界规范','个体严格偏好拒绝提议（p ≻ q）。答题规范提醒：原书设定奖品域为 Z=ℝ₊，因此严格来说原彩票的奖品需满足 z≥1（若 z=0 则 z-1=-1 超出定义域）。本站演示设奖品为 10 与 14。',String.raw`p\succ q\implies\text{严格拒绝提议；定义域需 }z\ge 1`,'原书习题3.7结论 · 印刷42页',{p:.55})
   ]
  },
  p8:{
   intro:'习题3.8：一个人带着财富 w 进赌场，下注 x 元：以概率 α 赢得 2x 元，以 1-α 输掉 x 元。赢钱概率 α 越高，最优下注 x* 一定越多吗？原题其实漏了一个至关重要的前提！',
   end:'习题3.8：原书仅假设“风险厌恶”，但必须补充“效用严格递增（v\'>0）”！若缺少该条件，反例 v(z)=-z² 严格凹却递减，最优下注 x*(α)=max{0, w(1-3α)/(1+3α)} 反而随胜率 α 升高而减少。补充 v\'>0 后由隐函数定理得结论成立。',
   labels:['最优下注金额 x*','赢钱概率 α'],
   frames:[
    scene('题目设定：赌场的下注最优化模型','个体财富为 w，选择下注 x∈[0,w]。赢时财富为 w+2x（概率 α），输时财富为 w-x（概率 1-α）。目标是最大化期望效用：max_{0≤x≤w} V(x) = α v(w+2x) + (1-α) v(w-x)。',String.raw`\max_{0\le x\le w}\ V(x)=\alpha v(w+2x)+(1-\alpha)v(w-x)`,'原书习题3.8 · 印刷42页',{alpha:.3,type:'increasing'}),
    scene('原题的隐含漏洞：风险厌恶不等于财富越多越好','题干只假设个体是风险厌恶的（v 凹）。但凹函数并不一定是递增函数！例如在非负实数域上，v(z)=-z² 具有负的二阶导数 v\'\'(z)=-2<0，形式上完全符合定义3.6与命题3.3的“严格风险厌恶”，但它却是严格递减的（钱越多越讨厌）。',String.raw`v(z)=-z^2\implies v''(z)=-2<0\text{（严格凹），但 }v'(z)=-2z\le 0`,'原书习题3.8漏洞剖析 · 自主反例',{alpha:.3,type:'decreasing'}),
    scene('反例推演：胜率提高，下注反而变少！','当下注者拥有递减效用 v(z)=-z² 时，下注赢了财富增加反而更痛苦！解一阶条件可精确求出 x*(α)=max{0, w(1-3α)/(1+3α)}。当 α 从 0.1 升到 0.3 时，x* 从 5.38 下降到 0.53！题目的结论直接被推翻。',String.raw`x^*(\alpha)=\max\left\{0, \frac{w(1-3\alpha)}{1+3\alpha}\right\}\implies \frac{dx^*}{d\alpha}<0\text{（反例！）}`,'原书习题3.8反例求解 · 印刷42页校准',{alpha:.3,type:'decreasing'}),
    scene('补充关键前提：假设效用严格递增 v\'>0','现在为题目补上经济学常规假设：v 是严格递增且严格凹的可微函数（v\'>0, v\'\'<0）。一阶导数为 V\'(x) = 2α v\'(w+2x) - (1-α) v\'(w-x)。由严格凹性，二阶导数 V\'\'(x) < 0 恒成立。',String.raw`V'(x)=2\alpha v'(w+2x)-(1-\alpha)v'(w-x),\quad V''(x)<0`,'补充 v\'>0 前提 · 印刷42页',{alpha:.3,type:'increasing'}),
    scene('隐函数定理证明：交叉导数严格为正','对胜率 α 求偏导：∂V\'/∂α = 2v\'(w+2x) + v\'(w-x)。因为 v\'>0，此偏导数严格大于零！由隐函数定理：dx*/dα = - (∂V\'/∂α) / V\'\'(x) > 0。最优下注确实随胜率严格递增！',String.raw`\frac{\partial V'}{\partial \alpha}=2v'(w+2x)+v'(w-x)>0\implies \frac{dx^*}{d\alpha}=-\frac{\partial V'/\partial \alpha}{V''(x)}>0`,'原书习题3.8隐函数定理证明 · 印刷42页',{alpha:.3,type:'increasing'}),
    scene('考场答题规范总结','完整回答此题：先补齐“假设 v\'(z)>0（更偏好更多财富）”，再写出一阶条件并用隐函数定理证明 dx*/dα>0；若能在试卷上点出 v(z)=-z² 的反例，能展示极高的学术严谨性。',String.raw`\text{规范要点：指出 }v'>0\text{ 缺口，结合 }V''<0\text{ 用隐函数定理证毕}`,'原书习题3.8总结 · 印刷42页',{alpha:.3,type:'increasing'})
   ]
  },
  p9:{
   intro:'习题3.9：拥有一笔财富，但有一定概率遭遇事故受损。保险公司提供赔付比例为 λ 的保险。公平保险与非公平保险下，你会买全额保险还是不足额保险？',
   end:'习题3.9：(a) 公平保费 λ=1/p 时，预期财富不变，凹效用在无风险两状态财富相等处取极大，故最优为全额保险 x*=pD（赔付 λx*=D）；(b) 非公平保费 pλ<1 时，在 v\'>0 且严格凹下最优为不足额保险 λx*<D。注意 (b) 同样需要 v\'>0，否则 v=-z² 会产生超额保险反例。',
   labels:['保费支出 x*','保险赔付 λx*','实际损失 D'],
   frames:[
    scene('题目设定：财富、事故风险与保险合同','个体初始财富为 w，面临事故损失 D（概率 p）。选择支付保费 x，事故时获赔付 λx。未发生事故财富为 w-x，发生事故财富为 w-D+(\\lambda-1)x。期望效用为 U(x)=(1-p)v(w-x)+pv(w-D+(\\lambda-1)x)。',String.raw`U(x)=(1-p)v(w-x)+pv(w-D+(\lambda-1)x)`,'原书习题3.9 · 印刷43页',{rate:'fair',type:'increasing'}),
    scene('小问 (a)：公平保费下的全额保险','保险公司预期利润为 x - λpx。零利润即公平保费：λ = 1/p。此时期望财富 E[W]=w-pD 恒定不变，与保费 x 无关。对严格风险厌恶者，最大化效用即最小化风险，应使两种状态财富完全相等！',String.raw`\lambda=\frac{1}{p}\implies w-x=w-D+(\lambda-1)x\implies \lambda x=D,\ x=pD`,'原书习题3.9(a) · 印刷43页',{rate:'fair',type:'increasing'}),
    scene('一阶条件严格验证小问 (a)','求导得 U\'(x) = -(1-p)v\'(w-x) + p(λ-1)v\'(w-D+(\\lambda-1)x)。代入 λ=1/p，正系数抵消：U\'(x) = (1-p)[v\'(w-D+(\\lambda-1)x) - v\'(w-x)]。由严格凹性，v\' 为单调减函数，故 U\'(x)=0 当且仅当两状态财富相等，即 x*=pD 全额保险！',String.raw`U'(x)=(1-p)\bigl[v'(w-D+(\lambda-1)x)-v'(w-x)\bigr]=0\iff \lambda x^*=D`,'原书习题3.9(a)一阶条件 · 印刷43页',{rate:'fair',type:'increasing'}),
    scene('小问 (b)：非公平保费 pλ < 1','保险公司收取正预期利润，即 pλ < 1（或 λ < 1/p）。直觉上保费变得昂贵，个体应该减少购买，选择“不足额保险”（λx* < D）。',String.raw`p\lambda<1\iff \lambda<\frac{1}{p}\implies\text{目标证明：}\lambda x^*<D\text{（不足额保险）}`,'原书习题3.9(b) · 印刷43页',{rate:'loaded',type:'increasing'}),
    scene('小问 (b) 严密证明与边际分析','在全额保险点 λx=D，两状态财富相等，记为 W₀。将此点代入一阶导数：U\'(x)|_{λx=D} = -(1-p)v\'(W₀) + p(λ-1)v\'(W₀) = (pλ - 1) v\'(W₀)。只要效用严格递增 v\'>0，就有 (pλ-1)v\'(W₀) < 0！由于 U(x) 是严格凹函数，最优解 x* 必须落在更小处，即 λx* < D！',String.raw`U'(x)\big|_{\lambda x=D}=(p\lambda-1)v'(W_0)<0\implies \lambda x^*<D`,'原书习题3.9(b)证明 · 印刷43页',{rate:'loaded',type:'increasing'}),
    scene('漏洞提示与反例：不足额保险必须补充 v\'>0','若不补充 v\'>0，反例 v(z)=-z² 在 w=10, D=2, p=0.2, λ=4（pλ=0.8<1）下，最优保费解出 x*=16/13，赔付 λx*=64/13≈4.92 远远大于损失 2（超额保险）！这说明教材题干漏写了 v\'>0。',String.raw`v(z)=-z^2:\quad x^*=\frac{16}{13}\implies \lambda x^*=\frac{64}{13}>2=D\text{（超额保险反例）}`,'原书习题3.9(b)校准反例 · 印刷43页',{rate:'loaded',type:'decreasing'})
   ]
  }
 };
})();

export function riskFrame(mode,phase){
 const story=riskStories[mode];
 if(!story||!Number.isInteger(phase)||phase<0||phase>=story.frames.length)throw Error(`3.5 分镜越界: ${mode} phase ${phase}`);
 return story.frames[phase];
}

export function riskReadout(mode,frame){
 if(['risk','jensen'].includes(mode)){
  const r=riskMeasures(frame.low??4,frame.high??16,frame.pHigh??.5,frame.gamma??.5);
  return {...r,gamma:frame.gamma,low:frame.low,high:frame.high,pHigh:frame.pHigh};
 }
 if(mode==='p1'){
  const p=frame.p??[.5,.25,.25];
  const highest=modeProbability(p);
  const prizes=modePrizes(p);
  return {p,highest,prizes};
 }
 if(mode==='p2'){
  return {state:frame.state,vA:1,vB:1,uMix:1};
 }
 if(mode==='p3'){
  return {variant:frame.variant,step:frame.step};
 }
 if(mode==='p4'){
  const p=frame.p??.65,rule=frame.rule??'a';
  const score=rule==='a'?p:rule==='b'?1-p:1;
  return {p,rule,score};
 }
 if(mode==='p5'){
  return {variant:frame.variant};
 }
 if(mode==='p7'){
  const p=frame.p??.55,base=10;
  const gain=(1-p)*Math.sqrt(base)+p*Math.sqrt(base+4);
  const withRisk=(1-p)*(.5*Math.sqrt(base-1)+.5*Math.sqrt(base+1))+p*(.5*Math.sqrt(base+3)+.5*Math.sqrt(base+5));
  return {p,gain,withRisk,reject:gain>withRisk};
 }
 if(mode==='p8'){
  const w=10,alpha=frame.alpha??.3,decreasing=frame.type==='decreasing';
  const x=decreasing?casinoDecreasing(w,alpha):casino(w,alpha,.5).choice;
  return {w,alpha,decreasing,choice:x};
 }
 if(mode==='p9'){
  const w=10,D=2,p=.2,lambda=frame.rate==='fair'?5:4,decreasing=frame.type==='decreasing';
  const x=decreasing?(lambda===5?.4:16/13):insurance(w,D,p,lambda,.5).choice;
  return {w,D,p,lambda,decreasing,choice:x,coverage:lambda*x};
 }
 throw Error(`未知 3.5 模式: ${mode}`);
}

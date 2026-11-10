// Chapter 6 Producer behavior authored film-mode stories
// Osborne–Rubinstein Chapter 6, printed pp. 75–86 / PDF 94–107

import { powerP, shiftedP, objectivesP, technologyP, finitePlansP, priceProofP, inverseP, costsP, acP, costStaticsP, factoriesP, firingP, jumpCostP, crusoeP, producerGoalsP } from './producer.mjs';

const makeProducerFrame = (title, narration, formula, source, state = {}, extra = {}) => ({
 title,
 narration,
 formula,
 source,
 state,
 ...extra
});

export const producerStories = {
 technology: {
  id: '6.1',
  title: '§6.1 生产技术、凹性与边际产出递减',
  intro: '阿姨磨豆浆：原料放得更多，豆浆也可能多起来。但每再加一点原料，能多做出的豆浆会一直一样多吗？',
  end: '一般条件是连续、非递减、凹、零投入零产出，且远处单位投入的增产趋于零。本图的平方根只是一个满足这些条件的例子；边际产量需要在可求导处讨论。',
  frames: [
   makeProducerFrame(
    '定义6.1：生产函数与基本公理',
    '先用自主例子 f(a)=2√a：放1单位原料做出2杯。教材要求 f 连续、非递减且凹，f(0)=0，并且投入很大时再加一单位的增产趋于零；不要求严格凹或处处可微。',
    String.raw`f(0)=0,\quad f\text{ 连续、非递减且凹},\quad\lim_{a\to\infty}[f(a+1)-f(a)]=0`,
    '原书定义6.1 · 印刷76页',
    { A: 2, r: .5, a: 1 }
   ),
   makeProducerFrame(
    '边际产出与切线斜率：MP(a) = f′(a)',
    '在这个平方根例子里，投入 a=3 处的切线斜率是边际产出 MP=f′(3)=1/√3≈0.577。一般凹技术的边际产出在可求导处非递增，不一定严格下降。',
    String.raw`MP(a) = f'(a) = \lim_{\Delta a \to 0} \frac{f(a+\Delta a) - f(a)}{\Delta a}`,
    '根据原书第76页凹性条件，自主引入边际量与切线',
    { A: 2, r: .5, a: 3, tangent: true }
   ),
   makeProducerFrame(
    '平均产出与割线斜率：AP(a) = f(a)/a',
    '原点到曲线上该点的割线斜率是平均产出。对于 f(0)=0 的凹函数，在 a>0 且可导时，平均产出不低于边际产出；这个平方根例子中两者严格不同。',
    String.raw`a>0,\ f\text{ 凹且可导}\quad\Rightarrow\quad \frac{f(a)}{a}\ge f'(a)`,
    '原书定义6.1的推论 · 自主平方根例子',
    { A: 2, r: .5, a: 3, secant: true }
   )
  ]
 },

 objectives: {
  id: '6.1',
  title: '§6.1 同一技术的四种目标假定',
  intro: '同一台磨豆机、一样的价格，四位店主却有不同打算：有人想多赚钱，有人想不亏钱地多卖。选择会一样吗？',
  end: '先问店主追求什么，再算最优方案。本例保本产量目标落在零利润边界；其他技术或并列选择需要另行检查。',
  frames: [
   makeProducerFrame(
    '目标一：利润最大化（主流微观标准假定）',
    '这位店主只想多赚钱。本例投入4单位原料，做出4杯；收入8元、原料成本4元，利润4元。一般不能只算内点，还要比较零投入等边界。',
    String.raw`\max_{a \ge 0} \pi(a) = p f(a) - w a`,
    '原书第77页定义6.3讨论',
    { objective: 'profit', A: 2, p: 2, w: 1 }
   ),
   makeProducerFrame(
    '目标二：保本约束下的产量最大化',
    '这位店主只要求不亏钱，然后尽量多卖。本例投入16单位，做出8杯；收入和原料成本都是16元，利润为零。一般先检查正产量是否可行。',
    String.raw`\max_{a\ge0} f(a)\quad\text{s.t. }p f(a)-wa\ge0`,
    '原书定义6.2 · 印刷77页',
    { objective: 'output', A: 2, p: 2, w: 1 }
   ),
   makeProducerFrame(
    '目标三：产量下限约束下的利润最大化',
    '这位店主答应至少做5杯，然后在满足承诺的方案里赚得尽量多。本例需投入6.25单位，收入10元、成本6.25元，利润3.75元；一般先检查目标是否可达。',
    String.raw`\max \pi(a) \quad \text{s.t. } f(a) \ge \bar{y}`,
    '原书第77页目标讨论',
    { objective: 'floor', A: 2, p: 2, w: 1, lower: 5 }
   ),
   makeProducerFrame(
    '目标四：劳动者合作社（人均利润最大化）',
    '合作社把利润平均分给成员，比较每人的收益。本例额外规定至少一名成员，将人数作为连续近似，选1人时人均利润3元；若按整个人头雇用，还要比较相邻整数人数的结果。',
    String.raw`\max \frac{p f(a) - w a}{a} = p \frac{f(a)}{a} - w`,
    '原书第77页合作社模型拓展',
    { objective: 'coop', A: 2, p: 2, w: 1 }
   )
  ]
 },

 output: {
  id: '6.2',
  title: '§6.2 产量最大化生产者的最优选择',
  intro: '阿姨想多卖豆浆，但手里没有钱补亏损。先看一家怎么做都赔钱的摊，再换一家看看：最多能不亏钱地做多少？',
  end: '严格凹技术下，先检查是否存在正投入不亏损；若存在，最大产出可由最右侧正保本点确定。右导数判据需要另有可导条件。',
  frames: [
   makeProducerFrame(
    '命题6.1：保本边界与停产判定',
    '本例技术是 f(a)=√(a+1)−1，p=1、w=2。原点右侧边际产出只有0.5，价值低于工资；由于技术严格凹，任何正投入都亏损，只能选零投入。',
    String.raw`f(a)=\sqrt{a+1}-1,\quad p f'_+(0)=0.5<2=w`,
    '原书命题6.1 · 自主停产例子',
    { p: 1, w: 2, A: 1, b: 1, shutdown: true }
   ),
   makeProducerFrame(
    '正产量最优条件：平均产出等于价格比 AP = w/p',
    '现在明确换一家摊：技术是 f(a)=2√a，售价2元，原料每单位1元。先试投入4：做出4杯，收入8元，原料花4元，还赚4元。既然阿姨要的是不亏钱时多做，还可以继续增加投入。',
    String.raw`p f(a^*) = w a^* \iff \frac{f(a^*)}{a^*} = \frac{w}{p}`,
    '原书命题6.1 · 自主平方根例子',
    { p: 2, w: 1, A: 2, breakEven: true, trial: 4 }
   ),
   makeProducerFrame(
    '几何直观：割线斜率与成本线斜率重合',
    '投入16时做出8杯，收入16元、原料花16元，恰好不亏不赚。再多投入就亏钱，所以16是本例的不亏损最大投入，8杯是最大产量。再比较两个点的利润，投入4时赚得更多。',
    String.raw`a^* = \left(\frac{p A}{w}\right)^2 \quad (\text{平方根技术 } f(a)=A\sqrt{a})`,
    '原书第78页几何解法总结',
    { p: 2, w: 1, A: 2, solution: true, trial: 16 }
   )
  ]
 },

 statics: {
  id: '6.2',
  title: '§6.2 产量最大化生产者的比较静态',
  intro: '阿姨不亏钱时最多能做多少？先让售价涨一些，再把价格还原、换更省料的做法，看看原来的生产计划还能不能负担。',
  end: '价格改善或技术逐点不下降使原可行投入仍可行，最大产出和最右侧可行投入不减；是否严格增加还需额外条件。新技术可能有平坦段时，选到的最优投入还需要明确平局规则。',
  frames: [
   makeProducerFrame(
    '命题6.2：价格变化对最优投入的影响',
    '本例工资不变、产品价格从2升到3；旧保本投入16仍可行，新保本投入增至36。一般命题只保证最优投入和产出不减，可能保持不变。',
    String.raw`p:2\to3,\quad a^*:16\to36`,
    '原书命题6.2 · 自主平方根例子',
    { p: 2, newP: 3, w: 1, statics: 'price' }
   ),
   makeProducerFrame(
    '技术改进的几何效应：可行集单调扩张',
    '把技术从 2√a 改为 3√a，价格保持不变。新技术在每个投入上不低于旧技术；本例旧保本投入16仍可行，新保本投入增至36。',
    String.raw`g(a)\ge f(a),\quad a^*_f=16,\quad a^*_g=36`,
    '原书命题6.2 · 自主技术例子',
    { p: 2, w: 1, A: 2, newA: 3, statics: 'tech' }
   ),
   makeProducerFrame(
    '比较静态结论：产量最大化企业无反常收缩',
    '本例两种技术都严格凹，两个最优点向右移动。一般至少可知最大产出不减；如果新技术有平坦段，多个不同投入可能达到同一最大产出，比较具体投入时要说明选哪一个。',
    String.raw`a^*_g\ge a^*_f,\quad y^*_g\ge y^*_f`,
    '原书第78页比较静态及自主平局条件说明',
    { p: 2, w: 1, A: 2, newA: 3, statics: 'tech', conclusion: true }
   )
  ]
 },

 profit: {
  id: '6.3',
  title: '§6.3 利润最大化生产者的切线条件',
  intro: '阿姨做豆浆，卖得多不一定赚得最多。我们跟着每一次加原料，看看收入和成本之间的差，什么时候最大。',
  end: '在可导的正内点，边际产出价值等于投入价格；零投入要单独检查。图里的两种企业规模比较只属于标出的平方根例子。',
  frames: [
   makeProducerFrame(
    '定义6.3：利润最大化问题',
    '自主例子里，投入1单位原料做2杯，收入4元、成本1元，利润3元。再增加原料，收入和成本都会增加；用收入减去成本，比较各方案留下的钱。',
    String.raw`\max_{a \ge 0} \pi(a) = p f(a) - w a`,
    '原书定义6.3 · 印刷79页',
    { p: 2, w: 1, A: 2, b: 0, trial: 1 }
   ),
   makeProducerFrame(
    '命题6.3：内点切线条件 pf′(a*) = w',
    '投入增加到4单位，做4杯；收入8元、成本4元，利润4元，是本例最大值。收入曲线在这里的切线与成本线平行：再多用一点原料带来的收入增长率，恰好等于原料单价。',
    String.raw`p f'(a^*) = w \iff f'(a^*) = \frac{w}{p} \quad (\text{边际产品价值等于工资})`,
    '原书命题6.3 · 印刷79页 · 图6.2a',
    { p: 2, w: 1, A: 2, b: 0, tangent: true, showOpt: true, trial: 4 }
   ),
   makeProducerFrame(
    '双目标对比：利润最大 vs 产量最大',
    '继续增加到投入16单位，做8杯，收入和成本均为16元，利润降到零。它是本例不亏钱时的最大产量点，不是利润最大点。',
    String.raw`a^*_{\pi} = 4 < a^*_y = 16,\quad \pi(a^*_{\pi}) = 4 > \pi(a^*_y) = 0`,
    '原书两种目标 · 自主平方根例子',
    { p: 2, w: 1, A: 2, b: 0, compare: true, showOpt: true, trial: 16 }
   )
  ]
 },

 priceproof: {
  id: '6.3',
  title: '§6.3 命题6.4证明：显示盈利性与无导数比较静态',
  intro: '豆浆阿姨有几种生产方案。工资涨了，为什么利润最高的方案不会用更多劳动力？我们先看账本，再把两次选择放在一起比较。',
  end: '旧方案在旧价格下更好，新方案在新价格下更好；把两笔账相加，就能比较单一价格变化的方向。并列和不变都要保留。',
  frames: [
   makeProducerFrame(
    '工资1元：先选最赚钱的方案',
    '自主例子：每杯售价1元，五个固定方案的投入和产出已列在图前。工资每单位1元时，方案3用3单位劳动力做6杯，利润3元，是旧价格下最优。方案和单位均为举例。',
    String.raw`p=1,\ w=1,\quad A=(3,6),\quad\pi(A)=6-3=3`,
    '原书命题6.4 · 印刷80页；有限方案与数字自主构造',
    { which: 'w', p: 1, w: 1, newPrice: 1, step: 0 }
   ),
   makeProducerFrame(
    '工资涨到2.1元：不开工',
    '售价和可选方案不变，工资升至2.1元时，原方案3的利润变为−0.3元；方案0不雇人也不生产，利润0元，是新价格下最优。工资恰好为2元时有多个并列最优方案，不能漏掉。',
    String.raw`w'=2.1,\quad \pi'(A)=6-2.1\times3=-0.3,\quad B=(0,0)`,
    '原书命题6.4 · 工资变化的自主数值例子',
    { which: 'w', p: 1, w: 1, newPrice: 2.1, step: 2 }
   ),
   makeProducerFrame(
    '把两次选择交叉比较',
    '在旧工资下，阿姨选A，A比B多赚3元；在新工资下，她选B，B比A多赚0.3元。两次比较必须用各自当时的价格，且两方案在两次都可选。',
    String.raw`\pi(A)-\pi(B)=3\ge0,\quad\pi'(B)-\pi'(A)=0.3\ge0`,
    '原书第80页最优性比较；数值为自主例子',
    { which: 'w', p: 1, w: 1, newPrice: 2.1, step: 2 }
   ),
   makeProducerFrame(
    '两笔账相加：工资上涨不多用',
    '两次最优性不等式相加，产出价格不变时得到 −(w′−w)(a₂−a₁)≥0。工资严格上涨，因此新最优投入不超过旧投入；可能不变或存在并列。这个方向判断不需要生产函数可微。',
    String.raw`-(w' - w)(a_2 - a_1) \ge 0 \implies a_2 \le a_1`,
    '原书第80—81页证明总结',
    { which: 'w', p: 1, w: 1, newPrice: 2.1, step: 3, conclusion: true }
   )
  ]
 },

 techchange: {
  id: '6.3',
  title: '§6.3 图6.2b 技术改进悖论：利润最大化投入反缩减',
  intro: '阿姨换了一台磨豆机：用同样原料，它做出的豆浆更多。可她重新算利润后，为什么可能反而少用原料、少做豆浆？',
  end: '同样投入时比较曲线高度；再多投一点的收益要比较该点的斜率；最优投入和产量可以减少，而最大利润仍可能增加。换一组条件要重新检查。',
  frames: [
   makeProducerFrame(
    '先看旧磨豆机和原料账',
    '自主例子中，原料投入a可连续，旧技术做出√a杯；售价每杯1元、原料每单位0.29元，没有其他成本。只看利润最大时，旧机约用2.97单位原料，做1.72杯。',
    String.raw`f(a)=\sqrt a,\quad p=1,\quad w=0.29,\quad a_f^*\approx2.97`,
    '原书图6.2b · 技术、价格和场景为自主例子',
    { delta: 0, kind: 'early' }
   ),
   makeProducerFrame(
    '新机同样原料做得更多',
    '新技术的公式见下方：每个正投入下都比旧机产出多。但阿姨按利润重新选择，最优原料从约2.97降到1.73，产出从约1.72降到1.53。',
    String.raw`g(a)=\sqrt a+0.7ae^{-a}>f(a)\ (a>0),\quad a^*_f\approx2.97\to a^*_g\approx1.73`,
    '原书图6.2b · 自主数值反例',
    { delta: .7, kind: 'early', showShrink: true }
   ),
   makeProducerFrame(
    '少做了，利润却更高',
    '新机在同一原料下更能出豆浆，老板至少可以沿用旧选择；本例重新优化后最大利润从约0.862升到1.028。注意，产量减少和最大利润增加可以同时发生。',
    String.raw`\pi_f^*\approx0.862,\quad \pi_g^*\approx1.028`,
    '原书图6.2b · 本例利润为自主计算',
    { delta: .7, kind: 'early', showShrink: true }
   ),
   makeProducerFrame(
    '换个条件：每处边际产出也提高',
    '再换另一种自主技术 g(a)=1.7√a，它在每个正投入处的边际产出都不低于旧机。本例最优投入反而增加到约8.59。教材讨论的充分条件还要结合可导、凹性和最优解存在等假设。',
    String.raw`g'(a)\ge f'(a)\ (a>0),\quad a_f^*\approx2.97,\quad a_g^*\approx8.59`,
    '原书第81页充分条件 · 自主平方根例子',
    { delta: .7, kind: 'marginal' }
   )
  ]
 },

 inverse: {
  id: '6.4',
  title: '§6.4 生产函数推导成本函数与反函数映射',
  intro: '豆浆阿姨接到订单：知道做多少杯后，她该买多少原料？原料要花多少钱？',
  end: '先看技术和产量是否可达，再反推最低投入，最后乘投入单价。严格递增技术可求逆；产量上限要按具体技术判断。',
  frames: [
   makeProducerFrame(
    '先做两杯：反推原料',
    '自主例子中，原料投入a可连续，产量为2√a杯；原料每单位1元，没有其他成本。做2杯需要1单位原料，成本1元。先从订单倒过来算用料，再乘单价。',
    String.raw`y=2\sqrt a=2\ \Rightarrow\ a=1,\quad C(2)=1`,
    '原书第81页反推思路；豆浆、函数和参数为自主例子',
    { kind: 'sqrt', A: 2, w: 1, y: 2 }
   ),
   makeProducerFrame(
    '订单增加：原料和成本跟着增加',
    '订单增加到3杯：2√a=3，所以原料为2.25单位，成本2.25元。图上同一个点沿成本曲线移动；产量和成本由同一技术计算。',
    String.raw`y=3\ \Rightarrow\ a=\left(\frac32\right)^2=2.25,\quad C(3)=2.25`,
    '原书第81—82页成本推导；数值为自主例子',
    { kind: 'sqrt', A: 2, w: 1, y: 3 }
   ),
   makeProducerFrame(
    '换一种技术：两杯的极限碰不到',
    '现在换成另一种自主技术，公式见下方；投入仍每单位1元。要做1.8杯需约2.30单位原料；有限投入只能接近2杯，无法达到2杯。不能把上一幅的平方根公式继续套用。',
    String.raw`y=2(1-e^{-a}),\quad \lim_{y\to2^-}C(y)=+\infty`,
    '原书 §6.4 成本函数；渐近饱和的生产函数为本站自主构造',
    { kind: 'saturating', A: 2, w: 1, y: 1.8 }
   )
  ]
 },

 costs: {
  id: '6.4',
  title: '§6.4 成本体系：固定成本、平均成本与边际成本',
  intro: '阿姨出摊前先花一笔开摊费，做每杯豆浆还要用料。做得越多，账上的总钱、平均每杯的钱和再多做一点的钱，会怎样变化？',
  end: '固定成本会被更多产量分摊；平均成本是否呈 U 形取决于完整成本函数。正产量处固定成本不影响边际成本。',
  frames: [
   makeProducerFrame(
    '定义6.4：成本函数的标准数学形式',
    '先看本例：不开摊花0元，一开摊先付4元。做1杯总共花5.5元，其中4元是启动费；接下来慢慢多做一杯，再看看总账。教材另要求成本递增，且大产量下平均成本能超过任意给定上限。',
    String.raw`C(y) = \begin{cases} 0 & y = 0 \\ k + c(y) & y > 0 \end{cases}`,
    '原书定义6.4 · 印刷81页 · 图6.3',
    { F: 4, c: 1, k: 1, p: 5, trial: 1 }
   ),
   makeProducerFrame(
    '平均成本与边际成本的定义',
    '平均成本 AC(y) = C(y)/y 是原点到成本曲线割线的斜率；边际成本 MC(y) = C′(y) 是该点切线的斜率。固定成本 k 不影响 MC，但对 AC 产生摊薄效应。',
    String.raw`AC(y) = \frac{k}{y} + \frac{c(y)}{y},\qquad MC(y) = c'(y)`,
    '原书第82页平均与边际成本 · 图6.4',
    { F: 4, c: 1, k: 1, p: 5, curves: true }
   ),
   makeProducerFrame(
    '无固定成本且成本函数凸时的单调性',
    '若 C(0)=0 且 C(y) 是凸函数，原点到成本曲线的割线斜率随产量弱上升，所以平均成本不下降；它也可能保持不变。',
    String.raw`F = 0 \text{ 且 } C \text{ 凸 } \implies AC(y) \text{ 单调不减}`,
    '原书命题6.5a · 印刷82页',
    { F: 0, c: 1, k: 1, p: 5, convex: true }
   ),
   makeProducerFrame('没有开摊费：先做两杯', '假设阿姨没有开摊费，正产量总成本为 y+y²/2，杯数可以连续变化。做2杯时平均每杯2元，边际成本3元／杯。接下来让产量一点点靠近零，看看两笔成本靠近哪里。', String.raw`C(y)=y+\frac{y^2}{2},\quad AC(2)=2,\quad MC(2)=3`, '原书命题6.5b · 印刷82页；豆浆例子为自主构造', {F:0,c:1,k:1,convex:true,limit:true,y:2}),
   makeProducerFrame('做半杯：两笔成本更接近', '产量降到0.5杯时，平均每杯1.25元，边际成本1.5元／杯。模型允许杯数连续，并不表示现实中必须卖半杯。', String.raw`AC(0.5)=1.25,\quad MC(0.5)=1.5`, '原书命题6.5b · 自主数值示例', {F:0,c:1,k:1,convex:true,limit:true,y:.5}),
   makeProducerFrame('从正产量一侧逐渐靠近零', '产量再缩到0.05杯时，平均成本1.025元／杯，边际成本1.05元／杯；继续靠近零，两者都靠近1元／杯。注意，零杯的平均成本本身没有定义。', String.raw`AC(0.05)=1.025,\quad MC(0.05)=1.05`, '原书命题6.5b · 自主数值示例', {F:0,c:1,k:1,convex:true,limit:true,y:.05}),
   makeProducerFrame('做题时：把极限写清楚', '没有固定成本、C(0)=0，且成本在零点右侧可导时，C(y)/y就是从原点到成本曲线的割线斜率；当y从正数靠近零，割线斜率趋近零点右导数，也就是零点的边际成本。', String.raw`\lim_{y\to0^+}AC(y)=\lim_{y\to0^+}\frac{C(y)-C(0)}{y}=C'_+(0)=MC(0)`, '原书命题6.5b及证明 · 印刷82页', {F:0,c:1,k:1,convex:true,limit:true,y:.05})
  ]
 },

 acproof: {
  id: '6.4',
  title: '§6.4 豆浆摊：多做一点，平均成本怎么变？',
  intro: '阿姨卖豆浆，开摊先要花钱。她想知道：多做一点豆浆，平均每杯的成本会下降还是上升？',
  end: '在正产量的可导处，边际成本低于平均成本时平均成本下降；高于时上升。相等只是驻点，还要检查两侧或比较全部产量。',
  frames: [
   makeProducerFrame('先做一杯：新增加的成本较低', '假设开摊成本4元，做一杯时总成本5.5元，所以平均每杯5.5元；此时边际成本为2元／杯。再多做很少一点，新增部分每杯成本接近2元，低于原平均，会把平均数往下拉。', String.raw`y=1,\quad C(1)=5.5,\quad AC(1)=5.5,\quad MC(1)=2`, '原书命题6.5c · 印刷82—83页；固定成本例子为自主构造', {F:4,c:1,k:1,y:1}),
   makeProducerFrame('做得更多：两条曲线相遇', '做到约2.83杯时，本例平均成本下降到最低，约3.83元／杯；边际成本也恰好约3.83元／杯。金点是本例两条曲线的交点。', String.raw`y=\sqrt{8},\quad AC(y)=MC(y)=1+\sqrt{8}`, '原书命题6.5c · 本例数值自主构造', {F:4,c:1,k:1,y:Math.sqrt(8)}),
   makeProducerFrame('继续做：新增成本高于平均数', '做到5杯时，总成本21.5元，平均每杯4.3元；边际成本为6元／杯。多做很少一点时，新增部分的单位成本高于原平均，平均成本开始上升。', String.raw`y=5,\quad C(5)=21.5,\quad AC(5)=4.3,\quad MC(5)=6`, '原书命题6.5c · 本例数值自主构造', {F:4,c:1,k:1,y:5}),
   makeProducerFrame('做题时：等号本身还不够', '在正产量的可导处，平均成本导数等于边际成本减平均成本，再除以产量。所以比较大小就能判断变化方向；两者相等只说明导数为零，不一定就是最低点，还要检查两侧与其他候选。', String.raw`AC'(y)=\frac{MC(y)-AC(y)}{y},\quad y>0`, '原书命题6.5c · 印刷82—83页；本图为固定成本延伸', {F:4,c:1,k:1,y:5})
  ]
 },

 supply: {
  id: '6.4',
  title: '§6.4 同一豆浆摊：赚钱最多还是卖得最多？',
  intro: '两位阿姨有同样的豆浆摊，成本和售价一样；一位想利润最大，另一位只求不亏钱并尽量多卖。她们会做一样多吗？',
  end: '先辨认目标，再比较停产。固定启动成本可避免时，本例临界价格处利润目标在停产和正产量之间并列；价格更低时两者都停产。',
  frames: [
   makeProducerFrame('先看两位阿姨的账本', '每杯售价5元；开摊成本4元可以避免，正产量总成本是4+y+y²/2元，停产成本为零。杯数可连续变化。先问：选什么产量，取决于想让利润最大，还是想不亏钱地多做？', String.raw`p=5,\quad C(y)=4+y+\frac{y^2}{2}\ (y>0),\quad C(0)=0`, '原书命题6.6—6.7 · 印刷83—84页；成本与场景自主构造', {F:4,c:1,k:1,p:5,stage:'setup'}),
   makeProducerFrame('目标一：利润最多做几杯？', '想利润最高，先比较多做一点能多收5元／杯、成本增加多少。此例正产量利润为凹函数，边际成本等于5时是4杯；收入20元，成本16元，利润4元，高于停产的0元。', String.raw`MC(y)=1+y=5\Rightarrow y_{\pi}=4,\quad\pi(4)=20-16=4`, '原书命题6.7 · 印刷84页；固定成本为自主延伸', {F:4,c:1,k:1,p:5,stage:'profit'}),
   makeProducerFrame('目标二：不亏钱，尽量多做', '另一位只要求不亏钱，就沿平均成本曲线找售价覆盖成本的范围。此例右边界约6.83杯，收入刚好等于成本，利润为零；比利润最大时的4杯多。', String.raw`AC(y)=\frac4y+1+\frac y2=5\Rightarrow y_{\text{产量}}=4+\sqrt8\approx6.83`, '原书命题6.6 · 印刷83页；数值自主构造', {F:4,c:1,k:1,p:5,stage:'both'}),
   makeProducerFrame('售价降到保本门槛', '售价降到最低平均成本约3.83元／杯时，正产量约2.83杯恰好保本。利润目标在停产与这2.83杯之间并列；不亏钱且产量最大的目标选择2.83杯。', String.raw`p=1+\sqrt8,\quad y=\sqrt8,\quad\pi(y)=\pi(0)=0`, '原书命题6.6—6.7 · 自主固定成本例子', {F:4,c:1,k:1,p:1+Math.sqrt(8),stage:'tie'}),
   makeProducerFrame('售价再低：两人都不开摊', '售价降到3元／杯，低于本例最低平均成本；任何正产量都亏损，停产成本为零。两位阿姨都选择0杯。停产时产量为零，平均成本的分母也为零，所以平均成本只画在正产量处。', String.raw`p=3<1+\sqrt8,\quad y_{\pi}=y_{\text{产量}}=0`, '原书第83—84页；本例启动成本可避免', {F:4,c:1,k:1,p:3,stage:'shutdown'}),
   makeProducerFrame('换题先认目标，再检查停产', '先写利润或不亏损条件。利润目标比较所有候选和停产；产量目标找非亏损集合的最大值。一般成本若有跳跃，不能未经验证就把最大值或平均成本交点当成一定存在。', String.raw`\max_{y\ge0}\{py-C(y)\},\quad \max\{y\ge0:py\ge C(y)\}`, '原书命题6.6—6.7及成本连续性边界', {F:4,c:1,k:1,p:3,stage:'shutdown'})
  ]
 },

 coststatic: {
  id: '6.4',
  title: '§6.4 习题6.1 成本曲线比较静态',
  intro: '两位豆浆阿姨的成本一样：一位想利润最多，另一位只求不亏钱、多卖杯数。售价或技术变了，她们会怎么选？',
  end: '先分清两种目标。价格上升会扩大不亏损范围；比较技术前，还要看固定费用是否变化，并检查停产和并列。',
  frames: [
   makeProducerFrame(
    '先看同一张账本',
    '两位阿姨的成本都是 y+y²/2 元，没有启动费；售价每杯4元，杯数可连续。一位选利润最多，另一位选不亏钱的最大产量：分别为3杯和6杯。例子由我们构造。',
    String.raw`C(y)=y+\frac{y^2}{2},\quad p=4,\quad y_{\pi}=3,\quad y_{\text{产量}}=6`,
    '原书习题6.1 · 印刷85页；成本和数字为自主例子',
    { p: 4, newP: 6, c: 1, k: 1, factor: .5 }
   ),
   makeProducerFrame(
    '售价上涨：两位都重新算账',
    '成本不变，售价从4元涨到6元。利润最大时做5杯；不亏钱且产量最大时做10杯。新售价让更多产量可以保本，利润目标还要比较利润和停产。',
    String.raw`p' > p \implies y^{*\prime}_{\pi} \ge y^*_{\pi},\quad y^{*\prime}_y \ge y^*_y`,
    '原书习题6.1a 图解分析',
    { p: 4, newP: 6, c: 1, k: 1, case: 'price' }
   ),
   makeProducerFrame(
    '回到原价，再换省料技术',
    '先把售价恢复为4元，再把可变成本和边际成本减半，启动费仍为零。利润目标从3杯变成7杯，不亏钱的最大产量从6杯变成14杯。固定费用同时变化时，不能只凭边际成本下结论。',
    String.raw`C_{\text{新}}(y)=\tfrac12C_{\text{旧}}(y),\quad p=4,\quad y_{\pi}:3\to7,\quad y_{\text{产量}}:6\to14`,
    '原书习题6.1b 图解分析',
    { p: 4, newP: 4, c: 1, k: 1, factor: .5, case: 'tech' }
   )
  ]
 },

 factories: {
  id: '6.4',
  title: '§6.4 两家豆浆厂：什么时候值得开第二家？',
  intro: '阿姨有两家一样的豆浆厂。每开一家都要付启动费；分给两家做能省投入，但也多付一份启动费。做多少时值得开第二家？',
  end: '正产量小于门槛时开一家；大于门槛时两家平分；恰好在门槛时两种方案并列。零产量时不必开厂。',
  frames: [
   makeProducerFrame('只做一杯：先省下启动费', '设每开一家厂要2元，投入每单位1元，单厂产出是投入的平方根。做1杯时，一家做的总成本是3元；两家平分需4.5元，多付一份启动费不划算。', String.raw`y=1,\quad C_1=2+1^2=3,\quad C_2=4+\frac{1^2}{2}=4.5`, '原书习题6.2 · 印刷85页；启动费取2元及豆浆场景为自主举例', {y:1,k:2,share:.5}),
   makeProducerFrame('做到两杯：两种方案打平', '总产量为2杯时，一家做的投入费为4元，加启动费2元共6元；两家各做1杯，投入费合计2元，加两份启动费4元也共6元。两种方案并列。', String.raw`y=2,\quad C_1=2+2^2=6,\quad C_2=4+\frac{2^2}{2}=6`, '原书习题6.2 · 本例门槛计算', {y:2,k:2,share:.5}),
   makeProducerFrame('做到三杯：两家平分更省', '总产量为3杯时，一家做共11元；两家各做1.5杯，投入费共4.5元，加启动费4元共8.5元。节省的投入费超过多付的启动费，因此两家更省。', String.raw`y=3,\quad C_1=11,\quad C_2=4+2\times1.5^2=8.5`, '原书习题6.2 · 本例比较', {y:3,k:2,share:.5}),
   makeProducerFrame('换成任意启动费，怎么算门槛？', '总产量为y时，一家成本是k+y²；如果两家都开，平均分配使投入费最低，成本为2k+y²/2。比较两式得到门槛√(2k)；门槛处并列。', String.raw`k+y^2=2k+\frac{y^2}{2}\Rightarrow y=\sqrt{2k}`, '原书习题6.2 · 一般推导', {y:3,k:2,share:.5}),
   makeProducerFrame('一杯也不做，就不必开厂', '如果总产量为零，两家都不启动，成本为0。图上纵轴旁的空心点是从正产量接近零时的启动费用，不是零产量的实际成本。', String.raw`C(0)=0,\quad k>0`, '原书习题6.2 · 停产边界', {y:0,k:2,share:.5})
  ]
 },

 firing: {
  id: '6.3',
  title: '§6.3 习题6.3 裁员成本与劳动力需求粘性',
  intro: '豆浆店有4位员工。老板发现生意不好，可一想到裁掉老员工，心里也有代价。她最终会留下多少人？',
  end: '先分清现金利润和计入主观裁员代价后的目标；在本例里，代价逐渐增加会让最优劳动力投入从1上升到4。一般题仍需比较边界。',
  frames: [
   makeProducerFrame(
    '先只算现金：留下1人',
    '阿姨现有4位员工。本例产出是2√a，售价1、每单位劳动力工资1，a可连续，代表等效劳动力投入。先不计主观裁员代价，只看现金利润，最优是1个单位；零代价只作为比较起点。',
    String.raw`\pi(a)=2\sqrt a-a,\quad \ell=0,\quad a^*=1`,
    '原书习题6.3 · 零代价对照及数值为自主例子',
    { A: 2, b: 0, p: 1, w: 1, a0: 4, loss: 0 }
   ),
   makeProducerFrame(
    '开始考虑裁员的心理代价',
    '每减少1单位原有劳动力，老板感到0.3单位主观代价。现在最优保留约2.04单位；这不是实际支付的工资或现金成本。这里按等效劳动量计量，半个单位可以对应半份工时。',
    String.raw`\ell=0.3,\quad a^*=\left(\frac1{1-0.3}\right)^2\approx2.04`,
    '原书习题6.3 · 自主数值例子',
    { A: 2, b: 0, p: 1, w: 1, a0: 4, loss: .3 }
   ),
   makeProducerFrame(
    '代价达到0.5：保留原有4人',
    '代价升到0.5时，本例在原编制处左右两侧的边际净收益分别为0和−0.5，保留4单位劳动力最优。不是所有技术和所有代价都会得到这个结果。',
    String.raw`w-\ell=0.5=pf'(4)\le w=1\quad\Rightarrow\quad a^*=4`,
    '原书习题6.3 · 自主边界推导',
    { A: 2, b: 0, p: 1, w: 1, a0: 4, loss: .5, sticky: true }
   ),
   makeProducerFrame(
    '代价继续升到0.6：仍保留4人',
    '每裁1单位的主观代价升至0.6，保留4单位仍最优；只看现金利润的比较结果始终是1单位。这是连续投入的示例，并非对整个劳动力市场的预测。',
    String.raw`a^*_{\text{现金}}=1,\quad a^*_{\text{计入主观代价}}=4`,
    '原书习题6.3 · 自主数值例子',
    { A: 2, b: 0, p: 1, w: 1, a0: 4, loss: .6, conclusion: true }
   )
  ]
 },

 crusoe: {
  id: '6.3',
  title: '§6.3 习题6.4a—c 鲁滨逊经济的一体化决策',
  intro: '习题6.4：孤岛鲁滨逊既是唯一的工人也是唯一的消费者。一体化中央计划最大化其效用。',
  end: '在可导且最优点为内点时，最优休闲和消费满足边际替代率等于边际产出；一般题目还需检查边界。',
  frames: [
   makeProducerFrame(
    '生产可能性边界与偏好',
    '鲁滨逊总时间为1，休闲为 l，劳动为 x=1−l。原题一般形式只要求给定偏好和生产函数；这一画面先用题目(b)的具体例子 f(x)=√x、u(l,c)=lc。',
    String.raw`c=\sqrt{1-l},\qquad u(l,c)=lc`,
    '原书习题6.4a—b · 印刷86页',
    { A: 1, r: .5, theta: 1, leisure: .5 }
   ),
   makeProducerFrame(
    '中央计划最优一阶条件：MRS = MP',
    '在此例的正内点，边际替代率等于边际产出。把题目例子推广为 f(x)=Axʳ、u(l,c)=lᶿc，并取 A、θ>0、0<r<1，可算出 x*=r/(θ+r)。',
    String.raw`MRS(l^*, c^*) = MP(1 - l^*) \implies x^* = \frac{r}{\theta + r}`,
    '原书习题6.4c · 自主参数推广',
    { A: 1, r: .5, theta: 1, leisure: 2/3, optimum: true }
   ),
   makeProducerFrame(
    '数值基准：当 θ=1, r=0.5 时的最优解',
    '代入原题(b)的函数，得到劳动1/3、休闲2/3、消费1/√3≈0.577。这是该个体在给定技术和偏好下可达到的最高效用。',
    String.raw`l^* = \frac{2}{3},\quad x^* = \frac{1}{3},\quad c^* = \frac{1}{\sqrt{3}} \approx 0.577`,
    '原书习题6.4b · 印刷86页',
    { A: 1, r: .5, theta: 1, leisure: 2/3, result: true }
   )
  ]
 },

 harmony: {
  id: '6.3',
  title: '§6.3 习题6.4d—g 鲁滨逊市场协调与两目标对比',
  intro: '将孤岛拆分为独立的生产部门与消费部门。通过竞争性工资，检验市场机制能否实现一体化最优。',
  end: '在原题给定的平方根技术与偏好例子中，利润最大化下的协调结果与一体最优相同；产量最大化的协调结果不同，需分别算出并比较。',
  frames: [
   makeProducerFrame(
    '分散市场机制：工资 w 与利润分红',
    '企业购买劳动 x，产出 y，将利润 π 分红给鲁滨逊。鲁滨逊在工资 w 与分红 π 约束下选择休闲 l 与消费 c。市场出清要求劳动供求相等：x = 1 - l。',
    String.raw`\text{企业: } \max \{y - w x\};\qquad \text{家庭: } c + w l \le w + \pi;\qquad \text{出清: } x + l = 1`,
    '原书习题6.4d 市场结构',
    { A: 1, r: .5, theta: 1, w: Math.sqrt(3)/2, goal: 'profit' }
   ),
   makeProducerFrame(
    '原题例子：利润最大化实现协调',
    '当市场工资定为竞争水平 w* = MP(x*) = √3/2 时，企业选择 x=1/3，鲁滨逊供给 1/3，两部门供求严格平衡，效用精确达到一体化最高水平！',
    String.raw`w^* = \frac{\sqrt{3}}{2} \implies x_{\text{企业}} = 1 - l_{\text{家庭}} = \frac{1}{3},\quad u = u^*`,
    '原书习题6.4e · 原题函数数值',
    { A: 1, r: .5, theta: 1, w: Math.sqrt(3)/2, goal: 'profit', harmony: true }
   ),
   makeProducerFrame(
    '产量最大化部门：扭曲导致过度劳动与福利损失',
    '若强制企业实行零利润产量最大化，为保本出清工资被拉高至 √2，企业过度雇佣 x=0.5，鲁滨逊休闲被压缩，最终效用 0.354 严格劣于竞争最优 0.385！',
    String.raw`w_{\text{产量}} = \sqrt{2},\quad x = 0.5 > \frac{1}{3},\quad u_{\text{产量}} = 0.354 < u^* = 0.385`,
    '原书习题6.4g · 原题函数的自主数值比较',
    { A: 1, r: .5, theta: 1, w: Math.sqrt(2), goal: 'output', distortion: true }
   )
  ]
 },

 goals: {
  id: '6.5',
  title: '§6.5 生产者偏好与社会责任决策',
  intro: '你是快递公司的经理：经济不景气，但公司还在赚钱。留下更多老员工，预计利润就可能少一些。你会怎么选？',
  end: '利润最大化是一种可分析的目标，而不是唯一可能的偏好。调查中的学科差异，不能单独证明原因是教育还是学生自我选择。',
  frames: [
   makeProducerFrame(
    '快递公司情境：衰退期的裁员选择',
    '公司有196名员工。衰退后，不裁员的预计年利润为40万美元；留100人、裁96人时预计年利润200万美元，在七个方案中最高。利润是预测值。',
    String.raw`\text{留 100 人 (裁 96 人): } \pi = \$2.0\text{M};\qquad \text{留 196 人 (不裁员): } \pi = \$0.4\text{M}`,
    '原书印刷75页开篇案例',
    { lambda: 0 }
   ),
   makeProducerFrame(
    '试着把员工去留也放进自己的账本',
    '自主构造一个简单权衡：每裁一人减去 λ 百万美元的主观成本。当 λ=0.015 时，逐项比较七个方案，最优是留下144人，即裁52人。',
    String.raw`\max \pi(N) - \lambda (196 - N)`,
    '原书第84—85页偏好讨论；自主构造的偏好函数与参数',
    { lambda: .015 }
   ),
   makeProducerFrame(
    '如果更看重员工去留，会选哪一项？',
    '自主例子中，当 λ=0.03 时，最优是不裁员。教材另提到经济学学生往往选择裁减更多员工，但无法仅从这种差异判断是自我选择还是学习经历造成的。',
    String.raw`\lambda=0.03\quad\Rightarrow\quad N^*=196`,
    '原书第85页调查讨论；自主偏好参数',
    { lambda: .03 }
   )
  ]
 },

 existence: {
  id: '6.2',
  title: '命题6.6边界：成本跳跃与最大产量不存在反例',
  intro: '阿姨只想不亏钱地尽量多卖。她越做越接近一杯，却发现恰好做一杯反而会亏钱：到底有没有最大的可行产量？',
  end: '可行产量可以无限接近1，却没有最大的那个数。想用保本交点法，先核对最大值是否存在；连续与有界给出一组常用的充分条件。',
  frames: [
   makeProducerFrame(
    '先做半杯：不亏钱',
    '自主例子中，售价每杯2元，产量允许连续变化。不足1杯时成本是产量的平方；达到或超过1杯时要额外支付2元。先做0.5杯，收入1元，成本0.25元，利润0.75元。',
    String.raw`p = 2,\quad C(y) = \begin{cases} y^2 & y < 1 \\ y^2 + J & y \ge 1 \end{cases}\ (J=2)`,
    '原书定义6.4与命题6.6；成本跳跃和数值为自主反例',
    { J: 2, y: 0.5, step: 1 }
   ),
   makeProducerFrame(
    '做到0.9杯：还可以再多一点',
    '做0.9杯，收入1.8元，成本0.81元，利润0.99元。阿姨还可以在不到1杯的范围内再增加一点，依然不亏钱。',
    String.raw`y=0.9,\quad R=1.8,\quad C=0.81,\quad\pi=0.99`,
    '原书命题6.6 · 自主反例数值',
    { J: 2, y: 0.9, step: 2 }
   ),
   makeProducerFrame(
    '做到0.99杯：仍然不是最大',
    '做0.99杯仍盈利；再选更接近1杯但小于1的数量，仍然盈利。因此每个不到1杯的可行产量，都能找到更大的可行产量。',
    String.raw`0<y<1\quad\Rightarrow\quad \pi(y)=2y-y^2>0`,
    '原书命题6.6 · 自主反例的正产量利润',
    { J: 2, y: 0.99, step: 3 }
   ),
   makeProducerFrame(
    '恰好一杯：费用跳上来',
    '做到1杯时，收入2元，但成本从左侧接近1元跳到3元，利润变为−1元。达到或超过1杯都亏损。可行集合是[0,1)，上确界是1，却不存在最大值；不能误以为只能选0。',
    String.raw`\sup Y_{\text{feas}} = 1 \notin Y_{\text{feas}} \implies \max Y_{\text{feas}} \text{ 不存在}`,
    '原书命题6.6的自主边界反例；连续和有界是常用充分条件',
    { J: 2, y: 1.0, step: 4, sup: 1, exists: false }
   )
  ]
 }
};

export function producerFrame(mode, phase) {
 const story = producerStories[mode] || producerStories.technology;
 const idx = Math.max(0, Math.min(story.frames.length - 1, phase));
 if(mode==='profit'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],trial=base===0?1+3*t:4+12*t,m=shiftedP({A:2,b:0,p:2,w:1}),f=n=>Number(n.toFixed(2));
  return {...from,title:base===0?'增加原料，利润差额扩大':'继续多做，利润差额反而缩小',narration:`投入约${f(trial)}单位，做约${f(m.f(trial))}杯，收入约${f(2*m.f(trial))}元，成本约${f(trial)}元，利润约${f(m.profit(trial))}元。${base===0?'继续比较收入与成本的距离。':'收入还在增加，但利润不再增加。'}`,formula:String.raw`R(a)=4\sqrt a,\quad C(a)=a,\quad\pi(a)=R(a)-C(a)`,state:{...from.state,trial,showOpt:base===1}};
 }
 if(mode==='technology'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const a=1+2*t,m=powerP(2,.5),f=n=>Number(n.toFixed(3));return {...from,title:'同一台磨豆机，原料逐渐增加',narration:`原料约${f(a)}单位，豆浆约${f(m.f(a))}杯；在当前位置，极小幅增加原料时的边际产出约${f(m.mp(a))}杯／单位。金色切线的斜率表示局部变化；要算多放整整1单位的增量，读曲线上两个投入点的产出差；本例导数公式只用于正投入。`,formula:String.raw`f(a)=2\sqrt a,\quad f'(a)=\frac1{\sqrt a}\quad(a>0)`,state:{...from.state,a,tangent:true}};}
  return {...from,title:'从局部变化转向每单位平均',narration:'先记住这个点的切线斜率。接下来连接原点和同一个点，看看从零开始平均每单位原料做出多少豆浆。'};
 }
 if(mode==='output'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0)return {...from,title:'接下来换一家摊',narration:'先记住：第一家摊的任何正投入都亏钱。下一幅明确换成另一种技术和价格，再重新算收入与成本。'};
  const trial=4+12*t,m=shiftedP({A:2,b:0,p:2,w:1}),f=n=>Number(n.toFixed(2));
  return {...from,title:'同一家摊，慢慢增加投入',narration:`投入约${f(trial)}单位原料，做出约${f(m.f(trial))}杯，收入约${f(2*m.f(trial))}元，原料花${f(trial)}元，利润约${f(m.profit(trial))}元。只要不亏钱，阿姨还可以继续多做。`,formula:String.raw`R(a)=4\sqrt a,\quad C(a)=a,\quad \pi(a)=R(a)-C(a)`,state:{...from.state,trial}};
 }
 if(mode==='statics'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],f=n=>Number(n.toFixed(2));
  if(base===0){const resetting=t<.5,newP=resetting?3-2*t:2,newA=resetting?2:2+2*(t-.5),z=shiftedP({A:newA,b:0,p:newP,w:1});
   return {...from,title:resetting?'先把售价还原':'售价不变，技术逐渐改善',narration:resetting?`先把售价从3元还原到2元，技术不变；当前售价约${f(newP)}元，最右保本投入约${f(z.aOutput)}。这是为了分开比较价格和技术。`:`售价保持2元，技术系数从2逐渐提高；当前系数约${f(newA)}，最右保本投入约${f(z.aOutput)}。原计划仍然不亏钱。`,formula:String.raw`f(a)=A\sqrt a,\quad pf(a)\ge a`,state:{p:2,w:1,A:2,newP,newA}};
  }
  return {...from,title:'回到比较静态结论',narration:'刚才分别改变了售价和技术。每次都把旧计划保留作参照；接下来整理教材的一般条件。'};
 }
 if(mode==='goals'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,lambda=.015*(base+t),z=producerGoalsP(lambda);
  const names=z.winners.map(x=>`留${x.N}人`).join('、');
  return {...story.frames[base],title:'权衡发生变化，重新比较七个方案',
   narration:`假想每裁一人的主观代价约${Number((lambda*100).toFixed(3))}万美元；七个方案的预计利润保持不变。按这本自主账本，当前最优是${names}${z.winners.length>1?'（并列）':''}。这些数字是本站为比较方案设定的权重，工资另计。`,
   formula:String.raw`U(N)=\pi(N)-\lambda(196-N)`,state:{lambda}};
 }
 if(mode==='techchange'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const delta=.7*t,z=technologyP({p:1,w:.29,delta,kind:'early'}),f=n=>Number(n.toFixed(3));return {...from,title:'同样原料，新机产出逐步增加',narration:`提升程度约${f(delta)}；当前最优原料约${f(z.ag)}，产出约${f(z.yg)}，最大利润约${f(z.pg)}。两台机器的售价与原料单价相同。`,formula:String.raw`g(a)=\sqrt a+\delta a e^{-a},\quad p=1,\quad w=0.29`,state:{...from.state,delta}};}
  return from;
 }
 if(mode==='priceproof'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const w=1+1.1*t,z=priceProofP({p:1,w:1,other:w,which:'w',i:3,j:0}),f=n=>Number(n.toFixed(4)),winners=z.after.winners.join('、');return {...from,title:'工资上涨，阿姨重新算账',narration:`工资约${f(w)}元，售价仍为1元。当前最优方案为${winners}；标出的每个方案都按同一组价格重新比较，并列时全部保留。`,formula:String.raw`\pi_i=y_i-w a_i,\quad p=1`,state:{...from.state,newPrice:w,step:2}};}
  return from;
 }
 if(mode==='firing'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],lo=[0,.3,.5][base],hi=[.3,.5,.6][base],loss=lo+(hi-lo)*t,z=firingP({...from.state,loss}),f=n=>Number(n.toFixed(3));
  return {...from,title:'主观代价变化，老板重新权衡',narration:`每减少1单位原有劳动力的主观代价约${f(loss)}，只看现金最优仍为1单位；计入代价后的最优约${f(z.chosen)}单位。劳动力可连续只是模型假设。`,formula:String.raw`\max_{a\ge0}\left\{2\sqrt a-a-\ell\max(0,4-a)\right\}`,state:{...from.state,loss}};
 }
 if(mode==='existence'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],y=base===0?.5+.4*t:base===1?.9+.09*t:.99+.0099*t,z=jumpCostP(2,y),f=n=>Number(n.toFixed(4));
  return {...from,title:'不到一杯，还可以再多做一点',narration:`现在尝试${f(y)}杯，收入约${f(2*y)}元，成本约${f(z.C(y))}元，仍有利润。数量始终小于1；把产量恰为1代回成本函数，单独计入跳跃成本。`,formula:String.raw`0<y<1,\quad R(y)=2y,\quad C(y)=y^2`,state:{...from.state,y}};
 }
 if(mode==='coststatic'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],price=base===0?4+2*t:t<.5?6-4*t:4,factor=base===0||t<.5?1:1-(t-.5),z=costStaticsP({p:4,newP:price,c:1,k:1,F:0,factor}),f=n=>Number(n.toFixed(2));
  const why=base===0?'售价上升，成本不变':t<.5?'先把售价恢复到4元，技术保持不变':'售价已恢复为4元，逐步降低可变成本';
  return {...from,title:why,narration:`${why}。当前售价${f(price)}元／杯；利润目标约${f(z.after.qProfit)}杯，不亏钱的最大产量约${f(z.after.qOutput)}杯。`,formula:String.raw`C_{\text{新}}(y)=\theta(y+\frac{y^2}{2}),\quad \theta=${f(factor)}`,state:{...from.state,effectiveP:price,effectiveFactor:factor}};
 }
 if(mode==='inverse'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const y=2+t,z=inverseP('sqrt',2,1,y),f=n=>Number(n.toFixed(3));return {...from,title:'订单增加，倒算原料',narration:`订单约${f(y)}杯，要买约${f(z.a)}单位原料，成本约${f(z.cost)}元。原料单价不变，点沿同一条成本曲线移动。`,formula:String.raw`a=\left(\frac y2\right)^2,\quad C(y)=a`,state:{...from.state,y}};}
  return {...from,title:'接下来换一种技术',narration:'现在先记住平方根技术的反推办法；下一幅会换成有产量上限的另一种技术，不能混用公式。'};
 }
 if(mode==='costs'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const y=1+t,z=costsP({F:4,c:1,k:1}),f=n=>Number(n.toFixed(2));return {...from,title:'同一摊位，先看总账',narration:`现在做约${f(y)}杯，总成本约${f(z.C(y))}元，其中开摊费始终是4元；不做时则可以不开摊。接下来再换成“每杯平均”和“多做一点”的账。`,formula:String.raw`C(y)=4+y+\frac{y^2}{2}\quad(y>0),\quad C(0)=0`,state:{...from.state,trial:y}};}
  if(base===3||base===4){const y=base===3?2-1.5*t:.5-.45*t,z=costsP({F:0,c:1,k:1}),f=n=>Number(n.toFixed(3));return {...from,title:'产量靠近零：比较平均和边际',narration:`产量约${f(y)}杯，平均成本约${f(z.AC(y))}元／杯，边际成本约${f(z.MC(y))}元／杯。产量仍是正数，两笔成本正靠近零点的边际成本1元／杯。`,formula:String.raw`AC(y)=1+\frac y2,\quad MC(y)=1+y`,state:{...from.state,y}};}
  return from;
 }
 if(mode==='factories'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],f=n=>Number(n.toFixed(2));
  if(base<2){const y=1+base+t,z=factoriesP(y,2,.5),pick=z.one<z.two-1e-8?'一家更省':z.two<z.one-1e-8?'两家平分更省':'两种方案并列';return {...from,title:'产量变化：比较两笔账',narration:`总产量约${f(y)}杯，一家做约花${f(z.one)}元，两家平分约花${f(z.two)}元；${pick}。输入和成本随产量由模型重新计算。`,formula:String.raw`C_1(y)=2+y^2,\quad C_2(y)=4+\frac{y^2}{2}`,state:{...from.state,y}};}
  return {...from,title:base===2?'从数值比较到一般门槛':'单独看零产量',narration:base===2?'先记住两条成本线的交点，再把启动费写成一般的k。':'接下来另看产量为零：不开厂，也不支付启动费。'};
 }
 if(mode==='supply'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],threshold=1+Math.sqrt(8),f=n=>Number(n.toFixed(2));
  if(base===0)return {...from,title:'先看利润目标',narration:'紫点逐渐显现：售价5元时，利润最大化的阿姨选择4杯，需把正产量利润与停产比较。',state:{...from.state,stage:'profit',revealProfit:t}};
  if(base===1)return {...from,title:'再看不亏钱下的最大产量',narration:'绿点逐渐显现：售价5元时，不亏钱的最大产量是右侧保本点，约6.83杯。',state:{...from.state,stage:'both',revealOutput:t}};
  if(base===2||base===3){const p=base===2?5+(threshold-5)*t:threshold+(3-threshold)*t,z=costsP({F:4,c:1,k:1,p}),profit=z.qProfit,output=z.qOutput??0,low=p<threshold-1e-7;return {...from,title:'售价改变，两位阿姨重新算账',narration:low?`售价约${f(p)}元／杯，低于最低平均成本约${f(threshold)}元；任何正产量都亏损，两个目标都选停产。`:`售价约${f(p)}元／杯；利润目标约${f(profit)}杯，不亏钱的最大产量约${f(output)}杯。临界价格处利润目标还与停产并列。`,formula:String.raw`AC(y)=\frac4y+1+\frac y2,\quad MC(y)=1+y`,state:{...from.state,p,stage:'both'}};}
  return {...from,title:'从例子整理一般解题顺序',narration:'本例价格低于门槛时都停产；接下来分清两种目标，并提醒一般成本还需检查最大值是否存在。'};
 }
 if(mode==='acproof'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base<2){const lo=base===0?1:Math.sqrt(8),hi=base===0?Math.sqrt(8):5,y=lo+(hi-lo)*t,z=costsP({F:4,c:1,k:1}),f=n=>Number(n.toFixed(2)),dir=y<Math.sqrt(8)-1e-8?'低于平均，平均成本下降':'高于平均，平均成本上升';return {...from,title:'多做一点，比较两笔成本',narration:`产量约${f(y)}杯，平均成本约${f(z.AC(y))}元／杯，边际成本约${f(z.MC(y))}元／杯；边际成本${dir}。杯数连续只是模型假设。`,formula:String.raw`AC'(y)=\frac{MC(y)-AC(y)}{y}`,state:{...from.state,y}};}
  return {...from,title:'把例子变成做题方法',narration:'本例先降后升；接下来写出一般导数关系，并检查等号能否直接判断最低点。'};
 }
 return story.frames[idx];
}

export function producerReadout(mode, frame) {
 const s = frame.state || {};
 if (mode === 'technology') { const m=powerP(s.A ?? 2,s.r ?? .5); return `投入 ${s.a}，产出 ${Number(m.f(s.a).toFixed(2))}`; }
 if (mode === 'objectives') { const o=objectivesP({A:s.A ?? 2,b:0,p:s.p ?? 2,w:s.w ?? 1,lower:s.lower ?? 5,minimum:s.minimum ?? 1}); const i={profit:0,output:1,floor:2,coop:3}[s.objective] ?? 0; return `${o.rows[i].label}：投入 ${Number(o.rows[i].a.toFixed(2))}`; }
 if (mode === 'output') { const m=shiftedP({A:s.A ?? 2,b:s.b ?? 0,p:s.p ?? 2,w:s.w ?? 1}); return `本例最大保本投入 ${Number(m.aOutput.toFixed(2))}`; }
 if (mode === 'statics') { const A=s.A ?? 2,p=s.p ?? 2,w=s.w ?? 1; const old=shiftedP({A,b:0,p,w}),next=shiftedP({A:s.newA ?? A,b:0,p:s.newP ?? p,w}); return `保本投入 ${Number(old.aOutput.toFixed(2))} → ${Number(next.aOutput.toFixed(2))}`; }
 if (mode === 'profit') { const m=shiftedP({A:s.A ?? 2,b:s.b ?? 0,p:s.p ?? 2,w:s.w ?? 1}),a=s.trial ?? m.aProfit; return `当前投入 ${Number(a.toFixed(2))}，利润 ${Number(m.profit(a).toFixed(2))}；本例最优投入 ${Number(m.aProfit.toFixed(2))}`; }
 if (mode === 'priceproof') { const z=priceProofP({p:s.p ?? 1,w:s.w ?? 1,other:s.newPrice ?? 2.1,which:s.which ?? 'w',i:3,j:0}); return `当前工资约 ${Number((s.newPrice??2.1).toFixed(4))}；旧最优方案 ${z.before.winners.join('、')}；当前最优方案 ${z.after.winners.join('、')}`; }
 if (mode === 'techchange') { const z=technologyP({p:s.p ?? 1,w:s.w ?? .29,delta:s.delta ?? .7,kind:s.kind ?? 'early'}),f=n=>Number(n.toFixed(3)); return `最优投入 ${f(z.af)}→${f(z.ag)}；产量 ${f(z.yf)}→${f(z.yg)}；利润 ${f(z.pf)}→${f(z.pg)}`; }
 if (mode === 'inverse') { const z=inverseP(s.kind ?? 'sqrt',s.A ?? 2,s.w ?? 1,s.y ?? 2); return `产量 ${Number(z.y.toFixed(2))}；成本 ${Number(z.cost.toFixed(2))}`; }
 if (mode === 'existence') { const z=jumpCostP(s.J ?? 2,s.y ?? .9),f=n=>Number(n.toFixed(4)); return `尝试 ${f(s.y)} 杯；收入 ${f(2*s.y)} 元；成本 ${f(z.C(s.y))} 元；${z.feasible?'不亏钱':'亏损'}`; }
 if (mode === 'acproof') {const z=costsP({F:s.F??4,c:s.c??1,k:s.k??1}),y=s.y??1,f=n=>Number(n.toFixed(2));return `产量 ${f(y)} 杯；平均 ${f(z.AC(y))} 元／杯；边际 ${f(z.MC(y))} 元／杯`;}
 if (mode === 'costs') { const z=costsP({F:s.F ?? 4,c:s.c ?? 1,k:s.k ?? 1,p:s.p ?? 5}); if(Number.isFinite(s.trial)&&!s.curves&&!s.convex){const f=n=>Number(n.toFixed(2));return `产量 ${f(s.trial)} 杯；总成本 ${f(z.C(s.trial))} 元；开摊费 ${f(z.F)} 元`;}if(s.limit){const f=n=>Number(n.toFixed(3));return `产量 ${f(s.y)} 杯；平均 ${f(z.AC(s.y))} 元／杯；边际 ${f(z.MC(s.y))} 元／杯`;}return z.F > 0 ? `本例最低平均成本 ${Number(z.minAC.toFixed(2))}` : '本例无固定成本；平均成本不下降'; }
 if (mode === 'supply') {const z=costsP({F:4,c:1,k:1,p:s.p??5}),f=n=>Number(n.toFixed(2));if(s.stage==='setup')return `售价 ${f(z.p)} 元／杯；先比较两种目标`;if(z.tie)return `售价 ${f(z.p)}；利润目标停产或 ${f(z.qProfit)} 杯并列`;if(z.qOutput===null)return `售价 ${f(z.p)}；两种目标都停产`;if(s.stage==='profit')return `售价 ${f(z.p)}；利润目标 ${f(z.qProfit)} 杯`;return `售价 ${f(z.p)}；利润目标 ${f(z.qProfit)} 杯；产量目标 ${f(z.qOutput)} 杯`;}
 if (mode === 'coststatic') { const z=costStaticsP({p:s.p ?? 4,newP:s.effectiveP ?? (s.case==='price' ? s.newP : s.p ?? 4),c:s.c ?? 1,k:s.k ?? 1,F:0,factor:s.effectiveFactor ?? (s.case==='tech' ? s.factor : 1)}),f=n=>Number(n.toFixed(2)); return `售价 ${f(z.after.p)} 元／杯；利润目标 ${f(z.after.qProfit)} 杯；产量目标 ${f(z.after.qOutput)} 杯`; }
 if (mode === 'factories') {const z=factoriesP(s.y??1,s.k??2,.5),f=n=>Number(n.toFixed(2));if(z.y===0)return '产量 0 杯；不开厂，成本 0 元';const pick=z.optimal.length===2?'两种方案并列':z.optimal[0]===1?'一家更省':'两家平分更省';return `产量 ${f(z.y)} 杯；一家 ${f(z.one)} 元；两家 ${f(z.two)} 元；${pick}`;}
 if (mode === 'firing') { const z=firingP(s),f=n=>Number(n.toFixed(2)); return `主观代价 ${f(s.loss)}；现金最优 ${f(z.ordinary)} 单位；计入代价最优 ${f(z.chosen)} 单位`; }
 if (mode === 'crusoe') { const z=crusoeP(s); return `当前休闲 ${Number(z.leisure.toFixed(2))}；最优休闲 ${Number(z.lStar.toFixed(2))}`; }
 if (mode === 'harmony') { const z=crusoeP(s); return `工资 ${Number(z.w.toFixed(3))}；劳动供需 ${Number(z.laborSupply.toFixed(2))} / ${Number(z.firmX.toFixed(2))}`; }
 if (mode === 'goals') { const z=producerGoalsP(s.lambda ?? 0),label=Number(z.lambda.toFixed(6)); return `λ≈${label}；最优留用 ${z.winners.map(x=>x.N).join('或')} 人`; }
 return frame.title;
}

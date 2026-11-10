/* Chapter 4: Authored film scenes for Sections 4.1–4.6 from Osborne–Rubinstein 2020.12.21(h), printed pp.45–56.
 * Every displayed bundle, curve, and utility calculation is passed through pure model functions.
 * Visual examples never substitute for unrestricted mathematical proofs.
 */
import {prefU,compareP,blend,monotoneWitness,lexContinuity,utilityGap,intermediateP,convexP,diminishingP,localP,problem1P,relativeP,caseSections,caseNames} from './preferences.mjs';

const makePrefFrame=(title,narration,formula,source,state={},extra={})=>({title,narration,formula,source,state,...extra});

export const prefStories={
 bundle:{
  intro:'买东西时，购物篮里同时装着两样商品。把两件商品的数量画成平面上的一个点；点往哪里走，就是哪样多了、哪样少了。',
  end:'商品束是 X = ℝ₊² 里的非负实数对；线段上每个点都是两束的凸组合 λa+(1−λ)b。连续数量是分析取舍的抽象假设，不限于实体货物。',
  frames:[
   makePrefFrame('第一步：商品束作为坐标点','平面直角坐标系的第一象限代表全部可能的消费组合 X = ℝ₊²。横轴 x₁ 是商品1数量，纵轴 x₂ 是商品2数量。点 A=(2, 8) 表示消费 2 单位商品1和 8 单位商品2。',String.raw`X = \mathbb{R}_+^2,\quad A = (2, 8)`,'原书定义4.1 · 印刷45页',{a:[2,8],b:[8,2],lambda:1}),
   makePrefFrame('第二步：另一个消费方案','现在看另一个方案 B=(8, 2)，商品1很多但商品2很少。商品不仅指苹果或香蕉，也可以是个人的闲暇与收入、或是对两个工作项目的精力分配。',String.raw`B = (8, 2)`,'原书第45页讨论',{a:[2,8],b:[8,2],lambda:0}),
   makePrefFrame('第三步：两束之间的折中（凸组合）','把两束用线段连起来。取 λ=0.5，混合束 M = 0.5A + 0.5B = (5, 5)。两样商品的数量都变成原来两端的平均数。',String.raw`M = \lambda A + (1-\lambda)B = (5, 5),\quad \lambda = 0.5`,'原书第45页代数运算',{a:[2,8],b:[8,2],lambda:.5}),
   makePrefFrame('第四步：移动权重，遍历整条线段','当 λ 从 0 连续变到 1 时，混合点从 B 沿同一条直线平稳滑向 A。整条线段包含了所有加权凸组合，构成了后续研究“折中偏好（凸性）”的几何基石。',String.raw`\lambda \in [0, 1] \implies \lambda A + (1-\lambda)B`,'原书定义4.1与凸组合总结',{a:[2,8],b:[8,2],lambda:.8})
  ]
 },
 examples:{
  intro:'同样的商品束，不同的人有截然不同的取舍规律。我们沿着同一个坐标系，依次观察教材给出的六种经典偏好。',
  end:'无差异集 I(a)={y∈X: y∼a} 构成了全象限的等价类划分。字典序没有连续实值效用表示；完全互补与阈值偏好具有特征拐点。',
  frames:[
   makePrefFrame('例4.1：固定交换率（完全替代）','消费者对每单位商品有固定主观估值 v₁ 与 v₂。无差异集是斜率为 −v₁/v₂ 的一条条平行直线；多得一种商品可以按固定比例补偿另一种。',String.raw`u(x) = v_1 x_1 + v_2 x_2,\quad I(a) = \{x : v_1 x_1 + v_2 x_2 = v_1 a_1 + v_2 a_2\}`,'原书例4.1 · 印刷46页 · 图4.1a',{kind:'linear',v:1.3,bundle:[3,5]}),
   makePrefFrame('例4.2：只在乎商品2（中性商品）','消费者只喜欢商品2，对商品1完全不在乎。无论横向增减多少商品1，只要商品2不变，效用完全相同。所有无差异曲线都是水平直线。',String.raw`u(x) = x_2,\quad I(a) = \{x \in X : x_2 = a_2\}`,'原书例4.2 · 印刷46页 · 图4.1b',{kind:'neutral',bundle:[3,5]}),
   makePrefFrame('例4.3：商品1达到门槛后在乎商品2','商品1不超过10时只看商品1；一旦超过10，发生效用跃升并只看商品2。效用高于10的无差异集是左开半水平线（在 x₁=10 处不包含端点）。',String.raw`u(x) = \begin{cases} x_1 & x_1 \le 10 \\ 11 + x_2 & x_1 > 10 \end{cases}`,'原书例4.3 · 印刷47页 · 图4.2a',{kind:'threshold',bundle:[12,4]}),
   makePrefFrame('例4.4：完全互补品（左右鞋）','两种商品必须一比一配套使用。单方面多得左鞋或右鞋不能提升任何满足感，无差异集是 L 形折线，拐角落在 45° 对角线 x₁=x₂ 上。',String.raw`u(x) = \min\{x_1, x_2\}`,'原书例4.4 · 印刷47页 · 图4.2b',{kind:'min',bundle:[5,5]}),
   makePrefFrame('例4.5：L1 理想点偏好','消费者心中有一个最完美的理想束 x*=(5, 5)。越靠近理想点越好；按 L1 曼哈顿距离度量，无差异集是以 (5, 5) 为中心的菱形。多得物品可能反而更差。',String.raw`u(x) = -(|x_1-5| + |x_2-5|)`,'原书例4.5 · 印刷47—48页 · 图4.3',{kind:'ideal',bundle:[3,5]}),
   makePrefFrame('例4.6：字典式偏好（无效用表示）','第一项数量多的一定更好；第一项严格打平时才比第二项。任意两个不同束都能比出严格高下，因此每个无差异集只有一个点（单元素集），不存在实值连续效用函数。',String.raw`x \succ y \iff x_1 > y_1 \text{ 或 } (x_1 = y_1 \text{ 且 } x_2 > y_2)`,'原书例4.6 · 印刷48页 · 命题1.2',{kind:'lex',bundle:[3,5]})
  ]
 },
 monotone:{
  intro:'东西越多真的越好吗？经济学中“物品”与“垃圾”的界限，用弱单调性与强单调性来精确刻画。',
  end:'弱单调只要求“两样都多才严格好”；强单调要求“任意一样变多且不完全相同，就必须严格更好”。完全互补品是弱单调但非强单调的典型范例。',
  frames:[
   makePrefFrame('定义4.2：单调性（弱单调）','若 x 各分量均不小于 y，则 x≽y；若 x 两个分量都严格大于 y，则必须 x≻y。也就是说，两样东西同时变多，消费者绝不嫌弃。',String.raw`x \ge y \implies x \succeq y,\quad x \gg y \implies x \succ y`,'原书定义4.2 · 印刷48页',{kind:'min',weak:true,strong:false}),
   makePrefFrame('定义4.3：强单调性（严格单调）','条件进一步加强：只要 x≥y 且 x≠y（即至少有一种商品严格更多、另一种不少），就必须严格偏好 x≻y。绝不允许“白给一样却毫无感觉”。',String.raw`x \ge y \text{ 且 } x \ne y \implies x \succ y`,'原书定义4.3 · 印刷49页',{kind:'linear',weak:true,strong:true}),
   makePrefFrame('关键分界：完全互补品（Leontief）','基准束为 (2, 2)。给它增加 1 单位商品1变成 (3, 2)。因为 min(3, 2)=min(2, 2)=2，两者无差异！因此完全互补品满足弱单调，但绝不满足强单调。',String.raw`u(3, 2) = u(2, 2) = 2 \implies (3, 2) \sim (2, 2)`,'原书印刷49页表格分析',{kind:'min',pointA:[2,2],pointB:[3,2]}),
   makePrefFrame('全书经典偏好单调性对照','固定交换率（v₁, v₂>0 强单调）；只看商品2（弱单调但非强单调）；阈值偏好（弱单调但非强单调）；理想点（单调性不成立，多得会过头）；字典序（强单调）。',String.raw`\text{互补品/中性品: 弱单调且非强单调} \quad \text{字典序/完全替代: 强单调}`,'原书印刷49页表格总结',{kind:'table'})
  ]
 },
 continuity:{
  intro:'微小的扰动会不会颠覆选择？如果 x 严格好于 y，在两端附近稍微晃动一下，是否依然能保持严格排序？',
  end:'连续性要求严格偏好在开球邻域内对扰动具有稳健性。字典序在第一坐标处发生质变，任意小的 ε 扰动都能使排序彻底反转，因而违反连续性。',
  frames:[
   makePrefFrame('定义4.4：连续偏好关系的几何要求','若 x≻y，则存在正数 ε>0，使得只要 a 落在 x 的 ε 邻域内、b 落在 y 的 ε 邻域内，就恒有 a≻b。换言之，严格偏好在微小扰动下不破裂。',String.raw`x \succ y \implies \exists \epsilon > 0 \text{ s.t. } \forall a \in B_\epsilon(x), b \in B_\epsilon(y) \implies a \succ b`,'原书定义4.4 · 印刷49页',{eps:.4}),
   makePrefFrame('字典序的检验对：x≻y','取 x=(1, 2) 和 y=(1, 0)。因为第一坐标都是 1，第二坐标 2>0，按字典序有 x≻y。我们在 x 周围画一个半径为 ε 的邻域圆。',String.raw`x = (1, 2) \succ y = (1, 0)`,'原书第49页反例构造',{eps:.4,x:[1,2],y:[1,0]}),
   makePrefFrame('致命的反例构造：向左轻微扰动','无论 ε>0 多么微小，构造扰动点 a_ε = (1 − ε/2, 2)。它到 x 的欧式距离只有 ε/2 < ε，完全位于开球内。',String.raw`a_\epsilon = (1 - \epsilon/2, 2),\quad d(a_\epsilon, x) = \epsilon/2 < \epsilon`,'原书第49—50页证明细节',{eps:.4,x:[1,2],y:[1,0],a:[.8,2]}),
   makePrefFrame('排序彻底倒转：a_ε ≺ y','比较 a_ε 与 y：a_ε 的第一坐标是 1−ε/2 < 1，而 y 的第一坐标是 1！按字典序第一坐标直接定输赢，故 a_ε ≺ y！连续性公理在此被彻底推翻。',String.raw`1 - \epsilon/2 < 1 \implies a_\epsilon \prec y = (1, 0)`,'原书结论 · 字典序不连续',{eps:.4,x:[1,2],y:[1,0],a:[.8,2]})
  ]
 },
 continuityproof:{
  intro:'如果已经有了一个连续的效用函数，它代表的偏好为什么一定是连续的？把两个效用值的间隙分成三份，看看两端各移动一点会怎样。',
  end:'由于连续效用函数在原点有正间隙 u(x)−u(y)>0，取三分之一作为缓冲边界，邻域内的波动绝不会越过中间段，从而保证 a≻b。',
  frames:[
   makePrefFrame('命题4.1 前提：连续效用函数','设偏好关系 ≽ 由连续实值效用函数 u 表示。若 x≻y，则必有实数间隙 u(x) > u(y)。我们测量出差值并除以 3，设为缓冲尺度 ε = (u(x)−u(y))/3 > 0。',String.raw`\epsilon = \frac{1}{3}(u(x) - u(y)) > 0`,'原书命题4.1 · 印刷50页',{step:0}),
   makePrefFrame('利用连续性寻找安全的 δ 邻域','由 u 的连续性，存在充分小的 δ>0，只要 a 与 x 的距离小于 δ，u(a) 的跌幅不会超过 ε：u(a) > u(x) − ε。',String.raw`d(a, x) < \delta \implies u(a) > u(x) - \epsilon`,'原书证明第一步',{step:1}),
   makePrefFrame('对称控制 y 端的扰动上界','同理，只要 b 与 y 的距离小于 δ，u(b) 的涨幅也不会超过 ε：u(y) + ε > u(b)。两端各自被安全网锁在缓冲带外侧。',String.raw`d(b, y) < \delta \implies u(b) < u(y) + \epsilon`,'原书证明第二步',{step:2}),
   makePrefFrame('链式不等式：间隙恒为正','把三段连在一起：u(a) > u(x) − ε = u(y) + 2ε > u(y) + ε > u(b)。因此无论怎么选扰动点，必有 u(a) > u(b)，即 a≻b 严格成立！',String.raw`u(a) > u(x) - \epsilon > u(y) + \epsilon > u(b) \implies a \succ b`,'原书证明结束 · 命题4.1证毕',{step:3})
  ]
 },
 intermediate:{
  intro:'在最好的生活 a 与最差的生活 c 之间连一条路。如果我们想要正好与中等生活 b 一样好的满足感，路上一定能遇到吗？',
  end:'连续偏好保证了线段上的无差异点存在性：若 a≻b≻c，连接 a 与 c 的线段上必存在 λ∈(0,1) 使得 λa+(1−λ)c ∼ b。这正是介值定理在多维消费束中的具现。',
  frames:[
   makePrefFrame('三层排序设定：a ≻ b ≻ c','给定三个消费束满足 a ≻ b ≻ c。以乘积效用 u(x)=x₁x₂ 为例：取 a=(8, 8) 效用64，c=(1, 1) 效用1，目标中等束 b=(4, 5) 效用20。',String.raw`u(a)=64 > u(b)=20 > u(c)=1`,'原书印刷50页第2条Comment',{t:0}),
   makePrefFrame('沿着连接 a 与 c 的线段前行','考察线段 z(λ) = λa + (1−λ)c。当 λ 从 0 增加到 1 时，z 从低效用点 (1, 1) 连续走到高效用点 (8, 8)，效用数值从 1 单调连续增长到 64。',String.raw`z(\lambda) = \lambda(8,8) + (1-\lambda)(1,1) = (1+7\lambda, 1+7\lambda)`,'原书第50页线段构造',{t:.2}),
   makePrefFrame('锁定无差异点：精确命中 u(b)','令 (1+7λ)² = 20，解得精确交点 λ* = (√20 − 1)/7 ≈ 0.496。此时混合束 z(λ*) 的效用恰好等于 20，与 b 达到完全无差异！',String.raw`u(z(\lambda^*)) = u(b) = 20 \iff \lambda^* = \frac{\sqrt{20}-1}{7} \approx 0.496`,'原书第50页介值定理成立',{t:(Math.sqrt(20)-1)/7}),
   makePrefFrame('理论意义：多维世界的“标准尺”','这条性质表明：连续性允许我们在任意两个好坏端点之间，通过连续微调混合比例，完美复现任意中间水平的满足度。',String.raw`\exists \lambda \in (0, 1) \text{ s.t. } \lambda a + (1-\lambda)c \sim b`,'原书中间束命题总结',{t:.7})
  ]
 },
 convex:{
  intro:'人们常说“多样化使生活更美好”，这在几何上叫作凸偏好：如果两个极端方案都不错，把它们折中混合，绝不会比原来的极端方案更差。',
  end:'凸偏好要求 a≽b ⇒ λa+(1−λ)b ≽ b；严格凸要求内点严格更好。字典序虽不连续却严格凸；完全互补品凸但不严格凸；两极偏好（如 max）是非凸的。',
  frames:[
   makePrefFrame('定义4.5：凸偏好的折中原则','设 a≽b。如果对线段内任意比例 λ∈(0, 1)，混合束 λa+(1−λ)b 都不劣于 b，则该偏好是凸的；若混合束严格优于 b，则为严格凸偏好。',String.raw`a \succeq b \implies \lambda a + (1-\lambda)b \succeq b \quad (\text{严格凸: } \succ b)`,'原书定义4.5 · 印刷51页 · 图4.4',{model:'min',lambda:.5}),
   makePrefFrame('完全互补品：凸，但不严格凸','考察 u=min{x₁, x₂}。取 a=(3, 8) 效用3，b=(8, 3) 效用3。中点 M=(5.5, 5.5) 效用5.5 > 3；但若取 a=(3, 8) 和 b=(3, 3)，线段上所有点效用都是 3。因此它凸但不严格凸。',String.raw`u(5.5, 5.5)=5.5 > u(a)=u(b)=3 \quad (\text{某些平行段上无差异})`,'原书图4.4a 说明',{model:'min',lambda:.5}),
   makePrefFrame('非凸反例：只爱极端（max 偏好）','若效用是 u=max{x₁, x₂}。取 a=(6, 1) 效用6，b=(1, 6) 效用6。折中点 M=(3.5, 3.5) 效用只有 3.5 < 6！折中反而掉入效用深谷，违反凸性。',String.raw`u(3.5, 3.5) = 3.5 < 6 = u(a) = u(b) \implies \text{非凸}`,'原书习题4.2a 对应反例',{model:'max',lambda:.5}),
   makePrefFrame('字典式偏好的惊人特性：它是严格凸的！','字典序虽然不连续，却满足严格凸性：若 a≻b 且 a₁>b₁，任何内点的一阶分量 λa₁+(1−λ)b₁ 依然严格大于 b₁，因而在内点恒有 λa+(1−λ)b ≻ b！',String.raw`\lambda a_1 + (1-\lambda)b_1 > b_1 \implies \lambda a + (1-\lambda)b \succ b`,'原书例4.7 · 印刷52页',{model:'lex',lambda:.5})
  ]
 },
 upper:{
  intro:'怎样一眼看出一种偏好是不是凸的？数学家把“偏好关系”翻译成了“几何图形的形状”：看所有比它更好的点构成的区域是不是凸集。',
  end:'命题4.2证明了等价性：偏好关系 ≽ 是凸的，当且仅当对任意基准束 x*，上优集 B(x*)={x∈X: x≽x*} 是凸集。这使得几何作图可以直接用来判定公理。',
  frames:[
   makePrefFrame('命题4.2：偏好凸 ⇔ 上优集凸','基准点为 x*。定义上优集（better set）B(x*) 为所有满足 x ≽ x* 的点组成的集合。命题4.2指出：偏好是凸的，充要条件是每一个上优集都是几何凸集。',String.raw`\succeq \text{ 是凸偏好} \iff \forall x^*,\ B(x^*) = \{x \in X : x \succeq x^*\} \text{ 是凸集}`,'原书命题4.2 · 印刷52页',{step:0}),
   makePrefFrame('充分性证明：偏好凸推导出集合凸','设 a, b ∈ B(x*)，不妨设 a≽b。由 a, b 都在集合内，传递性给出 b ≽ x*。由偏好凸性，线段内点 λa+(1−λ)b ≽ b。再由传递性，内点 ≽ x*，故内点仍落在 B(x*) 中！',String.raw`\lambda a + (1-\lambda)b \succeq b \succeq x^* \implies \lambda a + (1-\lambda)b \in B(x^*)`,'原书命题4.2前半段证明',{step:1}),
   makePrefFrame('必要性证明：令基准点 x* = b','反过来，若每个上优集都是凸集。任取 a≽b，这意味着 a 与 b 都属于集合 B(b)={x: x≽b}。由集合凸性，整条线段必然落在 B(b) 中，即 λa+(1−λ)b ≽ b！',String.raw`a, b \in B(b) \implies \lambda a + (1-\lambda)b \in B(b) \implies \lambda a + (1-\lambda)b \succeq b`,'原书命题4.2后半段证明',{step:2}),
   makePrefFrame('直观总结：无差异曲线向原点凸出','上优集由无差异曲线及其上方区域包围。无差异曲线向原点凸出、不向内凹陷，正是上优集为几何凸集的生动写照。',String.raw`B(x^*) \text{ 无缺口、无凹坑，连接内部任意两点的弦都在集内}`,'原书命题4.2几何意义归纳',{step:3})
  ]
 },
 concave:{
  intro:'经济学教材里经常把效用函数的“凹性”和偏好的“凸性”混在一起。它们是一回事吗？我们来看充分性与非必要性的边界。',
  end:'命题4.3表明凹效用函数必表示凸偏好；但反之不成立！偏好是序数的，任何单调递增变换都会改变函数形状。例如 (min{x₁,x₂})² 非凹，但它表示的偏好依然是凸的。',
  frames:[
   makePrefFrame('命题4.3：凹效用函数必能导出凸偏好','若实值效用函数 u 是凹函数，即割线始终位于曲面下方：u(λa+(1−λ)b) ≥ λu(a)+(1−λ)u(b)。若 a≽b，则 u(a)≥u(b)，于是内点效用 ≥ u(b)，偏好必然是凸的。',String.raw`u(\lambda a + (1-\lambda)b) \ge \lambda u(a) + (1-\lambda)u(b) \ge u(b)`,'原书命题4.3 · 印刷52—53页',{kind:'min',lambda:.5}),
   makePrefFrame('标准示例：min{x₁, x₂} 是凹函数','作为两个仿射函数（平面）的逐点最小值，u(x)=min{x₁, x₂} 是标准的凹函数。按照命题4.3，它代表的完全互补偏好是凸的。',String.raw`u(x) = \min\{x_1, x_2\} \text{ 是凹函数} \implies \text{偏好凸}`,'原书印刷53页例子',{kind:'min',lambda:.5}),
   makePrefFrame('反例：把效用平方，序关系丝毫不变','取单调严格递增变换 f(t)=t²，得到新函数 ũ(x) = (min{x₁, x₂})²。因为非负数平方保持大小顺序，ũ 与 u 表达的完全是同一种偏好！',String.raw`\tilde{u}(x) = (\min\{x_1, x_2\})^2 \iff \text{同一种偏好}`,'原书印刷53页反例构造',{kind:'minSquared',lambda:.5}),
   makePrefFrame('严格验证：ũ 已经不是凹函数','取 a=(0, 0) 效用0，b=(2, 2) 效用4。中点 M=(1, 1) 的效用是 1²=1。但是端点效用的平均数是 0.5×0 + 0.5×4 = 2！1 < 2，凹性不等式破裂！偏好凸，函数却非凹。',String.raw`\tilde{u}(1, 1) = 1 < 2 = 0.5\tilde{u}(0,0) + 0.5\tilde{u}(2,2) \implies \text{非凹！}`,'原书充分非必要性证毕',{kind:'minSquared',lambda:.5})
  ]
 },
 declining:{
  intro:'为什么无差异曲线越往右走越平缓？这就是著名的“边际替代率递减”。画出两次交换的商品束，用强单调性和凸性比较它们的位置。',
  end:'若强单调且凸，两段单位步长放弃的商品2数量必满足 β ≥ γ。若反过来 β < γ，两端的中点将严格劣于中间点，与凸性公理产生不可调和的矛盾。',
  frames:[
   makePrefFrame('三点设定：等间距增加商品1','取同一条无差异曲线上的三点 a=(10, 10)、b=(11, 10−β)、c=(12, 10−β−γ)，满足 a ∼ b ∼ c。第一步多得1单位商品1，愿意放弃 β 单位商品2；第二步再多得1单位商品1，愿意放弃 γ 单位商品2。',String.raw`a = (10, 10) \sim b = (11, 10-\beta) \sim c = (12, 10-\beta-\gamma)`,'原书第53页反证法设定',{step:0}),
   makePrefFrame('反证法假设：假设边际替代率递增 β < γ','反设第二步愿意放弃的更多，即 β < γ。那么 β 严格小于两者的算术平均数：β < (β + γ)/2。这导致 10 − (β+γ)/2 < 10 − β。',String.raw`\beta < \gamma \implies \beta < \frac{\beta+\gamma}{2} \implies 10 - \frac{\beta+\gamma}{2} < 10 - \beta`,'原书反证假设与代数推导',{step:1}),
   makePrefFrame('强单调性推导出的严格劣后','考察 a 与 c 的中点 M = 0.5a + 0.5c = (11, 10 − (β+γ)/2)。它的第一坐标与 b 都是 11，但第二坐标比 b 更少！由强单调性，必然有 M ≺ b！',String.raw`M = \frac{1}{2}a + \frac{1}{2}c = (11, 10-\frac{\beta+\gamma}{2}) \implies M \prec b = (11, 10-\beta)`,'原书强单调性推导',{step:2}),
   makePrefFrame('凸性公理触发矛盾：β ≥ γ 必须成立！','然而由 a ∼ c 以及偏好的凸性，线段中点 M 必须满足 M ≽ c ∼ b！同一个点 M 既要 ≺ b，又要 ≽ b，产生矛盾！因此假设不成立，必有 β ≥ γ。',String.raw`\text{凸性: } M \succeq c \sim b \quad \text{vs} \quad \text{单调性: } M \prec b \implies \text{矛盾！故 } \beta \ge \gamma`,'原书第53页边际替代率递减定理证毕',{step:2})
  ]
 },
 local:{
  intro:'在一个给定的消费点，如果你多拿一点这个、少拿一点那个，生活是变好了还是变差了？局部估值给出了方向判定准则。',
  end:'定义4.6的局部估值对 (v₁(z), v₂(z)) 构成了支撑超平面的法向量。只有在平滑曲线处才存在唯一的局部估值；在折点处左右导数不一致，局部估值不再存在。',
  frames:[
   makePrefFrame('定义4.6：局部估值的严格定义','对商品束 z，若存在非负数对 (v₁(z), v₂(z))，使得只要方向向量满足 v₁δ₁ + v₂δ₂ > 0，沿着该方向前进充分小步长 ε 后就有 z+ε(δ₁, δ₂) ≻ z，则称其为局部估值。',String.raw`v_1(z)\delta_1 + v_2(z)\delta_2 > 0 \implies \exists \epsilon>0 \text{ s.t. } z + \epsilon(\delta_1, \delta_2) \succ z`,'原书定义4.6 · 印刷53页 · 图4.5a',{kind:'product'}),
   makePrefFrame('几何解释：分离超平面与切线','在几何上，方程 v₁(x₁−z₁) + v₂(x₂−z₂) = 0 是一条穿过 z 的切线。所有使内积为正的点都在切线上方；靠近切线上方的点严格好于 z。',String.raw`v_1(x_1-z_1) + v_2(x_2-z_2) > 0`,'原书图4.5a 几何原理解释',{kind:'product'}),
   makePrefFrame('光滑曲面的良好表现：u = x₁x₂','取 z=(4, 4)。在该点，偏导数为 (4, 4)。取微调方向 δ=(1, −0.6)，内积 4(1) + 4(−0.6) = 1.6 > 0。取步长 0.2，新点 (4.2, 3.88) 效用 16.296 > 16，确有严格改善。',String.raw`u(4.2, 3.88) = 16.296 > 16 = u(4, 4)`,'原书第54页平滑效用数值验证',{kind:'product',dx:1,dy:-.6,step:.2}),
   makePrefFrame('折点的失效：min{x₁, x₂} 在拐角不可微','如果偏好是 min{x₁, x₂}，在拐角 z=(4, 4) 处无差异曲线呈 90° 尖角。无论你画哪条斜线，总有内积为正的方向无法带来任何改善（甚至落入无差异集），故局部估值不存在。',String.raw`\text{尖角处任何支撑线下方都存在平局区域，不存在合法的局部估值对}`,'原书图4.5b 折点分析',{kind:'min',dx:1,dy:-.6,step:.2})
  ]
 },
 partial:{
  intro:'怎样从效用函数的公式直接求出消费者的主观权衡？微积分的偏导数登场了。',
  end:'命题4.4指出：若偏好单调、凸，且效用函数具有连续偏导数，则偏导数向量 (u₁, u₂) 就是一组局部估值，其比值 u₁/u₂ 即为边际替代率 MRS。',
  frames:[
   makePrefFrame('命题4.4：偏导数作为局部估值','若单调凸偏好的效用函数 u 具有连续偏导数，则偏好必然可微，且在任意束 z 处，偏导数向量 (∂u/∂x₁, ∂u/∂x₂) 就是该点的一组局部估值。',String.raw`v_1(z) = \frac{\partial u}{\partial x_1}(z),\quad v_2(z) = \frac{\partial u}{\partial x_2}(z)`,'原书命题4.4 · 印刷54页',{z:[4,4]}),
   makePrefFrame('边际替代率（MRS）的微观定义','局部估值的比值 MRS = v₁(z)/v₂(z) = u₁/u₂ 度量了消费者在保持满足度不变的前提下，愿意用多少单位商品2来换取1单位商品1。',String.raw`MRS_{12} = -\left.\frac{dx_2}{dx_1}\right|_{u} = \frac{u_1}{u_2}`,'原书第54页替代率公式',{z:[4,4]}),
   makePrefFrame('实算：Cobb-Douglas 效用 u = x₁x₂','对 u=x₁x₂，偏导数为 u₁=x₂，u₂=x₁。在 z=(4, 4) 处局部估值为 (4, 4)，MRS = 4/4 = 1；在 (2, 8) 处局部估值为 (8, 2)，MRS = 8/2 = 4，越缺乏商品1越珍惜商品1。',String.raw`u(x_1, x_2) = x_1 x_2 \implies MRS = \frac{x_2}{x_1}`,'原书印刷54页典型计算',{z:[2,8]}),
   makePrefFrame('导数只反映相对比例（比例正仿射性）','若 (v₁, v₂) 是一组局部估值，则对任意 α>0，(αv₁, αv₂) 也是合法的局部估值。因为正缩放不改变超平面的方向，这与序数效用理论完全吻合。',String.raw`\forall \alpha > 0,\ (\alpha v_1, \alpha v_2) \text{ 亦为局部估值}`,'原书印刷54页 Comment 说明',{z:[2,8]})
  ]
 },
 problems1:{
  intro:'章末习题4.1：三种不同寻常的偏好。面对新奇的规则，如何严格判断单调性、连续性与凸性？',
  end:'习题4.1(a)到原点距离强单调、连续但非凸；(b)平衡束优先不连续、非凸；(c)先比总量再比商品1强单调、严格凸但不连续。做题时必须严格写出反例坐标。',
  frames:[
   makePrefFrame('习题4.1(a)：离原点距离 √(x₁²+x₂²)','偏好以欧式距离 √(x₁²+x₂²) 衡量。两坐标增加使距离变大，故强单调；距离函数连续故偏好连续。但取 a=(6, 0) 和 b=(0, 6)，中点 (3, 3) 距离仅为 3√2 ≈ 4.24 < 6，落入下方，非凸！',String.raw`d(3, 3) = \sqrt{18} \approx 4.24 < 6 = d(6, 0) \implies \text{非凸！}`,'原书习题4.1(a) · 印刷54页',{kind:'distance'}),
   makePrefFrame('习题4.1(b)：平衡束优先偏好','若 x₁=x₂，效用为 1 + x₁/(1+x₁)；若 x₁≠x₂，效用为 x₂/(1+x₂)。在对角线附近有离散加分，导致任意接近对角线的非平衡束效用跳跃，违反连续性；且取平衡点外的两端，折中点也不满足凸性。',String.raw`u(x) = \begin{cases} 1 + \frac{x_1}{1+x_1} & x_1 = x_2 \\ \frac{x_2}{1+x_2} & x_1 \ne x_2 \end{cases} \implies \text{不连续、非凸}`,'原书习题4.1(b) · 印刷54页',{kind:'balanced'}),
   makePrefFrame('习题4.1(c)：先比总量，再比商品1（sumlex）','先比较 x₁+x₂；若总量相等，再比 x₁。因为总量或分量增加都直接提升比较位，故强单调；类似于字典序，任取 a≻b，内点总量或第一分量严格大于 b，故严格凸！但扰动会导致总量打破，不连续。',String.raw`x \succ y \iff x_1+x_2 > y_1+y_2 \text{ 或 } (x_1+x_2=y_1+y_2 \text{ 且 } x_1>y_1)`,'原书习题4.1(c) · 印刷55页',{kind:'sumlex'}),
   makePrefFrame('做题方法论总结：反例必须给出明确数值','在考场上证明“非凸”或“不连续”，切忌笼统空谈；必须像上面一样，明确构造具体的端点 a、b 与中点坐标，计算效用差值，一击致命。',String.raw`\text{证明非性质: 构造具体的端点与分值矛盾即可}`,'原书习题4.1方法论总结',{kind:'summary'})
  ]
 },
 problems2:{
  intro:'章末习题4.2：三种经典效用函数形式。直接观察解析式，如何推导单调性、连续性与凸性？',
  end:'习题4.2(a) max{x₁,x₂} 单调连续但非凸；(b) x₁−x₂ 含有坏品，不满足正向单调性与标准凸性；(c) ln(1+x₁)+ln(1+x₂) 强单调、连续且严格凸。',
  frames:[
   makePrefFrame('习题4.2(a)：u(x) = max{x₁, x₂}','作为初等函数的最大值，它处处连续，且分量增加不会减少最大值，故单调。但取 a=(6, 1) 和 b=(1, 6) 效用均为 6，中点 (3.5, 3.5) 效用仅为 3.5 < 6，严重非凸。',String.raw`u(3.5, 3.5) = 3.5 < 6 = u(6, 1) \implies \text{非凸}`,'原书习题4.2(a) · 印刷55页',{kind:'max'}),
   makePrefFrame('习题4.2(b)：u(x) = x₁ − x₂（商品2是坏品）','增加商品1提升效用，但增加商品2却减少效用（∂u/∂x₂ = −1 < 0）。因此单调性不成立。无差异曲线斜率为正，不能当作普通商品分析。',String.raw`\frac{\partial u}{\partial x_2} = -1 < 0 \implies \text{不满足单调性}`,'原书习题4.2(b) · 印刷55页',{kind:'bad'}),
   makePrefFrame('习题4.2(c)：u(x) = ln(1+x₁) + ln(1+x₂)','一阶偏导数 1/(1+x₁) > 0 处处成立，强单调；作为对数和处处连续；二阶偏导数 −1/(1+x₁)² < 0，Hessian 矩阵处处负定，函数严格凹！由命题4.3偏好严格凸。',String.raw`\nabla^2 u = \begin{pmatrix} -\frac{1}{(1+x_1)^2} & 0 \\ 0 & -\frac{1}{(1+x_2)^2} \end{pmatrix} < 0 \implies \text{严格凸}`,'原书习题4.2(c) · 印刷55页',{kind:'log'}),
   makePrefFrame('考试技巧：Hessian 负定直接判定严格凸','对于可微两次的效用函数，先看一阶偏导是否为正（单调性），再求 Hessian 矩阵：主子式一阶为负、二阶为正即为严格凹，从而立刻获证严格凸偏好。',String.raw`f_{11} < 0,\quad f_{11}f_{22} - f_{12}^2 > 0 \implies \text{严格凹} \implies \text{严格凸偏好}`,'原书习题4.2应试工具总结',{kind:'summary'})
  ]
 },
 problems3:{
  intro:'章末习题4.3：对角线上的无差异束。为什么在单调且连续的偏好下，任何消费水平都能折算成“两样同样多”的等价组合？',
  end:'证明利用夹逼与介值定理：(0, 0) 劣于 x，而 (M, M) 优于 x；沿对角线 (t, t) 移动时连续效用必然穿越 u(x)，从而存在唯一的对角无差异点。',
  frames:[
   makePrefFrame('题目要求与直观设想','设 ≽ 是 X 上的单调且连续偏好关系。证明：对任意束 x，在 45° 对角线上必存在一个束 (t, t) 使得 (t, t) ∼ x。',String.raw`\forall x \in \mathbb{R}_+^2,\ \exists t \ge 0 \text{ s.t. } (t, t) \sim x`,'原书习题4.3 · 印刷55页',{t:.5}),
   makePrefFrame('构造对角线下界与上界','由 x≥(0,0)，单调性保证 x ≽ (0, 0)。令 M = max{x₁, x₂}，则 (M, M) ≥ x，由单调性 (M, M) ≽ x。故 x 被稳稳夹在对角线的两端之间。',String.raw`(0, 0) \preceq x \preceq (M, M),\quad M = \max\{x_1, x_2\}`,'原书习题4.3夹逼条件',{t:.5}),
   makePrefFrame('介值定理：对角线上必有交点','考察从 (0, 0) 到 (M, M) 的对角线段。由连续偏好的中间束性质（或连续效用函数的介值定理），函数 g(t)=u(t, t) 连续且 g(0)≤u(x)≤g(M)，必存在 t* 使得 u(t*, t*)=u(x)。',String.raw`g(t) = u(t, t) \text{ 连续 } \implies \exists t^* \in [0, M] \text{ s.t. } (t^*, t^*) \sim x`,'原书习题4.3介值定理应用',{t:.5}),
   makePrefFrame('若强单调，解还是唯一的！','若偏好进一步强单调，随 t 增大 (t, t) 严格变得更好，g(t) 严格单调递增，因而这样的 t* 不仅存在，而且绝对唯一！该 t* 常被称为确定性等价消费水平。',String.raw`\text{强单调 } \implies t^* \text{ 唯一存在}`,'原书习题4.3经济学应用',{t:.5})
  ]
 },
 problems4:{
  intro:'章末习题4.4：拟线性偏好 u(x₁, x₂) = x₂ + v(x₁)。为什么它的无差异曲线全都是垂直平行平移的？',
  end:'拟线性偏好的方程为 x₂ = u − v(x₁)。改变效用水平 u 仅仅是对图像加上一个垂直常数，斜率 MRS = v\'(x₁) 完全不依赖于 x₂，这使得该模型在福利经济学中极其方便。',
  frames:[
   makePrefFrame('拟线性效用函数标准形式','效用函数对商品2是线性的，对商品1是非线性的：u(x₁, x₂) = x₂ + v(x₁)，其中 v 是严格递增且严格凹的光滑函数（如 v(x₁)=√x₁）。',String.raw`u(x_1, x_2) = x_2 + v(x_1),\quad v' > 0,\ v'' < 0`,'原书习题4.4 · 印刷55页',{shift:2}),
   makePrefFrame('无差异曲线的解析式解出','将效用固定在常数 u*，解出纵坐标：x₂ = u* − v(x₁)。这表明无差异曲线就是函数 −v(x₁) 向上抬高了 u* 个单位！',String.raw`x_2 = u^* - v(x_1)`,'原书习题4.4显式方程',{shift:2}),
   makePrefFrame('几何特征：完全一致的垂直平行平移','如果我们要画出效用为 u*+k 的另一条无差异曲线，只需把原来的曲线整体向上平移 k 个单位！任何两条无差异曲线在相同的横坐标 x₁ 处斜率完全相同。',String.raw`\frac{\partial x_2}{\partial u^*} = 1 \implies \text{垂直距离恒等于效用差}`,'原书习题4.4平移特征',{shift:2}),
   makePrefFrame('经济学含义：边际替代率与财富无关','边际替代率为 MRS = u₁/u₂ = v\'(x₁)/1 = v\'(x₁)。它完全不包含 x₂！这意味着消费者对商品1的愿付价格只取决于已经拥有了多少商品1，绝不随收入增加而改变。',String.raw`MRS_{12} = v'(x_1) \quad (\text{与 } x_2 \text{ 完全无关！})`,'原书习题4.4无收入效应总结',{shift:2})
  ]
 },
 problems5:{
  intro:'章末习题4.5：完全互补品 min{x₁, x₂} 的偏好凸性证明。直观上拐角很尖锐，为什么它依然是合法的凸偏好？',
  end:'因为两个凹函数（仿射平面）的逐点最小值必然是凹函数。min{x₁,x₂} 是凹函数，由命题4.3其偏好必然是凸的。尖角处凸性不被破坏，只是不满足严格凸性。',
  frames:[
   makePrefFrame('题目要求：证明 min{x₁, x₂} 是凸偏好','教材习题4.5要求证明：以 u(x) = min{x₁, x₂} 为效用函数的偏好关系满足凸性定义。',String.raw`u(x_1, x_2) = \min\{x_1, x_2\} \text{ 是凸偏好}`,'原书习题4.5 · 印刷55页',{lambda:.5}),
   makePrefFrame('引理：两个凹函数的最小值依然是凹函数','考虑 f(x)=x₁ 和 g(x)=x₂。作为线性仿射函数，它们显然是凹函数。对任意两点 a, b 与 λ∈(0, 1)，利用 min 的性质可直接证明 min{f, g} 满足凹性定义。',String.raw`\min\{\lambda a_1+(1-\lambda)b_1, \lambda a_2+(1-\lambda)b_2\} \ge \lambda\min\{a_1, a_2\} + (1-\lambda)\min\{b_1, b_2\}`,'原书习题4.5凹函数推导',{lambda:.5}),
   makePrefFrame('应用命题4.3：一招致胜','既然 u(x)=min{x₁, x₂} 是数学上的凹函数，直接调用教材命题4.3（凹函数表示的偏好必为凸偏好），立刻得出该偏好是凸的！',String.raw`u \text{ 凹} \implies \succeq \text{ 凸 (命题4.3)}`,'原书命题4.3直接应用',{lambda:.5}),
   makePrefFrame('注意严格凸性的缺口：不是严格凸','如果 a=(3, 8) 且 b=(3, 3)，线段上所有点 (3, 3+5λ) 的效用都是 3，并没有严格大于 b 的效用。因此完全互补品是弱凸的，绝非严格凸。',String.raw`\lambda a + (1-\lambda)b \sim b \implies \text{凸，但非严格凸}`,'原书习题4.5严格性边界校准',{lambda:.5})
  ]
 },
 problems6:{
  intro:'章末习题4.6：L1 曼哈顿理想点偏好。距离理想点越近越好，这种偏好满足连续性与凸性吗？',
  end:'绝对值函数是凸函数，其相反数 −|x_i − x_i^*| 是凹函数。有限个凹函数之和仍为凹函数，故效用函数处处凹、处处连续，由命题4.1与4.3立刻证明该偏好既连续又凸。',
  frames:[
   makePrefFrame('题目设定：负曼哈顿距离效用','效用函数由负曼哈顿距离给出：u(x) = −(|x₁ − x₁*| + |x₂ − x₂*|)。证明该偏好满足连续性与凸性。',String.raw`u(x) = -(|x_1 - x_1^*| + |x_2 - x_2^*|)`,'原书习题4.6 · 印刷55页',{lambda:.5}),
   makePrefFrame('连续性的证明：初等函数的连续复合','绝对值函数和减法都是实数上的连续函数。连续函数的有限和仍然处处连续。由教材命题4.1（连续效用表示的偏好必连续），立刻获证偏好是连续的！',String.raw`u(x) \text{ 处处连续 } \implies \succeq \text{ 连续 (命题4.1)}`,'原书习题4.6连续性证明',{lambda:.5}),
   makePrefFrame('凸性的证明：绝对值函数的凹性取负','由三角不等式，|λa_i + (1−λ)b_i − x_i*| ≤ λ|a_i − x_i*| + (1−λ)|b_i − x_i*|。两边乘以负号，不等号反向，直接得出 u 满足凹函数定义！',String.raw`u(\lambda a + (1-\lambda)b) \ge \lambda u(a) + (1-\lambda)u(b) \implies u \text{ 凹}`,'原书习题4.6凹函数推导',{lambda:.5}),
   makePrefFrame('结论：既连续又凸的经典模型','既然 u 是连续且凹的函数，由命题4.3，该偏好关系必然是凸的。这展示了如何用凸分析工具优雅解决几何问题。',String.raw`\succeq \text{ 连续且凸}`,'原书习题4.6结论总结',{lambda:.5})
  ]
 },
 problems7:{
  intro:'章末习题4.7：相对更偏爱商品1。一个人比另一个人更看重第一样东西，怎样用无可挑剔的数学公理语言表达出来？',
  end:'设当且仅当用 β 补偿少拿 α 单位商品1能够带来改善时，我们称该个体在商品1上更具相对偏好。常替代率中 v₁/v₂ 更高者胜出；但字典序在此前件下无法直接推导。',
  frames:[
   makePrefFrame('相对偏好的严格公理定义','设对于任意 a=(a₁, a₂) 以及任意 α>0, β>0，若 (a₁−α, a₂+β) ≽₁ a，必能推出 (a₁−α, a₂+β) ≻₂ a，则称个体1相对于个体2更不偏爱商品1（即个体2相对更偏爱商品1）。',String.raw`(a_1-\alpha, a_2+\beta) \succeq_1 a \implies (a_1-\alpha, a_2+\beta) \succ_2 a`,'原书习题4.7 · 印刷56页',{alpha:1,beta:1.5}),
   makePrefFrame('固定交换率下的参数对应：v₁/v₂ 的大小','设个体1的效用是 v₁x₁ + x₂，个体2的效用是 w₁x₁ + x₂。前件成立要求 −v₁α + β ≥ 0，即 β/α ≥ v₁；后件要求 β/α > w₁。要使前者总能推出后者，充要条件是个体2的商品1估值严格更高：w₁ < v₁。',String.raw`-v_1\alpha + \beta \ge 0 \implies -w_1\alpha + \beta > 0 \iff w_1 < v_1`,'原书习题4.7代数判定',{alpha:1,beta:1.5}),
   makePrefFrame('反例与边界：字典序的前提失效','如果个体1是字典序偏好（第一项绝对优先），只要少拿了 α>0 单位商品1，无论补多少 β 都绝不可能改善，前件永远为假（空真）。因此该定义在极端不连续偏好下需谨慎检验。',String.raw`(a_1-\alpha, a_2+\beta) \prec_{lex} a \quad (\forall \beta > 0)`,'原书习题4.7边界检验',{alpha:1,beta:1.5}),
   makePrefFrame('全章总结：从公理到图像的闭环','第4章从商品束的几何（4.1）、六种偏好（4.2）、单调性（4.3）、连续性（4.4）、凸性（4.5）到可微性与MRS（4.6），建立了完整的消费者偏好理论大厦。',String.raw`X \to \succeq \to \text{单调/连续/凸/可微} \to \text{第5章需求决策}`,'原书第4章全章思想闭环',{alpha:1,beta:1.5})
  ]
 }
};

export const prefFrame=(mode,step)=>{
 const s=prefStories[mode]||prefStories.bundle;
 const idx=Math.max(0,Math.min(s.frames.length-1,step||0));
 return s.frames[idx];
};

export const prefReadout=(mode,frame)=>{
 return {title:frame.title,state:frame.state};
};

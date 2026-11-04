// Chapter 5 Consumer behavior authored film-mode stories
// Osborne–Rubinstein Chapter 5, printed pp. 57–74 / PDF 76–93

import { utilityC, demandC, hicksC, slutskyC, warpC, sourceWarp, rationalizationC, mrsC, localDerivativesC, normalMRSC, budgetC, existenceCounter } from './consumer.mjs';

const makeConsumerFrame = (title, narration, formula, source, state = {}, extra = {}) => ({
 title,
 narration,
 formula,
 source,
 state,
 ...extra
});

export const consumerStories = {
 budget: {
  id: '5.1',
  title: '§5.1 预算集与购买力几何边界',
  intro: '阿姨带12元去买包子和豆浆：包子2元一个，豆浆1元一杯。她能装出哪些购物篮？包子涨价后，哪些篮子会买不起？',
  end: '预算集回答“买不买得起”，还没回答“最喜欢哪篮”。现金预算与实物禀赋要分清：有实物时，价格变化也会改变它值多少钱。',
  frames: [
   makeConsumerFrame(
    '定义5.1：预算集的定义与几何边界',
    '每个包子2元、每杯豆浆1元，阿姨最多花12元。比如买3个包子和4杯豆浆花10元，买得起；买5个包子和4杯要14元，买不起。浅绿色区域收进所有买得起的篮子。',
    String.raw`B((p_1, p_2), w) = \{(x_1, x_2) \in \mathbb{R}_+^2 : p_1 x_1 + p_2 x_2 \le w\}`,
    '原书定义5.1 · 印刷57页 · 图5.1',
    { p: 2, q: 1, w: 12, mode: 'base' }
   ),
   makeConsumerFrame(
    '预算线与截距：相对价格与机会成本',
    '如果12元全部买包子，最多6个；全买豆浆，最多12杯。绿色边界正好花完钱：沿着它多买1个包子，要少买2杯豆浆。区域里面也买得起，只是没花完钱。',
    String.raw`p_1 x_1 + p_2 x_2 = w \implies x_2 = \frac{w}{p_2} - \frac{p_1}{p_2}x_1,\quad \text{斜率 } -\frac{p_1}{p_2}`,
    '原书第58页推导',
    { p: 2, q: 1, w: 12, mode: 'intercepts' }
   ),
   makeConsumerFrame(
    '等比例缩放不变性：无通货膨胀幻觉',
    '想象两种价格和手里的钱都翻倍：包子4元、豆浆2元、预算24元。每个篮子的花费和钱都翻倍，原来买得起的仍买得起，绿色区域一点也没变。',
    String.raw`B((\lambda p_1, \lambda p_2), \lambda w) = \{(x_1, x_2) : \lambda p_1 x_1 + \lambda p_2 x_2 \le \lambda w\} = B((p_1, p_2), w)`,
    '原书第58页注记',
    { p: 4, q: 2, w: 24, scale: 2, mode: 'scale' }
   ),
   makeConsumerFrame(
    '实物禀赋与市场交换：财富内生化',
    '现在换一个问题：阿姨一开始不是拿现金，而是已有4个包子和4杯豆浆，可以按市价交换。按现在的价格，它们合计值12元；她也可以原样保留，所以预算线经过这个初始篮子。',
    String.raw`w = p_1 e_1 + p_2 e_2,\quad B((p_1, p_2), p \cdot e) = \{x \in \mathbb{R}_+^2 : p \cdot x \le p \cdot e\}`,
    '原书印刷57—58页禀赋模型',
    { p: 2, q: 1, w: 12, endowment: [4, 4], mode: 'endowment' }
   ),
   makeConsumerFrame(
    '有实物时：包子涨价，初始篮子仍在',
    '包子涨到3元、豆浆仍是1元。阿姨已有的4个包子和4杯豆浆现在值16元；不交换仍能保留原篮子，所以新预算线仍经过它。',
    String.raw`w=3\times4+1\times4=16,\quad 3x_1+x_2\le16`,
    '原书印刷57—58页禀赋模型 · 自主数值',
    { p: 3, q: 1, w: 16, endowment: [4, 4], mode: 'endowment' }
   ),
   makeConsumerFrame(
    '换回现金题：重新拿12元去买',
    '现在换回最初的现金题：手里只有12元，包子2元、豆浆1元。注意这是另一个设定，不能把刚才的实物价值继续当作现金收入。',
    String.raw`2x_1+x_2\le12`,
    '原书定义5.1 · 自主数值',
    { p: 2, q: 1, w: 12, mode: 'base' }
   ),
   makeConsumerFrame(
    '现金不变：包子涨价后哪些篮子买不起？',
    '包子涨到3元，但现金仍是12元、豆浆仍是1元。全买包子最多从6个变成4个，全买豆浆仍是12杯；预算线围绕豆浆截距向里转。',
    String.raw`3x_1+x_2\le12,\quad x_1\le4\ \text{当 }x_2=0`,
    '原书预算集定义 · 自主价格变化示例',
    { p: 3, q: 1, w: 12, mode: 'base' }
   )
  ]
 },

 rules: {
  id: '5.2',
  title: '§5.2 需求函数与经典启发式规则',
  intro: '阿姨拿12元买包子和豆浆。先说清自己的购买规则，再看钱够买多少；不同规则会带来不同的购物篮。',
  end: '同样的钱和价格，不同购买规则可能得到不同篮子。需求函数先描述怎么选；是否能用稳定偏好解释，还要另查。',
  frames: [
   makeConsumerFrame(
    '定义5.2：需求函数的数学形式',
    '阿姨手里有12元，包子和豆浆开始都卖1元。绿色区域是买得起的篮子；到底挑哪一篮，还需要给出购买规则。需求函数就是给每个预算集指定一个买得起的篮子。',
    String.raw`x((p_1, p_2), w) \in B((p_1, p_2), w)`,
    '原书定义5.2 · 印刷58页',
    { rule: 'intro', p: 1, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '例5.1：只买便宜的商品（全买低价品）',
    '先看第一条规则：哪样便宜就只买哪样。这次包子1元、豆浆2元，12元全买包子，得到12个包子、0杯豆浆。同价时，教材另规定两样各花一半的钱。',
    String.raw`x((p_1, p_2), w) = \begin{cases} (\frac{w}{p_1}, 0) & p_1 < p_2 \\ (\frac{w}{2p_1}, \frac{w}{2p_2}) & p_1 = p_2 \\ (0, \frac{w}{p_2}) & p_1 > p_2 \end{cases}`,
    '原书例5.1 · 印刷59页',
    { rule: 'cheaper', p: 1, q: 2, w: 12 }
   ),
   makeConsumerFrame(
    '例5.2：两种商品各买相同数量',
    '换一种规则和价钱：包子2元、豆浆1元，仍有12元。阿姨坚持两样数量一样，一份包子加一杯豆浆共3元，所以能买4组，即4个包子和4杯豆浆。',
    String.raw`x_1 = x_2 = \frac{w}{p_1 + p_2}`,
    '原书例5.2 · 印刷59页',
    { rule: 'equal', p: 2, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '例5.3：两种商品各花一半财富',
    '包子2元、豆浆1元、预算12元都不变，只换规则：两样各花6元。包子能买3个，豆浆能买6杯。注意：各花一半的钱，不等于两样数量相同！',
    String.raw`x_1 = \frac{w}{2p_1},\quad x_2 = \frac{w}{2p_2}`,
    '原书例5.3 · 印刷59页',
    { rule: 'half', p: 2, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '例5.4：商品1优先买至7单位上限',
    '再换一种规则：包子最多先买7个，有剩钱才买豆浆。这次两样都是1元，先用7元买7个包子，剩下5元买5杯豆浆。数量和价格是自主设定。',
    String.raw`x((p_1, p_2), w) = \begin{cases} (\frac{w}{p_1}, 0) & \frac{w}{p_1} \le 7 \\ (7, \frac{w-7p_1}{p_2}) & \frac{w}{p_1} > 7 \end{cases}`,
    '原书例5.4 · 印刷59页',
    { rule: 'cap', p: 1, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '便宜品规则的同价情况',
    '回到只买便宜品的规则：如果两样都是1元，没有哪样更便宜。教材在这里规定平分12元，所以买6个包子和6杯豆浆；这是一条明确的同价规则。',
    String.raw`p_1=p_2=1,\quad x=\left(\frac{12}{2},\frac{12}{2}\right)=(6,6)`,
    '原书例5.1 · 印刷59页 · 自主数值',
    { rule: 'cheaper', p: 1, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '先买7个：钱不够时怎么办？',
    '换回先买包子的规则：包子2元、豆浆1元，手里只有10元。10元只够5个包子，买不到7个，也就没有剩钱买豆浆，购物篮是(5,0)。',
    String.raw`p_1=2,\quad w=10,\quad x_1=\min\left\{7,\frac{10}{2}\right\}=5,\quad x_2=0`,
    '原书例5.4 · 印刷59页 · 自主数值',
    { rule: 'cap', p: 2, q: 1, w: 10 }
   )
  ]
 },

 homogeneous: {
  id: '5.2',
  title: '§5.2 需求函数的零次齐次性',
  intro: '阿姨有12元买包子和豆浆，每样1元，习惯两样各花一半钱。如果价格和钱一起翻倍，她还能买到原来的篮子吗？',
  end: '所有价格与预算乘同一个正数，买得起的篮子不变。教材把需求定义为给预算集指定篮子，所以同一个预算集得到同一个选择；只涨一种价格是另一回事。',
  frames: [
   makeConsumerFrame(
    '先看原来的购物篮',
    '包子1元、豆浆1元，手里有12元。阿姨按本例规则各花6元，买6个包子和6杯豆浆；紫点就是(6,6)，绿线上的篮子刚好花完钱。',
    String.raw`x((\lambda p_1, \lambda p_2), \lambda w) = x((p_1, p_2), w),\quad \forall \lambda > 0`,
    '原书第59页定义5.2讨论',
    { p: 1, q: 1, w: 12, lambda: 1 }
   ),
   makeConsumerFrame(
    '价格和钱都翻倍',
    '现在包子、豆浆都涨到2元，钱也变成24元。各花12元，还是买6个包子、6杯豆浆。每个篮子的价格与钱同时翻倍，所以整块能买的区域也不变。',
    String.raw`x_1 = \frac{24}{2 \times 2} = 6 = \frac{12}{2 \times 1}`,
    '原书第59页代数验证',
    { p: 2, q: 2, w: 24, lambda: 2 }
   ),
   makeConsumerFrame(
    '都变成三倍，也一样',
    '包子和豆浆都是3元，钱是36元。两样各花18元，仍得到(6,6)。只要所有价格和预算乘的是同一个正数，预算集保持不变。',
    String.raw`x((\lambda p_1,\lambda p_2),\lambda w)=x((p_1,p_2),w),\quad\lambda>0`,
    '原书第59页定义5.2讨论 · 自主数值',
    { p: 3, q: 3, w: 36, lambda: 3 }
   ),
   makeConsumerFrame(
    '回到原来的价钱和钱',
    '再把所有价格和预算同时缩回原样：包子1元、豆浆1元、预算12元。购物篮和预算线仍不变。接下来只让包子涨价，看看区别。',
    String.raw`(p_1,p_2,w)=(1,1,12),\quad x=(6,6)`,
    '原书第59页定义5.2讨论 · 自主数值',
    { p: 1, q: 1, w: 12, lambda: 1 }
   ),
   makeConsumerFrame(
    '只有包子涨价：这不是同时翻倍',
    '包子涨到2元，豆浆仍是1元，预算仍是12元。按两样各花一半的规则，买3个包子和6杯豆浆；预算线变了。这只是本规则的结果，不能推断所有购买规则的变化方向。',
    String.raw`(p_1,p_2,w)=(2,1,12),\quad x=(3,6)`,
    '原书第59页需求定义 · 自主对比例子',
    { p: 2, q: 1, w: 12 }
   )
  ]
 },

 optimum: {
  id: '5.3',
  title: '§5.3 理性消费者与最优解的存在唯一性',
  intro: '阿姨拿12元买包子和豆浆。钱只能告诉她哪些篮子买得起；她喜欢怎样搭配，才决定哪一篮最满意。',
  end: '先看预算，再看给定的偏好：平滑时可能出现切点，搭配着吃可能在折点，完全替代且同价可能有多个最优篮子。',
  frames: [
   makeConsumerFrame(
    '先看一个买得起的篮子',
    '包子2元、豆浆1元，阿姨有12元。先假设满意程度由 u=√(x₁x₂) 表示；篮子(2,8)刚好花完钱，满意程度是4。沿预算线换一点试试，还能不能更满意？',
    String.raw`\max_{(x_1, x_2) \in X} u(x_1, x_2) \quad \text{s.t. } p_1 x_1 + p_2 x_2 \le w`,
    '原书定义5.3 · 印刷60页',
    { p: 2, q: 1, w: 12, model: 'cd', a: .5, candidate: [2, 8] }
   ),
   makeConsumerFrame(
    '沿预算线换到更满意的篮子',
    '包子2元、豆浆1元、预算12元不变。少买2杯豆浆，省下的钱刚好多买1个包子，篮子从(2,8)变成(3,6)。本例满意程度从4提高到√18；比较整个预算集后，(3,6)是唯一最优篮子，紫色无差异曲线与预算线相切。',
    String.raw`u(2,8)=4<\sqrt{18}=u(3,6),\quad (x_1^*,x_2^*)=(3,6)`,
    '原书命题5.1 · 印刷60页',
    { p: 2, q: 1, w: 12, model: 'cd', a: .5, proof: true }
   ),
   makeConsumerFrame(
    '换一种偏好：只在意成套搭配',
    '换成另一位顾客：她只在意一包子配一杯豆浆，满意程度 u=min{x₁,x₂}。价格和预算仍是2元、1元和12元；一套3元，最多4套，唯一最优篮子是(4,4)，在折点而非光滑切点。',
    String.raw`u = \min\{x_1, x_2\} \implies x_1^* = x_2^* = \frac{w}{p_1 + p_2}`,
    '原书例5.5 · 印刷61页',
    { p: 2, q: 1, w: 12, model: 'complement' }
   ),
   makeConsumerFrame(
    '再换一种偏好：同价时怎么分都一样',
    '现在是假想的完全替代情形：顾客认为包子和豆浆每单位带来的满意程度一样，u=x₁+x₂；两样都改成1元，预算仍12元。只要花完12元，整条预算线上的篮子都同样满意，所以最优解有很多个。',
    String.raw`p_1 = p_2 \implies \text{整条预算线 } \{(x_1, x_2) : x_1+x_2 = w/p_1\} \text{ 均最大化效用}`,
    '原书例5.6 · 印刷61页',
    { p: 1, q: 1, w: 12, model: 'linear' }
   )
  ]
 },

 existence: {
  id: '5.3',
  title: '§5.3 连续性缺失导致最优解不存在的反例',
  intro: '若偏好不连续，即使预算集是紧集，效用最大化问题也可能无解。',
  end: '极值定理的前提是目标函数连续与定义域紧致。微观经济学公理化体系中连续性假定至关重要。',
  frames: [
   makeConsumerFrame(
    '构造反例：在边界处效用骤降的不连续偏好',
    '设预算财富为 1、价格为 (1, 1)。在 x₁<1 时效用为 u(x)=x₁；但在 x₁=1 处效用骤跌为 0。预算集虽然包含端点 (1, 0)，但该点效用为 0。',
    String.raw`u(x) = \begin{cases} x_1 & x_1 < 1 \\ 0 & x_1 \ge 1 \end{cases}`,
    '原书第60页连续性条件 · 自主构造的反例',
    { progress: .8 }
   ),
   makeConsumerFrame(
    '逐步逼近上确界：每一个候选点都能被超越',
    '现在取 x₁=0.95，效用也是0.95；还可以选择 x₁=0.975，效用更高。效用上确界为1，却没有任何可行束达到1。图的纵轴是效用，不是商品2。',
    String.raw`\sup_{x \in B} u(x) = 1,\quad \text{但 } \forall x \in B,\ u(x) < 1`,
    '原书第60页连续性条件 · 自主反例的上确界',
    { progress: .95 }
   ),
   makeConsumerFrame(
    '反例结论：紧预算集不自动保证存在最优解',
    '这个自主例子在 x₁=1 处效用骤降，因此偏好不连续，也不满足单调性；它没有最优选择。连续性是教材存在性结论的充分条件，某些不连续偏好也可能有最优解。',
    String.raw`\arg\max_{x \in B} u(x) = \emptyset`,
    '原书第60页连续性条件 · 自主反例总结',
    { progress: .99 }
   )
  ]
 },

 mrs: {
  id: '5.4',
  title: '§5.4 可微偏好、边际替代率与切点条件',
  intro: '阿姨用12元买包子和豆浆。她心里愿意用多少豆浆换一点包子？市场又要求她放弃多少？把这两笔账放在一起看。',
  end: '内点的局部最优需要主观交换率等于市场价格比；角点只能检查可行的一侧。解题还要核对偏好、可行性与全局最优。',
  frames: [
   makeConsumerFrame(
    '先算两笔交换账',
    '包子2元、豆浆1元，预算12元。假设满意程度 u=x₁x₂，先比较篮子(2,8)：附近多拿一点包子、保持满意程度时，阿姨每增加1单位包子愿放弃约4杯豆浆；市场实际只要求2杯。这是局部交换率，不是说一次换整单位仍精确相同。',
    String.raw`MRS(x_1, x_2) = \frac{\partial u/\partial x_1}{\partial u/\partial x_2} = -\left.\frac{dx_2}{dx_1}\right|_{u=\text{常数}}`,
    '原书定义5.4 · 印刷62页',
    { p: 2, q: 1, w: 12, model: 'product', candidate: [2, 8] }
   ),
   makeConsumerFrame(
    '沿预算线调整，直到两笔账相同',
    '包子2元、豆浆1元、预算12元不变。篮子从(2,8)调整到(3,6)，满意程度从16升到18；此时局部愿意放弃的豆浆数量为6÷3=2，恰好等于市场价格比2。这里是内点，紫色无差异曲线与预算线相切。',
    String.raw`MRS(x_1^*, x_2^*) = \frac{p_1}{p_2}`,
    '原书命题5.2 · 印刷62页 · 图5.2a',
    { p: 2, q: 1, w: 12, model: 'product', tangent: true }
   ),
   makeConsumerFrame(
    '把图上的相切写成可套用的算式',
    '在这个 u=x₁x₂ 的例子中，MRS=x₂/x₁。先令它等于价格比2，再与预算式 2x₁+x₂=12 联立，得到(3,6)。还要检查两种数量均为正、预算可行，并确认它是全局最优。',
    String.raw`\frac{x_2}{x_1} = \frac{p_1}{p_2} \implies x_1^* = \frac{w}{2p_1},\quad x_2^* = \frac{w}{2p_2}`,
    '原书例5.7 · 印刷63页 · 图5.3',
    { p: 2, q: 1, w: 12, model: 'product', bundle: [3, 6] }
   ),
   makeConsumerFrame(
    '另一侧：包子拿得太多时',
    '再假想比较篮子(4,4)，同样花完12元。附近阿姨每增加1单位包子只愿放弃约1杯豆浆，但市场要2杯；反过来少拿一点包子、多拿豆浆，会让本例满意程度提高。',
    String.raw`MRS(4,4)=\frac{4}{4}=1<2=\frac{p_1}{p_2}`,
    '原书命题5.2 · 印刷62页 · 自主数值',
    { p: 2, q: 1, w: 12, model: 'product', candidate: [4,4] }
   ),
   makeConsumerFrame(
    '回到两笔账相同的位置',
    '从(4,4)沿预算线回到(3,6)，满意程度由16升到18，主观交换率从1升到2。本例这个内点是全局最优；如果最优在角点或偏好不可微，就不能直接套用内点相等式。',
    String.raw`(4,4)\to(3,6),\quad MRS(3,6)=2=\frac{p_1}{p_2}`,
    '原书命题5.2和例5.7 · 印刷62—63页 · 自主数值',
    { p: 2, q: 1, w: 12, model: 'product' }
   )
  ]
 },

 corners: {
  id: '5.4',
  title: '§5.4 拟线性偏好与角点到内点的跃迁',
  intro: '包子3元、豆浆1元，阿姨的钱慢慢变多。为什么她最初只买豆浆，后来才开始同时买包子？',
  end: '先判断算出的候选是否可行。预算不足时只买豆浆；临界点仍在角上；超出临界预算后，本例才出现两样都买的内点。',
  frames: [
   makeConsumerFrame(
    '1元预算：先看能买什么',
    '包子3元、豆浆1元，阿姨只有1元。本例假设满意程度 u=x₁+√x₂，数量可为小数。她选择0个包子、1杯豆浆；紫点落在纵轴上，这叫角点。',
    String.raw`u(x)=x_1+\sqrt{x_2},\quad MRS(x)=2\sqrt{x_2}\quad(x_2>0)`,
    '原书例5.8 · 印刷63页',
    { p: 3, q: 1, w: 1, model: 'quasi' }
   ),
   makeConsumerFrame(
    '为什么不先买一点包子？',
    '在篮子(0,1)附近，阿姨保持满意程度时每多一点包子愿意放弃豆浆的局部比率是2，市场价格比却是3。沿预算线转去买一点包子并不划算；她也买不起内点候选所需的2.25杯豆浆。',
    String.raw`w < p_2\left(\frac{p_1}{2p_2}\right)^2 \implies x^* = \left(0, \frac{w}{p_2}\right) \quad (\text{角点解})`,
    '原书第63—64页角点分析 · 图5.2b',
    { p: 3, q: 1, w: 1, model: 'quasi', corner: true }
   ),
   makeConsumerFrame(
    '预算到6元：两样都买',
    '价格和偏好不变，预算增加到6元。在本例中，阿姨选1.25个包子、2.25杯豆浆，花完6元，两种数量都为正；这时 MRS=3，与价格比相等，是内点。',
    String.raw`w > p_2\left(\frac{p_1}{2p_2}\right)^2 \implies x_2^* = \left(\frac{p_1}{2p_2}\right)^2,\quad x_1^* = \frac{w - p_2 x_2^*}{p_1}`,
    '原书例5.8内点总结',
    { p: 3, q: 1, w: 6, model: 'quasi', bundle: [1.25, 2.25] }
   ),
   makeConsumerFrame(
    '临界点：相等也可能在角上',
    '把预算拿回2.25元，两种价格不变。最优篮子是(0,2.25)：还没有买包子，却有 MRS=3=价格比。这里相等式成立，但这个点仍是角点。',
    String.raw`w=2.25,\quad x^*=(0,2.25),\quad MRS=3=\frac{p_1}{p_2}`,
    '原书例5.8 · 印刷63—64页 · 自主数值',
    { p: 3, q: 1, w: 2.25, model: 'quasi', corner: true }
   ),
   makeConsumerFrame(
    '越过临界预算，包子开始进入篮子',
    '预算回到6元后，篮子又是(1.25,2.25)。在这个给定偏好和固定价格下，继续增加预算时最优豆浆数量保持2.25；这不代表豆浆没有额外效用，也不是所有偏好的结论。',
    String.raw`x_2^*=\frac{9}{4},\quad x_1^*=\frac{w-9/4}{3}\quad(w>9/4)`,
    '原书例5.8 · 印刷63—64页 · 自主数值',
    { p: 3, q: 1, w: 6, model: 'quasi' }
   )
  ]
 },

 rationalize: {
  id: '5.5',
  title: '§5.5 需求函数的理性化检验',
  intro: '顾客买包子和豆浆总按某个规则挑篮子。能否找到一套稳定偏好，让这个规则在每一种预算下都选到最满意的篮子？',
  end: '一个例子只能检验一处；要证明整个规则可被理性化，必须对所有允许的预算成立。同价平局也要按规则核对。',
  frames: [
   makeConsumerFrame(
    '先看一次购物，别急着下结论',
    '顾客有12元，包子1元、豆浆2元，按照“只买便宜的”规则选了12个包子。这一次选择能和什么偏好相符？注意：只看一次相符，不足以证明所有价格下都相符。',
    String.raw`x(p, w) \in \arg\max_{z \in B(p, w)} u(z) \quad \forall (p, w)`,
    '原书定义5.5 · 印刷64页',
    { rule: 'cheaper', candidate: 'linear', p: 1, q: 2, w: 12, reveal: 0 }
   ),
   makeConsumerFrame(
    '试一套偏好：只在乎总数量',
    '假设她认为每个包子和每杯豆浆都贡献相同的满意程度，u=x₁+x₂。这次全买便宜的包子得到12份，确实最满意。一般地，花同样的钱先买便宜品能得到最多总量；同价时均分的选择也在整条最优线上。',
    String.raw`x_{\text{便宜}} \text{ 可被 } u(x) = x_1 + x_2 \text{ 理性化}`,
    '原书例5.9 · 印刷65页',
    { rule: 'cheaper', candidate: 'linear', p: 1, q: 2, w: 12, reveal: 1 }
   ),
   makeConsumerFrame(
    '换一条规则：两样各花一半',
    '换成另一条规则和偏好：包子2元、豆浆1元、预算12元，两样各花6元，买到(3,6)。用 u=x₁x₂ 可以解释这个规则；要证明所有正价格和预算都成立，还需把两样支出相乘并比较，见下面做题步骤。',
    String.raw`x_{\text{一半}} \text{ 可被 } u(x) = x_1 x_2 \text{ 理性化}`,
    '原书例5.10 · 印刷65页',
    { rule: 'half', candidate: 'product', p: 2, q: 1, w: 12, reveal: 1 }
   ),
   makeConsumerFrame(
    '另一条规则：总买贵的会怎样？',
    '换成“全买贵的”：价格(1,2)、预算12时选 A=(0,6)；价格(2,1)时选 B=(6,0)。每次对方篮子都只花6元、严格有剩钱；在商品和偏好稳定且单调的假设下，两次选择构成矛盾。具体推理可看同节WARP动画。',
    String.raw`p^A\cdot B=6<12,\quad p^B\cdot A=6<12`,
    '原书例5.11 · 印刷65页',
    { rule: 'expensive', p: 1, q: 2, w: 12 }
   ),
   makeConsumerFrame(
    '同价时：最优可以不止一个',
    '回到“只买便宜的”规则：两样均1元、预算12元时，规则规定两样各花6元，选(6,6)。在 u=x₁+x₂ 下，预算线上每个篮子的总量都是12；(6,6)是最优之一，不要求它是唯一最优。',
    String.raw`p_1=p_2=1,\quad x=(6,6),\quad u=x_1+x_2=12`,
    '原书例5.9 · 印刷65页 · 自主数值',
    { rule: 'cheaper', candidate: 'linear', p: 1, q: 1, w: 12, reveal: 1 }
   ),
   makeConsumerFrame(
    '核对教材附带说法：同价反例',
    '原书例5.9还说 max{x₁,x₂} 和 x₁²+x₂² 也解释这条包含同价均分的规则。但两样1元、预算12元时，规则选(6,6)；换成(12,0)也买得起。前者在max偏好下分别是6和12，在平方和偏好下分别是72和144，因此均分并非最优。这与原书该附带说法不一致。',
    String.raw`\max(6,6)=6<12=\max(12,0),\quad 6^2+6^2=72<144=12^2`,
    '原书例5.9 · 印刷65页 · 同价反例校验',
    { rule: 'cheaper', candidate: 'max', p: 1, q: 1, w: 12, reveal: 1, textbookCheck: true }
   )
  ]
 },

 warp: {
  id: '5.5',
  title: '§5.5 显示偏好弱公理 (WARP)',
  intro: '同一位顾客两次拿2元买包子和豆浆，价格换了，她的选择也换了。两次选择能否由同一套稳定、单调的偏好解释？',
  end: '两次互相买得起，且至少一次严格有剩钱，才出现这里的 WARP 反向矛盾；通过这两次检验不代表整个需求函数已经被理性化。',
  frames: [
   makeConsumerFrame(
    '第一次：能买包子，却选了豆浆',
    '第一次包子1元、豆浆2元，预算2元。顾客选 A=(0,1)，花完2元；B=(1,0)只花1元也买得起。选择A说明A至少不差于B；在商品越多越好的假设下，B还便宜1元，因此可进一步推出A严格优于B。',
    String.raw`p \cdot b \le w \implies a \succeq^* b \quad (\text{直接显示偏好})`,
    '原书定义5.6 · 印刷66页',
    { step: 1, scenario: 'source', stage: 1 }
   ),
   makeConsumerFrame(
    '第二次：能买豆浆，却选了包子',
    '第二次包子2元、豆浆1元，预算还是2元。顾客选 B=(1,0)，花完2元；A=(0,1)只花1元也买得起。按同样的单调性推理，这次又得到B严格优于A。',
    String.raw`a\succeq^* b\quad\text{且}\quad b\succ^* a\quad\text{不能同时成立}`,
    '原书定义5.7 · 印刷67页',
    { step: 2, scenario: 'source', stage: 2 }
   ),
   makeConsumerFrame(
    '把两次选择放在一起',
    '第一次选A，B只花1元；第二次选B，A也只花1元。两次都在2元预算内，而且都严格有剩钱。同一套稳定的单调偏好不能既让A严格优于B，又让B严格优于A；这两次观察违反 WARP。',
    String.raw`x(p, w) \text{ 可理性化 } \implies x \text{ 满足 WARP}`,
    '原书命题5.3 · 印刷67页',
    { step: 3, scenario: 'source', stage: 2, proof: true }
   ),
   makeConsumerFrame(
    '为什么“便宜且没选”能推出严格？',
    '以第一次为例，B花1元，还有1元余款。比如 C=(1.2,0.2) 花1.6元，也买得起，而且包子和豆浆都比B多。单调性使C严格优于B；顾客却在同一预算中选了A，所以A至少不差于C，从而A严格优于B。第二次同理。',
    String.raw`C=(1.2,0.2),\quad p^A\cdot C=1.6<2,\quad A\succeq C\succ B`,
    '原书印刷67页反例验证',
    { step: 4, scenario: 'source', stage: 2, violation: true, showC: true }
   ),
   makeConsumerFrame(
    '对照：两次都刚好买得起',
    '换一个自主对照：两样都卖1元、预算1元，A和B都刚好在同一条预算线上。若两次分别选A和B，双方都是弱可负担，没有本定义要求的严格显示，不能仅凭这两次说违反WARP。注意：同一预算集出现不同选择还违背教材的单值需求设定，可能涉及平局选择；这也不能证明整个需求函数可被理性化。',
    String.raw`p^A\cdot B=1=w^A,\quad p^B\cdot A=1=w^B`,
    '原书定义5.7 · 印刷67页 · 自主边界对照',
    { step: 5, scenario: 'tie', stage: 2 }
   )
  ]
 },

 curves: {
  id: '5.6',
  title: '§5.6 常规需求曲线、交叉需求与恩格尔曲线',
  intro: '阿姨买包子和豆浆，习惯两样各花一半钱。包子便宜了、或者手里的钱变多了，买多少会怎么变？',
  end: '先说清变的是哪一个条件、看的是哪一种商品，再沿着对应的曲线读数量。本例的方向来自给定规则，不能当作所有消费者的规律。',
  frames: [
   makeConsumerFrame(
    '先看包子：2元时买多少？',
    '阿姨有12元，豆浆每杯1元，包子每个2元。她按本例规则拿6元买包子，所以买3个。图的横轴是包子价格，纵轴是包子数量；紫点表示(2,3)。',
    String.raw`x_1^*(p_1) = x_1((p_1, p_2^0), w^0),\quad \hat{x}_2(p_1) = x_2((p_1, p_2^0), w^0),\quad x_k(w) = x_k((p_1^0, p_2^0), w)`,
    '原书定义5.8 · 印刷68页',
    { curve: 'own', p: 2, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '包子降到1元：看自己的需求',
    '豆浆价格和12元不变，包子从2元降到1元。她还是拿6元买包子，于是从3个买到6个；紫点沿包子自己的需求曲线移动到(1,6)。',
    String.raw`x_1^*(p_1) = \frac{w}{2p_1} = \frac{6}{p_1}`,
    '原书第69页常规需求推导',
    { curve: 'own', p: 1, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '换个问题：包子价影响豆浆吗？',
    '现在横轴仍是包子价格，纵轴改成豆浆数量。因为本例总给豆浆分6元，而豆浆每杯1元，所以不论包子价如何变化，她都买6杯；这是本例的特殊规则。',
    String.raw`\hat{x}_2(p_1) = \frac{w}{2p_2} = 6 \quad (\text{水平常数线})`,
    '原书第69页交叉需求分析',
    { curve: 'cross', p: 1, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '再换问题：钱变了，买几个包子？',
    '包子和豆浆都是1元，先看预算12元。阿姨拿一半即6元买包子，所以买6个。现在横轴换成预算、纵轴是包子数量，这条线叫恩格尔曲线。',
    String.raw`x_1(w) = \frac{w}{2p_1} = \frac{w}{2} \quad (\text{线性 Engel 曲线})`,
    '原书第69页 Engel 曲线',
    { curve: 'engel', p: 1, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '预算少时：先看4元',
    '两种价格仍是1元；如果预算是4元，她拿2元买包子，买2个。点(4,2)表示预算4元、包子2个，不能把横轴读成包子价格。',
    String.raw`x_1(4)=\frac{4}{2}=2`,
    '原书定义5.8 · 印刷68页 · 自主数值',
    { curve: 'engel', p: 1, q: 1, w: 4 }
   ),
   makeConsumerFrame(
    '预算增加到16元',
    '两种价格仍是1元；预算从4元增加到16元，买包子的钱从2元增加到8元，所以包子从2个增至8个。紫点沿恩格尔曲线从(4,2)走到(16,8)。',
    String.raw`x_1(16)=\frac{16}{2}=8`,
    '原书定义5.8 · 印刷68页 · 自主数值',
    { curve: 'engel', p: 1, q: 1, w: 16 }
   ),
   makeConsumerFrame(
    '再看交叉需求：包子2元时',
    '重新看包子价对豆浆的影响：预算12元、豆浆1元，包子2元。她给豆浆分6元，买6杯；横轴是包子价格，纵轴是豆浆数量。',
    String.raw`\hat{x}_2(2)=\frac{12}{2\times1}=6`,
    '原书定义5.8 · 印刷68页 · 自主数值',
    { curve: 'cross', p: 2, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '包子降价，豆浆仍买6杯',
    '包子从2元降到1元，预算仍12元、豆浆仍1元。在各花一半的规则下，豆浆数量始终是6杯，所以紫点沿水平线移动；这不代表所有商品之间都没有交叉影响。',
    String.raw`\hat{x}_2(1)=\hat{x}_2(2)=6`,
    '原书定义5.8 · 印刷68页 · 自主数值',
    { curve: 'cross', p: 1, q: 1, w: 12 }
   )
  ]
 },

 normal: {
  id: '5.6',
  title: '§5.6 钱多了，包子会多买吗？',
  intro: '包子和豆浆都卖1元。阿姨的钱从8元增加到12元，先猜猜她会不会多买包子。',
  end: '本例中包子随预算增加；一般判断还要看偏好和题目条件，不能只凭一次观察下结论。',
  frames: [
   makeConsumerFrame('先看8元怎么花', '阿姨有8元，包子和豆浆都卖1元。假设她的满意程度由两样数量的乘积决定，那么各买4份最满意，绿点 A 是原来的最优篮子。', String.raw`x_1+x_2=8,\quad u=x_1x_2,\quad A=(4,4)`, '原书定义5.9 · 印刷69页 · 自主数值', {p:1,q:1,w:8,extraW:0,model:'cd',stage:'initial'}),
   makeConsumerFrame('钱多了，先假想不多买包子', '现在钱增加到12元，价格和偏好不变。先假设包子仍买4个，多出的4元全部买豆浆，得到金点 D=(4,8)。这是为了比较而假想的篮子，不是已经选定的新最优。', String.raw`D=(4,8),\quad MRS(D)=\frac{8}{4}=2>\frac{p_1}{p_2}=1`, '原书命题5.4 · 印刷70页 · 自主数值', {p:1,q:1,w:8,extraW:4,model:'cd',stage:'budget'}),
   makeConsumerFrame('沿新预算线比较：换一点包子', 'D 点附近，她愿意用约2杯豆浆换1个包子，市场却只要她放弃1杯。沿新预算线比较，满意程度从 D 的32升到 B 的36；本例最优是各买6份。', String.raw`u(D)=4\times8=32<36=6\times6=u(B),\quad B=(6,6)`, '原书第70页几何推导 · 自主数值', {p:1,q:1,w:8,extraW:4,model:'cd',stage:'optimal',candidate:[6,6]}),
   makeConsumerFrame('记住结论，也记住条件', '这个例子里两样各花一半，价格固定时包子数量等于预算的一半，预算从8变12，包子从4变6。在相关收入范围内需求不减少，称正常；仅看两个点不能证明别的偏好也如此。', String.raw`x_1^*(w)=\frac{w}{2}\quad(w>0,\;p_1=p_2=1)`, '原书定义5.9、命题5.4 · 印刷69—70页', {p:1,q:1,w:8,extraW:4,model:'cd',stage:'optimal',candidate:[6,6]})
  ]
 },

 slutsky: {
  id: '5.6',
  title: '§5.6 斯勒茨基分解：替代效应与收入效应',
  intro: '一位阿姨拿12元买包子和豆浆，包子突然涨价。她少买了多少，究竟是因为包子相对更贵，还是因为这12元更不经花了？',
  end: '先假想补到旧篮子刚好买得起，比较 A 到 B；再拿掉补偿，比较 B 到 C。补偿是算账用的假想，不表示她真的收到钱。',
  frames: [
   makeConsumerFrame(
    '第一步：初始最优状态 A',
    '开始时包子和豆浆都是1元，阿姨有12元。按照本例给出的偏好，她选了6个包子和6杯豆浆；图上的 A 就是原来的购物篮。',
    String.raw`A = x(1, 1, 12) = (6, 6),\quad u(A) = 36`,
    '原书第70页 Slutsky 分析起点',
    { step: 0, p0: 1, p1: 2, q: 1, w: 12 }
   ),
   makeConsumerFrame(
    '第二步：价格上涨与 Slutsky 补偿财富',
    '包子涨到2元。原来那篮东西现在要18元，比原预算多6元。先假想补给阿姨6元，让旧篮子刚好买得起；金色预算线经过 A。这不是说她的满意程度一定不变。',
    String.raw`w' = p_1' a_1 + p_2 a_2 = 2 \times 6 + 1 \times 6 = 18`,
    '原书第70页公式推导',
    { step: 1, p0: 1, p1: 2, q: 1, w: 12, compW: 18 }
   ),
   makeConsumerFrame(
    '第三步：替代效应 A → B（纯相对价格变动）',
    '有18元、包子2元时，旧篮子虽然买得起，阿姨还是会改选 B：4.5个包子、9杯豆浆。与 A 相比少了1.5个包子，这是本例的斯勒茨基替代效应。',
    String.raw`\Delta x_1^{\text{sub}} = x_1(p_1', p_2, w') - x_1(p_1, p_2, w) = 4.5 - 6 = -1.5`,
    '原书命题5.5 · 自身替代效应非正',
    { step: 2, p0: 1, p1: 2, q: 1, w: 12, compW: 18, bundleB: [4.5, 9] }
   ),
   makeConsumerFrame(
    '第四步：收入效应 B → C 与总效应',
    '现在拿掉假想补偿，阿姨实际仍只有12元。她最终选 C：3个包子、6杯豆浆。从 B 到 C 又少1.5个包子，这是本例的收入效应；从 A 到 C 一共少3个。',
    String.raw`\Delta x_1^{\text{total}} = \underbrace{(4.5 - 6)}_{\text{替代效应 } -1.5} + \underbrace{(3 - 4.5)}_{\text{收入效应 } -1.5} = -3`,
    '原书第70页 · Slutsky 恒等式完整呈现',
    { step: 3, p0: 1, p1: 2, q: 1, w: 12, bundleC: [3, 6] }
   )
  ]
 },

 property: {
  id: '5.6',
  title: '§5.6 补偿后包子会买得更多吗？',
  intro: '阿姨原来选了6个包子和6杯豆浆。包子涨价后，假想给她补钱，使旧篮子刚好买得起。她会不会改买更多包子？',
  end: '在单值、花完预算并满足 WARP 的教材条件下，涨价后补偿所得的新选择，包子数量不会超过原来的数量。',
  frames: [
   makeConsumerFrame('先看阿姨原来的选择', '包子和豆浆各1元，阿姨有12元，选了 A=(6,6)。先把这当作观察到的选择；我们没有假设她的满意程度必须是哪一种公式。', String.raw`p=(1,1),\quad w=12,\quad A=(6,6)`, '原书命题5.5 · 印刷70—71页 · 自主数值', {p:1,p1:1,q:1,w:12,stage:'original'}),
   makeConsumerFrame('补钱后，假想她买了更多包子', '包子涨到2元，豆浆仍1元。要让旧篮子A刚好买得起，假想预算补到18元。现在反过来假设她选了 B=(8,2)：包子比原来多。红点是用来反证的假想选择。', String.raw`w'=2\times6+1\times6=18,\quad B=(8,2)`, '原书命题5.5 · 图5.8 · 自主数值', {p:1,p1:2,q:1,w:12,stage:'hypothesis',candidate:[8,2]}),
   makeConsumerFrame('把B拿回旧价格，看看买不买得起', '按原来的价格，B只花8+2=10元，12元预算下还剩2元。当时B买得起，她却选A；涨价并补偿后A仍买得起，却假设她选B。两次选择与WARP冲突。', String.raw`p\cdot B=8+2=10<12,\quad p'\cdot A=18=w'`, '原书命题5.5证明 · 印刷71页 · 自主数值', {p:1,p1:2,q:1,w:12,stage:'contradiction',candidate:[8,2]}),
   makeConsumerFrame('换一组数字，也可以这样证明', '一般题先写旧选择和补偿金额，再假设补偿后包子更多。把假想新选择代入旧价格：它会严格买得起；旧篮子在补偿后也买得起。两边负担得起、其中一边严格，违反WARP，所以假设不成立。', String.raw`p\cdot b\le w'-(p_1'-p_1)b_1<w,\quad b_1\le a_1`, '原书命题5.5证明 · 印刷71页', {p:1,p1:2,q:1,w:12,stage:'contradiction',candidate:[8,2]})
  ]
 },

 giffen: {
  id: '5.6',
  title: '§5.6 吉芬品几何构造：负收入效应压倒替代效应',
  intro: '一位顾客每天拿10元买主食和配菜。主食涨价了，钱却没变：她会不会因为更买不起配菜，反而多买主食？先看这个特意构造的例子。',
  end: '本例只说明一种局部可能：价格上涨带来的收入效应抵过替代效应，主食反而买多了。劣等品不一定是吉芬品，实际商品也不能仅凭故事判断。',
  frames: [
   makeConsumerFrame(
    '定义5.9：吉芬品的定义',
    '先看涨价前：主食每份1.2元、配菜每份1元，她有10元。本例算出的最优购物篮约有1.11份主食、8.67份配菜。红点就是这只购物篮。',
    String.raw`\frac{\partial x_1}{\partial p_1} = \underbrace{\frac{\partial x_1^S}{\partial p_1}}_{\le 0} - \underbrace{x_1 \frac{\partial x_1}{\partial w}}_{< 0 \text{ 且很大}} > 0`,
    '原书定义5.9 · 印刷69页',
    { p: 1.2, q: 1, w: 10, model: 'giffen' }
   ),
   makeConsumerFrame(
    '折线偏好构造：u = min{x₁+x₂, 4x₁+2x₂−12}',
    '主食涨到1.5元，配菜仍是1元，钱也仍是10元。她选的购物篮变成约1.33份主食、8份配菜：主食更贵了，她却买得更多。这个变化来自下面写明的特殊偏好，不是假定人人都会这样。',
    String.raw`u(x) = \min\{x_1 + x_2,\ 4x_1 + 2x_2 - 12\}`,
    '原书第69页 · 独立几何模型构造',
    { p: 1.5, q: 1, w: 10, model: 'giffen' }
   ),
   makeConsumerFrame(
    '反常需求曲线：向上倾斜的需求线段',
    '主食再涨到1.7元，她的最优篮子约为1.54份主食和7.38份配菜。本例中变穷带来的调整足以抵过替代效应，主食需求反而增加；这只发生在给定的局部区间。',
    String.raw`p_1 \uparrow \implies x_1^*(p_1) \uparrow \quad (\text{需求曲线向上倾斜})`,
    '原书第69页 · 吉芬现象几何验证总结',
    { p: 1.7, q: 1, w: 10, model: 'giffen', curve: true }
   )
  ]
 }
};

export function consumerFrame(mode, phase) {
 const story = consumerStories[mode] || consumerStories.budget;
 const idx = Math.max(0, Math.min(story.frames.length - 1, phase));
 if(mode==='existence'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],to=story.frames[base+1],progress=from.state.progress+(to.state.progress-from.state.progress)*t,f=n=>Number(n.toFixed(3));
  return {...from,title:'继续向 x₁=1 靠近：效用不断升高但达不到 1',narration:`预算集内取 x₁=${f(progress)}，当前效用为 ${f(progress)}；但一到端点 x₁=1 效用骤降为 0，上确界 1 始终无法达到。`,formula:String.raw`u(x_1,0)=x_1<1\ (x_1<1),\quad u(1,0)=0`,state:{...from.state,progress}};
 }
 if(mode==='property'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],f=n=>Number(n.toFixed(2));
  if(base===0){
   if(t<.55){const p1=1+t/.55,wealth=6*p1+6;return {...from,title:'涨价并补钱：旧篮子一直买得起',narration:`包子约${f(p1)}元，豆浆仍1元；假想预算约${f(wealth)}元，正好够买旧篮子 A=(6,6)。`,formula:String.raw`w'=p_1'\cdot6+6`,state:{...from.state,p1,stage:'compensation'}};}
   const u=(t-.55)/.45,x=6+2*u,y=18-2*x;return {...from,title:'假设补偿后多买包子',narration:`现在包子2元、假想预算18元。红点是为反证构造的篮子，约(${f(x)},${f(y)})，仍在新预算线上；尚未声称这是实际观察。`,formula:String.raw`2x_1+x_2=18`,state:{...from.state,p1:2,stage:'hypothesis',candidate:[x,y]}};
  }
  return {...from,title:base===1?'把假想篮子带回旧预算':'从例子推广到一般证明',narration:base===1?'先比较假想篮子在旧价格下花多少钱，再检查两次选择是否符合WARP。':'例子给出直觉；接下来用不等式说明任意满足条件的篮子。'};
 }
 if(mode==='normal'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],f=n=>Number(n.toFixed(2));
  if(base===0){const extra=4*t,y=4+extra;return {...from,title:'钱逐渐增加：先造一个比较篮子',narration:`预算约${f(8+extra)}元，包子仍假想买4个，剩下的钱买约${f(y)}杯豆浆。金点只是比较用的篮子，不是实际决定。`,formula:String.raw`D=(4,4+\Delta w),\quad MRS(D)=\frac{x_2}{x_1}`,state:{...from.state,extraW:extra,stage:'budget'}};}
  if(base===1){const x=4+2*t,y=8-2*t;return {...from,title:'沿新预算线比较篮子',narration:`12元预算不变，比较篮子约(${f(x)},${f(y)})，满意程度约${f(x*y)}；这是沿预算线做的假想比较，直到找到最优篮子。`,formula:String.raw`x_1+x_2=12,\quad u=x_1x_2`,state:{...from.state,stage:'trial',candidate:[x,y]}};}
  return {...from,title:'把这个例子和一般结论区分开',narration:'本例最优篮子是(6,6)；接下来将总结正常品的判断，并说明这个例子不能代替一般证明。'};
 }
 if(mode==='rationalize'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0)return {...from,title:'显示一套可能的偏好',narration:'紫色无差异线逐渐显现：如果顾客只在乎两样的总数量，这次买便宜包子的选择恰好是最优。接下来还要检查其他预算。',state:{...from.state,reveal:t}};
  return {...from,title:'接下来换一条规则或偏好',narration:'接下来将更换规则、价格或候选偏好；先读清新的条件，再检查观察到的选择是否最优。'};
 }
 if(mode==='warp'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0)return {...from,title:'第二次的预算线逐渐出现',narration:'第二次包子2元、豆浆1元，预算仍是2元；紫色线逐渐显示这一次真实预算的边界，B是第二次选的篮子。',state:{...from.state,revealB:t}};
  if(base===3)return {...from,title:'接下来换一个独立对照',narration:'先记住刚才的严格剩钱。接下来更换价格和预算，看看双方都恰好在预算线上时，能否得出相同结论。'};
  return {...from,title:'把两次预算放在一起看',narration:from.narration};
 }
 if(mode==='corners'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  const w=base===0?1:base===1?1+5*t:base===2?6-3.75*t:2.25+3.75*t;
  const [x,y]=demandC('quasi',3,1,w).bundle,f=n=>Number(n.toFixed(2)),mrs=2*Math.sqrt(y);
  const position=x<=1e-9?'仍在角点，只买豆浆':'已经进入内点，两样都买';
  return {...from,title:'预算变化：沿着真实最优篮子看',narration:`包子3元、豆浆1元不变，预算约${f(w)}元；按本例偏好选择约(${f(x)},${f(y)})，${position}。当前 MRS 约${f(mrs)}，价格比为3。`,formula:String.raw`x_2^*=\min\{w,9/4\},\quad x_1^*=\frac{w-x_2^*}{3}`,state:{...from.state,w}};
 }
 if(mode==='mrs'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===1)return {...from,title:'把局部交换账写成算式',narration:'先看相切点(3,6)，再把主观交换率等于价格比，与预算条件联立。'};
  const x=base===0?2+t:base===2?3+t:4-t,y=12-2*x,f=n=>Number(n.toFixed(2));
  const direction=base===2?'再假想比较切点另一侧':base===3?'从另一侧向切点调整':'从当前篮子向切点调整';
  return {...from,title:direction,narration:`包子2元、豆浆1元、预算12元不变；当前篮子约(${f(x)},${f(y)})，满意程度约${f(x*y)}，局部 MRS 约${f(y/x)}，市场价格比仍为2。`,formula:String.raw`MRS=\frac{x_2}{x_1},\quad \frac{p_1}{p_2}=2,\quad 2x_1+x_2=12`,state:{...from.state,candidate:[x,y]}};
 }
 if(mode==='optimum'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const x=2+t,y=12-2*x,u=Math.sqrt(x*y),f=n=>Number(n.toFixed(2));return {...from,title:'沿预算线换一点，比较满意程度',narration:`包子2元、豆浆1元、预算12元不变，篮子正调整到约(${f(x)},${f(y)})；本例满意程度约${f(u)}。这段是在比较可行篮子，还没把切点当成所有偏好的答案。`,formula:String.raw`2x_1+x_2=12,\quad u=\sqrt{x_1x_2}`,state:{...from.state,candidate:[x,y]}};}
  return {...from,title:'换一种顾客的偏好',narration:'接下来换成另一种假设，先看清新顾客怎样比较购物篮，再判断最满意的位置。'};
 }
 if(mode==='curves'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],s={...from.state};
  const f=n=>Number(n.toFixed(2));let narration,formula=from.formula,title=from.title;
  if(base===0||base===6){s.p=2-t;const k=base===0?0:1,z=demandC('half',s.p,1,12).bundle[k];title=base===0?'包子价格下降：看包子':'包子价格下降：看豆浆';narration=`预算仍12元、豆浆仍1元，包子价降至约${f(s.p)}元；按各花一半规则，${base===0?'包子':'豆浆'}约买${f(z)}${base===0?'个':'杯'}。`;formula=base===0?String.raw`x_1^*(p_1)=\frac{6}{p_1}`:String.raw`\hat{x}_2(p_1)=6`;}
  else if(base===3||base===4){s.w=base===3?12-8*t:4+12*t;const z=demandC('half',1,1,s.w).bundle[0];title='预算变化：沿恩格尔曲线看包子';narration=`包子、豆浆单价都不变，预算约${f(s.w)}元；按各花一半规则，包子买约${f(z)}个。`;formula=String.raw`x_1(w)=\frac{w}{2}`;}
  else{title='换一个问题，先看清坐标';narration='接下来要换图：先看清横轴改变的条件，以及纵轴记录的是哪一种商品的数量。';}
  return {...from,title,narration,formula,state:s};
 }
 if(mode==='homogeneous'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  const scale=base===0?1+t:base===1?2+t:base===2?3-2*t:1;
  const p=base===3?1+t:scale,q=scale,w=12*scale;
  const z=demandC('half',p,q,w).bundle,fmt=n=>Number(n.toFixed(2));
  const narration=base===3?`只让包子涨价：包子约${fmt(p)}元、豆浆1元、预算12元。按各花一半规则，选约${fmt(z[0])}个包子和${fmt(z[1])}杯豆浆。`:`两样价格和预算一起变为原来的约${fmt(scale)}倍。每个篮子的花费也按同一倍数变化，买得起的集合和(6,6)都不变。`;
  const formula=base===3?String.raw`x_1=\frac{w}{2p_1},\quad x_2=\frac{w}{2p_2}`:String.raw`B((\lambda p_1,\lambda p_2),\lambda w)=B((p_1,p_2),w),\quad\lambda>0`;
  return {...from,title:base===3?'只改变包子价格':'价格和预算同比变化',narration,formula,state:{...from.state,p,q,w,lambda:scale}};
 }
 if(mode==='budget'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];let p=2,q=1,w=12,endowment=null,narration='先看同一个12元预算：线上的篮子正好花完钱，线内的篮子也买得起。';
  if(base===1){const scale=1+t;p=2*scale;q=scale;w=12*scale;narration=`两种价格和预算同时变为原来的约${Number(scale.toFixed(2))}倍；买得起的篮子不变。`;}
  if(base===2){const scale=2-t;p=2*scale;q=scale;w=12*scale;endowment=[4,4];narration='现在比较另一种设定：阿姨持有4个包子和4杯豆浆。按当前价格估值，预算线经过初始篮子。';}
  if(base===3||base===4){p=base===3?2+t:3-t;w=4*p+4;endowment=[4,4];narration=`包子单价约${Number(p.toFixed(2))}元时，已有的4个包子和4杯豆浆值约${Number(w.toFixed(2))}元；原篮子一直可以保留。`;}
  if(base===5){p=2+t;narration=`现金仍是12元，包子单价升到约${Number(p.toFixed(2))}元；全买包子最多约${Number((w/p).toFixed(2))}个，豆浆截距不变。`;}
  return {...from,title:'跟着同一条预算线看变化',narration,state:{...from.state,p,q,w,mode:endowment?'endowment':base===1?'scale':'base',...(endowment?{endowment}:{})}};
 }
 if(mode==='giffen'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base],to=story.frames[base+1],p=from.state.p+(to.state.p-from.state.p)*t,z=demandC('giffen',p,1,10);
  return {...from,title:'主食涨价，重新挑选购物篮',narration:`主食价格正在升到约${Number(p.toFixed(2))}元，配菜价格和10元预算不变；模型重新算出约${Number(z.bundle[0].toFixed(2))}份主食、${Number(z.bundle[1].toFixed(2))}份配菜。`,state:{...from.state,p}};
 }
 if(mode==='slutsky'&&!Number.isInteger(idx)){
  const base=Math.floor(idx),t=idx-base,from=story.frames[base];
  if(base===0){const p=1+t,z=slutskyC('product',1,p,1,12);return {...from,title:'包子涨价，假想补到旧篮子买得起',narration:`包子正在涨到约${Number(p.toFixed(2))}元。为让原来的6个包子和6杯豆浆刚好买得起，假想预算变为约${Number(z.wealth.toFixed(2))}元。`,state:{...from.state,step:1,p1:p}};}
  if(base===1){return {...from,title:'在补偿预算下重新选篮子',narration:'旧篮子仍买得起，但相对价格变了。金点逐渐显示阿姨按本例偏好选出的补偿篮子 B。',state:{...from.state,step:2,reveal:t}};}
  const wealth=18-6*t,z=demandC('product',2,1,wealth);return {...from,title:'撤回假想补偿，重新选篮子',narration:`预算正从18元回到实际的12元，现在约${Number(wealth.toFixed(2))}元；按本例偏好，她选约${Number(z.bundle[0].toFixed(2))}个包子和${Number(z.bundle[1].toFixed(2))}杯豆浆。`,state:{...from.state,step:3,incomeW:wealth}};
 }
 return story.frames[idx];
}

export function consumerReadout(mode, frame) {
 const s = frame.state || {};
 if (mode === 'budget') {
  return `包子 ${Number(Number(s.p).toFixed(2))}元，豆浆 ${Number(Number(s.q).toFixed(2))}元；预算 ${Number(Number(s.w).toFixed(2))}元${s.endowment ? `；原有(${s.endowment.join(', ')})` : ''}`;
 }
 if (mode === 'rules') {
  const names={intro:'先认预算',cheaper:'只买便宜品',equal:'数量相同',half:'各花一半',cap:'包子优先买到7个'};
  return `${names[s.rule] || s.rule}；包子${s.p}元，豆浆${s.q}元；预算${s.w}元`;
 }
 if (mode === 'homogeneous') {
  const f=n=>Number(Number(n).toFixed(2));
  return `包子${f(s.p)}元，豆浆${f(s.q)}元；预算${f(s.w)}元`;
 }
 if (mode === 'existence') { const z=existenceCounter(s.progress ?? .8); return `当前效用 ${Number(z.utility.toFixed(3))}；可继续提高`; }
 if (mode === 'optimum') {
  const names={cd:'平滑偏好',complement:'成套搭配',linear:'完全替代'};
  return `${names[s.model]||s.model}；包子${s.p}元，豆浆${s.q}元；预算${s.w}元`;
 }
 if (mode === 'mrs') {
  const z=s.candidate||demandC('product',s.p,s.q,s.w).bundle,f=n=>Number(n.toFixed(2));
  return `篮子(${f(z[0])}, ${f(z[1])})；MRS ${f(z[1]/z[0])}；价格比 ${f(s.p/s.q)}`;
 }
 if (mode === 'corners') {
  const [x,y]=demandC('quasi',s.p,s.q,s.w).bundle,f=n=>Number(n.toFixed(2));
  return `预算${f(s.w)}元；${x<=1e-9?'角点':'内点'}；MRS ${f(2*Math.sqrt(y))}`;
 }
 if (mode === 'warp') {
  return s.scenario==='tie'?'对照：两边都刚好买得起；无严格显示':'两次各2元；对方篮子每次都只花1元';
 }
 if (mode === 'rationalize') {
  const s=frame.state,f=n=>Number(Number(n).toFixed(2));
  return `包子${f(s.p)}元；豆浆${f(s.q)}元；预算${f(s.w)}元`;
 }
 if (mode === 'giffen') {const z=demandC('giffen',s.p ?? 1.5,s.q ?? 1,s.w ?? 10);return `主食单价 ${Number(Number(s.p).toFixed(2))}；购物篮 (${Number(z.bundle[0].toFixed(2))}, ${Number(z.bundle[1].toFixed(2))})`;}
 if (mode === 'property') {const f=n=>Number(Number(n).toFixed(2)),p=s.p1??1,b=s.candidate;return b?`补偿预算18元；假想篮子 (${f(b[0])}, ${f(b[1])})`:`包子${f(p)}元；补偿预算${f(6*p+6)}元；A=(6,6)`;}
 if (mode === 'normal') {const f=n=>Number(Number(n).toFixed(2));if(s.stage==='initial')return '8元的原最优篮子 (4, 4)';if(s.stage==='budget')return `预算${f(8+s.extraW)}元；假想比较点 D (4, ${f(4+s.extraW)})`;const [x,y]=s.candidate||[6,6];return `${s.stage==='trial'?'比较篮子':'新最优篮子'} (${f(x)}, ${f(y)})；满意程度 ${f(x*y)}`;}
 if (mode === 'curves') {
  const f=n=>Number(Number(n).toFixed(2)),kind=s.curve;
  if(kind==='engel')return `两样各1元；预算${f(s.w)}元；看包子数量`;
  return `包子${f(s.p)}元；豆浆1元；预算12元；看${kind==='cross'?'豆浆':'包子'}数量`;
 }
 if (mode === 'slutsky' || mode === 'property') {
  return `分析步骤: ${frame.title}`;
 }
 return frame.title;
}

/* Section 3.2: authored scenes from the 2020.12.21(h) text, printed pp.32–35.
 * Every displayed probability is passed through the original model functions.
 * Examples and numerical choices introduced by this site say so in their source.
 */
import {lottery,mixture,support,goodMass,worstPrize,compound,expected} from './uncertainty.mjs';

const prefRank=[3,2,1],prefLinear=[10,6,2];
export const preferenceStories=(()=>{
 const P=(a,b,c=0)=>[a,b,c];
 const A=P(1,0),B=P(0,1),C=P(0,0,1);
 const scene=(title,narration,p,q,formula,source,extra={})=>({title,narration,p,q,formula,source,...extra});
 return {
 pessimist:{
  intro:'你要准备出门，却不知道路上会遇到什么。有人只盯着“最糟会怎样”，哪怕那件事发生的机会很小。先跟着一张票看边界。',
  end:'悲观规则只看正概率可能发生的最差结果。0.001 与 0 不一样；基础规则在最差结果相同的票之间无差异。它不满足本节的连续性和独立性。',
  labels:['好 a','中 b','坏 c'],
  frames:[
   scene('先排清奖品','假设好 a 优于中 b，中 b 优于坏 c。甲票有九成机会得到 a、一成机会得到 c；乙票确定得到 b。悲观者先找每张票仍有机会出现的最差结果。',P(.9,0,.1),B,String.raw`[a]\succ[b]\succ[c]`,'原书例3.1 · 印刷32页',{score:'worst'}),
   scene('小概率也算“可能”','甲票最差是 c，乙票最差是 b。按悲观规则，乙票更好；这里没有把一成坏结果乘成一个平均分数。',P(.9,0,.1),B,String.raw`w(p)=c,\quad w(q)=b,\quad q\succ p`,'原书例3.1 · 自主数值',{score:'worst'}),
   scene('把一成压到千分之一','坏 c 的机会降到 0.001，仍严格大于零。甲票依然可能遇到 c，悲观者的结论没有跟着概率大小慢慢改善。',P(.999,0,.001),B,String.raw`p(c)=0.001>0\Rightarrow w(p)=c`,'原书规则 · 自主数值',{score:'worst'}),
   scene('恰好到零，评价跳变','把 c 的概率真正改成 0，甲票变成确定的 a。此时甲票才越过乙票；所以“几乎零”与“正好零”不能混同。',A,B,String.raw`p(c)=0\Rightarrow w(p)=a\succ b`,'原书例3.1 · 自主边界',{score:'worst'}),
   scene('同一个最坏结果，可加破同分规则','两张票都可能得到 c，基础悲观规则把它们看成一样。原书还提出一种变体：此时再比较 c 的概率，概率较低的甲票胜出。',P(.9,0,.1),P(.6,0,.4),String.raw`w(p)=w(q)=c,\quad p\sim q\text{（基础规则）}`,'原书例3.1 · 破同分变体',{score:'worst'}),
   scene('连续性在哪里断掉','对每个小于 1 的 α，混合票 αa+(1−α)c 仍可能得到 c，因此严格差于确定的 b；在 α=1 才突然变成 a。找不到本节定义要求的内部无差异点。',P(.99,0,.01),B,String.raw`0<\alpha<1\Rightarrow [b]\succ\alpha[a]+(1-\alpha)[c]`,'原书定义3.2后的分析 · 印刷33页',{score:'worst'}),
   scene('独立性也会失效','原本确定 a 优于确定 b。两边加进同一份四成 b 后，甲是六成 a、四成 b，乙仍确定 b；悲观者说两票一样，因为两边最坏结果都是 b。',P(.6,.4),B,String.raw`[a]\succ[b],\quad 0.6[a]+0.4[b]\sim[b]`,'原书反例 · 印刷34—35页',{score:'worst'})
  ]
 },
 goodbad:{
  intro:'买下午茶时，你可能把咖啡和茶都算“满意”，把空手而归算“不满意”。这条规则只问落进满意组的机会有多大。',
  end:'好坏规则按“好”集合的总概率排序。组内换品种可能无差异；共同分支只把原差距乘以正权重，因此符合独立性。确定奖品只有好、坏两级，连续性条件在这里空真。',
  labels:['咖啡','茶','空手'],
  frames:[
   scene('先把结果分组','咖啡、茶都算好结果，空手算坏结果。甲票得到好结果的机会是 0.25+0.35=0.60；乙票只有 0.40。',P(.25,.35,.4),P(.2,.2,.6),String.raw`G(p)=\sum_{z\in good}p(z)`,'原书例3.2 · 自主购物情境',{score:'good'}),
   scene('比较的是整组机会','甲的咖啡概率不一定更高；决定比较的是咖啡和茶合计的机会。0.60 大于 0.40，因此甲优于乙。',P(.25,.35,.4),P(.2,.2,.6),String.raw`G(p)=0.60>0.40=G(q)`,'原书例3.2 · 自主数值',{score:'good'}),
   scene('组内交换不改结论','把甲的好结果在咖啡、茶之间重新分配，仍合计 0.60。按这条规则，新旧甲票无差异；这不是说咖啡和茶在所有偏好下都一样。',P(.55,.05,.4),P(.25,.35,.4),String.raw`G(p)=G(q)=0.60\Rightarrow p\sim q`,'原书例3.2 · 自主对照',{score:'good'}),
   scene('给两边加入同一分支','先比确定咖啡与确定空手。再给两边加入同样的四成“空手”分支：左票得到好结果的机会变为 0.60，右票仍为 0。原排序保留。',P(.6,0,.4),C,String.raw`G(0.6[a]+0.4[c])-G([c])=0.6`,'原书独立性分析 · 自主购物情境',{score:'good'}),
   scene('为什么一般都能保留','替换的那一支占正权重 αₖ。加入共同部分后，好结果概率的差只剩“原差”乘 αₖ；正数相乘不改变差的正负号。',P(.6,0,.4),C,String.raw`G(P)-G(Q)=\alpha_k\bigl(G(p)-G(q)\bigr),\quad\alpha_k>0`,'原书论证 · 印刷35页',{score:'good'}),
   scene('连续性为何是空真','确定奖品只落在好或坏两级，找不到严格排列成好、中、差的三个确定奖品。定义3.2只对这样的三层比较提出要求，所以这一条件空真。',A,C,String.raw`\nexists\,[a]\succ[b]\succ[c]\text{（仅两类）}`,'原书分析 · 印刷33页',{score:'good'})
  ]
 },
 support:{
  intro:'旅行前有几种天气要准备，和每种天气多常见，是两种问题。有人只想少准备几套方案：可能结果越少越好。',
  end:'最少备选规则只数支撑集成员，不按概率大小加权。所有确定彩票的备选数都是一，所以连续性空真；把共同分支加进来可能改变备选数，独立性失败。',
  labels:['晴 a','雨 b','雪 c'],
  frames:[
   scene('少准备一种，就更喜欢','甲票确定晴天，只需准备一种情况。乙票晴雨各半，必须准备两种；按“尽量少备选”规则，甲优于乙。',A,P(.5,.5),String.raw`p\succeq q\iff |\operatorname{supp}(p)|\le |\operatorname{supp}(q)|`,'原书例3.3 · 自主天气情境',{score:'support'}),
   scene('千分之一仍要准备','雨天只有千分之一机会，乙票的支撑集仍有晴、雨两种。甲票依然更好；把很小的机会画细，不能从备选清单里擦掉。',A,P(.999,.001),String.raw`0.001>0\Rightarrow |\operatorname{supp}(q)|=2`,'原书例3.3 · 自主数值',{score:'support'}),
   scene('零概率才删去备选','雨天概率恰好为零后，两张票都只可能晴天，所以这条规则判为无差异。',A,A,String.raw`|\operatorname{supp}(p)|=|\operatorname{supp}(q)|=1`,'原书例3.3 · 自主边界',{score:'support'}),
   scene('确定奖品之间没有三层严格排序','晴、雨、雪三张确定彩票都只需准备一种情况，因此彼此无差异；连续性要求的严格三层确定奖品不存在。',A,B,String.raw`|\operatorname{supp}([a])|=|\operatorname{supp}([b])|=1`,'原书连续性分析 · 印刷33页',{score:'support'}),
   scene('共同分支会打破无差异','原本确定晴天与确定雨天都只要准备一种。两边各掺入一半雨天：左票要备晴和雨两种，右票仍只备雨一种，右票变得更好。',P(.5,.5),B,String.raw`[a]\sim[b],\quad 0.5[a]+0.5[b]\prec[b]`,'原书独立性反例 · 印刷35页',{score:'support'})
  ]
 },
 continuity:{
  intro:'假如你喜欢好奖品胜过中等奖品，又喜欢中等奖品胜过差奖品。把“好或差”的机会慢慢调整，何时会和“稳稳拿中等”一样愿意？',
  end:'连续性只在有严格好、中、差三个确定奖品时要求一个内部无差异概率。本站这个线性评分例子算出 0.5；换一组评分，打平的概率也可能改变；悲观规则在内部找不到它。',
  labels:['好 a','中 b','差 c'],
  frames:[
   scene('两端夹着中等奖品','好 a 确定拿到，比确定的 b 好；差 c 确定拿到，比 b 差。连续性追问：在两端之间是否至少有一张混合票，与 b 无差异？',A,B,String.raw`[a]\succ[b]\succ[c]`,'原书定义3.2 · 印刷33页',{score:'linear'}),
   scene('从差的一端出发','先把全部机会放在差 c，混合票低于 b。现在逐渐加进好 a；全程保留 b 当作固定参照。',C,B,String.raw`\alpha=0:\quad [c]\prec[b]`,'原书定义3.2 · 自主线性例子',{score:'linear'}),
   scene('往好的一端移动','把好 a 的机会提高到 0.25，差 c 仍占 0.75。这里采用自主评分 10、6、2，混合分是 4，尚未追上 b 的 6。',P(.25,0,.75),B,String.raw`0.25\times10+0.75\times2=4<6`,'原书定义3.2 · 印刷33页；10、6、2为本站自主评分',{score:'linear'}),
   scene('停在相等处','好 a 和差 c 各占一半时，示例评分是 6，恰好等于确定 b。这个例子给出内部 α=0.5；一般连续性只保证至少有某个 α。',P(.5,0,.5),B,String.raw`0.5\times10+0.5\times2=6`,'自主评分例子 · 定义3.2',{score:'linear'}),
   scene('越过相等处','好 a 的机会升到 0.75，示例评分变为 8，超过 b。点从左侧走到右侧，中途经过相等处；这只是连续规则的可视化例子。',P(.75,0,.25),B,String.raw`0.75\times10+0.25\times2=8>6`,'自主评分例子 · 定义3.2',{score:'linear'}),
   scene('悲观规则没有内部停点','若只看最坏结果，哪怕好 a 的机会到 0.99，只要差 c 仍有正概率，混合票就严格差于 b。它在 α=1 才跳到 a。',P(.99,0,.01),B,String.raw`0<\alpha<1\Rightarrow w(p)=c\prec b`,'原书悲观者反例 · 印刷33页',{score:'worst'}),
   scene('两级规则则是空真','好坏规则或最少备选规则的确定奖品没有严格好、中、差三层；定义3.2的前提没有满足的情形，所以条件空真。',A,C,String.raw`\text{无严格三层前提}\Rightarrow\text{条件空真}`,'原书连续性分析 · 印刷33页',{score:'good'})
  ]
 },
 compound:{
  intro:'先抽中哪一个盒子，再从盒子里抽奖品。两次抽签看着复杂，但最后每个奖品的总机会可以沿所有路径加起来。',
  end:'先选彩票、再选奖品，最终仍是一张彩票。每个奖品的概率是各路径 αₖpₖ(z) 之和；每项非负，总和为一。两个盒子的数值来自教材原例。',
  labels:['W','D','L'],
  frames:[
   scene('先认清两个盒子','盒子 p：W 六成、D 零、L 四成。盒子 q：W 两成、D 三成、L 五成。第一层抽中哪个盒子，第二层才抽那个盒子的奖品。',P(.6,0,.4),P(.2,.3,.5),String.raw`p=(0.6,0,0.4),\quad q=(0.2,0.3,0.5)`,'原书数值 · 印刷34页',{score:'compound',alpha:1}),
   scene('先选 p 的机会是 0.75','四分之三走 p，四分之一走 q。最终得到 W 的机会，是从 p 走到 W 与从 q 走到 W 两条路径的和。',P(.6,0,.4),P(.2,.3,.5),String.raw`P(W)=0.75\times0.6+0.25\times0.2=0.50`,'原书原例 · 自主阶段值',{score:'compound',alpha:.75}),
   scene('平分两个盒子','现在两个盒子各占一半。D 只可能从 q 来，所以 D 的最终机会是 0.5×0.3=0.15；W 与 L 也按路径相加。',P(.6,0,.4),P(.2,.3,.5),String.raw`P(W,D,L)=(0.40,0.15,0.45)`,'原书原例 · 自主阶段值',{score:'compound',alpha:.5}),
   scene('更多机会走 q','只用四分之一机会走 p。最终分布沿同一条概率线移动；每一行依旧要合计为 1。',P(.6,0,.4),P(.2,.3,.5),String.raw`P(W,D,L)=(0.30,0.225,0.475)`,'原书原例 · 自主阶段值',{score:'compound',alpha:.25}),
   scene('只走 q 也是边界','当第一层选 p 的概率为 0，结果就是 q 本身。边界仍是合法彩票。',P(.6,0,.4),P(.2,.3,.5),String.raw`0\cdot p+1\cdot q=q`,'原书定义3.3 · 自主边界',{score:'compound',alpha:0}),
   scene('把两次抽签压成一次','对任意奖品 z，把所有“先选盒子 k、再得到 z”的路径概率相加。这个压平后的分布才是复合彩票的最终结果。',P(.6,0,.4),P(.2,.3,.5),String.raw`P(z)=\sum_{k=1}^{K}\alpha_kp_k(z),\quad\sum_zP(z)=1`,'原书定义3.3 · 印刷34页',{score:'compound',alpha:.5})
  ]
 },
 independence:{
  intro:'两张套餐票只有一个分支不同。给它们都添上完全相同的另一分支，原先喜欢哪一个，还会喜欢它吗？独立性就是对这件事的要求。',
  end:'独立性比较同一个正权重分支被替换前后：公共分支不应翻转原排序。好坏规则满足，悲观者和最少备选规则有反例。教材证明在除以该分支权重时用到 αₖ>0；权重为零时，该分支从加权和中消失；要从混合结果反推该分支的偏好，需要正权重。',
  labels:['好 a','中 b','差 c'],
  frames:[
   scene('先比较被替换的那一支','假设确定好 a 严格优于确定中 b。独立性要求：把相同的其他分支装进两张票以后，这一支的比较仍能决定整张票的比较。',A,B,String.raw`[a]\succ[b]`,'原书定义3.4 · 印刷34页',{score:'good',good:[0]}),
   scene('共同分支占四成','给两边都加入四成 b：甲变成六成 a、四成 b，乙仍是 b。按好坏规则，甲的好结果概率为 0.6，乙为 0，原排序保持。',P(.6,.4),B,String.raw`G(P)-G(Q)=0.6\bigl(G([a])-G([b])\bigr)>0`,'原书独立性 · 自主数值',{score:'good',good:[0]}),
   scene('悲观者却说一样','同样两张票、同样的公共分支，悲观者只看最坏结果。甲和乙的最坏结果都是 b，于是原本 a 优于 b，却变成两张票无差异。',P(.6,.4),B,String.raw`w(P)=w(Q)=b\Rightarrow P\sim Q`,'原书悲观者反例 · 印刷34—35页',{score:'worst'}),
   scene('最少备选也会反转','确定 a 与确定 b 都只有一个可能结果，原本无差异。共同加入一半 b 后，甲要准备两种，乙仍只准备一种；原无差异没有保住。',P(.5,.5),B,String.raw`[a]\sim[b],\quad 0.5[a]+0.5[b]\prec[b]`,'原书最少备选反例 · 印刷35页',{score:'support'}),
   scene('一般情形为何要正权重','对好坏规则，整张票的好结果差 = 被替换分支的好结果差 × 正权重 αₖ。只要权重大于零，差的正负号不会变。',P(.6,.4),B,String.raw`\Delta G=\alpha_k\Delta G_{\text{branch}},\quad\alpha_k>0`,'原书好坏规则证明 · 印刷35页',{score:'good',good:[0]}),
   scene('权重为零时不能倒推','如果被替换分支的权重为零，两张最终票完全一样；即使原来的 a 比 b 好，也无法从两张相同的最终票倒推那一支。教材第35页的除法证明同样要求 αₖ>0。',B,B,String.raw`\alpha_k=0\Rightarrow P=Q,\quad\text{逆向不可推}`,'原书证明条件校准 · 印刷35页',{score:'good',good:[0]})
  ]
 },
 monotonic:{
  intro:'只剩好 a 和差 b 两种结果时，好结果的机会从三成升到八成，你会怎样比较？独立性会把这种直觉变成可证明的排序。',
  end:'在 [a] 严格优于 [b] 且满足独立性时，两奖品彩票按好奖品概率严格排序。先比较 pα 与 [b]；若 β=0，到此已证。若 0<β<α，再用正权重 β/α 的共同混合得到 pβ；不依赖期望效用。',
  labels:['好 a','差 b','—'],
  frames:[
   scene('先固定两种奖品','假设确定 a 严格好于确定 b。甲票给 a 八成机会，乙票给 a 三成；两者的奖品没有换，只有好结果的概率不同。',P(.8,.2),P(.3,.7),String.raw`p_\alpha=\alpha[a]+(1-\alpha)[b]`,'原书引理3.1 · 自主数值',{score:'monotonic',alpha:.8,beta:.3}),
   scene('第一步：甲优于确定差奖品','把“a 优于 b”与同一份 b 混合。由于 α=0.8>0，独立性给出甲票 pα 严格优于确定的 b。',P(.8,.2),B,String.raw`[a]\succ[b]\Rightarrow p_{0.8}\succ[b]`,'原书引理3.1证明 · 印刷35页',{score:'monotonic',alpha:.8,beta:0}),
   scene('第二步：算共同权重','想把甲票中的好奖品机会从 0.8 降到 0.3，需要 β/α=0.3/0.8=0.375 的甲票，再掺入其余的 b。这个权重严格在 0 与 1 之间。',P(.8,.2),P(.3,.7),String.raw`\beta/\alpha=0.3/0.8=0.375`,'原书引理3.1证明 · 自主数值',{score:'monotonic',alpha:.8,beta:.3}),
   scene('第三步：同一分支保持严格比较','用正权重 0.375 把 pα 与 b 分别放进同一结构。因为 pα 严格优于 b，混合后的左票也严格优于右票；左票仍是 pα，右票恰好是 pβ。',P(.8,.2),P(.3,.7),String.raw`p_\alpha\succ (\beta/\alpha)p_\alpha+(1-\beta/\alpha)[b]=p_\beta`,'原书引理3.1证明 · 印刷35页',{score:'monotonic',alpha:.8,beta:.3}),
   scene('概率相等就是同一张票','当两张票的好结果概率都为 0.5，分布完全相同。它们只能无差异。',P(.5,.5),P(.5,.5),String.raw`\alpha=\beta\Rightarrow p_\alpha=p_\beta`,'原书引理3.1 · 自主边界',{score:'monotonic',alpha:.5,beta:.5}),
   scene('反过来少了，就严格更差','把甲的好结果机会改为 0.3，乙保持 0.8。交换刚才的论证方向，甲严格差于乙；不存在“概率更少却更好”的第三种排序。',P(.3,.7),P(.8,.2),String.raw`\alpha<\beta\Rightarrow p_\alpha\prec p_\beta`,'原书引理3.1 · 自主反向',{score:'monotonic',alpha:.3,beta:.8}),
   scene('把结论写完整','对任意两种概率，较高的好奖品概率对应严格更好的彩票；这个结论来自独立性与 [a]≻[b]，不是凭一张数值图猜出来的。',P(.8,.2),P(.3,.7),String.raw`\alpha>\beta\iff p_\alpha\succ p_\beta`,'原书引理3.1 · 印刷35页',{score:'monotonic',alpha:.8,beta:.3})
  ]
 }
 };
})();

export function preferenceFrame(mode,phase){
 const story=preferenceStories[mode];
 if(!story||!Number.isInteger(phase)||phase<0||phase>=story.frames.length)throw Error('3.2 分镜越界');
 const frame=story.frames[phase];lottery(frame.p);lottery(frame.q);
 if(frame.score==='compound'){
  if(frame.alpha<0||frame.alpha>1)throw Error('第一层概率无效');
  const final=compound(frame.alpha);
  const direct=mixture(frame.alpha,frame.p,frame.q);
  if(final.some((x,i)=>Math.abs(x-direct[i])>1e-12))throw Error('复合路径不一致');
 }
 return frame;
}

export function preferenceReadout(frame){
 const {p,q,score}=frame;
 if(score==='compound')return {kind:score,values:compound(frame.alpha),branch:frame.alpha};
 let l,r,better='higher';
 if(score==='worst'){l=worstPrize(p,prefRank);r=worstPrize(q,prefRank)}
 else if(score==='good'){l=goodMass(p,frame.good||[0,1]);r=goodMass(q,frame.good||[0,1])}
 else if(score==='support'){l=support(p).length;r=support(q).length;better='lower'}
 else if(score==='linear'){l=expected(p,prefLinear);r=expected(q,prefLinear)}
 else if(score==='monotonic'){l=p[0];r=q[0]}
 else throw Error('未知的偏好计算');
 const diff=better==='higher'?l-r:r-l;
 return {kind:score,left:l,right:r,relation:Math.abs(diff)<1e-10?'∼':diff>0?'≻':'≺'};
}

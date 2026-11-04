export const sdProofs={
 satisficing:{title:'定义2.4与命题2.3：先分两组，再对任意菜单证明',steps:[
  ['把规则固定','有限X、评分v、门槛v*与顺序O固定。每份菜单按O的限制顺序面试，跳过不在菜单的人。等于门槛也合格。',String.raw`X^+=\{x:v(x)\ge v^*\},\quad X^-=\{x:v(x)<v^*\}`],
  ['不是选最高分','有合格者就选最早的合格者；一个也没有，就选最后面试者。原例评分−1、−2、1、3，门槛0，按a,b,c,d检查，选c而非最高分d。',String.raw`c(A)=\begin{cases}\text{A中按O最早的合格者}&A\cap X^+\ne\varnothing\\\text{A中按O最后一项}&A\subseteq X^-\end{cases}`],
  ['造一张解释序','把所有合格者按O放前面，不合格者按O的逆序接在后面。这是一张严格排序，不是把评分v从高到低排。',String.raw`\underbrace{X^+\text{ 按 }O}_{\text{优先}}\ \succ\ \underbrace{X^-\text{ 按逆 }O}_{\text{其后}};\qquad c\succ d\succ b\succ a`],
  ['任意菜单有合格者','优先组整体排在后面那组之前。A中最好的就是按O最早出现的合格者，与规则一致，且顺序没有并列。',String.raw`A\cap X^+\ne\varnothing:\quad\operatorname{best}_{\succ}(A)=\operatorname{first}_O(A\cap X^+)=c(A)`],
  ['任意菜单没有合格者','A全在不合格组；这组在解释序里倒排，所以按O最后一项恰好排得最高，与兜底规则相同。',String.raw`A\subseteq X^-:\quad\operatorname{best}_{\succ}(A)=\operatorname{last}_O(A)=c(A)`],
  ['三条不要偷换','只讨论非空菜单。改变v、v*或O后是另一张函数；不能把两张函数混在一起检查α。评分不是工资，也不自动是这张解释序的效用。',String.raw`\forall\varnothing\ne A\subseteq X:\quad c(A)=\operatorname{best}_{\succ}(A)`]
 ]},
 alpha:{title:'习题2.3的可套用思路：满意规则为何满足α',steps:[
  ['有合格者时','大菜单赢家是最早合格者。小菜单保留它，剩下的合格者没有谁比它更早，仍选它。',String.raw`c(A)\in B\subsetneq A,\quad A\cap X^+\ne\varnothing\Rightarrow c(B)=c(A)`],
  ['没有合格者时','大菜单每人都没过线，赢家是O的最后一项。小菜单也全没过线；保留原赢家，它仍是小菜单最后一项。',String.raw`A\subseteq X^-,\quad c(A)\in B\subsetneq A\Rightarrow c(B)=c(A)`],
  ['固定与变化分清','前后必须同一套评分、门槛和面试顺序。画面的15菜单核对是当前四人样例，一般证明才覆盖任意有限X。',String.raw`\text{固定 }(v,v^*,O)\quad\Longrightarrow\quad c\text{ 满足}\alpha`]
 ]},
 pump:{title:'§2.5：三笔循环、一般α反例与付费条件',steps:[
  ['先写清原来的三条选择','对象a、b、c不含钱。二选一分别选a、b、c，换物方向是a到c到b到a；不能按字母顺序随便画箭头。',String.raw`c(\{a,b\})=a,\quad c(\{b,c\})=b,\quad c(\{a,c\})=c;\qquad a\to c\to b\to a`],
  ['付费是额外条件','原文再假设每一次愿意支付的金额至少1美元。愿意无偿换物本身没有算出最高愿付；本页最高愿付和等号接受约定是显式自主设置。',String.raw`t_j=1,\quad\text{每笔愿付至少 }1\quad\Longrightarrow\quad W_3=W_0-3`],
  ['任意α反例给两菜单循环','设x=c(A)还在真子集B中，而y=c(B)不同。先提供整份B，选y；再提供整份A，选x。菜单包含当前持有物，保留现状也是选项；不能擅自改成同一二选一。',String.raw`x=c(A)\in B\subsetneq A,\quad y=c(B)\ne x;\qquad x\xrightarrow{B}y\xrightarrow{A}x`],
  ['每一笔都要能执行','对象选择保持、愿付不小于收费、有钱、没有识破后拒绝，才会继续。识破后的停止是本页自主约定；钱包有上限就会停，不产生负钱。',String.raw`0\le t_j\le\operatorname{WTP}_j,\quad t_j\le W_{j-1},\qquad W_j=W_{j-1}-t_j`],
  ['任意损失需要持续条件','若每步有统一正收费下界且可持续支付，有限N步损失至少Nε。对任意给定损失要有足够步数与资金；有限钱包不是无限融资。',String.raw`t_j\ge\varepsilon>0\quad\Longrightarrow\quad W_0-W_N=\sum_{j=1}^{N}t_j\ge N\varepsilon`],
  ['下降愿付是自主边界例','若每步收费与最高愿付都按比例减半，即使无限次愿意交换，累计收费也小于2t。这个连续金额反例撤去了原例每次至少愿付1的统一条件，不反驳原来的1美元设定。',String.raw`t_j=t\,2^{-(j-1)},\quad\operatorname{WTP}_j=m\,2^{-(j-1)};\qquad\sum_{j=1}^{N}t_j=2t(1-2^{-N})<2t\quad(t>0)`],
  ['原文保留判断空间','作者特别提醒：是否察觉被利用会影响机制有效性，让读者判断这是不是对理性假设有说服力的辩护。代码不把它提升成仅凭对象循环就必然亏钱的定理。',String.raw`\text{对象选择循环}\ \not\Rightarrow\ \text{无条件任意货币损失}`]
 ]}
};

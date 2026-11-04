// General arguments. Screen-sized finite examples are not the proof.
export const alphaProofs={
 definition:{title:'定义2.3：先核前提，再判断是否换了赢家',steps:[
  ['先确认是一张合法选择函数','对每个非空菜单都有一个菜单内答案。未答和菜单外答案先按定义处理；本次菜单只是一行。',String.raw`c(A)\in A\quad\forall\varnothing\ne A\subseteq X`],
  ['菜单真的缩小了吗','B是A的真子集。相同菜单不是严格收缩；空菜单没有c值；B带进新方案也不是本条件。',String.raw`\varnothing\ne B\subsetneq A\subseteq X`],
  ['原赢家还在吗','只有原先选中的c(A)仍在B时，α才要求它继续胜出。原赢家被删掉时，换选其他东西不能作为α反例。',String.raw`c(A)\in B`],
  ['最后检查有没有换人','前提全满足却c(B)不同，是一个直接反例；一对没有冲突，只验证这一对。完整函数的α要对所有此类菜单对成立。',String.raw`B\subsetneq A,\ c(A)\in B\ \Longrightarrow\ c(B)=c(A)`]
 ]},
 rational:{title:'命题2.1：唯一最好为什么不会被删掉的落选项影响',steps:[
  ['固定同一张解释偏好','先有一张对全部菜单的选择都给出唯一最好的偏好。不是每换菜单重新排一次。',String.raw`x=c(A)\quad\Longrightarrow\quad x\succ y\quad\forall y\in A\setminus\{x\}`],
  ['缩小菜单但保留赢家','假设B真包含于A，且x仍在B。剩下的每个对手本来都在A里。',String.raw`x\in B\subsetneq A`],
  ['严格优势仍在','因为对手没有变成新方案，原先对每一个对手的严格比较保持。这里只删方案，不更换方案含义或偏好。',String.raw`y\in B\setminus\{x\}\ \Longrightarrow\ y\in A\setminus\{x\}\ \Longrightarrow\ x\succ y`],
  ['所以仍是唯一最好','在B里唯一最好仍是x，因此同一理性化选择函数只能选x。证明不要求X有限。',String.raw`c(B)=x=c(A)`]
 ]},
 construct:{title:'命题2.2：有限集合逐轮删除，再证明每个菜单都选排序第一项',steps:[
  ['把三个前提写在最前面','X有限，c是对全部非空菜单定义的合法单值函数，而且满足α。教材用a_k记第k轮赢家；界面改记r_k，避免与商品a混淆。',String.raw`|X|=n<\infty,\quad c\text{ 为选择函数},\quad c\text{ 满足}\alpha`],
  ['每次从剩余菜单选一项并删除','令M_k为删去前面赢家后的剩余菜单，r_k=c(M_k)。每次删除一项，有限n轮恰好排完且没有重复。未知或菜单外答案会使实际构造停下，不能编造下一项。',String.raw`M_k=X\setminus\{r_1,\ldots,r_{k-1}\},\quad r_k=c(M_k),\quad r_1\succ r_2\succ\cdots\succ r_n`],
  ['任取一个目标菜单C','教材在证明中把这个任意菜单记作A，界面另记C以免混淆大、小菜单。设r_m是C在构造序中最早出现的成员。',String.raw`r_m\in C,\quad r_1,\ldots,r_{m-1}\notin C`],
  ['找到包含C的那一段剩余菜单','C不含任何前m−1项，所以C包含在M_m中；而构造本身已经告诉我们c(M_m)=r_m。',String.raw`r_m\in C\subseteq M_m=\{r_m,\ldots,r_n\},\quad c(M_m)=r_m`],
  ['分清相等和真包含，再收缩','若C=M_m，直接由构造得到c(C)=r_m；若C真包含于M_m且保留r_m，应用α得到同样结果。C任意，因此构造序解释所有菜单，且最好项唯一。',String.raw`C=M_m\Rightarrow c(C)=r_m;\qquad C\subsetneq M_m,\ r_m\in C\Rightarrow c(C)=c(M_m)=r_m`]
 ]},
 partial:{title:'自主诊断：只查到部分记录时，为什么不能直接宣布通过',steps:[
  ['直接反例足够否定','若已知的一对菜单满足前提却换了赢家，任何补填都无法抹去它。',String.raw`c(A)\in B\subsetneq A,\quad c(B)\ne c(A)`],
  ['没有直接反例还不够','六个已知菜单可以都没有已观察的收缩冲突，却留下循环二选一。全菜单无论填a、b还是c，都会与其中一个二项菜单冲突。',String.raw`c(\{a,b\})=a,\quad c(\{a,c\})=c,\quad c(\{b,c\})=b`],
  ['完整性是命题的前提','有限完整函数满足α才可套用命题2.2。部分记录的α补全数通过相容严格序计算；不存在已观察反例和存在全域补全是两种不同判断。',String.raw`\text{未见已观察反例}\ \not\Rightarrow\ \text{存在全域}\alpha\text{补全}`]
 ]},
 examples:{title:'原文回看：中位、餐馆、聚会怎样给出α反例',steps:[
  ['中位：原赢家还在，却换成另一人','固定五个身份，全五项选a₃，后三项选a₄。只载入反证需要的两行，已经足够；位置角色重定义属于2.2另一个模型。',String.raw`a_3=c(\{a_1,\ldots,a_5\})\in\{a_3,a_4,a_5\},\quad c(\{a_3,a_4,a_5\})=a_4`],
  ['餐馆：先按包含关系放大小菜单','大菜单是故事后来的四道菜，选牛排；小菜单是先前的两道菜，选三文鱼。α的“大到小”不表示故事的时间顺序。厌恶比较是原故事给定，当前反证不需要使用它。',String.raw`T=c(\{S,T,N,F\})\in\{S,T\},\quad c(\{S,T\})=S\ne T`],
  ['聚会：按固定举办者识别方案','大菜单三人都邀请选举办者A，缩到A与B₁两场聚会仍保留A，却选B₁。下式用H_A记参加A的聚会，以免与菜单A混淆。把社交含义细分为新方案是另行建模，不能让原举办者模型自动通过。',String.raw`H_A=c(\{H_A,B_1,B_2\})\in\{H_A,B_1\},\quad c(\{H_A,B_1\})=B_1`]
 ]},
 limits:{title:'适用范围：有限构造、任意菜单与无限集合分开',steps:[
  ['局部图与全域命题','屏幕一次只展示选定的一对菜单或一个目标C；模型另外遍历当前有限域。一般证明中的任意C才解释为什么不是只检验图里这一组。',String.raw`\forall\varnothing\ne C\subseteq X:\quad c(C)=\text{构造序中最早的成员}`],
  ['排完需要有限性','本节命题2.2的构造证明明确以有限X为前提。不能把六项的动画当成已排完无限域；无限情形在习题2.7用另外的论证讨论。',String.raw`|X|=n<\infty\quad\Longrightarrow\quad n\text{轮后排完}`],
  ['能排一个序不等于已经理性化','任何合法有限完整选择函数都能逐轮选出并删除。若α失败，排出的序可能不能解释其他菜单；必须比较全表，不能只看构造结束。',String.raw`\text{构造结束}\ \not\Rightarrow\ \forall C,\ c(C)=\operatorname{first}_{\succ}(C)`]
 ]}
};

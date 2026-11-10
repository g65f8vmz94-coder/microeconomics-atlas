export const introProofs={
 definition:{title:'定义2.1：每个非空菜单对应一个选择',steps:[
 ['先定备选集合','X是建模时所有可能遇到的备选；A是本次真正可选的非空子集。求职菜单是这里的自主例子。',String.raw`\mathcal D=2^X\setminus\{\varnothing\},\quad A\in\mathcal D`],
 ['每个问题恰有一个菜单内答案','同一张c要给每个可能菜单都指定一个成员。未答、同时选多个、选菜单外，都不符合这个单值函数定义。',String.raw`c:\mathcal D\to X,\qquad c(A)\in A\quad\forall A\in\mathcal D`],
 ['三项备选对应七个菜单','定义先记录选择。三个备选有七个非空菜单，观察其中三份后，还有四份菜单的答案待定。空X时域为空、空函数是自主说明的退化情形。',String.raw`|X|=3\Rightarrow |\mathcal D|=2^3-1=7`]]},
 actor:{title:'理性行动的三步核对：偏好、知道机会、按它选最好',steps:[
 ['先有偏好关系','沿用第一章的完备与传递。先固定这样的排序，再观察它在不同菜单中会选出谁。',String.raw`\succeq\ \text{完备且传递}`],
 ['知道真正能选的整份菜单','实际机会A和本人以为能选的B是两件事。例如菜单有甲、乙，他只看见最喜欢的甲，也会选甲。要判断他是否知道全部机会，还须查他是否看见乙。',String.raw`B=A`],
 ['选菜单内最好的一项','检查选项真在A里，并且不差于A的任何其他项。这里允许并列最好；单值选择须另给固定破同分规则或明确这次选了谁。下一节可理性化的唯一最好要求另行讨论。',String.raw`c(A)\in A,\quad c(A)\succeq y\quad\forall y\in A`]]},
 utility:{title:'有表示、可行且取到最优，才可以把行动写成max',steps:[
 ['表示只保持比较','已知u表示该偏好，数值大小和弱偏好双向一致；比较两个分数即可读出两个备选的次序。',String.raw`x\succeq y\iff u(x)\ge u(y)`],
 ['最优与效用最大双向相同','对每个可行y逐项使用表示。于是偏好最好的一项恰是u最大的一项；max值是数字，argmax是备选项集合。',String.raw`x\in A:\quad [\forall y\in A,\ x\succeq y]\iff[\forall y\in A,\ u(x)\ge u(y)]`],
 ['哪些菜单能取到最大值','有限非空集合一定取到数值最大；无限菜单可能只有不断改进的候选。自主反例取全部正整数，任取n，菜单里还有得分更高的n+1。',String.raw`\max\{u(x):x\in A\};\qquad A=\mathbb N_{+},\ u(n)=n\Rightarrow\forall n,\ u(n+1)>u(n)`],
 ['严格递增变换保持最大者集合','若f在效用像集上严格保序，逐对比较不变，有/无并列的最大者都保持。例如正斜率仿射变换保留全部并列关系，斜率为零则使所有项得分相同。',String.raw`\alpha>0\Rightarrow\operatorname{argmax}_{x\in A}u(x)=\operatorname{argmax}_{x\in A}(\alpha u(x)+\beta)`]]},
 identify:{title:'两种严格偏好不同，怎样找出选择一定不同的菜单',steps:[
 ['不同就找一对反向比较','两个严格偏好不相同，必有x、y在一人心中x更好，另一人心中y更好。即使两人在大菜单里都选第三项z，仍可把x、y单独拿出来比较。',String.raw`x\succ_1 y,\qquad y\succ_2 x`],
 ['只给这两个备选','二选一菜单里，每人按自己的严格偏好都有唯一最好项；两个人必须作出不同选择。',String.raw`A=\{x,y\},\quad c_1(A)=x,\quad c_2(A)=y`],
 ['因此完整函数不同','两人都按严格偏好选最优时，这一个二项菜单就给出了两个函数取值不同的见证。',String.raw`\exists A:\ c_1(A)\ne c_2(A)\Rightarrow c_1\ne c_2`]]},
 meaning:{title:'本书的技术用语不评价偏好内容',steps:[
 ['先问术语的定义','理性行动把偏好、机会意识与按偏好最优连在一起，不额外要求偏好对本人或旁观者看来有益。',String.raw`\text{技术理性}\ \not\Rightarrow\ \text{偏好内容有益}`],
 ['极端例子也满足形式条件','教材以选择疼痛最大的备选说明这一点。本页读数和三个方案均为自主构造，只演示外部评价与偏好方向可以不同。数值越大表示设定的疼痛越强。',String.raw`x\succeq y\iff d(x)\ge d(y),\qquad c(A)\in\operatorname{argmax}_{x\in A}d(x)`]]}
};

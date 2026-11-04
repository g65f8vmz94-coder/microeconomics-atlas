/* Section 3.1 only. Frames are authored from Definition 3.1 and Figure 3.1.
 * The examples on printed p.32 below Figure 3.1 belong to section 3.2. */
import {lottery,support} from './uncertainty.mjs';

export const lotteryStories={
 lottery:{
  intro:'买一张抽车票，结果可能是汽车，也可能什么都没有。先别急着问值不值；我们只问这张票把机会分给了谁。',
  end:'先写奖品集合 Z，再逐个写概率；检查每项非负、加起来等于 1。支撑集只收概率严格大于 0 的奖品。开奖结果和平均奖品都不是这张彩票本身。',
  frames:[
   {title:'一张抽车票',narration:'一千张票里，大约一张有机会拿到汽车。汽车的机会是 0.001，什么也没有的机会是 0.999；这里说的是概率，不是承诺一定会按这个频率开奖。',labels:['汽车','未中奖'],p:[.001,.999],formula:String.raw`p(\text{汽车})=0.001,\quad p(\text{未中奖})=0.999`,source:'教材原例 · 印刷31页',note:'两个概率都为正，所以两种结果都在支撑集。'},
   {title:'奖品不一定是钱',narration:'换成一次旅行：天气灰蒙蒙的机会是 0.3，出太阳的机会是 0.7。彩票说的是“可能发生什么、各有多大机会”，奖品可以是天气这样的经历。',labels:['阴天','晴天'],p:[.3,.7],formula:String.raw`0.3\cdot\text{阴天}\oplus0.7\cdot\text{晴天}`,source:'教材原例 · 印刷31页',note:'⊕ 表示把两种结果按概率列在同一张彩票里。'},
   {title:'非常小，也仍然可能',narration:'回到抽车票。0.001 很小，却严格大于 0，所以汽车仍在这张彩票的支撑集中；画不出明显宽度，也不能把它当成零。',labels:['汽车','未中奖'],p:[.001,.999],formula:String.raw`\operatorname{supp}(p)=\{z\in Z:p(z)>0\}`,source:'定义3.1 · 印刷31页',note:'支撑集 = {汽车，未中奖}。'},
   {title:'端点也是彩票',narration:'如果旅行确定是晴天，阴天的概率就是 0，晴天的概率就是 1。阴天退出支撑集，但“肯定晴天”仍是一张合法的彩票。',labels:['阴天','晴天'],p:[0,1],formula:String.raw`[\text{晴天}]=(0,1)`,source:'定义3.1 · 印刷31页',note:'支撑集只有晴天；[晴天]叫确定彩票。'},
   {title:'先查这张票是否合法',narration:'如果有人写“阴天 0.6，晴天也 0.6”，两项加起来是 1.2。它不是一张合法的彩票；不能偷偷除以 1.2，再当成原题的数据。',labels:['阴天','晴天'],p:[.6,.6],invalid:true,formula:String.raw`0.6+0.6=1.2\ne1`,source:'自主构造 · 无效候选',note:'先指出总和错误，再说明需要修改哪一个给定数。'},
   {title:'补上缺少的概率',narration:'保留阴天 0.6，晴天就必须是 1 减去 0.6，也就是 0.4。现在每项非负，总和恰好为 1。',labels:['阴天','晴天'],p:[.6,.4],formula:String.raw`p(\text{晴天})=1-0.6=0.4`,source:'自主构造 · 计算练习',note:'有效彩票；支撑集包含两种天气。'},
   {title:'奖品集合可以很大',narration:'奖品种类 Z 即使多到无限，一张本章的彩票也只让有限多个奖品有正概率；其余奖品的概率全是 0。所有满足这些要求的彩票合起来叫 L(Z)。',labels:['阴天','晴天'],p:[.6,.4],formula:String.raw`p:Z\to\mathbb R_{\ge0},\quad \#\operatorname{supp}(p)<\infty`,source:'定义3.1 · 印刷31页',note:'图只画出两个有正概率的奖品；Z 里其余奖品概率为 0。L(Z) 是彩票的集合。'},
   {title:'最后别把票和结果混淆',narration:'写 0.6·阴天 ⊕ 0.4·晴天，是在描述开奖前的分布。实际旅行只会遇到其中一种天气，不会遇到“六成阴天加四成晴天”的平均天气。',labels:['阴天','晴天'],p:[.6,.4],formula:String.raw`p=0.6\cdot\text{阴天}\oplus0.4\cdot\text{晴天}`,source:'定义3.1 · 记号解释',note:'⊕ 不是把两个奖品相加，也不是已实现的结果。'}
  ]
 },
 simplex:{
  intro:'先把一张票当作一个位置。只有两种结果时，知道一种的概率，另一种就被 1 减出来；再多一种结果，可行位置从线段铺成三角形。',
  end:'两奖品看线段，三奖品看三角形。坐标记录概率，不是价格或奖品大小；点在内部、边上或角上都可能是合法彩票，只要各项非负且总和为 1。',
  frames:[
   {title:'两种奖品，先固定坐标',narration:'横轴记得到奖品1的概率 p₁，纵轴记得到奖品2的概率 p₂。左上角一定得到奖品2，右下角一定得到奖品1；两点之间整段都合法。',pair:[0,1],tri:[1,0,0],focus:'pair',formula:String.raw`p_1+p_2=1,\quad p_1,p_2\ge0`,note:'教材图3.1(a) · 两轴截距都是 1。'},
   {title:'知道一项，就知道另一项',narration:'例如 p₁ 是 0.3，那么 p₂ 必须是 0.7。把 (0.3,0.7) 放上去，点恰好落在线段上。',pair:[.3,.7],tri:[1,0,0],focus:'pair',formula:String.raw`(p_1,p_2)=(0.3,0.7)`,note:'图中的点代表一张彩票，而不是已经抽出的奖品。'},
   {title:'概率变了，仍沿同一条线',narration:'现在把奖品1的机会提高到 0.7，奖品2就降到 0.3。盯住同一个点：它沿着固定的概率线段移动，坐标轴没有换。',pair:[.7,.3],tri:[1,0,0],focus:'pair',formula:String.raw`(p_1,p_2)=(0.7,0.3)`,note:'只要两项非负并相加为 1，点不能跑出线段。'},
   {title:'多一种奖品，线段铺成三角形',narration:'第三种奖品加入以后，三项概率一起分完 1。先看边上的 (0,0.5,0.5)：奖品1不可能发生，其余两种各占一半。',pair:[.7,.3],tri:[0,.5,.5],focus:'tri',formula:String.raw`(p_1,p_2,p_3)=(0,0.5,0.5)`,note:'三角形的边也合法；这一边满足 p₁=0。'},
   {title:'三种奖品都可能发生',narration:'再把概率分成 0.2、0.3、0.5。三个数都大于 0，点就在三角形内部；离哪个角近，不等于那种奖品必定出现。',pair:[.7,.3],tri:[.2,.3,.5],focus:'tri',formula:String.raw`0.2+0.3+0.5=1`,note:'内部点的支撑集有三种奖品。'},
   {title:'角点就是确定结果',narration:'把全部机会给奖品1，得到 (1,0,0)。点走到奖品1的角上；这就是确定彩票 [z₁]。',pair:[.7,.3],tri:[1,0,0],focus:'tri',formula:String.raw`[z_1]=(1,0,0)`,note:'三角形三个角都属于彩票集合。'},
   {title:'从位置读回概率',narration:'现在看边上的 (0.5,0.5,0)。奖品3的概率是 0，不在支撑集；前两种各占一半。读图时每个坐标都要核对。',pair:[.7,.3],tri:[.5,.5,0],focus:'tri',formula:String.raw`\operatorname{supp}(p)=\{z_1,z_2\}`,note:'边点只让两种奖品有正概率。'},
   {title:'记住这张图在说什么',narration:'三角形上的点由三个顶点按 p₁、p₂、p₃ 加权确定。三角形中间不是第四种奖品，只是三种结果都有机会发生的一张彩票。',pair:[.7,.3],tri:[.2,.3,.5],focus:'tri',formula:String.raw`p_1+p_2+p_3=1,\quad p_i\ge0`,note:'平面三角形是教材三维概率平面的一种等价展开画法。'}
  ]
 }
};

export function lotteryFrame(mode,phase){
 const story=lotteryStories[mode];if(!story)throw Error('未知的3.1分镜');
 if(!Number.isInteger(phase)||phase<0||phase>=story.frames.length)throw Error('分镜阶段越界');
 const frame=story.frames[phase];
 if(mode==='lottery'&&!frame.invalid)lottery(frame.p);
 if(mode==='simplex'){lottery(frame.pair);lottery(frame.tri)}
 return frame;
}

export function probabilityPoint(p,vertices){
 lottery(p);
 if(p.length!==vertices.length||vertices.some(v=>v.length!==2||v.some(x=>!Number.isFinite(x))))throw Error('概率与顶点不匹配');
 return [0,1].map(axis=>p.reduce((v,w,i)=>v+w*vertices[i][axis],0));
}

export function frameSupport(frame){return frame.invalid?null:support(frame.p)}

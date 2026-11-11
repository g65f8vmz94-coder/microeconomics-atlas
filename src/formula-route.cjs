'use strict';
const { math, inline, escape } = require('./guided/format.cjs');
const { urlFor } = require('./guided/catalog.cjs');
const T = String.raw;

// Minutes include time to write and check the short problems. The last line of
// each hour is a retrieval exercise whose answer stays closed until requested.
const hours = [
  { title:'从偏好到需求', chapters:'第 1–5 章', items:[
    ['排序与选择',10,'1.4','题目给几样东西的排序，或给不同菜单下的唯一选择。',[T`x\succeq y\iff u(x)\ge u(y)`],'先列出所有两两比较。若给菜单，删掉未选项；原来选中的仍在小菜单里时，检查它是否仍被选中。','严格递增变换保留排序；两件东西的效用分数差不能直接当作愿付价。'],
    ['彩票与确定性等价',12,'3.5','每个结果有概率，且偏好可由期望效用表示。',[T`EU=\sum_s p_s u(w_s)`,T`u(CE)=EU`],'逐个结果先算效用，再用概率加权。要换回钱，解右边那条等式。','若效用严格递增且凹，确定性等价不超过期望财富；两者用同一种货币单位。'],
    ['预算线与最优商品束',18,'5.4','两种商品价格均为正，收入固定；若两样都买，先找内点候选。',[T`p_1x_1+p_2x_2=w`,T`\frac{MU_1}{MU_2}=\frac{p_1}{p_2}`],'局部非饱和时先写预算等式。对可微的内点令两种商品每元带来的边际效用相等，再代回预算求数量。','第二式要求分母非零。还要核对两端；遇到直角偏好，另外检查折点。'],
    ['闭卷自测',20,'5.1','收入 12 元，两样商品的单价分别是 2 元、1 元，效用是两种数量的乘积。各买多少？',[T`u(x_1,x_2)=x_1x_2`],'内点条件给出第二种数量是第一种的两倍。代入预算，第一种买 3，第二种买 6。两端效用都是 0，内点效用为 18。','把两笔支出写出来，6 元加 6 元，正好是 12 元。',true]
  ]},
  { title:'从成本到定价', chapters:'第 6–7 章', items:[
    ['雇多少、做多少',15,'6.3','单一投入的价格为 w，产品价格为 p，厂商按给定价格出售。',[T`\pi(a)=p f(a)-wa`,T`p f'(a)=w`],'用新增产量乘售价，与再加一单位投入的费用比较。找到正的内点候选，再比较可行边界。','投入是整数时列相邻利润；非凹问题要比较所有候选，不能只看一处导数为零。'],
    ['统一价垄断与无谓损失',15,'7.2','一家厂商给所有人同一价格，反需求随销量向下倾斜。',[T`MR(y)=P(y)+yP'(y)`,T`MR(y_m)=MC(y_m)`,T`P(y_c)=MC(y_c)`],'先用边际收益和边际成本求垄断产量，再回需求曲线读售价。社会最优用买家的边际支付意愿和边际成本比较。','等式给内点候选。逐个比较利润，含零产量；常规单交点情形下，两产量之间需求高于边际成本的面积就是无谓损失。'],
    ['识别分组，还是让顾客自己选',15,'7.4','先问卖家看不看得出类型，再决定列哪组条件。',[T`MR_i(q_i)=C'(\sum_j q_j)`,T`V_i(q_i)-m_i\ge0`,T`V_i(q_i)-m_i\ge V_i(q_j)-m_j`],'能分组且防转售时，正销量内点市场共用总产量的边际成本。看不出类型时，给每种类型各写“愿意买”和“愿意选本档”两类约束。','后两式取不买的效用为零。比较分离菜单、同一套餐和只服务高类型的利润，再选最优。'],
    ['闭卷自测',15,'7.2','反需求和成本如下，求垄断价、销量，以及社会最优销量。',[T`P(y)=12-y`,T`C(y)=2y,\quad 0\le y\le12`],'边际收益为 12 减去两倍销量。令它等于 2，得到销量 5；回需求读出售价 7。需求等于 2 时销量为 10。','利润是开口向下的二次函数。无谓损失三角形底和高都是 5，面积是 12.5。',true]
  ]},
  { title:'总供给够不够', chapters:'第 8–14 章', items:[
    ['有强弱顺序，还是各有产权',8,'9.2','每人要一套房，排序严格。先圈出题目给的是权力顺序还是初始产权。',[],'按权力取房时，从最强者开始逐个挑剩余首选。按产权换房时，每人指向剩余首选房，房指向当前房主；找有向环，让环内交易同时完成。','一轮结束再移除已分配的人和房。两种题的数据不同，算法也不同。'],
    ['交换经济的均衡价格',16,'10.2','每户带着初始禀赋进场，面对同一组正价格。',[T`w_i=p\cdot e_i`,T`\sum_i x_{ij}(p,w_i)=\sum_i e_{ij}`],'先定一种商品价格为 1。按试算价格给每户的家底估值，用自己的预算算最优订单，再按商品逐项加总。','价格变化时，要重新估值每户的禀赋。若商品不可分，直接比较可负担的选项；若按状态交货，每个状态单独清算。'],
    ['厂商也在场',8,'12.1','消费者和生产者在同一市场交易，用净产出向量计量生产。',[T`\sum_i x_i=\sum_i e_i+\sum_f y_f`],'厂商按价格选利润最大的生产计划，再把利润按题给份额计入家庭收入，最后核对每一项资源。','投入在净产出向量里记负号。清算时把投入再扣一次会重复计算。'],
    ['预期与信息',10,'13.1','题目给了预期等候时间、成交质量，或工人看得见的文凭。',[],'先假设一个预期，据此算行动，再用实际结果回查预期。若有类型和合同，逐类核对参加条件和冒充另一类的收益。','只有在题设规定下才用平均数更新；例如平均成交质量应按实际成交者及其权重计算。'],
    ['闭卷自测',18,'10.2','甲带 4 斤米、2 斤豆，乙带 2 斤米、4 斤豆。两户效用都是米量乘豆量。豆价 1 元，米价半元，市场能按订单交货吗？',[T`w_i=p_r e_{ir}+e_{ib}`],'甲的家底值 4 元，乙的值 5 元。乘积偏好使两户各把一半预算买米，甲拿 2 元买 4 斤，乙拿 2.5 元买 5 斤。两户分别用剩下的钱买 2 斤和 2.5 斤豆。','米要 9 斤，只带来 6 斤，缺 3 斤。作为复核，再试米价 1 元：两户都买（3，3），两种商品都正好够分。',true]
  ]},
  { title:'谁愿意改主意', chapters:'第 15–20 章', items:[
    ['同时行动与序贯行动',13,'16.3','先分清行动是同时选，还是后手能观察到前手。',[T`u_i(a_i^*,a_{-i}^*)\ge u_i(a_i,a_{-i}^*)`],'同时行动时，固定对手逐个圈最佳回应，交点是纯策略纳什均衡。有限完全信息树上，从末节点往回选，并写出每个决策节点的行动。','对每个玩家、每个可行偏离都要检查。没有纯策略交点时再查混合策略；并列最佳回应都保留。'],
    ['如实报告与稳定匹配',12,'17.2','先辨明“能否谎报”和“是否有两个人愿意私下改配”是哪一种检验。',[T`u_i(g(t_i,t_{-i});t_i)\ge u_i(g(r_i,t_{-i});t_i)`],'检验防操纵时，别人的报告固定，用自己的真实类型评价两种报告的结果，转移支付也计入。匹配题则逐对检查，是否双方都严格更愿意选对方。','防操纵要对每种他人报告及每个谎报都成立。有不可接受对象的匹配题，还要检查个人理性。'],
    ['分配与偏好汇总',10,'20.1','社会分配先读清目标；投票题先写清社会规则。',[T`x\succ_M y\iff N(x,y)>N(y,x)`],'土地给谁生产和收成怎样分配是两步。成对多数表决时，对每一对选项单独数票，再检查得到的社会排序是否传递。','这里 N 表示严格支持该方向的人数。三项及以上可能出现多数循环，不能凭一次两两胜出推出总排名。'],
    ['闭卷自测',25,'15.1','两人同时选左或右。选相同两人各得 2，选不同两人各得 0。写出全部纯策略均衡，再求双方都随机化的均衡。',[],'两个纯策略均衡是（左，左）和（右，右）。若对手选左的概率为 $q$，自己选左的期望收益为 $2q$，选右为 $2(1-q)$。令两者相等得 $q=\\tfrac12$，另一人的计算相同。','自己愿意混合，是对手的概率让自己无差异。余下时间遮住答案，默写四小时里最容易忘记的两个适用条件。',true]
  ]}
];

function formulaRoute(chapters, chaptersIndex) {
  const label = i => '第' + ['一','二','三','四'][i] + '小时';
  const eq = xs => xs.length ? '<div class="sprint-math">'+xs.map(tex=>'<span>'+math(tex)+'</span>').join('')+'</div>' : '';
  const modules = hours.map((hour,i)=>{
    if(hour.items.reduce((sum,item)=>sum+item[1],0)!==60)throw new Error('Expected a one-hour review block');
    const items=hour.items.map(([title,min,unit,given,tex,method,check,quiz])=>
      `<article class="sprint-item${quiz?' sprint-quiz':''}"><div class="sprint-time">${min} 分钟</div><div>
      <h3>${escape(title)}</h3><p>${escape(given)}</p>${eq(tex)}
      ${quiz?'<details><summary>核对自主练习答案</summary>':''}<p><b>${quiz?'推导':'落笔'}</b>　${inline(method)}</p><p><b>验算</b>　${escape(check)}</p>${quiz?'</details>':''}
      <a href="${urlFor('s'+unit)}">回到 §${unit} 的生活图解 →</a></div></article>`).join('');
    const stops = chapters.filter(ch => ch.number > ([0,5,7,14][i]) && ch.number <= [5,7,14,20][i]);
    return `<section class="sprint-hour" id="hour-${i+1}" aria-labelledby="hour-title-${i+1}"><p>${label(i)} · ${hour.chapters}</p><h2 id="hour-title-${i+1}">${hour.title}</h2><nav class="hour-chapters" aria-label="${label(i)}相关章节">${stops.map(ch=>`<a href="review-${ch.number}.html">第 ${ch.number} 章 · ${escape(ch.title)}</a>`).join('')}</nav>${items}</section>`;
  }).join('');
  return `<main id="main" class="sprint"><header><a href="index.html">← 市场之中</a><h1>4h 速通公式版</h1><p>用四小时练认题、列式和验算。手里已经有题号？按章查命题，或直接翻到那道题的完整答卷和旁注。</p><nav class="sprint-doors" aria-label="复习入口"><a href="#hour-1">开始四小时复习 →</a><a href="#chapters">查章节与习题</a><a href="review-homework.html">查课堂作业</a></nav></header>
    <nav class="sprint-index" aria-label="四小时路线">${hours.map((h,i)=>`<a href="#hour-${i+1}"><small>${label(i)}</small><strong>${h.title}</strong></a>`).join('')}</nav>
    ${chaptersIndex}${modules}<footer><a href="#main">返回四小时路线 ↑</a>　<a href="learn.html">打开生活例子理解版 →</a></footer></main>`;
}
module.exports={formulaRoute};

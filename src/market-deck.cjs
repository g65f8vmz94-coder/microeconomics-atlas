'use strict';

// Each card links to the guided page whose assumptions it uses. Keep the
// serialized points short as the cover embeds them in its HTML.
const round = value => Number(value.toFixed(6));

function curve(start, end, intervals, valueAt) {
  return Array.from({ length: intervals + 1 }, (_, i) => {
    const x = round(start + (end - start) * i / intervals);
    return [x, round(valueAt(x))];
  });
}

function card(source, title, condition, xLabel, yLabel, points, initial, discrete = false) {
  const number = source.slice(1);
  const citation = source[0] === 'p' ? '习题 ' + number : '第 ' + number + ' 节';
  return {
    chapter: Number(number.split('.')[0]), title, condition: citation + '。' + condition,
    href: 'learn-' + source.replace('.', '-') + '.html',
    xLabel, yLabel, points, discrete, initial,
  };
}

const scores = [4, 7, 9, 3];
function hiredScore(threshold) {
  return scores.find(score => score >= threshold) ?? scores[scores.length - 1];
}

function allocatedRanks(preferences) {
  const taken = new Set();
  return preferences.map((order, i) => {
    const rank = order.findIndex(house => !taken.has(house));
    taken.add(order[rank]);
    return [i + 1, rank + 1];
  });
}

function strongestShare(height) {
  const limits = [1, 3, 6, 10];
  let share = 0;
  let bottom = 0;
  for (const [i, top] of limits.entries()) {
    share += Math.max(0, Math.min(height, top) - bottom) / (limits.length - i);
    bottom = top;
  }
  return share;
}

module.exports = [
  card('p1.7', '离 8 号一样近，会一样喜欢吗？',
    '乙最喜欢 8 号牌，相差同样远就并列。用距离的负数给号码排序；只展示 1 至 16 号整数牌。',
    '号码', '乙的效用分', Array.from({length: 16}, (_, i) => [i + 1, -Math.abs(i + 1 - 8)]), 7, true),

  card('s2.4', '把录用门槛从 9 提到 10，会招到谁？',
    '依次面谈甲、乙、丙、丁，评分为 4、7、9、3。首位达标者入选；全员未达标就录用最后一人。图中只试整数门槛。',
    '录用门槛（分）', '录用者评分', [3,4,5,6,7,8,9,10].map(t => [t, hiredScore(t)]), 4, true),

  card('s3.5', '平均还是 5 元，拉大奖金差距会怎样？',
    '两档奖金各有一半机会。若距均值都是 d 元，便分别领 5−d 和 5+d 元；每档效用取金额的平方根，再按概率加权。',
    '距均值（元）', '期望效用', curve(0, 5, 100, d => (Math.sqrt(5-d) + Math.sqrt(5+d)) / 2), 60),

  card('p4.1', '第一种礼物多放一点，第二种要减多少？',
    '只看甲。两种货都可分，甲按商品束离空盒的距离排序。把这个距离固定在 4，沿第一象限的圆弧换货。',
    '第一种（份）', '第二种（份）', curve(0, 4, 100, x => Math.sqrt(16 - x*x)), 50),

  card('s5.1', '买饼多花两元，豆浆还能买几杯？',
    '早餐钱共 12 元，饼每份 2 元，豆浆每杯 1 元，两样都可分。只看恰好花光预算的搭配。',
    '饼（份）', '豆浆（杯）', curve(0, 6, 60, x => 12 - 2*x), 20),

  card('s6.4', '饮品摊多做一杯，会摊薄每杯成本吗？',
    '已开摊且产量可分，总成本是 4 元启动费加上杯数的平方。把总成本分摊到每杯；零产量时没有每杯成本。',
    '产量（杯）', '平均成本（元/杯）', curve(0.5, 4.5, 80, y => 4/y + y), 30),

  card('s7.2', '蛋糕卖得更多，利润会一直增加吗？',
    '蛋糕按重量计份，全店统一价。卖 q 份，每份收 12−q 元，总成本为 q 的平方的一半。图中取原课图的 0 至 8 份。',
    '销量（份）', '利润（元）', curve(0, 8, 80, q => q*(12-q) - q*q/2), 40),

  card('s8.2', '按强弱挑房，轮到我时还能挑到第几志愿？',
    '甲、乙、丙依次从剩余房源里挑。三人的志愿从高到低分别是 BAC、BCA、CBA。纵轴按挑房者自己的志愿表计，第 1 名最好。',
    '挑房顺位', '所得房的志愿名次', allocatedRanks([['B','A','C'], ['B','C','A'], ['C','B','A']]), 1, true),

  card('s9.2', '一圈钥匙换完，还有几户要接着换？',
    '甲乙丙丁分别有 A、B、C、D 房。首轮甲乙互换；B 离场后，丙改指 D，与想要 C 的丁成环。第 0 轮表示尚未交换。',
    '已完成的换房轮数', '仍在场（户）', [[0,4],[1,2],[2,0]], 1, true),

  card('s10.3', '米价降下去，大家合起来想买的米够分吗？',
    '甲有 4 份米和 2 份豆，乙有 2 份米和 4 份豆，双方都按米豆数量的乘积选购。豆价固定为 1。用米的总需求减去 6 份库存。',
    '米价（以豆计）', '米的超额需求（份）', curve(0.4, 2.5, 70, p => 3/p - 3), 20),

  card('s11.1', '二手票涨到几元，一定要留票的人才会变少？',
    '甲乙各有一张票，四人估值为 0、6、4、10 元，现金充足，每人最多留一张。试课图中的五个报价；估值恰等于票价的人可买可不买，不计入严格需求。',
    '试报价（元）', '严格想持票（人）',
    [3,4,5,6,7].map(p => [p, [0,6,4,10].filter(v => v > p).length]), 2, true),

  card('s12.1', '第一种面包变贵，老板会多烤多少？',
    '两种面包共享烤炉，可行产量在横截距 8、纵截距 6 的四分之一椭圆内。第二种面包价格为 1，老板挑总产值最高的组合。',
    '第一种面包相对价格', '第一种面包产量', curve(0.5, 1, 50, q => 64*q / Math.hypot(8*q, 6)), 25),

  card('s13.1', '街上哪一户去两家银行一样快？',
    '街长为 1，居民均匀分布。分界点 x 左侧的人去左行，右侧的人去右行。左行等候 x，右行等候 2(1−x)。把分界居民去左行的总用时减去去右行的总用时，零点就是两边一样快的位置。',
    '左行客流份额', '用时差（左减右）', curve(0, 1, 100, x => 2*x - 3*(1-x)), 60),

  card('s14.2', '混合招聘时，低产值工人增多会怎样？',
    '低型与高型工人的产值分别为 4、10 元，教育不改变产量。若用一份合同招来两类人，按应聘人群中低型所占比例计算每人的平均产值。',
    '低型工人占比', '混招平均产值（元）', curve(0, 1, 60, r => 4*r + 10*(1-r)), 12),

  card('s15.4', '对方多铺一点桌面，我最好少铺多少？',
    '原书例 15.12。两人各选 0 至 1 的用量，总量越接近 1 越好。固定对方的选择，只看自己的最佳回应。',
    '对方用量', '自己的最佳用量', curve(0, 1, 100, x => 1-x), 25),

  card('s16.4', '乙越等得起，先报价的甲还能留多少？',
    '两人无限轮流分 1 份收入，甲先报价，精炼均衡中立即成交。甲的折现因子固定为 0.8。自主算例沿用本节公式，只改乙的折现因子；取 0.6 就回到课图算例。',
    '乙的一期折现因子', '甲的首期份额', curve(0.1, 0.9, 80, b => (1-b)/(1-0.8*b)), 50),

  card('s17.1', '长椅确定要建，给邻居补多少才够？',
    '不建且不收付款时，乙的效用为零。建椅子的噪声让乙损失相当于 5 元的效用。固定建设决定，只改乙收到的补偿，每多 1 元就抵消 1 元损失。',
    '乙获补偿（元）', '乙的净效用', curve(0, 5, 50, transfer => transfer-5), 30),

  card('s18.2', '又一轮申请结束，真的多填了一个空岗吗？',
    '原书例 18.4，申请者提议。首轮 A、B、D 各暂留一人；次轮 B 改留丙并拒绝乙，C 仍空着；第三轮乙申请 C。暂留只算一个名额，第 0 轮尚未收申请。',
    '已完成的申请轮数', '暂时有人的岗位数', [[0,0],[1,3],[2,3],[3,4]], 2, true),

  card('p19.3', '每多分一层豆浆，最强的丁能分到多少？',
    '四人生产率为 1、3、6、10，合作时由最强者生产。每层只在能达到该层的人之间平分。拖动已分到的高度，看丁累计得到多少杯。',
    '已分产量（杯）', '丁累计所得（杯）', curve(0, 10, 100, strongestShare), 60),

  card('p20.6', '报得更辣，大家的汤一定更辣吗？',
    '五人都对辣度有单峰偏好。其余四人报 0.1、0.3、0.6、0.9，自己最爱 0.5。只改自己的报告，把五个报告的中位数当作整锅辣度。',
    '自己的报告辣度', '五人选出的辣度', curve(0, 1, 100, report => Math.min(0.6, Math.max(0.3, report))), 50),
];

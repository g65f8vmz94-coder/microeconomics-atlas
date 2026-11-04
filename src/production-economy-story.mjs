import {productionEconomy, technology, paretoExample, nonconvex, comparative, noTrade, leontiefException, chain, pollution} from './production-market.mjs';
import {productionEconomyContent, productionEconomyKeys} from './production-economy-content.mjs';

const peClampStep = n => Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
const peMix = (a, b, t) => a + (b - a) * t;
const peMixBundles = (a, b, t) => a.map((bundle, i) => bundle.map((x, k) => peMix(x, b[i][k], t)));
const peTotals = bundles => bundles.reduce((sum, bundle) => [sum[0] + bundle[0], sum[1] + bundle[1]], [0, 0]);

const peVerdicts = {
  d121: ['菜单先说做得到什么', '有界让产量不会逃到无穷', '闭性让最优点真正落在菜单上', '凸性允许混合两套做法', '自由处置让左下方仍可行', '价签在菜单上挑最高产值'],
  d122: ['一套价格贯穿上午和下午', '经理先选最高产值的产出', '利润按所有权分成预算', '顾客拿预算选择购物篮', '份额只分蛋糕不造蛋糕', '五个部件才是一套生产经济'],
  d123: ['先把所有产出放进总仓库', '消费也要逐种商品相加', '价值相等不代表实物相同', '红绿不重合只是愿望清单', '价格靠近时缺口逐步收拢', '可行性只问能否同时实现'],
  d124: ['企业最优是第一本账', '利润完整分配是第二本账', '消费者预算最优是第三本账', '个人需求还要合成总需求', '红绿重合才是市场出清', '三本账同时成立才叫均衡'],
  d125: ['比较的是两套完整计划', '起点可能分得不合口味', '商品1转向更看重它的甲', '商品2转向更看重它的乙', '两个人的效用都上升', '不存在全员改进才叫稳定'],
  q121: ['反证时锁住均衡价签', '企业最优压住另一产值', '弱改善不可能花得更少', '严格改善必定严格更贵', '消费端总价值被推高', '同一本总账不可能大于自己'],
  fig122: ['技术菜单中间缺了一块', '商品2较贵时企业选a', '同价时a和b并列但不能平均', '商品1较贵时企业跳到b', '顾客始终想要等量组合', '两个最优集合始终碰不到'],
  p1a: ['每个人先有自己的生产前沿', '价签决定哪种产出最值钱', '卖出产出形成个人预算', '再用预算选择喜欢的消费', '把所有产出与消费分别加总', '个人最优与市场出清同时检查'],
  p1b: ['t是商品1的机会成本', '价高于成本就专做商品1', '价低于成本就专做商品2', '价等于成本时前沿产值相同', '产值无差异不等于偏好无差异', '先分专业化再检查市场出清'],
  p1c: ['所有人的口味斜率相同', '价格比取共同斜率t', '各人的生产决策仍可不同', '自己的产出正好买得回来', '每个人都不必实际交换', '零贸易也可以是竞争均衡'],
  p1d: ['比较优势只给出相对方向', '1号的价格恰等于机会成本', '所以1号可在前沿混合生产', '2号专门生产商品2', '消费重新分配后逐商品出清', '完全专业化不是一般必然结论'],
  p4: ['第一人把工作时间变成X', 'X成为第二人的真实投入', '价格让X供给等于投入需求', '第二人再把X加工成Y', 'Y分成销售收入和企业利润', '两边最优与中间品出清共同锁定'],
  p5: ['每家只看自己的私人账', '一组价格支持大家都产商品2', '烟害由全体商品2共同造成', '私人均衡让每人效用降到负数', '集体改产商品1可消除污染', '均衡存在却不帕累托稳定']
};

function peTechnologyState(step) {
  const r = technology(8, 6, step < 4 ? 1 : 0.58);
  return {...r, kind: 'technology', focus: ['menu', 'bounded', 'closed', 'convex', 'disposal', 'price'][step]};
}

function peEconomyState(key, step) {
  const paths = {
    d122: [0.66, 0.74, 0.82, 0.9, 0.96, 1],
    d123: [0.62, 0.62, 0.72, 0.82, 0.93, 1],
    d124: [0.7, 0.78, 0.86, 0.92, 1, 1]
  };
  const r = productionEconomy({mult: paths[key][step]});
  return {...r, kind: 'economy', focus: key, progress: step / 5};
}

function peParetoState(step) {
  const r = paretoExample();
  const progress = step < 2 ? 0 : (step - 1) / 4;
  const current = peMixBundles(r.initial, r.alternative, progress);
  const utility = (x, t) => x[0] ** t * x[1] ** (1 - t);
  return {
    ...r, kind: 'pareto', progress, current, totals: peTotals(current),
    currentU: current.map((bundle, i) => utility(bundle, r.theta[i]))
  };
}

function peProofState(step) {
  const eq = productionEconomy({mult: 1});
  const premiums = [0, 0, 0.08, 0.32, 0.72, 0.72];
  return {
    kind: 'proof', equilibriumValue: eq.profit,
    alternativeConsumptionValue: eq.profit + premiums[step],
    alternativeProductionCeiling: eq.profit,
    strict: step >= 3, contradiction: step >= 5
  };
}

function peNonconvexState(step) {
  const q = [0.62, 0.62, 1, 1.38, 1.38, 1][step];
  return {...nonconvex(q), kind: 'nonconvex', progress: step / 5};
}

function peSpecializationState(key, step) {
  if (key === 'p1c') return {...noTrade(2), kind: 'specialization', noTrade: true, progress: step / 5};
  if (key === 'p1d') return {...leontiefException(), kind: 'specialization', mixed: true, progress: step / 5};
  const qPath = key === 'p1b' ? [0.75, 1.25, 1.75, 2, 2.65, 2]
    : [0.8, 1.1, 1.5, 1.9, 2.35, 2];
  return {...comparative(qPath[step]), kind: 'specialization', progress: step / 5};
}

function peChainState(step) {
  return {...chain(), kind: 'chain', progress: step / 5};
}

function pePollutionState(step) {
  const q = [0.75, 1, 1.5, 1.5, 1.5, 1.5][step];
  return {...pollution(q), kind: 'pollution', showAlternative: step >= 4, progress: step / 5};
}

export function productionEconomyStory(key = 'd121', rawStep = 0) {
  if (!productionEconomyKeys.includes(key)) throw Error(`Unknown production-economy story: ${key}`);
  const step = peClampStep(rawStep);
  const content = productionEconomyContent[key];
  let state;
  if (key === 'd121') state = peTechnologyState(step);
  else if (['d122', 'd123', 'd124'].includes(key)) state = peEconomyState(key, step);
  else if (key === 'd125') state = peParetoState(step);
  else if (key === 'q121') state = peProofState(step);
  else if (key === 'fig122') state = peNonconvexState(step);
  else if (['p1a', 'p1b', 'p1c', 'p1d'].includes(key)) state = peSpecializationState(key, step);
  else if (key === 'p4') state = peChainState(step);
  else state = pePollutionState(step);
  const [identity, narration] = content.steps[step];
  return {
    key, step, identity, narration, verdict: peVerdicts[key][step],
    view: content.view, scope: content.source, ...state
  };
}

export {productionEconomyKeys};

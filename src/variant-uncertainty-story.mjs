import {beliefs, beliefRisk, bets, betMarket, insurer, market, pooled, timeEconomy} from './variants.mjs';
import {uncertaintyContent, uncertaintyKeys} from './variant-uncertainty-content.mjs';

const clampStep = n => Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
const mix = (a, b, t) => a + (b - a) * t;
const mixBundles = (a, b, t) => a.map((bundle, i) => bundle.map((x, k) => mix(x, b[i][k], t)));
const bundleTotals = bundles => bundles.reduce((sum, x) => [sum[0] + x[0], sum[1] + x[1]], [0, 0]);

function stateEconomy(key, step) {
  const pi = 0.4;
  if (key === 'd113') {
    const initial = [[8, 2], [2, 8]];
    const certain = [[4.4, 4.4], [5.6, 5.6]];
    const progress = step < 3 ? 0 : (step - 2) / 3;
    return {
      kind: 'states', pi, fairRatio: pi / (1 - pi), priceRatio: pi / (1 - pi),
      labels: ['甲', '乙'], initial, final: certain, current: mixBundles(initial, certain, progress),
      progress, totals: bundleTotals(initial), conceptual: true,
      axisNote: step === 4 ? '教材排版校正：状态1消费较多时，边际替代率应低于概率比' : '红券只在状态1付款；绿券只在状态2付款'
    };
  }
  if (key === 'd114' || key === 'q114') {
    const r = pooled(pi, 1);
    const progress = key === 'd114' ? Math.max(0, (step - 1) / 4) : Math.min(1, step / 4);
    return {
      kind: 'states', pi, fairRatio: r.fairRatio, priceRatio: r.priceRatio,
      labels: ['甲', '乙'], initial: r.e, final: r.a, current: mixBundles(r.e, r.a, progress),
      progress, totals: [r.c1, r.c2], equilibrium: key === 'q114' || step >= 4,
      budgetCheck: r.a.map((x, i) => r.priceRatio * x[0] + x[1] - (r.priceRatio * r.e[i][0] + r.e[i][1]))
    };
  }
  const r = pooled(pi, 0.5);
  const progress = Math.min(1, step / 4);
  return {
    kind: 'states', pi, fairRatio: r.fairRatio, priceRatio: r.priceRatio,
    labels: ['甲', '乙'], initial: r.e, final: r.a, current: mixBundles(r.e, r.a, progress),
    progress, totals: [r.c1, r.c2], equilibrium: step >= 3,
    budgetCheck: r.a.map((x, i) => r.priceRatio * x[0] + x[1] - (r.priceRatio * r.e[i][0] + r.e[i][1]))
  };
}

function insurerEconomy(step) {
  const pi = 0.4, m = 3, richCapital = 2.2, poorCapital = 1.2;
  const full = insurer(pi, richCapital, m);
  const partial = insurer(pi, poorCapital, m);
  const active = step < 3 ? full : partial;
  return {
    kind: 'insurer', pi, m, richCapital, poorCapital, full, partial, active,
    activeCase: step < 3 ? 'full' : 'partial', threshold: m * (1 - pi),
    policyholdersInitial: [0, 1],
    policyholdersFinal: [active.x1, active.x2],
    insurerInitial: [active.capital, active.capital],
    insurerFinal: active.insurerBundle,
    progress: step < 2 ? step / 2 : step === 3 ? 0 : Math.min(1, (step - 3) / 2)
  };
}

function beliefEconomy(key, step) {
  if (key === 'e112') {
    const regimes = ['initial', 'cross', 'cross', 'above', 'below', 'summary'];
    const regime = regimes[step];
    const config = regime === 'above' ? {t: 0.8, s: 0.6}
      : regime === 'below' ? {t: 0.4, s: 0.2}
        : {t: 0.7, s: 0.3};
    const r = beliefs(config.t, config.s);
    const final = regime === 'initial' ? [[1, 1], [1, 1]] : [r.high, r.low];
    return {
      kind: 'belief', regime, t: config.t, s: config.s, priceShare: regime === 'initial' ? 0.5 : r.q,
      initial: [[1, 1], [1, 1]], final, current: final,
      totals: bundleTotals(final), riskNeutral: true
    };
  }
  const t = 0.7, s = key === 'p7a' ? 0.7 : 0.3;
  const r = beliefRisk(t, s);
  const progress = key === 'p7a' ? Math.min(1, step / 3) : Math.min(1, step / 4);
  const initial = [[100, 100], [100, 100]];
  const final = [r.one, r.two];
  return {
    kind: 'beliefRisk', t, s, priceShare: r.q, initial, final,
    current: mixBundles(initial, final, progress), progress,
    totals: bundleTotals(final), riskNeutral: false,
    generalPriceOdds: key === 'p7b' ? [s / (1 - s), t / (1 - t)] : [t / (1 - t), t / (1 - t)]
  };
}

function showEconomy(step) {
  const chances = [0.9, 0.75, 0.65, 0.4, 0.2];
  const prices = [0, 5, 6.5, 7, 7.5, 7];
  const people = chances.map((chance, i) => ({
    id: String(i + 1), chance, v: 10 * chance, own: i === 0 || i === 4 ? 1 : 0, cash: 20
  }));
  const price = prices[step];
  return {
    kind: 'show', chances, people, price, result: market(people, price), supply: 2,
    interval: [10 * chances[2], 10 * chances[1]], weatherOpen: step % 2 === 0
  };
}

function bettingEconomy(key, step) {
  const price = key === 'p9a' ? 0.65 : [0.55, 0.55, 0.6, 0.65, 0.7, 0.75][step];
  const result = betMarket(price);
  const pairCount = key === 'p9a' ? Math.max(0, Math.min(4, step - 1)) : Math.min(result.strict, result.n);
  return {
    kind: 'bets', price, values: bets, result, pairCount,
    aRevenue: 4 * price, bRevenue: 4 * (1 - price), totalRevenue: 4,
    payoutA: 4, payoutB: 4, interval: result.interval
  };
}

function timeState(key, step) {
  const r = timeEconomy(0.6);
  const initial = [[1, 0], [0, 1]];
  const final = [[r.first, r.first], [r.second, r.second]];
  const progress = Math.min(1, step / 4);
  return {
    kind: 'time', delta: r.delta, priceRatio: r.priceRatio,
    initial, final, current: mixBundles(initial, final, progress), progress,
    totals: bundleTotals(final), directCalculation: key === 'p10b'
  };
}

const verdicts = {
  d113: ['未来先分状态，不先分钱', '状态束是附条件合同', '先算效用再按概率加权', '凹性偏爱平滑而非豪赌', 'MRS方向要与缺钱状态一致', '模型四要素缺一不可'],
  d114: ['两张状态券各有价格', '预算来自初始状态禀赋', '个人在预算线上找最优', '愿望不能代替市场可行', '两个状态必须分别对账', '最优与双重出清同时成立'],
  q114: ['总量不缺，只是分布相反', '两家人的风险可以互相抵消', '概率比给出公平价格斜率', '严格凹性唯一选确定束', '两个状态总账仍各为10', '其他价格比都会破坏出清'],
  q115: ['共同灾难不是私人错配', '内部合同不能创造灾年资源', '灾年券因稀缺而更贵', '价格比严格高于概率比', '每个人灾年仍消费更少', '保险分担风险但不消灭总冲击'],
  q116: ['投保人灾年财富归零', '全保门槛由人数和好年概率共同决定', '资本充足时可以全保', '资本不足时保险柜清零', '部分保险伴随灾难溢价', '价格接受者假设限制利润结论'],
  e112: ['同样禀赋，不同信念', '线性效用把预算押向看好状态', '观点相反时各押一边', '都看好状态1时边际者定价', '都看好状态2时逻辑镜像', '主观双赢仍须逐状态守恒'],
  p7a: ['初始已经是平滑状态束', '共同信念给出共同公平赔率', '预算线穿过原禀赋', '严格凹性保留(100,100)', '无交易也能逐状态出清', '均衡要写价格、最优与可行'],
  p7b: ['两人从同一束出发', '1号相对更想要赢票', '2号承接输票完成反向交易', '价格赔率夹在两人的信念之间', '边际替代率推出1号赢票更多', '对数数值不是一般闭式解'],
  p8: ['先判断门票在哪个状态有用', '期望估值等于开演概率的10倍', '现金假设允许套不可分物品模型', '按开演概率从高到低排队', '两张票的价在6.5到7.5', '一般式看最后一位得票者和第一位没票者'],
  p9a: ['一张A注与一张B注组成一盒', '每盒收入1且任一状态只赔1', '两边人数相等才能全部配对', '个人门槛是信念与票价的比较', '价格线把信念队伍切成两半', '做市方逐状态没有净缺口'],
  p9b: ['先把八个信念排好', '价格低于0.6时押A者过多', '价格等于0.6时可用无差异者配平', '区间内部严格四比四', '价格等于0.7时仍可用端点配平', '价格高于0.7时押A者不足'],
  p10a: ['两代只差钱落在哪一期', '时间可以改写成两种商品', '两期社会总量都等于总人数', '第1期价格是第2期价格的贴现倍数倒数', '严格凹让每人跨期平滑', '第1代因持有更贵资源而更富'],
  p10b: ['平方根边际效用可直接求导', '边际替代率必须等于价格比', '代入均衡价格比后推出两期相等', '第1代每期占一加贴现因子的倒数', '第2代每期占贴现因子除以一加贴现因子', '两期资源各自加总为1']
};

export function uncertaintyStory(key = 'd113', rawStep = 0) {
  if (!uncertaintyKeys.includes(key)) throw Error(`Unknown uncertainty story: ${key}`);
  const step = clampStep(rawStep);
  const content = uncertaintyContent[key];
  let state;
  if (['d113', 'd114', 'q114', 'q115'].includes(key)) state = stateEconomy(key, step);
  else if (key === 'q116') state = insurerEconomy(step);
  else if (['e112', 'p7a', 'p7b'].includes(key)) state = beliefEconomy(key, step);
  else if (key === 'p8') state = showEconomy(step);
  else if (['p9a', 'p9b'].includes(key)) state = bettingEconomy(key, step);
  else state = timeState(key, step);
  const [identity, narration] = content.steps[step];
  return {
    key, step, identity, narration, verdict: verdicts[key][step],
    view: content.view, scope: content.source, ...state
  };
}

export {uncertaintyKeys};

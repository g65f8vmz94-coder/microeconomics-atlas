import {carMarketContent, carMarketKeys} from './car-market-content.mjs';

const qualities = [.05, .10, .20, .60, .80, 1.00];
const clampStep = value => Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

export function carCandidate(m, alpha = 1.5, q = qualities) {
  if (!Number.isInteger(m) || m < 1 || m > q.length) throw Error('invalid car candidate size');
  if (!(alpha > 1)) throw Error('alpha must exceed one');
  const sorted = [...q].sort((a, b) => a - b), sold = sorted.slice(0, m);
  const belief = mean(sold), price = alpha * belief;
  const sellersAccepted = sold.every(value => value <= price + 1e-10);
  const excludedStay = sorted.slice(m).every(value => value >= price - 1e-10);
  return {
    q: sorted, m, alpha, sold, unsold: sorted.slice(m), belief, price,
    sellersAccepted, excludedStay, valid: sellersAccepted && excludedStay,
    tradeGain: sold.reduce((sum, value) => sum + (alpha - 1) * value, 0)
  };
}

export function carMarketModel(alpha = 1.5) {
  const candidates = qualities.map((_, index) => carCandidate(index + 1, alpha));
  const eligible = candidates.filter(candidate => candidate.sellersAccepted);
  return {q: qualities, alpha, candidates, maximal: eligible.at(-1)};
}

function candidateStory(key, step) {
  const model = carMarketModel();
  let sequence = [2, 2, 2, 2, 2, 2], kind = key;
  if (key === 'intro132') sequence = [6, 6, 5, 4, 3, 2];
  if (key === 'q133') sequence = [1, 2, 3, 2, 2, 2];
  const current = carCandidate(sequence[step]);
  return {
    ...model, ...current, kind, reveal: step, selectedM: sequence[step],
    averageCorrect: Math.abs(current.belief - mean(current.sold)) < 1e-10,
    buyersIndifferent: Math.abs(current.price - current.alpha * current.belief) < 1e-10,
    clears: current.m <= qualities.length + 2
  };
}

function noTradeStory(step) {
  const price = .04, belief = step === 5 ? .05 : .02, alpha = 1.5;
  const buyerValue = alpha * belief, ownersStay = qualities.every(value => price <= value + 1e-10);
  const buyersStay = price + 1e-10 >= buyerValue;
  return {
    kind: 'none', reveal: step, q: qualities, alpha, m: 0, sold: [], unsold: qualities,
    price, belief, buyerValue, ownersStay, buyersStay,
    supported: ownersStay && buyersStay,
    boundedBelief: step === 5
  };
}

function paretoStory(step) {
  const base = carCandidate(2), quality = base.unsold[0], buyerValue = base.alpha * quality;
  const transfer = (quality + buyerValue) / 2;
  return {
    ...base, kind: 'pareto', reveal: step, quality, buyerValue, transfer,
    sellerGain: step >= 3 ? transfer - quality : 0,
    buyerGain: step >= 3 ? buyerValue - transfer : 0,
    paretoImprovement: step >= 4 && transfer > quality && transfer < buyerValue
  };
}

function onlyLowStory(step) {
  const alpha = 1.25, sequence = [1, 2, 3, 4, 2, 1], m = sequence[step];
  const belief = (m + 1) / 2, price = alpha * belief, marginalQuality = m;
  return {
    kind: 'onlyLow', reveal: step, alpha, m, belief, price, marginalQuality,
    marginalSells: marginalQuality <= price + 1e-10,
    printedScaleMismatch: true,
    conclusion: step === 5 && m === 1
  };
}

const verdicts = {
  intro132: ['车主知道真车况，买家不知道', '不能辨认就只能使用统一价', '好车保留价高，先选择退出', '退出让待售平均质量下降', '平均质量下降又压低统一价', '低质更常出现的预期被选择实现'],
  d134: ['车主和买家的角色先分清', '车主用p与Q(i)比较', '买家买到的是质量彩票', '买家用p与αq̂比较', 'α>1只保证识别后有交易收益', '匿名统一价仍可能挡住好车交易'],
  fig131: ['所有车按质量递增排列', '红点是实际待售集合', 'q*=0.075是红点平均质量', 'p*=αq*=0.1125', '两辆红点车都愿意卖', '下一辆0.20高于价格而留下'],
  d135: ['买家最优条件通过', '车主最优条件通过', '两辆出售对应两位买家', '正交易信念等于真实平均质量', '买家更多把价格钉在αq̂', '四本账共同闭合'],
  q133: ['m=1必定合格，所以正交易候选存在', '继续向上寻找最大合格前缀', 'm=3失败：0.175<0.20', '最大合格前缀是m*=2', '构造价格、信念与买卖集合', '统一价还证明任何均衡都低质先卖'],
  carNone: ['先把待售与购买集合都设为空', 'p*=0.04低于最低质量0.05', 'q̂*=0.02使买家预期价值仅0.03', '无人卖、无人买且数量相等', '空市场信念在教材定义中不受约束', '知道质量下限后，无人交易不再成立'],
  carPareto: ['原匿名均衡只卖最低两辆车', '挑一辆未售0.20车和一位未购者', '买家对该车价值0.30', '中间价0.25让双方各增益0.05', '其他人的配置完全不变', '这是一项可行的帕累托改进'],
  carOnlyLow: ['正交易集合只能是最低m辆', 'm=2时平均1.5而价格1.875', 'm=3时价格2.5仍低于边际质量3', '一般条件写成m≤α(m+1)/2', 'α<4/3推出m<2', '正整数m只能等于1']
};

export function carMarketStory(key = 'intro132', rawStep = 0) {
  if (!carMarketKeys.includes(key)) throw Error(`Unknown car-market story: ${key}`);
  const step = clampStep(rawStep), content = carMarketContent[key];
  let state;
  if (key === 'carNone') state = noTradeStory(step);
  else if (key === 'carPareto') state = paretoStory(step);
  else if (key === 'carOnlyLow') state = onlyLowStory(step);
  else state = candidateStory(key, step);
  const [identity, narration] = content.steps[step];
  return {key, step, identity, narration, verdict: verdicts[key][step], scope: content.source, ...state};
}

export {carMarketKeys};

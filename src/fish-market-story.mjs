import {fishMarketContent, fishMarketKeys} from './fish-market-content.mjs';

const fishers = 5, consumers = 10, L = 2, v = 6, k = 1;
const clampStep = value => Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
const near = (a, b, tolerance = 1e-10) => Math.abs(a - b) <= tolerance;

export function fishEquilibriumModel() {
  const capacity = fishers * L, demandLimit = consumers, equilibriumTotal = v / k;
  return {
    fishers, consumers, L, v, k, capacity, demandLimit, equilibriumTotal,
    equilibriumCost: k * equilibriumTotal,
    consumerQuantity: equilibriumTotal / consumers,
    fisherQuantity: equilibriumTotal / fishers,
    endpointLower: 0,
    endpointUpper: k * capacity,
    endpointsValid: 0 < v && v < k * capacity && capacity <= demandLimit
  };
}

function allocation(total, price = v, tax = 0, rebate = 0) {
  const cost = k * total, x = total / consumers, y = total / fishers;
  return {
    fishers, consumers, L, v, k, total, price, tax, cost, x, y, rebate,
    consumerMarketGain: (v - price) * x,
    fisherMarketGain: (price - tax - cost) * y,
    consumerGain: (v - price) * x + rebate,
    fisherGain: (price - tax - cost) * y + rebate,
    clears: near(consumers * x, fishers * y),
    beliefCorrect: near(cost, k * fishers * y),
    withinBounds: x >= 0 && x <= 1 && y >= 0 && y <= L
  };
}

function externalityStory(step) {
  const totals = [0, 1, 2, 4, 5, 6], total = totals[step], state = allocation(total);
  return {
    ...fishEquilibriumModel(), ...state, kind: 'externality', reveal: step,
    industryCost: state.cost * total,
    privateMarginalComparison: v - state.cost,
    totalCostIsUnitTimesQuantity: near(state.cost * total, k * total * total)
  };
}

function ledgerStory(step) {
  const state = allocation(6);
  return {
    ...fishEquilibriumModel(), ...state, kind: 'ledger', reveal: step,
    expectedCost: 6,
    consumerOptimal: near(state.price, v),
    fisherOptimal: near(state.price, state.cost),
    revealedLedgers: Math.min(4, step + 1),
    allLedgersClose: state.clears && state.beliefCorrect && near(state.price, v) && near(state.price, state.cost)
  };
}

function proofStory(step) {
  const base = fishEquilibriumModel(), state = allocation(base.equilibriumTotal);
  const branches = [
    {branch: 'existence', trialPrice: v, trialTotal: 6, contradiction: false},
    {branch: 'construction', trialPrice: v, trialTotal: 6, contradiction: false},
    {branch: 'verify', trialPrice: v, trialTotal: 6, contradiction: false},
    {branch: 'priceHigh', trialPrice: 7, trialTotal: 0, demand: 0, supply: 10, contradiction: true},
    {branch: 'priceLow', trialPrice: 5, trialTotal: 10, demand: 10, supply: 0, contradiction: true},
    {branch: 'unique', trialPrice: v, trialTotal: 6, contradiction: false}
  ];
  return {
    ...base, ...state, ...branches[step], kind: 'proof', reveal: step,
    uniqueIntersection: true,
    safeLowerPriceSplit: true,
    capacityStrictCase: '|I|>|J|L时需求超过定义域内最大供给',
    capacityEqualCase: '|I|=|J|L时满产成本c(|J|L)>v>p，渔民改选0'
  };
}

function paretoStory(step) {
  const fractions = [1, .9, .8, .7, .6, .5], fraction = fractions[step], total = 6 * fraction;
  const cost = k * total, price = step === 0 ? v : (v + cost) / 2, state = allocation(total, price);
  return {
    ...fishEquilibriumModel(), ...state, kind: 'pareto', reveal: step, fraction,
    negotiated: step > 0,
    priceBetween: step === 0 ? near(price, v) : cost < price && price < v,
    transferBalanced: near(price * consumers * state.x, price * fishers * state.y),
    paretoImprovement: step > 0 && state.consumerGain > 0 && state.fisherGain > 0
  };
}

function taxStory(step) {
  const target = 3, targetCost = k * target, tax = step < 2 ? 0 : v - targetCost;
  const total = step < 2 ? 6 : target, revenue = tax * total;
  const rebateShares = [0, 0, 0, 0, .5, 1], rebateShare = rebateShares[step];
  const rebate = revenue * rebateShare / (fishers + consumers), state = allocation(total, v, tax, rebate);
  return {
    ...fishEquilibriumModel(), ...state, kind: 'tax', reveal: step, target, targetCost,
    revenue, rebateShare, retained: revenue * (1 - rebateShare),
    netFisherPrice: v - tax,
    taxImplementsTarget: step < 2 || near(v - tax, targetCost),
    budgetBalanced: near(rebate * (fishers + consumers) + revenue * (1 - rebateShare), revenue),
    allStrictlyBetter: rebateShare > 0 && state.consumerGain > 0 && state.fisherGain > 0
  };
}

export function survivalProbability(y, average) {
  if (y < 0 || average < 0) throw Error('health service must be nonnegative');
  return .1 + .35 * (1 - Math.exp(-y)) + .2 * (1 - Math.exp(-average));
}

export function healthExampleModel(m = 10, price = 2) {
  if (!(m > 0 && price > 0)) throw Error('health parameters must be positive');
  const upper = m / price;
  const derivative = (y, average, collective = false) => -price * survivalProbability(y, average) + (m - price * y) * Math.exp(-y) * (.35 + (collective ? .2 : 0));
  const root = collective => {
    let lo = 0, hi = upper;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (derivative(mid, mid, collective) > 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const privateY = root(false), socialY = root(true);
  const utility = y => (m - price * y) * survivalProbability(y, y);
  return {
    m, healthPrice: price, upper, privateY, socialY,
    privateUtility: utility(privateY), socialUtility: utility(socialY),
    privateFOC: derivative(privateY, privateY, false),
    collectiveSlopeAtPrivate: derivative(privateY, privateY, true),
    utility
  };
}

function healthStory(key, step) {
  const model = healthExampleModel(), progress = key === 'p5a' ? 0 : [0, 0, 0, .35, .7, 1][step];
  const currentY = model.privateY + (model.socialY - model.privateY) * progress;
  const currentUtility = model.utility(currentY);
  return {
    ...model, kind: key === 'p5a' ? 'health' : 'healthExternal', reveal: step, currentY, currentUtility,
    expectedAverage: key === 'p5a' && step < 4 ? model.privateY : currentY,
    privateConditionHolds: Math.abs(model.privateFOC) < 1e-8,
    positiveExternalEffect: model.collectiveSlopeAtPrivate > 0,
    feasibleCommonIncrease: currentY <= model.socialY + 1e-10 && currentY < model.upper,
    strictImprovement: key === 'p5b' && step >= 3 ? currentUtility > model.privateUtility + 1e-9 : false,
    constructedFunction: true
  };
}

const verdicts = {
  d136: ['两类人和数量上限先站稳', '消费者比较价值v与价格p', '个人成本由全体总量T决定', '总捕捞越高，单位成本越高', '渔民私人账把预计成本当给定', '个体最优可能漏掉共同成本'],
  d137: ['消费者最优账', '渔民最优账', '数量出清账', '成本预期账', '同类参与者采用对称数量', '四本账在p=ĉ=v处闭合'],
  q134: ['连续性保证至少一个交点', '严格递增保证交点唯一', '构造的x*与y*满足上下限', 'p>v导致零需求与满供给矛盾', 'p<v要分容量不足与容量相等', '只能p=v=c(T*)且T*唯一'],
  fishPareto: ['原均衡双方市场净收益为0', '共同减产且数量仍出清', '总量下降使单位成本下降', '协商价夹在成本与价值之间', '消费者与渔民逐人严格变好', '这是可行福利见证，不是收敛路径'],
  fishTax: ['原均衡T*=6且无税', '先选较低目标T̃=3', '单位税等于价值减目标成本', '含税均衡与9元税收同时成立', '税款留存不算个人已经受益', '等额返还后15人各得0.6'],
  p5a: ['预算先把可选服务量框住', '存活概率同时看个人量与平均量', '给定平均量做个人最优化', '可微内点只出现α₁', '对称均衡还要平均量等于选择', '本站自主函数给出数值根'],
  p5b: ['单独增加在私人均衡处不划算', '私人条件漏掉平均量通道α₂', '所有人共同增加一个小量', '链式法则出现α₁+α₂', '正α₂留下严格正边际收益', '缺条件时回到可行配置定义']
};

export function fishMarketStory(key = 'd136', rawStep = 0) {
  if (!fishMarketKeys.includes(key)) throw Error(`Unknown fish-market story: ${key}`);
  const step = clampStep(rawStep), content = fishMarketContent[key];
  let state;
  if (key === 'd136') state = externalityStory(step);
  else if (key === 'd137') state = ledgerStory(step);
  else if (key === 'q134') state = proofStory(step);
  else if (key === 'fishPareto') state = paretoStory(step);
  else if (key === 'fishTax') state = taxStory(step);
  else state = healthStory(key, step);
  const [identity, narration] = content.steps[step];
  return {key, step, identity, narration, verdict: verdicts[key][step], scope: content.source, ...state};
}

export {fishMarketKeys};

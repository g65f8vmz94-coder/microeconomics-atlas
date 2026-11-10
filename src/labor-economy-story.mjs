import {production, labor, laborPlan, outputCapitalist, technologyImprovement} from './production-market.mjs';
import {laborEconomyContent, laborEconomyKeys} from './labor-economy-content.mjs';

const leClampStep = n => Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
const leMix = (a, b, t) => a + (b - a) * t;

const leVerdicts = {
  d126: ['同一天先分休闲与工作', '劳动进入生产函数变成商品', '老板比较产出减工资', '工人比较休闲与消费整篮', '工资同时连接成本与收入', '技术、偏好和时间组成模型'],
  d127: ['先认清l、x、a、z四个量', '第一本账核对a=1−l', '劳动a生成总产出f(a)', '第二本账核对f(a)=x+z', '两本账同时对上才可行', '资源够用后，再分别检查工人与雇主的最优选择'],
  d128: ['先从一套可行但低效的计划出发', '工人比较的是休闲加消费', '资本家比较最后拿到的z', '减少过度劳动并重新分产出', '本例两边都严格改善', '没有无损改法才叫帕累托稳定'],
  d129: ['低工资下企业劳动需求偏大', '同一工资下工人形成劳动供给', '工资变化重排企业利润差', '工人预算选择也必须重算', '供给与需求在a*=0.5碰头', 'x、z和两条守恒一起闭合'],
  q122: ['反证时固定原均衡工资', '工人不差要求消费不低于工资线', '把工人条件翻成x′≥w*a′', '可行性把资本家所得写成剩余', '两边不差会推出更高替代利润', '最大利润不可能被严格超过'],
  p2: ['新目标把选择推到保本最右端', '保本边界与劳动供给在0.5碰头', '均衡时资本家剩余等于0', '少雇一点给工人更多休闲', '维持工人效用后仍有正剩余', '均衡因此不一定帕累托稳定'],
  p3c: ['旧技术先形成基准均衡', '新技术曲线处处更高', '工人劳动仍固定在0.5', '新增边际产量推高工资', '工资账单涨得比新增产出多', '资本家利润下降、工人改善'],
  p3w: ['旧技术先形成基准均衡', '新技术曲线仍处处更高', '把投入各加一点，再比较两种技术多出的产量', '均衡点新增项的斜率为负', '休闲不变而工资消费下降', '工人变差、资本家利润上升']
};

function leLaborState(key, step) {
  const paths = key === 'd129'
    ? [0.66, 0.76, 0.88, 1.12, 1, 1]
    : [0.72, 0.82, 0.92, 1.08, 1, 1];
  return {...labor({mult: paths[step]}), kind: 'labor', focus: key, progress: step / 5};
}

function lePlanState(step) {
  const aPath = [0.45, 0.45, 0.45, 0.45, 0.5, 0.5];
  const lPath = [0.68, 0.6, 0.55, 0.55, 0.5, 0.5];
  const sharePath = [0.5, 0.5, 0.5, 0.64, 0.58, 0.58];
  const r = laborPlan({a: aPath[step], l: lPath[step], workerShare: sharePath[step]});
  return {...r, kind: 'plan', progress: step / 5};
}

function leParetoState(step) {
  const initial = {a: 0.8, l: 0.2, x: 1.6};
  initial.output = production(initial.a, 4);
  initial.z = initial.output - initial.x;
  initial.workerUtility = initial.l * initial.x;
  const alternative = {a: 0.5, l: 0.5, x: 0.8};
  alternative.output = production(alternative.a, 4);
  alternative.z = alternative.output - alternative.x;
  alternative.workerUtility = alternative.l * alternative.x;
  const progress = step < 3 ? 0 : (step - 2) / 3;
  const current = Object.fromEntries(['a', 'l', 'x', 'z', 'output', 'workerUtility'].map(k => [k, leMix(initial[k], alternative[k], progress)]));
  return {kind: 'pareto', initial, alternative, current, progress};
}

function leProofState(step) {
  const eq = labor();
  const aPrime = 0.4, lPrime = 1 - aPrime, outputPrime = production(aPrime, 4);
  const workerBudgetFloor = eq.w * aPrime;
  const feasibleProfitCeiling = outputPrime - workerBudgetFloor;
  const claimedProfit = eq.profit + [0, 0, 0, 0.04, 0.18, 0.18][step];
  return {
    kind: 'proof', eq, aPrime, lPrime, outputPrime, workerBudgetFloor,
    feasibleProfitCeiling, claimedProfit, contradiction: step >= 5
  };
}

function leOutputState(step) {
  const r = outputCapitalist({reduction: 0.2});
  return {
    ...r, kind: 'output', progress: step / 5,
    workerUtility: r.l * r.x,
    alternativeUtility: r.lAlt * r.xNeeded,
    showAlternative: step >= 3
  };
}

function leTechnologyState(key, step) {
  const kind = key === 'p3c' ? 'capital' : 'worker';
  const strength = key === 'p3c' ? 0.8 : 1;
  const r = technologyImprovement(kind, strength);
  return {...r, kind: 'technology', technologyKind: kind, progress: step / 5, showNew: step >= 1};
}

export function laborEconomyStory(key = 'd126', rawStep = 0) {
  if (!laborEconomyKeys.includes(key)) throw Error(`Unknown labor-economy story: ${key}`);
  const step = leClampStep(rawStep), content = laborEconomyContent[key];
  let state;
  if (['d126', 'd129'].includes(key)) state = leLaborState(key, step);
  else if (key === 'd127') state = lePlanState(step);
  else if (key === 'd128') state = leParetoState(step);
  else if (key === 'q122') state = leProofState(step);
  else if (key === 'p2') state = leOutputState(step);
  else state = leTechnologyState(key, step);
  const [identity, narration] = content.steps[step];
  return {
    key, step, identity, narration, verdict: leVerdicts[key][step],
    view: content.view, scope: content.source, ...state
  };
}

export {laborEconomyKeys};

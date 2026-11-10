import {serviceEconomyContent, serviceEconomyKeys} from './service-economy-content.mjs';

const clampStep = value => Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
const lerp = (a, b, t) => a + (b - a) * t;

export function serviceModel({a = 1, b = 2, z = .6, lambda = 1, mode = 'base'} = {}) {
  const waitScale = mode === 'base' ? 1 : lambda;
  const travelScale = mode === 'all' ? lambda : 1;
  const t0 = a * z, t1 = b * (1 - z);
  const cut = (travelScale + waitScale * (t1 - t0)) / (2 * travelScale);
  const eq = (travelScale + waitScale * b) / (2 * travelScale + waitScale * (a + b));
  const eqWait = [a * eq, b * (1 - eq)];
  const total = x => .5 * x * x + a * x * x + .5 * (1 - x) ** 2 + b * (1 - x) ** 2;
  const social = (1 + 2 * b) / (2 + 2 * a + 2 * b);
  return {a, b, z, lambda, mode, t0, t1, cut, eq, eqWait, total, social, eqTotal: total(eq), socialTotal: total(social)};
}

function serviceState(key, step) {
  let a = 1, b = 2, z = .6, lambda = 1, mode = 'base';
  if (key === 'd132') z = [.35, .35, .45, .52, .57, .6][step];
  if (key === 'l131') z = [.08, .22, .38, .52, .6, .6][step];
  if (key === 'q131') z = [.28, .42, .52, .58, .6, .6][step];
  if (key === 'p1a') a = lerp(1, .5, step / 5);
  if (key === 'p1c') { lambda = lerp(1, 2, step / 5); mode = 'all'; }
  if (key === 'p1d') { lambda = lerp(1, 3, step / 5); mode = 'wait'; }
  const r = serviceModel({a, b, z, lambda, mode});
  if (key === 'd131') return {...r, kind: 'service', reveal: step, chosenCut: .6};
  if (key === 'd132') return {...r, kind: 'consistency', reveal: step, consistent: Math.abs(r.cut - z) < 1e-8};
  if (key === 'l131') return {...r, kind: 'crossing', reveal: step, candidate: z};
  if (key === 'l132') return {...r, kind: 'sorting', reveal: step, x: .45, y: .2, leftAtX: .45 + .6, rightAtX: .55 + .8, leftAtY: .2 + .6, rightAtY: .8 + .8};
  if (key === 'q131') return {...r, kind: 'uniqueness', reveal: step, candidate: z, unusedBranchRejected: step >= 4, unique: step >= 5};
  if (key === 'p1a') return {...r, kind: 'comparative', reveal: step, oldEq: .6, newEq: r.eq, oldA: 1};
  if (key === 'p1b') return {...r, kind: 'comparative', reveal: step, oldEq: .5, newEq: r.eq, waitDifference: r.eqWait[1] - r.eqWait[0]};
  if (key === 'p1c' || key === 'p1d') return {...r, kind: 'scale', reveal: step, baseEq: .6, unchanged: key === 'p1c'};
  return {...r, kind: 'service', reveal: step};
}

function paretoState(key, step) {
  const base = serviceModel(), next = lerp(base.eq, base.social, step / 5);
  const witness = .61;
  const oldLoss = 1 - witness + 2 * (1 - base.eq);
  const newLoss = witness + next;
  return {
    ...base, kind: key === 'q132' ? 'proof' : 'pareto', reveal: step, next, witness,
    oldLoss, newLoss, witnessWorse: step > 0 && witness <= next && newLoss > oldLoss,
    sameFlowCase: step <= 2, increasedLeft: next > base.eq
  };
}

function socialState(step) {
  const r = serviceModel(), shown = lerp(r.eq, r.social, step / 5);
  return {...r, kind: 'social', reveal: step, shown, shownTotal: r.total(shown), sourceTypo: true};
}

function raffleState(key, step) {
  const N = 1200, v = key === 'p3b' ? 1 / 3 : .5;
  const target = key === 'p3b' ? 300 : 400;
  const guesses = key === 'p3b' ? [600, 500, 400, 340, 300, 300] : [700, 600, 500, 450, 400, 400];
  const nL = guesses[step], nH = N - nL;
  const utilityL = v / nL, utilityH = 1 / nH;
  const lStay = v / target, lDeviate = 1 / (N - target + 1);
  const hStay = 1 / (N - target), hDeviate = v / (target + 1);
  return {
    kind: 'raffle', reveal: step, N, v, nL, nH, target,
    utilityL, utilityH, lStay, lDeviate, hStay, hDeviate,
    equilibrium: step >= 4 && lStay >= lDeviate && hStay >= hDeviate
  };
}

function matchingState(key, step) {
  const a = 100, b = 60;
  let A1 = 50, B1 = 30;
  if (key === 'p4b') { A1 = Math.round(lerp(50, 20, step / 5)); B1 = .6 * A1; }
  if (key === 'p4c') { A1 = 100; B1 = 60; }
  const A = [A1, a - A1], B = [B1, b - B1];
  const probability = (own, other) => own === 0 && other === 0 ? 0 : own === 0 ? 1 : Math.min(1, other / own);
  const p = A.map((x, i) => probability(x, B[i]));
  const q = B.map((x, i) => probability(x, A[i]));
  return {
    kind: 'matching', reveal: step, a, b, A, B, p, q,
    ratio: A.map((x, i) => x ? B[i] / x : null),
    normalizedP: p[0] + p[1], normalizedQ: q[0] + q[1],
    interior: A.every(x => x > 0) && B.every(x => x > 0),
    allVenueOne: A[1] === 0 && B[1] === 0,
    sourceConflict: true
  };
}

const verdicts = {
  d131: ['先认清两端网点与居民位置', '路程只是第一笔成本', '客流会制造等待', '居民比较路程加等待', '个人很小，合起来却决定拥堵', '服务经济的对象与损失已定义'],
  d132: ['先给一组等待预期', '居民按预期选择', '选择汇总成客流', '客流生成真实等待', '预期不一致就要被否决', '个人最优与预期一致同时成立'],
  l131: ['候选分界从左端出发', '左账单严格上升', '右账单严格下降', '两个端点次序相反', '连续性给出交点', '严格单调保证交点唯一'],
  l132: ['固定同一组等待', 'x去左边至少不差', '把y放到x左边', 'y左路更短、右路更长', '弱偏好变成严格偏好', '选择只能形成左右两段'],
  q131: ['先找唯一交点', '按交点构造阈值分配', '居民逐一最优', '等待与客流一致', '空网点不可能持续', '任何均衡都回到同一z*'],
  d133: ['先记录均衡分配', '改变分界就改变两边等待', '总时间可能下降', '盯住刚被改派的居民', '他可能严格变差', '比较每个人的用时，再比较全街的总用时'],
  q132: ['比较任意另一分配', '先看客流是否改变', '客流不变时用个人最优', '客流改变时找转入者', '转入侧等待严格上升', '至少一人变差，支配不成立'],
  p1a: ['记录旧均衡', '左网点逐步提速', '旧交点处左边变便宜', '新交点只能右移', '更多居民使用左网点', '一般证明不依赖线性公式'],
  p1b: ['左技术处处更高效', '左边吸引更多客流', '不同客流不能直接代技术排序', '用边界无差异比较等待', '左等0.6，右等0.8', '结论来自效率与均衡共同作用'],
  p1c: ['写原总时间', '把两边总时间共同放大', '正比例不改变大小次序', '个人选择完全不变', '客流与真实等待不变', '均衡分界仍是0.6'],
  p1d: ['只放大等待', 'λ不能约掉', '更在意低效网点的排队', '分界逐步右移', 'z*(λ)向2/3靠近', '方向取决于技术不对称'],
  p2: ['先求个人均衡0.6', '写全体总时间', '校准右侧等待的自变量', '求总时间最小点0.625', '总量更低却有人变差', '均衡、总量最优、帕累托是三件事'],
  p3a: ['先看奖品和竞争人数', '算两张票的期望效用', '个人选择较高者', '选择汇总成真实人数', '人数预期必须实现', '有限人数还要检查单人偏离'],
  p3b: ['H奖价值是L的三倍', '候选人数向300/900移动', '两边当前效用相等', 'L持有人不愿改去H', 'H持有人不愿改去L', '300/900通过完整偏离检验'],
  p4a: ['按同一比例分到两馆', '计算A类匹配概率', '计算B类匹配概率', '两类人都跨馆无差异', '概率由实际人数生成', '任意同比例拆分都是均衡'],
  p4b: ['四类场馆人数都为正', 'A类使用两馆迫使p相等', 'B类使用两馆迫使q相等', '人数比例必须对齐', '共同比例由总人数钉住', '全部内点均衡得到刻画'],
  p4c: ['候选把全体放到场馆1', '场馆1概率由真实比例生成', '空场馆按0/0约定为0', '没人愿意单独迁入', '边界候选满足最优与一致', '同时暴露原文归一化冲突']
};

export function serviceEconomyStory(key = 'd131', rawStep = 0) {
  if (!serviceEconomyKeys.includes(key)) throw Error(`Unknown service-economy story: ${key}`);
  const step = clampStep(rawStep), content = serviceEconomyContent[key];
  let state;
  if (['d133', 'q132'].includes(key)) state = paretoState(key, step);
  else if (key === 'p2') state = socialState(step);
  else if (['p3a', 'p3b'].includes(key)) state = raffleState(key, step);
  else if (['p4a', 'p4b', 'p4c'].includes(key)) state = matchingState(key, step);
  else state = serviceState(key, step);
  const [identity, narration] = content.steps[step];
  return {key, step, identity, narration, verdict: verdicts[key][step], scope: content.source, ...state};
}

export {serviceEconomyKeys};

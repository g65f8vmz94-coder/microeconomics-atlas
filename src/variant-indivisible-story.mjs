import {basePeople, cashPeople, market, pareto} from './variants.mjs';
import {indivisibleContent, indivisibleKeys} from './variant-indivisible-content.mjs';

const clampStep = step => Math.max(0, Math.min(5, Math.round(Number(step) || 0)));
const clone = people => people.map(x => ({...x}));
const interval = people => {
  const r = market(people, 0);
  return [r.lo, r.hi];
};

const originalTie = [
  {id: '卖者S₀', v: 0, own: 1, cash: 0},
  {id: '卖者S₅', v: 5, own: 1, cash: 0},
  {id: '买者B₅', v: 5, own: 0, cash: 20},
  {id: '买者B₁₀', v: 10, own: 0, cash: 20}
];

function ladderFrame(key, step) {
  let people = clone(basePeople);
  let price = 5;
  let comparison = null;

  if (key === 'd111') price = [5, 5, 5, 5, 5, 5][step];
  if (key === 'd112') price = [5, 5, 3, 7, 6, 5][step];
  if (key === 'e111') {
    people = [
      ...Array.from({length: 14}, (_, i) => ({id: `卖者${i + 1}`, v: 0, own: 1, cash: 0})),
      ...Array.from({length: 17}, (_, i) => ({id: `买者${i + 1}`, v: 100, own: 0, cash: 100}))
    ];
    price = [0, 99, 100, 100, 101, 100][step];
  }
  if (key === 'q111') price = [0, 4, 3.5, 6.5, 5, 5][step];
  if (key === 'p1') price = 5;
  if (key === 'p2') {
    people = clone(cashPeople);
    price = [4.5, 5, 5.01, 5.5, 6, 6.01][step];
  }
  if (key === 'p3a') {
    people = clone(originalTie);
    if (step >= 2) people[1].v = [5, 5, 6, 7, 7, 7][step];
    price = step < 2 ? 5 : [5, 5, 5.5, 6, 5, 5][step];
    comparison = {before: [5, 5], after: interval(people), label: '估值上升前后价格区间'};
  }
  if (key === 'p3b') {
    people = clone(originalTie);
    if (step === 1 || step === 2) people.push({id: '新增买者B₈', v: 8, own: 0, cash: 20});
    if (step >= 3) people.push({id: '新增卖者S₁', v: 1, own: 1, cash: 0});
    const now = interval(people);
    price = (now[0] + now[1]) / 2;
    comparison = {before: [5, 5], after: now, label: step < 3 ? '增加买者' : '增加卖者'};
  }
  if (key === 'p5') {
    const c = [0, .5, 1, 2, 3, 2][step];
    people = basePeople.map(x => ({...x, rawV: x.v, v: x.v + (x.own ? c : -c)}));
    const now = interval(people);
    price = (now[0] + now[1]) / 2;
    comparison = {cost: c, before: [4, 6], after: now, label: '加入进场成本后的有效估值'};
  }

  const cashBound = key === 'p2';
  const result = market(people, price, cashBound);
  return {people, price, result, interval: key === 'p2' ? [5, 6] : interval(people), comparison, cashBound};
}

function specialFrame(key, step) {
  if (key === 'q112') {
    const cash = [2, 2, 2, 6, 6, 6][step];
    const p = pareto(cash);
    return {
      people: [
        {id: '老王（当前持有）', v: 4, own: 1, cash: 0},
        {id: '小李（未持有）', v: 8, own: 0, cash}
      ],
      price: p.offer || 4,
      interval: [Math.min(8, cash), 4],
      transfer: {from: '小李', to: '老王', cash, offer: p.offer, possible: p.possible},
      result: {equilibrium: false, allocation: [], s: 1}
    };
  }
  if (key === 'q113') {
    const buyerPays = [8, 8, 8, 6, 6, 6][step];
    const sellerGets = [4, 4, 4, 6, 6, 6][step];
    return {
      people: clone(originalTie), price: 6, interval: [5, 5],
      ledger: {buyerPays, sellerGets, blockingPrice: buyerPays > sellerGets ? 6 : null, common: buyerPays === sellerGets},
      result: {equilibrium: buyerPays === sellerGets, allocation: [], s: 2}
    };
  }
  if (key === 'p4') {
    const deletedUnique = step === 5;
    const people = deletedUnique
      ? [{id: '卖者S₀', v: 0, own: 1, cash: 0}, {id: '买者B₁₀', v: 10, own: 0, cash: 20}]
      : clone(originalTie);
    return {
      people, price: deletedUnique ? 8 : 5, interval: interval(people),
      manipulation: {
        originalUnique: !deletedUnique,
        trueGain: deletedUnique ? 7 : 0,
        note: deletedUnique ? '删去唯一性后的价格选择对照' : '原价格唯一：三类真实估值均不能严格获利'
      },
      result: market(people, deletedUnique ? 8 : 5)
    };
  }
  if (key === 'p6') {
    const after = step >= 2;
    const payment = step >= 1 ? 1.5 : 0;
    const people = after
      ? [{id: '卖者S₀', v: 0, own: 1, cash: 0}, {id: '买者A₁₀', v: 10, own: 0, cash: 20}]
      : [{id: '卖者S₀', v: 0, own: 1, cash: 0}, {id: '买者B₉', v: 9, own: 0, cash: 20}, {id: '买者A₁₀', v: 10, own: 0, cash: 20}];
    const price = after ? 1 : 9;
    return {
      people, price, interval: interval(people),
      exit: {after, payment, beforeSurplus: 1, afterSurplus: 10 - 1 - payment},
      result: market(people, price)
    };
  }
  throw Error(`No special story for ${key}`);
}

export function indivisibleStory(key = 'd111', rawStep = 0) {
  if (!indivisibleKeys.includes(key)) throw Error(`Unknown indivisible-good story: ${key}`);
  const step = clampStep(rawStep);
  const content = indivisibleContent[key];
  const state = ['q112', 'q113', 'p4', 'p6'].includes(key) ? specialFrame(key, step) : ladderFrame(key, step);
  const [phase, narration] = content.steps[step];
  const intervalText = key === 'p2' ? '(5, 6]' : state.interval && state.interval[0] <= state.interval[1]
    ? `[${state.interval[0]}, ${state.interval[1]}]`
    : '不直接套普通排序区间';
  const verdicts = {
    d111: ['物品只能完整地落在一人手里', '钱仍然可以连续转移', '估值是个人最高愿付价', '初始身份不决定最终选择', '现金充足让“愿买”变成“买得起”', '记住：物品离散、货币连续'],
    d112: ['先给所有人同一个价格', '估值高于价格者必须持有', '低估值者必须退出', '等于价格者可用于配平', '买卖双方的钱一增一减', '必须人数≤供给≤愿意人数'],
    e111: ['供给始终只有14张', '99元时17人都抢，无法出清', '100元时17人全部无差异', '从17人中任选14人即可', '101元时无人愿买', '唯一价100，但配置不唯一'],
    q111: ['先排序并标出供给s', '门槛落在第s与第s+1人之间', '价格太低会多出至少一位抢购者', '价格太高会少一位愿意持有者', '闭区间内都能配平', '端点相等才是唯一价'],
    q112: ['高估值不自动等于可改进', '持有人至少要得到超过4元', '只有2元时补偿做不到', '有6元时可取中间支付5元', '现金进入稳定性判别式', '竞争均衡不会留下可行双赢'],
    q113: ['先只看真正换手的人', '记录每位买者付款和卖者收入', '8元付款与4元收入之间可重谈', '核心禁止这对人组成阻挡联盟', '总账相等迫使全部金额一致', '共同金额p支撑竞争均衡'],
    p1: ['效用总和分成钱与物品价值', '全社会货币总额是常数', '只需比较物品落在谁手里', '均衡筛出最高的s个估值', '高低错配可直接提高总和', '所以均衡最大化总效用'],
    p2: ['估值最高者未必都付得起', '价格5元时三人抢两件', '刚超过5元，3号因现金不足退出', '5到6之间恰好两人持有', '6元端点可由无差异者配平', '超过6元只剩一位愿意持有'],
    p3a: ['原唯一价是重合的边界', '只允许一个估值点向上走', '顺序统计量不会向下走', '旧单点最多向上展开成区间', '新区间左端不低于旧价', '任一新均衡价都不低于p*'],
    p3b: ['原边界价格为p*', '新增买者把需求队伍往前挤', '买者进场后的区间不在p*下方', '新增卖者同时增加一件供给', '卖者进场后的区间不在p*上方', '方向是弱变化，不保证严格'],
    p4: ['唯一价意味着边界估值重合', '不跨边界的虚报不改变真实收益', '跨边界会放弃原有正剩余', '边界人原本就真实无差异', '所以原题所求严格获利不存在', '删去唯一性才有价格选择对照'],
    p5: ['卖者先扣路费，最低接受价上升', '卖者有效估值变成v+c', '买者先扣路费，最高愿付价下降', '买者有效估值变成v−c', '进场不交易还不如留家', '对有效估值重新排序即可'],
    p6: ['B在场把原价格下界托到9', 'A给B 1.5元请其退出', '退出后新区间扩大为[0,10]', '选择价格1仍能成交', 'A净收益从1升到7.5', '结论依赖明确写出的价格选择']
  };
  return {
    key, step, view: content.view, identity: phase, narration,
    verdict: verdicts[key][step],
    scope: content.source,
    ...state,
    intervalText
  };
}

export {indivisibleKeys};

// Section 10.7 Competitive equilibrium based on demand functions
// (Osborne–Rubinstein pp. 149–150 / PDF pp. 168–169)
import {nonrationalDemand} from './economy.mjs';

export const demandKeys = [
  'model107',
  'rule105',
  'highprice105',
  'lowprice105',
  'regime105'
];

const demandNear = (a, b) => Math.abs(a - b) < 1e-9;

// Evaluate Example 10.5 demands and market clearing for any (p1, alpha, beta) with p2 = 1
export function evaluateExample105(p1, alpha = 2, beta = 1) {
  if (!Number.isFinite(p1) || p1 <= 0) throw Error('Price p1 must be positive');
  if (!Number.isFinite(alpha) || alpha <= 0 || !Number.isFinite(beta) || beta <= 0) {
    throw Error('Endowments alpha and beta must be positive');
  }

  const w1 = p1 * alpha;
  const w2 = beta;

  // Individual 1: consumes only the good with higher price, or good 1 if p1 = p2 = 1
  const d1 = (p1 >= 1 - 1e-9) ? [alpha, 0] : [0, alpha * p1];
  const rule1 = (p1 > 1 + 1e-9) ? '米更贵，只买米'
    : (Math.abs(p1 - 1) <= 1e-9) ? '同价按规则只买米'
    : '豆更贵，卖米全买豆';

  // Individual 2: maximizes x1 + x2 subject to p1*x1 + x2 <= beta
  // Unique demand when p1 != 1; segment when p1 == 1 (market clearing picks [0, beta])
  const d2Unique = (p1 > 1 + 1e-9) ? [0, beta]
    : (p1 < 1 - 1e-9) ? [beta / p1, 0]
    : [0, beta];
  const d2Set = (Math.abs(p1 - 1) <= 1e-9) ? [[0, beta], [beta, 0]] : [d2Unique];
  const rule2 = (p1 > 1 + 1e-9) ? '豆更便宜，只买豆'
    : (Math.abs(p1 - 1) <= 1e-9) ? '同价无差异（出清取全留豆）'
    : '米更便宜，卖豆全买米';

  const totalDemand = [
    Number((d1[0] + d2Unique[0]).toFixed(4)),
    Number((d1[1] + d2Unique[1]).toFixed(4))
  ];
  const totalEndowment = [alpha, beta];
  const excess = [
    Number((totalDemand[0] - totalEndowment[0]).toFixed(4)),
    Number((totalDemand[1] - totalEndowment[1]).toFixed(4))
  ];
  const isEquilibrium = demandNear(excess[0], 0) && demandNear(excess[1], 0);
  const eqType = !isEquilibrium ? 'none'
    : (p1 >= 1 - 1e-9) ? 'no-trade'
    : 'swap';

  return {
    p1,
    p2: 1,
    alpha,
    beta,
    w1: Number(w1.toFixed(4)),
    w2: Number(w2.toFixed(4)),
    d1: d1.map(x => Number(x.toFixed(4))),
    d2: d2Unique.map(x => Number(x.toFixed(4))),
    d2Set,
    rule1,
    rule2,
    totalDemand,
    totalEndowment,
    excess,
    isEquilibrium,
    eqType,
    swapPrice: Number((beta / alpha).toFixed(4)),
    hasSwapEquilibrium: beta < alpha - 1e-9
  };
}

export function demandStory(key, step = 0) {
  if (!demandKeys.includes(key)) throw Error('Unknown demand story key: ' + key);
  const t = Math.max(0, Math.min(5, Math.floor(Number(step) || 0)));

  if (key === 'model107') {
    const prices = [1.4, 1.2, 0.8, 0.5, 0.5, 1.2][t];
    const ev = evaluateExample105(prices, 2, 1);
    return {
      key,
      step: t,
      view: 'ledger',
      ev,
      identity: t <= 1 ? '直接按购买规则给定需求函数'
        : t <= 3 ? '检验各人需求满足预算与规则'
        : '总需求等于总家底即竞争均衡',
      verdict: t === 0 ? '甲按“只买贵货”规则行事，乙按“只买便宜货”行事'
        : t === 1 ? '米价1.2元时，甲守住2千克米，乙守住1千克豆，直接出清'
        : t === 2 ? '米价0.8元时，甲要1.6千克豆，乙要1.25千克米，供需不匹配'
        : t === 3 ? '米价0.5元时，甲要1千克豆，乙要2千克米，两人彻底互换出清'
        : t === 4 ? '即使甲的规则不能由单调偏好导出，均衡定义依然完全适用'
        : '结论：需求函数经济只要求“各自符合需求规则”加“全市场出清”',
      scope: '§10.7第1—2段与例10.5，印刷149—150页／PDF168—169页。'
    };
  }

  if (key === 'rule105') {
    const prices = [1.5, 1.0, 0.6, 0.5, 0.5, 1.0][t];
    const ev = evaluateExample105(prices, 2, 1);
    return {
      key,
      step: t,
      view: 'rules',
      ev,
      identity: t <= 2 ? '甲的规则：只买更贵商品（同价买米）'
        : '为什么甲的需求无法由单调偏好理性化',
      verdict: t === 0 ? '米价1.5元高于豆价1元：甲把全部财富用来拿米（2千克）'
        : t === 1 ? '米价1元等于豆价1元：按同价破平规则，甲仍然只拿米（2千克）'
        : t === 2 ? '米价0.6元低于豆价1元：豆更贵，甲卖掉2千克米换回1.2千克豆'
        : t === 3 ? '米价0.5元时：甲选（0，1）且买得起（2，0），只能推出前者不差于后者'
        : t === 4 ? '米价1元时又有（2，0）不差于（0，1.5），而单调性给出（0，1.5）严格优于（0，1），传递性矛盾'
        : '甲追逐高价标签而非实物数量；乙则最大化米加豆总量',
      scope: '例10.5个体需求设定，印刷149页／PDF168页；非单调理性化检验为教学展开。'
    };
  }

  if (key === 'highprice105') {
    const prices = [1.8, 1.5, 1.2, 1.0, 1.0, 1.4][t];
    const ev = evaluateExample105(prices, 2, 1);
    return {
      key,
      step: t,
      view: 'ledger',
      ev,
      identity: '情况一（米价不低于1元）：无交易均衡',
      verdict: t === 0 ? '米价1.8元：甲嫌豆便宜只拿米2，乙嫌米贵只拿豆1，刚好出清'
        : t === 1 ? '米价1.5元：甲仍拿米2，乙仍拿豆1，总需求（2，1）等于总家底'
        : t === 2 ? '米价1.2元：无论米价高出多少，两人都不交易，原地出清'
        : t === 3 ? '平价边界米价1.0元：甲选米2，乙在预算线上无差异，挑（0，1）出清'
        : t === 4 ? '米价1.0元出清筛选：为配合甲拿走全部2千克米，乙取最优束（0，1）'
        : '结论：凡满足米价不低于豆价的价格体系，均支持原家底为竞争均衡',
      scope: '例10.5第一组均衡（p₁ ≥ p₂ = 1），印刷149—150页／PDF168—169页。'
    };
  }

  if (key === 'lowprice105') {
    const prices = [0.8, 0.6, 0.5, 0.4, 0.5, 0.5][t];
    const ev = evaluateExample105(prices, 2, 1);
    return {
      key,
      step: t,
      view: 'ledger',
      ev,
      identity: '情况二（米价低于1元且乙少于甲）：互换均衡',
      verdict: t === 0 ? '米价0.8元：甲全买豆要1.6千克（超总豆1），乙全买米要1.25千克（少于2）'
        : t === 1 ? '米价降到0.6元：甲要豆1.2千克，乙要米1.67千克，供需差距缩小'
        : t === 2 ? '米价恰为0.5元（即乙家底除以甲家底）：甲要豆1千克，乙要米2千克！'
        : t === 3 ? '若米价过低（0.4元）：甲只要0.8千克豆，乙却要2.5千克米，米不够分'
        : t === 4 ? '唯一低价均衡：米价0.5元、豆价1元，甲得（0，1）、乙得（2，0）'
        : '两人在该价格下把各自的原家底彻彻底底对调，双双实现市场出清',
      scope: '例10.5第二组均衡（p₁ = β/α < 1），印刷150页／PDF169页。'
    };
  }

  // regime105: Compare beta < alpha vs beta = alpha vs beta > alpha
  const configs = [
    {alpha: 2, beta: 1, p1: 0.5, label: '情形甲：乙豆1小于甲米2（0.5元出清）'},
    {alpha: 2, beta: 2, p1: 0.8, label: '情形乙：乙豆2等于甲米2（低价区米不够）'},
    {alpha: 2, beta: 2, p1: 1.0, label: '情形乙：比值1元已归入高价无交易均衡'},
    {alpha: 1, beta: 2, p1: 0.8, label: '情形丙：乙豆2大于甲米1（低价区缺米）'},
    {alpha: 1, beta: 2, p1: 2.0, label: '情形丙：公式比值2元在低价区无解'},
    {alpha: 2, beta: 1, p1: 0.5, label: '总结：仅当乙少于甲时才有第二类互换均衡'}
  ];
  const cfg = configs[t];
  const ev = evaluateExample105(cfg.p1, cfg.alpha, cfg.beta);
  return {
    key,
    step: t,
    view: 'regime',
    cfg,
    ev,
    identity: cfg.label,
    verdict: t === 0 ? '当乙豆1小于甲米2时，比值0.5小于1，低价互换均衡真实存在'
      : t === 1 ? '当乙豆2等于甲米2时，任意低于1元的米价都会让乙索要超过2千克米'
      : t === 2 ? '公式比值2除以2等于1元，恰在平价边界，此时甲改买米，不发生互换'
      : t === 3 ? '当乙豆2大于甲米1时，在米价0.8元下乙要2.5千克米，远超总米量1千克'
      : t === 4 ? '公式比值2除以1等于2元，违反米价小于1元的前提，故低价区无均衡'
      : '完整结论：高价无交易均衡恒存在；低价互换均衡当且仅当乙家底小于甲家底时存在',
    scope: '例10.5参数条件（β < α 与 β ≥ α 对比），印刷150页／PDF169页。'
  };
}

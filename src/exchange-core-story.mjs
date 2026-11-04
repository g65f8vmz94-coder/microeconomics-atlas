// Section 10.6 The Core (Osborne–Rubinstein pp. 148–149 / PDF 167–168)
// Models, evaluations, and 6-step frames for core definitions, Example 10.4,
// exhaustive coalition analysis, and Proposition 10.5 competitive equilibrium proof.
import {fourPersonCore, spendingContradiction} from './economy.mjs';

export const coreKeys = [
  'define106',
  'property106',
  'example104',
  'blocking104',
  'coalitions104',
  'coreproof105'
];

const coreNear = (a, b) => Math.abs(a - b) < 1e-9;

// Utilities for Example 10.4
// Type 1: min(x1, x2), Type 2: x1 + x2
export function coreUtility(type, bundle) {
  return type === 1 ? Math.min(bundle[0], bundle[1]) : (bundle[0] + bundle[1]);
}

// 15 Non-empty subsets of 4 agents: 0:甲(1A), 1:乙(1B), 2:丙(2A), 3:丁(2B)
export const allCoalitions = (() => {
  const list = [];
  for (let mask = 1; mask < 16; mask++) {
    const members = [];
    for (let i = 0; i < 4; i++) if (mask & (1 << i)) members.push(i);
    list.push(members);
  }
  return list;
})();

// Detailed analysis of whether coalition S can block candidate allocation in Example 10.4
// initial: 1A:(1,0), 1B:(1,0), 2A:(0,1), 2B:(0,1)
// candidate a: 1A:(t,t), 1B:(t,t), 2A:(1-t,1-t), 2B:(1-t,1-t) (default t=0.1)
export function evaluateCoalitionBlock(members, t = 0.1) {
  const initial = [[1, 0], [1, 0], [0, 1], [0, 1]];
  const types = [1, 1, 2, 2];
  const baseU = types.map((ty, i) => coreUtility(ty, i < 2 ? [t, t] : [1 - t, 1 - t]));

  const totalE = [0, 0];
  for (const m of members) {
    totalE[0] += initial[m][0];
    totalE[1] += initial[m][1];
  }

  const n1 = members.filter(m => m < 2).length;
  const n2 = members.filter(m => m >= 2).length;
  const totalGoodsAvailable = totalE[0] + totalE[1];

  // A blocking proposal must first give every type-1 member more than (t,t).
  // The remaining physical goods must then give every type-2 member total
  // consumption strictly above 2(1-t).  These two resource inequalities are
  // evaluated from the coalition's actual type counts instead of hard-coding
  // the two blocking coalitions from Example 10.4.
  const hasComplementaryTypes = n1 > 0 && n2 > 0;
  const beanRoomAfterType1 = n2 - t * n1;
  const scalarSlack = totalGoodsAvailable - (2 * t * n1 + 2 * (1 - t) * n2);
  const canBlock = hasComplementaryTypes && beanRoomAfterType1 > 1e-9 && scalarSlack > 1e-9;
  let sampleProposal = null;

  if (canBlock && n1 === 2 && n2 === 1) {
    const upperR = (1 + 2 * t) / 4;
    const r = (t + upperR) / 2;
    sampleProposal = members.map(m => m < 2 ? [r, r] : [2 - 2 * r, 1 - 2 * r]);
  }

  const minGoodsNeeded = Number((n1 * 2 * t + n2 * 2 * (1 - t)).toFixed(4));

  return {
    members,
    n1,
    n2,
    totalEndowment: totalE,
    totalGoodsAvailable,
    minGoodsNeeded,
    baseUtilities: members.map(m => baseU[m]),
    beanRoomAfterType1,
    scalarSlack,
    canBlock,
    sampleProposal,
    reason: (n1 === 0) ? '缺少一类人，没有米，无法阻挡'
          : (n2 === 0) ? '缺少二类人，没有豆，一类人评分为零'
          : (n1 === 1 && n2 === 1) ? '一米一豆共2千克，不够两人同时超原评分'
          : (n1 === 1 && n2 === 2) ? '自备共3千克，不够三人保底所需的3.8千克'
          : (n1 === 2 && n2 === 1) ? '自备米2豆1共3千克，三人保底仅需2.2千克，可阻挡'
          : '全村共4千克，四人保底恰需4千克，无法再超额'
  };
}

// Generate story state for the 6 core scenarios
export function coreStory(key, step = 0) {
  if (!coreKeys.includes(key)) throw Error('Unknown core story key: ' + key);
  const t = Math.max(0, Math.min(5, Math.floor(Number(step) || 0)));

  const agents = ['甲（一类）', '乙（一类）', '丙（二类）', '丁（二类）'];
  const shortAgents = ['甲', '乙', '丙', '丁'];
  const types = [1, 1, 2, 2];

  const frame = {
    key,
    step: t,
    agents,
    shortAgents,
    types,
    view: 'coalition',
    identity: '核心与阻挡联盟分析',
    scope: 'Osborne–Rubinstein §10.6，印刷148—149页／PDF167—168页。'
  };

  if (key === 'define106') {
    const endowments = [[1, 0], [1, 0], [0, 1], [0, 1]];
    const candidate = [[0.1, 0.1], [0.1, 0.1], [0.9, 0.9], [0.9, 0.9]];
    const proposal = [[0.2, 0.2], [0.2, 0.2], [1.6, 0.6], [0, 1]];
    const current = t === 0 ? endowments : (t >= 3 ? proposal : candidate);
    const inS = t >= 2 ? [true, true, true, false] : [true, true, true, true];
    const ledgerEndowment = t >= 2 ? [2, 1] : [2, 2];
    const ledgerUsed = t === 0 ? [2, 2]
      : t === 1 ? [2, 2]
      : t === 2 ? [1.1, 1.1]
      : [2, 1];

    Object.assign(frame, {
      view: 'coalition',
      endowments,
      candidate,
      proposal,
      current,
      inS,
      coalition: t >= 2 ? [0, 1, 2] : [0, 1, 2, 3],
      ledgerTitle: t >= 2 ? '三人联盟（甲、乙、丙）自备资源账' : '全村四户总资源账',
      ledgerEndowment,
      ledgerUsed,
      feasible: true,
      blocking: t >= 4,
      uInit: endowments.map((b, i) => coreUtility(types[i], b)),
      uCand: candidate.map((b, i) => coreUtility(types[i], b)),
      uCur: current.map((b, i) => coreUtility(types[i], b)),
      verdict: t === 0 ? '四户各自带米或豆进村，尚未开始全村分配'
        : t === 1 ? '候选方案分尽全村米2豆2，每户都比原家底更好'
        : t === 2 ? '甲乙丙组团清点家底：自带米2豆1，在候选方案仅得米1.1豆1.1'
        : t === 3 ? '三人关门重分自带的米2豆1，不碰丁的1千克豆'
        : t === 4 ? '甲乙评分升至0.2，丙升至2.2，组内三人全部严格改善'
        : '存在自给自足且全员严格改善的联盟，候选方案不在核心',
      identity: t <= 1 ? '全村四户与候选分配' : t === 2 ? '选出三人联盟并清点自带家底' : t === 3 ? '联盟内部重分自有物资' : '组内全员严格改善与阻挡成立',
      scope: '定义10.5，印刷148页／PDF167页；四户米豆情境为自主教学设计。'
    });
  } else if (key === 'property106') {
    const isEqual = t <= 2;
    const endowments = isEqual
      ? [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]]
      : [[1.7, 1.7], [0.1, 0.1], [0.1, 0.1], [0.1, 0.1]];
    const scheme = [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]];
    // At step 1, test a hypothetical strict improvement for 3 agents [0.6,0.6] each (needs 1.8 > 1.5)
    // At step 4-5, agent 0 blocks alone by keeping own endowment [1.7, 1.7]
    const current = t === 0 ? scheme
      : t === 1 ? [[0.6, 0.6], [0.6, 0.6], [0.6, 0.6], [0.5, 0.5]]
      : t === 2 ? scheme
      : t === 3 ? scheme
      : [[1.7, 1.7], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]];
    const propTypes = [1, 1, 1, 1];
    Object.assign(frame, {
      view: 'property',
      caseType: isEqual ? 'equal' : 'unequal',
      endowments,
      scheme,
      current,
      propTypes,
      uEndow: endowments.map(b => Math.min(b[0], b[1])),
      uScheme: scheme.map(b => Math.min(b[0], b[1])),
      uCur: current.map(b => Math.min(b[0], b[1])),
      ledgerTitle: isEqual ? '情况一：四户家底均等（各0.5）' : '情况二：甲独占家底（1.7），余户各0.1',
      coalitionEndow: isEqual ? (t === 1 ? [1.5, 1.5] : [2, 2]) : [1.7, 1.7],
      coalitionNeed: isEqual ? (t === 1 ? [1.8, 1.8] : [2, 2]) : [0.5, 0.5],
      verdict: t === 0 ? '情况一：每户原家底各0.5，候选方案也各分0.5'
        : t === 1 ? '若任意三户想升到0.6，需米豆各1.8，超出自带的1.5'
        : t === 2 ? '均等家底下无人能退群改善，均分方案稳居核心'
        : t === 3 ? '情况二：总资源仍为米2豆2，但甲自带1.7、余户各0.1'
        : t === 4 ? '甲单人退群保留1.7，远超候选分配的0.5，单人阻挡成立'
        : '帕累托稳定只看总资源，核心则由初始产权深刻决定',
      identity: isEqual ? '平分家底下的核心检验' : '不均家底下的单人阻挡',
      scope: '印刷148页第3段注释／PDF167页；均分与极不均对比数值为自主设计。'
    });
  } else if (key === 'example104') {
    const initial = [[1, 0], [1, 0], [0, 1], [0, 1]];
    const allocation = [[0.1, 0.1], [0.1, 0.1], [0.9, 0.9], [0.9, 0.9]];
    const testAlloc = [[0.2, 0.2], [0.1, 0.1], [0.9, 0.9], [0.9, 0.9]];
    const current = t === 0 ? initial : (t === 4 ? testAlloc : allocation);
    const uInit = [0, 0, 1, 1];
    const uCand = [0.1, 0.1, 1.8, 1.8];
    const uCur = current.map((b, i) => coreUtility(types[i], b));
    const goodsSum = current.map(b => Number((b[0] + b[1]).toFixed(2)));
    const totalGoods = Number(goodsSum.reduce((a, b) => a + b, 0).toFixed(2));
    Object.assign(frame, {
      view: 'pareto',
      initial,
      allocation,
      current,
      uInit,
      uCand,
      uCur,
      minGoodsNeeded: [0.2, 0.2, 1.8, 1.8],
      goodsSum,
      totalResources: [2, 2],
      totalGoods,
      feasible: totalGoods <= 4.0001,
      verdict: t === 0 ? '初始家底：甲乙各握1千克米评分为0，丙丁各握1千克豆评分为1'
        : t === 1 ? '候选分配：甲乙各得0.1，丙丁各得1.8，四户全部优于原家底'
        : t === 2 ? '全村米分出2千克、豆分出2千克，总物资4千克恰好分尽'
        : t === 3 ? '保底门槛：甲乙各需米豆共0.2，丙丁各需共1.8，合计至少4千克'
        : t === 4 ? '若让甲升到0.2且余户不降，全村需4.2千克，超出总资源4千克'
        : '全社会重分无法让任何人再改善：候选方案确属帕累托稳定',
      identity: t <= 1 ? '原家底与候选方案对比' : t <= 3 ? '全村资源守恒与保底物资门槛' : '物资总额封顶证明帕累托稳定',
      scope: '例10.4前半部分，印刷148页／PDF167页。'
    });
  } else if (key === 'blocking104') {
    const initial = [[1, 0], [1, 0], [0, 1], [0, 1]];
    const candidate = [[0.1, 0.1], [0.1, 0.1], [0.9, 0.9], [0.9, 0.9]];
    const stepProposals = [
      candidate,
      [[1, 0], [1, 0], [0, 1], [0, 1]],
      [[0.15, 0.15], [0.15, 0.15], [1.7, 0.7], [0, 1]],
      [[0.2, 0.2], [0.2, 0.2], [1.6, 0.6], [0, 1]],
      [[0.2, 0.2], [0.2, 0.2], [1.6, 0.6], [0, 1]],
      [[0.2, 0.2], [0.2, 0.2], [1.6, 0.6], [0, 1]]
    ];
    const current = stepProposals[t];
    const coalitionUsed = [
      Number((current[0][0] + current[1][0] + current[2][0]).toFixed(2)),
      Number((current[0][1] + current[1][1] + current[2][1]).toFixed(2))
    ];
    Object.assign(frame, {
      view: 'coalition',
      endowments: initial,
      candidate,
      proposal: [[0.2, 0.2], [0.2, 0.2], [1.6, 0.6], [0, 1]],
      current,
      inS: [true, true, true, false],
      coalition: [0, 1, 2],
      members: [0, 1, 2],
      excluded: [3],
      coalitionE: [2, 1],
      candU: [0.1, 0.1, 1.8],
      newU: [0.2, 0.2, 2.2],
      gains: [0.1, 0.1, 0.4],
      uInit: [0, 0, 1, 1],
      uCand: [0.1, 0.1, 1.8, 1.8],
      uCur: current.map((b, i) => coreUtility(types[i], b)),
      ledgerTitle: '三人联盟（甲、乙、丙）自备米2千克、豆1千克',
      ledgerEndowment: [2, 1],
      ledgerUsed: coalitionUsed,
      feasible: true,
      blocking: t >= 2,
      verdict: t === 0 ? '在全村方案中，甲乙丙三户合计只拿到米1.1千克、豆1.1千克'
        : t === 1 ? '三人退群把丁留在组外，自己凑齐原家底：米2千克、豆1千克'
        : t === 2 ? '试分方案一：甲乙各拿0.15，丙拿米1.7豆0.7，三人评分均超原方案'
        : t === 3 ? '原书标准方案：甲乙各拿米0.2豆0.2，丙拿米1.6豆0.6'
        : t === 4 ? '核对资源：米0.2加0.2加1.6等于2，豆0.2加0.2加0.6等于1'
        : '甲乙评分由0.1升至0.2，丙由1.8升至2.2，三人联盟成功阻挡',
      identity: t <= 1 ? '确定三人联盟与自带家底' : t <= 3 ? '构造三人内部重分方案' : '核对自给自足与全员严格改善',
      scope: '例10.4后半部分阻挡构造，印刷148—149页／PDF167—168页。'
    });
  } else if (key === 'coalitions104') {
    const groups = [
      {title: '第一类：单人组（4个）', members: '甲、乙、丙、丁各自单干', endow: [1, 0], avail: 1.0, need: 1.8, can: false, detail: '单干评分0或1，低于候选0.1或1.8'},
      {title: '第二类：同类双人组（2个）', members: '甲乙合组，或丙丁合组', endow: [0, 2], avail: 2.0, need: 3.6, can: false, detail: '甲乙无豆得0；丙丁共2千克不足3.6'},
      {title: '第三类：一单一双双人组（4个）', members: '甲丙、甲丁、乙丙、乙丁', endow: [1, 1], avail: 2.0, need: 2.0, can: false, detail: '共2千克，一类超0.2则二类不足1.8'},
      {title: '第四类：一单两双三人组（2个）', members: '甲丙丁，或乙丙丁', endow: [1, 2], avail: 3.0, need: 3.8, can: false, detail: '共3千克，保底需3.8千克，严重不够'},
      {title: '第五类：全员四人大联盟（1个）', members: '甲乙丙丁全村四户', endow: [2, 2], avail: 4.0, need: 4.0, can: false, detail: '共4千克，保底恰需4.0千克，无法超额'},
      {title: '第六类：两单一双三人组（2个）', members: '甲乙丙，或甲乙丁', endow: [2, 1], avail: 3.0, need: 2.2, can: true, detail: '共3千克，保底仅需2.2千克，成功阻挡'}
    ];
    const active = groups[t];
    Object.assign(frame, {
      view: 'coalitions',
      stage: t,
      groups,
      activeGroup: active,
      activeCoalitions: (t === 0) ? [[0], [1], [2], [3]]
        : (t === 1) ? [[0, 1], [2, 3]]
        : (t === 2) ? [[0, 2], [0, 3], [1, 2], [1, 3]]
        : (t === 3) ? [[0, 2, 3], [1, 2, 3]]
        : (t === 4) ? [[0, 1, 2, 3]]
        : [[0, 1, 2], [0, 1, 3]],
      identity: '15种非空联盟分类排查：自备物资与保底需求对比',
      scope: '例10.4全部15个非空子集的完备排查，自主深化推导。'
    });
  } else {
    // coreproof105: Proposition 10.5 proof with concrete budget-contradiction ledger
    const wealth = [1.0, 1.0, 1.0];
    const stepSpending = [
      [1.0, 1.0, 1.0],
      [1.2, 1.2, 1.2],
      [1.2, 1.2, 1.2],
      [1.2, 1.2, 1.2],
      [1.2, 1.2, 1.2],
      [1.0, 1.0, 1.0]
    ][t];
    const totalWealth = 3.0;
    const totalSpending = Number(stepSpending.reduce((a, b) => a + b, 0).toFixed(2));
    Object.assign(frame, {
      view: 'proof',
      prices: [1, 1],
      eqAllocation: [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]],
      endowments: [[1, 0], [1, 0], [0, 1], [0, 1]],
      wealth,
      stepSpending,
      totalWealth,
      totalSpending,
      contradiction: t >= 1 && t <= 4,
      verdict: t === 0 ? '均衡价下每户原家底值1元，各自在预算内选出最优篮子（各花1元）'
        : t === 1 ? '反设甲乙丙联盟能全员严格改善，提议一套让三人更满意的新篮子'
        : t === 2 ? '由个人最优性：比均衡最优还好的篮子必然买不起，每人支出必大于1元'
        : t === 3 ? '把组内三人支出相加：联盟新方案总支出3.6元，严格大于原财富总和3元'
        : t === 4 ? '但联盟只能分自带家底（米2豆1），按同价算总价值必等于3元，直接矛盾'
        : '严格超支与实物守恒矛盾，任何联盟都无法阻挡竞争均衡，命题10.5得证',
      identity: '命题10.5证明：预算账本否决任何阻挡',
      scope: '命题10.5及其证明，印刷149页／PDF168页。'
    });
  }

  return frame;
}

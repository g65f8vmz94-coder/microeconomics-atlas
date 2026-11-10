// 10.9 Edgeworth Box Story Model (埃奇沃思盒)
// Osborne-Rubinstein Models in Microeconomic Theory Section 10.9 (pp. 150-152)

export const edgeworthKeys = [
  'boxconstruction',
  'budgetclear',
  'disequilibrium',
  'contractcurve',
  'corelens'
];

export const edgeworthNames = {
  boxconstruction: '两图合璧：埃奇沃思盒的构造与双重坐标系',
  budgetclear: '一条预算线与两个切点：竞争均衡何时达成',
  disequilibrium: '错位与张力：非均衡价格下的超额供求',
  contractcurve: '背靠背相切：帕累托稳定集合与契约线',
  corelens: '禀赋透镜截出核心：从契约线到核心红线'
};

export const BOX_TOTAL = { omega1: 10, omega2: 10 };
export const ENDOWMENT = { e1: [8, 2], e2: [2, 8] };

export function evaluateEdgeworth(p1 = 1.0, p2 = 1.0) {
  const pRatio = p1 / p2;
  const w1 = p1 * ENDOWMENT.e1[0] + p2 * ENDOWMENT.e1[1]; // 8 p1 + 2 p2
  const w2 = p1 * ENDOWMENT.e2[0] + p2 * ENDOWMENT.e2[1]; // 2 p1 + 8 p2

  // Cobb-Douglas u1 = x1 x2, u2 = y1 y2
  const x1 = w1 / (2 * p1);
  const x2 = w1 / (2 * p2);

  const y1 = w2 / (2 * p1);
  const y2 = w2 / (2 * p2);

  // 2's demand in Box Coordinates (measured from O1 at bottom-left)
  const d2InBox = [BOX_TOTAL.omega1 - y1, BOX_TOTAL.omega2 - y2];

  const totalDemand = [x1 + y1, x2 + y2];
  const excessDemand = [totalDemand[0] - BOX_TOTAL.omega1, totalDemand[1] - BOX_TOTAL.omega2];
  const dist = Math.hypot(x1 - d2InBox[0], x2 - d2InBox[1]);

  const u1 = x1 * x2;
  const u2 = y1 * y2;
  const resU1 = ENDOWMENT.e1[0] * ENDOWMENT.e1[1]; // 16
  const resU2 = ENDOWMENT.e2[0] * ENDOWMENT.e2[1]; // 16

  const isEquilibrium = Math.abs(pRatio - 1.0) < 1e-4;

  return {
    p: [p1, p2],
    pRatio,
    w1,
    w2,
    a1: [x1, x2],
    a2: [y1, y2],
    d2InBox,
    totalDemand,
    excessDemand,
    dist,
    u1,
    u2,
    resU1,
    resU2,
    isEquilibrium
  };
}

export function edgeworthStory(key = 'boxconstruction', stepIndex = 0, state = {}) {
  const k = edgeworthKeys.includes(key) ? key : 'boxconstruction';
  const priceRatio = typeof state.priceRatio === 'number'
    ? state.priceRatio
    : (k === 'disequilibrium' ? 2.0 : 1.0);

  const ev = evaluateEdgeworth(priceRatio, 1.0);

  const frameConfigs = {
    boxconstruction: [
      {
        step: 0,
        title: '传统视角：两个孤立直角坐标系',
        desc: '左边是参与人1（甲）的标准坐标系（原点在左下角），右边是参与人2（乙）的标准坐标系。各自度量拥有的大米和大豆。',
        focus: 'isolated',
        rotation: 0,
        boxCombined: false,
        pointCoord: [8, 2],
        formula: 'e(1)=(8,2), \\quad e(2)=(2,8)'
      },
      {
        step: 1,
        title: '几何翻转：参与人2视角旋转180度',
        desc: '将参与人2的坐标系旋转180度，使其原点移至右上角。此时大米坐标水平向左递增，大豆坐标垂直向下递增。',
        focus: 'rotate',
        rotation: 180,
        boxCombined: false,
        pointCoord: [8, 2],
        formula: 'O_2 \\text{ 旋转 180 度，对角呼应}'
      },
      {
        step: 2,
        title: '两图合璧：拼合为长宽封闭矩形盒',
        desc: '将两套坐标系紧密拼合，长为全村大米总量10千克，高为大豆总量10千克。全村总资源成为盒子的天然几何边界。',
        focus: 'combine',
        rotation: 180,
        boxCombined: true,
        pointCoord: [8, 2],
        formula: '\\omega_1 = e_1(1)+e_1(2)=10, \\quad \\omega_2 = e_2(1)+e_2(2)=10'
      },
      {
        step: 3,
        title: '一石二鸟：盒内任意点同时表示双人配置',
        desc: '盒内任意点 P(x1, x2)，从左下角看代表甲消费 (x1, x2)；从右上角倒过来看代表乙消费 (10-x1, 10-x2)。物质守恒天然满足！',
        focus: 'dualview',
        rotation: 180,
        boxCombined: true,
        pointCoord: [6, 4],
        formula: 'a_1(1)+a_1(2)=\\omega_1, \\quad a_2(1)+a_2(2)=\\omega_2'
      },
      {
        step: 4,
        title: '绿色圆点：初始禀赋点在盒中的位置',
        desc: '在盒中标注初始禀赋点 e。从甲原点看是 (8, 2)，从乙原点倒看正好是 (2, 8)。绿色圆点代表没有任何交易时的原点家底。',
        focus: 'endowment',
        rotation: 180,
        boxCombined: true,
        pointCoord: [8, 2],
        formula: 'e = (8, 2) \\iff (10-8, 10-2) = (2, 8)'
      },
      {
        step: 5,
        title: '坐标联动核算：埃奇沃思盒的读数心法',
        desc: '掌握“从左下往右上读甲，从右上往左下读乙”的法则。无论点怎么移动，两人所得相加恒等于全村总和。',
        focus: 'summary',
        rotation: 180,
        boxCombined: true,
        pointCoord: [5, 5],
        formula: '\\forall P \\in \\text{Box}, \\quad a(1) + a(2) = \\omega'
      }
    ],

    budgetclear: [
      {
        step: 0,
        title: '公共预算线：必经禀赋点且斜率为价格比',
        desc: '在给定价格比 p1/p2 = 1 时，穿过初始禀赋点 e(8,2) 画出公共预算线，斜率为 -1。该线上所有组合的总花费均等于各自家底身价。',
        focus: 'budgetline',
        pRatio: 1.0,
        showTangency1: false,
        showTangency2: false,
        formula: 'p_1 x_1 + p_2 x_2 = p_1 e_1(1) + p_2 e_2(1) = 10'
      },
      {
        step: 1,
        title: '甲的最优决策：无差异曲线切于预算线',
        desc: '在预算线上，甲沿着价格线挑选效用最大的篮子。当无差异曲线与预算线在中心点 (5,5) 相切时，MRS1 = p1/p2 = 1。',
        focus: 'tangency1',
        pRatio: 1.0,
        showTangency1: true,
        showTangency2: false,
        formula: 'MRS_1 = \\frac{x_2}{x_1} = 1 = \\frac{p_1}{p_2} \\implies x^*(1) = (5, 5)'
      },
      {
        step: 2,
        title: '乙的最优决策：从右上角倒看的切点',
        desc: '乙在同一条预算线上，从右上角 O2 出发最大化自己的效用。乙的凸向右上角的无差异曲线在同一点与预算线相切！',
        focus: 'tangency2',
        pRatio: 1.0,
        showTangency1: true,
        showTangency2: true,
        formula: 'MRS_2 = \\frac{y_2}{y_1} = 1 = \\frac{p_1}{p_2} \\implies x^*(2) = (5, 5)'
      },
      {
        step: 3,
        title: '两切点奇迹重合：竞争均衡达成！',
        desc: '甲、乙两套坐标指向的最优点在盒内重合于 (5,5)。重合判据来自教材图10.4a；(5,5)是本站对称数值例的结果。',
        focus: 'coincide',
        pRatio: 1.0,
        showTangency1: true,
        showTangency2: true,
        formula: 'a^*(1)=a^*(2)=(5,5)\\quad\\text{（仅本对称数值例）}'
      },
      {
        step: 4,
        title: '市场出清核算：大米与大豆零超额需求',
        desc: '甲要 5 千克米，乙要 5 千克米，加总 10 千克出清；甲要 5 千克豆，乙要 5 千克豆，加总 10 千克出清。两市场同时均衡！',
        focus: 'clearing',
        pRatio: 1.0,
        showTangency1: true,
        showTangency2: true,
        formula: 'D_1 = 5+5 = 10, \\quad D_2 = 5+5 = 10 \\implies z_1 = z_2 = 0'
      },
      {
        step: 5,
        title: '净交易向量：自愿互换实现互利共赢',
        desc: '从初始家底 (8,2) 到最终均衡 (5,5)，甲卖出 3 千克米换来 3 千克豆；乙刚好卖出 3 千克豆换来 3 千克米。双方效用从 16 跃升至 25！',
        focus: 'nettrade',
        pRatio: 1.0,
        showTangency1: true,
        showTangency2: true,
        formula: 'u_1: 16 \\to 25, \\quad u_2: 16 \\to 25 \\quad (\\text{各净赚}+56\\%)'
      }
    ],

    disequilibrium: [
      {
        step: 0,
        title: '价格偏离均衡：设米价过高为2元',
        desc: '若市场价格失真，大米被高估为2元（豆价1元），斜率为 -2 的预算线陡峭倾斜，过初始禀赋点 (8,2)。',
        focus: 'steepbudget',
        pRatio: 2.0,
        formula: 'p = (2, 1) \\implies \\text{预算线斜率为 } -2'
      },
      {
        step: 1,
        title: '甲的需求响应：身价暴涨但米贵少买',
        desc: '甲的身价变为 8*2+2 = 18元。在预算线上，甲挑选最优点为大米4.5千克、大豆9千克。',
        focus: 'demand1',
        pRatio: 2.0,
        formula: 'w_1 = 18 \\implies a(1) = (4.5, 9)'
      },
      {
        step: 2,
        title: '乙的需求响应：购买力被严重挤压',
        desc: '乙的身价仅有 2*2+8 = 12元。面对高昂米价，乙从右上角倒看，仅买得起大米3千克、大豆6千克（盒内坐标 (7,4)）。',
        focus: 'demand2',
        pRatio: 2.0,
        formula: 'w_2 = 12 \\implies a(2) = (3, 6) \\iff (7, 4)'
      },
      {
        step: 3,
        title: '两切点错位：预算线上的空间鸿沟',
        desc: '甲的最优点在 (4.5, 9)，乙的最优点在 (7, 4)！原书图 10.4b 揭示：非均衡价格下，两人的最优切点在预算线上彻底错开！',
        focus: 'mismatch',
        pRatio: 2.0,
        formula: 'x^*(1) \\ne x^*(2) \\implies \\text{两切点错位，形成距离鸿沟}'
      },
      {
        step: 4,
        title: '失衡核算：大米严重过剩，大豆极度短缺',
        desc: '大米总需求 4.5+3 = 7.5 < 10（滞销过剩2.5千克）；大豆总需求 9+6 = 15 > 10（哄抢短缺5千克）。市场陷入失衡。',
        focus: 'excess',
        pRatio: 2.0,
        formula: 'z_1 = 7.5 - 10 = -2.5 \\quad (\\text{过剩}), \\quad z_2 = 15 - 10 = +5.0 \\quad (\\text{短缺})'
      },
      {
        step: 5,
        title: '本例的试探调价方向：米价应向下',
        desc: '若采用“超额供给就降价”的试探规则，本例会让p1从2向1靠近、两点随之接近。一般经济未必收敛，这里只演示本例方向。',
        focus: 'adjustment',
        pRatio: 2.0,
        formula: 'z_1 < 0 \\implies p_1 \\downarrow \\implies p_1/p_2 \\to 1.0'
      }
    ],

    contractcurve: [
      {
        step: 0,
        title: '什么是契约线：所有切点连成的轨迹',
        desc: '契约线（Contract Curve）连接所有使得甲乙两人的无差异曲线相互切合（MRS1 = MRS2）的点，正是帕累托稳定配置的集合。',
        focus: 'contractdef',
        formula: '\\text{Contract Curve}: \\quad MRS_1 = MRS_2'
      },
      {
        step: 1,
        title: '对角线方程：对称偏好下的契约线',
        desc: '在本例两方都是乘积效用 u=xy 下，MRS1 = x2/x1，MRS2 = (10-x2)/(10-x1)。相切条件严格化简为 x2 = x1（从O1直连O2的对角线）！',
        focus: 'diagonal',
        formula: '\\frac{x_2}{x_1} = \\frac{10-x_2}{10-x_1} \\iff x_2 = x_1'
      },
      {
        step: 2,
        title: '契约线上的帕累托稳定验证',
        desc: '在对角线上任意取一点（如 (6,6)），两人的无差异曲线相切背向而行。任何让甲更好的移动必使乙受损，反之亦然。无法同时变好！',
        focus: 'stabletest',
        formula: '\\forall P \\in \\text{Diagonal}, \\quad \\text{不存在无损帕累托改善点}'
      },
      {
        step: 3,
        title: '线外点的相交与透镜改善区',
        desc: '在线外任意一点（如禀赋点 (8,2)），两人的无差异曲线相交，围出一个橄榄形的透镜区域。该区域内每个点都能让两人同时更幸福！',
        focus: 'lens',
        formula: '\\text{线外点相交} \\implies \\text{透镜内存在帕累托改善}'
      },
      {
        step: 4,
        title: '向契约线的滑动与改善极限',
        desc: '若两人持续选择让双方都严格变好的可行交换，并且过程最终停在“再无双赢改进”的点，那么终点必须落在本例契约线上；这不是对实际谈判必然收敛的保证。',
        focus: 'improvelimit',
        formula: '\\text{自愿谈判终点} \\subseteq \\text{契约线}'
      },
      {
        step: 5,
        title: '第一福利定理的几何印证',
        desc: '竞争均衡切点重合在 (5,5)，位于对角线上！几何无缝印证了命题10.4：任何竞争均衡配置必然是帕累托稳定的！',
        focus: 'welfarelink',
        formula: '(5, 5) \\in \\text{Contract Curve} \\implies \\text{第一福利定理成立}'
      }
    ],

    corelens: [
      {
        step: 0,
        title: '自愿交易与个人理性底线',
        desc: '没有任何理性人会自愿接受效用低于自己初始家底的方案。因此，可行的自愿方案必须满足 u1 >= 16 且 u2 >= 16。',
        focus: 'individualrationality',
        formula: 'a(1) \\succsim_1 e(1) \\iff u_1(a) \\ge 16, \\quad a(2) \\succsim_2 e(2) \\iff u_2(a) \\ge 16'
      },
      {
        step: 1,
        title: '穿过禀赋点的两根保留无差异曲线',
        desc: '在盒中画出经过 e(8,2) 的甲等效用线（u1=16）和乙等效用线（u2=16）。两条曲线围成一个橄榄形的“自愿交易透镜”。',
        focus: 'reservationcurves',
        formula: 'I_1(e): x_1 x_2 = 16, \\quad I_2(e): (10-x_1)(10-x_2) = 16'
      },
      {
        step: 2,
        title: '自愿交易透镜：双赢交易的充要范围',
        desc: '落在透镜内部或边界的分配，才让甲乙都至少不比初始禀赋差；透镜外会有一人宁愿保留自己的初始禀赋。',
        focus: 'tradezone',
        formula: '\\text{自愿交易区} = \\{ a \\mid u_1(a) \\ge 16 \\text{ 且 } u_2(a) \\ge 16 \\}'
      },
      {
        step: 3,
        title: '截出核心：契约线上的红色线段',
        desc: '核心（Core）就是被自愿交易透镜截取的契约线部分！在对角线上，满足 x1^2 >= 16 得 x1 >= 4；(10-x1)^2 >= 16 得 x1 <= 6。',
        focus: 'coresegment',
        formula: '\\text{Core} = \\{ (x, x) \\mid 4 \\le x \\le 6 \\} \\quad (\\text{契约线上的红线段})'
      },
      {
        step: 4,
        title: '核心端点的利益边界含义',
        desc: '端点 (4,4) 让甲效用刚好保底16、乙得到全部交易增益；端点 (6,6) 反之。红线段标出本例中所有能抵御联盟阻挡的配置。',
        focus: 'endpoints',
        formula: 'P_{\\min}=(4, 4) \\implies u_1=16, \\quad u_2=36, \\quad P_{\\max}=(6, 6) \\implies u_1=36, \\quad u_2=16'
      },
      {
        step: 5,
        title: '命题10.5几何全景：竞争均衡必在核心',
        desc: '竞争均衡分配(5,5)落在核心红线段内，具体体现命题10.5。它恰好居中来自本例的对称参数，一般经济不必如此。',
        focus: 'coresummary',
        formula: '(5, 5) \\in \\text{Core} \\subseteq \\text{Contract Curve} \\quad (\\text{命题10.5完美具象化})'
      }
    ]
  };

  const steps = frameConfigs[k];
  const safeStep = Math.max(0, Math.min(steps.length - 1, stepIndex));
  const frame = steps[safeStep];

  return {
    key: k,
    name: edgeworthNames[k],
    step: safeStep,
    totalSteps: steps.length,
    frame,
    ev,
    priceRatio,
    box: BOX_TOTAL,
    endowment: ENDOWMENT
  };
}

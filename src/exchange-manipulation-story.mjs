// Section 10.8 Manipulability (操纵性)
// Textbook: Osborne–Rubinstein (2020.12.21 h), printed p. 150, PDF p. 169.
// Example 10.6: Manipulability of competitive equilibrium.

export const manipulationKeys = [
  'honest106',
  'strategic106',
  'general106',
  'comparison106',
  'destroy102'
];

export function evaluateExample106(multiplier = 1) {
  const k = Math.max(0.1, Number(multiplier) || 1);
  const p1 = k;
  const p2 = 1;
  const e1 = [1, 0];
  const e2 = [0, 1];
  const w1 = p1 * e1[0] + p2 * e1[1]; // k
  const w2 = p1 * e2[0] + p2 * e2[1]; // 1

  // Individual 2 has u2 = min(x1, x2). At prices (p1, 1), x1 = x2 = w2 / (p1 + 1)
  const a2 = [w2 / (p1 + p2), w2 / (p1 + p2)]; // [1/(k+1), 1/(k+1)]
  // Individual 1 takes remainder:
  const a1 = [1 - a2[0], 1 - a2[1]]; // [k/(k+1), k/(k+1)]

  // Reported budget check for 1:
  const costReported1 = p1 * a1[0] + p2 * a1[1]; // k*k/(k+1) + k/(k+1) = k
  // True utilities:
  // True u1 = x1 + x2
  const trueU1 = a1[0] + a1[1]; // 2k / (k+1)
  // Reported u1 = k*x1 + x2
  const repU1 = k * a1[0] + a1[1]; // k
  // u2 = min(x1, x2)
  const u2 = Math.min(a2[0], a2[1]); // 1 / (k+1)

  // Baseline honest values (k = 1)
  const honestPrice = 1;
  const honestA1 = [0.5, 0.5];
  const honestA2 = [0.5, 0.5];
  const honestU1 = 1.0;
  const honestU2 = 0.5;

  const gainU1 = trueU1 - honestU1;

  return {
    k,
    p: [p1, p2],
    e1,
    e2,
    w1,
    w2,
    a1,
    a2,
    costReported1,
    trueU1,
    repU1,
    u2,
    honestPrice,
    honestA1,
    honestA2,
    honestU1,
    honestU2,
    gainU1,
    excessGood1: (a1[0] + a2[0]) - 1,
    excessGood2: (a1[1] + a2[1]) - 1
  };
}

export function evaluatePriceTension(testPrice = 1, declaredK = 1) {
  const p = Math.max(0.1, Number(testPrice) || 1);
  const k = Math.max(0.1, Number(declaredK) || 1);
  const e1 = [1, 0];
  const e2 = [0, 1];
  const w1 = p;
  const w2 = 1;

  // 2 demands min(x1, x2) => x1 = x2 = 1 / (p + 1)
  const d2 = [1 / (p + 1), 1 / (p + 1)];

  // 1 has declared MRS = k.
  let d1;
  let status = '';
  if (p > k + 1e-6) {
    // p1/p2 = p > k => good 2 is relatively cheaper per declared utility unit => demands only good 2
    d1 = [0, w1 / 1]; // [0, p]
    status = '商品1过贵：1号只要商品2，导致商品2全社会总需求超标（供不应求）';
  } else if (p < k - 1e-6) {
    // p1/p2 = p < k => good 1 is relatively cheaper => demands only good 1
    d1 = [w1 / p, 0]; // [1, 0]
    status = '商品1过贱：1号只要商品1，导致商品1全社会总需求超标（供不应求）';
  } else {
    // p = k => 1 is indifferent along line k*x1 + x2 = k
    d1 = [1 - d2[0], 1 - d2[1]];
    status = '平价出清点：1号沿申报预算线任意挑，正好取走2号挑剩的余量，两市场同时完美出清！';
  }

  const excess = [d1[0] + d2[0] - 1, d1[1] + d2[1] - 1];
  return {
    p,
    k,
    d1,
    d2,
    excess,
    status
  };
}

export function manipulationStory(key, step = 0) {
  const boundedStep = Math.max(0, Math.min(5, Math.round(Number(step) || 0)));

  switch (key) {
    case 'honest106': {
      const ev = evaluateExample106(1.0);
      const testCases = [
        evaluatePriceTension(1.5, 1.0),
        evaluatePriceTension(0.6, 1.0),
        evaluatePriceTension(1.0, 1.0)
      ];
      return {
        key,
        step: boundedStep,
        ev,
        testCases,
        multiplier: 1.0,
        focusPrice: boundedStep < 2 ? 1.0 : boundedStep === 2 ? 1.5 : 1.0
      };
    }
    case 'strategic106': {
      const ev = evaluateExample106(3.0);
      const testCases = [
        evaluatePriceTension(4.0, 3.0),
        evaluatePriceTension(2.0, 3.0),
        evaluatePriceTension(3.0, 3.0)
      ];
      return {
        key,
        step: boundedStep,
        ev,
        testCases,
        multiplier: 3.0,
        focusPrice: boundedStep < 2 ? 3.0 : boundedStep === 2 ? 4.0 : 3.0
      };
    }
    case 'general106': {
      const multipliers = [1.0, 1.5, 2.0, 3.0, 5.0, 7.0];
      const selectedK = multipliers[boundedStep];
      const ev = evaluateExample106(selectedK);
      return {
        key,
        step: boundedStep,
        ev,
        multiplier: selectedK,
        allMultipliers: multipliers.map(m => evaluateExample106(m))
      };
    }
    case 'comparison106': {
      const ev = evaluateExample106(3.0);
      return {
        key,
        step: boundedStep,
        ev,
        multiplier: 3.0,
        regimes: [
          {
            name: '第9章 房屋市场均衡规则',
            marketSize: '有限个人 / 不可分房屋',
            influence: '申报的是房屋排序，规则直接决定最终房屋归属',
            strategy: '习题9.5：谎报排序不能得到按真实排序更好的房屋',
            result: '该规则不可操纵（Problem 9.5）'
          },
          {
            name: '第10章 双人可分商品交换规则',
            marketSize: '有限个人 / 可分商品与内生价格',
            influence: '申报偏好进入需求函数与出清方程，进而改变价格',
            strategy: '谎报偏好推高自有物资相对价格，逼迫对方大幅让利',
            result: '可操纵（Manipulable）！例10.6证得'
          }
        ]
      };
    }
    case 'destroy102': {
      const ev = evaluateExample106(3.0);
      return {
        key,
        step: boundedStep,
        ev,
        multiplier: 3.0,
        destroyCompare: {
          physical: {
            method: '10.2延伸：物理毁损禀赋',
            action: '亲手把自家部分大米扔进河里，减少市场有效供给',
            cost: '必须承担实物永久毁灭的物理损失',
            condition: '教材例10.2的互补偏好与参数构造；不是一般需求弹性定理'
          },
          information: {
            method: '10.8操纵：战略信息伪报',
            action: '一粒米都不扔，仅在申报偏好时夸大对自生物资的喜爱度（3x1+x2）',
            cost: '不毁掉任何实物，但会改变双方分配与真实福利',
            condition: '机制根据申报偏好计算出清价格，个人具有清算价格影响力'
          }
        }
      };
    }
    default:
      return manipulationStory('honest106', boundedStep);
  }
}

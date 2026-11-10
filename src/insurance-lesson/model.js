const contracts = {
  loaded: {
    wealth: 100, loss: 30, probability: 0.5, rate: 1.5,
    label: '有加价', scope: '修理费 30 元，每交 1 元保费，出险赔 1.5 元。',
    steps: [
      {premium: 20, title: '全保时，两天都剩 80 元', note: '交 20 元保费就能把修理费保足。出险那天，赔来的 30 元正好抵掉修理费。', math: '100-20-30+30=80', next: '少交 1 元'},
      {premium: 19, title: '平安时，省下的 1 元归自己', note: '把保费从 20 元减到 19 元。平安那天没有修理费，也没有赔款，手里多出整整 1 元。', math: '100-19=81', next: '算出险的净变化'},
      {premium: 19, title: '出险时，手里只少了半元', note: '少交 1 元保费，同时少领 1.5 元赔款。把这两笔合起来，余额从 80 元降到 79.5 元。', math: '1-1.5=-0.5', next: '把变化缩到一分钱'},
      {premium: 19.99, title: '少交一分钱，两边各变多少？', note: '平安多留 0.01 元，出险净少 0.005 元。两个状态各占一半，平均财富增加 0.0025 元。', math: String.raw`\tfrac12(0.01-0.005)=0.0025`, next: '看全保点的斜率'},
      {premium: 19.99, title: '全保点上，每一元同样珍贵', note: '两边原本都剩 80 元，边际效用相同。此时再多交一点，平均每元损失 0.25 元，期望效用的斜率为负。', math: String.raw`U'(20)=-0.25\,v'(80)<0`, next: '判断最优保额'},
      {premium: 19.99, title: '最优保费落在全保点左边', note: '从全保点向左少买一点，期望效用会上升。期望效用是凹的，往右斜率只会持平或下降，因此全保和超额投保都可以排除。', math: String.raw`x^*<x_F\;\Longrightarrow\;\lambda x^*<D`, next: '看完整书写答案'}
    ]
  },
  fair: {
    wealth: 100, loss: 40, probability: 0.5, rate: 2,
    label: '公平价', scope: '修理费 40 元，每交 1 元保费，出险赔 2 元。',
    steps: [
      {premium: 0, title: '先算不买保险时的余额', note: '你有 100 元。手机完好就留下全部，摔坏就花 40 元修。两种结果各占一半，平均剩 80 元。', math: String.raw`\tfrac12(100+60)=80`, next: '试交 10 元'},
      {premium: 10, title: '把 10 元移到更缺钱的日子', note: '两天都先交 10 元，出险那天又领回 20 元。平安的余额从 100 降到 90，出险的余额从 60 升到 70。', math: String.raw`\tfrac12(90+70)=80`, next: '把修理费保足'},
      {premium: 20, title: '全保让两边的余额相等', note: '交 20 元保费，出险可领 40 元，刚好填平损失。现在两种日子都能留下 80 元。', math: '100-20-40+40=80', next: '比较三种买法'},
      {premium: 20, title: '同一个均值，全保取到效用上界', note: '三种买法平均都剩 80 元。风险厌恶者愿意确定地拿到这个均值。全保正好做到这一点，因此它是最优选择之一。', math: String.raw`E[v(W)]\le v(80)=U(20)`, next: '换有加价的保单'}
    ]
  }
};

const transfer = {wealth: 120, loss: 24, probability: 0.5, rate: 1.2};

function ledger(contract, premium) {
  const {wealth, loss, probability, rate} = contract;
  const payout = rate * premium;
  const safe = wealth - premium;
  const ownAfterLoss = safe - loss;
  const accident = ownAfterLoss + payout;
  return {
    premium, payout, safe, ownAfterLoss, accident,
    mean: (1 - probability) * safe + probability * accident,
    utility: (1 - probability) * Math.sqrt(safe) + probability * Math.sqrt(accident)
  };
}

function amount(value, digits = 4) {
  return String(Number(value.toFixed(digits)));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {contracts, transfer, ledger, amount};
}

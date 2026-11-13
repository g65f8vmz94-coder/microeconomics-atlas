const contracts = {
  loaded: {
    wealth: 100, loss: 30, probability: 0.5, rate: 1.5,
    label: '有加价', scope: '修理费 30 元，每交 1 元保费，出险赔 1.5 元。',
    steps: [
      {premium: 20, title: '全保时，两天都剩 80 元', note: '初始 100 元，交 20 元保费后，平安那天剩 100−20=80 元；出险那天扣 30 元修理费、再收 1.5×20=30 元赔款，也剩 100−30−20+30=80 元。', math: '100-20-30+30=80', next: '少交 1 元'},
      {premium: 19, title: '平安时，省下的 1 元归自己', note: '保费从 20 元减到 19 元。平安那天只交 19 元保费、无损失无赔款，余额变成 100−19=81 元，比全保正好多了省下的 1 元。', math: '100-19=81', next: '算出险的净变化'},
      {premium: 19, title: '出险时，手里只少了半元', note: '同一张少交 1 元的保单下，出险时保费也省 1 元（+1），但赔款从 30 元降到 1.5×19=28.5 元（−1.5）。两笔一加净变化 −0.5 元，余额为 100−30−19+28.5=79.5 元。', math: '1-1.5=-0.5', next: '把变化缩到一分钱'},
      {premium: 19.99, title: '少交一分钱，两边各变多少？', note: '保费改交 19.99 元：平安多留 0.01 元，出险少领 0.015 元但省 0.01 元保费、净少 0.005 元。按各一半概率加权，平均财富净增 (0.01−0.005)/2=0.0025 元。', math: String.raw`\tfrac12(0.01-0.005)=0.0025`, next: '看全保点的斜率'},
      {premium: 19.99, title: '全保点上，每一元同样珍贵', note: '在全保点 20 元处，两种状态原本都剩 W_F=80 元，边际效用同为 v\'(80)>0。对保费求导，在全保点计算增加一小点保费的边际期望效用，得 U\'(20)=(0.5×1.5−1)v\'(80)=−0.25v\'(80)<0：多买就亏效用，少买充分小的一点反而提高效用！', math: String.raw`U'(20)=-0.25\,v'(80)<0`, next: '判断最优保额'},
      {premium: 19.99, title: '最优保费落在全保点左边', note: '因为 U\'(20)<0，往左少买一点就能提高期望效用。又因 W_0(x)、W_1(x) 对 x 线性且 v 凹，U(x) 本身也是凹函数——右边一切点斜率更低或持平，绝不可能高于全保，故必有 x*<x_F。', math: String.raw`x^*<x_F\;\Longrightarrow\;\lambda x^*<D`, next: '看完整书写答案'}
    ]
  },
  fair: {
    wealth: 100, loss: 40, probability: 0.5, rate: 2,
    label: '公平价', scope: '修理费 40 元，每交 1 元保费，出险赔 2 元。',
    steps: [
      {premium: 0, title: '先算不买保险时的余额', note: '初始 100 元、保费 x=0：平安剩 100−0=100 元，摔坏付 40 元修理费剩 100−40=60 元。两种情况各一半概率，平均剩 (100+60)/2=80 元。', math: String.raw`\tfrac12(100+60)=80`, next: '试交 10 元'},
      {premium: 10, title: '把 10 元移到更缺钱的日子', note: '交 10 元保费，出险可领 2×10=20 元。于是平安剩 100−10=90 元，出险剩 100−40−10+20=70 元。注意平均还是 (90+70)/2=80 元，只是差距从 40 元缩到 20 元。', math: String.raw`\tfrac12(90+70)=80`, next: '把修理费保足'},
      {premium: 20, title: '全保让两边的余额相等', note: '交 x_F=D/λ=40/2=20 元，出险赔款 2×20=40 元刚好抵掉全部修理费。平安剩 100−20=80 元，出险也剩 100−40−20+40=80 元，风险完全消除。', math: '100-20-40+40=80', next: '比较三种买法'},
      {premium: 20, title: '同一个均值，全保取到效用上界', note: '因为期望利润为零（pλ=1），无论买多少，平均财富都恒等于 80 元。对风险厌恶者（凹函数 v），詹森不等式保证 E[v(W)] ≤ v(E[W])=v(80)，而全保恰在无风险点取到等号！', math: String.raw`E[v(W)]\le v(80)=U(20)`, next: '换有加价的保单'}
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

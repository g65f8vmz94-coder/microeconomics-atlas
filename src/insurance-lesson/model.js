const contracts = {
  loaded: {
    wealth: 100, loss: 30, probability: 0.5, rate: 1.5,
    label: '有加价', scope: '修理费 30 元，每交 1 元，出险赔 1.5 元。',
    steps: [
      {premium: 20, title: '先把修理费保足。', note: '交 20 元，出险正好赔 30 元，够付全部修理费。想一想，少交 1 元，出险那天手里会少多少钱？', next: '少交 1 元'},
      {premium: 19, title: '省下的一元，两天都在。', note: '平安那天最容易算，原本剩 80 元，现在剩 81 元。出险那天也省了这 1 元，接着看保险公司少赔多少。', next: '拆开事故这笔账'},
      {premium: 19, title: '少赔一元五，自己留了一元。', note: '原本赔 30 元，现在赔 28.5 元。手里多留 1 元，赔款少 1.5 元，合起来只少 0.5 元。两种日子各占一半，平均多了 0.25 元。', next: '只少交一分钱'},
      {premium: 19.99, title: '把这一步缩到一分钱。', note: '平安多 0.01 元，出险少 0.005 元。全保时两天一样富，第一点钱在两天里一样珍贵。两边各乘一半，省下一点点保费就占便宜。这正是导数在算的事。', next: '从全保重新看'}
    ]
  },
  fair: {
    wealth: 100, loss: 40, probability: 0.5, rate: 2,
    label: '公平价', scope: '修理费 40 元，每交 1 元，出险赔 2 元。',
    steps: [
      {premium: 0, title: '先自己扛这笔修理费。', note: '手上有 100 元，平安就全留下，手机摔坏就花 40 元修。各有一半机会，长期平均剩 80 元。', next: '交 10 元保费'},
      {premium: 10, title: '从宽裕的日子，挪十元给紧日子。', note: '平安时从 100 变成 90。出险时虽然交了 10 元，却拿到 20 元赔款，从 60 变成 70。两头靠近了，平均仍是 80 元。', next: '把修理费保足'},
      {premium: 20, title: '现在，哪种日子都剩八十。', note: '出险赔的 40 元刚好付清修理费。三种买法的平均财富都是 80 元，只有这份合同能确定拿到 80 元。怕风险的人至少一样喜欢这份确定的钱。', next: '从不投保重新看'}
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

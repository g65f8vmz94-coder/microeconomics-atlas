const fs = require('node:fs');
const path = require('node:path');
const katex = require('../vendor/katex/katex.min.js');
const {contracts, ledger, amount} = require('./model.js');

const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const math = tex => katex.renderToString(tex, {output: 'mathml', throwOnError: true});
const reviewRows = {'loaded-3': 'states', 'fair-3': 'fair', 'loaded-5': 'slope'};

function fill(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in data)) throw new Error('Unknown insurance template field ' + key);
    return data[key];
  });
}

function renderMath(template) {
  return template.replace(/<tex>([\s\S]*?)<\/tex>/g, (_, tex) =>
    math(tex.replaceAll('&lt;', '<').replaceAll('&gt;', '>'))
  );
}

function difference(value) {
  const magnitude = amount(Math.abs(value));
  if (magnitude === '0') return '与全保相同';
  return '比全保' + (value > 0 ? '多 ' : '少 ') + magnitude + ' 元';
}

function insurancePage() {
  const timeline = ['fair', 'loaded'].flatMap(name =>
    contracts[name].steps.map((step, i) => ({name, step, number: i + 1, id: name + '-' + (i + 1)}))
  );
  const template = renderMath(read('step.html'));
  const steps = timeline.map(({name, step, number, id}, i) => {
    const contract = contracts[name];
    const balance = ledger(contract, step.premium);
    const fullPremium = contract.loss / contract.rate;
    const fullWealth = contract.wealth - fullPremium;
    const percent = cash => amount(100 * cash / contract.wealth);
    const review = reviewRows[id];
    return fill(template, {
      ...Object.fromEntries(Object.entries(balance).map(([key, value]) => [key, amount(value)])),
      ...step, id, number, label: contract.label, scope: contract.scope, stepCount: contract.steps.length,
      stepMath: math(step.math), utility: balance.utility.toFixed(5),
      safePercent: percent(balance.safe), ownPercent: percent(balance.ownAfterLoss), payoutPercent: percent(balance.payout),
      safeDelta: difference(balance.safe - fullWealth), accidentDelta: difference(balance.accident - fullWealth),
      hideReceipt: name === 'loaded' && number >= 3 ? '' : 'hidden',
      savedFee: amount(fullPremium - step.premium), lostPayout: amount(contract.loss - balance.payout),
      netLoss: amount(fullWealth - balance.accident),
      nextId: timeline[i + 1]?.id ?? 'solution',
      previousLink: i ? `<a class="action" data-previous href="#${timeline[i-1].id}" aria-keyshortcuts="ArrowLeft">上一步</a>` : '',
      reviewTarget: review ? `id="check-${review}" tabindex="-1"` : '',
      returnLink: review ? `<a class="return-to-proof" href="#proof-${review}">← 回到刚才的算式</a>` : ''
    });
  }).join('');
  return fill(renderMath(read('page.html')), {
    steps, lastStep: timeline.at(-1).id, stylesheet: read('insurance.css'),
    model: read('model.js'), player: read('player.js'),
    motion: read('../amicro-motion.js'), license: read('../vendor/AMICRO-LICENSE.txt')
  });
}

// Existing shared links with a playback position or model parameters still open
// their original curve. A fresh visit to exercise 3.9 opens its full problem statement.
function insuranceEntry(html) {
  const route = `<script>(()=>{const q=new URLSearchParams(location.search);if(q.get('case')==='p9'&&[...q.keys()].every(k=>k==='case')&&!location.hash){location.replace(new URL('insurance-3-9.html',location.href))}})();</script>`;
  return html.replace('</head>', route + '</head>')
    .replace('href="lesson-3-5.html?case=p9">习题3.9 保险', 'href="insurance-3-9.html">习题3.9 保险 · 两种日子的账本');
}

module.exports = {insurancePage, insuranceEntry};

const fs = require('node:fs');
const path = require('node:path');
const katex = require('../vendor/katex/katex.min.js');
const {contracts, ledger, amount} = require('./model.js');

function insurancePage() {
  const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
  const first = contracts.loaded.steps[0];
  const balance = ledger(contracts.loaded, first.premium);
  const data = {
    ...Object.fromEntries(Object.entries(balance).map(([key, value]) => [key, amount(value)])),
    ...first, utility: balance.utility.toFixed(5), scope: contracts.loaded.scope,
    stylesheet: read('lesson.css'), model: read('model.js'), player: read('player.js'),
    motion: read('../amicro-motion.js'), license: read('../vendor/AMICRO-LICENSE.txt')
  };
  return read('page.html').replace(/<tex>([\s\S]*?)<\/tex>/g, (_, tex) => {
    const raw = tex.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
    return katex.renderToString(raw, {output:'mathml', throwOnError:true});
  }).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in data)) throw new Error('Unknown insurance template field ' + key);
    return data[key];
  });
}

// Existing shared links with a playback position or model parameters still open
// their original curve. A fresh visit to exercise 3.9 opens its worked ledger.
function insuranceEntry(html) {
  const route = `<script>(()=>{const q=new URLSearchParams(location.search);if(q.get('case')==='p9'&&[...q.keys()].every(k=>k==='case')&&!location.hash){location.replace(new URL('insurance-3-9.html',location.href))}})();</script>`;
  return html.replace('</head>', route + '</head>')
    .replace('href="lesson-3-5.html?case=p9">习题3.9 保险', 'href="insurance-3-9.html">习题3.9 保险 · 两种日子的账本');
}

module.exports = {insurancePage, insuranceEntry};

const byId = id => document.getElementById(id);
const skip = document.querySelector('.ledger-skip');
let nextFocus = null;

// Earlier chapter links encoded the contract and zero-based step in the query.
function restoreLegacyStep() {
  const query = new URLSearchParams(location.search);
  if ((!query.has('step') && !query.has('plan')) ||
      (location.hash && !['#ledger', '#step-title', '#step-note', '#step-number', '#terms'].includes(location.hash))) return false;
  const name = query.get('plan') === 'fair' ? 'fair' : 'loaded';
  const requested = Number(query.get('step'));
  const index = Number.isInteger(requested) ? Math.max(0, Math.min(requested, contracts[name].steps.length - 1)) : 0;
  location.replace('#' + name + '-' + (index + 1));
  return true;
}

function syncFragment() {
  if (restoreLegacyStep()) return;
  const target = byId(location.hash.slice(1));
  const step = target?.closest('.ledger-step');
  skip.href = step ? location.hash : '#ledger';
  if (target?.id === 'worked') target.open = true;
  if (step) {
    byId('announcement').textContent = step.querySelector('.step-label').textContent + '。' +
      step.querySelector('h3').textContent + '。' + step.querySelector('.reading > p').textContent;
  }
  if (nextFocus && step && step.id === nextFocus.id) {
    const control = step.querySelector(nextFocus.selector) || step.querySelector('[data-forward]');
    control.focus({preventScroll:true});
  }
  nextFocus = null;
}

document.addEventListener('click', event => {
  const link = event.target.closest('.actions a');
  if (link && !event.detail) {
    nextFocus = {id: link.hash.slice(1), selector: link.hasAttribute('data-previous') ? '[data-previous]' : '[data-forward]'};
  }
});

document.addEventListener('keydown', event => {
  const link = event.target.closest('.actions a');
  if (!link || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const actions = link.closest('.actions');
  let destination;
  if (event.key === 'ArrowRight') destination = actions.querySelector('[data-forward]');
  else if (event.key === 'ArrowLeft') destination = actions.querySelector('[data-previous]');
  else if (event.key === ' ') destination = link;
  else return;
  event.preventDefault();
  if (!event.repeat) destination?.click();
});

window.addEventListener('hashchange', syncFragment);
window.addEventListener('pageshow', syncFragment);
syncFragment();

const form = byId('practice-form');
const submit = form.querySelector('[type=submit]');
submit.hidden = false;
submit.disabled = false;
form.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.isComposing) return;
  const nextField = {safe: form.elements.accident, accident: form.elements.method}[e.target.name];
  if (nextField) {
    e.preventDefault();
    nextField.focus();
  }
});
form.addEventListener('submit', e => {
  e.preventDefault();
  const result = ledger(transfer, 19);
  const readNumber = input => {
    const s = input.value.trim().normalize('NFKC').replace('。', '.');
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN;
  };
  const safe = readNumber(form.elements.safe), accident = readNumber(form.elements.accident);
  const correct = (a,b) => Math.abs(a-b) < 0.000001;
  let message;
  if (!Number.isFinite(safe) || !Number.isFinite(accident)) message = '先在两格各写一个金额，可以带小数。';
  else if (!correct(safe,result.safe)) message = '先算平安那天。用手上的 120 元减去新保费 19 元，还剩多少？';
  else if (!correct(accident,result.accident)) message = '平安那笔算对了。出险也先剩 101 元，再付 24 元修理费，加回保险赔的 19 × 1.2 元。';
  else if (form.elements.method.value !== 'slope') message = '两笔金额都对了。有加价时，平均钱变多，风险也变了。再想想哪种做法能同时考虑两件事。';
  else message = '两笔账和做法都对了。全保时两种日子都剩 100 元，两边的钱一样珍贵，才可以直接比较第一点保费的得失。';
  byId('feedback').textContent = message;
});
if (location.protocol === 'file:') {
  const site = 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/';
  if (!location.pathname.endsWith('/insurance-3-9.html')) {
    for (const a of document.querySelectorAll('a[href^="lesson-"],a[href^="learn-"],a[href^="index."]')) {
      a.href = new URL(a.getAttribute('href'), site).href;
    }
  }
  byId('download').href = location.pathname;
}

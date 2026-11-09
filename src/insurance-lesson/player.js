const byId = id => document.getElementById(id);
const fields = new Map();
for (const el of document.querySelectorAll('[data-field]')) {
  const key = el.dataset.field;
  if (!fields.has(key)) fields.set(key, []);
  fields.get(key).push(el);
}
const bars = Object.fromEntries(Array.from(document.querySelectorAll('[data-bar]'), el => [el.dataset.bar, el]));
const motion = window.microMotion;
const reduced = motion.reduced;
let plan = 'loaded', step = 0, displayed = 20, frame = 0, timer = 0;
let proofOrigin = null;
function changeText(difference) {
  if (Math.abs(difference) < 0.000001) return '与全保相同';
  return '比全保' + (difference > 0 ? '多 ' : '少 ') + amount(Math.abs(difference)) + ' 元';
}
function paint(premium) {
  displayed = premium;
  const contract = contracts[plan];
  const result = ledger(contract, premium);
  const fullWealth = contract.wealth - contract.loss / contract.rate;
  const values = {...result, safeDelta: changeText(result.safe - fullWealth), accidentDelta: changeText(result.accident - fullWealth)};
  for (const [key, nodes] of fields) {
    const value = key === 'utility' ? result.utility.toFixed(5) : typeof values[key] === 'number' ? amount(values[key]) : values[key];
    for (const el of nodes) if (el.textContent !== value) el.textContent = value;
  }
  if (!byId('receipt').hidden) {
    const full = contract.loss / contract.rate;
    byId('saved-fee').textContent = '+' + amount(full - premium);
    byId('lost-payout').textContent = '−' + amount(contract.loss - result.payout);
    byId('net-change').textContent = '−' + amount(fullWealth - result.accident);
  }
  for (const [key, money] of Object.entries({safe: result.safe, own: result.ownAfterLoss, payout: result.payout})) {
    bars[key].style.width = 100 * money / contract.wealth + '%';
  }
}
function settle() {
  cancelAnimationFrame(frame);
  paint(contracts[plan].steps[step].premium);
}
function glide(target, animate) {
  cancelAnimationFrame(frame);
  if (!animate || reduced.matches || displayed === target) { paint(target); return; }
  const from = displayed, start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / 540);
    // Monotone response: a bookkeeping entry must never overshoot its contract.
    const blend = 1 - Math.pow(1 - t, 3);
    paint(t === 1 ? target : from + (target - from) * blend);
    if (t < 1) frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
}
function readURL() {
  const q = new URLSearchParams(location.search);
  const name = q.get('plan') === 'fair' ? 'fair' : 'loaded';
  const requested = Number(q.get('step'));
  const index = Number.isInteger(requested) ? Math.max(0, Math.min(requested, contracts[name].steps.length - 1)) : 0;
  return [name, index];
}
function saveURL() {
  const url = new URL(location.href);
  url.searchParams.set('plan', plan);
  url.searchParams.set('step', String(step));
  try { history.replaceState(history.state, '', url); } catch { /* Some offline viewers restrict history. */ }
}
function stop() {
  clearTimeout(timer);
  timer = 0;
  byId('play').textContent = '连续播放';
}
function render(name, index, {animate = true, save = true, announce = true} = {}) {
  const changedPlan = plan !== name;
  plan = name; step = index;
  const contract = contracts[plan], current = contract.steps[step];
  byId('terms').textContent = '两种日子各占一半。' + contract.scope;
  for (const key of Object.keys(contracts)) byId('plan-' + key).setAttribute('aria-pressed', String(plan === key));
  byId('step-title').textContent = current.title;
  byId('step-note').textContent = current.note;
  byId('step-number').textContent = '第 ' + (step + 1) + ' / ' + contract.steps.length + ' 步';
  byId('track').replaceChildren(...contract.steps.map((_, i) => {
    const mark = document.createElement('i');
    if (i <= step) mark.className = 'filled';
    return mark;
  }));
  byId('prev').disabled = step === 0;
  byId('next').firstChild.textContent = current.next + ' ';
  const receipt = byId('receipt');
  receipt.hidden = plan !== 'loaded' || step < 2;
  glide(current.premium, animate && !changedPlan);
  if (save) saveURL();
  if (announce) {
    const b = ledger(contract, current.premium);
    byId('announcement').textContent = contract.label + '，' + byId('step-number').textContent + '。' + current.title + '平安剩 ' + amount(b.safe) + ' 元，出险剩 ' + amount(b.accident) + ' 元。';
  }
}
function advance() {
  render(plan, (step + 1) % contracts[plan].steps.length);
}
function schedule() {
  if (step === contracts[plan].steps.length - 1) { stop(); return; }
  byId('play').textContent = '暂停播放';
  timer = setTimeout(() => { advance(); schedule(); }, 7400);
}
byId('play').addEventListener('click', () => {
  if (timer) { stop(); settle(); return; }
  if (step === contracts[plan].steps.length - 1) render(plan, 0, {animate:false});
  schedule();
});
byId('next').addEventListener('click', () => { stop(); advance(); });
byId('prev').addEventListener('click', () => { stop(); render(plan, Math.max(0, step - 1)); });
for (const key of Object.keys(contracts)) byId('plan-' + key).addEventListener('click', () => {
  if (plan === key) return;
  stop(); render(key, 0);
});
function focusAt(el) {
  el.focus({preventScroll:true});
  el.scrollIntoView({block:'start', behavior:'instant'});
}
for (const link of document.querySelectorAll('[data-jump]')) link.addEventListener('click', e => {
  e.preventDefault(); stop();
  proofOrigin = link;
  const [name, index] = link.dataset.jump.split(':');
  render(name, Number(index), {animate:false});
  byId('back-proof').textContent = '回到刚才那行算式 ↓';
  byId('back-proof').href = '#' + link.id;
  focusAt(byId('ledger'));
});
byId('back-proof').addEventListener('click', e => {
  if (!proofOrigin) return;
  e.preventDefault(); stop(); settle(); focusAt(proofOrigin);
});
document.querySelector('.intro a[href="#solution"]').addEventListener('click', () => {stop(); settle();});
function onMotionChange() {
  byId('play').hidden = reduced.matches;
  if (reduced.matches) { stop(); settle(); }
}
reduced.addEventListener('change', onMotionChange);
document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); settle(); } });
window.addEventListener('popstate', () => { stop(); render(...readURL(), {animate:false, save:false}); });
render(...readURL(), {animate:false, save:false, announce:false});
onMotionChange();

const form = byId('practice-form');
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
byId('show-answer').addEventListener('click', e => {
  const box = byId('worked');
  box.hidden = !box.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!box.hidden));
  e.currentTarget.textContent = box.hidden ? '看解题步骤' : '收起解题步骤';
});
if (location.protocol === 'file:') {
  const site = 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/';
  for (const a of document.querySelectorAll('a[href^="lesson-"],a[href^="exercises."],a[href^="index."]')) a.href = site + a.getAttribute('href');
  byId('download').href = location.pathname;
}

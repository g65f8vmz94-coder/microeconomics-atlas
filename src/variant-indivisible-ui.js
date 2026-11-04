import {indivisibleKeys, indivisibleStory} from './variant-indivisible-story.mjs';
import {indivisibleContent} from './variant-indivisible-content.mjs';

export function startIndivisibleStory(requested) {
  const $ = id => document.getElementById(id);
  const C = {ink: '#263f37', muted: '#6f8075', green: '#177468', gold: '#b18429', red: '#bd624c', purple: '#74618d', rule: '#d7e0d5', paper: '#fffdf7', soft: '#f3f6f1', mint: '#e5efe9', rose: '#fff1ed'};
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const fmt = n => Number.isFinite(Number(n)) ? Number(Number(n).toFixed(2)).toLocaleString('zh-CN') : String(n);
  const text = (x, y, value, size = 12, color = C.ink, anchor = 'start', weight = 400) => `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
  const wrap = (value, limit = 22) => {
    const s = String(value), lines = [];
    for (let i = 0; i < s.length; i += limit) lines.push(s.slice(i, i + limit));
    return lines.slice(0, 3);
  };
  const lines = (x, y, value, size, color, anchor = 'start', weight = 400, limit = 22, gap = 20) => wrap(value, limit).map((s, i) => text(x, y + i * gap, s, size, color, anchor, weight)).join('');

  const query = new URLSearchParams(location.search);
  let key = indivisibleKeys.includes(requested) ? requested
    : indivisibleKeys.includes(window.INDIVISIBLE_DEFAULT) ? window.INDIVISIBLE_DEFAULT
      : indivisibleKeys.includes(query.get('case')) ? query.get('case') : indivisibleKeys[0];
  let step = 0;

  function ensureControls() {
    const fields = $('fields');
    if (!fields) return;
    fields.innerHTML = `<div class="field"><label for="experiment">本节知识点或原题</label><select id="experiment">${indivisibleKeys.map(k => `<option value="${k}">${esc(indivisibleContent[k].title)}</option>`).join('')}</select></div>` +
      '<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep">0</output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1" value="0"></div>';
    $('experiment').onchange = e => {
      if (!indivisibleKeys.includes(e.target.value)) return;
      history.replaceState(null, '', location.pathname + '?case=' + encodeURIComponent(e.target.value));
      configure(e.target.value);
    };
    fields.addEventListener('input', e => {
      if (e.target.dataset.key !== 'filmStep') return;
      step = Math.max(0, Math.min(5, Math.round(Number(e.target.value) || 0)));
      draw();
    });
  }

  function drawLadder(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 600 : 500;
    const people = [...f.people].sort((a, b) => b.v - a.v || b.own - a.own || String(a.id).localeCompare(String(b.id)));
    const maxV = Math.max(10, f.price || 0, ...people.map(p => p.v), f.comparison?.before?.[1] || 0, f.comparison?.after?.[1] || 0) * 1.12;
    const left = small ? 44 : 70, right = W - (small ? 18 : 34), top = 74, bottom = small ? 350 : 326;
    const y = v => bottom - (bottom - top) * Math.max(0, Math.min(maxV, v)) / maxV;
    const n = people.length;
    const x = i => left + (right - left) * (i + .5) / n;
    const interval = f.interval && f.interval[0] <= f.interval[1] ? f.interval : null;
    let s = '';
    s += text(W / 2, 25, f.identity, small ? 14 : 18, C.ink, 'middle', 700);
    s += text(W / 2, 46, f.verdict, small ? 11 : 13, C.muted, 'middle', 600);
    for (let i = 0; i <= 4; i++) {
      const v = maxV * i / 4;
      s += `<line x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}" stroke="${C.rule}"/>` + text(left - 8, y(v) + 4, fmt(v), 10, C.muted, 'end');
    }
    if (interval) {
      const hiY = y(interval[1]), loY = y(interval[0]);
      s += `<rect x="${left}" y="${hiY}" width="${right - left}" height="${Math.max(2, loY - hiY)}" fill="${C.mint}" opacity=".72"/>`;
      s += text(right - 4, Math.max(top + 12, hiY - 6), `可出清价格区间 ${f.intervalText}`, small ? 9 : 11, C.green, 'end', 700);
    }
    const allocated = new Map((f.result?.allocation || []).map(a => [String(a.id), a.has]));
    people.forEach((p, i) => {
      const px = x(i), py = y(p.v), selected = allocated.has(String(p.id)) ? allocated.get(String(p.id)) : p.own;
      const color = p.own ? C.purple : C.green;
      s += `<line x1="${px}" y1="${bottom}" x2="${px}" y2="${py}" stroke="${color}" stroke-width="${n > 20 ? 2 : 5}" opacity=".38"/>`;
      s += `<circle data-motion="indiv-${f.key}-${esc(p.id)}" cx="${px}" cy="${py}" r="${n > 20 ? 3.2 : small ? 5 : 7}" fill="${color}" stroke="${C.paper}" stroke-width="2"/>`;
      if (selected) s += `<rect data-motion="ticket-${f.key}-${esc(p.id)}" x="${px - (n > 20 ? 3 : 7)}" y="${py - (n > 20 ? 13 : 22)}" width="${n > 20 ? 6 : 14}" height="${n > 20 ? 8 : 14}" rx="2" fill="${C.gold}"/>`;
      if (n <= 8) {
        s += text(px, bottom + 18 + (i % 2) * 14, String(p.id).replace(/^(卖者|买者)/, ''), small ? 9 : 11, color, 'middle', 600);
        s += text(px, py - 9, `v=${fmt(p.v)}`, small ? 8 : 10, color, 'middle');
      }
    });
    const py = y(f.price || 0);
    s += `<line data-motion="price-${f.key}" x1="${left}" y1="${py}" x2="${right}" y2="${py}" stroke="${C.red}" stroke-width="3"/>`;
    s += text(right, py - 8, `当前价格 p=${fmt(f.price || 0)}`, small ? 10 : 12, C.red, 'end', 700);
    s += text(left, bottom + (small ? 48 : 42), '紫色：原持有者　绿色：原未持有者　金票：本步持有物品', small ? 9 : 11, C.muted);

    const boxY = small ? 420 : 382, boxH = small ? 158 : 100;
    s += `<rect x="12" y="${boxY}" width="${W - 24}" height="${boxH}" rx="12" fill="${C.soft}" stroke="${C.rule}"/>`;
    if (f.key === 'p2') {
      s += text(24, boxY + 25, '现金检查：愿意买，还要真的付得起', 12, C.ink, 'start', 700);
      s += lines(24, boxY + 49, `价格${fmt(f.price)}元时：2号现金6，3号现金5；市场${f.result.equilibrium ? '可以出清' : '不能出清'}。`, small ? 11 : 13, f.result.equilibrium ? C.green : C.red, 'start', 600, small ? 24 : 52);
    } else if (f.key === 'p5') {
      s += text(24, boxY + 25, `进场成本 c=${fmt(f.comparison.cost)}`, 12, C.ink, 'start', 700);
      s += lines(24, boxY + 49, `卖者有效估值v+c，买者有效估值v−c；变换前区间[4,6]，变换后${f.intervalText}。`, small ? 11 : 13, C.ink, 'start', 600, small ? 24 : 52);
    } else if (f.comparison) {
      s += text(24, boxY + 25, f.comparison.label, 12, C.ink, 'start', 700);
      s += lines(24, boxY + 49, `变化前[${f.comparison.before.join(', ')}]；变化后[${f.comparison.after.join(', ')}]。只比较区间方向，不擅自说严格变化。`, small ? 11 : 13, C.ink, 'start', 600, small ? 24 : 52);
    } else {
      const mandatory = f.result?.mandatory ?? 0, optional = f.result?.optional ?? 0, supply = f.result?.s ?? 0;
      s += text(24, boxY + 25, '出清人数总账', 12, C.ink, 'start', 700);
      s += lines(24, boxY + 49, `必须持有${mandatory}人；无差异可选${optional}人；供给${s}件。当前价格${f.result?.equilibrium ? '能' : '不能'}把物品正好分完。`, small ? 11 : 13, f.result?.equilibrium ? C.green : C.red, 'start', 600, small ? 24 : 52);
    }
    return {W, H, s};
  }

  function drawSpecial(f, small) {
    const W = small ? 320 : 760, H = small ? 580 : 440;
    let s = text(W / 2, 25, f.identity, small ? 14 : 18, C.ink, 'middle', 700) + text(W / 2, 46, f.verdict, small ? 11 : 13, C.muted, 'middle', 600);
    const cardW = small ? 138 : 280, left = small ? 14 : 70, right = small ? 168 : 410, top = 82;
    const card = (x, title, rows, active = false) => {
      let z = `<rect x="${x}" y="${top}" width="${cardW}" height="176" rx="14" fill="${active ? C.mint : C.soft}" stroke="${active ? C.green : C.rule}" stroke-width="${active ? 2 : 1}"/>`;
      z += text(x + 14, top + 28, title, small ? 11 : 15, C.ink, 'start', 700);
      rows.forEach((r, i) => { z += lines(x + 14, top + 55 + i * 36, r, small ? 10 : 12, i === rows.length - 1 ? C.red : C.muted, 'start', i === rows.length - 1 ? 700 : 500, small ? 12 : 26, 16); });
      return z;
    };
    if (f.view === 'transfer') {
      s += card(left, '老王 · 当前持有人', ['物品估值4', '失去物品至少要超过4元', f.transfer.possible ? '本步愿意收下5元' : '本步没有可行补偿'], f.transfer.possible);
      s += card(right, '小李 · 想得到物品', ['物品估值8', `手中现金${fmt(f.transfer.cash)}元`, f.transfer.possible ? '付5元后仍净赚3元' : '现金上限挡住交易'], f.transfer.possible);
      const y = top + 116;
      s += `<path data-motion="transfer-arrow" d="M${right - 8} ${y}H${left + cardW + 8}" stroke="${f.transfer.possible ? C.green : C.red}" stroke-width="4" marker-end="url(#arrow)"/>`;
    } else if (f.view === 'ledger') {
      s += card(left, '买者总账', [`实际付款${fmt(f.ledger.buyerPays)}元`, '若能少付一点就会更好', f.ledger.common ? '所有付款收敛到共同p' : '正在寻找更便宜的重谈价'], f.ledger.common);
      s += card(right, '卖者总账', [`实际收入${fmt(f.ledger.sellerGets)}元`, '若能多收一点就会更好', f.ledger.common ? '所有收入收敛到共同p' : '买卖双方可组成阻挡联盟'], f.ledger.common);
      s += text(W / 2, 285, f.ledger.blockingPrice ? `二人可在${f.ledger.blockingPrice}元重谈：买者少付、卖者多收` : '付款总额＝收入总额，再配合核心约束，只能全部等于同一个p', small ? 10 : 13, f.ledger.common ? C.green : C.red, 'middle', 700);
    } else if (f.view === 'manipulation') {
      s += card(left, '保留“原价格唯一”', ['边界估值都等于p*', '高于、等于、低于p*分三类', '任何一类都不能严格获利'], !f.manipulation.originalUnique);
      s += card(right, '删去唯一性后的对照', ['一卖一买估值0与10', '价格原本可在[0,10]选择', '报告影响选价时才可能获利'], f.manipulation.originalUnique === false);
      s += text(W / 2, 285, f.manipulation.note, small ? 10 : 13, f.manipulation.originalUnique ? C.red : C.gold, 'middle', 700);
    } else {
      s += card(left, 'B仍在场', ['原价格区间[9,10]', '选定价格9', 'A净收益10−9＝1'], !f.exit.after);
      s += card(right, 'B收1.5元退出', ['新区间[0,10]', '选定价格1', `A净收益10−1−1.5＝${fmt(f.exit.afterSurplus)}`], f.exit.after);
      s += text(W / 2, 285, '补偿改变的是参与者集合；获利结论必须连同前后价格选择一起写', small ? 10 : 13, C.red, 'middle', 700);
    }
    const noteY = small ? 332 : 322;
    s += `<rect x="12" y="${noteY}" width="${W - 24}" height="${small ? 220 : 100}" rx="12" fill="${C.paper}" stroke="${C.rule}"/>`;
    s += text(24, noteY + 28, '这一帧真正要看懂的因果', 12, C.ink, 'start', 700);
    s += lines(24, noteY + 55, f.narration, small ? 11 : 13, C.ink, 'start', 500, small ? 23 : 56, small ? 22 : 20);
    return {W, H, s: `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="${C.green}"/></marker></defs>` + s};
  }

  function draw() {
    const f = indivisibleStory(key, step), c = indivisibleContent[key], phase = c.steps[step];
    if ($('filmStep')) $('filmStep').value = step;
    if ($('out-filmStep')) $('out-filmStep').value = String(step);
    if ($('experiment')) $('experiment').value = key;

    let brief = $('indivisible-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'indivisible-brief';
      brief.setAttribute('aria-label', '题目条件与本图任务');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="indivisible-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="indivisible-conditions"></span></p><p class="boundary" id="indivisible-source"></p>';
      $('legend')?.before(brief);
    }
    $('indivisible-question').textContent = c.question;
    $('indivisible-conditions').textContent = c.conditions;
    $('indivisible-source').textContent = `教材边界：${c.source}`;

    const plot = $('plot');
    if (plot) {
      Object.assign(plot.dataset, {filmIntro: c.question, filmPhase: phase[0], filmNarration: phase[1], filmConclusion: c.steps[5][1]});
      const small = plot.clientWidth < 500;
      const rendered = ['transfer', 'ledger', 'manipulation', 'exit'].includes(f.view) ? drawSpecial(f, small) : drawLadder(f, small);
      window.microMotion.chart(plot, `<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${esc(c.title + '：' + phase[0])}"><rect width="${rendered.W}" height="${rendered.H}" fill="${C.paper}"/>${rendered.s}</svg>`);
    }
    if ($('legend')) $('legend').textContent = '同一件金色物品沿时间线移动；紫色是初始持有者，绿色是初始未持有者，红线是本步共同价格。动画只改变当前证明所需的一个条件。';
    if ($('metrics')) $('metrics').innerHTML = [
      ['当前讲解', `${step + 1}/6 · ${phase[0]}`],
      ['关键结论', f.verdict],
      ['本题范围', key.startsWith('p') ? '教材习题与条件校准' : '教材定义／命题／例子']
    ].map(([a, b]) => `<div class="metric"><label>${esc(a)}</label><strong>${esc(b)}</strong></div>`).join('');
    if ($('reading')) $('reading').textContent = phase[1];
    if ($('formula')) $('formula').textContent = c.formula;
    if ($('boundary')) $('boundary').textContent = c.trap;
    if ($('extra')) $('extra').innerHTML = `<h3>严谨证明或计算路线</h3><ol>${c.proof.map(x => `<li>${esc(x)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(c.template)}</p><h3>最容易混淆</h3><p>${esc(c.trap)}</p><p>来源：Osborne–Rubinstein ${esc(c.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((el, i) => { el.textContent = [c.question, c.conditions, c.template][i] || ''; });
    const guideBoundary = document.querySelector('.study-guide>.boundary');
    if (guideBoundary) guideBoundary.textContent = '生活引入与数值构造会明确标“自主构造”；教材定义、命题与原题条件不会混写。';
    const dl = document.querySelector('.lesson-end a[download]');
    if (dl) {
      dl.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/') ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/' : '') + `downloads/ch11-indivisible-${key}.html`;
      dl.textContent = '下载本段完整动画代码 ↓';
    }
    window.microMath?.refresh?.();
  }

  function configure(nextKey) {
    key = indivisibleKeys.includes(nextKey) ? nextKey : indivisibleKeys[0];
    window.INDIVISIBLE_DEFAULT = key;
    const q = new URLSearchParams(location.search);
    const n = Number(q.get('filmStep'));
    step = (q.get('case') === key || !q.has('case')) && Number.isFinite(n) ? Math.max(0, Math.min(5, Math.round(n))) : 0;
    draw();
  }
  const advance = () => {
    if (step >= 5) return true;
    step += 1;
    draw();
    return step >= 5;
  };

  ensureControls();
  if ($('advance')) $('advance').onclick = advance;
  if ($('play')) $('play').onclick = advance;
  if ($('reset')) $('reset').onclick = () => configure(key);
  window.addEventListener('resize', draw);
  window.demo = {get state() { return {key, step}; }, advance, draw, configure};
  configure(key);
}

window.startIndivisibleStory = startIndivisibleStory;

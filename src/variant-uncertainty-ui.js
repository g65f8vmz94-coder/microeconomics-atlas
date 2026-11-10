import {uncertaintyContent, uncertaintyKeys} from './variant-uncertainty-content.mjs';
import {uncertaintyStory} from './variant-uncertainty-story.mjs';

export function startUncertaintyStory(requested) {
  const $ = id => document.getElementById(id);
  const C = {
    ink: '#263f37', muted: '#6f8075', green: '#177468', red: '#bd624c',
    purple: '#74618d', gold: '#b18429', blue: '#4b718f', rule: '#d7e0d5',
    paper: '#fffdf7', soft: '#f3f6f1', mint: '#e5efe9', rose: '#fff1ed', sky: '#edf4f6'
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const fmt = (n, d = 2) => Number.isFinite(Number(n)) ? Number(Number(n).toFixed(d)).toLocaleString('zh-CN', {maximumFractionDigits: d}) : String(n);
  const text = (x, y, value, size = 12, color = C.ink, anchor = 'start', weight = 400) => `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
  const wrap = (value, limit = 22, max = 3) => {
    const s = String(value), out = [];
    for (let i = 0; i < s.length; i += limit) out.push(s.slice(i, i + limit));
    return out.slice(0, max);
  };
  const lines = (x, y, value, size, color, anchor = 'start', weight = 400, limit = 22, gap = 20, max = 3) => wrap(value, limit, max).map((s, i) => text(x, y + i * gap, s, size, color, anchor, weight)).join('');

  const query = new URLSearchParams(location.search);
  let key = uncertaintyKeys.includes(requested) ? requested
    : uncertaintyKeys.includes(window.UNCERTAINTY_DEFAULT) ? window.UNCERTAINTY_DEFAULT
      : uncertaintyKeys.includes(query.get('case')) ? query.get('case') : uncertaintyKeys[0];
  let step = 0;
  let timer = null;

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if ($('play')) $('play').textContent = '播放整段';
  }

  function ensureControls() {
    const fields = $('fields');
    if (!fields) return;
    fields.innerHTML = `<div class="field"><label for="experiment">本节知识点或原题</label><select id="experiment">${uncertaintyKeys.map(k => `<option value="${k}">${esc(uncertaintyContent[k].title)}</option>`).join('')}</select></div>` +
      '<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep">0</output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1" value="0"></div>';
    $('experiment').onchange = event => {
      if (!uncertaintyKeys.includes(event.target.value)) return;
      history.replaceState(null, '', location.pathname + '?case=' + encodeURIComponent(event.target.value));
      configure(event.target.value);
    };
    fields.addEventListener('input', event => {
      if (event.target.dataset.key !== 'filmStep') return;
      stop();
      step = Math.max(0, Math.min(5, Math.round(Number(event.target.value) || 0)));
      draw();
    });
  }

  function topLabels(f, W, small) {
    return text(W / 2, 25, f.identity, small ? 14 : 18, C.ink, 'middle', 750) +
      text(W / 2, 47, f.verdict, small ? 10 : 12, C.muted, 'middle', 650);
  }

  function stateChart(f, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const bundles = f.current || f.final;
    const initial = f.initial || bundles;
    const labels = f.labels || (f.kind === 'time' ? ['第1代', '第2代'] : ['1号', '2号']);
    const values = [...bundles.flat(), ...initial.flat(), ...(f.final || []).flat()];
    const max = Math.max(1, ...values) * 1.14;
    const base = small ? 380 : 330, chartTop = 82, range = base - chartTop;
    const y = v => base - range * Math.max(0, v) / max;
    const centers = small ? [92, 228] : [230, 530];
    const barW = small ? 30 : 48, gap = small ? 7 : 12;
    let s = topLabels(f, W, small);
    for (let i = 0; i <= 4; i++) {
      const v = max * i / 4, yy = y(v);
      s += `<line x1="${small ? 36 : 72}" y1="${yy}" x2="${W - (small ? 18 : 36)}" y2="${yy}" stroke="${C.rule}"/>`;
      s += text(small ? 31 : 64, yy + 4, fmt(v, max > 20 ? 0 : 1), 9, C.muted, 'end');
    }
    labels.forEach((label, i) => {
      const cx = centers[i];
      [0, 1].forEach(k => {
        const x = cx + (k ? gap : -barW - gap);
        const current = bundles[i][k], start = initial[i][k];
        const yy = y(current), h = base - yy;
        s += `<rect x="${x}" y="${y(start)}" width="${barW}" height="${Math.max(2, base - y(start))}" rx="5" fill="none" stroke="${k ? C.green : C.red}" stroke-dasharray="4 4" opacity=".42"/>`;
        s += `<rect data-motion="uncertainty-${f.key}-${i}-${k}" x="${x}" y="${yy}" width="${barW}" height="${Math.max(2, h)}" rx="5" fill="${k ? C.green : C.red}" opacity=".88"/>`;
        s += text(x + barW / 2, Math.max(chartTop + 11, yy - 7), fmt(current, max > 20 ? 0 : 2), small ? 9 : 11, k ? C.green : C.red, 'middle', 700);
        s += text(x + barW / 2, base + 16, k ? (f.kind === 'time' ? '第2期' : '状态2') : (f.kind === 'time' ? '第1期' : '状态1'), small ? 8 : 10, C.muted, 'middle');
      });
      s += text(cx, base + 40, label, small ? 11 : 13, C.ink, 'middle', 700);
    });
    const totals = f.totals || bundles.reduce((z, b) => [z[0] + b[0], z[1] + b[1]], [0, 0]);
    const panelY = small ? 448 : 386;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 178 : 94}" rx="13" fill="${C.soft}" stroke="${C.rule}"/>`;
    s += text(24, panelY + 26, f.kind === 'time' ? '跨期总账与相对价格' : '两种状态分别对账', 12, C.ink, 'start', 750);
    s += text(24, panelY + 51, `${f.kind === 'time' ? '第1期' : '状态1'}总量 ${fmt(totals[0])}`, small ? 10 : 12, C.red, 'start', 650);
    s += text(small ? 166 : 225, panelY + 51, `${f.kind === 'time' ? '第2期' : '状态2'}总量 ${fmt(totals[1])}`, small ? 10 : 12, C.green, 'start', 650);
    if (Number.isFinite(f.priceRatio)) {
      const fair = Number.isFinite(f.fairRatio) ? `；概率比为 ${fmt(f.fairRatio)}` : '';
      s += lines(24, panelY + 78, `状态1与状态2的价格比为 ${fmt(f.priceRatio)}${fair}`, small ? 10 : 12, f.fairRatio && f.priceRatio > f.fairRatio + 1e-8 ? C.red : C.ink, 'start', 650, small ? 26 : 56, 18, 2);
    } else {
      s += lines(24, panelY + 78, `归一化后，状态1价格份额为 ${fmt(f.priceShare)}`, small ? 10 : 12, C.ink, 'start', 650, small ? 26 : 56, 18, 2);
    }
    if (f.axisNote) s += lines(24, panelY + (small ? 118 : 78), f.axisNote, 10, f.step === 4 ? C.red : C.muted, 'start', f.step === 4 ? 700 : 500, small ? 27 : 54, 18, 2);
    if (small) s += text(24, panelY + 158, '虚线是初始束；实色柱是当前帧。', 9, C.muted, 'start');
    return {W, H, s};
  }

  function insurerChart(f, small) {
    const W = small ? 320 : 760, H = small ? 690 : 500;
    const full = f.full, partial = f.partial;
    let s = topLabels(f, W, small);
    const panel = (x, y, width, height, title, capital, result, active) => {
      let z = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="${active ? C.mint : C.soft}" stroke="${active ? C.green : C.rule}" stroke-width="${active ? 2 : 1}"/>`;
      z += text(x + 14, y + 28, title, small ? 11 : 14, C.ink, 'start', 750);
      z += text(x + 14, y + 52, `资本 ${fmt(capital)}；全保门槛 ${fmt(f.threshold)}`, small ? 9 : 11, active ? C.green : C.muted, 'start', 650);
      const barY = y + 76, barW = width - 28, filled = Math.min(1, capital / f.threshold) * barW;
      z += `<rect x="${x + 14}" y="${barY}" width="${barW}" height="12" rx="6" fill="${C.rule}"/>`;
      z += `<rect data-motion="capital-${title}" x="${x + 14}" y="${barY}" width="${filled}" height="12" rx="6" fill="${active ? C.green : C.gold}"/>`;
      z += text(x + 14, y + 111, `每位投保人：(${fmt(result.x1)}, ${fmt(result.x2)})`, small ? 9 : 11, C.ink, 'start', 650);
      z += text(x + 14, y + 134, `保险人：(${result.insurerBundle.map(x => fmt(x)).join(', ')})`, small ? 9 : 11, C.ink, 'start');
      z += text(x + 14, y + 157, `状态1价格比 ${fmt(result.p)}；${result.full ? '完全保险' : '部分保险'}`, small ? 9 : 11, result.full ? C.green : C.red, 'start', 750);
      return z;
    };
    if (small) {
      s += panel(14, 78, 292, 176, '资本充足', f.richCapital, full, f.activeCase === 'full');
      s += panel(14, 270, 292, 176, '资本不足', f.poorCapital, partial, f.activeCase === 'partial');
    } else {
      s += panel(42, 84, 320, 184, '资本充足', f.richCapital, full, f.activeCase === 'full');
      s += panel(398, 84, 320, 184, '资本不足', f.poorCapital, partial, f.activeCase === 'partial');
    }
    const y = small ? 470 : 300;
    s += `<rect x="12" y="${y}" width="${W - 24}" height="${small ? 188 : 150}" rx="13" fill="${C.paper}" stroke="${C.rule}"/>`;
    s += text(24, y + 27, '这一帧真正要追的资源流', 12, C.ink, 'start', 750);
    s += lines(24, y + 55, f.narration, small ? 10 : 12, C.ink, 'start', 500, small ? 25 : 62, small ? 21 : 20, small ? 5 : 4);
    s += text(24, y + (small ? 164 : 129), `当前：资本${f.activeCase === 'full' ? '达到' : '低于'}门槛；保险人灾年终值 ${fmt(f.active.insurerBundle[0])}`, small ? 9 : 11, f.activeCase === 'full' ? C.green : C.red, 'start', 700);
    return {W, H, s};
  }

  function showChart(f, small) {
    const W = small ? 320 : 760, H = small ? 640 : 500;
    const left = small ? 42 : 74, right = W - (small ? 18 : 34), top = 84, bottom = small ? 365 : 330;
    const y = v => bottom - (bottom - top) * v / 10;
    const x = i => left + (right - left) * (i + 0.5) / f.people.length;
    const allocation = new Map(f.result.allocation.map(p => [p.id, p.has]));
    let s = topLabels(f, W, small);
    for (let v = 0; v <= 10; v += 2.5) {
      s += `<line x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}" stroke="${C.rule}"/>` + text(left - 7, y(v) + 4, fmt(v, 1), 9, C.muted, 'end');
    }
    f.people.forEach((p, i) => {
      const px = x(i), py = y(p.v), has = f.step < 3 ? p.own : allocation.get(p.id);
      s += `<line x1="${px}" y1="${bottom}" x2="${px}" y2="${py}" stroke="${p.own ? C.purple : C.green}" stroke-width="5" opacity=".35"/>`;
      s += `<circle data-motion="show-person-${p.id}" cx="${px}" cy="${py}" r="${small ? 6 : 8}" fill="${p.own ? C.purple : C.green}" stroke="${C.paper}" stroke-width="2"/>`;
      if (has) s += `<path data-motion="show-ticket-${p.id}" d="M${px - 9} ${py - 27}h18v14h-18z" fill="${C.gold}" stroke="${C.paper}"/>`;
      s += text(px, bottom + 18, `${p.id}号`, small ? 9 : 11, C.ink, 'middle', 650);
      s += text(px, bottom + 35, `概率 ${fmt(p.chance)}`, small ? 8 : 10, C.muted, 'middle');
    });
    if (f.step > 0) {
      s += `<line data-motion="show-price" x1="${left}" y1="${y(f.price)}" x2="${right}" y2="${y(f.price)}" stroke="${C.red}" stroke-width="3"/>`;
      s += text(right, y(f.price) - 8, `票价 ${fmt(f.price)}`, small ? 9 : 11, C.red, 'end', 750);
    }
    const panelY = small ? 430 : 388;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 176 : 86}" rx="13" fill="${C.soft}" stroke="${C.rule}"/>`;
    s += text(24, panelY + 25, '天气进入估值，而不是进入退款', 12, C.ink, 'start', 750);
    s += lines(24, panelY + 50, `个人估值是开演概率的10倍；两张票的均衡价从 ${fmt(f.interval[0])} 到 ${fmt(f.interval[1])}。当前价格${f.result.equilibrium ? '可以' : '不能'}出清。`, small ? 10 : 12, f.result.equilibrium ? C.green : C.red, 'start', 650, small ? 26 : 62, 20, 4);
    return {W, H, s};
  }

  function betChart(f, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const left = small ? 38 : 70, right = W - (small ? 18 : 35), top = 78, bottom = small ? 350 : 320;
    const y = v => bottom - (bottom - top) * v;
    const x = i => left + (right - left) * i / (f.values.length - 1);
    let s = topLabels(f, W, small);
    for (const v of [0, 0.25, 0.5, 0.75, 1]) {
      s += `<line x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}" stroke="${C.rule}"/>` + text(left - 7, y(v) + 4, fmt(v), 9, C.muted, 'end');
    }
    f.values.forEach((v, i) => {
      const side = v > f.price + 1e-8 ? 'A' : v < f.price - 1e-8 ? 'B' : 'A或B';
      const color = side === 'A' ? C.green : side === 'B' ? C.red : C.purple;
      s += `<circle data-motion="bettor-${i}" cx="${x(i)}" cy="${y(v)}" r="${small ? 5 : 8}" fill="${color}" stroke="${C.paper}" stroke-width="2"/>`;
      s += text(x(i), bottom + 18 + (i % 2) * 14, String(i + 1), small ? 8 : 10, C.ink, 'middle', 650);
    });
    s += `<line data-motion="bet-price" x1="${left}" y1="${y(f.price)}" x2="${right}" y2="${y(f.price)}" stroke="${C.ink}" stroke-width="3"/>`;
    s += text(right, y(f.price) - 8, `价格 ${fmt(f.price, 3)}`, small ? 9 : 11, C.ink, 'end', 750);
    const panelY = small ? 420 : 375;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 202 : 101}" rx="13" fill="${C.soft}" stroke="${C.rule}"/>`;
    const strictA = f.result.strict, tie = f.result.ties, can = f.result.equilibrium;
    s += text(24, panelY + 26, `严格押A ${strictA}人；无差异 ${tie}人；${can ? '可配成4比4' : '不能配成4比4'}`, small ? 10 : 12, can ? C.green : C.red, 'start', 750);
    if (f.key === 'p9a') {
      for (let i = 0; i < 4; i++) {
        const active = i < f.pairCount, bx = small ? 25 + (i % 2) * 142 : 40 + i * 172, by = small ? panelY + 58 + Math.floor(i / 2) * 58 : panelY + 54;
        s += `<rect data-motion="bet-pair-${i}" x="${bx}" y="${by}" width="${small ? 128 : 150}" height="42" rx="8" fill="${active ? C.mint : C.paper}" stroke="${active ? C.green : C.rule}"/>`;
        s += text(bx + (small ? 64 : 75), by + 17, 'A注一张，B注一张', small ? 8 : 9, C.ink, 'middle', 650);
        s += text(bx + (small ? 64 : 75), by + 34, '合计收1；任一结果赔1', small ? 8 : 9, active ? C.green : C.muted, 'middle');
      }
    } else {
      s += lines(24, panelY + 55, `均衡价格从 ${fmt(f.interval[0])} 到 ${fmt(f.interval[1])}；端点由无差异者补到四人。当前价格${can ? '属于' : '不属于'}该区间。`, small ? 10 : 12, can ? C.green : C.red, 'start', 650, small ? 26 : 62, 20, 4);
    }
    return {W, H, s};
  }

  function draw() {
    const f = uncertaintyStory(key, step), content = uncertaintyContent[key], phase = content.steps[step];
    if ($('filmStep')) $('filmStep').value = step;
    if ($('out-filmStep')) $('out-filmStep').value = String(step);
    if ($('experiment')) $('experiment').value = key;

    let brief = $('uncertainty-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'uncertainty-brief';
      brief.setAttribute('aria-label', '题目条件与本图任务');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="uncertainty-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="uncertainty-conditions"></span></p><p class="boundary" id="uncertainty-source"></p>';
      $('legend')?.before(brief);
    }
    $('uncertainty-question').textContent = content.question;
    $('uncertainty-conditions').textContent = content.conditions;
    $('uncertainty-source').textContent = `教材边界：${content.source}`;

    const plot = $('plot');
    if (plot) {
      Object.assign(plot.dataset, {
        filmIntro: content.question, filmPhase: phase[0],
        filmNarration: phase[1], filmConclusion: content.steps[5][1]
      });
      const small = plot.clientWidth < 500;
      const rendered = f.kind === 'insurer' ? insurerChart(f, small)
        : f.kind === 'show' ? showChart(f, small)
          : f.kind === 'bets' ? betChart(f, small)
            : stateChart(f, small);
      window.microMotion.chart(plot, `<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${esc(content.title + '：' + phase[0])}"><rect width="${rendered.W}" height="${rendered.H}" fill="${C.paper}"/>${rendered.s}</svg>`);
    }
    if ($('legend')) $('legend').textContent = f.kind === 'show'
      ? '紫色是初始持票人，绿色是初始无票者，金色票券沿同一组人移动，红线是本步价格。'
      : f.kind === 'bets'
        ? '绿色严格押A，红色严格押B，紫色在价格线上无差异；价格线只切分选择，不预测谁最终当选。'
        : '红色始终代表状态1（或第1期），绿色始终代表状态2（或第2期）；虚线保留初始禀赋，实色显示当前帧。';
    if ($('metrics')) $('metrics').innerHTML = [
      ['当前讲解', `${step + 1}/6 · ${phase[0]}`],
      ['关键结论', f.verdict],
      ['本题范围', key.startsWith('p') ? '教材习题与可套用解法' : '教材定义／命题／例子']
    ].map(([a, b]) => `<div class="metric"><label>${esc(a)}</label><strong>${esc(b)}</strong></div>`).join('');
    if ($('reading')) $('reading').textContent = phase[1];
    if ($('formula')) $('formula').textContent = content.formula;
    if ($('boundary')) $('boundary').textContent = content.trap;
    if ($('extra')) $('extra').innerHTML = `<h3>解题步骤</h3><ol>${content.proof.map(x => `<li>${esc(x)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(content.template)}</p><h3>最容易混淆</h3><p>${esc(content.trap)}</p><p>来源：Osborne–Rubinstein ${esc(content.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((el, i) => { el.textContent = [content.question, content.conditions, content.template][i] || ''; });
    const guideBoundary = document.querySelector('.study-guide>.boundary');
    if (guideBoundary) guideBoundary.textContent = '教材结论、原题条件、自主数值图和原文排版校正分开标注；先用状态价格写个人预算，再按状态逐一检查出清。';
    const dl = document.querySelector('.lesson-end a[download]');
    if (dl) {
      dl.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/') ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/' : '') + `downloads/ch11-uncertainty-${key}.html`;
      dl.textContent = '下载本段完整动画代码 ↓';
    }
    window.microMath?.refresh?.();
  }

  function configure(nextKey) {
    stop();
    key = uncertaintyKeys.includes(nextKey) ? nextKey : uncertaintyKeys[0];
    window.UNCERTAINTY_DEFAULT = key;
    const q = new URLSearchParams(location.search);
    const requestedStep = Number(q.get('filmStep'));
    step = (q.get('case') === key || !q.has('case')) && Number.isFinite(requestedStep)
      ? Math.max(0, Math.min(5, Math.round(requestedStep))) : 0;
    draw();
  }

  const advance = () => {
    if (step >= 5) return true;
    step += 1;
    draw();
    return step >= 5;
  };

  ensureControls();
  if ($('advance')) $('advance').onclick = () => { stop(); advance(); };
  if ($('play')) $('play').onclick = () => {
    if (timer) { stop(); return; }
    if (window.microMotion?.reduced?.matches) { advance(); return; }
    if (step >= 5) step = 0;
    advance();
    timer = setInterval(() => { if (advance()) stop(); }, 1700);
    $('play').textContent = '暂停播放';
  };
  if ($('reset')) $('reset').onclick = () => configure(key);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.microMotion?.reduced?.addEventListener?.('change', stop);
  window.addEventListener('resize', draw);
  window.demo = {get state() { return {key, step}; }, advance, draw, configure};
  configure(key);
}

window.startUncertaintyStory = startUncertaintyStory;

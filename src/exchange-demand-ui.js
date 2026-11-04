import {demandKeys, demandStory} from './exchange-demand-story.mjs';
import {demandContent} from './exchange-demand-content.mjs';

export function startDemandStory(requested) {
  const $ = id => document.getElementById(id);
  const C = {
    ink: '#2c433a',
    muted: '#6b7c70',
    rice: '#177468',
    bean: '#ab8124',
    red: '#bf634e',
    rule: '#d9e2d7',
    paper: '#fffdf7',
    cardBg: '#f6f8f5',
    activeBg: '#e6efe9',
    warnBg: '#fff6f3'
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const splitVerdict = text => {
    if (text.length <= 18) return [text, ''];
    const puncs = ['；', '，', '。', '：'];
    let best = -1;
    let minDiff = 999;
    for (let i = 8; i < text.length - 6; i++) {
      if (puncs.includes(text[i])) {
        const diff = Math.abs(i - (text.length / 2));
        if (diff < minDiff) {
          minDiff = diff;
          best = i + 1;
        }
      }
    }
    if (best === -1) best = Math.ceil(text.length / 2);
    return [text.slice(0, best), text.slice(best)];
  };
  const num = x => String(+Number(x).toFixed(2));
  const txt = (x, y, s, size = 12, color = C.ink, anchor = 'start', weight = 'normal') =>
    `<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;

  let key = demandKeys.includes(requested) ? requested : demandKeys[0];
  let step = 0;

  const fields = $('fields');
  if (fields && !$('experiment')) {
    fields.insertAdjacentHTML('beforebegin',
      '<div class="field"><label for="experiment">本节连贯讲解</label><select id="experiment">' +
      demandKeys.map(k => '<option value="' + k + '">' + esc(demandContent[k].title) + '</option>').join('') +
      '<option value="nonrational">保留原例：非理性化需求</option><option value="multiple">保留原例：三个零点</option><option value="cd">保留原例：CD交换</option></select></div>'
    );
  }

  function configure(k) {
    key = k;
    window.DEMAND_DEFAULT = key;
    const q = new URLSearchParams(location.search);
    const n = Number(q.get('filmStep'));
    step = (q.get('case') === key || !q.has('case')) && Number.isFinite(n)
      ? Math.max(0, Math.min(5, Math.round(n)))
      : 0;
    if ($('experiment')) $('experiment').value = key;
    if ($('fields')) {
      $('fields').innerHTML = '<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep"></output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1"></div>';
    }
    const plot = $('plot');
    if (plot && plot.closest('.stage')) plot.closest('.stage').classList.add('jungle-intro');
    draw();
  }

  // View 1: Demand & Market Clearing Ledger (model107, highprice105, lowprice105)
  function drawLedgerView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 720 : 520;
    const ev = f.ev;
    let s = '';

    s += txt(W / 2, 24, f.identity, small ? 12 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, `米价${num(ev.p1)}元、豆价1元；甲米${num(ev.alpha)}、乙豆${num(ev.beta)}`, small ? 11 : 13, C.muted, 'middle');

    const cardW = small ? 296 : 350;
    const cardH = small ? 186 : 196;
    const agents = [
      {
        name: '甲（只买贵货，同价买米）',
        endow: [ev.alpha, 0],
        wealth: ev.w1,
        demand: ev.d1,
        rule: ev.rule1
      },
      {
        name: '乙（按米豆总重量选便宜货）',
        endow: [0, ev.beta],
        wealth: ev.w2,
        demand: ev.d2,
        rule: ev.rule2
      }
    ];

    for (let i = 0; i < 2; i++) {
      const a = agents[i];
      const ox = small ? 12 : (i === 0 ? 20 : 390);
      const oy = small ? (60 + i * 198) : 62;

      s += `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="10" fill="${C.cardBg}" stroke="${C.rule}"/>`;
      s += txt(ox + 14, oy + 22, a.name, 13, C.ink, 'start', 'bold');
      s += txt(ox + 14, oy + 42, `原家底：米${num(a.endow[0])}、豆${num(a.endow[1])}（财富${num(a.wealth)}元）`, 11, C.muted);
      s += txt(ox + 14, oy + 62, `本步规则：${a.rule}`, 11, C.rice, 'start', 'bold');
      s += txt(ox + 14, oy + 82, `本步需求：米${num(a.demand[0])}千克、豆${num(a.demand[1])}千克`, 11, C.ink, 'start', 'bold');

      const bx = ox + 46;
      const bw = cardW - 60;
      const scale = bw / 2.8;

      // Rice bar
      s += txt(ox + 14, oy + 110, '米', 11, C.rice, 'start', 'bold');
      s += `<rect x="${bx}" y="${oy + 98}" width="${a.endow[0] * scale}" height="16" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
      s += `<rect data-motion="dem-${f.key}-r-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 102}" width="${a.demand[0] * scale}" height="8" fill="${C.rice}"/>`;

      // Bean bar
      s += txt(ox + 14, oy + 140, '豆', 11, C.bean, 'start', 'bold');
      s += `<rect x="${bx}" y="${oy + 128}" width="${a.endow[1] * scale}" height="16" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
      s += `<rect data-motion="dem-${f.key}-b-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 132}" width="${a.demand[1] * scale}" height="8" fill="${C.bean}"/>`;

      s += txt(ox + 14, oy + 168, '虚框为原家底；实条为本步需求量', 11, C.muted);
    }

    // Bottom Market Clearing Ledger
    const botY = small ? 458 : 274;
    const botW = W - 24;
    const botH = small ? 248 : 230;
    const eq = ev.isEquilibrium;

    s += `<rect x="12" y="${botY}" width="${botW}" height="${botH}" rx="12" fill="#ffffff" stroke="${eq ? C.rice : C.red}" stroke-width="${eq ? 2 : 1}"/>`;
    s += txt(24, botY + 26, '全市场出清总账：总需求是否等于总家底', small ? 13 : 16, C.ink, 'start', 'bold');

    const bx = small ? 58 : 110;
    const maxW = small ? 236 : 480;
    const maxU = 3.0;

    // Total Rice
    const rY = botY + 46;
    s += txt(24, rY + 14, '总米', 12, C.rice, 'start', 'bold');
    s += `<rect x="${bx}" y="${rY}" width="${(ev.totalEndowment[0] / maxU) * maxW}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="dem-${f.key}-tot-r" data-motion-clamp="true" x="${bx}" y="${rY + 4}" width="${(ev.totalDemand[0] / maxU) * maxW}" height="10" fill="${Math.abs(ev.excess[0]) < 1e-6 ? C.rice : C.red}"/>`;
    s += txt(bx, rY + 34, `原有${num(ev.totalEndowment[0])}千克；本步总需求${num(ev.totalDemand[0])}千克`, 11, C.ink);

    // Total Bean
    const bY = botY + 98;
    s += txt(24, bY + 14, '总豆', 12, C.bean, 'start', 'bold');
    s += `<rect x="${bx}" y="${bY}" width="${(ev.totalEndowment[1] / maxU) * maxW}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="dem-${f.key}-tot-b" data-motion-clamp="true" x="${bx}" y="${bY + 4}" width="${(ev.totalDemand[1] / maxU) * maxW}" height="10" fill="${Math.abs(ev.excess[1]) < 1e-6 ? C.bean : C.red}"/>`;
    s += txt(bx, bY + 34, `原有${num(ev.totalEndowment[1])}千克；本步总需求${num(ev.totalDemand[1])}千克`, 11, C.ink);

    const statusLine = eq
      ? (ev.eqType === 'no-trade' ? '市场出清：构成高价区无交易竞争均衡' : '市场出清：构成低价区完全互换竞争均衡')
      : '供需不相等：当前价格下市场未能出清';
    s += txt(W / 2, botY + 162, statusLine, small ? 12 : 14, eq ? C.rice : C.red, 'middle', 'bold');

    if (small) {
      const [l1, l2] = splitVerdict(f.verdict);
      s += txt(W / 2, botY + 190, l1, 11, C.ink, 'middle');
      s += txt(W / 2, botY + 210, l2, 11, C.ink, 'middle');
      s += txt(W / 2, botY + 232, '虚框为社会总家底；实条为本步总需求', 10, C.muted, 'middle');
    } else {
      s += txt(W / 2, botY + 190, f.verdict, 13, C.ink, 'middle');
      s += txt(W / 2, botY + 214, '虚线框代表全社会总家底；实色条代表本步两人需求之和。', 12, C.muted, 'middle');
    }

    return {W, H, s};
  }

  // View 2: Rules & Non-Rationalizability Inspection (rule105)
  function drawRulesView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 680 : 500;
    const ev = f.ev;
    let s = '';

    s += txt(W / 2, 24, f.identity, small ? 12 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, `米价${num(ev.p1)}元、豆价1元；甲财富${num(ev.w1)}元`, small ? 11 : 13, C.muted, 'middle');

    // Top price-axis bar showing p1 relative to threshold 1.0
    const pBoxY = 58;
    const pBoxH = small ? 114 : 110;
    s += `<rect x="12" y="${pBoxY}" width="${W - 24}" height="${pBoxH}" rx="10" fill="${C.cardBg}" stroke="${C.rule}"/>`;
    s += txt(24, pBoxY + 24, '甲与乙的分段购买规则对照（分界点：米价1元）', small ? 12 : 15, C.ink, 'start', 'bold');

    const lineL = small ? 32 : 60;
    const lineR = W - lineL;
    const lineY = pBoxY + 58;
    const X = p => lineL + ((p - 0.3) / 1.5) * (lineR - lineL);

    s += `<rect x="${X(0.3)}" y="${lineY - 14}" width="${X(1.0) - X(0.3)}" height="28" fill="#fdf2ee"/>`;
    s += `<rect x="${X(1.0)}" y="${lineY - 14}" width="${X(1.8) - X(1.0)}" height="28" fill="#e6efe9"/>`;
    s += `<line x1="${lineL}" y1="${lineY}" x2="${lineR}" y2="${lineY}" stroke="${C.ink}" stroke-width="2"/>`;
    for (const v of [0.5, 0.6, 1.0, 1.5]) {
      s += `<line x1="${X(v)}" y1="${lineY - 6}" x2="${X(v)}" y2="${lineY + 6}" stroke="${C.ink}"/>`;
      s += txt(X(v), lineY + 22, `${num(v)}元`, 10, C.muted, 'middle');
    }
    s += `<circle data-motion="dem-rule-p" cx="${X(ev.p1)}" cy="${lineY}" r="7" fill="${ev.p1 >= 1 ? C.rice : C.red}"/>`;
    s += txt(W / 2, pBoxY + 102, ev.p1 >= 1 ? '当前在右区（米不比豆便宜）：甲只买米，乙只买豆' : '当前在左区（豆比米贵）：甲全买豆，乙全买米', small ? 11 : 13, ev.p1 >= 1 ? C.rice : C.red, 'middle', 'bold');

    // Middle 2 comparison cards for non-rationalizability proof
    const cY = small ? 184 : 182;
    const cW = small ? 296 : 350;
    const cH = small ? 140 : 146;

    // Card A: Price 0.5 choice
    const c1X = small ? 12 : 20;
    s += `<rect x="${c1X}" y="${cY}" width="${cW}" height="${cH}" rx="10" fill="${f.step === 3 ? C.warnBg : '#ffffff'}" stroke="${f.step === 3 ? C.red : C.rule}" stroke-width="${f.step === 3 ? 2 : 1}"/>`;
    s += txt(c1X + 14, cY + 24, '证据一：当米价0.5元、豆价1元时', 13, C.ink, 'start', 'bold');
    s += txt(c1X + 14, cY + 48, '甲有1元，买得起（米2，豆0）', 12, C.muted);
    s += txt(c1X + 14, cY + 70, '需求函数选了（米0，豆1）', 12, C.red, 'start', 'bold');
    s += txt(c1X + 14, cY + 94, '若能理性化，只能先推出：', 11, C.muted);
    s += txt(c1X + 14, cY + 116, '（米0，豆1）不差于（米2，豆0）', 12, C.ink, 'start', 'bold');

    // Card B: Price 1.0 choice
    const c2X = small ? 12 : 390;
    const c2Y = small ? 336 : 182;
    s += `<rect x="${c2X}" y="${c2Y}" width="${cW}" height="${cH}" rx="10" fill="${f.step >= 4 ? C.warnBg : '#ffffff'}" stroke="${f.step >= 4 ? C.red : C.rule}" stroke-width="${f.step >= 4 ? 2 : 1}"/>`;
    s += txt(c2X + 14, c2Y + 24, '证据二：当米价1元、豆价1元时', 13, C.ink, 'start', 'bold');
    s += txt(c2X + 14, c2Y + 48, '甲有2元，完全买得起（米0，豆1.5）', 12, C.muted);
    s += txt(c2X + 14, c2Y + 70, '最优性给出（2，0）不差于（0，1.5）', 12, C.rice, 'start', 'bold');
    s += txt(c2X + 14, c2Y + 94, '单调性：（0，1.5）严格好于（0，1）', 11, C.red, 'start', 'bold');
    s += txt(c2X + 14, c2Y + 116, '三条关系拼成传递性矛盾，无法理性化', 12, C.red, 'start', 'bold');

    // Bottom summary box
    const botY = small ? 488 : 344;
    const botH = small ? 178 : 140;
    s += `<rect x="12" y="${botY}" width="${W - 24}" height="${botH}" rx="10" fill="#ffffff" stroke="${C.rule}"/>`;
    s += txt(24, botY + 26, `本步甲需求：米${num(ev.d1[0])}、豆${num(ev.d1[1])}；乙需求：米${num(ev.d2[0])}、豆${num(ev.d2[1])}`, small ? 11 : 14, C.ink, 'start', 'bold');

    const bx = 24;
    const bw = small ? 272 : 680;
    const scale = bw / 2.5;
    s += `<rect data-motion="dem-rule-bar1" data-motion-clamp="true" x="${bx}" y="${botY + 40}" width="${(ev.d1[0] + ev.d1[1]) * scale}" height="12" fill="${C.rice}"/>`;
    s += `<rect data-motion="dem-rule-bar2" data-motion-clamp="true" x="${bx}" y="${botY + 60}" width="${(ev.d2[0] + ev.d2[1]) * scale}" height="12" fill="${C.bean}"/>`;

    if (small) {
      const [l1, l2] = splitVerdict(f.verdict);
      s += txt(W / 2, botY + 110, l1, 11, C.ink, 'middle', 'bold');
      s += txt(W / 2, botY + 132, l2, 11, C.ink, 'middle', 'bold');
      s += txt(W / 2, botY + 158, '上绿条为甲需求总量；下黄条为乙需求总量', 10, C.muted, 'middle');
    } else {
      s += txt(W / 2, botY + 102, f.verdict, 13, C.ink, 'middle', 'bold');
      s += txt(W / 2, botY + 126, '上绿条为甲本步需求总重量；下黄条为乙本步需求总重量。', 12, C.muted, 'middle');
    }

    return {W, H, s};
  }

  // View 3: Parameter Regime Comparison (regime105: beta < alpha vs beta >= alpha)
  function drawRegimeView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 720 : 520;
    const ev = f.ev;
    let s = '';

    s += txt(W / 2, 24, f.identity, small ? 12 : 17, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, `甲米${num(ev.alpha)}、乙豆${num(ev.beta)}，米价${num(ev.p1)}元`, small ? 11 : 13, C.muted, 'middle');

    const regimes = [
      {title: '情形甲：乙豆1小于甲米2', ratio: '比值0.5元（在低价区内）', lowEq: '存在互换均衡（0，1）与（2，0）', ok: true, active: f.step === 0 || f.step === 5},
      {title: '情形乙：乙豆2等于甲米2', ratio: '比值1.0元（落在平价边界）', lowEq: '低价区米不够分，无互换均衡', ok: false, active: f.step === 1 || f.step === 2},
      {title: '情形丙：乙豆2大于甲米1', ratio: '比值2.0元（越界到高价区）', lowEq: '低价区严重缺米，无互换均衡', ok: false, active: f.step === 3 || f.step === 4}
    ];

    const cardW = small ? 296 : 232;
    const cardH = small ? 104 : 156;

    for (let i = 0; i < 3; i++) {
      const rg = regimes[i];
      const ox = small ? 12 : 16 + i * 248;
      const oy = small ? 58 + i * 112 : 62;

      const bg = rg.active ? (rg.ok ? C.activeBg : C.warnBg) : '#ffffff';
      const stroke = rg.active ? (rg.ok ? C.rice : C.red) : C.rule;
      const sw = rg.active ? 2 : 1;

      s += `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="10" fill="${bg}" stroke="${stroke}" stroke-width="${sw}"/>`;
      s += txt(ox + 12, oy + 22, rg.title, 12, C.ink, 'start', 'bold');
      s += txt(ox + 12, oy + 46, '高价区：无穷多无交易均衡', 11, C.rice);
      s += txt(ox + 12, oy + 68, '代数候选价：' + rg.ratio, 11, C.muted);
      s += txt(ox + 12, oy + 90, rg.lowEq, 11, rg.ok ? C.rice : C.red, 'start', 'bold');
      if (!small) {
        s += txt(ox + 12, oy + 124, rg.ok ? '两族竞争均衡同时存在' : '仅有一族无交易竞争均衡', 11, C.ink);
      }
    }

    // Bottom live supply vs demand comparison for current (alpha, beta, p1)
    const botY = small ? 402 : 240;
    const botW = W - 24;
    const botH = small ? 302 : 264;

    s += `<rect x="12" y="${botY}" width="${botW}" height="${botH}" rx="12" fill="#ffffff" stroke="${ev.isEquilibrium ? C.rice : C.red}" stroke-width="2"/>`;
    s += txt(24, botY + 26, `当前参数与米价（${num(ev.p1)}元）下的市场供需核查`, small ? 12 : 16, C.ink, 'start', 'bold');

    const bx = small ? 58 : 110;
    const maxW = small ? 236 : 480;
    const maxU = 3.0;

    const rY = botY + 48;
    s += txt(24, rY + 14, '总米', 12, C.rice, 'start', 'bold');
    s += `<rect x="${bx}" y="${rY}" width="${(ev.totalEndowment[0] / maxU) * maxW}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="dem-reg-r" data-motion-clamp="true" x="${bx}" y="${rY + 4}" width="${(ev.totalDemand[0] / maxU) * maxW}" height="10" fill="${Math.abs(ev.excess[0]) < 1e-6 ? C.rice : C.red}"/>`;
    s += txt(bx, rY + 34, `总米供给${num(ev.totalEndowment[0])}千克；本步总米需求${num(ev.totalDemand[0])}千克`, 11, C.ink);

    const bY = botY + 102;
    s += txt(24, bY + 14, '总豆', 12, C.bean, 'start', 'bold');
    s += `<rect x="${bx}" y="${bY}" width="${(ev.totalEndowment[1] / maxU) * maxW}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="dem-reg-b" data-motion-clamp="true" x="${bx}" y="${bY + 4}" width="${(ev.totalDemand[1] / maxU) * maxW}" height="10" fill="${Math.abs(ev.excess[1]) < 1e-6 ? C.bean : C.red}"/>`;
    s += txt(bx, bY + 34, `总豆供给${num(ev.totalEndowment[1])}千克；本步总豆需求${num(ev.totalDemand[1])}千克`, 11, C.ink);

    s += txt(24, botY + 168, `甲需求：米${num(ev.d1[0])}、豆${num(ev.d1[1])}；乙需求：米${num(ev.d2[0])}、豆${num(ev.d2[1])}`, small ? 11 : 13, C.muted);

    if (small) {
      const [l1, l2] = splitVerdict(f.verdict);
      s += txt(W / 2, botY + 206, l1, 11, ev.isEquilibrium ? C.rice : C.red, 'middle', 'bold');
      s += txt(W / 2, botY + 228, l2, 11, ev.isEquilibrium ? C.rice : C.red, 'middle', 'bold');
      s += txt(W / 2, botY + 260, '低价互换要求比值小于1元，即乙豆少于甲米', 10, C.muted, 'middle');
    } else {
      s += txt(W / 2, botY + 206, f.verdict, 13, ev.isEquilibrium ? C.rice : C.red, 'middle', 'bold');
      s += txt(W / 2, botY + 236, '只有当乙豆家底严格小于甲米家底时，比值才小于1元，低价互换均衡才成立。', 12, C.muted, 'middle');
    }

    return {W, H, s};
  }

  function draw() {
    const f = demandStory(key, step);
    const c = demandContent[key];
    const phase = c.steps[step];

    if ($('filmStep')) $('filmStep').value = step;
    if ($('out-filmStep')) $('out-filmStep').value = step;

    let brief = $('demand-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'demand-brief';
      brief.setAttribute('aria-label', '问题与题目条件');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="demand-question"></span></p>' +
        '<p class="reading"><strong>情境与条件：</strong><span id="demand-condition"></span></p>' +
        '<p class="boundary" id="demand-scope"></p>';
      const legend = $('legend');
      if (legend) legend.before(brief);
    }
    if ($('demand-question')) $('demand-question').textContent = c.question;
    if ($('demand-condition')) $('demand-condition').textContent = c.conditions;
    if ($('demand-scope')) $('demand-scope').textContent = f.scope;

    const plot = $('plot');
    if (plot) {
      Object.assign(plot.dataset, {
        filmIntro: c.question,
        filmPhase: phase[0],
        filmNarration: phase[1],
        filmConclusion: c.steps[5][1]
      });

      const isSmall = plot.clientWidth < 500;
      let rendered;
      if (f.view === 'rules') {
        rendered = drawRulesView(f, isSmall);
      } else if (f.view === 'regime') {
        rendered = drawRegimeView(f, isSmall);
      } else {
        rendered = drawLedgerView(f, isSmall);
      }

      const {W, H, s} = rendered;
      window.microMotion.chart(plot,
        `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title + '：' + phase[0])}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`
      );
    }

    if ($('legend')) {
      $('legend').textContent = f.identity + '。豆价固定为1元。绿条代表米，黄条代表豆；虚线框代表初始家底，实色条代表当前步需求量。';
    }

    const ev = f.ev;
    const metrics = [
      ['当前米价（豆价1元）', `${num(ev.p1)}元`],
      ['甲与乙本步需求', `甲（${num(ev.d1[0])}，${num(ev.d1[1])}） 乙（${num(ev.d2[0])}，${num(ev.d2[1])}）`],
      ['市场是否出清', ev.isEquilibrium ? (ev.eqType === 'no-trade' ? '出清（无交易均衡）' : '出清（互换均衡）') : '未出清']
    ];

    if ($('metrics')) {
      $('metrics').innerHTML = metrics.map(([a, b]) =>
        '<div class="metric"><label>' + a + '</label><strong>' + b + '</strong></div>'
      ).join('');
    }

    if ($('reading')) $('reading').textContent = phase[1];
    if ($('formula')) $('formula').textContent = c.formula;
    if ($('boundary')) $('boundary').textContent = c.trap;

    if ($('extra')) {
      $('extra').innerHTML =
        '<h3>把条件与原理连起来</h3><ol>' +
        c.proof.map(x => '<li>' + esc(x) + '</li>').join('') +
        '</ol><h3>同类题怎么上手</h3><p>' + esc(c.template) + '</p>' +
        '<h3>最容易混淆的地方</h3><p>' + esc(c.trap) + '</p>' +
        '<p>来源：Osborne–Rubinstein ' + esc(c.source) + '</p>';
    }

    document.querySelectorAll('.study-guide .guide-panel').forEach((el, i) => {
      el.textContent = [c.question, c.conditions, c.template][i] || '';
    });
    const gb = document.querySelector('.study-guide>.boundary');
    if (gb) gb.textContent = '本段对应§10.7正文与例10.5完整分类推导；保留实验可继续切换。';

    const dl = document.querySelector('.lesson-end a[download]');
    if (dl) {
      dl.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/')
        ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/'
        : '') + 'downloads/ch10-demand-' + key + '.html';
      dl.textContent = '下载本段完整动画代码 ↓';
    }

    window.microMath?.refresh?.();
  }

  const advance = () => {
    step = Math.min(5, step + 1);
    draw();
  };

  if ($('experiment')) {
    $('experiment').onchange = e => {
      if (demandKeys.includes(e.target.value)) {
        history.replaceState(null, '', location.pathname + '?case=' + e.target.value);
        configure(e.target.value);
      } else {
        location.href = location.pathname + '?case=' + encodeURIComponent(e.target.value);
      }
    };
  }

  if ($('fields')) {
    $('fields').addEventListener('input', e => {
      if (e.target.dataset.key === 'filmStep') {
        step = Math.max(0, Math.min(5, Math.round(Number(e.target.value) || 0)));
        draw();
      }
    });
  }

  if ($('advance')) $('advance').onclick = advance;
  if ($('play')) $('play').onclick = advance;
  if ($('reset')) $('reset').onclick = () => configure(key);

  window.addEventListener('resize', draw);
  configure(key);
}

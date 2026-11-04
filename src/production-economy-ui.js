import {productionEconomyContent, productionEconomyKeys} from './production-economy-content.mjs';
import {productionEconomyStory} from './production-economy-story.mjs';

export function startProductionEconomyStory(requested) {
  const pe$ = id => document.getElementById(id);
  const PE_C = {
    ink: '#263f37', muted: '#708177', green: '#177468', red: '#bd624c',
    purple: '#74618d', gold: '#b18429', blue: '#4b718f', rule: '#d7e0d5',
    paper: '#fffdf7', soft: '#f3f6f1', mint: '#e5efe9', rose: '#fff1ed', sky: '#edf4f6'
  };
  const peEsc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const peFmt = (value, digits = 2) => Number.isFinite(Number(value))
    ? Number(Number(value).toFixed(digits)).toLocaleString('zh-CN', {maximumFractionDigits: digits}) : String(value);
  const peText = (x, y, value, size = 12, color = PE_C.ink, anchor = 'start', weight = 400) =>
    `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${peEsc(value)}</text>`;
  const peWrap = (value, limit = 22, max = 4) => {
    const text = String(value), rows = [];
    for (let i = 0; i < text.length; i += limit) rows.push(text.slice(i, i + limit));
    return rows.slice(0, max);
  };
  const peLines = (x, y, value, size = 11, color = PE_C.ink, anchor = 'start', weight = 400, limit = 24, gap = 19, max = 4) =>
    peWrap(value, limit, max).map((line, i) => peText(x, y + i * gap, line, size, color, anchor, weight)).join('');
  const pePath = (fn, x0, x1, mapX, mapY, count = 80) => {
    let d = '';
    for (let i = 0; i <= count; i++) {
      const x = x0 + (x1 - x0) * i / count, y = fn(x);
      if (Number.isFinite(y)) d += `${d ? 'L' : 'M'}${mapX(x).toFixed(2)} ${mapY(y).toFixed(2)}`;
    }
    return d;
  };
  const peTop = (f, width, small) => peText(width / 2, 25, f.identity, small ? 13 : 18, PE_C.ink, 'middle', 760)
    + peText(width / 2, 47, f.verdict, small ? 9 : 12, PE_C.muted, 'middle', 650);
  const peAxes = (left, top, right, bottom, xLabel, yLabel) => {
    let svg = `<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="${PE_C.muted}" stroke-width="1.4"/>`;
    for (let i = 1; i < 5; i++) {
      const y = bottom - (bottom - top) * i / 5;
      svg += `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${PE_C.rule}"/>`;
    }
    return svg + peText(left, top - 10, yLabel, 10, PE_C.muted, 'start', 650)
      + peText(right, bottom + 24, xLabel, 10, PE_C.muted, 'end', 650);
  };

  const query = new URLSearchParams(location.search);
  let peKey = productionEconomyKeys.includes(requested) ? requested
    : productionEconomyKeys.includes(window.PRODUCTION_ECONOMY_DEFAULT) ? window.PRODUCTION_ECONOMY_DEFAULT
      : productionEconomyKeys.includes(query.get('case')) ? query.get('case') : productionEconomyKeys[0];
  let peStep = 0;
  let peTimer = null;

  function peStop() {
    if (peTimer) clearInterval(peTimer);
    peTimer = null;
    if (pe$('play')) pe$('play').textContent = '播放整段';
  }

  function peEnsureControls() {
    const fields = pe$('fields');
    if (!fields) return;
    fields.innerHTML = `<div class="field"><label for="experiment">本节知识点或原题</label><select id="experiment">${productionEconomyKeys.map(k => `<option value="${k}">${peEsc(productionEconomyContent[k].title)}</option>`).join('')}</select></div>`
      + '<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep">0</output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1" value="0"></div>';
    pe$('experiment').onchange = event => {
      if (!productionEconomyKeys.includes(event.target.value)) return;
      history.replaceState(null, '', location.pathname + '?case=' + encodeURIComponent(event.target.value));
      peConfigure(event.target.value);
    };
    fields.addEventListener('input', event => {
      if (event.target.dataset.key !== 'filmStep') return;
      peStop();
      peStep = Math.max(0, Math.min(5, Math.round(Number(event.target.value) || 0)));
      peDraw();
    });
  }

  function peTechnologyChart(f, small) {
    const W = small ? 320 : 760, H = small ? 590 : 500;
    const left = small ? 38 : 70, right = W - (small ? 14 : 34), top = 82, bottom = small ? 370 : 350;
    const X = x => left + (right - left) * x / 9, Y = y => bottom - (bottom - top) * y / 7;
    const curve = pePath(x => f.B * Math.sqrt(Math.max(0, 1 - (x / f.A) ** 2)), 0, f.A, X, Y);
    let s = peTop(f, W, small) + peAxes(left, top, right, bottom, '商品1产量', '商品2产量');
    s += `<path d="M${left} ${bottom}L${left} ${Y(f.B)}${curve.slice(curve.indexOf('L'))}L${left} ${bottom}Z" fill="${PE_C.mint}" stroke="none"/>`;
    s += `<path data-motion="technology-frontier" d="${curve}" fill="none" stroke="${PE_C.green}" stroke-width="3"/>`;
    const [fx, fy] = f.frontier, [dx, dy] = f.disposed;
    s += `<circle data-motion="technology-point" cx="${X(fx)}" cy="${Y(fy)}" r="7" fill="${PE_C.purple}" stroke="${PE_C.paper}" stroke-width="2"/>`;
    if (f.step >= 1) s += `<path d="M${left} ${top + 12}H${right}M${right - 8} ${top}V${bottom}" stroke="${PE_C.gold}" stroke-dasharray="5 5" opacity=".7"/>`;
    if (f.step >= 2) s += `<circle cx="${X(f.A)}" cy="${Y(0)}" r="6" fill="${PE_C.paper}" stroke="${PE_C.green}" stroke-width="3"/>`;
    if (f.step >= 3) s += `<path data-motion="technology-chord" d="M${X(1.2)} ${Y(5.7)}L${X(6.9)} ${Y(3.05)}" stroke="${PE_C.blue}" stroke-width="3" stroke-dasharray="6 5"/>`;
    if (f.step >= 4) {
      s += `<rect data-motion="free-disposal" x="${left}" y="${Y(fy)}" width="${X(fx) - left}" height="${bottom - Y(fy)}" fill="${PE_C.gold}" opacity=".15"/>`;
      s += `<path d="M${X(fx)} ${Y(fy)}L${X(dx)} ${Y(dy)}" stroke="${PE_C.red}" stroke-width="2" stroke-dasharray="5 4"/>`;
      s += `<circle data-motion="disposed-point" cx="${X(dx)}" cy="${Y(dy)}" r="7" fill="${PE_C.red}"/>`;
    }
    if (f.step >= 5) s += `<path data-motion="value-line" d="M${left} ${Y(6.6)}L${X(8.3)} ${bottom}" stroke="${PE_C.red}" stroke-width="3"/>`;
    const panelY = small ? 410 : 386;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 152 : 88}" rx="13" fill="${PE_C.soft}" stroke="${PE_C.rule}"/>`;
    s += peLines(24, panelY + 28, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 6 : 3);
    return {W, H, s};
  }

  function peEconomyChart(f, small) {
    const W = small ? 320 : 760, H = small ? 690 : 510;
    const left = small ? 40 : 72, right = W - (small ? 14 : 36), top = 82, bottom = small ? 390 : 350;
    const X = x => left + (right - left) * x / 12, Y = y => bottom - (bottom - top) * y / 9;
    const frontier = pePath(x => f.B * Math.sqrt(Math.max(0, 1 - (x / f.A) ** 2)), 0, f.A, X, Y);
    let s = peTop(f, W, small) + peAxes(left, top, right, bottom, '商品1数量', '商品2数量');
    s += `<path d="${frontier}" fill="none" stroke="${PE_C.green}" stroke-width="3"/>`;
    s += `<path data-motion="production-value-line" d="M${left} ${Y(Math.min(8.8, f.profit))}L${X(Math.min(11.8, f.profit / f.q))} ${bottom}" fill="none" stroke="${PE_C.gold}" stroke-width="2" stroke-dasharray="6 5"/>`;
    s += `<circle data-motion="production-bundle" cx="${X(f.supply[0])}" cy="${Y(f.supply[1])}" r="8" fill="${PE_C.green}" stroke="${PE_C.paper}" stroke-width="2"/>`;
    s += `<circle data-motion="aggregate-demand" cx="${X(f.demand[0])}" cy="${Y(f.demand[1])}" r="8" fill="${PE_C.red}" stroke="${PE_C.paper}" stroke-width="2"/>`;
    s += `<path data-motion="market-gap" d="M${X(f.supply[0])} ${Y(f.supply[1])}L${X(f.demand[0])} ${Y(f.demand[1])}" stroke="${PE_C.red}" stroke-width="2" stroke-dasharray="4 4"/>`;
    s += peText(X(f.supply[0]) + 9, Y(f.supply[1]) - 10, '总产出', 10, PE_C.green, 'start', 700);
    s += peText(X(f.demand[0]) + 9, Y(f.demand[1]) + 19, f.clears ? '总需求＝总产出' : '总需求', 10, PE_C.red, 'start', 700);
    const panelY = small ? 430 : 382;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 232 : 104}" rx="13" fill="${PE_C.soft}" stroke="${PE_C.rule}"/>`;
    s += peText(24, panelY + 27, `相对价格 ${peFmt(f.q)}；利润 ${peFmt(f.profit)}；甲/乙收入 ${peFmt(f.income[0])} / ${peFmt(f.income[1])}`, small ? 9 : 11, PE_C.ink, 'start', 700);
    s += peText(24, panelY + 50, `商品1缺口 ${peFmt(f.gap[0])}；商品2缺口 ${peFmt(f.gap[1])}`, small ? 9 : 11, f.clears ? PE_C.green : PE_C.red, 'start', 650);
    s += peLines(24, panelY + 78, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 60, 19, small ? 7 : 2);
    return {W, H, s};
  }

  function peParetoChart(f, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const panelW = small ? 292 : 330, panelH = small ? 175 : 215;
    const origins = small ? [[14, 76], [14, 267]] : [[38, 82], [392, 82]];
    let s = peTop(f, W, small);
    ['甲（更看重商品1）', '乙（更看重商品2）'].forEach((label, i) => {
      const [x, y] = origins[i], old = f.initial[i], now = f.current[i], color = i ? PE_C.purple : PE_C.green;
      s += `<rect x="${x}" y="${y}" width="${panelW}" height="${panelH}" rx="14" fill="${PE_C.soft}" stroke="${PE_C.rule}"/>`;
      s += peText(x + 16, y + 27, label, small ? 11 : 14, PE_C.ink, 'start', 750);
      [0, 1].forEach(k => {
        const yy = y + 60 + k * (small ? 45 : 58), maxW = panelW - 94, currentW = maxW * now[k] / 3.2, oldW = maxW * old[k] / 3.2;
        s += peText(x + 16, yy + 13, `商品${k + 1}`, 10, PE_C.muted, 'start', 650);
        s += `<rect x="${x + 74}" y="${yy}" width="${oldW}" height="18" rx="9" fill="none" stroke="${PE_C.muted}" stroke-dasharray="4 3"/>`;
        s += `<rect data-motion="pareto-${i}-${k}" x="${x + 74}" y="${yy}" width="${currentW}" height="18" rx="9" fill="${color}"/>`;
        s += peText(x + panelW - 13, yy + 14, peFmt(now[k]), 10, color, 'end', 750);
      });
    });
    const panelY = small ? 470 : 330;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 158 : 145}" rx="13" fill="${PE_C.paper}" stroke="${PE_C.rule}"/>`;
    s += peText(24, panelY + 27, `总量仍是（${peFmt(f.totals[0])}, ${peFmt(f.totals[1])}）`, 11, PE_C.ink, 'start', 750);
    s += peText(24, panelY + 51, `甲效用 ${peFmt(f.initialU[0])} → ${peFmt(f.currentU[0])}；乙效用 ${peFmt(f.initialU[1])} → ${peFmt(f.currentU[1])}`, small ? 9 : 11, PE_C.green, 'start', 650);
    s += peLines(24, panelY + 80, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 4 : 3);
    return {W, H, s};
  }

  function peProofChart(f, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const top = 86, bottom = small ? 360 : 335, max = f.equilibriumValue + 1.25;
    const Y = v => bottom - (bottom - top) * v / max;
    const values = [f.equilibriumValue, f.alternativeConsumptionValue, f.alternativeProductionCeiling];
    const labels = ['均衡消费价值', '假想改善消费价值', '另一生产的上限'];
    const centers = small ? [68, 161, 254] : [165, 380, 595], barW = small ? 46 : 80;
    let s = peTop(f, W, small);
    values.forEach((value, i) => {
      const color = [PE_C.green, PE_C.red, PE_C.gold][i];
      s += `<rect data-motion="proof-ledger-${i}" x="${centers[i] - barW / 2}" y="${Y(value)}" width="${barW}" height="${bottom - Y(value)}" rx="7" fill="${color}" opacity=".9"/>`;
      s += peText(centers[i], Y(value) - 9, peFmt(value), small ? 9 : 12, color, 'middle', 750);
      s += peLines(centers[i], bottom + 24, labels[i], small ? 8 : 10, PE_C.ink, 'middle', 650, small ? 8 : 14, 14, 3);
    });
    if (f.contradiction) s += peText(W / 2, small ? 430 : 405, '严格更大  >  同一个可行生产上限　矛盾', small ? 11 : 17, PE_C.red, 'middle', 800);
    const panelY = small ? 452 : 376;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 174 : 108}" rx="13" fill="${PE_C.soft}" stroke="${PE_C.rule}"/>`;
    s += peLines(24, panelY + 29, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 7 : 4);
    return {W, H, s};
  }

  function peNonconvexChart(f, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const left = small ? 38 : 72, right = W - (small ? 16 : 40), top = 82, bottom = small ? 365 : 340;
    const X = x => left + (right - left) * x / 5, Y = y => bottom - (bottom - top) * y / 5;
    let s = peTop(f, W, small) + peAxes(left, top, right, bottom, '商品1', '商品2');
    s += `<path d="M${left} ${bottom}V${Y(4)}H${X(1)}V${Y(1)}H${X(4)}V${bottom}Z" fill="${PE_C.mint}" stroke="${PE_C.green}" stroke-width="3"/>`;
    s += `<circle data-motion="nonconvex-a" cx="${X(1)}" cy="${Y(4)}" r="8" fill="${f.producerChoice.includes('a') ? PE_C.green : PE_C.muted}"/><circle data-motion="nonconvex-b" cx="${X(4)}" cy="${Y(1)}" r="8" fill="${f.producerChoice.includes('b') ? PE_C.green : PE_C.muted}"/>`;
    s += peText(X(1) + 9, Y(4) - 8, 'a', 12, PE_C.ink, 'start', 750) + peText(X(4) + 9, Y(1) - 8, 'b', 12, PE_C.ink, 'start', 750);
    if (f.step >= 4) {
      s += `<circle data-motion="consumer-equal-bundle" cx="${X(f.equalBundle[0])}" cy="${Y(f.equalBundle[1])}" r="9" fill="${PE_C.red}" stroke="${PE_C.paper}" stroke-width="2"/>`;
      s += peText(X(f.equalBundle[0]), Y(f.equalBundle[1]) - 14, '顾客等量束', 10, PE_C.red, 'middle', 700);
    }
    const panelY = small ? 405 : 372;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 218 : 104}" rx="13" fill="${PE_C.soft}" stroke="${PE_C.rule}"/>`;
    s += peText(24, panelY + 27, `价格比 ${peFmt(f.q)}；企业选择 ${f.producerChoice.join('和')}；顾客等量 ${f.equalBundle.map(x => peFmt(x)).join(' / ')}`, small ? 9 : 11, PE_C.ink, 'start', 700);
    s += peLines(24, panelY + 58, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 61, 19, small ? 7 : 3);
    return {W, H, s};
  }

  function peSpecializationChart(f, small) {
    const W = small ? 320 : 760, H = small ? 780 : 520;
    const people = f.people.map(person => ({...person, output: person.output || person.production, consumption: person.consumption}));
    const panelW = small ? 292 : 218, panelH = small ? 155 : 250;
    const origins = small ? people.map((_, i) => [14, 76 + i * 166]) : people.map((_, i) => [36 + i * 236, 84]);
    let s = peTop(f, W, small);
    people.forEach((person, i) => {
      const [ox, oy] = origins[i], maxX = person.c / person.t, maxY = person.c, x = ox + 34 + (panelW - 55) * person.output[0] / Math.max(1, maxX), y = oy + panelH - 31 - (panelH - 66) * person.output[1] / Math.max(1, maxY);
      const color = [PE_C.green, PE_C.purple, PE_C.gold][i % 3];
      s += `<rect x="${ox}" y="${oy}" width="${panelW}" height="${panelH}" rx="13" fill="${PE_C.soft}" stroke="${PE_C.rule}"/>`;
      s += peText(ox + 14, oy + 25, `${i + 1}号：t=${peFmt(person.t)}，能力=${peFmt(person.c)}`, small ? 10 : 12, PE_C.ink, 'start', 750);
      s += `<path d="M${ox + 34} ${oy + 43}V${oy + panelH - 31}H${ox + panelW - 18}" fill="none" stroke="${PE_C.muted}"/>`;
      s += `<path d="M${ox + 34} ${oy + 49}L${ox + panelW - 24} ${oy + panelH - 31}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
      s += `<circle data-motion="producer-${i}" cx="${x}" cy="${y}" r="7" fill="${color}" stroke="${PE_C.paper}" stroke-width="2"/>`;
      if (f.mixed && person.consumption) {
        const cx = ox + 34 + (panelW - 55) * person.consumption[0] / Math.max(1, maxX), cy = oy + panelH - 31 - (panelH - 66) * person.consumption[1] / Math.max(1, maxY);
        s += `<circle data-motion="consumer-${i}" cx="${cx}" cy="${cy}" r="6" fill="${PE_C.red}" stroke="${PE_C.paper}" stroke-width="2"/>`;
      }
      const mode = f.mixed ? (i ? '专产商品2' : '混合生产') : f.noTrade ? '产出原样消费' : ({good1: '专产商品1', good2: '专产商品2', tie: '前沿任意混合'}[person.mode] || '个人最优');
      s += peText(ox + 14, oy + panelH - 10, `${mode}：(${person.output.map(x => peFmt(x)).join(', ')})`, small ? 9 : 10, color, 'start', 700);
    });
    const panelY = small ? 586 : 365;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 170 : 130}" rx="13" fill="${PE_C.paper}" stroke="${PE_C.rule}"/>`;
    s += peText(24, panelY + 27, `当前相对价格 ${peFmt(f.q)}${f.noTrade ? '；交易量为0' : ''}`, 11, PE_C.ink, 'start', 750);
    s += peLines(24, panelY + 56, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 6 : 4);
    return {W, H, s};
  }

  function peChainChart(f, small) {
    const W = small ? 320 : 760, H = small ? 700 : 500;
    const cards = small ? [[14, 78, 292, 138], [14, 240, 292, 138], [14, 402, 292, 138]] : [[35, 92, 205, 210], [278, 92, 205, 210], [521, 92, 205, 210]];
    const titles = ['1号：时间→X', 'X市场：供给＝需求', '2号：X→Y'];
    const bodies = [
      `工作 ${peFmt(f.t)}，休闲 ${peFmt(f.leisure)}，产出X ${peFmt(f.x)}`,
      `X价格 ${peFmt(f.p)}；供给 ${peFmt(f.x)}，需求 ${peFmt(f.firmDemand)}`,
      `总Y ${peFmt(f.g)}；付给1号 ${peFmt(f.sellerY)}，利润 ${peFmt(f.profit)}`
    ];
    let s = peTop(f, W, small);
    cards.forEach((card, i) => {
      const [x, y, w, h] = card, active = f.step >= i * 2;
      s += `<rect data-motion="chain-card-${i}" x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${active ? PE_C.mint : PE_C.soft}" stroke="${active ? PE_C.green : PE_C.rule}" stroke-width="${active ? 2 : 1}"/>`;
      s += peText(x + 15, y + 31, titles[i], small ? 11 : 14, PE_C.ink, 'start', 760);
      s += peLines(x + 15, y + 64, bodies[i], small ? 10 : 11, active ? PE_C.green : PE_C.muted, 'start', 650, small ? 24 : 18, 19, 5);
      if (i < 2) {
        if (small) s += `<path d="M${W / 2} ${y + h}V${cards[i + 1][1] - 8}" stroke="${PE_C.gold}" stroke-width="3" marker-end="url(#peArrow)"/>`;
        else s += `<path d="M${x + w} ${y + h / 2}H${cards[i + 1][0] - 8}" stroke="${PE_C.gold}" stroke-width="3" marker-end="url(#peArrow)"/>`;
      }
    });
    s = `<defs><marker id="peArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${PE_C.gold}"/></marker></defs>` + s;
    const panelY = small ? 564 : 332;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 112 : 142}" rx="13" fill="${PE_C.paper}" stroke="${PE_C.rule}"/>`;
    s += peLines(24, panelY + 30, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 4 : 5);
    return {W, H, s};
  }

  function pePollutionChart(f, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const panels = small ? [[14, 78, 292, 178], [14, 275, 292, 178]] : [[56, 88, 300, 235], [404, 88, 300, 235]];
    let s = peTop(f, W, small);
    const data = [
      {title: '私人均衡：都产商品2', bundle: f.privateBundle, z: f.privatePollution, u: f.privateUtility, color: PE_C.red, visible: true},
      {title: '替代计划：都产商品1', bundle: f.alternativeBundle, z: f.alternativePollution, u: f.alternativeUtility, color: PE_C.green, visible: f.showAlternative}
    ];
    data.forEach((item, i) => {
      const [x, y, w, h] = panels[i], opacity = item.visible ? 1 : 0.24;
      s += `<g data-motion="pollution-plan-${i}" opacity="${opacity}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${i ? PE_C.mint : PE_C.rose}" stroke="${item.color}"/>`;
      s += peText(x + 15, y + 29, item.title, small ? 11 : 14, PE_C.ink, 'start', 760);
      s += peText(x + 15, y + 61, `每人消费（${item.bundle.join(', ')}）`, small ? 10 : 12, PE_C.ink, 'start', 650);
      s += peText(x + 15, y + 91, `全村污染 z = ${item.z}`, small ? 10 : 13, item.color, 'start', 750);
      s += peText(x + 15, y + 121, `每人效用 u = ${item.u}`, small ? 10 : 13, item.color, 'start', 750);
      const smoke = i ? 0 : 5;
      for (let k = 0; k < smoke; k++) s += `<circle cx="${x + w - 42 + (k % 2) * 16}" cy="${y + 55 + k * 18}" r="${8 + k}" fill="${PE_C.muted}" opacity="${0.12 + k * .035}"/>`;
      s += '</g>';
    });
    const panelY = small ? 480 : 352;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 144 : 122}" rx="13" fill="${PE_C.paper}" stroke="${PE_C.rule}"/>`;
    s += peText(24, panelY + 27, `当前价格比 ${peFmt(f.q)}；私人配置${f.equilibrium ? '可以' : '不能'}对称出清`, small ? 9 : 11, PE_C.ink, 'start', 700);
    s += peLines(24, panelY + 55, f.narration, small ? 10 : 12, PE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 5 : 4);
    return {W, H, s};
  }

  function peRenderChart(frame, small) {
    if (frame.kind === 'technology') return peTechnologyChart(frame, small);
    if (frame.kind === 'economy') return peEconomyChart(frame, small);
    if (frame.kind === 'pareto') return peParetoChart(frame, small);
    if (frame.kind === 'proof') return peProofChart(frame, small);
    if (frame.kind === 'nonconvex') return peNonconvexChart(frame, small);
    if (frame.kind === 'specialization') return peSpecializationChart(frame, small);
    if (frame.kind === 'chain') return peChainChart(frame, small);
    return pePollutionChart(frame, small);
  }

  function peMetricRows(frame, content) {
    let detail = '同一组对象沿六个镜头连续变化';
    if (frame.kind === 'economy') detail = frame.clears ? '两种商品均已出清' : `商品1缺口 ${peFmt(frame.gap[0])}`;
    else if (frame.kind === 'proof') detail = frame.contradiction ? '反证矛盾已经闭合' : '正在搭建价值不等式';
    else if (frame.kind === 'nonconvex') detail = '企业端点与顾客等量束不相交';
    else if (frame.kind === 'pareto') detail = `总量（${frame.totals.map(x => peFmt(x)).join(', ')}）不变`;
    else if (frame.kind === 'pollution') detail = frame.showAlternative ? '替代计划使每人效用 -1→1' : '私人选择未计入全村烟害';
    return [
      ['当前讲解', `${peStep + 1}/6 · ${content.steps[peStep][0]}`],
      ['这一步的判断', frame.verdict],
      ['图中核对', detail]
    ];
  }

  function peDraw() {
    const frame = productionEconomyStory(peKey, peStep), content = productionEconomyContent[peKey], phase = content.steps[peStep];
    if (pe$('filmStep')) pe$('filmStep').value = peStep;
    if (pe$('out-filmStep')) pe$('out-filmStep').value = String(peStep);
    if (pe$('experiment')) pe$('experiment').value = peKey;

    let brief = pe$('production-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'production-brief';
      brief.setAttribute('aria-label', '题目条件与本图任务');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="production-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="production-conditions"></span></p><p class="boundary" id="production-source"></p>';
      pe$('legend')?.before(brief);
    }
    pe$('production-question').textContent = content.question;
    pe$('production-conditions').textContent = content.conditions;
    pe$('production-source').textContent = `教材边界：${content.source}`;

    const plot = pe$('plot');
    if (plot) {
      Object.assign(plot.dataset, {filmIntro: content.question, filmPhase: phase[0], filmNarration: phase[1], filmConclusion: content.steps[5][1]});
      const rendered = peRenderChart(frame, plot.clientWidth < 500);
      window.microMotion.chart(plot, `<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${peEsc(content.title + '：' + phase[0])}"><rect width="${rendered.W}" height="${rendered.H}" fill="${PE_C.paper}"/>${rendered.s}</svg>`);
    }
    if (pe$('legend')) pe$('legend').textContent = frame.kind === 'economy'
      ? '绿色始终是企业总产出，红色始终是消费者总需求，金线是同一价格下的产值线。'
      : frame.kind === 'specialization'
        ? '同一个人和同一条生产前沿始终留在原位；彩色点是产出，红点只在需要时表示消费。'
        : '每一帧保留同一组经济对象，只改变当前正在解释的条件、分配或价值关系。';
    if (pe$('metrics')) pe$('metrics').innerHTML = peMetricRows(frame, content).map(([label, value]) => `<div class="metric"><label>${peEsc(label)}</label><strong>${peEsc(value)}</strong></div>`).join('');
    if (pe$('reading')) pe$('reading').textContent = phase[1];
    if (pe$('formula')) pe$('formula').textContent = content.formula;
    if (pe$('boundary')) pe$('boundary').textContent = content.trap;
    if (pe$('extra')) pe$('extra').innerHTML = `<h3>严谨证明或计算路线</h3><ol>${content.proof.map(item => `<li>${peEsc(item)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${peEsc(content.template)}</p><h3>最容易混淆</h3><p>${peEsc(content.trap)}</p><p>来源：Osborne–Rubinstein ${peEsc(content.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((el, i) => { el.textContent = [content.question, content.conditions, content.template][i] || ''; });
    const guideBoundary = document.querySelector('.study-guide>.boundary');
    if (guideBoundary) guideBoundary.textContent = '教材定义、一般证明、原题条件和本站自主数值图分开标注；动画帮助看清因果，不代替一般数学证明。';
    const dl = document.querySelector('.lesson-end a[download]');
    if (dl) {
      dl.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/') ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/' : '') + `downloads/ch12-production-${peKey}.html`;
      dl.textContent = '下载本段完整动画代码 ↓';
    }
    window.microMath?.refresh?.();
  }

  function peConfigure(nextKey) {
    peStop();
    peKey = productionEconomyKeys.includes(nextKey) ? nextKey : productionEconomyKeys[0];
    window.PRODUCTION_ECONOMY_DEFAULT = peKey;
    const current = new URLSearchParams(location.search), requestedStep = Number(current.get('filmStep'));
    peStep = (current.get('case') === peKey || !current.has('case')) && Number.isFinite(requestedStep)
      ? Math.max(0, Math.min(5, Math.round(requestedStep))) : 0;
    peDraw();
  }

  const peAdvance = () => {
    if (peStep >= 5) return true;
    peStep += 1;
    peDraw();
    return peStep >= 5;
  };

  peEnsureControls();
  if (pe$('advance')) pe$('advance').onclick = () => { peStop(); peAdvance(); };
  if (pe$('play')) pe$('play').onclick = () => {
    if (peTimer) { peStop(); return; }
    if (window.microMotion?.reduced?.matches) { peAdvance(); return; }
    if (peStep >= 5) peStep = 0;
    peAdvance();
    peTimer = setInterval(() => { if (peAdvance()) peStop(); }, 1700);
    pe$('play').textContent = '暂停播放';
  };
  if (pe$('reset')) pe$('reset').onclick = () => peConfigure(peKey);
  document.addEventListener('visibilitychange', () => { if (document.hidden) peStop(); });
  window.microMotion?.reduced?.addEventListener?.('change', peStop);
  window.addEventListener('resize', peDraw);
  window.demo = {get state() { return {key: peKey, step: peStep}; }, advance: peAdvance, draw: peDraw, configure: peConfigure};
  peConfigure(peKey);
}

window.startProductionEconomyStory = startProductionEconomyStory;

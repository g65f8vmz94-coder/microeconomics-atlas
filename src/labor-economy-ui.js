import {production} from './production-market.mjs';
import {laborEconomyContent, laborEconomyKeys} from './labor-economy-content.mjs';
import {laborEconomyStory} from './labor-economy-story.mjs';

export function startLaborEconomyStory(requested) {
  const le$ = id => document.getElementById(id);
  const LE_C = {
    ink: '#263f37', muted: '#708177', green: '#177468', red: '#bd624c',
    purple: '#74618d', gold: '#b18429', blue: '#4b718f', rule: '#d7e0d5',
    paper: '#fffdf7', soft: '#f3f6f1', mint: '#e5efe9', rose: '#fff1ed', sky: '#edf4f6'
  };
  const leEsc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const leFmt = (value, digits = 2) => Number.isFinite(Number(value))
    ? Number(Number(value).toFixed(digits)).toLocaleString('zh-CN', {maximumFractionDigits: digits}) : String(value);
  const leText = (x, y, value, size = 12, color = LE_C.ink, anchor = 'start', weight = 400) =>
    `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${leEsc(value)}</text>`;
  const leWrap = (value, limit = 22, max = 4) => {
    const text = String(value), rows = [];
    for (let i = 0; i < text.length; i += limit) rows.push(text.slice(i, i + limit));
    return rows.slice(0, max);
  };
  const leLines = (x, y, value, size = 11, color = LE_C.ink, anchor = 'start', weight = 400, limit = 24, gap = 19, max = 4) =>
    leWrap(value, limit, max).map((line, i) => leText(x, y + i * gap, line, size, color, anchor, weight)).join('');
  const lePath = (fn, x0, x1, mapX, mapY, count = 90) => {
    let d = '';
    for (let i = 0; i <= count; i++) {
      const x = x0 + (x1 - x0) * i / count, y = fn(x);
      if (Number.isFinite(y)) d += `${d ? 'L' : 'M'}${mapX(x).toFixed(2)} ${mapY(y).toFixed(2)}`;
    }
    return d;
  };
  const leTop = (frame, width, small) => leText(width / 2, 25, frame.identity, small ? 13 : 18, LE_C.ink, 'middle', 760)
    + leText(width / 2, 47, frame.verdict, small ? 9 : 12, LE_C.muted, 'middle', 650);
  const leAxes = (left, top, right, bottom, xLabel, yLabel) => {
    let svg = `<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="${LE_C.muted}" stroke-width="1.4"/>`;
    for (let i = 1; i < 5; i++) {
      const y = bottom - (bottom - top) * i / 5;
      svg += `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${LE_C.rule}"/>`;
    }
    return svg + leText(left, top - 10, yLabel, 10, LE_C.muted, 'start', 650)
      + leText(right, bottom + 24, xLabel, 10, LE_C.muted, 'end', 650);
  };

  const query = new URLSearchParams(location.search);
  let leKey = laborEconomyKeys.includes(requested) ? requested
    : laborEconomyKeys.includes(window.LABOR_ECONOMY_DEFAULT) ? window.LABOR_ECONOMY_DEFAULT
      : laborEconomyKeys.includes(query.get('case')) ? query.get('case') : laborEconomyKeys[0];
  let leStep = 0, leTimer = null;

  function leStop() {
    if (leTimer) clearInterval(leTimer);
    leTimer = null;
    if (le$('play')) le$('play').textContent = '播放整段';
  }

  function leEnsureControls() {
    const fields = le$('fields');
    if (!fields) return;
    fields.innerHTML = `<div class="field"><label for="experiment">本节知识点或原题</label><select id="experiment">${laborEconomyKeys.map(k => `<option value="${k}">${leEsc(laborEconomyContent[k].title)}</option>`).join('')}</select></div>`
      + '<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep">0</output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1" value="0"></div>';
    le$('experiment').onchange = event => {
      if (!laborEconomyKeys.includes(event.target.value)) return;
      history.replaceState(null, '', location.pathname + '?case=' + encodeURIComponent(event.target.value));
      leConfigure(event.target.value);
    };
    fields.addEventListener('input', event => {
      if (event.target.dataset.key !== 'filmStep') return;
      leStop();
      leStep = Math.max(0, Math.min(5, Math.round(Number(event.target.value) || 0)));
      leDraw();
    });
  }

  function leLaborChart(frame, small) {
    const W = small ? 320 : 760, H = small ? 690 : 510;
    const left = small ? 38 : 70, right = W - (small ? 14 : 36), top = 82, bottom = small ? 390 : 350;
    const maxA = 1.25, maxY = 5.4;
    const X = a => left + (right - left) * a / maxA, Y = y => bottom - (bottom - top) * y / maxY;
    const f = a => production(a, frame.A || 4, frame.kindName || frame.technologyKind || frame.productionKind || 'base', frame.strength || 1);
    const frontier = lePath(a => production(a, frame.A || 4), 0, maxA, X, Y);
    let s = leTop(frame, W, small) + leAxes(left, top, right, bottom, '劳动 a；右端剩余是休闲', '消费品 / 产出');
    s += `<path data-motion="labor-production" d="${frontier}" fill="none" stroke="${LE_C.green}" stroke-width="3"/>`;
    const w = frame.w, firm = Math.min(maxA, frame.firmLabor), worker = frame.workerLabor;
    s += `<path data-motion="wage-line" d="M${left} ${bottom}L${X(maxA)} ${Y(w * maxA)}" fill="none" stroke="${LE_C.red}" stroke-width="2.4"/>`;
    s += leText(X(maxA) - 5, Y(w * maxA) - 9, `工资线 w=${leFmt(w)}`, small ? 9 : 11, LE_C.red, 'end', 700);
    if (frame.step >= 1) {
      s += `<circle data-motion="firm-labor" cx="${X(firm)}" cy="${Y(production(firm, frame.A || 4))}" r="8" fill="${LE_C.green}" stroke="${LE_C.paper}" stroke-width="2"/>`;
      s += `<path d="M${X(firm)} ${Y(production(firm, frame.A || 4))}V${Y(w * firm)}" stroke="${LE_C.gold}" stroke-width="3"/>`;
      s += leText(X(firm) + 9, Y(production(firm, frame.A || 4)) - 10, `老板想雇 ${leFmt(frame.firmLabor)}`, small ? 9 : 11, LE_C.green, 'start', 700);
    }
    if (frame.step >= 2) {
      const wx = w * worker, leisure = 1 - worker, utility = leisure * wx;
      const indifference = lePath(a => utility / Math.max(0.035, 1 - a), 0, Math.min(.96, maxA), X, Y);
      s += `<path data-motion="worker-indifference" d="${indifference}" fill="none" stroke="${LE_C.purple}" stroke-width="2.4"/>`;
      s += `<circle data-motion="worker-labor" cx="${X(worker)}" cy="${Y(wx)}" r="8" fill="${LE_C.purple}" stroke="${LE_C.paper}" stroke-width="2"/>`;
      s += leText(X(worker) + 9, Y(wx) + 20, `工人愿做 ${leFmt(worker)}`, small ? 9 : 11, LE_C.purple, 'start', 700);
    }
    if (frame.clears && frame.step >= 4) {
      s += `<path d="M${X(worker)} ${bottom + 3}V${Y(production(worker, frame.A || 4))}" stroke="${LE_C.gold}" stroke-width="2" stroke-dasharray="5 4"/>`;
      s += leText(X(worker), bottom + 43, `a*=${leFmt(worker)}；l*=${leFmt(1 - worker)}`, small ? 9 : 11, LE_C.ink, 'middle', 750);
    }
    const panelY = small ? 440 : 382;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 218 : 104}" rx="13" fill="${LE_C.soft}" stroke="${LE_C.rule}"/>`;
    s += leText(24, panelY + 27, `企业需求 ${leFmt(frame.firmLabor)}；工人供给 ${leFmt(frame.workerLabor)}；劳动缺口 ${leFmt(frame.laborGap)}`, small ? 9 : 11, frame.clears ? LE_C.green : LE_C.red, 'start', 700);
    s += leText(24, panelY + 50, `产出 ${leFmt(frame.output)}；工资消费 ${leFmt(frame.workerConsumption)}；资本家剩余 ${leFmt(frame.profit)}`, small ? 9 : 11, LE_C.ink, 'start', 650);
    s += leLines(24, panelY + 78, frame.narration, small ? 10 : 12, LE_C.ink, 'start', 500, small ? 25 : 61, 19, small ? 7 : 3);
    return {W, H, s};
  }

  function lePlanChart(frame, small) {
    const W = small ? 320 : 760, H = small ? 650 : 500;
    const x = small ? 22 : 70, barW = W - 2 * x, timeY = 115, goodsY = small ? 285 : 250;
    let s = leTop(frame, W, small);
    s += leText(x, timeY - 22, '时间账：休闲 l + 劳动 a = 1', small ? 11 : 15, LE_C.ink, 'start', 750);
    s += `<rect x="${x}" y="${timeY}" width="${barW}" height="42" rx="10" fill="${LE_C.soft}" stroke="${LE_C.rule}"/>`;
    s += `<rect data-motion="leisure" x="${x}" y="${timeY}" width="${barW * Math.min(1, frame.l)}" height="42" rx="10" fill="${LE_C.purple}" opacity=".9"/>`;
    s += `<rect data-motion="labor" x="${x + barW * Math.max(0, 1 - frame.a)}" y="${timeY}" width="${barW * Math.min(1, frame.a)}" height="42" rx="10" fill="${LE_C.green}" opacity=".82"/>`;
    s += leText(x + 12, timeY + 27, `休闲 ${leFmt(frame.l)}`, small ? 9 : 11, LE_C.paper, 'start', 750)
      + leText(x + barW - 12, timeY + 27, `劳动 ${leFmt(frame.a)}`, small ? 9 : 11, LE_C.paper, 'end', 750);
    const timeColor = frame.timeFeasible ? LE_C.green : LE_C.red;
    s += leText(W / 2, timeY + 69, frame.timeFeasible ? '时间账已对上' : `目前 l+a=${leFmt(frame.l + frame.a)}，还不是可行计划`, small ? 9 : 11, timeColor, 'middle', 700);
    s += leText(x, goodsY - 22, `商品账：总产出 f(a)=${leFmt(frame.output)} = 工人x + 资本家z`, small ? 11 : 15, LE_C.ink, 'start', 750);
    s += `<rect x="${x}" y="${goodsY}" width="${barW}" height="48" rx="10" fill="${LE_C.soft}" stroke="${LE_C.rule}"/>`;
    s += `<rect data-motion="worker-consumption" x="${x}" y="${goodsY}" width="${barW * frame.x / frame.output}" height="48" rx="10" fill="${LE_C.blue}"/>`;
    s += `<rect data-motion="capitalist-consumption" x="${x + barW * frame.x / frame.output}" y="${goodsY}" width="${barW * frame.z / frame.output}" height="48" rx="10" fill="${LE_C.gold}"/>`;
    s += leText(x + 12, goodsY + 30, `工人 x=${leFmt(frame.x)}`, small ? 9 : 11, LE_C.paper, 'start', 750)
      + leText(x + barW - 12, goodsY + 30, `资本家 z=${leFmt(frame.z)}`, small ? 9 : 11, LE_C.paper, 'end', 750);
    const panelY = small ? 390 : 340;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 220 : 134}" rx="13" fill="${LE_C.paper}" stroke="${LE_C.rule}"/>`;
    s += leText(24, panelY + 27, `时间可行：${frame.timeFeasible ? '是' : '否'}；商品可行：${frame.goodsFeasible ? '是' : '否'}`, 11, frame.timeFeasible && frame.goodsFeasible ? LE_C.green : LE_C.red, 'start', 750);
    s += leLines(24, panelY + 57, frame.narration, small ? 10 : 12, LE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 7 : 4);
    return {W, H, s};
  }

  function leParetoChart(frame, small) {
    const W = small ? 320 : 760, H = small ? 680 : 500;
    const cards = small ? [[14, 80, 292, 180], [14, 280, 292, 180]] : [[42, 88, 318, 220], [400, 88, 318, 220]];
    const plans = [frame.initial, frame.current], titles = ['原计划：工作过多', frame.progress ? '正在转向替代计划' : '替代计划尚未展开'];
    let s = leTop(frame, W, small);
    plans.forEach((plan, i) => {
      const [x, y, w, h] = cards[i], color = i ? LE_C.green : LE_C.red;
      s += `<rect data-motion="pareto-plan-${i}" x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${i ? LE_C.mint : LE_C.rose}" stroke="${color}"/>`;
      s += leText(x + 15, y + 29, titles[i], small ? 11 : 14, LE_C.ink, 'start', 760);
      s += leText(x + 15, y + 63, `劳动 a=${leFmt(plan.a)}；休闲 l=${leFmt(plan.l)}`, small ? 10 : 12, LE_C.ink, 'start', 650);
      s += leText(x + 15, y + 94, `工人消费 x=${leFmt(plan.x)}；效用 lx=${leFmt(plan.workerUtility)}`, small ? 9 : 12, LE_C.purple, 'start', 700);
      s += leText(x + 15, y + 125, `资本家消费 z=${leFmt(plan.z)}`, small ? 10 : 12, color, 'start', 700);
      s += leText(x + 15, y + 156, `核对：x+z=${leFmt(plan.x + plan.z)}=f(a)`, small ? 9 : 11, LE_C.muted, 'start', 650);
    });
    const panelY = small ? 490 : 338;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 165 : 136}" rx="13" fill="${LE_C.paper}" stroke="${LE_C.rule}"/>`;
    s += leText(24, panelY + 27, `工人效用 ${leFmt(frame.initial.workerUtility)} → ${leFmt(frame.current.workerUtility)}；资本家z ${leFmt(frame.initial.z)} → ${leFmt(frame.current.z)}`, small ? 9 : 11, LE_C.green, 'start', 750);
    s += leLines(24, panelY + 58, frame.narration, small ? 10 : 12, LE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 5 : 4);
    return {W, H, s};
  }

  function leProofChart(frame, small) {
    const W = small ? 320 : 760, H = small ? 660 : 500;
    const top = 86, bottom = small ? 360 : 335, max = Math.max(frame.eq.profit, frame.claimedProfit, frame.feasibleProfitCeiling) + .55;
    const Y = v => bottom - (bottom - top) * v / max;
    const values = [frame.eq.profit, frame.claimedProfit, frame.feasibleProfitCeiling];
    const labels = ['均衡最大利润 z*', '假想不差的 z′', 'a′在工人下界后的利润上限'];
    const centers = small ? [66, 160, 255] : [165, 380, 595], barW = small ? 48 : 82;
    let s = leTop(frame, W, small);
    values.forEach((value, i) => {
      const color = [LE_C.green, LE_C.red, LE_C.gold][i];
      s += `<rect data-motion="proof-bar-${i}" x="${centers[i] - barW / 2}" y="${Y(value)}" width="${barW}" height="${bottom - Y(value)}" rx="7" fill="${color}"/>`;
      s += leText(centers[i], Y(value) - 9, leFmt(value), small ? 9 : 12, color, 'middle', 750);
      s += leLines(centers[i], bottom + 24, labels[i], small ? 8 : 10, LE_C.ink, 'middle', 650, small ? 9 : 15, 14, 3);
    });
    if (frame.contradiction) s += leText(W / 2, small ? 432 : 405, '假想利润 > 均衡最大利润　矛盾', small ? 11 : 17, LE_C.red, 'middle', 800);
    const panelY = small ? 455 : 376;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 180 : 108}" rx="13" fill="${LE_C.soft}" stroke="${LE_C.rule}"/>`;
    s += leLines(24, panelY + 29, frame.narration, small ? 10 : 12, LE_C.ink, 'start', 500, small ? 25 : 62, 19, small ? 7 : 4);
    return {W, H, s};
  }

  function leOutputChart(frame, small) {
    const W = small ? 320 : 760, H = small ? 680 : 510;
    const left = small ? 38 : 70, right = W - (small ? 14 : 36), top = 82, bottom = small ? 365 : 342;
    const maxA = 1.05, maxY = 6.2, X = a => left + (right - left) * a / maxA, Y = y => bottom - (bottom - top) * y / maxY;
    const f = a => production(a, 4), curve = lePath(f, 0, maxA, X, Y);
    let s = leTop(frame, W, small) + leAxes(left, top, right, bottom, '劳动 a', '产出 / 工资');
    s += `<path d="${curve}" fill="none" stroke="${LE_C.green}" stroke-width="3"/>`;
    s += `<path d="M${left} ${bottom}L${X(maxA)} ${Y(frame.w * maxA)}" stroke="${LE_C.red}" stroke-width="2.4"/>`;
    s += `<circle data-motion="output-equilibrium" cx="${X(frame.a)}" cy="${Y(f(frame.a))}" r="8" fill="${LE_C.red}" stroke="${LE_C.paper}" stroke-width="2"/>`;
    s += leText(X(frame.a), Y(f(frame.a)) - 15, '保本最右端', small ? 9 : 11, LE_C.red, 'middle', 750);
    if (frame.showAlternative) {
      s += `<circle data-motion="output-alternative" cx="${X(frame.aAlt)}" cy="${Y(f(frame.aAlt))}" r="8" fill="${LE_C.green}" stroke="${LE_C.paper}" stroke-width="2"/>`;
      s += `<path d="M${X(frame.aAlt)} ${Y(f(frame.aAlt))}V${Y(frame.xNeeded)}" stroke="${LE_C.gold}" stroke-width="3"/>`;
      s += leText(X(frame.aAlt) + 9, Y(frame.xNeeded) + 19, `留下z′=${leFmt(frame.zAlt)}`, small ? 9 : 11, LE_C.gold, 'start', 750);
    }
    const panelY = small ? 410 : 370;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 238 : 114}" rx="13" fill="${LE_C.soft}" stroke="${LE_C.rule}"/>`;
    s += leText(24, panelY + 27, `均衡：a=${leFmt(frame.a)}, l=${leFmt(frame.l)}, x=${leFmt(frame.x)}, z=0`, small ? 9 : 11, LE_C.ink, 'start', 700);
    if (frame.showAlternative) s += leText(24, panelY + 51, `替代：a′=${leFmt(frame.aAlt)}, l′=${leFmt(frame.lAlt)}, x′=${leFmt(frame.xNeeded)}, z′=${leFmt(frame.zAlt)}`, small ? 9 : 11, LE_C.green, 'start', 700);
    s += leLines(24, panelY + (frame.showAlternative ? 80 : 58), frame.narration, small ? 10 : 12, LE_C.ink, 'start', 500, small ? 25 : 61, 19, small ? 7 : 3);
    return {W, H, s};
  }

  function leTechnologyChart(frame, small) {
    const W = small ? 320 : 760, H = small ? 680 : 510;
    const left = small ? 38 : 70, right = W - (small ? 14 : 36), top = 82, bottom = small ? 365 : 342;
    const maxA = 1.15, maxY = 5.5, X = a => left + (right - left) * a / maxA, Y = y => bottom - (bottom - top) * y / maxY;
    const oldF = a => production(a, 4), newF = a => production(a, 4, frame.technologyKind, frame.strength);
    let s = leTop(frame, W, small) + leAxes(left, top, right, bottom, '劳动 a', '产出 f(a)');
    s += `<path data-motion="old-technology" d="${lePath(oldF, 0, maxA, X, Y)}" fill="none" stroke="${LE_C.muted}" stroke-width="2.4" stroke-dasharray="6 5"/>`;
    if (frame.showNew) s += `<path data-motion="new-technology" d="${lePath(newF, 0, maxA, X, Y)}" fill="none" stroke="${LE_C.green}" stroke-width="3"/>`;
    const a = frame.a;
    s += `<path d="M${X(a)} ${bottom}V${Y(frame.showNew ? frame.newOutput : frame.oldOutput)}" stroke="${LE_C.purple}" stroke-width="2" stroke-dasharray="5 4"/>`;
    s += `<circle cx="${X(a)}" cy="${Y(frame.showNew ? frame.newOutput : frame.oldOutput)}" r="8" fill="${LE_C.purple}" stroke="${LE_C.paper}" stroke-width="2"/>`;
    if (frame.step >= 3) {
      s += `<path d="M${left} ${bottom}L${X(maxA)} ${Y(frame.oldWage * maxA)}" stroke="${LE_C.muted}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      s += `<path data-motion="new-wage" d="M${left} ${bottom}L${X(maxA)} ${Y(frame.newWage * maxA)}" stroke="${LE_C.red}" stroke-width="2.5"/>`;
    }
    const panelY = small ? 410 : 370;
    s += `<rect x="12" y="${panelY}" width="${W - 24}" height="${small ? 238 : 114}" rx="13" fill="${LE_C.paper}" stroke="${LE_C.rule}"/>`;
    s += leText(24, panelY + 27, `同一劳动 a*=0.5：产出 ${leFmt(frame.oldOutput)} → ${leFmt(frame.newOutput)}；工资 ${leFmt(frame.oldWage)} → ${leFmt(frame.newWage)}`, small ? 9 : 11, LE_C.ink, 'start', 700);
    s += leText(24, panelY + 51, `资本家利润变化 ${leFmt(frame.capitalChange)}；工人工资消费变化 ${leFmt(frame.workerChange)}`, small ? 9 : 11, frame.technologyKind === 'capital' ? LE_C.red : LE_C.purple, 'start', 700);
    s += leLines(24, panelY + 80, frame.narration, small ? 10 : 12, LE_C.ink, 'start', 500, small ? 25 : 61, 19, small ? 7 : 3);
    return {W, H, s};
  }

  function leRenderChart(frame, small) {
    if (frame.kind === 'labor') return leLaborChart(frame, small);
    if (frame.kind === 'plan') return lePlanChart(frame, small);
    if (frame.kind === 'pareto') return leParetoChart(frame, small);
    if (frame.kind === 'proof') return leProofChart(frame, small);
    if (frame.kind === 'output') return leOutputChart(frame, small);
    return leTechnologyChart(frame, small);
  }

  function leMetricRows(frame, content) {
    let detail = '同一组人、同一条生产曲线沿六个镜头推进';
    if (frame.kind === 'labor') detail = frame.clears ? '劳动供给＝劳动需求' : `劳动缺口 ${leFmt(frame.laborGap)}`;
    else if (frame.kind === 'plan') detail = `时间账${frame.timeFeasible ? '已' : '未'}对上；商品账已对上`;
    else if (frame.kind === 'pareto') detail = `工人效用 ${leFmt(frame.current.workerUtility)}；资本家z ${leFmt(frame.current.z)}`;
    else if (frame.kind === 'proof') detail = frame.contradiction ? '反证矛盾已经闭合' : '正在把福利条件翻译成利润不等式';
    else if (frame.kind === 'output') detail = frame.showAlternative ? `替代计划给资本家z′=${leFmt(frame.zAlt)}` : '保本最大产量使z*=0';
    else detail = `工资变化 ${leFmt(frame.newWage - frame.oldWage)}；利润变化 ${leFmt(frame.capitalChange)}`;
    return [
      ['当前讲解', `${leStep + 1}/6 · ${content.steps[leStep][0]}`],
      ['这一步的判断', frame.verdict],
      ['图中核对', detail]
    ];
  }

  function leDraw() {
    const frame = laborEconomyStory(leKey, leStep), content = laborEconomyContent[leKey], phase = content.steps[leStep];
    if (le$('filmStep')) le$('filmStep').value = leStep;
    if (le$('out-filmStep')) le$('out-filmStep').value = String(leStep);
    if (le$('experiment')) le$('experiment').value = leKey;

    let brief = le$('labor-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'labor-brief';
      brief.setAttribute('aria-label', '题目条件与本图任务');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="labor-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="labor-conditions"></span></p><p class="boundary" id="labor-source"></p>';
      le$('legend')?.before(brief);
    }
    le$('labor-question').textContent = content.question;
    le$('labor-conditions').textContent = content.conditions;
    le$('labor-source').textContent = `教材边界：${content.source}`;

    const plot = le$('plot');
    if (plot) {
      Object.assign(plot.dataset, {filmIntro: content.question, filmPhase: phase[0], filmNarration: phase[1], filmConclusion: content.steps[5][1]});
      const rendered = leRenderChart(frame, plot.clientWidth < 500);
      window.microMotion.chart(plot, `<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${leEsc(content.title + '：' + phase[0])}"><rect width="${rendered.W}" height="${rendered.H}" fill="${LE_C.paper}"/>${rendered.s}</svg>`);
    }
    if (le$('legend')) le$('legend').textContent = frame.kind === 'labor'
      ? '绿色始终是生产曲线，红线始终是工资账，紫色始终代表工人的休闲—消费选择。'
      : frame.kind === 'technology'
        ? '灰虚线是旧技术，绿线是处处更高的新技术；同一劳动a*=0.5不移动，便于比较工资与分配。'
        : '同一个工人、资本家、时间账与商品账贯穿六个镜头；图只改变当前正在解释的计划或不等式。';
    if (le$('metrics')) le$('metrics').innerHTML = leMetricRows(frame, content).map(([label, value]) => `<div class="metric"><label>${leEsc(label)}</label><strong>${leEsc(value)}</strong></div>`).join('');
    if (le$('reading')) le$('reading').textContent = phase[1];
    if (le$('formula')) le$('formula').textContent = content.formula;
    if (le$('boundary')) le$('boundary').textContent = content.trap;
    if (le$('extra')) le$('extra').innerHTML = `<h3>解题步骤</h3><ol>${content.proof.map(item => `<li>${leEsc(item)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${leEsc(content.template)}</p><h3>最容易混淆</h3><p>${leEsc(content.trap)}</p><p>来源：Osborne–Rubinstein ${leEsc(content.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((el, i) => { el.textContent = [content.question, content.conditions, content.template][i] || ''; });
    const guideBoundary = document.querySelector('.study-guide>.boundary');
    if (guideBoundary) guideBoundary.textContent = '教材定义、一般证明、原题条件和本站自主反例分开标注。';
    const dl = document.querySelector('.lesson-end a[download]');
    if (dl) {
      dl.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/') ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/' : '') + `downloads/ch12-labor-${leKey}.html`;
      dl.textContent = '下载本段完整动画代码 ↓';
    }
    window.microMath?.refresh?.();
  }

  function leConfigure(nextKey) {
    leStop();
    leKey = laborEconomyKeys.includes(nextKey) ? nextKey : laborEconomyKeys[0];
    window.LABOR_ECONOMY_DEFAULT = leKey;
    const current = new URLSearchParams(location.search), requestedStep = Number(current.get('filmStep'));
    leStep = (current.get('case') === leKey || !current.has('case')) && Number.isFinite(requestedStep)
      ? Math.max(0, Math.min(5, Math.round(requestedStep))) : 0;
    leDraw();
  }

  const leAdvance = () => {
    if (leStep >= 5) return true;
    leStep += 1;
    leDraw();
    return leStep >= 5;
  };

  leEnsureControls();
  if (le$('advance')) le$('advance').onclick = () => { leStop(); leAdvance(); };
  if (le$('play')) le$('play').onclick = () => {
    if (leTimer) { leStop(); return; }
    if (window.microMotion?.reduced?.matches) { leAdvance(); return; }
    if (leStep >= 5) leStep = 0;
    leAdvance();
    leTimer = setInterval(() => { if (leAdvance()) leStop(); }, 1700);
    le$('play').textContent = '暂停播放';
  };
  if (le$('reset')) le$('reset').onclick = () => leConfigure(leKey);
  document.addEventListener('visibilitychange', () => { if (document.hidden) leStop(); });
  window.microMotion?.reduced?.addEventListener?.('change', leStop);
  window.addEventListener('resize', leDraw);
  window.demo = {get state() { return {key: leKey, step: leStep}; }, advance: leAdvance, draw: leDraw, configure: leConfigure};
  leConfigure(leKey);
}

window.startLaborEconomyStory = startLaborEconomyStory;

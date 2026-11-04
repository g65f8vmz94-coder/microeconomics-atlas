import {coreKeys, coreStory} from './exchange-core-story.mjs';
import {coreContent} from './exchange-core-content.mjs';

export function startCoreStory(requested) {
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

  const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const num = x => String(+Number(x).toFixed(2));
  const txt = (x, y, s, size = 12, color = C.ink, anchor = 'start', weight = 'normal') =>
    `<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;

  let key = coreKeys.includes(requested) ? requested : coreKeys[0];
  let step = 0;

  const fields = $('fields');
  if (fields && !$('experiment')) {
    fields.insertAdjacentHTML('beforebegin',
      '<div class="field"><label for="experiment">本节连贯讲解</label><select id="experiment">' +
      coreKeys.map(k => '<option value="' + k + '">' + esc(coreContent[k].title) + '</option>').join('') +
      '<option value="core">保留原例：四人核心</option><option value="coreproof">保留原例：竞争均衡在核心</option><option value="cd">保留原例：CD交换</option></select></div>'
    );
  }

  function configure(k) {
    key = k;
    window.CORE_DEFAULT = key;
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

  // View 1: Coalition & Blocking Diagram (define106, blocking104)
  function drawCoalitionView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 760 : 520;
    let s = '';

    s += txt(W / 2, 24, f.identity, small ? 14 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, '绿条为米，黄条为豆；虚框为候选方案', small ? 11 : 13, C.muted, 'middle');

    const cardW = small ? 296 : 172;
    const cardH = small ? 112 : 204;

    for (let i = 0; i < 4; i++) {
      const col = small ? 0 : i;
      const row = small ? i : 0;
      const ox = small ? 12 : 12 + col * 184;
      const oy = small ? 56 + row * 120 : 60;

      const inS = f.inS[i];
      const highlightS = (f.key === 'blocking104' || f.step >= 2) && inS;
      const bg = inS ? (highlightS ? C.activeBg : C.cardBg) : '#fafafa';
      const border = highlightS ? C.rice : C.rule;
      const strokeW = highlightS ? 2 : 1;

      s += `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="10" fill="${bg}" stroke="${border}" stroke-width="${strokeW}"/>`;

      const tag = inS ? (highlightS ? '联盟成员' : '全村成员') : '留在组外';
      const tagCol = highlightS ? C.rice : C.muted;
      s += txt(ox + 12, oy + 20, f.agents[i], 13, C.ink, 'start', 'bold');
      s += txt(ox + cardW - 12, oy + 20, tag, 11, tagCol, 'end');

      const e = f.endowments[i];
      const a = f.candidate[i];
      const cur = f.current[i];
      const uInit = f.uInit[i];
      const uCand = f.uCand[i];
      const uCur = f.uCur[i];
      const improved = uCur > uCand + 1e-9 && inS;

      if (small) {
        s += txt(ox + 12, oy + 40, `家底：米${num(e[0])}、豆${num(e[1])}（评分${num(uInit)}）`, 11, C.muted);
        s += txt(ox + 12, oy + 58, `候选：米${num(a[0])}、豆${num(a[1])}（评分${num(uCand)}）`, 11, C.ink);
        s += txt(ox + 12, oy + 76, `本步：米${num(cur[0])}、豆${num(cur[1])}（评分${num(uCur)}）`, 11, improved ? C.rice : C.ink, 'start', 'bold');
        const barX = ox + 12;
        const barW = cardW - 24;
        const scale = barW / 2.4;
        s += `<rect x="${barX}" y="${oy + 86}" width="${(a[0] + a[1]) * scale}" height="12" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
        s += `<rect data-motion="core-${f.key}-mob-${i}" data-motion-clamp="true" x="${barX}" y="${oy + 89}" width="${(cur[0] + cur[1]) * scale}" height="6" fill="${improved ? C.rice : C.bean}"/>`;
      } else {
        const prefText = f.types[i] === 1 ? '按米豆较小值评分' : '按米豆总重量评分';
        s += txt(ox + 12, oy + 38, prefText, 11, C.muted);
        s += txt(ox + 12, oy + 56, `家底：米${num(e[0])}、豆${num(e[1])}`, 11, C.muted);
        s += txt(ox + 12, oy + 74, `候选：米${num(a[0])}、豆${num(a[1])}`, 11, C.ink);
        s += txt(ox + 12, oy + 92, `本步：米${num(cur[0])}、豆${num(cur[1])}`, 11, improved ? C.rice : C.ink, 'start', 'bold');

        const bx = ox + 40;
        const bw = cardW - 52;
        const scale = bw / 1.8;
        // Rice bar
        s += txt(ox + 12, oy + 116, '米', 11, C.rice);
        s += `<rect x="${bx}" y="${oy + 105}" width="${a[0] * scale}" height="14" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
        s += `<rect data-motion="core-${f.key}-r-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 108}" width="${cur[0] * scale}" height="8" fill="${C.rice}"/>`;
        // Bean bar
        s += txt(ox + 12, oy + 138, '豆', 11, C.bean);
        s += `<rect x="${bx}" y="${oy + 127}" width="${a[1] * scale}" height="14" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
        s += `<rect data-motion="core-${f.key}-b-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 130}" width="${cur[1] * scale}" height="8" fill="${C.bean}"/>`;

        s += `<line x1="${ox + 10}" y1="${oy + 152}" x2="${ox + cardW - 10}" y2="${oy + 152}" stroke="${C.rule}"/>`;
        s += txt(ox + 12, oy + 170, `候选评分：${num(uCand)}`, 11, C.muted);
        const statusStr = improved ? `本步评分：${num(uCur)}（提高）` : `本步评分：${num(uCur)}`;
        s += txt(ox + 12, oy + 190, statusStr, 11, improved ? C.rice : C.ink, 'start', 'bold');
      }
    }

    const botY = small ? 544 : 280;
    const botW = W - 24;
    const botH = small ? 202 : 224;

    s += `<rect x="12" y="${botY}" width="${botW}" height="${botH}" rx="12" fill="#ffffff" stroke="${C.rule}"/>`;
    s += txt(24, botY + 26, f.ledgerTitle, small ? 13 : 16, C.ink, 'start', 'bold');

    const barX = small ? 58 : 110;
    const maxBarW = small ? 236 : 480;
    const maxUnits = 2.2;

    const rY = botY + 46;
    s += txt(24, rY + 14, '总米', 12, C.rice, 'start', 'bold');
    s += `<rect x="${barX}" y="${rY}" width="${(f.ledgerEndowment[0] / maxUnits) * maxBarW}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="core-${f.key}-tot-rice" data-motion-clamp="true" x="${barX}" y="${rY + 4}" width="${(f.ledgerUsed[0] / maxUnits) * maxBarW}" height="10" fill="${C.rice}"/>`;
    s += txt(barX, rY + 34, `自备${num(f.ledgerEndowment[0])}千克；本步用${num(f.ledgerUsed[0])}千克`, 11, C.ink);

    const bY = botY + 96;
    s += txt(24, bY + 14, '总豆', 12, C.bean, 'start', 'bold');
    s += `<rect x="${barX}" y="${bY}" width="${(f.ledgerEndowment[1] / maxUnits) * maxBarW}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="core-${f.key}-tot-bean" data-motion-clamp="true" x="${barX}" y="${bY + 4}" width="${(f.ledgerUsed[1] / maxUnits) * maxBarW}" height="10" fill="${C.bean}"/>`;
    s += txt(barX, bY + 34, `自备${num(f.ledgerEndowment[1])}千克；本步用${num(f.ledgerUsed[1])}千克`, 11, C.ink);

    const vCol = f.blocking ? C.red : C.rice;
    if (small) {
      const mid = Math.ceil(f.verdict.length / 2);
      const splitIdx = f.verdict.indexOf('，') > 0 ? f.verdict.indexOf('，') + 1 : mid;
      s += txt(W / 2, botY + 158, f.verdict.slice(0, splitIdx), 11, vCol, 'middle', 'bold');
      s += txt(W / 2, botY + 176, f.verdict.slice(splitIdx), 11, vCol, 'middle', 'bold');
      s += txt(W / 2, botY + 194, '虚框为自备家底；实条为本步用量', 10, C.muted, 'middle');
    } else {
      s += txt(W / 2, botY + 168, f.verdict, 14, vCol, 'middle', 'bold');
      s += txt(W / 2, botY + 194, '虚线框代表联盟自带原家底；实色条代表本步分配用量。', 12, C.muted, 'middle');
    }

    return {W, H, s};
  }

  // View 2: Property 10.6 View (initial endowments impact on Core vs Pareto stability)
  function drawPropertyView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 680 : 500;
    let s = '';

    const isEq = (f.caseType === 'equal');
    s += txt(W / 2, 24, f.ledgerTitle, small ? 13 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, '全村共米2豆2，候选方案均为每户各0.5', small ? 11 : 13, C.muted, 'middle');

    const cardW = small ? 296 : 350;
    const cardH = small ? 185 : 195;

    // Card 1: Household 1 (甲)
    const b1X = small ? 12 : 20;
    const b1Y = 60;
    const e1 = f.endowments[0][0];
    const c1 = f.current[0][0];
    s += `<rect x="${b1X}" y="${b1Y}" width="${cardW}" height="${cardH}" rx="10" fill="#ffffff" stroke="${isEq ? C.rice : C.red}" stroke-width="2"/>`;
    s += txt(b1X + 14, b1Y + 24, isEq ? '甲（家底均等时）' : '甲（独占大头家底时）', 14, C.ink, 'start', 'bold');
    s += txt(b1X + 14, b1Y + 46, `自带原家底：米${num(e1)}、豆${num(e1)}（评分${num(e1)}）`, 12, C.muted);
    s += txt(b1X + 14, b1Y + 66, '全村候选方案：米0.5、豆0.5（评分0.5）', 12, C.ink);
    s += txt(b1X + 14, b1Y + 86, `本步考察篮子：米${num(c1)}、豆${num(c1)}（评分${num(c1)}）`, 12, isEq ? C.rice : C.red, 'start', 'bold');

    const barX1 = b1X + 14;
    const barW1 = cardW - 28;
    const scale1 = barW1 / 2.0;
    s += `<rect x="${barX1}" y="${b1Y + 102}" width="${e1 * scale1}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="core-prop-a1" data-motion-clamp="true" x="${barX1}" y="${b1Y + 106}" width="${c1 * scale1}" height="10" fill="${isEq ? C.rice : C.red}"/>`;
    s += txt(barX1, b1Y + 136, '虚框为甲自带家底；实条为本步考察所得', 11, C.muted);
    s += txt(barX1, b1Y + 162, isEq ? '单干与候选相同，无法靠单干改善' : '甲单干评分1.7远超候选0.5，单人阻挡', 12, isEq ? C.rice : C.red, 'start', 'bold');

    // Card 2: Other 3 households (乙、丙、丁)
    const b2X = small ? 12 : 390;
    const b2Y = small ? 258 : 60;
    const e2 = f.endowments[1][0];
    const c2 = f.current[1][0];
    s += `<rect x="${b2X}" y="${b2Y}" width="${cardW}" height="${cardH}" rx="10" fill="#ffffff" stroke="${C.rule}"/>`;
    s += txt(b2X + 14, b2Y + 24, '其余三户（乙、丙、丁）', 14, C.ink, 'start', 'bold');
    s += txt(b2X + 14, b2Y + 46, `各自原家底：米${num(e2)}、豆${num(e2)}（评分${num(e2)}）`, 12, C.muted);
    s += txt(b2X + 14, b2Y + 66, '全村候选方案：各分米0.5、豆0.5', 12, C.ink);
    s += txt(b2X + 14, b2Y + 86, `本步考察篮子：各米${num(c2)}、豆${num(c2)}`, 12, C.ink, 'start', 'bold');

    const barX2 = b2X + 14;
    s += `<rect x="${barX2}" y="${b2Y + 102}" width="${e2 * scale1}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="core-prop-a2" data-motion-clamp="true" x="${barX2}" y="${b2Y + 106}" width="${c2 * scale1}" height="10" fill="${C.bean}"/>`;
    s += txt(barX2, b2Y + 136, '虚框为每户自带家底；实条为本步所得', 11, C.muted);
    s += txt(barX2, b2Y + 162, isEq ? '三户抱团自带1.5，要升到0.6需1.8不够' : '余户虽喜欢均分，但无权扣留甲的家底', 12, C.muted, 'start', 'bold');

    // Bottom Comparison Ledger
    const cY = small ? 456 : 272;
    const cW = W - 24;
    const cH = small ? 210 : 212;
    s += `<rect x="12" y="${cY}" width="${cW}" height="${cH}" rx="12" fill="${C.cardBg}" stroke="${C.rule}"/>`;
    s += txt(24, cY + 28, '核心与帕累托稳定性的对比账本', small ? 13 : 16, C.ink, 'start', 'bold');

    const lBarX = small ? 24 : 24;
    const lMaxW = small ? 272 : 680;
    const lScale = lMaxW / 2.2;
    const cEndow = f.coalitionEndow[0];
    const cNeed = f.coalitionNeed[0];

    s += txt(24, cY + 52, `考察联盟自备家底：${num(cEndow)}千克；目标所需：${num(cNeed)}千克`, 12, C.ink);
    s += `<rect x="${lBarX}" y="${cY + 62}" width="${cEndow * lScale}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="core-prop-ledger" data-motion-clamp="true" x="${lBarX}" y="${cY + 66}" width="${cNeed * lScale}" height="10" fill="${isEq ? C.rice : C.red}"/>`;

    s += txt(24, cY + 106, '帕累托稳定：只看全村总资源米2豆2，两情况均稳定', small ? 11 : 13, C.ink);
    s += txt(24, cY + 128, isEq
      ? '核心判断：情况一无人能靠自有家底改善，方案在核心中'
      : '核心判断：情况二富户甲单人退群即改善，方案不在核心',
      small ? 11 : 13, isEq ? C.rice : C.red, 'start', 'bold');

    if (small) {
      const splitIdx = f.verdict.indexOf('，') > 0 ? f.verdict.indexOf('，') + 1 : Math.ceil(f.verdict.length / 2);
      s += txt(W / 2, cY + 166, f.verdict.slice(0, splitIdx), 11, isEq ? C.rice : C.red, 'middle', 'bold');
      s += txt(W / 2, cY + 186, f.verdict.slice(splitIdx), 11, isEq ? C.rice : C.red, 'middle', 'bold');
    } else {
      s += txt(W / 2, cY + 178, f.verdict, 14, isEq ? C.rice : C.red, 'middle', 'bold');
    }

    return {W, H, s};
  }

  // View 3: Example 10.4 Pareto Stability View (example104)
  function drawParetoView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 740 : 520;
    let s = '';

    s += txt(W / 2, 24, f.identity, small ? 14 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, '比较每户米豆合计重量与不吃亏保底门槛', small ? 11 : 13, C.muted, 'middle');

    const cardW = small ? 296 : 172;
    const cardH = small ? 108 : 196;

    for (let i = 0; i < 4; i++) {
      const col = small ? 0 : i;
      const row = small ? i : 0;
      const ox = small ? 12 : 12 + col * 184;
      const oy = small ? 56 + row * 116 : 60;

      const cur = f.current[i];
      const uInit = f.uInit[i];
      const uCur = f.uCur[i];
      const floorG = f.minGoodsNeeded[i];
      const sumG = f.goodsSum[i];

      s += `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="10" fill="${C.cardBg}" stroke="${C.rule}"/>`;
      s += txt(ox + 12, oy + 20, f.agents[i], 13, C.ink, 'start', 'bold');
      s += txt(ox + cardW - 12, oy + 20, `原评分${num(uInit)}`, 11, C.muted, 'end');

      if (small) {
        s += txt(ox + 12, oy + 40, `本步篮子：米${num(cur[0])}、豆${num(cur[1])}（评分${num(uCur)}）`, 11, C.ink);
        s += txt(ox + 12, oy + 58, `保底需总重${num(floorG)}千克；本步总重${num(sumG)}千克`, 11, C.muted);
        const bx = ox + 12;
        const bw = cardW - 24;
        const scale = bw / 2.2;
        s += `<rect x="${bx}" y="${oy + 70}" width="${floorG * scale}" height="14" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
        s += `<rect data-motion="core-par-mob-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 73}" width="${sumG * scale}" height="8" fill="${sumG > floorG + 1e-9 ? C.red : C.rice}"/>`;
      } else {
        const prefRule = f.types[i] === 1 ? '按米豆较小值评分' : '按米豆总重量评分';
        s += txt(ox + 12, oy + 40, prefRule, 11, C.muted);
        s += txt(ox + 12, oy + 60, `本步：米${num(cur[0])}、豆${num(cur[1])}`, 11, C.ink);
        s += txt(ox + 12, oy + 80, `本步评分：${num(uCur)}`, 12, C.rice, 'start', 'bold');
        s += txt(ox + 12, oy + 102, `保底总重：${num(floorG)}千克`, 11, C.muted);
        s += txt(ox + 12, oy + 120, `本步总重：${num(sumG)}千克`, 11, C.ink);

        const bx = ox + 12;
        const bw = cardW - 24;
        const scale = bw / 2.0;
        s += `<rect x="${bx}" y="${oy + 134}" width="${floorG * scale}" height="16" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
        s += `<rect data-motion="core-par-d-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 138}" width="${sumG * scale}" height="8" fill="${sumG > floorG + 1e-9 ? C.red : C.rice}"/>`;
        s += txt(ox + 12, oy + 174, '虚框为保底最低重量', 11, C.muted);
      }
    }

    const botY = small ? 526 : 276;
    const botW = W - 24;
    const botH = small ? 200 : 226;

    s += `<rect x="12" y="${botY}" width="${botW}" height="${botH}" rx="12" fill="#ffffff" stroke="${f.feasible ? C.rule : C.red}" stroke-width="${f.feasible ? 1 : 2}"/>`;
    s += txt(24, botY + 28, '全村四户米豆总重量封顶账（上限4千克）', small ? 13 : 16, C.ink, 'start', 'bold');

    const bx = small ? 24 : 30;
    const bw = small ? 272 : 680;
    const scale = bw / 4.5;

    s += txt(bx, botY + 54, `全村原有总重：4千克；本步四户所需总重：${num(f.totalGoods)}千克`, small ? 11 : 13, f.feasible ? C.ink : C.red, 'start', 'bold');
    s += `<rect x="${bx}" y="${botY + 66}" width="${4.0 * scale}" height="22" fill="none" stroke="${C.muted}" stroke-dasharray="4 2"/>`;
    s += `<rect data-motion="core-par-total" data-motion-clamp="true" x="${bx}" y="${botY + 71}" width="${f.totalGoods * scale}" height="12" fill="${f.feasible ? C.rice : C.red}"/>`;

    s += txt(bx, botY + 112, '保底总重：甲0.2加乙0.2加丙1.8加丁1.8，恰为4千克', small ? 11 : 13, C.muted);

    const vCol = f.feasible ? C.rice : C.red;
    if (small) {
      const splitIdx = f.verdict.indexOf('：') > 0 ? f.verdict.indexOf('：') + 1
        : (f.verdict.indexOf('，') > 0 ? f.verdict.indexOf('，') + 1 : Math.ceil(f.verdict.length / 2));
      s += txt(W / 2, botY + 150, f.verdict.slice(0, splitIdx), 11, vCol, 'middle', 'bold');
      s += txt(W / 2, botY + 170, f.verdict.slice(splitIdx), 11, vCol, 'middle', 'bold');
    } else {
      s += txt(W / 2, botY + 164, f.verdict, 14, vCol, 'middle', 'bold');
      s += txt(W / 2, botY + 194, '虚框代表全村总资源4千克上限；任何全村帕累托改善都会突破4千克上限。', 12, C.muted, 'middle');
    }

    return {W, H, s};
  }

  // View 4: Exhaustive 15 Coalitions View (coalitions104)
  function drawCoalitionsView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 760 : 540;
    let s = '';

    s += txt(W / 2, 24, '15种非空联盟按人员构成归为6大类', small ? 14 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, '比较联盟自带总重量与组内保底所需总重量', small ? 11 : 13, C.muted, 'middle');

    const cardW = small ? 296 : 350;
    const cardH = small ? 78 : 88;

    for (let i = 0; i < 6; i++) {
      const g = f.groups[i];
      const col = small ? 0 : (i % 2);
      const row = small ? i : Math.floor(i / 2);
      const ox = small ? 12 : 20 + col * 370;
      const oy = small ? 56 + row * 84 : 58 + row * 98;

      const isCurrentStage = (f.step === i);
      const strokeCol = isCurrentStage ? (g.can ? C.red : C.rice) : (g.can ? C.red : C.rule);
      const strokeW = (isCurrentStage || g.can) ? 2 : 1;
      const bg = isCurrentStage ? (g.can ? C.warnBg : C.activeBg) : '#ffffff';

      s += `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="8" fill="${bg}" stroke="${strokeCol}" stroke-width="${strokeW}"/>`;
      s += txt(ox + 12, oy + 20, g.title, 12, C.ink, 'start', 'bold');
      const badgeText = g.can ? '可阻挡' : '不能阻挡';
      s += txt(ox + cardW - 12, oy + 20, badgeText, 11, g.can ? C.red : C.muted, 'end', 'bold');

      s += txt(ox + 12, oy + 40, '成员：' + g.members, 11, C.ink);
      s += txt(ox + 12, oy + 60, g.detail, 11, g.can ? C.red : C.muted, 'start', isCurrentStage ? 'bold' : 'normal');
    }

    // Active stage quantitative ledger at the bottom
    const botY = small ? 566 : 356;
    const botW = W - 24;
    const botH = small ? 180 : 168;
    const act = f.activeGroup;

    s += `<rect x="12" y="${botY}" width="${botW}" height="${botH}" rx="10" fill="${C.cardBg}" stroke="${act.can ? C.red : C.rule}" stroke-width="${act.can ? 2 : 1}"/>`;
    s += txt(24, botY + 24, `本步核查：${act.title}`, small ? 12 : 15, C.ink, 'start', 'bold');

    const bx = 24;
    const bw = small ? 272 : 680;
    const scale = bw / 4.2;

    s += txt(bx, botY + 46, `自带物资总重：${num(act.avail)}千克（米${num(act.endow[0])}、豆${num(act.endow[1])}）`, 11, C.rice, 'start', 'bold');
    s += `<rect data-motion="core-coal-avail" data-motion-clamp="true" x="${bx}" y="${botY + 54}" width="${act.avail * scale}" height="12" fill="${C.rice}"/>`;

    s += txt(bx, botY + 86, `保底所需总重：${num(act.need)}千克（全员改善需严格超过此数）`, 11, act.can ? C.bean : C.red, 'start', 'bold');
    s += `<rect data-motion="core-coal-need" data-motion-clamp="true" x="${bx}" y="${botY + 94}" width="${act.need * scale}" height="12" fill="${act.can ? C.bean : C.red}"/>`;

    const msg = act.can
      ? '自带3千克大于保底2.2千克，有0.8千克盈余可供三人严格改善'
      : '自带总重量不够严格超过保底门槛（或缺互补品），无法阻挡';
    if (small) {
      const splitIdx = msg.indexOf('，') + 1;
      s += txt(W / 2, botY + 136, msg.slice(0, splitIdx), 11, act.can ? C.red : C.ink, 'middle', 'bold');
      s += txt(W / 2, botY + 156, msg.slice(splitIdx), 11, act.can ? C.red : C.ink, 'middle', 'bold');
    } else {
      s += txt(W / 2, botY + 142, msg, 13, act.can ? C.red : C.ink, 'middle', 'bold');
    }

    return {W, H, s};
  }

  // View 5: Proposition 10.5 Proof Budget Ledger (coreproof105)
  function drawProofView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 680 : 500;
    let s = '';

    s += txt(W / 2, 24, f.identity, small ? 13 : 18, C.ink, 'middle', 'bold');
    s += txt(W / 2, 44, '米豆各1元；虚框为原家底，实条为新支出', small ? 11 : 13, C.muted, 'middle');

    const cardW = small ? 296 : 232;
    const cardH = small ? 104 : 168;
    const names = ['联盟成员甲', '联盟成员乙', '联盟成员丙'];

    for (let i = 0; i < 3; i++) {
      const ox = small ? 12 : 16 + i * 248;
      const oy = small ? 58 + i * 112 : 62;
      const w = f.wealth[i];
      const sp = f.stepSpending[i];
      const over = sp > w + 1e-9;

      s += `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="10" fill="${over ? C.warnBg : C.cardBg}" stroke="${over ? C.red : C.rule}" stroke-width="${over ? 2 : 1}"/>`;
      s += txt(ox + 14, oy + 22, names[i], 13, C.ink, 'start', 'bold');
      s += txt(ox + cardW - 14, oy + 22, over ? '严格超支' : '预算最优', 11, over ? C.red : C.rice, 'end', 'bold');

      s += txt(ox + 14, oy + 44, `原家底价值：${num(w)}元`, 11, C.muted);
      s += txt(ox + 14, oy + 62, `本步篮子支出：${num(sp)}元`, 11, over ? C.red : C.ink, 'start', 'bold');

      const bx = ox + 14;
      const bw = cardW - 28;
      const scale = bw / 1.5;
      s += `<rect x="${bx}" y="${oy + 72}" width="${w * scale}" height="16" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
      s += `<rect data-motion="core-proof-m-${i}" data-motion-clamp="true" x="${bx}" y="${oy + 76}" width="${sp * scale}" height="8" fill="${over ? C.red : C.rice}"/>`;

      if (!small) {
        s += txt(ox + 14, oy + 118, '在预算内已选出最优均衡篮子', 11, C.muted);
        s += txt(ox + 14, oy + 140, over ? '严格更好的篮子必超1元预算' : '均衡篮子支出恰好等于1元', 11, over ? C.red : C.rice, 'start', 'bold');
      }
    }

    const botY = small ? 402 : 248;
    const botW = W - 24;
    const botH = small ? 262 : 236;

    s += `<rect x="12" y="${botY}" width="${botW}" height="${botH}" rx="12" fill="#ffffff" stroke="${f.contradiction ? C.red : C.rule}" stroke-width="${f.contradiction ? 2 : 1}"/>`;
    s += txt(24, botY + 28, '联盟三人总价值账本：两条铁律直接相撞', small ? 13 : 16, C.ink, 'start', 'bold');

    const bx = 24;
    const bw = small ? 272 : 680;
    const scale = bw / 4.0;

    // Bar 1: Coalition endowment value
    s += txt(bx, botY + 54, `铁律一：三人自带米2豆1，总值恒为${num(f.totalWealth)}元`, small ? 11 : 13, C.rice, 'start', 'bold');
    s += `<rect x="${bx}" y="${botY + 64}" width="${f.totalWealth * scale}" height="16" fill="${C.rice}"/>`;

    // Bar 2: Sum of strictly preferred bundles spending
    s += txt(bx, botY + 104, `铁律二：三人本步新篮子总支出为${num(f.totalSpending)}元`, small ? 11 : 13, f.contradiction ? C.red : C.ink, 'start', 'bold');
    s += `<rect data-motion="core-proof-tot" data-motion-clamp="true" x="${bx}" y="${botY + 114}" width="${f.totalSpending * scale}" height="16" fill="${f.contradiction ? C.red : C.rice}"/>`;

    s += txt(bx, botY + 154, '若真能靠自家物资改善，两条色带必须等长', small ? 11 : 13, C.muted);
    s += txt(bx, botY + 176, f.contradiction ? '矛盾：总价值不可能既等于3元又大于3元' : '结论：任何联盟都无法阻挡竞争均衡配置', small ? 11 : 13, f.contradiction ? C.red : C.rice, 'start', 'bold');

    if (small) {
      const splitIdx = f.verdict.indexOf('：') > 0 ? f.verdict.indexOf('：') + 1
        : (f.verdict.indexOf('，') > 0 ? f.verdict.indexOf('，') + 1 : Math.ceil(f.verdict.length / 2));
      s += txt(W / 2, botY + 214, f.verdict.slice(0, splitIdx), 11, f.contradiction ? C.red : C.rice, 'middle', 'bold');
      s += txt(W / 2, botY + 236, f.verdict.slice(splitIdx), 11, f.contradiction ? C.red : C.rice, 'middle', 'bold');
    } else {
      s += txt(W / 2, botY + 212, f.verdict, 14, f.contradiction ? C.red : C.rice, 'middle', 'bold');
    }

    return {W, H, s};
  }

  function draw() {
    const f = coreStory(key, step);
    const c = coreContent[key];
    const phase = c.steps[step];

    if ($('filmStep')) $('filmStep').value = step;
    if ($('out-filmStep')) $('out-filmStep').value = step;

    let brief = $('core-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'core-brief';
      brief.setAttribute('aria-label', '问题与题目条件');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="core-question"></span></p>' +
        '<p class="reading"><strong>情境与条件：</strong><span id="core-condition"></span></p>' +
        '<p class="boundary" id="core-scope"></p>';
      const legend = $('legend');
      if (legend) legend.before(brief);
    }
    if ($('core-question')) $('core-question').textContent = c.question;
    if ($('core-condition')) $('core-condition').textContent = c.conditions;
    if ($('core-scope')) $('core-scope').textContent = f.scope;

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
      if (f.view === 'property') {
        rendered = drawPropertyView(f, isSmall);
      } else if (f.view === 'pareto') {
        rendered = drawParetoView(f, isSmall);
      } else if (f.view === 'coalitions') {
        rendered = drawCoalitionsView(f, isSmall);
      } else if (f.view === 'proof') {
        rendered = drawProofView(f, isSmall);
      } else {
        rendered = drawCoalitionView(f, isSmall);
      }

      const {W, H, s} = rendered;
      window.microMotion.chart(plot,
        `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title + '：' + phase[0])}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`
      );
    }

    if ($('legend')) {
      $('legend').textContent = f.identity + '。同一经济设定贯穿各步。绿条代表米，黄条代表豆；虚线框代表原基准，实色条代表当前步数值。';
    }

    let metrics = [];
    if (key === 'define106' || key === 'blocking104') {
      metrics = [
        ['考察联盟', f.inS[3] ? '全村四户' : '甲、乙、丙三户'],
        ['联盟自带物资', `米${num(f.ledgerEndowment[0])}、豆${num(f.ledgerEndowment[1])}`],
        ['本步阻挡结论', f.blocking ? '全员改善，阻挡成立' : '逐步核对中']
      ];
    } else if (key === 'property106') {
      metrics = [
        ['初始家底分布', f.caseType === 'equal' ? '四户均等（各0.5）' : '甲独占1.7，余各0.1'],
        ['帕累托稳定性', '两种情况均稳定'],
        ['是否在核心中', f.caseType === 'equal' ? '在核心中' : '不在核心（甲单人阻挡）']
      ];
    } else if (key === 'example104') {
      metrics = [
        ['一类人评分', `原0，本步${num(f.uCur[0])}`],
        ['二类人评分', `原1，本步${num(f.uCur[2])}`],
        ['全村所需总重', `${num(f.totalGoods)}千克（上限4千克）`]
      ];
    } else if (key === 'coalitions104') {
      metrics = [
        ['当前排查类别', f.activeGroup.title],
        ['自带与保底总重', `自带${num(f.activeGroup.avail)}，保底${num(f.activeGroup.need)}`],
        ['本类能否阻挡', f.activeGroup.can ? '能阻挡（共2个子集）' : '不能阻挡']
      ];
    } else {
      metrics = [
        ['联盟原家底总值', `${num(f.totalWealth)}元`],
        ['本步篮子总支出', `${num(f.totalSpending)}元`],
        ['预算账核对', f.contradiction ? '严格超支与守恒矛盾' : '均衡稳居核心']
      ];
    }

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
    if (gb) gb.textContent = '本段对应§10.6正文、定义10.5、例10.4与命题10.5证明；保留的章末习题另行审核。';

    const dl = document.querySelector('.lesson-end a[download]');
    if (dl) {
      dl.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/')
        ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/'
        : '') + 'downloads/ch10-core-' + key + '.html';
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
      if (coreKeys.includes(e.target.value)) {
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

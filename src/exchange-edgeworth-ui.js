// 10.9 Edgeworth Box UI (埃奇沃思盒界面)
// Osborne-Rubinstein Models in Microeconomic Theory Section 10.9 (pp. 150-152)

import { edgeworthKeys, edgeworthNames, BOX_TOTAL, ENDOWMENT, evaluateEdgeworth, edgeworthStory } from './exchange-edgeworth-story.mjs';
import { getEdgeworthContent } from './exchange-edgeworth-content.mjs';

export function startEdgeworthStory(initialCase) {
  const $ = id => document.getElementById(id);
  const requested = new URLSearchParams(location.search).get('case') || initialCase;
  const initKey = edgeworthKeys.includes(requested) ? requested : 'boxconstruction';

  let currentKey = initKey;
  let currentStep = 0;
  let currentPriceRatio = initKey === 'disequilibrium' ? 2.0 : 1.0;

  const C = {
    paper: '#ffffff',
    cardBg: '#f8fafc',
    rule: '#cbd5e1',
    ink: '#0f172a',
    muted: '#64748b',
    blue: '#2563eb',
    purple: '#7c3aed',
    green: '#10b981',
    red: '#dc2626',
    gold: '#b45309'
  };

  const num = x => (typeof x === 'number' ? (Number.isInteger(x) ? String(x) : x.toFixed(2)) : x);
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function txt(x, y, text, size = 11, fill = C.ink, anchor = 'start', weight = 'normal') {
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" font-family="system-ui, sans-serif">${esc(text)}</text>`;
  }

  // Generate SVG curve path for Person 1: x2 = U / x1
  function path1(u, px, py) {
    const pts = [];
    const minX = Math.max(0.2, u / 10);
    const maxX = 10;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const x1 = minX + (maxX - minX) * (i / steps);
      const x2 = u / x1;
      if (x2 <= 10 && x2 >= 0) {
        pts.push(`${num(px(x1))},${num(py(x2))}`);
      }
    }
    return pts.length > 1 ? `M ${pts.join(' L ')}` : '';
  }

  // Generate SVG curve path for Person 2: x2 = 10 - U / (10 - x1)
  function path2(u, px, py) {
    const pts = [];
    const minX = 0;
    const maxX = Math.min(9.8, 10 - u / 10);
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const x1 = minX + (maxX - minX) * (i / steps);
      const x2 = 10 - u / (10 - x1);
      if (x2 <= 10 && x2 >= 0) {
        pts.push(`${num(px(x1))},${num(py(x2))}`);
      }
    }
    return pts.length > 1 ? `M ${pts.join(' L ')}` : '';
  }

  // Generate shaded lens between I1(16) and I2(16)
  function pathLens(px, py) {
    const u = 16;
    const pts1 = [];
    const minX1 = Math.max(0.2, u / 10);
    const maxX1 = 10;
    for (let i = 0; i <= 30; i++) {
      const x1 = minX1 + (maxX1 - minX1) * (i / 30);
      const x2 = u / x1;
      if (x2 <= 10) pts1.push(`${num(px(x1))},${num(py(x2))}`);
    }

    const pts2 = [];
    const maxX2 = Math.min(9.8, 10 - u / 10);
    for (let i = 30; i >= 0; i--) {
      const x1 = (maxX2 / 30) * i;
      const x2 = 10 - u / (10 - x1);
      if (x2 >= 0) pts2.push(`${num(px(x1))},${num(py(x2))}`);
    }

    if (pts1.length && pts2.length) {
      return `M ${pts1.join(' L ')} L ${pts2.join(' L ')} Z`;
    }
    return '';
  }

  function drawEdgeworthBox(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 740 : 540;
    const ev = f.ev;
    const fr = f.frame;
    let s = '';

    // Title banner
    const bannerH = 46;
    s += `<rect x="12" y="12" width="${W - 24}" height="${bannerH}" rx="8" fill="#f8fafc" stroke="${C.blue}" stroke-width="1.5"/>`;
    const bannerTitle = small
      ? (f.key === 'boxconstruction'
          ? '埃奇沃思盒：双重坐标系'
          : f.key === 'budgetclear'
          ? '竞争均衡：预算线切点重合'
          : f.key === 'disequilibrium'
          ? '失衡状态：切点错位与缺口'
          : f.key === 'contractcurve'
          ? '契约线：帕累托稳定集合'
          : '核心：交易透镜截出的红线')
      : `${f.name}（第 ${f.step + 1} 步）`;
    const bannerSub = fr.title;
    s += txt(20, 28, bannerTitle, small ? 12 : 14, C.blue, 'start', 'bold');
    s += txt(20, 44, bannerSub, small ? 10 : 11, C.muted);

    // Box Geometry Setup
    const boxW = small ? 210 : 340;
    const boxH = small ? 210 : 340;
    const boxX = small ? 55 : 45;
    const boxY = small ? 105 : 115;

    const px = x1 => boxX + (x1 / 10) * boxW;
    const py = x2 => boxY + boxH - (x2 / 10) * boxH;

    // View specific rendering
    if (f.key === 'boxconstruction' && !fr.boxCombined) {
      if (small) {
        // Vertical layout on mobile to prevent narrow-column text clipping
        const subW = W - 24; // 296
        const subH = 220;
        const y1 = 68;
        const y2 = y1 + subH + 12; // 300

        // Col 1: Person 1
        s += `<rect x="12" y="${y1}" width="${subW}" height="${subH}" rx="8" fill="${C.paper}" stroke="${C.blue}" stroke-width="1.5"/>`;
        s += txt(22, y1 + 22, '参与人1（甲）独立坐标系', 12, C.blue, 'start', 'bold');
        s += txt(22, y1 + 40, '原点在左下角，大米向右，大豆向上', 10, C.muted);

        const ax1X = 36;
        const ax1Y = y1 + subH - 30;
        const ax1W = subW - 60;
        const ax1H = subH - 85;
        s += `<line x1="${ax1X}" y1="${ax1Y}" x2="${ax1X + ax1W}" y2="${ax1Y}" stroke="${C.ink}" stroke-width="1.5"/>`;
        s += `<line x1="${ax1X}" y1="${ax1Y}" x2="${ax1X}" y2="${ax1Y - ax1H}" stroke="${C.ink}" stroke-width="1.5"/>`;
        s += txt(ax1X - 8, ax1Y + 12, 'O1', 10, C.blue, 'end', 'bold');
        s += txt(ax1X + ax1W - 5, ax1Y + 16, '米1', 10, C.ink);
        s += txt(ax1X - 6, ax1Y - ax1H + 10, '豆1', 10, C.ink);

        // Point e1
        const p1eX = ax1X + (8 / 10) * ax1W;
        const p1eY = ax1Y - (2 / 10) * ax1H;
        s += `<circle cx="${p1eX}" cy="${p1eY}" r="5" fill="${C.green}"/>`;
        s += txt(p1eX + 6, p1eY - 6, '家底 (8, 2)', 10, C.green, 'start', 'bold');

        // Col 2: Person 2
        s += `<rect x="12" y="${y2}" width="${subW}" height="${subH}" rx="8" fill="${C.paper}" stroke="${C.purple}" stroke-width="1.5"/>`;
        s += txt(22, y2 + 22, fr.rotation === 180 ? '参与人2（乙）旋转180度后' : '参与人2（乙）初始独立坐标系', 12, C.purple, 'start', 'bold');
        s += txt(22, y2 + 40, fr.rotation === 180 ? '原点转至右上角，大米向左，大豆向下' : '原点在左下角，大米向右，大豆向上', 10, C.muted);

        if (fr.rotation === 180) {
          const ax2X = 12 + subW - 36;
          const ax2Y = y2 + 60;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X - ax1W}" y2="${ax2Y}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X}" y2="${ax2Y + ax1H}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += txt(ax2X - 4, ax2Y - 8, 'O2(乙)', 10, C.purple, 'end', 'bold');
          s += txt(ax2X - ax1W + 5, ax2Y - 6, '米2（向左）', 10, C.purple);
          s += txt(ax2X - 6, ax2Y + ax1H - 5, '豆2（向下）', 10, C.purple, 'end');

          const p2eX = ax2X - (2 / 10) * ax1W;
          const p2eY = ax2Y + (8 / 10) * ax1H;
          s += `<circle cx="${p2eX}" cy="${p2eY}" r="5" fill="${C.green}"/>`;
          s += txt(p2eX - 8, p2eY + 14, '家底 (2, 8)', 10, C.green, 'end', 'bold');
        } else {
          const ax2X = 36;
          const ax2Y = y2 + subH - 30;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X + ax1W}" y2="${ax2Y}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X}" y2="${ax2Y - ax1H}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += txt(ax2X - 8, ax2Y + 12, 'O2', 10, C.purple, 'end', 'bold');
          s += txt(ax2X + ax1W - 5, ax2Y + 16, '米2', 10, C.ink);
          s += txt(ax2X - 6, ax2Y - ax1H + 10, '豆2', 10, C.ink);

          const p2eX = ax2X + (2 / 10) * ax1W;
          const p2eY = ax2Y - (8 / 10) * ax1H;
          s += `<circle cx="${p2eX}" cy="${p2eY}" r="5" fill="${C.green}"/>`;
          s += txt(p2eX + 6, p2eY - 6, '家底 (2, 8)', 10, C.green, 'start', 'bold');
        }
      } else {
        // Desktop side-by-side
        const subW = (W - 36) / 2;
        const subH = 380;
        const y0 = 68;

        // Col 1: Person 1
        s += `<rect x="12" y="${y0}" width="${subW}" height="${subH}" rx="8" fill="${C.paper}" stroke="${C.blue}" stroke-width="1.5"/>`;
        s += txt(22, y0 + 22, '参与人1（甲）独立坐标系', 12, C.blue, 'start', 'bold');
        s += txt(22, y0 + 40, '原点在左下角，大米向右，大豆向上', 10, C.muted);

        const ax1X = 26;
        const ax1Y = y0 + subH - 30;
        const ax1W = subW - 40;
        const ax1H = subH - 90;
        s += `<line x1="${ax1X}" y1="${ax1Y}" x2="${ax1X + ax1W}" y2="${ax1Y}" stroke="${C.ink}" stroke-width="1.5"/>`;
        s += `<line x1="${ax1X}" y1="${ax1Y}" x2="${ax1X}" y2="${ax1Y - ax1H}" stroke="${C.ink}" stroke-width="1.5"/>`;
        s += txt(ax1X - 8, ax1Y + 12, 'O1', 10, C.blue, 'end', 'bold');
        s += txt(ax1X + ax1W - 5, ax1Y + 16, '米1', 10, C.ink);
        s += txt(ax1X - 6, ax1Y - ax1H + 10, '豆1', 10, C.ink);

        // Point e1
        const p1eX = ax1X + (8 / 10) * ax1W;
        const p1eY = ax1Y - (2 / 10) * ax1H;
        s += `<circle cx="${p1eX}" cy="${p1eY}" r="5" fill="${C.green}"/>`;
        s += txt(p1eX + 6, p1eY - 6, '家底 (8, 2)', 10, C.green, 'start', 'bold');

        // Col 2: Person 2
        const x2 = 12 + subW + 12;
        s += `<rect x="${x2}" y="${y0}" width="${subW}" height="${subH}" rx="8" fill="${C.paper}" stroke="${C.purple}" stroke-width="1.5"/>`;
        s += txt(x2 + 10, y0 + 22, fr.rotation === 180 ? '参与人2（乙）旋转180度后' : '参与人2（乙）初始独立坐标系', 12, C.purple, 'start', 'bold');
        s += txt(x2 + 10, y0 + 40, fr.rotation === 180 ? '原点转至右上角，大米向左，大豆向下' : '原点在左下角，大米向右，大豆向上', 10, C.muted);

        if (fr.rotation === 180) {
          // Rotated Person 2 axes at top-right
          const ax2X = x2 + subW - 26;
          const ax2Y = y0 + 65;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X - ax1W}" y2="${ax2Y}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X}" y2="${ax2Y + ax1H}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += txt(ax2X - 4, ax2Y - 8, 'O2(乙)', 10, C.purple, 'end', 'bold');
          s += txt(ax2X - ax1W + 5, ax2Y - 6, '米2（向左数）', 10, C.purple);
          s += txt(ax2X - 6, ax2Y + ax1H - 5, '豆2（向下数）', 10, C.purple, 'end');

          const p2eX = ax2X - (2 / 10) * ax1W;
          const p2eY = ax2Y + (8 / 10) * ax1H;
          s += `<circle cx="${p2eX}" cy="${p2eY}" r="5" fill="${C.green}"/>`;
          s += txt(p2eX - 8, p2eY + 14, '家底 (2, 8)', 10, C.green, 'end', 'bold');
        } else {
          // Normal Person 2 axes
          const ax2X = x2 + 16;
          const ax2Y = y0 + subH - 30;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X + ax1W}" y2="${ax2Y}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += `<line x1="${ax2X}" y1="${ax2Y}" x2="${ax2X}" y2="${ax2Y - ax1H}" stroke="${C.ink}" stroke-width="1.5"/>`;
          s += txt(ax2X - 8, ax2Y + 12, 'O2', 10, C.purple, 'end', 'bold');
          s += txt(ax2X + ax1W - 5, ax2Y + 16, '米2', 10, C.ink);
          s += txt(ax2X - 6, ax2Y - ax1H + 10, '豆2', 10, C.ink);

          const p2eX = ax2X + (2 / 10) * ax1W;
          const p2eY = ax2Y - (8 / 10) * ax1H;
          s += `<circle cx="${p2eX}" cy="${p2eY}" r="5" fill="${C.green}"/>`;
          s += txt(p2eX + 6, p2eY - 6, '家底 (2, 8)', 10, C.green, 'start', 'bold');
        }
      }

    } else {
      // Main Edgeworth Box View (boxCombined is true)

      // 1. Shaded Lens for corelens and contractcurve
      if (f.key === 'corelens' || (f.key === 'contractcurve' && f.step >= 3)) {
        const lensD = pathLens(px, py);
        if (lensD) {
          s += `<path d="${lensD}" fill="#fee2e2" fill-opacity="0.6" stroke="none"/>`;
        }
      }

      // 2. Box background and border
      s += `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;

      // 3. Grid lines
      for (let i = 2; i <= 8; i += 2) {
        s += `<line x1="${px(i)}" y1="${boxY}" x2="${px(i)}" y2="${boxY + boxH}" stroke="${C.rule}" stroke-width="0.8" stroke-dasharray="2,2"/>`;
        s += `<line x1="${boxX}" y1="${py(i)}" x2="${boxX + boxW}" y2="${py(i)}" stroke="${C.rule}" stroke-width="0.8" stroke-dasharray="2,2"/>`;
        // Labels for Person 1 (bottom and left)
        s += txt(px(i), boxY + boxH + 14, String(i), 9, C.blue, 'middle');
        s += txt(boxX - 6, py(i) + 4, String(i), 9, C.blue, 'end');
        // Labels for Person 2 (top and right)
        s += txt(px(i), boxY - 5, String(10 - i), 9, C.purple, 'middle');
        s += txt(boxX + boxW + 6, py(i) + 4, String(10 - i), 9, C.purple, 'start');
      }

      // 4. Origins O1 and O2
      s += txt(boxX - 8, boxY + boxH + 14, 'O1(甲)', 10, C.blue, 'end', 'bold');
      s += txt(boxX + boxW + 8, boxY - 5, 'O2(乙)', 10, C.purple, 'start', 'bold');

      // 5. Contract Curve (Diagonal x2 = x1)
      if (['contractcurve', 'corelens', 'budgetclear'].includes(f.key)) {
        s += `<line x1="${px(0)}" y1="${py(0)}" x2="${px(10)}" y2="${py(10)}" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="${f.key === 'contractcurve' ? 'none' : '4,3'}"/>`;
        s += txt(px(2) + 8, py(2) - 8, '契约线', 10, '#64748b', 'start', 'bold');
      }

      // 6. Core Segment on Contract Curve (from 4,4 to 6,6)
      if (f.key === 'corelens' && f.step >= 3) {
        s += `<line x1="${px(4)}" y1="${py(4)}" x2="${px(6)}" y2="${py(6)}" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round"/>`;
        s += txt(px(4) - 10, py(4) + 14, '核心起点 (4,4)', 9, C.red, 'end', 'bold');
        s += txt(px(6) + 10, py(6) - 8, '核心终点 (6,6)', 9, C.red, 'start', 'bold');
      }

      // 7. Indifference Curves
      if (['budgetclear', 'disequilibrium'].includes(f.key)) {
        // Curve 1 through a1
        const u1Val = ev.a1[0] * ev.a1[1];
        const c1D = path1(u1Val, px, py);
        if (c1D) s += `<path d="${c1D}" fill="none" stroke="${C.blue}" stroke-width="1.8"/>`;

        // Curve 2 through a2
        const u2Val = ev.a2[0] * ev.a2[1];
        const c2D = path2(u2Val, px, py);
        if (c2D) s += `<path d="${c2D}" fill="none" stroke="${C.purple}" stroke-width="1.8"/>`;
      } else if (f.key === 'corelens') {
        // Reservation curve I1(16)
        const c1D = path1(16, px, py);
        if (c1D) s += `<path d="${c1D}" fill="none" stroke="${C.blue}" stroke-width="1.6"/>`;
        // Reservation curve I2(16)
        const c2D = path2(16, px, py);
        if (c2D) s += `<path d="${c2D}" fill="none" stroke="${C.purple}" stroke-width="1.6"/>`;
      } else if (f.key === 'contractcurve') {
        // Show curves through contract point or endowment
        const c1D = path1(16, px, py);
        if (c1D) s += `<path d="${c1D}" fill="none" stroke="${C.blue}" stroke-width="1.6"/>`;
        const c2D = path2(16, px, py);
        if (c2D) s += `<path d="${c2D}" fill="none" stroke="${C.purple}" stroke-width="1.6"/>`;
      }

      // 8. Budget Line (passes through e(8,2), slope = -priceRatio)
      if (['budgetclear', 'disequilibrium'].includes(f.key)) {
        const pR = f.priceRatio;
        // x2 - 2 = -pR * (x1 - 8) => x2 = 2 - pR*(x1 - 8)
        // Find x1 when x2 = 10 => 10 = 2 - pR*(x1 - 8) => 8 = -pR*(x1-8) => x1 = 8 - 8/pR
        // Find x1 when x2 = 0 => 0 = 2 - pR*(x1 - 8) => -2 = -pR*(x1-8) => x1 = 8 + 2/pR
        const x1At10 = Math.max(0, Math.min(10, 8 - 8 / pR));
        const x2At0 = Math.min(10, 2 + 8 * pR);
        const bStart = [Math.max(0, 8 - (10 - 2) / pR), Math.min(10, 2 + pR * 8)];
        const bEnd = [Math.min(10, 8 + 2 / pR), Math.max(0, 2 - pR * (10 - 8))];

        s += `<line x1="${px(bStart[0])}" y1="${py(bStart[1])}" x2="${px(bEnd[0])}" y2="${py(bEnd[1])}" stroke="#1e293b" stroke-width="2"/>`;
        s += txt(px(bStart[0]) + 4, py(bStart[1]) + 14, `预算线（斜率负${num(pR)}）`, 10, '#1e293b', 'start', 'bold');
      }

      // 9. Initial Endowment Point (Green Disk)
      const eX = px(ENDOWMENT.e1[0]);
      const eY = py(ENDOWMENT.e1[1]);
      s += `<circle cx="${eX}" cy="${eY}" r="5.5" fill="${C.green}" stroke="#fff" stroke-width="1.5"/>`;
      s += txt(eX + 7, eY - 6, small ? 'e(8,2)' : '初始家底 e(8,2)', 10, C.green, 'start', 'bold');

      // 10. Allocations / Choice points
      if (f.key === 'budgetclear') {
        const eqX = px(5);
        const eqY = py(5);
        s += `<circle cx="${eqX}" cy="${eqY}" r="6.5" fill="${C.red}" stroke="#fff" stroke-width="2"/>`;
        s += txt(eqX + 8, eqY + 16, '竞争均衡重合点 (5,5)', 11, C.red, 'start', 'bold');
      } else if (f.key === 'disequilibrium') {
        // Person 1's choice
        const p1X = px(ev.a1[0]);
        const p1Y = py(ev.a1[1]);
        s += `<circle cx="${p1X}" cy="${p1Y}" r="5.5" fill="${C.blue}" stroke="#fff" stroke-width="1.5"/>`;
        s += txt(p1X - 8, p1Y - 8, `甲最优点 (${num(ev.a1[0])}, ${num(ev.a1[1])})`, 10, C.blue, 'end', 'bold');

        // Person 2's choice in box coords
        const p2X = px(ev.d2InBox[0]);
        const p2Y = py(ev.d2InBox[1]);
        s += `<circle cx="${p2X}" cy="${p2Y}" r="5.5" fill="${C.purple}" stroke="#fff" stroke-width="1.5"/>`;
        s += txt(p2X + 8, p2Y + 16, `乙最优点 (${num(ev.d2InBox[0])}, ${num(ev.d2InBox[1])})`, 10, C.purple, 'start', 'bold');

        // Distance gap dashed line
        s += `<line x1="${p1X}" y1="${p1Y}" x2="${p2X}" y2="${p2Y}" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="3,3"/>`;
        s += txt((p1X + p2X) / 2 + 8, (p1Y + p2Y) / 2, '切点错位距离', 9, C.red, 'start', 'bold');
      } else if (f.key === 'corelens') {
        const eqX = px(5);
        const eqY = py(5);
        s += `<circle cx="${eqX}" cy="${eqY}" r="5.5" fill="${C.red}" stroke="#fff" stroke-width="1.5"/>`;
        s += txt(eqX + 8, eqY + 14, '均衡 (5,5)', 10, C.red, 'start', 'bold');
      }

      // Accounting Panel on Right (for Desktop) or Bottom (for Mobile)
      if (!small) {
        const cardX = boxX + boxW + 28;
        const cardW = W - cardX - 16;
        const cardY = boxY;
        s += `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${boxH}" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(cardX + 16, cardY + 24, '埃奇沃思盒实时核算账本', 13, C.ink, 'start', 'bold');

        s += txt(cardX + 16, cardY + 52, `当前情境：${f.name}`, 11, C.blue, 'start', 'bold');
        s += txt(cardX + 16, cardY + 74, `全村总资源：米 ${BOX_TOTAL.omega1} 千克，豆 ${BOX_TOTAL.omega2} 千克`, 11, C.muted);
        s += txt(cardX + 16, cardY + 96, '初始家底：甲(8, 2)，乙(2, 8)', 11, C.green);

        s += `<line x1="${cardX + 16}" y1="${cardY + 110}" x2="${cardX + cardW - 16}" y2="${cardY + 110}" stroke="${C.rule}" stroke-width="0.8"/>`;

        if (['budgetclear', 'disequilibrium'].includes(f.key)) {
          s += txt(cardX + 16, cardY + 130, `相对价格比：米价为豆价的 ${num(f.priceRatio)} 倍`, 11, C.ink, 'start', 'bold');
          s += txt(cardX + 16, cardY + 152, `甲消费：米 ${num(ev.a1[0])}，豆 ${num(ev.a1[1])}（效用 ${num(ev.u1)}）`, 11, C.blue);
          s += txt(cardX + 16, cardY + 174, `乙消费：米 ${num(ev.a2[0])}，豆 ${num(ev.a2[1])}（效用 ${num(ev.u2)}）`, 11, C.purple);

          s += `<rect x="${cardX + 16}" y="${cardY + 192}" width="${cardW - 32}" height="65" rx="6" fill="#fff" stroke="${ev.isEquilibrium ? C.green : C.red}" stroke-width="1"/>`;
          s += txt(cardX + 24, cardY + 212, ev.isEquilibrium ? '市场出清状态：两市场严密出清！' : '市场出清状态：严重失衡！', 11, ev.isEquilibrium ? C.green : C.red, 'start', 'bold');
          s += txt(cardX + 24, cardY + 230, `大米超额需求：${num(ev.excessDemand[0])} 千克（${ev.excessDemand[0] < 0 ? '滞销过剩' : '供求平衡'}）`, 10, C.muted);
          s += txt(cardX + 24, cardY + 246, `大豆超额需求：${num(ev.excessDemand[1])} 千克（${ev.excessDemand[1] > 0 ? '短缺抢购' : '供求平衡'}）`, 10, C.muted);

          s += txt(cardX + 16, cardY + 285, ev.isEquilibrium ? '结论：两切点完全重合，达成竞争均衡。' : '结论：两切点错位，价格机制驱动放平预算线。', 11, ev.isEquilibrium ? C.blue : C.red, 'start', 'bold');
        } else if (f.key === 'contractcurve') {
          s += txt(cardX + 16, cardY + 132, '契约线方程：x2 等于 x1（对角线）', 12, C.blue, 'start', 'bold');
          s += txt(cardX + 16, cardY + 156, '边际替代率相切：MRS1 等于 MRS2', 11, C.muted);
          s += txt(cardX + 16, cardY + 180, '效率性质：线上任意点皆为帕累托稳定', 11, C.ink);
          s += txt(cardX + 16, cardY + 204, '线外性质：相交夹出透镜，存在双赢改善', 11, C.muted);

          s += `<rect x="${cardX + 16}" y="${cardY + 225}" width="${cardW - 32}" height="60" rx="6" fill="#fff" stroke="${C.rule}" stroke-width="1"/>`;
          s += txt(cardX + 24, cardY + 245, '第一福利定理印证：', 11, C.blue, 'start', 'bold');
          s += txt(cardX + 24, cardY + 265, '竞争均衡 (5,5) 必在契约线上！', 11, C.ink);
        } else if (f.key === 'corelens') {
          s += txt(cardX + 16, cardY + 132, '个人理性底线：甲效用保底16，乙保底16', 11, C.green, 'start', 'bold');
          s += txt(cardX + 16, cardY + 156, '自愿交易透镜：两根保留曲线相交截出', 11, C.muted);
          s += txt(cardX + 16, cardY + 180, '核心红线段：对角线上区间 4 到 6', 12, C.red, 'start', 'bold');
          s += txt(cardX + 16, cardY + 204, '端点意义：一端让利给甲，一端让利给乙', 11, C.muted);

          s += `<rect x="${cardX + 16}" y="${cardY + 225}" width="${cardW - 32}" height="60" rx="6" fill="#fff" stroke="${C.red}" stroke-width="1"/>`;
          s += txt(cardX + 24, cardY + 245, '命题10.5完美具象化：', 11, C.red, 'start', 'bold');
          s += txt(cardX + 24, cardY + 265, '本对称数值例中，均衡点(5,5)恰好居中', 11, C.ink);
        } else {
          s += txt(cardX + 16, cardY + 140, '两图合璧原理：', 12, C.blue, 'start', 'bold');
          s += txt(cardX + 16, cardY + 165, '• 乙坐标系旋转180度，原点移至右上角', 11, C.muted);
          s += txt(cardX + 16, cardY + 190, '• 盒子宽10高10，代表全村物资总量', 11, C.muted);
          s += txt(cardX + 16, cardY + 215, '• 盒内任意点天然满足物质守恒定律', 11, C.ink);
          s += txt(cardX + 16, cardY + 240, '• 绿色圆点标注初始无交易原点家底', 11, C.green);
        }
      } else {
        // Mobile bottom summary card
        const cardY = boxY + boxH + 25;
        const cardH = H - cardY - 15;
        s += `<rect x="12" y="${cardY}" width="${W - 24}" height="${cardH}" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(22, cardY + 20, `核算账本：${fr.title}`, 12, C.ink, 'start', 'bold');
        if (['budgetclear', 'disequilibrium'].includes(f.key)) {
          s += txt(22, cardY + 38, `米价为豆价的 ${num(f.priceRatio)} 倍，状态：${ev.isEquilibrium ? '完美出清' : '错位失衡'}`, 11, ev.isEquilibrium ? C.blue : C.red, 'start', 'bold');
          s += txt(22, cardY + 54, `甲拿 (${num(ev.a1[0])}, ${num(ev.a1[1])})，乙拿 (${num(ev.a2[0])}, ${num(ev.a2[1])})`, 10, C.muted);
          s += txt(22, cardY + 70, `大米超额需求：${num(ev.excessDemand[0])}，大豆：${num(ev.excessDemand[1])}`, 10, C.muted);
        } else if (f.key === 'corelens') {
          s += txt(22, cardY + 38, '保底效用各为16，自愿交易透镜截出核心', 11, C.green, 'start', 'bold');
          s += txt(22, cardY + 54, '核心红线段：对角线上区间 4 到 6', 11, C.red, 'start', 'bold');
          s += txt(22, cardY + 70, '本对称数值例中，均衡(5,5)恰好居中', 10, C.ink);
        } else if (f.key === 'contractcurve') {
          s += txt(22, cardY + 38, '契约线方程：x2 等于 x1（对角线）', 11, C.blue, 'start', 'bold');
          s += txt(22, cardY + 54, '切点背靠背相切，线上皆为帕累托稳定', 10, C.muted);
          s += txt(22, cardY + 70, '第一福利定理：竞争均衡必在契约线上', 10, C.ink);
        } else {
          s += txt(22, cardY + 38, '全村总资源：米10千克，豆10千克', 11, C.muted);
          s += txt(22, cardY + 54, '左下看甲，右上倒看乙，天然守恒', 11, C.blue, 'start', 'bold');
          s += txt(22, cardY + 70, '绿色圆点为初始禀赋 (8,2) 与 (2,8)', 10, C.green);
        }
      }
    }

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="埃奇沃思盒分析图"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
  }

  function renderMetrics(f) {
    const ev = f.ev;
    const content = getEdgeworthContent(f.key);

    return `
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">全村总库存 (大米 / 大豆)</span>
          <span class="metric-value">${BOX_TOTAL.omega1} kg / ${BOX_TOTAL.omega2} kg</span>
          <span class="metric-sub">盒子长宽几何边界</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">参与人1 (甲) 消费与福利</span>
          <span class="metric-value">(${num(ev.a1[0])}, ${num(ev.a1[1])}) · U=${num(ev.u1)}</span>
          <span class="metric-sub">初始家底 (8, 2) · 保底 U=16</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">参与人2 (乙) 消费与福利</span>
          <span class="metric-value">(${num(ev.a2[0])}, ${num(ev.a2[1])}) · U=${num(ev.u2)}</span>
          <span class="metric-sub">初始家底 (2, 8) · 保底 U=16</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">市场出清判据 (两切点重合度)</span>
          <span class="metric-value" style="color:${ev.isEquilibrium ? '#10b981' : '#dc2626'}">
            ${ev.isEquilibrium ? '完全重合 · 均衡达成' : `切点错位 · 差距 ${num(ev.dist)}`}
          </span>
          <span class="metric-sub">${ev.isEquilibrium ? '大米大豆零超额需求' : `米超额 ${num(ev.excessDemand[0])} · 豆超额 ${num(ev.excessDemand[1])}`}</span>
        </div>
      </div>
    `;
  }

  function renderExtra(f) {
    const content = getEdgeworthContent(f.key);
    return `
      <div class="edgeworth-extra">
        <h4>考点陷阱与解题心法</h4>
        <ul class="traps-list">
          ${content.examTraps.map(t => `<li>${esc(t)}</li>`).join('')}
        </ul>
        <div class="narrative-section">
          ${content.fullNarrative.replace(/#### (.*)/g, '<h5>$1</h5>').replace(/### (.*)/g, '<h4>$1</h4>').replace(/\n\n/g, '<p>')}
        </div>
      </div>
    `;
  }

  function draw() {
    const f = edgeworthStory(currentKey, currentStep, { priceRatio: currentPriceRatio });
    const content = getEdgeworthContent(currentKey);

    // 1. Brief upfront
    let briefEl = $('edgeworth-brief');
    if (!briefEl) {
      briefEl = document.createElement('div');
      briefEl.id = 'edgeworth-brief';
      briefEl.className = 'edgeworth-brief';
      const stage = $('legend') || $('plot');
      if (stage && stage.parentNode) {
        stage.parentNode.insertBefore(briefEl, stage);
      }
    }
    if (briefEl) {
      briefEl.innerHTML = `
        <div class="brief-card">
          <div class="brief-title">【本节题设与读图提示】${content.focusQuestion}</div>
          <div class="brief-body">${content.briefUpfront}</div>
          <div class="brief-source">来源边界：教材§10.9提供埃奇沃思盒、均衡错位、帕累托稳定线与双人核心的图法；总量(10,10)、禀赋(8,2)/(2,8)、乘积效用及全部数值读数为本站自主构造。</div>
        </div>
      `;
    }

    // 2. Plot
    const isMobile = window.innerWidth <= 600;
    $('plot').innerHTML = drawEdgeworthBox(f, isMobile);

    // 3. Metrics, Reading, Formula, Boundary, Extra
    $('metrics').innerHTML = renderMetrics(f);
    $('reading').textContent = `${f.frame.title}：${f.frame.desc}`;
    if ($('formula')) $('formula').textContent = f.frame.formula;
    $('boundary').textContent = '模型边界与适用范围：两人物资交换经济、私有初始禀赋、无生产与外部性。乘积偏好提供整洁对称的解析解与对角稳定线；遇到非凸偏好、折点或边界角点时，必须直接检查可行改善和阻挡条件，不能机械套用MRS相等。';
    $('extra').innerHTML = renderExtra(f);

    // 4. Study Guide Tabs
    content.steps.forEach((stepText, idx) => {
      const g = $(`guide-${idx}`);
      if (g) g.textContent = stepText;
    });
  }

  function mountControls() {
    const fields = $('fields');
    if (!fields) return;

    let html = `
      <div class="field">
        <label for="edgeworthCase">教材分析情境</label>
        <select id="edgeworthCase">
          ${edgeworthKeys.map(k => `<option value="${k}" ${k === currentKey ? 'selected' : ''}>${edgeworthNames[k]}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="filmStep">连贯动画画面（第 <span id="stepDisplay">${currentStep + 1}</span> / 6 幅）</label>
        <input type="range" id="filmStep" min="0" max="5" step="1" value="${currentStep}">
      </div>
    `;

    if (currentKey === 'disequilibrium') {
      html += `
        <div class="field">
          <label for="priceSlider">大米相对价格比 p1/p2：<span id="priceDisplay">${num(currentPriceRatio)}</span></label>
          <input type="range" id="priceSlider" min="0.4" max="3.0" step="0.1" value="${currentPriceRatio}">
        </div>
      `;
    }

    fields.innerHTML = html;

    $('edgeworthCase').addEventListener('change', e => {
      currentKey = e.target.value;
      currentStep = 0;
      currentPriceRatio = currentKey === 'disequilibrium' ? 2.0 : 1.0;
      mountControls();
      draw();
    });

    $('filmStep').addEventListener('input', e => {
      currentStep = parseInt(e.target.value, 10);
      $('stepDisplay').textContent = currentStep + 1;
      draw();
    });

    const pSlider = $('priceSlider');
    if (pSlider) {
      pSlider.addEventListener('input', e => {
        currentPriceRatio = parseFloat(e.target.value);
        $('priceDisplay').textContent = num(currentPriceRatio);
        draw();
      });
    }

    const advanceBtn = $('advance');
    if (advanceBtn) {
      advanceBtn.onclick = () => {
        if (currentStep >= 5) return true;
        currentStep += 1;
        $('filmStep').value = currentStep;
        $('stepDisplay').textContent = currentStep + 1;
        draw();
        return currentStep >= 5;
      };
    }

    const resetBtn = $('reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        currentStep = 0;
        currentPriceRatio = currentKey === 'disequilibrium' ? 2.0 : 1.0;
        mountControls();
        draw();
      };
    }

    let playTimer = null;
    const playBtn = $('play');
    if (playBtn) {
      playBtn.onclick = () => {
        if (playTimer) {
          clearInterval(playTimer);
          playTimer = null;
          playBtn.textContent = '播放变化';
        } else {
          playBtn.textContent = '暂停';
          playTimer = setInterval(() => {
            currentStep = (currentStep + 1) % 6;
            $('filmStep').value = currentStep;
            $('stepDisplay').textContent = currentStep + 1;
            draw();
          }, 2400);
        }
      };
    }
  }

  mountControls();
  draw();
  window.addEventListener('resize', draw);
}

import {manipulationKeys, manipulationStory} from './exchange-manipulation-story.mjs';
import {manipulationContent} from './exchange-manipulation-content.mjs';

export function startManipulationStory(requested) {
  const $ = id => document.getElementById(id);
  const correctedLabels = {
    comparison106: '分配规则对比：房屋排序与市场清算',
    destroy102: '资源毁损与信息伪报：两种不同边界'
  };
  for (const scenario of window.LESSON?.scenarios || []) {
    if (correctedLabels[scenario.value]) scenario.label = correctedLabels[scenario.value];
  }
  for (const [scenario, label] of Object.entries(correctedLabels)) {
    document.querySelectorAll(`a[href*="case=${scenario}"]`).forEach(link => {
      link.textContent = label;
    });
  }
  const currentScenario = document.querySelector('.current-scenario');
  if (currentScenario && correctedLabels[requested]) currentScenario.textContent = correctedLabels[requested];
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
    warnBg: '#fff6f3',
    blue: '#2d68c4',
    gold: '#9a7516'
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

  let key = manipulationKeys.includes(requested) ? requested : manipulationKeys[0];
  let step = 0;

  const fields = $('fields');
  if (fields) {
    fields.insertAdjacentHTML(
      'beforebegin',
      '<div class="field"><label for="experiment">本节的具体情境</label><select id="experiment">' +
      manipulationKeys.map(k => '<option value="' + k + '">' + esc(manipulationContent[k].title) + '</option>').join('') +
      '<option value="report">保留原例：例10.6报告操纵</option><option value="destroy">保留原例：毁掉禀赋获益</option><option value="cd">保留原例：CD交换</option></select></div>'
    );
  }

  function configure(k) {
    key = k;
    window.MANIPULATION_DEFAULT = key;
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

  // View 1: Example 10.6 Honest vs Strategic Analysis
  function drawExample106View(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 720 : 540;
    const ev = f.ev;
    const isHonest = f.key === 'honest106';
    let s = '';

    // Title banner
    const bannerH = 46;
    s += `<rect x="12" y="12" width="${W - 24}" height="${bannerH}" rx="8" fill="${isHonest ? C.cardBg : '#fbf3ed'}" stroke="${isHonest ? C.rule : C.red}" stroke-width="1.5"/>`;
    const titleText = isHonest
      ? (small ? '基准情境：两人如实申报' : '基准情境：两人如实申报真实喜好')
      : (small ? '战略操纵：甲虚报偏好推高米价' : '战略操纵：甲虚报偏好为3倍米加豆（声称米极度珍贵）');
    const subText = isHonest
      ? (small ? '米1元豆1元，两人平分实物' : '市场算出出清价为米1元豆1元，两人平分米豆')
      : (small ? '出清米价推至3元，甲独吞余量' : '出清米价被推高至3元，乙受预算挤压，甲独吞剩余物资！');
    s += txt(20, 28, titleText, small ? 12 : 14, isHonest ? C.rice : C.red, 'start', 'bold');
    s += txt(20, 44, subText, small ? 10 : 11, C.muted);

    if (small) {
      const colW = W - 24;
      let y = 68;

      // Card 1: Individual 1 (甲)
      s += `<rect x="12" y="${y}" width="${colW}" height="195" rx="8" fill="${C.cardBg}" stroke="${isHonest ? C.rice : C.red}" stroke-width="1.5"/>`;
      s += txt(22, y + 20, isHonest ? '参与人1（甲：如实申报）' : '参与人1（甲：战略伪报）', 13, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(22, y + 38, '初始家底：米1千克，豆0千克', 11, C.muted);
      s += txt(22, y + 54, '真实偏好：米豆总斤数（完全替代）', 11, C.ink);
      s += txt(22, y + 70, `声称偏好：${isHonest ? '如实声明1比1替代' : '虚报米价值为豆的3倍'}`, 11, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(22, y + 88, `声称身价：按米价算为 ${num(ev.w1)} 元`, 11, C.ink);
      s += txt(22, y + 106, `最终分得：米 ${num(ev.a1[0])}，豆 ${num(ev.a1[1])}`, 12, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(22, y + 124, `真实福利：${num(ev.trueU1)} 单位效用`, 13, isHonest ? C.rice : C.red, 'start', 'bold');

      // Welfare badge
      const badgeText = isHonest ? '基准效用：1.00（无额外加成）' : `操纵净增益：净增 ${num(ev.gainU1)} 效用（涨幅50%）！`;
      s += `<rect x="22" y="${y + 138}" width="${colW - 20}" height="42" rx="6" fill="${isHonest ? C.activeBg : '#fdeeed'}" stroke="${isHonest ? C.rice : C.red}" stroke-width="1"/>`;
      s += txt(32, y + 156, badgeText, 11, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(32, y + 172, isHonest ? '诚实交易，平分互补红利' : '空手套白狼：一粒米不扔净赚50%', 10, C.muted);

      y += 205;

      // Card 2: Individual 2 (乙)
      s += `<rect x="12" y="${y}" width="${colW}" height="175" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(22, y + 20, '参与人2（乙：互补偏好）', 13, C.bean, 'start', 'bold');
      s += txt(22, y + 38, '初始家底：米0千克，豆1千克', 11, C.muted);
      s += txt(22, y + 54, '偏好：米豆成对（必须1比1搭着吃）', 11, C.ink);
      s += txt(22, y + 70, '身价：固定1.00元（豆价1元）', 11, C.ink);
      s += txt(22, y + 88, `面临价格比：米价为豆价的 ${num(ev.p[0])} 倍`, 11, C.muted);
      s += txt(22, y + 106, `购买力约束：每套需 ${num(ev.p[0] + 1)} 元`, 11, C.ink);
      s += txt(22, y + 124, `最终分得：米 ${num(ev.a2[0])}，豆 ${num(ev.a2[1])}`, 12, C.bean, 'start', 'bold');
      s += txt(22, y + 142, `福利值：${num(ev.u2)}（严重被挤压）`, 12, isHonest ? C.muted : C.red, 'start', 'bold');
      s += txt(22, y + 160, isHonest ? '诚实价格下买得起半份米豆' : '米价暴涨被强行压缩至四分之一份！', 10, isHonest ? C.muted : C.red);

      y += 185;

      // Card 3: Market Clearing Status & Allocation Bar
      s += `<rect x="12" y="${y}" width="${colW}" height="240" rx="8" fill="${C.paper}" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(22, y + 20, '市场出清核算与实物瓜分图', 13, C.ink, 'start', 'bold');

      // Allocation bar for Rice
      s += txt(22, y + 42, '商品1（大米，全村共1.00）：', 11, C.ink);
      const barW = colW - 20;
      const r1W = barW * ev.a1[0];
      const r2W = barW * ev.a2[0];
      s += `<rect x="22" y="${y + 48}" width="${r1W}" height="20" fill="${isHonest ? C.rice : C.red}" rx="3"/>`;
      s += `<rect x="${22 + r1W}" y="${y + 48}" width="${r2W}" height="20" fill="${C.bean}" rx="3"/>`;
      s += txt(26, y + 62, `甲占 ${Math.round(ev.a1[0] * 100)}%`, 10, '#fff', 'start', 'bold');
      s += txt(22 + r1W + 4, y + 62, `乙占 ${Math.round(ev.a2[0] * 100)}%`, 10, '#fff', 'start', 'bold');

      // Allocation bar for Beans
      s += txt(22, y + 86, '商品2（大豆，全村共1.00）：', 11, C.ink);
      const b1W = barW * ev.a1[1];
      const b2W = barW * ev.a2[1];
      s += `<rect x="22" y="${y + 92}" width="${b1W}" height="20" fill="${isHonest ? C.rice : C.red}" rx="3"/>`;
      s += `<rect x="${22 + b1W}" y="${y + 92}" width="${b2W}" height="20" fill="${C.bean}" rx="3"/>`;
      s += txt(26, y + 106, `甲占 ${Math.round(ev.a1[1] * 100)}%`, 10, '#fff', 'start', 'bold');
      s += txt(22 + b1W + 4, y + 106, `乙占 ${Math.round(ev.a2[1] * 100)}%`, 10, '#fff', 'start', 'bold');

      // Verdict
      const [v1, v2] = splitVerdict(isHonest ? '出清结论：米豆等价为唯一诚实均衡，市场平分实物' : '操纵结论：竞争均衡可被有效操纵，甲成功攫取超额实物剩余！');
      s += txt(22, y + 132, v1, 11, isHonest ? C.rice : C.red, 'start', 'bold');
      if (v2) s += txt(22, y + 148, v2, 11, isHonest ? C.rice : C.red, 'start', 'bold');

      // Price tension test summary
      s += txt(22, y + 172, '价格张力排查（为什么只能是该价格）：', 11, C.ink, 'start', 'bold');
      s += txt(22, y + 190, isHonest ? '• 米价高于1元：两人都要豆，豆供不应求' : '• 米价高于3元：甲只要豆，豆总需求超标', 10, C.muted);
      s += txt(22, y + 206, isHonest ? '• 米价低于1元：两人都要米，米供不应求' : '• 米价低于3元：甲只要米，米总需求超标', 10, C.muted);
      s += txt(22, y + 222, isHonest ? '• 唯有米价1元时两市场同时出清' : '• 唯有米价3元时甲愿意按余量出清！', 10, isHonest ? C.rice : C.red, 'start', 'bold');

    } else {
      const colW = 230;
      const gap = 15;
      const topH = 265;
      const y = 68;

      // Col 1: Individual 1 (甲)
      s += `<rect x="12" y="${y}" width="${colW}" height="${topH}" rx="8" fill="${C.cardBg}" stroke="${isHonest ? C.rice : C.red}" stroke-width="1.5"/>`;
      s += txt(24, y + 24, isHonest ? '参与人1（甲：如实申报）' : '参与人1（甲：战略伪报）', 13, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(24, y + 46, '初始家底：米1千克、豆0千克', 11, C.muted);
      s += txt(24, y + 66, '真实偏好：米豆斤数总和（完全替代）', 11, C.ink);
      s += txt(24, y + 86, `声称偏好：${isHonest ? '如实声明1比1替代' : '虚报米价值为豆的3倍'}`, 11, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(24, y + 106, `声称身价：按米价算为 ${num(ev.w1)} 元`, 11, C.ink);
      s += txt(24, y + 128, '最终分得配置：', 11, C.muted);
      s += txt(24, y + 148, `米 ${num(ev.a1[0])} 千克，豆 ${num(ev.a1[1])} 千克`, 13, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(24, y + 172, `真实福利：${num(ev.trueU1)} 效用`, 14, isHonest ? C.rice : C.red, 'start', 'bold');

      // Welfare badge
      s += `<rect x="22" y="${y + 190}" width="${colW - 20}" height="60" rx="6" fill="${isHonest ? C.activeBg : '#fdeeed'}" stroke="${isHonest ? C.rice : C.red}" stroke-width="1"/>`;
      s += txt(32, y + 210, isHonest ? '基准效用：1.00' : `操纵净增益：增加 ${num(ev.gainU1)} 效用`, 12, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(32, y + 228, isHonest ? '如实申报，公平出清' : '真实效用暴涨50%！', 11, isHonest ? C.rice : C.red, 'start', 'bold');
      s += txt(32, y + 244, isHonest ? '两样物资各得半斤' : '空口撒谎赚来真金白银', 10, C.muted);

      // Col 2: Market Clearing Center
      const x2 = 12 + colW + gap;
      s += `<rect x="${x2}" y="${y}" width="${colW}" height="${topH}" rx="8" fill="${C.paper}" stroke="${C.rule}" stroke-width="1.5"/>`;
      s += txt(x2 + 12, y + 24, '市场清算中心（瓦尔拉斯均衡）', 13, C.ink, 'start', 'bold');
      s += txt(x2 + 12, y + 46, `清算米价：${num(ev.p[0])} 元（豆价1元）`, 13, C.blue, 'start', 'bold');
      s += txt(x2 + 12, y + 68, `价格比率：米价为豆价的 ${num(ev.p[0])} 倍`, 11, C.muted);

      // Tension checks
      s += txt(x2 + 12, y + 96, '价格张力排查：', 11, C.ink, 'start', 'bold');
      if (isHonest) {
        s += txt(x2 + 12, y + 116, '• 米价高于1元：甲只要豆，豆供不应求', 10, C.muted);
        s += txt(x2 + 12, y + 134, '• 米价低于1元：甲只要米，米供不应求', 10, C.muted);
        s += txt(x2 + 12, y + 152, '• 唯有米价1元时甲沿预算线挑选余量', 10, C.rice, 'start', 'bold');
      } else {
        s += txt(x2 + 12, y + 116, '• 米价高于3元：甲只要豆，豆超额需求超标', 10, C.muted);
        s += txt(x2 + 12, y + 134, '• 米价低于3元：甲只要米，米超额需求超标', 10, C.muted);
        s += txt(x2 + 12, y + 152, '• 唯有米价3元时甲才愿意松口出让米！', 10, C.red, 'start', 'bold');
      }

      s += txt(x2 + 12, y + 180, '出清检验账目：', 11, C.ink, 'start', 'bold');
      s += txt(x2 + 12, y + 198, `大米总需求：甲拿${num(ev.a1[0])}，乙拿${num(ev.a2[0])}，共1.00`, 11, C.rice);
      s += txt(x2 + 12, y + 216, `大豆总需求：甲拿${num(ev.a1[1])}，乙拿${num(ev.a2[1])}，共1.00`, 11, C.rice);
      s += txt(x2 + 12, y + 238, '状态：两市场严丝合缝完全出清', 11, C.rice, 'start', 'bold');

      // Col 3: Individual 2 (乙)
      const x3 = x2 + colW + gap;
      s += `<rect x="${x3}" y="${y}" width="${colW}" height="${topH}" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(x3 + 12, y + 24, '参与人2（乙：互补偏好）', 13, C.bean, 'start', 'bold');
      s += txt(x3 + 12, y + 46, '初始家底：米0千克、豆1千克', 11, C.muted);
      s += txt(x3 + 12, y + 66, '偏好：米豆成对（必须1比1搭着吃）', 11, C.ink);
      s += txt(x3 + 12, y + 86, '身价：固定1.00元（豆价1元）', 11, C.ink);
      s += txt(x3 + 12, y + 106, `每套成本：需 ${num(ev.p[0] + 1)} 元`, 11, C.muted);
      s += txt(x3 + 12, y + 128, '最终分得配置：', 11, C.muted);
      s += txt(x3 + 12, y + 148, `米 ${num(ev.a2[0])} 千克，豆 ${num(ev.a2[1])} 千克`, 13, C.bean, 'start', 'bold');
      s += txt(x3 + 12, y + 172, `福利值：${num(ev.u2)} 单位效用`, 14, isHonest ? C.ink : C.red, 'start', 'bold');

      s += `<rect x="${x3 + 12}" y="${y + 190}" width="${colW - 24}" height="60" rx="6" fill="#fff" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(x3 + 20, y + 210, isHonest ? '诚实价格下：' : '被价格操纵剥夺：', 11, isHonest ? C.ink : C.red, 'start', 'bold');
      s += txt(x3 + 20, y + 228, isHonest ? '买得起半份米豆套装' : '购买力被剧烈压缩至四分之一份！', 10, isHonest ? C.muted : C.red);
      s += txt(x3 + 20, y + 244, isHonest ? '效用达到 0.50' : '福利从 0.50 腰斩至 0.25', 10, C.muted);

      // Bottom Section: Allocation Distribution Bar
      const botY = y + topH + 15;
      const botH = 165;
      s += `<rect x="12" y="${botY}" width="${W - 24}" height="${botH}" rx="8" fill="${C.paper}" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(24, botY + 24, '全村总资源最终瓜分比例与操纵后果对比', 13, C.ink, 'start', 'bold');

      const fullBarW = W - 48;
      // Good 1 Bar
      s += txt(24, botY + 50, '商品1（大米，全村共1.00千克）：', 11, C.muted);
      const r1W = fullBarW * ev.a1[0];
      const r2W = fullBarW * ev.a2[0];
      s += `<rect x="24" y="${botY + 56}" width="${r1W}" height="24" fill="${isHonest ? C.rice : C.red}" rx="4"/>`;
      s += `<rect x="${24 + r1W}" y="${botY + 56}" width="${r2W}" height="24" fill="${C.bean}" rx="4"/>`;
      s += txt(32, botY + 72, `甲独占 ${Math.round(ev.a1[0] * 100)}%（${num(ev.a1[0])}千克）`, 11, '#fff', 'start', 'bold');
      s += txt(24 + r1W + 8, botY + 72, `乙仅剩 ${Math.round(ev.a2[0] * 100)}%（${num(ev.a2[0])}千克）`, 11, '#fff', 'start', 'bold');

      // Good 2 Bar
      s += txt(24, botY + 98, '商品2（大豆，全村共1.00千克）：', 11, C.muted);
      const b1W = fullBarW * ev.a1[1];
      const b2W = fullBarW * ev.a2[1];
      s += `<rect x="24" y="${botY + 104}" width="${b1W}" height="24" fill="${isHonest ? C.rice : C.red}" rx="4"/>`;
      s += `<rect x="${24 + b1W}" y="${botY + 104}" width="${b2W}" height="24" fill="${C.bean}" rx="4"/>`;
      s += txt(32, botY + 120, `甲独占 ${Math.round(ev.a1[1] * 100)}%（${num(ev.a1[1])}千克）`, 11, '#fff', 'start', 'bold');
      s += txt(24 + b1W + 8, botY + 120, `乙仅剩 ${Math.round(ev.a2[1] * 100)}%（${num(ev.a2[1])}千克）`, 11, '#fff', 'start', 'bold');

      // Final punchline
      s += txt(24, botY + 150, isHonest ? '核心结论：在诚实汇报下，完全替代与完全互补实现平分；但甲保留了绝大的操纵空间。' : '核心结论：甲通过谎报偏好推高米价，逼迫乙退让实物，将自身真实效用从 1.0 跃升至 1.5，严格证明竞争均衡可操纵！', 11, isHonest ? C.ink : C.red, 'start', 'bold');
    }

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="例10.6竞争均衡操纵性分析图"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
  }

  // View 2: General Multiplier Sweep View (general106)
  function drawGeneralView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 680 : 540;
    const ev = f.ev;
    const all = f.allMultipliers;
    let s = '';

    // Title banner
    const bannerH = 46;
    s += `<rect x="12" y="12" width="${W - 24}" height="${bannerH}" rx="8" fill="#f4f7fb" stroke="${C.blue}" stroke-width="1.5"/>`;
    const genTitle = small
      ? `乘数扫描：声称k倍（当前k为${num(f.multiplier)}）`
      : `一般乘数扫描：甲宣称偏好为k倍米加豆（当前乘数k为 ${num(f.multiplier)}）`;
    const genSub = small
      ? '米价为k，甲真实福利逼近2.0'
      : '均衡米价等于乘数k，甲分得k比k加1，真实效用逼近极限值 2.0';
    s += txt(20, 28, genTitle, small ? 12 : 14, C.blue, 'start', 'bold');
    s += txt(20, 44, genSub, small ? 10 : 11, C.muted);

    if (small) {
      let y = 68;
      const colW = W - 24;

      // Current k highlight card
      s += `<rect x="12" y="${y}" width="${colW}" height="175" rx="8" fill="${C.cardBg}" stroke="${C.blue}" stroke-width="1.5"/>`;
      s += txt(22, y + 20, `当前乘数：k为 ${num(f.multiplier)}`, 13, C.blue, 'start', 'bold');
      s += txt(22, y + 40, `均衡米价：${num(ev.p[0])} 元（豆价1.00元）`, 12, C.ink);
      s += txt(22, y + 60, `乙分得：米 ${num(ev.a2[0])}，豆 ${num(ev.a2[1])}`, 12, C.bean);
      s += txt(22, y + 80, `甲分得：米 ${num(ev.a1[0])}，豆 ${num(ev.a1[1])}`, 12, C.red, 'start', 'bold');
      s += txt(22, y + 102, `甲真实福利：${num(ev.trueU1)} 单位（满分2.00）`, 13, C.red, 'start', 'bold');
      s += txt(22, y + 122, `相比诚实净赚：增加 ${num(ev.gainU1)} 效用（增幅${Math.round(ev.gainU1 * 100)}%）`, 11, C.red, 'start', 'bold');

      const [v1, v2] = splitVerdict('解析：真实福利随声称乘数k严格单调递增');
      s += txt(22, y + 144, v1, 11, C.muted);
      if (v2) s += txt(22, y + 160, v2, 11, C.muted);

      y += 185;

      // Sweep table card
      s += `<rect x="12" y="${y}" width="${colW}" height="400" rx="8" fill="${C.paper}" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(22, y + 20, '各乘数 k 下的演变对照表', 13, C.ink, 'start', 'bold');

      let rowY = y + 42;
      for (const item of all) {
        const isCurrent = Math.abs(item.k - f.multiplier) < 1e-4;
        s += `<rect x="18" y="${rowY}" width="${colW - 12}" height="54" rx="6" fill="${isCurrent ? '#eef4fd' : C.cardBg}" stroke="${isCurrent ? C.blue : C.rule}" stroke-width="${isCurrent ? 1.5 : 1}"/>`;
        s += txt(26, rowY + 18, `乘数 k为 ${num(item.k)}${item.k === 1 ? '（诚实）' : item.k === 3 ? '（教材例）' : ''}`, 11, isCurrent ? C.blue : C.ink, 'start', 'bold');
        s += txt(26, rowY + 34, `米价 ${num(item.p[0])}元，乙拿 ${num(item.a2[0])}`, 10, C.muted);
        s += txt(26, rowY + 48, `甲真实福利 ${num(item.trueU1)}（增益 ${num(item.gainU1)}）`, 10, isCurrent ? C.red : C.ink, 'start', 'bold');
        rowY += 60;
      }

    } else {
      const colW = 350;
      const y = 68;

      // Left Column: Current k Detail & Allocation Bar
      s += `<rect x="12" y="${y}" width="${colW}" height="440" rx="8" fill="${C.cardBg}" stroke="${C.blue}" stroke-width="1.5"/>`;
      s += txt(26, y + 26, `当前乘数详情：k为 ${num(f.multiplier)}`, 14, C.blue, 'start', 'bold');
      s += txt(26, y + 52, `声称偏好：宣称米价值为豆的 ${num(f.multiplier)} 倍`, 12, C.ink);
      s += txt(26, y + 74, `市场均衡价格：米价 ${num(ev.p[0])} 元，豆价 1.00 元`, 12, C.blue, 'start', 'bold');
      s += txt(26, y + 96, `乙（买方）被压缩至：米豆各 ${num(ev.a2[0])} 千克`, 12, C.bean);
      s += txt(26, y + 118, `甲（卖方）成功占领：米豆各 ${num(ev.a1[0])} 千克`, 12, C.red, 'start', 'bold');
      s += txt(26, y + 144, `甲真实福利：${num(ev.trueU1)} 单位（满分2.00）`, 15, C.red, 'start', 'bold');
      s += txt(26, y + 168, `相比诚实基准增益：净增 ${num(ev.gainU1)}（增幅${Math.round(ev.gainU1 * 100)}%）`, 12, C.red, 'start', 'bold');

      // Allocation bar
      s += txt(26, y + 204, '全村实物物资瓜分图：', 12, C.ink, 'start', 'bold');
      const barW = colW - 40;
      const r1W = barW * ev.a1[0];
      const r2W = barW * ev.a2[0];
      s += `<rect x="26" y="${y + 214}" width="${r1W}" height="24" fill="${C.red}" rx="3"/>`;
      s += `<rect x="${26 + r1W}" y="${y + 214}" width="${r2W}" height="24" fill="${C.bean}" rx="3"/>`;
      s += txt(32, y + 230, `甲占 ${Math.round(ev.a1[0] * 100)}%`, 10, '#fff', 'start', 'bold');
      s += txt(26 + r1W + 6, y + 230, `乙 ${Math.round(ev.a2[0] * 100)}%`, 10, '#fff', 'start', 'bold');

      // Formula block
      s += `<rect x="26" y="${y + 258}" width="${colW - 40}" height="160" rx="6" fill="#fff" stroke="${C.rule}" stroke-width="1"/>`;
      s += txt(36, y + 280, '极限收敛规律与定理解析：', 11, C.ink, 'start', 'bold');
      s += txt(36, y + 302, '甲配置：米豆各分得 k除以括号k加1', 11, C.blue);
      s += txt(36, y + 324, '乙配置：米豆各压缩至 1除以括号k加1', 11, C.bean);
      s += txt(36, y + 346, '真实福利：两倍k除以括号k加1，即2减去余项', 12, C.red, 'start', 'bold');
      s += txt(36, y + 372, '• 导数恒大于零：福利随申报乘数单调递增', 10, C.muted);
      s += txt(36, y + 392, '• 极限趋近2.0：乘数无穷大时甲独占全村物资', 10, C.red, 'start', 'bold');

      // Right Column: Sweep Table
      const x2 = 12 + colW + 20;
      const rightW = W - x2 - 12;
      s += `<rect x="${x2}" y="${y}" width="${rightW}" height="440" rx="8" fill="${C.paper}" stroke="${C.rule}" stroke-width="1.5"/>`;
      s += txt(x2 + 16, y + 26, '不同乘数 k 演化梯度对照表', 14, C.ink, 'start', 'bold');

      let rowY = y + 46;
      for (const item of all) {
        const isCurrent = Math.abs(item.k - f.multiplier) < 1e-4;
        s += `<rect x="${x2 + 12}" y="${rowY}" width="${rightW - 24}" height="56" rx="6" fill="${isCurrent ? '#eef4fd' : C.cardBg}" stroke="${isCurrent ? C.blue : C.rule}" stroke-width="${isCurrent ? 2 : 1}"/>`;
        s += txt(x2 + 22, rowY + 20, `乘数 k为 ${num(item.k)}${item.k === 1 ? '（诚实基准）' : item.k === 3 ? '（教材原例）' : ''}`, 12, isCurrent ? C.blue : C.ink, 'start', 'bold');
        s += txt(x2 + 22, rowY + 36, `米价 ${num(item.p[0])}元，乙拿 ${num(item.a2[0])}千克`, 11, C.muted);
        s += txt(x2 + 22, rowY + 50, `甲真实福利 ${num(item.trueU1)}（增益 ${num(item.gainU1)}）`, 11, isCurrent ? C.red : C.ink, 'start', 'bold');
        rowY += 63;
      }
    }

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="一般乘数操纵扫描图"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
  }

  // View 3: Comparison View (comparison106, destroy102)
  function drawComparisonView(f, small) {
    const W = small ? 320 : 760;
    const H = small ? 640 : 520;
    const isRegime = f.key === 'comparison106';
    let s = '';

    // Title banner
    const bannerH = 46;
    s += `<rect x="12" y="12" width="${W - 24}" height="${bannerH}" rx="8" fill="#fdfbf5" stroke="${C.gold}" stroke-width="1.5"/>`;
    const compTitle = isRegime
      ? (small ? '机制对比：两种分配规则' : '机制对比：第9章房屋规则与第10章竞争均衡规则')
      : (small ? '操纵对比：物理毁损与信息伪报' : '操纵双子星对比：10.2节物理毁货与10.8节信息伪报');
    const compSub = isRegime
      ? (small ? '关键是信息怎样进入分配规则' : '两章都是有限人模型；操纵性取决于信息与分配规则的结构')
      : (small ? '实物毁损减资源；信息伪报改分配' : '实物毁损改变可行资源；信息伪报保持实物总量但改变分配');
    s += txt(20, 28, compTitle, small ? 12 : 14, C.gold, 'start', 'bold');
    s += txt(20, 44, compSub, small ? 10 : 11, C.muted);

    if (small) {
      let y = 68;
      const colW = W - 24;

      if (isRegime) {
        // Col 1: Chapter 9
        s += `<rect x="12" y="${y}" width="${colW}" height="240" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(22, y + 22, '第9章：不可分房屋市场规则', 13, C.ink, 'start', 'bold');
        s += txt(22, y + 42, '参与人数：有限；没有连续商品价格', 11, C.muted);
        s += txt(22, y + 62, '申报信息：每个人对房屋的排序', 11, C.ink);
        s += txt(22, y + 84, '习题结论：谎报不能拿到真实更喜欢的房屋', 11, C.rice, 'start', 'bold');
        s += txt(22, y + 104, '原因：来自房屋市场均衡规则本身', 11, C.muted);
        s += txt(22, y + 128, '机制性质：习题9.5意义下不可操纵', 13, C.rice, 'start', 'bold');
        s += txt(22, y + 150, '习题来源：教材第9章习题5', 10, C.muted);

        y += 250;

        // Col 2: Chapter 10
        s += `<rect x="12" y="${y}" width="${colW}" height="280" rx="8" fill="${C.cardBg}" stroke="${C.red}" stroke-width="1.5"/>`;
        s += txt(22, y + 22, '第10章：可分商品竞争均衡规则', 13, C.red, 'start', 'bold');
        s += txt(22, y + 42, '参与人数：本例2人；价格由申报共同决定', 11, C.muted);
        s += txt(22, y + 62, '申报信息：偏好进入需求与出清方程', 11, C.ink);
        s += txt(22, y + 84, '最优策略：谎报偏好推高自有物资相对价格', 11, C.red, 'start', 'bold');
        s += txt(22, y + 104, '撒谎后果：成功将米价推至3元，真实效用增加50%', 11, C.red, 'start', 'bold');
        s += txt(22, y + 128, '机制性质：可操纵！例10.6证得', 13, C.red, 'start', 'bold');
        s += txt(22, y + 150, '理论启示：本分配规则在例10.6中激励不相容', 10, C.muted);

      } else {
        // 10.2 vs 10.8
        s += `<rect x="12" y="${y}" width="${colW}" height="240" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(22, y + 22, '10.2节延伸：物理毁损禀赋', 13, C.ink, 'start', 'bold');
        s += txt(22, y + 42, '行动途径：亲手把自备物资扔进河里', 11, C.muted);
        s += txt(22, y + 62, '物理后果：可行资源总量永久减少', 11, C.ink);
        s += txt(22, y + 84, '成立范围：教材例10.2的特定互补偏好构造', 11, C.muted);
        s += txt(22, y + 106, '总产出：全社会总蛋糕被物理做小', 11, C.red);
        s += txt(22, y + 130, '福利结论：仍须逐人比较，不能自动写DWL', 12, C.muted, 'start', 'bold');

        y += 250;

        s += `<rect x="12" y="${y}" width="${colW}" height="280" rx="8" fill="${C.cardBg}" stroke="${C.rice}" stroke-width="1.5"/>`;
        s += txt(22, y + 22, '10.8节：战略信息伪报', 13, C.rice, 'start', 'bold');
        s += txt(22, y + 42, '行动途径：一粒米不扔，纯谎报偏好', 11, C.muted);
        s += txt(22, y + 62, '物理后果：米豆总量保持不变', 11, C.rice, 'start', 'bold');
        s += txt(22, y + 84, '成立条件：机制依赖申报计算出清价格', 11, C.ink);
        s += txt(22, y + 106, '分配后果：甲多拿、乙少拿，真实福利需核算', 11, C.rice);
        s += txt(22, y + 130, '性质：分配规则受到信息操纵', 12, C.rice, 'start', 'bold');
      }

    } else {
      const colW = (W - 36) / 2;
      const y = 68;
      const cardH = 430;

      if (isRegime) {
        // Col 1: Chapter 9
        s += `<rect x="12" y="${y}" width="${colW}" height="${cardH}" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(26, y + 30, '第9章：不可分房屋市场均衡规则', 15, C.ink, 'start', 'bold');
        s += txt(26, y + 60, '1. 市场结构：有限个人与不可分房屋', 12, C.muted);
        s += txt(26, y + 86, '2. 申报内容：每个人对各套房屋的排序', 12, C.ink);
        s += txt(26, y + 112, '3. 分配规则：根据申报排序形成市场均衡房屋归属', 12, C.muted);
        s += txt(26, y + 140, '4. 习题9.5：谎报不能得到按真实排序更好的房屋', 12, C.ink);
        s += txt(26, y + 170, '5. 结论来源：房屋市场规则结构，而非人数趋于无穷', 14, C.rice, 'start', 'bold');
        s += txt(26, y + 196, '   注意：本章没有连续价格接受者假定', 12, C.rice);

        s += `<rect x="24" y="${y + 220}" width="${colW - 24}" height="180" rx="6" fill="#fff" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(36, y + 246, '结论：机制防操纵（不可操纵）', 13, C.rice, 'start', 'bold');
        s += txt(36, y + 272, '• 来源依据：教材第9章习题5', 11, C.muted);
        s += txt(36, y + 296, '• 适用范围：第9章房屋市场模型及其均衡规则', 11, C.muted);
        s += txt(36, y + 320, '• 核心启示：操纵性是信息与分配规则的性质，', 11, C.ink);
        s += txt(36, y + 342, '  不能只用“大市场/小市场”一句话解释', 11, C.rice, 'start', 'bold');

        // Col 2: Chapter 10
        const x2 = 12 + colW + 12;
        s += `<rect x="${x2}" y="${y}" width="${colW}" height="${cardH}" rx="8" fill="${C.cardBg}" stroke="${C.red}" stroke-width="1.5"/>`;
        s += txt(x2 + 14, y + 30, '第10章：可分商品竞争均衡规则', 15, C.red, 'start', 'bold');
        s += txt(x2 + 14, y + 60, '1. 市场结构：本例2人、2种可分商品', 12, C.muted);
        s += txt(x2 + 14, y + 86, '2. 申报内容：偏好进入需求函数与出清方程', 12, C.ink);
        s += txt(x2 + 14, y + 112, '3. 价格内生性：清算价格对个体的申报高度敏感', 12, C.red, 'start', 'bold');
        s += txt(x2 + 14, y + 140, '4. 撒谎后果：成功将米价推至3元，逼迫对方拱手让出实物', 12, C.ink);
        s += txt(x2 + 14, y + 170, '5. 策略性质：竞争均衡机制是可操纵的！', 14, C.red, 'start', 'bold');
        s += txt(x2 + 14, y + 196, '   实证：操纵后真实效用从 1.00 跃升至 1.50', 12, C.red);

        s += `<rect x="${x2 + 12}" y="${y + 220}" width="${colW - 24}" height="180" rx="6" fill="#fdeeed" stroke="${C.red}" stroke-width="1"/>`;
        s += txt(x2 + 24, y + 246, '结论：机制可操纵！', 13, C.red, 'start', 'bold');
        s += txt(x2 + 24, y + 272, '• 来源依据：教材第10.8节例10.6', 11, C.muted);
        s += txt(x2 + 24, y + 296, '• 适用范围：例10.6的竞争均衡分配规则', 11, C.muted);
        s += txt(x2 + 24, y + 320, '• 核心启示：将竞争均衡直接作为小经济的清算规则，', 11, C.ink);
        s += txt(x2 + 24, y + 342, '  会产生内生的激励不相容，引发谎报博弈！', 11, C.red, 'start', 'bold');

      } else {
        // 10.2 vs 10.8
        s += `<rect x="12" y="${y}" width="${colW}" height="${cardH}" rx="8" fill="${C.cardBg}" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(26, y + 30, '10.2节延伸：物理毁损禀赋', 15, C.ink, 'start', 'bold');
        s += txt(26, y + 60, '1. 操纵途径：物理销毁部分大米，使有效供给硬性减少', 12, C.muted);
        s += txt(26, y + 86, '2. 成本特征：有真实实物销毁成本（把米倒进河里）', 12, C.ink);
        s += txt(26, y + 112, '3. 成立范围：教材例10.2的特定互补偏好构造', 12, C.muted);
        s += txt(26, y + 140, '4. 确定后果：总物资物理减少；福利须另算', 12, C.red, 'start', 'bold');

        s += `<rect x="24" y="${y + 170}" width="${colW - 24}" height="230" rx="6" fill="#fff" stroke="${C.rule}" stroke-width="1"/>`;
        s += txt(36, y + 196, '特点总结：', 13, C.ink, 'start', 'bold');
        s += txt(36, y + 224, '• 改变的是客观物理约束', 11, C.muted);
        s += txt(36, y + 248, '• 教材只证明特定例子中毁损者可能获益', 11, C.muted);
        s += txt(36, y + 272, '• 不能凭资源减少自动写成无谓损失', 11, C.ink);

        // 10.8
        const x2 = 12 + colW + 12;
        s += `<rect x="${x2}" y="${y}" width="${colW}" height="${cardH}" rx="8" fill="${C.cardBg}" stroke="${C.rice}" stroke-width="1.5"/>`;
        s += txt(x2 + 14, y + 30, '10.8节：战略信息伪报', 15, C.rice, 'start', 'bold');
        s += txt(x2 + 14, y + 60, '1. 操纵途径：纯粹申报虚假偏好，大米大豆总数守恒', 12, C.muted);
        s += txt(x2 + 14, y + 86, '2. 成本特征：零物理成本，实物一粒不扔', 12, C.rice, 'start', 'bold');
        s += txt(x2 + 14, y + 112, '3. 生效机理：利用市场出清方程对申报信息的依赖性', 12, C.ink);
        s += txt(x2 + 14, y + 140, '4. 确定后果：总物资守恒，但双方分配与福利改变', 12, C.rice, 'start', 'bold');

        s += `<rect x="${x2 + 12}" y="${y + 170}" width="${colW - 24}" height="230" rx="6" fill="#e6efe9" stroke="${C.rice}" stroke-width="1"/>`;
        s += txt(x2 + 24, y + 196, '特点总结：', 13, C.rice, 'start', 'bold');
        s += txt(x2 + 24, y + 224, '• 改变的是主观信息输入', 11, C.muted);
        s += txt(x2 + 24, y + 248, '• 最后必须用双方真实偏好核算得失', 11, C.rice, 'start', 'bold');
        s += txt(x2 + 24, y + 272, '• 说明本分配规则存在激励不相容', 11, C.rice, 'start', 'bold');
      }
    }

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="机制对比图"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
  }

  function draw() {
    const f = manipulationStory(key, step);
    const c = manipulationContent[key];
    const phase = c.steps[step];
    const small = window.innerWidth <= 700;

    if ($('film-phase')) $('film-phase').textContent = phase[0];
    if ($('film-title')) $('film-title').textContent = c.title;
    if ($('film-caption')) $('film-caption').textContent = phase[1];
    if ($('film-meter')) $('film-meter').textContent = `${step + 1} / ${c.steps.length}`;

    if ($('filmStep')) $('filmStep').value = step;
    if ($('out-filmStep')) $('out-filmStep').value = step;

    // Upfront brief before plot
    let brief = $('manipulation-brief');
    if (!brief) {
      brief = document.createElement('section');
      brief.id = 'manipulation-brief';
      brief.setAttribute('aria-label', '问题与题目条件');
      brief.innerHTML = '<p class="reading"><strong>这张图要回答：</strong><span id="manipulation-question"></span></p>' +
        '<p class="reading"><strong>情境与条件：</strong><span id="manipulation-condition"></span></p>' +
        '<p class="boundary" id="manipulation-scope"></p>';
      const legend = $('legend');
      if (legend) legend.before(brief);
    }
    if ($('manipulation-question')) $('manipulation-question').textContent = c.question;
    if ($('manipulation-condition')) $('manipulation-condition').textContent = c.conditions;
    if ($('manipulation-scope')) $('manipulation-scope').textContent = '当前阶段：' + phase[0] + ' · ' + phase[1];

    // Explanation below plot
    const readingEl = $('reading');
    if (readingEl) {
      readingEl.innerHTML =
        '<p class="situation-card"><strong>生活引入与题设：</strong>' + esc(c.conditions) + '</p>' +
        '<p class="question-card"><strong>核心问题：</strong>' + esc(c.question) + '</p>' +
        '<p class="prompt-card"><strong>读图提示：</strong>当前画面推进到【' + esc(phase[0]) + '】。' + esc(phase[1]) + '</p>';
    }

    // Chart
    const plot = $('plot');
    if (plot) {
      if (['honest106', 'strategic106'].includes(key)) {
        plot.innerHTML = drawExample106View(f, small);
      } else if (key === 'general106') {
        plot.innerHTML = drawGeneralView(f, small);
      } else {
        plot.innerHTML = drawComparisonView(f, small);
      }
    }

    // Formula & Boundary
    if ($('formula')) $('formula').textContent = c.formula;
    if ($('boundary')) $('boundary').textContent = c.conditions;

    // Study Guide & Interpretation
    const extra = $('extra');
    if (extra) {
      extra.innerHTML =
        '<h3>证明过程与详细推导</h3><ol>' +
        c.proof.map(x => '<li>' + esc(x) + '</li>').join('') +
        '</ol><h3>同类题怎么上手</h3><p>' + esc(c.template) + '</p>' +
        '<h3>最容易混淆的地方</h3><p>' + esc(c.trap) + '</p>' +
        '<p>来源：Osborne–Rubinstein ' + esc(c.source) + '</p>';
    }

    // Update study guide tabs if present
    for (let i = 0; i < 6; i++) {
      const panel = $('guide-' + i);
      if (panel && c.steps[i]) {
        panel.innerHTML = '<h4>' + esc(c.steps[i][0]) + '</h4><p>' + esc(c.steps[i][1]) + '</p>';
      }
    }

    // Update film buttons
    const playBtn = $('film-play');
    const replayBtn = $('film-replay');
    if (playBtn) playBtn.disabled = false;
    if (replayBtn) replayBtn.disabled = false;
  }

  function advance() {
    if (step >= 5) return true;
    step += 1;
    draw();
    return step >= 5;
  }

  // The visible film controls are owned by lesson-film.js. Keeping a second
  // timer here made a single click advance twice and could wrap the specialist
  // scene while the shared player still reported the previous frame.

  if ($('experiment')) {
    $('experiment').onchange = e => {
      if (manipulationKeys.includes(e.target.value)) {
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

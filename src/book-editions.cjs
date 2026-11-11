'use strict';

const outline = require('./book-outline.json');
const inventory = require('./exercise-inventory.json');
const { chapterURL, urlFor } = require('./guided/catalog.cjs');

const publisher = 'https://www.openbookpublishers.com/books/10.11647/obp.0204';
const translation = 'https://cdn.openbookpublishers.com/Chinese_Translation_Models_in_Microeconomic_Theory_1ff1ebd516.pdf';

const parts = [
  { id: 'I', en: 'Individual behavior', zh: '个人行为', first: 1, last: 7 },
  { id: 'II', en: 'Equilibrium', zh: '均衡', first: 8, last: 14 },
  { id: 'III', en: 'Game theory', zh: '博弈论', first: 15, last: 16 },
  { id: 'IV', en: 'Topics', zh: '其他主题', first: 17, last: 20 }
];

// The Chinese scan omits blank leaves between parts. Both page numbers below
// are from chapter openers: the printed folio and the physical PDF page.
const reading = {
  1: { zh: '偏好和效用', print: 3, pdf: 13, section: '1.4',
    enQuestion: 'Tea ranks above coffee, and coffee above water. Which changes to their utility numbers preserve every comparison?',
    zhQuestion: '把茶、咖啡和水依次记作 3、2、1 分。如果把茶改为 10 分，哪些两两比较会改变？' },
  2: { zh: '选择', print: 14, pdf: 24, section: '2.3',
    enQuestion: 'A diner picks soup from a menu. If the kitchen runs out of salad, what would a fixed strict ranking predict?',
    zhQuestion: '三道菜里你最想吃面。划掉其中一道没选的菜，按原先的严格排序，你接下来会点什么？' },
  3: { zh: '不确定性下的偏好', print: 25, pdf: 35, section: '3.5',
    enQuestion: 'Would you take 50 for sure or a fair coin toss paying 0 or 100? How would a concave utility function rank the offers?',
    zhQuestion: '确定拿 50 元，或掷一枚均匀硬币拿 0 元或 100 元。效用曲线向下弯时，该比较哪三个点？' },
  4: { zh: '消费者偏好', print: 35, pdf: 45, section: '4.5',
    enQuestion: 'Two baskets are equally good. Where must their midpoint lie relative to the original indifference curve if preferences are convex?',
    zhQuestion: '两篮商品同样合意。每种商品各取两篮数量的平均值，凸偏好怎样评价这篮混合物？' },
  5: { zh: '消费者行为', print: 45, pdf: 55, section: '5.1',
    enQuestion: 'Rice doubles in price while income and the price of beans stay fixed. Which intercept of the budget line stays put?',
    zhQuestion: '收入和豆价固定，米价翻倍。先分别算只买米、只买豆的数量，再画出预算线怎样转动。' },
  6: { zh: '生产者行为', print: 58, pdf: 68, section: '6.3',
    enQuestion: 'An extra worker raises output. How much must that extra output sell for to make hiring profitable?',
    zhQuestion: '多雇一人能多做三件产品。给定产品售价和工资，多做三件带来的收入够付工资吗？' },
  7: { zh: '垄断', print: 68, pdf: 78, section: '7.2',
    enQuestion: 'A seller cuts a uniform price to attract one more buyer. What happens to revenue from the buyers already in line?',
    zhQuestion: '垄断者为了多卖一件而统一降价。新顾客贡献多少收入？原先每一单又少收多少？' },
  8: { zh: '弱肉强食经济', print: 81, pdf: 90, section: '8.2',
    enQuestion: 'The second-strongest resident prefers a weaker resident’s house to their own. Which move is open to them, and what does that tell you about this allocation?',
    zhQuestion: '强者可以拿走弱者的房子。如果第二强的人更喜欢第三强的人所住的房子，眼前的分配能维持吗？' },
  9: { zh: '市场', print: 93, pdf: 102, section: '9.2',
    enQuestion: 'Each trader owns a house and wants exactly one. Which trades can go through if three owners each want the next owner’s house?',
    zhQuestion: '甲想换乙的房，乙想换丙的房，丙想换甲的房。怎样同时交房，才能让三笔交换都成交？' },
  10: { zh: '交换经济模型', print: 104, pdf: 113, section: '10.2',
    enQuestion: 'At a proposed price, each household can afford its own order. What else must hold for both orders to be filled?',
    zhQuestion: '两家都付得起自己的米豆订单。把两张订单逐项相加，市场上的米和豆各够不够？' },
  11: { zh: '扩展的交换经济模型', print: 120, pdf: 129, section: '11.1',
    enQuestion: 'A buyer and a seller value one indivisible object differently. Between which two valuations could a price support a trade?',
    zhQuestion: '一件物品只能整件转手。买家最多肯出 8 元，卖家至少要 5 元，哪些价格能让双方都愿意成交？' },
  12: { zh: '包括消费者和生产者的市场', print: 135, pdf: 144, section: '12.2',
    enQuestion: 'Workers supply labor and firms hire it. After checking their plans at a candidate wage, which totals must agree?',
    zhQuestion: '厂商按给定工资雇工，家庭按同一工资决定劳动量。把两边各自加总，要满足什么条件才能开工？' },
  13: { zh: '价格与预期均衡', print: 144, pdf: 153, section: '13.1',
    enQuestion: 'Customers choose a bank branch using predicted waiting times. Once they arrive, which predictions must the queues confirm?',
    zhQuestion: '大家按预计的等候时间选银行网点。人们到店后，各网点实际等候时间与事先的估计吻合吗？' },
  14: { zh: '信息不对称的市场', print: 157, pdf: 166, section: '14.2',
    enQuestion: 'Employers see schooling but cannot see productivity. At the wages on offer, which workers would pay for an extra qualification?',
    zhQuestion: '雇主看得到学历，招人时看不到生产率。给定两档工资，不同类型的求职者各愿花多少代价取得文凭？' },
  15: { zh: '策略博弈', print: 169, pdf: 177, section: '15.1',
    enQuestion: 'Hold one player’s action fixed and check the other’s alternatives. Which pairs of actions survive the check in both directions?',
    zhQuestion: '先固定乙的行动，在表中圈出甲的最佳回应，再交换角色。哪些格子被两个人同时圈中？' },
  16: { zh: '扩展式博弈', print: 195, pdf: 203, section: '16.3',
    enQuestion: 'An incumbent threatens a price war if a rival enters. Once entry has happened, would the incumbent still choose to fight?',
    zhQuestion: '在位厂商声称有人进入就打价格战。先走到对手已经进入的节点，厂商此时会怎样选？' },
  17: { zh: '机制设计', print: 221, pdf: 228, section: '17.3',
    enQuestion: 'A town is voting on a public project. What difference does one person’s report make to the outcome for everyone else?',
    zhQuestion: '决定是否修一座桥时，先算其余居民在两种方案下的总收益。加上你的报告后，他们得到的方案改变了吗？' },
  18: { zh: '匹配', print: 228, pdf: 235, section: '18.2',
    enQuestion: 'A receiver is holding one proposal when a better one arrives. Who becomes free to propose in the next round?',
    zhQuestion: '接收申请的一方先暂留一人，随后收到更喜欢的申请。谁会被拒绝，又该向名单上的谁提出申请？' },
  19: { zh: '理想社会经济制度', print: 237, pdf: 244, section: '19.1',
    enQuestion: 'Two farmers produce different yields from the same land. Which assignment maximizes the harvest, and how could that harvest be shared equally?',
    zhQuestion: '同一亩地，甲的产量比乙高。要使总产量最大，地该交给谁？若要两人所得相同，收成又该怎样分？' },
  20: { zh: '汇总偏好', print: 245, pdf: 252, section: '20.1',
    enQuestion: 'Three voters rank the options ABC, BCA and CAB. Which option wins each pairwise vote, and can you put the winners in a single ranking?',
    zhQuestion: '三名选民由好到差分别排甲乙丙、乙丙甲、丙甲乙。把每一对选项拿出来表决，胜者能排成一列吗？' }
};

const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c]);

function cover(en) {
  return `<div class="ed-cover">
    <div class="ed-imprint">${en ? 'English original' : '当代经济学系列丛书'} <span lang="en">h</span></div>
    <h1>${en ? 'Models in <br>Microeconomic <br>Theory' : '微观经济<br>理论模型'}</h1>
    <div class="ed-authors">${en ? 'Martin J. Osborne<br>Ariel Rubinstein' : '马丁·J. 奥斯本<br>阿里尔·鲁宾斯坦 著'}</div>
    <div class="ed-cover-foot">${en ? 'Open Book Publishers' : '林相森　赵雪倩 译'}</div>
  </div>`;
}

function navigation(en) {
  return `<nav class="ed-nav" aria-label="${en ? 'Site navigation' : '站内导航'}">
    <a href="catalog.html#books">← ${en ? 'Textbook links' : '课本目录'}</a>
    <div><a href="market.html">${en ? 'Market' : '走进市场'}</a>
    <a class="ed-switch" href="book-${en ? 'zh' : 'en'}.html" lang="${en ? 'zh-CN' : 'en'}" hreflang="${en ? 'zh-CN' : 'en'}">${en ? '中文阅读' : 'Read in English'}</a></div>
  </nav>`;
}

function opening(en) {
  return `<header class="ed-opening">${cover(en)}
    <div class="ed-lead">
      <p class="ed-kicker">${en ? 'Chapter 01　/　Preferences and utility' : '第一章　／　偏好和效用'}</p>
      <h2>${en ? 'What does a utility number tell you?' : '一杯茶值几分？'}</h2>
      <p>${en ? 'You prefer tea to coffee and coffee to water. Write 3, 2 and 1 beside the drinks. Now try 10, 2 and 1. What would you choose differently?' : '你最喜欢茶，其次是咖啡，最后是水。给它们分别打 3、2、1 分，再把茶改成 10 分。如果只能从中选一杯，你的选择会变吗？'}</p>
      <div class="ed-actions">
        ${en ? `<a class="ed-button" href="${publisher}/chapters/10.11647/obp.0204.01">Read chapter 1 at OBP <span aria-hidden="true">↗</span></a>` :
        `<a class="ed-button" href="${urlFor('s1.4')}">进入 1.4 效用函数图解 <span aria-hidden="true">→</span></a>`}
        <a href="#contents">${en ? 'Browse chapters' : '按目录选章'} ↓</a>
      </div>
    </div>
  </header>`;
}

function exercises(chapter) {
  const problems = inventory.problems.filter(p => p.chapter === chapter);
  return `<details class="ed-exercises"><summary>逐题图解 <span>（${problems.length} 题）</span></summary>
    <div>${problems.map(p => {
      const id = `${chapter}.${p.number}`;
      return `<a href="${urlFor('p' + id)}">习题 ${id}</a>`;
    }).join('')}</div>
  </details>`;
}

function chapterRow(chapter, en) {
  const number = chapter.chapter;
  const item = reading[number];
  const padded = String(number).padStart(2, '0');
  const chapterTitle = escapeHTML(en ? chapter.title : item.zh);
  const sectionURL = urlFor('s' + item.section);
  const chapterLink = `${publisher}/chapters/10.11647/obp.0204.${padded}`;
  return `<li class="ed-row" id="chapter-${number}">
    <span class="ed-number" aria-hidden="true">${padded}</span>
    <div><h4><span class="ed-sr">${en ? `Chapter ${number}. ` : `第 ${number} 章　`}</span>${chapterTitle}</h4>
      <p>${escapeHTML(en ? item.enQuestion : item.zhQuestion)}</p>
      <div class="ed-links">${en
        ? `<a href="${chapterLink}">Read chapter ${number} at OBP ↗</a><a href="${sectionURL}" hreflang="zh-CN">Model ${item.section} in Chinese</a>`
        : `<a href="${translation}#page=${item.pdf}">读译本 · 第 ${item.print} 页 ↗</a><a href="${chapterURL(number)}">全章图解</a><a href="${sectionURL}">${item.section} 小节图解</a>`}
      </div>${en ? '' : exercises(number)}
    </div></li>`;
}

function contents(en) {
  return `<section class="ed-contents" id="contents" aria-labelledby="ed-contents-title">
    <div class="ed-contents-head"><h2 id="ed-contents-title">${en ? 'Contents' : '分章阅读'}</h2>
      <p>${en ? 'Take a question to the English chapter at Open Book Publishers (OBP). For a worked example, open the accompanying model in Chinese.' : '带着每章的问题翻到译本对应页，再用小节图解核对推理。做章末题时，展开「逐题图解」就能按书上题号进入。'}</p>
    </div>
    <nav class="ed-parts" aria-label="${en ? 'Book parts' : '全书四部分'}">${parts.map(p =>
      `<a href="#part-${p.id}"><span>${p.id}</span> ${en ? p.en : p.zh}</a>`).join('')}</nav>
    ${parts.map(p => `<section class="ed-part" id="part-${p.id}"><header><span>${en ? 'Part' : '卷'} ${p.id}</span><h3>${en ? p.en : p.zh}</h3></header>
      <ol start="${p.first}">${outline.chapters.filter(ch => ch.chapter >= p.first && ch.chapter <= p.last)
        .map(ch => chapterRow(ch, en)).join('')}</ol></section>`).join('')}
  </section>`;
}

function editionNote(en) {
  return `<aside class="ed-source" aria-label="${en ? 'Edition and source' : '版本与来源'}">
    <div><strong>${en ? 'First edition · h' : '第一版 · h 版'}</strong>
    <p>${en ? `This guide follows the ${escapeHTML(outline.version)} English text. Its Chinese companion follows the published translation of the same first edition.` :
    `中英文导读均按英文第一版 ${escapeHTML(outline.version)} 对读。中文译本由格致出版社、上海三联书店、上海人民出版社出版。下列页码按译本标注。`}</p></div>
    <a href="${en ? publisher : translation}">${en ? 'Full book at OBP' : '出版社提供的中文译本（PDF）'} ↗</a>
  </aside>`;
}

function editionPage(lang, { cssHref = 'assets/book-editions.css', startupCssHref } = {}) {
  if (lang !== 'en' && lang !== 'zh') throw new RangeError('Expected book language en or zh');
  const en = lang === 'en';
  const title = en ? 'Models in Microeconomic Theory · English reading guide' : '微观经济理论模型 · 中文阅读';
  return `<!doctype html>
<html lang="${en ? 'en' : 'zh-CN'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  ${startupCssHref ? `<link rel="stylesheet" href="${escapeHTML(startupCssHref)}">` : ''}
  <link rel="stylesheet" href="${escapeHTML(cssHref)}">
  <link rel="alternate" hreflang="${en ? 'zh-CN' : 'en'}" href="book-${en ? 'zh' : 'en'}.html">
</head>
<body class="ed-page ed-${lang}">
  <a class="ed-skip" href="#contents">${en ? 'Skip to contents' : '跳到分章目录'}</a>
  <div class="ed-wrap">${navigation(en)}
    <main>${opening(en)}${editionNote(en)}${contents(en)}</main>
    <footer class="ed-footer"><a href="catalog.html#books">← ${en ? 'Back to textbook links' : '返回课本目录'}</a><a href="#contents">${en ? 'Contents' : '返回目录'} ↑</a></footer>
  </div>
</body>
</html>`;
}

module.exports = { editionPage };

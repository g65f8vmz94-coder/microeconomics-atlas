'use strict';
const { catalog, urlFor, chapterURL } = require('./guided/catalog.cjs');
const outline = require('./book-outline.json');
const exerciseInventory = require('./exercise-inventory.json');
const catalogLabels = require('./catalog-labels.cjs');
const formalSets = ['1-7', '8-14', '15-20'].map(g => require('./review/formal-' + g + '.json'));
const formalSections = Object.assign({}, ...formalSets.map(s => s.sections));
const formalClaims = Object.assign({}, ...formalSets.map(s => s.claims));

const assignments = [
  [5, '支出函数', '习题 5', '56'],
  [5, '时间偏好与借贷', '习题 8', '57'],
  [6, '鲁滨逊的生产与消费', '习题 4', '66–67'],
  [7, '隐性歧视的最优菜单', '习题 7', '78'],
  [8, '产权分配与竞争均衡', '例 8.1 扩展', '82']
];

const stripTex = s => String(s || '').replace(/\$([^$]+)\$/g, ' $1 ').replace(/\\[A-Za-z]+/g, ' ').replace(/[{}]/g, ' ').replace(/\s+/g, ' ').trim();

function buildSearchIndex({ chapters, content, coverageItems }) {
  const entries = [];
  const outlineBySec = new Map(outline.chapters.flatMap(c => c.sections.map(s => [s.id, s])));
  const problemMeta = new Map(exerciseInventory.problems.map(p => [p.chapter + '.' + p.number, p]));

  for (const ch of chapters) {
    entries.push({
      kind: '章',
      id: String(ch.number),
      chapter: ch.number,
      label: `第 ${ch.number} 章`,
      title: ch.title,
      url: chapterURL(ch.number),
      altUrl: `review-${ch.number}.html`,
      altLabel: '4h 速通本章',
      keywords: `ch${ch.number} 第${ch.number}章 ${ch.title} ${ch.question || ''}`
    });
    for (const meta of ch.sections) {
      const unit = content[meta.key];
      const f = formalSections[meta.id];
      const o = outlineBySec.get(meta.id);
      entries.push({
        kind: '小节',
        key: meta.key,
        id: meta.id,
        chapter: ch.number,
        label: `小节 ${meta.id}`,
        title: unit?.title || meta.theme,
        chapterTitle: ch.title,
        theme: meta.theme,
        url: urlFor(meta.key),
        altUrl: `review-${ch.number}.html#section-${meta.id}`,
        altLabel: '4h 公式与推导',
        keywords: `${meta.id} §${meta.id} ${meta.theme} ${o?.title || ''} ${stripTex(f?.summary || '')} ${ch.title}`
      });
    }
    for (const meta of ch.problems) {
      const unit = content[meta.key];
      const pm = problemMeta.get(meta.id);
      const labelTitle = catalogLabels[pm?.id] || '';
      entries.push({
        kind: '习题',
        key: meta.key,
        id: meta.id,
        chapter: ch.number,
        label: `习题 ${meta.id}`,
        title: unit?.title || `习题 ${meta.id}`,
        chapterTitle: ch.title,
        theme: meta.theme || labelTitle,
        url: urlFor(meta.key),
        altUrl: `review-${ch.number}.html#p${meta.id}`,
        altLabel: '速通批注与答卷',
        keywords: `习题${meta.id} p${meta.id} ${meta.id} ${labelTitle} ${stripTex(unit?.given || '').slice(0, 120)} ${ch.title}`
      });
    }
  }

  for (const item of coverageItems.filter(x => /^(Proposition|Lemma) /.test(x.id))) {
    const [rawKind, id] = item.id.split(' ');
    const zhKind = rawKind === 'Lemma' ? '引理' : '命题';
    const rec = formalClaims[item.id];
    const sec = item.evidence?.[0]?.section;
    entries.push({
      kind: zhKind,
      id,
      chapter: item.chapter,
      label: `${zhKind} ${id}`,
      title: rec?.title || item.label?.replace(/^:\s*/, '') || item.id,
      chapterTitle: chapters.find(c => c.number === item.chapter)?.title || '',
      url: `review-${item.chapter}.html#${rawKind.toLowerCase()}-${id}`,
      altUrl: sec ? urlFor('s' + sec) + '#solution' : item.evidence?.[0]?.entry || '',
      altLabel: sec ? `生活理解版 §${sec}` : '对应模型图解',
      keywords: `${item.id} ${zhKind}${id} ${id} ${item.label || ''} ${stripTex(rec?.statement || '')}`
    });
  }

  assignments.forEach(([ch, title, ref, page], i) => {
    entries.push({
      kind: '作业',
      id: `${ch}.${i + 1}`,
      chapter: ch,
      label: `第三次作业 · ${ref}`,
      title,
      chapterTitle: chapters.find(c => c.number === ch)?.title || '',
      url: `review-hw3-${i + 1}.html`,
      altUrl: `review-${ch}.html#assigned`,
      altLabel: `第 ${ch} 章速通`,
      keywords: `作业 第三次作业 课堂作业 HW3 homework hw3-${i + 1} 第${ch}章 ${ref} ${title} 第${page}页`
    });
  });

  return entries;
}

module.exports = { buildSearchIndex, catalog };

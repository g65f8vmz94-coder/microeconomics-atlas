// Shared markup for the interactive unit and its standalone, script-free copy.
const {escape, inline, equation, heading} = require('./format.cjs');

function sentencePoints(text) {
  // A delimiter inside a quotation, a coordinate or an inline formula is data.
  const parts = [];
  let start = 0, depth = 0, math = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '$') math = !math;
    if (math) continue;
    if ('“‘（(【['.includes(ch)) depth++;
    if ('”’）)】]'.includes(ch)) depth = Math.max(0, depth - 1);
    if (depth || !'。；？！'.includes(ch)) continue;
    parts.push(text.slice(start, i + 1));
    start = i + 1;
  }
  if (text.slice(start).trim()) parts.push(text.slice(start));
  return parts;
}

function givenPoints(text) {
  // Keep a source attribution with the condition it introduces.
  const points = [], references = [];
  let prefix = '';
  for (const part of sentencePoints(text)) {
    if (/^(印刷第|习题 [\d.]+ 跨教材印刷第|四组经济的题设表与).*页。$/.test(part)) {
      references.push(part);
    } else if (/^(?:沿用原站构造。$|沿用本站.{0,8}示例。$)/.test(part)) {
      prefix += part;
    } else {
      points.push(prefix + part);
      prefix = '';
    }
  }
  if (prefix) points.push(prefix);
  return {points, references};
}

function proofRows(unit) {
  let part = '';
  return unit.proof.map(([title, tex, why, frame], i) => {
    const marker = /^(?:[（(]([a-z])[)）]\s*|([a-z])\s*[｜|]\s*)/i.exec(title);
    if (marker) part = (marker[1] || marker[2]).toLowerCase();
    const method = marker ? title.slice(marker[0].length) : title;
    const label = part ? '（' + part + '）' : '';
    const id = 'proof-' + (i + 1);
    // Keep a short argument together. Longer authored rows can include several
    // deductions or cases, each with its own next/back stop.
    const fragments = [];
    for (const point of sentencePoints(why)) {
      const last = fragments.length - 1;
      if (last >= 0 && (fragments[last] + point).length <= 54) fragments[last] += point;
      else fragments.push(point);
    }
    return {id, label, method, tex, why, frame, fragments, note: unit.proofNotes?.[i]};
  });
}

const sceneId = index => index ? 'scene-' + (index + 1) : 'scene';
const formula = tex => tex ? '<div class="guided-equation">' + equation(tex) + '</div>' : '';
const compareLink = (row, origin) =>
  `<a class="proof-action" data-compare-from="${origin}" data-proof-step="${row.frame}" href="#${sceneId(row.frame)}">对照图景 ${row.frame + 1} ↗</a>`;

// These proofs explicitly use a table of records, cases or counterexamples.
// Keep its real cells with the relevant line of the written answer.
const answerTables = {
  'p1.9': [0], 'p3.5': [2, [2, 3]], 'p5.4': [0, [0, 1]],
  'p5.5': [1, [0, 1]], 'p8.1': [0, [0, 1]], 'p9.2': [2], 'p10.6': [2, [1]], 'p17.1': [0], 'p18.7': [0]
};
function answerTable(meta, unit, rowIndex) {
  const spec = answerTables[meta.key];
  if (!spec || spec[0] !== rowIndex) return '';
  const frames = spec[1] ? spec[1].map(i => unit.frames[i]) : unit.frames;
  const table = `<table class="guided-answer-table"><caption>本题对照数据</caption><thead><tr>${unit.columns.map(s => '<th scope="col">' + inline(s) + '</th>').join('')}</tr></thead><tbody>${frames.map(([, values]) => '<tr>' + values.map(v => '<td>' + inline(v) + '</td>').join('') + '</tr>').join('')}</tbody></table>`;
  const why = unit.proof[rowIndex][2];
  return /表中|表列|表里|前两行|三行已列/.test(why) ? table
    : '<details class="guided-answer-data"><summary>对照数据表</summary>' + table + '</details>';
}

function answerSheet(meta, unit, rows, {idPrefix = '', lessonURL = ''} = {}) {
  return rows.map((row, i) => {
    const id = idPrefix + 'answer-row-' + (i + 1);
    // The formula and the full argument belong on the paper, including a
    // prose-only counterexample or boundary case. The margin names the method.
    const note = typeof row.note === 'string' && row.note.trim() ? row.note : unit.frames[row.frame][2];
    const sceneLink = lessonURL ? `<a href="${escape(lessonURL)}#${sceneId(row.frame)}">回看这一步的图解 ↗</a>` : compareLink(row, id);
    const part = row.label && row.label !== rows[i-1]?.label ? '<span class="guided-answer-part">' + row.label + '</span>' : '';
    return `<article class="guided-answer-row" id="${id}" tabindex="-1"><div class="guided-answer-text" aria-label="答卷正文"><h3>${part}${heading(row.method)}</h3>${formula(row.tex)}<p>${inline(row.why)}</p>${answerTable(meta, unit, i)}</div><aside class="guided-answer-note" aria-label="思路旁注"><strong>思路</strong><p>${inline(note)}</p>${sceneLink}</aside></article>`;
  }).join('');
}

function transferForm(unit) {
  const [question, choices, correct, reason] = unit.practice;
  return `<form class="transfer-form" id="transfer"><fieldset><legend>${inline(question)}</legend><div class="transfer-options">${choices.map((choice, i) => `<label><input type="radio" name="choice" value="${i}"><span>${inline(choice)}</span></label>`).join('')}</div></fieldset><div class="practice-actions"><button type="submit" class="primary" hidden>核对我的判断</button></div><p class="feedback" id="feedback" role="status"></p><details id="worked"><summary id="reveal">看做法</summary><strong>${inline(choices[correct])}</strong><p>${inline(reason)}</p></details></form>`;
}

function stepMarkup(steps, step, i) {
  const prev = steps[i - 1], next = steps[i + 1];
  // In the script-free copy, the only forward link to the paper follows the
  // final deduction. A direct visit to practice also has a route to reasoning.
  const previousId = prev?.kind === 'given' ? 'given' : prev?.id === 'answer' ? 'solution' : prev?.id;
  const previous = prev ? `<a data-direction="previous" href="#${previousId}">${prev.id === 'answer' ? '回顾推理' : '← 上一步'}</a>` : '';
  const nextLabel = next?.id === 'answer' ? '展开完整手写答卷' : next?.id === 'practice' ? '换道题试试' : '下一步';
  const forward = next ? `<a class="primary" data-direction="next" href="#${next.id}">${nextLabel} →</a>` : '<a href="#given">从头复习 ↑</a>';
  if (step.kind === 'given') {
    return `<section class="guided-step guided-given" id="given-start" aria-labelledby="given-heading"><nav class="guided-controls" aria-label="本页步骤"><a class="primary" data-direction="next" href="#${next.id}">${next.kind === 'account' ? '先算一笔账' : '开始看图'} →</a><span class="guided-progress">第 1 / ${steps.length} 步</span></nav></section>`;
  }
  const titleId = {given: 'given-heading', scene: 'scene-title', practice: 'practice-heading'}[step.id] || step.id + '-title';
  return `<section class="guided-step guided-${step.kind}" id="${step.id}" tabindex="-1" aria-labelledby="${titleId}">
<p class="guided-progress step-kicker">第 ${i + 1} / ${steps.length} 步 · ${escape(step.phase)}</p>
<h2 class="guided-step-title" id="${titleId}">${heading(step.title)}</h2>
<div class="guided-step-body">${step.body}</div><nav class="guided-controls player-actions" aria-label="本页步骤">${previous}${forward}</nav></section>`;
}

// Native fragment navigation works before enhancement, with JS disabled and
// in a downloaded file. Descendant targets include the original #solution.
const fragmentStyle = `<style>
.guided-jumps > summary,.guided-resources > summary{min-height:44px;align-content:center;cursor:pointer}
.guided-flow:not([data-interactive]) > .guided-step:not(:first-child){display:none}
.guided-flow:not([data-interactive]):has(> .guided-step:target, > .guided-step :target) > .guided-step:first-child:not(:target):not(:has(:target)){display:none}
.guided-flow:not([data-interactive]) > .guided-step:is(:target,:has(:target)){display:block}
</style>`;

module.exports = {givenPoints, proofRows, sceneId, formula, compareLink, answerSheet, transferForm, stepMarkup, fragmentStyle};

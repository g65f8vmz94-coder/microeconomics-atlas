const assert = require('node:assert/strict');
const {catalog, loadChapters} = require('./src/guided/catalog.cjs');
const {renderUnit} = require('./src/guided/build.cjs');
const {inline, equation} = require('./src/guided/format.cjs');
const {givenPoints, proofRows} = require('./src/guided/unit-flow.cjs');

function checkConditionSource(body, unit, meta) {
  const {points, references} = givenPoints(unit.given);
  const label = meta.key;
  assert.ok(points.length, label + ' empty conditions');

  // Account for every authored character, including citations moved to the footer.
  let remaining = unit.given;
  for (const reference of references) {
    assert.ok(remaining.includes(reference), label + ' unknown source');
    remaining = remaining.replace(reference, '');
  }
  assert.equal(points.join(''), remaining, label + ' incomplete condition source');

  const cards = [...body.matchAll(/<aside class="condition-card"[^>]*>([\s\S]*?)<\/aside>/g)];
  assert.equal(cards.length, 1, label + ' condition card count');
  const items = [...cards[0][1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)];
  assert.deepEqual(items.map(m => m[1].replace(/<span id="given-\d+-title"><\/span>/g, '')),
    points.map(inline), label + ' ordered conditions');
  const resources = body.match(/<details class="guided-resources">([\s\S]*?)<\/details>/)?.[1];
  assert.ok(resources, label + ' missing textbook sources');
  const citations = [...resources.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
  assert.equal(citations[0], 'Osborne–Rubinstein，《Models in Microeconomic Theory》，' + meta.kind + ' ' + meta.id + '。', label);
  assert.equal(citations[1], references.length ? references.map(inline).join('') : '印刷第 ' + meta.page + ' 页。', label);
}

async function main() {
  const chapters = catalog(require('./coverage.json'));
  const units = Object.assign({}, ...await loadChapters(chapters));
  const counts = {units: 0, scenes: 0, deductions: 0, conclusions: 0, answerRows: 0};
  assert.deepEqual(givenPoints('印刷第 23 页。甲说“茶；奶”。成本为 $a;b$。'), {
    points: ['甲说“茶；奶”。', '成本为 $a;b$。'], references: ['印刷第 23 页。']
  });
  for (const chapter of chapters) {
    const siblings = [...chapter.sections, ...chapter.problems];
    for (const meta of siblings) {
      if (meta.key === 'p3.9') continue;
      const unit = units[meta.key], homework = meta.kind === '习题';
      const html = renderUnit(meta, unit, chapter, siblings);
      const body = html.slice(html.indexOf('<body '), html.indexOf('<script>', html.indexOf('</footer>')));
      const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
      const targets = new Set(ids);
      assert.equal(targets.size, ids.length, meta.key + ' duplicate id');
      for (const [,id] of body.matchAll(/href="#([^"]+)"/g)) assert(targets.has(id), meta.key + '#' + id);
      for (const id of ['given-heading', 'scene', 'scene-title', 'scene-why', 'solution', 'practice', 'practice-heading']) {
        assert(targets.has(id), meta.key + ' legacy anchor ' + id);
      }
      const steps = [...body.matchAll(/<section class="guided-step guided-([^"]+)" id="([^"]+)"/g)].map(m => m[1]);
      checkConditionSource(body, unit, meta);
      assert.equal(steps.filter(k => k === 'given').length, 1, meta.key + ' separate reading stops');
      assert.equal(steps[0], 'given');
      assert.equal(steps.at(-1), 'practice');
      assert.equal(steps.filter(k => k === 'scene').length, unit.frames.length);
      assert.equal(steps.includes('answer'), homework);
      const points = proofRows(unit);
      const fragments = points.reduce((total, row) => total + row.fragments.length, 0);
      assert.equal(steps.filter(k => k === (homework ? 'reasoning' : 'conclusion')).length, fragments);
      for (const [i, row] of points.entries()) {
        assert.equal(row.fragments.join(''), row.why, meta.key + ' incomplete argument ' + i);
        assert(targets.has(row.id));
      }
      if (homework) {
        assert.equal(steps.at(-2), 'answer');
        const answer = body.split('id="answer"')[1].split('</section>')[0];
        const rows = [...answer.matchAll(/<article class="guided-answer-row"[\s\S]*?<\/article>/g)];
        assert.equal(rows.length, unit.proof.length, meta.key + ' missing answer row');
        for (const [i, [row]] of rows.entries()) {
          const [,tex,why] = unit.proof[i];
          const [text, note] = row.split('<aside class="guided-answer-note"');
          assert(text.includes(inline(why)), meta.key + ' lost prose in ' + i);
          if (tex) assert(text.includes(equation(tex)), meta.key + ' lost equation in ' + i);
          if (unit.proofNotes?.[i]) assert(note.includes(inline(unit.proofNotes[i])), meta.key + ' wrong margin note in ' + i);
        }
        counts.answerRows += rows.length;
        counts.deductions += fragments;
      } else counts.conclusions += fragments;
      counts.units++;
      counts.scenes += unit.frames.length;
    }
  }
  assert.equal(counts.units, 240);
  console.log(counts);
}
main().catch(error => { console.error(error); process.exitCode = 1; });

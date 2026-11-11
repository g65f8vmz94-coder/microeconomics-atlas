'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {catalog,loadChapters}=require('./src/guided/catalog.cjs');
const {bookPlates}=require('./src/book-plates.cjs');
const coverage=require('./coverage.json');
const read=name=>fs.readFileSync(path.join(__dirname,'dist',name),'utf8');
async function check(){
  const chapters=catalog(coverage),units=Object.assign({},...await loadChapters(chapters));
  const home=read('formula-4h.html');
  let rows=0;
  for(const chapter of chapters){
    const file=`review-${chapter.number}.html`,body=read(file);
    assert(home.includes(`href="${file}"`));
    assert.equal((body.match(/class="review-problem"/g)||[]).length,chapter.problems.length);
    for(const problem of chapter.problems){
      assert(body.includes(`id="p${problem.id}"`));
      if(problem.key==='p3.9'){
        assert.equal((body.match(/class="answer-line"/g)||[]).length,9);
      }else{
        units[problem.key].proof.forEach((_,i)=>assert(body.includes(`id="${problem.key}-answer-row-${i+1}"`)));
        rows+=units[problem.key].proof.length;
      }
    }
    for(const item of coverage.items.filter(x=>x.chapter===chapter.number&&/^(Lemma|Proposition) /.test(x.id))){
      assert(body.includes(`id="${item.id.toLowerCase().replace(' ','-')}"`),item.id);
      assert(body.includes(`href="${item.evidence[0].entry.replaceAll('&','&amp;')}"`),item.id);
    }
    for(const section of chapter.sections)assert(body.includes('§ '+section.id+'<'),section.id);
  }
  for(const [i,parts] of [3,2,7,3,3].entries()){
    const hw=read(`review-hw3-${i+1}.html`).split('<main')[1].split('</main>')[0];
    assert.equal((hw.match(/<h3>/g)||[]).length,parts);
    assert(hw.includes('class="margin-note"')&&hw.includes('<math'));
    assert.doesNotMatch(hw,/<tex>|<merror>|\[\[/);
  }
  const pages=bookPlates(chapters,units);
  const encoded=read('index.html').match(/<script type="application\/json" data-book-plates>(.*?)<\/script>/s)[1];
  assert.deepEqual(JSON.parse(encoded),pages);
  assert.equal(pages.length,10);
  assert.equal(pages.at(-1).title,'市场出清');
  const figures=pages.flatMap(p=>p.figures);
  assert.equal(new Set(figures.map(f=>f.id)).size,figures.length);
  for(const sheet of pages)assert.equal(sheet.figures.length,1);
  for(const f of figures)assert(f.svg.startsWith('<svg ')&&!/NaN|undefined|Infinity/.test(f.svg));
  console.log({chapters:chapters.length,answerRows:rows+9,leaves:pages.length,figures:figures.length});
}
check().catch(e=>{console.error(e);process.exitCode=1;});

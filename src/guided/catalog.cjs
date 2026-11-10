const outline = require('../book-outline.json');
const {chapters,titles,lessons} = require('../lessons.cjs');
const inventory = require('../exercise-inventory.json');
const labels = require('../catalog-labels.cjs');

const CHAPTER_COUNT = outline.chapters.length;
const urlFor = key => key==='p3.9' ? 'insurance-3-9.html' : 'learn-'+key.replace('.','-')+'.html';
const chapterURL = ch => 'learn-'+String(ch).padStart(2,'0')+'.html';
const prompts = [
  '把三个选项两两比较，能排成一张单子吗？',
  '菜单少了一道菜，原来点的那道还会赢吗？',
  '平均拿到的钱一样，为什么还想买保险？',
  '把两篮东西各拿一半，你愿意换吗？',
  '同样一笔钱，涨价以后该怎么花？',
  '多做一份东西，挣的钱够付增加的成本吗？',
  '一张价目表，怎样让不同顾客自己选套餐？',
  '大家按先后挑东西，最后谁可以拿走什么？',
  '每个人带着自己的东西来，怎样换才都愿意？',
  '给两种东西同时标价，大家想买的正好够分吗？',
  '一套房只能给一家，价钱怎么把它分到合适的人手上？',
  '做饭的人也要吃饭，工资、菜价和产量怎样一起定下来？',
  '大家都猜某个网点人更少，排队结果还会像大家猜的那样吗？',
  '招工时看不到本事，一张文凭能告诉老板多少？',
  '两家摊位同时作决定，谁还想单独改主意？',
  '今天先开价的人，为什么要从明天可能发生的事倒着想？',
  '大家都说要修路，怎样让每个人愿意报出自己的真实想法？',
  '几个人同时申请一个岗位，暂时留谁、让谁再试下一家？',
  '同一间作坊合伙生产，该让谁用机器，收入又怎样分？',
  '每个人都能排好三个选项，为什么数完票却可能绕成一圈？'
];
function catalog(coverage) {
  const answers=new Map(coverage.exercises.map(x=>[x.id,x]));
  return outline.chapters.slice(0,CHAPTER_COUNT).map((chapter,i)=>{
    const number=chapter.chapter;
    const sections=chapter.sections.map((s,index)=>({key:'s'+s.id,id:s.id,kind:'小节',theme:titles[i][index],
      page:s.printedPage,chapter:number,classic:'lesson-'+s.id.replace('.','-')+'.html',extras:[], models:(lessons[s.id].scenarios||[]).map(v=>({href:'lesson-'+s.id.replace('.','-')+'.html?case='+encodeURIComponent(v.value),label:v.label}))}));
    const problems=inventory.problems.filter(p=>p.chapter===number).map(p=>{
      const record=answers.get(p.id);
      if (!record) throw new Error('Missing original problem '+p.id);
      const id=number+'.'+p.number;
      const evidence=record.evidence||[];
      const partByCase=Object.fromEntries(Object.entries(record.partScenarios||{}).map(([part,k])=>[k,part]));
      const seen=new Set();
      const extras=evidence.filter(e=>e.entry&&!seen.has(e.entry)&&seen.add(e.entry)).map(e=>({
        href:e.entry, label:partByCase[e.scenario]?'原题（'+partByCase[e.scenario]+'）':(lessons[e.section]?.scenarios||[]).find(s=>s.value===e.scenario)?.label||'原题模型'
      }));
      return {key:'p'+id,id,kind:'习题',chapter:number,page:p.lastPrintedPage?p.printedPage+'–'+p.lastPrintedPage:p.printedPage,
        theme:labels[p.id]||record.scope||evidence[0]?.scope||'章末题',
        classic:record.relatedLesson||record.entry, related:!!record.relatedLesson,extras:extras.length>1?extras:[], qualified:evidence.some(e=>e.claimSolved===false)};
    });
    return {number,title:chapters[i],question:prompts[i],sections,problems};
  });
}
async function loadChapters(chapters) {
  return Promise.all(chapters.map(async ({number})=>{
    const ext=number<=10?'cjs':'mjs';
    const {default:units}=await import('./ch'+String(number).padStart(2,'0')+'.'+ext);
    return units;
  }));
}
module.exports={CHAPTER_COUNT,chapterURL,urlFor,catalog,loadChapters};

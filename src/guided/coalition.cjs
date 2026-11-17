const {escape, inline}=require('./format.cjs');
const n=x=>Number(x.toFixed(3));
const score=(member,basket)=>n(member.rule==='pairs'?Math.min(...basket):basket[0]+basket[1]);
const basketText=b=>`${n(b[0])} 斤米 + ${n(b[1])} 斤豆`;
const scoreText=(m,b)=>m.rule==='pairs'
  ? `配对数：$\\min(${n(b[0])},${n(b[1])})=${score(m,b)}$`
  : `总斤数：$${n(b[0])}+${n(b[1])}=${score(m,b)}$`;

// Local styles travel only with this lesson, including its offline copy.
const style=`<style>
.coalition-board{margin:18px 0;color:var(--ink);font:inherit}
.coalition-board figcaption{font-weight:700;margin-bottom:8px}
.coalition-person{padding:12px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(6rem,.7fr) repeat(2,minmax(0,1fr));gap:10px 16px;align-items:start}
.coalition-person h3{font:700 1.05rem/1.5 var(--sans);margin:0}
.coalition-person small{display:block;font:400 .84rem/1.5 var(--sans);color:var(--muted)}
.coalition-board p{margin:3px 0;font-size:.96rem;line-height:1.65}
.coalition-person strong{display:block;font-size:.85rem;color:var(--muted)}
.coalition-person .coalition-new{border-left:3px solid #236351;padding-left:10px}
.coalition-person .coalition-verdict{color:#185849;font-weight:700}
.coalition-person.is-baseline{grid-template-columns:minmax(6rem,.7fr) minmax(0,2fr)}
.coalition-resource{padding:12px 14px;margin-top:10px;background:#e9eee5;border-left:3px solid #517b64}
.coalition-resource h3{font:700 1rem/1.5 var(--sans);margin:0 0 5px}
.coalition-board .coalition-outsider{padding:10px 0;border-top:1px solid var(--line);color:var(--muted);font-size:.88rem}
@media(max-width:650px){.coalition-person,.coalition-person.is-baseline{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 10px}.coalition-person h3{grid-column:1/-1}.coalition-person.is-baseline .coalition-old{grid-column:1/-1}.coalition-person small{display:inline;margin-left:8px}.coalition-board p{font-size:.88rem}.coalition-person .coalition-new{padding-left:7px}.coalition-resource{padding:10px}.coalition-board math{font-size:1em}}
</style>`;

function coalitionFigure(model,index){
  const allocation=model.allocations[index];
  const pool=[0,1].map(k=>n(model.members.reduce((sum,m)=>sum+m.endowment[k],0)));
  const remaining=pool.map((total,k)=>n(total-(allocation||[]).reduce((sum,b)=>sum+(b?.[k]||0),0)));
  const rows=model.members.map((member,i)=>{
    const next=allocation?.[i];
    const old=`<div class="coalition-old"><strong>原方案</strong><p>${escape(basketText(member.original))}</p><p>${inline(scoreText(member,member.original))}</p></div>`;
    const current=!allocation?'':`<div class="coalition-new"><strong>这次另分</strong>${next?`<p>${escape(basketText(next))}</p><p>${inline(scoreText(member,next))}</p><p class="coalition-verdict">${inline(`$${score(member,next)}>${score(member,member.original)}$`)} · 比自己原来好</p>`:'<p>还没给他分货。</p><p>接下来要让他的总斤数超过原来的 <b>'+score(member,member.original)+'</b>。</p>'}</div>`;
    return `<article class="coalition-person${allocation?'':' is-baseline'}" data-member="${escape(member.name)}"><h3>${escape(member.name)}<small>入组 · 自带${escape(member.endowment[0]?' 1 斤米':' 1 斤豆')}</small></h3>${old}${current}</article>`;
  }).join('');
  const resource=index===0
    ? `<h3>三户另组一团，能用哪批货？</h3><p>米商甲的 1 斤米 + 米商乙的 1 斤米 + 豆商甲的 1 斤豆。</p><p>合计 <b>${pool[0]} 斤米、${pool[1]} 斤豆</b>，记作 <b>（${pool.join('，')}）</b>。这是他们最初带来的货，不是原方案拟分给他们的货。</p>`
    : index===1
      ? `<h3>两位米商分完后，还剩什么？</h3><p>${inline(`米：$${pool[0]}-2\\times${allocation[0][0]}=${remaining[0]}$ 斤；豆：$${pool[1]}-2\\times${allocation[0][1]}=${remaining[1]}$ 斤。`)}</p><p>这批余货接下来全给豆商甲，查他愿不愿意。</p>`
      : `<h3>核对：用了多少，三户是否都更好？</h3><p>${inline(`米：$2\\times${allocation[0][0]}+${allocation[2][0]}=${pool[0]}$ 斤；豆：$2\\times${allocation[0][1]}+${allocation[2][1]}=${pool[1]}$ 斤。`)}</p><p>米、豆分别正好够分；三户都超过自己的旧水平。因此这三户能阻挡原方案，<b>原方案不在核心中</b>。</p>`;
  const outsider=model.outsider;
  const outside=index===2
    ? `没入组的${outsider.name}留着自己原带的 1 斤豆，得分为 ${score(outsider,outsider.endowment)}，低于原方案的 ${score(outsider,outsider.original)}。小团体只需让自己的成员都更好，不保证组外的人也不吃亏。`
    : `第四户是${outsider.name}，没有加入小团体。原方案也给他 ${basketText(outsider.original)}，得分 ${score(outsider,outsider.original)}；他原带的 1 斤豆不计入这三户的本钱。`;
  return `${index===0?style:''}<figure class="coalition-board" aria-label="三户各自的新旧分法与原始资源"><figcaption>${index===0?'先认清三个人：同一个人前后比，得分才有用':'同一个人前后对照：原方案一直留在左边'}</figcaption>${rows}<div class="coalition-resource">${resource}</div><p class="coalition-outsider">${escape(outside)}</p></figure>`;
}
module.exports={coalitionFigure};

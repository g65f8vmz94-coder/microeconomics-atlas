import {reopeningKeys,reopeningStory} from './exchange-reopening-story.mjs';
import {reopeningContent} from './exchange-reopening-content.mjs';
export function startReopeningStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#2c433a',muted:'#6b7c70',rice:'#177468',bean:'#ab8124',red:'#bf634e',rule:'#d9e2d7',paper:'#fffdf7'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>String(+Number(x).toFixed(3)),trade=x=>Math.abs(x)<1e-9?'不买不卖':x>0?'买入'+num(x):'卖出'+num(-x);
 const txt=(x,y,s,size=12,color=C.ink,anchor='start')=>`<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
 let key=reopeningKeys.includes(requested)?requested:reopeningKeys[0],step=0;
 $('fields').insertAdjacentHTML('beforebegin','<div class="field"><label for="experiment">本节连贯讲解</label><select id="experiment">'+reopeningKeys.map(k=>'<option value="'+k+'">'+esc(reopeningContent[k].title)+'</option>').join('')+'<option value="reopen">保留原例：重开交易</option><option value="cd">保留原例：CD交换</option></select></div>');
 function configure(k){key=k;window.REOPENING_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(q.get('case')===key||!q.has('case'))&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;$('experiment').value=key;$('fields').innerHTML='<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep"></output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1"></div>';$('plot').closest('.stage').classList.add('jungle-intro');draw();}
 function figure(f,small){
  const W=small?320:760,H=small?900:520,pw=small?300:355;let s=txt(W/2,23,`每千克价格：米${num(f.prices[0])}元，豆${num(f.prices[1])}元`,small?13:16,C.ink,'middle')+txt(W/2,47,f.stage,14,f.changedPrice?C.red:C.rice,'middle');
  for(let i=0;i<2;i++){
   const ox=small?10:i?395:10,oy=67+(small?i*380:0),e=f.endowments[i],a=f.assignment[i],r=f.check.people[i],old=f.original[i],left=ox+43,right=ox+pw-20,top=oy+112,bottom=oy+284,X=x=>left+x/12*(right-left),Y=y=>bottom-y/12*(bottom-top);
   s+=`<rect x="${ox}" y="${oy}" width="${pw}" height="365" rx="12" fill="#f5f7f0" stroke="${C.rule}"/>`;
   s+=txt(ox+14,oy+24,`${i?'乙':'甲'}：${f.role}`,14)+txt(ox+14,oy+47,`家底米${num(e[0])}、豆${num(e[1])}，值${num(r.wealth)}元`,13,C.muted)+txt(ox+14,oy+70,`${f.currentRole}：米${num(a[0])}、豆${num(a[1])}`,13,C.rice);
   const [p,q]=f.prices,w=r.wealth;const ymax=w/q,xmax=p?w/p:12;
   if(p===0)s+=`<path d="M${X(0)} ${Y(0)}L${X(12)} ${Y(0)}L${X(12)} ${Y(ymax)}L${X(0)} ${Y(ymax)}Z" fill="#e1ecde"/>`;
   else s+=`<path d="M${X(0)} ${Y(0)}L${X(xmax)} ${Y(0)}L${X(0)} ${Y(ymax)}Z" fill="#e1ecde"/>`;
   for(const v of [0,4,8,12])s+=`<line x1="${X(v)}" y1="${top}" x2="${X(v)}" y2="${bottom}" stroke="${C.rule}"/><line x1="${left}" y1="${Y(v)}" x2="${right}" y2="${Y(v)}" stroke="${C.rule}"/>`+txt(X(v),bottom+17,num(v),11,C.muted,'middle')+txt(left-8,Y(v)+4,num(v),11,C.muted,'end');
   s+=`<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="${C.ink}"/>`+txt(left,top-10,'豆（千克）',12,C.muted)+txt(right,bottom+36,'米（千克）',12,C.muted,'end');
   const line=`M${X(0)} ${Y(ymax)}L${X(xmax)} ${Y(p?0:ymax)}`;
   s+=`<path d="${line}" fill="none" stroke="${C.rice}" stroke-width="4"/>`;
   if(step>=2&&!f.changedPrice)s+=`<path d="${line}" fill="none" stroke="${C.bean}" stroke-width="2" stroke-dasharray="6 5"/>`;
   if(p===0)s+=txt(right-2,Y(ymax)-9,'米可继续往右 →',11,C.rice,'end');
   if(Math.hypot(old[0]-a[0],old[1]-a[1])>1e-8)s+=`<circle cx="${X(old[0])}" cy="${Y(old[1])}" r="5" fill="none" stroke="${C.muted}" stroke-width="2"/>`;
   s+=`<circle data-motion="reopen-${key}-bundle-${i}" data-motion-clamp="true" cx="${X(a[0])}" cy="${Y(a[1])}" r="7" fill="${r.optimal?C.rice:C.red}" stroke="${C.paper}" stroke-width="2"/>`;
   s+=txt(ox+14,oy+338,`米${trade(f.net[i][0])}；豆${trade(f.net[i][1])}`,12)+txt(ox+14,oy+357,`评分${num(r.utility)}；预算内最好${num(r.best)}`,12,r.optimal?C.rice:C.red);
  }
  const y=small?842:466;
  s+=txt(W/2,y,`全村米${num(f.check.totals[0])}／原有${num(f.check.supply[0])}；豆${num(f.check.totals[1])}／原有${num(f.check.supply[1])}`,small?13:15,C.ink,'middle');
  s+=txt(W/2,y+24,f.check.equilibrium?'个人最优、资源守恒：这是均衡':'资源仍守恒，但有人能选得更好',small?13:15,f.check.equilibrium?C.rice:C.red,'middle');
  s+=txt(W/2,H-8,'两张图刻度相同且固定；右侧边框不是购买上限',small?11:13,C.muted,'middle');
  return {W,H,s};
 }
 function draw(){
  const f=reopeningStory(key,step),c=reopeningContent[key],phase=c.steps[step];$('filmStep').value=step;$('out-filmStep').value=step;
  let brief=$('reopening-brief');if(!brief){brief=document.createElement('section');brief.id='reopening-brief';brief.setAttribute('aria-label','问题与题目条件');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="reopening-question"></span></p><p class="reading"><strong>情境与条件：</strong><span id="reopening-condition"></span></p><p class="boundary" id="reopening-scope"></p>';$('legend').before(brief);}
  $('reopening-question').textContent=c.question;$('reopening-condition').textContent=c.conditions;$('reopening-scope').textContent=f.scope;
  Object.assign($('plot').dataset,{filmIntro:c.question,filmPhase:phase[0],filmNarration:phase[1],filmConclusion:c.steps[5][1]});
  const {W,H,s}=figure(f,$('plot').clientWidth<500);window.microMotion.chart($('plot'),`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title+'：'+phase[0])}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`);
  $('legend').textContent='横轴米、纵轴豆。浅绿区域可以买；绿色线是当前预算边界。重开后，金色虚线标原价下昨天的预算，与今天完全重合。灰空圈是最初家底，实心点是本步持有。'+(key==='free104'?'末幅另设变价时只显示新预算。':'');
  $('metrics').innerHTML=[['每个人都最优',f.check.individualOptimal?'是':'否'],['总资源完整分配',f.check.allocation?'是':'否'],['当前是否均衡',f.check.equilibrium?'是':'否']].map(([a,b])=>'<div class="metric"><label>'+a+'</label><strong>'+b+'</strong></div>').join('');
  $('reading').textContent=phase[1];$('formula').textContent=f.changedPrice?c.changedFormula:c.formula;$('boundary').textContent=c.trap;
  $('extra').innerHTML='<h3>把条件与原理连起来</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>同类题怎么上手</h3><p>'+esc(c.template)+'</p><h3>最容易混淆的地方</h3><p>'+esc(c.trap)+'</p><p>来源：Osborne–Rubinstein '+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>el.textContent=[c.question,c.conditions,c.template][i]||'');const gb=document.querySelector('.study-guide>.boundary');if(gb)gb.textContent='本段核对§10.4正文与命题10.3；保留的习题10.9(b)涉及不同决策结构，不能混同本命题。';
  const d=document.querySelector('.lesson-end a[download]');if(d){d.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch10-reopening-'+key+'.html';d.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 const advance=()=>{step=Math.min(5,step+1);draw()};
 $('experiment').onchange=e=>{if(reopeningKeys.includes(e.target.value)){history.replaceState(null,'',location.pathname+'?case='+e.target.value);configure(e.target.value)}else location.href=location.pathname+'?case='+encodeURIComponent(e.target.value)};
 $('fields').addEventListener('input',e=>{if(e.target.dataset.key==='filmStep'){step=Math.max(0,Math.min(5,Math.round(Number(e.target.value)||0)));draw()}});$('advance').onclick=advance;$('play').onclick=advance;$('reset').onclick=()=>configure(key);window.addEventListener('resize',draw);configure(key);
}

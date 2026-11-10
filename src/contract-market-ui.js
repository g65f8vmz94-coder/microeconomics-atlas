import {contractMarketContent,contractMarketKeys} from './contract-market-content.mjs';
import {contractMarketStory} from './contract-market-story.mjs';

export function startContractMarketStory(requested){
  const $=id=>document.getElementById(id),C={ink:'#263f37',muted:'#708177',green:'#177468',red:'#bd624c',gold:'#b18429',purple:'#74618d',rule:'#d7e0d5',paper:'#fffdf7',soft:'#f3f6f1'};
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:2});
  const text=(x,y,v,size=12,color=C.ink,anchor='start',weight=400)=>`<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(v)}</text>`;
  const q=new URLSearchParams(location.search);let key=contractMarketKeys.includes(requested)?requested:contractMarketKeys.includes(window.CONTRACT_MARKET_DEFAULT)?window.CONTRACT_MARKET_DEFAULT:contractMarketKeys.includes(q.get('case'))?q.get('case'):contractMarketKeys[0],step=0,timer=null;
  function stop(){if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';}
  function chart(frame,small){
    const W=small?280:760,H=small?480:380,left=small?32:68,right=W-(small?22:52),axisY=small?192:179,X=v=>left+(right-left)*v/10;
    let s=`<rect width="${W}" height="${H}" fill="${C.paper}"/>`+text(W/2,28,frame.focus,small?16:22,C.ink,'middle',750)+text(W/2,52,frame.verdict,small?11:13,frame.market.equilibrium?C.green:C.red,'middle',650);
    s+=text(left,84,'工资报价 w',small?10:12,C.muted,'start',700)+`<path d="M${left} ${axisY}H${right}" stroke="${C.ink}" stroke-width="2"/>`;
    for(let w=0;w<=10;w+=2)s+=`<path d="M${X(w)} ${axisY-5}V${axisY+6}" stroke="${C.muted}"/>`+text(X(w),axisY+24,w,small?9:11,C.muted,'middle');
    const markers=frame.W.map((w,i)=>({w,label:`店${i+1}：${fmt(w)}元`,kind:'current'}));if(frame.entry!==null)markers.push({w:frame.entry,label:`新店：${fmt(frame.entry)}元`,kind:'entry'});
    markers.forEach((m,i)=>{const active=m.kind==='entry'?frame.entryChosen:frame.market.selected.includes(m.w)&&(!frame.entryChosen||frame.entry<frame.market.selected[0]);const color=m.kind==='entry'?C.gold:active?C.green:C.purple;const yy=(i%2===0?112:137);s+=`<g data-motion="contract-${m.kind}-${i}"><path d="M${X(m.w)} ${axisY-7}V${yy+7}" stroke="${color}" stroke-width="2" stroke-dasharray="4 4"/><rect x="${X(m.w)-(small?38:54)}" y="${yy-16}" width="${small?76:108}" height="28" rx="9" fill="${active?C.soft:C.paper}" stroke="${color}"/><circle cx="${X(m.w)}" cy="${axisY}" r="${small?6:8}" fill="${color}"/>${text(X(m.w),yy+3,m.label,small?9:12,color,'middle',720)}</g>`;});
    s+=`<path d="M${X(8)} ${axisY-95}V${axisY+7}" stroke="${C.red}" stroke-width="2.5" stroke-dasharray="6 4"/>`+text(X(8),axisY-102,'生产价值 v=8',small?9:12,C.red,'middle',760);
    if(frame.W.length===0)s+=text(W/2,128,'没有任何店报工资',small?11:13,C.muted,'middle',600);
    const panelY=small?245:225,panelH=small?230:132;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${panelH}" rx="15" fill="${C.soft}" stroke="${C.rule}"/>`;
    const status=(label,value,index)=>{const y=panelY+30+(small?index*52:0),x=small?27:33+index*235,color=value===null?C.muted:value?C.green:C.red,shown=frame.visibleChecks[index];return `<circle cx="${x+8}" cy="${y-5}" r="8" fill="${shown?color:C.rule}"/>`+text(x+24,y,label,small?11:12,shown?C.ink:C.muted,'start',690)+text(x+24,y+17,shown?(value===null?'无报价可查':value?'通过':'不通过'):'待检查',small?10:11,shown?color:C.muted,'start',700);};
    s+=status('① 报价被选',frame.W.length?frame.market.I:null,0)+status('② 雇主不亏',frame.W.length?frame.market.II:null,1)+status('③ 无盈利进入',frame.market.III,2);
    if(small)s+=text(25,panelY+198,'金色是新店报价；红线是生产价值。',9,C.muted,'start');
    else s+=text(33,panelY+106,'绿：工人会选的现有报价　紫：未选报价　金：新店报价　红虚线：生产价值',11,C.muted,'start');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(frame.identity+'；'+frame.verdict)}">${s}</svg>`;
  }
  function controls(){if(!$('fields'))return;$('fields').innerHTML=`<div class="field"><label for="experiment">本节知识点</label><select id="experiment">${contractMarketKeys.map(k=>`<option value="${k}">${esc(contractMarketContent[k].title)}</option>`).join('')}</select></div><p class="small" id="film-progress" aria-live="polite"></p>`;$('experiment').onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
  function draw(){
    const f=contractMarketStory(key,step),c=contractMarketContent[key],briefId='contract-brief';if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;
    let brief=$(briefId);if(!brief){brief=document.createElement('section');brief.id=briefId;brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="contract-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="contract-conditions"></span></p><p class="boundary" id="contract-source"></p>';$('legend')?.before(brief);}
    $('contract-question').textContent=c.question;$('contract-conditions').textContent=c.conditions;$('contract-source').textContent=c.source;
    const plot=$('plot');if(plot){Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const svg=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,svg);else plot.innerHTML=svg;}
    if($('legend'))$('legend').textContent='绿：被选的现有报价；紫：未选报价；金：新店报价；红虚线：工人的生产价值。';
    if($('metrics'))$('metrics').innerHTML=[['当前 W',f.W.length?'{'+f.W.join('，')+'}':'∅'],['被选工资',f.market.selected.length?fmt(f.market.selected[0]):'无'],['被选店利润',f.market.profits.length?fmt(f.market.profits[0]):'无'],['新店利润',f.entry===null?'未报价':f.entryProfit===null?'未被选':fmt(f.entryProfit)]].map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
    if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
    if($('extra'))$('extra').innerHTML=`<h3>证明与计算</h3><ol>${c.proof.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(c.template)}</p><h3>最容易混淆</h3><p>${esc(c.trap)}</p><p>来源：${esc(c.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>{el.textContent=[c.question,c.conditions,c.template][i]||'';});
    const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch14-contract-${key}.html`;dl.textContent='下载本段完整动画代码 ↓';}
    window.microMath?.refresh?.();
  }
  function configure(next){stop();key=contractMarketKeys.includes(next)?next:contractMarketKeys[0];window.CONTRACT_MARKET_DEFAULT=key;const p=new URLSearchParams(location.search),wanted=Number(p.get('filmStep'));step=(p.get('case')===key||!p.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
  const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>configure(key);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startContractMarketStory=startContractMarketStory;

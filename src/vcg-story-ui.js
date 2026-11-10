import {vcgStoryContent,vcgStoryKeys} from './vcg-story-content.mjs';
import {vcgStoryFrame} from './vcg-story.mjs';
import {projectOutcome,trueUtility,budgetValues} from './mechanism.mjs';

export function startVCGStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',red:'#b25c4b',purple:'#75618d',gold:'#a47a26',line:'#d4dfd4',paper:'#fffdf7',soft:'#eef4ed'};
 const fmt=n=>n>0?'+'+n:String(n),T=(x,y,v,size=13,color=C.ink,anchor='start',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const R=(x,y,w,h,fill,id,r=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" data-motion="${esc(id)}"/>`;
 const border=(x,y,w,h,color,id)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${color}" stroke-width="2" data-motion="${esc(id)}"/>`;
 let key=vcgStoryKeys.includes(requested)?requested:vcgStoryKeys.includes(window.VCG_STORY_DEFAULT)?window.VCG_STORY_DEFAULT:'d175',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function projectChart(f,small){
  const n=f.reports.length,W=small?320:760,H=small?198+55*n:205+51*n,rowX=small?17:27,rowW=small?286:706;
  let s=R(0,0,W,H,C.soft,'vcg-background',14)+R(rowX,17,rowW,70,C.paper,'vcg-decision');
  s+=T(rowX+13,42,f.cost?'扣成本后的报告和':'全部报告和',small?12:14,C.muted)+T(rowX+13,72,fmt(f.outcome.total),small?20:25,C.ink);
  s+=T(rowX+rowW-13,70,f.outcome.decision?'项目实施':'项目不实施',small?18:23,f.outcome.decision?C.green:C.red,'end',760);
  for(let i=0;i<n;i++){
   const y=100+i*(small?55:51),v=f.reports[i],transfer=f.outcome.transfers[i],focus=i===f.focus;
   s+=R(rowX,y,rowW,47,C.paper,'vcg-resident-'+i);
   if(focus)s+=border(rowX,y,rowW,47,C.gold,'vcg-focus-'+i);
   s+=T(rowX+11,y+19,`居民${i+1}  报告 ${fmt(v)}`,small?12:14,C.ink);
   s+=T(rowX+rowW-11,y+19,`额外转移 ${fmt(transfer)}`,small?11:14,transfer<0?C.red:C.muted,'end');
   s+=T(rowX+11,y+38,f.cost?`扣成本后 ${fmt(f.outcome.net[i])}`:`其他人之和 ${fmt(f.outcome.others[i])}`,small?11:12,C.muted);
   if(f.cost)s+=T(rowX+rowW-11,y+38,`建时分摊 ${fmt(f.outcome.share)}`,small?10:12,C.purple,'end');
  }
  const y=109+n*(small?55:51);
  s+=R(rowX,y,rowW,small?76:78,C.paper,'vcg-result');
  s+=T(rowX+12,y+22,`观察居民${f.focus+1}：拿开他会${f.withoutDecision?'建':'不建'}`,small?12:15,C.ink);
  const line=f.values===null?'原书只给报告，不推断真效用':f.rebate!==undefined?`返还 ${fmt(f.rebate)} 后，真效用 ${fmt(f.focusUtility)}`:`真实效用 ${fmt(f.focusUtility)}`;
  s+=T(rowX+12,y+49,line,small?12:16,f.focusUtility<0?C.red:C.green);
  s+=T(W/2,H-5,f.identity,small?11:12,C.ink,'middle',700);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">${s}</svg>`;
 }
 function fairnessChart(f,small){const W=small?320:760,H=small?360:312,x=small?17:27,w=small?286:706,bar=Math.max(4,(small?246:500)*f.poor/220);let s=R(0,0,W,H,C.soft,'fairness-backdrop',14);
  s+=R(x,18,w,74,C.paper,'fairness-rich')+T(x+14,46,'受益居民：2人',small?14:17,C.green)+T(x+14,76,'每人货币估值 +100',small?15:19,C.ink);
  s+=R(x,105,w,90,C.paper,'fairness-poor')+T(x+14,132,`受损居民：${f.poor}人`,small?14:17,C.red)+R(x+14,145,bar,12,C.red,'fairness-count-bar',4)+T(x+14,179,'每人货币估值 −1',small?13:17,C.ink);
  s+=R(x,208,w,small?116:82,C.paper,'fairness-result')+T(x+13,233,`货币估值总和 ${fmt(f.outcome.total)}`,small?15:18,C.ink)+T(x+13,262,f.outcome.decision?'VCG实施项目':'VCG不实施项目',small?18:22,f.outcome.decision?C.green:C.red);
  s+=T(x+13,small?293:276,`关键付款人数：${f.outcome.transfers.filter(t=>t<0).length}`,small?12:15,C.purple);
  if(small)s+=T(x+13,312,'红条按受损人数 0—220 缩放',10,C.muted);
  s+=T(W/2,H-6,f.identity,small?11:12,C.ink,'middle',700);return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">${s}</svg>`;}
 function gridChart(f,small){const W=small?320:760,H=small?350:340,x=small?37:170,y=small?57:54,cell=small?88:133,rowH=small?72:70,values=[4,-1,-5];let s=R(0,0,W,H,C.soft,'grid-backdrop',14)+T(small?17:40,28,f.proof?'假设：和为正才建，且必建':'原书三种报告：4、−1、−5',small?13:18,C.ink);
  values.forEach((v,i)=>{s+=T(x+cell*(i+.5),47,fmt(v),small?12:14,C.purple,'middle');s+=T(x-15,y+rowH*(i+.55),fmt(v),small?12:14,C.purple,'middle');});
  f.rows.forEach((r,i)=>{const row=Math.floor(i/3),col=i%3,cx=x+cell*col,cy=y+rowH*row,chosen=r.x===f.selected.x&&r.y===f.selected.y;
   s+=R(cx,cy,cell-5,rowH-5,r.decision?'#dfeee5':'#f8e9e2','vcg-grid-'+i,5);if(chosen)s+=border(cx,cy,cell-5,rowH-5,C.gold,'vcg-grid-focus');
   s+=T(cx+(cell-5)/2,cy+25,r.decision?'建':'不建',small?14:17,r.decision?C.green:C.red,'middle');
   if(!f.proof)s+=T(cx+(cell-5)/2,cy+49,`${fmt(r.transfers[0])}，${fmt(r.transfers[1])}`,small?11:13,C.ink,'middle');
  });
  s+=T(W/2,H-14,f.proof?'格子只显示决定；假设的转移由反证逐步推出':`选中 (${fmt(f.selected.x)}, ${fmt(f.selected.y)}) · ${f.selected.decision?'建':'不建'}`,small?10:14,C.ink,'middle');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">${s}</svg>`;}
 function auctionChart(f,small){const W=small?320:760,H=small?385:346,x=small?17:28,w=small?286:704;let s=R(0,0,W,H,C.soft,'auction-backdrop',14)+T(x+12,32,f.rule==='second'?'二价：赢家付别人最高报价':'一价：赢家付自己的报价',small?13:18,C.ink);
  f.bids.forEach((bid,i)=>{const y=48+i*(small?78:69),winner=i===f.outcome.winner;s+=R(x,y,w,small?67:60,C.paper,'auction-bid-'+i);if(winner)s+=border(x,y,w,small?67:60,C.gold,'auction-winner-'+i);s+=T(x+12,y+26,`竞买人${i+1}  报价 ${fmt(bid)}`,small?14:18,winner?C.green:C.ink)+T(x+12,y+51,`真估值 ${fmt(f.values[i])}${winner?' · 当前获胜':''}`,small?12:14,C.muted);});
  const y=small?296:268;s+=R(x,y,w,small?70:57,C.paper,'auction-result')+T(x+12,y+25,`赢家：${f.outcome.winner+1}号  ·  付款 ${fmt(f.outcome.payment)}`,small?13:18,C.ink)+T(x+12,y+49,`1号真实效用 ${fmt(f.outcome.utility[0])}  ·  诚实报价时 ${fmt(f.honest.utility[0])}`,small?12:15,C.purple);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">${s}</svg>`;}
 const chart=(f,small)=>f.kind==='fairness'?fairnessChart(f,small):f.kind==='grid'?gridChart(f,small):f.kind==='auction'?auctionChart(f,small):projectChart(f,small);
 function draw(){const c=vcgStoryContent[key],f=vcgStoryFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;
  if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="strategic-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="strategic-conditions"></span></p><p class="boundary" id="strategic-source"></p>';$('legend')?.before(brief);}$('strategic-question').textContent=c.question;$('strategic-conditions').textContent=c.conditions;$('strategic-source').textContent=c.source;
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent=f.kind==='grid'?f.proof?'每格只表示项目决定；本题反证中的转移须从预算平衡、对称和激励条件推导。':'每格第一行表示决定，第二行依次是玩家1与玩家2的VCG转移；负数表示付款。':f.kind==='auction'?'金框是赢家；付款与真实效用分开。平手按编号较小者获胜。':f.kind==='fairness'?'红条按受损人数缩放；货币总和是机制的规则，不是公平判断。':'同一组报告决定共同项目。金框表示正在观察的居民；负转移是额外关键付款，成本分摊另列。';
  let metrics=[];if(f.kind==='project'){metrics=[['报告和',fmt(f.outcome.total)],['当前决定',f.outcome.decision?'实施':'不实施'],['观察者额外转移',fmt(f.outcome.transfers[f.focus])],['观察者真实效用',f.values===null?'原书未给真值':fmt(f.focusUtility)]];if(f.cost)metrics.push(['实施时成本分摊',fmt(f.outcome.share)],['实施时合计付出',fmt(f.outcome.share-f.outcome.transfers[f.focus])]);if(f.rebate!==undefined)metrics.push(['每人收到返还',fmt(f.rebate)]);}else if(f.kind==='fairness')metrics=[['总估值',fmt(f.outcome.total)],['项目决定',f.outcome.decision?'实施':'不实施'],['受损人数',f.poor],['关键付款人数',f.outcome.transfers.filter(t=>t<0).length]];else if(f.kind==='grid')metrics=[['选中报告',`(${fmt(f.selected.x)}, ${fmt(f.selected.y)})`],['项目决定',f.selected.decision?'实施':'不实施'],['题目条件',f.proof?'双向实施条件':'VCG关键付款']];else metrics=[['赢家',f.outcome.winner+1],['赢家付款',fmt(f.outcome.payment)],['1号真效用',fmt(f.outcome.utility[0])],['1号诚实效用',fmt(f.honest.utility[0])]];
  if(f.otherSum!==undefined)metrics.push(['建与不建的真效用差',fmt(f.utilityDifference)]);if($('metrics'))$('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${esc(l)}</label><strong>${esc(v)}</strong></div>`).join('');if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  let extra='<h3>解题步骤</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  if(key==='q171a'){extra+='<h3>原题九格结果（报告1，报告2 → 决定；转移1，转移2）</h3><ol>'+f.rows.map(r=>'<li>'+esc(`(${fmt(r.x)}, ${fmt(r.y)}) → ${r.decision?'建':'不建'}；(${fmt(r.transfers[0])}, ${fmt(r.transfers[1])})`)+'</li>').join('')+'</ol>';extra+='<h3>逐组检验诚实报告</h3><p>每行固定玩家1的真值和玩家2的报告，依次列出玩家1报4、−1、−5时的真实效用；玩家2由对称性同理。</p><ol>'+budgetValues.flatMap(v=>budgetValues.map(other=>{const gains=budgetValues.map(report=>trueUtility(v,projectOutcome([report,other])));return '<li>'+esc(`真值 ${fmt(v)}，对手报 ${fmt(other)}：效用 (${gains.map(fmt).join('，')})；诚实对应 ${fmt(gains[budgetValues.indexOf(v)])}，不低于其余报告。`)+'</li>';})).join('')+'</ol>';}
  if(key==='q171b')extra+='<h3>完整反证的六步</h3><ol>'+c.steps.map(([label,text])=>'<li><strong>'+esc(label)+'：</strong>'+esc(text)+'</li>').join('')+'</ol>';
  if($('extra'))$('extra').innerHTML=extra;document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch17-vcg-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=vcgStoryKeys.includes(next)?next:'d175';window.VCG_STORY_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点或习题';const select=document.createElement('select');select.id='experiment';for(const k of vcgStoryKeys){const o=document.createElement('option');o.value=k;o.textContent=vcgStoryContent[k].title;select.append(o);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startVCGStory=startVCGStory;

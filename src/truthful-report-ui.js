import {truthfulReportContent,truthfulReportKeys} from './truthful-report-content.mjs';
import {truthfulReportFrame} from './truthful-report-story.mjs';

export function startTruthfulReportStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',red:'#b25c4b',purple:'#75618d',gold:'#a47a26',line:'#d4dfd4',paper:'#fffdf7',soft:'#eef4ed'};
 const fmt=n=>n>0?'+'+n:String(n);
 const T=(x,y,v,size=13,color=C.ink,anchor='start',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const R=(x,y,w,h,fill,id,r=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" data-motion="${esc(id)}"/>`;
 let key=truthfulReportKeys.includes(requested)?requested:truthfulReportKeys.includes(window.TRUTHFUL_REPORT_DEFAULT)?window.TRUTHFUL_REPORT_DEFAULT:'d173',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function chart(f,small){
  const W=small?320:760,H=small?424:356;
  let s=R(0,0,W,H,C.soft,'truth-backdrop',14);
  const card=(x,y,w,h,id,label,value,color)=>R(x,y,w,h,C.paper,id)+T(x+13,y+24,label,small?12:14,C.muted)+T(x+13,y+(small?52:66),value,small?20:26,color);
  if(small){
   s+=card(17,17,136,71,'truth-value','心里真估值 v₁',fmt(f.value),C.green);
   s+=card(166,17,137,71,'truth-report','递交的报告 x₁',fmt(f.report),f.report===f.value?C.green:C.gold);
   s+=R(17,101,286,59,C.paper,'truth-other')+T(30,123,'其他两人的报告固定',12,C.muted)+T(30,147,`${fmt(f.otherReports[0])}，${fmt(f.otherReports[1])}`,16,C.purple);
   s+=R(17,173,286,48,C.paper,'truth-rule')+T(30,194,f.rule==='majority'?'规则：正报告严格过半':'规则：报告之和严格大于0',13,C.ink)+T(30,213,'所有人转移 = 0',11,C.muted);
   s+=card(17,234,136,90,'truth-honest','如果诚实报告',f.honest.decision?'建 · 真收益 '+fmt(f.honestUtility):'不建 · 真收益 '+fmt(f.honestUtility),f.honest.decision?C.green:C.red);
   s+=card(166,234,137,90,'truth-current','当前递交报告',f.current.decision?'建 · 真收益 '+fmt(f.currentUtility):'不建 · 真收益 '+fmt(f.currentUtility),f.current.decision?C.green:C.red);
   s+=R(17,338,286,56,C.paper,'truth-comparison')+T(30,362,'改报比诚实多得到',12,C.muted)+T(30,385,fmt(f.gain),20,f.gain>0?C.red:C.ink);
   s+=T(160,414,f.identity,11,C.ink,'middle',700);
  }else{
   s+=card(28,31,213,92,'truth-value','心里真估值 v₁',fmt(f.value),C.green);
   s+=card(273,31,213,92,'truth-report','递交的报告 x₁',fmt(f.report),f.report===f.value?C.green:C.gold);
   s+=card(518,31,213,92,'truth-other','其他报告固定',`${fmt(f.otherReports[0])}，${fmt(f.otherReports[1])}`,C.purple);
   s+=R(28,139,703,48,C.paper,'truth-rule')+T(45,169,f.rule==='majority'?'多数规则：正报告严格过半':'求和规则：全部报告之和严格大于0',15,C.ink)+T(712,169,'转移 = 0',13,C.muted,'end');
   s+=card(28,203,337,94,'truth-honest','诚实报告的结果',f.honest.decision?`建 · 真实效用 ${fmt(f.honestUtility)}`:`不建 · 真实效用 ${fmt(f.honestUtility)}`,f.honest.decision?C.green:C.red);
   s+=card(394,203,337,94,'truth-current','当前报告的结果',f.current.decision?`建 · 真实效用 ${fmt(f.currentUtility)}`:`不建 · 真实效用 ${fmt(f.currentUtility)}`,f.current.decision?C.green:C.red);
   s+=T(28,336,`改报比诚实多得到 ${fmt(f.gain)}`,15,f.gain>0?C.red:C.ink)+T(731,336,f.identity,13,C.ink,'end',700);
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">${s}</svg>`;
 }
 function draw(){const c=truthfulReportContent[key],f=truthfulReportFrame(key,step),plot=$('plot');
  if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;
  if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="strategic-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="strategic-conditions"></span></p><p class="boundary" id="strategic-source"></p>';$('legend')?.before(brief);}
  $('strategic-question').textContent=c.question;$('strategic-conditions').textContent=c.conditions;$('strategic-source').textContent=c.source;
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent='左边的“诚实”是同一组别人报告下的比较基准；右边是当前递交的数字。规则只看报告，收益始终用真实估值计算。';
  if($('metrics'))$('metrics').innerHTML=[['我的真估值',fmt(f.value)],['当前报告',fmt(f.report)],['诚实的真实效用',fmt(f.honestUtility)],['当前的真实效用',fmt(f.currentUtility)]].map(([l,v])=>`<div class="metric"><label>${esc(l)}</label><strong>${esc(v)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>严谨检验与计算路线</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch17-truth-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=truthfulReportKeys.includes(next)?next:'d173';window.TRUTHFUL_REPORT_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点';const select=document.createElement('select');select.id='experiment';for(const k of truthfulReportKeys){const o=document.createElement('option');o.value=k;o.textContent=truthfulReportContent[k].title;select.append(o);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startTruthfulReportStory=startTruthfulReportStory;

import {bargainingStoryContent,bargainingStoryKeys} from './bargaining-story-content.mjs';
import {bargainingStory} from './bargaining-story.mjs';

export function startBargainingStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const colors={ink:'#263f37',muted:'#61766b',green:'#177468',purple:'#75618d',gold:'#a47a26',line:'#d4dfd4',paper:'#fffdf7',soft:'#eef4ed'};
 const fmt=n=>Number.isInteger(n)?String(n):Number(n.toFixed(3)).toString();
 const text=(x,y,v,size,color=colors.ink,anchor='middle',weight=500)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}" text-anchor="${anchor}">${esc(v)}</text>`;
 const rect=(x,y,w,h,color,id,r=7)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}" data-motion="${esc(id)}"/>`;
 let aliases={finiteRules:'finite',finiteBackwards:'finiteBack',oneRules:'one',oneImmediateAgreement:'oneImmediate'};
 let key=bargainingStoryKeys.includes(requested)?requested:bargainingStoryKeys.includes(aliases[requested])?aliases[requested]:bargainingStoryKeys.includes(window.BARGAINING_STORY_DEFAULT)?window.BARGAINING_STORY_DEFAULT:'intro',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function chart(f,small){const W=small?320:760,H=small?450:366,px=small?25:68,pw=small?270:624,yt=small?72:72,yt2=small?236:210,barh=small?56:62;
  let s=rect(0,0,W,H,colors.soft,'bargain-backdrop',14);
  s+=text(px,small?36:35,small?'现在的报价':'这轮的报价与回应',small?15:19,colors.ink,'start',750);
  s+=text(W-px,small?36:35,`第${f.period}期 · 玩家${f.proposer}报价`,small?10:13,colors.muted,'end');
  s+=text(px,yt-12,`玩家1 ${fmt(f.offer[0])}  ｜  玩家2 ${fmt(f.offer[1])}`,small?13:17,colors.ink,'start',650);
  s+=rect(px,yt,pw,barh,colors.paper,'bargain-total');
  s+=rect(px,yt,pw*f.offer[0],barh,colors.green,'bargain-share-1',f.offer[0]===1?7:0);
  s+=rect(px+pw*f.offer[0],yt,pw*f.offer[1],barh,colors.purple,'bargain-share-2',f.offer[1]===1?7:0);
  if(f.offer[0]>.15)s+=text(px+pw*f.offer[0]/2,yt+barh/2+5,'玩家1',small?12:15,'#fff','middle',700);
  if(f.offer[1]>.15)s+=text(px+pw*(f.offer[0]+f.offer[1]/2),yt+barh/2+5,'玩家2',small?12:15,'#fff','middle',700);
  const afterY=small?166:174;s+=text(W/2,afterY,'↓  '+f.decision,small?13:17,colors.gold,'middle',750);
  s+=`<path d="M${px} ${yt2-13}H${W-px}" fill="none" stroke="${colors.line}" stroke-width="2" data-motion="bargain-timeline"/>`;
  s+=text(px,yt2+4,'本轮',small?12:14,colors.green,'start',700)+text(W/2,yt2+4,'拒绝 → 下一轮',small?11:14,colors.muted,'middle')+text(W-px,yt2+4,'续局',small?12:14,colors.purple,'end',700);
  const yb=small?278:245;s+=text(px,yb-11,'若进入续局，参考的分割',small?12:15,colors.muted,'start');
  s+=rect(px,yb,pw,small?36:40,colors.paper,'bargain-next-total');s+=rect(px,yb,pw*f.next[0],small?36:40,colors.green,'bargain-next-1',0);s+=rect(px+pw*f.next[0],yb,pw*f.next[1],small?36:40,colors.purple,'bargain-next-2',0);
  s+=text(px,small?341:308,`玩家1 ${fmt(f.next[0])}`,small?12:14,colors.green,'start',700)+text(W-px,small?341:308,`玩家2 ${fmt(f.next[1])}`,small?12:14,colors.purple,'end',700);
  const subtitle=f.focus.length>(small?21:47)?f.focus.slice(0,small?21:47)+'…':f.focus;
  s+=rect(px,small?371:329,pw,small?48:29,colors.paper,'bargain-focus',7)+text(W/2,small?400:349,subtitle,small?12:14,colors.ink,'middle',700);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">${s}</svg>`;
 }
 function draw(){const c=bargainingStoryContent[key],f=bargainingStory(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="strategic-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="strategic-conditions"></span></p><p class="boundary" id="strategic-source"></p>';$('legend')?.before(brief);} $('strategic-question').textContent=c.question;$('strategic-conditions').textContent=c.conditions;$('strategic-source').textContent=c.source;
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent='绿色：玩家1份额　紫色：玩家2份额。上方是当前报价，下方是拒绝后要考虑的续局；不是所有画出的续局都会实际发生。';
  const metrics=[['当前报价',`(${fmt(f.offer[0])}，${fmt(f.offer[1])})`],['这轮由谁报价',`玩家${f.proposer}`],['回应',f.decision],['拒绝后的参考分割',`(${fmt(f.next[0])}，${fmt(f.next[1])})`]];
  if(['alternating','alternatingProof'].includes(key))metrics.push(['玩家2今天的门槛',fmt(f.alternating.player2Threshold)],['玩家1明天的门槛',fmt(f.alternating.player1Threshold)]);
  if($('metrics'))$('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${esc(l)}</label><strong>${esc(v)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>解题步骤</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>el.textContent=[c.question,c.conditions,c.template][i]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch16-bargaining-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();}
 function configure(next){stop();key=bargainingStoryKeys.includes(next)?next:aliases[next]||'intro';window.BARGAINING_STORY_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点';const select=document.createElement('select');select.id='experiment';for(const k of bargainingStoryKeys){const o=document.createElement('option');o.value=k;o.textContent=bargainingStoryContent[k].title;select.append(o);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startBargainingStory=startBargainingStory;

import {socialFoundationsContent,socialFoundationsKeys} from './social-foundations-content.mjs';
import {socialFoundationsFrame} from './social-foundations-story.mjs';

export function startSocialFoundationsStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',gold:'#a47a26',violet:'#75618d',line:'#d4dfd4',paper:'#fffdf7',soft:'#eef4ed'};
 const T=(x,y,v,size=14,color=C.ink,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const R=(x,y,w,h,fill,id,rx=7)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${h}" rx="${rx}" fill="${fill}" data-motion="${esc(id)}"/>`;
 let key=socialFoundationsKeys.includes(requested)?requested:socialFoundationsKeys.includes(window.SOCIAL_FOUNDATIONS_DEFAULT)?window.SOCIAL_FOUNDATIONS_DEFAULT:'d191',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 const fmt=v=>Math.abs(v-1/3)<1e-8?'1/3':Math.abs(v-2/3)<1e-8?'2/3':Math.abs(v-.5)<1e-8?'1/2':Number.isInteger(v)?String(v):String(+v.toFixed(2));
 function chart(f,small){
  const W=small?320:760,H=small?410:400,xs=small?[61,148,235]:[158,353,557],ws=small?[55,59,59]:[136,147,147],row=small?[92,182,272]:[96,181,266],scale=key==='d193'?12:9;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">`+R(0,0,W,H,C.soft,'social-foundations-backdrop',14);
  const heads=['投入 α','个人产出 q','最终财富 w'];heads.forEach((h,j)=>{s+=T(xs[j]+ws[j]/2,33,h,small?12:16,[C.green,C.gold,C.violet][j]);});
  for(let i=0;i<3;i++){
   const y=row[i];s+=T(small?29:62,y+6,`${i+1}号`,small?14:16,C.ink)+T(small?29:62,y+25,`λ=${f.lambda[i]}`,small?12:12,C.muted);
   for(let j=0;j<3;j++)s+=R(xs[j],y-7,ws[j],20,C.paper,`social-track-${i}-${j}`);
   if(f.visibleInput)s+=R(xs[0],y-7,ws[0]*f.input[i],20,C.green,`social-input-${i}`);
   if(f.visibleOutput)s+=R(xs[1],y-7,ws[1]*f.output[i]/scale,20,C.gold,`social-output-${i}`);
   if(f.visibleWealth)s+=R(xs[2],y-7,ws[2]*f.wealth[i]/scale,20,C.violet,`social-wealth-${i}`);
   s+=T(xs[0]+ws[0]/2,y+31,f.visibleInput?fmt(f.input[i]):'待分',small?13:13,C.ink);
   s+=T(xs[1]+ws[1]/2,y+31,f.visibleOutput?fmt(f.output[i]):'待算',small?13:13,C.ink);
   s+=T(xs[2]+ws[2]/2,y+31,f.visibleWealth?fmt(f.wealth[i]):key==='d191'?'未规定':'待分',small?13:13,C.ink);
  }
  const totalLabel=f.visibleTotal?`投入 1 · 总产出 ${fmt(f.total)}${f.visibleWealth?' · 财富总量 '+fmt(f.wealth.reduce((a,b)=>a+b,0)):''}`:'投入、产出和财富分步揭晓';
  s+=R(small?12:30,small?339:337,small?296:700,small?55:45,C.paper,'social-total');
  if(small&&f.visibleWealth){s+=T(W/2,361,`投入 1 · 总产出 ${fmt(f.total)}`,13,C.ink)+T(W/2,380,`财富总量 ${fmt(f.wealth.reduce((a,b)=>a+b,0))}`,13,C.ink);}
  else s+=T(W/2,small?372:365,totalLabel,small?13:15,C.ink);
  return s+'</svg>';
 }
 function draw(){const c=socialFoundationsContent[key],f=socialFoundationsFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与数值来源');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.scenes[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent='同一行始终是同一个人。绿柱表示分到的投入，黄柱表示实际生产，紫柱表示最后拿到的财富；柱长使用固定刻度，数值在柱下。'+(f.boundary?' 当前变化：'+f.boundary:'');
  const metrics=[['生产率档案',f.lambda.join('、')],['投入份额',f.visibleInput?f.input.map(fmt).join('、'):'尚未分配'],['个人产出',f.visibleOutput?f.output.map(fmt).join('、'):'尚未生产'],['财富分配',f.visibleWealth?f.wealth.map(fmt).join('、'):key==='d191'?'本段尚未规定':'尚未揭晓']];if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=f.formulaOverride||c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  const special={
   'd192:5':['当前投入全给3号，产出为(0,0,9)，总量9。','财富(3,3,3)非负，合计也为9，所以这份财富配置可行。','定义问的是“存在某种投入方案”，平分投入时的6份不能否定它。'],
   'd193:5':['当前生产率档案是(3,6,12)。','同一条规则把投入给3号，产出12，再把12份均分。','财富为(4,4,4)，说明规则也必须回答变化后的档案。'],
   'e192:5':['当前2号和3号并列最高，生产率都为9。','两人各获二分之一投入，各产4.5份，1号产0。','各取所产，财富为(0,4.5,4.5)，总和9。'],
   'e196:5':['当前所有人的生产率都是0，任何合法投入分法都只能产出0。','财富非负且总和必须为0，所以唯一可行财富是(0,0,0)。','原书比例式在此分母为0；这幕按可行性补定义，不能把0直接代入分式。']
  }[key+':'+step];
  if($('extra'))$('extra').innerHTML=(special?'<h3>先验算当前画面</h3><ol>'+special.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol>':'')+'<h3>原书规则与主例的计算路线</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch19-model-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=socialFoundationsKeys.includes(next)?next:'d191';window.SOCIAL_FOUNDATIONS_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点或原书例子';const select=document.createElement('select');select.id='experiment';for(const k of socialFoundationsKeys){const option=document.createElement('option');option.value=k;option.textContent=socialFoundationsContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startSocialFoundationsStory=startSocialFoundationsStory;

import {socialPreferencesContent,socialPreferencesKeys} from './social-preferences-content.mjs';
import {socialPreferencesFrame} from './social-preferences-story.mjs';

export function startSocialPreferencesStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',gold:'#a47a26',red:'#b95845',paper:'#fffdf7',soft:'#eef4ed'};
 const txt=(x,y,v,size=14,color=C.ink,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const rect=(x,y,w,h,fill,id,rx=7)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${h}" rx="${rx}" fill="${fill}" data-motion="${esc(id)}"/>`;
 const names=['a','b','c'],locations=['L','M','R'];let key=socialPreferencesKeys.includes(requested)?requested:socialPreferencesKeys.includes(window.SOCIAL_PREFERENCES_DEFAULT)?window.SOCIAL_PREFERENCES_DEFAULT:'ordinal',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function chart(f,small){
  const W=small?320:760,rows=f.mode==='binary'||f.profile?.length>3?2:1,top=rows===2?235:130,H=top+225,cardW=small?91:205,margin=small?12:45,gap=small?10:25;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">`+rect(0,0,W,H,C.soft,'social-preference-background',14);
  const count=f.mode==='binary'?f.votes.length:f.partitions?.length||f.profile?.length||0;
  for(let i=0;i<count;i++){
   const col=i%3,row=Math.floor(i/3),x=margin+col*(cardW+gap),y=16+row*108,visible=i<(f.revealPeople??count);
   s+=rect(x,y,cardW,92,C.paper,`social-preference-card-${i}`)+txt(x+cardW/2,y+20,`${i+1}号`,small?12:14,C.muted);
   if(!visible){s+=txt(x+cardW/2,y+58,'待揭晓',small?12:14,C.muted);continue;}
   if(f.mode==='binary')s+=txt(x+cardW/2,y+61,`投 ${f.votes[i]?'a':'b'}`,small?17:20,f.votes[i]?C.green:C.gold);
   else if(f.mode==='classes'){
    const p=f.partitions[i],groups=[...new Set(p)].map(g=>p.flatMap((v,j)=>v===g?[names[j]]:[]).join('、'));
    s+=txt(x+cardW/2,y+51,groups[0],small?13:17,C.ink)+txt(x+cardW/2,y+74,groups[1]||'全同类',small?12:15,C.muted);
   }else{
    const r=f.profile[i],symbols=f.key==='p202'?locations:names;
    r.forEach((v,j)=>s+=txt(x+cardW*(j+.5)/3,y+60,symbols[v],small?17:20,j===0?C.green:C.ink));
    s+=txt(x+cardW/2,y+78,'第1    第2    第3',small?9:12,C.muted);
   }
  }
  const panelY=top+7;s+=rect(small?10:45,panelY,small?300:670,177,C.paper,'social-preference-result',12);
  if(f.mode==='rankings'){
   s+=txt(W/2,panelY+49,'三张个人排序卡',small?17:21,C.green)+txt(W/2,panelY+92,'社会排序 ？',small?20:26,C.gold)+txt(W/2,panelY+131,'需要先说明汇总规则',small?13:17,C.ink);
  }else if(f.mode==='scores'){
   const x0=small?76:190,bw=small?152:340,max=6;names.forEach((n,i)=>{const y=panelY+36+i*45;s+=txt(small?40:125,y+14,n,small?16:20,C.ink)+rect(x0,y,bw,21,C.soft,`score-track-${i}`)+rect(x0,y,bw*f.scores[i]/max,21,C.green,`score-${i}`)+txt(x0+bw+24,y+15,String(f.scores[i]),small?14:17,C.ink);});
  }else if(f.mode==='binary'){
   const x0=small?77:190,bw=small?152:340;for(const [i,n] of ['a','b'].entries()){const y=panelY+45+i*53,v=i?f.n-f.k:f.k;s+=txt(small?39:126,y+14,n,small?17:20,C.ink)+rect(x0,y,bw,22,C.soft,`vote-track-${n}`)+rect(x0,y,bw*v/f.n,22,i?C.gold:C.green,`vote-${n}`)+txt(x0+bw+25,y+15,`${v}票`,small?12:16,C.ink);}
   s+=txt(W/2,panelY+153,f.sign>0?'a 多数胜':f.sign<0?'b 多数胜':'社会无差异',small?15:19,C.ink);
  }else{
   const symbols=f.key==='p202'?locations:names,max=f.profile?.length||f.partitions?.length||3;
   f.pairs.forEach(([a,b],i)=>{const y=panelY+22+i*49,visible=i<(f.revealPairs??0),support=f.mode==='classes'?f.counts?.[a]?.[b]:f.support?.[a]?.[b],r=f.relation?.[a]?.[b],share=support===undefined?(r?1:0):support/max;
    s+=txt(small?42:128,y+17,`${symbols[a]} 对 ${symbols[b]}`,small?12:16,C.ink)+rect(small?79:190,y,small?134:315,20,C.soft,`pair-track-${i}`);
    if(visible)s+=rect(small?79:190,y,(small?134:315)*share,20,C.green,`pair-support-${i}`);
    const right=visible?(f.mode==='classes'?(support===undefined?(r?'全同意 同类':'未全同意'): `${support}/${max} ${r?'同类':'不同类'}`):`${support}:${max-support} ${r?symbols[a]+'胜':symbols[b]+'胜'}`):'待比较';
    s+=txt(small?262:588,y+15,right,small?11:15,r?C.green:C.muted);
   });
   const conclusion=f.revealPairs===3?(f.mode==='classes'?(f.transitive?'分类关系传递':'同类关系不传递'):(f.transitive?'社会关系传递':'多数形成循环')):'按同一组人逐对比较';
   s+=txt(W/2,panelY+163,conclusion,small?13:17,f.transitive===false?C.red:C.ink);
  }
  s+=txt(W/2,H-12,f.mode==='rankings'?'只有个人排序':f.mode==='scores'?'本站三首歌的简化计分':f.key==='p202'&&!f.sourceDomain?'已撤去单峰输入限制':'同一组人的逐步计算',small?11:14,C.muted);
  return s+'</svg>';
 }
 function draw(){
  const c=socialPreferencesContent[key],f=socialPreferencesFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;
  if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;
  if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与数值来源');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.scenes[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent=f.label+'。每张卡始终对应同一个人；绿色表示当前已计入的票数或分数。';
  const metrics=f.mode==='scores'?[['已计入歌单',`${f.counted}/3`],['a、b、c得分',f.scores.join('、')]]:f.mode==='binary'?[['支持a',`${f.k}/${f.n}`],['支持b',`${f.n-f.k}/${f.n}`]]:f.mode==='rankings'?[['个人排序卡',`${f.revealPeople}/3`],['社会排序','尚未定义']]:[['当前输入域',f.key==='p202'?(f.sourceDomain?'单峰':'已撤去限制'):f.mode==='classes'?'合法个人分类':'原书三人排序'],['结果',f.revealPairs===3?(f.transitive?'传递':'不传递'):'逐步揭晓']];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>严谨检验与计算路线</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch20-social-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=socialPreferencesKeys.includes(next)?next:'ordinal';window.SOCIAL_PREFERENCES_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='正文或章末题';const select=document.createElement('select');select.id='experiment';for(const k of socialPreferencesKeys){const option=document.createElement('option');option.value=k;option.textContent=socialPreferencesContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();return advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startSocialPreferencesStory=startSocialPreferencesStory;

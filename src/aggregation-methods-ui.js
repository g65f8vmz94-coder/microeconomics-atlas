import {aggregationMethodsContent,aggregationMethodsKeys} from './aggregation-methods-content.mjs';
import {aggregationMethodsFrame} from './aggregation-methods-story.mjs';
export function startAggregationMethodsStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',gold:'#a47a26',red:'#b95845',paper:'#fffdf7',soft:'#eef4ed'};
 const rect=(x,y,w,h,fill,id,rx=7)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${h}" rx="${rx}" fill="${fill}" data-motion="${esc(id)}"/>`;
 const txt=(x,y,v,size=14,color=C.ink,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const names=['a','b','c'];let key=aggregationMethodsKeys.includes(requested)?requested:aggregationMethodsKeys.includes(window.AGGREGATION_METHODS_DEFAULT)?window.AGGREGATION_METHODS_DEFAULT:'society',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function chart(f,small){
  const W=small?320:760,H=380,margin=small?12:45,cardW=small?91:205,gap=small?10:25,baseY=137,panelX=small?10:45,panelW=small?300:670;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">`+rect(0,0,W,H,C.soft,'aggregation-methods-background',14);
  for(let i=0;i<3;i++){
   const x=margin+i*(cardW+gap),visible=i<(f.revealPeople??3);s+=rect(x,16,cardW,102,C.paper,`aggregation-person-${i}`)+txt(x+cardW/2,36,`${i+1}号`,small?12:14,C.muted);
   if(!visible){s+=txt(x+cardW/2,78,'待加入',small?13:16,C.muted);continue;}
   if(f.mode==='decision')s+=txt(x+cardW/2,78,`首选 ${names[f.choices[i]]}`,small?17:22,C.green);
   else {const r=f.profile[i];r.forEach((v,j)=>s+=txt(x+cardW*(j+.5)/3,80,names[v],small?18:21,j===0?C.green:C.ink));s+=txt(x+cardW/2,100,'第1    第2    第3',small?10:12,C.muted);}
  }
  s+=rect(panelX,baseY,panelW,218,C.paper,'aggregation-result',12);
  if(f.mode==='rankings'){
   s+=txt(W/2,baseY+58,'N：1号、2号、3号',small?16:21,C.green)+txt(W/2,baseY+108,'X：a、b、c',small?18:23,C.ink)+txt(W/2,baseY+164,'个人档案 ≠ 社会结论',small?15:20,C.gold);
  }else if(f.mode==='scores'){
   const x0=small?77:190,bw=small?145:340,max=f.key==='favorites'||f.key==='paf'?3:6;
   names.forEach((n,i)=>{const y=baseY+34+i*51,v=f.scores[i];s+=txt(small?42:130,y+16,n,small?17:20,C.ink)+rect(x0,y,bw,23,C.soft,`aggregation-score-track-${i}`)+rect(x0,y,bw*v/max,23,C.green,`aggregation-score-${i}`)+txt(x0+bw+27,y+16,String(v),small?14:18,C.ink);});
   s+=txt(W/2,baseY+201,f.showResult?'按当前规则比较总分；同分并列':'先交档案并宣布规则',small?12:17,C.muted);
  }else if(f.mode==='pairwise'){
   const pairs=[[0,1],[1,2],[2,0]],x0=small?82:190,bw=small?128:315;
   pairs.forEach(([a,b],i)=>{const y=baseY+25+i*47,visible=i<f.revealPairs,v=f.counts[a][b];s+=txt(small?40:125,y+16,`${names[a]} 对 ${names[b]}`,small?12:16,C.ink)+rect(x0,y,bw,21,C.soft,`aggregation-pair-track-${i}`);if(visible)s+=rect(x0,y,bw*v/3,21,C.green,`aggregation-pair-support-${i}`);s+=txt(small?264:585,y+15,visible?`${v}: ${3-v}  ${v>1?names[a]:names[b]}胜`:'待比较',small?12:15,visible?C.green:C.muted);});
   s+=txt(W/2,baseY+190,`胜场分：a ${f.scores[0]}  ·  b ${f.scores[1]}  ·  c ${f.scores[2]}`,small?12:17,C.ink);
  }else if(f.mode==='rank-output'){
   const order=[0,1,2].sort((a,b)=>f.score[b]-f.score[a]);s+=txt(W/2,baseY+50,f.key==='external'?'固定外部榜':'固定听1号',small?16:22,C.green);
   s+=txt(W/2,baseY+113,f.showResult?order.map(i=>names[i]).join('  ≻  '):'社会结果待揭晓',small?24:32,C.ink);
   s+=txt(W/2,baseY+168,f.key==='external'?'个人换票，外部榜不变':'其他人改口无效，1号改口会改变社会榜',small?12:17,C.muted);
  }else{
   s+=txt(W/2,baseY+48,f.key==='p203a'?'两套规则各选一个方案':f.key==='p203b'?'规则：永远选a':'规则：固定听2号',small?16:22,C.green);
   const result=f.key==='p203a'&&f.otherResults?`听1号：${names[f.otherResults[0]]}   听3号：${names[f.otherResults[1]]}`:`选 ${names[f.result]}`;
   s+=txt(W/2,baseY+114,f.showResult?result:'等待宣布规则',small?20:28,f.key==='p203b'&&step>=2?C.red:C.ink);
   s+=txt(W/2,baseY+175,f.key==='p203a'?'方案改名后，输出也按同样方式改名':f.key==='p203b'&&f.choices.every(x=>x===1)?'全员选b，却仍输出a：违反一致同意':'输出单个方案，不是整份社会排序',small?11:16,C.muted);
  }
  s+=txt(W/2,H-9,f.label,small?11:14,C.muted);
  return s+'</svg>';
 }
 function draw(){const c=aggregationMethodsContent[key],f=aggregationMethodsFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;
  if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与数值来源');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.scenes[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent=f.label+'。上方每张卡始终对应同一个人，绿色展示本幕已计入的内容。';
  const metrics=f.mode==='decision'?[['输入类型','每人一个首选'],['输出',f.showResult?names[f.result]:'待揭晓']]:f.mode==='scores'?[['已计入',`${f.counted}/3`],['a、b、c',f.scores.join('、')]]:f.mode==='pairwise'?[['已比',`${f.revealPairs}/3`],['胜场分',f.scores.join('、')]]:[['输入','个人完整排序'],['输出',f.showResult?'社会完整偏好':'待揭晓']];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>解题步骤</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch20-method-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=aggregationMethodsKeys.includes(next)?next:'society';window.AGGREGATION_METHODS_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='正文或章末题';const select=document.createElement('select');select.id='experiment';for(const k of aggregationMethodsKeys){const option=document.createElement('option');option.value=k;option.textContent=aggregationMethodsContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();return advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startAggregationMethodsStory=startAggregationMethodsStory;

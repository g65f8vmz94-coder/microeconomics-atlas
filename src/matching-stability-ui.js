import {matchingStabilityContent,matchingStabilityKeys} from './matching-stability-content.mjs';
import {matchingStabilityFrame} from './matching-stability-story.mjs';
import {roomPrefs} from './matching-lab.mjs';

export function startMatchingStabilityStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',red:'#b25c4b',gold:'#a47a26',line:'#d4dfd4',paper:'#fffdf7',soft:'#eef4ed'};
 const T=(x,y,v,size=14,color=C.ink,weight=600)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const R=(x,y,w,h,fill,id,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" data-motion="${esc(id)}"/>`;
 let key=matchingStabilityKeys.includes(requested)?requested:matchingStabilityKeys.includes(window.MATCHING_STABILITY_DEFAULT)?window.MATCHING_STABILITY_DEFAULT:'d184',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 const pair=(m,kind)=>kind==='roommate'?m.map((v,i)=>i<v?`${i+1}–${v+1}`:null).filter(Boolean).join('、'):m.map((y,x)=>y<0?null:`${kind==='capacity'?'学生':'X'}${x+1}–${kind==='capacity'?'项目':key==='q184'?'B':'Y'}${y+1}`).filter(Boolean).join('、')||'尚未完成';
 function chart(f,small){
  const room=f.kind==='roommate',cap=f.kind==='capacity',xn=room?4:f.profile.X.length,yn=room?4:f.profile.Y.length,W=small?320:760,H=cap?460:380,left=small?57:150,right=small?263:610,r=small?21:23;
  const points=(n,top,bottom)=>Array.from({length:n},(_,i)=>n===1?(top+bottom)/2:top+(bottom-top)*i/(n-1));
  const xys=room?[]:points(xn,cap?60:89,cap?365:273),yys=room?[]:points(yn,cap?118:89,cap?316:273);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">`+R(0,0,W,H,C.soft,'stability-backdrop',14);
  if(room){const centers=small?[[68,102],[250,102],[68,274],[250,274]]:[[190,102],[570,102],[190,274],[570,274]];
   const line=(a,b,color,width,dash,id)=>`<path d="M${centers[a][0]} ${centers[a][1]} L${centers[b][0]} ${centers[b][1]}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="6 5"':''} data-motion="${esc(id)}"/>`;
   f.matching.forEach((j,i)=>{if(i<j)s+=line(i,j,C.green,5,false,`room-pair-${i}-${j}`);});if(f.focus)s+=line(f.focus[0],f.focus[1],C.red,3,true,`room-blocker-${f.focus.join('-')}`);
   centers.forEach(([x,y],i)=>{s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${C.paper}" stroke="${C.line}" stroke-width="2" data-motion="room-person-${i}"/>`+T(x,y+5,String(i+1),small?14:17);});
  }else{
   const line=(x,y,color,width,dash,id)=>`<path d="M${left+r+3} ${xys[x]} L${right-r-3} ${yys[y]}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="7 5"':''} data-motion="${esc(id)}"/>`;
   f.matching.forEach((y,x)=>{if(y>=0)s+=line(x,y,C.green,4,false,`stability-pair-${x}-${y}`);});
   if(f.focus)s+=line(f.focus[0],f.focus[1],C.red,3,true,`stability-blocker-${f.focus.join('-')}`);
   s+=T(left,31,cap?'学生':key==='q184'?'A 方':'X 方',small?13:17,C.green)+T(right,31,cap?'项目':key==='q184'?'B 方':'Y 方',small?13:17,C.gold);
   xys.forEach((y,i)=>{s+=`<circle cx="${left}" cy="${y}" r="${r}" fill="${C.paper}" stroke="${C.line}" stroke-width="2" data-motion="stability-x-${i}"/>`+T(left,y+5,(cap?'S':key==='q184'?'A':'X')+(i+1),small?13:16);});
   yys.forEach((y,i)=>{s+=`<circle cx="${right}" cy="${y}" r="${r}" fill="${C.paper}" stroke="${C.line}" stroke-width="2" data-motion="stability-y-${i}"/>`+T(right,y+5,(cap?'P':key==='q184'?'B':'Y')+(i+1),small?13:16);});
  }
  const barY=H-48;s+=R(small?13:28,barY,small?294:704,39,C.paper,'stability-result')+T(W/2,barY+25,f.complete?`阻挡对 ${f.blocking.length} 组 · ${f.identity}`:`尚未配齐 · ${f.identity}`,small?11:15,C.ink);return s+'</svg>';
 }
 const pref=(p,letter)=>p.map(i=>letter+(i+1)).join(' ≻ ');
 function preferences(f){if(f.kind==='roommate')return '<p class="reading"><strong>本站构造的室友偏好：</strong></p><div class="matching-preferences">'+roomPrefs.map((p,i)=>`<div>${i+1}：${esc(p.map(j=>j+1).join(' ≻ '))}</div>`).join('')+'</div>';
  const xLetter=f.kind==='capacity'?'P':key==='q184'?'B':'Y',yLetter=f.kind==='capacity'?'S':key==='q184'?'A':'X',xName=f.kind==='capacity'?'学生':key==='q184'?'A':'X',yName=f.kind==='capacity'?'项目':key==='q184'?'B':'Y';
  let h='<p class="reading"><strong>这段动画使用的完整偏好排序：</strong></p><div class="matching-preferences">'+f.profile.X.map((p,i)=>`<div>${xName}${i+1}：${esc(pref(p,xLetter))}</div>`).join('')+f.profile.Y.map((p,i)=>`<div>${yName}${i+1}：${esc(pref(p,yLetter))}</div>`).join('')+'</div>';
  if(key==='q186')h+='<p class="boundary"><strong>Y1真实排序：</strong>X2 ≻ X1 ≻ X3；<strong>改变报告时：</strong>X2 ≻ X3 ≻ X1。比较收益时只看真实排序。</p>';return h;
 }
 function draw(){const c=matchingStabilityContent[key],f=matchingStabilityFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('matching-stability-brief');if(!brief){brief=document.createElement('section');brief.id='matching-stability-brief';brief.setAttribute('aria-label','题目条件与偏好排序');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p>'+preferences(f)+'<p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.scenes[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent=f.kind==='roommate'?'绿线是现有室友分组；红虚线是双方都想另组一对的阻挡对。':`绿线是现有${f.kind==='capacity'?'学生—项目':'两侧'}配对；红虚线是图中重点看的阻挡对。下方数字为当前全部阻挡对数量。`;
  const blocker=f.complete?(f.blocking.map(([x,y])=>f.kind==='roommate'?`${x+1}–${y+1}`:`${f.kind==='capacity'?'学生':key==='q184'?'A':'X'}${x+1}–${f.kind==='capacity'?'项目':key==='q184'?'B':'Y'}${y+1}`).join('、')||'无'):'配对尚未完成';
  const current=f.kind==='capacity'?`${f.matching.filter(y=>y>=0).length}/6 名学生已获配；项目人数 ${[0,1,2].map(p=>f.matching.filter(y=>y===p).length).join('、')}`:pair(f.matching,f.kind);
  const metrics=[['当前配对',current],['阻挡对',blocker],['学习提示',!f.complete?'先配齐，再检验稳定':f.blocking.length?'检查双方是否都更喜欢彼此':'当前完整配对没有阻挡对']];if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>严谨检验与计算路线</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch18-stability-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=matchingStabilityKeys.includes(next)?next:'d184';window.MATCHING_STABILITY_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点或题目';const select=document.createElement('select');select.id='experiment';for(const k of matchingStabilityKeys){const option=document.createElement('option');option.value=k;option.textContent=matchingStabilityContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startMatchingStabilityStory=startMatchingStabilityStory;

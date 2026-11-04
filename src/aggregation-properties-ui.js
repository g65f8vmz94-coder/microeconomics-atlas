import {aggregationPropertiesContent,aggregationPropertiesKeys} from './aggregation-properties-content.mjs';
import {aggregationPropertiesFrame} from './aggregation-properties-story.mjs';
export function startAggregationPropertiesStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',gold:'#a47a26',red:'#b95845',purple:'#715b8f',paper:'#fffdf7',soft:'#eef4ed'};
 const rect=(x,y,w,h,fill,id,rx=7)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${h}" rx="${rx}" fill="${fill}" data-motion="${esc(id)}"/>`;
 const txt=(x,y,v,size=14,color=C.ink,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const names=['a','b','c'],rank=score=>{const order=score.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]),groups=[];for(const [v,i] of order){if(!groups.length||groups.at(-1).score!==v)groups.push({score:v,names:[names[i]]});else groups.at(-1).names.push(names[i]);}return groups.map(g=>g.names.join('＝')).join('  ＞  ');};
 let key=aggregationPropertiesKeys.includes(requested)?requested:aggregationPropertiesKeys.includes(window.AGGREGATION_PROPERTIES_DEFAULT)?window.AGGREGATION_PROPERTIES_DEFAULT:'fig201',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function chart(f,small){
  const W=small?320:760,tournament=f.mode==='tournament',top=tournament?206:137,H=tournament?485:382,cardW=tournament?(small?140:318):(small?91:205),gap=tournament?(small?14:18):(small?10:25),margin=small?12:45,panelX=small?10:45,panelW=small?300:670;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">`+rect(0,0,W,H,C.soft,'aggregation-properties-background',14);
  const count=tournament?4:3;
  for(let i=0;i<count;i++){
   const col=tournament?i%2:i,row=tournament?Math.floor(i/2):0,x=margin+col*(cardW+gap),y=14+row*89;
   const personLabel=f.key==='p205b'&&f.active&&i<2?`新${i+1}号（原${2-i}号）`:`${i+1}号`;
   s+=rect(x,y,cardW,tournament?76:105,C.paper,`property-card-${i}`)+txt(x+cardW/2,y+21,personLabel,small?11:14,C.muted);
   if(tournament){s+=txt(x+cardW/2,y+51,`赢 ${f.wins[i]} 场`,small?16:19,C.green);continue;}
   if(f.mode==='binary'||f.mode==='decision'){const n=f.mode==='binary'?(f.votes[i]?'a':'b'):names[f.choices[i]];s+=txt(x+cardW/2,y+68,`首选 ${n}`,small?16:20,f.mode==='binary'&&n==='b'?C.gold:C.green);}
   else {f.profile[i].forEach((v,j)=>s+=txt(x+cardW*(j+.5)/3,y+65,names[v],small?18:21,j===0?C.green:C.ink));s+=txt(x+cardW/2,y+88,'第1    第2    第3',small?10:12,C.muted);}
  }
  s+=rect(panelX,top,panelW,tournament?253:219,C.paper,'aggregation-properties-result',12);
  if(f.mode==='ranking'){
   const bw=small?139:346,x0=small?77:190,max=Math.max(...f.beforeScores,...f.afterScores,1);
   names.forEach((n,i)=>{const y=top+32+i*49,v=f.scores[i];s+=txt(small?43:125,y+17,n,small?17:20,C.ink)+rect(x0,y,bw,22,C.soft,`property-track-${i}`)+rect(x0,y,bw*v/max,22,i===f.focus[0]?C.green:C.purple,`property-score-${i}`)+txt(x0+bw+29,y+17,String(v),small?14:18,C.ink);});
   s+=txt(W/2,top+183,rank(f.scores),small?14:18,C.ink);
   if(f.key==='d207')s+=txt(W/2,top+207,f.active?'只看a对b：旧a胜b → 新b胜a':'只看a对b：左档案a胜b',small?11:16,C.green);
  }else if(f.mode==='binary'){
   const a=f.votes.filter(Boolean).length,b=f.votes.length-a,x0=small?76:190,bw=small?145:340;
   for(const [i,n,v] of [[0,'a',a],[1,'b',b]]){const y=top+42+i*62;s+=txt(small?43:126,y+16,n,small?17:20,C.ink)+rect(x0,y,bw,23,C.soft,`property-vote-track-${n}`)+rect(x0,y,bw*v/3,23,i?C.gold:C.green,`property-vote-${n}`)+txt(x0+bw+25,y+17,`${v}票`,small?12:16,C.ink);}
   s+=txt(W/2,top+184,f.sign>0?'社会：a胜b':f.sign<0?'社会：b胜a':'社会：a与b并列',small?15:21,f.key==='p201c'?C.red:C.ink);
  }else if(f.mode==='decision'){
   s+=txt(W/2,top+62,'只问：哪些人支持a？',small?17:22,C.green)+txt(W/2,top+119,`输出 ${names[f.selected]}`,small?23:30,C.ink)+txt(W/2,top+174,f.active?'a的支持者不变，输出却改变':'下一幕只改不支持a的人的票',small?12:17,C.muted);
  }else{
   const x0=small?85:190,bw=small?128:333;
   f.score.forEach((v,i)=>{const y=top+24+i*49;s+=txt(small?47:129,y+16,`${i+1}号`,small?13:17,C.ink)+rect(x0,y,bw,20,C.soft,`property-tournament-track-${i}`)+rect(x0,y,bw*v/f.scale,20,f.focus.includes(i)?(i===f.focus[0]?C.green:C.purple):C.gold,`property-tournament-score-${i}`)+txt(x0+bw+31,y+15,String(Number(v.toFixed(2))),small?12:16,C.ink);});
   const focus=f.key==='p205d'?(f.active?'旧1、2并列 → 新2领先1':'旧1号与2号并列'):f.key==='p205a'?(f.active?'旧1、2并列 → 新1领先2':'旧1号与2号并列'):f.key==='p205c'?'赢一场后仍全部并列':f.key==='p205b'?(f.active?'原1号：由落后原2号变领先':'原1号原本落后原2号'):'';
   if(focus)s+=txt(W/2,top+219,focus,small?11:15,C.green);
   s+=txt(W/2,top+241,f.rule==='all-tied'?'全员始终并列':`固定刻度：0 至 ${Number(f.scale.toFixed(2))}`,small?11:15,C.muted);
  }
  s+=txt(W/2,H-10,f.active?'变化后 · '+f.change:'变化前 · 同一规则与对象',small?11:14,C.muted);
  return s+'</svg>';
 }
 function draw(){const c=aggregationPropertiesContent[key],f=aggregationPropertiesFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;
  if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与数值来源');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.scenes[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent=f.label+(key==='p205b'?'。换名后编号行跟着新名字变化；卡片注明原选手身份，须按真实身份对齐比较。':'。对象位置和颜色在前后画面保持一致；绿色与紫色表示当前比较对象。');
  const ruleLabels={wins:'只数胜场','label-bias':'胜场加姓名奖励','all-tied':'始终并列',quality:'胜场加对手胜场'};
  const metrics=f.mode==='ranking'?[['规则',f.rule==='plurality'?'只数首位':'名次计分'],['a、b、c',f.scores.join('、')]]:f.mode==='binary'?[['a票',f.votes.filter(Boolean).length],['b票',f.votes.filter(v=>!v).length]]:f.mode==='decision'?[['a的支持者',f.choices.map((v,i)=>v===0?i+1:null).filter(Boolean).join('、')||'无人'],['输出',names[f.selected]]]:[['当前分数',f.score.map(x=>Number(x.toFixed(2))).join('、')],['规则',ruleLabels[f.rule]]];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>严谨检验与计算路线</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch20-property-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=aggregationPropertiesKeys.includes(next)?next:'fig201';window.AGGREGATION_PROPERTIES_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='正文或章末题';const select=document.createElement('select');select.id='experiment';for(const k of aggregationPropertiesKeys){const option=document.createElement('option');option.value=k;option.textContent=aggregationPropertiesContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();return advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startAggregationPropertiesStory=startAggregationPropertiesStory;

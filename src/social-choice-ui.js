import {socialChoiceContent,socialChoiceKeys} from './social-choice-content.mjs';
import {socialChoiceFrame,socialChoiceAudit} from './social-choice-story.mjs';
export function startSocialChoiceStory(requested){
 const $=id=>document.getElementById(id),names=['a','b','c'],C={ink:'#263f37',muted:'#64796f',green:'#177468',gold:'#aa7c28',purple:'#715b8f',paper:'#fffdf7',soft:'#eef4ed',red:'#b95845'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rect=(x,y,w,h,fill,id,rx=9)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" data-motion="'+esc(id)+'"/>';
 const txt=(x,y,v,size=14,color=C.ink,weight=600,anchor='middle')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="'+size+'" font-family="system-ui,sans-serif" font-weight="'+weight+'">'+esc(v)+'</text>';
 const url=new URLSearchParams(location.search);let key=socialChoiceKeys.includes(requested)?requested:socialChoiceKeys.includes(window.SOCIAL_CHOICE_DEFAULT)?window.SOCIAL_CHOICE_DEFAULT:'d208',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 const orderText=row=>row.map(x=>names[x]).join(' ＞ ');
 function rankChart(f,small){
  const W=small?320:760,H=small?361:385,cardW=small?91:205,margin=small?13:55,gap=small?10:18;
  let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(f.scene[1])+'">'+rect(0,0,W,H,C.soft,'choice-background',14);
  for(let i=0;i<3;i++){const x=margin+i*(cardW+gap),y=16,row=f.profile[i],trueRow=f.trueProfile?.[i];
   s+=rect(x,y,cardW,141,C.paper,'choice-card-'+i,9)+txt(x+cardW/2,y+23,(i+1)+'号'+(i===0&&f.reportChanged?' · 改报':''),small?12:16,i===0&&f.reportChanged?C.red:C.muted);
   row.forEach((v,k)=>{const yy=y+58+k*28;s+=rect(x+7,yy-19,cardW-14,24,k===0?'#ddede2':'#f5f6f1','choice-rank-'+i+'-'+v,5)+txt(x+cardW/2,yy,names[v]+' · 第'+(k+1)+'名',small?11:16,k===0?C.green:C.ink);});
   if(trueRow&&i===0)s+=txt(x+cardW/2,y+133,'真心 '+orderText(trueRow),small?9:12,C.red);
  }
  const y=176,panelX=small?12:55,panelW=small?296:650;
  s+=rect(panelX,y,panelW,150,C.paper,'choice-result',10)+txt(W/2,y+31,f.mode==='proof'?'示意：固定2号首选':f.mode==='manipulation'?'首位票 · 同票先选a':'只选一个方案',small?13:18,C.muted);
  for(let i=0;i<3;i++){const x=small?61+i*99:176+i*200;s+=rect(x-31,y+48,62,58,i===f.outcome?'#ddede2':'#f1f2ed','choice-option-'+i,8)+txt(x,y+85,names[i],small?24:30,i===f.outcome?C.green:C.muted,750);}
  s+=txt(W/2,y+132,f.mode==='manipulation'?'真心比较：b ＞ a；'+(f.reportChanged?'改报后选b':'诚实选a'):'本幕选中 '+names[f.outcome],small?11:16,f.mode==='manipulation'?C.red:C.green);
  s+=txt(W/2,H-14,f.mode==='proof'?'图中2号只是满足前提的一条例子；一般结论见证明':f.mode==='manipulation'?'只改1号报告，其他人的真实卡始终不动':'三张完整个人排序 → 一个社会选择',small?10:14,C.muted);
  return s+'</svg>';
 }
 function binaryChart(f,small){
  const W=small?320:760,H=small?343:358,cardW=small?91:205,margin=small?13:55,gap=small?10:18;let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(f.scene[1])+'">'+rect(0,0,W,H,C.soft,'choice-binary-background',14);
  f.choices.forEach((v,i)=>{const x=margin+i*(cardW+gap);s+=rect(x,16,cardW,100,C.paper,'choice-binary-card-'+i)+txt(x+cardW/2,42,(i+1)+'号',small?13:17,C.muted)+txt(x+cardW/2,82,'首选 '+names[v],small?20:25,v===0?C.green:C.purple);});
  s+=rect(small?12:55,135,small?296:650,160,C.paper,'choice-binary-result');for(const [i,n,v] of [[0,'a',f.votesA],[1,'b',f.votesB]]){const y=168+i*58,bw=small?164:410,x=small?75:170;s+=txt(small?43:124,y+17,n,small?18:23)+rect(x,y,bw,22,C.soft,'choice-binary-track-'+n)+rect(x,y,bw*v/3,22,i?C.purple:C.green,'choice-binary-votes-'+n)+txt(x+bw+20,y+16,v+'票',small?11:16,C.ink);}
  s+=txt(W/2,278,'严格多数选 '+names[f.outcome],small?16:20,C.green);s+=txt(W/2,H-12,'两方案、奇数人：不会打平',small?11:15,C.muted);return s+'</svg>';
 }
 function medianChart(f,small){
  const W=small?320:760,H=small?350:370,x0=small?36:85,x1=small?284:675,y=184,X=v=>x0+(x1-x0)*v;let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(f.scene[1])+'">'+rect(0,0,W,H,C.soft,'choice-median-background',14);
  s+=txt(W/2,31,'五位邻居希望摊位的位置',small?16:23,C.ink)+rect(small?15:55,45,small?290:650,63,C.paper,'choice-median-cards');
  const vals=[...f.others,f.report].sort((a,b)=>a-b);vals.forEach((v,i)=>{const xx=small?31+i*52:135+i*106,ww=small?44:73;s+=rect(xx,59,ww,35,C.soft,'choice-median-sorted-'+i,6)+txt(xx+ww/2,82,v.toFixed(1),small?14:19,C.muted);});
  s+='<path d="M'+x0+' '+y+'H'+x1+'" stroke="'+C.muted+'" stroke-width="3"/>';
  for(const tick of [0,.1,.3,.5,.6,.9,1]){s+='<path d="M'+X(tick)+' '+(y-6)+'V'+(y+6)+'" stroke="'+C.muted+'"/>'+txt(X(tick),y+27,tick.toFixed(1),small?10:14,C.muted);}
  s+=rect(X(f.lower),y-12,X(f.upper)-X(f.lower),24,'#ddede2','choice-median-reachable',4);
  for(const [id,v,color,label,dy] of [['true',f.truePeak,C.gold,'真峰值',-33],['report',f.report,C.purple,'本次报告',-59],['outcome',f.outcome,C.green,'中位数',53]]){s+='<circle cx="'+X(v)+'" cy="'+y+'" r="'+(id==='outcome'?9:6)+'" fill="'+color+'" data-motion="choice-median-'+id+'"/>'+txt(X(v),y+dy,label+' '+v.toFixed(1),small?10:13,color);}
  s+=rect(small?15:55,269,small?290:650,56,C.paper,'choice-median-conclusion')+txt(W/2,302,'真报 '+f.truth.toFixed(1)+' → 当前 '+f.outcome.toFixed(1)+'；真心评价：'+(f.gain>1e-9?'更好':f.gain< -1e-9?'更差':'一样好'),small?11:17,f.gain<0?C.red:C.green);
  s+=txt(W/2,H-12,'固定别人：结果是把本人报告夹进 [0.3, 0.6]',small?10:14,C.muted);return s+'</svg>';
 }
 function draw(){
  const c=socialChoiceContent[key],f=socialChoiceFrame(key,step),audit=socialChoiceAudit(),plot=$('plot'),small=plot?.clientWidth<500;
  if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent='第 '+(step+1)+' 幕（共6幕） · '+f.scene[0];if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.scene[1];if($('film-phase'))$('film-phase').textContent=f.scene[0];
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与来源');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.scene[0],filmNarration:f.scene[1],filmConclusion:c.scenes[5][1]});const svg=f.mode==='median'?medianChart(f,small):f.mode==='binary'?binaryChart(f,small):rankChart(f,small);if(window.microMotion?.chart)window.microMotion.chart(plot,svg);else plot.innerHTML=svg;}
  if($('legend'))$('legend').textContent=f.mode==='median'?'金色真峰值、紫色本人本次报告、绿色实际中位数；位置刻度始终固定。':'三张个人卡和方案名字在前后幕保持身份一致；社会只选一个结果。';
  const metrics=f.mode==='median'?[['真峰值',f.truePeak],['本次报告',f.report],['实际中位数',f.outcome]]:f.mode==='binary'?[['a票',f.votesA],['b票',f.votesB],['获选方案',names[f.outcome]]]:[['当前获选',names[f.outcome]],['示意规则',f.rule==='dictator'?'固定2号首选':f.rule==='plurality'?'只数首位票':f.rule||'首位票'],['三人模型输入数',audit.profiles]];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');
  if($('reading'))$('reading').textContent=f.scene[1];if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>证明与计算</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch20-choice-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}
  window.microMath?.refresh?.();
 }
 function configure(next){stop();key=socialChoiceKeys.includes(next)?next:'d208';window.SOCIAL_CHOICE_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='定义、定理或习题';const select=document.createElement('select');select.id='experiment';for(const k of socialChoiceKeys){const option=document.createElement('option');option.value=k;option.textContent=socialChoiceContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance')){$('advance').textContent='下一幕';$('advance').onclick=()=>{stop();return advance();};}if($('reset')){$('reset').textContent='从头重播';$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};}
 if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},2100);$('play').textContent='暂停播放';};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startSocialChoiceStory=startSocialChoiceStory;

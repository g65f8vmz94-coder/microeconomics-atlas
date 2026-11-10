import {strategicFoundationsContent,strategicFoundationsKeys} from './strategic-foundations-content.mjs';
import {strategicFoundationsStory} from './strategic-foundations-story.mjs';

export function startStrategicFoundationsStory(requested){
 const $=id=>document.getElementById(id);
 const C={ink:'#263f37',muted:'#6f8077',green:'#177468',purple:'#74618d',red:'#bd624c',gold:'#b18429',rule:'#d7e0d5',paper:'#fffdf7',soft:'#f3f6f1'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(name,attrs,body)=>'<'+name+Object.entries(attrs).map(([k,v])=>' '+k+'="'+esc(v)+'"').join('')+'>'+(body||'')+'</'+name+'>';
 const txt=(x,y,value,size,color,anchor,weight)=>tag('text',{x,y,fill:color||C.ink,'text-anchor':anchor||'start','font-family':'system-ui,sans-serif','font-size':size||12,'font-weight':weight||500},esc(value));
 const box=(x,y,w,h,fill,stroke,id,rx)=>tag('rect',{x,y,width:w,height:h,rx:rx||0,fill,stroke:stroke||'none','stroke-width':stroke?2:0,'data-motion':id||''},'');
 const path=(d,color,width,marker,dash)=>tag('path',{d,fill:'none',stroke:color,'stroke-width':width||2,'stroke-dasharray':dash||'', 'marker-end':marker?'url(#arrowhead)':''},'');
 const q=new URLSearchParams(location.search);
 let key=strategicFoundationsKeys.includes(requested)?requested:strategicFoundationsKeys.includes(window.STRATEGIC_FOUNDATIONS_DEFAULT)?window.STRATEGIC_FOUNDATIONS_DEFAULT:strategicFoundationsKeys.includes(q.get('case'))?q.get('case'):strategicFoundationsKeys[0],step=0,timer=null;
 function stop(){if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';}
 function chart(f,small){
  const W=small?280:760,H=small?445:445,L=small?62:165,T=small?99:103,cw=small?96:214,ch=small?105:114;
  const coord=(i,j)=>[L+j*cw+cw/2,T+i*ch+ch/2];
  const cell=(i,j)=>[L+j*cw,T+i*ch];
  let s=tag('defs',{},tag('marker',{id:'arrowhead',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},path('M0 0L10 5L0 10',C.red,2,false)));
  s+=txt(W/2,27,f.identity,small?11:19,C.ink,'middle',760);
  s+=txt(L+cw,60,small?'李叔选':'李叔（列）选',small?11:15,C.purple,'middle',730);
  s+=txt(small?4:27,T-16,small?'王选':'王阿姨（行）选',small?10:13,C.green,'start',720);
  for(let j=0;j<2;j++)s+=txt(L+(j+.5)*cw,T-13,f.game.col[j],small?11:14,C.ink,'middle',690);
  for(let i=0;i<2;i++)s+=txt(L-10,T+(i+.52)*ch,f.game.row[i],small?11:14,C.ink,'end',690);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){
   const [x,y]=cell(i,j),[cx,cy]=coord(i,j),selected=f.selected[0]===i&&f.selected[1]===j,shown=f.visibleCells>=4||i*2+j<f.visibleCells;
   const ne=f.showNE&&f.audit.ne.some(v=>v[0]===i&&v[1]===j);
   s+=box(x+2,y+2,cw-4,ch-4,selected?'#f8f2e4':ne?'#eaf3ed':C.paper,selected?C.gold:C.rule,'payoff-cell-'+i+'-'+j,small?8:12);
   if(shown){
    s+=txt(cx-13,cy+8,f.game.M[i][j][0],small?17:27,C.green,'middle',760);
    s+=txt(cx,cy+8,'/',small?14:20,C.muted,'middle',450);
    s+=txt(cx+15,cy+8,f.game.M[i][j][1],small?17:27,C.purple,'middle',760);
   }else s+=txt(cx,cy+7,'?',small?19:25,C.muted,'middle',500);
   if(f.showBR){
    if(f.audit.brRow[j].includes(i))s+=tag('circle',{cx:x+15,cy:y+15,r:small?4:6,fill:C.green,'data-motion':'br-row-'+i+'-'+j},'');
    if(f.audit.brCol[i].includes(j))s+=tag('circle',{cx:x+cw-15,cy:y+15,r:small?4:6,fill:C.purple,'data-motion':'br-col-'+i+'-'+j},'');
   }
   if(ne)s+=txt(cx,y+ch-14,'NE',small?10:13,C.green,'middle',750);
  }
  if(f.deviation){
   const d=f.deviation,[x1,y1]=coord(...d.from),[x2,y2]=coord(...d.to);
   const from=f.deviation.kind==='row'?[x1+cw*.32,y1]:f.deviation.kind==='col'?[x1,y1+ch*.32]:[x1+cw*.23,y1-ch*.18];
   const to=f.deviation.kind==='row'?[x2+cw*.32,y2]:f.deviation.kind==='col'?[x2,y2+ch*.32]:[x2+cw*.23,y2-ch*.18];
   s+=path('M'+from[0]+' '+from[1]+'L'+to[0]+' '+to[1],C.red,small?2.2:3,true,d.kind==='joint'?'5 4':'');
  }
  const panelY=small?333:355,panelH=small?100:76,u=f.audit.u,g=f.audit.gains;
  s+=box(11,panelY,W-22,panelH,C.soft,C.rule,'summary',12);
  const first=f.visibleCells===0?'先认行动，再揭晓收益':f.deviation?(f.deviation.kind==='joint'?'两人一起改':'只改'+(f.deviation.kind==='row'?'王阿姨':'李叔'))+'：收益变化 '+f.deviation.gains.join(' / '):'当前格收益 '+u.join(' / ');
  const second=f.showNE?'两色标记重合的格子是NE':f.showBR?'绿点：王最佳反应；紫点：李最佳反应':f.visibleCells===0?'先固定双方各自能选的时段':'固定另一人的行动，再比较自己的收益';
  s+=txt(22,panelY+32,first,small?10:15,C.ink,'start',730)+txt(22,panelY+58,second,small?9:12,C.muted,'start',630);
  if(!small)s+=txt(W-24,panelY+58,'王 / 李',11,C.muted,'end',600);
  return tag('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':f.identity+'。'+f.narration},box(0,0,W,H,C.paper,'','background')+s);
 }
 function controls(){
  if(!$('fields'))return;
  const field=document.createElement('div');field.className='field';
  const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点';
  const select=document.createElement('select');select.id='experiment';
  for(const k of strategicFoundationsKeys){const o=document.createElement('option');o.value=k;o.textContent=strategicFoundationsContent[k].title;select.append(o);}
  field.append(label,select);
  const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');
  $('fields').replaceChildren(field,progress);
  select.onchange=e=>{if(!strategicFoundationsKeys.includes(e.target.value))return;history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};
  if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';
 }
 function draw(){
  const f=strategicFoundationsStory(key,step),c=strategicFoundationsContent[key];
  if($('experiment'))$('experiment').value=key;
  if($('film-progress'))$('film-progress').textContent='第 '+(step+1)+' 幕（共6幕） · '+f.identity;
  let brief=$('strategic-brief');
  if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="strategic-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="strategic-conditions"></span></p><p class="boundary" id="strategic-source"></p>';$('legend')?.before(brief);}
  $('strategic-question').textContent=c.question;$('strategic-conditions').textContent=c.conditions;$('strategic-source').textContent=c.source;
  const plot=$('plot');if(plot){Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent='绿色数字与标记属于王阿姨；紫色属于李叔；金边是正在看的组合，红箭头标出本幕所讨论的改变。';
  const u=f.audit.u,g=f.audit.gains,metrics=[['王阿姨收益',f.visibleCells?u[0]:'待揭晓'],['李叔收益',f.visibleCells?u[1]:'待揭晓'],['王单改最多增益',f.visibleCells?g[0]:'待查'],['李单改最多增益',f.visibleCells?g[1]:'待查']];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>'<div class="metric"><label>'+esc(label)+'</label><strong>'+esc(value)+'</strong></div>').join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>证明与计算</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>{el.textContent=[c.question,c.conditions,c.template][i]||'';});
  const guideBoundary=document.querySelector('.study-guide>.boundary');if(guideBoundary)guideBoundary.textContent='摊主、收益数字、换刻度与并列最优表均为本站辅助讲解；原书定义与其静态、单人偏离边界按页码标明。';
  const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch15-foundations-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}
  window.microMath?.refresh?.();
 }
 function configure(next){stop();key=strategicFoundationsKeys.includes(next)?next:strategicFoundationsKeys[0];window.STRATEGIC_FOUNDATIONS_DEFAULT=key;const p=new URLSearchParams(location.search),wanted=Number(p.get('filmStep'));step=(p.get('case')===key||!p.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};
 controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>configure(key);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startStrategicFoundationsStory=startStrategicFoundationsStory;

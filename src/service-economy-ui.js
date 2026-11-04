import {serviceEconomyContent, serviceEconomyKeys} from './service-economy-content.mjs';
import {serviceEconomyStory} from './service-economy-story.mjs';

export function startServiceEconomyStory(requested) {
  const $ = id => document.getElementById(id);
  const C = {ink:'#263f37', muted:'#708177', green:'#177468', red:'#bd624c', purple:'#74618d', gold:'#b18429', blue:'#4b718f', rule:'#d7e0d5', paper:'#fffdf7', soft:'#f3f6f1', mint:'#e5efe9', rose:'#fff1ed', sky:'#edf4f6'};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (value, digits = 3) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)).toLocaleString('zh-CN', {maximumFractionDigits: digits}) : String(value);
  const text = (x,y,value,size=12,color=C.ink,anchor='start',weight=400) => `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
  const wrap = (value, limit=23, max=6) => { const rows=[]; for(let i=0;i<String(value).length;i+=limit) rows.push(String(value).slice(i,i+limit)); return rows.slice(0,max); };
  const lines = (x,y,value,size=11,color=C.ink,anchor='start',weight=400,limit=26,gap=19,max=6) => wrap(value,limit,max).map((row,i)=>text(x,y+i*gap,row,size,color,anchor,weight)).join('');
  const top = (frame,W,small) => text(W/2,24,frame.identity,small?12:18,C.ink,'middle',760)+text(W/2,47,frame.verdict,small?9:12,C.muted,'middle',650);
  const path = (fn,x0,x1,X,Y,n=90) => { let d=''; for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=fn(x);if(Number.isFinite(y))d+=`${d?'L':'M'}${X(x).toFixed(2)} ${Y(y).toFixed(2)}`;} return d; };
  const axes = (left,topY,right,bottom,xLabel,yLabel) => `<path d="M${left} ${topY}V${bottom}H${right}" fill="none" stroke="${C.muted}" stroke-width="1.4"/>`+text(left,topY-10,yLabel,10,C.muted,'start',650)+text(right,bottom+25,xLabel,10,C.muted,'end',650);

  const query = new URLSearchParams(location.search);
  let key = serviceEconomyKeys.includes(requested) ? requested : serviceEconomyKeys.includes(window.SERVICE_ECONOMY_DEFAULT) ? window.SERVICE_ECONOMY_DEFAULT : serviceEconomyKeys.includes(query.get('case')) ? query.get('case') : serviceEconomyKeys[0];
  let step = 0, timer = null;

  function stop(){ if(timer) clearInterval(timer); timer=null; if($('play')) $('play').textContent='播放整段'; }
  function controls(){
    if(!$('fields')) return;
    $('fields').innerHTML = `<div class="field"><label for="experiment">本节知识点或原题</label><select id="experiment">${serviceEconomyKeys.map(k=>`<option value="${k}">${esc(serviceEconomyContent[k].title)}</option>`).join('')}</select></div><p class="small" id="film-progress" aria-live="polite">第1幕（共6幕）</p>`;
    $('experiment').onchange = e => { if(!serviceEconomyKeys.includes(e.target.value)) return; history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value)); configure(e.target.value); };
    if($('advance')) $('advance').textContent='下一幕';
    if($('reset')) $('reset').textContent='从头重播';
  }

  function streetChart(frame,small){
    const W=small?320:760,H=small?650:500,left=small?24:62,right=W-(small?24:62),streetY=190,X=x=>left+(right-left)*x;
    const threshold=frame.kind==='consistency'?frame.cut:frame.eq;
    let s=top(frame,W,small);
    s+=`<rect x="${left-8}" y="78" width="${small?92:145}" height="64" rx="13" fill="${C.mint}" stroke="${C.green}"/>`+text(left+(small?38:64),103,'网点 0',small?11:15,C.green,'middle',760)+text(left+(small?38:64),126,`等待 ${fmt(frame.t0??frame.eqWait?.[0]??.6)}`,small?9:11,C.ink,'middle',650);
    s+=`<rect x="${right-(small?84:137)}" y="78" width="${small?92:145}" height="64" rx="13" fill="${C.sky}" stroke="${C.purple}"/>`+text(right-(small?38:64),103,'网点 1',small?11:15,C.purple,'middle',760)+text(right-(small?38:64),126,`等待 ${fmt(frame.t1??frame.eqWait?.[1]??.8)}`,small?9:11,C.ink,'middle',650);
    s+=`<path d="M${left} ${streetY}H${right}" stroke="${C.muted}" stroke-width="4" stroke-linecap="round"/>`;
    for(let i=0;i<=20;i++){const x=i/20,color=x<=threshold?C.green:C.purple;s+=`<circle data-motion="resident-${i}" cx="${X(x)}" cy="${streetY}" r="${small?4.2:5.5}" fill="${color}" stroke="${C.paper}"/>`;}
    s+=text(left,streetY+30,'0',10,C.muted,'middle')+text(right,streetY+30,'1',10,C.muted,'middle');
    const markerX=frame.kind==='consistency'?frame.z:frame.eq;
    s+=`<path data-motion="expected-cut" d="M${X(markerX)} ${streetY-30}V${streetY+32}" stroke="${C.gold}" stroke-width="2" stroke-dasharray="5 4"/>`+text(X(markerX),streetY+52,frame.kind==='consistency'?`预期分界 ${fmt(frame.z)}`:`均衡分界 ${fmt(frame.eq)}`,small?9:11,C.gold,'middle',700);
    if(frame.kind==='consistency'&&frame.step>=1)s+=`<path data-motion="actual-cut" d="M${X(frame.cut)} ${streetY-36}V${streetY+25}" stroke="${C.red}" stroke-width="2.6"/>`+text(X(frame.cut),streetY-46,`实际会选左到 ${fmt(frame.cut)}`,small?8:11,C.red,'middle',700);
    if(frame.kind==='sorting'){
      for(const [x,label] of [[frame.x,'居民x'],[frame.y,'更靠左的y']])s+=`<circle cx="${X(x)}" cy="${streetY}" r="${small?8:10}" fill="${C.gold}" stroke="${C.paper}" stroke-width="2"/>`+text(X(x),streetY-18,label,small?8:10,C.gold,'middle',750);
    }
    const panelY=small?285:270,panelH=small?325:205;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${panelH}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`;
    const leftBill=frame.kind==='sorting'?`x去左 ${fmt(frame.leftAtX)}；y去左 ${fmt(frame.leftAtY)}`:`左客流 ${fmt(frame.z??frame.eq)}；左等待 ${fmt(frame.t0??frame.eqWait?.[0])}`;
    const rightBill=frame.kind==='sorting'?`x去右 ${fmt(frame.rightAtX)}；y去右 ${fmt(frame.rightAtY)}`:`右客流 ${fmt(1-(frame.z??frame.eq))}；右等待 ${fmt(frame.t1??frame.eqWait?.[1])}`;
    s+=text(24,panelY+29,leftBill,small?9:12,C.green,'start',730)+text(24,panelY+55,rightBill,small?9:12,C.purple,'start',730)+lines(24,panelY+88,frame.narration,small?10:12,C.ink,'start',500,small?25:61,19,small?10:5);
    return {W,H,s};
  }

  function curveChart(frame,small){
    const W=small?320:760,H=small?680:510,left=small?40:70,right=W-(small?15:36),topY=84,bottom=small?390:350,X=x=>left+(right-left)*x,Y=y=>bottom-(bottom-topY)*y/3.2;
    const travel=frame.mode==='all'?frame.lambda:1,wait=frame.mode==='wait'?frame.lambda:frame.mode==='all'?frame.lambda:1;
    const leftFn=z=>travel*z+wait*frame.a*z,rightFn=z=>travel*(1-z)+wait*frame.b*(1-z);
    let s=top(frame,W,small)+axes(left,topY,right,bottom,'左网点客流 / 分界 z','边界居民总时间');
    if(frame.key==='p1a')s+=`<path d="${path(z=>(1+frame.oldA)*z,0,1,X,Y)}" fill="none" stroke="${C.muted}" stroke-width="2" stroke-dasharray="6 5"/>`;
    s+=`<path data-motion="left-time" d="${path(leftFn,0,1,X,Y)}" fill="none" stroke="${C.green}" stroke-width="3"/><path data-motion="right-time" d="${path(rightFn,0,1,X,Y)}" fill="none" stroke="${C.purple}" stroke-width="3"/>`;
    const eq=frame.newEq??frame.eq,y=leftFn(eq);
    s+=`<circle data-motion="equilibrium" cx="${X(eq)}" cy="${Y(y)}" r="8" fill="${C.red}" stroke="${C.paper}" stroke-width="2"/>`+text(X(eq),Y(y)-15,`z*=${fmt(eq)}`,small?9:11,C.red,'middle',760);
    if(frame.oldEq!==undefined&&Math.abs(frame.oldEq-eq)>.001)s+=`<circle cx="${X(frame.oldEq)}" cy="${Y(rightFn(frame.oldEq))}" r="6" fill="${C.gold}"/>`+text(X(frame.oldEq),Y(rightFn(frame.oldEq))+23,'旧交点',small?8:10,C.gold,'middle',700);
    if(frame.kind==='consistency'||frame.kind==='uniqueness'||frame.kind==='crossing')s+=`<path d="M${X(frame.z??frame.candidate)} ${bottom}V${Y(leftFn(frame.z??frame.candidate))}" stroke="${C.gold}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
    const panelY=small?430:375;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${small?220:110}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`+text(24,panelY+27,`左账单 ${fmt(leftFn(eq))}；右账单 ${fmt(rightFn(eq))}`,small?9:11,C.ink,'start',720)+lines(24,panelY+56,frame.narration,small?10:12,C.ink,'start',500,small?25:61,19,small?8:3);
    return {W,H,s};
  }

  function paretoChart(frame,small){
    const W=small?320:760,H=small?670:500,left=small?26:70,right=W-(small?26:70),X=x=>left+(right-left)*x,streetY=150;
    let s=top(frame,W,small)+`<path d="M${left} ${streetY}H${right}" stroke="${C.muted}" stroke-width="4"/>`;
    for(const [z,color,label,dy] of [[frame.eq,C.green,'均衡0.6',-26],[frame.next,C.red,`替代${fmt(frame.next)}`,36]])s+=`<path d="M${X(z)} ${streetY-28}V${streetY+28}" stroke="${color}" stroke-width="3"/>`+text(X(z),streetY+dy,label,small?8:11,color,'middle',740);
    s+=`<circle data-motion="witness" cx="${X(frame.witness)}" cy="${streetY}" r="9" fill="${C.gold}" stroke="${C.paper}" stroke-width="2"/>`+text(X(frame.witness),streetY-45,'被改派居民 x=0.61',small?8:11,C.gold,'middle',740);
    const barTop=small?250:230,base=small?410:370,max=1.35,Y=v=>base-(base-barTop)*v/max;
    for(const [i,v,label,color] of [[0,frame.oldLoss,'旧损失',C.green],[1,frame.newLoss,'新损失',C.red]]){const x=small?78+i*130:220+i*300;s+=`<rect x="${x}" y="${Y(v)}" width="${small?55:90}" height="${base-Y(v)}" rx="7" fill="${color}"/>`+text(x+(small?27:45),Y(v)-10,fmt(v),small?9:12,color,'middle',750)+text(x+(small?27:45),base+25,label,small?9:11,C.ink,'middle',650);}
    const panelY=small?450:400;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${small?190:75}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`+lines(24,panelY+31,frame.narration,small?10:12,C.ink,'start',500,small?25:61,19,small?8:3);
    return {W,H,s};
  }

  function socialChart(frame,small){
    const W=small?320:760,H=small?670:500,left=small?42:70,right=W-(small?18:40),topY=84,bottom=small?380:345,X=z=>left+(right-left)*(z-.45)/.3,Y=t=>bottom-(bottom-topY)*(t-.92)/.08;
    let s=top(frame,W,small)+axes(left,topY,right,bottom,'分界 z','全体总时间 T(z)');
    s+=`<path data-motion="total-loss" d="${path(frame.total,.45,.75,X,Y)}" fill="none" stroke="${C.green}" stroke-width="3"/>`;
    for(const [z,label,color] of [[frame.eq,'个人均衡 0.6',C.red],[frame.social,'总时间最小 0.625',C.purple]])s+=`<circle cx="${X(z)}" cy="${Y(frame.total(z))}" r="8" fill="${color}" stroke="${C.paper}" stroke-width="2"/>`+text(X(z),Y(frame.total(z))+(z===frame.eq?-16:26),label,small?8:11,color,'middle',740);
    s+=`<circle data-motion="shown-total" cx="${X(frame.shown)}" cy="${Y(frame.shownTotal)}" r="5" fill="${C.gold}"/>`;
    const panelY=small?425:380;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${small?210:95}" rx="14" fill="${C.rose}" stroke="${C.red}"/>`+text(24,panelY+27,`T(0.6)=${fmt(frame.eqTotal,4)}；T(0.625)=${fmt(frame.socialTotal,4)}`,small?9:11,C.ink,'start',720)+lines(24,panelY+56,frame.narration,small?10:12,C.ink,'start',500,small?25:61,19,small?7:3);
    return {W,H,s};
  }

  function raffleChart(frame,small){
    const W=small?320:760,H=small?650:480,cardW=small?138:300,cards=small?[[14,92],[168,92]]:[[55,90],[405,90]],max=frame.N;
    let s=top(frame,W,small);
    [[frame.nL,'L票',C.green,frame.utilityL],[frame.nH,'H票',C.purple,frame.utilityH]].forEach(([n,label,color,u],i)=>{const [x,y]=cards[i],h=180*n/max;s+=`<rect x="${x}" y="${y}" width="${cardW}" height="245" rx="16" fill="${i?C.sky:C.mint}" stroke="${color}"/>`+text(x+cardW/2,y+32,label,small?13:17,color,'middle',780)+`<rect data-motion="crowd-${i}" x="${x+25}" y="${y+205-h}" width="${cardW-50}" height="${h}" rx="8" fill="${color}" opacity=".86"/>`+text(x+cardW/2,y+228,`${fmt(n)} 人`,small?10:13,C.ink,'middle',740)+text(x+cardW/2,y+54,`期望效用 ${fmt(u,6)}`,small?8:11,C.ink,'middle',650);});
    const panelY=small?375:360;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${small?225:95}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`+text(24,panelY+27,`均衡候选：L ${frame.target}人；H ${frame.N-frame.target}人`,small?9:11,C.ink,'start',740)+lines(24,panelY+58,frame.narration,small?10:12,C.ink,'start',500,small?25:61,19,small?8:3);
    return {W,H,s};
  }

  function matchingChart(frame,small){
    const W=small?320:760,H=small?690:500,cards=small?[[14,82,292,210],[14,310,292,210]]:[[50,88,300,270],[410,88,300,270]];
    let s=top(frame,W,small);
    cards.forEach(([x,y,w,h],i)=>{const color=i?C.purple:C.green;s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${i?C.sky:C.mint}" stroke="${color}"/>`+text(x+w/2,y+31,`场馆 ${i+1}`,small?14:17,color,'middle',780)+text(x+20,y+67,`A类 ${fmt(frame.A[i])} 人`,small?11:13,C.green,'start',700)+text(x+20,y+94,`B类 ${fmt(frame.B[i])} 人`,small?11:13,C.purple,'start',700)+text(x+20,y+132,`A匹配概率 p${i+1}=${fmt(frame.p[i])}`,small?10:11,C.ink,'start',650)+text(x+20,y+158,`B匹配概率 q${i+1}=${fmt(frame.q[i])}`,small?10:11,C.ink,'start',650)+text(x+20,y+190,frame.A[i]?`B/A=${fmt(frame.ratio[i])}`:'空场馆：按约定概率为0',small?10:11,C.gold,'start',700);});
    const panelY=small?545:385;
    s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${small?120:90}" rx="14" fill="${C.rose}" stroke="${C.red}"/>`+lines(24,panelY+30,frame.narration,small?10:12,C.ink,'start',500,small?25:61,19,small?5:3);
    return {W,H,s};
  }

  function chart(frame,small){
    if(['service','consistency','sorting'].includes(frame.kind)) return streetChart(frame,small);
    if(['crossing','uniqueness','comparative','scale'].includes(frame.kind)) return curveChart(frame,small);
    if(['pareto','proof'].includes(frame.kind)) return paretoChart(frame,small);
    if(frame.kind==='social') return socialChart(frame,small);
    if(frame.kind==='raffle') return raffleChart(frame,small);
    return matchingChart(frame,small);
  }

  function metrics(frame){
    let detail='同一街道、同一批居民沿六幕推进';
    if(frame.kind==='consistency')detail=`预期分界 ${fmt(frame.z)}；实际选择分界 ${fmt(frame.cut)}`;
    else if(['service','sorting'].includes(frame.kind))detail=`左等待 ${fmt(frame.t0??frame.eqWait?.[0])}；右等待 ${fmt(frame.t1??frame.eqWait?.[1])}`;
    else if(['crossing','uniqueness','comparative','scale'].includes(frame.kind))detail=`当前均衡分界 ${fmt(frame.newEq??frame.eq)}`;
    else if(['pareto','proof'].includes(frame.kind))detail=`见证居民损失 ${fmt(frame.oldLoss)} → ${fmt(frame.newLoss)}`;
    else if(frame.kind==='social')detail=`个人均衡 ${fmt(frame.eq)}；总量最小 ${fmt(frame.social)}`;
    else if(frame.kind==='raffle')detail=`L/H人数 ${frame.nL}/${frame.nH}`;
    else detail=`场馆1 A/B=${fmt(frame.A[0])}/${fmt(frame.B[0])}`;
    return [['当前讲解',`${step+1}/6 · ${frame.identity}`],['这一步的判断',frame.verdict],['图中核对',detail]];
  }

  function draw(){
    const frame=serviceEconomyStory(key,step),content=serviceEconomyContent[key];
    if($('experiment'))$('experiment').value=key;
    if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${frame.identity}`;
    let brief=$('service-brief');
    if(!brief){brief=document.createElement('section');brief.id='service-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="service-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="service-conditions"></span></p><p class="boundary" id="service-source"></p>';$('legend')?.before(brief);}
    $('service-question').textContent=content.question;$('service-conditions').textContent=content.conditions;$('service-source').textContent=`教材边界：${content.source}`;
    const plot=$('plot');
    if(plot){Object.assign(plot.dataset,{filmIntro:content.question,filmPhase:frame.identity,filmNarration:frame.narration,filmConclusion:content.steps[5][1]});const rendered=chart(frame,plot.clientWidth<500);window.microMotion.chart(plot,`<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${esc(content.title+'：'+frame.identity)}"><rect width="${rendered.W}" height="${rendered.H}" fill="${C.paper}"/>${rendered.s}</svg>`);}
    if($('legend'))$('legend').textContent=frame.kind==='raffle'?'同一批1,200人始终保留；绿色是L票人群，紫色是H票人群。':frame.kind==='matching'?'同一批A类与B类人在两个场馆间重新分布；概率始终由当前真实人数计算。':'绿色始终代表网点0，紫色始终代表网点1；金色标出当前正在检查的分界或居民。';
    if($('metrics'))$('metrics').innerHTML=metrics(frame).map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
    if($('reading'))$('reading').textContent=frame.narration;if($('formula'))$('formula').textContent=content.formula;if($('boundary'))$('boundary').textContent=content.trap;
    if($('extra'))$('extra').innerHTML=`<h3>严谨证明或计算路线</h3><ol>${content.proof.map(item=>`<li>${esc(item)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(content.template)}</p><h3>最容易混淆</h3><p>${esc(content.trap)}</p><p>来源：Osborne–Rubinstein ${esc(content.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>{el.textContent=[content.question,content.conditions,content.template][i]||'';});
    const guideBoundary=document.querySelector('.study-guide>.boundary');if(guideBoundary)guideBoundary.textContent='教材原式、本站校准、一般证明与数值例分开标注；连贯动画帮助看因果，不代替独立计算。';
    const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch13-service-${key}.html`;dl.textContent='下载本段完整动画代码 ↓';}
    window.microMath?.refresh?.();
  }

  function configure(next){stop();key=serviceEconomyKeys.includes(next)?next:serviceEconomyKeys[0];window.SERVICE_ECONOMY_DEFAULT=key;const current=new URLSearchParams(location.search),wanted=Number(current.get('filmStep'));step=(current.get('case')===key||!current.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
  const advance=()=>{if(step>=5)return true;step+=1;draw();return step>=5;};
  controls();
  if($('advance'))$('advance').onclick=()=>{stop();advance();};
  if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1900);$('play').textContent='暂停播放';};
  if($('reset'))$('reset').onclick=()=>configure(key);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);
  window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}

window.startServiceEconomyStory=startServiceEconomyStory;

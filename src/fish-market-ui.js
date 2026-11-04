import {fishMarketContent, fishMarketKeys} from './fish-market-content.mjs';
import {fishMarketStory, survivalProbability} from './fish-market-story.mjs';

export function startFishMarketStory(requested) {
  const $ = id => document.getElementById(id);
  const C = {ink:'#263f37', muted:'#708177', green:'#177468', red:'#bd624c', purple:'#74618d', gold:'#b18429', blue:'#4b718f', rule:'#d7e0d5', paper:'#fffdf7', soft:'#f3f6f1', mint:'#e5efe9', rose:'#fff1ed', sky:'#edf4f6', charcoal:'#47554f'};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (value, digits = 3) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)).toLocaleString('zh-CN', {maximumFractionDigits: digits}) : String(value);
  const text = (x,y,value,size=12,color=C.ink,anchor='start',weight=400) => `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
  const wrap = (value, limit=23, max=8) => { const rows=[]; for(let i=0;i<String(value).length;i+=limit) rows.push(String(value).slice(i,i+limit)); return rows.slice(0,max); };
  const lines = (x,y,value,size=11,color=C.ink,anchor='start',weight=400,limit=26,gap=19,max=7) => wrap(value,limit,max).map((row,i)=>text(x,y+i*gap,row,size,color,anchor,weight)).join('');
  const path = (d,color,width=2,dash='',fill='none') => `<path d="${d}" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}" fill="${fill}"/>`;
  const top = (frame,W,small) => text(W/2,24,frame.identity,small?11:18,C.ink,'middle',760)+text(W/2,48,frame.verdict,small?9:12,C.muted,'middle',650);

  const query = new URLSearchParams(location.search);
  let key = fishMarketKeys.includes(requested) ? requested : fishMarketKeys.includes(window.FISH_MARKET_DEFAULT) ? window.FISH_MARKET_DEFAULT : fishMarketKeys.includes(query.get('case')) ? query.get('case') : fishMarketKeys[0];
  let step = 0, timer = null;

  function stop(){ if(timer) clearInterval(timer); timer=null; if($('play')) $('play').textContent='播放整段'; }
  function controls(){
    if(!$('fields')) return;
    $('fields').innerHTML = `<div class="field"><label for="experiment">本节知识点或习题</label><select id="experiment">${fishMarketKeys.map(k=>`<option value="${k}">${esc(fishMarketContent[k].title)}</option>`).join('')}</select></div><p class="small" id="film-progress" aria-live="polite">第1幕（共6幕）</p>`;
    $('experiment').onchange = event => { if(!fishMarketKeys.includes(event.target.value)) return; history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(event.target.value)); configure(event.target.value); };
    if($('advance')) $('advance').textContent='下一幕';
    if($('reset')) $('reset').textContent='从头重播';
  }

  function fishIcon(x,y,index,small,active=true){
    const scale=small?.72:1,color=active?C.blue:C.rule;
    return `<g data-motion="fish-${index}" transform="translate(${x} ${y}) scale(${scale})"><path d="M-12 0C-5-8 8-8 14 0C8 8-5 8-12 0M-12 0L-20-8V8Z" fill="${color}"/><circle cx="8" cy="-2" r="1.5" fill="${C.paper}"/></g>`;
  }
  function boatIcon(x,y,index,small,active=true){
    const scale=small?.72:1,color=active?C.green:C.rule;
    return `<g data-motion="boat-${index}" transform="translate(${x} ${y}) scale(${scale})"><path d="M-20 2H20L14 12H-13Z" fill="${color}"/><path d="M0 2V-18L14-6H1" fill="${C.mint}" stroke="${color}" stroke-width="1.5"/></g>`;
  }

  function marketChart(frame,small){
    const W=small?320:760,H=small?700:515,left=small?43:66,right=W-(small?16:42),topY=72,bottom=266,X=t=>left+(right-left)*t/10,Y=value=>bottom-(bottom-topY)*value/11;
    let s=top(frame,W,small);
    for(let i=0;i<=10;i+=2)s+=path(`M${X(i)} ${bottom}V${bottom+5}`,C.muted,1)+text(X(i),bottom+20,i,small?8:10,C.muted,'middle');
    for(let i=2;i<=10;i+=2)s+=path(`M${left} ${Y(i)}H${right}`,C.rule,1,'3 5')+text(left-7,Y(i)+4,i,small?8:10,C.muted,'end');
    s+=path(`M${left} ${topY}V${bottom}H${right}`,C.muted,1.5)+text(left,topY-10,'每单位价值 / 成本',small?8:10,C.ink,'start',650)+text(right,bottom+38,'全体总捕捞 T',small?8:10,C.ink,'end',650);
    s+=path(`M${X(0)} ${Y(0)}L${X(10)} ${Y(10)}`,C.green,3)+text(X(8.15),Y(8.15)-10,'c(T)=T',small?8:11,C.green,'start',730);
    s+=path(`M${left} ${Y(6)}H${right}`,C.red,2.5,'7 4')+text(right,Y(6)-8,'消费者价值 v=6',small?8:11,C.red,'end',730);
    if(frame.kind==='tax'&&frame.tax>0){s+=path(`M${X(0)} ${Y(frame.tax)}L${X(10-frame.tax)} ${Y(10)}`,C.gold,2.5,'5 4')+text(X(6.7),Y(6.7+frame.tax)-8,'c(T)+税',small?8:10,C.gold,'start',720);}
    const total=Math.max(0,Math.min(10,frame.total??6)),cost=Math.max(0,Math.min(11,frame.cost??6));
    s+=path(`M${X(total)} ${bottom}V${Y(cost)}`,C.purple,1.8,'5 4')+`<circle data-motion="market-point" cx="${X(total)}" cy="${Y(cost)}" r="${small?6:8}" fill="${C.gold}" stroke="${C.paper}" stroke-width="2"/>`+text(X(total),Y(cost)-13,`T=${fmt(total)}，c=${fmt(cost)}`,small?8:10,C.gold,'middle',760);
    const iconY=small?305:306,boatGap=small?38:50,buyerGap=small?23:30;
    for(let i=0;i<5;i++)s+=boatIcon((small?28:58)+i*boatGap,iconY,i,small,frame.total>0);
    for(let i=0;i<10;i++)s+=fishIcon((small?21:385)+i*buyerGap,iconY,i,small,i<(frame.total??0)+.001);
    s+=text(small?22:58,iconY+31,'5位渔民',small?8:10,C.green,'start',700)+text(small?299:718,iconY+31,'10位消费者',small?8:10,C.blue,'end',700);
    const panelY=small?355:350,panelH=small?322:135;
    s+=marketPanel(frame,small,W,panelY,panelH);
    return {W,H,s};
  }

  function marketPanel(frame,small,W,y,h){
    let s=`<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${frame.kind==='pareto'||frame.kind==='tax'?C.mint:C.soft}" stroke="${frame.kind==='pareto'||frame.kind==='tax'?C.green:C.rule}"/>`;
    if(frame.kind==='ledger'){
      const items=[['消费者最优',frame.consumerOptimal],['渔民最优',frame.fisherOptimal],['数量出清',frame.clears],['预期正确',frame.beliefCorrect]];
      items.forEach(([label,ok],index)=>{const col=small?index%2:index,row=small?Math.floor(index/2):0,x=small?28+col*145:46+index*172,yy=y+34+row*40,shown=index<frame.revealedLedgers;s+=`<circle cx="${x}" cy="${yy-4}" r="8" fill="${shown?(ok?C.green:C.red):C.rule}"/>`+text(x+14,yy,label,small?9:11,shown?C.ink:C.muted,'start',700);});
      s+=lines(24,small?y+129:y+86,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?8:3);
    }else if(frame.kind==='proof'){
      const labels={existence:'端点夹逼',construction:'构造候选',verify:'核对上下限',priceHigh:'反证 p>v',priceLow:'反证 p<v',unique:'锁定唯一交点'};
      s+=text(24,y+30,`${labels[frame.branch]}：试验价格 ${fmt(frame.trialPrice)}，试验总量 ${fmt(frame.trialTotal)}`,small?9:12,frame.contradiction?C.red:C.green,'start',760);
      if(frame.branch==='priceHigh')s+=text(24,y+58,'需求0，但T=0使c(0)<p，渔民反而想满捕',small?9:11,C.red,'start',700);
      if(frame.branch==='priceLow')s+=lines(24,y+58,'容量不足则不能出清；容量恰等时满产成本高于价格，渔民改选0。',small?9:11,C.red,'start',700,small?25:58,18,3);
      s+=lines(24,small?y+128:y+88,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?8:3);
    }else if(frame.kind==='pareto'){
      s+=text(24,y+30,`总量 ${fmt(frame.total)}；成本 ${fmt(frame.cost)}；协商价 ${fmt(frame.price)}`,small?9:12,C.ink,'start',760)+text(24,y+58,`每位消费者增益 ${fmt(frame.consumerGain)}；每位渔民增益 ${fmt(frame.fisherGain)}`,small?9:11,frame.paretoImprovement?C.green:C.muted,'start',760)+lines(24,small?y+104:y+88,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?9:3);
    }else if(frame.kind==='tax'){
      s+=text(24,y+30,`目标T̃=${frame.target}；单位税 ${fmt(frame.tax)}；税收 ${fmt(frame.revenue)}`,small?9:12,C.ink,'start',760)+text(24,y+58,`已返还 ${fmt(frame.rebateShare*100)}%；每人收到 ${fmt(frame.rebate)}；政府留存 ${fmt(frame.retained)}`,small?9:11,frame.rebateShare?C.green:C.gold,'start',740)+lines(24,small?y+104:y+88,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?9:3);
    }else{
      s+=text(24,y+30,`当前T=${fmt(frame.total)}；单位成本c(T)=${fmt(frame.cost)}；全行业总成本c(T)T=${fmt(frame.industryCost)}`,small?9:12,C.ink,'start',730)+text(24,y+58,`消费者价值v=${frame.v}；私人每单位比较v−c(T)=${fmt(frame.privateMarginalComparison)}`,small?9:11,C.purple,'start',700)+lines(24,small?y+104:y+88,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?9:3);
    }
    return s;
  }

  function healthChart(frame,small){
    const W=small?320:760,H=small?700:515,left=small?42:66,right=W-(small?15:42),topY=72,bottom=280,xMax=3.4;
    const privateU=y=>(frame.m-frame.healthPrice*y)*survivalProbability(y,frame.privateY),collectiveU=y=>(frame.m-frame.healthPrice*y)*survivalProbability(y,y);
    const samples=80,values=[];for(let i=0;i<=samples;i++){const y=xMax*i/samples;values.push(privateU(y),collectiveU(y));}const maxU=Math.max(...values)*1.08,X=y=>left+(right-left)*y/xMax,Y=u=>bottom-(bottom-topY)*u/maxU;
    const curve=fn=>{let d='';for(let i=0;i<=samples;i++){const y=xMax*i/samples;d+=(i?'L':'M')+X(y).toFixed(2)+' '+Y(fn(y)).toFixed(2);}return d;};
    let s=top(frame,W,small)+path(`M${left} ${topY}V${bottom}H${right}`,C.muted,1.5)+text(left,topY-10,'剩余货币 × 存活概率',small?8:10,C.ink,'start',650)+text(right,bottom+35,'每人健康服务 y',small?8:10,C.ink,'end',650);
    s+=path(curve(privateU),C.green,2.8)+path(curve(collectiveU),C.purple,2.8,'6 4')+text(right-4,topY+18,'绿：固定平均量的私人账',small?8:10,C.green,'end',720)+text(right-4,topY+39,'紫：所有人一起变动',small?8:10,C.purple,'end',720);
    s+=`<circle cx="${X(frame.privateY)}" cy="${Y(frame.privateUtility)}" r="${small?6:8}" fill="${C.green}" stroke="${C.paper}" stroke-width="2"/>`+text(X(frame.privateY),Y(frame.privateUtility)-13,`私人 y*=${fmt(frame.privateY,2)}`,small?8:10,C.green,'middle',750);
    if(frame.kind==='healthExternal')s+=`<circle data-motion="health-point" cx="${X(frame.currentY)}" cy="${Y(frame.currentUtility)}" r="${small?6:8}" fill="${C.gold}" stroke="${C.paper}" stroke-width="2"/>`+text(X(frame.currentY),Y(frame.currentUtility)+24,`共同 y=${fmt(frame.currentY,2)}`,small?8:10,C.gold,'middle',750);
    const y=small?335:345,h=small?338:140,color=frame.kind==='healthExternal'&&frame.strictImprovement?C.green:C.rule;
    s+=`<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${C.soft}" stroke="${color}"/>`+text(24,y+30,`m=${frame.m}，p=${frame.healthPrice}；私人y*=${fmt(frame.privateY,3)}；共同最优示例=${fmt(frame.socialY,3)}`,small?9:12,C.ink,'start',740)+text(24,y+58,frame.kind==='health'?`私人FOC残差 ${fmt(frame.privateFOC,6)}`:`共同方向边际 ${fmt(frame.collectiveSlopeAtPrivate,4)}；当前效用 ${fmt(frame.currentUtility,3)}`,small?9:11,frame.kind==='healthExternal'?C.purple:C.green,'start',730)+lines(24,small?y+104:y+88,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?10:3);
    return {W,H,s};
  }

  function metrics(frame){
    let detail;
    if(frame.kind==='health'||frame.kind==='healthExternal')detail=`私人y*=${fmt(frame.privateY)}；共同示例=${fmt(frame.socialY)}；当前y=${fmt(frame.currentY)}`;
    else if(frame.kind==='tax')detail=`T=${fmt(frame.total)}；τ=${fmt(frame.tax)}；返还=${fmt(frame.rebate)}/人`;
    else detail=`T=${fmt(frame.total)}；c(T)=${fmt(frame.cost)}；p=${fmt(frame.price)}`;
    return [['当前讲解',`${step+1}/6 · ${frame.identity}`],['这一步的判断',frame.verdict],['图中核对',detail]];
  }

  function renderChart(plot,markup){ if(window.microMotion?.chart) window.microMotion.chart(plot,markup); else plot.innerHTML=markup; }

  function draw(){
    const frame=fishMarketStory(key,step),content=fishMarketContent[key];
    if($('experiment')) $('experiment').value=key;
    if($('film-progress')) $('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${frame.identity}`;
    let brief=$('fish-brief');
    if(!brief){brief=document.createElement('section');brief.id='fish-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="fish-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="fish-conditions"></span></p><p class="boundary" id="fish-source"></p>';$('legend')?.before(brief);}
    $('fish-question').textContent=content.question;$('fish-conditions').textContent=content.conditions;$('fish-source').textContent=`教材边界：${content.source}`;
    const plot=$('plot');
    if(plot){Object.assign(plot.dataset,{filmIntro:content.question,filmPhase:frame.identity,filmNarration:frame.narration,filmConclusion:content.steps[5][1]});const rendered=(frame.kind==='health'||frame.kind==='healthExternal')?healthChart(frame,plot.clientWidth<500):marketChart(frame,plot.clientWidth<500);renderChart(plot,`<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${esc(content.title+'：'+frame.identity)}"><rect width="${rendered.W}" height="${rendered.H}" fill="${C.paper}"/>${rendered.s}</svg>`);}
    if($('legend')) $('legend').textContent=(frame.kind==='health'||frame.kind==='healthExternal')?'绿色实线固定平均服务量做私人选择；紫色虚线表示所有人服务量与平均量一起变化；金点追踪共同调整。':'绿色斜线是单位捕鱼成本，红色横线是消费者单位价值，金点追踪当前总捕捞；税收题另用金色虚线表示成本加单位税。';
    if($('metrics')) $('metrics').innerHTML=metrics(frame).map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
    if($('reading')) $('reading').textContent=frame.narration;if($('formula')) $('formula').textContent=content.formula;if($('boundary')) $('boundary').textContent=content.trap;
    if($('extra')) $('extra').innerHTML=`<h3>严谨证明或计算路线</h3><ol>${content.proof.map(item=>`<li>${esc(item)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(content.template)}</p><h3>最容易混淆</h3><p>${esc(content.trap)}</p><p>来源：Osborne–Rubinstein ${esc(content.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((element,index)=>{element.textContent=[content.question,content.conditions,content.template][index]||'';});
    const guideBoundary=document.querySelector('.study-guide>.boundary');if(guideBoundary)guideBoundary.textContent='码头与王阿姨只负责建立直觉；一般模型、本站线性/指数数值例、正文结论和章末习题边界分别标注。';
    const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch13-fish-${key}.html`;dl.textContent='下载本段完整动画代码 ↓';}
    window.microMath?.refresh?.();
  }

  function configure(next){stop();key=fishMarketKeys.includes(next)?next:fishMarketKeys[0];window.FISH_MARKET_DEFAULT=key;const current=new URLSearchParams(location.search),wanted=Number(current.get('filmStep'));step=(current.get('case')===key||!current.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
  const advance=()=>{if(step>=5)return true;step+=1;draw();return step>=5;};
  controls();
  if($('advance')) $('advance').onclick=()=>{stop();advance();};
  if($('play')) $('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};
  if($('reset')) $('reset').onclick=()=>configure(key);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);
  window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}

window.startFishMarketStory=startFishMarketStory;

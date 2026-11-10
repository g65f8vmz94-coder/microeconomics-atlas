import {carMarketContent, carMarketKeys} from './car-market-content.mjs';
import {carMarketStory} from './car-market-story.mjs';

export function startCarMarketStory(requested) {
  const $ = id => document.getElementById(id);
  const C = {ink:'#263f37', muted:'#708177', green:'#177468', red:'#bd624c', purple:'#74618d', gold:'#b18429', blue:'#4b718f', rule:'#d7e0d5', paper:'#fffdf7', soft:'#f3f6f1', mint:'#e5efe9', rose:'#fff1ed', sky:'#edf4f6', charcoal:'#47554f'};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (value, digits = 4) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(digits)).toLocaleString('zh-CN', {maximumFractionDigits: digits}) : String(value);
  const text = (x,y,value,size=12,color=C.ink,anchor='start',weight=400) => `<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
  const wrap = (value, limit=23, max=7) => { const rows=[]; for(let i=0;i<String(value).length;i+=limit) rows.push(String(value).slice(i,i+limit)); return rows.slice(0,max); };
  const lines = (x,y,value,size=11,color=C.ink,anchor='start',weight=400,limit=26,gap=19,max=7) => wrap(value,limit,max).map((row,i)=>text(x,y+i*gap,row,size,color,anchor,weight)).join('');
  const top = (frame,W,small) => text(W/2,24,frame.identity,small?12:18,C.ink,'middle',760)+text(W/2,48,frame.verdict,small?9:12,C.muted,'middle',650);

  const query = new URLSearchParams(location.search);
  let key = carMarketKeys.includes(requested) ? requested : carMarketKeys.includes(window.CAR_MARKET_DEFAULT) ? window.CAR_MARKET_DEFAULT : carMarketKeys.includes(query.get('case')) ? query.get('case') : carMarketKeys[0];
  let step = 0, timer = null;

  function stop(){ if(timer) clearInterval(timer); timer=null; if($('play')) $('play').textContent='播放整段'; }
  function controls(){
    if(!$('fields')) return;
    $('fields').innerHTML = `<div class="field"><label for="experiment">本节知识点</label><select id="experiment">${carMarketKeys.map(k=>`<option value="${k}">${esc(carMarketContent[k].title)}</option>`).join('')}</select></div><p class="small" id="film-progress" aria-live="polite">第1幕（共6幕）</p>`;
    $('experiment').onchange = event => { if(!carMarketKeys.includes(event.target.value)) return; history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(event.target.value)); configure(event.target.value); };
    if($('advance')) $('advance').textContent='下一幕';
    if($('reset')) $('reset').textContent='从头重播';
  }

  function carIcon(x,y,index,sold,small,label){
    const width=small?31:58,height=small?17:28,color=sold?C.red:C.charcoal;
    return `<g data-motion="car-${index}" transform="translate(${x} ${y})"><rect x="${-width/2}" y="${-height/2}" width="${width}" height="${height}" rx="${small?5:8}" fill="${color}" opacity="${sold?1:.82}"/><path d="M${-width*.28} ${-height/2}L${-width*.13} ${-height*.92}H${width*.18}L${width*.34} ${-height/2}" fill="${sold?C.rose:C.soft}" stroke="${color}" stroke-width="1.5"/><circle cx="${-width*.28}" cy="${height/2}" r="${small?3.2:5}" fill="${C.ink}"/><circle cx="${width*.28}" cy="${height/2}" r="${small?3.2:5}" fill="${C.ink}"/>${text(0,height+18,label,small?8:10,color,'middle',700)}</g>`;
  }

  function queue(frame,small,W){
    const left=small?26:64,right=W-(small?20:48),axisY=205;
    const source=frame.kind==='onlyLow'?[1,2,3,4,5,6]:frame.q;
    const max=frame.kind==='onlyLow'?6.5:1.1;
    const X=value=>left+(right-left)*value/max;
    let s=`<path d="M${left} ${axisY}H${right}" stroke="${C.muted}" stroke-width="2"/><path d="M${left} ${axisY-5}V${axisY+5}M${right} ${axisY-5}V${axisY+5}" stroke="${C.muted}"/>`+text(left,axisY+42,'质量低',small?8:10,C.muted,'start',650)+text(right,axisY+42,'质量高',small?8:10,C.muted,'end',650);
    const soldCount=frame.m||0;
    source.forEach((quality,index)=>{const sold=index<soldCount,rowOffset=(index%2)*(small?28:42);s+=carIcon(X(quality),axisY-23-rowOffset,index,sold,small,frame.kind==='onlyLow'?String(quality):fmt(quality,2));});
    if(frame.belief!==undefined){const belief=Math.min(max,frame.belief);s+=`<path data-motion="belief" d="M${X(belief)} 78V${axisY+12}" stroke="${C.green}" stroke-width="2.4" stroke-dasharray="6 4"/>`+text(X(belief),72,`平均/信念 ${fmt(frame.belief)}`,small?8:10,C.green,'middle',730);}
    if(frame.price!==undefined){const price=Math.min(max,frame.price);s+=`<path data-motion="price" d="M${X(price)} 102V${axisY+12}" stroke="${C.gold}" stroke-width="3"/>`+text(X(price),96,`统一价 ${fmt(frame.price)}`,small?8:10,C.gold,'middle',760);}
    return s;
  }

  function candidatePanel(frame,small,W,y){
    const h=small?245:135;
    let s=`<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`;
    if(frame.kind==='q133'){
      const rows=frame.candidates.slice(0,4),start=small?y+29:y+30;
      s+=text(24,start,'m',small?9:11,C.muted,'start',700)+text(small?62:100,start,'A(m)',small?9:11,C.muted,'start',700)+text(small?132:210,start,'αA(m)',small?9:11,C.muted,'start',700)+text(small?224:340,start,'Qₘ',small?9:11,C.muted,'start',700)+text(small?274:440,start,'合格?',small?9:11,C.muted,'start',700);
      rows.forEach((row,index)=>{const yy=start+25*(index+1),active=row.m===frame.selectedM,color=active?C.red:C.ink;s+=`<rect x="18" y="${yy-16}" width="${W-36}" height="21" rx="5" fill="${active?C.rose:'transparent'}"/>`+text(25,yy,row.m,small?9:11,color,'start',active?760:500)+text(small?62:100,yy,fmt(row.belief),small?9:11,color)+text(small?132:210,yy,fmt(row.price),small?9:11,color)+text(small?224:340,yy,fmt(row.q[row.m-1]),small?9:11,color)+text(small?274:440,yy,row.sellersAccepted?'是':'否',small?9:11,row.sellersAccepted?C.green:C.red,'start',730);});
      s+=lines(24,small?y+165:y+30,frame.narration,small?10:12,C.ink,'start',500,small?25:58,19,small?5:4);
    }else{
      s+=text(24,y+29,`候选出售 ${frame.m} 辆；待售平均 ${fmt(frame.belief)}；统一价 ${fmt(frame.price)}`,small?9:12,C.ink,'start',720)+lines(24,y+62,frame.narration,small?10:12,C.ink,'start',500,small?25:58,19,small?8:4);
    }
    return s;
  }

  function ledgerPanel(frame,small,W,y){
    const items=[['买家最优',frame.buyersIndifferent],['车主最优',frame.sellersAccepted&&frame.excludedStay],['数量相等',frame.clears],['信念正确',frame.averageCorrect]],h=small?250:140;
    let s=`<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`;
    items.forEach(([label,ok],index)=>{const col=small?index%2:index,row=small?Math.floor(index/2):0,x=small?28+col*145:55+index*170,yy=y+35+row*43;s+=`<circle cx="${x}" cy="${yy-4}" r="8" fill="${ok?C.green:C.red}"/>`+text(x+15,yy,label,small?9:11,C.ink,'start',700);});
    s+=lines(24,small?y+137:y+82,frame.narration,small?10:12,C.ink,'start',500,small?25:58,19,small?6:3);return s;
  }

  function noTradePanel(frame,small,W,y){
    const h=small?245:135,color=frame.supported?C.green:C.red;
    return `<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${frame.supported?C.mint:C.rose}" stroke="${color}"/>`+text(24,y+29,`车主全留：${frame.ownersStay?'是':'否'}　买家全不买：${frame.buyersStay?'是':'否'}　候选：${frame.supported?'成立':'被排除'}`,small?9:12,color,'start',760)+text(24,y+55,`p*=${fmt(frame.price)}；αq̂*=${fmt(frame.buyerValue)}；最低质量=0.05`,small?9:11,C.ink,'start',680)+lines(24,y+87,frame.narration,small?10:12,C.ink,'start',500,small?25:58,19,small?7:3);
  }

  function paretoPanel(frame,small,W,y){
    const h=small?260:145,cols=small?[[28,y+45],[28,y+94],[28,y+143]]:[[70,y+48],[285,y+48],[505,y+48]];
    let s=`<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${C.mint}" stroke="${C.green}"/>`;
    [['车主留车价值',frame.quality,C.red],['协商转让价',frame.transfer,C.gold],['买家识别后价值',frame.buyerValue,C.purple]].forEach(([label,value,color],index)=>{const [x,yy]=cols[index];s+=text(x,yy,`${label} ${fmt(value)}`,small?10:12,color,'start',760);});
    if(frame.step>=3)s+=text(small?28:70,small?y+188:y+86,`车主增益 +${fmt(frame.sellerGain)}；买家增益 +${fmt(frame.buyerGain)}`,small?10:12,C.green,'start',760);
    s+=lines(24,small?y+214:y+112,frame.narration,small?10:11,C.ink,'start',500,small?25:60,18,small?3:2);return s;
  }

  function onlyLowPanel(frame,small,W,y){
    const h=small?250:145,color=frame.marginalSells?C.green:C.red;
    return `<rect x="12" y="${y}" width="${W-24}" height="${h}" rx="14" fill="${C.soft}" stroke="${C.rule}"/>`+text(24,y+29,`试 m=${frame.m}：q̂=(m+1)/2=${fmt(frame.belief)}，p=αq̂=${fmt(frame.price)}`,small?9:12,C.ink,'start',730)+text(24,y+57,`边际车主质量 ${frame.marginalQuality}；愿卖？${frame.marginalSells?'是':'否'}`,small?9:11,color,'start',760)+lines(24,y+91,frame.narration,small?10:12,C.ink,'start',500,small?25:58,19,small?7:3);
  }

  function chart(frame,small){
    const W=small?320:760,H=small?690:510,panelY=small?285:275;
    let s=top(frame,W,small)+queue(frame,small,W);
    if(frame.kind==='d135')s+=ledgerPanel(frame,small,W,panelY);
    else if(frame.kind==='none')s+=noTradePanel(frame,small,W,panelY);
    else if(frame.kind==='pareto')s+=paretoPanel(frame,small,W,panelY);
    else if(frame.kind==='onlyLow')s+=onlyLowPanel(frame,small,W,panelY);
    else s+=candidatePanel(frame,small,W,panelY);
    return {W,H,s};
  }

  function metrics(frame){
    let detail;
    if(frame.kind==='none')detail=`p*=${fmt(frame.price)}；αq̂*=${fmt(frame.buyerValue)}；${frame.supported?'无人交易成立':'下限信念排除无人交易'}`;
    else if(frame.kind==='pareto')detail=`q=${fmt(frame.quality)}；r=${fmt(frame.transfer)}；αq=${fmt(frame.buyerValue)}`;
    else if(frame.kind==='onlyLow')detail=`试验m=${frame.m}；边际车主${frame.marginalSells?'愿卖':'不愿卖'}`;
    else detail=`出售${frame.m}辆；平均${fmt(frame.belief)}；统一价${fmt(frame.price)}`;
    return [['当前讲解',`${step+1}/6 · ${frame.identity}`],['这一步的判断',frame.verdict],['图中核对',detail]];
  }

  function renderChart(plot,markup){
    if(window.microMotion?.chart)window.microMotion.chart(plot,markup);
    else plot.innerHTML=markup;
  }

  function draw(){
    const frame=carMarketStory(key,step),content=carMarketContent[key];
    if($('experiment'))$('experiment').value=key;
    if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${frame.identity}`;
    let brief=$('car-brief');
    if(!brief){brief=document.createElement('section');brief.id='car-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="car-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="car-conditions"></span></p><p class="boundary" id="car-source"></p>';$('legend')?.before(brief);}
    $('car-question').textContent=content.question;$('car-conditions').textContent=content.conditions;$('car-source').textContent=`教材边界：${content.source}`;
    const plot=$('plot');
    if(plot){Object.assign(plot.dataset,{filmIntro:content.question,filmPhase:frame.identity,filmNarration:frame.narration,filmConclusion:content.steps[5][1]});const rendered=chart(frame,plot.clientWidth<500);renderChart(plot,`<svg viewBox="0 0 ${rendered.W} ${rendered.H}" role="img" aria-label="${esc(content.title+'：'+frame.identity)}"><rect width="${rendered.W}" height="${rendered.H}" fill="${C.paper}"/>${rendered.s}</svg>`);}
    if($('legend'))$('legend').textContent='同一排车辆始终按质量从低到高排列：红色表示当前待售，深灰表示留下；绿色虚线是平均质量或信念，金线是统一价格。';
    if($('metrics'))$('metrics').innerHTML=metrics(frame).map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
    if($('reading'))$('reading').textContent=frame.narration;if($('formula'))$('formula').textContent=content.formula;if($('boundary'))$('boundary').textContent=content.trap;
    if($('extra'))$('extra').innerHTML=`<h3>解题步骤</h3><ol>${content.proof.map(item=>`<li>${esc(item)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(content.template)}</p><h3>最容易混淆</h3><p>${esc(content.trap)}</p><p>来源：Osborne–Rubinstein ${esc(content.source)}</p>`;
    document.querySelectorAll('.study-guide .guide-panel').forEach((element,index)=>{element.textContent=[content.question,content.conditions,content.template][index]||'';});
    const guideBoundary=document.querySelector('.study-guide>.boundary');if(guideBoundary)guideBoundary.textContent='生活例只负责把信息差讲清楚；教材定义、一般证明、离轨信念与自主六车数值分开标注。';
    const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch13-car-${key}.html`;dl.textContent='下载本段完整动画代码 ↓';}
    window.microMath?.refresh?.();
  }

  function configure(next){stop();key=carMarketKeys.includes(next)?next:carMarketKeys[0];window.CAR_MARKET_DEFAULT=key;const current=new URLSearchParams(location.search),wanted=Number(current.get('filmStep'));step=(current.get('case')===key||!current.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
  const advance=()=>{if(step>=5)return true;step+=1;draw();return step>=5;};
  controls();
  if($('advance'))$('advance').onclick=()=>{stop();advance();};
  if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};
  if($('reset'))$('reset').onclick=()=>configure(key);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);
  window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}

window.startCarMarketStory=startCarMarketStory;

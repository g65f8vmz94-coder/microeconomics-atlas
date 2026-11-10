import {educationMarketContent,educationMarketKeys} from './education-market-content.mjs';
import {educationMarketStory} from './education-market-story.mjs';

export function startEducationMarketStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#263f37',muted:'#708177',green:'#177468',red:'#bd624c',gold:'#b18429',blue:'#4b718f',purple:'#74618d',rule:'#d7e0d5',paper:'#fffdf7',soft:'#f3f6f1',mint:'#e5efe9'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=(n,d=2)=>Number.isFinite(Number(n))?Number(Number(n).toFixed(d)).toLocaleString('zh-CN',{maximumFractionDigits:d}):String(n);
 const tx=(x,y,v,size=11,color=C.ink,anchor='start',weight=400)=>`<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}">${esc(v)}</text>`;
 const line=(x1,y1,x2,y2,color,width=2,dash='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}"/>`;
 const dot=(x,y,color,id,r=6)=>`<circle data-motion="${esc(id)}" cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${C.paper}" stroke-width="2"/>`;
 const q=new URLSearchParams(location.search);let key=educationMarketKeys.includes(requested)?requested:educationMarketKeys.includes(window.EDUCATION_MARKET_DEFAULT)?window.EDUCATION_MARKET_DEFAULT:educationMarketKeys.includes(q.get('case'))?q.get('case'):educationMarketKeys[0],step=0,timer=null;
 function stop(){if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';}
 function title(f,W,small){return tx(W/2,26,f.identity,small?13:20,C.ink,'middle',760);}
 function contractChart(f,small){
  const W=small?280:760,H=small?450:435,left=small?36:70,right=W-(small?18:48),top=small?80:70,bottom=small?306:318,maxT=4.5,maxW=13,X=t=>left+(right-left)*t/maxT,Y=w=>bottom-(bottom-top)*w/maxW;
  let s=title(f,W,small)+line(left,top,left,bottom,C.muted,1.5)+line(left,bottom,right,bottom,C.muted,1.5)+tx(left,top-9,'工资 w',small?10:12,C.ink,'start',700)+tx(right,bottom+35,'教育要求 t',small?10:12,C.ink,'end',700);
  for(const w of [0,4,8,12])s+=line(left-4,Y(w),right,Y(w),C.rule,1,'3 5')+tx(left-7,Y(w)+3,w,small?9:10,C.muted,'end');
  for(const t of [0,1,2,3,4])s+=line(X(t),bottom,X(t),bottom+4,C.muted,1)+tx(X(t),bottom+18,t,small?9:10,C.muted,'middle');
  const alpha=f.params.alphaL,lowPresent=alpha>0,highPresent=alpha<1,amount=f.model;
  if(f.showLines){
   const betaL=f.params.betaL,betaH=f.params.betaH,pool=f.contracts.find(c=>c.id==='混同'),low=f.contracts.find(c=>c.id==='L'),high=f.contracts.find(c=>c.id==='H');
   const lowIntercept=pool?pool.w-betaL*pool.t:low?low.w-betaL*low.t:4,highIntercept=pool?pool.w-betaH*pool.t:high?high.w-betaH*high.t:8;
   const iso=(intercept,slope,color,id)=>{const rightT=Math.min(maxT,(maxW-intercept)/slope);return `<path data-motion="${id}" d="M${X(0)} ${Y(intercept)}L${X(rightT)} ${Y(intercept+slope*rightT)}" fill="none" stroke="${color}" stroke-width="${small?2:2.5}" stroke-dasharray="5 4"/>`;};
   s+=iso(lowIntercept,betaL,lowPresent?C.blue:C.rule,'iso-L')+iso(f.key==='fig141'?6:highIntercept,betaH,C.red,'iso-H');
   if(f.key==='fig141')s+=iso(8,betaH,C.red,'iso-H2');
   if(!small)s+=tx(right,top+15,'蓝：L成本斜率3',11,lowPresent?C.blue:C.muted,'end',700)+tx(right,top+31,'红：H成本斜率1',11,C.red,'end',700);
  }
  if(f.showAverage&&amount){s+=line(left,Y(amount.avg),right,Y(amount.avg),C.purple,1.5,'5 5')+tx(right,Y(amount.avg)-6,`平均产值 ${fmt(amount.avg)}`,small?9:11,C.purple,'end',680);}
  if(f.key==='fig141'||f.key==='d142'){
   const shown=f.step>=3?f.contracts:f.step>=2?f.contracts.slice(0,1):[];
   for(const c of shown){const color=c.id==='a'?C.green:C.gold;s+=dot(X(c.t),Y(c.w),color,`income-${c.id}`,small?6:8)+tx(X(c.t)+8,Y(c.w)+(c.id==='b'?19:-9),small?c.id: `${c.id} (${c.t},${c.w})`,small?11:12,color,'start',740);}
   if(f.key==='fig141'&&f.step>=4&&f.entry)s+=dot(X(f.entry.t),Y(f.entry.w),C.muted,'income-c')+tx(X(f.entry.t)+8,Y(f.entry.w)-8,small?'c':'c：两类净收入都负',small?11:11,C.muted,'start',690);
  }else if(f.key==='d141'&&f.step<4){
   s+=tx(left+9,bottom-78,'H：产值10，读书成本1/年',small?10:13,C.red,'start',730)+tx(left+9,bottom-53,'L：产值4，读书成本3/年',small?10:13,C.blue,'start',730);
  }else{
   const shown=f.key==='d141'&&f.step<5?[]:f.contracts;
   for(const c of shown){const color=c.id==='L'?C.green:c.id==='H'?C.red:c.id==='混同'?C.purple:C.gold;const label=c.id==='L'?'低合同 L':c.id==='H'?'高合同 H':c.id;s+=dot(X(c.t),Y(c.w),color,`contract-${c.id}`,small?6:8)+tx(X(c.t)+(c.t===0?8:0),Y(c.w)+(c.id==='L'?18:-10),label,small?9:12,color,c.t===0?'start':'middle',740);}
   if(f.entry&&f.showCandidate){const e=f.entry;s+=dot(X(e.t),Y(e.w),C.gold,'contract-entrant',small?7:9)+tx(X(e.t)+8,Y(e.w)-12,e.id,small?9:12,C.gold,'start',750);}
  }
  const panelY=small?354:345,panelH=small?83:68;
  s+=`<rect x="12" y="${panelY}" width="${W-24}" height="${panelH}" rx="12" fill="${C.soft}" stroke="${C.rule}"/>`;
  let first='',second='';
  if(f.key==='fig141'||f.key==='d142'){first=f.step<3?'先读坐标：横轴教育 t，纵轴工资 w':small?'L：a、b都净得4':'a=(1,7)，b=(2,10)：L净收入都为4';second=f.step<3?'蓝线每年需补3元；红线只需补1元':small?'H：a得6、b得8':'H净收入：a得6，b得8';if(f.key==='fig141'&&f.step>=4)second=small?'c单独出现：两类都不工作':'c单独出现时两类净收入为负，都不工作';}
  else if(f.key==='d141'&&f.step<4){first='L产值4、教育成本3/年';second='H产值10、教育成本1/年；教育不增产';}
  else if(f.key==='boundaryShare'){first='L人数为0；只剩H，现有合同(0,10)';second=f.entry?`新报${f.entry.w}；H${f.after.choice.H.id==='H'?'留在原店':'改选'}；新店${f.after.details.at(-1).profit>0?'赚钱':'不赚钱'}`:'现有店利润0；低报抢不到H';}
  else if(f.key==='threshold'){first=small?`α_L=${fmt(alpha,3)}；平均产值${fmt(amount.avg)}，m=${fmt(amount.m)}`:`α_L=${fmt(alpha,3)}；平均产值=${fmt(amount.avg)}；H净收入m=${fmt(amount.m)}`;second=f.entry?`新工资${fmt(f.entry.w)}；进入利润${fmt(f.after.details.at(-1).profit)}`:amount.equilibrium?'平均产值≤m：此分离候选稳定':'平均产值>m：可盈利混同进入';}
  else if(f.entry&&f.showCandidate){const e=f.after.details.at(-1),who=e.attendees.length?e.attendees.join('、'):'无人';first=`新合同(${fmt(f.entry.t)},${fmt(f.entry.w)})：${who}改选`;second=`新雇主利润 ${fmt(e.profit)}；${e.profit>0?'存在盈利进入':'无严格盈利进入'}`;}
  else if(f.contracts.length){first=`L选${f.current.choice.L.id==='absent'?'不存在':f.current.choice.L.id}；H选${f.current.choice.H.id}`;second=f.current.details.map(c=>`${c.id}店利润${fmt(c.profit)}`).join('；');}
  else{first='当前没有任何工人被雇用';second='一份低于最低产值的正工资能让新店获利';}
  s+=tx(23,panelY+28,first,small?10:12,C.ink,'start',720)+tx(23,panelY+51,second,small?9:11,C.muted,'start',650);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.identity+'。'+f.narration)}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
 }
 function certificateChart(f,small){
  const W=small?280:760,H=small?430:400,left=small?29:70,bottom=small?285:275,top=75,Y=u=>bottom-(bottom-top)*Math.max(0,u)/21;
  let s=title(f,W,small)+tx(left,63,'卖家拿到的钱减证书成本',small?10:13,C.ink,'start',700)+line(left,top,left,bottom,C.muted,1.5)+line(left,bottom,W-22,bottom,C.muted,1.5);
  const r=f.model,opts=[['H+','H有证',r.pPlus-4,r.choiceH==='+'],['H-','H无证',r.pMinus,r.choiceH==='-'],['L+','L有证',r.pPlus-12,r.choiceL==='+'],['L-','L无证',r.pMinus,r.choiceL==='-']];
  const xs=small?[60,112,185,237]:[165,285,470,590],barW=small?28:52;
  opts.forEach(([id,label,value,chosen],i)=>{const x=xs[i],y=Y(value),color=chosen?C.green:C.rule;s+=`<rect data-motion="bar-${id}" x="${x-barW/2}" y="${y}" width="${barW}" height="${bottom-y}" rx="4" fill="${color}"/>`+tx(x,y-9,fmt(value),small?10:13,chosen?C.green:C.muted,'middle',730)+tx(x,bottom+20,label,small?9:11,chosen?C.ink:C.muted,'middle',690);});
  const yy=small?345:332;s+=`<rect x="12" y="${yy-20}" width="${W-24}" height="${small?83:54}" rx="12" fill="${C.soft}" stroke="${C.rule}"/>`+tx(23,yy+4,`有证价${fmt(r.pPlus)}，无证价${fmt(r.pMinus)}`,small?10:12,C.ink,'start',720)+tx(23,yy+27,`H选${r.choiceH==='+'?'有证':'无证'}；L选${r.choiceL==='+'?'有证':'无证'}`,small?10:12,C.ink,'start',700);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.identity+'。'+f.narration)}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
 }
 function schoolChart(f,small){
  const W=small?280:760,H=small?420:385,left=small?32:68,right=W-(small?18:50),axisY=small?280:260,X=d=>left+(right-left)*d/13;
  let s=title(f,W,small)+tx(left,64,'城市',small?11:13,C.ink,'start',730)+line(left,axisY,right,axisY,C.ink,2);
  for(const d of [0,5,10])s+=line(X(d),axisY-5,X(d),axisY+6,C.muted,1)+tx(X(d),axisY+23,`${d} km`,small?9:11,C.muted,'middle');
  for(const c of f.model.current){const y=c.style==='A'?118:190,color=c.style==='A'?C.red:C.blue;s+=line(X(c.d),y+8,X(c.d),axisY-7,color,2,'4 4')+dot(X(c.d),y,color,`school-${c.style}`,small?7:9)+tx(X(c.d),y-13,`${c.style}校 ${fmt(c.d)}km`,small?10:13,color,'middle',720);}
  if(f.hypothetical){const c=f.hypothetical,y=c.style==='A'?118:190;s+=line(X(c.d),y+8,X(c.d),axisY-7,C.gold,2,'4 4')+dot(X(c.d),y,C.gold,'school-entrant',small?8:10)+tx(X(c.d)+7,y+26,`新${c.style}校 ${fmt(c.d)}km`,small?10:12,C.gold,'start',730);}
  if(f.model.current.length===0&&!f.hypothetical)s+=tx(W/2,157,'目前一所学校都没有',small?12:16,C.muted,'middle',720);
  const yy=small?324:309;s+=`<rect x="12" y="${yy-15}" width="${W-24}" height="${small?88:60}" rx="12" fill="${C.soft}" stroke="${C.rule}"/>`;
  const c1=f.after?f.after.choice1:f.model.choice1,c2=f.after?f.after.choice2:f.model.choice2;
  s+=tx(23,yy+12,`1型→${c1==='φ'?'无校':c1}；2型→${c2==='φ'?'无校':c2}`,small?10:13,C.ink,'start',720)+tx(23,yy+34,f.hypothetical?'金色是申请进入的新学校':'现有学校位置保持在同一条距离轴上',small?9:11,C.muted,'start',640);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.identity+'。'+f.narration)}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`;
 }
 function controls(){if(!$('fields'))return;$('fields').innerHTML=`<div class="field"><label for="experiment">知识点、图或习题</label><select id="experiment">${educationMarketKeys.map(k=>`<option value="${k}">${esc(educationMarketContent[k].title)}</option>`).join('')}</select></div><p class="small" id="film-progress" aria-live="polite"></p>`;$('experiment').onchange=e=>{if(!educationMarketKeys.includes(e.target.value))return;history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 function draw(){
  const f=educationMarketStory(key,step),c=educationMarketContent[key];if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;
  let brief=$('education-brief');if(!brief){brief=document.createElement('section');brief.id='education-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="education-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="education-conditions"></span></p><p class="boundary" id="education-source"></p>';$('legend')?.before(brief);}
  $('education-question').textContent=c.question;$('education-conditions').textContent=c.conditions;$('education-source').textContent=c.source;
  const plot=$('plot');if(plot){Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const small=plot.clientWidth<500,svg=f.view==='certificate'?certificateChart(f,small):f.view==='school'?schoolChart(f,small):contractChart(f,small);if(window.microMotion?.chart)window.microMotion.chart(plot,svg);else plot.innerHTML=svg;}
  if($('legend'))$('legend').textContent=f.view==='school'?'红色A校、蓝色B校、金色申请进入的新校；横轴为离城市距离。':f.view==='certificate'?'四根柱分别是两类卖家拿证与不拿证的净收入；绿色表示本幕实际选择。':key==='boundaryShare'?'本段只有H型工人；灰色L线仅作对照，红线是H的等净收入，金点为新报价。':'蓝虚线是L的等净收入线，红虚线是H的等净收入线；绿/红点为两类合同，金点为新报价。';
  let metrics;if(f.view==='certificate'){const r=f.model;metrics=[['证书报价',fmt(r.pPlus)],['无证报价',fmt(r.pMinus)],['H选择',r.choiceH==='+'?'有证':'无证'],['L选择',r.choiceL==='+'?'有证':'无证']];}
  else if(f.view==='school'){metrics=[['A校距城',f.model.current.find(x=>x.style==='A')?.d??'无'],['B校距城',f.model.current.find(x=>x.style==='B')?.d??'无'],['1型选择',f.after?.choice1??f.model.choice1],['2型选择',f.after?.choice2??f.model.choice2]];}
  else if(['d142','fig141'].includes(key)){metrics=[['L每年教育成本','3'],['H每年教育成本','1'],['L在a / b净得','4 / 4'],['H在a / b净得','6 / 8']];}
  else if(key==='d141'){metrics=[['L产值','4'],['H产值','10'],['L每年教育成本','3'],['H每年教育成本','1']];}
  else if(key==='boundaryShare'){metrics=[['L人口比例','0'],['现有工资','10'],['现有雇主利润','0'],['新店利润',f.entry?fmt(f.after.details.at(-1).profit):'未报价']];}
  else{const r=f.model,entryProfit=f.entry&&f.showCandidate?fmt(f.after.details.at(-1).profit):'未入场';metrics=key==='threshold'?[['L比例',fmt(f.params.alphaL,3)],['平均产值',fmt(r.avg)],['H净收入 m',fmt(r.m)],['新店利润',entryProfit]]:key==='d143'?[['L选择',f.current.choice.L.id],['H选择',f.current.choice.H.id],['L店利润',fmt(f.current.details.find(x=>x.id==='L')?.profit??0)],['H店利润',fmt(f.current.details.find(x=>x.id==='H')?.profit??0)]]:[['L选择',f.current.choice.L.id],['H选择',f.current.choice.H.id],['平均产值',fmt(r.avg)],['新店利润',entryProfit]];}
  if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML=`<h3>证明与计算</h3><ol>${c.proof.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h3>考试时怎么套</h3><p>${esc(c.template)}</p><h3>最容易混淆</h3><p>${esc(c.trap)}</p><p>来源：${esc(c.source)}</p>`;
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>{el.textContent=[c.question,c.conditions,c.template][i]||'';});
  const guideBoundary=document.querySelector('.study-guide>.boundary');if(guideBoundary)guideBoundary.textContent='生活人物、图14.1的具体坐标及正文数值均为本站辅助讲解；原书条件、一般证明、比例边界和章末题给定数字分别标明。';
  const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch14-education-${key}.html`;dl.textContent='下载本段完整动画代码 ↓';}
  window.microMath?.refresh?.();
 }
 function configure(next){stop();key=educationMarketKeys.includes(next)?next:educationMarketKeys[0];window.EDUCATION_MARKET_DEFAULT=key;const p=new URLSearchParams(location.search),wanted=Number(p.get('filmStep'));step=(p.get('case')===key||!p.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>configure(key);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startEducationMarketStory=startEducationMarketStory;

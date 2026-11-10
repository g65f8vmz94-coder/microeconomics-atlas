import {edgeworthKeys} from './exchange-edgeworth-story.mjs';
import {startEdgeworthStory} from './exchange-edgeworth-ui.js';
import {manipulationKeys} from './exchange-manipulation-story.mjs';
import {startManipulationStory} from './exchange-manipulation-ui.js';
import {demandKeys} from './exchange-demand-story.mjs';
import {startDemandStory} from './exchange-demand-ui.js';
import {coreKeys} from './exchange-core-story.mjs';
import {startCoreStory} from './exchange-core-ui.js';
import {welfareKeys} from './exchange-welfare-story.mjs';
import {startWelfareStory} from './exchange-welfare-ui.js';
import {reopeningKeys} from './exchange-reopening-story.mjs';
import {startReopeningStory} from './exchange-reopening-ui.js';
import {existenceKeys} from './exchange-existence-story.mjs';
import {startExistenceStory} from './exchange-existence-ui.js';
import {exchangeModelKeys} from './exchange-model-story.mjs';
import {startExchangeModelStory} from './exchange-model-ui.js';
import {equilibriumStoryKeys} from './exchange-equilibrium-story.mjs';
import {startEquilibriumStory} from './exchange-equilibrium-ui.js';
import {textbookExchange,destroyedEndowment,nonconvexExchange,fourPersonCore,externalityExchange,nonrationalDemand,linearReport,multipleExcess,spendingContradiction} from './economy.mjs';
import {launchCD} from './exchange-cd.js';
import {exercise10Cases} from './exchange-exercises.mjs';
import {startExchangeExercises} from './exchange-exercises-ui.js';
const exercise10Request=new URLSearchParams(location.search).get('case')||window.EXERCISE_DEFAULT;
const exchangeModelRequest=new URLSearchParams(location.search).get('case')||window.EXCHANGE_MODEL_DEFAULT;
const welfareRequest=new URLSearchParams(location.search).get('case')||window.WELFARE_DEFAULT;
const reopeningRequest=new URLSearchParams(location.search).get('case')||window.REOPENING_DEFAULT;
const existenceRequest=new URLSearchParams(location.search).get('case')||window.EXISTENCE_DEFAULT;
const equilibriumRequest=new URLSearchParams(location.search).get('case')||window.EQUILIBRIUM_DEFAULT;
const coreRequest=new URLSearchParams(location.search).get('case')||window.CORE_DEFAULT;
const demandRequest=new URLSearchParams(location.search).get('case')||window.DEMAND_DEFAULT;
const manipulationRequest=new URLSearchParams(location.search).get('case')||window.MANIPULATION_DEFAULT;
const edgeworthRequest=new URLSearchParams(location.search).get('case')||window.EDGEWORTH_DEFAULT;
const exchangeModelLegacy=['e1','e2','a','b','p','x','y','X','Y','price','alpha','beta','share','trade','ratio','step','old','next','delta','progress'].some(k=>new URLSearchParams(location.search).has(k));
if(window.LESSON.id==='10.1'&&(exchangeModelKeys.includes(exchangeModelRequest)||(!exchangeModelRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startExchangeModelStory(exchangeModelRequest);
else if(window.LESSON.id==='10.2'&&(equilibriumStoryKeys.includes(equilibriumRequest)||(!equilibriumRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startEquilibriumStory(equilibriumRequest);
else if(window.LESSON.id==='10.3'&&(existenceKeys.includes(existenceRequest)||(!existenceRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startExistenceStory(existenceRequest);
else if(window.LESSON.id==='10.4'&&(reopeningKeys.includes(reopeningRequest)||(!reopeningRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startReopeningStory(reopeningRequest);
else if(window.LESSON.id==='10.5'&&(welfareKeys.includes(welfareRequest)||(!welfareRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startWelfareStory(welfareRequest);
else if(window.LESSON.id==='10.6'&&(coreKeys.includes(coreRequest)||(!coreRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startCoreStory(coreRequest);
else if(window.LESSON.id==='10.7'&&(demandKeys.includes(demandRequest)||(!demandRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startDemandStory(demandRequest);
else if(window.LESSON.id==='10.8'&&(manipulationKeys.includes(manipulationRequest)||(!manipulationRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startManipulationStory(manipulationRequest);
else if(window.LESSON.id==='10.9'&&(edgeworthKeys.includes(edgeworthRequest)||(!edgeworthRequest&&!window.EXERCISE_DEFAULT&&!exchangeModelLegacy)))startEdgeworthStory(edgeworthRequest);
else if(exercise10Request in exercise10Cases&&exercise10Cases[exercise10Request].section===window.LESSON.id)startExchangeExercises(exercise10Request);
else {
const $=id=>document.getElementById(id),meta=window.LESSON;
const titles={cd:'保留实验 · 一般CD交换',substitutes:'例10.1 · 替代品：唯一价格，多种配置',complements:'例10.2 · 互补品：零价格与多重均衡',product:'例10.3 · 乘积效用与唯一均衡',destroy:'例10.2延伸 · 毁掉禀赋反而获益',multiple:'图10.2 · 连续超额需求的三个零点',nonconvex:'习题10.5 · 非凸偏好：有均衡 / 无均衡',reopen:'命题10.3 · 重开交易仍可无差异换货',welfare:'命题10.4 · 改进配置的支出矛盾',externality:'147页反例 · 外部性破坏福利结论',core:'例10.4 · 四人经济的阻挡联盟',coreproof:'命题10.5 · 联盟支出为何矛盾',nonrational:'例10.5 · 非理性化需求也可出清',report:'例10.6 · 线性偏好的真实操纵例'};
const casesBySection={'10.1':['cd','substitutes','complements'],'10.2':['substitutes','complements','product','destroy','cd'],'10.3':['multiple','nonconvex','complements','cd'],'10.4':['reopen','cd'],'10.5':['welfare','externality','cd'],'10.6':['core','coreproof','cd'],'10.7':['nonrational','multiple','cd'],'10.8':['report','destroy','cd'],'10.9':['cd','substitutes','complements','product','nonconvex','externality']};
const cases=casesBySection[meta.id],requested=new URLSearchParams(location.search).get('case'),initial=cases.includes(requested)?requested:cases[0];
$('fields').insertAdjacentHTML('beforebegin',`<div class="field"><label for="experiment">本节的具体情境</label><select id="experiment">${cases.map(k=>`<option value="${k}">${titles[k]}</option>`).join('')}</select></div>`);
const C={g:'#177468',p:'#7a6594',r:'#c35f43',m:'#69786b',line:'#d9dfd1',paper:'#fffdf7'};
const f=x=>typeof x==='number'?(Math.abs(x)<1e-10?'0':x.toLocaleString('zh-CN',{maximumFractionDigits:3})):x;
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),S=(k,label,options,value)=>({k,label,options,value});
let current=initial,state={},spec=[],last={},disposeCD=null,timer=null,labelPlacements=[],restoreInitial=true;
function configure(name){stop();if(disposeCD){disposeCD();disposeCD=null}current=name;$('experiment').value=name;$('plot').innerHTML='';
 if(name==='cd'){disposeCD=launchCD({restoreURL:restoreInitial});restoreInitial=false;window.demo.caseName='cd';return}
 spec=[];if(['substitutes','complements','product','reopen','nonrational'].includes(name))spec.push(R('alpha','A原有商品1：α',.5,10,.5,8),R('beta','B原有商品2：β',.5,10,.5,4));
 if(['substitutes','complements','product','nonconvex'].includes(name))spec.push(R('price','归一化价格 p₁（p₂=1−p₁）',0,1,.01,name==='product'?.4:.5));
 if(name==='substitutes')spec.push(R('trade','等价格时交换的比例',0,1,.05,.25));
 if(name==='complements')spec.push(R('share','免费剩余商品留给原主人的比例',0,1,.05,.5));
 if(name==='destroy')spec.push(R('gamma','A毁损后保留的商品1：γ',.1,8,.1,2));
 if(name==='multiple')spec.push(R('price','考察价格 p₁ / p₂',.5,3.5,.01,1.5));
 if(name==='nonconvex')spec.push(S('endowment','两种原禀赋',{special:'分别拥有 (2,0) / (0,1)',symmetric:'两人都拥有 (2,1)'},'symmetric'),S('cornerA','同价格时A选择哪一端',{0:'只买商品1',1:'只买商品2'},'0'),S('cornerB','同价格时B选择哪一端',{0:'只买商品1',1:'只买商品2'},'1'));
 if(name==='reopen')spec.push(R('old','第一次均衡中交换比例',0,1,.05,.25),R('next','重开后选择的交换比例',0,1,.05,.75));
 if(name==='welfare'||name==='coreproof')spec.push(R('delta',name==='coreproof'?'假设每位成员两种商品各多 δ':'假设给一人两种商品各多 δ',0,1,.05,.2),R('step','价值矛盾的推理进度',0,3,1,0));
 if(name==='coreproof')spec.push(R('members','联盟成员数',1,4,1,3));
 if(name==='core')spec.push(R('t','每位类型1原配置的两种商品量',.05,.95,.05,.1),R('r','联盟提议：每位类型1各分得 r',0,.5,.01,.2));
 if(name==='externality')spec.push(R('ratio','价格比 p₁ / p₂',.3,1.4,.01,.8),R('progress','从原配置移向共同改善',0,1,.05,0));
 if(name==='nonrational')spec.push(R('ratio','价格比 p₁ / p₂',.1,4,.01,1.5));
 if(name==='report')spec.push(R('k','A报告的商品1权重 k',.2,5,.1,3));
 state=Object.fromEntries(spec.map(c=>[c.k,c.value]));$('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label}<output id="out-${c.k}"></output></label><input type="range" id="${c.k}" data-key="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');
 if(restoreInitial){const query=new URLSearchParams(location.search);for(const c of spec){const raw=query.get(c.k);if(raw===null||!raw.trim())continue;if(c.options){if(Object.hasOwn(c.options,raw))state[c.k]=raw}else{const value=Number(raw);if(!Number.isFinite(value))continue;state[c.k]=Math.max(c.min,Math.min(c.max,value));$(c.k).dataset.filmOriginalStep=c.step;$(c.k).step='any'}}restoreInitial=false}
 $('play').onclick=play;$('advance').onclick=()=>{stop();return advance()};$('reset').onclick=()=>configure(current);window.demo={meta,caseName:name,get state(){return state},get spec(){return spec},get last(){return last},draw:draw};draw();
}
function txt(x,y,t,c=C.m,size=13,anchor='middle'){const scale=Math.min(2.1,Math.max(1,640/Math.max(280,$('plot').clientWidth)));return `<text x="${x}" y="${y}" fill="${c}" font-size="${size*scale}" text-anchor="${anchor}">${t}</text>`}
const table=(heads,rows)=>`<table><thead><tr>${heads.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function box(X,Y){const sx=x=>80+460*x/X,sy=y=>320-245*y/Y;let svg=`<rect x="80" y="75" width="460" height="245" fill="none" stroke="${C.m}"/>`;
 for(const q of [0,.5,1])svg+=txt(sx(X*q),351,f(X*q),C.g,11)+txt(66,sy(Y*q)+4,f(Y*q),C.g,11,'end');svg+=txt(80,386,'A的商品1 →',C.g,12,'start')+txt(40,40,'A商品2 ↑',C.g,12,'start')+txt(540,40,'← B的商品1；原点在右上',C.p,12,'end');
 const point=(a,label,c,id,ring=false,offset=0)=>{if(!a||a[0]<0||a[0]>X||a[1]<0||a[1]>Y)return '';const x=sx(a[0]),y=sy(a[1]),tx=Math.max(175,Math.min(440,x));let ty=(y<110?y+35:y-18)+offset,show=!!label;if(labelPlacements.some(p=>Math.hypot(x-p.x,y-p.y)<.01))show=false;if(show){for(const p of labelPlacements)if(Math.abs(tx-p.tx)<200&&Math.abs(ty-p.ty)<32)ty=ty>113?ty-38:ty+38;labelPlacements.push({x,y,tx,ty})}return `<circle data-motion="${id}" cx="${x}" cy="${y}" r="${ring?10:6}" fill="${ring?'none':c}" stroke="${c}" stroke-width="${ring?2.5:0}"/>`+(show?txt(tx,ty,label,c,12):'')};
 const curve=(fn,c)=>{let open=false,d='';for(let i=0;i<=180;i++){const x=X*i/180,y=fn(x);if(!Number.isFinite(y)||y<0||y>Y){open=false;continue}d+=(open?'L':'M')+sx(x)+','+sy(y);open=true}return `<path d="${d}" stroke="${c}" stroke-width="2" fill="none"/>`};
 const segment=(x1,y1,x2,y2,c)=>`<path d="M${sx(x1)} ${sy(y1)}L${sx(x2)} ${sy(y2)}" stroke="${c}" stroke-width="2" fill="none"/>`;
 return {X,Y,sx,sy,svg,point,curve,segment};
}
function marketFigure(r,X,Y,kind){const b=box(X,Y);let svg=b.svg;const [p,q]=r.prices;
 const wealth=r.wealth?.[0]??p*X;svg+=q?b.curve(x=>(wealth-p*x)/q,C.r):b.segment(wealth/p,0,wealth/p,Y,C.r);
 if(!r.bundles)return svg+txt(300,210,'免费商品无界：最优选择不存在',C.r,14);
 const [A,B]=r.bundles,BinA=[X-B[0],Y-B[1]];
 if(kind==='substitutes'||kind==='linear-complement')svg+=b.curve(x=>A[0]+A[1]-x,C.g);
 if(kind==='substitutes'||kind==='nonrational')svg+=b.curve(x=>X+Y-B[0]-B[1]-x,C.p);
 if(kind==='product')svg+=b.curve(x=>x>0?A[0]*A[1]/x:NaN,C.g)+b.curve(x=>x<X?Y-B[0]*B[1]/(X-x):NaN,C.p);
 if(kind==='complements'||kind==='linear-complement'){
  const a=Math.min(...A),z=Math.min(...B);if(kind==='complements'&&a<=Math.min(X,Y))svg+=b.segment(a,Y,a,a,C.g)+b.segment(a,a,X,a,C.g);if(z<=Math.min(X,Y))svg+=b.segment(X-z,0,X-z,Y-z,C.p)+b.segment(0,Y-z,X-z,Y-z,C.p);
 }
 if(kind==='nonconvex'){const u=A[0]**2+A[1]**2,v=B[0]**2+B[1]**2;svg+=b.curve(x=>Math.sqrt(u-x*x),C.g)+b.curve(x=>Y-Math.sqrt(v-(X-x)**2),C.p);}
 const coincide=Math.hypot(A[0]-BinA[0],A[1]-BinA[1])<1e-8;
 svg+=b.point(A,coincide?'两人的选择可同时实现':'A的最优选择',C.g,'A-choice')+b.point(BinA,coincide?'':'B的选择（反向读）',C.p,'B-choice',true);return svg;
}
function compareBars(before,after,labels,y=55){let svg='';const max=Math.max(1,...before,...after);for(let i=0;i<labels.length;i++){const top=y+i*105;svg+=txt(55,top,labels[i],C.m,13,'start');for(const [j,values] of [before,after].entries())svg+=`<rect data-motion="bar-${i}-${j}" x="100" y="${top+14+25*j}" width="${Math.max(0,values[i])/max*390}" height="18" fill="${j?C.p:C.g}"/>`+txt(530,top+30+25*j,f(values[i]),j?C.p:C.g,13);}return svg}
function draw(){if(current==='cd')return;labelPlacements=[];const s=state,k=current;let svg='',height=405,metrics=[],read='',formula='',extra='',warning=meta.boundary;
 if(['substitutes','complements','product'].includes(k)){
  const trade=s.trade*Math.min(s.alpha,s.beta),r=textbookExchange(k,{alpha:s.alpha,beta:s.beta,t:s.price,share:s.share??.5,trade});svg=marketFigure(r,s.alpha,s.beta,k);last=r;
  metrics=[['价格 (p₁,p₂)',r.prices.map(f).join(', ')],['有最优选择吗',r.status==='unbounded'?'不存在':'有，可能不唯一'],['两商品同时出清',r.clears?'是':'否']];
  if(r.bundles){metrics.push(['总需求减总量',r.excess.map(f).join(', ')]);extra=table(['个人','需求商品1','需求商品2','原财富','支出'],r.bundles.map((a,i)=>[i?'B':'A',...a,r.wealth[i],r.spending[i]]))+'<p>盒外最优需求完整列在表中，不会被裁成可行点；图中的两个点重合才是同时可行。</p>';}
  read=k==='substitutes'?'相同线性效用只在意两种商品总量。等价格时整条预算线都最优，改变交换比例可得到不同均衡分配；价格不等时，两人都只想买便宜商品，不能同时出清。':k==='complements'?'两人都按较少的那种商品计算效用。α=β时，不同价格把同量资源分成不同均衡配置；α≠β时，两个正价格不能同时出清，过剩商品需要零价格。免费剩余可有多种分配。':'乘积效用要求两种商品搭配，各花一半收入。唯一均衡价格比为β/α，双方都得到(α/2,β/2)。免费商品端点下至少有人没有最优需求。';
  formula=k==='substitutes'?'p₁=p₂；aA=(α−ε,ε)，aB=(ε,β−ε)，0≤ε≤min(α,β)。':k==='complements'?'正价格：aA=(αp₁,αp₁)，aB=(βp₂,βp₂)（p₁+p₂=1）。':'p₁/p₂=β/α；aA=aB=(α/2,β/2)。';
  if(r.status==='unbounded')read+=' '+r.reason;else read+=' '+r.description;
  if(r.bundles)extra+=`<p>支出恒等式：p₁z₁+p₂z₂ = ${f(r.prices[0])}×${f(r.excess[0])}+${f(r.prices[1])}×${f(r.excess[1])} = ${f(r.walras)}。两个价格都为正时，一种商品出清就推出另一种出清；若有免费商品，这个推论不成立。</p>`;
  extra+='<button data-action="equilibrium">代入该经济的均衡价格</button> <button data-action="equal-totals">令α=β，再改变价格</button>';
  if(k==='substitutes')$('trade').disabled=s.price!==.5;if(k==='complements')$('share').disabled=s.price!==0&&s.price!==1;
 }else if(k==='destroy'){
  const r=destroyedEndowment(s.gamma),a=r.after;svg=marketFigure(a,s.gamma,4,'complements');metrics=[['已毁损商品1',r.destroyed],['原均衡A的效用',r.original.utility[0]],['新均衡A的效用',a.utility[0]],['新的价格',a.prices.join(', ')]];read='最初A有8单位商品1、B有4单位商品2，过剩商品1价格为零，A的均衡效用为0。将A的禀赋减少到γ<4后，商品1变得稀缺，价格方向反转，A得到效用γ。图比较的是不同经济的均衡，并非假定沿一条实际交易路径变化。γ=4时显示一个等价格均衡，另有其他均衡。';formula='γ<β时：p=(1,0)，可取aA=(γ,γ)，uA=γ>0。';extra=table(['状态','A原禀赋','价格','A均衡消费'],[['原经济','(8,0)','(0,1)',r.original.bundles[0].map(f).join(', ')],['毁损后',`(${f(s.gamma)},0)`,a.prices.join(', '),a.bundles[0].map(f).join(', ')]]);last=r;
 }else if(k==='nonconvex'){
  const r=nonconvexExchange(s.endowment==='symmetric',s.price,+s.cornerA,+s.cornerB);svg=marketFigure(r,r.totals[0],r.totals[1],'nonconvex');metrics=[['最优需求',r.status==='unbounded'?'无界':'只在预算端点'],['当前选择出清吗',r.clears?'是':'否'],['该禀赋经济有均衡吗',s.endowment==='symmetric'?'无':'有（等价格）']];
  read='效用x₁²+x₂²的上轮廓集不凸，个体喜欢极端消费。两人分别持有(2,0)、(0,1)时，等价格下可选择原禀赋而出清；两人都持有(2,1)时，总资源为(4,2)，等价格下每人只能选(3,0)或(0,3)，四种组合都不能出清。价格不等时两人都只要便宜商品，同样不能出清。';formula='偏好非凸时，先找每户在整个预算集上的最优束，再检查能否同时出清。这里四种组合的合计需求都和库存对不上。';
  if(r.bundles)extra=table(['个人','最优选择集合','本次选择'],r.sets.map((set,i)=>[i?'B':'A',set.map(a=>'('+a.map(f).join(', ')+')').join(' 或 '),r.bundles[i].map(f).join(', ')]));extra+='<button data-action="nonconvex-exists">比较存在均衡的禀赋</button>';$('cornerA').disabled=$('cornerB').disabled=s.price!==.5;last=r;
 }else if(k==='multiple'){
  const r=multipleExcess(s.price),X=p=>80+(p-.5)/3*460,Y=z=>205-z*750;svg=`<path d="M80 55V330H540M80 205H540" stroke="${C.line}" fill="none"/>`;
  let d='';for(let i=0;i<=240;i++){const p=.5+3*i/240;d+=(i?'L':'M')+X(p)+','+Y(multipleExcess(p).z)}svg+=`<path d="${d}" stroke="${C.g}" stroke-width="2.5" fill="none"/>`;for(const p of [1,2,3])svg+=`<circle cx="${X(p)}" cy="205" r="7" fill="${C.p}"/>`+txt(X(p),350,p,C.m,12);for(const z of [-.15,0,.15])svg+=txt(70,Y(z)+5,z,C.m,11,'end');svg+=`<circle data-motion="current-price" cx="${X(s.price)}" cy="${Y(r.z)}" r="8" fill="${C.r}"/>`+txt(80,30,'商品1超额需求 z₁',C.m,13,'start')+txt(540,390,'价格比 p₁/p₂',C.m,13,'end');
  metrics=[['当前超额需求',r.z],['零点数量（本构造）',3],['另一商品超额需求',-s.price*r.z]];read='连续、低价为正、高价为负，保证至少一个零点；图上三次穿过零线，三个价格都能出清。本站用原创函数描绘教材图10.2中的交点。该算例直接给定满足预算平衡的连续需求。命题10.2还要求这些需求确为个人最优。';formula='z₁(p)=−0.1(p−1)(p−2)(p−3)/[1+((p−2)/2)⁶]；z₂(p)=−pz₁(p)。';extra='<button data-action="next-root">比较下一个零点</button><p>原命题推理：个人需求连续 ⇒ 总超额需求连续；低高价符号相反 ⇒ 介值定理给z₁=0；正价格与预算线价值相等 ⇒ z₂=0。本构造的两人禀赋各(5,5)，每人需求(5+z₁/2,5−pz₁/2)，全为非负且预算平衡。</p>';last=r;
 }else if(k==='reopen'){
  const epsilon=s.old*Math.min(s.alpha,s.beta),next=s.next*Math.min(s.alpha,s.beta),old=textbookExchange('substitutes',{alpha:s.alpha,beta:s.beta,t:.5,trade:epsilon}),r=textbookExchange('substitutes',{alpha:s.alpha,beta:s.beta,t:.5,trade:next});svg=marketFigure(r,s.alpha,s.beta,'substitutes');const b=box(s.alpha,s.beta);svg+=b.point(old.bundles[0],'第一次均衡消费',C.r,'old-allocation',true);metrics=[['A旧禀赋价值',s.alpha/2],['A第一次均衡消费价值',old.spending[0]],['A重开后消费价值',r.spending[0]],['A效用前后',f(old.utility[0])+' → '+f(r.utility[0])]];read='以均衡消费作为新禀赋，原价格下预算集不变，原消费仍然最优。但弱偏好下还可能进行双方无差异的新交易；出现并列最优时，可以保留原分配，也可以在双方同样喜欢的消费束之间继续交换。';formula='pa(i)=pe(i) ⇒ B(p,a(i))=B(p,e(i))；原(p,a)继续是均衡。';extra=table(['个人','第一次均衡消费','重开后的另一个最优消费'],r.bundles.map((a,i)=>[i?'B':'A',old.bundles[i].map(f).join(', '),a.map(f).join(', ')]));last={old,...r};
 }else if(k==='core'){
  const r=fourPersonCore(s.t,s.r);height=440;svg=compareBars(r.utilities.slice(0,3),r.after,['类型1成员 A₁','类型1成员 A₂','类型2成员 B₁']);metrics=[['原配置帕累托有效吗','是'],['原配置个体理性吗',r.individuallyRational?'是':'否'],['这个联盟提议能阻挡吗',r.blocking?'能，三人都严格改善':'不能'],['原配置在核心吗',r.inCore?'是':r.singletonBlock?'否：单人已可拒绝':'否：三人联盟可拒绝']];read='原经济四个人的总资源为(2,2)。原配置每位类型1得(t,t)，每位类型2得(1−t,1−t)，全部都是帕累托有效配置。核心还要求没有小联盟能带走自己的原禀赋后一起改善；两位类型1和一位类型2的原资源是(2,1)。';formula='联盟提议：A₁=A₂=(r,r)，B₁=(2−2r,1−2r)；可行要求0≤r≤1/2。';extra=table(['联盟成员','原配置效用','联盟内新消费','新效用'],r.proposal.map((a,i)=>[['A₁','A₂','B₁'][i],r.utilities[i],a.map(f).join(', '),r.after[i]]))+'<button data-action="core-witness">代入一个严格改善的提议</button><p>t=0.1、r=0.2就是教材例10.4：B₁得(1.6,0.6)，三人均严格改善。联盟只动用自身原禀赋，未承诺外部人维持原消费。t>0.5时类型2单人保留(0,1)就更好；t=0.5为竞争均衡，属于核心。每人只比较自己的前后效用，不比较不同人的效用强度。</p>';last=r;
 }else if(k==='externality'){
  const r=externalityExchange(s.ratio,s.progress),b=box(1,1);svg=b.svg+b.segment(0,.5,1,0,C.line)+b.point([1,0],'原配置',C.r,'initial')+b.point(r.A,'共同改善中的配置',C.g,'joint');metrics=[['原配置在当前价格下是均衡吗',r.endowmentIsEquilibrium?'是':'否'],['A的真实效用',r.utilities[0]],['B的真实效用',r.utilities[1]],['双方均严格改善',r.gains.every(x=>x>1e-9)?'是':'否']];read='A除了自己的消费，还受到B消费商品2的负面影响。价格比在[2/3,1]时，双方在把对方消费当作给定的条件下都愿意保留原禀赋；然而协调改变两人的消费可以同时变好。福利结论所需的“只关心自己的消费”在这里不成立。';formula='uA=xA₁+xA₂−2xB₂；uB=2xB₁+3xB₂。';extra=table(['个人','原效用','当前效用','原财富','当前消费支出'],[0,1].map(i=>[i?'B':'A',r.before[i],r.utilities[i],i?1:s.ratio,r.costs[i]]))+'<p>终点A=(0,0.5)、B=(1,0.5)，效用从(−1,3)变为(−0.5,3.5)。这项共同改善不必同时满足原价格下的个人预算；图中的变化是可行配置的比较。</p>';last=r;
 }else if(k==='nonrational'){
  const r=nonrationalDemand(s.alpha,s.beta,s.ratio),p=s.ratio/(1+s.ratio),model={...r,prices:[p,1-p]};svg=marketFigure(model,s.alpha,s.beta,'nonrational');metrics=[['A总选哪种商品','贵的（同价选1）'],['B总选哪种商品','便宜的（同价可选2）'],['是否出清',r.clears?'是':'否'],['额外低价均衡比',r.additional??'不存在']];read='A总买更贵的商品，这个需求不能被单调偏好理性化；B仍按x₁+x₂最大化。在价格比≥1时可取不交易配置形成均衡。若β<α，还有一个价格比β/α<1的换货均衡。市场出清本身不认证需求理性。';formula='p₁/p₂≥1：a=e；若β<α，另有p₁/p₂=β/α、aA=(0,β)、aB=(α,0)。';extra='<button data-action="nonrational-low">代入额外的低价均衡</button>'+table(['个人','实际需求商品1','实际需求商品2'],r.bundles.map((a,i)=>[i?'B':'A',...a]))+'<p>图中只为B画线性无差异线，没有为A虚构可理性化其需求的偏好曲线。</p>';last=r;
 }else if(k==='report'){
  const r=linearReport(s.k),p=s.k/(1+s.k);svg=marketFigure({prices:[p,1-p],bundles:r.allocation},1,1,'linear-complement');const b=box(1,1);svg+=b.point([.5,.5],'诚实报告的配置',C.r,'honest');metrics=[['报告后的价格比',s.k],['A诚实报告时真实效用',1],['A改报后真实效用',r.trueUtilities[0]],['A真实获益',r.gain]];read='A真实偏好为x₁+x₂，B为min{x₁,x₂}，原禀赋(1,0)与(0,1)。A装作效用是kx₁+x₂后，均衡价格比变为k。判断是否获益仍用A真实的线性偏好；图中A的两种商品同时增加，B的搭配消费减少。';formula='p=(k,1)，aA=(k/(1+k),k/(1+k))，uA=2k/(1+k)。';extra='<button data-action="report-honest">代入诚实 k=1</button> <button data-action="report-book">代入教材 k=3</button>'+table(['个人','均衡消费','真实效用'],r.allocation.map((a,i)=>[i?'B':'A',a.map(f).join(', '),r.trueUtilities[i]]))+'<p>这里只在“收集需求报告后计算出清结果”的机制层面比较操纵，不把单个价格接受者的最优化解释为能直接指定市场价格。A的真实无差异线为直线；图中折线只用于B的互补偏好。</p>';last=r;
 }else{
  const members=k==='coreproof'?s.members:2,r=spendingContradiction(s.delta,members,k==='coreproof');svg=compareBars([r.baselineCost],[s.step>=2?r.proposedCost:r.baselineCost],[k==='coreproof'?'联盟资源的总价值':'全经济资源的总价值'],90)+txt(60,300,s.delta===0?'没有严格改善，不能产生严格矛盾':s.step>=3?'价值超过可用资源：与可行性矛盾':s.step===2?'严格改善使总支出严格超出':s.step===1?'至少一样好的人：支出不低于原财富':'先固定竞争均衡与原价格',s.step>=3&&s.delta>0?C.r:C.m,13,'start');metrics=[['原资源总价值',r.baselineCost],['假设改进所需的总价值',r.proposedCost],['超出原资源价值',r.excessValue]];read=k==='coreproof'?'若一个联盟能让每个成员严格改善，那么由原消费最优，每人的新消费都必须比自身原禀赋更贵。加总后，联盟新消费价值严格大于它拥有的原资源价值，与只用自身原资源的可行性矛盾。':'先假设每个人至少一样好，某个人严格改善。个人最优与单调性给：每个新消费支出不低于原财富，至少一人的支出严格更高。加总支出超过固定总资源价值，矛盾。图中用对称消费演示这条加总逻辑。';formula=k==='coreproof'?'∀i∈S，pb(i)>pe(i) ⇒ pΣb(i)>pΣe(i)，与Σb=Σe矛盾。':'y(i)≽a(i) ⇒ py(i)≥pe(i)；至少一人严格改善 ⇒ pΣy>pΣe。';extra='<p>每位成员原有(1,1)、价格(1,1)。'+(k==='coreproof'?'联盟每位成员都假设得到两种商品各多δ。':'只假设一人两种商品各多δ，其他人不变。')+'δ=0并无严格改善，因此不会产生严格矛盾。一般证明的成立条件仍保留在公式与文字中。</p>';last=r;
 }
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 600 ${height}" role="img" aria-label="${titles[k]}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);$('legend').textContent=['core','welfare','coreproof'].includes(k)?'每组绿条：原值　紫条：新值；分别比较，不作人际效用加总':k==='multiple'?'紫点：出清零点　红点：当前价格；曲线仅为连续性示意':'绿：A　紫：B（右上原点反读）　赤：预算 / 原配置；图外需求见表';$('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${f(v)}</strong></div>`).join('');$('reading').textContent=read;$('formula').textContent=formula;$('extra').innerHTML=extra;$('boundary').textContent=warning;spec.forEach(c=>{$(c.k).value=s[c.k];if($('out-'+c.k))$('out-'+c.k).value=f(s[c.k])});
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function apply(action){
 if(action==='equilibrium'){state.price=current==='substitutes'?.5:current==='product'?state.beta/(state.alpha+state.beta):state.alpha>state.beta?0:state.beta>state.alpha?1:.5}
 if(action==='equal-totals')state.alpha=state.beta;
 if(action==='nonconvex-exists'){state.endowment='special';state.price=.5;state.cornerA='0';state.cornerB='1'}
 if(action==='next-root')state.price=state.price<1?1:state.price<2?2:state.price<3?3:1;
 if(action==='core-witness'){if(last.witness!==null)state.r=last.witness;else if(state.t>.5){state.t=.1;state.r=.2;}}
 if(action==='nonrational-low'){if(state.beta>=state.alpha){state.alpha=8;state.beta=4;}state.ratio=state.beta/state.alpha;}
 if(action==='report-honest')state.k=1;if(action==='report-book')state.k=3;draw();
}
function advance(){
 if(['substitutes','complements','product'].includes(current)){apply('equilibrium');return true}
 if(current==='nonconvex'){state.price=.5;state.cornerB=state.cornerB==='0'?'1':'0';draw();return true}
 if(current==='multiple'){apply('next-root');return true}
 if(current==='destroy'){state.gamma=state.gamma<4?5:2;draw();return true}
 if(current==='core'){apply('core-witness');return true}
 if(current==='nonrational'){apply('nonrational-low');return true}
 if(current==='report'){apply(state.k===3?'report-honest':'report-book');return true}
 const k=current==='reopen'?'next':current==='externality'?'progress':'step',c=spec.find(x=>x.k===k);state[k]=Math.min(c.max,state[k]+(k==='step'?1:.2));draw();return state[k]>=c.max;
}
function play(){if(timer){stop();return}if(advance()||window.microMotion.reduced.matches)return;let n=0;timer=setInterval(()=>{if(advance()||++n>=8)stop()},1500);$('play').textContent='暂停'}
$('experiment').onchange=e=>configure(e.target.value);$('fields').addEventListener('input',e=>{if(current==='cd')return;const c=spec.find(c=>c.k===e.target.dataset.key);if(!c)return;stop();state[c.k]=c.options?e.target.value:+e.target.value;draw()});$('extra').addEventListener('click',e=>{if(current==='cd')return;const b=e.target.closest('[data-action]');if(!b)return;stop();apply(b.dataset.action);$('extra').querySelector(`[data-action="${b.dataset.action}"]`)?.focus({preventScroll:true})});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',()=>{if(current!=='cd')draw()});configure(initial);

}

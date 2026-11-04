import {utilityC,demandC,hicksC,slutskyC,warpC,sourceWarp,rationalizationC,mrsC,localDerivativesC,normalMRSC,budgetC,existenceCounter} from './consumer.mjs';
import {exercise5Cases} from './consumer-exercises.mjs';
import {startConsumerExercises} from './consumer-exercises-ui.js';
import {consumerStories} from './consumer-story.mjs';
import {renderConsumerStory} from './consumer-story-ui.js';
const exercise5Request=new URLSearchParams(location.search).get('case')||window.EXERCISE_DEFAULT;
if(exercise5Request in exercise5Cases&&exercise5Cases[exercise5Request].section===window.LESSON.id)startConsumerExercises(exercise5Request);
else {
const $=id=>document.getElementById(id),meta=window.LESSON;
const caseTitles={budget:'定义5.1 · 预算集、同比缩放与禀赋',rules:'例5.1—5.4 · 四种需求规则',homogeneous:'定义5.2 · 同一个预算集应有同一个选择',optimum:'理性选择 · 切点、折点与多解',existence:'命题5.1 · 存在、唯一与花完预算',mrs:'命题5.2 · MRS 的内点与角点条件',corners:'例5.8 · 拟线性偏好角点到内点',rationalize:'例5.9—5.10 · 检验一种效用解释',warp:'例5.11 · 反向选择与 WARP',curves:'定义5.8 · 自价格、交叉价格与 Engel 曲线',normal:'命题5.4 · MRS 与正常品的几何关系',slutsky:'三点分解 · Slutsky / Hicks 补偿',property:'命题5.5 · 补偿价格变化的支出矛盾',giffen:'定义5.9 · 可由偏好解释的局部吉芬情形'};
const bySection={'5.1':['budget'],'5.2':['rules','homogeneous','curves'],'5.3':['optimum','existence'],'5.4':['mrs','optimum','corners'],'5.5':['rationalize','warp'],'5.6':['curves','normal','slutsky','property','giffen']};
const cases=bySection[meta.id]||['budget'],requested=new URLSearchParams(location.search).get('case')||window.CONSUMER_DEFAULT;
$('fields').insertAdjacentHTML('beforebegin',`<div class="field"><label for="experiment">本节的具体情境</label><select id="experiment">${cases.map(k=>`<option value="${k}">${caseTitles[k]||k}</option>`).join('')}</select></div>`);
const C={g:'#177468',p:'#7a6594',r:'#c35f43',m:'#69786b',line:'#d9dfd1',paper:'#fffdf7'};
const names={cd:'Cobb–Douglas：x₁^α x₂^(1−α)',product:'例5.7：x₁x₂',linear:'例5.6：x₁+x₂',complement:'例5.5：min{x₁,x₂}',quasi:'例5.8：x₁+√x₂',ideal:'独立构造：最喜欢 (3,3)',giffen:'独立构造：min{x₁+x₂, 4x₁+2x₂−12}'};
const rules={cheaper:'例5.1：只买便宜商品（同价均分支出）',equal:'例5.2：两种商品数量相同',half:'例5.3：每种商品支出一半',cap:'例5.4：商品1先买至7单位'};
const utilityText={cd:'u=x₁^α x₂^(1−α)；x₁=αw/p₁，x₂=(1−α)w/p₂',product:'u=x₁x₂；x₁=w/(2p₁)，x₂=w/(2p₂)',linear:'u=x₁+x₂；买便宜的一种；同价时整条预算线都最优',complement:'u=min{x₁,x₂}；x₁=x₂=w/(p₁+p₂)',quasi:'u=x₁+√x₂；x₂=min{w/p₂,(p₁/(2p₂))²}，x₁=(w−p₂x₂)/p₁',ideal:'u=−[(x₁−3)²+(x₂−3)²]；预算允许时选 (3,3)，不必花光收入',giffen:'u=min{x₁+x₂,4x₁+2x₂−12}；折线处 3x₁+x₂=12'};
const f=x=>typeof x==='number'?(Math.abs(x)<1e-8?'0':x.toLocaleString('zh-CN',{maximumFractionDigits:3})):x;
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),S=(k,label,options,value)=>({k,label,options,value});
let current='',state={},spec=[],last={},timer=null,placed=[],domains=[],chartIndex=0;
function configure(k){stop();current=k;domains=[];$('experiment').value=k;$('plot').innerHTML='';spec=[];
 if(meta.id.startsWith('5.')){
  const story=consumerStories[k]||consumerStories.budget;
  const animated=['budget','homogeneous','optimum','existence','mrs','corners','rationalize','warp','curves','normal','property','giffen','slutsky'].includes(k),key=animated?'filmStep':'step',increment=animated?.1:1;
  spec=[R(key,'讲解画面',0,story.frames.length-1,increment,0)];
  state=Object.fromEntries(spec.map(c=>[c.k,c.value]));
  const params=new URLSearchParams(location.search),targetCase=params.get('case')||requested||cases[0],raw=targetCase===k?(params.get('filmStep')??params.get('step')):null,n=Number(raw);
  if(raw!==null&&raw.trim()!==''&&Number.isFinite(n))state[key]=Math.max(0,Math.min(story.frames.length-1,n));
  $('fields').innerHTML=`<div class="field"><label for="${key}">讲解画面 <output id="out-${key}">${state[key]}</output></label><input id="${key}" data-key="${key}" type="range" min="0" max="${story.frames.length-1}" step="${animated?'any':increment}"${animated?` data-film-original-step="${increment}"`:''} value="${state[key]}"></div>`;
  draw();
  return;
 }
 if(k==='budget')spec.push(S('endowed','财富来源',{cash:'外生收入',endowment:'禀赋 (4,4) 的市场价值'},'cash'),R('scale','价格和财富同时乘 λ',.25,4,.25,2),R('mix','预算线两端的凸组合 θ',0,1,.05,.5));
 if(k==='rules'||k==='homogeneous')spec.push(S('rule','直接观察的选择规则',rules,'cheaper'));
 if(k==='homogeneous')spec.push(R('scale','价格和财富同时乘 λ',.25,4,.25,2));
 if(['optimum','existence','mrs','curves','normal','slutsky'].includes(k)){
  let models={...names};if(k!=='optimum'&&k!=='existence')delete models.ideal;if(k==='mrs'){delete models.giffen;delete models.complement}if(k==='normal')models={cd:names.cd,quasi:names.quasi};if(k==='existence')models={cd:names.cd,linear:names.linear,complement:names.complement,ideal:names.ideal,discontinuous:'独立反例：连续性被撤去'};
  spec.push(S('model','偏好模型',models,k==='mrs'?'quasi':k==='existence'?'cd':'cd'));
 }
 if(k==='existence')spec.push(R('progress','反例中 x₁ 接近1的程度',.5,.999,.001,.9));
 if(k==='rationalize')spec.push(S('rule','试图解释的需求规则',{cheaper:rules.cheaper,half:rules.half,expensive:'例5.11：只买贵的商品（同价买商品1）'},'cheaper'),S('candidate','候选效用',{linear:'x₁+x₂',product:'x₁x₂',max:'max{x₁,x₂}',quadratic:'x₁²+x₂²'},'max'));
 if(k==='warp'){
  const z=sourceWarp();spec.push(R('p','第一次 p₁',.5,3,.05,z.first.prices[0]),R('q','第一次 p₂',.5,3,.05,z.first.prices[1]),R('w','第一次财富',1,8,.1,2),R('share','第一次用于商品1的支出比例',0,1,.05,0),R('pB','第二次 p₁',.5,3,.05,2),R('qB','第二次 p₂',.5,3,.05,1),R('wB','第二次财富',1,8,.1,2),R('shareB','第二次用于商品1的支出比例',0,1,.05,1));
 }else{
  spec.push(R('p','商品1价格 p₁',k==='giffen'?1.05:.5,k==='giffen'?1.95:4,.05,k==='giffen'?1.5:k==='mrs'?3:1),R('q','商品2价格 p₂',.5,4,.05,1),R('w','财富 w',.5,24,.25,k==='giffen'?10:k==='mrs'?1:12));
 }
 if(['optimum','existence','mrs','curves','normal','slutsky'].includes(k))spec.push(R('alpha','CD中商品1的权重 α',.1,.9,.05,.5));
 if(k==='curves')spec.push(S('curve','右图画什么',{own:'x₁ 对 p₁：自价格需求',cross:'x₂ 对 p₁：交叉价格需求',engel:'x₁ 对 w：Engel曲线'},'own'));
 if(k==='normal')spec.push(R('deltaW','增加财富 Δw',0,12,.5,4));
 if(k==='slutsky')spec.push(R('newP','变化后 p₁′',.5,4,.05,2),S('method','补偿标准',{slutsky:'Slutsky：旧束刚好可负担',hicks:'Hicks：旧效用保持不变'},'slutsky'),R('step','A → B → C 的进度',0,2,1,0));
 if(k==='property')spec.push(R('newP','提高后的商品1价格 p₁′',1.1,4,.05,2),R('hypothesis','假设的补偿后商品1数量 / 原数量',.3,1.8,.05,1.4),R('step','证明进度',0,3,1,0));
 state=Object.fromEntries(spec.map(c=>[c.k,c.value]));const params=new URLSearchParams(location.search);if(params.get('case')===k)for(const c of spec)if(c.options&&Object.hasOwn(c.options,params.get(c.k)))state[c.k]=params.get(c.k);if(state.model==='giffen'){state.p=1.5;state.q=1;state.w=10}
 $('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label}<output id="out-${c.k}"></output></label><input type="range" id="${c.k}" data-key="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');draw();
}
function txt(x,y,t,c=C.m,size=13,anchor='middle'){const width=$('plot').clientWidth,panelWidth=['curves','giffen'].includes(current)&&width>=800?width/2:width,scale=Math.min(1.9,Math.max(1,610/Math.max(280,panelWidth)));return `<text x="${x}" y="${y}" fill="${c}" font-size="${size*scale}" text-anchor="${anchor}">${t}</text>`}
const table=(heads,rows)=>`<table><thead><tr>${heads.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function chart(X,Y,{top=65,bottom=320,xlabel='商品1：x₁',ylabel='商品2：x₂',xmin=0}={}){
 const previous=domains[chartIndex];X=Math.max(X,previous?.X??X);Y=Math.max(Y,previous?.Y??Y);domains[chartIndex++]={X,Y};
 const sx=x=>80+440*(x-xmin)/(X-xmin),sy=y=>bottom-(bottom-top)*y/Y;
 let svg=`<path d="M80 ${top}V${bottom}H520" stroke="${C.m}" stroke-width="1.5" fill="none"/>`;
 for(const a of [.5,1])svg+=`<path d="M${sx(xmin+(X-xmin)*a)} ${top}V${bottom}M80 ${sy(Y*a)}H520" stroke="${C.line}" fill="none"/>`+txt(sx(xmin+(X-xmin)*a),bottom+27,f(xmin+(X-xmin)*a),C.m,11)+txt(67,sy(Y*a)+5,f(Y*a),C.m,11,'end');
 if(xmin)svg+=txt(80,bottom+27,f(xmin),C.m,11);
 svg+=txt(520,bottom+70,xlabel,C.m,12,'end')+txt(80,top-28,ylabel,C.m,12,'start');
 const line=(a,b,c,dash=false)=>`<path d="M${sx(a[0])} ${sy(a[1])}L${sx(b[0])} ${sy(b[1])}" stroke="${c}" stroke-width="2" fill="none" ${dash?'stroke-dasharray="5 5"':''}/>`;
 const curve=(fn,c,dash=false,steps=180)=>{let d='',open=false,prev=null;for(let i=0;i<=steps;i++){const x=xmin+(X-xmin)*i/steps,y=fn(x);if(!Number.isFinite(y)||y<0||y>Y||(prev!==null&&Math.abs(y-prev)>Y*.3)){open=false;prev=Number.isFinite(y)?y:null;continue}d+=(open?'L':'M')+sx(x)+','+sy(y);open=true;prev=y}return `<path d="${d}" stroke="${c}" stroke-width="2.5" fill="none" ${dash?'stroke-dasharray="5 5"':''}/>`};
 const point=(a,label,c,id,ring=false)=>{const [x,y]=a;if(x<0||x>X+1e-6||y<0||y>Y+1e-6)return '';const px=sx(x),py=sy(y),same=placed.some(z=>Math.hypot(z.px-px,z.py-py)<1);let tx=Math.max(155,Math.min(455,px)),ty=py<top+45?py+40:py-25;if(!same&&label){for(const z of placed)if(Math.abs(tx-z.tx)<210&&Math.abs(ty-z.ty)<32)ty=ty>top+80?ty-37:ty+37;placed.push({px,py,tx,ty})}return `<circle data-motion="${id}" cx="${px}" cy="${py}" r="${ring?10:6}" fill="${ring?'none':c}" stroke="${c}" stroke-width="${ring?2.5:0}"/>`+(!same&&label?txt(tx,ty,label,c,12):'')};
 return {svg,sx,sy,line,curve,point,X,Y};
}
function budgetLine(b,p,q,w,c,dash=false){return b.curve(x=>(w-p*x)/q,c,dash)}
function indifference(b,model,u,a=.5,c=C.g){
 if(model==='complement')return b.line([u,b.Y],[u,u],c)+b.line([u,u],[b.X,u],c);
 if(model==='ideal'){let d='',open=false;for(let i=0;i<=360;i++){const angle=2*Math.PI*i/360,x=3+Math.sqrt(-u)*Math.cos(angle),y=3+Math.sqrt(-u)*Math.sin(angle);if(x<0||x>b.X||y<0||y>b.Y){open=false;continue}d+=`${open?'L':'M'}${b.sx(x)},${b.sy(y)} `;open=true}return `<path d="${d}" fill="none" stroke="${c}" stroke-width="2"/>`}
 return b.curve(x=>model==='linear'?u-x:model==='product'?x>0?u/x:NaN:model==='quasi'?u>=x?(u-x)**2:NaN:model==='max'?x<u?u:NaN:model==='quadratic'?Math.sqrt(u-x*x):model==='giffen'?Math.max(u-x,(u+12-4*x)/2):x>0?(u/x**a)**(1/(1-a)):NaN,c);
}
function consumption(p,q,w,model='cd',a=.5,additional=[]){const r=demandC(model,p,q,w,a),points=[r.bundle,...additional],X=Math.max(w/p,...points.map(x=>x[0]),1)*1.1,Y=Math.max(w/q,...points.map(x=>x[1]),1)*1.1,b=chart(X,Y);return {b,r,svg:b.svg+budgetLine(b,p,q,w,C.r)+indifference(b,model,r.u,a)}}
function sourceNote(){return '<details><summary>原书两处图文校准与同价分支</summary><p>印刷页58正文把纵轴截距写作 w/p₁；预算约束与同页图给出的正确值是 w/p₂。印刷页65图5.4(b)角点旁的不等号与命题5.2不一致：x₁=0时应为 MRS≤p₁/p₂。程序按预算约束与命题条件计算。</p><p>例5.9另说“只买便宜商品”的规则可由 max{x₁,x₂} 或 x₁²+x₂² 解释；例5.1却规定同价时均分。这时均分点不最大化这两种非凸效用，所以该补充说法需要排除同价预算或修改平局规则。把两种价格都设为1即可检查。</p></details>'}
function draw(){
 if(meta.id.startsWith('5.')){
  renderConsumerStory(meta, current, Number(state.filmStep??state.step??0));
  return;
 }
 placed=[];chartIndex=0;const s=state,k=current,p=s.p,q=s.q,w=s.w,a=s.alpha??.5,model=s.model??'cd';let svg='',height=410,svgWidth=600,metrics=[],reading='',formula='',extra='',boundary=meta.boundary,legend='红线：预算约束　绿色：选择 / 无差异曲线　紫色：比较对象';
 if(k==='budget'){
  const r=budgetC(p,q,w,s.scale,s.endowed==='endowment'),X=Math.max(r.current[0],8)*1.1,Y=Math.max(r.current[1],8)*1.1,b=chart(X,Y),z=[s.mix*r.current[0],(1-s.mix)*r.current[1]];svg=b.svg+budgetLine(b,1,1,8,C.p,true)+budgetLine(b,p,q,r.wealth,C.r)+b.point(z,'凸组合仍在预算内',C.g,'choice');
  if(s.endowed==='endowment')svg+=b.point([4,4],'原禀赋',C.p,'endowment',true);
  metrics=[['横轴截距 w/p₁',r.current[0]],['纵轴截距 w/p₂',r.current[1]],['同时缩放后的两个截距',r.scaled.map(f).join(' / ')],['当前财富',r.wealth]];reading='预算集是红线与两坐标轴围成的闭三角形。红线两端以及它们的凸组合都能负担；线下同样可行。紫虚线固定为价格(1,1)、财富8的参考预算。'+(s.endowed==='endowment'?'价格改变时，禀赋本身不变，出售禀赋能取得的财富改变，所以新预算线仍经过 (4,4)。':'价格与外生财富分别改变时，预算集会旋转或平移。');formula='B(p,w)={x≥0：p₁x₁+p₂x₂≤w}；B(λp,λw)=B(p,w)，λ>0';extra=table(['缩放对象','原值','缩放后'],[['p₁',p,s.scale*p],['p₂',q,s.scale*q],['w',r.wealth,s.scale*r.wealth]])+sourceNote();last=r;
 }else if(k==='rules'||k==='homogeneous'){
  const r=demandC(s.rule,p,q,w),b=chart(w/p*1.12,w/q*1.12),scaled=demandC(s.rule,(s.scale??1)*p,(s.scale??1)*q,(s.scale??1)*w);svg=b.svg+budgetLine(b,p,q,w,C.r)+b.point(r.bundle,'规则给出的选择',C.g,'choice')+(k==='homogeneous'?b.point(scaled.bundle,'同比缩放后重合',C.p,'scaled',true):'');metrics=[['商品1数量',r.bundle[0]],['商品2数量',r.bundle[1]],['支出 / 财富',f(r.spending)+' / '+f(w)]];
  const explanations={cheaper:'价格不同就把钱全部用于便宜商品。同价时，严格按例5.1把支出均分；这是一条确定的平局规则。',equal:'无论相对价格如何变化，都选择两种商品相同的数量；“数量相同”与“支出各半”不同。',half:'每种商品用掉一半财富。价格越高的一种，买到的数量越少。',cap:'先买商品1，买到7单位就停止增加，把剩余财富用于商品2。财富不足时买不起7单位，商品2为零。'};reading=explanations[s.rule]+(k==='homogeneous'?' 同比缩放不改变预算集。需求函数把预算集映射到一个选择，所以这里四种规则都给出相同的选择；齐次性本身并没有证明规则可由偏好理性化。':' 这些先作为行为规则陈列，尚未假定消费者求解了某个效用最大化问题。');formula={cheaper:p===q?'p₁=p₂：x=(w/(2p₁),w/(2p₂))':'价格低的一种取得全部支出',equal:'x₁=x₂=w/(p₁+p₂)',half:'x₁=w/(2p₁)，x₂=w/(2p₂)',cap:'x₁=min{7,w/p₁}，x₂=(w−p₁x₁)/p₂'}[s.rule];extra=k==='homogeneous'?table(['预算表示','p₁','p₂','w','所选束'],[['原表示',p,q,w,r.bundle.map(f).join(', ')],['同比表示',s.scale*p,s.scale*q,s.scale*w,scaled.bundle.map(f).join(', ')]])+'<p>“同一预算集有同一选择”来自需求函数的定义；跨预算的偏好解释还需要额外一致性。</p>':'';last={r,scaled};
 }else if(k==='existence'&&model==='discontinuous'){
  const r=existenceCounter(s.progress),b=chart(1.1,1.1,{ylabel:'效用 u',xlabel:'预算线上考察的 x₁'});svg=b.svg+b.line([0,0],[1,1],C.g)+b.point([1,1],'上确界1未达到',C.g,'supremum',true)+b.point([1,0],'边界点效用突降',C.r,'boundary')+b.point([r.bundle[0],r.utility],'当前值',C.p,'choice');metrics=[['当前效用',r.utility],['还有更好的可行效用',r.nextUtility],['最大值是否存在','不存在']];reading='独立构造：预算是 x₁+x₂≤1，定义 u=x₁（x₁<1），而 x₁=1 时 u=0。任意 x₁<1 都可移到 (1+x₁)/2 得到更高效用；唯一能取 x₁=1 的端点却降到零。紧预算集本身不够，连续性不能省略。';formula='u(x₁,x₂)=x₁ if x₁<1；u(1,0)=0；sup u=1，却没有 argmax';extra='<p>该反例不假设单调性，不属于后面 MRS 命题的适用范围。上方横轴是商品1数量，纵轴是效用，不能把此图当作消费空间的预算图。</p>';legend='绿线：可行点对应效用　空心圈：未达到的极限　红点：不连续的端点';last=r;
 }else if(['optimum','existence','mrs'].includes(k)){
  const r=demandC(model,p,q,w,a),extraPoints=model==='ideal'?[[3,3]]:[],z=consumption(p,q,w,model,a,extraPoints),b=z.b;svg=z.svg;
  if(model==='linear'&&p===q)svg+=b.line([w/p,0],[0,w/q],C.g);
  svg+=b.point(r.bundle,'当前最优选择',C.g,'choice');if(model==='ideal')svg+=b.point([3,3],'理想点',C.p,'ideal',true);
  const mrs=mrsC(model,...r.bundle,a),corner=r.bundle[0]<1e-7?'x₁=0':r.bundle[1]<1e-7?'x₂=0':'内点',unique=!(model==='linear'&&p===q);
  metrics=[['最优束',r.bundle.map(f).join(' , ')],['未花费的财富',Math.max(0,w-r.spending)],['本例最优束唯一',unique?'是':'否：整段预算线'],...(k==='mrs'?[['MRS',mrs===null?'不适用':mrs],['价格比 p₁/p₂',p/q]]:[])];formula=utilityText[model];
  reading=k==='existence'?'正价格和有限财富使预算集非空、闭且有界；连续效用在其上取得最大值。严格凸偏好保证至多一个最优束，但并非唯一性的必要条件：互补品也可唯一。单调性才保证预算线取等号；切换理想点模型，并提高财富，便会有钱留存。':k==='mrs'?`当前是${corner}。光滑、单调、凸偏好下，内点要求 MRS=p₁/p₂；商品1为零要求 MRS≤p₁/p₂，商品2为零要求 MRS≥p₁/p₂。拟线性模型在财富较低时出现商品1为零的角点。`:'先判断预算可行，再比较所有可行选择。CD与乘积效用在内点相切；互补品在折点最优；拟线性可能选角点；线性效用在同价时有整段最优选择。';
  if(k==='mrs'){formula+=`；MRS=MU₁/MU₂=−无差异曲线斜率；当前 ${corner}，MRS ${r.bundle[0]<1e-7?'≤':r.bundle[1]<1e-7?'≥':'='} p₁/p₂`;reading+=' MRS表示在保持效用的局部变动中，为多得一单位商品1愿放弃的商品2数量；本章取正值。'}
  extra=(model==='complement'?'<p>折点没有通常意义下的单一 MRS；用两侧斜率夹住价格比或直接比较可行效用。其最优束唯一，不意味着偏好严格凸。</p>':'')+(model==='linear'&&p===q?'<p>绿线整段都最优，图中的点只是一种确定选择。需求函数可以从最优集合中选择一点；不能把点的唯一显示当成最优化问题本身唯一。</p>':'')+(model==='giffen'?'<p>这个偏好连续、单调且凸，但在折线处不可微。用预算端点和折线交点比较效用，不能用单一 MRS 相等式。</p>':'')+sourceNote();last=r;
 }else if(k==='rationalize'){
  const r=rationalizationC(s.rule,s.candidate,p,q,w),b=chart(w/p*1.12,w/q*1.12);svg=b.svg+budgetLine(b,p,q,w,C.r)+indifference(b,s.candidate,r.observedUtility,.5,C.p)+b.point(r.observed.bundle,'观察到的选择',C.p,'observed')+b.point(r.optimal.bundle,'候选效用的最优点',C.g,'choice',true);if(s.candidate==='max')svg+=b.line([r.observedUtility,r.observedUtility],[r.observedUtility,b.Y],C.p);
  metrics=[['观察束的候选效用',r.observedUtility],['预算内最大候选效用',r.optimal.u],['当前预算相容',r.currentConsistent?'是':'否'],['已知的全域理性化',r.globalKnown?'此配对成立':'当前通过仍不证明全域']];reading='理性化要求同一套单调偏好解释每一个预算下的选择；观察束只需是某个最优束，不必是唯一最优束。“只买便宜商品”可由 x₁+x₂ 解释，“支出各半”可由 x₁x₂ 解释。单个预算通过只能保留一种候选解释，不能认证全域。';formula='观察束必须属于 argmax{u(x)：p·x≤w}；当前效用缺口 = '+f(r.gap);extra='<button data-action="tie">把两种价格设为1，检查同价分支</button>'+sourceNote();last=r;
 }else if(k==='warp'){
  const A=[s.share*w/p,(1-s.share)*w/q],B=[s.shareB*s.wB/s.pB,(1-s.shareB)*s.wB/s.qB],first={prices:[p,q],w,bundle:A},second={prices:[s.pB,s.qB],w:s.wB,bundle:B},r=warpC(first,second),b=chart(Math.max(w/p,s.wB/s.pB)*1.12,Math.max(w/q,s.wB/s.qB)*1.12);svg=b.svg+budgetLine(b,p,q,w,C.g)+budgetLine(b,s.pB,s.qB,s.wB,C.p)+b.point(A,'A：第一次选择',C.g,'A')+b.point(B,'B：第二次选择',C.p,'B',true);metrics=[['第二束在第一预算的支出',f(r.cross[0])+' / '+f(w)],['第一束在第二预算的支出',f(r.cross[1])+' / '+f(s.wB)],['WARP检验',r.violation?'违反':'未发现这对观察的违反']];reading='默认是例5.11：每次只买较贵的商品。两次选择都花完预算，对方的选择在本次预算中却严格更便宜；单调偏好无法同时支持这两次选择。等式只给弱显示偏好，双方交叉支出都恰好等于财富时，不应判为违反。';formula='违反条件：A≠B；pᴬ·B≤wᴬ，pᴮ·A≤wᴮ，且至少一边严格小于';extra=table(['观察','本次选择','另一束可负担','严格位于预算内'],[['第一次',A.map(f).join(', '),r.affordable[0]?'是':'否',r.strict[0]?'是':'否'],['第二次',B.map(f).join(', '),r.affordable[1]?'是':'否',r.strict[1]?'是':'否']])+'<button data-action="source-warp">恢复例5.11</button> <button data-action="equal-warp">查看双边等式：不违反</button><p>命题5.3：可由单调偏好理性化的需求满足WARP。这里的两个观察可用于否证；通过两次检验不证明整条需求函数已理性化。</p>';legend='绿线 / 实点：第一次预算 / A　紫线 / 空心点：第二次预算 / B';last={r,first,second};
 }else if(k==='curves'||k==='giffen'){
  const m=k==='giffen'?'giffen':model,z=consumption(p,q,w,m,a),b=z.b,r=z.r,d=localDerivativesC(m,p,q,w,a),kind=k==='giffen'?'own':s.curve,minT=k==='giffen'?1.05:kind==='engel'?0:.5,maxT=k==='giffen'?1.95:kind==='engel'?24:4,quantity=(t)=>{const v=demandC(m,kind==='engel'?p:t,q,kind==='engel'?t:w,a).bundle;return v[kind==='cross'?1:0]},samples=Array.from({length:121},(_,i)=>quantity(minT+(maxT-minT)*i/120)),maxD=Math.max(1,...samples)*1.07,curve=chart(maxT,maxD,{top:475,bottom:720,xmin:minT,xlabel:kind==='engel'?'财富 w（价格固定）':'商品1价格 p₁（p₂、w固定）',ylabel:kind==='cross'?'商品2需求 x₂':'商品1需求 x₁'});height=805;const firstPanel=z.svg+b.point(r.bundle,'当前选择',C.g,'choice'),secondPanel=curve.svg+curve.curve(quantity,C.g)+curve.point([kind==='engel'?w:p,r.bundle[kind==='cross'?1:0]],'当前参数',C.p,'curve-point');if($('plot').clientWidth>=800){height=410;svgWidth=1200;svg=firstPanel+`<g transform="translate(600,-410)">${secondPanel}</g>`}else svg=firstPanel+secondPanel;
  const label=v=>v>1e-5?'增加':v< -1e-5?'减少':'不变',direction=v=>d.nonsmoothBoundary?'分支边界，比较两侧':label(v);metrics=[['商品1数量',r.bundle[0]],['附近提高 p₁，x₁',d.jump?'需求在此跳变':direction(d.own)],['附近提高 w，x₁',direction(d.income)],['附近提高 p₁，x₂',direction(d.cross)]];formula=utilityText[m];reading='上图保持消费空间坐标，下图只改变横轴指定的变量。自价格曲线是 x₁ 对 p₁；本章交叉价格曲线是 x₂ 对 p₁；Engel曲线是需求对财富。其他参数固定。下图的大幅跳变处断开，避免把不连续选择画成平滑需求。';
  if(m==='giffen'){reading+=' 本例在 p₂=1、1<p₁<2、4p₁<w<12 时，商品1是局部劣等品与吉芬品；越过这个范围会进入其他分支。';formula+='；上述内点区：x₁=(12−w)/(3−p₁)，∂x₁/∂p₁>0，∂x₁/∂w<0';extra='<p>这是独立构造的连续、单调、凹效用，用来实现教材图5.7描述的吉芬可能性。需求由预算端点与折线交点比较得到，未凭手绘上升线宣称来自偏好。效用在折线处不光滑。</p>'+(q===1&&p>1&&p<2&&w>4*p&&w<12?'<p>当前处于明确的局部吉芬区间。提高价格会降低实际购买力，劣等品的收入效应足以抵消替代效应。</p>':'<p>当前参数不在上面给出的局部吉芬区间内；以实际需求分支判断，不能继续套用那条内点公式。</p>');}
  else extra='<p>“正常”“劣等”“常规”“吉芬”可以描述局部变化，也可以描述整个函数。当前数值只描述附近变化；平坦段明确显示为“不变”。斜率在角点或跳变处可能不存在。</p>';
  reading=reading.replace('上图保持','第一张图保持').replace('下图只改变','第二张图只改变').replace('下图的大幅','需求图的大幅');
  legend='第一张：消费空间的预算与选择　第二张：需求函数；断开处不插值';last={r,d,model:m};
 }else if(k==='normal'){
  const r=normalMRSC(model,p,q,w,s.deltaW,a),X=Math.max(w/p,(w+s.deltaW)/p)*1.1,Y=(w+s.deltaW)/q*1.1,b=chart(X,Y);svg=b.svg+budgetLine(b,p,q,w,C.g)+budgetLine(b,p,q,w+s.deltaW,C.p)+indifference(b,model,r.old.u,a,C.g)+indifference(b,model,r.next.u,a,C.p)+b.point(r.old.bundle,'A：原选择',C.g,'A')+b.point(r.vertical,'A′：原x₁不变',C.r,'vertical',true)+b.point(r.next.bundle,'B：新选择',C.p,'choice');metrics=[['原 x₁',r.old.bundle[0]],['增加财富后的 x₁',r.next.bundle[0]],['A处 MRS',r.mrsOld],['A′处 MRS',r.mrsVertical]];reading='先把A竖直移到新预算线上的A′：只增加商品2，商品1数量保持不变。若固定商品1时，MRS随商品2增加而增大，那么A′处更愿意用商品2换商品1；凸偏好的新最优B不会落在A′左侧。这是命题5.4的几何方向。';formula='固定 x₁，MRS 随 x₂ 增加 ⇒ x₁ 随财富非递减（本例可在低财富角点保持为0）';extra=table(['点','商品1','商品2','MRS'],[['A',...r.old.bundle,r.mrsOld],['A′',...r.vertical,r.mrsVertical],['B',...r.next.bundle,r.mrsNext]])+'<p>A′是用于论证的可行点，并非新预算下自动选中的最优点。这里展示CD与拟线性两个满足条件的例子；一般结论依赖凸、单调和可微等教材假设。</p>';last=r;
 }else if(k==='slutsky'){
  const r=slutskyC(model,p,s.newP,q,w,a,s.method),X=Math.max(w/p,w/s.newP,r.wealth/s.newP)*1.1,Y=Math.max(w,r.wealth)/q*1.1,b=chart(X,Y);svg=b.svg+budgetLine(b,p,q,w,C.g)+indifference(b,model,r.A.u,a,C.g)+b.point(r.A.bundle,'A：原选择',C.g,'A');if(s.step>=1)svg+=budgetLine(b,s.newP,q,r.wealth,C.p,true)+b.point(r.B.bundle,'B：补偿后',C.p,'B',true);if(s.step>=2)svg+=budgetLine(b,s.newP,q,w,C.r)+b.point(r.C.bundle,'C：撤回补偿',C.r,'choice');metrics=[['替代效应 B₁−A₁',s.step>=1?r.sub:'第1步显示'],['收入效应 C₁−B₁',s.step>=2?r.income:'第2步显示'],['总效应 C₁−A₁',s.step>=2?r.total:'第2步显示'],['补偿财富',r.wealth]];reading=['A是原价格与原财富下的选择。先预测商品1价格变化会怎样改变预算线。','B使用新价格，但先补偿财富。Slutsky补偿使原束仍买得起；Hicks补偿使原效用不变，两者一般给出不同的B。','C仍用新价格，财富回到原w。A→B是替代效应，B→C是收入效应；按有向数量相加，必须恰好得到A→C。'][s.step];formula='Δx₁=(B₁−A₁)+(C₁−B₁)；'+(s.method==='slutsky'?'wˢ=p₁′A₁+p₂A₂':'wʰ=min{p′·x：u(x)≥u(A)}');extra=table(['选择','商品1','商品2','当时财富'],[['A',...r.A.bundle,w],['B',...r.B.bundle,r.wealth],['C',...r.C.bundle,w]])+'<p>这是一种比较静态分解，A、B、C不表示消费者实际连续经历三次交易。吉芬模型在折线处不可微，但仍可直接求解补偿选择。</p>';legend='绿：原预算与A　紫虚线：补偿预算与B　红：撤回补偿与C';last=r;
 }else if(k==='property'){
  // The proof isolates its own fixed old prices. Hypothetical B is never called an actual demand.
  s.p=1;s.q=1;const A=[w/2,w/2],newP=Math.max(1.1,s.newP),comp=newP*A[0]+A[1],maxX=comp/newP,B=[Math.min(maxX,s.hypothesis*A[0]),0];B[1]=comp-newP*B[0];const oldCost=B[0]+B[1],actual=demandC('product',newP,1,comp),b=chart(Math.max(w,maxX)*1.1,comp*1.1);svg=b.svg+budgetLine(b,1,1,w,C.g)+b.point(A,'A：原选择',C.g,'A');if(s.step>=1)svg+=budgetLine(b,newP,1,comp,C.p,true);if(s.step>=2)svg+=b.point(B,'B：假设的新选择',C.r,'hypothesis',true);if(s.step>=3)svg+=b.point(actual.bundle,'真实CD补偿选择',C.p,'choice');metrics=[['原 A₁',A[0]],['假设的 B₁',B[0]],['假设B按旧价格支出',oldCost],['旧财富',w]];reading=['旧价格固定为(1,1)，消费者花完财富选择A。命题并不需要预先指定CD效用。','提高商品1价格，同时把财富调到新价格下A的支出，所以新预算线必经过A。','假设消费者在新补偿预算上选择了B，且B₁>A₁。由两条预算相减，B按旧价格的支出反而严格低于旧财富。','A在旧预算中被选，B严格位于旧预算内；而新预算选B且买得起A。于是出现WARP矛盾。紫点只是用CD给出的一个实际合规选择。'][s.step];formula='p·(B−A)=−(p₁′−p₁)(B₁−A₁)；p₁′>p₁且B₁>A₁ ⇒ p·B<w';extra=(B[0]>A[0]+1e-8?'<p>当前假设落在禁止的一侧：旧预算严格买得起B，却选了A；新预算选B，又买得起A，违反WARP。</p>':'<p>当前假设B₁≤A₁，没有触发上述矛盾。调高假设数量，观察旧预算的严格可负担关系。</p>')+'<p>适用条件：需求是单值、满足WARP且始终花完预算。结论是补偿后 x₁ 不增加；不需要在此先假定光滑效用。</p>';legend='绿线：原预算　紫虚线：补偿预算　红空心点：证明中的假设B';last={A,B,oldCost,comp,actual};
 }
 if(k==='normal')legend='绿：原预算与A　紫：新预算与B　红圈：保留原商品1数量的A′';
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 ${svgWidth} ${height}" role="img" aria-label="${caseTitles[k]}交互图" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`);$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${label}</label><strong>${f(value)}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('extra').innerHTML=extra;$('legend').textContent=legend+'；刻度保持，超出范围时扩展，恢复默认可重置。';
 for(const c of spec){$(c.k).value=s[c.k];if($('out-'+c.k))$('out-'+c.k).value=f(s[c.k]);$(c.k).disabled=(c.k==='alpha'&&model!=='cd')||(k==='property'&&['p','q'].includes(c.k))||(k==='giffen'&&c.k==='q')||(k==='existence'&&model==='discontinuous'&&['p','q','w'].includes(c.k))}
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function advance(){const name=spec.some(c=>c.k==='filmStep')?'filmStep':spec.some(c=>c.k==='step')?'step':current==='existence'&&state.model==='discontinuous'?'progress':current==='normal'?'deltaW':current==='budget'?'mix':'p',c=spec.find(c=>c.k===name);if(!c)return true;state[name]=Math.min(c.max,state[name]+(name==='step'||name==='filmStep'?1:name==='progress'?.02:(c.max-c.min)/8));draw();return state[name]>=c.max-1e-8}
$('experiment').addEventListener('change',e=>{configure(e.target.value);const url=new URL(location.href);url.searchParams.set('case',current);history.replaceState(null,'',url)});
$('fields').addEventListener('input',e=>{const c=spec.find(c=>c.k===e.target.dataset.key);if(!c)return;stop();state[c.k]=c.options?e.target.value:+e.target.value;if(c.options)domains=[];if(c.k==='model'&&state.model==='giffen'){state.p=1.5;state.q=1;state.w=10}draw()});
$('extra').addEventListener('click',e=>{const action=e.target.closest('button')?.dataset.action;if(!action)return;stop();if(action==='tie')state.p=state.q=1;if(action==='source-warp'){state={p:1,q:2,w:2,share:0,pB:2,qB:1,wB:2,shareB:1}}if(action==='equal-warp'){state={p:1,q:1,w:2,share:0,pB:1,qB:1,wB:2,shareB:1}}draw();$('extra').querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true})});
$('advance').onclick=()=>{stop();return advance()};$('reset').onclick=()=>configure(current);$('play').onclick=()=>{if(timer){stop();return}if(advance()||window.microMotion.reduced.matches)return;let n=0;timer=setInterval(()=>{if(advance()||++n>=8)stop()},1400);$('play').textContent='暂停'};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',draw);window.demo={meta,get caseName(){return current},get state(){return state},get spec(){return spec},get last(){return last}};configure(cases.includes(requested)?requested:cases[0]);

}

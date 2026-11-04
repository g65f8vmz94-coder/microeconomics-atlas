import {prefU,compareP,blend,monotoneWitness,lexContinuity,utilityGap,intermediateP,convexP,diminishingP,localP,problem1P,relativeP,caseSections,caseNames} from './preferences.mjs';
import {prefStories} from './pref-story.mjs';
import {renderPrefStory} from './pref-story-ui.js';
const $=id=>document.getElementById(id),meta=window.LESSON;
const cases=caseSections[meta.id],query=new URLSearchParams(location.search).get('case')||window.PREFERENCE_DEFAULT;
$('fields').insertAdjacentHTML('beforebegin',`<div class="field"><label for="experiment">本节的具体实验</label><select id="experiment">${cases.map(k=>`<option value="${k}">${caseNames[k]}</option>`).join('')}</select></div>`);
const C={g:'#177468',p:'#7a6594',r:'#c35f43',gold:'#a27619',soft:'#dbe2d4',paper:'#fffdf7',ink:'#334b40'};
const modelNames={linear:'例4.1 · 固定交换率',neutral:'例4.2 · 只喜欢商品2',threshold:'例4.3 · 商品1到10后看商品2',min:'例4.4 · 完全互补',ideal:'例4.5 · L1理想点',lex:'例4.6 · 字典式',max:'习题4.2a · max',bad:'习题4.2b · x₁−x₂',log:'习题4.2c · 对数和',distance:'习题4.1a · 离原点更远',balanced:'习题4.1b · 平衡束绝对优先',sumlex:'习题4.1c · 总量后看商品1',quasi:'习题4.4 · 拟线性',product:'u=x₁x₂',minSquared:'u=(min{x₁,x₂})²'};
const e=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const f=x=>typeof x==='number'?x.toLocaleString('zh-CN',{maximumFractionDigits:3}):String(x);
const R=(k,label,min,max,step,value)=>({k,label,min,max,step,value}),S=(k,label,options,value)=>({k,label,options,value});
let mode='',s={},spec=[],last={},timer=null;
function config(k){stop();mode=k;$('experiment').value=k;spec=[];
 if(meta.id.startsWith('4.')){
  const story=prefStories[k]||prefStories.bundle;
  spec=[R('step','讲解画面',0,story.frames.length-1,1,0)];
  s=Object.fromEntries(spec.map(c=>[c.k,c.value]));
  $('fields').innerHTML=`<div class="field"><label for="step">讲解画面 <output id="out-step">0</output></label><input id="step" data-key="step" type="range" min="0" max="${story.frames.length-1}" step="1" value="0"></div>`;
  draw();
  return;
 }
 if(k==='bundle')spec=[R('lambda','A 的权重 λ',0,1,.02,.5)];
 if(k==='examples')spec=[S('model','偏好模型',Object.fromEntries(['linear','neutral','threshold','min','ideal','lex'].map(x=>[x,modelNames[x]])),'linear'),R('x','当前商品1数量',0,12,.1,3),R('y','当前商品2数量',0,12,.1,5),R('v','商品1的相对价值 v₁/v₂',.2,3,.05,1.3)];
 if(k==='monotone')spec=[S('model','偏好模型',Object.fromEntries(['linear','neutral','threshold','min','ideal','lex'].map(x=>[x,modelNames[x]])),'min')];
 if(k==='continuity')spec=[R('eps','任意正距离 ε',.001,1,.001,.4)];
 if(k==='continuityproof')spec=[R('step','同时靠近两端',0,1,.05,0)];
 if(k==='intermediate'||k==='problems3')spec=[R('lambda','从 c 走向 a 的比例 λ',0,1,.01,.5)];
 if(k==='convex'||k==='upper')spec=[S('model','偏好模型',Object.fromEntries(['min','max','ideal','lex'].map(x=>[x,modelNames[x]])),k==='upper'?'max':'min'),R('lambda','沿 A—B 移动 λ',0,1,.02,.5)];
 if(k==='concave')spec=[S('model','同一种偏好的效用写法',{min:'最小值表示',minSquared:'最小值的平方表示'},'min'),R('lambda','沿 A—B 移动 λ',0,1,.02,.5)];
 if(k==='declining')spec=[R('step','逐段展示',0,2,1,0)];
 if(k==='local'||k==='partial')spec=[S('model','无差异集形状',{product:'光滑：x₁x₂',min:'折点：min{x₁,x₂}'},k==='partial'?'product':'min'),R('dx','方向 δ₁',-1,1,.05,1),R('dy','方向 δ₂',-1,1,.05,-.6),R('step','小步长 ε',.01,.5,.01,.2)];
 if(k==='problems1')spec=[S('model','题目小问',{distance:'a · 离原点距离',balanced:'b · 平衡束优先',sumlex:'c · 先比总量再比商品1'},'distance'),R('lambda','沿两束混合 λ',0,1,.02,.5)];
 if(k==='problems2')spec=[S('model','题目小问',{max:'a · max{x₁,x₂}',bad:'b · x₁−x₂',log:'c · log(1+x₁)+log(1+x₂)'},'max'),R('lambda','沿两束混合 λ',0,1,.02,.5)];
 if(k==='problems4')spec=[R('shift','第二条无差异曲线的竖直平移',-3,3,.1,2),R('lambda','线段混合比例 λ',0,1,.02,.5)];
 if(k==='problems5'||k==='problems6')spec=[R('lambda','两束混合比例 λ',0,1,.02,.5)];
 if(k==='problems7')spec=[R('alpha','少拿商品1的量 α',.1,3,.1,1),R('beta','多拿商品2的量 β',0,6,.1,1.5)];
 s=Object.fromEntries(spec.map(c=>[c.k,c.value]));$('fields').innerHTML=spec.map(c=>c.options?`<div class="field"><label for="${c.k}">${c.label}</label><select id="${c.k}" data-key="${c.k}">${Object.entries(c.options).map(([v,l])=>`<option value="${v}">${e(l)}</option>`).join('')}</select></div>`:`<div class="field"><label for="${c.k}">${c.label} <output id="out-${c.k}">${f(c.value)}</output></label><input id="${c.k}" data-key="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join('');
 draw();
}
function chart(max=12){const narrow=$('plot').clientWidth<500,W=narrow?360:560,H=narrow?310:390,left=narrow?42:52,right=narrow?325:507,bottom=narrow?265:334,top=narrow?39:52,tick=narrow?14:11,pointFont=narrow?17:14;
 const x=v=>left+v/max*(right-left),y=v=>bottom-v/max*(bottom-top),mark=(a,label,color=C.g,open=false)=>`<g class="plot-point"><circle data-motion="pref-${e(label)}" cx="${x(a[0])}" cy="${y(a[1])}" r="${narrow?7:6}" fill="${open?C.paper:color}" stroke="${color}" stroke-width="2.5"/><text x="${x(a[0])+9}" y="${y(a[1])-9}" fill="${color}" font-size="${pointFont}">${label}</text></g>`,line=(a,b,color=C.g,dash='')=>`<path d="M${x(a[0])} ${y(a[1])}L${x(b[0])} ${y(b[1])}" stroke="${color}" stroke-width="2.5" fill="none" ${dash?'stroke-dasharray="5 5"':''}/>`;
 let svg=`<rect width="${W}" height="${H}" fill="${C.paper}"/>${[0,2,4,6,8,10,12,max].filter((z,i,a)=>z<=max&&a.indexOf(z)===i).map(v=>`<path d="M${x(v)} ${y(0)}V${y(max)}M${x(0)} ${y(v)}H${x(max)}" stroke="${C.soft}" stroke-width="1"/><text x="${x(v)-4}" y="${y(0)+18}" fill="#64776a" font-size="${tick}">${v}</text><text x="${x(0)-(narrow?32:24)}" y="${y(v)+4}" fill="#64776a" font-size="${tick}">${v}</text>`).join('')}<path d="M${x(0)} ${y(max)}V${y(0)}H${x(max)}" stroke="${C.ink}" stroke-width="1.7" fill="none"/><text x="${x(max)+10}" y="${y(0)+4}" fill="${C.ink}" font-size="${pointFont}">x₁</text><text x="${x(0)-4}" y="${y(max)-10}" fill="${C.ink}" font-size="${pointFont}">x₂</text>`;
 function path(points,color=C.g,dash=''){const valid=points.filter(z=>z&&z[0]>=0&&z[0]<=max&&z[1]>=0&&z[1]<=max);if(valid.length<2)return '';return `<path d="${valid.map((z,i)=>`${i?'L':'M'}${x(z[0]).toFixed(2)} ${y(z[1]).toFixed(2)}`).join('')}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" ${dash?'stroke-dasharray="6 5"':''}/>`}
 function level(kind,u,v=1.3,color=C.g){let pts=[];
  const sample=(fun)=>Array.from({length:121},(_,i)=>{const z=max*i/120;return [z,fun(z)]});
  if(kind==='linear')pts=sample(z=>u-v*z);
  if(kind==='neutral')pts=[[0,u],[max,u]];
  if(kind==='threshold')pts=u<=10?[[u,0],[u,max]]:[[10,u-11],[max,u-11]];
  if(kind==='min'||kind==='minSquared'){const k=kind==='min'?u:Math.sqrt(u);pts=[[k,max],[k,k],[max,k]]}
  if(kind==='max')pts=[[0,u],[u,u],[u,0]];
  if(kind==='ideal'){const d=-u;pts=[[5-d,5],[5,5+d],[5+d,5],[5,5-d],[5-d,5]]}
  if(kind==='bad')pts=sample(z=>z-u);
  if(kind==='log')pts=sample(z=>Math.exp(u)/(1+z)-1);
  if(kind==='quasi')pts=sample(z=>u-Math.sqrt(z));
  if(kind==='product')pts=sample(z=>z>0?u/z:NaN);
  if(kind==='distance')pts=sample(z=>z<=u?Math.sqrt(u*u-z*z):NaN);
  return path(pts,color)
 }
 return {x,y,mark,line,path,level,add:v=>svg+=v,html:()=>svg,W,H};}
const pair=a=>`(${a.map(f).join('，')})`,yes=x=>x?'成立':'不成立';
function draw(){
 if(meta.id.startsWith('4.')){
  last=renderPrefStory(mode,s.step??0);
  return;
 }
 let model=s.model||'',max=model==='threshold'?16:12,g=chart(max),metrics=[],reading='',formula='',boundary='教材 §'+meta.id+'；图上的数值是解释例子，条件、一般证明和端点须分开判断。',extra='',legend='绿：当前关系　紫：比较或参照　红：反例或待检验点';
 const dots=(a,b,z)=>{g.add(g.line(a,b,C.soft,'dash')+g.mark(a,'A',C.p)+g.mark(b,'B',C.p)+g.mark(z,'M',C.g))};
 if(mode==='bundle'){const a=[2,8],b=[8,2],z=blend(a,b,s.lambda);dots(a,b,z);metrics=[['A 的权重',s.lambda],['混合后商品1',z[0]],['混合后商品2',z[1]]];formula='x=λA+(1−λ)B；0≤λ≤1';reading='商品束是非负数量的有序对；线段上每个点都是两束的凸组合。移动λ，观察同一个点沿原线段连续走动。商品可以是抽象考虑，不限于可分割的实体货物。';boundary='定义4.1；X=ℝ₊²。连续数量是假设，便于刻画取舍。';last={a,b,z}}
 else if(mode==='examples'){const a=[s.x,s.y],u=prefU(model,...a,s.v);if(model==='lex'){g.add(g.mark(a,'当前束',C.g));g.add(g.mark([a[0],Math.min(max,a[1]+2)],'同x₁但更好',C.p));formula='x≽y ⇔ x₁>y₁，或 x₁=y₁ 且 x₂≥y₂';reading='每个无差异集只有一个点。横坐标任意微小的优势，都压过纵坐标的有限差异。'}else {g.add(g.level(model,u,s.v));g.add(g.mark(a,'当前束',C.g));formula={linear:'u=v₁x₁+v₂x₂；斜率=−v₁/v₂',neutral:'u=x₂；无差异集是水平线',threshold:'u=x₁ (x₁≤10)；u=11+x₂ (x₁>10)',min:'u=min{x₁,x₂}；等值集是折线',ideal:'u=−(|x₁−5|+|x₂−5|)'}[model];reading={linear:'每多一单位商品1可以按固定比例补偿商品2，等值线保持平行；调整相对价值，观察整组线的斜率。',neutral:'只看商品2的数量；横向增减商品1都不改变评价，因而等值集是水平线。',threshold:'商品1不超过10时只比较商品1；一旦超过10，先跨过效用跳跃，再只比较商品2。高效用水平线在x₁=10处不包含端点。',min:'两种商品按一比一配套；单独增加较多的那种不会改善，等值集在配套点转折。',ideal:'离(5,5)越近越好，等L1距离形成菱形；增加商品数量可能离理想点更远。'}[model];if(model==='threshold'&&u>10)g.add(`<circle cx="${g.x(10)}" cy="${g.y(u-11)}" r="6" fill="${C.paper}" stroke="${C.g}" stroke-width="2.5"/>`)}metrics=[['模型',modelNames[model]],['当前束',pair(a)],['效用数值',u===null?'序关系':u]];boundary='例4.1—4.6，印刷页46—48。字典式偏好仅有排序；不能以连续实值效用表示。';last={a,u}}
 else if(mode==='monotone'){const z=monotoneWitness(model);g.add(g.mark(z.base,'原束',C.p)+g.line(z.base,z.larger,C.gold)+g.mark(z.larger,'增加一种商品',C.g));metrics=[['单调',yes(z.weak)],['强单调',yes(z.strong)],['此步比较',z.comparison===1?'严格更好':z.comparison===0?'无差异':'反而更差']];formula=String.raw`x_1\ge y_1,\ x_2\ge y_2\Rightarrow x\succeq y；x\ne y\text{ 且强单调 }\Rightarrow x\succ y`;reading='例4.1在两个价值都为正时强单调；只看商品2、阈值与互补品可对增加一种商品无差异。理想点可能越走越远。字典序在任何一维严格增加时都会严格改善。';boundary='定义4.2—4.3，印刷页48—49；图中只展示证据点，性质按照模型全域判断。';last=z}
 else if(mode==='continuity'){const z=lexContinuity(s.eps);g.add(g.mark(z.x,'x≻y',C.g)+g.mark(z.y,'y',C.p)+g.line(z.x,z.a,C.r)+g.mark(z.a,'aε≺y',C.r));metrics=[['ε',s.eps],['x到aε的距离',z.distance],['x相对y','更好'],['aε相对y','更差']];formula='x=(1,2)≻y=(1,0)，aε=(1−ε/2,2)≺y';reading='不论ε缩得多小，aε始终落在x的ε邻域内，却被y严格压过。连续性要求两端附近仍保持严格排序；一个扰动反例就够否定。';boundary='定义4.4，印刷页49；图为任意正ε的构造，显示窗口对极小距离可能无法分辨。';last=z}
 else if(mode==='continuityproof'){const z=utilityGap(s.step);g.add(g.mark(z.x,'x',C.g)+g.mark(z.y,'y',C.p)+g.line(z.x,z.a,C.gold)+g.line(z.y,z.b,C.gold)+g.mark(z.a,'a',C.g)+g.mark(z.b,'b',C.p));metrics=[['u(x)−u(y)',z.ux-z.uy],['三分之一间隙',z.third],['u(a)−u(b)',z.ua-z.ub]];formula='u(a)>u(x)−η>u(y)+η>u(b)，η=[u(x)−u(y)]/3';reading='原来严格偏好的效用间隙为正。把它分成三份；连续性允许各端的效用扰动都小于一份，于是中间仍留下严格间隙。滑块只是具体线性效用的安全扰动。';boundary='命题4.1，印刷页50。连续效用⇒连续偏好；教材提及逆向定理，但证明超出本书范围。';last=z}
 else if(mode==='intermediate'||mode==='problems3'){const z=intermediateP(s.lambda);g.add(g.line(z.a,z.c,C.p)+g.mark(z.a,'a',C.p)+g.mark(z.c,'c',C.p)+g.mark(z.b,'b',C.gold)+g.mark(z.z,'z(λ)',C.g));metrics=[['u(b)',z.target],['u(z)',z.uz],['使两者相等的λ',z.root]];formula='u(λa+(1−λ)c)=u(b)；λ∈(0,1)';reading=mode==='problems3'?'任意x的效用夹在原点与(最大坐标,最大坐标)之间。沿对角线连续移动，介值定理给出与x无差异的(t,t)。此图用乘积效用演示。':'a≻b≻c时，沿a到c的线段，连续效用从高于u(b)变到低于u(b)，中间必有无差异束。拖动λ寻找交点。';boundary=mode==='problems3'?'习题4.3，印刷页55；一般结论依赖单调和连续。':'§4.4末，印刷页50；该例采用u=x₁x₂。';last=z}
 else if(mode==='convex'||mode==='upper'||mode==='concave'||mode==='problems5'||mode==='problems6'){let kind=model;if(mode==='problems5')kind='min';if(mode==='problems6')kind='ideal';if(mode==='concave')kind=s.model;const z=mode==='concave'?{a:[0,0],b:[2,2],z:blend([0,0],[2,2],s.lambda)}:convexP(kind==='minSquared'?'min':kind,s.lambda),a=z.a,b=z.b,m=z.z,levelKind=kind==='minSquared'?'min':kind;g.add(g.level(levelKind,prefU(levelKind,...b)));dots(a,b,m);if(mode==='upper'){g.add(g.mark(b,'基准B',C.gold));formula='a≽b 且 b≽x* ⇒ λa+(1−λ)b≽b≽x*';reading='固定一个基准束x*，所有不差于它的束构成上优集。两点都在上优集时，先把较好的一点与较差的一点连接，再用传递性证明整条线段也在其中。反过来令x*=b，马上回到凸偏好的定义。'}else if(mode==='concave'){const val=prefU(kind,...m),avg=s.lambda*prefU(kind,...a)+(1-s.lambda)*prefU(kind,...b);metrics=[['混合效用',val],['端点加权效用',avg],['凹函数不等式',yes(val>=avg-1e-8)]];formula=kind==='min'?'u(λa+(1−λ)b)≥λu(a)+(1−λ)u(b)≥u(b)':'ũ=(min{x₁,x₂})²；ũ(λa+(1−λ)b)<λũ(a)+(1−λ)ũ(b)（内点）';reading=kind==='min'?'min本身是凹函数；当前两端及整条线段满足凹函数不等式，由此能推出这组偏好凸。切换同序的平方写法，比较同一对端点。':'将min在非负域平方，排序完全不变；但对这两个端点，内点效用小于端点效用的加权平均。偏好仍凸，说明某个效用表示不凹，不能反推偏好不凸。'}else{formula='a≽b ⇒ λa+(1−λ)b≽b；严格凸要求内点 ≻b';reading=kind==='max'?'两端都可达到高效用，内点却可能更低，上优集缺口直观可见。':kind==='lex'?'字典序虽不连续，却是严格凸：比较的首个不同坐标在内点仍保持严格优势。':'移动混合点检验整条线段，不能只看中点。min在某些线段上存在无差异内点，因此凸但不严格凸；理想点的L1距离上优集也是凸的。'}if(!metrics.length)metrics=[['A相对B',z.ua===null?compareP(kind,a,b)>=0?'不差':'较差':z.ua>=z.ub?'不差':'较差'],['混合相对B',z.zVersusB===1?'严格更好':z.zVersusB===0?'无差异':'更差'],['混合束',pair(m)]];boundary=mode==='upper'?'命题4.2，印刷页52；双向论证依赖偏好的完备与传递。':mode==='concave'?'命题4.3，印刷页52—53；min²在非负域与min同序。':mode==='problems5'?'习题4.5，印刷页55；min是两个仿射函数的逐点最小，因而凹，偏好凸。':mode==='problems6'?'习题4.6，印刷页55；负L1距离连续且凹，故偏好连续、凸。':'定义4.5，印刷页51；严格凸性只检查满足a≽b且a≠b的线段内点。';last={...z,kind}}
 else if(mode==='declining'){const z=diminishingP();g.add(g.level('product',100));g.add(g.mark(z.a,'a',C.p));if(s.step>=1){g.add(g.line(z.a,z.b,C.g)+g.mark(z.b,'b',C.g))}if(s.step>=2){g.add(g.line(z.b,z.c,C.g)+g.mark(z.c,'c',C.g)+g.line(z.a,z.c,C.p,'dash')+g.mark(z.middle,'中点',C.r))}metrics=[['第一段放弃β',z.beta],['第二段放弃γ',z.gamma],['β≥γ',yes(z.beta>=z.gamma)]];formula='β=10−100/11；γ=100/11−100/12；β≥γ';reading=['先固定a=(10,10)及同一条u=100曲线。','多得第一单位商品1，从商品2放弃β，仍无差异。','再多得一单位商品1，只需放弃γ。若反而β<γ，a与c的中点将比b少商品2；强单调使它劣于b，但凸性要求它不劣于b，矛盾。'][s.step];boundary='§4.5，印刷页53；一般β≥γ由强单调+凸性推出，图中取u=x₁x₂作例子。';last=z}
 else if(mode==='local'||mode==='partial'){const z=localP(s.dx,s.dy,s.step),kind=s.model;g.add(g.level(kind,kind==='min'?4:16)+g.mark(z.z,'z',C.p)+g.line(z.z,z.q,C.gold)+g.mark(z.q,'z+εδ',z[kind==='min'?'minGain':'productGain']>0?C.g:C.r));metrics=[['方向估值 v·δ',kind==='min'?z.kinkDot:z.dot],['真实效用变化',kind==='min'?z.minGain:z.productGain],['局部结果',(kind==='min'?z.minGain:z.productGain)>0?'改善':'没有改善']];formula=kind==='product'?'u=x₁x₂；∇u(z)=(z₂,z₁)；v·δ>0 ⇒ 小步改善':'u=min{x₁,x₂}；候选v=(1,1)在折点不能正确判定所有方向';reading=kind==='product'?'保持z=(4,4)，改变方向和步长。方向导数为4δ₁+4δ₂；严格为正时足够小的正步改善，且正倍数估值给出相同判断。':'在z=(4,4)折点，方向(1,−0.6)让候选v=(1,1)给出正内积，真实min却下降。这个例子排除了该候选估值；对任意非零非负估值都能构造同类方向。';boundary=kind==='min'?'定义4.6，印刷页53—54。原书定义写“非负数对”，却未排除(0,0)：按字面零向量使蕴含式空真；“折点不可微”的几何说法须加非零估值条件。':'命题4.4，印刷页54；偏导数连续是充分条件，原书未在此证明一般命题。';extra=kind==='min'?'<p>原书措辞校准：若允许 v=(0,0)，任何偏好都能满足该蕴含式，定义会失去鉴别力。这里的折点判断采用非零局部估值的预期含义；不把这个漏洞冒充教材证明。</p>':'';last=z}
 else if(mode==='problems1'){const z=problem1P(model,s.lambda);dots(z.a,z.b,z.z);metrics=[['A相对B',z.ab===1?'更好':z.ab===0?'无差异':'更差'],['混合相对B',z.zb===1?'更好':z.zb===0?'无差异':'更差']];formula={distance:'u=√(x₁²+x₂²)',balanced:'u=1+x₁/(1+x₁)（平衡）；u=x₂/(1+x₂)（不平衡）',sumlex:'先比较 x₁+x₂，相等时再比较 x₁'}[model];reading={distance:'离原点更远：强单调、连续，但外侧圆弧的上优集不凸。A与B同距，中间更近。',balanced:'平衡束无条件优先，不平衡束仅比商品2。可用分段效用表示；不单调、不连续，也不凸。此线段从高排名平衡束走向不平衡束，内点可能更差。',sumlex:'先比总量，平局再看商品1：强单调且凸；沿总量相同的极小扰动可以翻转次级比较，故不连续。'}[model];boundary='习题4.1，印刷页55；结论依据全域规则，不由一组绘制点推断。';last=z}
 else if(mode==='problems2'){const a=[6,1],b=[1,6],z=blend(a,b,s.lambda),u=prefU(model,...z);g.add(g.level(model,prefU(model,...a))+g.line(a,b,C.soft,'dash')+g.mark(a,'A',C.p)+g.mark(b,'B',C.p)+g.mark(z,'混合束',C.g));metrics=[['u(A)',prefU(model,...a)],['u(B)',prefU(model,...b)],['u(混合)',u]];formula={max:'u=max{x₁,x₂}',bad:'u=x₁−x₂',log:'u=log(1+x₁)+log(1+x₂)'}[model];reading={max:'单调但不强单调；连续；两端效用6，中点效用3.5，故偏好不凸。',bad:'商品2是厌恶品，不单调；效用连续，等值线是平行直线，所以上优集仍凸。',log:'两个偏导数都严格为正；连续且严格凹，因此偏好强单调、连续、严格凸。'}[model];boundary='习题4.2，印刷页55；凸偏好不要求所有商品都是好物。';last={a,b,z,u}}
 else if(mode==='problems4'){const a=[2,6],b=[8,3],z=blend(a,b,s.lambda);g.add(g.level('quasi',prefU('quasi',...a))+g.level('quasi',prefU('quasi',...a)+s.shift,1,C.p)+g.line(a,b,C.soft,'dash')+g.mark(a,'A',C.p)+g.mark(b,'B',C.p)+g.mark(z,'混合',C.g));metrics=[['平移量',s.shift],['混合束效用',prefU('quasi',...z)],['端点加权效用',s.lambda*prefU('quasi',...a)+(1-s.lambda)*prefU('quasi',...b)]];formula='u=x₂+g(x₁)，g(x₁)=√x₁；x₂=c−g(x₁)';reading='改变效用水平c，只使整条无差异线竖直平移，形状不变。若g凹，则u是凹函数，故该偏好凸；此处取g=√x₁作可操作例子。';boundary='习题4.4，印刷页55；原题只要求g连续递增，凸性结论另加g凹。';last={a,b,z}}
 else if(mode==='problems7'){const z=relativeP(s.alpha,s.beta);g.add(g.mark(z.a,'原束',C.p)+g.mark(z.b,'变化后',C.g)+g.line(z.a,z.b,C.gold));metrics=[['A: 2x₁+x₂变化',z.deltaA],['B: x₁+x₂变化',z.deltaB],['字典序是否接受',z.lex>=0?'接受':'拒绝']];formula='β≥2α ⇒ β>α；A接受交换时，B严格接受';reading='从原束少拿α单位商品1，多拿β单位商品2。若更重视商品1的A都愿意交换，B必严格愿意。字典式偏好永远不会接受任何α>0的商品1损失，因而题目给的蕴含式对它是空真。';boundary='习题4.7，印刷页56；这里采用题目原定义，A“更偏爱商品1”的方向由被接受的损失检验。';last=z}
 window.microMotion.chart($('plot'),`<svg viewBox="0 0 ${g.W} ${g.H}" role="img" aria-label="${caseNames[mode]}交互图" xmlns="http://www.w3.org/2000/svg">${g.html()}</svg>`);
 $('metrics').innerHTML=metrics.map(([label,v])=>`<div class="metric"><label>${e(label)}</label><strong>${e(f(v))}</strong></div>`).join('');$('reading').textContent=reading;$('formula').textContent=formula;$('boundary').textContent=boundary;$('extra').innerHTML=extra;$('legend').textContent=legend;
 for(const c of spec){$(c.k).value=s[c.k];if($('out-'+c.k))$('out-'+c.k).value=f(s[c.k]);$(c.k).disabled=(mode==='examples'&&c.k==='v'&&s.model!=='linear')}
}
function stop(){clearInterval(timer);timer=null;$('play').textContent='播放变化'}
function advance(){
 if(meta.id.startsWith('4.')){
  const story=prefStories[mode]||prefStories.bundle;
  const curr=s.step??0;
  if(curr<story.frames.length-1){
   s.step=curr+1;
   draw();
   return s.step>=story.frames.length-1;
  }
  return true;
 }
 let c=spec.find(x=>x.k==='step')||spec.find(x=>x.k==='lambda')||spec.find(x=>x.k==='eps')||spec.find(x=>x.k==='beta')||spec.find(x=>x.options);if(!c)return true;if(c.options){let keys=Object.keys(c.options);s[c.k]=keys[(keys.indexOf(s[c.k])+1)%keys.length];draw();return false}let increment=c.k==='step'?c.step:c.k==='eps'?-.05:c.k==='beta'?.5:.1;s[c.k]=c.k==='eps'?Math.max(c.min,s[c.k]+increment):Math.min(c.max,s[c.k]+increment);draw();return s[c.k]>=c.max-1e-9||s[c.k]<=c.min+1e-9}
$('experiment').addEventListener('change',ev=>{config(ev.target.value);const url=new URL(location.href);url.searchParams.set('case',mode);history.replaceState(null,'',url)});
$('fields').addEventListener('input',ev=>{const c=spec.find(x=>x.k===ev.target.dataset.key);if(!c)return;stop();s[c.k]=c.options?ev.target.value:+ev.target.value;draw()});
$('advance').onclick=()=>{stop();return advance()};$('reset').onclick=()=>config(mode);$('play').onclick=()=>{if(timer){stop();return}if(advance()||window.microMotion.reduced.matches)return;let n=0;timer=setInterval(()=>{if(advance()||++n>=8)stop()},1200);$('play').textContent='暂停'};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.microMotion.reduced.addEventListener('change',stop);window.addEventListener('resize',draw);window.demo={meta,get caseName(){return mode},get state(){return s},get spec(){return spec},get last(){return last}};config(cases.includes(query)?query:cases[0]);

import {utility,cdExchange,allocationCheck,manipulatedExchange} from './economy.mjs';
export function launchCD({restoreURL=true}={}){
const $=id=>document.getElementById(id),meta=window.LESSON,section=meta.id;
const f=x=>Number(x).toLocaleString('zh-CN',{maximumFractionDigits:3}),g='#177468',red='#c35f43',purple='#7a6594';
const specs=[['e1','A最初拥有的商品1',1,9,.1,8],['e2','A最初拥有的商品2',1,9,.1,2],['a','A对商品1的CD份额',.15,.85,.05,.5],['b','B对商品1的CD份额',.15,.85,.05,.5]];
const mode=section==='10.3'?'excess':section==='10.4'?'reopen':['10.5','10.6','10.9'].includes(section)?'allocation':section==='10.8'?'manipulate':'market';
if(['market','excess'].includes(mode))specs.push(['p','尝试相对价格 p₁/p₂',.15,6,.01,1.6]);
if(mode==='allocation')specs.push(['x','配置给A的商品1',0,10,.1,5],['y','配置给A的商品2',0,10,.1,4]);
if(mode==='reopen')specs.push(['step','从原禀赋移向均衡配置',0,1,.02,0]);
if(mode==='manipulate')specs.push(['report','A报告的商品1支出份额',.15,.85,.01,.5]);
const state=Object.fromEntries(specs.map(c=>[c[0],c[5]]));let playing=null,raf=0,last;
// Restore a saved experiment before the shared film player takes its baseline.
// Reset still uses the authored defaults; replay restores the opening baseline.
const query=new URLSearchParams(restoreURL?location.search:''),restored=new Set();
for(const[k,,min,max]of specs){const raw=query.get(k);if(raw===null||!raw.trim())continue;const value=Number(raw);if(!Number.isFinite(value))continue;state[k]=Math.max(min,Math.min(max,value));restored.add(k)}
$('fields').innerHTML=specs.map(([k,l,min,max,step])=>`<div class="field"><label for="${k}">${l}<output id="out-${k}">${state[k]}</output></label><input type="range" id="${k}" data-key="${k}" min="${min}" max="${max}" step="${restored.has(k)?'any':step}" ${restored.has(k)?`data-film-original-step="${step}"`:''} value="${state[k]}"></div>`).join('');
const text=(x,y,s,c='#65786d',size=12)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size*Math.max(1,600/Math.max(270,$('plot').clientWidth))}" text-anchor="middle">${s}</text>`;
const sx=x=>60+x*48,sy=y=>330-y*28;
function point(x,y,label,c=g){const half=label.length*6*Math.max(1,600/Math.max(270,$('plot').clientWidth));return `<circle cx="${sx(x)}" cy="${sy(y)}" r="5" fill="${c}"/>`+text(Math.max(half+10,Math.min(590-half,sx(x))),sy(Math.min(9.3,Math.max(.4,y)))-18,label,c)}
function path(fn,c,dash=''){const parts=[];let open=false;for(let i=0;i<=250;i++){const x=i/25,y=fn(x);if(!Number.isFinite(y)||y<0||y>10){open=false;continue}parts.push((open?'L':'M')+sx(x).toFixed(2)+','+sy(y).toFixed(2));open=true}return `<path d="${parts.join(' ')}" fill="none" stroke="${c}" stroke-width="2" ${dash?`stroke-dasharray="${dash}"`:''}/>`}
function draw(){const s=state,r=cdExchange({...s,report:s.a});let svg='',metrics=[],read='',formula='',extra='',warning=meta.boundary;
 const axes=`<rect x="60" y="50" width="480" height="280" fill="none" stroke="#95a58f"/>${[2,4,6,8].map(x=>`<path d="M${sx(x)} 50V330M60 ${sy(x)}H540" stroke="#dce2d3"/>`).join('')}${[0,2,4,6,8,10].map(x=>text(sx(x),350,x,g,10)+text(37,sy(x)+4,x,g,10)).join('')}${text(105,374,'A原点',g,11)}${text(500,28,'B原点',purple,11)}`;
 const equilibrium=r.equilibrium.A;
 if(mode==='excess'){
  const maxY=60,minY=-15,xx=p=>60+(p-.15)/5.85*480,yy=z=>320-(z-minY)/(maxY-minY)*250;
  svg=`<path d="M60 45V320H550M60 ${yy(0)}H550" stroke="#95a58f" fill="none"/>`;
  const d=Array.from({length:301},(_,i)=>{const p=.15+i*5.85/300,z=r.demand(p).A[0]+r.demand(p).B[0]-10;return `${i?'L':'M'}${xx(p)},${yy(z)}`}).join(' ');
  svg+=`<path d="${d}" stroke="${g}" stroke-width="2.5" fill="none"/>`+text(310,350,'相对价格 p₁ / p₂')+text(95,35,'商品1超额需求')+`<circle cx="${xx(s.p)}" cy="${yy(r.excess[0])}" r="6" fill="${red}"/>`+text(xx(s.p),yy(r.excess[0])-16,'当前价格',red)+`<circle cx="${xx(r.eq)}" cy="${yy(0)}" r="5" fill="${g}"/>`;
  for(const p of [1,2,3,4,5,6])svg+=text(xx(p),338,p,undefined,10);for(const y of [-10,0,20,40,60])svg+=text(35,yy(y)+4,y,undefined,10);
  read='本页的CD需求连续，低价时商品1总需求超过禀赋，高价时低于禀赋。连续曲线必过零点。一般连续超额需求可以有多个零点，本例的唯一性来自额外的函数结构。';formula='z₁(p)=Σxᵢ₁(p)−Σeᵢ₁；z₁(p*)=0；p·z₁+z₂=0';
  metrics=[['当前z₁',r.excess[0]],['当前z₂',r.excess[1]],['唯一均衡价格（本例）',r.eq],['瓦尔拉斯恒等式残差',r.walras]];
 }else if(mode==='allocation'){
  const a=allocationCheck(s);svg=axes+path(r.curve,'#b1bb9b');
  svg+=path(x=>x>0?(a.uA/x**s.a)**(1/(1-s.a)):NaN,g)+path(x=>x<10?10-(a.uB/(10-x)**s.b)**(1/(1-s.b)):NaN,purple);
  const coincident=Math.hypot(s.x-equilibrium[0],s.y-equilibrium[1])<.12;
  svg+=point(s.e1,s.e2,'初始禀赋',red)+point(s.x,s.y,coincident?'当前配置 = 均衡':'当前配置',g)+(coincident?'':point(...equilibrium,'竞争均衡',purple));
  if(a.witness)svg+=point(...a.witness,'双方严格改进','#a37b21');
  metrics=[['A的效用',a.uA],['B的效用',a.uB],['位于契约曲线',a.efficient?'是':'否'],['位于核心（本模型）',a.core?'是':'否']];
  read=section==='10.6'?'核心同时检查小联盟能否带着原禀赋离开。两人CD例中，只需检查各自保留初始禀赋是否更好，以及大联盟能否同时改善。有效配置若让某一人比原禀赋更差，仍不在核心。':'盒内一个点同时表示两个人的配置，资源总量始终守恒。绿色是A的无差异曲线，紫色是B的；浅线是契约曲线。金色点若出现，就是双方严格改善的一个具体见证。';
  formula='MRS_A = MRS_B（内点有效性）；核心 = 有效配置 + 两人的个体理性（本两人CD模型）';
  extra=`<p>A原禀赋效用 ${f(a.initialA)}；B原禀赋效用 ${f(a.initialB)}。${a.individuallyRational?'两人都不比原禀赋差。':'至少一人更愿意保留自己的原禀赋。'}</p><p>一般核心按所有联盟的严格改善定义。金色见证采用有限搜索；没有显示见证不作为一般无改进的证明。</p>`;
  last={...r,allocation:a};
 }else if(mode==='reopen'){
  const p=r.eq,next=[s.e1+(equilibrium[0]-s.e1)*s.step,s.e2+(equilibrium[1]-s.e2)*s.step],oldWealth=p*s.e1+s.e2,newWealth=p*next[0]+next[1];
  svg=axes+path(x=>oldWealth-p*x,red)+point(s.e1,s.e2,'原禀赋',red)+point(...equilibrium,'均衡消费',g)+point(...next,'重开时禀赋',purple);
  metrics=[['均衡价格',p],['原预算财富',oldWealth],['重开预算财富',newWealth],['预算变化',newWealth-oldWealth]];
  read='在同一均衡价格下，原禀赋和均衡消费价值相同。以均衡消费作为新禀赋重开交易，预算集不变，原来的最优消费仍然最优。这是均衡继续成立，不是在所有偏好下承诺新的均衡绝对唯一。';formula='p·a(i)=p·e(i) ⇒ B(p,a(i))=B(p,e(i))';last={...r,next,oldWealth,newWealth};
 }else if(mode==='manipulate'){
  const c=manipulatedExchange(s,s.report),m=c.man,e=m.equilibrium.A;svg=axes+point(s.e1,s.e2,'初始禀赋',red)+point(...equilibrium,'真实需求的均衡',purple)+point(...e,'报告后的配置',g);
  svg+=path(x=>s.e1*m.eq+s.e2-m.eq*x,red)+path(x=>x>0?(c.reportedAllocationUtility/x**s.a)**(1/(1-s.a)):NaN,g);
  metrics=[['诚实价格',r.eq],['报告后的价格',m.eq],['诚实时真实效用',c.honestUtility],['报告后的真实效用',c.reportedAllocationUtility]];
  read='这里将市场规则看成接收需求报告、再计算出清价格的程序。A改变报告的支出份额，价格和财富都会随之改变；评判收益必须用A真实偏好。个体把价格当作给定，与操纵整个报送机制是两个不同问题。';formula='报告决定分配；真实效用仍为 x_A^α y_A^(1−α)';last=c;
 }else {
  const a=r.at.A,bAsA=[10-r.at.B[0],10-r.at.B[1]];svg=axes+path(x=>s.p*s.e1+s.e2-s.p*x,red)+point(s.e1,s.e2,'禀赋',red);
  const clear=Math.abs(r.excess[0])<.02;
  if(clear)svg+=point(...equilibrium,'A、B选择重合',g);
  else{if(a.every(x=>x>=0&&x<=10))svg+=point(...a,'A想选的配置',g);if(bAsA.every(x=>x>=0&&x<=10))svg+=point(...bAsA,'B想选的配置',purple);svg+=point(...equilibrium,'均衡配置','#a37b21');}
  metrics=[['A想要的商品1',r.at.A[0]],['B想要的商品1',r.at.B[0]],['总需求减总禀赋',r.excess[0]],['出清的相对价格',r.eq]];
  read='A和B各自在预算集里最优化，但只有二人的需求同时可行才是竞争均衡。绿色点和紫色点重合时，两个个体的消费愿望恰好分完所有资源。盒外需求仍在读数中显示，不把它裁剪成可行选择。';formula='w_A=p·e_A；x_A=αw_A/p，y_A=(1−α)w_A；x_A+x_B=10，y_A+y_B=10';last=r;
 }
 if(mode==='excess')last=r;
 $('plot').innerHTML=`<svg viewBox="0 0 600 380" role="img" aria-label="${meta.title}">${svg}</svg>`;
 $('legend').textContent=mode==='excess'?'价格是横轴，超额需求是纵轴；零点表示市场出清':'绿色：A　紫色：B / 对照　赤色：禀赋与预算线';
 $('metrics').innerHTML=metrics.map(([l,v])=>`<div class="metric"><label>${l}</label><strong>${typeof v==='number'?f(v):v}</strong></div>`).join('');$('reading').textContent=read;$('formula').textContent=formula;$('extra').innerHTML=extra;$('boundary').textContent=warning;
 specs.forEach(([k])=>{$('out-'+k).value=f(s[k]);$(k).value=s[k]});
}
function stop(){cancelAnimationFrame(raf);playing=null;$('play').textContent='播放变化'}
function target(){const k=mode==='market'||mode==='excess'?'p':mode==='reopen'?'step':mode==='manipulate'?'report':'y',r=cdExchange(state);return{k,value:k==='p'?r.eq:k==='step'?1:k==='report'?.85:r.curve(state.x)}}
function animate(){if(playing){stop();return}const t=target(),from=state[t.k];if(window.microMotion.reduced.matches){state[t.k]=t.value;draw();return}playing={from,...t,start:performance.now()};$('play').textContent='暂停';function frame(now){if(!playing)return;const u=Math.min(1,(now-playing.start)/1800),e=u*u*(3-2*u);state[playing.k]=playing.from+(playing.value-playing.from)*e;draw();if(u<1)raf=requestAnimationFrame(frame);else stop()}raf=requestAnimationFrame(frame)}
$('fields').oninput=e=>{const k=e.target.dataset.key;if(!k)return;stop();state[k]=+e.target.value;draw()};$('play').onclick=animate;$('advance').onclick=()=>{stop();const t=target();state[t.k]=t.value;draw()};$('reset').onclick=()=>{stop();specs.forEach(c=>state[c[0]]=c[5]);draw()};
const onHidden=()=>{if(document.hidden)stop()},onReduced=()=>{if(window.microMotion.reduced.matches&&playing){state[playing.k]=playing.value;stop();draw()}};
document.addEventListener('visibilitychange',onHidden);window.microMotion.reduced.addEventListener('change',onReduced);
window.addEventListener('resize',draw);window.demo={meta,state,draw,get last(){return last}};draw();
return ()=>{stop();document.removeEventListener('visibilitychange',onHidden);window.microMotion.reduced.removeEventListener('change',onReduced);window.removeEventListener('resize',draw);$('fields').oninput=null};
}

// Presentation only. Lesson registries, model controllers and their IDs remain authoritative.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
exports.mast=(chapters,problemCount)=>`<header class="mast atlas-mast"><a class="brand" href="index.html" aria-label="中微 · 模型图谱首页"><span class="brand-mark">μ</span><span>中微<span class="brand-long"> · 模型图谱</span></span></a><nav aria-label="主导航"><details class="site-index"><summary>章节目录</summary><div class="site-index-panel"><h2>沿着全书复习</h2><nav aria-label="全书20章">${chapters.map((t,i)=>`<a href="index.html#chapter-${i+1}" data-chapter="${i+1}"><span>${i+1}</span>${esc(t)}</a>`).join('')}</nav><div class="index-foot"><a href="exercises.html">${problemCount}道原题导航 →</a><a href="about.html">使用方法与来源 →</a></div></div></details><a href="exercises.html">习题<span class="nav-long">导航</span></a><a class="about-link" href="about.html">关于与来源</a><button class="motion-toggle" type="button" aria-pressed="false" aria-label="减少动态效果">少些动效</button></nav></header>`;

exports.homeIntro=({art,count,problems})=>`<header class="home-intro"><h1><span>跟着图，</span><span>看懂选择。</span></h1><p>看条件怎样变化，理解选择为什么改变。</p><a class="primary home-open" href="lesson-5-3.html?case=optimum&model=product">继续看消费者选择 <span aria-hidden="true">→</span></a></header>
<section class="home-workbench" aria-label="从日常问题走进微观模型"><div class="situation-list"><h2>从一个问题开始</h2><a class="featured-situation" href="lesson-5-1.html"><strong>买东西，钱不够了</strong><span>价格变了，还能照原来买吗？</span><span class="link-arrow" aria-hidden="true">↗</span></a><a href="lesson-7-1.html"><strong>奶茶该卖多少钱</strong><span>少卖一点、贵卖一点，会赚更多吗？</span><span class="link-arrow" aria-hidden="true">↗</span></a><a href="lesson-3-5.html"><strong>要不要买保险</strong><span>确定花的钱，换来什么？</span><span class="link-arrow" aria-hidden="true">↗</span></a><a href="lesson-15-3.html"><strong>大家都等别人出钱</strong><span>一个人的好主意，为什么难做到？</span><span class="link-arrow" aria-hidden="true">↗</span></a></div>
<div class="home-demo" id="home-demo" role="region" aria-labelledby="home-demo-title"><h2 id="home-demo-title">同样10元，价格变了会怎样？</h2><p>一段25秒的图解：商品1从1元涨到2元，看看预算线与最优选择怎样一起变。</p>
<p class="home-price home-film-price"><span>商品1价格</span><strong id="home-price-value">1.00 元 / 单位</strong></p>
<div class="home-preview-body"><div class="home-chart"><div class="legend home-legend"><span style="--color:#c35f43">预算约束</span><span style="--color:#177468">无差异曲线</span></div><div class="hero-art" id="home-plot">${art}</div></div><div class="home-choice"><div><span>商品1</span><strong id="home-x1">5.00</strong><small>单位</small></div><div><span>商品2</span><strong id="home-x2">5.00</strong><small>单位</small></div><p id="home-observation">两样各花5元，刚好用完10元。</p></div></div>
<p id="home-film-caption" class="home-film-caption" aria-live="polite" aria-atomic="true">先认清条件：10元预算，商品2每单位1元，偏好为 u=x₁x₂。</p>
<div class="film-transport home-film-transport" role="group" aria-label="首页图解播放控制"><button class="primary" id="home-film-play" type="button" aria-controls="home-plot home-film-caption" aria-pressed="false" disabled>播放讲解</button><button id="home-film-replay" type="button" aria-controls="home-plot home-film-caption" disabled>从头重播</button><progress id="home-film-progress" max="1" value="0" aria-label="首页图解播放进度"></progress></div>
<p id="home-film-status" class="film-status" role="status">完整讲解可在下方直接阅读；启用脚本后可播放动画。</p>
<ol id="home-film-story" class="home-film-story" aria-label="完整图解讲解"><li><strong>先认清条件。</strong>预算10元，商品2每单位1元；偏好为 u=x₁x₂，坐标刻度始终不变。</li><li><strong>原价时停下来读图。</strong>商品1每单位1元，最优选择为(5, 5)，两样各花5元。</li><li><strong>跟着涨价看变化。</strong>商品1从1元涨到2元，预算线绕(0, 10)向内转，横轴截距从10缩到5；最优点向左移动。</li><li><strong>在终点记住结论。</strong>商品1买2.50单位，商品2仍买5.00单位，两样仍各花5元。这是本例偏好下的结果。</li></ol>
<p class="demo-condition">这个例子：效用 u=x₁x₂，预算固定为10元，商品2价格固定为1元／单位；商品可以分割，数量不必是整数。这里只展示这一种偏好下的选择。</p><a class="home-open text-link" href="lesson-5-3.html?case=optimum&model=product">继续看消费者选择的原理与条件 →</a></div></section>
<div class="catalog-intro"><div><h2>按章节复习</h2><p>20章 · ${count}个小节 · ${problems}道原题</p></div><a href="exercises.html">按题目练习 →</a></div>`;

exports.decorateLesson=html=>html
 .replace(/<div class="eyebrow">[\s\S]*?<\/div>/g,'')
 .replace('class="hero entrance"','class="hero"')
 .replace(/(<nav class="scenario-links"[\s\S]*?<\/nav>)/,`<details class="model-menu" id="model-menu"><summary>选择本节模型与习题<span class="current-scenario"></span></summary>$1</details>`)
 .replace('<div class="workspace">',`<ol class="learning-path" aria-label="学习路径"><li><a href="#model-menu" aria-label="选模型或情境">选情境</a></li><li><a href="#fields" aria-label="调整一个参数">调参数</a></li><li><a href="#plot" aria-label="观察变化">看变化</a></li><li><a href="#interpretation" aria-label="读结论与条件">读条件</a></li></ol><div class="workspace">`)
 .replace('<div class="fields" id="fields">','<div class="control-intro"><h2>改一个条件</h2><p>先选情境，再调一个数。</p></div><div class="fields" id="fields">')
 .replace('<div id="legend" class="legend">','<header class="stage-title"><h2>观察变化</h2><a href="#interpretation">看解释与条件 ↓</a></header><div id="legend" class="legend">')
 .replace('<p id="reading"','<h2 id="interpretation" class="explanation-title">看到了什么</h2><p id="reading"')
 .replace('<div id="formula"','<h2 class="explanation-title">写成公式</h2><div id="formula"')
 .replace('<p id="boundary"','<h2 class="explanation-title">这时才成立</h2><p id="boundary"')
 .replace('href="#model-menu"',html.includes('class="scenario-links"')?'href="#model-menu"':'href="#chapter-select"');

exports.filmLesson=(html,s)=>{
 const player=`<section class="lesson-film" id="lesson-film" aria-label="连贯动画讲解"><div class="film-topline"><span>一段动画 · 跟着图想明白</span><span id="film-phase">先走进这个例子</span></div><h2 id="film-title">${esc(s.title)}</h2><p class="film-caption" id="film-caption">${esc(s.question)}</p><div class="film-transport"><button class="primary" id="film-play" type="button" disabled aria-pressed="false">播放讲解</button><button id="film-replay" type="button" disabled>从头再看</button><span class="film-count" id="film-meter">起始画面</span></div><p id="film-status" class="film-status" role="status">正在准备图像；下方公式和原理可直接阅读。</p></section>`;
 let result=html.replace('<div id="legend" class="legend">',player+'<div id="legend" class="legend">')
  .replace('<aside class="controls"','<aside hidden inert class="controls"')
  .replace(/<select id="chapter-select"[\s\S]*?<\/select>/,`<a class="chapter-back" href="index.html#chapter-${s.chapter}">本章目录 ↗</a>`)
  .replace(/<div id="guide-(\d+)"([^>]*?)>/g,(_,i,attrs)=>`<div id="guide-${i}"${attrs.replace(/ hidden/g,'')} data-heading="${['先认清对象','跟着变化看原因','带着条件记结论'][i]}">`);
 const alternatives={
  '2.4':[['case=satisficing&threshold=1','正好压线，也算够好'],['case=satisficing&threshold=5','如果一个都没过线'],['case=satisficing&threshold=-5','如果每个人都够好'],['case=satisficingrank&order=23','换一种固定面试顺序']],
  '2.5':[['case=moneypump&pump=menu&table=1&A=7&B=3&limit=2','两份菜单，怎样走回起点'],['case=moneypump&cash=2','钱不够，会在哪里停'],['case=moneypump&willing=0','不愿付费，交换不会发生'],['case=moneypump&notice=3&limit=12','识破后停止的情境'],['case=moneypump&decay=1&limit=24','每次收费减半的边界例'],['case=moneypump&fee=0','免费交换为何不会损失钱']]
 };
 const episodes=(s.scenarios||[]).map(c=>`<a href="lesson-${s.id.replace('.','-')}.html?case=${encodeURIComponent(c.value)}">${esc(c.label)}</a>`).join('')+(alternatives[s.id]||[]).map(([query,label])=>`<a href="lesson-${s.id.replace('.','-')}.html?${esc(query)}">${esc(label)}</a>`).join('');
 if(episodes)result=result.replace('<div class="lesson-end">',`<section class="film-episodes"><details><summary>同节其他动画与习题目录</summary><nav aria-label="本节动画与习题讲解">${episodes}</nav></details></section><div class="lesson-end">`);
 return result;
};

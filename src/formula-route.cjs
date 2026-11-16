'use strict';
const {escape}=require('./guided/format.cjs');
const coverage=require('../coverage.json');
const tasks=require('./review/sprint-tasks.cjs');
function chapterTasks(n){
 const t=tasks[n];
 const items=[['conditions','assumptions-'+t.condition,t.conditionLabel],['derivation','derivation-'+t.derivation,t.derivationLabel],['check','p'+t.problem,'自检：原书习题 '+t.problem]];
 return '<ol class="sprint-tasks">'+items.map(([key,anchor,label])=>`<li data-sprint-task="${key}"><a href="review-${n}.html#${anchor}">${escape(label)} →</a><button type="button" data-task-done hidden aria-pressed="false">标记完成</button>${key==='check'?'<p>检验方法：'+escape(t.reason)+'</p>':''}</li>`).join('')+'</ol>'+ (n<20?`<a class="sprint-next-chapter" href="#sprint-chapter-${n+1}">继续第 ${n+1} 章 →</a>`:'<a href="#main">回看全书任务进度 ↑</a>');
}
const hours=[
 {title:'个人选择与消费者理论',range:'第 1–5 章',chapters:[[1,10,'偏好关系、效用表示与序数变换'],[2,8,'选择函数、收缩一致性与理性化'],[3,14,'期望效用、独立性、风险态度'],[4,10,'单调性、凸性、连续性与边际替代率'],[5,18,'预算集、最优需求与价格收入变化']]},
 {title:'生产者理论与垄断',range:'第 6–7 章',chapters:[[6,25,'生产函数、成本函数、利润最大化'],[7,35,'统一价格、福利、分段定价与筛选约束']]},
 {title:'市场与均衡',range:'第 8–14 章',chapters:[[8,6,'权力序与均衡配置'],[9,7,'产权、交易循环与市场均衡'],[10,17,'预算最优、市场出清与福利定理'],[11,8,'不可分商品与扩展交换模型'],[12,9,'生产、要素价格与资源平衡'],[13,6,'预期、自我实现与均衡'],[14,7,'信息、信号与筛选']]},
 {title:'博弈、机制与社会选择',range:'第 15–20 章',chapters:[[15,18,'最佳反应、纳什均衡与混合策略'],[16,15,'策略、子博弈精炼与逆向归纳'],[17,8,'机制、激励相容与实施'],[18,8,'稳定匹配与延迟接受'],[19,5,'生产资料、收入分配与效率'],[20,6,'集体偏好、社会福利函数与汇总条件']]}
];
function formulaRoute(chapters,chaptersIndex){
 const title=i=>'第'+['一','二','三','四'][i]+'小时';
 const body=hours.map((h,i)=>{
  if(h.chapters.reduce((s,c)=>s+c[1],0)!==60)throw Error('Review schedule must sum to 60 minutes');
  return `<section class="sprint-hour" id="hour-${i+1}"><p>${title(i)} · ${h.range} · 60 分钟</p><h2>${h.title}</h2>${h.chapters.map(([n,min,focus])=>{
   const ch=chapters.find(c=>c.number===n),count=coverage.items.filter(x=>x.chapter===n&&/^(Lemma|Proposition) /.test(x.id)).length;
   return `<article class="sprint-item" id="sprint-chapter-${n}" data-sprint-chapter="${n}" data-sprint-min="${min}" data-sprint-title="第 ${n} 章 · ${escape(ch.title)}"><div class="sprint-time">${min} 分钟</div><div><div class="sprint-item-head"><h3><a href="review-${n}.html">第 ${n} 章 · ${escape(ch.title)} →</a></h3><button type="button" class="sprint-check" hidden aria-pressed="false">标记过完</button></div><p>${focus}</p><p class="formal-count">${ch.sections.length} 节 · ${count} 条命题与引理 · ${ch.problems.length} 道章末题</p>${chapterTasks(n)}<div class="hour-chapters"><a href="review-${n}.html#principles">定义与公式</a><a href="review-${n}.html#claims">命题与证明</a><a href="review-${n}.html#problems">习题与批注</a><a href="learn-${String(n).padStart(2,'0')}.html">生活理解版 ↗</a></div></div></article>`;
  }).join('')}</section>`;
 }).join('');
 const sprintToolbar=`<section class="sprint-toolbar" aria-label="学习进度与全站检索"><div id="study-resume" class="study-resume-banner" hidden></div><div class="sprint-progress-bar" id="sprint-progress-summary" hidden></div><p class="sprint-plan-note">分钟数按已勾选章节的计划分配累加，不是实际用时。每项读完后自行标记，随时可以暂停。</p><div class="sprint-filter-row"><button type="button" data-sprint-filter="all" aria-pressed="true" hidden>全部 20 章</button><button type="button" data-sprint-filter="todo" aria-pressed="false" hidden>只看还没过完的章</button></div><div class="sprint-search" data-atlas-search><form class="search-box" role="search" onsubmit="return false"><label for="review-find">全站直达搜索（命题 · 小节 · 习题 · 作业）</label><input type="search" id="review-find" placeholder="例如：命题17.1、习题7.8、WARP、VCG、信息租金" autocomplete="off"></form><div data-search-count role="status" aria-live="polite"></div><ul class="atlas-result-list" data-search-results hidden></ul></div><details class="study-backup" data-study-backup hidden><summary>学习记录管理（导出 JSON / 清空本机状态）</summary><div class="study-backup-actions"><button type="button" data-export-study>导出学习进度 JSON ↓</button><button type="button" data-clear-study>清空本机学习记录</button><span class="backup-status" data-backup-status role="status"></span></div></details></section>`;
 return `<main id="main" class="sprint"><header><a href="index.html">← 市场之中</a><p class="folio">全书复习讲义 · Osborne–Rubinstein</p><h1>4h 速通公式版</h1><p>条件 → 符号 → 公式 → 推导。按原书 20 章复习，每条命题都有前提、结论和证明思路；章末题与课堂作业保留完整答案和批注。</p><nav class="sprint-doors" aria-label="复习入口"><a href="#hour-1">开始四小时复习 →</a><a href="#chapters">全书目录</a><a href="review-homework.html">课堂作业</a><a href="learn.html">生活例子理解版 ↗</a></nav></header>${sprintToolbar}<div class="formal-reading"><b>每节按这个顺序读</b><ol><li>先确定假设和定义域，判断公式能否使用。</li><li>对照符号表，说明每个量表示什么。</li><li>沿推导补出关键一步，再核对命题的结论。</li><li>用本章原题检查是否会列式、论证和处理边界。</li></ol><p>240 分钟用于串起全书主线；各章的完整推导与习题随时可查。</p></div><nav class="sprint-index" aria-label="四小时路线">${hours.map((h,i)=>`<a href="#hour-${i+1}"><small>${title(i)}</small><strong>${h.title}</strong></a>`).join('')}</nav>${body}${chaptersIndex}<footer><a href="#main">返回四小时路线 ↑</a>　<a href="learn.html">生活例子理解版 →</a></footer></main>`;
}
module.exports={formulaRoute};

const katex = require('../vendor/katex/katex.min.js');
const notation = require('../math-format.js');

function escape(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}
const mathCache = new Map();
function math(tex) {
  if (!mathCache.has(tex)) {
    const html = katex.renderToString(tex, {output:'mathml',throwOnError:true,strict:'ignore',trust:false});
    mathCache.set(tex, html);
  }
  return mathCache.get(tex);
}
// Make complete mathematical clauses wrap on narrow screens. Never split a
// fraction, a delimiter pair, an array, or a command with its arguments.
function clauses(tex) {
  if (tex.includes('\\begin{') || tex.includes('\\middle')) return [tex];
  let depth = 0, delimiters = 0, start = 0;
  const parts = [];
  const tokens = /\\[a-zA-Z]+|\\.|[{}()[\]=<>+,;]|[^\\{}()[\]=<>+,;]+/g;
  const ops = new Set(['=','<','>','+','\\le','\\ge','\\leq','\\geq','\\iff','\\Longrightarrow','\\Rightarrow','\\implies','\\Leftrightarrow','\\quad','\\qquad','\\sim','\\succ','\\succeq','\\in','\\subseteq',',',';']);
  for (const t of tex.matchAll(tokens)) {
    const sym=t[0];
    if (sym==='\\right') { delimiters--; continue; }
    if (sym==='\\left') { delimiters++; continue; }
    if ('{(['.includes(sym) && sym.length===1) { depth++; continue; }
    if ('})]'.includes(sym) && sym.length===1) { depth=Math.max(0,depth-1); continue; }
    if (depth || delimiters || !ops.has(sym)) continue;
    const at=t.index+(sym===',' || sym===';' ? 1 : 0);
    if (at-start >= 4 && tex.slice(at).trim() && tex.slice(start,at).trim()) {
      parts.push(tex.slice(start,at).trim()); start=at;
    }
  }
  if (tex.slice(start).trim()) parts.push(tex.slice(start).trim());
  return parts.length>1 ? parts : [tex];
}
function equation(tex) {
  tex=notation.displayTex(tex);
  const full=math(tex);
  const parts=clauses(tex.replace(/\\ /g,' '));
  if (parts.length===1) return '<span class="math-piece">'+full+'</span>';
  // Splitting is a layout enhancement. Keep the intact expression for AT.
  try {
    return '<span class="sr">'+full+'</span><span class="math-flow" aria-hidden="true">'+parts.map(p=>'<span class="math-piece">'+math(p)+'</span>').join('')+'</span>';
  } catch { return '<span class="math-piece">'+full+'</span>'; }
}
function inlineMath(tex) {
  return '<span class="inline-math">'+equation(tex)+'</span>';
}
function prose(s) {
  return s.split(/([；“”‘’【】（）！？])/u).map(part=>notation.splitRuns(part).map(run=>{
    if (!run.math || !notation.isMath(run.text) || /[\u3400-\u9fff]/u.test(run.text)) return escape(run.text);
    const [,leading,core,trailing]=run.text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if(!core || /^https?:/.test(core))return escape(run.text);
    return escape(leading)+inlineMath(notation.toTex(core))+escape(trailing);
  }).join('')).join('');
}
function inline(value) {
  return String(value).split(/(\$[^$\n]+\$)/g).map(s=>s.startsWith('$')&&s.endsWith('$')&&s.length>2
    ? inlineMath(s.slice(1,-1)) : prose(s)).join('');
}
module.exports={escape,math,equation,inline};

'use strict';
// Conservative lexical lookup in the section's authored dictionary. Unknown
// forms stay in the full symbol table; command spelling never becomes a variable.
function atoms(tex, includeIndices = true) {
  const result = new Set();
  const tokens = String(tex).match(/\\[A-Za-z]+|\\.|[A-Za-z]+|[0-9]+|[^\s]/g) || [];
  const formats = new Set(['frac','dfrac','tfrac','sqrt','sum','prod','max','min','sup','inf','arg','lim','left','right','big','Big','quad','qquad','displaystyle','limits','le','ge','ne','in','notin','to','implies','iff','cdot','times','partial','forall','exists']);
  function group(at) {
    if (tokens[at] !== '{') {
      // TeX's unbraced script consumes one letter: ^kP is ^{k} followed by P.
      if (/^[A-Za-z]{2,}$/.test(tokens[at] || '')) tokens.splice(at,1,tokens[at][0],tokens[at].slice(1));
      return {text: tokens[at] || '', end: at + 1};
    }
    let depth = 1, end = at + 1;
    for (; end < tokens.length && depth; end++) {
      if (tokens[end] === '{') depth++;
      if (tokens[end] === '}') depth--;
    }
    return {text: tokens.slice(at + 1, end - 1).join(''), end};
  }
  for (let i = 0; i < tokens.length;) {
    let token = tokens[i++];
    if (/^\\(?:text|textrm|operatorname)$/.test(token)) { i = group(i).end; continue; }
    if (/^\\/.test(token) && formats.has(token.slice(1))) continue;
    if (!/^(?:[A-Za-z]+|\\[A-Za-z]+)$/.test(token)) continue;
    const scripts = {};
    while (tokens[i] === '_' || tokens[i] === '^') {
      const kind = tokens[i++], value = group(i); scripts[kind] = value.text; i = value.end;
      if (includeIndices) for (const index of atoms(value.text)) result.add(index);
    }
    if (scripts._ !== undefined) token += '_{' + scripts._ + '}';
    if (scripts['^'] !== undefined) token += '^{' + scripts['^'] + '}';
    result.add(token);
  }
  return result;
}
function scopedSymbols(tex, rows) {
  const actual = atoms(tex), seen = new Set();
  return rows.filter(([symbol]) => {
    if (seen.has(symbol)) return false;
    seen.add(symbol);
    // A dictionary row describing f(x) is looked up by f, not an unrelated x.
    const names = symbol.replace(/\([^)]*\)/g, '').split(/[，,、=]|\\in\b|\\approx\b/)[0];
    const alternatives = /[,，、]/.test(symbol) ? symbol.split(/[,，、]/) : [names];
    return alternatives.some(name => [...atoms(name, false)].some(atom => actual.has(atom)));
  });
}
module.exports = {atoms, scopedSymbols};

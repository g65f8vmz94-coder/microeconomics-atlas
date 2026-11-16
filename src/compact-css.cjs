'use strict';
// Preserve descendant selectors, quoted content and calc() spacing. This is a
// whitespace compactor, not a CSS optimiser; gzip does the remaining work.
module.exports = function compactCSS(source) {
  let out = '', space = false;
  for (let i = 0; i < source.length;) {
    const ch = source[i];
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end < 0) throw Error('Unclosed CSS comment');
      // Keep token-adjacent comments rather than changing token boundaries.
      if ((i && !/\s/.test(source[i - 1])) || (end + 2 < source.length && !/\s/.test(source[end + 2]))) {
        if (space && out) out += ' ';
        out += source.slice(i, end + 2); space = false;
      }
      i = end + 2; continue;
    }
    if (/\s/.test(ch)) { space = true; i++; continue; }
    if (space && out && !/[{;,>~]$/.test(out) && !/[{};,>~]/.test(ch)) out += ' ';
    space = false;
    if (ch === '"' || ch === "'") {
      const quote = ch; out += source[i++];
      while (i < source.length) {
        const c = source[i++]; out += c;
        if (c === '\\' && i < source.length) out += source[i++];
        else if (c === quote) break;
      }
    } else if (ch === '\\' && i + 1 < source.length) {
      out += source.slice(i, i + 2); i += 2;
    } else { out += ch; i++; }
  }
  return out.trim();
};

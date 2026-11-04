// Compress repeated presentation CSS, preserving raw embedded font faces and
// readable economic JavaScript. Existing local pako is shared with KaTeX.
const zlib=require('node:zlib');
module.exports=function standaloneStyle(css,inflate){
 const fonts=css.match(/@font-face\{[^}]*\}/g)||[],body=css.replace(/@font-face\{[^}]*\}/g,'');
 const packed=zlib.gzipSync(Buffer.from(body,'utf8'),{level:9,mtime:0}).toString('base64');
 return `<style>${fonts.join('\n')}</style><script>${inflate}</script><script type="text/plain" id="atlas-style-gzip">${packed}</script><script>(()=>{const raw=atob(document.getElementById('atlas-style-gzip').textContent);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const style=document.createElement('style');style.dataset.atlasStyle='restored';style.textContent=pako.ungzip(bytes,{to:'string'});document.head.append(style);})();</script>`;
};

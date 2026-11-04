/* Plain authored economics notation -> structured TeX -> visual HTML + MathML.
 * KaTeX 0.19.1 (MIT) is bundled locally. No remote fonts or CDN requests.
 * Fractions, powers, roots, limits and derivatives retain their mathematical
 * grouping; Chinese explanation remains ordinary, wrapping page text.
 */
(()=>{
 const economicWords=['MU','MR','MC','MRS','MRT','MRTS','MP','MPK','MPL','BR','TR','AR','AC','AVC','AFC','ATC','TC','FC','VC','CS','PS','TS','DWL','EU','CE','IR','IC','NE','SPE','VCG','TTC','MB','MSC','MSB'];
 const operatorWords=['argmax','argmin','max','min','sqrt','log','ln','exp','sin','cos','tan','lim','Pr',...economicWords].sort((a,b)=>b.length-a.length);
 const symbols={'×':'\\times ','·':'\\cdot ','≤':'\\le ','≥':'\\ge ','≠':'\\ne ','≈':'\\approx ','≽':'\\succeq ','≿':'\\succeq ','≻':'\\succ ','≺':'\\prec ','≼':'\\preceq ','∼':'\\sim ','∈':'\\in ','∉':'\\notin ','⊆':'\\subseteq ','⊂':'\\subset ','⊇':'\\supseteq ','∪':'\\cup ','∩':'\\cap ','⇒':'\\Rightarrow ','⇔':'\\Longleftrightarrow ','→':'\\to ','↔':'\\leftrightarrow ','∞':'\\infty ','Σ':'\\sum ','∑':'\\sum ','∫':'\\int ','Π':'\\Pi ','−':'-','–':'-','′':"'",'″':"''",'½':'\\frac{1}{2}','⅓':'\\frac{1}{3}','¼':'\\frac{1}{4}','%':'\\%','&':'\\&','#':'\\#','€':'\\text{€}','$':'\\$','…':'\\ldots '};
 const supMap={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁺':'+','⁻':'-','ᵃ':'a','ᵇ':'b','ᶜ':'c','ᵈ':'d','ᵉ':'e','ᶠ':'f','ᶢ':'g','ʰ':'h','ⁱ':'i','ʲ':'j','ᵏ':'k','ˡ':'l','ᵐ':'m','ⁿ':'n','ᵒ':'o','ᵖ':'p','ʳ':'r','ˢ':'s','ᵗ':'t','ᵘ':'u','ᵛ':'v','ʷ':'w','ˣ':'x','ʸ':'y','ᶻ':'z','ᴬ':'A','ᴮ':'B','ᵀ':'T','ᵅ':'α','ᵝ':'β','ᵞ':'γ','ᵑ':'η'};
 const subMap={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','₊':'+','₋':'-','ᵢ':'i','ⱼ':'j','ₖ':'k','ₗ':'l','ₕ':'h','ₘ':'m','ₙ':'n','ₚ':'p','ₛ':'s','ₜ':'t','ₓ':'x','ᵣ':'r','ₐ':'a','ₑ':'e','ₒ':'o','ᵤ':'u','ᵦ':'b'};
 const esc=s=>s.replace(/[{}\\]/g,x=>'\\'+x);
 function toTex(source){
  if(/\\[A-Za-z]+/.test(String(source)))return String(source);
  let input=String(source).replace(/\u00a0/g,' ').replace(/\*\*/g,'^'),i=0;
  function group(close=''){
   const tokens=[];
   while(i<input.length){let ch=input[i];if(close&&ch===close){i++;break}if(/\s/.test(ch)){i++;continue}
    if(['(','[','{'].includes(ch)){i++;const z=group({'(':')','[':']','{':'}'}[ch]),left=ch==='{'?'\\{':ch,right=ch==='{'?'\\}':{'(':')','[':']'}[ch];tokens.push(decorate({tex:'\\left'+left+z+'\\right'+right,inner:z,atom:true}));continue}
    if([')',']','}'].includes(ch)){tokens.push({tex:ch==='}'?'\\}':ch,atom:false});i++;continue}
    if(ch==='^'||ch==='_'){i++;const prior=tokens.at(-1);let power=readAtom();if(prior)prior.tex+=(ch==='^'?'^':'_')+'{'+(power.inner??power.tex)+'}';else tokens.push({tex:(ch==='^'?'^':'_')+'{'+power.tex+'}',atom:false});continue}
    if(ch==='/'&&tokens.length){i++;const left=tokens.pop(),right=readAtom();tokens.push({tex:'\\frac{'+(left.inner??left.tex)+'}{'+(right.inner??right.tex)+'}',atom:true});continue}
    const token=readAtom();tokens.push(token);
   }
   return tokens.map(t=>t.tex).join(' ');
  }
  function readAtom(decorated=true){
   const finish=t=>{const z=decorated?decorate(t):t;
    // A function value is one atom. Splitting C(y) into C and (y) would
    // incorrectly leave C outside a numerator, or its argument outside a
    // denominator. Bind primes/subscripts first, then the argument and powers.
    if(decorated&&z.callable){let at=i;while(/\s/.test(input[at]??'')&&at<input.length)at++;if(input[at]==='('){i=at+1;const args=group(')');z.tex+='\\left('+args+'\\right)';delete z.inner;if(input[i]==='^'||supMap[input[i]])z.tex='{'+z.tex+'}';return decorate(z)}}return z;};
   while(/\s/.test(input[i]??'')&&i<input.length)i++;if(i>=input.length)return{tex:'\\,',atom:false};let ch=input[i];
   if(['(','[','{'].includes(ch)){i++;const z=group({'(':')','[':']','{':'}'}[ch]);return finish({tex:'\\left'+(ch==='{'?'\\{':ch)+z+'\\right'+(ch==='{'?'\\}':{'(':')','[':']'}[ch]),inner:z,atom:true})}
   if(ch==='√'||input.slice(i,i+4)==='sqrt'){i+=ch==='√'?1:4;const x=readAtom();return finish({tex:'\\sqrt{'+(x.inner??x.tex)+'}',atom:true})}
   if(ch==='d'||ch==='∂'){
    // A differential is a complete numerator/denominator, including its
    // variable or function argument. Never split dx/dp into d*(x/d)*p.
    const start=i,mark=ch==='d'?'\\mathrm{d}':'\\partial';i++;
    let order='';if(/[¹²³ⁿ]/.test(input[i]??'')&&i<input.length)order=supMap[input[i++]];
    else if(input[i]==='^'){i++;const power=readAtom(false);order=power.inner??power.tex}
    const numerator=input[i]==='/'?{tex:''}:readAtom();
    while(i<input.length&&/\s/.test(input[i]))i++;
    if(input[i]==='/'&&input[i+1]===ch){i+=2;const denominator=readAtom();return finish({tex:'\\frac{'+mark+' '+(order?'^{'+order+'}':'')+numerator.tex+'}{'+mark+' '+denominator.tex+'}',atom:true})}
    i=start;if(ch==='∂'){i++;const x=readAtom();return finish({tex:'\\partial '+x.tex,atom:true})}
   }
   if(ch==='\\'){const m=input.slice(i).match(/^\\[A-Za-z]+|^\\./);if(m){i+=m[0].length;return{tex:m[0],atom:true}}}
   let token;
   if(/[\u3400-\u9fff]/.test(ch)){let text='';while(i<input.length&&/[\u3400-\u9fff，。：、？！]/.test(input[i]))text+=input[i++];return{tex:'\\text{'+esc(text)+'}',atom:false}}
   const number=input.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(number){i+=number[0].length;token={tex:number[0],atom:true}}
   else{const word=operatorWords.find(w=>input.startsWith(w,i));if(word){i+=word.length;token={tex:economicWords.includes(word)?'\\mathrm{'+word+'}':['argmax','argmin'].includes(word)?'\\operatorname*{'+word+'}':'\\'+word+' ',atom:true,callable:true}}
    else if(symbols[ch]){i++;token={tex:symbols[ch],atom:['Σ','∑','∫','∞','½','⅓','¼'].includes(ch)}}
    else if(/[A-Za-zα-ωΑ-Ω]/.test(ch)){i++;token={tex:ch,atom:true,callable:true};const digit=input.slice(i).match(/^\d+/);if(digit){token.tex+='_{'+digit[0]+'}';i+=digit[0].length}}
    else{i++;token={tex:symbols[ch]??(ch==='{'?'\\{':ch==='}'?'\\}':ch==='~'?'\\sim ':ch),atom:['Σ','∑','∫','∞','½','⅓','¼'].includes(ch)}}
   }
   return finish(token);
  }
  function decorate(t){
   while(i<input.length){const ch=input[i],accent={'\u0304':'overline','\u0305':'overline','\u0302':'hat','\u0303':'tilde','\u0307':'dot','\u20d7':'vec'}[ch];if(accent){t.tex='\\'+accent+'{'+t.tex+'}';delete t.inner;i++;continue}if(subMap[ch]){let sub='';while(subMap[input[i]])sub+=subMap[input[i++]];t.tex+='_{'+sub+'}';delete t.inner;continue}if(supMap[ch]){let sup='';while(supMap[input[i]])sup+=supMap[input[i++]];t.tex+='^{'+sup+'}';delete t.inner;continue}
    if(ch==='^'||ch==='_'){i++;let x;if(ch==='_'&&/^[A-Za-z]{2,}/.test(input.slice(i))){const word=input.slice(i).match(/^[A-Za-z]+/)[0];i+=word.length;x={tex:'\\mathrm{'+word+'}'}}else x=readAtom(false);t.tex+=ch+'{'+(x.inner??x.tex)+'}';delete t.inner;continue}
    if(ch==='*'&&!/[A-Za-z0-9(]/.test(input[i+1]??'')){t.tex+='^{*}';delete t.inner;i++;continue}if(ch==='′'||ch==="'"){t.tex+="'";delete t.inner;i++;continue}break;
   }return t;
  }
  return group();
 }
 function splitRuns(source){const out=[];let part='',depth=0;for(const ch of String(source)){if('([{'.includes(ch))depth++;if(')]}'.includes(ch))depth--;const text=/[\u3400-\u9fff，。：、？！]/.test(ch)&&depth===0;if(text){if(part){out.push({math:true,text:part});part=''}const prev=out.at(-1);if(prev&&!prev.math)prev.text+=ch;else out.push({math:false,text:ch})}else part+=ch}if(part)out.push({math:true,text:part});return out}
 function splitMath(source){const parts=[];let start=0,depth=0,environmentDepth=0;for(let i=0;i<source.length;i++){
   const begin=source.slice(i).match(/^\\begin\{[A-Za-z*]+\}/),end=source.slice(i).match(/^\\end\{[A-Za-z*]+\}/);
   if(begin){environmentDepth++;i+=begin[0].length-1;continue}if(end){environmentDepth=Math.max(0,environmentDepth-1);i+=end[0].length-1;continue}
   const ch=source[i];if('([{'.includes(ch))depth++;if(')]}'.includes(ch))depth--;if(depth!==0||environmentDepth!==0)continue;
   if(ch===','){const before=source.slice(start,i),after=source.slice(i+1);if(/[=<>≤≥≠≈⇒⇔]/.test(before)&&/[=<>≤≥≠≈⇒⇔]/.test(after)){parts.push(source.slice(start,i+1));start=i+1}continue}
   if(source.length<34)continue;
   const logical=['\\Longrightarrow','\\Rightarrow','\\Longleftrightarrow','\\iff','\\land','⇒','⇔'].find(x=>source.startsWith(x,i)),symbol=logical||(/[=<>≤≥≠≈]/.test(ch)?ch:'');
   if(!symbol)continue;
   const before=source.slice(start,i),after=source.slice(i+symbol.length),minimum=logical?5:16;
   if(before.trim().length>=minimum&&after.trim().length>=10){parts.push(before);start=i;i+=symbol.length-1}
  }parts.push(source.slice(start));return parts.filter(x=>x.trim())}
 function isMath(s){const label=s.trim().replace(/[.,;:]+$/,'').replace(/\s+/g,'');if(/^(?:IR|IC|NE|SPE|MR|MC|CS|PS|AC)(?:_[A-Za-z0-9]+)?\/(?:IR|IC|NE|SPE|MR|MC|CS|PS|AC)(?:_[A-Za-z0-9]+)?$/.test(label)||/^[A-Za-z]{3,}\/[A-Za-z]{3,}$/.test(label))return false;return /[=<>≤≥≠≈≽≿≻≺≼∼∈∉⊆⊂⊇∪∩∀∃¬∧∨⇒⇔→↔∞√∂_^/Σ∑∫²³ᵃᵇᶜᵈᵉᶠᶢʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻᵅᵝᵞᵑ₀-ₜᵢⱼᵣᵤᵦ+−×·]|\\[A-Za-z]+/.test(s)&&/[A-Za-zα-ωΑ-Ω0-9]/.test(s)}
 function splitClauses(source){const parts=[];let start=0,depth=0,env=0;for(let i=0;i<source.length;i++){const marker=source.slice(i).match(/^\\(begin|end)\{[A-Za-z*]+\}/);if(marker){env+=marker[1]==='begin'?1:-1;i+=marker[0].length-1;continue}const c=source[i];if('([{'.includes(c))depth++;if(')]}'.includes(c))depth--;if(depth===0&&env===0&&/[；;\n]/.test(c)){parts.push(source.slice(start,i));start=i+1}}parts.push(source.slice(start));return parts.filter(s=>s.trim())}
 // Only the presentation changes: logical propositions get Chinese words,
 // while set union/intersection and the authored source remain unchanged.
 function displayTex(tex){return String(tex).replace(/\\(?:land|wedge)\b|∧/g,()=>String.raw`\mathbin{\text{并且}}`).replace(/\\(?:lor|vee)\b|∨/g,()=>String.raw`\mathbin{\text{或者}}`);}
 const api={toTex,displayTex,splitRuns,splitMath,splitClauses,isMath};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(typeof window==='undefined'||typeof document==='undefined')return;window.microMath=api;
 const renderCache=new Map();
 function renderRun(raw,display=false){const span=document.createElement('span');span.className='math-run';span.dataset.mathSource=raw;const tex=displayTex(toTex(raw)),key=(display?'d:':'i:')+tex;span.dataset.tex=tex;
  try{let markup=renderCache.get(key);if(!markup){markup=window.katex.renderToString(tex,{output:window.MICRO_NATIVE_MATHML?'mathml':'htmlAndMathml',displayMode:display,throwOnError:true,strict:'ignore',trust:false,maxExpand:1000});if(renderCache.size>=1024)renderCache.delete(renderCache.keys().next().value);renderCache.set(key,markup)}span.innerHTML=markup}catch(error){span.className+=' math-fallback';span.textContent=raw;span.dataset.mathError=error.message}return span;
 }
 function rawText(el){const clone=el.cloneNode(true);clone.querySelectorAll('sub').forEach(n=>n.replaceWith('_{'+n.textContent+'}'));clone.querySelectorAll('sup').forEach(n=>n.replaceWith('^{'+n.textContent+'}'));clone.querySelectorAll('br').forEach(n=>n.replaceWith('\n'));return clone.textContent}
 function equation(el){if(el.querySelector('.math-layout'))return;const raw=rawText(el);if(!raw.trim())return;const box=document.createElement('div');box.className='math-layout';box.dataset.mathSource=raw;
  for(const clause of splitClauses(raw)){const line=document.createElement('div');line.className='math-line';for(const run of splitRuns(clause)){if(run.math&&isMath(run.text)){for(const part of splitMath(run.text))line.append(renderRun(part,true))}else{let prose=run.text;const punctuation=prose.match(/^[，,、。]+/);if(punctuation&&line.lastChild){line.lastChild.append(document.createTextNode(punctuation[0]));prose=prose.slice(punctuation[0].length)}if(prose){const t=document.createElement('span');t.className='math-prose';t.textContent=prose;line.append(t)}}}box.append(line)}el.replaceChildren(box);
 }
 function inline(el){const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode()){const n=walker.currentNode;if(!n.parentElement.closest('math,.math-run,script,style,select,option,button,output,code,pre,.math-layout,.svg-math'))nodes.push(n)}
  for(const n of nodes){const chunks=splitRuns(n.nodeValue);if(!chunks.some(r=>r.math&&isMath(r.text)))continue;const frag=document.createDocumentFragment();for(const r of chunks){if(r.math&&isMath(r.text))frag.append(renderRun(r.text.trim()));else frag.append(document.createTextNode(r.text))}n.replaceWith(frag)}
 }
 const nativeNames={cd:'Cobb–Douglas效用',product:'乘积效用',linear:'完全替代效用',complement:'完全互补效用',quasi:'拟线性效用',ideal:'理想点偏好',giffen:'局部吉芬构造',max:'最大值效用',quadratic:'平方和效用',sqrt:'平方根效用',log:'对数效用',power:'幂效用'};
 function controls(){for(const select of document.querySelectorAll('#fields select,.fields select')){if(select.id==='case'||select.id==='experiment')continue;for(const option of select.options){if(option.dataset.mathOriginal!==undefined)continue;const raw=option.textContent;if(!/[\/√^²³ᵃᵇᶜᵈᵉᶠᶢʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻᵅᵝᵞ]|_[A-Za-z]/.test(raw)||!/[A-Za-z]/.test(raw))continue;option.dataset.mathOriginal=raw;const prefix=raw.split(/[：:]/)[0];option.textContent=nativeNames[option.value]??(prefix!==raw?prefix:'模型 '+option.value)}const raw=select.selectedOptions[0]?.dataset.mathOriginal;let preview=select.parentElement.querySelector('.control-math');if(!raw){preview?.remove();continue}if(preview?.dataset.mathSource===raw)continue;if(!preview){preview=document.createElement('div');preview.className='control-math';select.after(preview)}preview.dataset.mathSource=raw;preview.replaceChildren();for(const run of splitRuns(raw)){if(run.math&&isMath(run.text))preview.append(renderRun(run.text));else preview.append(document.createTextNode(run.text))}}}
 function svgMath(){for(const n of document.querySelectorAll('#plot svg text,.hero-art svg text')){const raw=n.textContent;if(!isMath(raw))continue;const foreign=document.createElementNS('http://www.w3.org/2000/svg','foreignObject'),font=+(n.getAttribute('font-size')||getComputedStyle(n).fontSize.replace('px','')||13);for(const attr of ['transform','opacity','data-motion'])if(n.hasAttribute(attr))foreign.setAttribute(attr,n.getAttribute(attr));foreign.dataset.mathX=n.getAttribute('x')||'0';foreign.dataset.mathY=n.getAttribute('y')||'0';foreign.dataset.mathAnchor=n.getAttribute('text-anchor')||'start';foreign.dataset.mathSource=raw;const box=document.createElement('div');box.className='svg-math';box.style.fontSize=font+'px';box.style.color=n.getAttribute('fill')||getComputedStyle(n).fill;for(const run of splitRuns(raw)){if(run.math&&isMath(run.text))box.append(renderRun(run.text));else box.append(document.createTextNode(run.text))}foreign.append(box);n.replaceWith(foreign)}
  for(const foreign of document.querySelectorAll('foreignObject[data-math-source]')){foreign.setAttribute('width','2000');foreign.setAttribute('height','500');const box=foreign.firstChild,rect=box.getBoundingClientRect(),matrix=foreign.getScreenCTM(),scale=matrix?Math.hypot(matrix.a,matrix.b):1,w=rect.width/(scale||1),h=rect.height/(scale||1),anchor=foreign.dataset.mathAnchor;foreign.setAttribute('x',String(+foreign.dataset.mathX-(anchor==='middle'?w/2:anchor==='end'?w:0)));foreign.setAttribute('y',String(+foreign.dataset.mathY-h*.8));foreign.setAttribute('width',String(w+4));foreign.setAttribute('height',String(h+4))}
 }
 let observer;function render(){if(!window.katex?.renderToString){observer?.observe(document.body,{subtree:true,childList:true,characterData:true});return}observer?.disconnect();document.querySelectorAll('.equation,#formula').forEach(equation);document.querySelectorAll('main p,main li,main td,main th,main dt,main dd,main h2,main h3,main figcaption,.reading,#reading,.boundary,#boundary,.extra,#extras,.guide-panel,.focus-question,.field label,.provenance,.metric-label').forEach(inline);controls();svgMath();for(const line of document.querySelectorAll('.math-line')){let long=false;for(const run of line.querySelectorAll('.math-run'))if(run.scrollWidth>run.clientWidth+2){run.tabIndex=0;long=true}line.classList.toggle('has-long-formula',long)}observer?.observe(document.body,{subtree:true,childList:true,characterData:true})}
 observer=new MutationObserver(render);document.addEventListener('DOMContentLoaded',render,{once:true});window.addEventListener('load',render,{once:true});document.querySelectorAll('script[src*="katex.min.js"]').forEach(s=>s.addEventListener('load',render,{once:true}));render();document.fonts?.ready.then(render);let resizeFrame=0;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(render)},{passive:true});api.refresh=render;
})();

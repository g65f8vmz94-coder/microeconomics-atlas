const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto'),zlib=require('node:zlib'),{spawnSync}=require('node:child_process');
const katex=require('./src/vendor/katex/katex.min.js'),m=require('./src/math-format.js');let checks=0;const ok=(v,msg)=>{checks++;assert.ok(v,msg)};
const piecewise=String.raw`u_i=\begin{cases}v_i-b_i&b_i>b_j\\\frac{v_i}{2}-b_i&b_i=b_j\\-b_i&b_i<b_j\end{cases}`;
ok(m.splitMath(piecewise).length===1,'piecewise comparisons stay in one environment');
const piecewiseMarkup=katex.renderToString(m.splitMath(piecewise)[0],{output:'mathml',throwOnError:true});ok((piecewiseMarkup.match(/<mtr>/g)||[]).length===3,'piecewise has three rendered rows');
const fixtures=[];function add(raw,values,expected){const tex=m.toTex(raw),html=katex.renderToString(tex,{output:'mathml',displayMode:true,strict:'ignore',throwOnError:true}),xml=html.match(/<math[\s\S]*<\/math>/)[0];fixtures.push({raw,tex,xml,values,expected});ok(!html.includes('katex-error'),raw);}
for(let n=1;n<=12;n++)for(const alpha of [.2,.5,.8]){
 const a=n+.5,b=n/3+1,c=n/5+.7,d=n/7+1,A=2.3,r=.7,p=n/15,w=10,p1=1.5,p2=2,u=3;
 add('(a+b)^2/c',{a,b,c},(a+b)**2/c);add('a/(b+c)^2',{a,b,c},a/(b+c)**2);add('a/b+c/d',{a,b,c,d},a/b+c/d);add('√(a+b)',{a,b},Math.sqrt(a+b));add('(12−w)/(3−p₁)',{w,p_1:p1},(12-w)/(3-p1));add('Ar·aʳ⁻¹',{A,r,a},A*r*a**(r-1));add('u·(p₁/α)ᵅ·(p₂/(1−α))¹⁻ᵅ',{u,p_1:p1,p_2:p2,α:alpha},u*(p1/alpha)**alpha*(p2/(1-alpha))**(1-alpha));add('[(1−p)zₗᵞ+pzₕᵞ]^(1/γ)',{p,z_l:4,z_h:16,γ:alpha},((1-p)*4**alpha+p*16**alpha)**(1/alpha));
 // f and g here are the independent linear functions f(t)=2t, g(t)=3t.
 // The MathML evaluator treats their juxtaposition as multiplication, making
 // misplaced function arguments in fractions/powers numerically detectable.
 add('f(a)/g(b)',{f:2,g:3,a,b},2*a/(3*b));add('f(a)^2/g(b)',{f:2,g:3,a,b},(2*a)**2/(3*b));add('f(a)/g(b)^2',{f:2,g:3,a,b},2*a/(3*b)**2);add('f(a)/g(b+c)',{f:2,g:3,a,b,c},2*a/(3*(b+c)));
 add('MU₁/MU₂',{MU_1:a,MU_2:b},a/b);add('MPL/MPK',{MPL:a,MPK:b},a/b);add('AVC(q)/q',{AVC:2,q:a},2);
}
const evaluator=String.raw`import sys,json,xml.etree.ElementTree as E,math
rows=json.load(sys.stdin)
def tag(e):return e.tag.rsplit('}',1)[-1]
def text(e):return ''.join(e.itertext())
def evaluate(e,values):
 t=tag(e)
 if t=='math':return evaluate(e[0],values)
 if t=='semantics':return evaluate(e[0],values)
 if t=='mn':return float(text(e))
 if t=='mi':return values[text(e)]
 if t=='mfrac':return evaluate(e[0],values)/evaluate(e[1],values)
 if t=='msup':return evaluate(e[0],values)**evaluate(e[1],values)
 if t=='msub':return values[text(e[0])+'_'+text(e[1])]
 if t=='msubsup':return values[text(e[0])+'_'+text(e[1])]**evaluate(e[2],values)
 if t=='msqrt':return math.sqrt(evaluate_sequence(list(e),values))
 if t=='mo':return {'−':'-','⋅':'*','×':'*','[':'(',']':')','{':'(','}':')'}.get(text(e),text(e))
 if t in ('mspace','annotation'):return None
 return evaluate_sequence(list(e),values)
def evaluate_sequence(children,values):
 name=''.join(text(x) for x in children)
 if children and all(tag(x)=='mi' for x in children) and name in values:return values[name]
 raw=[evaluate(x,values) for x in children];raw=[x for x in raw if x is not None];tokens=[]
 for v in raw:
  if tokens and (isinstance(tokens[-1],(int,float)) or tokens[-1]==')') and (isinstance(v,(int,float)) or v=='('):tokens.append('*')
  tokens.append(v)
 output=[];ops=[];prec={'+':1,'-':1,'*':2,'/':2}
 for v in tokens:
  if isinstance(v,(int,float)):output.append(v)
  elif v=='(':ops.append(v)
  elif v==')':
   while ops and ops[-1]!='(':output.append(ops.pop())
   if ops:ops.pop()
  else:
   while ops and ops[-1]!='(' and prec[ops[-1]]>=prec[v]:output.append(ops.pop())
   ops.append(v)
 output+=ops[::-1];stack=[]
 for v in output:
  if isinstance(v,(int,float)):stack.append(v)
  else:
   b=stack.pop();a=stack.pop();stack.append(a+b if v=='+' else a-b if v=='-' else a*b if v=='*' else a/b)
 assert len(stack)==1,(stack,tokens)
 return stack[0]
for row in rows:
 try:actual=evaluate(E.fromstring(row['xml']),row['values'])
 except Exception as e:raise RuntimeError((row['raw'],row['tex'],str(e)))
 assert abs(actual-row['expected'])<=1e-8*max(1,abs(row['expected'])),(row['raw'],actual,row['expected'])
print(json.dumps({'semanticFixtures':len(rows),'passed':True}))
`;
const py=process.env.PYTHON_BIN||'python3',res=spawnSync(py,['-c',evaluator],{input:JSON.stringify(fixtures),encoding:'utf8'});ok(res.status===0,res.stderr);checks+=fixtures.length;
for(const label of ['IR/IC','NE / SPE','Slutsky / Hicks'])ok(!m.isMath(label),'alternative labels are not fractions');for(const expression of ['x₁/x₂','MRS=MU₁/MU₂','P(q)/MC(q)'])ok(m.isMath(expression),'arithmetic remains mathematical');
ok(m.splitMath('EU(L)=v/n_L, EU(H)=1/(1200−n_L)').length===2,'separate complete equations at top-level comma');
ok(m.splitMath('a=b=c').length===1,'do not orphan a later equals sign');
const derivative=katex.renderToString(m.toTex('x₁=(12−w)/(3−p₁)，∂x₁/∂p₁>0，∂x₁/∂w<0'),{output:'mathml',throwOnError:true,strict:'ignore'});ok((derivative.match(/<mfrac/g)||[]).length===3);ok(m.toTex('MR_i(y_i*)=MC(Σ_j y_j*)').includes('y_{i}^{*}'));ok(m.toTex('MR_i(y_i*)=MC(Σ_j y_j*)').includes('\\sum'));ok(m.toTex('C(y)/y').startsWith('\\frac{C\\left('));ok(m.toTex('1/MC(q)').includes('\\frac{1}{\\mathrm{MC}\\left('));ok(m.toTex('1/ln(a)').includes('\\frac{1}{\\ln \\left('));
for(const [raw,start] of [['dx₂/dx₁','\\frac{\\mathrm{d} x_{2}}{\\mathrm{d} x_{1}}'],['dC(y)/dy','\\frac{\\mathrm{d} C\\left(y\\right)}{\\mathrm{d} y}'],['∂²u/∂x₁²','\\frac{\\partial ^{2}u}{\\partial x_{1}^{2}}']]){ok(m.toTex(raw)===start,raw+' keeps both differential atoms');ok(katex.renderToString(start,{throwOnError:true}).includes('katex-html'),raw+' visual layout');}
ok(m.splitClauses(String.raw`u=\begin{cases}x&x>0\\
0&x\le0\end{cases};v=2`).length===2,'multiline cases remain intact');
for(const file of fs.readdirSync('src').filter(f=>f.endsWith('ui.js')))for(const match of fs.readFileSync('src/'+file,'utf8').matchAll(/String\.raw`([^`]+)`/g))if(!match[1].includes('<details'))ok(!match[1].replace(/\\text\{[^}]*\}/g,'').includes('/'),file+' explicit TeX uses stacked fractions');
const htmls=fs.readdirSync('dist/downloads').filter(p=>p.endsWith('.html')),seen=new Set();let uniqueScripts=0;const katexSource=fs.readFileSync('src/vendor/katex/katex.min.js','utf8').replace(/<\/script/gi,'<\\/script');for(const name of htmls){const html=fs.readFileSync('dist/downloads/'+name,'utf8');const compressed=html.match(/<script type=\"text\/plain\" id=\"katex-gzip\">([A-Za-z0-9+/=]+)<\/script>/);ok(compressed,name+' compressed KaTeX present');ok(zlib.gunzipSync(Buffer.from(compressed[1],'base64')).toString('utf8')===katexSource,name+' compressed KaTeX round trips');ok(html.includes('id=\"fflate-license\"'),name+' fflate license present');ok(!/<script\b[^>]*\bsrc=/.test(html),name+' self-contained');const packedMath=html.match(/<script type="text\/plain" id="math-format-gzip">([A-Za-z0-9+\/=]+)<\/script>/);ok(packedMath,name+' compressed math renderer present');const mathSource=zlib.gunzipSync(Buffer.from(packedMath[1],'base64')).toString('utf8');ok(mathSource.includes('structured TeX')&&mathSource.includes('katex'),name+' includes math');for(const [,attrs,script] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)){if(/text\/plain|application\/json/.test(attrs))continue;const key=crypto.createHash('sha256').update(script).digest('hex');if(seen.has(key))continue;seen.add(key);uniqueScripts++;if(/type="module"/.test(attrs)){const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:script,encoding:'utf8'});ok(r.status===0,name+': '+r.stderr)}else{new vm.Script(script,{filename:name});checks++;}}}
for(const name of htmls){const html=fs.readFileSync('dist/downloads/'+name,'utf8'),native=html.includes('window.MICRO_NATIVE_MATHML=true');if(native){ok(!html.includes('data:font/woff2;base64,'),name+' native MathML omits repeated font payloads');ok((html.match(/@font-face\{font-display:block;font-family:[^}]+\}/g)||[]).length===0,name+' native MathML has no embedded font faces')}else{ok(html.includes('data:font/woff2;base64,'),name+' embeds math fonts');ok((html.match(/@font-face\{font-display:block;font-family:[^}]+\}/g)||[]).length===10,name+' has 10 valid standalone @font-face rules')}ok(!/url\(fonts\//.test(html),name+' has no relative font dependency');}
for(const sample of ['∫_0^q P(t)dt−C(q)','√(x₁²+x₂²)/2','α[a]+(1−α)[c]∼[b]','∑_{z∈Z} p(z)v(z)≥v(CE)','∀x,y∈X: x≽y ⇔ u(x)≥u(y)','\\mathbb{R}_+^2,\\ \\mathcal{A},\\ \\mathbf{p}⋅\\mathbf{x}≤w']){const tex=m.toTex(sample),rendered=katex.renderToString(tex,{output:'htmlAndMathml',displayMode:true,throwOnError:true,strict:'ignore'});ok(rendered.includes('katex-html')&&rendered.includes('<math')&&!rendered.includes('katex-error'),sample+' renders visual and MathML');}
for(const raw of ['u₁(a,b)','x₁','maxₐ minᵦ u₁(a,b)','maxᵦ minₐ u₂(a,b)']){ok(m.isMath(raw));const html=katex.renderToString(m.toTex(raw),{output:'mathml',throwOnError:true,strict:'ignore'});ok(!html.includes('ᵦ'))}
ok(m.toTex('maxₐ minᵦ u₁(a,b)').replace(/\s+/g,'')==='\\max_{a}\\min_{b}u_{1}\\left(a,b\\right)');
const expectedStandalone=723+require('./src/sequential-downloads.cjs').length+new Set(Object.values(require('./src/lessons.cjs').lessons).flatMap(s=>(s.scenarios||[]).filter(c=>/^p(?:5\d+|10\d+|1[56]\d+|20\d+)[a-e]?$/.test(c.value)).map(c=>c.value))).size;
for(const k of ['d111','d112','e111','q111','q112','q113','p1','p2','p3a','p3b','p4','p5','p6'])ok(htmls.includes('ch11-indivisible-'+k+'.html'),'indivisible-good standalone '+k);
for(const k of ['d113','d114','q114','q115','q116','e112','p7a','p7b','p8','p9a','p9b','p10a','p10b'])ok(htmls.includes('ch11-uncertainty-'+k+'.html'),'uncertainty standalone '+k);
for(const k of ['d121','d122','d123','d124','d125','q121','fig122','p1a','p1b','p1c','p1d','p4','p5'])ok(htmls.includes('ch12-production-'+k+'.html'),'production-economy standalone '+k);
for(const k of ['d126','d127','d128','d129','q122','p2','p3c','p3w'])ok(htmls.includes('ch12-labor-'+k+'.html'),'labor-economy standalone '+k);
for(const k of ['d131','d132','l131','l132','q131','d133','q132','p1a','p1b','p1c','p1d','p2','p3a','p3b','p4a','p4b','p4c'])ok(htmls.includes('ch13-service-'+k+'.html'),'service-economy standalone '+k);
for(const k of ['intro132','d134','fig131','d135','q133','carNone','carPareto','carOnlyLow'])ok(htmls.includes('ch13-car-'+k+'.html'),'car-market standalone '+k);
for(const k of ['d136','d137','q134','fishPareto','fishTax','p5a','p5b'])ok(htmls.includes('ch13-fish-'+k+'.html'),'fish-market standalone '+k);
for(const k of ['simple','simpleEntry'])ok(htmls.includes('ch14-contract-'+k+'.html'),'contract-market standalone '+k);
for(const k of ['baseline142','d141','d142','fig141','d143','d144','pool','q141','proof1','proof2','proof3','proof4','proof5','threshold','boundaryShare','p1','p2empty','p2single','p2pair'])ok(htmls.includes('ch14-education-'+k+'.html'),'education-market standalone '+k);
for(const k of ['d151','ordinal151','d152','d153','tie151'])ok(htmls.includes('ch15-foundations-'+k+'.html'),'strategic-foundations standalone '+k);
for(const k of ['traveler','behavior','table','pd','sympathy','symmetry','bach','favorite','fingers','pennies','gates'])ok(htmls.includes('ch15-basics-'+k+'.html'),'strategic-basics standalone '+k);
for(const k of ['auctionRules','first','firstGap','second','secondDominant','location','maxmin','location3','effort','cournot','cournotN','cournotZero','bertrand','bertrandProof'])ok(htmls.includes('ch15-economics-'+k+'.html'),'strategic-economics standalone '+k);
for(const k of ['intro','prop151','fig153a','noAsym','ex1512','prop152','fig154a','proofPartition','ties'])ok(htmls.includes('ch15-existence-'+k+'.html'),'strategic-existence standalone '+k);
for(const k of ['intro','representation','maxmin','bach','location','proof','samePayoff','noExistence'])ok(htmls.includes('ch15-competition-'+k+'.html'),'strategic-competition standalone '+k);
for(const k of ['intro','definition','derive','line','compare','boundary'])ok(htmls.includes('ch15-kantian-'+k+'.html'),'strategic-kantian standalone '+k);
for(const k of ['intro','distribution','expected','support','pure','pennies','bach','attrition','noHoles','noEnd','geometric','tail'])ok(htmls.includes('ch15-mixed-'+k+'.html'),'strategic-mixed standalone '+k);
for(const k of ['norm','deviation','noPure','population','beliefs','mixed','pd','boundary'])ok(htmls.includes('ch15-interpret-'+k+'.html'),'strategic-interpretation standalone '+k);
for(const k of ['intro','slots','actual','count','belief','boundary'])ok(htmls.includes('ch16-strategy-'+k+'.html'),'extensive-strategy standalone '+k);
for(const k of ['intro','diameter','initialize','figure','tie','deviation','proof','equivalence','existence','boundary'])ok(htmls.includes('ch16-induction-'+k+'.html'),'extensive-induction standalone '+k);
for(const k of ['intro','ultimatum','ultimatumProof','finite','finiteBack','one','oneImmediate','stalemate','discountOne','discountProof','alternating','alternatingProof','patience','boundary'])ok(htmls.includes('ch16-bargaining-'+k+'.html'),'bargaining standalone '+k);
for(const k of ['intro','d171','valuation','transfer','d172','boundary'])ok(htmls.includes('ch17-project-'+k+'.html'),'public-project standalone '+k);
for(const k of ['d173','d174','e171','e172'])ok(htmls.includes('ch17-truth-'+k+'.html'),'truthful-report standalone '+k);
for(const k of ['d181','d182','d183','e181','e182','e183'])ok(htmls.includes('ch18-foundations-'+k+'.html'),'matching-foundations standalone '+k);
for(const k of ['e184','e184y','p181'])ok(htmls.includes('ch18-algorithm-'+k+'.html'),'matching-algorithm standalone '+k);
for(const k of ['d184','e185','p182','p183','p184','q181','q182','q183','q184','q185','q186','q187'])ok(htmls.includes('ch18-stability-'+k+'.html'),'matching-stability standalone '+k);
for(const k of ['d191','d192','d193','e191','e192','e193','e194','e195','e196'])ok(htmls.includes('ch19-model-'+k+'.html'),'social-foundations standalone '+k);
for(const k of ['d194','d195','d196','d197','x197','d198','d199'])ok(htmls.includes('ch19-property-'+k+'.html'),'social-properties standalone '+k);
for(const k of ['p191','p192','q191a','q191b','q191c','q192a','q192b','q193a','q193b','q193c','q193d'])ok(htmls.includes('ch19-characterization-'+k+'.html'),'social-characterization standalone '+k);
for(const k of ['ordinal','eurovision','condorcet','p201d','p202','p204a','p204b'])ok(htmls.includes('ch20-social-'+k+'.html'),'social-preferences standalone '+k);
for(const k of ['society','paf','favorites','scoring','pairwise','external','dictator','p203a','p203b','p203c'])ok(htmls.includes('ch20-method-'+k+'.html'),'aggregation-methods standalone '+k);
for(const k of ['fig201','fig202','d203','d204','d205','caveat','d206','d207','p201a','p201b','p201c','p203e','p205a','p205b','p205c','p205d'])ok(htmls.includes('ch20-property-'+k+'.html'),'aggregation-properties standalone '+k);
for(const k of ['d175','e173','p171','nonexec','rebate','fairness','q171a','q171b','q172a','q172b','q173'])ok(htmls.includes('ch17-vcg-'+k+'.html'),'vcg standalone '+k);
for(const k of ['boxconstruction','budgetclear','disequilibrium','contractcurve','corelens'])ok(htmls.includes('ch10-edgeworth-'+k+'.html'),'edgeworth standalone '+k);
for(const k of ['define106','property106','example104','blocking104','coalitions104','coreproof105'])ok(htmls.includes('ch10-core-'+k+'.html'),'core standalone '+k);
for(const k of ['model107','rule105','highprice105','lowprice105','regime105'])ok(htmls.includes('ch10-demand-'+k+'.html'),'demand standalone '+k);
for(const k of ['honest106','strategic106','general106','comparison106','destroy102'])ok(htmls.includes('ch10-manipulation-'+k+'.html'),'manipulation standalone '+k);
for(const name of ['ch7-welfare.html','ch7-cap.html','ch7-subsidy.html','ch7-marginal.html','ch7-output.html','ch7-multiple.html','ch7-menuproof.html','ch7-double-discrete.html','ch7-double-continuous.html','ch7-tax-overshift.html','ch7-tax-linear.html','ch7-fairness.html','ch7-nonlinear.html','ch7-bundling.html','ch7-two-part.html','ch7-discrete-menu.html'])ok(htmls.includes(name),name+' standalone exists');
for(const k of ['d81','d82','e81','d83'])ok(htmls.includes('ch8-intro-'+k+'.html'),'jungle intro standalone '+k);
for(const k of ['d84','e82','serial','q81','q82'])ok(htmls.includes('ch8-eq-'+k+'.html'),'jungle equilibrium standalone '+k);
for(const k of ['d85','q83'])ok(htmls.includes('ch8-pareto-'+k+'.html'),'jungle pareto standalone '+k);
for(const k of ['q84','l81','q85'])ok(htmls.includes('ch8-planner-'+k+'.html'),'jungle planner standalone '+k);
for(const name of ['ch13-fish-equilibrium.html','ch13-car-equilibrium.html','ch13-car-pareto.html','ch13-car-no-trade.html','ch13-fish-tax.html','ch13-fish-pareto.html'])ok(htmls.includes(name),name+' standalone exists');
ok(htmls.includes('ch13-health-p5a.html')&&htmls.includes('ch13-health-p5b.html'),'health standalone files exist');
ok(htmls.length===expectedStandalone);
fs.writeFileSync('qa/math-tests.json',JSON.stringify({passed:true,checks,semanticFixtures:fixtures.length,selfContainedFiles:htmls.length,uniqueInlineScripts:uniqueScripts,scope:'Independently evaluate actual MathML for grouped fractions, functions and marginal ratios; derivative atom grouping; all standalone script syntax and embedded WOFF2 fonts; no remote scripts'},null,2));
console.log({passed:true,checks,semanticFixtures:fixtures.length,selfContained:htmls.length,uniqueScripts});

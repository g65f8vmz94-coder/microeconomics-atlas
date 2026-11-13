// Regression for silent TeX corruption: KaTeX can render a mistyped \\frac as letters without throwing.
const assert=require('node:assert/strict');
const {catalog,loadChapters}=require('./src/guided/catalog.cjs');
const {inline,math}=require('./src/guided/format.cjs');
async function main(){
 const chapters=await loadChapters(catalog(require('./coverage.json')));
 const formal=['1-7','8-14','15-20'].map(g=>require('./src/review/formal-'+g+'.json'));
 let strings=0,expressions=0;
 function scan(v,where){
  if(typeof v==='string'){
   strings++;
   for(const match of v.matchAll(/(\\+)(?:dfrac|tfrac|frac)\b/g))
    assert(match[1].length%2===1,where+': escaped fraction command renders as text');
   assert(!/[_^]\\(?:dfrac|tfrac|frac)\b/.test(v),where+': fraction swallowed a subscript or exponent');
   for(const match of v.matchAll(/\$([^$]+)\$/g)){math(match[1]);expressions++;}
  }else if(Array.isArray(v))v.forEach((x,i)=>scan(x,where+'['+i+']'));
  else if(v&&typeof v==='object')for(const [k,x]of Object.entries(v))scan(x,where+'.'+k);
 }
 [...chapters,...formal].forEach((v,i)=>scan(v,'source'+i));
 // Verify rendered structure, not merely absence of a KaTeX exception.
 const ch7=chapters[6]['p7.1'];
 const quarter=ch7.proof.map(row=>row[2]).find(s=>s.includes('q=\\frac{1}{4}'));
 assert(quarter,'quarter-quantity explanation exists');
 assert.match(inline(quarter),/<mfrac><mn>1<\/mn><mn>4<\/mn><\/mfrac>/);
 const threshold=chapters[11]['p12.3'].proof.map(row=>row[2]).find(s=>s.includes('a=\\frac{k}{3}'));
 assert.match(inline(threshold),/<mfrac><mi>k<\/mi><mn>3<\/mn><\/mfrac>/);
 const redistribution=formal[2].sections['19.2'].derivation.find(s=>s.includes('F_2('));
 assert.match(inline(redistribution),/<mfrac><msub><mi>λ<\/mi><mn>1<\/mn><\/msub><mn>2<\/mn><\/mfrac>/);
 // No finite-step interpretation of a derivative is used to validate this budget path.
 const rainPrice=.4,sunPrice=.6;
 for(const [rain,sun] of [[8,2],[6.2,3.2],[4.4,4.4]])assert(Math.abs(rainPrice*rain+sunPrice*sun-4.4)<1e-12);
 console.log(JSON.stringify({strings,inlineMathExpressions:expressions,fractionStructureChecks:3,stateBudgetChecks:3}));
}
main().catch(e=>{console.error(e);process.exitCode=1});

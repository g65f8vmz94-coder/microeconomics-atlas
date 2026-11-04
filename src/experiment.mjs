// Source section1.3, printed8-9. Six extra packages and sample answers are constructed.
export const experimentModes=['vacation','questionnaire','consistency','survey'];
export const vacationPackages=[
 {id:1,city:'巴黎',hotel:'4星',food:17,price:574,order:['hotel','food','price'],source:'原书套餐1',physical:'paris-4-17-574'},
 {id:2,city:'巴黎',hotel:'4星',food:17,price:574,order:['price','food','hotel'],source:'原书套餐2',physical:'paris-4-17-574'},
 {id:3,city:'巴黎',hotel:'3—4星',food:20,price:560,order:['food','hotel','price'],source:'原书套餐3',physical:'paris-3to4-20-560'},
 {id:4,city:'罗马',hotel:'3星',food:18,price:430,order:['hotel','food','price'],source:'自主扩展'},
 {id:5,city:'罗马',hotel:'4星',food:20,price:620,order:['price','hotel','food'],source:'自主扩展'},
 {id:6,city:'京都',hotel:'4星',food:19,price:600,order:['food','price','hotel'],source:'自主扩展'},
 {id:7,city:'巴黎',hotel:'3星',food:15,price:430,order:['price','food','hotel'],source:'自主扩展'},
 {id:8,city:'京都',hotel:'3星',food:20,price:500,order:['hotel','price','food'],source:'自主扩展'},
 {id:9,city:'罗马',hotel:'5星',food:21,price:780,order:['food','hotel','price'],source:'自主扩展'}
];
export const surveyHistory=Object.freeze({asOf:'2018年4月',responsesApprox:1300,noViolationPercent:15,median:6,mean:9.5,observedMaximum:66,alternatives:9,pairs:36,triples:84,quotedTripleViolationShare:.25});
export function unorderedPairs(n){return Array.from({length:n},(_,i)=>Array.from({length:n-i-1},(_,j)=>[i,i+j+1])).flat()}
export function unorderedTriples(n){const r=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)r.push([i,j,k]);return r}
export function answerMatrix(answers,n){
 if(!Number.isInteger(n)||n<3||n>9)throw Error('This lab uses3 through9 alternatives');
 const pairs=unorderedPairs(n);if(answers.length!==pairs.length||!/^[LERu]*$/.test(answers))throw Error('One L/E/R/u per unordered pair');
 const matrix=Array(n*n).fill(null);for(let i=0;i<n;i++)matrix[i*n+i]=true;
 pairs.forEach(([a,b],k)=>{const c=answers[k];if(c==='u')return;matrix[a*n+b]=c==='L'||c==='E';matrix[b*n+a]=c==='R'||c==='E'});return matrix;
}
export function questionnaireDiagnosis(answers,n){
 const matrix=answerMatrix(answers,n),triples=unorderedTriples(n),R=(a,b)=>matrix[a*n+b],records=triples.map(ids=>{
  const known=ids.every(a=>ids.every(b=>R(a,b)!==null));let witnesses=[];
  if(known)for(const a of ids)for(const b of ids)for(const c of ids)if(new Set([a,b,c]).size===3&&R(a,b)&&R(b,c)&&!R(a,c))witnesses.push([a,b,c]);
  return{ids,key:ids.join('-'),status:!known?'pending':witnesses.length?'violation':'consistent',witnesses};
 });const answered=[...answers].filter(c=>c!=='u').length,violations=records.filter(t=>t.status==='violation'),pending=records.filter(t=>t.status==='pending');
 return{matrix,records,answered,totalPairs:answers.length,totalTriples:records.length,violations,pending,complete:answered===answers.length,transitive:violations.length?false:answered===answers.length?true:null};
}
export function conflictAnswer(n){const pairs=unorderedPairs(n);return pairs.map(([a,b])=>a===0&&b===1?'E':a===1&&b===2?'R':'L').join('')}
export function simpleRuleAnswers(items,rule='price',favorite='巴黎'){
 if(!['price','cityfood'].includes(rule))throw Error('Unknown simple rule');const cities=[favorite,...['巴黎','罗马','京都'].filter(x=>x!==favorite)];
 return unorderedPairs(items.length).map(([a,b])=>{const x=items[a],y=items[b];let d=rule==='price'?y.price-x.price:cities.indexOf(y.city)-cities.indexOf(x.city);if(rule==='cityfood'&&d===0)d=x.food-y.food;return d>0?'L':d<0?'R':'E'}).join('');
}
export function substitutionCheck(answers){
 const d=questionnaireDiagnosis(answers,3);if(!d.complete)return{status:'pending'};
 if(answers[0]!=='E')return{status:'physical-identification',transitive:d.transitive};
 return{status:answers[1]===answers[2]?'same-comparison':'substitution-violation',transitive:d.transitive};
}
// A constructive argument, not a search-based proof. This is used only after a
// complete ternary questionnaire; unknown answers are never treated as false.
export function guaranteedConsistentTriple(answers,n=9){
 if(n<7)throw Error('Guarantee here requires at least7 alternatives');const d=questionnaireDiagnosis(answers,n);if(!d.complete)return null;
 const R=(a,b)=>d.matrix[a*n+b],strict=(a,b)=>R(a,b)&&!R(b,a);
 for(let v=0;v<n;v++){
  const wins=[],losses=[];for(let j=0;j<n;j++)if(j!==v){if(strict(v,j))wins.push(j);if(strict(j,v))losses.push(j)}
  if(wins.length>=2)return{ids:[v,...wins.slice(0,2)].sort((a,b)=>a-b),reason:'top',anchor:v};
  if(losses.length>=2)return{ids:[v,...losses.slice(0,2)].sort((a,b)=>a-b),reason:'bottom',anchor:v};
 }
 const v=0,tied=Array.from({length:n},(_,i)=>i).filter(i=>i!==v&&R(v,i)&&R(i,v)),a=tied[0],b=tied.slice(1).find(j=>R(a,j)&&R(j,a));
 if(b===undefined)throw Error('Constructive witness invariant failed');return{ids:[v,a,b].sort((a,b)=>a-b),reason:'all-tie',anchor:v};
}

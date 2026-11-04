import {marketExerciseStory} from './market-exercises.mjs';
import {marketExerciseContent} from './market-exercises-content.mjs';

export function marketExerciseView(key,step,helpers,width){
 const {C,colors,esc,hn,an,txt,metric}=helpers,f=marketExerciseStory(key,step),copy=marketExerciseContent[key],small=width<500,n=f.e.length,W=small?300:760,H=small?(n===2?355:600):350,cw=small?136:n===2?220:174;
 const pos=i=>({x:small?75+(i%2)*150:n===2?240+i*280:100+i*185,y:small?70+Math.floor(i/2)*235:70});
 const svgParts=[`<rect width="${W}" height="${H}" fill="${C.paper}"/>`,txt(W/2,25,f.kind,small?12:15,C.muted),txt(W/2,48,'上方保留对照，房屋方块表示本步结果',small?12:13,C.muted)];
 for(let i=0;i<n;i++){
  const {x,y}=pos(i),dim=f.dim.includes(i),focus=f.focus.includes(i),ink=dim?C.muted:C.ink;
  svgParts.push(`<rect data-motion="ex-${key}-person-${i}" x="${x-cw/2}" y="${y}" width="${cw}" height="215" rx="15" fill="${dim?'#f1f2ed':focus?'#e0efe6':C.pale}" stroke="${focus?C.green:C.rule}" stroke-width="${focus?2:1}"/>`,`<circle cx="${x}" cy="${y+23}" r="16" fill="${colors[i]}"/>`,txt(x,y+29,String(i+1),16,C.paper),txt(x,y+57,`${f.referenceLabel} ${hn(f.e[i])}`,13,ink));
  const before=key==='p2c'?`首选 ${i===3?'原题未给定':hn(f.prefs[i][0])}`:`${f.beforeLabel} ${hn(f.before[i])}`;
  svgParts.push(txt(x,y+84,before,14,ink),txt(x,y+107,f.departed?.person===i?'带走原房':key==='p2c'?'4号的结果单独核对':'本步住房',12,C.muted));
  if(f.current[i]<0&&f.departed?.person!==i)svgParts.push(txt(x,y+150,key==='p2c'?'本题不必确定':'圈外仅作参考',12,C.muted));
  let status=f.grades[i]===null?'':f.grades[i]>0?'更喜欢':f.grades[i]<0?'更不喜欢':f.ranks?'一样满意':'住房未变';
  if(key==='p2c')status=f.firstPointers[i]===undefined?'首选待分情况':`指向${f.firstPointers[i]+1}号`;
  if(key==='p2b'&&f.step===2&&i===1)status='买不起A，试换失败';
  if(f.departed?.person===i)status='退出，不比较福祉';
  if(key==='p4a'&&i===0)status=f.step?'A由第3升至第2':'A原来排第3';
  if(key==='p5'&&f.dim.includes(i))status='已先处理的单人圈';
  svgParts.push(txt(x,y+199,status,12,f.grades[i]>0?C.green:f.grades[i]<0?'#a24935':C.muted));
 }
 // Houses retain their own keys and colors as they move between fixed people.
 const shown=f.current.flatMap((h,i)=>h<0?[]:[{h,i,departed:false}]);if(f.departed)shown.push({h:f.departed.house,i:f.departed.person,departed:true});
 for(const {h,i,departed} of shown){const {x,y}=pos(i);svgParts.push(`<rect data-motion="ex-${key}-house-box-${h}" x="${x-24}" y="${y+120}" width="48" height="43" rx="10" fill="${departed?'#c3c8bd':colors[h]}"/>`,`<text data-motion="ex-${key}-house-text-${h}" x="${x}" y="${y+150}" font-family="system-ui,sans-serif" font-size="24" font-weight="700" fill="${C.paper}" text-anchor="middle">${hn(h)}</text>`);}
 let foot=f.cycle.length?`本步的圈：${[...f.cycle,f.cycle[0]].map(i=>i+1).join(' → ')}`:'同一位置始终是同一个人';let foot2='';
 if(key==='p2c'&&f.step===0)foot='固定箭头：1→4，2→4，3→1';
 if(key==='p2c'&&f.step===5)foot2='A、B、C、D四种首选均已核对';
 if(key==='p4b'){foot='证明用剩余房：旧 '+f.menus.old.houses.map(hn).join('、');foot2='证明用剩余房：新 '+f.menus.new.houses.map(hn).join('、');}
 if(key==='p5'){foot='先处理3与4，再给1号留下 A、B';foot2=f.step>=3?'报告改了，真实喜好仍是 C、B、A、D':'';}
 if(key==='p6'){foot='联盟有权带走：原房 A、C';foot2=f.step>=2?'不是带走当前所住的 D、C':'';}
 if(key==='p3'&&f.step>=2){foot='留下1、2、4与房A、B、D';foot2='灰色C随3号退出，不参与新市场';}
 svgParts.push(txt(W/2,H-35,foot,small?12:14,C.muted),txt(W/2,H-14,foot2,small?11:13,C.muted));
 const svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(copy.title+'：'+copy.steps[f.step][0])}">${svgParts.join('')}</svg>`;
 let metrics;
 if(key==='p1')metrics=[metric('本步严格改善人数',f.grades.filter(x=>x>0).length),metric('不参与换房','4号保留D'),metric('拿来互换的房','当前配置a中的房')];
 else if(key==='p2a')metrics=[metric('1号原房','A'),metric('原房买得起','是'),metric('1号得到','A')];
 else if(key==='p2b')metrics=[metric('价格互不相同','是'),metric('本步是否均衡',f.isEquilibrium?'是':'否：试换失败'),metric('真正的均衡配置','等于原产权')];
 else if(key==='p2c')metrics=[metric('4号本步首选',f.favorite===null?'待分情况':hn(f.favorite)),metric('4号获得',f.current[3]<0?'待核对':hn(f.current[3])),metric('是否已覆盖四种',f.step===5?'是':'正在逐种比较')];
 else if(key==='p3')metrics=[metric('在场人数',f.people.length),metric('1号',f.step<2?'旧均衡A':'变好：A→B'),metric('4号',f.step<2?'旧均衡C':'变差：C→A')];
 else if(key==='p4a')metrics=[metric('1号所得房','A'),metric('旧价格仍支持均衡',f.isEquilibrium?'是':'否'),metric('整套配置','保持不变')];
 else if(key==='p4b')metrics=[metric('1号旧住房','A'),metric('1号本步住房',hn(f.current[0])),metric('评价依据','1号未变的偏好')];
 else if(key==='p5')metrics=[metric('真实全市场首选','C'),metric('诚实所得','B'),metric('本步所得',hn(f.current[0])),metric('报告能得到的房','A 或 B')];
 else if(key==='p6')metrics=[metric('联盟','1号与3号'),metric('原房总价',f.ownedValue),metric('重排后同批房总价',f.proposalValue),metric('全员严格改善','否')];
 else metrics=[metric('本步在当前价格下均衡',f.isEquilibrium?'是':'否，仅作福利比较'),metric('第一均衡帕累托稳定','否'),metric('均衡配置唯一','否')];
 let tableHtml;
 if(key==='p7')tableHtml='<p>完整偏好：1号觉得A、B一样好；2号严格更喜欢A。</p>';
 else tableHtml='<div class="table-wrap"><table><thead><tr><th>住户</th><th>'+esc(f.referenceLabel)+'</th><th>'+(key==='p2c'?'原题首选':'偏好顺序（左优）')+'</th></tr></thead><tbody>'+f.e.map((h,i)=>'<tr><th>'+String(i+1)+'</th><td>'+hn(h)+'</td><td>'+(key==='p2c'?(i===3?'未指定':hn(f.prefs[i][0])):f.prefs[i].map(hn).join('、'))+'</td></tr>').join('')+'</tbody></table></div>';
 if(f.afterPrefs){const who=key==='p4b'?1:0;tableHtml+='<p><strong>'+(key==='p5'?'试用的申报顺序':'改变后的偏好顺序')+'：</strong>'+String(who+1)+'号 '+f.afterPrefs[who].map(hn).join('、')+'。'+(key==='p5'?'真实偏好仍以上表为准。':'只移动题目指定的一间房，其他相对顺序保持。')+'</p>';}
 const page=['p5','p6','p7'].includes(key)?135:134;
 const extra='<h3>把题目写完整</h3><p>'+esc(copy.question)+'</p><p>'+esc(copy.conditions)+'</p>'+tableHtml+'<h3>完整解题思路</h3><ol>'+copy.proof.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><h3>同类题照着这条线写</h3><p>'+esc(copy.template)+'</p><h3>最容易写错的地方</h3><p>'+esc(copy.trap)+'</p><p>来源：Osborne–Rubinstein 第9章习题'+key.slice(1)+'，印刷'+page+'页／PDF'+(page+19)+'页。题目与条件以原书为准，中文讲解和解答由本站推导；'+(key==='p2c'?'产权及首选表来自原题，证明不依赖其他排名。':'具体偏好、价格和分房示例为本站构造或已注明的教材例子扩展。')+'有限模型核对不代替一般证明。</p>';
 const formula=copy.formula;
 const sourceSummary='Osborne–Rubinstein 第9章习题'+key.slice(1)+'，印刷'+page+'页／PDF'+(page+19)+'页。题面条件来自教材；中文解答由本站推导，构造数值另有标注。';
 const data={...f,title:copy.steps[f.step][0],narration:copy.steps[f.step][1]};
 return {svg,metrics,guide:[copy.question,copy.conditions,copy.template],sourceSummary,reading:data.narration,formula,extra,boundary:copy.trap+' '+(key==='p7'?'本题明确允许无差异。':'本章有限、严格、无外部性的住房市场。'),data,info:copy.conditions,question:copy.question,legend:'圆圈编号是人，字母方块是房；上方对照保持不动，下方同一个房屋方块随步骤换位置。状态标题区分均衡、试换和局部方案。'};
}

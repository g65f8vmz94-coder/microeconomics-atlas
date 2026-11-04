// Chapter 2 original problems. Numeric witnesses are autonomous illustrations.
// A fixed lowest-index tie rule is explicit wherever the printed rule is incomplete.
export const cxIds=['p1a','p1b','p1c','p1d','p1e','p2','p3qualified','p3none','p4qualified','p4none','p5a','p5b','p6','p7','p8'];
export function cxResolve(id,variant='a'){
 if(cxIds.includes(id))return id;
 return ({p1:'p1'+('abcde'.includes(variant)&&variant.length===1?variant:'a'),p3:'p3qualified',p4:'p4qualified',p5:'p5a'})[id]||null;
}
export const cxNames={p1a:'2.1a · 面试遇降就停',p1b:'2.1b · 篮球胜场',p1c:'2.1c · 按标准筛画',p1d:'2.1d · 先看u门槛',p1e:'2.1e · 先挑多数颜色',p2:'2.2 · 两份名单的交集',p3qualified:'2.3 · 有人达标',p3none:'2.3 · 全部没达标',p4qualified:'2.4 · 有人达标',p4none:'2.4 · 没人达标选最高分',p5a:'2.5a · 分组不改冠军',p5b:'2.5b · 从分组规则推出α',p6:'2.6 · 帮朋友，但守住底线',p7:'2.7 · 无限集合怎样证明',p8:'2.8 · 算错账就必然破产吗'};
export const cxList=(mask,n)=>Array.from({length:n},(_,i)=>i).filter(i=>mask&(1<<i));
export function cxArgmax(xs,values){if(!xs.length)throw Error('非空菜单 required');return xs.reduce((a,b)=>values[b]>values[a]||values[b]===values[a]&&b<a?b:a);}
export function cxPick(kind,mask,data){
 const n=data.u?.length||data.values?.length||data.bits?.length||data.wins?.length||data.rank?.length,xs=cxList(mask,n);
 if(!Number.isInteger(mask)||mask<1||mask>=(1<<n))throw Error('invalid nonempty menu');
 if(kind==='local'){for(let i=0;i<xs.length-1;i++)if(data.values[xs[i]]>data.values[xs[i+1]])return xs[i];return xs.at(-1);}
 if(kind==='wins'){const counts=data.wins.map(row=>xs.reduce((s,j)=>s+row[j],0));return cxArgmax(xs,counts);}
 if(kind==='lex'||kind==='literal'){let rest=xs;for(let k=0;k<data.bits[0].length&&rest.length>1;k++){const good=rest.filter(i=>data.bits[i][k]===1);rest=kind==='literal'||good.length?good:rest;}return rest.length===1?rest[0]:null;}
 if(kind==='threshold'||kind==='caring'){const a=cxArgmax(xs,data.u);return (kind==='threshold'?data.u[a]:data.v[a])>=data.threshold?a:cxArgmax(xs,data.v);}
 if(kind==='color'){const red=xs.filter(i=>data.colors[i]==='红'),blue=xs.filter(i=>data.colors[i]==='蓝');return data.rank.find(i=>(red.length>=blue.length?red:blue).includes(i));}
 if(kind==='satisfice'||kind==='bestFallback'){const ordered=data.order.filter(i=>xs.includes(i)),good=ordered.find(i=>data.values[i]>=data.threshold);return good??(kind==='bestFallback'?cxArgmax(xs,data.values):ordered.at(-1));}
 if(kind==='rank')return data.rank.find(i=>xs.includes(i));
 throw Error('unknown choice rule');
}
export function cxThresholdRank(data){const xs=data.u.map((_,i)=>i);return xs.sort((a,b)=>{const A=data.u[a]>=data.threshold,B=data.u[b]>=data.threshold;return A!==B?(A?-1:1):(A?data.u[b]-data.u[a]:data.v[b]-data.v[a])||a-b;});}
export function cxSatisficingRank(data,best=false){const good=data.order.filter(i=>data.values[i]>=data.threshold),bad=data.order.filter(i=>data.values[i]<data.threshold);return good.concat(best?bad.sort((a,b)=>data.values[b]-data.values[a]||a-b):bad.reverse());}
export const cxData={
 local:{values:[2,1,3,0]},wins:{wins:[[0,1,0],[0,0,1],[1,0,0]]},
 lex:{bits:[[1,0],[0,1],[1,1]]},empty:{bits:[[0,0],[0,1]]},
 threshold:{u:[12,11,4,3],v:[1,10,9,8],threshold:10},
 color:{rank:[2,0,1],colors:['红','蓝','蓝']},
 qualified:{values:[-1,-2,1,3],threshold:0,order:[0,1,2,3]},
 none:{values:[-1,-2,-3,-4],threshold:0,order:[0,1,2,3]},
 bestNone:{values:[-2,-4,-1,-3],threshold:0,order:[0,1,2,3]},
 path:{rank:[2,0,3,1]},caring:{u:[3,2,1],v:[0,2,3],threshold:1}
};
// Declarative scene values are computed by rules above, not pasted winner claims.
export function cxScene(id,phase){
 let kind='rank',data=cxData.path,mask=15,focus=null,scan=null,title='',rows=[],note='自主构造；备选项身份不随菜单变化',labels=['a','b','c','d'];
 const p=phase;
 if(id==='p1a'){kind='local';data=cxData.local;mask=p>=3?13:15;scan=[0,1,0,2,3,2][Math.min(p,5)];focus=p===0||p===1?null:cxPick(kind,mask,data);title=p>=3?'只拿掉没选中的 b':'按字母顺序，遇到下降就停';rows=[['候选','a','b','c','d'],['质量',...data.values]];}
 else if(id==='p1b'){kind='wins';data=cxData.wins;mask=p>=3?5:7;labels=['a','b','c'];focus=p<2?null:cxPick(kind,mask,data);title=p>=3?'b 退出，a 与 c 仍在':'a赢b，b赢c，c赢a';rows=[['队伍','a','b','c'],['在场胜场',...data.wins.map(r=>cxList(mask,3).reduce((s,j)=>s+r[j],0))]];}
 else if(id==='p1c'){kind=p<2?'literal':'lex';data=p<2?cxData.empty:cxData.lex;labels=p<2?['a','b']:['a','b','c'];mask=p<2?3:p>=5?5:7;focus=p===0?null:cxPick(kind,mask,data);title=p===1?'逐字筛选：全删光了':p<2?'先检验程序是否总有结果':'补充规则：没人达标就跳过这一关';rows=[['图片',...labels],['标准1',...data.bits.map(b=>b[0])],['标准2',...data.bits.map(b=>b[1])]];if(p===1)mask=0;else if(p===3)mask=5;else if(p===4)mask=4;note=p<2?'原题措辞的反例；不是字典序选择结果':'明确补充规则后的模型；不是原文逐字算法';}
 else if(id==='p1d'){kind='threshold';data=cxData.threshold;mask=p>=3?12:15;focus=p===0?null:cxPick(kind,mask,data);title=p>=3?'所有人的 u 都小于10，改比 v':'先找 u 最高，再检查他的 u';rows=[['备选','a','b','c','d'],['u',...data.u],['v',...data.v]];}
 else if(id==='p1e'){kind='color';data=cxData.color;mask=p>=3?5:7;labels=['a','b','c'];focus=p<2?null:cxPick(kind,mask,data);title=p>=3?'删 b：两色打平，按题意选红':'蓝色人数多，先只看蓝色';rows=[['备选','a','b','c'],['颜色',...data.colors],['固定名次',2,3,1]];}
 else if(id==='p3qualified'||id==='p3none'||id==='p4qualified'||id==='p4none'){
  kind=id.startsWith('p4')?'bestFallback':'satisfice';data=id.endsWith('qualified')?cxData.qualified:id.startsWith('p4')?cxData.bestNone:cxData.none;
  mask=p>=4?(id.endsWith('qualified')?13:id.startsWith('p4')?5:12):15;scan=p<4?(id.endsWith('qualified')?Math.min(p,2):p):null;focus=p>=3||id.endsWith('qualified')&&p>=2?cxPick(kind,mask,data):null;title=p>=4?'原赢家留下，删掉其他人':'按固定面试顺序检查；门槛为0';rows=[['候选','a','b','c','d'],['分数',...data.values]];
 }
 else if(id==='p6'){kind='caring';data=cxData.caring;labels=['a','b','c'];mask=p>=3?6:7;focus=p===0?null:cxPick(kind,mask,data);scan=cxArgmax(cxList(mask,3),data.u);title=p>=3?'a 离开；这次朋友最喜欢 b':'先替朋友挑，再查自己的底线';rows=[['方案','a','b','c'],['朋友u',...data.u],['自己v',...data.v]];}
 else if(id==='p2'){labels=['a','x','y','b'];mask=p===0?7:p===1?14:6;focus=null;title=p<2?'A、B不必谁包含谁':'共同部分同时留下两个原赢家';rows=[['对象','菜单A','菜单B','交集'],['成员','a,x,y','x,y,b','x,y'],['给定选择','x','y','待推导']];note='x、y是暂用的符号；证明会推出它们其实相同';}
 else if(id==='p5a'){mask=p===0?15:p===1?5:p===2?10:p===3?12:15;focus=p===0?null:cxPick('rank',mask,data);title=p===1?'组A先选出 c':p===2?'组B再选出 d':p===3?'只让两位组内冠军对决':'固定偏好：c 排在最前';rows=[['固定顺序','c','a','d','b'],['分组','A','A','B','B']];}
 else if(id==='p5b'){mask=p===0?15:p===1?6:p===2?9:p===3?5:6;focus=p===0?null:cxPick('rank',mask,data);title=['大菜单 A，原赢家 c 留在 B','B 留下 b、c','剩余组 D=A去掉B','路径无关：比较两组赢家','原赢家在 B，只能是 B 的赢家'][Math.min(p,4)];rows=[['集合','A','B','D'],['成员','a,b,c,d','b,c','a,d']];}
 else if(id==='p7'){labels=['x','y','z'];mask=p===0?3:p===1?6:7;focus=p===0?0:p===1?1:null;title=['一对中选x，记作x至少与y一样好','另一对中选y，记作y至少与z一样好','假设反面：第三对却选z','三项菜单选谁，都会撞上α','所以不能形成这个圈','任意菜单的赢家，逐一和别人比'][Math.min(p,5)];rows=p>=2&&p<=3?[['假设三项赢家','必须在这对继续赢','反面假设却选'],['x','x,z','z'],['y','x,y','x'],['z','y,z','y']]:[['证明任务','工具'],['完备、自反','二选一与单项选择'],['传递','三项菜单＋α'],['所有菜单唯一最优','任意A缩到二项']];note='三个符号展示一般反证；不是枚举有限X来证明无限X';}
 else if(id==='p8'){labels=['1','2','3','4','5','虚记'];mask=p===0?3:31;focus=null;title=p===0?'先收到2件':p===1?'再收到3件：一共5件':p===2?'单价2元，误按6件付12元':'可以被利用，不等于一定破产';rows=[['核算','实际货物','误计账单'],['件数',p===0?2:5,p>=2?6:p===0?2:5],['按每件2元',p===0?4:10,p>=2?12:p===0?4:10]];note='自主交易例；单价固定为2，是否继续犯错需另加假设';}
 return {id,phase:p,kind,data,mask,focus,scan,title,rows,note,labels};
}

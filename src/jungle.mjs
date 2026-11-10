// Chapter 8 follows Osborne–Rubinstein, Models in Microeconomic Theory,
// printed pp. 105–120. Numerical utility representations below are our own.
export const houses=['A','B','C','D'];
export const sourcePrefs=[[1,2,3,0],[1,3,0,2],[0,1,2,3],[1,2,0,3]];
export const sourceAllocation=[3,0,2,1];
export const sourceEquilibrium=[1,3,0,2];
// Section 8.1: an assignment can be total while mapping two people to one house.
// The proposed takeovers here are only tests, not completed reallocations.
export function jungleIntro(k,step=0){
 const t=Math.max(0,Math.min(4,Math.floor(Number(step)||0)));
 const invalid=[1,1,2,0],assignment=k==='d82'&&(t===1||t===2)?invalid:sourceAllocation.slice();
 const counts=houses.map((_,h)=>assignment.filter(x=>x===h).length),feasible=assignment.length===houses.length&&assignment.every(h=>Number.isInteger(h)&&h>=0&&h<houses.length)&&counts.every(n=>n===1);
 const candidate=k==='d83'&&t===2?{actor:0,owner:3,house:1}:k==='d83'&&t===3?{actor:2,owner:1,house:0}:null;
 const canTake=candidate?candidate.actor<candidate.owner:null;
 const messages={
  d81:['先认识四个人和四栋房。每人只能住一栋，每栋至多住一人；每人只在意自己住哪栋。','每个人都把四栋房排成严格顺序，不能有两栋并列。1号最喜欢B，其次C、D，最后A。','2号也最喜欢B。大家喜好可以相同；偏好是每个人自己的排序，不是房屋的归属。','图中线条展示教材的一种可行配置：1住D、2住A、3住C、4住B。这只是一个例子。','社会这一层只有人、房和每个人的偏好；谁更强要到加入权力关系后才知道。'],
  d82:['先看教材中的安排：每人连向一栋不同的房，四栋都有人住，所以它是可行配置。','现在1号和2号都被指派B，3号连C、4号连A。每人仍恰好连一栋，所以这仍是指派。','但是B被两人同时指向，D无人使用；一栋房只能住一人，因此这个指派不是配置。','把指派改回教材例子：1→D、2→A、3→C、4→B，每栋恰好一人，重新成为配置。','做题先看每人是否恰有一栋，判断是不是指派；再看房是否重复、是否都有人，判断是不是配置。'],
  e81:['先看四列偏好表：每一列属于一个人，越靠上代表这个人越喜欢那栋房。','1号排序是B、C、D、A；1号住D，不是最喜欢的房。','2号的顺序是B、D、A、C；2号住A，3号住C，4号住B。','这四条指派没有重复房屋，是一个可行配置；住哪栋与各人的偏好排序是两回事。','目前只知道这是配置。它是否为丛林均衡，还需要权力顺序和均衡条件，不能直接下结论。'],
  d83:['保留教材中的四人、四房、偏好和配置；再加入权力顺序1强于2、2强于3、3强于4。','权力与喜好是两张不同的表：谁有权赶走谁由强弱决定，每个人想住哪栋由自己的偏好决定。','1号现在住D，更喜欢B；B住着较弱的4号。按模型规则，1号可以要求4号让出B。这里只检验可能性，不把赶走后缺房的状态称为配置。','3号现在住C，更喜欢A；A住着较强的2号。3号虽然想要A，却不能按这条规则赶走2号。','这是没有产权保护的极端模型：强弱确定、弱者无成本让房、个人单独行动。现实中产权、反抗成本和合作都可能改变结果。']
 };
 const titles={d81:['四个人与四栋房','每人有自己的排序','喜好可以重合','一张可能的配置','社会与权力分开'],d82:['先看可行配置','人人都有指派','指派不一定可行','恢复可行配置','记住两道检查'],e81:['从上往下读偏好','先读1号','再看其他人','检查房屋是否重复','谁有机会夺房？'],d83:['加上权力顺序','权力和偏好不同','强者想要弱者的房','弱者想要强者的房','模型的边界']};
 return {step:t,assignment,counts,feasible,candidate,canTake,title:titles[k][t],narration:messages[k][t]};
}
export const casesBySection={
 '8.1':['d81','d82','e81','d83'],
 '8.2':['d84','e82','serial','q81','q82'],
 '8.3':['d85','q83'],
 '8.4':['q84'],
 '8.5':['l81','q85'],
 '8.6':['d86','d87','d88','e83','e84','p1','p2','p3','p4','p5','p6','p7','p8','p9','p10']
};
export const cases={
 d81:{label:'定义8.1 社会',page:105,kind:'standard',note:'社会给出人数、同样多的房屋，以及每个人对自己房屋的严格排序。'},
 d82:{label:'定义8.2 指派与配置',page:106,kind:'standard',note:'指派可以让两人指向同一栋房；配置必须是一一对应，每栋房恰有一位住户。'},
 e81:{label:'例8.1 原书偏好表',page:106,kind:'standard',note:'原书高亮配置是 1→D、2→A、3→C、4→B；表中1最喜欢B，2最喜欢B，3最喜欢A，4最喜欢B。'},
 d83:{label:'定义8.3 丛林与权力',page:107,kind:'standard',note:'权力关系是完备、传递、反对称的全序。箭头从强者指向弱者，弱者不能以同样规则夺强者的房。'},
 d84:{label:'定义8.4 丛林均衡',page:108,kind:'standard',note:'均衡要求任何强者都不严格偏爱某个弱者当前占的房屋。'},
 e82:{label:'例8.2 唯一均衡',page:108,kind:'standard',note:'原书的权力顺序 1≻2≻3≻4 给出 (B,D,A,C)。'},
 serial:{label:'逐位选房程序',page:108,kind:'standard',note:'最强者先从全部房屋选最喜欢的；后面的人从尚未被选的房屋继续选。'},
 q81:{label:'命题8.1 均衡存在',page:109,kind:'standard',note:'严格偏好、有限房屋与全序权力下，逐位选房总会结束，结果是均衡。'},
 q82:{label:'命题8.2 均衡唯一',page:110,kind:'standard',note:'若两个均衡不同，找权力顺序中第一个住不同房的人；较强者所住房相同，他必严格偏爱一个尚可夺的房，矛盾。'},
 d85:{label:'定义8.5 帕累托稳定',page:111,kind:'standard',note:'不存在另一个可行配置，使至少一人严格改善且所有人都不变差。'},
 q83:{label:'命题8.3 逐位选房有效',page:112,kind:'standard',note:'任意选房顺序都得到帕累托稳定配置；证明从第一位受到改变的人开始。'},
 q84:{label:'命题8.4 丛林均衡有效',page:113,kind:'standard',note:'普通丛林均衡等于权力顺序下的逐位选房结果，因此帕累托稳定。'},
 l81:{label:'引理8.1 稳定配置有首选者',page:113,kind:'standard',note:'若没人得到首选房，各人指向自己首选房的住户；有限图里出现交易环，环上人人变好。'},
 q85:{label:'命题8.5 稳定配置可由权力实现',page:114,kind:'standard',note:'在目标稳定配置里，先找拿到剩余房屋中首选房的人，依次排权力；原配置就成为该权力序的唯一均衡。'},
 d86:{label:'定义8.6 有外部性的社会',page:116,kind:'external',note:'偏好改为定义在整套配置上，不必严格；同住哪栋房，还会关心别人住在哪里。'},
 d87:{label:'定义8.7 有外部性的丛林',page:116,kind:'external',note:'给有外部性的社会再加一条完备、传递、反对称的权力关系。'},
 d88:{label:'定义8.8 交换式均衡',page:117,kind:'external',note:'强者只能强制与一个弱者交换房屋；他要比较交换前后整套配置。'},
 e83:{label:'例8.3 均衡不存在',page:117,kind:'external',note:'1想站在2的顺时针邻位，2想站在1的顺时针邻位；三座环形房屋无法同时满足。'},
 e84:{label:'例8.4 均衡可能无效',page:117,kind:'external',note:'三种环形轮转都满足各自的邻位要求，都是均衡；但人人都更喜欢原书图a，故图b、c无效。'},
 p1:{label:'习题8.1 无差异',page:118,kind:'ties',note:'放宽严格偏好后，逐位选房仍能构造均衡；均衡可能不唯一，也可能被帕累托改进。'},
 p2:{label:'习题8.2 交换权力位置',page:118,kind:'power',note:'换位之前的更强者拿同一栋房；上升者不会变差，下降者不会变好；中间和后面的人的变化没有统一方向。'},
 p3:{label:'习题8.3 偏好报告',page:118,kind:'report',note:'到自己选房时可选集合已被强者确定；如实报告在该集合中选真实最爱，谎报不可能得到严格更好的房。'},
 p4:{label:'习题8.4 房少于人',page:119,kind:'shortage',note:'加入“无家可归”并令每栋房优于它；强者依次选房，房用完后剩余人无房，仍有均衡。'},
 p5:{label:'习题8.5 动态抢房',page:119,kind:'dynamic',note:'每轮每人冲向自己能取得的最好房；同房竞争由最强者胜出。第t轮前t个最强者已固定，最迟第n轮收敛。'},
 p6:{label:'习题8.6 奶油守卫',page:119,kind:'cream',note:'“猫”权力最弱；所有人愿为他守最好的岗位牺牲一档声望，但不愿牺牲两档。均衡让猫在末位，却可全体改善。'},
 p7:{label:'习题8.7 两两不换仍无效',page:120,kind:'cycle',note:'三人都想换到下一个人的房；单次两人交换无法双方获益，三人循环可让所有人更好。'},
 p8:{label:'习题8.8 唯一稳定配置',page:120,kind:'unique',note:'严格偏好下，恰当且仅当所有人的首选房各不相同，稳定配置才唯一。'},
 p9:{label:'习题8.9 多数同意',page:120,kind:'majority',note:'三人对 A、B、C 有相同严格排序，六种配置都能被另一个得到两票支持的配置击败。'},
 p10:{label:'习题8.10 强邻居',page:120,kind:'neighbor',note:'每人只在意邻居的权力强弱。均衡里必然 1–2、3–4、… 成对相邻；具体哪对住哪一组公寓可不同。'}
};
export function permutations(a){if(!a.length)return [[]];return a.flatMap((v,i)=>permutations([...a.slice(0,i),...a.slice(i+1)]).map(rest=>[v,...rest]));}
export function serial(prefs,order){const available=new Set(prefs[0].map((_,i)=>i)),result=Array(prefs.length).fill(-1),steps=[result.slice()];for(const i of order){const h=prefs[i].find(x=>available.has(x));result[i]=h;available.delete(h);steps.push(result.slice())}return {allocation:result,steps};}
// Only full allocations admit an equilibrium test. A blocking pair needs
// both a stronger person and a house they strictly prefer.
export function jungleBlockers(prefs,order,a){
 if(a.length!==order.length||a.some(h=>!Number.isInteger(h)||h<0||h>=order.length)||new Set(a).size!==order.length)return null;
 const rank=Object.fromEntries(order.map((i,k)=>[i,k])),out=[];
 for(const i of order)for(const j of order)if(rank[i]<rank[j]&&prefs[i].indexOf(a[j])<prefs[i].indexOf(a[i]))out.push({actor:i,owner:j,house:a[j]});
 return out;
}
export function jungleEquilibrium(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),order=[0,1,2,3],result=serial(sourcePrefs,order),a=k==='d84'&&t<2?sourceAllocation.slice():['serial','q81'].includes(k)?result.steps[Math.min(t,4)]:sourceEquilibrium.slice(),counts=houses.map((_,h)=>a.filter(x=>x===h).length),blockers=jungleBlockers(sourcePrefs,order,a);
 const candidate=k==='d84'&&t===1?{actor:0,owner:3,house:1}:k==='d84'&&t===3?{actor:1,owner:0,house:1}:null,canTake=candidate?candidate.actor<candidate.owner:null;
 const alternate=[1,2,0,3],witness=jungleBlockers(sourcePrefs,order,alternate).find(x=>x.actor===1&&x.owner===3);
 const messages={
  d84:['先看教材上一节的配置：1住D、2住A、3住C、4住B。每人一栋，但这只是可行，不一定是均衡。','1号更喜欢4号住的B，1号又比4号强；两项同时成立，所以原配置不是均衡。','现在对照另一套完整配置：1住B、2住D、3住A、4住C。这不是声称一次夺房直接形成的结果。','2号想要B，但B由更强的1号住；有想法却不能按规则夺房，不构成破坏均衡的例子。','逐个检查所有强弱对：没有强者更喜欢弱者的房，因而这套配置是丛林均衡。','均衡是对一套完整配置的静态检查：不存在又想要、又能夺的房；并不保证每个人都住自己的首选。'],
  e82:['教材例8.2的配置是1住B、2住D、3住A、4住C；权力由1到4依次减弱。','1号住首选B，不会想夺任何人的房。','2号住D，最喜欢B但B属于更强的1号；比2号弱的人住A和C，2号都不如D喜欢。','3号住自己的首选A，也不会想夺弱者的房。','4号虽然更喜欢B，但没有比4号更弱的人可以被他赶走。','四个人都检查完了：没有符合“更喜欢并且更强”的一对，因此这是均衡。'],
  serial:['先把四栋房放在桌上，按1、2、3、4的权力顺序依次选。这个程序是构造方法，不是均衡的定义。','1号从A、B、C、D里选最喜欢的B；B从后面人的可选集合中移走。','2号最想要B，但B已经被1号选走；在A、C、D中，2号最喜欢D。','3号在剩下的A、C中选A，这是3号自己的首选。','4号拿到最后剩下的C。结果是1→B、2→D、3→A、4→C。','每个人当时都从尚未被更强者选走的房中选了最喜欢的一栋，所以不会更喜欢任何弱者后来得到的房。'],
  q81:['要证明均衡存在，先用权力从强到弱的顺序，构造一套完整配置。','最强者先从所有房屋中选首选；房屋数与人数相等，所以总有房可选。','接着的人只从未被更强者拿走的房中选自己最喜欢的一栋。','重复同样的步骤，每次拿走一栋；人数有限，这个构造必然结束。','每人得到一栋且没有重复，已经构造出一套可行配置。','任一人的房不差于当时剩下的房；弱者后来的房都在当时剩余集合里，因此没有有利夺房。这证明均衡存在。'],
  q82:['为了说明唯一性，比较两套完整配置：a是教材均衡，b是另一套候选；先不要假定b真的均衡。','沿权力顺序往下找第一个住得不同的人。1号在两套里都住B，第一个不同的是2号。','在a里2号住D、4号住C；在b里2号住C、4号住D。两套里1号之前占用的房相同。','2号更喜欢D而不是C；在b中D由较弱的4号住，所以2号能要求4号让房，b不是均衡。','一般证明假设两套不同配置都是均衡，找第一个不同的人；他的两栋不同房在另一套中分别由较弱者占有。','严格偏好让他必定更喜欢其中一栋，因此两套中的一套存在有利夺房，与两套都是均衡矛盾；均衡至多一个。']
 };
 const titles={d84:['这套可行分房能守住吗？','既想要又能够夺','对照另一套配置','想要却不能夺','逐一检查','均衡是静态判断'],e82:['原书例8.2','先看1号','再看2号','再看3号','最后看4号','每对强弱都过关'],serial:['从空房开始','1号先选B','2号选D','3号选A','4号选C','为什么停得住'],q81:['用程序构造','最强者先选','其余人依次选','有限步骤结束','得到可行配置','证明没有有利夺房'],q82:['两套完整配置','找到第一个不同者','对照两栋房','检查候选b','一般反证的起点','严格偏好带来矛盾']};
 return {step:t,assignment:a,counts,feasible:!!blockers,blockers,candidate,canTake,alternate,witness,comparison:k==='q82',title:titles[k][t],narration:messages[k][t]};
}
export function strictEq(prefs,order,a){const pos=Object.fromEntries(order.map((i,k)=>[i,k]));return order.every(i=>order.every(j=>pos[i]>=pos[j]||prefs[i].indexOf(a[i])<prefs[i].indexOf(a[j])));}
export function dominates(prefs,b,a){return prefs.every((p,i)=>p.indexOf(b[i])<=p.indexOf(a[i]))&&prefs.some((p,i)=>p.indexOf(b[i])<p.indexOf(a[i]));}
export function paretoAlternatives(prefs,a){return permutations(a.slice()).filter(b=>dominates(prefs,b,a));}
// Section 8.3 compares two complete allocations using each person's own
// ordinal preference, not a common numerical score or a power relationship.
export function junglePareto(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),order=[2,0,1,3];
 const a=k==='d85'?sourceAllocation.slice():serial(sourcePrefs,order).allocation;
 const b=k==='d85'?(t===0?a.slice():[2,3,0,1]):[2,3,0,1];
 const changes=a.map((h,i)=>{const diff=sourcePrefs[i].indexOf(h)-sourcePrefs[i].indexOf(b[i]);return diff>0?'better':diff<0?'worse':'same'});
 const improved=changes.filter(x=>x==='better').length,worse=changes.filter(x=>x==='worse').length,dominatesA=dominates(sourcePrefs,b,a),alternatives=paretoAlternatives(sourcePrefs,a),focus=k==='d85'&&t>=1&&t<=4?t-1:k==='q83'&&[2,4].includes(t)?0:k==='q83'&&t===3?3:null;
 const messages={d85:['先看教材原分房：1住D、2住A、3住C、4住B。比较同一套分房时没有人变好，所以不构成帕累托改进。','对照教材另一套分房：1号从D换到更喜欢的C。再看其他人，而不是只看一个人。','2号从A换到更喜欢的D，2号也变好。','3号从C换到更喜欢的A，3号也变好。','4号仍住B，既没变好也没变差。','三人变好、一人不变，没有人变差；因此b帕累托改进a，原配置a不是帕累托稳定。'],
 q83:['这次只规定选房顺序3、1、2、4，不把它解释为权力顺序。依次选房得到a：1住B、2住D、3住A、4住C。','假设另一套分房b能让至少一人变好、没有人变差。图里的b只是待检查的候选，不能预先当成改进。','按选房顺序检查：3号在a和b中都住A；接下来1号从B改住C，是第一个住得不同的人。','4号从C换到更喜欢的B，但1号从B换到不如B喜欢的C，所以这套b不是帕累托改进。','一般证明用反证法：假设某套b真能让人变好且没人变差，找到按选房顺序第一个严格变好的人。严格偏好意味着排在他前面的人住房都没变。','那人想换到的房在原配置中属于后面的人，因此他当初选房时这栋房还在；他却选了自己最喜欢的另一栋，矛盾。任意固定顺序逐位选房都得到帕累托稳定配置。']};
 const titles={d85:['先固定原分房','先看1号','再看2号','再看3号','最后看4号','两条条件一起查'],q83:['任意顺序逐位选房','比较另一套候选','找到第一个不同者','有人变好也有人变差','假设存在真正改进','回到选房当时']};
 return {step:t,a,b,order,changes,improved,worse,dominatesA,alternatives,focus,title:titles[k][t],narration:messages[k][t]};
}
export function reverseOrder(prefs,a){let left=a.map((_,i)=>i),available=new Set(a),order=[];while(left.length){let i=left.find(i=>prefs[i].find(h=>available.has(h))===a[i]);if(i===undefined)return null;order.push(i);left=left.filter(j=>j!==i);available.delete(a[i]);}return order;}
// Three authored stories for the equilibrium-efficiency bridge and its
// converse. All reported properties come from the existing finite model.
export function junglePlanner(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),fixedOrder=[0,1,2,3],target=[2,1,3,0],cycleBefore=[0,2,1,3],cycleAfter=[1,2,0,3];
 const a=k==='q84'?(t<4?sourceEquilibrium.slice():target.slice()):k==='l81'?(t<4?cycleBefore.slice():cycleAfter.slice()):target.slice();
 const recovered=reverseOrder(sourcePrefs,target),locked=k==='q85'?recovered.slice(0,Math.min(t,4)):[],available=houses.map((_,i)=>i).filter(h=>!locked.some(i=>target[i]===h));
 const pointers=sourcePrefs.map(p=>cycleBefore.indexOf(p[0])),cycleImproves=dominates(sourcePrefs,cycleAfter,cycleBefore),blockers=jungleBlockers(sourcePrefs,fixedOrder,a),better=paretoAlternatives(sourcePrefs,a);
 const messages={
  q84:['先把两把尺子分开：丛林均衡检查强者有没有想夺的房；帕累托稳定检查能否让一些人变好且没有人变差。','在权力1、2、3、4依次变弱时，教材配置(B,D,A,C)没有有利夺房，是丛林均衡。','按这个权力顺序逐位选房也得到同一配置。教材先证明这种均衡存在且唯一。','不论选房顺序是什么，逐位选房的结果都帕累托稳定。因此这里的丛林均衡也是帕累托稳定的。','另看一套配置(C,B,D,A)：它也是帕累托稳定，但在原来的权力顺序下不是均衡。要让这个配置成为丛林均衡，还得找到合适的权力顺序。','命题8.4的条件包括每人只关心自己的房屋、严格偏好和确定的权力全序。有外部性时，均衡可能不再帕累托稳定。'],
  l81:['先假设四个人都没有住自己的首选房：1住A、2住C、3住B、4住D。这组分房为辅助例子。','1号最喜欢B，B由3号住；画出1指向3的箭头。','3号最喜欢A，A由1号住；再画出3指向1的箭头。','箭头回到起点，形成1→3→1的环。这里是两人环；有限个人的一般情形也必然进入某个环。','让环上的1号和3号同时交换：1从A到B，3从B到A；2号和4号住处不变。','环上两人严格变好，其他人不变，构成帕累托改进。因此如果一套配置帕累托稳定，就不可能所有人都没住首选。'],
  q85:['设想规划者不能直接给房，只能安排权力顺序；目标配置是1住C、2住B、3住D、4住A。它是帕累托稳定的。','2号在目标里住自己的首选B。先把2排在最强位置，再从待处理的人和房中移走2与B。','在剩余A、C、D中，1号最喜欢C；目标也给1号C，所以把1排第二，再移走1与C。','剩余A和D时，4号更喜欢A，而目标给4号A；把4排第三，再移走4与A。','最后只剩3号和D，把3排第四。得到一种权力顺序2、1、4、3。','按这个权力顺序逐位选房，恰好得到目标配置；普通丛林均衡唯一。不同目标可能需要不同顺序，也可能有不止一种可行顺序。']
 };
 const titles={q84:['两种稳定要分清','先检查丛林均衡','均衡对应逐位选房','逐位选房没有帕累托改进','固定权力下反向未必成立','结论依赖模型条件'],l81:['假设没人住首选','1号指向3号','3号指回1号','首选箭头形成环','环上同时换房','从反例得到引理'],q85:['先确定目标配置','2号与B先排定','1号与C再排定','4号与A接着排定','最后是3号与D','检验结果与唯一性']};
 return {step:t,assignment:a,target,cycleBefore,cycleAfter,pointers,cycleImproves,blockers,better,recovered,locked,available,verification:k==='q85'&&t===5?serial(sourcePrefs,recovered).allocation.every((h,i)=>h===target[i])&&strictEq(sourcePrefs,recovered,target):null,title:titles[k][t],narration:messages[k][t]};
}
export function dynamicProcess(prefs,order){const rank=Object.fromEntries(order.map((i,k)=>[i,k]));let current=Array(order.length).fill(-1),states=[current.slice()];for(let t=0;t<order.length;t++){let choices=current.map((_,i)=>prefs[i].find(h=>{const occupant=current.indexOf(h);return occupant<0||occupant===i||rank[occupant]>rank[i]}));let next=Array(order.length).fill(-1);for(let h=0;h<order.length;h++){const bidders=order.filter(i=>choices[i]===h);if(bidders.length)next[bidders[0]]=h;}states.push(next);if(next.every((h,i)=>h===current[i]))break;current=next;}return states;}
export function swap(a,i,j){const b=a.slice();[b[i],b[j]]=[b[j],b[i]];return b;}
export function externalEq(a,order,utility){for(let x=0;x<order.length;x++)for(let y=x+1;y<order.length;y++){const i=order[x],j=order[y],b=swap(a,i,j);if(utility(b,i)>utility(a,i))return {ok:false,i,j,next:b};}return {ok:true};}
export function swapSeats(a,i,j){return swap(a,a.indexOf(i),a.indexOf(j));}
export function externalEqSeats(a,order,utility){for(let x=0;x<order.length;x++)for(let y=x+1;y<order.length;y++){const i=order[x],j=order[y],b=swapSeats(a,i,j);if(utility(b,i)>utility(a,i))return {ok:false,i,j,next:b};}return {ok:true};}
// Seats are ordered clockwise: top, lower-right, lower-left.
export function clockwiseNeighbor(a,i){const seat=a.indexOf(i),next=(seat+1)%a.length;return a[next];}
export function externalUtility3(a,i){if(i===2)return 0;const wanted=i===0?1:0;return clockwiseNeighbor(a,wanted)===i?1:0;}
const cycleA=[0,2,1],cycleB=[1,0,2],cycleC=[2,1,0];
export const externalRotations=[cycleA,cycleB,cycleC];
export function externalUtility4(a,i){const wanted=[1,2,0][i];if(clockwiseNeighbor(a,wanted)!==i)return 0;const r=externalRotations.findIndex(b=>b.every((x,k)=>x===a[k]));return 10+(r<0?0:3-r);}
export function externalPareto(utility,a){return permutations(a.slice()).filter(b=>b.some((_,i)=>utility(b,i)>utility(a,i))&&b.every((_,i)=>utility(b,i)>=utility(a,i)));}
// A seat array lists occupants clockwise, not the house assigned to each person.
// The textbook leaves some rankings unspecified; these two utility functions
// provide one explicit completion for illustration, not cardinal welfare.
export function jungleExternalStory(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))), start=[0,1,2], first=externalEqSeats(start,[0,1,2],externalUtility3), second=externalEqSeats(first.next,[0,1,2],externalUtility3);
 const compare=[0,2,1], rotations=externalRotations;
 let seats=k==='d86'?(t<2?start:compare):k==='e84'?rotations[[1,1,0,0,2,0][t]]:(k==='d88'||k==='e83')?(t<2?start:t<4?first.next:second.next):start;
 const utility=k==='e84'?externalUtility4:externalUtility3,eq=externalEqSeats(seats,[0,1,2],utility),better=externalPareto(utility,seats),all=permutations(start).map(a=>({seats:a,eq:externalEqSeats(a,[0,1,2],utility)}));
 const messages={
  d86:['三位邻居住在甲、乙、丙三间围成一圈的房里。1号在意自己是不是2号的顺时针邻居。','先看甲房：1号住在这里，但2号后面紧挨着的是3号，1号不满意。','现在比较另一套完整分房：1号仍住甲房，2号和3号调换；1号成了2号的顺时针邻居。','1号自己没有搬家，却因为别人换了位置而更满意：他评价的是整套分房。','偏好也可以有无差异：有人可能只在乎特定邻居，不在乎其他人的位置。','所以有外部性的社会，把每个人的偏好定义在所有完整配置上，而不是只定义在自己的房屋上。'],
  d87:['三间房、三位邻居；偏好可以取决于所有人的住房安排。','现在加上权力：1比2强，2比3强，因此1也比3强。','先按强弱判断1能否和2换房，再查1的偏好表，比较交换前后两套完整分房。','有外部性的丛林规定：强者可以强迫弱者互换住房；弱者不能反过来强迫强者。','换房是两个人互换，其他人的住房不变；不能只让强者搬进去并让弱者消失。','有限的人与同数的房、对完整配置的偏好，加上没有并列的权力顺序，组成这里的模型。'],
  d88:['先看甲乙丙的住户：权力依次是1、2、3；每人还会在意邻居。','1号比2号强。若两人交换，1号会成为2号的顺时针邻居，因此1号想换。','1号和2号交换住房，3号留在原房。完整分房发生变化，1号得到想要的邻位。','现在再检查：2号比3号强，和3号交换后，2号能成为1号的顺时针邻居。','2号与3号交换；1号没有搬家，但其邻居关系随之改变。','均衡要求不存在任何一对“强者能强制弱者互换，且强者严格更喜欢交换后的完整配置”。'],
  e83:['三位邻居围成一圈：1号想做2号的顺时针邻居，2号也想做1号的顺时针邻居。','起初1号不满足；他比2号强，可以强迫2号换房，让自己满足。','1号与2号换房后，1号满足；但2号现在不是1号的顺时针邻居。','2号比3号强，可以强迫3号换房，从而让自己满足。','2号与3号换房后，2号满足，1号又不满足；这套配置仍有有利交换。','三间房围成一圈时，1和2不可能同时互为顺时针邻居。若1不满足可强制较弱者交换；若2不满足也可如此，因此没有均衡。'],
  e84:['这次每个人想当特定一人的顺时针邻居；先看教材配置b，三人的邻位愿望都满足。','任何两人交换都会破坏发起者的首选邻位，所以没有强者愿意强制交换：b是均衡。','现在把整套配置拿来比较：从b切到a是三人整体轮转，不是一次两人强制交换。','教材另外规定：每个人都更喜欢a而不是b。因此a让三个人都变好，b不是帕累托稳定的。','教材配置c也满足每个人的邻位愿望，因此也是均衡；但每个人都更喜欢a而不是c。','回到a：均衡检查的是个人可强制的两人交换；帕累托稳定检查的是任何可行的共同改进。两把尺子不同。']
 };
 if(!messages[k])throw new Error('Unknown external story: '+k);
 return {step:t,seats:seats.slice(),eq,better,all,title:['先看情境','找到关键关系','观察配置变化','解释这一变化','继续检查','记住结论'][t],narration:messages[k][t]};
}
export function tiedUtility(a,i){return i===0?0:(a[i]===0?1:0);}
export function creamUtility(a,i){return -a[i]+(a[a.length-1]===0?1.5:0);}
export function neighborUtility(a,i){const seat=a.indexOf(i),adjacent=seat%2===0?seat+1:seat-1;return -a[adjacent];}
export function majorityBeaters(prefs,a){return permutations(a.slice()).filter(b=>prefs.reduce((sum,p,i)=>sum+(p.indexOf(b[i])<p.indexOf(a[i])),0)>prefs.length/2);}

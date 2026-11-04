import {equilibriumInspect,equilibriumUtility} from './exchange-equilibrium-story.mjs';
export const reopeningKeys=['home104','again104','free104'];
const reopenCopy=x=>x.map(a=>a.slice());
const reopenDot=(p,x)=>p.reduce((s,v,k)=>s+v*x[k],0);
export function reopeningInspect(kind,p,e,a,b=a){
 const before=equilibriumInspect(kind,p,e,a),after=equilibriumInspect(kind,p,a,b);
 const oldWealth=e.map(x=>reopenDot(p,x)),newWealth=a.map(x=>reopenDot(p,x));
 return {before,after,oldWealth,newWealth,sameBudgets:oldWealth.every((v,i)=>Math.abs(v-newWealth[i])<1e-9),net:b.map((x,i)=>x.map((v,k)=>v-a[i][k])),utilityChange:b.map((x,i)=>equilibriumUtility(kind,x)-equilibriumUtility(kind,a[i]))};
}
export function reopeningStory(key,step=0){
 if(!reopeningKeys.includes(key))throw Error('Unknown reopening story');
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),home=key==='home104',free=key==='free104';
 const kind=home?'product':free?'min':'linear',original=home?[[8,2],[2,8]]:[[8,0],[0,4]],settled=home?[[5,5],[5,5]]:free?[[2,0],[6,4]]:[[7,1],[1,3]],support=free?[0,1]:[1,1];
 const changedPrice=free&&t===5,prices=changedPrice?[1,1]:support.slice(),endowments=reopenCopy(t<2?original:settled);
 let assignment=reopenCopy(t===0?original:settled);
 if(key==='again104'&&t>=4)assignment=[[6,2],[2,2]];
 if(free&&t===4)assignment=[[0,0],[8,4]];
 const check=equilibriumInspect(kind,prices,endowments,assignment),proof=reopeningInspect(kind,support,original,settled,t<2?settled:assignment);
 return {key,step:t,kind,original,settled,support,prices,endowments,assignment,changedPrice,check,proof,net:assignment.map((x,i)=>x.map((v,k)=>v-endowments[i][k])),role:t<2?'昨日交易前的家底':'今日重新开市的家底',currentRole:t===0?'交易前持有':t===1?'第一次均衡配置':t===2?'今天的新家底':changedPrice?'改变价格后的原配置':t>=4&&!home?'另一种分法':'维持原配置',stage:t<2?'第一场交易':changedPrice?'另题：原价格改变了':'同一价格重新开市',scope:'命题10.3为教材结论；米豆故事及具体数值由本站构造。',limit:12};
}

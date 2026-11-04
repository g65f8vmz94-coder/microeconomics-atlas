import {contractMarketContent} from './contract-market-content.mjs';

export function contractEquilibrium(W,v){
  if(!Array.isArray(W)||!Number.isFinite(v)||v<=0||W.some(w=>!Number.isFinite(w)||w<0)) throw Error('invalid contract market');
  const wages=[...new Set(W)].sort((a,b)=>a-b),highest=wages.at(-1),selected=highest>0?[highest]:[],I=wages.every(w=>selected.includes(w)),II=selected.every(w=>v-w>=-1e-9);
  // A strictly profitable entrant exists for every empty or sub-v top offer.
  const witness=highest===undefined?v/2:highest<v?(highest+v)/2:null;
  const III=witness===null;
  return {W:wages,v,selected,profits:selected.map(w=>v-w),I,II,III,witness,equilibrium:I&&II&&III};
}

const states={
  simple:[
    {W:[5],entry:null,focus:'老板先报5元',verdict:'有人愿做；现有老板赚3元。'},
    {W:[5],entry:null,focus:'已过前两关',verdict:'还必须检查能否有人盈利进入。'},
    {W:[5],entry:6.5,focus:'隔壁报6.5元',verdict:'新店成为最高报价，利润1.5元。'},
    {W:[5],entry:6.5,focus:'中间报价可插队',verdict:'5<6.5<8；违反条件 III。'},
    {W:[8],entry:5,focus:'工资升到8元',verdict:'低报价抢不到工人；现有利润0。'},
    {W:[8],entry:9,focus:'检查9元进入',verdict:'高价虽吸引人，却亏1元；{8}稳定。'}
  ],
  simpleEntry:[
    {W:[],entry:4,focus:'空报价集合',verdict:'4元报价可获利进入；违反 III。'},
    {W:[5,7],entry:null,focus:'两个不同报价',verdict:'5元不被选；违反 I。'},
    {W:[9],entry:null,focus:'只报9元',verdict:'雇主每人亏1元；违反 II。'},
    {W:[5],entry:6.5,focus:'只报5元',verdict:'6.5元可盈利进入；违反 III。'},
    {W:[8],entry:null,focus:'只报8元',verdict:'现有报价被选且零利润。'},
    {W:[8],entry:9,focus:'证明完毕',verdict:'低报抢不到人，高报必亏；唯一 {v}。'}
  ]
};

export function contractMarketStory(key,step){
  if(!contractMarketContent[key]||!Number.isInteger(step)||step<0||step>5)throw Error('unknown contract film frame');
  const content=contractMarketContent[key],s=states[key][step],market=contractEquilibrium(s.W,8),offers=[...s.W,...(s.entry===null?[]:[s.entry])],max=offers.length?Math.max(...offers):0,entryChosen=s.entry!==null&&s.entry>0&&s.entry>=max-1e-9,entryProfit=entryChosen?8-s.entry:null;
  return {key,step,kind:'contracts',identity:content.steps[step][0],narration:content.steps[step][1],v:8,...s,market,entryChosen,entryProfit,visibleChecks:[step>=1||key==='simpleEntry',step>=1||key==='simpleEntry',step>=2||key==='simpleEntry']};
}

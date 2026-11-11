'use strict';
const {axisPlot,relationDiagram}=require('./guided/figure.cjs');
const styles='<style>text{font:12px sans-serif;fill:#26483e}.grid line{stroke:#c5c7b8;stroke-width:.7}.grid text{font:10px monospace}.zero{stroke:#657d70;stroke-width:1.4}.net-edge{stroke:#865135;stroke-width:2.4;fill:none}ellipse{fill:#e5e9db;stroke:#789080}</style>';
function graphic(markup) {
  const svg=markup.match(/<svg\b[\s\S]*?<\/svg>/)[0];
  return svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="680" ').replace(/(<svg[^>]*>)/, '$1'+styles);
}
// One authored frame from each model, in the order seen on screen.
const selection = [
  ['s5.1', 1, '预算线', '十二元买早餐，多拿一份饼，就要放回两杯豆浆。'],
  ['p4.4', 2, '无差异曲线', '沿着同一条线换搭配，满意程度相同。'],
  ['s5.4', 2, '消费者最优选择', '预算线与无差异曲线相切，两种商品各买三份。'],
  ['s5.6', 1, '斯勒茨基补偿', '面涨价后，把钱补到仍买得起旧篮子，再看顾客怎样选。'],
  ['s6.4', 1, '平均成本与边际成本', '再做一杯的成本，恰在平均成本的最低点与它相等。'],
  ['s7.2', 1, '垄断利润', '蛋糕卖到四份时利润最高。再多卖，反而少赚。'],
  ['s9.2', 0, '顶部交易圈', '箭头指向最想要的房子的主人。甲乙互相指向，可以先换钥匙。'],
  ['s10.9', 2, '埃奇沃思盒图', '甲从左下读，乙从右上读。一个点同时记下两家的米和豆。'],
  ['s15.4', 2, '最佳回应', '对方选一半，我也补一半。这是双方互为最佳回应的一种分工。'],
  ['s10.3', 2, '市场出清', '米价为一时，两家想买的米加起来恰好等于库存。'],
];

function bookPlates(chapters,units) {
  return selection.map(([id,frame,title,caption])=>{
    const unit=units[id];
    const chapter=Number(id.slice(1).split('.')[0]);
    let diagram,axes='';
    if(unit.network){
      diagram=relationDiagram({...unit.network,frames:[unit.network.frames[frame],...unit.network.frames]});
    }else{
      const plot=unit.plot;
      diagram=axisPlot({...plot,dots:[plot.dots[frame]]});
      axes=plot.axes.map((label,i)=>(i?'纵轴 · ':'横轴 · ')+label.replace(/^[横纵]轴[：:　 ]*/,'')).join('　 /　 ');
    }
    return {chapter,title,figures:[{id,title:chapters.find(ch=>ch.number===chapter).title,caption,axes,svg:graphic(diagram)}]};
  });
}
module.exports={bookPlates};

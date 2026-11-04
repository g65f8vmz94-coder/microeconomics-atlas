import {auction,locationShares,effort,cournot,bertrand} from './games.mjs';
import {strategicEconomicsContent} from './strategic-economics-content.mjs';

const auctions={
 auctionRules:[['first',5,5],['first',8,2],['first',5,5],['first',8,2],['second',8,2],['second',8,2]],
 first:[['first',5,5],['first',4.9,5],['first',5,5],['first',7,7],['first',11,11],['first',5,5]],
 firstGap:[['first',8,2],['first',8,2],['first',2,2],['first',2,2],['first',8,2],['first',5,5]],
 second:[['second',8,2],['second',7,7],['second',3,12],['second',3,12],['second',10,5],['second',10,5]],
 secondDominant:[['second',10,2],['second',10,2],['second',10,12],['second',10,10],['second',10,5],['second',10,5]]
};
const locations={
 location:[[.2,.8],[.5,.8],[.5,.5],[.5,.5],[.2,.2],[.5,.5]],
 maxmin:[[.5,.2],[.5,.1],[.5,.9],[.5,.5],[.2,.35],[.5,.5]],
 location3:[[.5,.5,.5],[.499,.5,.5],[0,.5,1],[.499,.5,1],[.2,.2,.8],[.5,.5,.5]]
};
const economic={
 effort:[[0,0,1],[.5,0,1],[.5,.75,1],[.875,.75,1],[1,1,1],[1,1,1]],
 cournot:[[.4,.4,.2],[.2,.4,.2],[.2,.3,.2],[.25,.3,.2],[.8/3,.8/3,.2],[.8/3,.8/3,.2]],
 cournotZero:[[1/3,1/3,0],[1,1,0],[0,1,0],[.5,1,0],[1,1,0],[1/3,1/3,0]],
 bertrand:[[.5,.5,.2],[.49,.5,.2],[.5,.5,.2],[.499,.5,.2],[.2,.2,.2],[.2,.2,.2]],
 bertrandProof:[[.2,.2,.2],[.1,.3,.2],[.2,.4,.2],[.5,.5,.2],[1,1,.2],[.2,.2,.2]]
};
export function firstPriceTwoBidNE(bids,values=[10,5]){
 const [b1,b2]=bids,[v1,v2]=values;
 return b1===b2&&b1>=v2-1e-10&&b1<=v1+1e-10;
}
export function auctionPayoff(rule,bids,values=[10,5]){
 const r=auction(rule,bids,values),ne=rule==='first'?firstPriceTwoBidNE(bids,values):r.equilibrium;
 return {...r,bids:[...bids],values:[...values],rule,ne,bookIffCandidate:rule==='first'&&bids[0]>=values[1]&&bids[0]<=values[0]&&bids[1]<=bids[0]};
}
export function economicStory(key,step=0){
 const c=strategicEconomicsContent[key];if(!c)throw Error('Unknown §15.3 case');const k=Math.max(0,Math.min(5,Math.round(step))),base={key,step:k,identity:c.steps[k][0],narration:c.steps[k][1]};
 if(key in auctions){const [rule,a,b]=auctions[key][k],model=auctionPayoff(rule,[a,b]);let comparison=null;if(key==='firstGap'&&k>=2&&k<=4)comparison={from:[8,2],to:[2,2],before:auctionPayoff('first',[8,2]).u,after:auctionPayoff('first',[2,2]).u};if(key==='auctionRules'&&k>=4)comparison={from:[8,2],to:[8,2],before:auctionPayoff('first',[8,2]).u,after:auctionPayoff('second',[8,2]).u};return {...base,kind:'auction',model,comparison};}
 if(key in locations){const positions=[...locations[key][k]],model=locationShares(positions);let deviation=null;
  const alt=key==='location'&&k===1?[.5,.8]:key==='location'&&k===4?[.5,.2]:key==='location3'&&k===1?[.499,.5,.5]:key==='location3'&&k===3?[.499,.5,1]:key==='location3'&&k===4?[.2,.2,.201]:null;
  if(alt){let from=key==='location'&&k===1?[.2,.8]:key==='location'&&k===4?[.2,.2]:key==='location3'&&k===1?[.5,.5,.5]:key==='location3'&&k===3?[0,.5,1]:key==='location3'&&k===4?[.2,.2,.8]:positions;let player=key==='location3'&&k===4?2:0;const before=locationShares(from).shares[player],after=locationShares(alt).shares[player];deviation={from,to:alt,player,before,after,gain:after-before};}
  return {...base,kind:'location',positions,model,deviation};}
 if(key==='cournotN'){const n=[2,3,5,10,30,100][k],c0=.2,q=(1-c0)/(n+1),Q=n*q,price=1-Q;return {...base,kind:'cournotN',n,c:c0,q,Q,price,profit:q*q};}
 if(key in economic){const [a,b,c0]=economic[key][k],kind=key==='effort'?'effort':key.startsWith('cournot')?'cournot':'bertrand',model=kind==='effort'?effort(a,b,c0):kind==='cournot'?cournot(a,b,c0):bertrand(a,b,c0);return {...base,kind,actions:[a,b],c:c0,model};}
 throw Error('No route for '+key);
}
export const strategicEconomicsRoutes={auctions,locations,economic};

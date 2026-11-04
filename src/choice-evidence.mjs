// Historical evidence in Osborne–Rubinstein §2.6, printed pp.24–27.
// These are reported marginals, never fabricated individual observations.
import {frameData,sourceRates} from './choice.mjs';
export const evCameras=[{id:'A',rating:9.1,megapixels:6},{id:'B',rating:8.3,megapixels:9},{id:'C',rating:8.1,megapixels:7}];
export const evRates=sourceRates;
export const evModes=['attention','framing','mental'];
export const evLastPhase={attention:6,framing:6,mental:5};
export function evDominates(a,b){return a.rating>=b.rating&&a.megapixels>=b.megapixels&&(a.rating>b.rating||a.megapixels>b.megapixels);}
export function evRows(label){if(!frameData[label])throw Error('Unknown source lottery');return frameData[label].map(([color,p,payoff])=>({color,percent:Math.round(p*100),payoff}));}
export function evDistribution(label){const result=new Map();for(const r of evRows(label))result.set(r.payoff,(result.get(r.payoff)||0)+r.percent);return [...result].sort((a,b)=>a[0]-b[0]).map(([payoff,percent])=>({payoff,percent}));}
export function evExpected(label){return evRows(label).reduce((s,r)=>s+r.percent*r.payoff,0)/100;}
export function evDominance(){return evRows('C').map((c,i)=>{const d=evRows('D')[i];return {color:c.color,percent:c.percent,C:c.payoff,D:d.payoff,gain:d.payoff-c.payoff,aligned:c.color===d.color&&c.percent===d.percent};});}
// Atom identities persist while an original event is split and relabelled.
export function evFrameCells(label){const ids={A:['white','red','black','green'],B:['white','red','green','yellow'],C:['white','red','black','green','yellow'],D:['white','red','black','green','yellow']};return evRows(label).map((row,i)=>({...row,id:ids[label][i]}));}
export function evMental(price=40){if(!Number.isFinite(price)||price<0)throw Error('Nonnegative finite ticket price required');return {price,alreadyLost:price,additionalBuy:price,additionalSkip:0,buy:{wealthChange:-2*price,attends:true},skip:{wealthChange:-price,attends:false},ticketAccountIfBuy:2*price,cashAccountIfBuy:price};}
export function evPairedLowerBound(p,q){if(![p,q].every(v=>Number.isFinite(v)&&v>=0&&v<=100))throw Error('Percentages must be between0 and100');return Math.max(0,p+q-100);}

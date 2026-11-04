module.exports=[
 ...['alpha','rationalalpha','constructrank'].map(mode=>({name:mode,mode,initial:{}})),
 ...['median','restaurant','party'].map(context=>({name:context,mode:'alpha',initial:{context}})),
 {name:'partial-cycle',mode:'alpha',initial:{n:3,answers:'012021u',phase:3,table:2}},
 {name:'winner-removed',mode:'alpha',initial:{n:3,table:0,A:7,B:6,phase:3}},
 {name:'construct-six',mode:'constructrank',initial:{n:6}},
 {name:'tail-equality',mode:'constructrank',initial:{n:3,table:0,peel:3,target:6}}
];

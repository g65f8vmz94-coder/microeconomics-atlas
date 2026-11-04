// Each source concept/problem has a standalone entry; subparts retain their initial view.
const primary=['utility','example1','extrema','finitelemma','construct','cinema','infiniteutility','leximpossible','transform','p1','p2','p3','p4','p5','p6','p7','p8','p9'].map(mode=>({name:mode,mode,initial:{}}));
const variants=[
 ['cinema-figure','cinema',{cinemaView:'figure'}],
 ...['intervals','finite','cantor'].map(v=>['leximpossible-'+v,'leximpossible',{lexScene:v}]),
 ...['antisym','weakStrict','strictWeak'].map(v=>['p1-'+v,'p1',{p1proof:v}]),
 ['p2-infinite','p2',{p2view:'infinite',p2Domain:'integers'}],
 ...['examples','partition'].map(v=>['p4-'+v,'p4',{p4view:v}]),
 ['p5-identity','p5',{p5view:'identity'}],['p7-closer','p7',{rule:'closer'}],['p8-integer','p8',{p8view:'integer'}],['p9-contradiction','p9',{p9view:'contradiction'}]
].map(([name,mode,initial])=>({name,mode,initial}));
module.exports=[...primary,...variants];

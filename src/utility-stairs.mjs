// Vector adapted from Sakurambo / Philip Ronan, Impossible staircase.svg (2005), public domain.
// Simplified SVG code by Andreasl01 (2021). https://commons.wikimedia.org/wiki/File:Impossible_staircase.svg
export const penroseMarkup=String.raw`<defs>
		<path id="utility-penrose-top" d="m0,0 37,18 -37,18 -37,-18 z"/>
	</defs>
	<g stroke="#334b40" stroke-linejoin="round" fill="#fff">
		<use href="#utility-penrose-top" x="242" y="18"/>
		<use href="#utility-penrose-top" x="205" y="28"/>
		<use href="#utility-penrose-top" x="168" y="38"/>
		<use href="#utility-penrose-top" x="131" y="48"/>
		<use href="#utility-penrose-top" x="94" y="58"/>
		<use href="#utility-penrose-top" x="57" y="68"/>
		<path fill="#999" d="m279,36 -37,18 v-8 l-37,18 v-8 l-37,18 v-8 l-37,18 v-8 l-37,18 v77 h185 z"/>
		
		<use href="#utility-penrose-top" x="279" y="43"/>
		<path fill="#999" d="m316,61 v7 l-37,18 v-7 z"/>
		<path fill="#ccc" d="m316,104 -37,-18 v-7 l-37,-18 v99 h74 z"/>
		
		<use href="#utility-penrose-top" x="94" y="78"/>
		<use href="#utility-penrose-top" x="131" y="88"/>
		<use href="#utility-penrose-top" x="168" y="98"/>
		<use href="#utility-penrose-top" x="205" y="108"/>
		<use href="#utility-penrose-top" x="242" y="118"/>
		<use href="#utility-penrose-top" x="279" y="93"/>
		<use href="#utility-penrose-top" x="316" y="68"/>
		<path fill="#999" d="m353,86 -37,18 v7 l-37,18 v7 l-37,18 v113 l111,-54 z"/>
		<path fill="#ccc" d="m20,159 v-73 l37,18 v-8 l37,18 v-8 l37,18 v-8 l37,18 v-8 l37,18 v-8 l37,18 v113 z"/>
	</g>`;
export const penroseRoute=[[57, 86], [94, 96], [131, 106], [168, 116], [205, 126], [242, 136], [279, 111], [316, 86], [279, 61], [242, 36], [205, 46], [168, 56], [131, 66], [94, 76]];
export function penroseWalker(phase){if(!Number.isFinite(phase)||phase<0||phase>12)throw Error('One lap phase0..12');const p=phase===12?0:phase/12,edges=penroseRoute.map((a,i)=>{const b=penroseRoute[(i+1)%penroseRoute.length];return{a,b,length:Math.hypot(b[0]-a[0],b[1]-a[1])}}),total=edges.reduce((s,e)=>s+e.length,0);let left=p*total;for(const e of edges){if(left<=e.length)return[e.a[0]+(e.b[0]-e.a[0])*left/e.length,e.a[1]+(e.b[1]-e.a[1])*left/e.length];left-=e.length}return [...penroseRoute[0]]}

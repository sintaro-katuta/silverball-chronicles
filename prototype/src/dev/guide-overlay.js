// Debug-only SVG of actual contact edges. Respect bounded polygon adoption:
// the lower visible continuation is not an active wall just because it is drawn.
const source=p=>[p.x*2+28,(p.y-120)*2],point=p=>source(p).join(',');
export function guideColliderSvg(c){
 if(c.contactRole==='decoration')return '';
 const style=c.active===false?' stroke="#9865bb" stroke-dasharray="3 2"':'';
 if(!c.solid)return `<polyline${style} points="${point(c.a)} ${point(c.b)}"/>`;
 const ps=c.solid.points;if(!c.contactYRange)return `<polygon points="${ps.map(point).join(' ')}"/>`;
 const {min,max}=c.contactYRange;let d='';
 for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],dy=b.y-a.y;let lo=0,hi=1;if(!dy){if(a.y<min||a.y>max)continue;}else{const ts=[(min-a.y)/dy,(max-a.y)/dy].sort((a,b)=>a-b);lo=Math.max(0,ts[0]);hi=Math.min(1,ts[1]);if(lo>hi)continue;}
 const at=t=>({x:a.x+t*(b.x-a.x),y:a.y+t*dy});d+=`M${point(at(lo))}L${point(at(hi))}`;
 }return `<path d="${d}"/>`;
}

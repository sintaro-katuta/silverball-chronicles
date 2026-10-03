import {sourcePath,sourcePoint} from './source-layout.js';
const arc=(rx,ry,end,n)=>Array.from({length:n+1},(_,i)=>{const a=Math.PI+(end-Math.PI)*i/n;const [x,y]=sourcePoint([444+rx*Math.cos(a),530+ry*Math.sin(a)]);return {x,y};});
export const OUTER_ARC=arc(372,410,Math.PI*2,80);
export const INNER_ARC=arc(352,390,Math.PI*1.23,24);
export const PLAYFIELD_APERTURE=[...OUTER_ARC.map(p=>[p.x,p.y]),...sourcePath([[814,615],[814,924],[610,940],[444,940],[280,927],[215,872],[147,769],[94,645],[72,530]])];
export function installBoardRails(physics){
 physics.colliders=physics.colliders.filter(c=>!c.role.startsWith('launch-')&&!['upper-reflector','board-top','out-left','out-right'].includes(c.role));
 const add=(a,b,role)=>physics.colliders.push({a,b,r:.7,material:'rail',role,restitution:.05});
 add({x:22,y:680},OUTER_ARC[0],'launch-outer');add({x:36,y:680},INNER_ARC[0],'launch-inner');
 for(const [ps,role] of [[OUTER_ARC,'launch-outer-arc'],[INNER_ARC,'launch-inner-arc']])for(let i=1;i<ps.length;i++)add(ps[i-1],ps[i],role);
 const drain=sourcePath([[92,648],[149,770],[218,871],[286,926],[550,940]]);
 for(let i=1;i<drain.length;i++)add({x:drain[i-1][0],y:drain[i-1][1]},{x:drain[i][0],y:drain[i][1]},'out-left');
 const right=sourcePath([[811,615],[811,924],[647,940]]);
 for(let i=1;i<right.length;i++)add({x:right[i-1][0],y:right[i-1][1]},{x:right[i][0],y:right[i][1]},'out-right');
}

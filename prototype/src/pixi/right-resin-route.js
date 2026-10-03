import {panelPose} from './attacker-panel.js';
import {sourcePoint,sourcePath,RIGHT_EDGES_SOURCE,LOWER_RIGHT_SOURCE,ATTACKER_SOURCE,DENCHU_SOURCE,ELECTRIC_DEFLECTOR_SOURCE,RIGHT_PRIZE_SOURCE} from './source-layout.js';
export const DENCHU_APPROACH_PINS=sourcePath(RIGHT_PRIZE_SOURCE);
export const RIGHT_GUIDE_EDGES=Object.fromEntries(Object.entries(RIGHT_EDGES_SOURCE).map(([k,v])=>[k,sourcePath(v)]));
export const RIGHT_RESIN_ROUTE=RIGHT_GUIDE_EDGES;
export function installRightResinRoute(physics){
 const attacker=physics.pockets.find(p=>p.kind==='bonus'),tulip=physics.pockets.find(p=>p.kind==='rush');
 const [ax,ay]=sourcePoint(ATTACKER_SOURCE),[tx,ty]=sourcePoint(DENCHU_SOURCE);
 Object.assign(attacker,{x:ax,y:ay});Object.assign(tulip,{x:tx,y:ty,w:12,geometryScale:.65,referenceSlot:true,captureTray:{left:sourcePoint([573,856])[0],right:sourcePoint([635,856])[0],y:sourcePoint([573,856])[1],radius:.65,role:'right-channel-5-1'}});
 const tray=panelPose(attacker,1);attacker.captureTray={left:tray.freeA.x,right:tray.freeB.x,y:tray.freeA.y,radius:physics.gate.r};
 physics.colliders=physics.colliders.filter(c=>!['right-inner-upper','right-inner-lower','right-outer','right-outer-funnel'].includes(c.role));
 const paths=[...Object.values(RIGHT_GUIDE_EDGES),...LOWER_RIGHT_SOURCE.map(sourcePath),sourcePath(ELECTRIC_DEFLECTOR_SOURCE)];
 // Contact-only calibration: the left moulding must leave the measured
 // approach-pin gap open for 1.8-radius balls. Its diagram centerline stays fixed.
 paths.forEach((ps,k)=>{for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i];physics.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:k===6?.4:.65,active:k===5?false:true,denchuShelf:k===5,material:'resin',role:k===0&&i===1?'right-inner-lower':`right-channel-${k}-${i}`,restitution:.04});}});
 for(const [x,y] of DENCHU_APPROACH_PINS){const p=physics.pins.find(p=>p.x===x&&p.y===y);if(p)p.role='denchu-guide';}
}
export function rightRouteDepth(){return 0;}
export function projectRightRoute(p){return {x:p.x,y:p.y};}
export function attachRightRouteDepth(){}
export function paintRightResinRoute(d,boardPoint){
 const point=p=>{const q=boardPoint({x:p[0],y:p[1]});return [Math.round(q.x),Math.round(q.y)];};
 const paths=[...Object.values(RIGHT_GUIDE_EDGES),...LOWER_RIGHT_SOURCE.map(sourcePath),sourcePath(ELECTRIC_DEFLECTOR_SOURCE)];
 for(const [index,ps] of paths.entries())if(index!==5){const pts=ps.map(point);for(const [width,color]of [[8,'#15273c'],[5,'#668699'],[2,'#c3d7db']])for(let i=1;i<pts.length;i++)d.line(...pts[i-1],...pts[i],color,width);}
}
export function paintRightRouteFront(){}

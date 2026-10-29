import {sourcePath,FRAME_SOURCE} from './source-layout.js';
// Remove the title enclosure. The existing LCD boundary is the inner wall;
// the outer rail remains visible and discharges into the original inlet pins.
export const OPEN_LEFT_OUTER_RAIL_SOURCE=[[132,366],[123,403],[116,467],[112,550]];
export const OPEN_LEFT_INNER_ROLES=['lcd-boundary-25','lcd-boundary-26','lcd-boundary-27'];
// The broad ornamental left bezel is cut back to the actual LCD contact edge.
export const OPEN_LEFT_LCD_OUTLINE_SOURCE=[...FRAME_SOURCE.slice(0,17),[192,594],[192,566],[197,397],[196,370]];
export const OPEN_LEFT_ROUTE_SOURCE=[...OPEN_LEFT_OUTER_RAIL_SOURCE,[192+16*5/169,550],[197,397],[196,370]];
export function installOpenLeftInlet(physics){
 physics.colliders=physics.colliders.filter(c=>c.role!=='left-inlet-guide');
 const points=sourcePath(OPEN_LEFT_OUTER_RAIL_SOURCE).map(([x,y])=>({x,y}));
 for(let i=1;i<points.length;i++)physics.colliders.push({a:points[i-1],b:points[i],r:.6,playfieldOnly:true,material:'rail',role:'left-inlet-guide',restitution:.12});
 physics.leftInletRoute='open-title';
}
export function visibleLeftInletRails(physics){return physics.colliders.filter(c=>c.role==='left-inlet-guide'||physics.leftInletRoute==='open-title'&&OPEN_LEFT_INNER_ROLES.includes(c.role));}
export function paintOpenLeftInlet(d,at,physics){
 if(!['open-title','diagram'].includes(physics.leftInletRoute))return;
 const points=sourcePath(OPEN_LEFT_ROUTE_SOURCE).map(at);d.poly(points,'#0a1929');
 // A recessed floor, with no extra contact surface or route-dependent ball force.
 const centre=points.reduce((q,p)=>[q[0]+p[0]/points.length,q[1]+p[1]/points.length],[0,0]);
 d.poly(points.map(([x,y])=>[centre[0]+(x-centre[0])*.9,y]),'#132a3d');
}

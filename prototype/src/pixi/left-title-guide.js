import {sourcePath} from './source-layout.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';
// Original title artwork coordinates; compact its height to end above the inlet nails.
export const LEFT_TITLE_SOURCE=[[172,367],[196,389],[171,414],[199,440],[166,468],[195,494],[163,522],[184,551],[171,593],[199,632],[173,645],[142,583],[148,417]];
export const protectedTitlePoint=([x,y])=>[x,388+(y-367)*.54];
export const PROTECTED_TITLE_SOURCE=LEFT_TITLE_SOURCE.map(protectedTitlePoint);
// Two visible side rails release into the individual inlet pins, not onto a road rail.
export const TITLE_SIDE_RAILS_SOURCE=[[[132,366],[123,403],[116,467],[112,550]],[[197,370],[172,382],[151,392],[141,407],[136,467],[134,550],[173,550],[192.5,550]]];
// Read-only artwork outline for intrusion checks; this is not a contact body.
export const PROTECTED_TITLE_SOLID=prepareSolidPolygon(sourcePath(PROTECTED_TITLE_SOURCE).map(([x,y])=>({x,y})));
export function installLeftTitleGuide(physics){
 physics.colliders=physics.colliders.filter(c=>c.role!=='left-inlet-guide');
 for(const path of TITLE_SIDE_RAILS_SOURCE){const points=sourcePath(path).map(([x,y])=>({x,y}));for(let i=1;i<points.length;i++)physics.colliders.push({a:points[i-1],b:points[i],r:.6,playfieldOnly:true,material:'rail',role:'left-inlet-guide',restitution:.12});}
 physics.leftTitleGuard=true;
}

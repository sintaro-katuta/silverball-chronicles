import {sourcePath} from './source-layout.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';

// User-confirmed guide at source (163.7,774.2), 2026-10-26.
// Final playtest adjustment 2026-10-31: keep the outlet aligned with pin64
// and raise the inlet by 6 source pixels (top slope 7.1 -> 14.0 degrees).
// Apply the same shear to the underside; art and contact share this outline.
export const LEFT_LOWER_GUIDE_SOURCE=[[139,761],[187,773],[177,781.75],[149,776.25]];
export function installSourceLeftLowerGuide(physics){
 const points=LEFT_LOWER_GUIDE_SOURCE.map(p=>[...p]),world=sourcePath(points).map(([x,y])=>({x,y}));
 physics.sourceLeftLowerGuide={id:'source-left-lower-guide',points};
 physics.colliders.push({a:world[0],b:world.at(-1),r:0,material:'resin',
  role:'source-left-lower-guide',shape:'solid-polygon',solid:prepareSolidPolygon(world),
  restitution:.08,playfieldOnly:true});
}

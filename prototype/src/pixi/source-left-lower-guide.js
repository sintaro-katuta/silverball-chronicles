import {sourcePath} from './source-layout.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';

// User-confirmed guide at source (163.7,774.2), 2026-10-26.
// Outline read from the original diagram at 4x, about +/-1 source pixel.
export const LEFT_LOWER_GUIDE_SOURCE=[[139,767],[187,773],[177,783],[149,781]];
export function installSourceLeftLowerGuide(physics){
 const points=LEFT_LOWER_GUIDE_SOURCE.map(p=>[...p]),world=sourcePath(points).map(([x,y])=>({x,y}));
 physics.sourceLeftLowerGuide={id:'source-left-lower-guide',points};
 physics.colliders.push({a:world[0],b:world.at(-1),r:0,material:'resin',
  role:'source-left-lower-guide',shape:'solid-polygon',solid:prepareSolidPolygon(world),
  restitution:.08,playfieldOnly:true});
}

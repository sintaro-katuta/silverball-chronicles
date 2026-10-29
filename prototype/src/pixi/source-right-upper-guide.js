import {sourcePath} from './source-layout.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';

// Gray right-upper band in the original 904x1280 diagram, rechecked at 4x.
// Picture-edge transcription (about +/-1 source pixel), not machine dimensions.
// The user's (705.8,266.6) identifies this area; it is not a nail centre or
// a request to move the diagram's wall through that exact empty-space point.
export const RIGHT_UPPER_GUIDE_SOURCE=[
 [733,245],[715,264],[721,289],[737,310],[752,330],[766,350],
 [777,370],[788,390],[797,410],[805,430],[811,450],[815,467],
 [815,389],[806,363],[797,342],[786,321],[775,302],[762,282],[748,263],
];
export function installSourceRightUpperGuide(physics){
 const points=RIGHT_UPPER_GUIDE_SOURCE.map(p=>[...p]);
 const world=sourcePath(points).map(([x,y])=>({x,y}));
 physics.sourceRightUpperGuide={id:'source-right-upper-guide',points};
 physics.colliders.push({a:world[0],b:world.at(-1),r:0,material:'resin',
  role:'source-right-upper-guide',shape:'solid-polygon',
  solid:prepareSolidPolygon(world),restitution:.04});
}

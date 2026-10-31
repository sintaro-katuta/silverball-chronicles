import {sourceBoardSurfaces} from './source-board-surfaces.js';
import {sourcePath} from './source-layout.js';
import {solidOutlineParts} from '../physics/solid-outline-parts.js';
export function installSourceElectricBody(physics){
 const points=sourcePath(sourceBoardSurfaces(physics).electricFace).map(([x,y])=>({x,y}));
 const solids=solidOutlineParts(points);
 // Keep the existing authored front edges; add the mass already drawn behind
 // them so a front ball cannot enter and rest inside this mechanical body.
 for(const solid of solids)physics.colliders.push({a:solid.points[0],b:solid.points.at(-1),solid,shape:'solid-polygon',restitution:.04,playfieldOnly:true,role:'source-electric-body'});
 physics.electricBodyProfile='rendered-solid-v1';
}

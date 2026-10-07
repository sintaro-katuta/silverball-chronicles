import {OUTER_ARC} from './board-rails.js';

// Exterior moulding only. The launch rail and drain colliders keep their geometry.
// The lower curve encloses the pockets and outlet; spent balls drain behind it.
export function traceBoardSilhouette(path){
 path.moveTo(OUTER_ARC[0].x,OUTER_ARC[0].y);
 for(const p of OUTER_ARC.slice(1))path.lineTo(p.x,p.y);
 path.bezierCurveTo(394,475,372,546,310,586);
 path.bezierCurveTo(274,602,154,602,104,579);
 path.bezierCurveTo(62,548,22,449,22,385);
 path.closePath();
 return path;
}

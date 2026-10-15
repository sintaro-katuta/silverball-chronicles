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

// Opt-in measured visible exterior. The band itself stays wholly inside mask.
export function traceReferenceSilhouette(path,shape){
 const ps=shape.maskExteriorWorld;
 path.moveTo(ps.at(-1).x,ps.at(-1).y);
 for(const p of [...ps].reverse().slice(1))path.lineTo(p.x,p.y);
 const top=ps[0];const rest=OUTER_ARC.filter(p=>p.y<top.y||p.x>208);
 for(const p of rest)path.lineTo(p.x,p.y);
 path.bezierCurveTo(394,475,372,546,310,586);
 path.bezierCurveTo(274,602,154,602,104,579);
 path.bezierCurveTo(62,548,22,449,22,410);
 path.lineTo(ps.at(-1).x,ps.at(-1).y);path.closePath();return path;
}
export function referenceDecorMask(){return {x:15,y:242.5,width:75,height:187.5};}

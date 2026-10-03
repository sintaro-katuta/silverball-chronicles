// Front mouth bounds, shared by the fixed housing, door and clipping mask.
export const MOUTH=Object.freeze({left:-9,top:-19,right:118,bottom:58});
export const ATTACKER_SCALE=.5;
export function panelPose(pocket,progress){
 const left=pocket.x-pocket.w/2+MOUTH.left/2,right=pocket.x-pocket.w/2+MOUTH.right/2;
 const top=pocket.y+MOUTH.top/2,bottom=pocket.y+MOUTH.bottom/2;
 const depth=Math.sin(progress*Math.PI/2),inset=-7*depth;
 const freeY=bottom-(bottom-top)*Math.cos(progress*Math.PI/2)+10*depth;
 const center=pocket.x-2.75,project=q=>({x:center+(q.x-center)*ATTACKER_SCALE,y:pocket.y+(q.y-pocket.y)*ATTACKER_SCALE});
 const pose={hingeA:{x:left,y:bottom},hingeB:{x:right,y:bottom},progress,freeA:{x:left+inset,y:freeY},freeB:{x:right-inset,y:freeY}};
 for(const key of ['hingeA','hingeB','freeA','freeB'])pose[key]=project(pose[key]);
 return pose;
}

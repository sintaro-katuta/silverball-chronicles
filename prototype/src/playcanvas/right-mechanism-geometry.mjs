export function rightGatePose(gate){
 const {a,b}=gate;
 return {x:(a.x+b.x)/2-210,y:340-(a.y+b.y)/2,z:29,length:Math.hypot(b.x-a.x,b.y-a.y),angle:-Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};
}

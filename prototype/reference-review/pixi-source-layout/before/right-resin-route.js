import {panelPose} from './attacker-panel.js';
// Short straight inlet above an open inverse-V pin approach to the tulip.
const samples=[{x:369,y:230,dx:0,dy:1},{x:369,y:400,dx:0,dy:1}];
const HALF_WIDTH=10;
export const DENCHU_APPROACH_PINS=[-1,1].flatMap(side=>
 Array.from({length:4},(_,i)=>[359+side*(20-8*i/3),510+14*i]));

export const RIGHT_RESIN_ROUTE={
 left:samples.map(p=>[p.x-p.dy*HALF_WIDTH,p.y+p.dx*HALF_WIDTH]),
 right:samples.map(p=>[p.x+p.dy*HALF_WIDTH,p.y-p.dx*HALF_WIDTH]),
};
// Guide only the upper arrival. The LCD frame itself separates the lower field.
export const RIGHT_GUIDE_EDGES={left:[[330,230],[359,310],[359,400]],right:[[405,230],[379,310],[379,400]]};
export function installRightResinRoute(physics){
 const attacker=physics.pockets.find(p=>p.kind==='bonus');
 Object.assign(physics.pockets.find(p=>p.kind==='rush'),{x:359.5,y:596});
 Object.assign(attacker,{x:359.5,y:446});
 const tray=panelPose(attacker,1);
 attacker.captureTray={left:tray.freeA.x,right:tray.freeB.x,y:tray.freeA.y,radius:physics.gate.r};
 physics.colliders=physics.colliders.filter(c=>!['right-inner-upper','right-inner-lower','right-outer','right-outer-funnel'].includes(c.role));
 for(const [side,points]of Object.entries(RIGHT_GUIDE_EDGES))for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];physics.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:1.3,material:'resin',role:side==='left'&&i===1?'right-inner-lower':`right-channel-${side}-${i}`,restitution:.04});
 }
 physics.pins=physics.pins.filter(p=>!(p.x>310&&p.y>=394&&p.y<578));
 let id=Math.max(...physics.pins.map(p=>p.id))+1;
 for(const [x,y]of DENCHU_APPROACH_PINS)physics.pins.push({id:id++,x,y,r:2.1,role:'denchu-guide'});
}
// The inlet returns to the board plane before the open pin chamber.
export function rightRouteDepth({x,y}){
 if(x<300||x>390||y<330||y>400)return 0;
 return 12*Math.max(0,Math.min(1,(y-330)/18,(400-y)/24));
}
export function projectRightRoute(p){return {x:p.x,y:p.y+rightRouteDepth(p)*.7};}
export function attachRightRouteDepth(physics){
 const advance=physics.advanceBall.bind(physics);
 physics.advanceBall=(b,dt,options={})=>{
  const previous=advance(b,dt,options);
  if(previous.y<330&&b.y>=330&&b.x>350&&b.x<379)b.onRightSurface=true;
  if(b.onRightSurface&&b.y>400)b.onRightSurface=false;
  b.routeDepth=b.onRightSurface?rightRouteDepth(b):0;return previous;
 };
}
export function paintRightResinRoute(d,boardPoint){
 const point=([x,y])=>{const p=boardPoint(projectRightRoute({x,y}));return [Math.round(p.x),Math.round(p.y)];};
 const left=RIGHT_GUIDE_EDGES.left.map(point),right=RIGHT_GUIDE_EDGES.right.map(point),hull=[...left,...right.toReversed()];
 d.poly(hull.map(([x,y])=>[x+4,y+6]),'#030a12');d.poly(hull,'#183448');
 // Draw the entire continuous seam once; no per-segment end caps or doubled screws.
 for(const path of [left,right]){
  for(const [width,color,dx,dy]of [[15,'#0c1926',2,4],[10,'#294b60',0,2],[7,'#618697',0,0],[2,'#b9d8e0',-1,-1]])
   for(let i=1;i<path.length;i++)d.line(path[i-1][0]+dx,path[i-1][1]+dy,path[i][0]+dx,path[i][1]+dy,color,width);
 }
 // Two mounts on the upper guide; no hidden lower walls or floating sockets.
 for(const [x,y,wallX]of [[353,340,359],[385,380,379]]){
  const [sx,sy]=point([x,y]),[wx]=point([wallX,y]);d.rect(Math.min(sx,wx),sy-5,Math.abs(wx-sx),10,'#29475b');d.rect(sx-5,sy-5,10,10,'#618697');d.rect(sx-3,sy-1,6,2,'#24374b');
 }

}
export function paintRightRouteFront(d,pt){
 const at=p=>{const q=pt(projectRightRoute(p));return [q.x,q.y];};
 // Front lip ends upstream of the rounded shoulder, keeping the chamber joint seamless.
 const a=at({x:359,y:380}),b=at({x:379,y:380});
 d.poly([a,b,[b[0],b[1]+5],[a[0],a[1]+5]],'#294b60');d.line(...a,...b,'#bad7df',3);
}

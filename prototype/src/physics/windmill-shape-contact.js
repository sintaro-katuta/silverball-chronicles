import {windmillVisibleShape,pointInWindmillUnion,WINDMILL_VISIBLE_SHAPE_VERSION} from '../domain/windmill-shape.js';
import {activePhysicsTrace,traceSolverContact} from './passive-trace.js';
export function windmillUnionContact(ball,m){
 const g=windmillVisibleShape(m.radius,m.angle),p={x:ball.x-m.x,y:ball.y-m.y},box=g.bounds;
 if(p.x<box.minX-ball.r||p.x>box.maxX+ball.r||p.y<box.minY-ball.r||p.y>box.maxY+ball.r)return null;
 const inside=pointInWindmillUnion(p,g);let nearest=null;
 for(const e of g.boundary){let point;
  if(e.type==='arc'){let angle=Math.atan2(p.y,p.x);if(angle<0)angle+=2*Math.PI;const q=Math.max(e.startAngle,Math.min(e.endAngle,angle)),candidates=[{x:Math.cos(q)*e.radius,y:Math.sin(q)*e.radius},e.a,e.b];point=candidates.reduce((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)<Math.hypot(p.x-b.x,p.y-b.y)?a:b);}
  else {const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,t=Math.max(0,Math.min(1,((p.x-e.a.x)*dx+(p.y-e.a.y)*dy)/(dx*dx+dy*dy)));point={x:e.a.x+t*dx,y:e.a.y+t*dy};}
  const distance=Math.hypot(p.x-point.x,p.y-point.y),outward=e.type==='arc'?{x:point.x/e.radius,y:point.y/e.radius}:e.outward;if(!nearest||distance<nearest.distance)nearest={...e,outward,point,distance};
 }
 if(!nearest||!inside&&nearest.distance>=ball.r-1e-10)return null;
 const {point,distance,outward}=nearest,normal=distance>1e-12?(inside?{x:(point.x-p.x)/distance,y:(point.y-p.y)/distance}:{x:(p.x-point.x)/distance,y:(p.y-point.y)/distance}):outward;
 return {...nearest,inside,point:{x:point.x+m.x,y:point.y+m.y},normal};
}
export function resolveVisibleWindmill(physics,ball,m,{predict=false,game=null}={}){
 let contacts=0;
 // Resolve multiple exterior faces at a concave opening; never collide with
 // overlap/internal component edges. Same bounded10 separation passes as board.
 for(let pass=0;pass<10;pass++){
  const contact=windmillUnionContact(ball,m);if(!contact)break;
  const {point,normal,kind}=contact,oldVx=ball.vx,oldVy=ball.vy,surface={x:-(point.y-m.y)*m.omega,y:(point.x-m.x)*m.omega};
  const solve=()=>{ball.x=point.x+normal.x*ball.r;ball.y=point.y+normal.y*ball.r;const v=(ball.vx-surface.x)*normal.x+(ball.vy-surface.y)*normal.y;if(v>=0)return 0;ball.vx-=(1+.3)*v*normal.x;ball.vy-=(1+.3)*v*normal.y;return -v;};
  const part={kind:'windmill-photo-three-vane',componentId:contact.ownerId,componentKind:kind,shapeVersion:WINDMILL_VISIBLE_SHAPE_VERSION,a:{x:contact.a.x+m.x,y:contact.a.y+m.y},b:{x:contact.b.x+m.x,y:contact.b.y+m.y},surfaceVelocity:surface,restitution:.3};
  const impulse=activePhysicsTrace&&!predict?traceSolverContact(physics,ball,part,'advance-visible-windmill',solve):solve();contacts++;
  // A circular hub normal passes through the axis: its normal impulse has zero moment.
  if(impulse&&!predict){physics.recordRole(ball,'windmill');{const radial=kind==='hub'&&Math.abs((point.x-m.x)*normal.y-(point.y-m.y)*normal.x)<1e-10;const torque=radial?0:(ball.x-m.x)*(oldVy-ball.vy)-(ball.y-m.y)*(oldVx-ball.vx);m.omega=Math.max(-7,Math.min(7,m.omega+torque*.0005));}m.lastHit=game?.time;game?.emit?.('mechanism',{kind:m.kind});}
 }
 return contacts;
}

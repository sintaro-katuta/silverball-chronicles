import {applySphereFriction} from './sphere-friction.js';
// Recessed 2D playfield: positions are free, constrained only by the authored
// guide edges. No centreline, target speed, attraction, or direct admission.
export function enterSourceStage(stage,b,previous){
 if(!stage||b.onSourceStage||b.sourceStageExited||b.sourceStageSpilled||!b.leftLaunchPlane)return false;
 const e=stage.entrance,dx=b.x-previous.x,dy=b.y-previous.y,n=e.normal;
 const a=(previous.x-e.x)*n.x+(previous.y-e.y)*n.y,c=(b.x-e.x)*n.x+(b.y-e.y)*n.y;
 if(!(a<=0&&c>0))return false;
 const t=-a/(c-a),x=previous.x+dx*t,y=previous.y+dy*t;
 if(Math.abs((x-e.x)*-n.y+(y-e.y)*n.x)>e.width/2-b.r)return false;
 b.onSourceStage=true;b.stageDepth=stage.depth;b.stageEnteredAt=b.age;return true;
}
function collideGuide(b,c,collide){
 const impulse=collide(b,c);if(!impulse)return;
 const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,t=Math.max(0,Math.min(1,((b.x-c.a.x)*dx+(b.y-c.a.y)*dy)/(dx*dx+dy*dy))),x=c.a.x+t*dx,y=c.a.y+t*dy,l=Math.hypot(b.x-x,b.y-y)||1;
 applySphereFriction(b,(b.x-x)/l,(b.y-y)/l,impulse*(1+c.restitution),.5);b.lastContact=c.role;
}
export function resolveStageSurface(stage,b,{collide,solid}){
 if(b.onStageRamp)return;
 solid(b,stage.lcd);
 if(b.x>=stage.neck.a.x+b.r+stage.radius)b.stageNeckCleared=true;
 // Only transfer into the trough when the whole sphere clears its authored
 // receiving corner. A miss drops back to the front at the same position;
 // there is no lateral push, deletion, or teleport into the guide.
 if(!b.stageNeckCleared){if(b.y>=stage.neck.b.y-b.r-stage.radius){b.onSourceStage=false;b.stageDepth=0;b.sourceStageSpilled=true;}return;}
 collideGuide(b,stage.neck,collide);
 for(let pass=0;pass<4;pass++){const x=b.x,y=b.y,impulse=solid(b,stage.floor);if(impulse){const l=Math.hypot(b.x-x,b.y-y)||1;applySphereFriction(b,(b.x-x)/l,(b.y-y)/l,impulse*(1+stage.floor.restitution),.5);b.lastContact='source-stage-guide';}for(const c of stage.guides)if(c.sourceGuideId!==stage.pathId)collideGuide(b,c,collide);}
}
// Static side faces in the ramp's (horizontal, downhill) coordinates. Their
// rear and front sections come from the existing broad trough and central U.
// Normal impulses exchange downhill/lateral motion; no centre attraction.
export function resolveRampSides(r,b){
 for(let pass=0;pass<3;pass++)for(const left of [true,false]){
  const back=left?r.backLeft:r.backRight,front=left?r.left:r.right,k=(front-back)/r.length,n=Math.hypot(1,k),nx=(left?1:-1)/n,ns=(left?-k:k)/n;
  const distance=(left?b.x-back-k*b.rampDistance:back+k*b.rampDistance-b.x)/n,overlap=b.r-distance;
  if(overlap<=0)continue;b.x+=nx*overlap;b.rampDistance+=ns*overlap;
  const v=b.vx*nx+b.rampSpeed*ns;if(v<0){const impulse=-(1+.08)*v;b.vx+=impulse*nx;b.rampSpeed+=impulse*ns;}
 }
}
export function advanceSourceStage(stage,b,dt,{gravity,collide,solid}){
 if(b.onStageRamp){
  const r=stage.ramp,a=gravity*r.ty,old=b.rampSpeed;
  b.rampDistance+=old*dt+.5*a*dt*dt;b.rampSpeed+=a*dt;b.x+=b.vx*dt;
  resolveRampSides(r,b);
  if(b.rampDistance<0){b.rampDistance=0;b.onStageRamp=false;b.stageDepth=stage.depth;b.vy=b.rampSpeed*r.ty;return;}
  b.rampDistance=Math.min(r.length,b.rampDistance);
  applySphereFriction(b,0,-1,gravity*r.tz*dt,.5);
  b.y=b.rampStartY+b.rampDistance*r.ty;b.stageDepth=Math.max(0,stage.depth-b.rampDistance*r.tz);b.vy=b.rampSpeed*r.ty;
  if(b.rampDistance>=r.length){b.stageDepth=0;b.onSourceStage=false;b.onStageRamp=false;b.sourceStageExited=true;b.stageExitedAt=b.age;}
  return;
 }
 b.vy+=gravity*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;resolveStageSurface(stage,b,{collide,solid});
 if(!b.onSourceStage)return;
 const r=stage.ramp;
 const supported=stage.guides.some(c=>{if(c.sourceGuideId!==stage.pathId)return false;const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,t=Math.max(0,Math.min(1,((b.x-c.a.x)*dx+(b.y-c.a.y)*dy)/(dx*dx+dy*dy)));return b.y<=c.a.y+t*dy&&Math.hypot(b.x-c.a.x-t*dx,b.y-c.a.y-t*dy)<=b.r+stage.radius+.1;});
 const leftReach=b.r*Math.hypot(1,(r.left-r.backLeft)/r.length),rightReach=b.r*Math.hypot(1,(r.right-r.backRight)/r.length);
 if(b.x>=r.backLeft+leftReach&&b.x<=r.backRight-rightReach&&supported){
  b.onStageRamp=true;b.rampDistance=0;b.rampSpeed=Math.max(0,b.vy*r.ty);b.rampStartY=b.y;
 }
}

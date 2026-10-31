// A passive, constrained gutter. Positive depth is behind the nail plane.
// Gravity is projected onto its measured/authored 3D segments; no target speed
// or admission is imposed. At bends, normal constraint impulses dissipate energy.
export function prepareRecessedTrack(points,{mouthWidth}={}){
 let length=0;const segments=[];
 for(let i=1;i<points.length;i++){
  const a={...points[i-1]},b={...points[i]},dx=b.x-a.x,dy=b.y-a.y,dz=b.depth-a.depth,l=Math.hypot(dx,dy,dz);
  if(!(l>0)||dy<=0)throw Error('Recessed gutter must descend continuously');
  segments.push({a,b,length:l,start:length,t:{x:dx/l,y:dy/l,z:dz/l}});length+=l;
 }
 return {points:points.map(p=>({...p})),segments,length,mouthWidth};
}
export function trackPose(track,s){
 const c=track.segments.find(c=>s<c.start+c.length)??track.segments.at(-1),q=Math.max(0,Math.min(1,(s-c.start)/c.length));
 return {x:c.a.x+(c.b.x-c.a.x)*q,y:c.a.y+(c.b.y-c.a.y)*q,depth:c.a.depth+(c.b.depth-c.a.depth)*q,t:c.t};
}
export function placeTrackBall(track,b){
 const p=trackPose(track,b.stageDistance);b.x=p.x;b.y=p.y;b.stageDepth=p.depth;b.vx=b.stageSpeed*p.t.x;b.vy=b.stageSpeed*p.t.y;b.stageVz=b.stageSpeed*p.t.z;
}
export function enterRecessedTrack(track,b,previous){
 if(!track||b.onLeftStage||b.leftStageExited||!b.leftLaunchPlane)return false;
 const c=track.segments[0],len=Math.hypot(c.t.x,c.t.y),nx=c.t.x/len,ny=c.t.y/len;
 const signed=p=>(p.x-c.a.x)*nx+(p.y-c.a.y)*ny,d0=signed(previous),d1=signed(b);
 if(!(d0<=0&&d1>0))return false;
 const q=-d0/(d1-d0),x=previous.x+(b.x-previous.x)*q,y=previous.y+(b.y-previous.y)*q;
 if(Math.abs((x-c.a.x)*-ny+(y-c.a.y)*nx)>track.mouthWidth/2-b.r)return false;
 b.onLeftStage=true;b.stageDistance=0;b.stageSpeed=Math.max(0,b.vx*c.t.x+b.vy*c.t.y);b.stageEnteredAt=b.age;b.stageEntrySpeed=Math.hypot(b.vx,b.vy);placeTrackBall(track,b);return true;
}
export function advanceRecessedTrack(track,b,dt,gravity){
 let remaining=dt;
 while(remaining>1e-12){
  const c=track.segments.find(c=>b.stageDistance<c.start+c.length-1e-10)??track.segments.at(-1),a=gravity*c.t.y,delta=c.start+c.length-b.stageDistance;
  const cross=delta>0?2*delta/(Math.sqrt(b.stageSpeed*b.stageSpeed+2*a*delta)+b.stageSpeed):0,h=Math.min(remaining,cross);
  b.stageDistance+=b.stageSpeed*h+.5*a*h*h;b.stageSpeed+=a*h;remaining-=h;
  if(h===cross){
   b.stageDistance=c.start+c.length;
   const next=track.segments[track.segments.indexOf(c)+1];
   if(!next){b.stageDistance=track.length;placeTrackBall(track,b);b.onLeftStage=false;b.leftStageExited=true;b.stageDepth=0;b.stageExitedAt=b.age;return;}
   b.stageSpeed*=Math.max(0,c.t.x*next.t.x+c.t.y*next.t.y+c.t.z*next.t.z);
  }
 }
 placeTrackBall(track,b);
}
export function recessedTrackPair(track,a,b){
 if(!a.onLeftStage||!b.onLeftStage)return false;
 const lo=a.stageDistance<=b.stageDistance?a:b,hi=lo===a?b:a,gap=a.r+b.r,d=hi.stageDistance-lo.stageDistance;
 if(d>=gap)return false;
 const shift=(gap-d)/2;lo.stageDistance=Math.max(0,lo.stageDistance-shift);hi.stageDistance=Math.min(track.length,lo.stageDistance+gap);
 if(lo.stageSpeed>hi.stageSpeed){const mean=(lo.stageSpeed+hi.stageSpeed)/2,relative=(lo.stageSpeed-hi.stageSpeed)*.55/2;lo.stageSpeed=mean-relative;hi.stageSpeed=mean+relative;}
 placeTrackBall(track,a);placeTrackBall(track,b);return true;
}

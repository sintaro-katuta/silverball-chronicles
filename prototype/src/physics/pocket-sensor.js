// Board-space entrance sensor shared by actual play and trajectory prediction.
// Return the point where the ball centre crosses the entrance, not its next-frame position.
export function pocketCrossing(previous,ball,pocket){
 // Tray admission follows physical contact with the open front lip.
 if(pocket.captureTray){const t=pocket.captureTray,surface=t.y-t.radius-ball.r;
  return ball.lastContact===(t.role??'attacker-door')&&Math.abs(ball.y-surface)<.75&&ball.x>=t.left+ball.r&&ball.x<=t.right-ball.r?{x:ball.x,y:ball.y,t:1}:null;
 }
 // Optional recessed opening: capture entry from above or along the slope.
 // Only the independent attacker preview supplies this region.
 if(pocket.captureRegion){
  const r=pocket.captureRegion,minX=r.left+ball.r,maxX=r.right-ball.r,minY=r.top+ball.r,maxY=r.bottom-ball.r;
  if(minX>maxX||minY>maxY)return null;
  let enter=0,exit=1;
  for(const [start,end,min,max] of [[previous.x,ball.x,minX,maxX],[previous.y,ball.y,minY,maxY]]){
   const delta=end-start;if(Math.abs(delta)<1e-12){if(start<min||start>max)return null;continue;}
   const a=(min-start)/delta,b=(max-start)/delta;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return null;
  }
  return {x:previous.x+(ball.x-previous.x)*enter,y:previous.y+(ball.y-previous.y)*enter,t:enter};
 }
 const dy=ball.y-previous.y;
 if(!(dy>0)||!(ball.vy>0)||previous.y>pocket.y||ball.y<pocket.y)return null;
 const half=pocket.w/2-ball.r;if(half<0)return null;
 const t=(pocket.y-previous.y)/dy,x=previous.x+(ball.x-previous.x)*t;
 return Math.abs(x-pocket.x)<=half?{x,y:pocket.y,t}:null;
}

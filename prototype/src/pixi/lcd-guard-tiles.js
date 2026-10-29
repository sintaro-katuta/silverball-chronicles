import {LCD_LOWER_APRON_ROLES} from './board-flow.js';
// The upper visible face follows the existing solid LCD boundary. Tile joints
// decorate its outside face; they are not holes or invisible collecting rails.
export function lcdGuardTiles(physics){
 const hasRoadGuard=physics.colliders.some(c=>c.pixelGuard);
 return physics.colliders.filter(c=>hasRoadGuard?c.pixelGuard:LCD_LOWER_APRON_ROLES.includes(c.role)).flatMap(c=>{
  const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,length=Math.hypot(dx,dy),n=c.pixelGuard?{x:-c.guardNormal.x,y:-c.guardNormal.y}:{x:dy/length,y:-dx/length},count=Math.ceil(length/10),depth=c.guardDepth??7,contactSide=c.pixelGuard?-1:1;
  return Array.from({length:count},(_,i)=>{
   const at=t=>({x:c.a.x+dx*t+n.x*c.r*contactSide,y:c.a.y+dy*t+n.y*c.r*contactSide});
   return {role:c.role,a:at(i/count),b:at((i+1)/count),normal:n,depth,contactRadius:c.r,contactSide};
  });
 });
}
export function paintLcdGuard(d,at,physics){
 for(const tile of lcdGuardTiles(physics)){
  const {a,b,normal:n,depth}=tile,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),t={x:dx/len,y:dy/len};
  const p=(u,v)=>at([a.x+t.x*u+n.x*v,a.y+t.y*u+n.y*v]);
  d.poly([p(0,0),p(len,0),p(len,depth-1),p(len-1,depth),p(1,depth),p(0,depth-1)],'#142b40');
  d.poly([p(.4,1.4),p(len-.4,1.4),p(len-.4,depth-1.6),p(1,depth-1),p(.4,depth-1.6)],'#496b80');
  d.poly([p(0,0),p(len,0),p(len,1.4),p(0,1.4)],'#849ca8');
  d.poly([p(.4,1.4),p(1.2,1.4),p(1.2,depth-1.3),p(.4,depth-1.6)],'#536f7d');
  const [x,y]=p(len*.5,depth*.6);d.rect(x-2,y-2,4,4,'#102435');d.rect(x-1,y-1,2,2,'#aab8b5');
  const [sx,sy]=p(len-1,depth-1);d.rect(sx,sy,2,2,'#091827');
 }
}

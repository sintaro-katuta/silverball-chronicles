import {installBoardRails} from './board-rails.js';
// The decorative frame itself is the physical boundary, in board coordinates.
export const LCD_LAYOUT=Object.freeze({x:82,y:236,width:236,height:322});
export const LCD_TOP=Array.from({length:25},(_,i)=>[74+252*i/24,228-9*Math.sin(Math.PI*i/24)]);
export const LEFT_LANE_SLOPE=7/12;
export const LCD_BEVEL_Y=558-(190-82)*LEFT_LANE_SLOPE;
export const LCD_OPENING=[[82,236],[318,236],[318,558],[190,558],[82,LCD_BEVEL_Y]];
export const LCD_APRON=[[326,566],[240,570],[182,566],[74,566-(182-74)*LEFT_LANE_SLOPE]];
export const LCD_OUTLINE=[...LCD_TOP,...LCD_APRON];
export function installLcdBoundary(physics){
 for(let i=0;i<LCD_OUTLINE.length;i++){
  const a=LCD_OUTLINE[i],b=LCD_OUTLINE[(i+1)%LCD_OUTLINE.length];
  physics.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:1.3,material:'resin',role:`lcd-boundary-${i}`,restitution:.08});
 }
 physics.mechanisms[0].x=55;physics.mechanisms[0].radius=10;physics.mechanisms[0].y=492;physics.mechanisms=physics.mechanisms.slice(0,1);
 // The same hidden launch deflector serves weak and strong shots.
 installBoardRails(physics);
 physics.pockets.find(p=>p.kind==='start').y=480;
 for(const c of physics.colliders.filter(c=>c.role==='start-rim')){c.a.y=480;c.b.y=495;}
 for(const p of physics.pins){if(p.role==='heso')p.y=467;if(p.role==='jump')p.y=452;}
 physics.pins=physics.pins.filter(p=>p.role!=='michi'&&p.role!=='jump');
 let id=Math.max(...physics.pins.map(p=>p.id))+1;
 for(const side of [-1,1])for(let n=0;n<8;n++){
  if(n===4)continue;
  const x=90+n*14;
  physics.pins.push({id:id++,role:'michi',x:side===-1?x:420-x,y:407+n*5.5,r:2.1});
 }
 // Adjust only the final three left road pins; keep the right route unchanged.
 for(const p of physics.pins)if(p.role==='michi'&&p.x>=160&&p.x<200){p.x-=6;p.y+=8;}
 // Clear the display enclosure and clearance above the frame.
 physics.pins=physics.pins.filter(p=>{
  if(p.x<90||p.x>336||p.y>394)return true;
  return p.y<=200;
 });

 // Bring the left assembly together, leaving the independent right route untouched.
 const start=physics.pockets.find(p=>p.kind==='start');start.y=640;
 for(const pin of physics.pins){if(pin.role==='michi')pin.y=602+(pin.y-394)*.45;if(pin.role==='heso')pin.y=627;if(pin.role==='prize')pin.y-=10;}
 for(const c of physics.colliders.filter(c=>c.role==='start-rim')){c.a.y=640;c.b.y=655;}
 for(const pocket of physics.pockets.filter(p=>p.kind==='normal'))pocket.y+=0;
 for(const c of physics.colliders.filter(c=>c.role==='normal-rim')){c.a.y+=0;c.b.y+=0;}
 // Remove old pins covered by the enlarged physical display enclosure.
 physics.pins=physics.pins.filter(p=>!(p.x>57&&p.x<343&&p.y>190&&p.y<593));
 physics.pins=physics.pins.filter(p=>p.role!=='michi'&&p.role!=='prize');
 // Only the upper road is a straight row parallel to the LCD bevel.
 for(let n=0;n<9;n++)physics.pins.push({id:id++,role:'michi',x:62+n*14,y:521+n*14*LEFT_LANE_SLOPE,r:2.1});
 // Receiving and spill pins form staggered groups, not two more parallel rails.
 for(const group of [
  [[65,548],[79,556],[93,564]],
  [[75,584],[88,580],[102,586]],
  [[120,588],[133,596],[146,604]],
  [[130,619],[144,615],[158,613]],
  [[170,622],[182,629]]
 ])for(const [x,y] of group)physics.pins.push({id:id++,role:'michi',x,y,r:2.1});

 for(let n=0;n<4;n++)for(const [x,y]of [[49,384+n*26],[60,397+n*26]])physics.pins.push({id:id++,role:'michi',x,y,r:2.1});
 // Both ordinary receivers sit below the diagonal left pin field.
 physics.pockets=physics.pockets.filter(p=>!(p.kind==='normal'&&p.id===0));
 physics.colliders=physics.colliders.filter(c=>c.role!=='normal-rim');
 for(const [id,x,y] of [[1,98,604],[2,151,634]]){
  const pocket=physics.pockets.find(p=>p.kind==='normal'&&p.id===id);
  Object.assign(pocket,{x,y});
  for(const side of [-1,1])physics.colliders.push({a:{x:x+side*pocket.w/2,y},b:{x:x+side*pocket.w/2,y:y+10},r:1,material:'pocket',role:'normal-rim',restitution:.15});
 }

}
export function overlapsLcd(ball){
 let inside=true;
 for(let i=0;i<LCD_OPENING.length;i++){
  const a=LCD_OPENING[i],b=LCD_OPENING[(i+1)%LCD_OPENING.length],dx=b[0]-a[0],dy=b[1]-a[1];
  if(dx*(ball.y-a[1])-dy*(ball.x-a[0])<0)inside=false;
  const t=Math.max(0,Math.min(1,((ball.x-a[0])*dx+(ball.y-a[1])*dy)/(dx*dx+dy*dy)));
  if(Math.hypot(ball.x-a[0]-t*dx,ball.y-a[1]-t*dy)<ball.r)return true;
 }
 return inside;
}

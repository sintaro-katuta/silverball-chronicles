import {ORDINARY_RIM_DEPTH} from './ordinary-pocket-geometry.js';
import {installBoardRails} from './board-rails.js';
import {sourcePoint,sourcePath,SCREEN_SOURCE,FRAME_SOURCE,UNIT_SOURCE,LEFT_PINS_SOURCE,HESO_PINS_SOURCE,ROAD_SOURCE,RIGHT_ROAD_SOURCE,POCKETS_SOURCE,FUZU_START_SOURCE,LEFT_INLET_GUIDES_SOURCE} from './source-layout.js';
export const LCD_OPENING=sourcePath(SCREEN_SOURCE),LCD_OUTLINE=sourcePath(FRAME_SOURCE);
const xs=LCD_OPENING.map(p=>p[0]),ys=LCD_OPENING.map(p=>p[1]);
export const LCD_LAYOUT=Object.freeze({x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});
export const LCD_TOP=LCD_OUTLINE.slice(0,3),LCD_APRON=LCD_OUTLINE.slice(7,15),LCD_BEVEL_Y=sourcePoint([214,676])[1],LEFT_LANE_SLOPE=3.9/7.45;
export function installLcdBoundary(physics){
 // Estimated 2D contact scale; diagram pin centers stay unchanged.
 // Ball radius + pin shaft radius (2.0) stays below half the 4.20 road pitch.
 installBoardRails(physics);physics.ballRadius=1.8;physics.separateLaunchPlane=true;physics.launchSpeedOffset=55;physics.displayBallScale=1.8/4.6;
 const outline=sourcePath(UNIT_SOURCE);
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];physics.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:.7,material:'resin',role:`lcd-boundary-${i}`,restitution:.08});}
 for(const path of LEFT_INLET_GUIDES_SOURCE){const ps=sourcePath(path);for(let i=1;i<ps.length;i++)physics.colliders.push({a:{x:ps[i-1][0],y:ps[i-1][1]},b:{x:ps[i][0],y:ps[i][1]},r:.6,playfieldOnly:true,material:'rail',role:'left-inlet-guide',restitution:.12});}
 const [wx,wy]=sourcePoint([156,713]);physics.mechanisms=[{...physics.mechanisms[0],x:wx,y:wy,radius:10,armRadius:.8}];
 let id=1;physics.pins=[];
 for(const [role,points] of [['michi',ROAD_SOURCE],['prize',LEFT_PINS_SOURCE],['michi',RIGHT_ROAD_SOURCE]])for(const p of points){const [x,y]=sourcePoint(p);physics.pins.push({id:id++,role:HESO_PINS_SOURCE.some(h=>h[0]===p[0]&&h[1]===p[1])?'heso':role,x,y,r:.2,restitution:points===ROAD_SOURCE?.85:points===LEFT_PINS_SOURCE&&p[1]<360?.8:.46});}
 // Both road groups use individual pin contacts; the reference gives no
 // supporting member between the right pins to justify a collision segment.

 physics.pockets=physics.pockets.filter(p=>p.kind==='bonus'||p.kind==='rush');
 physics.colliders=physics.colliders.filter(c=>!c.role.endsWith('-rim'));
 for(const p of [...POCKETS_SOURCE,FUZU_START_SOURCE]){const [x,y]=sourcePoint([p.x,p.y]);const pocket={...p,x,y,w:p.w*.5};physics.pockets.push(pocket);for(const side of [-1,1])physics.colliders.push({a:{x:x+side*pocket.w/2,y},b:{x:x+side*pocket.w/2,y:y+(p.kind==='normal'?ORDINARY_RIM_DEPTH:5)},r:.5,material:'pocket',role:`${p.kind}-rim`,restitution:.15});}
 const [x,y]=sourcePoint([606,919]);physics.outlet={x,y,w:24};
}
export function overlapsLcd(ball){
 let inside=false;
 for(let i=0,j=LCD_OPENING.length-1;i<LCD_OPENING.length;j=i++){
  const a=LCD_OPENING[j],b=LCD_OPENING[i],dx=b[0]-a[0],dy=b[1]-a[1];
  if((a[1]>ball.y)!==(b[1]>ball.y)&&ball.x<(b[0]-a[0])*(ball.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  const t=Math.max(0,Math.min(1,((ball.x-a[0])*dx+(ball.y-a[1])*dy)/(dx*dx+dy*dy)));
  if(Math.hypot(ball.x-a[0]-t*dx,ball.y-a[1]-t*dy)<ball.r)return true;
 }return inside;
}

import {installBoardRails} from './board-rails.js';
import {sourcePoint,sourcePath,SCREEN_SOURCE,FRAME_SOURCE,UNIT_SOURCE,LEFT_PINS_SOURCE,ROAD_SOURCE,RIGHT_ROAD_SOURCE,POCKETS_SOURCE} from './source-layout.js';
export const LCD_OPENING=sourcePath(SCREEN_SOURCE),LCD_OUTLINE=sourcePath(FRAME_SOURCE);
const xs=LCD_OPENING.map(p=>p[0]),ys=LCD_OPENING.map(p=>p[1]);
export const LCD_LAYOUT=Object.freeze({x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});
export const LCD_TOP=LCD_OUTLINE.slice(0,3),LCD_APRON=LCD_OUTLINE.slice(7,15),LCD_BEVEL_Y=sourcePoint([214,676])[1],LEFT_LANE_SLOPE=3.9/7.45;
export function installLcdBoundary(physics){
 installBoardRails(physics);physics.ballRadius=2.2;physics.separateLaunchPlane=true;physics.launchSpeedOffset=55;physics.displayBallScale=2.2/4.6;
 const outline=sourcePath(UNIT_SOURCE);
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];physics.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:.7,material:'resin',role:`lcd-boundary-${i}`,restitution:.08});}
 const [wx,wy]=sourcePoint([156,713]);physics.mechanisms=[{...physics.mechanisms[0],x:wx,y:wy,radius:10,armRadius:.8}];
 let id=1;physics.pins=[];
 for(const [role,points] of [['michi',ROAD_SOURCE],['prize',LEFT_PINS_SOURCE],['michi',RIGHT_ROAD_SOURCE]])for(const p of points){const [x,y]=sourcePoint(p);physics.pins.push({id:id++,role,x,y,r:role==='prize'?.25:.7,restitution:points===ROAD_SOURCE?.85:.46});}
 // Left road uses only individual pin contacts. The independent right assembly retains its current guide.
 for(const road of [RIGHT_ROAD_SOURCE]){const ps=sourcePath(road);for(let i=1;i<ps.length-(road===ROAD_SOURCE?4:0);i++){const a=ps[i-1],b=ps[i];physics.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:.7,material:'pin',role:'michi',restitution:.18});}}
 for(const p of [[435,849],[455,849]]){const [x,y]=sourcePoint(p);physics.pins=physics.pins.filter(q=>q.x!==x||q.y!==y);physics.pins.push({id:id++,role:'heso',x,y,r:.7});}
 physics.pockets=physics.pockets.filter(p=>p.kind==='bonus'||p.kind==='rush');
 physics.colliders=physics.colliders.filter(c=>!c.role.endsWith('-rim'));
 for(const p of POCKETS_SOURCE){const [x,y]=sourcePoint([p.x,p.y]);const pocket={...p,x,y,w:p.w*.5};physics.pockets.push(pocket);for(const side of [-1,1])physics.colliders.push({a:{x:x+side*pocket.w/2,y},b:{x:x+side*pocket.w/2,y:y+5},r:.5,material:'pocket',role:`${p.kind}-rim`,restitution:.15});}
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

import {Container,Graphics} from 'pixi.js';
import {LCD_LAYOUT} from './lcd-layout.js';
import {LCD_CONTENT_SCALE,LCD_CONTENT_OFFSET_Y,LCD_REEL_LAYOUT} from './lcd-safe-layout.js';
// A receipt marks actual capture. Only accepted draws travel to the hold tray.
export function createAdmissionFeedback(){
 const root=new Container(),pulses=[];
 return {root,admit({x,y,time,accepted}){
  const ring=new Graphics().ellipse(0,0,11,4).stroke({color:0xc5efff,width:1.2});ring.position.set(x,y);root.addChild(ring);
  const spark=accepted?new Graphics().circle(0,0,2).fill(0xe1f6ff):null;if(spark)root.addChild(spark);
  pulses.push({ring,spark,x,y,time});
 },render(time,reduced=false){
  for(let i=pulses.length-1;i>=0;i--){const p=pulses[i],age=time-p.time;
   if(age>=.65){p.ring.destroy();p.spark?.destroy();pulses.splice(i,1);continue;}
   p.ring.alpha=Math.max(0,1-age/.4);p.ring.scale.set(reduced?1:1+age*1.5);
   if(p.spark){const t=Math.min(1,Math.max(0,(age-.08)/.35)),ease=1-(1-t)**2;
    const targetX=LCD_LAYOUT.x+(LCD_REEL_LAYOUT.holdOffsetX+45)*LCD_CONTENT_SCALE,targetY=LCD_LAYOUT.y+LCD_CONTENT_OFFSET_Y+130*LCD_CONTENT_SCALE;
    p.spark.visible=age>=.08&&!reduced;p.spark.position.set(p.x+(targetX-p.x)*ease,p.y+(targetY-p.y)*ease);p.spark.alpha=1-Math.max(0,(age-.43)/.22);
   }
  }
 }};
}

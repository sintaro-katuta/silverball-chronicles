import {RIGHT_ROAD_SOURCE,sourcePoint} from './source-layout.js';
import {LCD_PIN_HEAD_CONTACT_RADIUS} from '../domain/pin-dimensions.js';
export function rightRoadTiltPositions(){
 const [x,y]=sourcePoint(RIGHT_ROAD_SOURCE[0]),a=-8*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 return RIGHT_ROAD_SOURCE.map((q,i)=>{const[pX,pY]=sourcePoint(q),dx=pX-x,dy=pY-y;return{id:97+i,x:x+c*dx-s*dy,y:y+s*dx+c*dy};});
}
export function installRightRoadContacts(physics){
 for(const p of physics.pins)if(p.id>=97&&p.id<=101){p.shaftRadius=.2;p.r=LCD_PIN_HEAD_CONTACT_RADIUS;p.contactFriction=.5;}
 physics.rightRoadContactProfile='tilt8-visible-head-v1';
}

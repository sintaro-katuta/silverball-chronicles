import {FUZU_START_SOURCE,sourcePoint} from './source-layout.js';
const [x,y]=sourcePoint([FUZU_START_SOURCE.x,FUZU_START_SOURCE.y]);
// Compatibility name: a capturing lower fuzu inlet, not an upper passage sensor.
export const PASS_GATE={y,left:x-FUZU_START_SOURCE.w/4,right:x+FUZU_START_SOURCE.w/4};
export function attachPassGate(flow){
 const hit=flow.game.hit.bind(flow.game),seen=new Set();let count=0,lastPass=-Infinity;
 flow.game.hit=(ball,kind,id)=>{
  if(kind==='fuzu'&&!seen.has(ball.id)){seen.add(ball.id);count++;lastPass=flow.physics.time;}
  return hit(ball,kind,id);
 };
 return {snapshot:()=>({kind:'fuzu-inlet',count,lastPass:Number.isFinite(lastPass)?lastPass:null,lit:flow.physics.time-lastPass<.18})};
}

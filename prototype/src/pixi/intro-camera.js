// Display-only camera. Coordinates stay in the existing board world; no game clock.
export const PLAY_CAMERA=Object.freeze({x:-12,y:-166,scale:1});
export const FRAME_PLACEMENT=Object.freeze({x:-190/1.7,y:44/1.7,scale:1/1.7});
export function containCamera(bounds,width=396,height=436,padding=10){
 const scale=Math.min((width-padding*2)/bounds.width,(height-padding*2)/bounds.height);
 return {scale,x:(width-bounds.width*scale)/2-bounds.x*scale,y:(height-bounds.height*scale)/2-bounds.y*scale};
}
const blend=(a,b,t)=>{const q=t*t*(3-2*t);return {x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,scale:a.scale+(b.scale-a.scale)*q};};
export function createViewCameras(lcd){
 const f=FRAME_PLACEMENT,whole=containCamera({x:f.x,y:f.y,width:1086*f.scale,height:1448*f.scale});
 const close=containCamera(lcd,396,436,14);
 return {whole:{...whole,frameAlpha:1},board:{...PLAY_CAMERA,frameAlpha:0},lcd:{...close,frameAlpha:0}};
}
export function createIntroCamera({lcd,reducedMotion=false,onState=()=>{}}){
 const {whole,lcd:close}=createViewCameras(lcd);
 let elapsed=0,active=!reducedMotion,lastPhase;
 const state=()=>({active,phase:active?elapsed<.8?'whole':elapsed<1.8?'board':elapsed<3.15?'lcd':'return':'complete',elapsed});
 function notify(){const s=state();if(s.phase!==lastPhase){lastPhase=s.phase;onState(s);}}
 function pose(){if(!active)return {...PLAY_CAMERA,frameAlpha:0};if(elapsed<.8)return {...whole,frameAlpha:1};if(elapsed<1.5){const t=(elapsed-.8)/.7;return {...blend(whole,PLAY_CAMERA,t),frameAlpha:Math.max(0,1-t*2)};}if(elapsed<1.8)return {...PLAY_CAMERA,frameAlpha:0};if(elapsed<2.45)return {...blend(PLAY_CAMERA,close,(elapsed-1.8)/.65),frameAlpha:0};if(elapsed<3.15)return {...close,frameAlpha:0};return {...blend(close,PLAY_CAMERA,(elapsed-3.15)/.65),frameAlpha:0};}
 notify();
 return {snapshot:state,pose,step(dt){if(active){elapsed=Math.min(3.8,elapsed+Math.max(0,Math.min(dt,.1)));if(elapsed>=3.8)active=false;notify();}return pose();},skip(){active=false;notify();return pose();}};
}

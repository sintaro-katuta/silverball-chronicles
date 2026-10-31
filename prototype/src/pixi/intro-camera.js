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
 return {right:{...containCamera({x:205,y:180,width:202,height:450}),frameAlpha:0},rightUpper:{...containCamera({x:325,y:210,width:75,height:220}),frameAlpha:0},rightAttacker:{...containCamera({x:310,y:425,width:85,height:115}),frameAlpha:0},rightRoad:{...containCamera({x:220,y:500,width:100,height:85}),frameAlpha:0},upper:{...containCamera({x:35,y:230,width:100,height:95}),frameAlpha:0},stage:{...containCamera({x:64,y:420,width:170,height:145}),frameAlpha:0},whole:{...whole,frameAlpha:1},board:{...PLAY_CAMERA,frameAlpha:0},lcd:{...close,frameAlpha:0},left:{...containCamera({x:26,y:395,width:185,height:175}),frameAlpha:0},road:{...containCamera({x:61,y:475,width:155,height:92.5}),frameAlpha:0},entry:{...containCamera({x:46,y:400,width:55,height:80}),frameAlpha:0}};
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

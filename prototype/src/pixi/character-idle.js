import {Sprite,Texture} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
// Sixteen complete drawings: a bend moves from roots to delayed tips.
export const IDLE_EXPOSURES=Array(16).fill(1);
export const IDLE_FPS=8;
export const IDLE_TICKS=IDLE_EXPOSURES.reduce((a,b)=>a+b,0);
export function idleFrameAt(time){let tick=Math.floor(Math.max(0,time)*IDLE_FPS)%IDLE_TICKS;for(let i=0;i<IDLE_EXPOSURES.length;i++){if(tick<IDLE_EXPOSURES[i])return i;tick-=IDLE_EXPOSURES[i];}return 0;}

export function buildCharacterFrames(atlas,plate){
 const w=atlas.width/4,h=atlas.height/4;
 const base=pixelSurface(210,140,c=>c.drawImage(plate.source.resource,0,0,210,140));
 const silhouettes=[];
 const frames=Array.from({length:16},(_,n)=>{
  const cel=pixelSurface(210,140,c=>c.drawImage(atlas.source.resource,n%4*w,Math.floor(n/4)*h,w,h,-40,10,210,140));
  const ctx=cel.getContext('2d'),data=ctx.getImageData(0,0,210,140),mask=new Uint8Array(210*140);
  for(let p=0;p<mask.length;p++){mask[p]=data.data[p*4+3]>=240?1:0;data.data[p*4+3]=mask[p]*255;}
  // Remove detached alpha specks only. The complete head/neck/hair drawing stays intact.
  const seen=new Uint8Array(mask.length);for(let p=0;p<mask.length;p++){if(seen[p]||!mask[p])continue;const group=[p];seen[p]=1;for(let j=0;j<group.length;j++){const v=group[j],x=v%210,y=Math.floor(v/210);for(const q of [x>0?v-1:-1,x<209?v+1:-1,y>0?v-210:-1,y<139?v+210:-1])if(q>=0&&!seen[q]&&mask[q]){seen[q]=1;group.push(q);}}if(group.length<6)for(const q of group){mask[q]=0;data.data[q*4+3]=0;}}
  ctx.putImageData(data,0,0);silhouettes.push(mask);
  return pixelSurface(210,140,c=>{c.drawImage(base,0,0);c.drawImage(cel,0,0);});
 });return {frames,silhouettes};
}
export function createCharacterIdle(atlas,plate){
 const {frames}=buildCharacterFrames(atlas,plate),canvas=pixelSurface(210,140,()=>{}),ctx=canvas.getContext('2d');const texture=Texture.from(canvas);texture.source.scaleMode='nearest';const sprite=new Sprite(texture);let last=-1;
 function render(time){const n=idleFrameAt(time);if(n===last)return;last=n;ctx.clearRect(0,0,210,140);ctx.drawImage(frames[n],0,0);texture.source.update();}
 render(0);return {sprite,texture,render};
}

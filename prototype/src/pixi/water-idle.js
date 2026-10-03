import {Sprite,Texture} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {buildCloudLayer,cloudOffsetAt} from './cloud-idle.js';
import {buildHairTipFrames,hairTipFrameAt} from './hair-tip-idle.js';

const WIDTH=210,HEIGHT=140;
export const WATER_FRAMES=48,WATER_FPS=8;
// Conservative water-only boundary in the original image's LCD coordinates.
// Keep the shoreline, arm, hilt and diagonal blade outside the moving region.
export function isWaterPixel(x,y){
 const left=y<=105?96:Math.ceil(106+(y-105)*2.2);
 return y>=88&&y<138&&x>=left&&x<208;
}
export function waterFrameAt(time){return Math.floor(Math.max(0,time)*WATER_FPS)%WATER_FRAMES;}
export function buildWaterFrames(scene){
 const base=pixelSurface(WIDTH,HEIGHT,c=>c.drawImage(scene.source.resource,0,0,WIDTH,HEIGHT));
 const original=base.getContext('2d').getImageData(0,0,WIDTH,HEIGHT);
 const frames=Array.from({length:WATER_FRAMES},(_,n)=>pixelSurface(WIDTH,HEIGHT,c=>{
  const output=c.createImageData(WIDTH,HEIGHT);output.data.set(original.data);
  for(let y=88;y<138;y++){
   const phase=Math.floor((y-88)/2)*.83;
   // Six-second loop, integer one-pixel reflection movement; frame zero is original.
   const dx=Math.round((Math.sin(n/WATER_FRAMES*Math.PI*2+phase)-Math.sin(phase))*.5);
   if(!dx)continue;
   for(let x=1;x<WIDTH-1;x++){
    if(!isWaterPixel(x,y)||!isWaterPixel(x+dx,y))continue;
    const dst=(y*WIDTH+x)*4,src=(y*WIDTH+x+dx)*4;
    output.data.set(original.data.subarray(src,src+4),dst);
   }
  }
  c.putImageData(output,0,0);
 }));
 return {base,frames};
}
export function createWaterIdle(scene,cloudSky=null,hairAtlas=null,hairUnderlay=null){
 const {frames}=buildWaterFrames(scene);
 const canvas=pixelSurface(WIDTH,HEIGHT,()=>{}),ctx=canvas.getContext('2d');
 const texture=Texture.from(canvas);texture.source.scaleMode='nearest';
 const clouds=cloudSky?buildCloudLayer(scene,cloudSky):null;
 const hair=hairAtlas?buildHairTipFrames(scene,hairAtlas,hairUnderlay):null;
 const sprite=new Sprite(texture);let last='';
 function render(time){const n=waterFrameAt(time),h=hairTipFrameAt(time),key=`${n}:${clouds?cloudOffsetAt(time):0}:${h}`;if(key===last)return;last=key;ctx.drawImage(frames[n],0,0);if(clouds)ctx.drawImage(clouds.render(time),0,0);if(hair)ctx.drawImage(hair.frames[h],0,0);texture.source.update();}
 render(0);return {sprite,texture,render};
}

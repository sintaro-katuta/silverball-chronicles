import {presentationSurface,LCD_ART_RESOLUTION,smoothTexture} from './presentation-quality.js';
import {Sprite,Texture} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {buildSmoothCloudLayer} from './cloud-idle.js';
import {buildHairTipFrames} from './hair-tip-idle.js';

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
// Runtime keeps the high-resolution original. Water is resampled only inside
// its authored boundary; faces, the shore and the blade remain registered.
export function createWaterIdle(scene,cloudSky=null,hairAtlas=null,hairUnderlay=null){
 const resolution=LCD_ART_RESOLUTION,w=WIDTH*resolution,h=HEIGHT*resolution;
 const base=presentationSurface(WIDTH,HEIGHT,c=>c.drawImage(scene.source.resource,0,0,WIDTH,HEIGHT));
 const canvas=pixelSurface(w,h,()=>{}),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const texture=smoothTexture(Texture.from(canvas));
 const clouds=cloudSky?buildSmoothCloudLayer(cloudSky,resolution):null;
 const hair=hairAtlas?buildHairTipFrames(scene,hairAtlas,hairUnderlay):null;
 const hairLayer=hair?pixelSurface(WIDTH,HEIGHT,()=>{}):null;
 const sprite=new Sprite(texture);let lastTime=-1;
 function render(time){
  if(time===lastTime)return;lastTime=time;ctx.drawImage(base,0,0);
  for(let y=88*resolution;y<138*resolution;y++){
   const logicalY=y/resolution,left=Math.ceil((logicalY<=105?96:106+(logicalY-105)*2.2)*resolution);
   const phase=Math.floor((logicalY-88)/2)*.83;
   const dx=(Math.sin(Math.max(0,time)/6*Math.PI*2+phase)-Math.sin(phase))*.5*resolution;
   const start=left+resolution,width=208*resolution-start-resolution;
   if(width>0)ctx.drawImage(base,start+dx,y,width,1,start,y,width,1);
  }
  if(clouds)ctx.drawImage(clouds.render(time),0,0);
  if(hair){
   const phase=Math.max(0,time)*4,n=Math.floor(phase)%hair.frames.length,next=(n+1)%hair.frames.length,u=phase%1;
   const c=hairLayer.getContext('2d');c.clearRect(0,0,WIDTH,HEIGHT);c.globalCompositeOperation='source-over';c.globalAlpha=1-u;c.drawImage(hair.frames[n],0,0);
   // Interpolate only edited tip pixels. The original face and roots are untouched.
   c.globalCompositeOperation='lighter';c.globalAlpha=u;c.drawImage(hair.frames[next],0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
   ctx.drawImage(hairLayer,0,0,w,h);
  }
  texture.source.update();
 }
 render(0);return {sprite,texture,render};
}

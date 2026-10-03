import {pixelSurface} from './pixel-primitives.js';
const W=210,H=140;
export const HAIR_TIP_FPS=4,HAIR_TIP_COUNT=8;
export const hairTipFrameAt=time=>Math.floor(Math.max(0,time)*HAIR_TIP_FPS)%HAIR_TIP_COUNT;
const silver=(d,i)=>d[i]>=68&&Math.abs(d[i]-d[i+1])<38&&d[i+2]-d[i]<90&&d[i+2]>=d[i];
const pixels=canvas=>canvas.getContext('2d').getImageData(0,0,W,H).data;
export function buildHairTipFrames(scene,atlas,underlay){
 const source=pixels(pixelSurface(W,H,c=>c.drawImage(scene.source.resource,0,0,W,H)));
 const behind=pixels(pixelSurface(W,H,c=>c.drawImage(underlay.source.resource,0,0,W,H)));
 const cw=atlas.width/4,ch=atlas.height/2,editable=new Uint8Array(W*H);
 const frames=Array.from({length:8},(_,n)=>pixelSurface(W,H,c=>{
  // Sheet depicts the original source rectangle (0,160,400,560).
  const drawn=pixels(pixelSurface(W,H,d=>d.drawImage(atlas.source.resource,n%4*cw,Math.floor(n/4)*ch,cw,ch,0,160/1024*H,400/1536*W,560/1024*H)));
  const out=c.createImageData(W,H);
  for(let y=24;y<94;y++)for(let x=0;x<28;x++){
   const p=y*W+x,i=p*4,oldHair=silver(source,i),newHair=silver(drawn,i);
   if(!oldHair&&!newHair)continue;
   editable[p]=1;
   // Keep the approved shading wherever a strand still covers the same pixel.
   // Newly exposed edge pixels inherit the nearest original silver colour.
   let from=i,data=behind;
   if(newHair){
    data=source;
    if(!oldHair){let distance=Infinity;from=-1;
     for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
      const xx=x+dx,yy=y+dy;if(xx<0||xx>=W||yy<0||yy>=H)continue;
      const q=(yy*W+xx)*4,d=dx*dx+dy*dy;
      if(d<distance&&silver(source,q)){distance=d;from=q;}
     }
     if(from<0){data=drawn;from=i;}
    }
   }
   out.data.set(data.subarray(from,from+4),i);
  }
  c.putImageData(out,0,0);
 }));
 return {frames,editable};
}

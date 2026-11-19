// Remove the old sky trapped in the original blade strip while preserving the source RGB.
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
const dir='public/assets/lcd/',w=210,h=140,original=dir+'normal-hero-layer-v1.png';
const small=await sharp(original).resize(w,h,{kernel:'nearest'}).ensureAlpha().raw().toBuffer();
const remove=Buffer.alloc(w*h);
for(let x=104;x<=160;x++){
 const start=Math.max(0,Math.floor(.46*(x-105)+114));let top=-1,last=-1;
 for(let y=start;y<h;y++){
  const i=(y*w+x)*4,[r,g,b,a]=small.subarray(i,i+4);
  if(a&&r>190&&g>180&&b>160){top=y;break;}
 }
 if(top>=0)for(let y=top;y<h;y++){
  const i=(y*w+x)*4,[r,g,b,a]=small.subarray(i,i+4);
  if(a&&(r>50||g>65||b>140))last=y;
 }
 for(let y=start;y<h;y++){
  const i=(y*w+x)*4,[r,g,b,a]=small.subarray(i,i+4);
  const sky=a&&r<8&&g>=20&&g<42&&b>=75&&b<110;
  if(a&&Math.max(r,g,b)<190&&((x>=114&&top>=0&&y<top)||(x>=154&&top<0)||(sky&&(top<0||y<top||(last>=0&&y>last)))))remove[y*w+x]=255;
 }
}
const {data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const mask=await sharp(remove,{raw:{width:w,height:h,channels:1}}).resize(info.width,info.height,{kernel:'nearest'}).greyscale().raw().toBuffer();
let removed=0;for(let p=0;p<mask.length;p++)if(mask[p]&&data[p*4+3]&&Math.max(data[p*4],data[p*4+1],data[p*4+2])<190){data[p*4+3]=0;removed++;}
await mkdir(dir,{recursive:true});await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(dir+'normal-hero-layer-v2.png');console.log({removed});

// Derive a grid-aligned foreground candidate from the original; retains original RGB.
import sharp from 'sharp';
const dir='prototype/public/assets/lcd/',out='prototype/reference-review/s10-pixel-grid/',w=210,h=140;
async function pixels(file){return sharp(file).resize(w,h,{kernel:'nearest'}).ensureAlpha().raw().toBuffer()}
const [base,under,vision]=await Promise.all([
 pixels(dir+'moon-castle-v1.png'),pixels(dir+'character-static-v1.png'),pixels(out+'normal-segmentation-vision-v1.png')
]);
const rgba=Buffer.from(base),mask=Buffer.alloc(w*h),hair=[];
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const p=y*w+x,i=p*4,[r,g,b]=base.subarray(i,i+3),diff=Math.max(...[0,1,2].map(k=>Math.abs(base[i+k]-under[i+k])));
 const oldHair=x<56&&y>=21&&y<97&&diff>12&&r>=68&&Math.abs(r-g)<38&&b>=r&&b-r<90;
 if(oldHair)hair.push(p);
 // Recover the blade as a narrow strip along its authored path, including the hilt.
 const blade=x>=102&&x<=160&&y>=Math.floor(.46*(x-105)+114)&&y<=Math.ceil(.46*(x-105)+127);
 mask[p]=(vision[i+3]>=128 || oldHair || blade)?255:0;
}
for(let p=0;p<w*h;p++)rgba[p*4+3]=mask[p];
await sharp(rgba,{raw:{width:w,height:h,channels:4}}).png().toFile(out+'normal-hero-grid-candidate.png');
await sharp(mask,{raw:{width:w,height:h,channels:1}}).png().toFile(out+'normal-hero-mask-candidate.png');
console.log('hair candidate pixels',hair.length,'foreground pixels',mask.reduce((n,v)=>n+(v?1:0),0));
const alpha=await sharp(mask,{raw:{width:w,height:h,channels:1}}).resize(1536,1024,{kernel:'nearest'}).greyscale().raw().toBuffer();
const sourceRgb=await sharp(dir+'moon-castle-v1.png').removeAlpha().raw().toBuffer();
const sourceRgba=Buffer.alloc(1536*1024*4);
for(let p=0;p<1536*1024;p++){for(let k=0;k<3;k++)sourceRgba[p*4+k]=sourceRgb[p*3+k];sourceRgba[p*4+3]=alpha[p];}
await sharp(sourceRgba,{raw:{width:1536,height:1024,channels:4}}).png().toFile(out+'normal-hero-source-candidate.png');
// Expand the repair region around the edge so hidden fringe pixels cannot leave a ghost.
const repair=Buffer.alloc(w*h);
for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let dy=-2;dy<=2&&!repair[y*w+x];dy++)for(let dx=-2;dx<=2;dx++){
 const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&mask[yy*w+xx]){repair[y*w+x]=255;break}
}
const repairAlpha=await sharp(repair,{raw:{width:w,height:h,channels:1}}).resize(1536,1024,{kernel:'nearest'}).greyscale().raw().toBuffer();
const clean=await sharp(dir+'moon-castle-clean-v1.png').removeAlpha().raw().toBuffer();
const original=await sharp(dir+'moon-castle-v1.png').removeAlpha().raw().toBuffer();
for(let p=0;p<1536*1024;p++)if(repairAlpha[p])for(let k=0;k<3;k++)original[p*3+k]=clean[p*3+k];
await sharp(original,{raw:{width:1536,height:1024,channels:3}}).png().toFile(out+'normal-background-source-candidate.png');

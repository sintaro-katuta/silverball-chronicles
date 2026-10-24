import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
// Read-only image measurements. No image resampling or product-asset edits.
const inputs={body:'public/assets/lcd/long-reach/duel-poses-longhair-v4.png',portrait:'public/assets/lcd/long-reach/hero-resolve-portrait-v1.png'};
const probes=[
 {id:'body-hair',asset:'body',material:'hair',rect:[630,240,60,35]},
 {id:'body-armor',asset:'body',material:'armor',rect:[704,130,45,36]},
 {id:'body-skin',asset:'body',material:'skin',rect:[803,220,12,10]},
 {id:'portrait-hair',asset:'portrait',material:'hair',rect:[760,425,100,70]},
 {id:'portrait-armor',asset:'portrait',material:'armor',rect:[430,398,95,90]},
 {id:'portrait-skin',asset:'portrait',material:'skin',rect:[812,700,70,58]}
];
const cache={};
for(const [id,path] of Object.entries(inputs)){const bytes=await readFile(path),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});cache[id]={data,info,path,sha256:createHash('sha256').update(bytes).digest('hex')};}
const quantile=(a,p)=>a.length?[...a].sort((a,b)=>a-b)[Math.floor((a.length-1)*p)]:null;
const rows=[];
for(const probe of probes){const {data,info}=cache[probe.asset],[x,y,w,h]=probe.rect,levels=[];
 for(const step of [8,16,32]){
  const runs=[];let visible=0,transparent=0;
  for(let row=y;row<y+h;row++){
   let last=null,length=0;
   for(let col=x;col<x+w;col++){
    const i=(row*info.width+col)*4;
    if(data[i+3]<250){if(length)runs.push(length);length=0;last=null;transparent++;continue;}
    visible++;const key=Math.floor((.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])/step);
    if(key===last)length++;else{if(length)runs.push(length);last=key;length=1;}
   }if(length)runs.push(length);
  }
  levels.push({lumaStep:step,opaqueSamples:visible,excludedAlphaSamples:transparent,runCount:runs.length,medianSourcePx:quantile(runs,.5),p90SourcePx:quantile(runs,.9),singlePixelShare:runs.length?runs.filter(x=>x===1).length/runs.length:0});
 }
 rows.push({...probe,levels});
}
const report={version:1,method:'Horizontal runs of equal quantized Rec709 luminance, per opaque ROI row; thresholds8/16/32; alpha<250 excluded. Runs are shade-band statistics, not a native pixel grid or an automatic art-quality score.',inputs:Object.fromEntries(Object.entries(cache).map(([id,v])=>[id,{path:v.path,url:'/'+v.path.slice(7),width:v.info.width,height:v.info.height,sha256:v.sha256}])),probes:rows,renderScale:{lcdUnitsPerSourcePxBodyAt38_9:100/512*.95*1.08,lcdUnitsPerSourcePxPortraitAt41:303/1254,lcdUnitsPerSourcePxPortraitAt44_5:383/1254},decision:'Review stepped outlines, palette and identity in the source ROIs and actual adjacent shots. No assertion of a uniform512 grid; eye/nose features use a separate detail budget.'};
await mkdir('public/assets/lcd/long-reach',{recursive:true});
await writeFile('public/assets/lcd/long-reach/grain-review-v1.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(rows.map(p=>({id:p.id,rect:p.rect,levels:p.levels.map(l=>({step:l.lumaStep,p50:l.medianSourcePx,p90:l.p90SourcePx,one:Number(l.singlePixelShare.toFixed(3)),alpha:l.excludedAlphaSamples}))})),null,2));

import {readFile,writeFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const data=await readFile(process.argv[2]),w=105,h=70;if(data.length!==w*h*4)throw Error('Expected 105×70 RGBA reference');
const counts=new Map();for(let i=0;i<data.length;i+=4){const key=(data[i]<<16)|(data[i+1]<<8)|data[i+2];counts.set(key,(counts.get(key)||0)+1)}
const colors=[...counts].map(([key,count])=>({rgb:[key>>16&255,key>>8&255,key&255],count}));let boxes=[colors];
function span(b,c){let min=255,max=0;for(const p of b){min=Math.min(min,p.rgb[c]);max=Math.max(max,p.rgb[c])}return max-min}
while(boxes.length<96){let bi=-1,axis=0,score=-1;for(let i=0;i<boxes.length;i++){const b=boxes[i];if(b.length<2)continue;const mass=b.reduce((s,c)=>s+c.count,0);for(let k=0;k<3;k++){let v=span(b,k)*Math.sqrt(mass);if(v>score){bi=i;axis=k;score=v}}}if(bi<0)break;let box=boxes.splice(bi,1)[0].sort((a,b)=>a.rgb[axis]-b.rgb[axis]),total=box.reduce((s,v)=>s+v.count,0),sum=0,cut=1;for(;cut<box.length-1;cut++){sum+=box[cut-1].count;if(sum>=total/2)break}boxes.push(box.slice(0,cut),box.slice(cut))}
const pal=boxes.map(b=>{let n=b.reduce((s,p)=>s+p.count,0);return [0,1,2].map(k=>Math.round(b.reduce((s,p)=>s+p.rgb[k]*p.count,0)/n))});
const nearest=rgb=>{let best=0,dist=Infinity;for(let k=0;k<pal.length;k++){let d=pal[k].reduce((s,c,j)=>s+(c-rgb[j])**2,0);if(d<dist){dist=d;best=k}}return best};const cache=new Map();let pixels=Array(w*h);for(let p=0;p<w*h;p++){let i=p*4,key=(data[i]<<16)|(data[i+1]<<8)|data[i+2];if(!cache.has(key))cache.set(key,nearest([data[i],data[i+1],data[i+2]]));pixels[p]=cache.get(key)}
// Redraw the nose using discrete cells: remove the thin stroke, then place a small two-cell shadow.
const skin=nearest([249,196,161]),shade=nearest([210,138,108]);
for(let y=39;y<=44;y++)for(let x=63;x<=65;x++)pixels[y*w+x]=skin;
pixels[43*w+64]=shade;
const palette=pal.map(v=>'#'+v.map(n=>n.toString(16).padStart(2,'0')).join(''));
const project={version:1,width:w,height:h,palette,pixels,description:'参考画像を格子へ写した下絵。鼻はマス単位で修正。目と輪郭は未仕上げ。'};
const dir='prototype/reference-review/s10-pixel-grid/';await writeFile(dir+'step-face-grid-study-v3.json',JSON.stringify(project));
function crc(buf){let c=0xffffffff;for(let b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}function chunk(t,b){let ty=Buffer.from(t),o=Buffer.alloc(12+b.length);o.writeUInt32BE(b.length,0);ty.copy(o,4);b.copy(o,8);o.writeUInt32BE(crc(Buffer.concat([ty,b])),8+b.length);return o}
function png(scale){let W=w*scale,H=h*scale,rgba=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=pal[pixels[Math.floor(y/scale)*w+Math.floor(x/scale)]],i=y*(W*4+1)+1+x*4;rgba[i]=c[0];rgba[i+1]=c[1];rgba[i+2]=c[2];rgba[i+3]=255}let header=Buffer.alloc(13);header.writeUInt32BE(W,0);header.writeUInt32BE(H,4);header[8]=8;header[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rgba)),chunk('IEND',Buffer.alloc(0))])}
await writeFile(dir+'step-face-grid-study-v3.png',png(1));await writeFile(dir+'step-face-grid-study-v3-preview.png',png(6));console.log(`${w}×${h}, ${palette.length}色、鼻を格子単位で調整`);

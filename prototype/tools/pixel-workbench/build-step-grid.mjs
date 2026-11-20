import {readFile,writeFile} from 'node:fs/promises';import {deflateSync} from 'node:zlib';
const dir=process.argv[2],face=JSON.parse(await readFile('prototype/reference-review/s10-pixel-grid/step-face-grid-study-v3.json','utf8'));
if(face.width!==105||face.height!==70||face.palette.length!==96)throw Error('unexpected approved face grid');
const w=105,h=70,W=w*3,H=h*2,pal=face.palette.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))),cache=new Map(),frames=[];
function nearest(r,g,b){let key=(r<<16)|(g<<8)|b;if(cache.has(key))return cache.get(key);let best=0,dist=Infinity;for(let i=0;i<pal.length;i++){const c=pal[i],d=(c[0]-r)**2+(c[1]-g)**2+(c[2]-b)**2;if(d<dist){dist=d;best=i}}cache.set(key,best);return best}
for(let n=0;n<6;n++){if(n===4){frames.push([...face.pixels]);continue}let raw=await readFile(`${dir}/step-frame-${n}.rgba`);if(raw.length!==w*h*4)throw Error('bad frame');let pixels=new Array(w*h);for(let i=0;i<pixels.length;i++)pixels[i]=nearest(raw[i*4],raw[i*4+1],raw[i*4+2]);frames.push(pixels)}
const atlas=new Array(W*H);for(let n=0;n<6;n++)for(let y=0;y<h;y++)for(let x=0;x<w;x++)atlas[(Math.floor(n/3)*h+y)*W+(n%3)*w+x]=frames[n][y*w+x];
let rgba=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=pal[atlas[y*W+x]],i=y*(W*4+1)+1+x*4;rgba[i]=c[0];rgba[i+1]=c[1];rgba[i+2]=c[2];rgba[i+3]=255}
function crc(b){let c=0xffffffff;for(const n of b){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}function chunk(type,b){let t=Buffer.from(type),o=Buffer.alloc(12+b.length);o.writeUInt32BE(b.length);t.copy(o,4);b.copy(o,8);o.writeUInt32BE(crc(Buffer.concat([t,b])),8+b.length);return o}
const head=Buffer.alloc(13);head.writeUInt32BE(W);head.writeUInt32BE(H,4);head[8]=8;head[9]=6;let png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(rgba)),chunk('IEND',Buffer.alloc(0))]);
await writeFile('prototype/reference-review/s10-pixel-grid/step-grid-atlas-v1.png',png);
await writeFile('prototype/reference-review/s10-pixel-grid/step-grid-atlas-v1.json',JSON.stringify({version:1,width:W,height:H,columns:3,rows:2,cellWidth:w,cellHeight:h,palette:face.palette,pixels:atlas,source:'step-v2 cropped with nearest sampling; face uses approved study-v3 unchanged',note:'格子統一の検討候補。輪郭と5カットの手仕上げ未完了。'}));
console.log(`generated ${W}×${H}, 6 cells ${w}×${h}, ${pal.length} shared colors`);

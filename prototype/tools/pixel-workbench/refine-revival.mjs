import {readFile,writeFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const root='prototype/reference-review/s10-pixel-grid/', path=root+'revival-grid-atlas-v1.json';
const j=JSON.parse(await readFile(path,'utf8'));
// Replace the white nose streak in the two open-eyed frames with an existing skin shade.
for(const x0 of [53,158])for(let y=171;y<=173;y++)for(let x=x0;x<=x0+2;x++){
 const i=y*j.width+x;if(j.palette[j.pixels[i]]==='#fdfdfc')j.pixels[i]=j.palette.indexOf('#fdcab3');
}
j.source+='; bright nose streak in last two frames adjusted cell by cell';
const raw=Buffer.alloc((j.width*4+1)*j.height);
for(let y=0;y<j.height;y++)for(let x=0;x<j.width;x++){
 const color=j.palette[j.pixels[y*j.width+x]],i=y*(j.width*4+1)+1+x*4;
 for(let k=0;k<3;k++)raw[i+k]=parseInt(color.slice(1+k*2,3+k*2),16);raw[i+3]=255;
}
function crc(b){let c=0xffffffff;for(const n of b){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(type,b){const t=Buffer.from(type),o=Buffer.alloc(12+b.length);o.writeUInt32BE(b.length);t.copy(o,4);b.copy(o,8);o.writeUInt32BE(crc(Buffer.concat([t,b])),8+b.length);return o}
const h=Buffer.alloc(13);h.writeUInt32BE(j.width);h.writeUInt32BE(j.height,4);h[8]=8;h[9]=6;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
await writeFile(path,JSON.stringify(j));await writeFile(root+'revival-grid-atlas-v1.png',png);await writeFile('prototype/public/assets/lcd/rush-entry-v2/revival-grid-v1.png',png);

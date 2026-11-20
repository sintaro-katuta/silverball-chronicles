// Keep the current release portrait's pose while placing it on a single square grid.
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const input=fileURLToPath(new URL('../../public/assets/lcd/long-reach/hero-resolve-portrait-v1.png',import.meta.url));
const output=fileURLToPath(new URL('../../public/assets/lcd/long-reach/hero-resolve-portrait-grid-v1.png',import.meta.url));
const json=fileURLToPath(new URL('../../reference-review/s10-pixel-grid/resolve-portrait-grid-v1.json',import.meta.url));
const {data,info}=await sharp(input).resize(256,256,{kernel:'nearest'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let i=3;i<data.length;i+=4)data[i]=data[i]>=128?255:0;
const indexed=await sharp(data,{raw:info}).png({palette:true,colours:128,dither:0,effort:7}).toBuffer();
const decoded=await sharp(indexed).ensureAlpha().raw().toBuffer();
const palette=[],index=new Map(),pixels=[];
for(let i=0;i<decoded.length;i+=4){if(!decoded[i+3])decoded.fill(0,i,i+3);const color='#'+decoded.subarray(i,i+4).toString('hex');if(!index.has(color)){index.set(color,palette.length);palette.push(color);}pixels.push(index.get(color));}
await sharp(decoded,{raw:info}).png().toFile(output);
await mkdir(fileURLToPath(new URL('../../reference-review/s10-pixel-grid/',import.meta.url)),{recursive:true});
await writeFile(json,JSON.stringify({version:1,width:256,height:256,palette,pixels,source:'hero-resolve-portrait-v1.png',note:'Nearest sampling, binary alpha and indexed colors; not hand redrawn.'})+'\n');
console.log(`256×256; ${palette.length} RGBA colors; ${pixels.length} cells`);

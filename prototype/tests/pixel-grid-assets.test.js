import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

for(const family of ['step','memory','episode','pursuit','rescue','revival']){
 test(`${family} PNG preserves each editable grid cell`,async()=>{
  const json=JSON.parse(await readFile(new URL(`../reference-review/s10-pixel-grid/${family}-grid-atlas-v1.json`,import.meta.url),'utf8'));
  const asset=family==='revival'?'rush-entry-v2/revival-grid-v1.png':`story-prediction/${family}-${family==='step'?'grid-v3':'grid-v2'}.png`;
  const {data,info}=await sharp(fileURLToPath(new URL(`../public/assets/lcd/${asset}`,import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual([info.width,info.height],[json.width,json.height]);
  assert.equal(json.pixels.length,json.width*json.height);
  for(let i=0;i<json.pixels.length;i++){
   const color=json.palette[json.pixels[i]];
   assert.ok(color,`palette entry ${json.pixels[i]}`);
   for(let k=0;k<3;k++)assert.equal(data[i*4+k],parseInt(color.slice(1+2*k,3+2*k),16),`cell ${i}, channel ${k}`);
  }
 });
}

test('resolve portrait PNG preserves its editable RGBA grid',async()=>{
 const json=JSON.parse(await readFile(new URL('../reference-review/s10-pixel-grid/resolve-portrait-grid-v1.json',import.meta.url),'utf8'));
 const {data,info}=await sharp(fileURLToPath(new URL('../public/assets/lcd/long-reach/hero-resolve-portrait-grid-v1.png',import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.deepEqual([info.width,info.height],[256,256]);assert.equal(json.pixels.length,256*256);
 for(let i=0;i<json.pixels.length;i++){
  const color=json.palette[json.pixels[i]];assert.ok(color);
  for(let k=0;k<4;k++)assert.equal(data[i*4+k],parseInt(color.slice(1+2*k,3+2*k),16),`cell ${i}, channel ${k}`);
  assert.ok(data[i*4+3]===0||data[i*4+3]===255,`cell ${i} alpha`);
 }
});

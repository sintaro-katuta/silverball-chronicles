import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const path=name=>fileURLToPath(new URL(`../public/assets/lcd/${name}`,import.meta.url));

test('normal-screen foreground retains original pixels and reconstructs the source composition',async()=>{
 const original=await sharp(path('moon-castle-v1.png')).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const hero=await sharp(path('normal-hero-layer-v1.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const combined=await sharp(path('normal-background-layer-v1.png')).composite([{input:path('normal-hero-layer-v1.png')}]).removeAlpha().raw().toBuffer();
 assert.deepEqual([hero.info.width,hero.info.height],[original.info.width,original.info.height]);
 let opaque=0,transparent=0,changed=0;
 for(let p=0;p<original.info.width*original.info.height;p++){
  const a=hero.data[p*4+3];assert.ok(a===0||a===255,'mask alpha must be binary');
  if(a){opaque++;for(let k=0;k<3;k++)assert.equal(hero.data[p*4+k],original.data[p*3+k],'foreground RGB');}
  else transparent++;
  if([0,1,2].some(k=>combined[p*3+k]!==original.data[p*3+k]))changed++;
 }
 assert.ok(opaque>0&&transparent>0,'the foreground must really be separated');
 assert.ok(changed/(opaque+transparent)<.05,`repair changes ${(100*changed/(opaque+transparent)).toFixed(2)}% of the image`);
});

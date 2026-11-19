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

test('repaired blade removes only opaque fringe pixels and preserves the rest of the foreground',async()=>{
 const old=await sharp(path('normal-hero-layer-v1.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const repaired=await sharp(path('normal-hero-layer-v2.png')).ensureAlpha().raw().toBuffer();
 let removed=0;
 for(let p=0;p<old.info.width*old.info.height;p++){
  const i=p*4,x=p%old.info.width,y=Math.floor(p/old.info.width);
  for(let k=0;k<3;k++)assert.equal(repaired[i+k],old.data[i+k],'RGB must remain unchanged');
  if(repaired[i+3]!==old.data[i+3]){
   assert.equal(old.data[i+3],255);assert.equal(repaired[i+3],0);
   assert.ok(Math.max(...old.data.subarray(i,i+3))<190,'bright blade pixels must remain');
   assert.ok(x>=Math.floor(103*old.info.width/210)&&x<=Math.ceil(161*old.info.width/210)&&y>=Math.floor(112*old.info.height/140),'removal is limited to the blade fringe');removed++;
  }
 }
 assert.ok(removed>0,'the old background fringe must be removed');
});

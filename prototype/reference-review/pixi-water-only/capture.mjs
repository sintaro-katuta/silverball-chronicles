import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-water-only';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1080,height:1250}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5173/lcd-play.html');
 await page.waitForFunction(()=>!!window.__board);
 const result=await page.evaluate(async()=>{
  const image=new Image();image.src='/assets/lcd/moon-castle-v1.png';await image.decode();
  const {buildWaterFrames,isWaterPixel,waterFrameAt}=await import('/src/pixi/water-idle.js');
  const {base,frames}=buildWaterFrames({source:{resource:image}});
  const original=base.getContext('2d').getImageData(0,0,210,140).data;
  let fixedChanges=0,waterChanges=0,firstChanges=0;
  for(let n=0;n<frames.length;n++){
   const data=frames[n].getContext('2d').getImageData(0,0,210,140).data;
   for(let y=0;y<140;y++)for(let x=0;x<210;x++){
    const p=(y*210+x)*4,changed=[0,1,2,3].some(k=>data[p+k]!==original[p+k]);
    if(!changed)continue;
    if(!n)firstChanges++;
    if(isWaterPixel(x,y))waterChanges++;else fixedChanges++;
   }
  }
  return {fixedChanges,waterChanges,firstChanges,loop:waterFrameAt(6),images:[0,12,24,36].map(n=>frames[n].toDataURL().split(',')[1])};
 });
 assert.equal(result.fixedChanges,0);assert.equal(result.firstChanges,0);assert.ok(result.waterChanges>0);assert.equal(result.loop,0);
 for(let i=0;i<result.images.length;i++)await writeFile(`${dir}/background-${i}.png`,Buffer.from(result.images[i],'base64'));
 delete result.images;console.log(JSON.stringify(result));
 await page.locator('#demo').click();await page.locator('#lcd-detail').click();
 await page.evaluate(()=>{window.parts=[];window.rec=new MediaRecorder(document.querySelector('canvas').captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});rec.ondataavailable=e=>parts.push(e.data);rec.start();});
 for(let i=0;i<12;i++){await page.waitForTimeout(1000);if([0,2,5,8].includes(i))await page.locator('canvas').screenshot({path:`${dir}/frame-${i}.png`});}
 await page.locator('#pause').click();const before=await page.locator('canvas').screenshot();await page.waitForTimeout(300);assert.ok(before.equals(await page.locator('canvas').screenshot()));
 assert.deepEqual(errors,[]);
 const data=await page.evaluate(()=>new Promise(resolve=>{rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};rec.stop();}));
 await writeFile(`${dir}/idle.webm`,Buffer.from(data,'base64'));console.log('12s runtime capture, pause and page errors verified');
}finally{await browser.close();}

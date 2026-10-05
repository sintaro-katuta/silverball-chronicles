import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir=process.env.STORY_EVIDENCE??'reference-review/story-presentations-2026-10-05/representative';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:390,height:740},recordVideo:{dir:dir+'/raw',size:{width:390,height:740}}});
const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.STORY_URL??'http://127.0.0.1:5203/story-predictions.html');await page.waitForFunction(()=>!!window.__storyPredictions);
 const available=await page.evaluate(()=>__storyPredictions.available);
 for(const family of available){
  for(const window of [6,5,2,1.43]){
   await page.evaluate(v=>__storyPredictions.set(v),{family,window,time:0,upper:false,reduced:false});
   const seen=new Set();for(let t=.15;t<window;t+=.2){const p=await page.evaluate(t=>__storyPredictions.seek(t),t);if(!seen.has(p.frame)){seen.add(p.frame);await page.screenshot({path:`${dir}/${family}-${window}-${p.frame}.png`});}}
   assert.equal(seen.size,window===6?6:window===5?5:window===2?3:2);
   checks.push({family,window,frames:[...seen]});
   await page.evaluate(t=>__storyPredictions.seek(t),window);assert.equal((await page.evaluate(()=>__storyPredictions.pose())).finished,true);
  }
  await page.evaluate(v=>__storyPredictions.set(v),{family,window:5,time:3.1,upper:true,reduced:true});const before=await page.evaluate(()=>__storyPredictions.pose());await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>__storyPredictions.pose()),before);await page.screenshot({path:`${dir}/${family}-upper-reduced.png`});
 }
 const fallback=await page.evaluate(()=>__storyPredictions.probe({family:'rescue',duration:.48,time:.2}));assert.equal(fallback.supported,false);
 const missing=await page.evaluate(()=>__storyPredictions.probe({family:'missing',duration:2,time:.2}));assert.equal(missing.supported,false);
 // A clean authored-speed playback section for the exported review film.
 const playbackStart=Date.now();
 for(const family of available)for(const window of [5,2]){await page.evaluate(v=>__storyPredictions.set(v),{family,window,time:.01,upper:false,reduced:false});await page.evaluate(()=>__storyPredictions.play(true));await page.waitForFunction(t=>+document.querySelector('#time').value>=t-.12,window);await page.evaluate(()=>__storyPredictions.play(false));await page.waitForTimeout(150);}
 const playbackSeconds=(Date.now()-playbackStart)/1000;
 assert.deepEqual(errors,[]);
 const rect=await page.locator('canvas').boundingBox();await writeFile(dir+'/browser-check.json',JSON.stringify({available,checks,errors,rect,playbackSeconds},null,2));
 await page.evaluate(()=>{__storyPredictions.destroy();__storyPredictions.destroy();});assert.equal(await page.evaluate(()=>__storyPredictions.sourcesAlive()),true);
}finally{const video=page.video();await context.close();await writeFile(dir+'/video-path.txt',await video.path());await browser.close();}

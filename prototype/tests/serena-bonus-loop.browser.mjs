import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,copyFile} from 'node:fs/promises';
const base=process.env.SERENA_BASE??'http://127.0.0.1:5198';
const output=process.env.SERENA_OUTPUT??'/private/tmp/serena-bonus-loop';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:960},recordVideo:{dir:output,size:{width:1280,height:960}}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`${base}/?review=session`);await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();await page.locator('[data-view=lcd]').click();
 await page.evaluate(()=>{const b=__sessionReview.board(),g=__sessionReview.game();b.feed(false);g.w.rng=()=>0;g.reviewPresentationRoute='direct';g.w.enqueue('tokuzu1',987654);});
 await page.waitForFunction(()=>{const v=document.querySelector('video[data-serena-scene-video="bonus"]');return v&&!v.paused&&v.readyState>=2&&v.duration>12;},null,{timeout:45000});
 let last=null,wraps=0;const samples=[];
 for(let i=0;i<28;i++){
  await page.waitForTimeout(1000);
  const sample=await page.evaluate(()=>{const v=document.querySelector('video[data-serena-scene-video="bonus"]');return {clip:__sessionReview.board().snapshot().videoClip,current:v?.currentTime,duration:v?.duration,paused:v?.paused,game:__sessionReview.game().time};});
  assert.equal(sample.clip,'bonus');assert.ok(sample.duration>12&&sample.duration<13);assert.equal(sample.paused,false);
  if(last!==null&&sample.current<last-8)wraps++;last=sample.current;samples.push(sample);
  if(i===4){await page.evaluate(()=>__sessionReview.board().pause(true));const paused=await page.evaluate(()=>({game:__sessionReview.game().time,video:document.querySelector('video[data-serena-scene-video="bonus"]').currentTime}));await page.waitForTimeout(500);const held=await page.evaluate(()=>({game:__sessionReview.game().time,video:document.querySelector('video[data-serena-scene-video="bonus"]').currentTime}));assert.ok(Math.abs(held.game-paused.game)<.15&&Math.abs(held.video-paused.video)<.15);await page.evaluate(()=>__sessionReview.board().pause(false));}
  if(i===3||i===9||i===16||i===23)await page.screenshot({path:`${output}/bonus-${i+1}s.png`});
 }
 assert.ok(wraps>=2,`expected at least two continuous loops, observed ${wraps}`);assert.deepEqual(errors,[]);
 const video=page.video();await page.close();await context.close();const path=await video.path();await copyFile(path,`${output}/bonus-playthrough.webm`);
 console.log(`bonus ${samples[0].duration.toFixed(3)}s; ${wraps} loop boundaries, pause/resume, no page errors`);
}finally{await browser.close();}

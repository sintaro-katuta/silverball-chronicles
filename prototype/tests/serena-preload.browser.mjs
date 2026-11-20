import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {basename,join} from 'node:path';
import assert from 'node:assert/strict';
// Reproduce an asset host returning a complete 200 response to a range request.
// This exposed duplicate-load cancellations which the release smoke treats as failures.
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(let iteration=0;iteration<4;iteration++){
  const page=await browser.newPage({viewport:{width:390,height:844}}),failures=[];
  page.on('requestfailed',r=>{if(r.resourceType()==='media')failures.push(`${r.url()}: ${r.failure()?.errorText}`);});
  await page.route('**/*.mp4*',async route=>{const url=new URL(route.request().url());if(url.searchParams.has('import'))return route.continue();try{if(iteration===3&&basename(url.pathname)==='serena-battle.mp4')await new Promise(resolve=>setTimeout(resolve,3000));await route.fulfill({status:200,contentType:'video/mp4',body:await readFile(join(process.cwd(),'src/assets/video',basename(url.pathname)))});}catch(error){if(!/closed|aborted|disposed/i.test(String(error)))throw error;}});
  await page.goto(`${process.env.SERENA_BASE??'http://127.0.0.1:5196'}/?review=session`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.waitForFunction(()=>{const idle=document.querySelector('video[data-serena-scene-video="idle"]'),victory=document.querySelector('video[data-serena-victory-video]');return idle?.readyState>=3&&!idle.paused&&victory?.readyState>=3&&!victory.error;},null,{timeout:20000});
  if(iteration===3){
   await page.evaluate(()=>{const b=__sessionReview.board(),g=__sessionReview.game();b.feed(false);b.pause(true);g.presentation={basicReach:true,longReach:true,time:6,win:false,reachEnding:'standard',reachVariant:'pressure',presentationMode:'normal',displayRoute:'battle',drawId:1};g.jackpot=null;g.spinActive=false;delete g.previewWinAt;delete g.entryPrelude;g.rush=null;b.pause(false);});
   await page.waitForFunction(()=>{const v=document.querySelector('video[data-serena-scene-video="battle"]');return v?.readyState>=2&&!v.paused&&__sessionReview.board().snapshot().videoClip==='battle';},null,{timeout:15000});
  }
  await page.waitForTimeout(1000);assert.deepEqual(failures,[]);await page.close();
 }
 console.log('media preloading: four starts including delayed transition, no aborted requests; idle, battle and victory playable');
}finally{await browser.close();}

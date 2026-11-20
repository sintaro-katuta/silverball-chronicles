import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import sharp from 'sharp';

const base=process.env.SERENA_BASE??'http://127.0.0.1:5196';
const output=process.env.SERENA_OUTPUT??'/private/tmp/serena-scenes-browser';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const [name,viewport] of [['desktop',{width:1280,height:960}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));
  await page.goto(`${base}/?review=session`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.locator('[data-view=lcd]').click();
  await page.evaluate(()=>__sessionReview.board().feed(false));
  const waitClip=async clip=>{
   await page.waitForFunction(expected=>{
    const v=document.querySelector('video[data-serena-scene-video]');
    return __sessionReview.board().snapshot().videoClip===expected&&v?.dataset.serenaSceneVideo===expected&&!v.paused&&v.readyState>=2;
   },clip,{timeout:30000});
  };
  // Check actual rendered pixels at the top and bottom of the 16:9 screen,
  // not merely that the HTML video element is playing.
  const assertVideoPixels=async clip=>{
   if(name!=='desktop')return;
   await page.waitForTimeout(250);
   const shot=await page.screenshot(),{data,info}=await sharp(shot).removeAlpha().raw().toBuffer({resolveWithObject:true});
   const pixel=(x,y)=>{const i=(y*info.width+x)*3;return [data[i],data[i+1],data[i+2]];};
   let top=0,bottom=0;for(let x=310;x<950;x+=4){for(let y=165;y<200;y+=4){const [r,g,b]=pixel(x,y);if(Math.max(r,g,b)>35)top++;}for(let y=480;y<520;y+=4){const [r,g,b]=pixel(x,y);if(Math.max(r,g,b)>35)bottom++;}}
   assert.ok(top>50&&bottom>50,`${clip}: top or bottom of 16:9 video screen was blank (${top}, ${bottom})`);
   let colored=0;for(let y=205;y<480;y+=3)for(let x=310;x<380;x+=3){const [r,g,b]=pixel(x,y);if(Math.max(r,g,b)>38)colored++;}
   assert.ok(colored>150,`${clip}: video element played but rendered area was blank (${colored} pixels)`);
  };
  await waitClip('idle');await assertVideoPixels('idle');await page.screenshot({path:`${output}/${name}-idle.png`});
  const before=await page.evaluate(()=>{const v=document.querySelector('video[data-serena-scene-video]');return {time:v.currentTime,game:__sessionReview.game().time};});
  await page.evaluate(()=>__sessionReview.board().pause(true));
  await page.waitForTimeout(500);
  const held=await page.evaluate(()=>{const v=document.querySelector('video[data-serena-scene-video]');return {time:v.currentTime,paused:v.paused,game:__sessionReview.game().time};});
  assert.equal(held.paused,true);assert.ok(Math.abs(held.time-before.time)<.35);assert.ok(Math.abs(held.game-before.game)<.35);
  await page.evaluate(()=>__sessionReview.board().pause(false));await waitClip('idle');

  async function reach(time,win,ending='standard'){
   await page.evaluate(({time,win,ending})=>{
    const b=__sessionReview.board(),g=__sessionReview.game();b.pause(true);
    g.presentation={basicReach:true,longReach:true,time,win,reachEnding:ending,reachVariant:'pressure',presentationMode:'normal',displayRoute:'battle',drawId:1};
    g.jackpot=null;g.spinActive=false;delete g.previewWinAt;delete g.entryPrelude;g.rush=null;b.pause(false);
   },{time,win,ending});
  }
  await reach(6,false);await waitClip('battle');await assertVideoPixels('battle');
  const battleShot=await page.screenshot({path:`${output}/${name}-battle.png`});
  await reach(48,true);await page.evaluate(()=>{__sessionReview.game().presentation.predictionPlan={resultFamily:'fullrotation',chanceUps:[],mode:'normal'};});
  await waitClip('battle');await assertVideoPixels('full-rotation');await page.screenshot({path:`${output}/${name}-full-rotation.png`});
  await reach(51.8,false);await waitClip('defeat');
  const defeatTime=await page.evaluate(()=>document.querySelector('video[data-serena-scene-video]').currentTime);
  assert.ok(defeatTime>2.3,'defeat video should reach the visible loss during the decision window');
  await page.screenshot({path:`${output}/${name}-defeat.png`});
  await reach(54.1,true,'revival');await waitClip('revival');
  await page.screenshot({path:`${output}/${name}-revival.png`});
  await page.evaluate(()=>{
   const b=__sessionReview.board(),g=__sessionReview.game();b.pause(true);g.presentation=null;g.jackpot=null;
   g.entryPrelude={variant:'castle',startedAt:g.time-.2,payout:1200};delete g.previewWinAt;g.rush=null;b.pause(false);
  });
  await waitClip('rush-entry');await assertVideoPixels('rush-entry');await page.screenshot({path:`${output}/${name}-rush-entry.png`});
  await page.evaluate(()=>{
   const b=__sessionReview.board(),g=__sessionReview.game();b.pause(true);g.presentation=null;g.jackpot=null;
   g.rush={remaining:50,total:0,chain:0};delete g.previewWinAt;delete g.entryPrelude;b.pause(false);
  });
  await waitClip('rush-loop');await page.screenshot({path:`${output}/${name}-rush.png`});
  await page.evaluate(()=>{
   const b=__sessionReview.board(),g=__sessionReview.game();b.pause(true);g.rush=null;g.lastRush={endedAt:g.time,total:1200};b.pause(false);
  });
  await waitClip('rush-end');
  await page.waitForFunction(()=>{const g=__sessionReview.game();return g.lastRush&&g.time-g.lastRush.endedAt>1.2;});
  await page.screenshot({path:`${output}/${name}-rush-end.png`});
  await page.close();
  console.log(`${name}: idle, pause, battle, defeat, revival, RUSH and RUSH end passed`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}

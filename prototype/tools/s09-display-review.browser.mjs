import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const phase=process.argv[2]??'after',out=process.env.REVIEW_OUTPUT??`reference-review/s09-040-20261020/${phase}`,base=process.env.REVIEW_URL??'http://127.0.0.1:5469';
await mkdir(out,{recursive:true});
const sources=['src/domain/reels.js','src/pixi/review-reel-state.js','src/pixi/normal-spin-view.js','src/pixi/long-reach-view.js'];
const hash=async()=>Object.fromEntries(await Promise.all(sources.map(async f=>[f,createHash('sha256').update(await readFile(f)).digest('hex')])));
const before=await hash(),browser=await chromium.launch({channel:'chrome',headless:true}),runs=[],errors=[];
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:1,recordVideo:{dir:out+'/video',size:{width,height:width===390?844:900}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?review=session&scenario=predictions');
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});
  if(await page.locator('#intro-skip').isVisible())await page.locator('#intro-skip').click();
  await page.evaluate(()=>{const b=__sessionReview.board();b.feed(false);b.pause(true);b.setView('lcd');});
  const reels=[];
  for(const mode of ['normal','rush'])for(const reach of [false,true])for(const stop of [0,1,2]){
   const state=await page.evaluate(async({mode,reach,stop})=>{
    const {reviewReelState}=await import('/src/pixi/review-reel-state.js');const g=__sessionReview.game();
    g.presentation=null;g.jackpot=null;delete g.previewWinAt;delete g.entryPrelude;
    g.rush=mode==='rush'?{remaining:100,consumed:0}:null;g.drawMode=mode;
    g.spinActive=true;g.previewCenterPending=reach;g.spinResult={drawId:440,mode,reach,win:false,reels:reach?[3,3,4]:[2,4,6]};
    g.drawTimer=g.drawTempo+stop*g.reelStopGap+.001;g.time=10+g.drawTimer;
    __sessionReview.board().setView('lcd');return {mode,reach,stop,state:reviewReelState(g),tempo:g.drawTempo,gap:g.reelStopGap};
   },{mode,reach,stop});reels.push(state);
   await page.screenshot({path:`${out}/${width}-${mode}-${reach?'reach':'ordinary'}-stop${stop+1}.png`});
  }
  for(const t of [38.9,39.15,41,42.9,43.15,44.5,45.9,46.2]){
   await page.evaluate(t=>{const g=__sessionReview.game();g.spinActive=false;g.reelOutcome=[3,3,4];g.presentation={id:441,drawId:441,time:t,basicReach:true,longReach:true,displayRoute:'battle',presentationMode:'normal',reachVariant:'pressure',reachEnding:'standard',win:false,predictionPlan:null};g.rush=null;__sessionReview.board().setView('lcd');},t);
   await page.screenshot({path:`${out}/${width}-pressure-${t}.png`});
  }
  // The same representative face interval plays without seeking or time scaling.
  await page.evaluate(()=>{const g=__sessionReview.game();g.presentation.time=38.8;__sessionReview.board().pause(false);});
  await page.waitForFunction(()=>__sessionReview.game().presentation?.time>=46.25,null,{timeout:20000});
  await page.evaluate(()=>__sessionReview.board().pause(true));
  const paused=await page.evaluate(()=>__sessionReview.game().presentation.time);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.time),paused);
  const video=page.video();await context.close();runs.push({width,reels,faceRange:[38.8,46.25],pauseFrozen:true,video:await video.path()});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(await hash(),before);
 await writeFile(out+'/verification.json',JSON.stringify({phase,sources:before,scope:'Real rendered UI with controlled display fixtures; not natural odds or user art acceptance. Face interval plays continuously after static samples.',runs,errors},null,2));
 console.log(JSON.stringify({phase,runs:runs.length,errors,out}));
}finally{await browser.close();}

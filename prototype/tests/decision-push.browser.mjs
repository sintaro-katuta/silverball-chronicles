import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=process.env.PUSH_REVIEW_DIR??'reference-review/decision-push-2026-10-06';await mkdir(dir+'/raw',{recursive:true});
const fixtures=[
 {name:'normal-win-full',mode:'normal',win:true,press:true,full:true},
 {name:'normal-loss-keyboard',mode:'normal',win:false,press:true,keyboard:true},
 {name:'rush-win-timeout',mode:'rush',win:true,press:false},
 {name:'rush-loss-views',mode:'rush',win:false,press:true,views:true},
 {name:'normal-revival',mode:'normal',win:true,press:true,ending:'revival'},
 {name:'normal-win-reduced',mode:'normal',win:true,press:true,reduced:true},
 {name:'normal-win-tap',mode:'normal',win:true,press:true},
].filter(f=>process.env.PUSH_CASES?process.env.PUSH_CASES.split(',').includes(f.name):f.name!=='normal-win-tap');
const sources=['src/pixi/decision-push.js','src/pixi/decision-push-overlay.js','src/pixi/decision-push.css','src/pixi/reach-finale-view.js','src/pixi/normal-spin-flow.js','src/pixi/normal-spin-view.js','src/pixi/board-runtime.js','src/pixi/cabinet-light-motion.js'];
async function hashes(){const out={};for(const p of sources)out[p]=createHash('sha256').update(await readFile(p)).digest('hex');return out;}
const startHashes=await hashes(),browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 for(const [i,f] of fixtures.entries()){
  const viewport={width:i%2?320:390,height:i%2?740:844},ctx=await browser.newContext({viewport,isMobile:true,hasTouch:true,recordVideo:{dir:dir+'/raw',size:viewport}}),page=await ctx.newPage();
  page.on('pageerror',e=>errors.push({case:f.name,message:e.message}));
  await page.goto(`${process.env.QUALITY_BASE??'http://127.0.0.1:5188'}/?review=session&scenario=predictions`);
  await page.locator('[data-kind=main]').first().tap();await page.locator('#playMachine').tap();await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});
  if(await page.locator('#intro-skip').isVisible())await page.locator('#intro-skip').tap();
  await page.locator('#controls-toggle').tap();await page.locator('#feed-toggle').tap();await page.locator('#controls-toggle').tap();await page.locator('[data-view=lcd]').tap();
  const record=await page.evaluate(f=>{const g=__sessionReview.game(),m=__sessionReview.model();if(f.mode==='rush'){g.startRush();m.setMode('rush');}g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';g.reviewReachEnding=f.ending;g.reducedEffects=!!f.reduced;g.w.rng=()=>f.win?0:.9;g.hit({id:990101},f.mode==='rush'?'fuzu':'start');for(let n=0;n<200&&!g.spinResult;n++)m.flow.step(.01);return {...g.wRecord};},f);
  await page.waitForFunction(()=>!!__sessionReview.game().presentation,null,{timeout:20000});
  if(!f.full)await page.evaluate(()=>__sessionReview.game().presentation.time=43);
  const began=Date.now(),button=page.locator('.decision-push-button');await button.waitFor({state:'visible',timeout:60000});
  assert.match(await button.innerText(),/押せ/);assert.equal(await page.evaluate(()=>__session.snapshot().cabinet.rainbow),false);
  await page.screenshot({path:dir+'/'+f.name+'-prompt.png'});
  if(f.full){
   await page.locator('#controls-toggle').tap();await page.locator('#menu').tap();
   await page.waitForFunction(()=>document.querySelector('.decision-push-button').disabled);
   const before=await page.evaluate(()=>__sessionReview.game().presentation.time);assert.equal(await button.isDisabled(),true);
   await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.time),before);
   await page.locator('#resume').tap();await page.locator('#controls-toggle').tap();
  }
  if(f.views)for(const view of ['whole','board','lcd']){
   await page.locator(`[data-view=${view}]`).tap();await page.screenshot({path:dir+'/'+f.name+'-'+view+'.png'});
   const box=await button.boundingBox();assert.ok(box.width>=64&&box.height>=44);assert.ok(box.x>=0&&box.x+box.width<=viewport.width+1);
  }
  let pressedAt=null;
  if(f.press&&process.env.PUSH_RECORD_DWELL)await page.waitForTimeout(Number(process.env.PUSH_RECORD_DWELL));
  if(f.press){pressedAt=await page.evaluate(()=>({scene:__sessionReview.game().presentation.time,game:__sessionReview.game().time,total:__sessionReview.game().total}));if(f.keyboard){await button.focus();await button.press('Space');}else await button.tap();
   await page.waitForFunction(()=>!!__sessionReview.game().presentation?.pushInput);
  }
  await button.waitFor({state:'hidden',timeout:5000});
  await page.waitForFunction(()=>__sessionReview.game().presentation?.time>=51.72,null,{timeout:5000});
  const first=await page.evaluate(()=>{const g=__sessionReview.game();return {time:g.presentation.time,pressed:!!g.presentation.pushInput,win:g.presentation.win,cabinet:__session.snapshot().cabinet};});
  assert.equal(first.pressed,f.press);assert.equal(first.win,f.win);assert.equal(first.cabinet.rainbow,f.win&&f.ending!=='revival');
  await page.screenshot({path:dir+'/'+f.name+'-reveal.png'});await page.waitForTimeout(250);
  if(f.ending==='revival'){
   await page.waitForFunction(()=>__sessionReview.game().presentation?.time>=55.75,null,{timeout:6000});
   assert.equal(await page.evaluate(()=>__session.snapshot().cabinet.rainbow),true);await page.screenshot({path:dir+'/'+f.name+'-revive.png'});
  }
  await page.waitForFunction(()=>!__sessionReview.game().presentation,null,{timeout:9000});
  await page.waitForTimeout(750);await page.screenshot({path:dir+'/'+f.name+'-result.png'});
  const final=await page.evaluate(()=>{const g=__sessionReview.game();return {lastDraw:g.lastDraw,roll:g.wRecord?.roll,total:g.total,accounting:g.accounting};});
  assert.equal(final.lastDraw,f.win);assert.equal(final.accounting.reconciled,true);
  const video=page.video();await ctx.close();runs.push({fixture:f,record,pressedAt,first,final,wallSeconds:(Date.now()-began)/1000,video:await video.path()});
  await writeFile(dir+'/browser-check.json',JSON.stringify({sources:startHashes,finalSources:await hashes(),runs,errors,scope:'Production native touch/keyboard button and actual result flow. First normal win is full-time; other cases seek to 43 seconds, then play new prompt/reveal continuously. Mobile viewport emulation, fixed admitted outcomes, not natural reliability statistics.'},null,2));console.log(f.name+' passed');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(startHashes,await hashes());
}finally{await browser.close();}

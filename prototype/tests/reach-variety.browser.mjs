import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='reference-review/reach-variety-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5184/?review=session&scenario=development-loss');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
 const recordingStarted=Date.now();
 for(let n=0;n<3;n++){
  const variant=await page.evaluate(()=>{
   const g=__sessionReview.game(),m=__sessionReview.model(),p=m.flow.physics.pockets.find(p=>p.kind==='start');
   const shot=g.fire(),b=m.flow.physics.spawn(shot,0);Object.assign(b,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});
   for(let i=0;i<1500&&!g.presentation;i++)m.flow.step(.05);
   if(!g.presentation)throw new Error('No reach');g.presentation.time=5;
   return g.presentation.reachVariant;
  });
  const from=(Date.now()-recordingStarted)/1000;await page.waitForTimeout(6500);
  await page.screenshot({path:`${dir}/${variant}-battle.png`});
  await page.evaluate(()=>{__sessionReview.game().presentation.time=40;});await page.waitForTimeout(250);
  await page.screenshot({path:`${dir}/${variant}-portrait.png`});
  const snap=await page.evaluate(()=>__session.snapshot());assert.equal(snap.spin.reach.variant,variant);assert.equal(snap.view,'lcd');
  await page.evaluate(()=>{const g=__sessionReview.game(),m=__sessionReview.model();g.presentation.time=53.99;m.flow.step(.05);});
  assert.equal(await page.evaluate(()=>__sessionReview.game().lastDraw),false);
  runs.push({variant,from,to:from+6.5});
 }
 assert.equal(new Set(runs.map(r=>r.variant)).size,3);assert.deepEqual(errors,[]);
 const final=await page.evaluate(()=>__session.snapshot());assert.equal(final.session.accounting.reconciled,true);
 const video=page.video();await context.close();await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,video:await video.path(),final,fixture:'three fixed losing reaches; paid balls placed over inlet; clock seeks before/after reviewed excerpts, displayed action runs at real speed'},null,2));
}finally{await browser.close();}

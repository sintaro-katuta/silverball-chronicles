import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='reference-review/presentation-patterns-2026-10-05';
await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[],errors=[];
try{
 for(const scenario of ['development-loss','entry']){
  const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://localhost:5184/?review=session&scenario=${scenario}`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
  await page.evaluate(scenario=>{
   const g=__sessionReview.game(),m=__sessionReview.model();
   if(scenario==='entry')g.w.rng=()=>0;
   const shot=g.fire(),ball=m.flow.physics.spawn(shot,0),pocket=m.flow.physics.pockets.find(p=>p.kind==='start');
   Object.assign(ball,{x:pocket.x,y:pocket.y-4,vx:0,vy:40,leftLaunchPlane:true});
   for(let i=0;i<500&&!g.presentation;i++)m.flow.step(.05);
   if(!g.presentation)throw new Error('No presentation');
   if(scenario==='entry'){
    g.presentation.time=53.99;m.flow.step(.05);
    // Empty physical rounds time out normally: no payout is invented.
    for(let i=0;i<25000&&!g.entryPrelude;i++)m.flow.step(.05);
    if(!g.entryPrelude)throw new Error('No RUSH prelude '+JSON.stringify({time:g.time,bonus:g.jackpot,last:g.lastBonus,rush:g.rush,p:g.presentation}));
   }else g.presentation.time=16;
  },scenario);
  const start=Date.now(),checks=[];
  while(Date.now()-start<(scenario==='entry'?8500:10000)){
   checks.push(await page.evaluate(()=>({p:__sessionReview.game().presentation?.time,s:__session.snapshot()})));
   await page.waitForTimeout(150);
  }
  if(scenario==='entry'){
   assert.ok(checks.some(c=>c.s.direction?.direction==='right'&&c.s.direction.visible),'right cutin visible after real lifecycle entry');
   assert.equal(await page.locator('#session-state').textContent(),'RUSH');
  }else{
   assert.ok(checks.some(c=>c.s.cabinet.sword.phase==='spin'));
   assert.ok(checks.every(c=>c.s.view==='lcd'));assert.ok(checks.at(-1).p>24);
  }
  assert.equal(checks.at(-1).s.session.accounting.reconciled,true);
  await page.screenshot({path:`${dir}/${scenario}.png`});
  const video=page.video();await context.close();results.push({scenario,checks,video:await video.path(),fixture:'fixed outcome; one paid inlet admission; seek before reviewed scene; entry rounds time out without payout'});
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/browser-check.json',JSON.stringify({results,errors},null,2));
}finally{await browser.close();}

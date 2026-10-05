import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='reference-review/reach-revision-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],runs=[];
try{
 for(const scenario of ['development-loss','rush']){
  const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log(e.message);});
  await page.goto(`http://localhost:5184/?review=session&scenario=${scenario}`);await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
  await page.evaluate(kind=>{const g=__sessionReview.game(),m=__sessionReview.model(),p=m.flow.physics.pockets.find(p=>p.kind===kind),shot=g.fire(),b=m.flow.physics.spawn(shot,0);Object.assign(b,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});},scenario==='rush'?'fuzu':'start');
  await page.waitForFunction(()=>!!__sessionReview.game().presentation,{timeout:20000});const start=Date.now();const intro=await page.evaluate(()=>({...__sessionReview.game().presentation}));assert.equal(intro.longReach,true);
  let paused=false;const shots=new Set(),checks=[];
  while(Date.now()-start<70000){
   const snap=await page.evaluate(()=>{const g=__sessionReview.game();return {p:g.presentation?{time:g.presentation.time,win:g.presentation.win}:null,s:__session.snapshot(),result:g.lastDraw};});
   if(!snap.p){checks.push({ended:true,result:snap.result,s:snap.s});break;}
   const t=snap.p.time;
   for(const marker of [3,6,11,15,18,21,25,28,31,34,37,41,44,48,50,52])if(t>=marker&&!shots.has(marker)){shots.add(marker);await page.screenshot({path:`${dir}/${scenario}-mobile-${marker}.png`});console.log(scenario,marker);checks.push({t,marker,view:snap.s.view,sword:snap.s.cabinet.sword,moon:snap.s.cabinet.moon});}
   if(t>=20&&!paused){paused=true;await page.locator('#controls-toggle').click();await page.locator('#menu').click();const time=await page.evaluate(()=>__sessionReview.game().presentation.time);await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.time),time);await page.locator('#resume').click();await page.locator('#controls-toggle').click();}
   await page.waitForTimeout(250);
  }
  assert.ok(checks.at(-1).ended);assert.equal(checks.at(-1).result,scenario==='rush');assert.equal(checks.at(-1).s.view,'lcd');assert.equal(checks.at(-1).s.session.accounting.reconciled,true);
  const middle=checks.find(c=>c.marker===21);assert.equal(middle.sword.phase,'spin');for(const marker of [3,6,11,15,18,25,28,31,34,37,41,44,48,50,52])assert.equal(checks.find(c=>c.marker===marker).sword.angle,0);
  await page.locator('#controls-toggle').click();assert.doesNotMatch(await page.locator('main').innerText(),/電チュー|普図|特図|ヘソ|V入賞|アタッカー/);await page.locator('#effects-reduced').check();assert.equal(await page.evaluate(()=>__sessionReview.game().reducedEffects),true);await page.locator('#effects-reduced').uncheck();await page.locator('#controls-toggle').click();await page.waitForTimeout(1000);await page.screenshot({path:`${dir}/${scenario}-mobile-result.png`});const video=page.video();await context.close();runs.push({scenario,checks,wallSeconds:(Date.now()-start)/1000,video:await video.path(),fixture:'result fixed; one paid ball placed over the proper inlet; automatic firing stopped'});await writeFile(dir+'/session-check.json',JSON.stringify({runs,errors},null,2));
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}

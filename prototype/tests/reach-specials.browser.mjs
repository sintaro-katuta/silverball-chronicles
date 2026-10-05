import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='reference-review/reach-specials-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 for(const ending of ['revival','flash']){
  const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://localhost:5184/?review=session&scenario=${ending==='flash'?'rush':'development-win'}`);await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
  await page.evaluate(ending=>{
   const g=__sessionReview.game(),m=__sessionReview.model();g.reviewReachEnding=ending;g.w.rng=()=>0;
   for(let i=0;i<120;i++)m.flow.step(.05);
   const shot=g.fire(),b=m.flow.physics.spawn(shot,0),p=m.flow.physics.pockets.find(p=>p.kind===(ending==='flash'?'fuzu':'start'));
   Object.assign(b,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});
   for(let i=0;i<1200&&!g.presentation;i++)m.flow.step(.05);
   if(!g.presentation)throw new Error('No presentation');if(g.presentation.reachEnding!==ending)throw new Error('Wrong ending');
   g.presentation.time=ending==='revival'?50.8:0;
  },ending);
  const start=Date.now(),checks=[],markers=new Set();let paused=false;
  while(Date.now()-start<18000){
   const c=await page.evaluate(()=>({p:__sessionReview.game().presentation?{...__sessionReview.game().presentation}:null,s:__session.snapshot(),preview:__sessionReview.game().previewWinAt,last:__sessionReview.game().lastDraw}));checks.push(c);
   if(!c.p)break;
   const t=c.p.time;
   for(const marker of ending==='revival'?[52,53.5,54.4,55.25,56]:[3,5,8.4,10])if(t>=marker&&!markers.has(marker)){markers.add(marker);await page.screenshot({path:`${dir}/${ending}-${marker}.png`});}
   if(ending==='revival'&&t>=53.4&&!paused){paused=true;await page.locator('#controls-toggle').click();await page.locator('#menu').click();const time=await page.evaluate(()=>__sessionReview.game().presentation.time);await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.time),time);await page.locator('#resume').click();await page.locator('#controls-toggle').click();}
   await page.waitForTimeout(100);
  }
  assert.equal(checks.at(-1).p,null);assert.equal(checks.at(-1).last,true);assert.ok(checks.every(c=>c.s.view==='lcd'));assert.equal(checks.at(-1).s.session.accounting.reconciled,true);
  assert.ok(checks.filter(c=>c.p).every(c=>c.preview===undefined));
  if(ending==='flash')assert.equal(checks.at(-1).s.w.electricOpen,true);
  else assert.equal(checks.at(-1).s.session.jackpots,1);
  await page.waitForTimeout(700);await page.screenshot({path:`${dir}/${ending}-result.png`});const video=page.video();await context.close();runs.push({ending,checks,wallSeconds:(Date.now()-start)/1000,video:await video.path(),fixture:'winning outcome and ending fixed; one paid ball over inlet; revival sought to 50.8s, flash plays its full reach; no payout granted without physical admission'});
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors},null,2));
}finally{await browser.close();}

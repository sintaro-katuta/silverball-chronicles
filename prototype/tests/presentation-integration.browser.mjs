import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='reference-review/pattern-integration-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
const cases=[
 {name:'normal-basic-loss',mode:'normal',route:'basic',win:false},
 {name:'normal-basic-win',mode:'normal',route:'basic',win:true},
 {name:'normal-direct',mode:'normal',route:'direct',win:true},
 {name:'rush-basic-loss',mode:'rush',route:'basic',win:false},
 {name:'rush-basic-win',mode:'rush',route:'basic',win:true},
 {name:'rush-direct',mode:'rush',route:'direct',win:true},
 {name:'normal-defeat',mode:'normal',route:'battle',win:false,seek:50.7},
 {name:'normal-revival',mode:'normal',route:'battle',win:true,ending:'revival',seek:50.7},
 {name:'moon-premium',mode:'normal',route:'battle',win:true,premium:'moon',seek:45.1},
 {name:'sword-premium',mode:'normal',route:'battle',win:true,premium:'sword',seek:45.1},
 {name:'rush-flash',mode:'rush',route:'flash',win:true},
 {name:'normal-battle-full',mode:'normal',route:'battle',win:true}
];
const selected=process.env.PATTERN_REVIEW_CASES?.split(',');
if(selected){const prior=JSON.parse(await readFile(dir+'/browser-check.json','utf8'));runs.push(...prior.runs.filter(r=>!selected.includes(r.fixture.name)));}
try{
 for(const fixture of cases.filter(f=>!selected||selected.includes(f.name))){
  const sourceHashes={};for(const file of ['src/pixi/normal-spin-flow.js','src/pixi/normal-spin-view.js','src/pixi/long-reach-timeline.js','src/pixi/long-reach-view.js','public/assets/lcd/long-reach/duel-intermediates-v4.png'])sourceHashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');
  const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push({case:fixture.name,message:e.message}));
  await page.goto(`${process.env.PATTERN_REVIEW_BASE??'http://127.0.0.1:5186'}/?review=session&scenario=patterns`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
  const admitted=await page.evaluate(f=>{
   const g=__sessionReview.game(),m=__sessionReview.model();g.w.rng=()=>.9;
   for(let n=0;n<200;n++)m.flow.step(.05);
   for(let n=0;n<1600&&(g.presentation||g.spinActive);n++)m.flow.step(.05);
   if(g.jackpot||g.hasPendingWBonus)throw Error('Unexpected prior bonus');
   if(f.mode==='rush'){g.startRush();m.setMode('rush');}
   g.reviewPresentationRoute=f.route;g.reviewReachEnding=f.ending;g.reviewPremium=f.premium;
   g.w.rng=()=>f.win?0:.9;
   const shot=g.fire(),b=m.flow.physics.spawn(shot,0),p=m.flow.physics.pockets.find(p=>p.kind===(f.mode==='rush'?'fuzu':'start'));
   Object.assign(b,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});
   for(let n=0;n<1200&&!g.presentation;n++)m.flow.step(.01);
   if(!g.presentation)throw Error('No presentation');
   if(g.presentation.displayRoute!==f.route)throw Error('Wrong route');
   g.presentation.time=f.seek??0;
   return {record:{...g.wRecord},presentation:{...g.presentation},stock:g.stock};
  },fixture);
  const start=Date.now(),checks=[],markers=new Set();let paused=false,shot=false;
  while(Date.now()-start<(fixture.name==='normal-battle-full'?65000:20000)){
   const c=await page.evaluate(()=>({presentation:__sessionReview.game().presentation?{...__sessionReview.game().presentation}:null,snapshot:__session.snapshot(),preview:__sessionReview.game().previewWinAt,last:__sessionReview.game().lastDraw}));checks.push(c);
   if(!c.presentation)break;
   const t=c.presentation.time,marker=fixture.premium?47:fixture.seek?53.4:fixture.route==='flash'?8.5:fixture.route==='direct'?2.5:3;
   if(t>=marker&&!shot){shot=true;await page.screenshot({path:`${dir}/${fixture.name}.png`});}
   if(fixture.name==='normal-battle-full')for(const mark of [6.5,19.7,28.38,39.1,50.35])if(t>=mark&&!markers.has(mark)){markers.add(mark);await page.screenshot({path:`${dir}/${fixture.name}-${mark}.png`});}
   if(fixture.name==='normal-basic-loss'&&t>=2&&!paused){paused=true;await page.locator('#controls-toggle').click();await page.locator('#menu').click();const before=await page.evaluate(()=>__sessionReview.game().presentation.time);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.time),before);await page.locator('#resume').click();await page.locator('#controls-toggle').click();}
   await page.waitForTimeout(100);
  }
  assert.equal(checks.at(-1).presentation,null,fixture.name);assert.equal(checks.at(-1).last,fixture.win,fixture.name);
  assert.ok(checks.filter(c=>c.presentation).every(c=>c.preview===undefined));assert.equal(checks.at(-1).snapshot.session.accounting.reconciled,true);
  if(fixture.mode==='rush')assert.equal(checks.at(-1).snapshot.w.electricOpen,fixture.win);
  await page.screenshot({path:`${dir}/${fixture.name}-result.png`});await page.waitForTimeout(400);
  const video=page.video();await context.close();runs.push({fixture,admitted,checks,video:await video.path(),elapsed:(Date.now()-start)/1000,sourceHashes});
  await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,scope:'Production flow/view; fixed admission roll and display route; one paid ball placed over actual inlet; long endings seeked, short routes and flash real-time'},null,2));
  console.log(`${fixture.name}: passed`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}

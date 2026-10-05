// Actual production rendering over real time. Controlled inlet callbacks with
// seeded uniform rolls; no route/result override, no scene-time seeks.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='reference-review/parallel-distribution-2026-10-05/browser-longrun';await mkdir(dir+'/raw',{recursive:true});
const seconds=Number(process.env.LONGRUN_BROWSER_SECONDS??180),base=process.env.LONGRUN_BROWSER_BASE??'http://127.0.0.1:5186';
const files=['src/pixi/normal-spin-flow.js','src/pixi/normal-spin-view.js','src/pixi/prediction-plan.js','src/pixi/prediction-view.js','src/pixi/hold-prediction.js','src/pixi/special-route-view.js'];
const hashes={};for(const f of files)hashes[f]=createHash('sha256').update(await readFile(new URL('../'+f,import.meta.url))).digest('hex');
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];let pageForFailure;
try{
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});
 const page=await context.newPage();pageForFailure=page;page.on('pageerror',e=>errors.push(e.message));
 // Hold a stable local snapshot while other sessions edit files. Gameplay is
 // offline; this mocks only the Vite development reload websocket.
 await page.routeWebSocket(`${base.replace(/^http/,'ws')}/**`,()=>{});
 await page.goto(`${base}/?review=session&scenario=longrun`);
 await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
 await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
 await page.evaluate(()=>{
  const g=__sessionReview.game(),m=__sessionReview.model();
  // The dev review initially installs fixed rolls. Finish any existing fixture
  // separately, before installing the sampled cohort and starting the timer.
  m.flow.stop();
  for(let n=0;n<200;n++)m.flow.step(.05);
  for(let n=0;n<1600&&(g.presentation||g.spinActive);n++)m.flow.step(.05);
  if(g.jackpot||g.hasPendingWBonus)throw Error('Initial fixture acquired a bonus; do not mix it into the sampled cohort');
  for(const key of ['reviewPresentationRoute','reviewReachEnding','reviewPremium','reviewReachVariant','reviewEntryVariant','reviewDevelopment'])delete g[key];
  let seed=739391;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};g.rng=rng;g.w.rng=rng;
  g.startRush();m.setMode('rush');
  const rows=[],violations=[],start=g.startSpin.bind(g),resolve=g.resolveDraw.bind(g);
  const admitted=new Map(),fifo={tokuzu1:[],fuzu:[]};let nextId=Math.max(10000,m.flow.physics.nextId);
  g.startSpin=r=>{start(r);const result=g.spinResult,expected=admitted.get(r.id);
   if(expected){
    if(expected.roll!==r.roll)violations.push('roll changed');
    if(fifo[r.kind].shift()!==r.id)violations.push('FIFO changed');
    const admittedWin=r.kind==='fuzu'?expected.roll<1/expected.odds:g.w.normalResolver(expected.roll).outcome==='symbol';
    if(result.win!==admittedWin)violations.push('admitted outcome changed');
    if(r.kind==='fuzu'&&(expected.odds!==r.odds||expected.guaranteed!==r.guaranteed))violations.push('admitted condition changed');
   }
   rows.push({id:r.id,roll:r.roll,mode:result.mode,win:result.win,route:result.presentationPlan?.route,prediction:result.predictionPlan,ending:result.presentationPlan?.ending,premium:result.presentationPlan?.premium,startedAt:g.time});};
  g.resolveDraw=(win,reels)=>{const id=g.wRecord?.id;resolve(win,reels);const row=rows.findLast(r=>r.id===id);if(row){row.resolvedWin=g.lastDraw;row.resolvedAt=g.time;if(row.win!==g.lastDraw)violations.push('display outcome changed');}};
  function inlet(kind){const before=g.w.serial;m.flow.game.hit({id:nextId++,x:200,y:470,hits:0},kind,0);m.flow.physics.nextId=nextId;if(g.w.serial!==before){const r=Object.values(g.w.active).find(r=>r?.id===g.w.serial)??Object.values(g.w.queues).flat().find(r=>r.id===g.w.serial);admitted.set(r.id,{...r});if(fifo[r.kind])fifo[r.kind].push(r.id);}}
  const timer=setInterval(()=>{
   if(g.phase!=='playing'||m.flow.paused)return;
   const key=g.rush?'fuzu':'tokuzu1';if((g.rush||!g.jackpot&&!g.entryPrelude)&&g.w.queues[key].length<4)inlet(g.rush?'fuzu':'start');
   if(g.w.electricOpen&&m.tulip.state().progress>=1-1e-8)while(g.w.electricOpen)inlet('rush');
   if(g.w.pendingV&&m.attacker.state().progress>=1-1e-8)inlet('bonus');
   else if(g.jackpot&&g.w.bonus?.open){const old=g.w.bonus;while(g.w.bonus===old&&g.w.bonus?.open)inlet('bonus');}
  },250);
  window.__distributionAudit={rows,violations,stop:()=>clearInterval(timer)};
 });
 const start=Date.now(),samples=[],shots=new Set();let pauseChecked=false,lastProgress=0;
 while(Date.now()-start<seconds*1000){
  const data=await page.evaluate(()=>{const g=__sessionReview.game();return {time:g.time,draws:g.draws,active:g.spinResult?{id:g.spinResult.drawId,plan:g.spinResult.predictionPlan}:null,presentation:g.presentation?{id:g.presentation.drawId,time:g.presentation.time,route:g.presentation.displayRoute,ending:g.presentation.reachEnding,premium:g.presentation.premium}:null,snapshot:__session.snapshot()};});samples.push(data);
  assert.equal(data.snapshot.session.accounting.reconciled,true);
  const key=data.presentation?`${data.presentation.route}-${data.presentation.ending}-${Math.floor(data.presentation.time/10)}`:data.active?.plan?.beforeCue?'before-'+data.active.plan.beforeCue.family:null;
  if(key&&!shots.has(key)){shots.add(key);await page.screenshot({path:`${dir}/${key}.png`});}
  if(!pauseChecked&&Date.now()-start>30000){
   pauseChecked=true;await page.locator('#controls-toggle').click();await page.locator('#menu').click();
   const before=await page.evaluate(()=>({time:__sessionReview.game().time,physics:__sessionReview.model().flow.physics.time}));
   await page.waitForTimeout(500);assert.deepEqual(await page.evaluate(()=>({time:__sessionReview.game().time,physics:__sessionReview.model().flow.physics.time})),before);
   await page.screenshot({path:dir+'/paused.png'});await page.locator('#resume').click();await page.locator('#controls-toggle').click();
  }
  if(Date.now()-start>lastProgress+30000){lastProgress=Date.now()-start;console.log(`Browser real-time ${Math.floor(lastProgress/1000)}s, ${data.draws} draws`);}
  await page.waitForTimeout(200);
 }
 const audit=await page.evaluate(()=>{__distributionAudit.stop();return {rows:__distributionAudit.rows,violations:__distributionAudit.violations,snapshot:__session.snapshot()};});
 await page.screenshot({path:dir+'/final.png'});
 const video=page.video();await context.close();
 assert.deepEqual(errors,[]);assert.deepEqual(audit.violations,[]);
 await writeFile(dir+'/browser-check.json',JSON.stringify({scope:'390x844 actual production renderer; 180s default real-time, controlled inlet callbacks and seeded uniform rolls; initial RUSH mode, no forced outcome/route or scene-time seeks. Unresolved rows excluded from any rates; small cohort does not validate rare-cue reliability.',seconds,pauseChecked,audit,samples,errors,hashes,video:await video.path()},null,2));
 console.log('Browser longitudinal playback completed without page errors.');
}catch(error){
 const diagnostic={error:String(error),errors};
 if(pageForFailure){await pageForFailure.screenshot({path:dir+'/failure.png'}).catch(()=>{});diagnostic.pageText=await pageForFailure.locator('body').innerText().catch(()=>null);}
 await writeFile(dir+'/failure.json',JSON.stringify(diagnostic,null,2));throw error;
}finally{await browser.close();}

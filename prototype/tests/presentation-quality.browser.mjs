// Full-length production playback, with specified inlet outcome/route only.
// No scene seeks; browser mobile emulation is not a physical-device test.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const dir=process.env.QUALITY_OUTPUT??'reference-review/presentation-quality-2026-10-05';
const base=process.env.QUALITY_BASE??'http://127.0.0.1:5188';
const selected=process.env.QUALITY_CASES?.split(',');
const all=[];
for(const mode of ['normal','rush'])for(const variant of ['pressure','initiative','exchange'])for(const win of [false,true])all.push({name:`${mode}-${variant}-${win?'win':'loss'}`,mode,variant,win});
all.push({name:'normal-revival',mode:'normal',variant:'pressure',win:true,ending:'revival'},
 {name:'normal-moon',mode:'normal',variant:'exchange',win:true,premium:'moon'},
 {name:'normal-sword',mode:'normal',variant:'initiative',win:true,premium:'sword'},
 {name:'rush-flash',mode:'rush',win:true,route:'flash'});
const fixtures=selected?all.filter(f=>selected.includes(f.name)):all;
assert.ok(fixtures.length,'Unknown QUALITY_CASES');
await mkdir(dir+'/raw',{recursive:true});
const files=['src/pixi/board-runtime.js','src/pixi/normal-spin-view.js','src/pixi/normal-spin-flow.js','src/pixi/long-reach-view.js','src/pixi/long-reach-timeline.js','src/pixi/prediction-view.js','src/pixi/story-prediction-window.js','src/pixi/story-prediction-motion.js','src/pixi/story-prediction-view.js','src/pixi/session-game.js','src/tokyoghoul-w-machine.js'];
async function sourceHashes(){const hashes={};for(const file of files)hashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');return hashes;}
const hashes=await sourceHashes();
const browser=await chromium.launch({channel:'chrome',headless:true}),runs=[],errors=[];
try{
 for(const [index,f] of fixtures.entries()){
  const loadedSourceHashes=await sourceHashes();
  const viewport={width:index%2?390:320,height:index%2?844:740};
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:1,recordVideo:{dir:dir+'/raw',size:viewport}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push({case:f.name,message:e.message}));
  const assets=[];page.on('response',r=>{if(/\/assets\/lcd\/long-reach\//.test(r.url()))assets.push({url:r.url(),status:r.status()});});
  await page.goto(`${base}/?review=session&scenario=predictions`);
  await page.locator('[data-kind=main]').first().tap();await page.locator('#playMachine').tap();
  await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').tap();
  await page.locator('#controls-toggle').tap();await page.locator('#feed-toggle').tap();await page.locator('#controls-toggle').tap();
  await page.locator('[data-view=lcd]').tap();
  await page.evaluate(()=>{
   window.__qualityFrames=[];let last=null;
   const sample=t=>{if(last!==null&&__sessionReview.game().presentation&&!__session.snapshot().paused)__qualityFrames.push(t-last);last=t;window.__qualityRaf=requestAnimationFrame(sample);};
   window.__qualityRaf=requestAnimationFrame(sample);
  });
  const admitted=await page.evaluate(f=>{
   const g=__sessionReview.game(),m=__sessionReview.model();
   if(f.mode==='rush'){g.startRush();m.setMode('rush');}
   g.reviewPresentationRoute=f.route??'battle';g.reviewReachVariant=f.variant;g.reviewReachEnding=f.ending;g.reviewPremium=f.premium;
   g.w.rng=()=>f.win?0:.9;g.stopTimer=0;g.hit({id:990001},f.mode==='rush'?'fuzu':'start');
   for(let n=0;n<200&&!g.spinResult;n++)m.flow.step(.01);
   if(!g.spinResult)throw Error('Admission failed');
   return {record:{...g.wRecord},prediction:g.spinResult.predictionPlan};
  },f);
  await page.waitForFunction(()=>!!__sessionReview.game().presentation,{timeout:20000});
  const wallStart=Date.now(),samples=[],seen=new Set();let paused=false,switched=false;
  const duration=f.ending==='revival'?58:f.route==='flash'?12:54;
  while(Date.now()-wallStart<(duration+16)*1000){
   const snap=await page.evaluate(()=>{const g=__sessionReview.game();return {p:g.presentation?{time:g.presentation.time,win:g.presentation.win,variant:g.presentation.reachVariant,ending:g.presentation.reachEnding}:null,s:__session.snapshot(),result:g.lastDraw};});
   if(!snap.p){samples.push({...snap,ended:true});break;}
   const t=snap.p.time;
   assert.equal(snap.p.win,f.win);
   for(const marker of (duration===12?[2,5,10]:[2,6,11,18,21,26,32,41,49,53,55,57]))if(marker<duration&&t>=marker&&!seen.has(marker)){
    seen.add(marker);samples.push({marker,...snap});await page.screenshot({path:`${dir}/${f.name}-${marker}.png`});
   }
   if(t>=(duration===12?3:20)&&!paused){
    paused=true;await page.locator('#controls-toggle').tap();await page.locator('#menu').tap();
    const before=await page.evaluate(()=>({p:__sessionReview.game().presentation.time,s:__session.snapshot().time}));
    await page.waitForTimeout(500);
    assert.deepEqual(await page.evaluate(()=>({p:__sessionReview.game().presentation.time,s:__session.snapshot().time})),before);
    await page.locator('#resume').tap();await page.locator('#controls-toggle').tap();
   }
   if(t>=(duration===12?7:29)&&!switched){
    switched=true;for(const view of ['whole','board','lcd']){await page.locator(`[data-view=${view}]`).tap();assert.equal(await page.evaluate(()=>__session.snapshot().view),view);}
   }
   await page.waitForTimeout(150);
  }
  const end=samples.at(-1);assert.equal(end.ended,true);assert.equal(end.result,f.win);assert.equal(end.s.session.accounting.reconciled,true);assert.equal(end.s.view,'lcd');
  await page.locator('#controls-toggle').tap();assert.doesNotMatch(await page.locator('main').innerText(),/電チュー|普図|特図|ヘソ|V入賞|アタッカー/);
  await page.locator('#effects-reduced').check();assert.equal(await page.evaluate(()=>__sessionReview.game().reducedEffects),true);await page.locator('#effects-reduced').uncheck();await page.locator('#controls-toggle').tap();
  await page.screenshot({path:`${dir}/${f.name}-result.png`});
  const frameStats=await page.evaluate(()=>{cancelAnimationFrame(__qualityRaf);const a=__qualityFrames.slice().sort((a,b)=>a-b);return {samples:a.length,medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)],over50ms:a.filter(t=>t>50).length,over100ms:a.filter(t=>t>100).length};});
  const assetHashes={};for(const asset of assets){const path=new URL(asset.url).pathname;assetHashes[path]=createHash('sha256').update(await readFile('public'+path)).digest('hex');}
  const finalSourceHashes=await sourceHashes();
  const video=page.video();await context.close();runs.push({fixture:f,viewport,admitted,assets,assetHashes,loadedSourceHashes,finalSourceHashes,sourceChanged:JSON.stringify(loadedSourceHashes)!==JSON.stringify(finalSourceHashes),samples,frameStats,wallSeconds:(Date.now()-wallStart)/1000,video:await video.path()});
  await writeFile(dir+'/browser-check.json',JSON.stringify({hashes,runs,errors,scope:'Production flow/view; specified inlet result and route; uninterrupted scene timeline except explicit pause; touch/mobile viewport emulation; desktop headless Chrome frame timing, not device performance or natural occurrence statistics'},null,2));
  console.log(`${f.name}: full ${duration}s passed`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}

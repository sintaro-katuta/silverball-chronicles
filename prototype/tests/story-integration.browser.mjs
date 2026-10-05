import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createPredictionPlan} from '../src/pixi/prediction-plan.js';
import {storyPredictionWindow} from '../src/pixi/story-prediction-window.js';
const dir='reference-review/story-integration-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const cases=[
 {name:'step',kind:'step',mode:'normal',variant:'pressure'},
 {name:'memory',kind:'memory',mode:'normal',variant:'pressure',before:'story'},
 {name:'episode',kind:'episode',mode:'normal',variant:'initiative'},
 {name:'pursuit',kind:'pursuit',mode:'normal',variant:'exchange'},
 {name:'rescue',kind:'rescue',mode:'normal',variant:'initiative'},
 {name:'rush-memory',kind:'memory',mode:'rush',variant:'pressure',before:'identity'},
 {name:'rush-rescue',kind:'rescue',mode:'rush',variant:'exchange',before:'resolve'},
 {name:'rush-pursuit',kind:'pursuit',mode:'rush',variant:'exchange',before:'search'},
];
const hashes={};for(const file of ['src/pixi/board-runtime.js','src/pixi/normal-spin-view.js','src/pixi/prediction-view.js','src/pixi/story-prediction-window.js','src/pixi/story-prediction-motion.js','src/pixi/story-prediction-view.js'])hashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');
const browser=await chromium.launch({channel:'chrome',headless:true}),runs=[],errors=[];
try{
 for(const f of cases.filter(f=>!process.env.STORY_CASES||process.env.STORY_CASES.split(',').includes(f.name))){
  const phase=f.phase??'reach',plan={route:'battle',variant:f.variant,ending:'standard',premium:null};
  let id;
  for(let n=1;n<100000;n++){const p=createPredictionPlan({drawId:n,mode:f.mode,win:false,plan});const w=storyPredictionWindow(p,phase==='spin'?1:1,{phase});if(w?.family===f.kind&&(!f.before||p.beforeCue?.family===f.before)){id=n;break;}}
  assert.ok(id,f.name);f.id=id;
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});
  const page=await context.newPage(),consoleErrors=[],failedRequests=[];page.on('pageerror',e=>errors.push({case:f.name,message:e.message}));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()}));
  await page.goto(`${process.env.STORY_BASE??'http://127.0.0.1:5188'}/?review=session&scenario=predictions`);
  await page.locator('[data-kind=main]').first().tap();await page.locator('#playMachine').tap();
  try{await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});}
  catch(error){await page.screenshot({path:`${dir}/${f.name}-loading-failed.png`});await writeFile(dir+'/loading-failure.json',JSON.stringify({case:f.name,consoleErrors,failedRequests,errors,body:await page.locator('body').innerText()},null,2));throw error;}
  if(await page.locator('#intro-skip').isVisible())await page.locator('#intro-skip').tap();
  await page.locator('#controls-toggle').tap();await page.locator('#feed-toggle').tap();await page.locator('#controls-toggle').tap();await page.locator('[data-view=lcd]').tap();
  const p=await page.evaluate(f=>{const g=__sessionReview.game(),m=__sessionReview.model();if(f.mode==='rush'){g.startRush();m.setMode('rush');}g.reviewPresentationRoute='battle';g.reviewReachVariant=f.variant;g.w.serial=f.id-1;g.w.rng=()=>.9;g.hit({id:990005},f.mode==='rush'?'fuzu':'start');for(let n=0;n<200&&!g.spinResult;n++)m.flow.step(.01);return g.spinResult.predictionPlan;},f);
  const screenshots=[],start=Date.now();let frames=new Set();
  while(Date.now()-start<9000){
   const state=await page.evaluate(()=>{const g=__sessionReview.game();return {phase:g.presentation?'reach':'spin',age:g.presentation?.time??g.drawTimer,win:g.presentation?.win??g.spinResult?.win};});
   if(state.phase==='reach'&&state.age>=5.1)break;
   const w=storyPredictionWindow(p,state.age,{phase:state.phase});
   if(w?.family===f.kind&&state.phase===phase){const count=w.duration<1.8?2:w.duration<3?3:5,cut=Math.floor((state.age-w.start)/w.duration*count),cutAge=state.age-w.start-cut*w.duration/count;if(!frames.has(cut)&&cutAge>.14){frames.add(cut);await page.screenshot({path:`${dir}/${f.name}-${cut}.png`});screenshots.push({...state,cut});}}
   await page.waitForTimeout(60);
  }
  assert.ok(frames.size>=(f.mode==='rush'?3:phase==='spin'?2:5),`${f.name} missing story cuts`);
  // Entrance is recorded continuously. The unchanged later combat is reviewed
  // separately in presentation-quality; jump only after the film ends.
  await page.evaluate(()=>{__sessionReview.game().presentation.time=51.2;});await page.waitForFunction(()=>!__sessionReview.game().presentation,{timeout:8000});
  assert.equal(await page.evaluate(()=>__sessionReview.game().lastDraw),false);assert.equal(await page.evaluate(()=>__sessionReview.game().accounting.reconciled),true);
  const video=page.video();await context.close();runs.push({fixture:f,prediction:p,screenshots,video:await video.path()});
  await writeFile(dir+'/browser-check.json',JSON.stringify({hashes,runs,errors,scope:'Actual production view/flow; specified saved losses and routes; entrance/precursor real-time, later combat seeked after the new film; mobile touch emulation'},null,2));console.log(f.name+': production film passed');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}

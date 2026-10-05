import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createPredictionPlan} from '../src/pixi/prediction-plan.js';
const dir='reference-review/predictions-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const find=(mode,win,plan,predicate)=>{
 for(let id=1;id<100000;id++){const p=createPredictionPlan({drawId:id,mode,win,plan});if(predicate(p))return id;}
 throw Error('No fixture found');
};
const fixtures=[
 {name:'normal-serial-climax-loss',mode:'normal',win:false,route:'battle',variant:'pressure',before:'serial'},
 {name:'normal-character-loss',mode:'normal',win:false,route:'basic',basic:'character'},
 {name:'normal-digits-loss',mode:'normal',win:false,route:'basic',plain:true},
 {name:'normal-long-win',mode:'normal',win:true,route:'basic',basic:'long'},
 {name:'normal-episode',mode:'normal',win:false,route:'battle',variant:'initiative',before:'story'},
 {name:'normal-special',mode:'normal',win:false,route:'battle',variant:'exchange',entrance:'special'},
 {name:'normal-fullrotation',mode:'normal',win:true,route:'battle',variant:'pressure',premium:'moon',full:true},
 {name:'rush-search',mode:'rush',win:false,route:'battle',variant:'exchange',before:'search'},
 {name:'rush-flash',mode:'rush',win:true,route:'flash'},
];
const hashes={};for(const file of ['src/pixi/prediction-plan.js','src/pixi/prediction-view.js','src/pixi/hold-prediction.js','src/pixi/normal-spin-flow.js','src/pixi/normal-spin-view.js'])hashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 for(const f of fixtures){
  const plan={route:f.route,variant:f.variant??null,ending:f.route==='flash'?'flash':'standard',premium:f.premium??null};
  f.id=find(f.mode,f.win,plan,p=>(!f.before||p.beforeCue?.family===f.before)&&(!f.basic||p.basicFamily===f.basic)&&(!f.plain||p.basicFamily===null)&&(!f.entrance||p.development?.family===f.entrance)&&(!f.full||p.resultFamily==='fullrotation')&&(f.name!=='normal-serial-climax-loss'||p.beforeCue.tier==='red'&&p.chanceUps.some(c=>c.start===28.1)));
  const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push({case:f.name,message:e.message}));
  await page.goto(`${process.env.PREDICTION_REVIEW_BASE??'http://127.0.0.1:5186'}/?review=session&scenario=predictions`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
  const admitted=await page.evaluate(f=>{
   const g=__sessionReview.game(),m=__sessionReview.model();
   if(f.mode==='rush'){g.startRush();m.setMode('rush');}
   g.reviewPresentationRoute=f.route;g.reviewReachVariant=f.variant;g.reviewPremium=f.premium;
   g.w.serial=f.id-1;g.w.rng=()=>f.win?0:.9;g.stopTimer=0;g.hit({id:900001},f.mode==='rush'?'fuzu':'start');
   for(let n=0;n<200&&!g.spinResult;n++)m.flow.step(.01);
   if(!g.spinResult)throw Error(JSON.stringify({phase:g.phase,stop:g.stopTimer,spin:g.spinActive,wactive:g.w.active,queue:g.w.queues,presentation:g.presentation,record:g.wRecord}));
   return {record:{...g.wRecord},prediction:g.spinResult.predictionPlan};
  },f);
  if(admitted.prediction.beforeCue){await page.waitForTimeout(f.mode==='rush'?220:800);await page.screenshot({path:`${dir}/${f.name}-before.png`});}
  await page.waitForFunction(()=>!!__sessionReview.game().presentation);
  assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.win),f.win);
  await page.waitForTimeout(f.full?150:1000);await page.screenshot({path:`${dir}/${f.name}-entrance.png`});
  const samples=[];
  const seeks=f.route==='basic'?[]:f.route==='flash'?[5.2]:f.full?[45.5]:[8.6,28.6,41.1];
  for(const time of seeks){
   await page.evaluate(t=>{__sessionReview.game().presentation.time=t;},time);await page.waitForTimeout(f.full?5900:350);
   samples.push(await page.evaluate(()=>({...__sessionReview.game().presentation})));
   await page.screenshot({path:`${dir}/${f.name}-${time}.png`});
  }
  if(f.route==='battle')await page.evaluate(()=>{__sessionReview.game().presentation.time=51.1;});
  await page.waitForFunction(()=>!__sessionReview.game().presentation,{timeout:18000});
  const result=await page.evaluate(()=>({win:__sessionReview.game().lastDraw,accounting:__sessionReview.game().accounting,w:__session.snapshot().w}));
  assert.equal(result.win,f.win);assert.equal(result.accounting.reconciled,true);
  await page.screenshot({path:`${dir}/${f.name}-result.png`});
  const video=page.video();await context.close();runs.push({fixture:f,admitted,samples,result,video:await video.path()});
  await writeFile(dir+'/browser-check.json',JSON.stringify({hashes,runs,errors,scope:'Actual production view and flow; specified inlet result and route; scene-time seeks for battle excerpts; basic and flash real-time'},null,2));
  console.log(f.name+': passed');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}

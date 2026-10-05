import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {specialRoutePose,SPECIAL_ROUTE_TIMINGS} from '../src/pixi/special-route-motion.js';
const dir=process.env.SPECIAL_ROUTES_EVIDENCE??'reference-review/parallel-routes-2026-10-05';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:740},recordVideo:{dir:dir+'/raw',size:{width:390,height:740}}});
const page=await context.newPage(),errors=[],runs=[];page.on('pageerror',e=>errors.push(e.message));
const fixtures=[{route:'basic',mode:'normal',win:false},{route:'basic',mode:'normal',win:true},{route:'basic',mode:'rush',win:false},{route:'basic',mode:'rush',win:true},{route:'direct',mode:'normal',win:true},{route:'direct',mode:'rush',win:true},{route:'moon',mode:'normal',win:true},{route:'sword',mode:'normal',win:true}];
try{
 await page.goto(process.env.SPECIAL_ROUTES_URL??'http://localhost:5183/dev/special-routes.html');await page.waitForFunction(()=>!!window.__specialRoutes);
 const glyphComparison=await page.evaluate(()=>__specialRoutes.compareWithProduction());assert.ok(glyphComparison.every(c=>c.differentChannels===0));
 const directionSamples=[];
 for(const mode of ['normal','rush'])for(const route of ['basic','direct'])for(const column of route==='basic'?[1]:[0,1,2]){
  const first=specialRoutePose({mode,route,win:true,time:0}).positions[column],samples=[];
  for(let value=Math.max(-2,Math.ceil(first));value<=7;value++){
   let lo=0,hi=SPECIAL_ROUTE_TIMINGS[mode][route].decisionAt;
   for(let k=0;k<60;k++){const t=(lo+hi)/2;if(specialRoutePose({mode,route,win:true,time:t}).positions[column]<value)lo=t;else hi=t;}
   await page.evaluate(v=>__specialRoutes.set({mode:v.mode,route:v.route,win:true,time:v.time}),{mode,route,time:hi});
   const row=await page.evaluate(i=>__specialRoutes.inspectReels()[i].strip.slice().sort((a,b)=>Math.abs(a.y)-Math.abs(b.y))[0],column);
   const expected=((value-1)%9+9)%9+1;assert.equal(row.digit,expected);assert.ok(Math.abs(row.y)<.0001);
   samples.push({time:hi,position:value,observedDigit:row.digit,y:row.y});
  }
  for(let i=1;i<samples.length;i++){assert.ok(samples[i].time>samples[i-1].time);assert.equal(samples[i].observedDigit,samples[i-1].observedDigit%9+1);}
  directionSamples.push({mode,route,column,samples});
 }
 for(const item of fixtures){
  const key=`${item.mode}-${item.route}-${item.win?'win':'loss'}`;
  await page.evaluate(item=>__specialRoutes.set(item),item);
  await page.evaluate(()=>__specialRoutes.play(true));
  const seconds=await page.evaluate(()=>__specialRoutes.pose().seconds??3.4);
  await page.waitForFunction(t=>__specialRoutes.pose().route==='battle'?__specialRoutes.pose().premiumAge>=t:__specialRoutes.pose().reelProgress===1&&+document.querySelector('#time').value>=t,seconds-.55,{timeout:seconds*2000+3000});
  const pose=await page.evaluate(()=>__specialRoutes.pose());
  if(pose.route!=='battle'){const layout=await page.evaluate(()=>__specialRoutes.inspectReels());for(let i=0;i<3;i++){assert.equal(layout[i].x,item.mode==='rush'?10+i*65:32+i*53);assert.equal(layout[i].y,item.mode==='rush'?28:38);assert.equal(layout[i].scaleX,item.mode==='rush'?1.5:1);}}
  assert.equal(pose.route,['moon','sword'].includes(item.route)?'battle':item.route);
  if(pose.route!=='battle'){assert.equal(pose.result,item.win?'win':'loss');assert.deepEqual(pose.digits,[7,item.win?7:8,7]);}
  else assert.equal(pose.formed,true);
  await page.screenshot({path:`${dir}/${key}.png`});
  await page.waitForTimeout(850);
  const end=await page.evaluate(()=>__specialRoutes.pose());assert.equal(end.visible,false);
  runs.push({item,pose,end});
 }
 const reducedChecks=[];
 for(const item of fixtures){
  await page.evaluate(item=>__specialRoutes.set({...item,reduced:true}),item);
  const seconds=await page.evaluate(()=>__specialRoutes.pose().seconds??2.55);
  await page.evaluate(t=>__specialRoutes.seek(t),seconds-.55);
  const p=await page.evaluate(()=>__specialRoutes.pose());assert.equal(p.sparkleCount,0);assert.equal(p.shake,0);
  if(p.route==='battle')assert.equal(p.formed,true);else assert.equal(p.result,item.win?'win':'loss');
  reducedChecks.push({item,pose:p});
  await page.screenshot({path:`${dir}/${item.mode}-${item.route}-${item.win?'win':'loss'}-reduced.png`});
 }
 for(const route of ['moon','sword']){
  await page.evaluate(route=>__specialRoutes.set({route,win:true,reduced:false,time:2,battleAt:17}),route);
  await page.screenshot({path:`${dir}/${route}-upper-attention.png`});
 }
 await page.evaluate(()=>__specialRoutes.set({route:'basic',win:false,time:2}));
 const paused=await page.evaluate(()=>__specialRoutes.pose());await page.waitForTimeout(400);
 assert.deepEqual(await page.evaluate(()=>__specialRoutes.pose()),paused);
 await page.evaluate(()=>{__specialRoutes.destroy();__specialRoutes.destroy();});
 assert.deepEqual(errors,[]);
 await writeFile(dir+'/browser-check.json',JSON.stringify({runs,reducedChecks,glyphComparison,directionSamples,errors,viewport:{width:390,height:740},stats:await page.evaluate(()=>__specialRoutes.stats()),scope:'Standalone display fixtures with existing battle overlay; production glyph textures compared pixel-for-pixel. Actual rendered sprite digits inspected at increasing times for normal/RUSH basic and all direct columns, including 9→1. No production lottery, payout, admission or shared flow invoked. Full-speed playback plus seek/pause/all eight reduced effects/upper-attention overlays/idempotent destruction.'},null,2));
}finally{const video=page.video();await context.close();await writeFile(dir+'/video-path.txt',await video.path());await browser.close();}

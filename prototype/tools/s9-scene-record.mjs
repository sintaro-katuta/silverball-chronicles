// Real-time canvas + real Web Audio output. Authored outcomes are explicitly fixtures.
import {chromium} from '@playwright/test';
import {browserLaunchOptions} from '../tests/browser-launch.js';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.REVIEW_URL,out=process.env.S9_RECORD_OUT,sourceRoot=process.env.S9_SOURCE_ROOT??process.cwd();
if(!base||!out)throw Error('REVIEW_URL and S9_RECORD_OUT required');
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Local only');
await mkdir(out,{recursive:true});assert.equal((await readdir(out)).length,0,'Fresh output required');
const cases=(process.env.S9_RECORD_CASES??'normal,pressure-loss,pressure-win,pressure-revival,bonus,rush').split(',');
const hash=b=>createHash('sha256').update(b).digest('hex');
async function inventory(){const rows=[];async function walk(dir){for(const e of(await readdir(path.join(sourceRoot,dir),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=dir+'/'+e.name;if(e.isDirectory())await walk(name);else if(e.isFile()){const b=await readFile(path.join(sourceRoot,name));rows.push({path:name,bytes:b.length,sha256:hash(b)});}}}await walk('prototype/src');return rows;}
const before=await inventory(),head=execFileSync('git',['rev-parse','HEAD'],{cwd:sourceRoot,encoding:'utf8'}).trim(),runs=[],errors=[];
await writeFile(out+'/inputs-before.json',JSON.stringify({head,sourceRoot,inputs:before,toolSHA:hash(await readFile(new URL(import.meta.url)))},null,2));
const browser=await chromium.launch(browserLaunchOptions());
try{
 for(const name of cases){
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1}),page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?review=session&scenario=predictions');await page.locator('[data-kind=main]').first().click();
  const experience=['bonus','rush'].includes(name)?name:null;
  await page.locator(experience?'[data-experience='+experience+']':'#playMachine').click();await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});await page.locator('#intro-skip').click();
  if(!experience){if((await page.locator('#feed-toggle').innerText()).includes('停止'))await page.locator('#feed-toggle').click();await page.waitForFunction(()=>__sessionReview.board().snapshot().inFlight===0,null,{timeout:15000});}
  await page.locator('[data-view=lcd]').click();
  await page.evaluate(async()=>{await __sessionReview.board().setSound(true);});
  await page.waitForFunction(()=>__sessionReview.board().audio().state==='running');
  const fixture=name.startsWith('pressure-')?{win:name!=='pressure-loss',ending:name==='pressure-revival'?'revival':'standard'}:null;
  await page.evaluate(f=>{
   const b=__sessionReview.board(),g=__sessionReview.game();b.pause(true);
   if(f){g.presentation={id:9009,drawId:9009,time:0,basicReach:true,longReach:true,displayRoute:'battle',presentationMode:'normal',reachVariant:'pressure',reachEnding:f.ending,win:f.win,premium:null,predictionPlan:null};g.spinActive=false;g.jackpot=null;delete g.previewWinAt;}
   window.__s9Chunks=[];window.__s9Samples=[];window.__s9Start=performance.now();
   const stream=new MediaStream([...b.canvas.captureStream(30).getVideoTracks(),...b.audioStream().getAudioTracks()]);
   const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:1800000});recorder.ondataavailable=e=>__s9Chunks.push(e.data);recorder.start();window.__s9Recorder=recorder;window.__s9Stream=stream;
   window.__s9Timer=setInterval(()=>{const game=__sessionReview.game();__s9Samples.push({wall:(performance.now()-__s9Start)/1000,time:game.time,presentationTime:game.presentation?.time??null,audio:b.audio()});},100);b.pause(false);
  },fixture);
  const seconds=fixture?(fixture.ending==='revival'?58:54):name==='normal'?18:20;
  if(fixture)await page.waitForFunction(()=>!__sessionReview.game().presentation,null,{timeout:(seconds+15)*1000});else await page.waitForTimeout(seconds*1000);
  await page.waitForTimeout(500);await page.screenshot({path:out+'/'+name+'.png'});
  const result=await page.evaluate(async()=>{clearInterval(__s9Timer);await new Promise(resolve=>{__s9Recorder.onstop=resolve;__s9Recorder.stop();});const b=__sessionReview.board(),bytes=Array.from(new Uint8Array(await new Blob(__s9Chunks,{type:__s9Recorder.mimeType}).arrayBuffer()));for(const t of __s9Stream.getTracks())t.stop();return{bytes,wallSeconds:(performance.now()-__s9Start)/1000,samples:__s9Samples,audio:b.audio(),snapshot:b.snapshot(),humanListening:'unverified',scope:'Real-time canvas video and real AudioContext output. Fixture outcomes are authored; no admission-rate or full natural outcome claim. Canvas video excludes DOM controls.'};});
  assert(result.bytes.length>1000);await writeFile(out+'/'+name+'.webm',Buffer.from(result.bytes));delete result.bytes;await writeFile(out+'/'+name+'.json',JSON.stringify({name,fixture,...result},null,2));runs.push({name,wallSeconds:result.wallSeconds,fixture});console.log('RECORDED',name,result.wallSeconds.toFixed(2));await context.close();
 }
 assert.deepEqual(errors,[]);const after=await inventory();assert.deepEqual(after,before,'Source changed while recording');await writeFile(out+'/verification.json',JSON.stringify({success:true,base,head,before,after,runs,errors,scope:'Continuous equal-speed media evidence; fixture outcomes and canvas-only capture explicitly labelled; no speaker listening acceptance.'},null,2));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:String(error),runs,errors},null,2));throw error;}
finally{await browser.close();console.log('OWNED_CHROME_CLOSED');}

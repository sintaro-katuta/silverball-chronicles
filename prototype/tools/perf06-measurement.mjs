import {chromium} from '@playwright/test';
import {browserLaunchOptions} from '../tests/browser-launch.js';
import {sourceFingerprint,projectRoot} from './release-workflow.js';
import {runtimeScope} from './qa05-measurement.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import os from 'node:os';

export function frameSummary(values){
 if(values.some(n=>!Number.isFinite(n)||n<0))throw new RangeError('Invalid frame interval');
 const ordered=[...values].sort((a,b)=>a-b),n=ordered.length;
 const percentile=p=>n?ordered[Math.max(0,Math.ceil(p*n)-1)]:null;
 const slow=limit=>({thresholdMs:limit,relation:'>',count:values.filter(v=>v>limit).length,total:n,ratio:n?values.filter(v=>v>limit).length/n:null});
 return {count:n,mean:n?values.reduce((a,b)=>a+b,0)/n:null,p50:percentile(.5),p95:percentile(.95),max:n?ordered.at(-1):null,over33_4:slow(33.4),over50:slow(50),over100:slow(100)};
}
// Markers are sparse samples, not exact state transitions. Join each interval
// to the most recent marker; report this approximation rather than claiming
// every frame rendered that state or that rAF measures GPU execution time.
export function stateBreakdown(samples,markers){
 const groups={};let index=0;
 for(const sample of samples){while(index+1<markers.length&&markers[index+1].at<=sample.at)index++;const m=markers[index];const label=m?`${m.mode}|${m.stage}|push:${m.pushVisible}`:'unmarked';(groups[label]??=[]).push(sample.delta);}
 return Object.fromEntries(Object.entries(groups).map(([label,values])=>[label,frameSummary(values)]));
}
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function samplePage(page,seconds){
 return page.evaluate(seconds=>new Promise(resolve=>{
  const started=performance.now(),samples=[],markers=[];let last=null,lastMarker=-Infinity;
  function frame(now){
   if(last!==null)samples.push({at:now-started,delta:now-last});last=now;
   if(now-lastMarker>=200){const g=window.__sessionReview.game(),m=window.__sessionReview.model(),p=g.presentation,button=document.querySelector('.decision-push-button');markers.push({at:now-started,gameTime:g.time,mode:m.getMode(),stage:p?.longReach?'battle':p?'reach':g.jackpot?'bonus':g.rush?'rush':g.spinActive?'normal-spin':'normal-idle',presentationTime:p?.time??null,pushVisible:!!button&&!button.hidden&&button.style.display!=='none',paused:m.flow.paused,phase:g.phase});lastMarker=now;}
   if(now-started>=seconds*1000)resolve({started,elapsedMs:now-started,samples,markers,endedVisibility:document.visibilityState});else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 }),seconds);
}
async function startScene(page,url,scene){
 await page.goto(url+'/?review=session&scenario=predictions');await page.locator('[data-kind=main]').first().click();
 await page.locator('#playMachine').click();await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});await page.locator('#intro-skip').click();await page.locator('[data-view=lcd]').click();await page.evaluate(()=>document.fonts.ready);
 // Fixed records belong to this dev-only measurement session. Production
 // admission/lottery/clock code is unmodified. Do not seek or freeze clocks.
 await page.evaluate(scene=>{
  const b=__sessionReview.board(),g=__sessionReview.game();b.setSound(false);
  if(scene==='normal'){g.w.rng=()=>.9;g.reviewPresentationRoute='ordinary';}
  else {b.feed(scene==='right');g.w.rng=()=>scene==='right'?0:.9;g.reviewPresentationRoute=scene==='right'?'direct':'battle';g.reviewReachVariant='pressure';g.reviewReachEnding='standard';g.hit({id:990001},'start');}
 },scene);
 if(scene==='battle'||scene==='PUSH')await page.waitForFunction(t=>(__sessionReview.game().presentation?.time??-1)>=t,scene==='battle'?21:40.5,{timeout:120000});
 if(scene==='right')await page.waitForFunction(()=>__session.snapshot().mode==='bonus'&&__session.snapshot().counts.bonus>0&&__session.snapshot().w.bonus?.payout>0,null,{timeout:90000});
 await page.waitForTimeout(3000);
}
async function main(){
 const args=process.argv.slice(2);if(args.length!==4||args[0]!=='--url'||args[2]!=='--out')throw new Error('Usage: PLAYWRIGHT_BROWSER=chromium node prototype/tools/perf06-measurement.mjs --url <local-dev-url> --out <evidence-dir>');
 const url=args[1];if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(url))throw new Error('Local dev URL required');
 const out=resolve(args[3]);await mkdir(out,{recursive:true});const source=await sourceFingerprint(projectRoot),runtimeSHA=hash(runtimeScope(source));
 const provenance={createdAt:new Date().toISOString(),git:execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim(),runtimeSHA256:runtimeSHA,toolSHA256:createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),node:process.version,platform:os.platform(),osRelease:os.release(),architecture:os.arch(),cpuModel:os.cpus()[0]?.model,cpuCount:os.cpus().length,memoryBytes:os.totalmem(),url,command:process.argv,browserSelection:process.env.PLAYWRIGHT_BROWSER??'chrome',headless:true,deviceType:'Host computer with viewport/DPR emulation; not a phone',settings:{warmupSeconds:3,windowSeconds:30,repeats:3,view:'lcd',sound:false,reducedEffects:false,fixture:'development review=session; fixed losing battle and selected direct bonus; clocks advance normally',pushOperation:'none; automatic decision preserves the full display timeline'},limitations:['rAF is frame-notification interval, not GPU execution time','Sparse state markers every >=200ms approximate attribution','Thermal/battery/GPU memory/physical touch and audio listening unmeasured','Dev fixture and instrumented run, not production-user performance guarantee']};
 provenance.toolDependencies=await Promise.all(['prototype/tools/qa05-measurement.mjs','prototype/tests/browser-launch.js','prototype/tools/release-workflow.js'].map(async path=>({path,sha256:createHash('sha256').update(await readFile(join(projectRoot,path))).digest('hex')})));
 provenance.packages=Object.fromEntries(await Promise.all(['@playwright/test','pixi.js','vite'].map(async name=>[name,JSON.parse(await readFile(join(projectRoot,'prototype/node_modules',name,'package.json'),'utf8')).version])));
 const browser=await chromium.launch({...browserLaunchOptions(),headless:true});provenance.browser=browser.version();const summaries=[];
 try{
  for(const viewport of [{width:390,height:844,dpr:3},{width:1440,height:900,dpr:1}])for(const scene of ['normal','battle','PUSH','right'])for(let repeat=1;repeat<=3;repeat++){
   const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:viewport.dpr,reducedMotion:'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
   try{await startScene(page,url,scene);}catch(error){
    const failure={viewport,scene,repeat,error:String(error),errors,state:await page.evaluate(()=>({snapshot:window.__session?.snapshot?.()??null,presentationTime:window.__sessionReview?.game?.()?.presentation?.time??null})).catch(e=>({unavailable:String(e)}))};
    await writeFile(join(out,`failed-${viewport.width}-${scene}-${repeat}.json`),JSON.stringify(failure,null,2)+'\n');throw error;
   }
   const before=await page.evaluate(()=>{const c=document.querySelector('#canvas canvas'),r=c.getBoundingClientRect();let graphics=null;try{const gl=c.getContext('webgl2')??c.getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');if(gl)graphics={version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(ext?ext.UNMASKED_RENDERER_WEBGL:gl.RENDERER),vendor:gl.getParameter(ext?ext.UNMASKED_VENDOR_WEBGL:gl.VENDOR)};}catch{}return {environment:{userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory??null,graphics},snapshot:__session.snapshot(),canvas:{width:c.width,height:c.height,cssWidth:r.width,cssHeight:r.height,dpr:devicePixelRatio},visibility:document.visibilityState,memory:performance.memory?{usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize}:null};});
   // Screenshots/layout and heavy application snapshots stay outside the window.
   const image=`${viewport.width}-${scene}-${repeat}-before.png`;await page.screenshot({path:join(out,image)});
   const raw=await samplePage(page,30),after=await page.evaluate(()=>({snapshot:__session.snapshot(),visibility:document.visibilityState}));
   const pushMarkers=raw.markers.filter(m=>m.pushVisible),pushSamples=raw.samples.filter(s=>{const m=raw.markers.filter(m=>m.at<=s.at).at(-1);return m?.pushVisible;});
   const result={viewport,scene,repeat,before,after,errors,...raw,frames:frameSummary(raw.samples.map(s=>s.delta)),states:stateBreakdown(raw.samples,raw.markers),push:{sparseVisibleMarkerCount:pushMarkers.length,firstVisibleAtMs:pushMarkers[0]?.at??null,lastVisibleAtMs:pushMarkers.at(-1)?.at??null,frames:frameSummary(pushSamples.map(s=>s.delta)),operation:null},image};
   await writeFile(join(out,`${viewport.width}-${scene}-${repeat}.json`),JSON.stringify(result,null,2)+'\n');const {samples,markers,...summary}=result;summaries.push(summary);console.log(JSON.stringify({viewport,scene,repeat,frames:result.frames,push:result.push,errors}));
   await page.close();if(errors.length||raw.markers.some(m=>m.paused)||before.visibility!=='visible'||after.visibility!=='visible')throw new Error('Measurement interrupted/paused/browser errors');
  }
  // Representative actual PUSH images are a separate non-measured pass.
  for(const viewport of [{width:390,height:844,dpr:3},{width:1440,height:900,dpr:1}]){
   const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:viewport.dpr,reducedMotion:'no-preference'});
   await startScene(page,url,'PUSH');await page.locator('.decision-push-button').waitFor({state:'visible',timeout:20000});
   await page.screenshot({path:join(out,`${viewport.width}-PUSH-visible.png`)});await writeFile(join(out,`${viewport.width}-PUSH-visible.json`),JSON.stringify(await page.evaluate(()=>__session.snapshot()),null,2)+'\n');await page.close();
  }
 }finally{await browser.close();provenance.finishedAt=new Date().toISOString();provenance.runtimeUnchanged=runtimeSHA===hash(runtimeScope(await sourceFingerprint(projectRoot)));await writeFile(join(out,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');await writeFile(join(out,'summary.json'),JSON.stringify(summaries,null,2)+'\n');}
 if(!provenance.runtimeUnchanged)throw new Error('Runtime changed during measurement');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();

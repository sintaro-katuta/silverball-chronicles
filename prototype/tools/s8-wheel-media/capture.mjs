// Dedicated no-tray/photo-three-vane evidence. Saved frames only, never steps physics.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from '../../node_modules/playwright/index.mjs';
import {browserLaunchOptions} from '../../tests/browser-launch.js';
import {sha256,collectInputFiles,publicAssetInventory} from '../s8-media/trial-input.mjs';
import {canonical,same,validatePair} from './trial-input.mjs';
const fail=m=>{throw Error(m);};
async function read(file){const compressed=await fs.readFile(file),expanded=compressed[0]===31&&compressed[1]===139?gunzipSync(compressed):compressed;return {file:path.resolve(file),compressedSHA:sha256(compressed),compressedBytes:compressed.length,expandedSHA:sha256(expanded),expandedBytes:expanded.length,run:JSON.parse(expanded)};}
export async function main(argv){
 const o={};for(let i=0;i<argv.length;i+=2){if(!argv[i]?.startsWith('--')||!argv[i+1])fail('Expected --key value');o[argv[i].slice(2)]=argv[i+1];}for(const k of ['a','b','out','plan','cases','frozen-source','status'])if(!o[k])fail('Missing --'+k);
 const root=fileURLToPath(new URL('../../../',import.meta.url)),out=path.resolve(o.out);await fs.mkdir(out,{recursive:true});if((await fs.readdir(out)).length)fail('Fresh output directory required');
 const trials=await Promise.all([read(o.a),read(o.b)]),cases=JSON.parse(await fs.readFile(o.cases)),pair=validatePair(trials[0].run,trials[1].run,cases,{baselineOnly:o['baseline-only']==='true'});
 const proofPaths=[o.plan,o.cases,...trials.map((t,i)=>o[i?'provenance-b':'provenance-a']??path.join(path.dirname(t.file),'provenance.json')),...trials.map((t,i)=>o[i?'manifest-b':'manifest-a']??path.join(path.dirname(t.file),'raw-manifest.json'))].map(p=>path.resolve(p));
 const proofBytes=await Promise.all(proofPaths.map(p=>fs.readFile(p))),provs=proofBytes.slice(2,4).map(b=>JSON.parse(b)),planSHA=sha256(proofBytes[0]),caseSHA=sha256(proofBytes[1]);
 for(let i=0;i<2;i++){
  const t=trials[i],r=t.run,p=provs[i],manifest=JSON.parse(proofBytes[4+i]),row=manifest.find(v=>v.file===path.basename(t.file));
  if(p.stage!=='run'||!p.measurementStarted||p.status!=='completed'||!p.success||!p.sourceUnchanged||!p.gitUnchanged||p.commit!==p.endCommit||p.source?.sha256!==o['frozen-source']||p.endSourceSHA!==o['frozen-source']||p.source.planSHA!==planSHA||p.source.caseManifestSHA!==caseSHA)fail('Not a successful frozen same-plan measurement');
  if(!row||['compressedSHA','compressedBytes','expandedSHA','expandedBytes'].some(k=>row[k]!==t[k])||row.frames!==r.replayFrames.length||row.replayFPS!==30||row.sourceSHA!==r.sourceSHA||row.configSHA!==r.configSHA||row.layoutSHA!==r.layoutSHA)fail('Raw manifest gzip/body identity mismatch');
  if(r.sourceSHA!==o['frozen-source']||r.planSHA!==planSHA||r.caseManifestSHA!==caseSHA||r.configSHA!==sha256(canonical(r.config))||r.layoutSHA!==sha256(canonical(r.pins)))fail('Raw source/config/layout/plan identity mismatch');
 }
 const machine=collectInputFiles({base:provs[0].source,extra:provs[1].source}),mediaPaths=['replay.html','replay.js','capture.mjs','trial-input.mjs'].map(p=>fileURLToPath(new URL(p,import.meta.url))).concat([path.join(root,'prototype/tools/s8-media/trial-input.mjs'),path.join(root,'prototype/tests/browser-launch.js')]);if(o['server-config'])mediaPaths.push(path.resolve(o['server-config']));
 const inventory=()=>Promise.all(mediaPaths.map(async file=>({path:path.relative(root,file),sha256:sha256(await fs.readFile(file))})));
 async function guard(){for(const f of machine)if(sha256(await fs.readFile(path.join(root,f.path)))!==f.sha256)fail('Mechanical source changed '+f.path);for(let i=0;i<proofPaths.length;i++)if(sha256(await fs.readFile(proofPaths[i]))!==sha256(proofBytes[i]))fail('Measurement proof changed');for(const t of trials)if(sha256(await fs.readFile(t.file))!==t.compressedSHA)fail('Original raw changed');}
 await guard();const before={pair,media:await inventory(),assets:await publicAssetInventory(root),machine,proofs:proofPaths.map((file,i)=>({file,sha256:sha256(proofBytes[i])})),trials:trials.map(({run,...v})=>v),command:process.argv};await fs.writeFile(path.join(out,'inputs-before.json'),JSON.stringify(before,null,2));
 if(o['validate-only']==='true'){await guard();const after={media:await inventory(),assets:await publicAssetInventory(root)};same(before.media,after.media,'Media changed');same(before.assets,after.assets,'Assets changed');await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({success:true,scope:'Input validation only; browser not started',before,after},null,2));return;}
 const url=o.url??'http://127.0.0.1:5436/tools/s8-wheel-media/replay.html';if(new URL(url).hostname!=='127.0.0.1')fail('Local127.0.0.1 only');const input={...pair,status:o.status,cases:trials.map(t=>({run:t.run,rawSHA:t.compressedSHA}))},errors=[],samples=[];let browser,encoder;
 const ballId=o['ball-id']===undefined?null:Number(o['ball-id']);if(ballId!==null&&(!Number.isSafeInteger(ballId)||ballId<1||ballId>250))fail('Actual ball ID1..250 required');
 if(ballId!==null&&ballId!==pair.firstOutcomeDifferenceId&&!o['selection-reason'])fail('Non-minimum outcome-difference ball requires --selection-reason');
 try{
  browser=await chromium.launch(browserLaunchOptions());const page=await browser.newPage({viewport:{width:1280,height:1080},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});await page.goto(url);await page.waitForFunction(()=>window.s8WheelReview);const geometry=await page.evaluate(d=>window.s8WheelReview.load(d),input);
  async function paint(time,options={}){const receipt=await page.evaluate(({time,options})=>window.s8WheelReview.paint(time,options),{time,options:{ballId,showContact:o['show-contact']==='true',...options}});if(errors.length)fail(errors.join('\n'));return receipt;}
  const times=(o.times??'0,5,10,15').split(',').map(Number),views=(o.views??'whole,near').split(',');if(times.some(t=>!Number.isFinite(t)||t<0||t>pair.duration+1e-8))fail('Requested time outside common actual window');
  for(const time of times)for(const view of views){const receipt=await paint(time,{view}),file=`${view}-${time.toFixed(6)}s.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,receipt});}
  for(const endpoint of(o.endpoints??'stop,end').split(',').filter(Boolean)){const receipt=await paint(0,{view:'whole',endpoint}),file=`exact-${endpoint}.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,receipt});}
  if(o.results!=='false'){const receipt=await paint(0,{view:'results'}),file='results-phase-pair.png';await page.screenshot({path:path.join(out,file)});samples.push({file,receipt});}
  if(o.clip){const start=Number(o.start??0),duration=Number(o.duration??15),view=o['clip-view']??'whole';if(!['whole','near'].includes(view)||!Number.isFinite(start)||!Number.isFinite(duration)||start<0||duration<=0||duration>30||start+duration>pair.duration+1e-8||Math.abs(start*30-Math.round(start*30))>1e-8)fail('Actual30Hz aligned start/common duration<=30 required');const n=Math.round(duration*30);if(Math.abs(n-duration*30)>1e-8)fail('Duration must be30Hz aligned');
   const file=path.join(out,path.basename(o.clip));encoder=spawn(o.ffmpeg??'ffmpeg',['-hide_banner','-loglevel','error','-f','image2pipe','-framerate','30','-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-crf','21','-preset','veryfast','-pix_fmt','yuv420p','-movflags','+faststart','-y',file],{stdio:['pipe','ignore','pipe']});let stderr='';encoder.stderr.on('data',b=>{stderr+=b;});const done=once(encoder,'close'),frames=[];
   for(let i=0;i<n;i++){const time=start+i/30,receipt=await paint(time,{view});if(receipt.some(side=>Math.abs(side.actualTime-time)>1e-7))fail('Actual 1x source time mismatch');const png=await page.screenshot();if(!encoder.stdin.write(png))await once(encoder.stdin,'drain');frames.push({outputFrame:i,requestedTime:time,receipt});}encoder.stdin.end();const[exit]=await done;if(exit!==0)fail('Encoder failed '+stderr);encoder=null;samples.push({file:path.basename(file),sha256:sha256(await fs.readFile(file)),frames,speed:1,physicalStart:start,duration,fps:30,outputFrames:n});
  }
  await page.evaluate(()=>window.s8WheelReview.dispose());await guard();const after={media:await inventory(),assets:await publicAssetInventory(root)};same(before.media,after.media,'Media changed');same(before.assets,after.assets,'Assets changed');if(errors.length)fail(errors.join('\n'));await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({success:true,scope:'Same-time1x saved-position no-tray shape comparison. No product-adoption or natural-playback claim.',geometry,pair,sourceSHA:pair.sourceSHA,before,after,samples,errors,selectedBall:ballId,selectionReason:o['selection-reason']??(ballId===null?'Default first0..15s representative window':'Minimum ID with a differing actual outcome'),browser:browser.version()},null,2));console.log('S8_WHEEL_CAPTURE_DONE');
 }catch(e){await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({message:String(e),errors,samples},null,2));throw e;}finally{encoder?.kill('SIGTERM');await browser?.close();console.log('OWNED_CHROME_CLOSED');}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main(process.argv.slice(2));

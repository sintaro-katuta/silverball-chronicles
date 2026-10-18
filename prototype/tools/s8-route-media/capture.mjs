// Evidence capture only: saved30Hz scene / actual substep diagram. No solver calls.
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync,gzipSync,createGunzip} from 'node:zlib';
import {createHash} from 'node:crypto';
import readline from 'node:readline';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from '../../node_modules/playwright/index.mjs';
import {browserLaunchOptions} from '../../tests/browser-launch.js';
import {sha256,collectInputFiles,publicAssetInventory} from '../s8-media/trial-input.mjs';
import {canonical,same,validateRun,validateTraceRow,validateSummary,representatives,related} from './trial-input.mjs';
const fail=m=>{throw Error(m);};
async function fileSHA(p){const h=createHash('sha256');let bytes=0;for await(const b of createReadStream(p)){h.update(b);bytes+=b.length;}return {sha256:h.digest('hex'),bytes};}
async function readJSON(p){const b=await fs.readFile(p),x=b[0]===31&&b[1]===139?gunzipSync(b):b;return {value:JSON.parse(x),file:path.resolve(p),compressedSHA:sha256(b),compressedBytes:b.length,expandedSHA:sha256(x),expandedBytes:x.length};}
export async function readTrace(file,{ballId,ballIds=[ballId],run,summary}){
 const rows=[],compressed=createReadStream(file),unzip=createGunzip(),hash=createHash('sha256');let expandedBytes=0,total=0,seq=0,rawIndex=1;
 const compressedHash=createHash('sha256');let compressedBytes=0;compressed.on('data',b=>{compressedHash.update(b);compressedBytes+=b.length;});compressed.on('error',e=>unzip.destroy(e));compressed.pipe(unzip);unzip.on('data',b=>{hash.update(b);expandedBytes+=b.length;});
 const reader=readline.createInterface({input:unzip,crlfDelay:Infinity});const outcomes=new Map(),gapRows=new Map();
 for await(const line of reader){if(!line.trim())continue;const e=JSON.parse(line);seq=validateTraceRow(e,seq);total++;
  if(e.type==='gap-cross'){const list=gapRows.get(e.ballId)??[];list.push(e);gapRows.set(e.ballId,list);if(e.discClearAtCentreCross!==(e.clearanceAtCross>=0))fail('Gap disc flag differs from recorded actual clearance');}
  if(e.type==='outcome'){if(outcomes.has(e.ball.id))fail('Duplicate actual terminal');outcomes.set(e.ball.id,e);}
  if(e.type==='substep'&&e.stage==='after'){
   while(rawIndex<run.replayFrames.length&&run.replayFrames[rawIndex].time<e.time-1e-8)fail('Trace missed regular frame '+rawIndex);
   const f=run.replayFrames[rawIndex];if(f&&Math.abs(f.time-e.time)<=1e-8){
    const project=b=>({id:b.id,x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,front:b.front??b.leftLaunchPlane});
    same(e.balls.filter(b=>!b.dead).map(project).sort((a,b)=>a.id-b.id),f.balls.map(project).sort((a,b)=>a.id-b.id),'Trace actual positions differ from30Hz frame '+rawIndex);rawIndex++;
   }
  }
  if(ballIds.some(id=>related(e,id)))rows.push(e.type==='substep'?{...e,balls:e.balls.filter(b=>ballIds.includes(b.id))}:e);
 }
 if(rawIndex!==run.replayFrames.length||total!==summary.records||outcomes.size!==250)fail('Incomplete trace/30Hz/250 terminal coverage');
 for(const b of summary.balls){same(b.gapCrossings,gapRows.get(b.ballId)??[],'Summary gap rows differ from complete trace for ball '+b.ballId);const e=outcomes.get(b.ballId);if(!e||b.outcome.seq!==e.seq||b.outcome.time!==e.time||b.outcome.kind!==e.outcome)fail('Summary terminal differs from actual trace');}
 return {rows,identity:{file:path.resolve(file),compressedSHA:compressedHash.digest('hex'),compressedBytes,expandedSHA:hash.digest('hex'),expandedBytes,records:total,retainedRecords:rows.length,regularFramesProven:rawIndex-1}};
}
function manifestRow(manifest,file){const rows=Array.isArray(manifest)?manifest:manifest.rows??manifest.files??manifest.rawManifest??(manifest.file?[manifest]:[]);return rows.find(v=>v.file===path.basename(file)||v.path===file||path.basename(v.path??'')===path.basename(file));}
function checkManifest(row,identity){if(!row)fail('Manifest row missing '+identity.file);for(const k of ['compressedSHA','compressedBytes','expandedSHA','expandedBytes'])if(row[k]!==identity[k])fail('Manifest '+k+' differs '+identity.file);}
export async function main(argv){
 const o={};for(let i=0;i<argv.length;i+=2){if(!argv[i]?.startsWith('--')||!argv[i+1])fail('Use --key value');o[argv[i].slice(2)]=argv[i+1];}
 for(const k of ['raw','trace','summary','manifest','trace-manifest','oracle-proof','provenance','plan','cases','frozen-source','out','ball-id'])if(!o[k])fail('Missing --'+k);
 const root=fileURLToPath(new URL('../../../',import.meta.url)),out=path.resolve(o.out),ballId=Number(o['ball-id']);if(!Number.isSafeInteger(ballId)||ballId<1||ballId>250)fail('Actual ball-id1..250 required');
 await fs.mkdir(out,{recursive:true});if((await fs.readdir(out)).length)fail('Fresh evidence directory required');
 const names=['raw','summary','manifest','trace-manifest','oracle-proof','provenance','plan','cases'],inputs=Object.fromEntries(await Promise.all(names.map(async k=>[k,{file:path.resolve(o[k]),...(await fileSHA(o[k]))}])));
 const raw=await readJSON(o.raw),summary=validateSummary((await readJSON(o.summary)).value),prov=(await readJSON(o.provenance)).value,manifest=(await readJSON(o.manifest)).value,r=raw.value;const validation=validateRun(r);for(let i=0;i<25;i++){const g=summary.gaps[i];if(g.id!==`${i+1}-${i+2}`||g.classification!==([10,22].includes(i+1)?'large-break':'ordinary'))fail('Gap declaration differs');same(g.a,r.pins.find(p=>p.id===i+1),'Gap endpoint A differs from actual pin');same(g.b,r.pins.find(p=>p.id===i+2),'Gap endpoint B differs from actual pin');}
 if(prov.stage!=='run'||!prov.measurementStarted||!prov.success||!prov.sourceUnchanged||!prov.gitUnchanged||prov.commit!==prov.endCommit||prov.endSourceSHA!==o['frozen-source']||prov.source?.sha256!==o['frozen-source']||r.sourceSHA!==o['frozen-source'])fail('Frozen source/provenance failure');
 const identities=(node,key)=>{const values=new Set();const visit=n=>{if(!n||typeof n!=='object')return;if(typeof n[key]==='string')values.add(n[key]);for(const k of ['base','extra','files'])if(n[k]){if(Array.isArray(n[k]))n[k].forEach(visit);else visit(n[k]);}};visit(node);return [...values];};
 for(const [key,expected]of [['planSHA',inputs.plan.sha256],['caseManifestSHA',inputs.cases.sha256]]){const values=identities(prov.source,key);if(values.length!==1||values[0]!==expected)fail('Nested mechanical '+key+' differs');}
 if(prov.planSHA!==inputs.plan.sha256||r.planSHA!==inputs.plan.sha256||prov.caseManifestSHA!==inputs.cases.sha256||r.caseManifestSHA!==inputs.cases.sha256)fail('Different frozen plan');
 const declared=(await readJSON(o.cases)).value.cases?.find(c=>c.id===r.config.id);if(!declared)fail('Missing original baseline config');same(r.config,declared,'Raw config differs from frozen declaration');if(r.configSHA!==sha256(canonical(r.config))||r.layoutSHA!==sha256(canonical(r.pins)))fail('Canonical config/layout identity mismatch');
 const rawRow=manifestRow(manifest,o.raw);checkManifest(rawRow,raw);if(rawRow.sourceSHA!==r.sourceSHA||rawRow.configSHA!==r.configSHA||rawRow.layoutSHA!==r.layoutSHA)fail('Raw manifest source/config/layout mismatch');const oracle=(await readJSON(o['oracle-proof'])).value;if(!oracle.allExistingMeasurementFieldsExact)fail('Observation non-interference proof failed');
 const traceManifest=(await readJSON(o['trace-manifest'])).value,selection=representatives(summary),minimum=selection.find(g=>g.representativeId===ballId);if(!minimum&&!o['selection-reason'])fail('Non-minimum representative requires explicit --selection-reason');
 if(traceManifest.sourceSHA!==r.sourceSHA||traceManifest.schema!=='s8-passive-flow-trace-v1')fail('Different trace source/schema');
 const retainedIds=[...new Set([...selection.map(g=>g.representativeId),ballId])].sort((a,b)=>a-b),cachePath=o.cache?path.resolve(o.cache):null;
 // Keep the validated cache parser identity while changing only the browser wire adapter.
 const parserVersion='561565fc2186cb51c08dd1441bf82970e40541ae9a980d1de4fb55a490b8bbb5',parserFunctionSHA='a99a98d8cb230dbd00510a021b9e30cf9886fefe417ac8ae7e45a857e9eff21f';if(sha256(readTrace.toString())!==parserFunctionSHA)fail('Cache parser function changed; new cache version required');
 const validatorVersion=sha256(await fs.readFile(fileURLToPath(new URL('trial-input.mjs',import.meta.url))));
 const cacheKey={parserVersion,validatorVersion,sourceSHA:r.sourceSHA,rawSHA:raw.compressedSHA,summarySHA:inputs.summary.sha256,traceManifestSHA:inputs['trace-manifest'].sha256,planSHA:inputs.plan.sha256,retainedIds};
 let trace,cacheReceipt=null;
 if(cachePath){try{const receipt=JSON.parse(await fs.readFile(cachePath+'.receipt.json'));same(receipt.key,cacheKey,'Cached selection/input version changed');const bytes=await fs.readFile(cachePath);if(sha256(bytes)!==receipt.cacheSHA)fail('Cache SHA differs');trace=JSON.parse(gunzipSync(bytes));same(trace.key,cacheKey,'Cached body identity differs');let seq=0;for(const e of trace.rows)seq=validateTraceRow(e,seq);cacheReceipt={...receipt,reused:true};}catch(e){if(e.code!=='ENOENT')throw e;}}
 if(!trace){trace=await readTrace(o.trace,{ballIds:retainedIds,run:r,summary});trace.key=cacheKey;checkManifest(manifestRow(traceManifest,o.trace),trace.identity);if(traceManifest.records!==trace.identity.records)fail('Trace count differs');
  if(cachePath){const bytes=gzipSync(JSON.stringify(trace));await fs.mkdir(path.dirname(cachePath),{recursive:true});await fs.writeFile(cachePath,bytes,{flag:'wx'});cacheReceipt={key:cacheKey,cacheSHA:sha256(bytes),cacheBytes:bytes.length,identity:trace.identity,reused:false};await fs.writeFile(cachePath+'.receipt.json',JSON.stringify(cacheReceipt,null,2),{flag:'wx'});}
 }
 checkManifest(manifestRow(traceManifest,o.trace),trace.identity);if(traceManifest.records!==trace.identity.records)fail('Trace count differs');
 const machine=collectInputFiles(prov.source),mediaPaths=['replay.html','replay.js','trial-input.mjs','capture.mjs'].map(f=>fileURLToPath(new URL(f,import.meta.url))).concat([path.join(root,'prototype/tools/s8-media/trial-input.mjs'),path.join(root,'prototype/tests/browser-launch.js')]);if(o['server-config'])mediaPaths.push(path.resolve(o['server-config']));
 const inventory=async()=>Promise.all(mediaPaths.map(async file=>({path:path.relative(root,file),...(await fileSHA(file))})));
 const wireRows=trace.rows.filter(e=>e.type==='substep'?e.balls.some(b=>b.id===ballId):related(e,ballId)).map(e=>e.type==='substep'?{...e,balls:e.balls.filter(b=>b.id===ballId)}:e);
 const wireInput={run:r,summary,trace:wireRows,ballId},wireJSON=JSON.stringify(wireInput),wire={rows:wireRows.length,bytes:Buffer.byteLength(wireJSON),sha256:sha256(wireJSON),traceBytes:Buffer.byteLength(JSON.stringify(wireRows)),traceSHA:sha256(JSON.stringify(wireRows)),ballId,parserFunctionSHA,scope:'Actual chosen-ball substeps only; chosen-ball contact/motion/gap/outcome only. Original full cache validated and preserved.'};
 const before={media:await inventory(),assets:await publicAssetInventory(root),machine,inputs,raw:{...raw,value:undefined},trace:trace.identity,wire,cache:cacheReceipt,selection,selectionReason:o['selection-reason']??('Declared major group minimum ID: '+minimum.key),ballId,validation};
 if(sha256(readTrace.toString())!==parserFunctionSHA||before.media.find(f=>f.path.endsWith('/s8-route-media/trial-input.mjs')).sha256!==validatorVersion)fail('Parser/validator changed during stream read');
 async function guard(){for(const f of machine)if((await fileSHA(path.join(root,f.path))).sha256!==f.sha256)fail('Mechanical source changed '+f.path);for(const[k,v]of Object.entries(inputs))if((await fileSHA(v.file)).sha256!==v.sha256)fail('Proof changed '+k);if((await fileSHA(o.trace)).sha256!==trace.identity.compressedSHA)fail('Trace changed');if(cacheReceipt){if((await fileSHA(cachePath)).sha256!==cacheReceipt.cacheSHA)fail('Selected cache changed');const receipt=JSON.parse(await fs.readFile(cachePath+'.receipt.json'));same(receipt.key,cacheKey,'Cache receipt changed');if(receipt.cacheSHA!==cacheReceipt.cacheSHA)fail('Cache receipt SHA changed');}}
 await guard();await fs.writeFile(path.join(out,'inputs-before.json'),JSON.stringify(before,null,2));
 if(o['validate-only']==='true'){const after={media:await inventory(),assets:await publicAssetInventory(root)};await guard();same(before.media,after.media,'Media source changed');same(before.assets,after.assets,'Media assets changed');await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({success:true,scope:'Stream validation and selected cache only; browser/capture not started',sourceSHA:r.sourceSHA,inputs:before,after},null,2));console.log('S8_ROUTE_STREAM_VALIDATION_DONE');return;}
 const url=o.url??'http://127.0.0.1:5432/tools/s8-route-media/replay.html';if(new URL(url).hostname!=='127.0.0.1')fail('Local127.0.0.1 only');const errors=[],samples=[];let browser,encoder;
 const mode=o.mode??'scene',speed=Number(o.speed??1);let diagnosticCrop;if(o.crop){if(mode!=='diagnostic')fail('--crop is diagnostic-only world coordinates');const values=o.crop.split(',').map(Number);if(values.length!==4||values.some(v=>!Number.isFinite(v))||values[2]<=0||values[3]<=0)fail('Use --crop x,y,w,h with finite positive width/height');diagnosticCrop=Object.fromEntries(['x','y','w','h'].map((k,i)=>[k,values[i]]));}
if(!['scene','diagnostic','map'].includes(mode)||![1,.5,.25,.125].includes(speed))fail('Explicit permitted mode/speed');
 try{
  browser=await chromium.launch(browserLaunchOptions());const page=await browser.newPage({viewport:{width:1280,height:1080},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});await page.goto(url);await page.waitForFunction(()=>window.s8RouteReview);
  const geometry=await page.evaluate(d=>window.s8RouteReview.load(d),wireInput);
  async function paint(time,options={}){const receipt=await page.evaluate(({time,options})=>window.s8RouteReview.paint(time,options),{time,options:{mode,speed,...(diagnosticCrop?{diagnosticCrop}:{}),...options}});if(errors.length)fail(errors.join('\n'));return receipt;}
  for(const t of(o.times??'5').split(',').map(Number)){const receipt=await paint(t),file=`${mode}-${t.toFixed(6)}s.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,receipt});}
  if(o.endpoint){if(mode!=='scene')fail('Endpoint is separate30Hzscene card only');for(const endpoint of o.endpoint.split(',')){if(!['stop','end'].includes(endpoint))fail('Unknown endpoint');const receipt=await paint(0,{endpoint}),file=`exact-${endpoint}.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,receipt});}}
  if(o.seq){if(mode!=='diagnostic')fail('Trace sequence is diagnostic only');const receipt=await paint(0,{traceSeq:Number(o.seq)}),file=`diagnostic-seq-${o.seq}.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,receipt});}
  if(o.clip){if(mode==='map')fail('Map is a diagram, not a motion clip');const start=Number(o.start),duration=Number(o.duration);if(!Number.isFinite(start)||!Number.isFinite(duration)||start<0||duration<=0||duration>30||start+duration>validation.duration+1e-8)fail('Clip must lie in actual regular window; duration<=30physical seconds');
   const n=Math.ceil(duration/speed*30),file=path.join(out,path.basename(o.clip));encoder=spawn(o.ffmpeg??'ffmpeg',['-hide_banner','-loglevel','error','-f','image2pipe','-framerate','30','-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart','-y',file],{stdio:['pipe','ignore','pipe']});let stderr='';encoder.stderr.on('data',b=>{stderr+=b;});let processError;encoder.on('error',e=>{processError=e;});const done=once(encoder,'close');const frames=[];
   for(let i=0;i<n;i++){const time=start+i/30*speed,receipt=await paint(time);const png=await page.screenshot();if(!encoder.stdin.write(png))await once(encoder.stdin,'drain');frames.push({outputFrame:i,requestedTime:time,receipt});}encoder.stdin.end();const[exitCode]=await done;if(processError||exitCode!==0)fail('Encoder failed '+stderr+' '+processError);encoder=null;
   samples.push({file:path.basename(file),identity:await fileSHA(file),fps:30,outputFrames:n,speed,physicalStart:start,physicalLastRequested:start+(n-1)/30*speed,frames});
  }
  await page.evaluate(()=>window.s8RouteReview.dispose());await guard();const after={media:await inventory(),assets:await publicAssetInventory(root)};same(before.media,after.media,'Media source changed');same(before.assets,after.assets,'Media assets changed');if(errors.length)fail(errors.join('\n'));
  await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({success:true,scope:'Saved-position silent evidence; not narrative/PR or natural-playback acceptance',sourceSHA:r.sourceSHA,command:process.argv,geometry,inputs:before,after,samples,errors,browser:browser.version()},null,2));console.log('S8_ROUTE_CAPTURE_DONE');
 }catch(e){await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({message:String(e),samples,errors},null,2));throw e;}finally{encoder?.kill('SIGTERM');await browser?.close();console.log('OWNED_CHROME_CLOSED');}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main(process.argv.slice(2));

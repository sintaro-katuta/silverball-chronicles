// PNG evidence only. No mechanical step, audio, video encoder or narration.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {chromium} from '../../node_modules/playwright/index.mjs';
import {browserLaunchOptions} from '../../tests/browser-launch.js';
import {canonical,sha256,collectInputFiles,publicAssetInventory} from '../s8-media/trial-input.mjs';
const fail=m=>{throw Error(m);},eq=(a,b,m)=>{if(canonical(a)!==canonical(b))fail(m);};
const without=(o,ks)=>Object.fromEntries(Object.entries(o??{}).filter(([k])=>!ks.includes(k)));
const counts=['start','normal','fuzu','bonus','rush','out','returned'];
function frame(r,f,label){
 if(!f||!Number.isFinite(f.time)||!Array.isArray(f.balls)||!Number.isSafeInteger(f.spawned)||f.inFlight!==f.balls.length||new Set(f.balls.map(b=>b.id)).size!==f.balls.length)fail('Malformed frame '+label);
 if(counts.some(k=>!Number.isSafeInteger(f.counts?.[k])||f.counts[k]<0)||counts.reduce((n,k)=>n+f.counts[k],0)+f.inFlight!==f.spawned)fail('Count conservation '+label);
 for(const b of f.balls)if(['x','y','vx','vy','r'].some(k=>!Number.isFinite(b[k]))||b.r!==1.8||typeof b.leftLaunchPlane!=='boolean')fail('Actual ball/radius/layer '+label);
 if(f.mechanisms?.length!==1)fail('Expected one recorded mechanism '+label);
 const m=f.mechanisms[0],initial=r.fixed.mechanisms[0];eq(without(m,['angle','omega','lastHit']),without(initial,['angle','omega','lastHit']),'Recorded mechanism geometry changed '+label);
 if(!Number.isFinite(m.angle)||!Number.isFinite(m.omega))fail('Missing actual rotation '+label);
}
export function validateTrial(r,cases){
 const declared=cases.cases?.find(c=>c.id===r.config?.id);if(!declared)fail('Undeclared windmill case');eq(r.config,declared,'Config differs from declared case');
 const c=r.conditions,s=r.replaySampling,offset=r.config.windmillOffset;
 if(![[0,0],[-.25,0],[.25,0],[0,-.25],[0,.25]].some(([x,y])=>offset?.dx===x&&offset?.dy===y)||r.config.moves?.length!==0)fail('Windmill-only fixed displacement required');
 if(r.config.normalPower!==.18||r.config.leftAdmissionGuides!==true||r.config.hesoMouthWidth!==20||r.config.launchRailProfile!=='legacy'||Object.hasOwn(r.config,'ballRadius'))fail('Changed production defaults');
 if(c.power!==.18||c.mode!=='normal'||r.kind!=='mechanical'||c.ballRadius!==1.8||c.gravity!==690||c.updateSeconds!==1/120||c.launchInterval!==.6||c.mouthWidth!==20||c.shotLimit!==250||c.requestedMaxFiringSeconds!==300||c.actualDrainSeconds!==45||c.drain!==45||c.phase!==r.phase)fail('Fixed mechanical conditions changed');
 if(r.pins?.length!==101||new Set(r.pins.map(p=>p.id)).size!==101)fail('101 unique pins required');
 eq(r.pins,r.pinsAtEnd,'Terminal pins changed');
 if(r.configSHA!==sha256(canonical(r.config))||r.layoutSHA!==sha256(canonical(r.pins)))fail('Canonical config/layout SHA mismatch');
 eq(r.flowOptions.windmillOffset,offset,'Factory offset missing');eq(r.flowOptions.pinPositions,r.pins.map(({id,x,y})=>({id,x,y})),'Factory pin positions differ');
 if(r.flowOptions.normalPower!==.18||r.flowOptions.launchRailProfile!=='legacy'||r.flowOptions.leftAdmissionGuides!==true||r.flowOptions.hesoMouthWidth!==20||Object.hasOwn(r.flowOptions,'ballRadius'))fail('Wrong renderer factory options');
 const m=r.fixed.mechanisms?.[0];if(r.fixed.mechanisms?.length!==1||m.x!==64+offset.dx||m.y!==476.5+offset.dy||m.radius!==10||m.angle!==.28||m.omega!==0)fail('Wrong declared initial mechanism');
 if(r.display?.ballRadius!==1.8||r.display.displayBallDiameter!==null||!Number.isFinite(r.display.displayBallScale)||!Number.isFinite(r.display.spriteBoundingDiameter))fail('Default display metadata missing');
 if(r.replayFPS!==30||s.fps!==30||s.originSeconds!==0||!Number.isSafeInteger(s.stopStep)||s.stopStep<1||s.stopStep>36000||s.endStep!==s.stopStep+5400||Math.abs(c.actualFiringSeconds-s.stopStep/120)>1e-10)fail('Invalid exact stop/drain steps');
 if(r.replayFrames.length!==Math.floor(s.endStep/4)+1||s.regularFrames!==r.replayFrames.length)fail('Incomplete regular30Hz frames');
 for(let i=0;i<r.replayFrames.length;i++){const f=r.replayFrames[i];if(Math.abs(f.time-i/30)>1e-7)fail('Irregular frame time '+i);frame(r,f,'regular'+i);}
 if(Math.abs(s.regularLastSeconds-r.replayFrames.at(-1).time)>1e-8)fail('Regular last time mismatch');
 for(const key of ['stop','end']){const f=r.replayEndpoints?.[key],state=key==='stop'?r.atStop:r.end;frame(r,f,key);if(Math.abs(f.time-state.time)>1e-8||Math.abs(f.time-(key==='stop'?s.stopStep:s.endStep)/120)>1e-7||f.inFlight!==state.remaining)fail('Exact endpoint mismatch');eq(f.counts,state.counts,'Exact endpoint counts differ');}
 const shots=r.events?.filter(e=>e.type==='shot'),outcomes=r.events?.filter(e=>e.type==='outcome');if(shots?.length!==250||r.physical?.shots!==250||new Set(shots.map(e=>e.ballId)).size!==250||new Set(outcomes.map(e=>e.ballId)).size!==outcomes.length||outcomes.length+r.end.remaining!==250||r.s8ShotObservation?.rows.length!==250)fail('Exact250 shots/outcomes/observations required');
 if(Math.abs(shots.at(-1).time-(r.atStop.time-1/120))>1e-8||shots.some(e=>e.time>r.atStop.time+1e-9))fail('Did not stop at actual250th spawn');
 return {duration:r.replayFrames.at(-1).time,actualEnd:r.end.time};
}
export function validatePair(a,b,cases,{baselineOnly=false}={}){
 validateTrial(a,cases);validateTrial(b,cases);if(a.config.id!=='baseline')fail('Left side must be fresh baseline');
 if(b.config.id==='baseline'&&(!baselineOnly||canonical(a)!==canonical(b)))fail('Same-record baseline-only reference must be explicit');
 for(const[name,x,y]of[['pins',a.pins,b.pins],['display',a.display,b.display],['fixed geometry',without(a.fixed,['mechanisms']),without(b.fixed,['mechanisms'])],['config',without(a.config,['id','label','windmillOffset']),without(b.config,['id','label','windmillOffset'])],['flowOptions',without(a.flowOptions,['windmillOffset']),without(b.flowOptions,['windmillOffset'])],['conditions',without(a.conditions,['actualFiringSeconds']),without(b.conditions,['actualFiringSeconds'])],['rail geometry',a.railGeometry,b.railGeometry],['mechanism nonposition',a.fixed.mechanisms.map(m=>without(m,['x','y'])),b.fixed.mechanisms.map(m=>without(m,['x','y']))]])eq(x,y,'Pair differs beyond windmill center: '+name);
 if(a.sourceSHA!==b.sourceSHA||a.planSHA!==b.planSHA||a.caseManifestSHA!==b.caseManifestSHA||a.phase!==b.phase)fail('Different source/plan/manifest/phase');
 const duration=Math.min(a.replayFrames.at(-1).time,b.replayFrames.at(-1).time);for(let i=0;i<=Math.floor(duration*30+1e-6);i++)if(Math.abs(a.replayFrames[i].time-b.replayFrames[i].time)>1e-8)fail('Common actual time mismatch');
 return {sourceSHA:a.sourceSHA,phase:a.phase,fps:30,duration,powers:[.18,.18],caseIds:[a.config.id,b.config.id],regularLastSeconds:[a.replayFrames.at(-1).time,b.replayFrames.at(-1).time],comparison:baselineOnly?'Explicit identical fresh baseline reference':'Windmill-center-only declared comparison; common actual time, fixed pins/ball/physics'};
}
async function read(file){const compressed=await fs.readFile(file),expanded=compressed[0]===31&&compressed[1]===139?gunzipSync(compressed):compressed;return {path:path.resolve(file),rawSHA:sha256(compressed),expandedSHA:sha256(expanded),bytes:compressed.length,expandedBytes:expanded.length,run:JSON.parse(expanded)};}
export async function main(argv){
 const opts={};for(let i=0;i<argv.length;i+=2){if(!argv[i]?.startsWith('--')||!argv[i+1])fail('Expected --key value');opts[argv[i].slice(2)]=argv[i+1];}
 for(const k of ['a','b','out','plan','cases','frozen-source','provenance-a','provenance-b','manifest-a','manifest-b','status'])if(!opts[k])fail('Missing --'+k);
 const root=fileURLToPath(new URL('../../../',import.meta.url)),out=path.resolve(opts.out);await fs.mkdir(out,{recursive:true});if((await fs.readdir(out)).length)fail('Fresh output directory required');
 const trials=await Promise.all([read(opts.a),read(opts.b)]),cases=JSON.parse(await fs.readFile(opts.cases)),pair=validatePair(trials[0].run,trials[1].run,cases,{baselineOnly:opts['baseline-only']==='true'});
 const proofPaths=['plan','cases','provenance-a','provenance-b','manifest-a','manifest-b'].map(k=>path.resolve(opts[k])),proofBytes=await Promise.all(proofPaths.map(p=>fs.readFile(p))),provs=proofBytes.slice(2,4).map(b=>JSON.parse(b));
 for(let i=0;i<2;i++){const p=provs[i],t=trials[i],manifest=JSON.parse(proofBytes[4+i]),rows=Array.isArray(manifest)?manifest:manifest.rows??manifest.rawManifest??[manifest],row=rows.find(v=>v.file===path.basename(t.path));
  if(!p.success||!p.sourceUnchanged||!p.gitUnchanged||p.commit!==p.endCommit||p.endSourceSHA!==opts['frozen-source']||p.source?.sha256!==opts['frozen-source']||p.source.planSHA!==sha256(proofBytes[0])||p.source.caseManifestSHA!==sha256(proofBytes[1]))fail('Unsuccessful or different frozen provenance');
  if(!row||row.compressedSHA!==t.rawSHA||row.expandedSHA!==t.expandedSHA||row.compressedBytes!==t.bytes||row.expandedBytes!==t.expandedBytes||row.sourceSHA!==t.run.sourceSHA||row.configSHA!==t.run.configSHA||row.layoutSHA!==t.run.layoutSHA||row.frames!==t.run.replayFrames.length||row.replayFPS!==30)fail('Raw/manifest identity mismatch');
  if(t.run.sourceSHA!==opts['frozen-source']||t.run.planSHA!==sha256(proofBytes[0])||t.run.caseManifestSHA!==sha256(proofBytes[1]))fail('Raw source/plan/case manifest mismatch');
 }
 const machine=collectInputFiles({base:provs[0].source,extra:provs[1].source});
 const mediaPaths=['replay.html','replay.js','capture.mjs'].map(p=>fileURLToPath(new URL(p,import.meta.url))).concat([path.join(root,'prototype/tools/s8-media/trial-input.mjs'),path.join(root,'prototype/tests/browser-launch.js'),path.join(root,'docs/agile/s7-visual/aim-map.json')]);if(opts['server-config'])mediaPaths.push(path.resolve(opts['server-config']));
 const inventory=()=>Promise.all(mediaPaths.map(async p=>({path:path.relative(root,p),sha256:sha256(await fs.readFile(p))})));
 async function guard(){for(const f of machine)if(sha256(await fs.readFile(path.join(root,f.path)))!==f.sha256)fail('Machine source changed: '+f.path);for(let i=0;i<proofPaths.length;i++)if(sha256(await fs.readFile(proofPaths[i]))!==sha256(proofBytes[i]))fail('Proof input changed');for(const t of trials)if(sha256(await fs.readFile(t.path))!==t.rawSHA)fail('Raw changed');}
 await guard();const mediaBefore=await inventory(),assetsBefore=await publicAssetInventory(root);await fs.writeFile(path.join(out,'inputs-before.json'),JSON.stringify({pair,machine,media:mediaBefore,assets:assetsBefore,proofs:proofPaths.map((p,i)=>({path:p,sha256:sha256(proofBytes[i])})),trials:trials.map(({run,...t})=>t)},null,2));
 const times=(opts.times??'2.1,5,10').split(',').map(Number);if(times.some(t=>!Number.isFinite(t)||t<0||t>pair.duration+1e-8))fail('Time outside common regular window');
 const regions=JSON.parse(await fs.readFile(path.join(root,'docs/agile/s7-visual/aim-map.json'))).regions,input={...pair,selectionStatus:opts.status,regions,cases:trials.map(t=>({label:t.run.config.label,run:t.run,rawSHA:t.rawSHA}))};
 const url=opts.url??'http://127.0.0.1:5428/tools/s8-windmill-media/replay.html';if(new URL(url).hostname!=='127.0.0.1')fail('Local127.0.0.1 only');let browser;const errors=[],samples=[];
 try{browser=await chromium.launch(browserLaunchOptions());const page=await browser.newPage({viewport:{width:1280,height:1080},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});await page.goto(url);await page.waitForFunction(()=>window.s8WindmillReview);const geometry=await page.evaluate(d=>window.s8WindmillReview.load(d),input);
  for(const time of times)for(const view of(opts.views??'whole,upper-left,windmill,downstream').split(',')){const states=await page.evaluate(({time,view})=>window.s8WindmillReview.paint(time,{view,showRegions:view==='upper-left'}),{time,view}),file=`${view}-${time.toFixed(5)}s.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,states});}
  if(opts.endpoints!=='false')for(const endpoint of['stop','end']){const states=await page.evaluate(endpoint=>window.s8WindmillReview.paint(0,{view:'whole',endpoint}),endpoint),file=`exact-${endpoint}.png`;await page.screenshot({path:path.join(out,file)});samples.push({file,states});}
  await page.evaluate(()=>window.s8WindmillReview.dispose());await guard();const mediaAfter=await inventory(),assetsAfter=await publicAssetInventory(root);eq(mediaBefore,mediaAfter,'Media changed');if(assetsBefore.sha256!==assetsAfter.sha256)fail('Assets changed');if(errors.length)fail(errors.join('\n'));await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({success:true,scope:'PNG/endpoint evidence, not full natural playback or performance acceptance',pair,geometry,samples,errors,machineInputCount:machine.length,media:{before:mediaBefore,after:mediaAfter,unchanged:true},assets:{before:assetsBefore.sha256,after:assetsAfter.sha256,count:assetsBefore.files.length,unchanged:true},browser:browser.version()},null,2));console.log('S8_WINDMILL_CAPTURE_DONE');
 }catch(e){await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({message:String(e),errors,samples},null,2));throw e;}finally{await browser?.close();console.log('OWNED_CHROME_CLOSED');}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main(process.argv.slice(2));

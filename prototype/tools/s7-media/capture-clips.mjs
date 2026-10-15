// Silent evidence export only. Run after PM grants the frozen-source capture slot.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {chromium} from '../../node_modules/playwright/index.mjs';
import {browserLaunchOptions} from '../../tests/browser-launch.js';
import {readTrial,validatePair,sampleAt,sha256,collectInputFiles,publicAssetInventory} from './trial-input.mjs';

const opts={};
for(let i=2;i<process.argv.length;i+=2){if(!process.argv[i]?.startsWith('--')||!process.argv[i+1])throw Error('Expected --key value');opts[process.argv[i].slice(2)]=process.argv[i+1];}
for(const k of ['a','b','out','plan','frozen-source','clips','provenance-a','provenance-b','manifest-a','manifest-b'])if(!opts[k])throw Error('Missing --'+k);
const root=fileURLToPath(new URL('../../../',import.meta.url)),out=path.resolve(opts.out);
await fs.mkdir(out,{recursive:true});if((await fs.readdir(out)).length)throw Error('Fresh output directory required; history protected');
const trials=await Promise.all([readTrial(opts.a),readTrial(opts.b)]),pair=validatePair(trials[0].run,trials[1].run);
const proofPaths=['provenance-a','provenance-b','manifest-a','manifest-b','plan','clips'].map(k=>path.resolve(opts[k]));
const proofBytes=await Promise.all(proofPaths.map(p=>fs.readFile(p))),provs=proofBytes.slice(0,2).map(b=>JSON.parse(b));
for(const p of provs)if(!p.success||!p.sourceUnchanged||!p.gitUnchanged||p.commit!==p.endCommit||p.source?.sha256!==opts['frozen-source']||p.endSourceSHA!==opts['frozen-source']||p.source.planSHA!==sha256(proofBytes[4]))throw Error('Successful frozen source/plan/commit required on both sides');
if(pair.sourceSHA!==opts['frozen-source'])throw Error('Raw source differs from frozen approval');
for(let i=0;i<2;i++){
 const t=trials[i],j=JSON.parse(proofBytes[i+2]),rows=Array.isArray(j)?j:j.rows??j.rawManifest,row=rows?.find(r=>r.file===path.basename(t.path));
 if(!row||row.compressedSHA!==t.rawSHA||row.expandedSHA!==t.expandedSHA||row.compressedBytes!==t.bytes||row.expandedBytes!==t.expandedBytes||row.sourceSHA!==t.run.sourceSHA||row.configSHA!==t.run.configSHA||row.layoutSHA!==t.run.layoutSHA||row.replayFPS!==t.run.replayFPS||row.frames!==t.run.replayFrames.length)throw Error('Raw/manifest mismatch');
}
const plan=JSON.parse(proofBytes[5]);
if(!plan.selectionStatus||!Array.isArray(plan.clips)||!Array.isArray(plan.stills))throw Error('Explicit comparison status, clips and stills required');
const ids=new Set();
for(const c of plan.clips){if(!/^[a-z0-9-]+$/.test(c.id)||ids.has(c.id)||!Number.isFinite(c.start)||!Number.isFinite(c.seconds)||c.start<0||c.seconds<=0||c.start+c.seconds>pair.duration+1e-7||Math.abs(c.seconds*30-Math.round(c.seconds*30))>1e-7)throw Error('Invalid/duplicate bounded clip');ids.add(c.id);}
for(const s of plan.stills){if(!/^[a-z0-9-]+$/.test(s.id)||ids.has(s.id)||!Number.isFinite(s.time)||s.time<0||s.time>pair.duration+1e-7)throw Error('Invalid still');ids.add(s.id);}
const machine=collectInputFiles({base:provs[0].source,extra:provs[1].source});
const mediaPaths=['replay.html','replay.js','trial-input.mjs','capture-clips.mjs'].map(p=>fileURLToPath(new URL(p,import.meta.url))).concat([path.join(root,'prototype/tests/browser-launch.js'),path.join(root,'docs/agile/s7-visual/aim-map.json')]);
if(opts['server-config'])mediaPaths.push(path.resolve(opts['server-config']));
const inventory=async()=>Promise.all(mediaPaths.map(async p=>({path:path.relative(root,p),sha256:sha256(await fs.readFile(p))})));
async function guard(){
 for(const f of machine)if(sha256(await fs.readFile(path.join(root,f.path)))!==f.sha256)throw Error('Machine source changed:'+f.path);
 for(let i=0;i<proofPaths.length;i++)if(sha256(await fs.readFile(proofPaths[i]))!==sha256(proofBytes[i]))throw Error('Plan/provenance/manifest changed');
 for(const t of trials)if(sha256(await fs.readFile(t.path))!==t.rawSHA)throw Error('Raw changed');
}
await guard();const mediaBefore=await inventory(),assetsBefore=await publicAssetInventory(root);
await fs.writeFile(path.join(out,'inputs-before.json'),JSON.stringify({pair,machine,media:mediaBefore,assets:assetsBefore,proofs:proofPaths.map((p,i)=>({path:p,sha256:sha256(proofBytes[i])})),trials:trials.map(({run,...t})=>t)},null,2));
const regions=JSON.parse(await fs.readFile(path.join(root,'docs/agile/s7-visual/aim-map.json'))).regions;
const input={...pair,regions,selectionStatus:plan.selectionStatus,cases:trials.map((t,i)=>({run:t.run,rawSHA:t.rawSHA,label:plan.labels?.[i]??(i?'比較0.18（採否は別記）':'本編対照0.20')}))};
const url=opts.url??'http://127.0.0.1:5317/tools/s7-media/replay.html';if(new URL(url).hostname!=='127.0.0.1')throw Error('Local127 only');
let browser,queue=Promise.resolve(),sink=null,encoded=0;const errors=[],records=[];
try{
 browser=await chromium.launch(browserLaunchOptions());const page=await browser.newPage({viewport:{width:1280,height:1080},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(String(e)));
 await page.exposeBinding('__s7Encoded',(_,{bytes,timestamp})=>{queue=queue.then(async()=>{if(!sink)throw Error('No active encoder sink');const b=Buffer.from(bytes,'base64'),h=Buffer.alloc(12);h.writeUInt32LE(b.length);h.writeBigUInt64LE(BigInt(Math.round(timestamp*30/1e6)),4);await sink.write(h);await sink.write(b);encoded++;});return queue;});
 await page.goto(url);await page.waitForFunction(()=>window.s7Review);const geometry=await page.evaluate(d=>window.s7Review.load(d),input);
 for(const c of plan.clips){
  await guard();const file=path.join(out,c.id+'.ivf'),N=Math.round(c.seconds*30),header=Buffer.alloc(32);header.write('DKIF');header.writeUInt16LE(32,6);header.write('VP80',8);header.writeUInt16LE(1280,12);header.writeUInt16LE(1080,14);header.writeUInt32LE(30,16);header.writeUInt32LE(1,20);header.writeUInt32LE(N,24);
  sink=await fs.open(file,'w');await sink.write(header);encoded=0;queue=Promise.resolve();
  try{
   await page.evaluate(async c=>{
    let error=null;const pending=[];const enc=new VideoEncoder({error:e=>error=String(e),output:chunk=>{const b=new Uint8Array(chunk.byteLength);chunk.copyTo(b);let str='';for(const x of b)str+=String.fromCharCode(x);pending.push(window.__s7Encoded({bytes:btoa(str),timestamp:chunk.timestamp}));}});
    enc.configure({codec:'vp8',width:1280,height:1080,framerate:30,bitrate:4000000});
    try{for(let i=0;i<Math.round(c.seconds*30);i++){window.s7Review.paint(c.start+i/30,{view:c.view??'whole',ballIds:c.ballIds??null,showRegions:c.view==='upper-left',showEvents:c.view==='upper-left'});const f=new VideoFrame(window.s7Review.canvas,{timestamp:Math.round(i*1e6/30),duration:33333});enc.encode(f,{keyFrame:i%60===0});f.close();if(i%15===14){await enc.flush();await Promise.all(pending.splice(0));if(error)throw Error(error);}}await enc.flush();await Promise.all(pending);if(error)throw Error(error);}finally{enc.close();}
   },c);
   await queue;if(encoded!==N||errors.length)throw Error('Frame count or browser error');
  }finally{await sink.close();sink=null;}
  const mp4=path.join(out,c.id+'.mp4'),r=spawnSync(process.env.FFMPEG??'ffmpeg',['-v','error','-y','-i',file,'-c:v','libx264','-crf','24','-preset','fast','-pix_fmt','yuv420p','-an','-movflags','+faststart',mp4],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||'FFmpeg failed');
  const frames=Array.from({length:N},(_,i)=>({outputFrame:i,requestedTime:c.start+i/30,sides:trials.map(t=>{const s=sampleAt(t.run,c.start+i/30);return {index:s.index,actualTime:s.frame.time,frameSHA:sha256(JSON.stringify(s.frame)),spawned:s.frame.spawned,counts:s.frame.counts,inFlight:s.frame.inFlight};})}));
  await fs.writeFile(path.join(out,c.id+'-frames.json'),JSON.stringify(frames,null,2));await fs.unlink(file);records.push({...c,frames:N,encoded,path:mp4,sha256:sha256(await fs.readFile(mp4)),bytes:(await fs.stat(mp4)).size});console.log('CLIP_DONE',c.id);
 }
 for(const s of plan.stills){const states=await page.evaluate(s=>window.s7Review.paint(s.time,{view:s.view??'whole',ballIds:s.ballIds??null,showRegions:s.view==='upper-left',showEvents:s.view==='upper-left'}),s);await page.screenshot({path:path.join(out,s.id+'.png')});records.push({...s,states});}
 await page.evaluate(()=>window.s7Review.dispose());await guard();const mediaAfter=await inventory(),assetsAfter=await publicAssetInventory(root);if(JSON.stringify(mediaBefore)!==JSON.stringify(mediaAfter)||assetsBefore.sha256!==assetsAfter.sha256)throw Error('Media source/assets changed');if(errors.length)throw Error(errors.join('\n'));
 await fs.writeFile(path.join(out,'capture.json'),JSON.stringify({success:true,sourceSHA:pair.sourceSHA,sourceUnchanged:true,pair,geometry,records,media:{before:mediaBefore,after:mediaAfter,unchanged:true},assets:{beforeSHA:assetsBefore.sha256,afterSHA:assetsAfter.sha256,count:assetsBefore.files.length,unchanged:true},browser:browser.version(),errors,scope:'Silent evidence excerpts, actual stored30Hz coordinates at1x. No physics recomputation/interpolation/narration or dependent Remotion scene. Endpoint stills are separate, not continuous playback of omitted time.'},null,2));
}catch(error){await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({message:String(error),records,errors},null,2));throw error;}finally{await sink?.close();await browser?.close();console.log('OWNED_CHROME_CLOSED');}

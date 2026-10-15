import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {gunzipSync} from 'node:zlib';
export const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const fail=message=>{throw new Error(message);};
const keys=['start','normal','fuzu','bonus','rush','out','returned'];
export async function readTrial(file){
 const bytes=await fs.readFile(file);const zipped=bytes[0]===31&&bytes[1]===139;
 const expanded=zipped?gunzipSync(bytes):bytes;const run=JSON.parse(expanded.toString('utf8'));
 validateTrial(run);return {path:file,rawSHA:sha256(bytes),expandedSHA:sha256(expanded),bytes:bytes.length,expandedBytes:expanded.length,compression:zipped?'gzip':'none',run};
}
export function validateTrial(run){
 const fps=run.replayFPS,duration=run.conditions?.seconds+run.conditions?.drain;
 if(![30,60].includes(fps)||!Number.isFinite(duration)||duration<=0)fail('Expected declared30/60Hz and fire+drain duration');
 const frames=run.replayFrames;if(!Array.isArray(frames)||frames.length!==Math.round(duration*fps)+1)fail('Full firing and draining replay required; first60seconds or1second data is insufficient');
 if(!run.sourceSHA||!run.flowOptions||!Array.isArray(run.pins)||run.pins.length!==101)fail('Missing source/config or101 pins');
 if(new Set(run.pins.map(p=>p.id)).size!==101)fail('Duplicate pin IDs');
 const r=run.conditions.ballRadius;if(!Number.isFinite(r)||r<=0)fail('Missing actual radius');
 for(let i=0;i<frames.length;i++){
  const f=frames[i];if(!Number.isFinite(f.time)||Math.abs(f.time-i/fps)>1/fps+1e-7||(i&&f.time<=frames[i-1].time))fail(`Bad actual time/frame${i}`);
  if(!Array.isArray(f.balls)||!Array.isArray(f.mechanisms)||!Number.isInteger(f.spawned)||f.inFlight!==f.balls.length)fail(`Missing actual balls/mechanisms/counters/frame${i}`);
  if(keys.some(k=>!Number.isInteger(f.counts?.[k])||f.counts[k]<0))fail(`Invalid counts/frame${i}`);
  if(keys.reduce((s,k)=>s+f.counts[k],0)+f.balls.length!==f.spawned)fail(`Shot conservation failed/frame${i}`);
  if(new Set(f.balls.map(b=>b.id)).size!==f.balls.length)fail(`Duplicate ball/frame${i}`);
  for(const b of f.balls)if(['x','y','r','vx','vy'].some(k=>!Number.isFinite(b[k]))||Math.abs(b.r-r)>1e-9||typeof b.leftLaunchPlane!=='boolean')fail(`Missing actual position/radius/layer/frame${i}`);
  for(const m of f.mechanisms)if(!Number.isFinite(m.angle)||!Number.isFinite(m.omega))fail(`Missing actual mechanism state/frame${i}`);
 }
 if(Math.abs(frames[0].time)>1e-7||Math.abs(frames.at(-1).time-duration)>1/fps+1e-7)fail('Replay does not cover0..fire+drain');
 if(run.end?.remaining!==frames.at(-1).balls.length||keys.some(k=>run.end.counts[k]!==frames.at(-1).counts[k]))fail('Replay end differs from measured endpoint');
 return {fps,duration,frameCount:frames.length};
}
// S7 permits launch power differences only; pin positions are exact, too.
export const canonical=value=>JSON.stringify(value===undefined?null:normalize(value));
function normalize(v){if(Array.isArray(v))return v.map(normalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));return v;}
const without=(obj,keys)=>Object.fromEntries(Object.entries(obj??{}).filter(([k])=>!keys.includes(k)));
export function validateS7Trial(run){
 const coverage=validateTrial(run);
 if(run.kind!=='mechanical'||run.conditions.mode!=='normal'||run.config.launchRailProfile!=='legacy'||run.config.leftAdmissionGuides!==true||run.config.hesoMouthWidth!==20||run.config.moves?.length!==0)fail('S7 requires current legacy normal board, mouth20/tray/original pins');
 if(Object.hasOwn(run.flowOptions,'ballRadius')||Object.hasOwn(run.config,'ballRadius'))fail('S7 must preserve production default ball display; radius override forbidden');
 if(![.18,.19,.20,.22].includes(run.conditions.power)||run.config.normalPower!==run.conditions.power||run.flowOptions.normalPower!==run.conditions.power)fail('Power/config/flowOptions disagree with fixed S7 settings');
 if(run.flowOptions.launchRailProfile!=='legacy'||run.flowOptions.leftAdmissionGuides!==true||run.flowOptions.hesoMouthWidth!==20)fail('Flow options disagree with S7 production geometry');
 if(run.conditions.updateSeconds!==1/120||run.conditions.launchInterval!==.6||run.conditions.gravity!==690)fail('S7 fixed physics conditions changed');
 if(!run.display||run.display.ballRadius!==run.conditions.ballRadius||!Number.isFinite(run.display.displayBallScale)||!Number.isFinite(run.display.spriteBoundingDiameter))fail('Actual default display metadata required');
 if(!run.s7Observation||!Array.isArray(run.s7Observation.rows))fail('Missing S7 non-acting observation rows');
 if(!Array.isArray(run.events)||run.s7Observation.rows.length!==run.events.filter(e=>e.type==='shot').length)fail('S7 ball observations must cover actual shots');
 return coverage;
}
export function validatePair(a,b,{allowSamePower=false}={}){
 validateS7Trial(a);validateS7Trial(b);
 if(a.conditions.power===b.conditions.power&&!allowSamePower)fail('Distinct powers required; baseline-only self-reference needs explicit permission');
 for(const [name,x,y]of[
  ['conditions except power',without(a.conditions,['power']),without(b.conditions,['power'])],
  ['config except identity/power',without(a.config,['id','label','normalPower']),without(b.config,['id','label','normalPower'])],
  ['flow options except power',without(a.flowOptions,['normalPower']),without(b.flowOptions,['normalPower'])],
  ['all101 pin positions and attributes',a.pins,b.pins],['fixed geometry',a.fixed,b.fixed],['default ball display',a.display,b.display],['rail metadata',a.railGeometry,b.railGeometry]
 ])if(canonical(x)!==canonical(y))fail('S7 mismatch: '+name);
 if(a.sourceSHA!==b.sourceSHA||a.layoutSHA!==b.layoutSHA||a.phase!==b.phase||a.kind!==b.kind||a.replayFPS!==b.replayFPS||a.replayFrames.length!==b.replayFrames.length)fail('Source/layout/phase/fps/coverage differ');
 for(let i=0;i<a.replayFrames.length;i++)if(Math.abs(a.replayFrames[i].time-b.replayFrames[i].time)>1e-8)fail('Paired actual time differs at frame'+i);
 if(a.conditions.power===b.conditions.power&&canonical(a)!==canonical(b))fail('Baseline-only mode requires the identical raw recording');
 return {sourceSHA:a.sourceSHA,layoutSHA:a.layoutSHA,duration:a.conditions.seconds+a.conditions.drain,phase:a.phase,fps:a.replayFPS,powers:[a.conditions.power,b.conditions.power],comparison:allowSamePower?'Explicit same-record baseline reference':'Power-only comparison; fixed geometry, default display, all101 pins and actual frame times identical'};
}
export function sampleAt(run,time){
 const fs=run.replayFrames;if(!Number.isFinite(time)||time<0||time>fs.at(-1).time+1e-7)fail('Requested time outside actual replay');
 let l=0,h=fs.length;while(l<h){const m=(l+h)>>1;if(fs[m].time<=time+1e-8)l=m+1;else h=m;}const index=Math.max(0,l-1);return {index,frame:fs[index]};
}
export function admissionWindow(runs,side,index,before=2,after=3){
 if(![0,1].includes(side)||!Number.isInteger(index)||index<0||before<0||after<0)fail('Invalid admission selector');
 const actual=runs[side].events.filter(e=>e.type==='admission'&&e.kind==='start');const e=actual[index];if(!e||!Number.isFinite(e.time))fail('No such actual heso admission event');
 const end=Math.min(...runs.map(r=>r.conditions.seconds+r.conditions.drain));return {eventSide:side,eventIndex:index,event:e,start:Math.max(0,e.time-before),end:Math.min(end,e.time+after),note:'Both sides use same actual requested times, including side without admission; no interpolation'};
}
// Mechanical inventories may nest referenceInputs -> s6Inputs -> simulationInputs.
export function collectInputFiles(tree){
 const found=new Map();
 function visit(value){
  if(Array.isArray(value)){for(const child of value)visit(child);return;}
  if(!value||typeof value!=='object')return;
  if(typeof value.path==='string'&&typeof value.sha256==='string'){
   if(!/^[a-f0-9]{64}$/i.test(value.sha256))fail('Invalid input SHA:'+value.path);
   const previous=found.get(value.path);if(previous&&previous!==value.sha256)fail('Conflicting duplicate input:'+value.path);
   found.set(value.path,value.sha256);
  }
  for(const key of ['base','extra','files'])if(value[key]!==undefined)visit(value[key]);
 }
 visit(tree);if(!found.size)fail('Empty mechanical inventory');return [...found].sort(([a],[b])=>a.localeCompare(b)).map(([path,sha256])=>({path,sha256}));
}
export async function publicAssetInventory(root){
 const {join,relative}=await import('node:path');const files=[],missing=[],seen=new Set();
 async function walk(dir){let real;try{real=await fs.realpath(dir);}catch(e){if(e.code==='ENOENT'){missing.push(relative(root,dir));return;}throw e;}
  if(seen.has(real))return;seen.add(real);
  const list=await fs.readdir(dir,{withFileTypes:true});for(const ent of list.sort((a,b)=>a.name.localeCompare(b.name))){const name=join(dir,ent.name),st=await fs.stat(name);if(st.isDirectory())await walk(name);else if(st.isFile()){const bytes=await fs.readFile(name);files.push({path:relative(root,name),bytes:bytes.length,sha256:sha256(bytes)});}}
 }
 await walk(join(root,'prototype/public'));await walk(join(root,'prototype/node_modules/@fontsource/dotgothic16'));
 files.sort((a,b)=>a.path.localeCompare(b.path));return {scope:'Media-only superset: all existing public files plus installed DotGothic16 font package. Distinct from mechanical source identity; not proof all files were requested.',files,missing,sha256:sha256(JSON.stringify({files,missing}))};
}

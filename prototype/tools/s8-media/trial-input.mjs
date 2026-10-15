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
  const f=frames[i];if(!Number.isFinite(f.time)||Math.abs(f.time-i/fps)>1e-7||(i&&f.time<=frames[i-1].time))fail(`Bad actual time/frame${i}`);
  if(!Array.isArray(f.balls)||!Array.isArray(f.mechanisms)||!Number.isInteger(f.spawned)||f.inFlight!==f.balls.length)fail(`Missing actual balls/mechanisms/counters/frame${i}`);
  if(keys.some(k=>!Number.isInteger(f.counts?.[k])||f.counts[k]<0))fail(`Invalid counts/frame${i}`);
  if(keys.reduce((s,k)=>s+f.counts[k],0)+f.balls.length!==f.spawned)fail(`Shot conservation failed/frame${i}`);
  if(new Set(f.balls.map(b=>b.id)).size!==f.balls.length)fail(`Duplicate ball/frame${i}`);
  for(const b of f.balls)if(['x','y','r','vx','vy'].some(k=>!Number.isFinite(b[k]))||Math.abs(b.r-r)>1e-9||typeof b.leftLaunchPlane!=='boolean')fail(`Missing actual position/radius/layer/frame${i}`);
  for(const m of f.mechanisms)if(!Number.isFinite(m.angle)||!Number.isFinite(m.omega))fail(`Missing actual mechanism state/frame${i}`);
 }
 if(Math.abs(frames[0].time)>1e-7||Math.abs(frames.at(-1).time-duration)>1e-7)fail('Replay does not cover0..fire+drain');
 if(run.end?.remaining!==frames.at(-1).balls.length||keys.some(k=>run.end.counts[k]!==frames.at(-1).counts[k]))fail('Replay end differs from measured endpoint');
 return {fps,duration,frameCount:frames.length};
}
// S8 compares approved pin moves only. Launch power and all physical settings are fixed.
export const canonical=value=>JSON.stringify(value===undefined?null:normalize(value));
function normalize(v){if(Array.isArray(v))return v.map(normalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));return v;}
const without=(obj,keys)=>Object.fromEntries(Object.entries(obj??{}).filter(([k])=>!keys.includes(k)));
export const APPROVED_MOVES=Object.freeze({baseline:[], 'road-pin2':[{pinId:2,dx:0,dy:.25}], 'jump-pin90':[{pinId:90,dx:0,dy:-.25}], 'heso-pair':[{pinId:91,dx:-.25,dy:0},{pinId:92,dx:.25,dy:0}]});
export function validateS8Trial(run){
 const coverage=validateTrial(run),c=run.config,f=run.flowOptions;
 if(run.replayFPS!==30||![120,300].includes(run.conditions.seconds)||run.conditions.drain!==45)fail('S8 requires full165/345s actual30Hz');
 if(run.kind!=='mechanical'||run.conditions.mode!=='normal'||!Object.hasOwn(APPROVED_MOVES,c?.id)||canonical(c.moves)!==canonical(APPROVED_MOVES[c.id]))fail('S8 requires approved independent pin case');
 if(c.launchRailProfile!=='legacy'||c.leftAdmissionGuides!==true||c.hesoMouthWidth!==20||f.launchRailProfile!=='legacy'||f.leftAdmissionGuides!==true||f.hesoMouthWidth!==20)fail('S8 legacy/mouth20/tray fixed');
 if(Object.hasOwn(f,'ballRadius')||Object.hasOwn(c,'ballRadius'))fail('S8 default display requires omitted radius override');
 if(run.conditions.ballRadius!==1.8||run.conditions.power!==.18||c.normalPower!==.18||f.normalPower!==.18||run.conditions.updateSeconds!==1/120||run.conditions.launchInterval!==.6||run.conditions.gravity!==690)fail('S8 fixed launch/radius/physics changed');
 if(run.configSHA!==sha256(JSON.stringify(c))||run.layoutSHA!==sha256(JSON.stringify(run.pins)))fail('S8 raw config/layout identity mismatch');
 if(canonical(f.pinPositions)!==canonical(run.pins.map(({id,x,y})=>({id,x,y}))))fail('S8 flow positions differ from actual recorded pins');
 const display=run.display;
 if(!display||display.ballRadius!==1.8||display.displayBallDiameter!==null||display.textureExtent!==28||display.spriteScaleDivisor!==3||!Number.isFinite(display.displayBallScale)||!Number.isFinite(display.spriteBoundingDiameter)||Math.abs(display.spriteBoundingDiameter-28*display.displayBallScale/3)>1e-12)fail('S8 actual default radius/display required');
 if(!Array.isArray(run.s8Observation?.rows)||!Array.isArray(run.events)||run.s8Observation.rows.length!==run.events.filter(e=>e.type==='shot').length)fail('S8 actual per-shot observations required');
 return coverage;
}
export function validatePair(a,b,{allowBaselineReference=false}={}){
 validateS8Trial(a);validateS8Trial(b);
 if(a.config.id!=='baseline')fail('S8 left side must be fresh original baseline');
 const sameCase=b.config.id==='baseline';if(sameCase&&!allowBaselineReference)fail('Baseline self-reference requires explicit mode');
 for(const[name,x,y]of[
  ['conditions',a.conditions,b.conditions],['config except identity/moves',without(a.config,['id','label','moves']),without(b.config,['id','label','moves'])],
  ['flow options except positions',without(a.flowOptions,['pinPositions']),without(b.flowOptions,['pinPositions'])],
  ['fixed geometry',a.fixed,b.fixed],['default ball display',a.display,b.display],['rail metadata',a.railGeometry,b.railGeometry]
 ])if(canonical(x)!==canonical(y))fail('S8 mismatch: '+name);
 const moves=APPROVED_MOVES[b.config.id],byId=new Map(b.pins.map(p=>[p.id,p]));
 for(const p of a.pins){const q=byId.get(p.id),m=moves.find(m=>m.pinId===p.id);if(!q||canonical({...p,x:p.x+(m?.dx??0),y:p.y+(m?.dy??0)})!==canonical(q))fail('Unapproved pin position/attribute difference ID'+p.id);}
 if(a.sourceSHA!==b.sourceSHA||a.phase!==b.phase||a.kind!==b.kind||a.replayFPS!==b.replayFPS||a.replayFrames.length!==b.replayFrames.length)fail('S8 source/phase/fps/coverage differs');
 for(let i=0;i<a.replayFrames.length;i++)if(Math.abs(a.replayFrames[i].time-b.replayFrames[i].time)>1e-8)fail('S8 paired actual time differs/frame'+i);
 if(sameCase&&canonical(a)!==canonical(b))fail('S8 baseline reference must be the identical raw record');
 return {sourceSHA:a.sourceSHA,layoutSHAs:[a.layoutSHA,b.layoutSHA],duration:a.conditions.seconds+a.conditions.drain,phase:a.phase,fps:a.replayFPS,powers:[.18,.18],caseIds:[a.config.id,b.config.id],moves,comparison:sameCase?'Explicit same-record fresh baseline reference':'S8 approved independent pin-only comparison; launch/geometry/display/actual time fixed'};
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

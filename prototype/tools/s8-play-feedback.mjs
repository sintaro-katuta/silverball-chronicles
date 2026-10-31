import {createBoardFlow} from '../src/pixi/board-flow.js';
import {ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE,sourcePoint} from '../src/pixi/source-layout.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {classifyLCDContact} from '../src/dev/pin-adjustment-measurement.js';
import {readFileSync,readdirSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const profiles={
 'open-title-route':{radius:3,right:3,speed:125,pin33:-.75,pin52:-3.5,pin58:3,upper:7,light:true,soft:true,guard:false,inlet:'open-title',pin97y:2.5,pin98:-2.75,pin100y:-4,pin101y:-8,rail:'guarded-exit'},
 'pinned-title-rail':{radius:3,right:3,speed:125,pin33:-.75,pin52:-3.5,pin58:3,upper:7,light:true,soft:true,guard:false,title:true,pin97y:2.5,pin98:-2.75,pin100y:-4,pin101y:-8,rail:'guarded-exit'},
 'guarded-exit':{radius:3,right:3,speed:125,pin33:-.75,pin52:-3.5,pin58:3,upper:7,light:true,soft:true,guard:true,pin97y:2.5,pin98:-2.75,pin100y:-4,pin101y:-8,rail:'guarded-exit'},
 baseline:{},wheel:{light:true},road:{soft:true},
 ball:{radius:3,right:3},'ball-launch':{radius:3,right:3,speed:125},'ball-launch2':{radius:3,right:3,speed:160},
 'ball-clearance':{radius:3,right:3,speed:125,pin33:-.75},
 'ball-entry':{radius:3,right:3,speed:125,pin33:-.75,upper:7},
 combined:{radius:3,right:3,speed:125,pin33:-.75,upper:7,light:true,soft:true},
 'safe-large':{radius:2.2,right:3,pin58:.75,light:true,soft:true},
 guarded:{radius:3,right:3,speed:125,pin33:-.75,pin58:3,upper:7,light:true,soft:true,guard:true},
 guarded2:{radius:3,right:3,speed:125,pin33:-.75,pin52:-3.5,pin58:3,upper:7,light:true,soft:true,guard:true}
};
export function feedbackOptions(name){
 const spec=profiles[name];if(!spec)throw Error('Unknown case');
 const pinPositions=[...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE].map((p,i)=>{const id=i+1,[x,y]=sourcePoint(p),clearance=(id>=27&&id<=31?spec.upper??0:0)+(id===33?spec.pin33??0:0)+(id===52?spec.pin52??0:0)+(id===58?spec.pin58??0:0)+(id>=94&&id<=96?spec.right??0:0)+(id===98?spec.pin98??0:0);return {id,x:x+(id>=47&&id<=63?-2:0)+clearance,y:y+(id===97?spec.pin97y??0:id===100?spec.pin100y??0:id===101?spec.pin101y??0:0)};});
 return {normalPower:.18,launchRailProfile:spec.rail??'legacy',leftAdmissionGuides:false,hesoMouthWidth:20,windmillShapeProfile:'photo-three-vane',windmillOffset:{dx:0,dy:0},windmillResponseProfile:spec.light?'light-rotor-v1':'legacy',roadPinRestitution:spec.soft?.12:null,ballRadius:spec.radius??null,pixelRoadGuards:spec.guard??false,leftTitleGuard:spec.title??false,leftInletRoute:spec.inlet??'legacy',normalLaunchSpeedOffset:spec.speed??null,pinPositions};
}
const sources=()=>{const paths=readdirSync('src',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.parentPath+'/'+e.name).sort();return createHash('sha256').update(paths.map(p=>p+':'+createHash('sha256').update(readFileSync(p)).digest('hex')).join('\n')).digest('hex');};
export function measureFeedback(name,mode='normal',phase=0,shots=50){
 if(!['normal','rush','bonus'].includes(mode)||![0,.175,.35].includes(phase)||![50,250].includes(shots))throw Error('Invalid conditions');
 const out=`reference-review/s8-play-feedback-20261020/${name}-${mode}-${phase}-${shots}`;if(existsSync(out+'/result.json'))throw Error('Existing trial protected');mkdirSync(out,{recursive:true});
 const sourceBefore=sources(),options=feedbackOptions(name),model=createBoardFlow({lcd:true,...options});model.setMode(mode);const f=model.flow,p=f.physics,w=p.mechanisms[0];
 const initial=structuredClone({options,pins:p.pins,colliders:p.colliders,pockets:p.pockets,mechanisms:p.mechanisms,ballRadius:p.ballRadius,displayBallScale:p.displayBallScale,launchSpeedOffset:p.launchSpeedOffset});
 for(let i=0;i<Math.round(phase*120);i++)f.step(1/120);
 const frames=[],reversals=[],watch=[],frontIntrusions=new Set(),lastContacts=new Map(),slow=new Map();let stop=null,maxSlow=0,totalRotation=0,lastAngle=w.angle,maxOmega=0,wheelContacts=0;
 withPhysicsTrace(()=>{f.start();for(let step=0;step<360*120;step++){
  if(p.metrics.spawned>=shots&&stop===null){f.stop();stop=p.time;}
  if(stop!==null&&p.time-stop>=45)break;
  f.step(1/120);totalRotation+=Math.abs(w.angle-lastAngle);lastAngle=w.angle;maxOmega=Math.max(maxOmega,Math.abs(w.omega));
  for(const b of p.balls){if(b.leftLaunchPlane&&classifyLCDContact(b)==='centre')frontIntrusions.add(b.id);const t=b.age>12&&Math.hypot(b.vx,b.vy)<8?(slow.get(b.id)??0)+1/120:0;slow.set(b.id,t);maxSlow=Math.max(maxSlow,t);}
  for(let i=watch.length-1;i>=0;i--){const e=watch[i],b=p.balls.find(b=>b.id===e.ballId);if(!b||p.time-e.time>.75){watch.splice(i,1);continue;}e.maxRise=Math.max(e.maxRise,e.before.y-b.y);}
  if(step%4===0)frames.push({time:p.time,mechanisms:structuredClone(p.mechanisms),balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,leftLaunchPlane:!!b.leftLaunchPlane})),counts:{...f.counts},spawned:p.metrics.spawned});
 }},e=>{
  if(e.type!=='contact'||!e.velocityChanged)return;
  const list=lastContacts.get(e.before.id)??[];list.push(e);if(list.length>8)list.shift();lastContacts.set(e.before.id,list);
  if(e.part.kind==='windmill-photo-three-vane')wheelContacts++;
  if(e.part.kind==='pin'&&e.part.id<=26&&e.before.front&&e.before.vy>0&&e.after.vy<0){const r={ballId:e.before.id,pinId:e.part.id,time:e.time,before:e.before,after:e.after,restitution:e.part.restitution,maxRise:0};reversals.push(r);watch.push(r);}
 });
 const sorted=reversals.map(e=>e.maxRise).sort((a,b)=>a-b),accounted=Object.values(f.counts).reduce((a,b)=>a+b,0)+p.balls.length;
 const result={name,mode,phase,requestedShots:shots,shots:p.metrics.spawned,counts:f.counts,remaining:p.balls.length,reconciled:accounted===p.metrics.spawned,sourceBefore,sourceAfter:sources(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'Mechanical fixture with real launches, no lottery/reward; rebound window .75s after each left-road contact',initial,maxOmega,totalRotationDegrees:totalRotation*180/Math.PI,wheelContacts,frontIntrusions:[...frontIntrusions],maxSustainedSlowSeconds:maxSlow,reverseCount:reversals.length,risesOverOneDiameter:sorted.filter(h=>h>p.ballRadius*2).length,maxRise:sorted.at(-1)??0,p90Rise:sorted[Math.floor(sorted.length*.9)]??0,reversals,residual:p.balls.map(b=>({ball:b,contacts:lastContacts.get(b.id)}))};
 result.sourceUnchanged=result.sourceBefore===result.sourceAfter;
 writeFileSync(out+'/result.json',JSON.stringify(result,null,2));writeFileSync(out+'/frames.json.gz',gzipSync(JSON.stringify(frames)));
 const summary={name,mode,phase,shots:result.shots,counts:result.counts,remaining:result.remaining,reconciled:result.reconciled,maxOmega,totalRotationDegrees:result.totalRotationDegrees,reverseCount:result.reverseCount,risesOverOneDiameter:result.risesOverOneDiameter,maxRise:result.maxRise,p90Rise:result.p90Rise,frontIntrusions:result.frontIntrusions,maxSustainedSlowSeconds:maxSlow,sourceUnchanged:result.sourceUnchanged};console.log(JSON.stringify(summary));
 if(!result.sourceUnchanged||result.shots!==shots||!result.reconciled)throw Error('Invalid source/shot/accounting');return result;
}
if(process.argv[1]===fileURLToPath(import.meta.url))measureFeedback(process.argv[2]??'baseline',process.argv[3]??'normal',Number(process.argv[4]??0),Number(process.argv[5]??50));

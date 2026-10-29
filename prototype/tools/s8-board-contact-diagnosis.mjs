import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {resolveVisibleWindmill} from '../src/physics/windmill-shape-contact.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {classifyLCDContact} from '../src/dev/pin-adjustment-measurement.js';
import {mkdirSync,writeFileSync,readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const stage=process.argv[2]??'baseline',phase=Number(process.argv[3]??0),mode=process.argv[4]??'normal';
if(!['baseline','candidate','candidate2','final'].includes(stage)||![0,.175,.35].includes(phase)||!['normal','rush','bonus'].includes(mode))throw Error('Invalid comparison condition');
const runTag=process.argv[5]??'';if(runTag&&!/^[a-zA-Z0-9_-]+$/.test(runTag))throw Error('Invalid run tag');
const out=`reference-review/s8-board-consistency-20261020/${stage}-${mode}-${phase}${runTag?'-'+runTag:''}`;
if(existsSync(out+'/result.json'))throw Error('Existing trial protected; use a fresh run tag as the fourth argument');
mkdirSync(out,{recursive:true});
const hashSources=()=>{
 const paths=readdirSync('src',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.parentPath+'/'+e.name).sort();
 return createHash('sha256').update(paths.map(path=>path+':'+createHash('sha256').update(readFileSync(path)).digest('hex')).join('\n')).digest('hex');
};
const sourceBefore=hashSources();
const options=productionBoardFlowOptions();options.windmillResponseProfile=['candidate','candidate2'].includes(stage)?'coupled-impulse-v1':'legacy';
const model=createBoardFlow({lcd:true,...options});if(stage==='candidate')model.flow.physics.mechanisms[0].momentOfInertia=500;model.setMode(mode);
const {flow}=model,p=flow.physics,w=p.mechanisms[0],shots=mode==='normal'?250:50;
const initial=structuredClone({options,pins:p.pins,colliders:p.colliders,pockets:p.pockets,ballRadius:p.ballRadius,mechanisms:p.mechanisms});
const probes=[];
for(const [name,x,y,vx,vy] of [['tip-up',6,2,0,-80],['tip-down',6,-2,0,80],['weak',6,2,0,-20],['strong',6,2,0,-160],['axis',-4.5,0,80,0]]){
 const m={...w,x:0,y:0,angle:0,omega:0},b={id:1,x,y,vx,vy,r:1.8,hits:0,contactCount:0};resolveVisibleWindmill({recordRole(){}},b,m);
 probes.push({name,initial:{x,y,vx,vy},ball:b,omega:m.omega,freeDecayAngleDegrees:m.omega/.7*180/Math.PI});
}
for(let i=0;i<Math.round(phase*120);i++)flow.step(1/120);
const start=p.time,contacts=[],reverse=[],paths={},frontIntrusions=new Set(),ages=new Map();let totalRotation=0,maxOmega=0,lastAngle=w.angle,stop=null;
const frames=[];
function run(){
 flow.start();
 for(let step=0;step<360*120;step++){
  if(p.metrics.spawned>=shots&&stop===null){flow.stop();stop=p.time;}
  if(stop!==null&&p.time-stop>=45)break;
  flow.step(1/120);
  totalRotation+=Math.abs(w.angle-lastAngle);lastAngle=w.angle;maxOmega=Math.max(maxOmega,Math.abs(w.omega));
  for(const b of p.balls){if(b.leftLaunchPlane&&classifyLCDContact(b)==='centre')frontIntrusions.add(b.id);ages.set(b.id,Math.max(ages.get(b.id)??0,b.age));}
  if(step%2===0){for(const [id,path] of Object.entries(paths)){const b=p.balls.find(q=>q.id===Number(id));if(b&&path.length<180)path.push({time:p.time,x:b.x,y:b.y,vx:b.vx,vy:b.vy});}}
  if(step%4===0)frames.push({time:p.time,angle:w.angle,omega:w.omega,balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r,front:!!b.leftLaunchPlane}))});
 }
}
withPhysicsTrace(run,event=>{
 if(event.type!=='contact'||!event.velocityChanged)return;
 if(event.part.kind==='windmill-photo-three-vane')contacts.push(event);
 if(event.part.kind==='pin'&&event.part.role==='michi'&&event.before.front&&event.before.vy>0&&event.after.vy<0){reverse.push(event);paths[event.before.id]??=[];}
});
const accounted=Object.values(flow.counts).reduce((a,b)=>a+b,0)+p.balls.length;
const result={stage,phase,mode,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),createdAt:new Date().toISOString(),scope:'Mechanical fixture with real launches; no lottery, stock, reward, or forced admissions',initial,probes,shots:p.metrics.spawned,counts:flow.counts,remaining:p.balls.length,reconciled:accounted===p.metrics.spawned,seconds:p.time-start,maxOmega,totalRotationDegrees:totalRotation*180/Math.PI,wheelContacts:contacts.length,reverseDefinition:'front-plane michi-pin velocity impulse: before.vy > 0 and after.vy < 0; candidate event, not proof of reported sustained upstream travel',reverseCount:reverse.length,reverse,paths,frontIntrusions:[...frontIntrusions],agedOver12:[...ages].filter(([,age])=>age>12),diagnostics:p.diagnostics(),mechanismEnd:w};
result.sourceBefore=sourceBefore;result.sourceAfter=hashSources();result.sourceUnchanged=result.sourceBefore===result.sourceAfter;
writeFileSync(out+'/result.json',JSON.stringify(result,null,2));writeFileSync(out+'/frames.json',JSON.stringify(frames));writeFileSync(out+'/wheel-contacts.json',JSON.stringify(contacts,null,2));
if(!result.sourceUnchanged)throw Error('Source changed during measurement');
if(result.shots!==shots||!result.reconciled)throw Error('Shot/accounting mismatch');
console.log(JSON.stringify({out,shots:result.shots,counts:result.counts,remaining:result.remaining,reconciled:result.reconciled,maxOmega,totalRotationDegrees:result.totalRotationDegrees,wheelContacts:contacts.length,reverseCount:reverse.length,frontIntrusions:result.frontIntrusions,probes}));

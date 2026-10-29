import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {PROTECTED_TITLE_SOLID} from '../src/pixi/left-title-guide.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {classifyLCDContact} from '../src/dev/pin-adjustment-measurement.js';
import {readFileSync,readdirSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const mode=process.argv[2]??'normal',phase=Number(process.argv[3]??0),power=Number(process.argv[4]??.18),shots=Number(process.argv[5]??250);
if(!['normal','rush','bonus'].includes(mode)||![0,.175,.35].includes(phase)||![.18,.24,.30].includes(power)||![50,250].includes(shots))throw Error('Invalid measurement condition');
const tag=process.argv[6]??'pins-v1';if(!/^[a-zA-Z0-9_-]+$/.test(tag))throw Error('Invalid evidence tag');
const root=`reference-review/s8-launch-return-20261024/${tag}`,out=`${root}/${mode}-${phase}-${power}-${shots}`;if(existsSync(out+'/result.json'))throw Error('Existing evidence protected');mkdirSync(out,{recursive:true});
const sources=()=>{const paths=readdirSync('src',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.parentPath+'/'+e.name).sort();return Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));};
const before=sources(),options=productionBoardFlowOptions(),m=createBoardFlow({lcd:true,...options});m.setMode(mode);m.setNormalPower(power);for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);
const p=m.flow.physics,titleBody=p.leftTitleGuard?{solid:PROTECTED_TITLE_SOLID}:null,titleIntrusions=new Set(),frames=[],crossPairs=[],outcomes=[],intrusions=new Set(),entered=new Set(),slow=new Map();let stop=null,maxSlow=0;
withPhysicsTrace(()=>{m.flow.start();for(let step=0;step<360*120;step++){
 if(p.metrics.spawned>=shots&&stop===null){m.flow.stop();stop=p.time;}if(stop!==null&&p.time-stop>=45)break;
 m.flow.step(1/120);
 for(const b of p.balls){if(b.leftLaunchPlane){entered.add(b.id);if(classifyLCDContact(b)==='centre')intrusions.add(b.id);const titleHit=titleBody&&circlePolygonContact(b,titleBody.solid);if(titleHit&&titleHit.penetration>1e-5)titleIntrusions.add(b.id);}const t=b.age>12&&Math.hypot(b.vx,b.vy)<8?(slow.get(b.id)??0)+1/120:0;slow.set(b.id,t);maxSlow=Math.max(maxSlow,t);}
 if(step%12===0)frames.push({time:p.time,balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r,front:!!b.leftLaunchPlane})),counts:{...m.flow.counts}});
}},e=>{if(e.type==='contact'&&e.part.kind==='ball-pair'&&e.before.front!==e.peerBefore.front)crossPairs.push(e);if(e.type==='outcome')outcomes.push({id:e.ball.id,kind:e.outcome,front:e.ball.front});});
const result={createdAt:new Date().toISOString(),scope:'Mechanical launches, no lottery or wallet; return/entry regression, not admission-rate optimisation',mode,phase,power,requestedShots:shots,shots:p.metrics.spawned,counts:m.flow.counts,remaining:p.balls.length,residual:p.balls,frontEntries:entered.size,crossPlanePairs:crossPairs.length,frontIntrusions:[...intrusions],frontTitleIntrusions:[...titleIntrusions],maxSustainedSlowSeconds:maxSlow,valve:p.nonReturnValve,outcomes,reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+p.balls.length===p.metrics.spawned,options,sourceBefore:before,sourceAfter:sources()};
result.sourceUnchanged=JSON.stringify(result.sourceBefore)===JSON.stringify(result.sourceAfter);
writeFileSync(out+'/result.json',JSON.stringify(result,null,2));writeFileSync(out+'/frames.json.gz',gzipSync(JSON.stringify(frames)));
console.log(JSON.stringify({mode,phase,power,shots:result.shots,counts:result.counts,remaining:result.remaining,frontEntries:result.frontEntries,crossPlanePairs:result.crossPlanePairs,frontIntrusions:result.frontIntrusions,frontTitleIntrusions:result.frontTitleIntrusions,maxSlow,sourceUnchanged:result.sourceUnchanged}));
if(!result.sourceUnchanged||result.shots!==shots||!result.reconciled||result.counts.returned||result.remaining||result.crossPlanePairs||result.frontIntrusions.length||result.frontTitleIntrusions.length)throw Error('Return regression acceptance failed');

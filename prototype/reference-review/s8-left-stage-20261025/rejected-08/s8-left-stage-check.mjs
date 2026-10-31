import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePath,ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE} from '../src/pixi/source-layout.js';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const files=['physics/physics.js','physics/recessed-track.js','pixi/left-stage-route.js','pixi/source-guide-mechanics.js','pixi/source-layout.js','pixi/board-runtime.js','app/production-board-profile.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));const before=hash(),reports=[];
for(const [phase,shots]of [[0,250],[.35,250],[.525,100]]){
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),p=m.flow.physics;
 const original=sourcePath([...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE]);if(JSON.stringify(original)!==JSON.stringify(p.pins.map(p=>[p.x,p.y])))throw Error('Pin moved');
 for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);m.setMode('normal');m.flow.start();let stopped,projectionContacts=0,maxRearStop=0;const visited=new Map(),rests=new Map(),tops=new Map();
 for(let i=0;i<(shots*.6+60)*120;i++){
  if(p.metrics.spawned>=shots&&stopped===undefined){m.flow.stop();stopped=p.time;}
  m.flow.step(1/120);
  for(const b of p.balls){
   if(b.leftLaunchPlane&&(!tops.has(b.id)||b.y<tops.get(b.id).y))tops.set(b.id,{x:b.x,y:b.y});
   if(b.onLeftStage||b.leftStageExited){const v=visited.get(b.id)??{id:b.id,enteredAge:b.stageEnteredAt,entrySpeed:b.stageEntrySpeed};if(b.leftStageExited&&!v.exitAge){v.exitAge=b.stageExitedAt;v.firstFrontSource={x:b.x*2+28,y:(b.y-120)*2};v.depth=b.stageDepth;}visited.set(b.id,v);}
   if(b.onLeftStage){const prior=rests.get(b.id)??0,rest=Math.abs(b.stageSpeed)<1?prior+1/120:0;rests.set(b.id,rest);maxRearStop=Math.max(maxRearStop,rest);if(b.lastContact&&b.lastContact==='user-left-slope')projectionContacts++;}
  }
  if(stopped!==undefined&&p.time-stopped>=25)break;
 }
 const remaining=p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),onStage:!!b.onLeftStage})),visits=[...visited.values()];
 const report={phase,shots,ballRadius:p.ballRadius,sourcePinCentresUnchanged:true,stage:{...p.leftStageMetrics,inside:p.balls.filter(b=>b.onLeftStage).length,maxContinuousRestSeconds:maxRearStop,transitMin:Math.min(...visits.map(v=>v.exitAge-v.enteredAge)),transitMax:Math.max(...visits.map(v=>v.exitAge-v.enteredAge))},counts:m.flow.counts,remaining,visits,upperApexFirst10:[...tops.entries()].slice(0,10).map(([id,q])=>({id,x:q.x*2+28,y:(q.y-120)*2})),reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+remaining.length===p.metrics.spawned};
 reports.push(report);writeFileSync(out+'/cases.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({...report,visits:visits.length,upperApexFirst10:undefined}));
 if(p.metrics.spawned!==shots||!report.reconciled||report.stage.inside||report.stage.entered!==report.stage.exited||report.stage.maxContinuousRestSeconds>.5)throw Error('Stage acceptance failed');
}
const after=hash();writeFileSync(out+'/manifest.json',JSON.stringify({before,after,unchanged:JSON.stringify(before)===JSON.stringify(after),conditions:'normal .18; ball radius3; source101 centres unchanged; 25seconds drain; source point entrance174.3,634.7; interior depth/shape prototype not measured'},null,2));if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source changed');

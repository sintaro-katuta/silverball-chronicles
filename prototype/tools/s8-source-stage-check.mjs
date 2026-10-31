import {createBoardFlow} from '../src/pixi/board-flow.js';import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {sourcePath,ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE} from '../src/pixi/source-layout.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const files=['physics/physics.js','physics/recessed-stage.js','pixi/source-stage.js','pixi/source-layout.js','pixi/source-guide-trace.js','pixi/source-guide-mechanics.js','pixi/board-runtime.js','pixi/source-board-surfaces.js','app/production-board-profile.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));const before=hash(),reports=[];
const short=process.env.S8_STAGE_SHORT==='1',configs=short?[{mode:'normal',phase:0,shots:100}]:[{mode:'normal',phase:0,shots:250},{mode:'normal',phase:.35,shots:250},{mode:'normal',phase:.525,shots:100},{mode:'rush',phase:.35,shots:50},{mode:'bonus',phase:.35,shots:50}];
for(const config of configs){const{mode,phase,shots}=config,m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),p=m.flow.physics;
 const original=sourcePath([...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE]);if(JSON.stringify(original)!==JSON.stringify(p.pins.map(p=>[p.x,p.y])))throw Error('Pin moved');
 const input=JSON.parse(readFileSync(new URL('../reference-review/s8-user-guides-20261024/user-layout.json',import.meta.url))).sourcePaths;if(!p.sourceGuidePaths.every(q=>JSON.stringify(q.points)===JSON.stringify(input.find(a=>a.id===q.id).points)))throw Error('Source path changed');
 let stopped,maxStageRest=0,lcdViolations=0,escapedStage=0;const rests=new Map(),visits=new Map();
 const outcome=p.recordOutcome.bind(p);p.recordOutcome=(b,kind)=>{if(b.onSourceStage)escapedStage++;outcome(b,kind);};
 for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);m.setMode(mode);m.flow.start();
 for(let i=0;i<(shots*.6+60)*120;i++){
  if(p.metrics.spawned>=shots&&stopped===undefined){m.flow.stop();stopped=p.time;}m.flow.step(1/120);
  for(const b of p.balls){
   if(b.leftLaunchPlane&&(circlePolygonContact(b,p.sourceStage.lcd.solid)?.penetration??0)>1e-5)lcdViolations++;
   if(b.onSourceStage||b.sourceStageExited||b.sourceStageSpilled){let v=visits.get(b.id);if(!v){v={id:b.id,enteredAge:b.stageEnteredAt};visits.set(b.id,v);}if(b.sourceStageExited&&!v.exit){v.exit={age:b.stageExitedAt,x:b.x*2+28,y:(b.y-120)*2,depth:b.stageDepth};}if(b.sourceStageSpilled)v.spilled=true;}
   if(b.onSourceStage){const rest=Math.hypot(b.vx,b.vy)<1?(rests.get(b.id)??0)+1/120:0;rests.set(b.id,rest);maxStageRest=Math.max(maxStageRest,rest);}
  }
  if(stopped!==undefined&&p.time-stopped>=25)break;
 }
 const remaining=p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),onStage:!!b.onSourceStage,onRamp:!!b.onStageRamp}));
 const r={...config,counts:m.flow.counts,stage:{...p.sourceStageMetrics,remaining:remaining.filter(b=>b.onStage).length,escaped:escapedStage,maxContinuousRestSeconds:maxStageRest},lcdViolations,remaining,visits:[...visits.values()],reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+remaining.length===p.metrics.spawned,sourcePathsUnchanged:true,pinCentresUnchanged:true,ballRadius:p.ballRadius};
 reports.push(r);writeFileSync(out+'/cases.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({...r,visits:r.visits.length}));
 if(p.metrics.spawned!==shots||!r.reconciled||lcdViolations||r.stage.remaining||escapedStage||r.stage.entered!==r.stage.exited+r.stage.spilled||maxStageRest>.5||r.visits.some(v=>v.exit&&(v.exit.x<440||v.exit.x>448)))throw Error('Stage acceptance failed');
}
const after=hash();writeFileSync(out+'/manifest.json',JSON.stringify({before,after,unchanged:JSON.stringify(before)===JSON.stringify(after),scope:'actual launches, existing inverse-V source points, wallet/lottery excluded; physics depth/entrance clearance calibration not machine measurement'},null,2));if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source changed');

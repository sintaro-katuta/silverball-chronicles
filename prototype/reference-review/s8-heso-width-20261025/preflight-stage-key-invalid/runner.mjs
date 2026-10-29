import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const files=['physics/physics.js','physics/recessed-stage.js','physics/ball-flow.js','physics/pocket-sensor.js','pixi/source-stage.js','pixi/source-layout.js','pixi/source-guide-trace.js','pixi/source-guide-mechanics.js','pixi/lcd-layout.js','pixi/board-flow.js','pixi/board-runtime.js','app/production-board-profile.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));
const before=hash(),toolSha256=createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),results=[];
const selection=[20,18,16].flatMap(width=>[0,.175,.35].map(phase=>({width,phase,shots:250,stage:'selection'})));
writeFileSync(out+'/plan.json',JSON.stringify({selection,heldoutPhase:.525,selectionRule:'aggregate <=90% of baseline; each phase <=baseline; aggregate >=8%; no added local>=1s stalls or local final remaining; prefer18; heldout <=baseline and >=8% with no added local stalls/remnants',drain:45,localRegion:'abs(x-heso.x)<30 and abs(y-heso.y)<25',fixed:productionBoardFlowOptions()},null,2));
const progress=extra=>writeFileSync(out+'/progress.json',JSON.stringify({complete:false,results,...extra},null,2));
async function run(config){
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions(),hesoMouthWidth:config.width}),p=m.flow.physics,heso=p.pockets.find(p=>p.kind==='start');
 const base=createBoardFlow({lcd:true,...productionBoardFlowOptions(),hesoMouthWidth:20}).flow.physics;
 for(const key of ['pins','sourceGuidePaths','sourceStage','ballRadius','mechanisms'])if(JSON.stringify(p[key])!==JSON.stringify(base[key]))throw Error('Fixed input changed: '+key);
 const near=b=>Math.abs(b.x-heso.x)<30&&Math.abs(b.y-heso.y)<25;
 const rests=new Map(),localStalls=new Set();let maxLocalRest=0,lcdViolations=0,stopped=null,stageHeso=0,frontHeso=0;
 const record=p.recordOutcome.bind(p);p.recordOutcome=(b,kind)=>{if(kind==='start'){if(b.sourceStageExited)stageHeso++;else frontHeso++;}return record(b,kind);};
 for(let i=0;i<Math.round(config.phase*120);i++)m.flow.step(1/120);m.setMode('normal');m.flow.start();
 let next=30;
 for(let i=0;i<300*120;i++){
  if(p.metrics.spawned>=config.shots&&stopped===null){m.flow.stop();stopped=p.time;}
  m.flow.step(1/120);
  for(const b of p.balls){
   if(b.leftLaunchPlane&&(circlePolygonContact(b,p.sourceStage.lcd.solid)?.penetration??0)>1e-5)lcdViolations++;
   const rest=near(b)&&Math.hypot(b.vx,b.vy)<1?(rests.get(b.id)??0)+1/120:0;rests.set(b.id,rest);maxLocalRest=Math.max(maxLocalRest,rest);if(rest>=1)localStalls.add(b.id);
  }
  if(p.time>=next){progress({running:{...config,time:p.time,shots:p.metrics.spawned,heso:m.flow.counts.start}});next+=30;}
  if(stopped!==null&&p.time-stopped>=45)break;
 }
 const remaining=p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),nearHeso:near(b),onStage:!!b.onSourceStage}));
 const r={...config,spawned:p.metrics.spawned,time:p.time,counts:{...m.flow.counts},hesoRate:m.flow.counts.start/p.metrics.spawned,stageHeso,frontHeso,stage:{...p.sourceStageMetrics},lcdViolations,maxLocalRest,localStalls:[...localStalls],localRemaining:remaining.filter(b=>b.nearHeso).length,remaining,reconciled:Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+remaining.length===p.metrics.spawned};
 if(p.metrics.spawned!==config.shots||!r.reconciled||lcdViolations||remaining.some(b=>b.onStage))throw Error('Mechanical acceptance failed');
 results.push(r);writeFileSync(out+`/w${r.width}-p${r.phase}.json`,JSON.stringify(r,null,2));progress();console.log(JSON.stringify(r));return r;
}
for(const c of selection)await run(c);
const group=w=>results.filter(r=>r.stage==='selection'&&r.width===w),baseline=group(20),total=rows=>rows.reduce((n,r)=>n+r.counts.start,0);
const eligible=[18,16].filter(w=>{const rows=group(w);return total(rows)<=.9*total(baseline)&&total(rows)>=60&&rows.every((r,i)=>r.counts.start<=baseline[i].counts.start&&r.localStalls.length<=baseline[i].localStalls.length&&r.localRemaining<=baseline[i].localRemaining);});
const chosen=eligible[0]??null;let adopted=null;
if(chosen){const b=await run({width:20,phase:.525,shots:250,stage:'heldout'}),c=await run({width:chosen,phase:.525,shots:250,stage:'heldout'});if(c.counts.start<=b.counts.start&&c.counts.start>=20&&c.localStalls.length<=b.localStalls.length&&c.localRemaining<=b.localRemaining)adopted=chosen;}
const after=hash();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Measured source changed');
writeFileSync(out+'/manifest.json',JSON.stringify({before,after,unchanged:true,toolSha256},null,2));
writeFileSync(out+'/progress.json',JSON.stringify({complete:true,results,eligible,chosen,adopted},null,2));
console.log(JSON.stringify({eligible,chosen,adopted}));

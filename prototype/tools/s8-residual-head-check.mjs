import {createBoardFlow} from '../src/pixi/board-flow.js';import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {installSourceResidualContacts} from '../src/pixi/source-residual-contact.js';import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const files=['app/production-board-profile.js','pixi/board-flow.js','pixi/source-electric-body.js','pixi/source-residual-contact.js','pixi/source-guide-mechanics.js','pixi/source-layout.js','pixi/source-guide-trace.js','pixi/source-board-surfaces.js','physics/physics.js','physics/recessed-stage.js','physics/solid-outline-parts.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));
const before=hash(),toolHash=createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),results=[];
const configs=[true].flatMap(candidate=>[0,.175,.35].map(phase=>({candidate,phase,shots:250,stage:'comparison'})));
const prior=JSON.parse(readFileSync(out+'/../runs/progress.json')).results.filter(r=>!r.candidate);results.push(...prior);
for(const r of prior)if(r.spawned!==250||!r.reconciled)throw Error('Invalid prior baseline');
writeFileSync(out+'/plan.json',JSON.stringify({configs,heldout:[{candidate:false,phase:.525,shots:250},{candidate:true,phase:.525,shots:250}],candidate:'pin33 source x178.5 ->173.1 (5.4px within authorized6), y348.5 unchanged; right five head contacts match existing visible1.04 and sphere friction.5; same electric painted body; every other centre/source path/heso16/ball3 unchanged',drain:45,acceptance:'candidate residuals0; LCD/stage/electric body penetration0; global >=1s stalls0; exact counts; aggregate heso within10% of baseline and>=8%; no extra geometry candidates',stage:'phase .525 not used for selection',baselineSource:'../runs base cases; factory effective inputs identical to d78adea (new per-pin friction override absent in baseline)'},null,2));
const save=running=>writeFileSync(out+'/progress.json',JSON.stringify({complete:false,results,running},null,2));save();
async function run(config){
 const options=productionBoardFlowOptions();
 const m=createBoardFlow({lcd:true,...options}),p=m.flow.physics;if(config.candidate)installSourceResidualContacts(p);
 const eSolids=p.colliders.filter(c=>c.role==='source-electric-body').map(c=>c.solid),baseline=createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
 if(JSON.stringify(p.sourceGuidePaths)!==JSON.stringify(baseline.sourceGuidePaths))throw Error('Source guide changed');
 for(let i=0;i<p.pins.length;i++){const expected={...baseline.pins[i]};if(config.candidate&&expected.id===33)expected.x-=2.7;if(config.candidate&&expected.id>=97){expected.shaftRadius=expected.r;expected.r=1.04;expected.contactFriction=.5;}if(JSON.stringify(p.pins[i])!==JSON.stringify(expected))throw Error('Unexpected pin change');}
 let stopped=null,lcdViolations=0,electricViolations=0,maxRest=0,next=30;const rests=new Map(),stalls=new Set();
 for(let i=0;i<Math.round(config.phase*120);i++)m.flow.step(1/120);m.setMode('normal');m.flow.start();
 for(let i=0;i<240*120;i++){
  if(p.metrics.spawned===config.shots&&stopped===null){m.flow.stop();stopped=p.time;}m.flow.step(1/120);
  for(const b of p.balls){
   if(b.leftLaunchPlane&&(circlePolygonContact(b,p.sourceStage.lcd.solid)?.penetration??0)>1e-5)lcdViolations++;
   if(b.leftLaunchPlane&&!b.onSourceStage&&eSolids.some(s=>(circlePolygonContact(b,s)?.penetration??0)>1e-5))electricViolations++;
   const rest=Math.hypot(b.vx,b.vy)<1?(rests.get(b.id)??0)+1/120:0;rests.set(b.id,rest);maxRest=Math.max(maxRest,rest);if(rest>=1)stalls.add(b.id);
  }
  if(p.time>=next){save({...config,time:p.time,spawned:p.metrics.spawned,heso:m.flow.counts.start});next+=30;}
  if(stopped!==null&&p.time-stopped>=45)break;
 }
 const r={...config,spawned:p.metrics.spawned,counts:{...m.flow.counts},remaining:p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),onStage:!!b.onSourceStage})),lcdViolations,electricViolations,maxRest,stalls:[...stalls],stageMetrics:p.sourceStageMetrics,reconciled:Object.values(m.flow.counts).reduce((n,k)=>n+k,0)+p.balls.length===p.metrics.spawned};
 if(r.spawned!==250||!r.reconciled)throw Error('Counts fail');results.push(r);writeFileSync(out+`/${config.candidate?'candidate':'base'}-${config.phase}.json`,JSON.stringify(r,null,2));save();console.log(JSON.stringify(r));return r;
}
for(const c of configs)await run(c);
const sum=c=>results.filter(r=>r.candidate===c).reduce((n,r)=>n+r.counts.start,0),safe=r=>!r.remaining.length&&!r.lcdViolations&&!r.electricViolations&&!r.stalls.length;
let acceptance=results.filter(r=>r.candidate).every(safe)&&sum(true)>=60&&Math.abs(sum(true)-sum(false))<=.1*sum(false);
if(acceptance){await run({candidate:false,phase:.525,shots:250,stage:'confirmation'});const held=await run({candidate:true,phase:.525,shots:250,stage:'confirmation'});acceptance=safe(held)&&held.counts.start>=20;}
const after=hash();if(JSON.stringify(before)!==JSON.stringify(after)||toolHash!==createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'))throw Error('Source changed');
writeFileSync(out+'/manifest.json',JSON.stringify({before,after,unchanged:true,toolHash},null,2));writeFileSync(out+'/progress.json',JSON.stringify({complete:true,acceptance,results},null,2));console.log({acceptance});

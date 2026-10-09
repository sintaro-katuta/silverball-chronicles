import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {SessionGame} from '../src/domain/session-game.js';
import {FLOOR_ONE} from '../src/ui/floor-catalog.js';
import {sourceFingerprint,projectRoot} from './release-workflow.js';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

// Censored observation window: include both boundary gaps; drain hits cannot
// shorten a firing-window gap. Values remain unrounded in the raw result.
export function gapSummary(times,seconds){
 if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Invalid window');
 const inside=times.filter(t=>t>=0&&t<=seconds).sort((a,b)=>a-b);
 let previous=0,maxGap=0;for(const t of inside){maxGap=Math.max(maxGap,t-previous);previous=t;}
 return {entries:inside.length,maxGap:Math.max(maxGap,seconds-previous),first:inside[0]??null,last:inside.at(-1)??null,windowSeconds:seconds};
}
export function accountingCheck(initial,stock,ledger,shots){
 const expected=initial+ledger.payout+ledger.returned+ledger.supply+ledger.debugAdjustment-ledger.spent;
 return {expectedStock:expected,stockDelta:stock-expected,spentMatchesShots:ledger.spent===shots,reconciled:expected===stock};
}
export function observationWindows(row){
 const requested=row.conditions.seconds,observed=Math.min(requested,row.atStop.time);
 const hits=row.events.filter(e=>e.type==='admission'&&e.kind==='start').map(e=>e.time);
 return {requestedFiringSeconds:requested,observedPhysicsFiringSeconds:observed,firingPaddingSeconds:Math.max(0,requested-observed),requestedDrainSeconds:row.conditions.drain,observedPhysicsDrainSeconds:Math.max(0,row.end.time-row.atStop.time),observedFiringGap:gapSummary(hits,observed),requestedWindowGapIncludingPadding:gapSummary(hits,requested),stopPhase:row.session?.phase??'mechanical'};
}
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function runtimeScope(source){return source.files.filter(f=>f.path.startsWith('prototype/src/')||f.path.startsWith('prototype/public/')||['package.json','prototype/package.json','prototype/package-lock.json','prototype/vite.config.js','prototype/wrangler.jsonc'].includes(f.path));}
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
function layoutIdentity(pegSeed){const p=createBoardFlow({lcd:true,pegSeed}).flow.physics;return {pegSeed,pinsCount:p.pins.length,collidersCount:p.colliders.length,pocketsCount:p.pockets.length,pinsSHA256:hash(canonical(p.pins)),collidersSHA256:hash(canonical(p.colliders)),pocketsSHA256:hash(canonical(p.pockets))};}
async function summarize(out){
 const rows=JSON.parse(await readFile(join(out,'summary.json'),'utf8')),result=[];
 for(const row of rows){const raw=JSON.parse(await readFile(join(out,row.rawFile),'utf8'));result.push({...row,observation:observationWindows(raw),effectiveLayout:layoutIdentity(row.conditions.pegSeed)});}
 const source=await sourceFingerprint(projectRoot),original=JSON.parse(await readFile(join(out,'provenance.json'),'utf8'));
 const status=execFileSync('git',['status','--porcelain'],{cwd:projectRoot,encoding:'utf8'});
 const runtimeChanged=execFileSync('git',['diff',original.git,'--name-only','--','prototype/src','prototype/public','package.json','prototype/package.json','prototype/package-lock.json','prototype/vite.config.js','prototype/wrangler.jsonc'],{cwd:projectRoot,encoding:'utf8'}).trim();
 const supplemental={createdAt:new Date().toISOString(),runtimeSHA256:hash(runtimeScope(source)),runtimeFiles:runtimeScope(source).length,runtimeChangedAgainstMeasurementCommit:runtimeChanged,runtimeEvidence:'Start provenance status plus end git diff against recorded commit; runtime digest sampled at postprocess only',originalBroadSourceUnchanged:original.sourceUnchanged,sourceStatus:status,toolSHA256:createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),executedToolSHA256:createHash('sha256').update(await readFile(join(out,'executed-harness.mjs'))).digest('hex'),explanation:'Original guard included concurrent tools/tests; separate runtime from measurement instrumentation. Raw data and original failure are retained.'};
 await writeFile(join(out,'derived-summary.json'),JSON.stringify(result,null,2)+'\n');await writeFile(join(out,'supplemental-provenance.json'),JSON.stringify(supplemental,null,2)+'\n');
 if(runtimeChanged||result.some(r=>!r.physical.reconciled||!r.physical.uniqueOutcomeIds||r.ledger&&(!r.ledger.check.reconciled||!r.ledger.check.spentMatchesShots)))throw new Error('Runtime/count/accounting mismatch');
}
export function measureUnit({pegSeed,phase,kind='mechanical',seconds=300,drain=45}){
 if(!['mechanical','finite-stock-fixed-loss'].includes(kind))throw new Error('Unknown measurement kind');
 const game=kind==='finite-stock-fixed-loss'?new SessionGame(()=>.9):null;
 const model=createBoardFlow({lcd:true,pegSeed,normalPower:.20,...(game?{fire:()=>game.fire()}:{})});
 model.setMode('normal');const flow=model.flow,p=flow.physics,events=[];
 const spin=game?attachNormalSpin(flow,{sessionGame:game,roundModel:model,lifecycle:true,presentationPatterns:true}):null;
 if(game){const lose=flow.game.lose.bind(flow.game);flow.game.lose=b=>{lose(b);game.lose(b);};const returned=flow.game.addStock.bind(flow.game);flow.game.addStock=n=>{returned(n);game.addStock(n,'returned');};}
 for(let i=0;i<Math.round(phase*120);i++)flow.step(1/120);
 const start=p.time,initial=game?.stock??null;
 const log=(type,details={})=>events.push({time:p.time-start,type,...details});
 const spawn=p.spawn.bind(p);p.spawn=(...args)=>{const ball=spawn(...args);log('shot',{ballId:ball.id});return ball;};
 const hit=flow.game.hit.bind(flow.game);flow.game.hit=(ball,kind,id)=>{const before=game?.accounting.payout??0;hit(ball,kind,id);log('admission',{ballId:ball.id,kind,pocketId:id,payoutDelta:game?game.accounting.payout-before:null});};
 const outcome=p.recordOutcome.bind(p);p.recordOutcome=(ball,kind)=>{outcome(ball,kind);log('outcome',{ballId:ball.id,kind});};
 const stockUnavailable=[];let unavailable=false;
 const step=()=>{if(game)game.pendingBalls=p.balls.length;flow.step(1/120);if(game&&flow.continuous&&(game.stock<1)!==unavailable){unavailable=game.stock<1;stockUnavailable.push({time:p.time-start,unavailable});}};
 flow.start();for(let i=0;i<seconds*120;i++)step();flow.stop();
 const atStop={time:p.time-start,remaining:p.balls.length,counts:{...flow.counts},stock:game?.stock??null};
 for(let i=0;i<drain*120;i++)step();
 const starts=events.filter(e=>e.type==='admission'&&e.kind==='start').map(e=>e.time);
 const end={time:p.time-start,remaining:p.balls.length,counts:{...flow.counts},stock:game?.stock??null};
 const outcomes=events.filter(e=>e.type==='outcome');const shots=p.metrics.spawned;
 const physical={shots,outcomes:outcomes.length,remaining:end.remaining,reconciled:shots===outcomes.length+end.remaining,uniqueOutcomeIds:new Set(outcomes.map(e=>e.ballId)).size===outcomes.length};
 const ledger=game?{initial,final:game.stock,...game.accounting,check:accountingCheck(initial,game.stock,game.accounting,shots)}:null;
 return {conditions:{kind,pegSeed,phase,power:.20,mouthWidth:p.pockets.find(q=>q.kind==='start').w,guide:'current-factory-tray',updateSeconds:1/120,launchInterval:.6,seconds,drain,initialStock:initial,lottery:game?'constant .9 fixed-loss calibration':'no SessionGame/lottery/stock'},firingGap:gapSummary(starts,seconds),drainEntries:starts.filter(t=>t>seconds).length,atStop,end,physical,ledger,session:game?{phase:game.phase,time:game.time,draws:game.draws,accepted:spin.snapshot().accepted,hold:game.holdCount,active:game.spinActive,jackpots:game.jackpots,stockUnavailable}:null,events};
}
async function main(){
 const args=process.argv.slice(2);if(args.length===2&&args[0]==='--summarize'){await summarize(resolve(args[1]));return;}if(args.length!==2||args[0]!=='--out')throw new Error('Usage: node prototype/tools/qa05-measurement.mjs --out <evidence-dir>');
 const out=resolve(args[1]);await mkdir(out,{recursive:true});const before=await sourceFingerprint(projectRoot),runtimeBefore=hash(runtimeScope(before));
 const metadata={createdAt:new Date().toISOString(),node:process.version,platform:process.platform,git:execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim(),gitStatus:execFileSync('git',['status','--porcelain'],{cwd:projectRoot,encoding:'utf8'}),sourceSha256:before.sha256,runtimeSHA256:runtimeBefore,toolSHA256:createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),command:process.argv,scope:'Local deterministic normal-entry calibration; no natural lottery performance guarantee'};
 const rows=[];
 for(const kind of ['mechanical','finite-stock-fixed-loss'])for(const unit of FLOOR_ONE.filter(u=>u.kind==='main'))for(const phase of [0,.175,.35]){
  const row=measureUnit({pegSeed:unit.pegSeed,phase,kind});row.unitId=unit.id;row.observation=observationWindows(row);row.effectiveLayout=layoutIdentity(unit.pegSeed);
  const name=`${kind}-${unit.id}-${phase}.json`;await writeFile(join(out,name),JSON.stringify(row,null,2)+'\n');
  const {events,...summary}=row;rows.push({...summary,rawFile:name});console.log(JSON.stringify({...summary,rawFile:name}));
 }
 const after=await sourceFingerprint(projectRoot);metadata.broadSourceUnchanged=before.sha256===after.sha256;metadata.sourceUnchanged=runtimeBefore===hash(runtimeScope(after));metadata.finishedAt=new Date().toISOString();
 await writeFile(join(out,'provenance.json'),JSON.stringify(metadata,null,2)+'\n');await writeFile(join(out,'summary.json'),JSON.stringify(rows,null,2)+'\n');
 if(!metadata.sourceUnchanged||rows.some(r=>!r.physical.reconciled||!r.physical.uniqueOutcomeIds||r.ledger&&(!r.ledger.check.reconciled||!r.ledger.check.spentMatchesShots)))throw new Error('Measurement source/count/accounting mismatch');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();

// Longitudinal production-controller audit. Admission callbacks are controlled;
// saved lottery rolls are seeded uniform samples, never fixed winning outcomes.
// No display-route overrides, clock seeks, prize injection, or source edits.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {queuedHoldPrediction} from '../src/pixi/hold-prediction.js';
import {predictionPose} from '../src/pixi/prediction-plan.js';
import {createMoonCueController} from '../src/pixi/moon-cue.js';
import {specialRoutePose} from '../src/pixi/special-route-motion.js';
import {longReachPose} from '../src/pixi/long-reach-timeline.js';
import {wPublishedNormalOutcome,TOKYOGHOUL_W} from '../src/tokyoghoul-w-spec.js';

const target=Number(process.env.LONGRUN_DRAWS??10000),dir=process.env.LONGRUN_DIR??'reference-review/parallel-distribution-2026-10-05/longrun';
await mkdir(dir,{recursive:true});
const sourceFiles=['tests/presentation-longrun.mjs','src/pixi/session-game.js','src/pixi/normal-spin-flow.js','src/pixi/presentation-distribution.js','src/pixi/prediction-plan.js','src/pixi/hold-prediction.js','src/pixi/prediction-view.js','src/pixi/normal-spin-view.js','src/pixi/moon-cue.js','src/tokyoghoul-w-machine.js'];
async function sourceHashes(){const hashes={};for(const file of sourceFiles)hashes[file]=createHash('sha256').update(await readFile(new URL('../'+file,import.meta.url))).digest('hex');return hashes;}
const loadedSourceHashes=await sourceHashes();
let seed=Number(process.env.LONGRUN_SEED??739391)>>>0,rngCalls=0;
const rng=()=>{rngCalls++;seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
const game=new SessionGame(rng),model=createBoardFlow({lcd:true,fire:()=>null});
const spin=attachNormalSpin(model.flow,{sessionGame:game,roundModel:model,lifecycle:true,presentationPatterns:true});
const moon=createMoonCueController(),records=new Map(),pending={tokuzu1:[],fuzu:[]};
const counters={accepted:0,started:0,resolved:0,fifoChecks:0,rollChecks:0,pauseChecks:0,queueCueChecks:0,queueCueChanges:0,premiumLeakChecks:0,revivalLeakChecks:0,payout:0,vEntries:0,normalJackpots:0,chargeBonuses:0,rushBonuses:0};
const violations=[],tables={normal:{},rush:{}},excluded={charge:0,guaranteed:0,changedPrior:0};
const repeats={normal:{battles:0,repeats:0,last:null},rush:{battles:0,repeats:0,last:null}};
const routeSamples=[],rareSamples=[];let nextBallId=1,lastProgress=0,steps=0,lastResolvedAt=0;
function rowAdd(record,label){record.shown.add(label);}
function getRecord(id){const r=records.get(id);assert.ok(r,`Unobserved admission ${id}`);return r;}
function inlet(kind){
 const before=game.w.serial,ball={id:nextBallId++,x:200,y:470,hits:0};
 const admissionOdds=game.w.rush?.odds??TOKYOGHOUL_W.rush.odds;
 model.flow.game.hit(ball,kind,0);model.flow.physics.nextId=nextBallId;
 if(game.w.serial!==before){
  const record=Object.values(game.w.active).find(r=>r?.id===game.w.serial)??Object.values(game.w.queues).flat().find(r=>r.id===game.w.serial);
  if(record.kind==='tokuzu1'||record.kind==='fuzu'){
   const mode=record.kind==='fuzu'?'rush':'normal',lockedOdds=record.odds??admissionOdds,outcome=mode==='normal'?wPublishedNormalOutcome(record.roll).outcome:record.roll<1/lockedOdds?'electric-open':'miss';
   records.set(record.id,{id:record.id,kind:record.kind,mode,roll:record.roll,admissionOdds:lockedOdds,outcome,win:outcome==='symbol'||outcome==='electric-open',guaranteed:mode==='rush'&&(record.guaranteed??lockedOdds===1),shown:new Set(),seenQueue:false});
   pending[record.kind].push(record.id);counters.accepted++;
  }
 }
}
const start=game.startSpin.bind(game);
game.startSpin=record=>{
 const r=getRecord(record.id);assert.equal(pending[record.kind].shift(),record.id);counters.fifoChecks++;
 assert.equal(record.roll,r.roll);counters.rollChecks++;
 start(record);const result=game.spinResult;
 const effectiveOdds=record.kind==='fuzu'?(record.odds??game.w.rush?.odds??TOKYOGHOUL_W.rush.odds):null;
 r.changedPrior=record.kind==='fuzu'&&effectiveOdds!==r.admissionOdds;
 r.effectiveOdds=effectiveOdds;r.plan=result.presentationPlan;r.prediction=result.predictionPlan;r.startWin=result.win;counters.started++;
 if(result.win!==r.win)violations.push({type:'admitted-outcome-changed',drawId:r.id,roll:r.roll,mode:r.mode,admissionOdds:r.admissionOdds,effectiveOdds,admittedWin:r.win,startWin:result.win});
 if(r.outcome==='charge')excluded.charge++;else if(r.changedPrior)excluded.changedPrior++;else if(r.guaranteed)excluded.guaranteed++;
 if(r.prediction){
  const queued=queuedHoldPrediction(record,game);assert.equal(r.prediction.holdCue,queued);counters.queueCueChecks++;
 }
 if(r.plan.route==='battle'&&!r.changedPrior&&!r.guaranteed){const rep=repeats[r.mode];if(rep.last===r.plan.variant)rep.repeats++;rep.last=r.plan.variant;rep.battles++;}
};
const resolve=game.resolveDraw.bind(game);
game.resolveDraw=(win,reels)=>{
 const before=game.wRecord,r=before?getRecord(before.id):null;
 if(r){assert.equal(before.roll,r.roll);counters.rollChecks++;}
 resolve(win,reels);
 if(!r)return;
 const event=game.events.findLast(e=>e.type==='draw'&&e.id===r.id);
 assert.ok(event);r.resolvedOutcome=event.outcome;r.resolvedWin=event.outcome==='symbol'||event.outcome==='electric-open';counters.resolved++;lastResolvedAt=game.time;
 if(r.resolvedWin!==r.win&&!violations.some(v=>v.type==='admitted-outcome-changed'&&v.drawId===r.id))violations.push({type:'admitted-outcome-changed-at-resolution',drawId:r.id,mode:r.mode,admitted:r.outcome,resolved:event.outcome});
 if(r.prediction?.route!=='ordinary')assert.equal(win,r.resolvedWin);
 const eligible=r.outcome!=='charge'&&!r.guaranteed&&!r.changedPrior;
 if(eligible){
  rowAdd(r,`route:${r.plan.route}`);if(r.plan.variant)rowAdd(r,`battle:${r.plan.variant}`);
  for(const label of r.shown){const cell=tables[r.mode][label]??={seen:0,wins:0};cell.seen++;cell.wins+=r.resolvedWin?1:0;}
 }
 if(routeSamples.length<12)routeSamples.push({id:r.id,mode:r.mode,roll:r.roll,admitted:r.outcome,resolved:event.outcome,route:r.plan.route,shown:[...r.shown]});
 if((r.plan.premium||r.plan.ending==='revival'||[...r.shown].some(s=>/:(gold|red)$/.test(s))&&!r.resolvedWin)&&rareSamples.length<100)rareSamples.push({id:r.id,mode:r.mode,roll:r.roll,admitted:r.outcome,resolved:event.outcome,route:r.plan.route,ending:r.plan.ending,premium:r.plan.premium,shown:[...r.shown]});
 r.finished=true;
};

function sample(){
 for(const record of [...Object.values(game.w.active).filter(Boolean),...Object.values(game.w.queues).flat()]){
  const r=records.get(record.id);if(!r||r.finished||game.spinResult?.drawId===r.id)continue;
  const cue=queuedHoldPrediction(record,game);
  if(r.seenQueue&&r.lastQueueCue!==cue){counters.queueCueChanges++;violations.push({type:'queued-cue-changed',drawId:r.id,before:r.lastQueueCue,after:cue});}
  r.lastQueueCue=cue;r.seenQueue=true;if(cue!=='none')rowAdd(r,`hold:${cue}`);
 }
 const active=game.presentation??(game.spinActive?game.spinResult:null);if(!active)return;
 const r=getRecord(active.drawId),prediction=active.predictionPlan;
 if(prediction?.holdCue&&prediction.holdCue!=='none')rowAdd(r,`hold:${prediction.holdCue}`);
 const age=game.presentation?game.presentation.time:game.drawTimer;
 if(prediction&&!game.jackpot&&game.previewWinAt===undefined){
  const pose=predictionPose(prediction,age,{phase:game.presentation?'reach':'spin'});
  if(pose.visible&&pose.progress>0&&pose.progress<1){
   assert.ok(!/復活|全回転|確定/.test(pose.text));rowAdd(r,`${pose.stage}:${pose.family}:${pose.tier}`);
  }
 }
 const cue=moon.render(game,{phase:'idle'});
 if(cue.cueActive&&!cue.resultEffect)rowAdd(r,`moon:${cue.phase}:${cue.color}`);
 if(!game.presentation)return;
 const p=game.presentation;
 const full=!!p.win&&p.predictionPlan?.resultFamily==='fullrotation';
 const special=specialRoutePose({route:['basic','direct'].includes(p.displayRoute)?p.displayRoute:'battle',mode:p.presentationMode,win:p.win,time:p.time,premium:full?null:p.premium,premiumAt:p.premiumAt});
 if(p.time<45.5){assert.equal(special.premiumVisible,false);counters.premiumLeakChecks++;}
 if(special.premiumVisible)rowAdd(r,`premium:${p.premium}`);
 if(full&&p.time>=45.5&&p.time<51.7)rowAdd(r,'premium:fullrotation');
 if(p.reachEnding==='revival'){
  const pose=longReachPose(p.time,{variant:p.reachVariant,ending:p.reachEnding,win:p.win});
  if(p.time<54){assert.ok(!['revive','return'].includes(pose.cut));counters.revivalLeakChecks++;}
  else rowAdd(r,'revival:revealed');
 }
 if(!p.win){assert.equal(p.premium,null);assert.notEqual(p.reachEnding,'revival');assert.notEqual(p.displayRoute,'direct');assert.notEqual(p.displayRoute,'flash');}
}

function pauseCheck(){
 const before={g:game.time,p:model.flow.physics.time,draw:game.drawTimer,reach:game.presentation?.time,rngCalls,queues:JSON.stringify(game.w.queues)};
 game.pause();model.flow.step(.05);assert.deepEqual({g:game.time,p:model.flow.physics.time,draw:game.drawTimer,reach:game.presentation?.time,rngCalls,queues:JSON.stringify(game.w.queues)},before);game.resume();counters.pauseChecks++;
 model.flow.pause(true);model.flow.step(.05);assert.equal(game.time,before.g);assert.equal(model.flow.physics.time,before.p);model.flow.pause(false);counters.pauseChecks++;
}

const startTime=Date.now();
while(counters.resolved<target||Object.values(game.w.queues).some(q=>q.length)||game.spinActive||game.presentation||game.jackpot||game.w.pendingV||game.w.electricOpen||game.previewWinAt!==undefined){
 if(game.time-lastResolvedAt>1200){
  violations.push({type:'controller-drain-stalled',resolved:counters.resolved,accepted:counters.accepted,phase:game.phase,time:game.time,rush:game.w.rush,queues:structuredClone(game.w.queues),active:structuredClone(game.w.active),presentation:game.presentation,jackpot:game.jackpot,preview:game.previewWinAt,round:spin.rounds?.snapshot()});break;
 }
 if(counters.accepted>=target&&!game.rush&&game.w.queues.fuzu.length&&!game.spinActive&&!game.presentation&&!game.jackpot&&!game.w.pendingV&&!game.w.electricOpen){
  violations.push({type:'stranded-fuzu-after-rush',pending:game.w.queues.fuzu.map(r=>r.id)});break;
 }
 // Normal holds legitimately wait through RUSH. Once the main cohort closes,
 // continue fuzu admissions only while those existing normal holds need the
 // current RUSH to finish. This bridge is sampled and reported, never forced.
 const waitingNormal=game.w.queues.tokuzu1.length||game.w.active.tokuzu1;
 if(counters.accepted<target+4||game.rush&&waitingNormal){
  const kind=game.rush?'fuzu':'start',key=game.rush?'fuzu':'tokuzu1';
  if((game.rush||!game.jackpot&&!game.entryPrelude)&&game.w.queues[key].length<4)inlet(kind);
 }
 if(game.w.electricOpen&&model.tulip.state().progress>=1-1e-8){
  while(game.w.electricOpen)inlet('rush');
 }
 if(game.w.pendingV&&model.attacker.state().progress>=1-1e-8){inlet('bonus');counters.vEntries++;}
 else if(game.jackpot&&spin.rounds?.snapshot().phase==='open'){
  const before=game.ledger.payout,charge=game.jackpot.charge,fromRush=game.jackpot.fromRush;
  const old=game.w.bonus;
  while(game.w.bonus===old&&game.w.bonus?.open)inlet('bonus');
  counters.payout+=game.ledger.payout-before;
  if(!game.jackpot){counters[charge?'chargeBonuses':fromRush?'rushBonuses':'normalJackpots']++;}
 }
 model.flow.step(.05);steps++;sample();
 assert.equal(game.accounting.reconciled,true);
 if(counters.resolved>=lastProgress+1000){
  lastProgress=counters.resolved;pauseCheck();console.log(JSON.stringify({resolved:counters.resolved,time:game.time,wallSeconds:(Date.now()-startTime)/1000,violations:violations.length}));
  await writeFile(dir+'/checkpoint.json',JSON.stringify({counters,excluded,violations,time:game.time,loadedSourceHashes},null,2));
 }
 if(steps>target*4000+100000)throw Error('Longitudinal controller did not drain');
}
pauseCheck();
for(const table of Object.values(tables))for(const row of Object.values(table)){
 const z=1.96,n=row.seen,estimate=row.wins/n,denom=1+z*z/n,center=(estimate+z*z/(2*n))/denom,half=z*Math.sqrt(estimate*(1-estimate)/n+z*z/(4*n*n))/denom;
 row.reliability=estimate;row.interval95=[Math.max(0,center-half),Math.min(1,center+half)];
}
const hashes=await sourceHashes(),changedFiles=sourceFiles.filter(file=>hashes[file]!==loadedSourceHashes[file]);
const output={scope:'Production SessionGame + boardFlow + normalSpin; seeded uniform saved lottery results; controlled inlet callbacks, no route/result overrides, no clock seeks. Pose visibility is sampled headlessly, not a rendered browser.',seed:Number(process.env.LONGRUN_SEED??739391),target,counters,excluded,tables,repeats,violations,routeSamples,rareSamples,virtualSeconds:game.time,wallSeconds:(Date.now()-startTime)/1000,steps,rngCalls,accounting:game.accounting,hashes,loadedSourceHashes,changedFiles};
await writeFile(dir+'/controller-check.json',JSON.stringify(output,null,2));console.log(JSON.stringify({completed:counters.resolved>=target,counters,excluded,violations:violations.length,wallSeconds:output.wallSeconds}));

// Local comparison uses existing factory and qa05 conditions, never modifies production.
import {createBoardFlow} from '../pixi/board-flow.js';
import {attachNormalSpin} from '../pixi/normal-spin-flow.js';
import {GRAVITY} from '../physics/physics.js';
import {SessionGame} from '../domain/session-game.js';
import {createBaselineLayout,resolvePins,layoutHash,constraintHash,sha256,canonicalJSON} from './pin-layout-model.js';
export const COMPARISON_CONDITIONS=Object.freeze({phases:[0,.175,.35],kinds:['mechanical','finite-stock-fixed-loss'],seconds:300,drain:45,power:.20,launchInterval:.6,updateSeconds:1/120,mouthWidth:20,gravity:GRAVITY,guide:'current-factory-tray',initialStock:400,finiteLottery:'constant .9 fixed-loss calibration'});
export function gapSummary(times,seconds){const inside=times.filter(t=>t>=0&&t<=seconds).sort((a,b)=>a-b);let previous=0,maxGap=0;for(const t of inside){maxGap=Math.max(maxGap,t-previous);previous=t;}return {entries:inside.length,maxGap:Math.max(maxGap,seconds-previous),first:inside[0]??null,last:inside.at(-1)??null,windowSeconds:seconds};}
export function measureLayout(layout,{phase=0,kind='mechanical',seconds=300,drain=45,onProgress=()=>{}}={}){
 // Short windows are explicitly recorded for direct tests, not accepted full comparison.
 if(!COMPARISON_CONDITIONS.phases.includes(phase)||!COMPARISON_CONDITIONS.kinds.includes(kind)||!Number.isFinite(seconds)||seconds<=0||seconds>300||!Number.isFinite(drain)||drain<0||drain>45||Math.abs(seconds*120-Math.round(seconds*120))>1e-6||Math.abs(drain*120-Math.round(drain*120))>1e-6)throw new Error('Unsupported measurement conditions');
 const pins=resolvePins(layout),game=kind==='finite-stock-fixed-loss'?new SessionGame(()=>.9):null;
 const model=createBoardFlow({lcd:true,normalPower:.20,launchInterval:.6,...(game?{fire:()=>game.fire()}:{})});
 model.flow.physics.pins=structuredClone(pins);model.setMode('normal');
 const flow=model.flow,p=flow.physics,events=[],frames=[];
 const fixed=structuredClone({gravity:GRAVITY,ballRadius:p.ballRadius,colliders:p.colliders,pockets:p.pockets,mechanisms:p.mechanisms,outlet:p.outlet,launchExit:p.launchExit,launchSpeedOffset:p.launchSpeedOffset,gate:p.gate,rightChucker:p.rightChucker,returnOutlet:p.returnOutlet,separateLaunchPlane:p.separateLaunchPlane});
 if(p.pockets.find(q=>q.kind==='start').w!==20)throw new Error('Factory mouth width changed; comparison requires review');
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
 const frame=()=>frames.push({time:p.time-start,balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r})),counts:{...flow.counts}});
 frame();flow.start();const total=Math.round((seconds+drain)*120);let n=0;
 for(let i=0;i<Math.round(seconds*120);i++){step();n++;if(n%120===0){frame();onProgress({phase,kind,completedSeconds:n/120,totalSeconds:total/120,stage:'firing'});}}
 flow.stop();const atStop={time:p.time-start,remaining:p.balls.length,counts:{...flow.counts},stock:game?.stock??null};
 for(let i=0;i<Math.round(drain*120);i++){step();n++;if(n%120===0){frame();onProgress({phase,kind,completedSeconds:n/120,totalSeconds:total/120,stage:'drain'});}}
 frame();const end={time:p.time-start,remaining:p.balls.length,counts:{...flow.counts},stock:game?.stock??null},shots=p.metrics.spawned,outcomes=events.filter(e=>e.type==='outcome');
 const ids=outcomes.map(e=>e.ballId),shotIds=new Set(events.filter(e=>e.type==='shot').map(e=>e.ballId));
 const physical={shots,outcomes:outcomes.length,remaining:end.remaining,reconciled:shots===outcomes.length+end.remaining,uniqueOutcomeIds:new Set(ids).size===ids.length,allOutcomesFromShots:ids.every(id=>shotIds.has(id)),countsMatchOutcomes:Object.values(end.counts).reduce((a,b)=>a+b,0)===outcomes.length};
 const ledger=game?{initial,final:game.stock,...game.accounting}:null;
 if(ledger){const expected=initial+ledger.payout+ledger.returned+ledger.supply+ledger.debugAdjustment-ledger.spent;ledger.check={expectedStock:expected,stockDelta:game.stock-expected,spentMatchesShots:ledger.spent===shots,reconciled:game.stock===expected};}
 const observed=Math.min(seconds,atStop.time),starts=events.filter(e=>e.type==='admission'&&e.kind==='start').map(e=>e.time);
 const observation={requestedFiringSeconds:seconds,observedPhysicsFiringSeconds:observed,firingPaddingSeconds:Math.max(0,seconds-observed),requestedDrainSeconds:drain,observedPhysicsDrainSeconds:Math.max(0,end.time-atStop.time),observedFiringGap:gapSummary(starts,observed),requestedWindowGapIncludingPadding:gapSummary(starts,seconds),stopPhase:game?.phase??'mechanical'};
 const result={phase,kind,conditions:{phase,kind,seconds,drain,power:.20,launchInterval:.6,updateSeconds:1/120,mouthWidth:20,gravity:GRAVITY,guide:'current-factory-tray',initialStock:initial,lottery:game?'constant .9 fixed-loss calibration':'no SessionGame/lottery/stock'},events,frames,pins,fixed,atStop,end,physical,ledger,observation,routeMetrics:model.leftMetrics.snapshot(),mechanismEndState:structuredClone(p.mechanisms),drainEntries:starts.filter(t=>t>seconds).length,session:game?{phase:game.phase,time:game.time,draws:game.draws,accepted:spin.snapshot().accepted,hold:game.holdCount,active:game.spinActive,jackpots:game.jackpots,stockUnavailable}:null};
 if(!physical.reconciled||!physical.uniqueOutcomeIds||!physical.allOutcomesFromShots||!physical.countsMatchOutcomes||ledger&&(!ledger.check.reconciled||!ledger.check.spentMatchesShots))throw Object.assign(new Error('Measurement count/accounting mismatch'),{result});
 return result;
}
export async function compareLayouts(candidate,{onProgress=()=>{},codeSHA=null,seconds=300,drain=45}={}){
 const baseline=createBaselineLayout();resolvePins(candidate);const result={conditions:{...COMPARISON_CONDITIONS,seconds,drain},conditionHash:null,codeSHA,codeSHAProvided:typeof codeSHA==='string'&&/^[a-f0-9]{64}$/.test(codeSHA),constraintHash:await constraintHash(),baseline:{layoutHash:await layoutHash(baseline),runs:[]},candidate:{layoutHash:await layoutHash(candidate),runs:[]},comparable:false,errors:[],scope:'Local deterministic normal physics; finite stock fixed-loss calibration is separate from natural lottery performance',fullWindow:seconds===300&&drain===45};
 result.conditionHash=await sha256(result.conditions);
 for(const name of ['baseline','candidate'])for(const kind of COMPARISON_CONDITIONS.kinds)for(const phase of COMPARISON_CONDITIONS.phases){
  onProgress({layout:name,kind,phase,stage:'starting'});
  const run=measureLayout(name==='baseline'?baseline:candidate,{phase,kind,seconds,drain,onProgress:p=>onProgress({layout:name,...p})});
  run.fixedHash=await sha256(run.fixed);result[name].runs.push(run);
 }
 const pairs=result.baseline.runs.map((b,i)=>[b,result.candidate.runs[i]]);
 for(const [b,c]of pairs)if(canonicalJSON(b.conditions)!==canonicalJSON(c.conditions)||b.fixedHash!==c.fixedHash)result.errors.push('Non-layout comparison condition mismatch');
 result.comparable=result.errors.length===0;
 return result;
}

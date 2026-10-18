// Internal windmill-only count-limited S8 trials. No product default, solver or layout mutation.
import {inspectWindmillOffset} from '../pixi/windmill-offset.js';
import {createBoardFlow} from '../pixi/board-flow.js';
import {resolvePinAdjustment} from './pin-adjustment.js';
import {measurePinAdjustment} from './pin-adjustment-measurement.js';
import {withS7Observation,summarizeS7} from './s7-launch-observation.js';
import {REFERENCE_PLAN} from './s6-reference-pin-comparison.js';
export const S8_SHOT_CONDITIONS=Object.freeze({shotLimit:250,maxFiringSeconds:300,drain:45,replayFPS:30,power:.18,phases:[0,.175,.35,.525],target:{threeConditionsShots:750,minimumTotalStart:60,meanStartPer250:20},scope:'Finite internal comparison. Every changed setting is reported with actual shots/start; every condition must be no worse than its same-source baseline. No product adoption or real-machine guarantee.'});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function inspectWindmillCase(config){
 try{
  if(!config||config.normalPower!==.18||config.launchRailProfile!=='legacy'||config.hesoMouthWidth!==20||config.leftAdmissionGuides!==true||Object.hasOwn(config,'ballRadius')||Object.hasOwn(config,'windmillShapeProfile')||!config.windmillOffset||config.moves?.length!==0)throw new Error('S8 shot case must retain production0.18/legacy/mouth20/tray/default ball and display');
  const resolved=resolvePinAdjustment(config),base=createBoardFlow({lcd:true}).flow.physics.pins;
  if(resolved.pins.length!==101)throw new Error('Original101 required');
  for(const pin of resolved.pins){const old=base.find(p=>p.id===pin.id),{x,y,...attrs}=pin,{x:ox,y:oy,...original}=old??{};if(!old||!equal(attrs,original)||x!==ox||y!==oy)throw new Error('Original pin attributes/displacement changed');}
  const allowed=[[0,0],[-.25,0],[.25,0],[0,-.25],[0,.25]];if(!allowed.some(([dx,dy])=>config.windmillOffset.dx===dx&&config.windmillOffset.dy===dy))throw new Error('Undeclared windmill displacement');return {valid:true,config,layout:resolved,windmillInspection:inspectWindmillOffset(createBoardFlow({lcd:true}).flow.physics,config.windmillOffset)};
 }catch(error){return {valid:false,config,skipReason:error.message};}
}
function addObservations(result,rows){
 const outcomes=new Map(result.events.filter(e=>e.type==='outcome').map(e=>[e.ballId,e.kind]));
 result.s8ShotObservation={scope:'Reused non-acting S7 actual-contact observer; first turn is separate from certified free apex. Global pair count is not an individual pair attribution. Route geometry is not proof of admission causality.',gate:REFERENCE_PLAN.gate,terminal:REFERENCE_PLAN.terminal,rows:result.events.filter(e=>e.type==='shot').map(e=>{const r=rows.get(e.ballId);return r?{...r,route:{gatePasses:r.route.gatePasses,firstDescending:r.route.firstDescending,terminalEntries:r.route.terminalEntries,terminalFirstEntry:r.route.terminalFirstEntry},outcome:outcomes.get(e.ballId)??'remaining'}:{ballId:e.ballId,firstTurningPoint:null,firstPinContact:null,route:null,outcome:outcomes.get(e.ballId)??'remaining'};})};return result;
}
export function measureS8WindmillCase(config,{phase=0,onProgress=()=>{}}={}, {observer=true}={}){
 const inspected=inspectWindmillCase(config);if(!inspected.valid)throw new Error(inspected.skipReason);
 if(!S8_SHOT_CONDITIONS.phases.includes(phase))throw new Error('Unsupported fixed phase');
 const options={phase,kind:'mechanical',mode:'normal',seconds:300,drain:45,shotLimit:250,replaySeconds:345,replayFPS:30,onProgress};
 if(!observer)return measurePinAdjustment(config,options);
 let error;
 const {result,rows}=withS7Observation(()=>{try{return measurePinAdjustment(config,options);}catch(e){if(!e.result)throw e;error=e;return e.result;}},{phase});
 addObservations(result,rows);if(error)throw error;return result;
}
const fixedKeys=['gravity','ballRadius','colliders','pockets','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'];
const stationaryMechanisms=ms=>ms.map(({angle,omega,lastHit,...geometry})=>geometry);
export function validateWindmillResult(r,{requireLimit=true}={}){
 const inspected=inspectWindmillCase(r.config);if(!inspected.valid)throw new Error(inspected.skipReason);
 const model=createBoardFlow({lcd:true,windmillOffset:r.config.windmillOffset}),p=model.flow.physics;model.setMode('normal');
 // The measurement snapshots fixed inputs BEFORE phase warm-up. LCD gate/
 // chucker geometry is normalized by the existing first physics update.
 const initial=structuredClone(Object.fromEntries(fixedKeys.map(k=>[k,k==='gravity'?690:p[k]])));
 for(let i=0;i<Math.round(r.phase*120)+1;i++)model.flow.step(1/120);
 if(!equal(r.pins,inspected.layout.pins)||!equal(r.pinsAtEnd,r.pins))throw new Error('Shot trial pin layout changed');
 for(const k of fixedKeys){const terminal=k==='gravity'?690:p[k];if(!equal(r.fixed[k],initial[k]))throw new Error(`Shot trial initial fixed input changed: ${k}`);if(!equal(r.fixedAtEnd[k],terminal))throw new Error(`Shot trial normalized terminal fixed input changed: ${k}`);}
 if(!equal(r.fixed.mechanisms,p.mechanisms)||!equal(stationaryMechanisms(r.fixed.mechanisms),stationaryMechanisms(r.fixedAtEnd.mechanisms)))throw new Error('Stationary mechanism geometry changed');
 const expectedGeometry=stationaryMechanisms(p.mechanisms);
 for(const frame of [...r.replayFrames,...Object.values(r.replayEndpoints??{})]){
  if(!Array.isArray(frame.mechanisms)||!equal(stationaryMechanisms(frame.mechanisms),expectedGeometry)||frame.mechanisms.some(m=>!Number.isFinite(m.angle)||!Number.isFinite(m.omega)))throw new Error('Replay mechanism geometry or finite rotation changed');
 }
 if(r.display.ballRadius!==1.8||r.display.displayBallScale!==p.displayBallScale||r.display.displayBallDiameter!==(p.displayBallDiameter??null))throw new Error('Ball/display changed');
 const c=r.conditions;if(c.shotLimit!==250||c.power!==.18||c.gravity!==690||c.updateSeconds!==1/120||c.launchInterval!==.6||c.mouthWidth!==20||c.mode!=='normal'||r.kind!=='mechanical'||c.phase!==r.phase||c.requestedMaxFiringSeconds!==300||c.drain!==45||c.actualDrainSeconds!==45)throw new Error('Shot trial conditions changed');
 if(!Number.isSafeInteger(r.replaySampling.stopStep)||r.replaySampling.stopStep<1||r.replaySampling.stopStep>36000||r.replaySampling.endStep!==r.replaySampling.stopStep+5400||Math.abs(c.actualFiringSeconds-r.replaySampling.stopStep/120)>1e-10)throw new Error('Shot stop/drain steps disagree');
 if(r.replayFPS!==30||r.replayFrames.length!==Math.floor(r.replaySampling.endStep/4)+1||r.replayFrames.some((f,i)=>!Number.isFinite(f.time)||Math.abs(f.time-i/30)>1e-7))throw new Error('Incomplete regular30Hz replay');
 for(const [key,time]of [['stop',r.atStop.time],['end',r.end.time]]){const f=r.replayEndpoints[key],state=key==='stop'?r.atStop:r.end;if(!f||Math.abs(f.time-time)>1e-8||!equal(f.counts,state.counts)||f.inFlight!==state.remaining)throw new Error('Exact non-grid endpoint mismatch');}
 const shotEvents=r.events.filter(e=>e.type==='shot'),outcomes=r.events.filter(e=>e.type==='outcome');
 if(!['reconciled','uniqueOutcomeIds','allOutcomesFromShots','countsMatchOutcomes'].every(k=>r.physical[k]===true)||shotEvents.length!==r.physical.shots||new Set(shotEvents.map(e=>e.ballId)).size!==shotEvents.length||new Set(outcomes.map(e=>e.ballId)).size!==outcomes.length||outcomes.length+r.end.remaining!==r.physical.shots||shotEvents.some(e=>e.time>r.atStop.time+1e-9)||Object.values(r.end.counts).reduce((a,b)=>a+b,0)!==outcomes.length)throw new Error('Shot/outcome/stop count mismatch');
 if(requireLimit&&r.physical.shots!==250)throw new Error('Actual250 shots not reached');
 if(requireLimit&&Math.abs(shotEvents.at(-1).time-(r.atStop.time-1/120))>1e-8)throw new Error('Did not stop on the actual250th spawn step');
 if(r.s8ShotObservation.rows.length!==r.physical.shots)throw new Error('Missing all-shot observation');return true;
}
export function summarizeWindmillResult(r){
 validateWindmillResult(r);
 const summary=summarizeS7({...r,s7Observation:r.s8ShotObservation});
 return {id:r.config.id,phase:r.phase,windmillOffset:r.config.windmillOffset,initialMechanisms:r.fixed.mechanisms,terminalMechanisms:r.fixedAtEnd.mechanisms,...summary,shotLimit:250,actualFiringSeconds:r.conditions.actualFiringSeconds,actualDrainSeconds:r.conditions.actualDrainSeconds,atStopRemaining:r.atStop.remaining,targetPer250:20,targetReachedThisCondition:summary.start>=20,note:'Per-condition observation only; three-condition target and no-worse baseline checks require all paired results. No automatic adoption.'};
}

import {windmillContactGeometry} from '../domain/windmill-shape.js';
// Declared finite comparisons only; each frozen manifest identifies its settings. Pin and ball hypotheses never combined. No product adoption.
import {inspectWindmillOffset,WINDMILL_FEED_LEFT175} from '../pixi/windmill-offset.js';
import {createBoardFlow} from '../pixi/board-flow.js';
import {resolvePinAdjustment,preparePinAdjustment,PIN_SPACING_STRICT,ROAD_SUPPORT_PAIR23,roadGroupMoves,roadTransitionMoves} from './pin-adjustment.js';
import {measurePinAdjustment} from './pin-adjustment-measurement.js';
import {withS7Observation,summarizeS7} from './s7-launch-observation.js';
import {REFERENCE_PLAN} from './s6-reference-pin-comparison.js';
export const ADMISSION_CONDITIONS=Object.freeze({shotLimit:250,maxFiringSeconds:300,drain:45,replayFPS:30,power:.18,phases:[0,.175,.35,.525],target:{threeConditionsShots:750,minimumTotalStart:60,meanStartPer250:20},scope:'Finite internal comparison. Every changed setting is reported with actual shots/start; every condition must be no worse than its same-source baseline. No product adoption or real-machine guarantee.'});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function inspectAdmissionCase(config){
 try{
  const declarations={
   'legacy-control':{profile:'legacy-capsules',moves:[]},
   'three-base':{profile:'photo-three-vane',moves:[]},
   'pin90-up025':{profile:'photo-three-vane',moves:[{pinId:90,dx:0,dy:-.25}]},
   'pin90-right025':{profile:'photo-three-vane',moves:[{pinId:90,dx:.25,dy:0}]},
   'pin91-left025':{profile:'photo-three-vane',moves:[{pinId:91,dx:-.25,dy:0}]},
   'three-wheel-left025':{profile:'photo-three-vane',moves:[],offset:{dx:-.25,dy:0}},
   'three-wheel-right025':{profile:'photo-three-vane',moves:[],offset:{dx:.25,dy:0}},
   'three-wheel-up025':{profile:'photo-three-vane',moves:[],offset:{dx:0,dy:-.25}},
   'three-wheel-down025':{profile:'photo-three-vane',moves:[],offset:{dx:0,dy:.25}},
   'three-road2-right025':{profile:'photo-three-vane',moves:[{pinId:2,dx:.25,dy:0}]},
   'three-road2-right050':{profile:'photo-three-vane',moves:[{pinId:2,dx:.5,dy:0}]},
   'three-combo-right025':{profile:'photo-three-vane',moves:[{pinId:2,dx:.25,dy:0}],offset:{dx:.25,dy:0}},
   'three-combo-up025':{profile:'photo-three-vane',moves:[{pinId:2,dx:.25,dy:0}],offset:{dx:0,dy:-.25}},
   'three-feed-wheel-left175':{profile:'photo-three-vane',moves:[],offset:{dx:-1.75,dy:0},windmillOffsetProfile:WINDMILL_FEED_LEFT175},
   'three-road-entry22-up200':{profile:'photo-three-vane',moves:roadTransitionMoves('three-road-entry22-up200')},
   'three-road-taper25-up200':{profile:'photo-three-vane',moves:roadTransitionMoves('three-road-taper25-up200')},
   'three-road-group-left300':{profile:'photo-three-vane',moves:roadGroupMoves('three-road-group-left300')},
   'three-road-group-right300':{profile:'photo-three-vane',moves:roadGroupMoves('three-road-group-right300')},
   'three-road-group-up200':{profile:'photo-three-vane',moves:roadGroupMoves('three-road-group-up200')},
   'three-upper46-right050':{profile:'photo-three-vane',moves:[{pinId:46,dx:.5,dy:0}]},
   'three-upper48-up050':{profile:'photo-three-vane',moves:[{pinId:48,dx:0,dy:-.5}]},
   'three-upper48-down050':{profile:'photo-three-vane',moves:[{pinId:48,dx:0,dy:.5}]},
   'three-approach48-left050':{profile:'photo-three-vane',moves:[{pinId:48,dx:-.5,dy:0}]},
   'three-approach48-right050':{profile:'photo-three-vane',moves:[{pinId:48,dx:.5,dy:0}]},
   'three-road-tail-right025':{profile:'photo-three-vane',moves:[{pinId:23,dx:.25,dy:0},{pinId:24,dx:.25,dy:0},{pinId:25,dx:.25,dy:0},{pinId:26,dx:.25,dy:0}]},
   'three-road2-support050':{profile:'photo-three-vane',moves:[{pinId:2,dx:.5,dy:0}],pinSpacingProfile:ROAD_SUPPORT_PAIR23},
   'ball-r20':{profile:'photo-three-vane',moves:[],ballRadius:2}
  },d=declarations[config?.id];
  if(!d||config.normalPower!==.18||config.launchRailProfile!=='legacy'||config.hesoMouthWidth!==20||config.leftAdmissionGuides!==false||config.windmillShapeProfile!==d.profile||!equal(config.moves,d.moves)||!equal(config.windmillOffset,d.offset??{dx:0,dy:0})||Object.hasOwn(config,'ballRadius')!==Object.hasOwn(d,'ballRadius')||config.ballRadius!==d.ballRadius)throw new Error('Unapproved admission case or mixed variable');
  const resolutionOptions={pinSpacingProfile:d.pinSpacingProfile??PIN_SPACING_STRICT,...(d.windmillOffsetProfile?{windmillOffsetProfile:d.windmillOffsetProfile}:{})},resolved=resolvePinAdjustment(config,resolutionOptions),base=createBoardFlow({lcd:true}).flow.physics.pins;
  if(resolved.pins.length!==101)throw new Error('Original101 required');
  for(const pin of resolved.pins){const old=base.find(p=>p.id===pin.id),{x,y,...attrs}=pin,{x:ox,y:oy,...original}=old??{};const move=d.moves.find(m=>m.pinId===pin.id);if(!old||!equal(attrs,original)||x!==ox+(move?.dx??0)||y!==oy+(move?.dy??0))throw new Error('Original pin attributes/displacement changed');}
  return {valid:true,config,resolutionOptions,pinSpacingInspection:resolved.pinSpacingInspection??null,layout:resolved,windmillInspection:{conservativeLegacyEnvelopeGuard:inspectWindmillOffset(createBoardFlow({lcd:true,leftAdmissionGuides:false}).flow.physics,config.windmillOffset,d.windmillOffsetProfile?{profile:d.windmillOffsetProfile}:undefined),actualSweptOuterRadius:config.windmillShapeProfile==='photo-three-vane'?Math.hypot(9.5,.35):11.3,actualContactGeometry:windmillContactGeometry(createBoardFlow({lcd:true,leftAdmissionGuides:false,windmillOffset:config.windmillOffset,windmillShapeProfile:config.windmillShapeProfile,...(d.windmillOffsetProfile?{windmillOffsetProfile:d.windmillOffsetProfile}:{}),normalPower:.18,hesoMouthWidth:20}).flow.physics.mechanisms[0])}};
 }catch(error){return {valid:false,config,skipReason:error.message};}
}
export async function prepareAdmissionCase(config){const inspected=inspectAdmissionCase(config);if(!inspected.valid)throw new Error(inspected.skipReason);return preparePinAdjustment(config,inspected.resolutionOptions);}
function addObservations(result,rows){
 const outcomes=new Map(result.events.filter(e=>e.type==='outcome').map(e=>[e.ballId,e.kind]));
 result.s8ShotObservation={scope:'Reused non-acting S7 actual-contact observer; first turn is separate from certified free apex. Global pair count is not an individual pair attribution. Route geometry is not proof of admission causality.',gate:REFERENCE_PLAN.gate,terminal:REFERENCE_PLAN.terminal,rows:result.events.filter(e=>e.type==='shot').map(e=>{const r=rows.get(e.ballId);return r?{...r,route:{gatePasses:r.route.gatePasses,firstDescending:r.route.firstDescending,terminalEntries:r.route.terminalEntries,terminalFirstEntry:r.route.terminalFirstEntry},outcome:outcomes.get(e.ballId)??'remaining'}:{ballId:e.ballId,firstTurningPoint:null,firstPinContact:null,route:null,outcome:outcomes.get(e.ballId)??'remaining'};})};return result;
}
export function measureAdmissionCase(config,{phase=0,mode='normal',onProgress=()=>{}}={}, {observer=true}={}){
 const inspected=inspectAdmissionCase(config);if(!inspected.valid)throw new Error(inspected.skipReason);
 if(!ADMISSION_CONDITIONS.phases.includes(phase)||!['normal','rush','bonus'].includes(mode)||mode!=='normal'&&(phase!==0||!['three-base','ball-r20'].includes(config.id)))throw new Error('Unsupported fixed phase');
 const options={phase,kind:'mechanical',mode,seconds:mode==='normal'?300:30,drain:45,...(mode==='normal'?{shotLimit:250}:{recordFinalState:true}),replaySeconds:mode==='normal'?345:75,replayFPS:30,onProgress};
 if(!observer)return measurePinAdjustment(config,options,inspected.resolutionOptions);
 let error;
 const {result,rows}=withS7Observation(()=>{try{return measurePinAdjustment(config,options,inspected.resolutionOptions);}catch(e){if(!e.result)throw e;error=e;return e.result;}},{phase});
 addObservations(result,rows);if(error)throw error;return result;
}
const fixedKeys=['gravity','ballRadius','colliders','pockets','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'];
const stationaryMechanisms=ms=>ms.map(({angle,omega,lastHit,...geometry})=>geometry);
export function validateAdmissionResult(r,{requireLimit=true}={}){
 if(!Number.isFinite(r.end?.time)||r.end.time<=0||r.end.time>345+1e-7||!Number.isFinite(r.atStop?.time))throw new Error('Invalid bounded endpoint times');
 if(!ADMISSION_CONDITIONS.phases.includes(r.phase))throw new Error('Unapproved wheel shape phase');
 const inspected=inspectAdmissionCase(r.config);if(!inspected.valid)throw new Error(inspected.skipReason);
 const support=inspected.resolutionOptions.pinSpacingProfile!==PIN_SPACING_STRICT;if(Object.hasOwn(r,'validationProfile')!==support||Object.hasOwn(r.conditions,'pinSpacingProfile')!==support||support&&(r.validationProfile!==ROAD_SUPPORT_PAIR23||r.conditions.pinSpacingProfile!==ROAD_SUPPORT_PAIR23))throw new Error('Declared spacing validation profile mismatch');
 const mode=r.conditions.mode,right=mode!=='normal';if(!['normal','rush','bonus'].includes(mode)||right&&(r.phase!==0||!['three-base','ball-r20'].includes(r.config.id)))throw new Error('Unapproved right safety condition');
 const model=createBoardFlow({lcd:true,...inspected.layout.flowOptions}),p=model.flow.physics;model.setMode(mode);
 // The measurement snapshots fixed inputs BEFORE phase warm-up. LCD gate/
 // chucker geometry is normalized by the existing first physics update.
 const initial=structuredClone(Object.fromEntries(fixedKeys.map(k=>[k,k==='gravity'?690:p[k]])));
 for(let i=0;i<Math.round(r.phase*120)+Math.max(1,Math.round(r.end.time*120));i++)model.flow.step(1/120);
 if(!equal(r.pins,inspected.layout.pins)||!equal(r.pinsAtEnd,r.pins))throw new Error('Shot trial pin layout changed');
 for(const k of fixedKeys){const terminal=k==='gravity'?690:p[k];if(!equal(r.fixed[k],initial[k]))throw new Error(`Shot trial initial fixed input changed: ${k}`);if(!equal(r.fixedAtEnd[k],terminal))throw new Error(`Shot trial normalized terminal fixed input changed: ${k}`);}
 if(!equal(r.fixed.mechanisms,p.mechanisms)||!equal(stationaryMechanisms(r.fixed.mechanisms),stationaryMechanisms(r.fixedAtEnd.mechanisms)))throw new Error('Stationary mechanism geometry changed');
 const expectedGeometry=stationaryMechanisms(p.mechanisms);
 for(const frame of [...r.replayFrames,...Object.values(r.replayEndpoints??{})]){
  if(!Array.isArray(frame.mechanisms)||!equal(stationaryMechanisms(frame.mechanisms),expectedGeometry)||frame.mechanisms.some(m=>!Number.isFinite(m.angle)||!Number.isFinite(m.omega)))throw new Error('Replay mechanism geometry or finite rotation changed');
 }
 for(const frame of [...r.replayFrames,...Object.values(r.replayEndpoints??{})])if(frame.balls.some(b=>b.r!==p.ballRadius||![b.x,b.y,b.vx,b.vy].every(Number.isFinite)))throw new Error('Recorded ball geometry changed');
 if(r.display.textureExtent!==28||r.display.spriteScaleDivisor!==3||r.display.spriteBoundingDiameter!==28*p.displayBallScale/3)throw new Error('Ball sprite frame diameter changed');
 if(r.display.ballRadius!==p.ballRadius||r.display.displayBallScale!==p.displayBallScale||r.display.displayBallDiameter!==(p.displayBallDiameter??null))throw new Error('Ball/display changed');
 const c=r.conditions;
 if(c.power!==(right?.85:.18)||c.gravity!==690||c.updateSeconds!==1/120||c.launchInterval!==.6||c.mouthWidth!==20||r.kind!=='mechanical'||c.phase!==r.phase||c.drain!==45||c.ballRadius!==p.ballRadius||r.railGeometry.profile!=='legacy'||c.guide!=='source-walls-retained-no-added-heso-tray')throw new Error('Admission trial conditions changed');
 const sampling=r.replaySampling;
 if(!Number.isSafeInteger(sampling.stopStep)||sampling.stopStep<1||sampling.endStep!==sampling.stopStep+5400||Math.abs(r.atStop.time-sampling.stopStep/120)>1e-7||Math.abs(r.end.time-sampling.endStep/120)>1e-7)throw new Error('Stop/drain steps disagree');
 if(right){if(Object.hasOwn(c,'shotLimit')||c.seconds!==30||sampling.stopStep!==3600||sampling.endStep!==9000)throw new Error('Right safety must be natural30 seconds plus45 drain');}
 else if(c.shotLimit!==250||c.requestedMaxFiringSeconds!==300||c.seconds!==300||c.actualDrainSeconds!==45||sampling.stopStep>36000||Math.abs(c.actualFiringSeconds-sampling.stopStep/120)>1e-10)throw new Error('Actual250 stop condition changed');
 if(r.replayFPS!==30||r.replayFrames.length!==Math.floor(r.replaySampling.endStep/4)+1||r.replayFrames.some((f,i)=>!Number.isFinite(f.time)||Math.abs(f.time-i/30)>1e-7))throw new Error('Incomplete regular30Hz replay');
 for(const [key,time]of [['stop',r.atStop.time],['end',r.end.time]]){const f=r.replayEndpoints[key],state=key==='stop'?r.atStop:r.end;if(!f||Math.abs(f.time-time)>1e-8||!equal(f.counts,state.counts)||f.inFlight!==state.remaining)throw new Error('Exact non-grid endpoint mismatch');}
 const shotEvents=r.events.filter(e=>e.type==='shot'),outcomes=r.events.filter(e=>e.type==='outcome');
 if(!['reconciled','uniqueOutcomeIds','allOutcomesFromShots','countsMatchOutcomes'].every(k=>r.physical[k]===true)||shotEvents.length!==r.physical.shots||new Set(shotEvents.map(e=>e.ballId)).size!==shotEvents.length||new Set(outcomes.map(e=>e.ballId)).size!==outcomes.length||outcomes.length+r.end.remaining!==r.physical.shots||shotEvents.some(e=>e.time>r.atStop.time+1e-9)||Object.values(r.end.counts).reduce((a,b)=>a+b,0)!==outcomes.length)throw new Error('Shot/outcome/stop count mismatch');
 if(!right&&requireLimit&&r.physical.shots!==250)throw new Error('Actual250 shots not reached');
 if(!right&&requireLimit&&Math.abs(shotEvents.at(-1).time-(r.atStop.time-1/120))>1e-8)throw new Error('Did not stop on the actual250th spawn step');
 if(!equal(Object.keys(r.end.counts).sort(),Object.keys(model.flow.counts).sort()))throw new Error('Missing outcome count fields');
 for(const [kind,count]of Object.entries(r.end.counts))if(!Number.isSafeInteger(count)||count<0||outcomes.filter(e=>e.kind===kind).length!==count)throw new Error('Outcome-kind counts changed');
 if(r.s8ShotObservation.rows.length!==r.physical.shots||new Set(r.s8ShotObservation.rows.map(row=>row.ballId)).size!==r.physical.shots||r.s8ShotObservation.rows.some(row=>!shotEvents.some(e=>e.ballId===row.ballId)))throw new Error('Missing all-shot observation');return true;
}
export function summarizeAdmissionResult(r){
 validateAdmissionResult(r);
 const summary=summarizeS7({...r,s7Observation:r.s8ShotObservation});
 return {id:r.config.id,phase:r.phase,windmillShapeProfile:r.config.windmillShapeProfile,windmillOffset:r.config.windmillOffset,initialMechanisms:r.fixed.mechanisms,terminalMechanisms:r.fixedAtEnd.mechanisms,...summary,mode:r.conditions.mode,power:r.conditions.power,counts:structuredClone(r.end.counts),launchDiagnostics:structuredClone(r.launchDiagnostics),ballRadius:r.display.ballRadius,shotLimit:r.conditions.shotLimit??null,actualFiringSeconds:r.atStop.time,actualDrainSeconds:r.end.time-r.atStop.time,atStopRemaining:r.atStop.remaining,targetPer250:20,targetReachedThisCondition:r.conditions.mode==='normal'&&summary.start>=20,note:'Per-condition observation only; three-condition target and no-worse baseline checks require all paired results. No automatic adoption.'};
}

export function admissionSafety(r){
 validateAdmissionResult(r);
 const keys=['centreBallIds','boundaryOnlyBallIds','frontCentreBallIds','frontBoundaryOnlyBallIds'];
 if(!keys.every(k=>Array.isArray(r.lcdIntrusion[k]))||!Number.isSafeInteger(r.endDiagnostics.stalled)||r.endDiagnostics.stalled<0)throw new Error('Missing safety observations');
 return {shots:r.physical.shots,rightAdmission:r.end.counts[r.conditions.mode]??null,start:r.end.counts.start,returned:r.end.counts.returned,remaining:r.end.remaining,stalled:r.endDiagnostics.stalled,lcd:keys.map(k=>r.lcdIntrusion[k].length),safe:r.physical.shots>0&&r.end.remaining===0&&r.endDiagnostics.stalled===0&&keys.every(k=>r.lcdIntrusion[k].length===0)};
}
export function evaluateRightSafety(results){
 const expected=['three-base/rush','three-base/bonus','ball-r20/rush','ball-r20/bonus'],keys=results.map(r=>`${r.config.id}/${r.conditions.mode}`);
 if(keys.length!==4||new Set(keys).size!==4||expected.some(k=>!keys.includes(k)))throw new Error('Four fresh right safety records required');
 const rows=results.map(r=>({key:`${r.config.id}/${r.conditions.mode}`,...admissionSafety(r)})),reasons=[];
 for(const mode of ['rush','bonus']){const base=rows.find(r=>r.key===`three-base/${mode}`),candidate=rows.find(r=>r.key===`ball-r20/${mode}`);if(base.rightAdmission===0||candidate.rightAdmission===0)reasons.push(`${mode}: no actual target admission; functional diagnosis required`);if(!base.safe||!candidate.safe)reasons.push(`${mode}: unresolved baseline/candidate residual, stall, LCD or blocked launch`);if(candidate.returned*base.shots>base.returned*candidate.shots)reasons.push(`${mode}: return rate worsened`);}
 return {eligible:reasons.length===0,rows,reasons,scope:'Natural right safety only; actual shots denominator, not left admission performance. No count equality requirement or automatic adoption.'};
}

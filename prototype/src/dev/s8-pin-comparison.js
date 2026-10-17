// S8 finite local trial. Product defaults and physics are never changed here.
import {createBoardFlow} from '../pixi/board-flow.js';
import {resolvePinAdjustment} from './pin-adjustment.js';
import {measurePinAdjustment} from './pin-adjustment-measurement.js';
import {withS7Observation,summarizeS7,classifyS7Aim,S7_PLAN} from './s7-launch-observation.js';
import {REFERENCE_PLAN} from './s6-reference-pin-comparison.js';

export const S8_PLAN={version:1,power:.18,kind:'mechanical',mode:'normal',replayFPS:30,short:{phases:[0],seconds:120,drain:45},long:{phases:[.175,.35,.525],seconds:300,drain:45},aimRegions:S7_PLAN.aimRegions,selection:'Fresh S7 production-board control; valid counts/fixed inputs, all-layer/front LCD centre/boundary zero, residual/stall zero, returned/actual-shot ratio no worse, PM aim review. Strict start/actual-shot increase; highest ratio, fewer moved pins, less total displacement, declared order ID2/ID90/ID91+92. Long uses phases not used for this short selection: aggregate strict increase and every phase start/return ratios no worse. General admission and maximum-gap deterioration hold adoption pending PM; never automatic adoption.',scope:'Original101 and attributes; original positions as displacement origin, <=1 logical unit. Legacy rails/mouth20/tray/default radius and sprite scale; power0.18/cadence/physics unchanged. No S6 result reuse or 3D pin-tilt claim.'};
export function s8Cases(){
 const base={leftAdmissionGuides:true,hesoMouthWidth:20,launchRailProfile:'legacy',normalPower:.18};
 return [
  {...base,id:'baseline',label:'S7本編0.18・元101釘',moves:[]},
  {...base,id:'road-pin2',label:'道入口ID2を下へ0.25',moves:[{pinId:2,dx:0,dy:.25}]},
  {...base,id:'jump-pin90',label:'ジャンプ相当ID90を上へ0.25',moves:[{pinId:90,dx:0,dy:-.25}]},
  {...base,id:'heso-pair',label:'ヘソ91/92を外へ各0.25',moves:[{pinId:91,dx:-.25,dy:0},{pinId:92,dx:.25,dy:0}]},
 ];
}
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function declared(config){const expected=s8Cases().find(c=>c.id===config?.id);if(!expected||!equal(config,expected))throw new Error('S8 only permits declared independent cases');return expected;}
export function inspectS8Cases(configs=s8Cases()){
 return configs.map(config=>{try{const resolved=resolvePinAdjustment(config),clearances=config.moves.map(m=>{const p=resolved.pins.find(p=>p.id===m.pinId),near=resolved.pins.filter(q=>q.id!==p.id).map(q=>({pinId:q.id,centreDistance:Math.hypot(p.x-q.x,p.y-q.y),freeGap:Math.hypot(p.x-q.x,p.y-q.y)-p.r-q.r})).sort((a,b)=>a.centreDistance-b.centreDistance)[0];return {movingPinId:p.id,...near,note:'Static centre/axis clearance only; not guaranteed dynamic ball passage.'};});return {id:config.id,config,valid:true,clearances};}catch(error){if(config.id==='baseline')throw error;return {id:config.id,config,valid:false,skipReason:error.message};}});
}
export function validateS8Physical(r){
 const config=declared(r.config),expected=resolvePinAdjustment(config),model=createBoardFlow({lcd:true}),p=model.flow.physics;model.setMode('normal');
 if(!equal(r.pins,expected.pins)||r.pins.length!==101)throw new Error('S8 original pin coordinates/attributes or declared moves mismatch');
 for(const key of ['ballRadius','colliders','pockets','mechanisms','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'])if(!equal(r.fixed[key],p[key]))throw new Error(`S8 fixed input mismatch: ${key}`);
 if(r.fixed.gravity!==690||r.fixed.nonReturnValve!==undefined||r.railGeometry.profile!=='legacy')throw new Error('S8 physical geometry/profile changed');
 if(r.display.ballRadius!==1.8||r.display.ballRadius!==p.ballRadius||r.display.displayBallScale!==p.displayBallScale||r.display.displayBallDiameter!==(p.displayBallDiameter??null))throw new Error('S8 default display/contact radius mismatch');
 const c=r.conditions;if(c.phase!==r.phase||c.gravity!==690||c.updateSeconds!==1/120||c.launchInterval!==.6||c.mouthWidth!==20||c.power!==.18||c.ballRadius!==1.8||c.mode!=='normal'||c.kind!=='mechanical'||r.kind!=='mechanical')throw new Error('S8 fixed measurement conditions changed');
 return true;
}
export function measureS8(config,options={}, {observer=true}={}){
 declared(config);
 if(!observer)return measurePinAdjustment(config,options);
 const {result,rows}=withS7Observation(()=>measurePinAdjustment(config,options),{phase:options.phase??0});
 const outcomes=new Map(result.events.filter(e=>e.type==='outcome').map(e=>[e.ballId,e.kind]));
 result.s8Observation={scope:'Reused non-acting S7 observer. Actual successful pin contact IDs, first front turn versus certified free apex, and geometric routes; system-wide pair counter limits free-apex certification. Route bins do not prove admission causes.',gate:REFERENCE_PLAN.gate,terminal:REFERENCE_PLAN.terminal,rows:result.events.filter(e=>e.type==='shot').map(e=>{
  const r=rows.get(e.ballId);if(!r)return {ballId:e.ballId,firstFront:null,firstTurningPoint:null,firstFreeApex:null,firstPinContact:null,route:null,aimEvent:null,outcome:outcomes.get(e.ballId)??'remaining'};
  const aimEvent=[r.firstFreeApex&&{kind:'first-free-apex',...r.firstFreeApex},r.firstPinContact&&{kind:'first-actual-pin-contact',...r.firstPinContact}].filter(Boolean).sort((a,b)=>a.time-b.time||(a.kind==='first-actual-pin-contact'?-1:1))[0]??null;
  return {...r,aimEvent,route:{gatePasses:r.route.gatePasses,firstDescending:r.route.firstDescending,terminalEntries:r.route.terminalEntries,terminalFirstEntry:r.route.terminalFirstEntry},outcome:outcomes.get(e.ballId)??'remaining'};
 })};return result;
}
export function s8Metrics(r){
 validateS8Physical(r);
 const m=summarizeS7({...r,s7Observation:r.s8Observation});
 if(!Number.isFinite(m.maxGap)||m.maxGap<0||Object.values(r.end.counts).some(n=>!Number.isSafeInteger(n)||n<0))throw new Error('Missing/invalid gap or outcome counts');
 if(Object.values(r.end.counts).reduce((a,b)=>a+b,0)+m.remaining!==m.shots)m.countsValid=false;
 const turns={A:0,B:0,overlap:0,outside:0,unobserved:0};for(const row of r.s8Observation.rows)turns[classifyS7Aim(row.firstTurningPoint).category]++;
 if(r.s8Observation.rows.length!==m.shots)throw new Error('Missing all-shot observations');
 return {id:r.config.id,phase:r.phase,...m,firstTurnClassifications:turns,movedPins:r.config.moves.length,totalDistance:r.config.moves.reduce((sum,v)=>sum+Math.hypot(v.dx,v.dy),0)};
}
const noWorse=(a,n,b,m)=>a*m<=b*n;
function safeReasons(m){const reasons=[];if(!m.countsValid||!m.shots)reasons.push('invalid counts/zero shots');if(m.remaining||m.stalled)reasons.push('residual/stall');if(Object.values(m.lcd).some(n=>n!==0))reasons.push('unresolved LCD centre/boundary');return reasons;}
export function rankS8(results,{aimReviewedIds=[]}={}){
 const ids=results.map(r=>r.config.id);if(new Set(ids).size!==ids.length)throw new Error('Duplicate short case');
 const rows=results.map(r=>{if(r.phase!==0||r.conditions.seconds!==120||r.conditions.drain!==45)throw new Error('S8 short window mismatch');const m=s8Metrics(r);return {...m,reasons:safeReasons(m)};});
 const b=rows.find(r=>r.id==='baseline');if(!b)throw new Error('Fresh baseline required');
 for(const r of rows){if(!aimReviewedIds.includes(r.id))r.reasons.push('PM aim review pending');if(r.id!=='baseline'){if(!noWorse(r.returned,r.shots,b.returned,b.shots))r.reasons.push('returned ratio worse');if(r.start*b.shots<=b.start*r.shots)r.reasons.push('no strict start/shot improvement');}}
 const order=s8Cases().map(c=>c.id),eligible=rows.filter(r=>r.id!=='baseline'&&!r.reasons.length).sort((a,b)=>b.start*a.shots-a.start*b.shots||a.movedPins-b.movedPins||a.totalDistance-b.totalDistance||order.indexOf(a.id)-order.indexOf(b.id));
 return {rows,baselineSafe:b.reasons.length===0,selected:b.reasons.length?null:eligible[0]?.id??null,decision:'Numerical screening only; PM actual aim review required. No automatic long trial or product adoption.'};
}
export function aggregateS8(results,selected,{aimReviewedIds=[]}={}){
 if(!s8Cases().slice(1).some(c=>c.id===selected))throw new Error('Declared screened candidate required');
 const expected=['baseline',selected].flatMap(id=>S8_PLAN.long.phases.map(phase=>`${id}/${phase}`)),keys=results.map(r=>`${r.config.id}/${r.phase}`);
 if(keys.length!==expected.length||new Set(keys).size!==keys.length||expected.some(key=>!keys.includes(key)))throw new Error('All six fresh long rows required');
 const rows=results.map(r=>{if(r.conditions.seconds!==300||r.conditions.drain!==45)throw new Error('S8 long window mismatch');const m=s8Metrics(r);return {...m,reasons:safeReasons(m)};}),reasons=[];
 const phases=S8_PLAN.long.phases.map(phase=>{const b=rows.find(r=>r.id==='baseline'&&r.phase===phase),c=rows.find(r=>r.id===selected&&r.phase===phase),problems=[];
  if(b.reasons.length||c.reasons.length)problems.push('unsafe baseline/candidate');
  if(!noWorse(b.start,b.shots,c.start,c.shots))problems.push('start ratio worse');
  if(!noWorse(c.returned,c.shots,b.returned,b.shots))problems.push('returned ratio worse');
  if(!noWorse(b.normal,b.shots,c.normal,c.shots))problems.push('general admission ratio worse: PM resolution required');
  if(c.maxGap>b.maxGap)problems.push('maximum no-start gap worse: PM resolution required');
  reasons.push(...problems.map(p=>`phase ${phase}: ${p}`));return {phase,baseline:b,candidate:c,reasons:problems};});
 const total=id=>rows.filter(r=>r.id===id).reduce((s,r)=>({shots:s.shots+r.shots,start:s.start+r.start,normal:s.normal+r.normal,returned:s.returned+r.returned,out:s.out+r.out,maxGap:Math.max(s.maxGap,r.maxGap)}),{shots:0,start:0,normal:0,returned:0,out:0,maxGap:0}),baseline=total('baseline'),candidate=total(selected);
 if(candidate.start*baseline.shots<=baseline.start*candidate.shots)reasons.push('aggregate start ratio not strictly improved');
 if(!noWorse(candidate.returned,candidate.shots,baseline.returned,baseline.shots))reasons.push('aggregate returned ratio worse');
 if(!noWorse(baseline.normal,baseline.shots,candidate.normal,candidate.shots))reasons.push('aggregate general admission ratio worse: PM resolution required');
 if(!['baseline',selected].every(id=>aimReviewedIds.includes(id)))reasons.push('PM long aim review pending');
 return {selected,phases,totals:{baseline,candidate},reasons,technicalThresholdsMet:reasons.length===0,adoption:'PM decision pending; no product change',scope:'All six rows including phase deterioration are retained. No guarantee for unobserved phases, real machines or lottery/payout performance.'};
}

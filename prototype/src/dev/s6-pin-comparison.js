// S6 local observation only: no product defaults, automatic adoption or new forces.
import {Physics} from '../physics/physics.js';
import {normalStrengthComparisonCases,resolvePinAdjustment,samePinAttributes} from './pin-adjustment.js';
import {measurePinAdjustment} from './pin-adjustment-measurement.js';

export const S6_PLAN=Object.freeze({version:1,power:.14,mode:'normal',kind:'mechanical',short:{phases:[0],seconds:120,drain:45},long:{phases:[.175,.35,.525],seconds:300,drain:45},replaySeconds:60,aim:{sourceRegion:[120,210,245,390],upperPinIds:[27,28,29,30,31],pinIds:[27,28,29,30,31,32,33,34,35,36],interpretationWindow:[170,200,250,300],note:'Fixed upper-left aim; natural spread allowed. Interpretation window is not an all-ball pass threshold.'},selection:'Aim must be reviewed before candidate trials and again before long confirmation. Reconciled counts, no residual/stall, no worse returned incidence per actual shot and all-layer/front LCD centre/boundary all zero; strictly better start/actual-shot ratio. Highest ratio, then fewer moved pins, shorter total displacement, declared order. Long: total start/actual-shot ratio improves across all 3 conditions, returned ratio not worse, all counts reconciled/residual/stall/LCD zero. Per-phase deterioration and maximum gaps disclosed for PM judgement; no automatic adoption. All rows including failures retained.'});
export function s6Cases(){
 const base=normalStrengthComparisonCases().find(c=>c.normalPower===.14);
 return [
 {...base,id:'baseline',label:'左上狙い・未採用0.14の実験対照',moves:[]},
 {...base,id:'road-pin2',label:'道釘ID2を下へ0.25',moves:[{pinId:2,dx:0,dy:.25}]},
 {...base,id:'heso-pair',label:'命釘91/92を外へ各0.25',moves:[{pinId:91,dx:-.25,dy:0},{pinId:92,dx:.25,dy:0}]},
 ];
}
export function validateS6Cases(){
 const cases=s6Cases(),base=resolvePinAdjustment(cases[0]);
 for(const c of cases){const r=resolvePinAdjustment(c);if(r.pins.length!==101||!samePinAttributes(base.pins,r.pins))throw new Error('S6 original pin attributes changed');for(const p of r.pins){const old=base.pins.find(q=>q.id===p.id);if(Math.hypot(p.x-old.x,p.y-old.y)>1+1e-12)throw new Error('S6 cumulative movement limit');}}
 return cases;
}
const point=(p,b,phase)=>({time:p.time-phase,x:b.x,y:b.y,sourceX:b.x*2+28,sourceY:(b.y-120)*2,vx:b.vx,vy:b.vy,leftLaunchPlane:!!b.leftLaunchPlane,hits:b.hits,contactCount:b.contactCount,lastContact:b.lastContact??null});
let observing=false;
export function measureS6(config,options){
 if(observing)throw new Error('S6 observer cannot be nested');observing=true;
 const oldAdvance=Physics.prototype.advanceBall,oldPins=Physics.prototype.resolvePins,rows=new Map(),phase=options.phase??0;
 const row=b=>{if(!rows.has(b.id))rows.set(b.id,{ballId:b.id,firstFront:null,firstTurningPoint:null,firstPinContact:null,initialDescent285:null});return rows.get(b.id);};
 Physics.prototype.resolvePins=function(b,opts){const hits=b.hits,result=oldPins.call(this,b,opts);if(!opts?.predict&&b.leftLaunchPlane&&b.hits>hits){const r=row(b);if(!r.firstPinContact){const nearest=this.pins.map(p=>({pinId:p.id,distance:Math.hypot(b.x-p.x,b.y-p.y)})).sort((a,b)=>a.distance-b.distance).slice(0,3);r.firstPinContact={...point(this,b,phase),role:b.lastContact,nearbyPins:nearest,note:'Actual pin-contact occurrence/role; nearby IDs are geometric candidates, not exact collision-ID attribution.'};}}return result;};
 Physics.prototype.advanceBall=function(b,dt,opts){const before=point(this,b,phase),result=oldAdvance.call(this,b,dt,opts);if(!opts?.predict&&b.leftLaunchPlane){const r=row(b),now=point(this,b,phase);r.firstFront??=now;
  if(!r.firstTurningPoint&&before.leftLaunchPlane&&before.vy<0&&b.vy>=0)r.firstTurningPoint={...now,contactInfluenced:now.contactCount!==before.contactCount||now.hits!==before.hits,pinContactAlreadyOccurred:!!r.firstPinContact,contactNote:'Pin/static contact counters only; unrecorded pair or mechanism impulse is not certified absent.'};
  if(!r.initialDescent285&&r.firstTurningPoint&&before.sourceY<285&&now.sourceY>=285&&b.vy>=0){const t=(285-before.sourceY)/(now.sourceY-before.sourceY);r.initialDescent285={time:before.time+(now.time-before.time)*t,sourceX:before.sourceX+(now.sourceX-before.sourceX)*t,sourceY:285,note:'Interpolated between consecutive integration observations; may include earlier contact.'};}
 }return result;};
 try{const result=measurePinAdjustment(config,options),shots=result.events.filter(e=>e.type==='shot').map(e=>e.ballId);result.aimObservation={scope:'All actual shots at integration observations; first front turning point, never global minimum y. Contact-induced turns and contact before turn explicitly distinguished; no 100% window criterion.',target:S6_PLAN.aim,rows:shots.map(id=>{const r=rows.get(id)??{ballId:id,firstFront:null,firstTurningPoint:null,firstPinContact:null,initialDescent285:null};const end=r.firstPinContact&&(!r.firstTurningPoint||r.firstPinContact.time<=r.firstTurningPoint.time)?{kind:'pin-contact',point:r.firstPinContact}:r.firstTurningPoint?{kind:'turning-point',point:r.firstTurningPoint}:null;return {...r,firstFrontFlightEnd:end};})};return result;
 }finally{Physics.prototype.advanceBall=oldAdvance;Physics.prototype.resolvePins=oldPins;observing=false;}
}
function fractionLTE(a,n,b,m){return a*m<=b*n;}
export function s6Metrics(r){return {id:r.config.id,shots:r.physical.shots,start:r.end.counts.start,returned:r.end.counts.returned,remaining:r.end.remaining,stalled:r.endDiagnostics.stalled,centre:r.lcdIntrusion.centreBallIds.length,boundary:r.lcdIntrusion.boundaryOnlyBallIds.length,frontCentre:r.lcdIntrusion.frontCentreBallIds.length,frontBoundary:r.lcdIntrusion.frontBoundaryOnlyBallIds.length,maxGap:r.observation.observedFiringGap.maxGap,movedPins:r.config.moves.length,totalDistance:r.config.moves.reduce((s,m)=>s+Math.hypot(m.dx,m.dy),0),countSafe:['reconciled','uniqueOutcomeIds','allOutcomesFromShots','countsMatchOutcomes'].every(k=>r.physical[k]===true)};}
export function rankS6(results,{aimReviewedIds=[]}={}){
 const base=results.find(r=>r.config.id==='baseline');if(!base)throw new Error('Fresh baseline required');const b=s6Metrics(base),rows=results.map((r,order)=>{const m=s6Metrics(r),reasons=[];if(!m.countSafe||m.shots<=0)reasons.push('count/shot invalid');if(m.remaining||m.stalled)reasons.push('residual/stall');if(['centre','boundary','frontCentre','frontBoundary'].some(k=>m[k]!==0))reasons.push('unresolved LCD overlap');for(const k of ['returned','centre','boundary','frontCentre','frontBoundary'])if(!fractionLTE(m[k],m.shots,b[k],b.shots))reasons.push(`${k} worse per shot`);if(!aimReviewedIds.includes(m.id))reasons.push('aim review pending');if(m.id!=='baseline'&&m.start*b.shots<=b.start*m.shots)reasons.push('no strict start/shot improvement');return {...m,order,reasons,eligible:m.id!=='baseline'&&reasons.length===0};});
 const baselineSafe=b.countSafe&&b.shots>0&&!b.remaining&&!b.stalled&&['centre','boundary','frontCentre','frontBoundary'].every(k=>b[k]===0)&&aimReviewedIds.includes('baseline');
 const ranked=rows.filter(r=>r.eligible).sort((a,b)=>(b.start*a.shots-a.start*b.shots)||a.movedPins-b.movedPins||a.totalDistance-b.totalDistance||a.order-b.order);
 return {rows,selected:baselineSafe?ranked[0]?.id??null:null,baselineSafe,note:'Numerical screening only. Human aim review required; long confirmation and PM adoption remain separate.'};
}

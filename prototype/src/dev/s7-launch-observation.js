// Observation only. Production geometry, integration and launch equations are untouched.
import {createBoardFlow} from '../pixi/board-flow.js';
import {Physics} from '../physics/physics.js';
import {measurePinAdjustment} from './pin-adjustment-measurement.js';
import {routeState,observeRoutePoint,REFERENCE_PLAN} from './s6-reference-pin-comparison.js';

export function s7Config(id,normalPower=.20){
 if(typeof id!=='string'||!id||!Number.isFinite(normalPower)||normalPower<0||normalPower>1)throw new Error('Invalid S7 launch setting');
 return {id,label:`S7 production-board launch ${normalPower}`,leftAdmissionGuides:true,hesoMouthWidth:20,launchRailProfile:'legacy',normalPower,moves:[]};
}
const point=(p,b,phase)=>({time:p.time-phase,x:b.x,y:b.y,sourceX:b.x*2+28,sourceY:(b.y-120)*2,vx:b.vx,vy:b.vy,r:b.r,front:!p.separateLaunchPlane||!!b.leftLaunchPlane,hits:b.hits,contactCount:b.contactCount,lastContact:b.lastContact??null});
let active=false;
export function withS7Observation(operation,{phase=0}={}){
 if(active)throw new Error('Nested S7 observation');active=true;
 const originals={advanceBall:Physics.prototype.advanceBall,resolvePins:Physics.prototype.resolvePins,step:Physics.prototype.step,recordRole:Physics.prototype.recordRole};
 const rows=new Map();
 const row=id=>{if(!rows.has(id))rows.set(id,{ballId:id,firstFront:null,firstTurningPoint:null,firstFreeApex:null,firstPinContact:null,firstWindmillContact:null,pinContacts:[],pinContactCounts:{},firstContactInterval:null,firstDescent285:null,firstDescent315:null,frontMinimumY:null,route:routeState(id)});return rows.get(id);};
 const observe=(p,b,time)=>{const v=point(p,b,phase);v.time=time;const r=row(b.id);observeRoutePoint(r.route,{time,x:v.sourceX,y:v.sourceY,front:v.front});if(!v.front)return;r.firstFront??={...v,globalPairContacts:p.metrics.ballContacts};if(!r.frontMinimumY||v.y<r.frontMinimumY.y)r.frontMinimumY=v;};
 Physics.prototype.resolvePins=function(b,options){
  if(options?.predict||(this.separateLaunchPlane&&!b.leftLaunchPlane))return originals.resolvePins.call(this,b,options);
  const pins=this.pins,p=this;
  // The original solver still visits every original pin once, in its original order.
  // A hit increment across yield identifies that exact successful collidePin call.
  this.pins=new Proxy(pins,{get(target,key,receiver){if(key!==Symbol.iterator)return Reflect.get(target,key,receiver);return function*(){for(const pin of pins){const hits=b.hits,x=b.x,y=b.y,vx=b.vx,vy=b.vy;yield pin;if(b.hits>hits){const r=row(b.id);r.pinContactCounts[pin.id]=(r.pinContactCounts[pin.id]??0)+b.hits-hits;if(r.pinContactCounts[pin.id]===1){const contact={...point(p,b,phase),pinId:pin.id,role:pin.role,pin:{x:pin.x,y:pin.y,r:pin.r},before:{time:p.time-phase,x,y,vx,vy}};r.pinContacts.push(contact);r.firstPinContact??=contact;}}}};}});
  try{return originals.resolvePins.call(this,b,options);}finally{this.pins=pins;}
 };
 Physics.prototype.recordRole=function(b,role){const result=originals.recordRole.call(this,b,role);if(role==='windmill'){const v=point(this,b,phase);if(v.front)row(b.id).firstWindmillContact??=v;}return result;};
 Physics.prototype.advanceBall=function(b,dt,options){
  if(options?.predict)return originals.advanceBall.call(this,b,dt,options);
  const before=point(this,b,phase);before.time-=dt;observe(this,b,before.time);
  const result=originals.advanceBall.call(this,b,dt,options),now=point(this,b,phase),r=row(b.id);observe(this,b,now.time);
  if(now.front){
   if(now.contactCount>before.contactCount)r.firstContactInterval??={before,after:now,note:'Actual contact-counter increase within this integration interval. Multiple contacts/order are not inferred from lastContact.'};
   if(!r.firstTurningPoint&&before.front&&before.vy<0&&now.vy>=0){if(now.contactCount===r.firstFront.contactCount&&!r.firstWindmillContact&&this.metrics.ballContacts===r.firstFront.globalPairContacts)r.firstFreeApex=now;r.firstTurningPoint={...now,contactCounterChanged:now.contactCount!==before.contactCount,pinAlreadyContacted:!!r.firstPinContact,windmillAlreadyContacted:!!r.firstWindmillContact,globalPairContacts:this.metrics.ballContacts,note:'First front upward-to-downward observation, not global apex. Pair count is system-wide; it is not individual pair attribution.'};}
   if(r.firstTurningPoint&&before.front&&now.vy>=0)for(const y of [285,315]){const key=`firstDescent${y}`;if(!r[key]&&before.sourceY<y&&now.sourceY>=y){const t=(y-before.sourceY)/(now.sourceY-before.sourceY);r[key]={time:before.time+(now.time-before.time)*t,sourceX:before.sourceX+(now.sourceX-before.sourceX)*t,sourceY:y,note:'Interpolated between actual substep endpoints; earlier contacts are retained separately.'};}}
  }
  return result;
 };
 Physics.prototype.step=function(...args){const result=originals.step.apply(this,args);for(const b of this.balls)observe(this,b,this.time-phase);return result;};
 try{return {result:operation(),rows};}finally{for(const [key,value]of Object.entries(originals))Physics.prototype[key]=value;active=false;}
}
export function measureS7(config,options={}, {observer=true}={}){
 const expected=s7Config(config.id,config.normalPower);
 if(JSON.stringify(config)!==JSON.stringify(expected))throw new Error('S7 requires unchanged production-board configuration; launch power only');
 if(!observer)return measurePinAdjustment(config,options);
 const {result,rows}=withS7Observation(()=>measurePinAdjustment(config,options),{phase:options.phase??0});
 const outcomes=new Map(result.events.filter(e=>e.type==='outcome').map(e=>[e.ballId,e.kind]));
 result.s7Observation={scope:'Fresh production legacy board. Actual pin IDs from successful original collidePin calls. First-turn/contact intervals are distinguished from free-flight apex. Geometry zones do not imply good/bad flow or admission causality.',gate:REFERENCE_PLAN.gate,terminal:REFERENCE_PLAN.terminal,rows:result.events.filter(e=>e.type==='shot').map(e=>{
  const r=rows.get(e.ballId);const firstEvent=r?[r.firstFreeApex&&{kind:'first-free-apex',...r.firstFreeApex},r.firstPinContact&&{kind:'first-actual-pin-contact',...r.firstPinContact}].filter(Boolean).sort((a,b)=>a.time-b.time||(a.kind==='first-actual-pin-contact'?-1:1))[0]??null:null;return {ballId:e.ballId,...r,aimEvent:firstEvent,route:r?{gatePasses:r.route.gatePasses,firstDescending:r.route.firstDescending,terminalEntries:r.route.terminalEntries,terminalFirstEntry:r.route.terminalFirstEntry}:null,outcome:outcomes.get(e.ballId)??'remaining'};
 })};return result;
}
export const S7_PLAN={version:1,baselinePower:.20,candidatePowers:[.18,.19,.22],short:{phases:[0],seconds:120,drain:45},long:{phases:[.175,.35,.525],seconds:300,drain:45},replayFPS:30,aimRegions:{A:{xMin:175,xMax:235,yMin:245,yMax:315},B:{xMin:220,xMax:290,yMin:185,yMax:265}},selection:'Valid counts/fixed production inputs; residual/stall excluded; LCD centre and returned ratio no worse than baseline. Strictly improve A-only inside-or-boundary/actual shots, B-only events from a stronger observed setting must be more frequent and its event-position medians right/up versus the A candidate; overlap is separate. Tie: lower median centre distance to A, then higher start/shot, then smaller change from0.20. Long requires start/shot no worse than control. PM aim review and decision, never automatic adoption.',scope:'A/B are uncalibrated photo-location comparison regions, not all-ball pass criteria. Legacy production board, original101, default radius/render scale, mouth20 and tray. Launch power only; no product adoption.'};
export function s7Cases(){return [s7Config('baseline'),...S7_PLAN.candidatePowers.map(p=>s7Config(`power-${String(p).replace('.','-')}`,p))];}
export function summarizeS7(r){
 const obs=r.s7Observation;if(!obs)throw new Error('Missing S7 observations');
 const count={shots:r.physical.shots,start:r.end.counts.start,normal:r.end.counts.normal,returned:r.end.counts.returned,out:r.end.counts.out,remaining:r.end.remaining,stalled:r.endDiagnostics.stalled,maxGap:r.observation.observedFiringGap.maxGap,countsValid:['reconciled','uniqueOutcomeIds','allOutcomesFromShots','countsMatchOutcomes'].every(k=>r.physical[k]===true),lcd:{centre:r.lcdIntrusion.centreBallIds.length,boundary:r.lcdIntrusion.boundaryOnlyBallIds.length,frontCentre:r.lcdIntrusion.frontCentreBallIds.length,frontBoundary:r.lcdIntrusion.frontBoundaryOnlyBallIds.length}};
 for(const key of ['shots','start','normal','returned','out','remaining','stalled'])if(!Number.isSafeInteger(count[key])||count[key]<0)throw new Error(`Missing/invalid ${key}`);
 const regionCounts=key=>Object.fromEntries(Object.entries(S7_PLAN.aimRegions).map(([id,roi])=>[id,obs.rows.filter(row=>{const p=row[key];return p&&p.sourceX>=roi.xMin&&p.sourceX<=roi.xMax&&p.sourceY>=roi.yMin&&p.sourceY<=roi.yMax;}).length]));
 return {...count,firstTurnRegions:regionCounts('firstTurningPoint'),firstContactRegions:regionCounts('firstPinContact'),firstPinIds:Object.fromEntries([...new Set(obs.rows.map(row=>row.firstPinContact?.pinId).filter(id=>id!==undefined))].map(id=>[id,obs.rows.filter(row=>row.firstPinContact?.pinId===id).length])),unobservedFirstTurn:obs.rows.filter(row=>!row.firstTurningPoint).length,unobservedFirstPinContact:obs.rows.filter(row=>!row.firstPinContact).length,terminalReached:obs.rows.filter(row=>row.route?.terminalFirstEntry).length,firstDescendingZones:Object.fromEntries(['left','envelope','right','unobserved'].map(zone=>[zone,obs.rows.filter(row=>(row.route?.firstDescending?.zone??'unobserved')===zone).length]))};
}
export const distanceToRegion=(p,roi)=>Math.hypot(Math.max(roi.xMin-p.sourceX,0,p.sourceX-roi.xMax),Math.max(roi.yMin-p.sourceY,0,p.sourceY-roi.yMax));
export function classifyS7Aim(p){
 if(!p)return {category:'unobserved',A:'unobserved',B:'unobserved',distanceToA:null};
 const one=roi=>{const d=distanceToRegion(p,roi);return d===0?'inside':d<=p.r*2?'boundary':'outside';};
 const A=one(S7_PLAN.aimRegions.A),B=one(S7_PLAN.aimRegions.B);
 return {category:A!=='outside'&&B!=='outside'?'overlap':A!=='outside'?'A':B!=='outside'?'B':'outside',A,B,distanceToA:distanceToRegion(p,S7_PLAN.aimRegions.A)};
}
export function rankS7(results,aimReviewedIds=[]){
 const rows=results.map(r=>{const fixedValid=validateS7Physical(r),m=summarizeS7(r),classified=r.s7Observation.rows.map(row=>classifyS7Aim(row.aimEvent)),distances=classified.map(x=>x.distanceToA).filter(x=>x!==null).sort((a,b)=>a-b),median=distances.length?distances.length%2?distances[(distances.length-1)/2]:(distances[distances.length/2-1]+distances[distances.length/2])/2:null;
  const events=r.s7Observation.rows.map(row=>row.aimEvent).filter(Boolean),medianOf=values=>{values.sort((a,b)=>a-b);return values.length?values.length%2?values[(values.length-1)/2]:(values[values.length/2-1]+values[values.length/2])/2:null;};return {id:r.config.id,power:r.config.normalPower,fixedValid,...m,medianEventX:medianOf(events.map(p=>p.sourceX)),medianEventY:medianOf(events.map(p=>p.sourceY)),aimClassifications:classified,A:classified.filter(x=>x.category==='A').length,B:classified.filter(x=>x.category==='B').length,overlap:classified.filter(x=>x.category==='overlap').length,outside:classified.filter(x=>x.category==='outside').length,unobserved:classified.filter(x=>x.category==='unobserved').length,medianDistanceToA:median,reasons:[]};});
 const b=rows.find(row=>row.id==='baseline');if(!b)throw new Error('Fresh baseline required');
 for(const r of rows){if(!r.countsValid||r.shots===0)r.reasons.push('invalid counts');if(r.remaining||r.stalled)r.reasons.push('residual/stall');if(!aimReviewedIds.includes(r.id))r.reasons.push('PM aim review pending');if(r.id!=='baseline'){if(r.lcd.centre>b.lcd.centre||r.lcd.frontCentre>b.lcd.frontCentre)r.reasons.push('LCD centre worse');if(r.returned*b.shots>b.returned*r.shots)r.reasons.push('returned ratio worse');if(r.A*b.shots<=b.A*r.shots)r.reasons.push('A-only ratio not improved');if(r.start*b.shots<b.start*r.shots)r.reasons.push('start ratio worse');}}
 for(const r of rows)if(r.id!=='baseline'){r.strongerBReferences=rows.filter(other=>other.power>r.power&&other.B*r.shots>r.B*other.shots&&other.medianEventX>r.medianEventX&&other.medianEventY<r.medianEventY).map(other=>other.id);if(!r.strongerBReferences.length)r.reasons.push('B relation with a stronger setting not established');}
 const eligible=rows.filter(r=>r.id!=='baseline'&&!r.reasons.length&&r.medianDistanceToA!==null).sort((a,b)=>b.A*a.shots-a.A*b.shots||a.medianDistanceToA-b.medianDistanceToA||b.start*a.shots-a.start*b.shots||Math.abs(a.power-.20)-Math.abs(b.power-.20)||S7_PLAN.candidatePowers.indexOf(a.power)-S7_PLAN.candidatePowers.indexOf(b.power));
 return {rows,selected:b.reasons.length?null:eligible[0]?.id??null,decision:'Screening output only; fixed-layout/source review and PM decision required before any long stage or product change. Overlap kept separate, not counted twice.'};
}
export function validateS7Physical(r){
 const model=createBoardFlow({lcd:true}),p=model.flow.physics;model.setMode('normal');
 if(JSON.stringify(r.pins)!==JSON.stringify(p.pins))throw new Error('S7 original pin layout/attributes mismatch');
 for(const key of ['ballRadius','colliders','pockets','mechanisms','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'])if(JSON.stringify(r.fixed[key])!==JSON.stringify(p[key]))throw new Error(`S7 fixed input mismatch: ${key}`);
 if(r.display.ballRadius!==p.ballRadius||r.display.displayBallScale!==p.displayBallScale||r.display.displayBallDiameter!==(p.displayBallDiameter??null))throw new Error('S7 default display/contact radius mismatch');
 if(r.conditions.gravity!==690||r.conditions.updateSeconds!==1/120||r.conditions.launchInterval!==.6||r.conditions.mouthWidth!==20||r.conditions.mode!=='normal'||r.kind!=='mechanical')throw new Error('S7 physical condition mismatch');
 return true;
}

// Trial-only reference-informed hypotheses. No angle/shaft-bending model.
import {Physics} from '../physics/physics.js';
import {resolvePinAdjustment} from './pin-adjustment.js';
import {measureS6,s6Metrics} from './s6-pin-comparison.js';
export const REFERENCE_PLAN={version:1,power:.14,replayFPS:30,short:{phases:[0],seconds:120,drain:45},long:{phases:[.175,.35,.525],seconds:300,drain:45},gate:{y:713,xMin:72,xMax:220,leftEnd:136,rightStart:176},terminal:{xMin:355,xMax:400,yMin:824,yMax:870},scope:'Geometric regions only, never good/bad flow labels. Photo angle/bending is not simulated by 2D centre movement. Product defaults unchanged.',selection:'Fresh original and prior-road-pin2 controls. New candidate must strictly beat both start/actual-shot ratios; counts valid, residual/stall/all-layer/front LCD centre/boundary zero, returned ratios not worse than either; human aim review. Tie: fewer moved pins, shorter distance, declaration order yori58/road26/jump90. No automatic adoption.',longDecision:'Original/prior-road-pin2/one selected new candidate, all3 phases excluded from this reference-informed short screening (same numerical phases were used in the preceding S6 comparison). Candidate aggregate start/shot strictly beats both controls, returned ratio no worse, counts/residual/stall/LCD safe. General admissions, all phase changes and maximum gaps disclosed for PM judgement. No extra candidates.'};
export function referenceCases(){const base={leftAdmissionGuides:false,hesoMouthWidth:12,ballRadius:1.8,launchRailProfile:'reference-exit',normalPower:.14};return [
 {...base,id:'original',label:'原101・未採用0.14実験対照',moves:[]},
 {...base,id:'prior-road-pin2',label:'先行道釘ID2対照',moves:[{pinId:2,dx:0,dy:.25}]},
 {...base,id:'yori58',label:'寄り仮説ID58右0.25',moves:[{pinId:58,dx:.25,dy:0}]},
 {...base,id:'road26',label:'道末端ID26右0.25上0.25',moves:[{pinId:26,dx:.25,dy:-.25}]},
 {...base,id:'jump90',label:'ジャンプ相当ID90上0.25',moves:[{pinId:90,dx:0,dy:-.25}]},
 ];}
export function validateReferenceCases(){const cs=referenceCases(),original=resolvePinAdjustment(cs[0]);for(const c of cs){const r=resolvePinAdjustment(c);if(r.pins.length!==101)throw new Error('Expected original101');for(const p of r.pins){const old=original.pins.find(q=>q.id===p.id);if(Math.hypot(p.x-old.x,p.y-old.y)>1+1e-12||p.role!==old.role||p.r!==old.r||p.restitution!==old.restitution)throw new Error('Reference pin invariant');}}return cs;}
export const gateClass=x=>x<REFERENCE_PLAN.gate.leftEnd?'left':x<=REFERENCE_PLAN.gate.rightStart?'envelope':'right';
const within=(p,r)=>p.x>=r.xMin&&p.x<=r.xMax&&p.y>=r.yMin&&p.y<=r.yMax;
export function rectEntry(a,b,r=REFERENCE_PLAN.terminal){let lo=0,hi=1;for(const [v,d,min,max]of [[a.x,b.x-a.x,r.xMin,r.xMax],[a.y,b.y-a.y,r.yMin,r.yMax]]){if(d===0){if(v<min||v>max)return null;}else{let t0=(min-v)/d,t1=(max-v)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return null;}}return lo;}
const interpolate=(a,b,t)=>({time:a.time+(b.time-a.time)*t,sourceX:a.x+(b.x-a.x)*t,sourceY:a.y+(b.y-a.y)*t});
export function routeState(ballId){return {ballId,previous:null,lastSide:0,gatePasses:[],firstDescending:null,terminalEntries:[],terminalFirstEntry:null};}
export function observeRoutePoint(state,p){
 if(!p.front){state.previous=null;state.lastSide=0;return;}const prev=state.previous,g=REFERENCE_PLAN.gate,side=Math.sign(p.y-g.y);
 if(prev){
  if(side&&state.lastSide&&side!==state.lastSide){const t=prev.y===p.y?0:(g.y-prev.y)/(p.y-prev.y),event=interpolate(prev,p,Math.max(0,Math.min(1,t)));if(event.sourceX>=g.xMin&&event.sourceX<=g.xMax){Object.assign(event,{direction:side>0?'descending':'ascending',zone:gateClass(event.sourceX),actualFront:true});state.gatePasses.push(event);if(side>0)state.firstDescending??=event;}}
  if(!within(prev,REFERENCE_PLAN.terminal)){const t=rectEntry(prev,p);if(t!==null){const event={...interpolate(prev,p,t),actualFront:true};state.terminalEntries.push(event);state.terminalFirstEntry??=event;}}
 }
 if(side)state.lastSide=side;state.previous=p;
}
let active=false;
export function measureReference(config,options={}, {routeObserver=true}={}){
 if(!routeObserver)return measureS6(config,options);if(active)throw new Error('Nested reference observer');active=true;
 const advance=Physics.prototype.advanceBall,step=Physics.prototype.step,states=new Map(),phase=options.phase??0;
 const observe=(p,b,time)=>{if(!states.has(b.id))states.set(b.id,routeState(b.id));observeRoutePoint(states.get(b.id),{time,x:b.x*2+28,y:(b.y-120)*2,front:!!b.leftLaunchPlane});};
 Physics.prototype.advanceBall=function(b,dt,opts){if(!opts?.predict)observe(this,b,this.time-phase-dt);const result=advance.call(this,b,dt,opts);if(!opts?.predict)observe(this,b,this.time-phase);return result;};
 Physics.prototype.step=function(...args){const result=step.apply(this,args);for(const b of this.balls)observe(this,b,this.time-phase);return result;};
 try{const r=measureS6(config,options),outcomes=new Map(r.events.filter(e=>e.type==='outcome').map(e=>[e.ballId,e.kind]));r.referenceRoutes={gate:REFERENCE_PLAN.gate,terminal:REFERENCE_PLAN.terminal,sampling:'Actual front-layer advance substep endpoints plus post-step pair/static correction; crossing time linearly interpolated between observations. Zero-time corrections keep the actual step timestamp. No trajectory changed.',rows:r.events.filter(e=>e.type==='shot').map(e=>{const s=states.get(e.ballId)??routeState(e.ballId);return {ballId:e.ballId,gatePasses:s.gatePasses,firstDescending:s.firstDescending,terminalEntries:s.terminalEntries,terminalFirstEntry:s.terminalFirstEntry,outcome:outcomes.get(e.ballId)??'remaining'};})};return r;}finally{Physics.prototype.advanceBall=advance;Physics.prototype.step=step;active=false;}
}
const safe=m=>m.countSafe&&m.shots>0&&m.remaining===0&&m.stalled===0&&['centre','boundary','frontCentre','frontBoundary'].every(k=>m[k]===0);
export function rankReference(results,aimReviewedIds=[]){
 const controls=['original','prior-road-pin2'].map(id=>{const r=results.find(r=>r.config.id===id);if(!r)throw new Error(`Missing fresh control ${id}`);return s6Metrics(r);});
 const rows=results.map(r=>{const m=s6Metrics(r),reasons=[];if(!safe(m))reasons.push('counts/residual/stall/LCD unsafe');if(!aimReviewedIds.includes(m.id))reasons.push('aim review pending');if(!controls.some(c=>c.id===m.id)){if(!controls.every(c=>m.start*c.shots>c.start*m.shots))reasons.push('not strictly better than both start ratios');if(!controls.every(c=>m.returned*c.shots<=c.returned*m.shots))reasons.push('returned ratio worse than a control');}return {...m,reasons,eligible:!controls.some(c=>c.id===m.id)&&reasons.length===0};});
 const controlsSafe=controls.every(c=>safe(c)&&aimReviewedIds.includes(c.id));const order=['yori58','road26','jump90'];const ranked=rows.filter(r=>r.eligible).sort((a,b)=>b.start*a.shots-a.start*b.shots||a.movedPins-b.movedPins||a.totalDistance-b.totalDistance||order.indexOf(a.id)-order.indexOf(b.id));return {rows,controlsSafe,selected:controlsSafe?ranked[0]?.id??null:null,note:'Screening only; new aim/visual review and PM selection required before holdout. No automatic adoption.'};
}

export function aggregateReference(results,selected){
 if(!['yori58','road26','jump90'].includes(selected))throw new Error('Invalid selected reference candidate');
 const ids=['original','prior-road-pin2',selected],phases=REFERENCE_PLAN.long.phases;
 if(results.length!==9||ids.some(id=>phases.some(phase=>results.filter(r=>r.config.id===id&&r.phase===phase).length!==1)))throw new Error('Expected all nine distinct long rows');
 if(results.some(r=>!Number.isInteger(r.end?.counts?.normal)||r.end.counts.normal<0))throw new Error('Missing or invalid normal admission count');
 const rows=results.map(r=>({phase:r.phase,...s6Metrics(r),normal:r.end.counts.normal}));
 const totals=ids.map(id=>{const group=rows.filter(r=>r.id===id),sum=key=>group.reduce((s,r)=>s+r[key],0);return {id,shots:sum('shots'),start:sum('start'),normal:sum('normal'),returned:sum('returned'),remaining:sum('remaining'),stalled:sum('stalled'),centre:sum('centre'),boundary:sum('boundary'),frontCentre:sum('frontCentre'),frontBoundary:sum('frontBoundary'),countSafe:group.every(r=>r.countSafe),maxGap:Math.max(...group.map(r=>r.maxGap))};});
 const candidate=totals[2],controls=totals.slice(0,2);
 return {rows,totals,checks:{strictStartRatioAboveBoth:controls.every(c=>candidate.start*c.shots>c.start*candidate.shots),returnedRatioNoWorseThanBoth:controls.every(c=>candidate.returned*c.shots<=c.returned*candidate.shots),allRowsSafe:rows.every(safe)},perPhase:phases.map(phase=>{const group=rows.filter(r=>r.phase===phase),candidate=group.find(r=>r.id===selected);return {phase,rows:group,againstControls:group.filter(r=>r.id!==selected).map(c=>({control:c.id,startRatioWorse:candidate.start*c.shots<c.start*candidate.shots,returnedRatioWorse:candidate.returned*c.shots>c.returned*candidate.shots,maxGapWorse:candidate.maxGap>c.maxGap,generalAdmissionsLower:candidate.normal<c.normal}))};}),decision:'PM judgement only. Same numerical phases occurred in preceding S6 but were not used for the new short screening. No automatic adoption.'};
}

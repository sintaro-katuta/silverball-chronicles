// Geometric observations of unchanged solver calls, not an alternative solver.
import {withPhysicsTrace} from '../physics/passive-trace.js';
export function roadGapDefinitions(pins){
 const road=pins.filter(p=>p.id>=1&&p.id<=26).sort((a,b)=>a.id-b.id);
 if(road.length!==26)throw new Error('Original26 road pins required');
 return road.slice(0,-1).map((a,i)=>{const b=road[i+1],pitch=Math.hypot(b.x-a.x,b.y-a.y);return{id:`${a.id}-${b.id}`,a:structuredClone(a),b:structuredClone(b),pitch,axisSurfaceGap:pitch-a.r-b.r,classification:a.id===10||a.id===22?'large-break':'ordinary'};});
}
const cross=(a,b)=>a.x*b.y-a.y*b.x;
export function gapCrossings(before,after,gaps){
 const delta={x:after.x-before.x,y:after.y-before.y};if(delta.x===0&&delta.y===0)return [];
 return gaps.flatMap(g=>{const segment={x:g.b.x-g.a.x,y:g.b.y-g.a.y},offset={x:g.a.x-before.x,y:g.a.y-before.y},den=cross(delta,segment);if(Math.abs(den)<1e-15)return [];
  const t=cross(offset,segment)/den,u=cross(offset,delta)/den;if(t<=0||t>1||u<=0||u>=1)return [];
  const x=before.x+t*delta.x,y=before.y+t*delta.y,clearance=Math.min(Math.hypot(x-g.a.x,y-g.a.y)-g.a.r,Math.hypot(x-g.b.x,y-g.b.y)-g.b.r)-before.r;
  return [{gapId:g.id,classification:g.classification,direction:cross(segment,delta)>0?'descending':'ascending',fraction:t,segmentFraction:u,x,y,sourceX:x*2+28,sourceY:(y-120)*2,ballRadius:before.r,clearanceAtCross:clearance,discClearAtCentreCross:clearance>=0}];
 });
}
export function createFlowTraceCollector(pins,sink=()=>{}){
 const gaps=roadGapDefinitions(pins),balls=new Map(),counts={},contacts={},byGap={},get=id=>{if(!balls.has(id))balls.set(id,{ballId:id,gapCrossings:[],lastChangedContact:null,lastVelocityChangingContact:null,outcome:null});return balls.get(id);};let seq=0,substepIndex=0,interval={timeStart:null,timeEnd:null,gameTime:null};
 const emit=event=>{const row={seq:++seq,...event};sink(row);return row;};
 const observePath=(before,after,event,kind)=>{for(const crossing of gapCrossings(before,after,gaps)){
  const row=emit({type:'gap-cross',substepIndex:event.substepIndex,frontBefore:before.front,frontAfter:after.front,time:event.time,sourceSeq:event.seq,ballId:before.id,sourceKind:kind,sourceStage:event.stage??'integrate',timeStart:event.timeStart??event.time,timeEnd:event.timeEnd??event.time,gameTime:event.gameTime??null,...crossing});get(before.id).gapCrossings.push(row);byGap[crossing.gapId]??={kinematic:0,correction:0};byGap[crossing.gapId][kind==='kinematic-motion'?'kinematic':'correction']++;
 }};
 return {accept(event){if(event.type==='substep'&&event.stage==='before'){substepIndex++;interval={timeStart:event.timeStart,timeEnd:event.timeEnd,gameTime:event.gameTime};}counts[event.type]=(counts[event.type]??0)+1;const row=emit({...interval,...event,substepIndex});
  if(event.type==='motion')observePath(event.before,event.after,row,'kinematic-motion');
  if(event.type==='contact'){
   const key=event.part.kind==='pin'?`pin:${event.part.id}`:`${event.part.kind}:${event.part.role??event.part.index??event.part.id??''}`;contacts[key]??={changed:0,velocityChanged:0,positionOnly:0};contacts[key].changed++;contacts[key].velocityChanged+=Number(event.velocityChanged);contacts[key].positionOnly+=Number(!event.velocityChanged&&event.positionChanged);
   for(const [before,after]of [[event.before,event.after],[event.peerBefore,event.peerAfter]])if(before&&after){const item={seq:row.seq,time:event.time,stage:event.stage,part:structuredClone(event.part),solverResult:event.solverResult,...(event.peerBefore?{otherBallId:before.id===event.before.id?event.peerBefore.id:event.before.id}:{} )};get(before.id).lastChangedContact=item;if(before.vx!==after.vx||before.vy!==after.vy)get(before.id).lastVelocityChangingContact=item;observePath(before,after,row,'solver-position-correction');}
  }
  if(event.type==='outcome')get(event.ball.id).outcome={time:event.time,kind:event.outcome,state:event.ball,seq:row.seq};
 },summary(){return {schema:'s8-passive-flow-trace-v1',scope:'All changed actual solver calls and substep boundaries. Gap events are finite centre-line crossings; motion and position-correction crossings are distinct and are not proof of loss causality. Last contact is derived from the complete trace, not first-per-pin records.',counts,contacts,byGap,gaps,balls:[...balls.values()],records:seq};}};
}
export function withFlowTrace(operation,pins,sink){const collector=createFlowTraceCollector(pins,sink);try{const result=withPhysicsTrace(operation,event=>collector.accept(event));return {result,trace:collector.summary()};}catch(error){error.flowTrace=collector.summary();throw error;}}

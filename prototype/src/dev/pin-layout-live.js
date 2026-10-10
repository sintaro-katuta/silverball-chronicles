// Local mechanical trial; production physics, comparison and lottery are untouched.
import {createBoardFlow} from '../pixi/board-flow.js';
import {resolvePins,layoutHash} from './pin-layout-model.js';
const STEP=1/120,MAX_FRAME=.05;
export async function createLiveTrial(initialLayout,{phase=0}={}){
 let model,layout,identity='',origin=0,lastTimestamp=null,accumulator=0,wall=0,dropped=0,discarded=0,disposed=false,resetting=false,revision=0,currentPhase=phase,pauseReason='reset';
 const active=()=>!disposed&&!resetting&&Boolean(model);
 const clearClock=()=>{discarded+=accumulator;accumulator=0;lastTimestamp=null;};
 async function reset(nextLayout=layout,{phase:nextPhase=currentPhase}={}){
  if(disposed)return false;
  if(![0,.175,.35].includes(nextPhase))throw new Error('Unsupported live phase');
  const pins=resolvePins(nextLayout),copy=structuredClone(nextLayout),n=++revision;
  if(model){model.flow.stop();model.flow.pause(true);}clearClock();resetting=true;
  try{
   const hash=await layoutHash(copy);if(disposed||n!==revision)return false;
   const next=createBoardFlow({lcd:true,normalPower:.20,launchInterval:.6});next.flow.physics.pins=pins;next.setMode('normal');
   for(let i=0;i<Math.round(nextPhase*120);i++)next.flow.step(STEP);
   next.flow.pause(true);pauseReason='reset';model=next;layout=copy;identity=hash;currentPhase=nextPhase;origin=model.flow.physics.time;
   accumulator=0;lastTimestamp=null;wall=0;dropped=0;discarded=0;return true;
  }finally{if(n===revision)resetting=false;}
 }
 const api={
  start(){if(!active())return false;if(model.flow.paused){clearClock();model.flow.pause(false);}pauseReason='';model.flow.start();return true;},
  stop(){if(!active())return false;model.flow.stop();return true;},
  pause(reason='manual'){if(!active())return false;model.flow.pause(true);pauseReason=String(reason);clearClock();return true;},
  resume(){if(!active())return false;if(model.flow.paused){clearClock();model.flow.pause(false);}pauseReason='';return true;},
  reset,
  advance(timestampMs){
   if(!Number.isFinite(timestampMs)||timestampMs<0)throw new Error('Invalid monotonic frame timestamp');
   if(!active()||model.flow.paused){lastTimestamp=null;return 0;}
   if(lastTimestamp===null){lastTimestamp=timestampMs;return 0;}
   if(timestampMs<lastTimestamp)throw new Error('Frame timestamp moved backwards');
   const elapsed=(timestampMs-lastTimestamp)/1000;lastTimestamp=timestampMs;wall+=elapsed;dropped+=Math.max(0,elapsed-MAX_FRAME);accumulator+=Math.min(elapsed,MAX_FRAME);
   let steps=0;while(accumulator+1e-12>=STEP&&steps<6){model.flow.step(STEP);accumulator=Math.max(0,accumulator-STEP);steps++;}return steps;
  },
  // Renderer reads the very same pin/ball data used by the contact solver.
  // Treat references as read-only; no per-frame layout hash or full model clone.
  renderState(){return model?{pins:model.flow.physics.pins,balls:model.flow.physics.balls,mechanisms:model.flow.physics.mechanisms}:null;},
  snapshot(){
   if(!model)return {resetting,disposed};const p=model.flow.physics,counts={...model.flow.counts},outcomes=Object.values(counts).reduce((a,b)=>a+b,0);
   return {layoutHash:identity,phase:currentPhase,feeding:model.flow.continuous,paused:model.flow.paused,pauseReason,resetting,disposed,physicalTime:p.time-origin,wallActiveSeconds:wall,droppedWallSeconds:dropped,discardedAccumulatorSeconds:discarded,accumulatorSeconds:accumulator,shots:p.metrics.spawned,counts,outcomes,inFlight:p.balls.length,reconciled:p.metrics.spawned===outcomes+p.balls.length,conditions:{power:.20,launchInterval:.6,dt:STEP,maxFrameSeconds:MAX_FRAME},balls:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r,vx:b.vx,vy:b.vy}))};
  },
  dispose(){if(disposed)return;disposed=true;pauseReason='disposed';revision++;resetting=false;if(model){model.flow.stop();model.flow.pause(true);}clearClock();},
 };
 await reset(initialLayout,{phase});return api;
}

import {reachSchedule} from './reach-ending.js';

// Display input only. Neither admission rolls nor physical deadlines are read
// or modified. Unattended play keeps the original 54/58 second presentation.
export const DECISION_PUSH=Object.freeze({start:46.5,end:49.9,releaseAt:49.92,settleAt:50.85,revealAt:51.7});
export function supportsDecisionPush(p){
 return !!p?.longReach&&(!p.displayRoute||p.displayRoute==='battle')&&p.reachEnding!=='flash'&&!p.premium&&p.predictionPlan?.resultFamily!=='fullrotation';
}
export function decisionPushPose(game,{paused=false}={}){
 const p=game?.presentation,t=p?.time??-1;
 const visible=supportsDecisionPush(p)&&!p.pushInput&&t>=DECISION_PUSH.start&&t<DECISION_PUSH.end;
 return {visible,enabled:visible&&!paused&&game.phase==='playing',remaining:visible?DECISION_PUSH.end-t:0};
}
export function pressDecisionPush(game,options={}){
 if(!decisionPushPose(game,options).enabled)return false;
 const p=game.presentation;p.pushInput={pressedAt:p.time,settled:false};
 p.time=DECISION_PUSH.releaseAt;return true;
}
export function advanceDecisionPresentation(p,dt){
 p.time+=dt;
 if(p.pushInput&&!p.pushInput.settled&&p.time>=DECISION_PUSH.settleAt){
  p.time=DECISION_PUSH.revealAt+(p.time-DECISION_PUSH.settleAt);p.pushInput.settled=true;
 }
}
export function reachFinalePose(game){
 const p=game?.presentation,t=p?.time??-1,post=game?.previewWinAt===undefined?-1:game.time-game.previewWinAt;
 const decision=!!p?.longReach&&t>=reachSchedule(p).decisionAt;
 const confirmed=!game?.jackpot?.charge&&(post>=0||decision&&p.win===true);
 const loss=!!p?.longReach&&t>=51.7&&!confirmed;
 const age=post>=0?post:confirmed?t-reachSchedule(p).decisionAt:loss?t-51.7:0;
 const warm=!!p?.longReach&&p.reachEnding!=='flash'&&t>=43&&t<51.7;
 const pressed=p?.pushInput?Math.max(0,t-DECISION_PUSH.releaseAt):-1;
 return {visible:warm||confirmed||loss,warm,confirmed,loss,age,pressed,
  strength:warm?Math.min(1,(t-43)/3):confirmed?1:Math.max(0,1-(t-51.7)/.7),
  clock:p?t:post,reduced:!!game?.reducedEffects};
}

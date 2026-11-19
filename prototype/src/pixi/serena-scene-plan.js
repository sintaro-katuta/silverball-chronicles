import {reachSchedule} from './reach-ending.js';
import {rushEndPose} from './rush-end-motion.js';

// A display-only decision. It never samples randomness or changes the stored
// outcome. The shared battle must remain identical until the decision time.
export function serenaScenePlan(game,{payout=false}={}){
 if(!game||!Number.isFinite(game.time))return null;
 const time=game.time;
 const charge=!!game.jackpot?.charge;
 if(charge&&Number.isFinite(game.previewWinAt))return {clip:'charge',age:Math.max(0,time-game.previewWinAt),loop:false};
 if(payout&&game.jackpot)return {clip:'bonus',age:Math.max(0,time-(game.previewWinAt??time)),loop:true};
 const entry=game.entryPrelude;
 if(entry){
  const age=time-entry.startedAt;
  return age>=0?{clip:'rush-entry',age,loop:false}:null;
 }
 const end=rushEndPose(time,game.lastRush?.endedAt,!!game.rush||!!game.jackpot);
 if(end.visible)return {clip:'rush-end',age:end.age,loop:false};
 const reach=game.presentation?.basicReach?game.presentation:null;
 if(reach?.longReach){
  const t=Math.max(0,reach.time??0),schedule=reachSchedule(reach);
  if(t>=51.7&&reach.reachEnding==='revival')return t<54
   ?{clip:'defeat',age:2.7+t-51.7,loop:false}
   :{clip:'revival',age:t-54,loop:false};
  if(t>=schedule.decisionAt&&reach.win===false)return {clip:'defeat',age:2.7+t-schedule.decisionAt,loop:false};
  if(t<5&&reach.reachEnding!=='flash')return {clip:'warning',age:t,loop:false};
  return {clip:'battle',age:Math.max(0,t-(reach.reachEnding==='flash'?0:5)),loop:true};
 }
 if(reach)return null; // Preserve the existing short-route reels and their result.
 if(game.previewWinAt!==undefined||game.jackpot)return null;
 const cue=game.spinResult?.predictionPlan?.beforeCue;
 if(game.spinActive&&cue&&game.drawTimer>=cue.start&&game.drawTimer<cue.end)
  return {clip:'warning',age:game.drawTimer-cue.start,loop:false};
 if(game.rush)return {clip:'rush-loop',age:time,loop:true};
 return {clip:'idle',age:time,loop:true};
}

import {assignMoonCue} from './moon-cue.js';
import {entryTitleAt,ENTRY_TITLE_SECONDS} from './entry-title-schedule.js';
import {beginRushPrelude,preludePose} from './rush-prelude-motion.js';
import {RUSH_END_SECONDS,rushEndPose} from './rush-end-motion.js';
import {reachSeconds} from './win-sequence.js';
import {attachBonusRounds} from './bonus-round-flow.js';
import {Game,freshProfile} from '../game.js';
import {reviewReelState} from './review-reel-state.js';
// Review-only deterministic losses. Production odds and Game logic are untouched.
export function attachNormalSpin(flow,{reach=false,win=false,roundModel=null,lifecycle=false,rushWin=false,sessionGame=null}={}){
 let forceReach=false,seed=741;const rng=()=>{if(forceReach){forceReach=false;return 0;}seed=(Math.imul(seed,1664525)+1013904223)>>>0;return .15+(seed/4294967296)*.7;};
 const game=sessionGame??new Game(freshProfile(),0,rng),events=[];
 if(!sessionGame&&(win||rushWin)){let rushRecords=0;const create=game.createDraw.bind(game);game.createDraw=(...args)=>{if(win&&game.drawSerial===1)forceReach=true;if(rushWin&&args[1]==='rush'&&++rushRecords===5)forceReach=true;return create(...args);};}
 if(sessionGame||reach||win){
  const start=game.startSpin.bind(game),begin=game.beginPresentation.bind(game);
  game.startSpin=record=>{
   forceReach=!sessionGame&&record.id===2&&!win;start(record);
   const result=game.spinResult;
   // W normal-symbol mass follows the current four-branch policy (0.25+0.245)/199.9.
   // RUSH cues describe the existing ordinary-symbol win, before physical V admission.
   const prior=result.pity?1:game.isWMachine?(record.kind==='fuzu'?1/(game.w.rush?.odds??95.3):.495/199.9):(1+(record.boost??0))/(record.odds??game.course.odds);
   const moonCue=assignMoonCue({win:result.win,reach:result.reach,drawId:result.drawId,mode:result.mode,baseWinProbability:Math.min(1,prior),lossReachRate:game.machine.presentation.lossReachRate});
   game.spinResult=Object.freeze({...result,moonCue});game.previewCenterPending=result.reach;
  };
  game.beginPresentation=(win,...args)=>{const moonCue=game.spinResult?.moonCue;const result=begin(win,...args);if(result){game.presentation.basicReach=true;game.presentation.moonCue=moonCue??null;}return result;};
 }
 let rounds=roundModel?attachBonusRounds(roundModel,game):null;
 const hit=flow.game.hit.bind(flow.game),step=flow.physics.step.bind(flow.physics);
 flow.game.hit=(ball,kind,id)=>{hit(ball,kind,id);if(kind==='bonus'&&game.isWMachine&&game.w.pendingV){game.hit(ball,kind,id);roundModel.attacker.request(false);}else if(kind==='bonus'&&rounds)rounds.hit(ball,id);if(sessionGame&&(kind==='normal'||kind==='start'||kind==='rush'||kind==='fuzu')){const before=game.drawSerial;game.hit(ball,kind,id);if(game.isWMachine&&kind==='rush'&&!game.w.electricOpen)roundModel.tulip.request(false);if(kind!=='normal'&&kind!=='fuzu')events.push({time:game.time,ballId:ball.id,accepted:game.drawSerial-before,mode:kind==='rush'?'rush':'normal',hold:game.holdCount,drawId:game.drawSerial});return;}if(kind==='rush'&&lifecycle&&game.rush&&!game.jackpot&&!game.entryPrelude&&game.previewWinAt===undefined){const accepted=game.enqueueDraw(1,'rush','rush',{x:ball.x,y:ball.y});events.push({time:game.time,ballId:ball.id,accepted,mode:'rush',hold:game.holdCount,drawId:game.drawSerial});}if(kind==='start'){
  const accepted=game.enqueueDraw(1,'start','normal',{x:ball.x,y:ball.y});
  events.push({time:game.time,ballId:ball.id,accepted,hold:game.holdCount,drawId:game.drawSerial});
 }};
 if(sessionGame){const stepFlow=flow.step.bind(flow);flow.step=dt=>{if(game.phase==='playing')stepFlow(dt);};}
 let afterBonusAt=null,playingRush=false;
 flow.physics.step=(dt,g)=>{
  if(sessionGame&&game.phase!=='playing')return;
  if(game.previewWinAt!==undefined){
   if(rounds)rounds.advance(dt);else game.time+=dt;
   if(lifecycle&&rounds?.snapshot().phase==='finished'){
    afterBonusAt??=game.time;
    if(game.time-afterBonusAt>=1&&!game.entryPrelude&&!game.lastBonus.fromRush&&game.rush)beginRushPrelude(game);
    const ready=game.entryPrelude?!preludePose(game.time,game.entryPrelude).visible:game.time-afterBonusAt>=2;
    if(ready){if(game.entryPrelude){game.entryFromSlash=game.entryPrelude.variant==='slash';const playedTitle=entryTitleAt(game.entryPrelude.variant)!==null;game.entryBackdropReady=playedTitle||game.entryPrelude.variant==='revival';game.entryTitleOffset=playedTitle?ENTRY_TITLE_SECONDS:0;delete game.entryPrelude;game.entryGuideAt=game.time;game.stopTimer=4.2;}delete game.previewWinAt;delete game.previewRushWin;playingRush=!!game.rush;roundModel.setMode(playingRush?'rush':'normal');afterBonusAt=null;}

   }
  }else if(game.presentation?.basicReach){game.time+=dt;game.presentation.time+=dt;if(game.presentation.time>=reachSeconds(game.presentation,!!game.rush)){const won=game.presentation.win;game.presentation=null;game.resolveDraw(won,game.reelOutcome);if(won&&game.jackpot){game.previewWinAt=game.time;game.previewRushWin=!!game.jackpot?.fromRush;if(game.previewRushWin&&roundModel)roundModel.setMode('right-closed');if(lifecycle)rounds=attachBonusRounds(roundModel,game);}}}
  else {
   const end=rushEndPose(game.time,game.lastRush?.endedAt,!!game.rush||!!game.jackpot);
   if(end.visible){game.time+=dt;game.stopTimer=Math.max(0,RUSH_END_SECONDS-end.age+1.8);}
   else game.tick(dt);
  }
  if(game.isWMachine&&game.jackpot&&game.previewWinAt===undefined){game.previewWinAt=game.time;game.previewRushWin=!!game.jackpot.fromRush;roundModel.setMode('right-closed');rounds=attachBonusRounds(roundModel,game);}
  if(game.isWMachine&&game.w.pendingV&&game.previewWinAt===undefined)roundModel.attacker.request(true);
  if(lifecycle&&game.previewWinAt===undefined){
   if(game.rush)playingRush=true;
   if(playingRush&&!game.rush){playingRush=false;roundModel.setMode('normal');}
   if(game.isWMachine&&!game.jackpot){roundModel.tulip.request(game.w.electricOpen);if(!game.w.pendingV)roundModel.attacker.request(false);}
   else if(game.rush&&!game.jackpot){const gate=roundModel.gate?.snapshot();roundModel.tulip.request(!!gate&&Number.isFinite(gate.lastPass)&&flow.physics.time-gate.lastPass<1.8&&game.holdCount<game.machine.rightDraw.holdLimit);}
  }
  step(dt,g);
 };

 return {game,events,get rounds(){return rounds;},snapshot:()=>({entryPrelude:game.entryPrelude?{...game.entryPrelude}:null,lifecycle,mode:roundModel?.getMode(),rush:game.rush?{...game.rush}:null,lastRush:game.lastRush?{...game.lastRush}:null,round:rounds?.snapshot(),win:game.previewWinAt!==undefined?{time:game.time-game.previewWinAt,fromRush:!!game.previewRushWin}:null,reach:game.presentation?.basicReach?{time:game.presentation.time,duration:reachSeconds(game.presentation,!!game.rush)}:null,time:game.time,holds:game.holdCount,active:game.spinActive,draws:game.draws,stopTimer:game.stopTimer,reels:reviewReelState(game),accepted:events.reduce((n,e)=>n+e.accepted,0),entries:events.length,events:events.slice(-100)})};
}

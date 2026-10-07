import {presentationReels} from '../presentation/reel-symbols.js';
import {createReachEndingSelector} from './reach-ending.js';
import {createReachVariety} from './reach-variety.js';
import {longReachPose} from './long-reach-timeline.js';
import {pressDecisionPush,advanceDecisionPresentation,decisionPushPose} from './decision-push.js';
import {advancePresentationClock} from './presentation-clock.js';
import {assignMoonCue} from './moon-cue.js';
import {entryTitleAt,ENTRY_TITLE_SECONDS} from './entry-title-schedule.js';
import {beginRushPrelude,preludePose} from './rush-prelude-motion.js';
import {RUSH_END_SECONDS,rushEndPose} from './rush-end-motion.js';
import {reachSeconds,developsReach,developmentPose,DEVELOPMENT} from './win-sequence.js';
import {attachBonusRounds} from './bonus-round-flow.js';
import {Game,freshProfile} from '../domain/game.js';
import {reviewReelState} from './review-reel-state.js';
import {wPresentationWinProbability,TOKYOGHOUL_W} from '../domain/tokyoghoul-w-spec.js';
import {wPublishedNormalOutcome} from '../domain/w-runtime-policy.js';
import {presentationDistribution,createPresentationSelector,presentationRoll} from './presentation-distribution.js';
import {createPredictionPlan} from './prediction-plan.js';
// Review-only deterministic losses. Production odds and Game logic are untouched.
export function attachNormalSpin(flow,{reach=false,win=false,roundModel=null,lifecycle=false,rushWin=false,sessionGame=null,presentationPatterns=false}={}){
 const variety=createReachVariety(),endings=createReachEndingSelector();
 const selector=createPresentationSelector(),distributions=new Map();
 let forceReach=false,seed=741;const rng=()=>{if(forceReach){forceReach=false;return 0;}seed=(Math.imul(seed,1664525)+1013904223)>>>0;return .15+(seed/4294967296)*.7;};
 const game=sessionGame??new Game(freshProfile(),0,rng),events=[];
 if(sessionGame&&presentationPatterns){
  const tempo=Object.getOwnPropertyDescriptor(Game.prototype,'drawTempo').get;
  // Only the display clock grows to let a selected prediction finish. Physical
  // deadlines, admission rolls and FIFO are still advanced by the same tick.
  Object.defineProperty(game,'drawTempo',{configurable:true,get(){
   const base=tempo.call(this),cue=this.spinResult?.predictionPlan?.beforeCue;
   return cue&&cue.family!=='none'?Math.max(base,cue.end+.12):base;
  }});
 }
 let entryCount=0,acceptedCount=0;
 const recordEvent=event=>{entryCount++;acceptedCount+=event.accepted;events.push(event);if(events.length>100)events.shift();};
 if(!sessionGame&&(win||rushWin)){let rushRecords=0;const create=game.createDraw.bind(game);game.createDraw=(...args)=>{if(win&&game.drawSerial===1)forceReach=true;if(rushWin&&args[1]==='rush'&&++rushRecords===5)forceReach=true;return create(...args);};}
 if(sessionGame||reach||win){
  const start=game.startSpin.bind(game),begin=game.beginPresentation.bind(game);
  game.startSpin=record=>{
   forceReach=!sessionGame&&record.id===2&&!win;start(record);
   const result=game.spinResult;
   // W normal-symbol mass uses the shared public symbol/charge model.
   // RUSH cues describe the existing ordinary-symbol win, before physical V admission.
   const prior=result.pity?1:game.isWMachine?wPresentationWinProbability(record.kind,record.odds):(1+(record.boost??0))/(record.odds??game.course.odds);
   if(presentationPatterns&&game.isWMachine&&(record.kind==='tokuzu1'||record.kind==='fuzu'&&game.w.rush)){
    const charge=record.kind!=='fuzu'&&wPublishedNormalOutcome(record.roll).outcome==='charge';
    // A charge is not a symbol win; the guaranteed-followup prior is not part
    // of the calibrated ordinary RUSH population. Neither is re-rolled here.
    const conditionalPrior=result.mode==='normal'?prior/(1-1/TOKYOGHOUL_W.normal.chargeOdds):prior;
    let plan;
    if(charge)plan={route:'ordinary',reach:false,variant:null,ending:'standard',premium:null,moonCue:null};
    else if(prior>=1)plan={route:'flash',reach:true,variant:null,ending:'flash',premium:null,moonCue:null};
    else {const key=`${result.mode}:${conditionalPrior}`;let distribution=distributions.get(key);if(!distribution){distribution=presentationDistribution({mode:result.mode,baseWinProbability:conditionalPrior,lossReachRate:game.machine.presentation.lossReachRate});distributions.set(key,distribution);}plan=selector.select({win:result.win,drawId:result.drawId,mode:result.mode,distribution});}
    const requested=game.reviewPresentationRoute;
    if(!charge&&['basic','battle','direct','flash'].includes(requested)&&(!(requested==='direct'||requested==='flash')||result.win)){
     plan={...plan,route:requested,reach:requested!=='direct',variant:requested==='battle'?(game.reviewReachVariant??'pressure'):null,ending:requested==='flash'?'flash':'standard',premium:requested==='battle'&&result.win?(game.reviewPremium??null):null,moonCue:requested==='battle'||requested==='flash'?plan.moonCue:null};
    }
    if(!charge&&game.reviewReachEnding){const ending=result.win&&game.reviewReachEnding===(result.mode==='rush'?'flash':'revival')?game.reviewReachEnding:'standard';plan={...plan,route:ending==='flash'?'flash':'battle',reach:true,variant:'pressure',ending,premium:null};}
    plan=Object.freeze(plan);
    // Dispatch ordinary legacy reaches too, solely to preserve their existing
    // presentation RNG consumption. They are resolved without showing a reach.
    const dispatch=plan.route!=='ordinary'||result.reach;
    const selectedPrediction=charge?null:createPredictionPlan({drawId:result.drawId,mode:result.mode,win:result.win,plan});
    const predictionPlan=selectedPrediction&&prior>=1?Object.freeze({...selectedPrediction,holdCue:'none'}):selectedPrediction;
    const reels=presentationReels(result,plan.route,{fullRotation:predictionPlan?.resultFamily==='fullrotation'});
    game.spinResult=Object.freeze({...result,reach:dispatch,reels:Object.freeze(reels),legacyReach:result.reach,presentationPlan:plan,predictionPlan,moonCue:plan.moonCue,reachVariant:plan.variant});
    game.previewCenterPending=plan.route==='basic'||plan.route==='battle'||plan.route==='flash';return;
   }
   const moonCue=assignMoonCue({win:result.win,reach:result.reach,drawId:result.drawId,mode:result.mode,baseWinProbability:Math.min(1,prior),lossReachRate:game.machine.presentation.lossReachRate});
   const reachVariant=result.reach?variety.choose(result.drawId,result.mode):null;
   game.spinResult=Object.freeze({...result,moonCue,reachVariant});game.previewCenterPending=result.reach;
  };
  game.beginPresentation=(win,...args)=>{
   const stored=game.spinResult,plan=stored?.presentationPlan,reachMode=stored?.mode??(game.rush?'rush':'normal'),moonCue=stored?.moonCue;
   const reachVariant=plan?plan.variant:stored?.reachVariant??variety.choose(stored?.drawId,stored?.mode);
   const previousRng=game.rng;
   // A newly selected losing reach did not consume legacy reach RNG. Its
   // cosmetic legacy fields use a separate deterministic presentation channel.
   if(plan&&!stored.legacyReach){let channel=10;game.rng=()=>presentationRoll(stored.drawId,reachMode,channel++);}
   let result;try{result=begin(win,...args);}finally{game.rng=previousRng;}
   if(result&&plan?.route==='ordinary'){game.presentation=null;game.resolveDraw(win,stored.reels);return result;}
   if(result){
    game.presentation.basicReach=true;game.presentation.longReach=!!sessionGame&&(!plan||plan.route==='battle'||plan.route==='flash');game.lastReachWasLong=false;
    game.presentation.moonCue=moonCue??null;game.presentation.reachVariant=reachVariant;game.presentation.presentationMode=reachMode;game.presentation.predictionPlan=stored?.predictionPlan??null;
    if(plan){game.presentation.displayRoute=plan.route;game.presentation.premium=plan.premium;game.presentation.premiumAt=45.5;game.presentation.reachEnding=plan.ending;game.presentation.developed=false;}
    else {const requested=game.reviewReachEnding,allowed=requested===(reachMode==='rush'?'flash':'revival');game.presentation.reachEnding=win?(allowed?requested:endings.choose(game.presentation.drawId,reachMode,win)):'standard';game.presentation.developed=developsReach(game.presentation,!!game.rush,game.reviewDevelopment);}
   }return result;
  };
 }
 let rounds=roundModel?attachBonusRounds(roundModel,game):null;
 const hit=flow.game.hit.bind(flow.game),step=flow.physics.step.bind(flow.physics);
 flow.game.hit=(ball,kind,id)=>{hit(ball,kind,id);if(kind==='bonus'&&game.isWMachine&&game.w.pendingV){game.hit(ball,kind,id);roundModel.attacker.request(false);}else if(kind==='bonus'&&rounds)rounds.hit(ball,id);if(sessionGame&&(kind==='normal'||kind==='start'||kind==='rush'||kind==='fuzu')){const before=game.drawSerial;game.hit(ball,kind,id);if(game.isWMachine&&kind==='rush'&&!game.w.electricOpen)roundModel.tulip.request(false);if(kind!=='normal'&&kind!=='fuzu')recordEvent({time:game.time,ballId:ball.id,accepted:game.drawSerial-before,mode:kind==='rush'?'rush':'normal',hold:game.holdCount,drawId:game.drawSerial});return;}if(kind==='rush'&&lifecycle&&game.rush&&!game.jackpot&&!game.entryPrelude&&game.previewWinAt===undefined){const accepted=game.enqueueDraw(1,'rush','rush',{x:ball.x,y:ball.y});recordEvent({time:game.time,ballId:ball.id,accepted,mode:'rush',hold:game.holdCount,drawId:game.drawSerial});}if(kind==='start'){
  const accepted=game.enqueueDraw(1,'start','normal',{x:ball.x,y:ball.y});
  recordEvent({time:game.time,ballId:ball.id,accepted,hold:game.holdCount,drawId:game.drawSerial});
 }};
 if(sessionGame){const stepFlow=flow.step.bind(flow);flow.step=dt=>{if(game.phase==='playing')stepFlow(dt);};}
 let afterBonusAt=null,playingRush=false;
 flow.physics.step=(dt,g)=>{
  if(sessionGame&&game.phase!=='playing')return;
  if(game.previewWinAt!==undefined){
   if(rounds)rounds.advance(dt);else advancePresentationClock(game,dt);
   if(lifecycle&&rounds?.snapshot().phase==='finished'){
    afterBonusAt??=game.time;
    if(game.time-afterBonusAt>=1&&!game.entryPrelude&&!game.lastBonus.fromRush&&game.rush)beginRushPrelude(game);
    const ready=game.entryPrelude?!preludePose(game.time,game.entryPrelude).visible:game.time-afterBonusAt>=2;
    if(ready){if(game.entryPrelude){game.entryFromSlash=game.entryPrelude.variant==='slash';const playedTitle=entryTitleAt(game.entryPrelude.variant)!==null;game.entryBackdropReady=playedTitle||game.entryPrelude.variant==='revival';game.entryTitleOffset=playedTitle?ENTRY_TITLE_SECONDS:0;delete game.entryPrelude;game.entryGuideAt=game.time;game.stopTimer=4.2;}delete game.previewWinAt;delete game.previewRushWin;playingRush=!!game.rush;roundModel.setMode(playingRush?'rush':'normal');afterBonusAt=null;}

   }
  }else if(game.presentation?.basicReach){advancePresentationClock(game,dt);advanceDecisionPresentation(game.presentation,dt);if(game.presentation.time>=reachSeconds(game.presentation,!!game.rush)){const won=game.presentation.win,normal=!game.rush;game.lastReachWasLong=!!game.presentation.longReach;game.presentation=null;game.resolveDraw(won,game.reelOutcome);if(!won&&normal)game.stopTimer=Math.max(game.stopTimer,DEVELOPMENT.lossHold);if(won&&game.jackpot){game.previewWinAt=game.time;game.previewRushWin=!!game.jackpot?.fromRush;if(game.previewRushWin&&roundModel)roundModel.setMode('right-closed');if(lifecycle)rounds=attachBonusRounds(roundModel,game);}}}
  else {
   const end=rushEndPose(game.time,game.lastRush?.endedAt,!!game.rush||!!game.jackpot);
   if(end.visible){advancePresentationClock(game,dt);game.stopTimer=Math.max(0,RUSH_END_SECONDS-end.age+1.8);}
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
  game.retireBallIds?.(flow.physics.balls,flow.physics.nextId);
 };

 return {game,events,pressDecision:()=>pressDecisionPush(game,{paused:flow.paused}),get rounds(){return rounds;},snapshot:()=>({push:decisionPushPose(game,{paused:flow.paused}),entryPrelude:game.entryPrelude?{...game.entryPrelude}:null,lifecycle,mode:roundModel?.getMode(),rush:game.rush?{...game.rush}:null,lastRush:game.lastRush?{...game.lastRush}:null,round:rounds?.snapshot(),win:game.previewWinAt!==undefined?{time:game.time-game.previewWinAt,fromRush:!!game.previewRushWin}:null,reach:game.presentation?.basicReach?{time:game.presentation.time,duration:reachSeconds(game.presentation,!!game.rush),route:game.presentation.displayRoute,premium:game.presentation.premium,developed:!!game.presentation.developed,longReach:!!game.presentation.longReach,variant:game.presentation.reachVariant,ending:game.presentation.reachEnding,stage:game.presentation.longReach?longReachPose(game.presentation.time,{variant:game.presentation.reachVariant,ending:game.presentation.reachEnding,win:game.presentation.win}).cut:game.presentation.time<.45?'reach':developmentPose(game.presentation,!!game.rush).visible?developmentPose(game.presentation,!!game.rush).stage:'decision',win:game.presentation.win}:null,time:game.time,holds:game.holdCount,active:game.spinActive,draws:game.draws,stopTimer:game.stopTimer,reels:reviewReelState(game),accepted:acceptedCount,entries:entryCount,events:events.slice(-100)})};
}

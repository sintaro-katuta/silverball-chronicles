import {Game,freshProfile} from '../game.js';
import {WMachine} from '../tokyoghoul-w-machine.js';
import {TOKYOGHOUL_W as W} from '../tokyoghoul-w-spec.js';
import {W_RUNTIME_POLICY,wPublishedNormalOutcome} from './w-runtime-policy.js';
// Existing moon/reel presentation is an adapter; WMachine owns lottery/prizes.
export class SessionGame extends Game {
 constructor(rng=Math.random,{policy=W_RUNTIME_POLICY}={}){
  super(freshProfile(),0,rng);this.pendingBalls=0;this.isWMachine=true;this.policy=policy;
  this.w=new WMachine({rng,fuzuHoldLimit:policy.fuzuHoldLimit,normalResolver:wPublishedNormalOutcome});this.wEventCursor=0;
  this.course.odds=W.normal.symbolOdds;this.course.scale=1;this.rules.pityLimit=Infinity;
  this.smallHitTime=0;this.electricTime=0;this.electricCount=0;this.wRecord=null;this.wBatch=null;
 }
 get machine(){const m=super.machine;return {...m,normal:{...m.normal,odds:W.normal.symbolOdds},
  prizes:{normal:5,start:1,rush:1,fuzu:1,bonus:15},holdLimit:4,countLimit:10,
  openSeconds:this.policy?.attackerOpenSeconds??15,gapSeconds:this.policy?.attackerGapSeconds??.65,
  rightDraw:{...m.rightDraw,odds:W.rush.odds,spins:130,holdLimit:1,tempo:this.policy?.fuzuSeconds??.35},
  gameRules:{...m.gameRules,pityLimit:Infinity,payoutScale:1}};}
 value(){return 0;}
 get payoutMultiplier(){return 1;}
 get acceptedDraws(){if(!this.w)return [];return this.rush?this.w.queues.fuzu:this.w.queues.tokuzu1;}
 get queue(){return this.acceptedDraws.length;}
 get holdCount(){return this.queue;}
 get hasPendingWBonus(){return !!(this.w?.active.tokuzu2||this.w?.queues.tokuzu2.length||this.w?.pendingV);}
 get belowBorder(){return this.stock<=0&&this.pendingBalls===0&&!this.spinActive&&!this.queue&&!this.presentation&&!this.jackpot&&!this.w?.pendingV&&!this.w?.electricOpen&&!this.w?.queues.tokuzu2.length&&this.previewWinAt===undefined;}
 checkStage(){}
 confirmTickets(){}
 // Physics allocates monotonically increasing numeric IDs. Only retire IDs
 // below every live ball, and permanently reject delayed callbacks below them.
 retireBallIds(liveBalls,nextId){
  if(!Number.isSafeInteger(nextId))return;
  let floor=nextId;for(const ball of liveBalls){if(!Number.isSafeInteger(ball.id))return;floor=Math.min(floor,ball.id);}
  this.w.retireBallIdsBefore(floor);
 }
 startRush(initialTotal=0){if(!this.w)return;this.w.startRush();this.syncW();if(this.rush)this.rush.total+=initialTotal;}
 syncW(){
  const fresh=this.w.eventsSince(this.wEventCursor);this.wEventCursor=this.w.eventSequence;
  for(const e of fresh){
   if(e.type==='normalEntryDecision'&&this.lastBonus&&!this.lastBonus.fromRush){this.lastBonus.entryEligible=e.enter;this.lastBonus.entryRevealed=true;}
   if(e.type==='prize'){this.award(e.amount,{basePrize:e.amount,source:e.kind});this.emit('payout',{amount:e.amount,kind:e.kind,basePrize:e.amount,gamePrize:0});if(e.kind==='attacker'&&this.wBatch)this.wBatch.payout+=e.amount;}
   if(e.type==='rushStart'){if(!this.rush)this.rush={chain:1,total:0,startedAt:this.time};this.rush.remaining=130;this.rush.consumed=0;this.emit('rushStart',{remaining:130});}
   if(e.type==='rushEnd'){this.lastRush={...this.rush,remaining:e.remaining,consumed:e.consumed,endedAt:this.time};this.rush=null;this.emit('rushEnd',this.lastRush);}
   if(e.type==='bonusEnd'){
    if(e.fromRush&&!this.w.active.tokuzu2&&!this.w.queues.tokuzu2.length&&!this.w.electricOpen&&e.followupRoll<this.policy.nextGuaranteedFuzuRate&&this.w.rush){
     // Existing holds keep their admitted odds and FIFO order. Reserve one
     // new guaranteed admission after them instead of converting old misses.
     this.w.rush.remaining=this.w.queues.fuzu.length+Number(!!this.w.active.fuzu)+1;this.w.rush.odds=1;this.w.rush.guaranteed=true;
    }
    const previous=this.jackpot;this.lastBonus={...previous,count:e.count,individualPayout:e.payout,displayMaxPayout:this.wBatch?.maxPayout??e.maxPayout,payout:this.wBatch?.payout??e.payout,endedAt:this.time};this.jackpot=null;this.emit('bonusEnd',{rush:e.fromRush||this.w.rush!==null,fromRush:e.fromRush,payout:e.payout});
   }
  }
  this.w.pruneConsumedEvents(this.wEventCursor);
  if(this.rush&&this.w.rush){this.rush.remaining=this.w.rush.remaining;this.rush.consumed=this.w.rush.consumed;}
  if(this.w.bonus){const b=this.w.bonus;
   if(!this.jackpot){this.jackpots++;this.jackpot={...b,charge:!b.fromRush&&!!this.wCharge,displayRounds:b.rounds,time:0,gap:0,entryEligible:b.fromRush,entryRevealed:b.fromRush,challenge:null,awardPerBall:15,payoutMultiplier:1,payoutAmount:this.wBatch?.maxPayout??b.maxPayout,kind:'w-individual-bonus',initialRounds:b.rounds};}
   this.jackpot.round=b.round;this.jackpot.count=b.count;this.jackpot.open=b.open;this.jackpot.payout=this.wBatch?.payout??b.payout;
  }
 }
 hit(ball,kind,id=0){
  if(this.phase!=='playing')return;
  if(kind==='bonus'&&this.w.pendingV){
   if(this.w.isCapturedOrRetired(ball.id))return;this.w.seen.add(ball.id);
   this.w.confirmV();this.w.award(15,'attacker',ball.id);this.w.bonus.count=1;this.w.bonus.payout=15;this.smallHitTime=0;this.syncW();return;
  }
  const inlet={normal:'ordinary',start:'start',rush:'electric',fuzu:'fuzu',bonus:'attacker'}[kind];if(!inlet)return;
  const oldRound=this.w.bonus?.round;const captured=this.w.admit(inlet,ball.id);this.drawSerial=this.w.serial;
  if(kind==='normal'&&captured.captured){this.normalCount++;this.pocketCounts[id]=(this.pocketCounts[id]||0)+1;}
  if(kind==='rush'&&captured.captured){this.electricCount++;if(this.electricCount>=this.policy.electricCountLimit)this.w.closeElectric();}
  this.syncW();if(this.jackpot&&this.w.bonus?.round!==oldRound&&kind==='bonus'){this.jackpot.time=0;this.jackpot.gap=this.machine.gapSeconds;}
 }
 openWRound(){this.w.openRound();}
 advanceWMechanics(dt){
  if(this.w.electricOpen){this.electricTime+=dt;if(this.electricTime>=this.policy.electricOpenSeconds)this.w.closeElectric();}
  if(this.w.pendingV){this.smallHitTime+=dt;if(this.smallHitTime>=this.policy.smallHitOpenSeconds){this.w.expireV();this.smallHitTime=0;}}
  this.syncW();
 }
 startSpin(record){
  const kind=record.kind,mode=kind==='fuzu'?'rush':'normal',baseWin=kind==='fuzu'?record.roll<1/(record.odds??W.rush.odds):wPublishedNormalOutcome(record.roll).outcome==='symbol';
  this.wRecord=record;super.startSpin({...record,mode,source:kind,origin:{x:210,y:430},buildStyle:'balanced',baseWin,grade:10});
 }
 resolveDraw(win,reels=null){
  this.spinActive=false;this.spinResult=null;this.stoppedReels=win?[7,7,7]:(reels??this.missReels());this.stopTimer=win?0:.2;this.lastDraw=win;
  if(!this.wRecord)return;const result=this.w.resolveDraw(this.wRecord.kind);this.wRecord=null;this.emit('draw',{win,...result});
  if(result?.outcome==='electric-open'){
   this.wBatch=result.guaranteed&&this.wBatch?{...this.wBatch,maxPayout:this.wBatch.maxPayout+3000}:{maxPayout:3000,payout:0};this.w.openElectric();this.electricTime=0;this.electricCount=0;
  }
  if(result?.outcome==='symbol'||result?.outcome==='charge'){
   this.wCharge=result.outcome==='charge';
   this.wBatch=null;this.w.setEntryDecision(!!result.entry);
  }
  this.syncW();
 }
 advanceClock(dt){
  if(this.phase!=='playing')return;this.time+=dt;this.balanceClock+=dt;if(this.balanceClock>=1){this.balanceClock=0;this.recordBalance();}
  this.advanceWMechanics(dt);
 }
 tick(dt){
  if(this.phase!=='playing')return;this.advanceClock(dt);
  if(this.jackpot){const j=this.jackpot;if(j.gap>0){j.gap=Math.max(0,j.gap-dt);return;}if(this.w.bonus?.open){j.time+=dt;if(j.time>=this.machine.openSeconds){const r=j.round;this.w.closeRound('time');this.syncW();if(this.jackpot&&this.jackpot.round!==r){this.jackpot.time=0;this.jackpot.gap=this.machine.gapSeconds;}}}return;}
  if(this.presentation)return;
  if(this.stopTimer>0){this.stopTimer=Math.max(0,this.stopTimer-dt);return;}
  if(this.w.pendingV||this.w.electricOpen)return;
  if(!this.spinActive){
   this.w.startNextDraw('tokuzu2');if(this.w.active.tokuzu2){this.w.resolveDraw('tokuzu2');this.smallHitTime=0;this.syncW();return;}
   const kind=this.w.active.tokuzu1?'tokuzu1':this.rush?'fuzu':'tokuzu1';this.w.startNextDraw(kind);if(this.w.active[kind])this.startSpin(this.w.active[kind]);
  }
  if(this.spinActive){this.drawTimer+=dt;const result=this.spinResult,stops=this.drawTempo+this.reelStopGap*(result.reach?1:2);
   if(this.drawTimer>=stops){this.spinActive=false;this.draws++;this.activeDraw=null;this.lastResolvedDraw={...this.wRecord,mode:result.mode,win:result.win};
    if(result.reach){this.pendingGrade=10;this.beginPresentation(result.win);}else this.resolveDraw(false,result.reels);
   }
  }
  if(this.belowBorder){this.zeroTime+=dt;if(this.zeroTime>=3)this.finish('lost');}else this.zeroTime=0;
 }
}

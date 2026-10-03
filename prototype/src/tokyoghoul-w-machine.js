import {TOKYOGHOUL_W as W} from './tokyoghoul-w-spec.js';

// Mechanical/control boundary for W, independent of the legacy Game and renderer.
// No guessed timers: the caller supplies observed opening/closing/V events.
// Public rounded probabilities are approximations; unknown normal entry decisions
// and fuzu hold capacity are deliberately not inferred from the published 51%.
export class WMachine {
 constructor({rng=Math.random,fuzuHoldLimit=null,normalResolver=null}={}){
  if(fuzuHoldLimit!==null&&(!Number.isInteger(fuzuHoldLimit)||fuzuHoldLimit<0))throw new RangeError('Invalid fuzu hold capacity');
  this.rng=rng;this.normalResolver=normalResolver;this.fuzuHoldLimit=fuzuHoldLimit;this.serial=0;this.seen=new Set();
  this.queues={tokuzu1:[],tokuzu2:[],fuzu:[]};this.active={tokuzu1:null,tokuzu2:null,fuzu:null};
  this.rush=null;this.bonus=null;this.pendingV=null;this.entryDecision=null;this.pendingEntry=false;
  this.electricOpen=false;this.electricAuthorization=false;this.payout=0;this.events=[];
 }
 emit(type,data={}){this.events.push({sequence:this.events.length+1,type,...data});}
 random(){const n=this.rng();if(!(n>=0&&n<1))throw new RangeError('RNG must return [0,1)');return n;}
 award(amount,kind,ballId){this.payout+=amount;this.emit('prize',{amount,kind,ballId,total:this.payout});}
 admit(kind,ballId){
  if(!['ordinary','start','fuzu','electric','attacker'].includes(kind))throw new RangeError('Unknown inlet');
  if(ballId===undefined||ballId===null)throw new TypeError('A physical ball ID is required');
  if(this.seen.has(ballId))return {captured:false,reason:'already-captured'};
  if(kind==='electric'&&!this.electricOpen)return {captured:false,reason:'closed'};
  if(kind==='attacker'&&(!this.bonus?.open||this.bonus.count>=W.attacker.countLimit))return {captured:false,reason:'closed'};
  this.seen.add(ballId);this.award(W.prizes[kind],kind,ballId);
  let drawAccepted=false;
  if(kind==='start')drawAccepted=this.enqueue('tokuzu1',ballId);
  if(kind==='electric')drawAccepted=this.enqueue('tokuzu2',ballId);
  if(kind==='fuzu'&&this.rush)drawAccepted=this.enqueue('fuzu',ballId);
  if(kind==='attacker'){
   this.bonus.count++;this.bonus.payout+=W.prizes.attacker;
   if(this.bonus.count===W.attacker.countLimit)this.closeRound('count');
  }
  this.emit('admission',{kind,ballId,drawAccepted});return {captured:true,drawAccepted};
 }
 enqueue(kind,ballId){
  if(kind==='fuzu'&&(!this.rush||this.rush.remaining<=this.queues.fuzu.length+Number(!!this.active.fuzu)))return false;
  const capacity=kind==='fuzu'?this.fuzuHoldLimit:W.holds[kind];
  // A first draw can begin without using a hold; later admissions cannot invent
  // unknown hold storage. Other systems remain paused while a bonus is active.
  const immediate=!this.active[kind]&&!this.queues[kind].length&&!this.bonus&&!this.pendingV&&!this.pendingEntry&&
    (kind==='fuzu'?!this.electricAuthorization&&!this.electricOpen:kind==='tokuzu2'?!this.active.tokuzu1:!this.active.tokuzu2&&!this.queues.tokuzu2.length);
  if(!immediate&&(capacity===null||this.queues[kind].length>=capacity)){
   this.emit('drawRejected',{kind,ballId,reason:capacity===null?'unknown-hold-capacity':'hold-full'});return false;
  }
  const record={id:++this.serial,kind,ballId,roll:kind==='tokuzu2'?null:this.random(),followupRoll:kind==='tokuzu2'?this.random():null};
  if(immediate)this.active[kind]=record;else this.queues[kind].push(record);
  this.emit('drawAccepted',{kind,drawId:record.id,immediate});return true;
 }
 startNextDraw(kind){
  if(!Object.hasOwn(this.active,kind))throw new RangeError('Unknown draw kind');
  if(this.active[kind]||this.bonus||this.pendingV||this.pendingEntry)return false;
  if(kind==='fuzu'&&(!this.rush||this.electricAuthorization||this.electricOpen))return false;
  if(kind==='tokuzu1'&&(this.active.tokuzu2||this.queues.tokuzu2.length))return false;
  if(kind==='tokuzu2'&&this.active.tokuzu1)return false;
  this.active[kind]=this.queues[kind].shift()??null;return !!this.active[kind];
 }
 resolveDraw(kind){
  const record=this.active[kind];if(!record||this.bonus||this.pendingV||this.pendingEntry)return null;
  this.active[kind]=null;let outcome;
  if(kind==='tokuzu1'){
   const p=1/W.normal.symbolOdds;
   const resolved=this.normalResolver?.(record.roll);
   outcome=resolved?.outcome??(record.roll<p?'symbol':record.roll<p+1/W.normal.chargeOdds?'charge':'miss');
   if(resolved)record.entry=resolved.entry;
   if(outcome!=='miss')this.beginBonus(outcome==='symbol'?1500:300,false);
  }else if(kind==='fuzu'){
   if(!this.rush)throw new Error('Fuzu result outside RUSH');
   this.rush.remaining--;this.rush.consumed++;outcome=record.roll<1/(this.rush.odds??W.rush.odds)?'electric-open':'miss';
   if(outcome==='electric-open')this.electricAuthorization=true;
   else if(this.rush.remaining===0)this.endRushIfDrained();
  }else if(kind==='tokuzu2'){
   // Diagram supports the small-hit/V path. Rare direct-hit branching is
   // unverified, so this review controller does not claim its full table.
   outcome='small-hit-awaiting-v';this.pendingV={drawId:record.id,followupRoll:record.followupRoll};
  }else throw new RangeError('Unknown draw kind');
  const result={...record,outcome};this.emit('drawResolved',result);return result;
 }
 openElectric(){if(!this.electricAuthorization)throw new Error('No successful fuzu authorization');this.electricOpen=true;this.emit('electricOpen');}
 closeElectric(){this.electricOpen=false;this.electricAuthorization=false;this.emit('electricClose');this.endRushIfDrained();}
 confirmV(){if(!this.pendingV)throw new Error('No small hit awaiting V');this.emit('vDetected',{drawId:this.pendingV.drawId});const source=this.pendingV;this.pendingV=null;this.beginBonus(1500,true);this.bonus.followupRoll=source.followupRoll;this.bonus.drawId=source.drawId;}
 expireV(){if(!this.pendingV)throw new Error('No small hit awaiting V');this.emit('vMissed',{drawId:this.pendingV.drawId});this.pendingV=null;this.endRushIfDrained();}
 beginBonus(amount,fromRush){
  if(this.bonus)throw new Error('Bonus already active');
  this.entryDecision=null;this.bonus={maxPayout:amount,rounds:amount/150,round:1,count:0,payout:0,open:false,fromRush};
  this.emit('bonusStart',{maxPayout:amount,fromRush});
 }
 openRound(){if(!this.bonus||this.bonus.open)throw new Error('Round cannot open');this.bonus.open=true;this.emit('attackerOpen',{round:this.bonus.round});}
 closeRound(reason='time'){
  if(!this.bonus?.open)throw new Error('No open round');
  if(!['count','time'].includes(reason))throw new RangeError('Unknown closing condition');
  if(reason==='count'&&this.bonus.count<W.attacker.countLimit)throw new Error('Count limit not reached');
  const b=this.bonus;b.open=false;this.emit('attackerClose',{reason,round:b.round,count:b.count});
  if(b.round<b.rounds){b.round++;b.count=0;return;}
  this.emit('bonusEnd',{...b});this.bonus=null;
  if(b.fromRush)this.startRush();
  else {this.pendingEntry=true;if(this.entryDecision!==null)this.applyEntryDecision();}
 }
 setEntryDecision(enter){
  if(typeof enter!=='boolean')throw new TypeError('Explicit entry decision required');
  if(!this.pendingEntry&&!this.bonus)throw new Error('No normal bonus entry decision pending');
  if(this.bonus?.fromRush)throw new Error('RUSH bonus does not use normal entry policy');
  this.entryDecision=enter;if(this.pendingEntry)this.applyEntryDecision();
 }
 applyEntryDecision(){this.pendingEntry=false;this.emit('normalEntryDecision',{enter:this.entryDecision});if(this.entryDecision)this.startRush();this.entryDecision=null;}
 startRush(){this.rush={remaining:W.rush.draws,consumed:0};this.emit('rushStart',{draws:W.rush.draws});}
 endRushIfDrained(){
  if(this.rush?.remaining!==0||this.bonus||this.pendingV||this.active.tokuzu2||this.queues.tokuzu2.length||this.electricOpen||this.electricAuthorization)return;
  const ended={...this.rush};this.rush=null;this.emit('rushEnd',ended);
 }
 snapshot(){return JSON.parse(JSON.stringify({model:W.model,probabilityBasis:'public-rounded-approximation',
  unresolved:[...W.unresolved,'normal-fuzu-processing','physical-v-sensor','tokuzu2-direct-hit-table'],fuzuHoldLimit:this.fuzuHoldLimit,rush:this.rush,bonus:this.bonus,pendingV:this.pendingV,
  pendingEntry:this.pendingEntry,electricOpen:this.electricOpen,electricAuthorization:this.electricAuthorization,
  active:this.active,holds:this.queues,payout:this.payout,events:this.events}));}
}

import {symbolForDraw,nextSymbol} from '../presentation/reel-symbols.js';
import {selectPayout,rushPayoutPlan} from './payout-distribution.js';
import {moonBuildStyle,moonOrigin,moonBallOrigin} from './moon-state.js';
import {DURATION,durationFor,reachColor} from '../presentation/cinematic.js';
import {SCENES,PATTERNS,chooseReach} from '../presentation/reach-scenes.js';
import {COURSES,MACHINE_SPECS,runtimeMachine} from './machine-spec.js';
export {COURSES} from './machine-spec.js';
export const SKILLS = [
 ['twin','双子玉','玉の変化','発射時、確率で消費なしの玉を追加',[5,8,12,16,20],'%'],
 ['gold','黄金玉','玉の変化','発射時、確率で賞球＋100%の黄金玉に変化',[4,7,10,14,18],'%'],
 ['split','分裂釘','玉の変化','光る釘に触れると確率で玉が分裂',[10,15,20,25,30],'%'],
 ['large','大粒玉','玉の変化','5%で大粒玉。入賞時に賞球を追加',[10,20,35,55,80],'玉'],
 ['pocket','入賞名人','賞球強化','一般入賞口の賞球が増加',[10,15,20,25,30],'%'],
 ['grow','育つ入賞口','賞球強化','同じ入賞口に10玉入るごとに＋5%。成長上限',[15,25,35,45,60],'%'],
 ['polish','釘磨き','賞球強化','釘に5回触れるごとに賞球増加。最大5段階',[2,3,4,5,6],'%'],
 ['combo','入賞コンボ','賞球強化','2秒以内の連続入賞で一般入賞口の賞球増加',[15,25,35,45,60],'%'],
 ['double','ダブル抽選','抽選強化','始動口の入賞時、確率で追加抽選',[5,8,12,16,20],'%'],
 ['back','裏口抽選','抽選強化','一般入賞が規定数に達すると追加抽選',[30,25,20,16,12],'個ごと'],
 ['wind','外れの追い風','抽選強化','10回外れるごとに当選率上昇。上乗せ上限',[10,15,20,25,30],'%'],
 ['opening','開幕抽選','抽選強化','ステージ開始時に抽選を追加',[1,2,3,4,5],'回'],
 ['bonus','大入り御礼','大当り強化','大入賞口の賞球が増加',[10,15,20,25,30],'%'],
 ['salute','祝砲','大当り強化','大当り開始時に消費なしの玉を連続発射',[5,8,12,16,20],'玉'],
 ['extend','宴の延長','大当り強化','各ラウンドの制限時間が延長',[5,8,12,16,20],'%'],
 ['after','余韻','大当り強化','大当り後の通常発射30発は一般賞球増加',[20,30,40,50,60],'%'],
 ['return','玉の帰還','粘り','入賞しなかった通常発射の玉を確率で返却',[5,8,12,16,20],'%'],
 ['bank','外れ貯金','粘り','抽選に外れると貯金。次の大当りで受け取り',[1,2,3,4,5],'玉'],
 ['revive','敗者復活玉','粘り','規定数の玉が入賞せず落ちると次の玉が黄金玉',[40,35,30,25,20],'個ごと'],
 ['last','最後のひと押し','粘り','下限までの余裕が初期持ち玉の20%以下なら一般賞球増加',[10,20,30,40,50],'%']
].map(([id,name,category,description,values,unit])=>({id,name,category,description,values,unit}));
export const UPGRADES = [
 {id:'stock',name:'初期持ち玉',description:'開始時の持ち玉 ＋25玉 / Lv',max:10},
 {id:'normal',name:'一般入賞口の賞球',description:'賞球 ＋5% / Lv',max:10},
 {id:'start',name:'始動口の賞球',description:'賞球 ＋5% / Lv',max:10},
 {id:'bonus',name:'大入賞口の賞球',description:'賞球 ＋5% / Lv',max:10},
 {id:'tickets',name:'チケット獲得量',description:'獲得チケット ＋5% / Lv',max:10},
 {id:'supply',name:'突破時の持ち玉補給',description:'ステージ突破で ＋5玉 / Lv',max:10}
];
export const MAX_FIRE_RATE=6000;
export const FIRE_GROWTH=1.6;
export const freshProfile = ()=>({tickets:0,unlocked:1,upgrades:{},best:[0,0,0]});
export const upgradeCost = level=> 3 + level*3;
export function ticketBreakdown(total,cleared,level=0){
 const payout=total<=0?0:Math.max(1,Math.floor(Math.sqrt(total/100)));
 const stages=payout>0?cleared*3:0;
 const tickets=Math.floor((payout+stages)*(1+level*.05));
 return {payout,stages,upgrade:tickets-payout-stages,tickets};
}
export function ticketReward(total,cleared,level=0){return ticketBreakdown(total,cleared,level).tickets;}
export function candidates(skills,rng=Math.random){ const pool=SKILLS.filter(s=>(skills[s.id]||0)<5);for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,3); }
export class Game {
 constructor(profile,course=0,rng=Math.random,options={}){const spec=MACHINE_SPECS[course];this.endless=!!options.endless;profile=this.endless?freshProfile():profile;this.profile=profile;this.course={...COURSES[course]};this.debug=false;this.rules={fireRate:100,pityLimit:this.course.pityLimit,targetBase:200,growth:2,payoutGrowth:1.5,fireGrowth:FIRE_GROWTH,weights:[...MACHINE_SPECS[course].normal.weights],rushOdds:spec.rightDraw.odds,rushSpins:spec.rightDraw.spins,rushTempo:spec.rightDraw.tempo,rushWeights:[...spec.rightDraw.weights],rushEntryRate:spec.rushEntry.fourRoundRate};this.pityCount=0;this.pendingGrade=null;this.courseIndex=course;this.rng=rng;this.phase='playing';this.stock=400+(profile.upgrades.stock||0)*25;this.initial=this.stock;this.stageStartStock=this.stock;this.total=0;this.stage=1;this.cleared=0;this.skills={};this.time=0;this.zeroTime=0;this.draws=0;this.normalHolds=[];this.rushHolds=[];this.rush=null;this.lastRush=null;this.lastBonus=null;this.activeDraw=null;this.drawSerial=0;this.pendingPayout=null;this.lastResolvedDraw=null;this.drawTimer=0;this.spinActive=false;this.spinResult=null;this.stopTimer=0;this.stoppedReels=[3,7,1];this.reelOutcome=[6,7,6];this.lastDraw=null;this.presentation=null;this.presentationSerial=0;this.payoutPulse=0;this.jackpot=null;this.jackpots=0;this.afterShots=0;this.misses=0;this.lost=0;this.bank=0;this.normalCount=0;this.pocketCounts={};this.lastNormal=-99;this.events=[];this.practice=false;this.payoutRemainder=0;this.result=null;this.confirmedReward=ticketBreakdown(0,0);this.claimedTickets=0;this.ledger={basePrize:0,gamePrize:0,payout:0,spent:0,returned:0,supply:0,debugAdjustment:0,extraBalls:0};this.balanceHistory=[{time:0,value:0}];this.balanceClock=0;}
 get machine(){return runtimeMachine(this.course,this.courseIndex,this.rules);}
 get rightPlay(){return !!(this.jackpot||this.rush);}
 get drawMode(){return this.activeDraw?.mode||(this.rush?'rush':'normal');}
 get drawTempo(){return this.drawMode==='rush'?this.machine.rightDraw.tempo:this.course.tempo;}
 get reelStopGap(){return this.drawMode==='rush'?this.machine.rightDraw.stopGap:this.machine.reels.stopGap;}
 get acceptedDraws(){return this.rush?this.rushHolds:this.normalHolds;}
 get queue(){return this.acceptedDraws.length;}
 get holdCount(){return this.queue;}
 get canAcceptRushDraw(){return !!this.rush&&!this.jackpot&&this.rushHolds.length<this.machine.holdLimit&&this.rush.remaining-this.rushHolds.length-(this.activeDraw?.mode==='rush'?1:0)>0;}
 // Preview/debug setter still respects the right-side reserved-spin boundary.
 set queue(count){const pool=this.acceptedDraws,length=Math.max(0,Math.min(this.machine.holdLimit,Math.floor(count)||0));pool.length=Math.min(length,pool.length);while(pool.length<length){if(this.rush&&!this.canAcceptRushDraw)break;pool.push(this.createDraw('debug',this.rush?'rush':'normal'));}}
 drawGrade(roll=this.rng(),weights=this.rules.weights){const total=weights.reduce((a,b)=>a+b,0),r=roll*total;return r<weights[0]?4:r<weights[0]+weights[1]?6:10;}
 createDraw(source,mode='normal',origin){const rush=mode==='rush',boost=rush?0:Math.min(this.value('wind'),Math.floor(this.misses/10)*5)/100;const odds=rush?this.machine.rightDraw.odds:this.course.odds,winRoll=this.rng(),gradeRoll=this.rng(),weights=rush?this.machine.rightDraw.weights:this.rules.weights,payoutAmount=rush&&this.machine.rightDraw.payouts?selectPayout(gradeRoll,this.machine.rightDraw.payouts):null;return Object.freeze({id:++this.drawSerial,source,mode,origin:moonOrigin(source,mode,origin),buildStyle:moonBuildStyle(this.skills),acceptedAt:this.time,odds,boost,winRoll,baseWin:winRoll<(1+boost)/odds,grade:payoutAmount?rushPayoutPlan(payoutAmount).rounds:this.drawGrade(gradeRoll,weights),payoutAmount,gradeRoll});}

 value(id){const s=SKILLS.find(s=>s.id===id);return s?.values[(this.skills[id]||0)-1]||0;}
 get requiredGain(){return Math.min(1e12,Math.round(this.rules.targetBase*Math.pow(this.rules.growth,this.stage-1)*this.course.scale));}
 get target(){return this.stageStartStock+this.requiredGain;}
 get progress(){return this.stock-this.stageStartStock;}
 get lowerBorder(){return Math.max(0,this.stageStartStock-this.initial);}
 get belowBorder(){return this.stock===0||this.stock<this.lowerBorder;}
 // Stage growth applies only to bonus prizes; ordinary ports retain base prizes.
 get payoutMultiplier(){return Math.min(1e6,Math.pow(this.rules.payoutGrowth,this.stage-1));}
 get fireRate(){return Math.min(MAX_FIRE_RATE,Math.round(this.rules.fireRate*Math.pow(this.rules.fireGrowth,this.stage-1)));}
 beginStage(){this.stageStartStock=this.stock;this.zeroTime=0;}
 enqueueDraw(count=1,source='start',mode=this.rush?'rush':'normal',origin){let accepted=0;const pool=mode==='rush'?this.rushHolds:this.normalHolds;for(let i=0;i<count;i++){if(mode==='rush'&&!this.canAcceptRushDraw)break;const immediate=mode===(this.rush?'rush':'normal')&&!this.spinActive&&!this.presentation&&!this.jackpot&&this.stopTimer<=0&&this.phase==='playing';if(!immediate&&pool.length>=this.machine.holdLimit)break;const record=this.createDraw(source,mode,origin);if(immediate)this.startSpin(record);else pool.push(record);this.emit('drawQueued',{drawId:record.id,source,mode,origin:record.origin,buildStyle:record.buildStyle,immediate});accepted++;}return accepted;}
 startSpin(record){this.activeDraw=record;this.spinActive=true;this.drawTimer=0;const pity=record.mode!=='rush'&&this.pityCount+1>=this.rules.pityLimit,win=pity||record.baseWin,reach=win||this.rng()<this.machine.presentation.lossReachRate;let reels=this.missReels();if(reach){const n=symbolForDraw(record.id,record.mode,win),last=reels[2]===n?nextSymbol(n):reels[2];reels=[n,n,win?n:last];}else if(reels[0]===reels[1])reels[1]=reels[1]%9+1;this.spinResult=Object.freeze({drawId:record.id,mode:record.mode,origin:record.origin,buildStyle:record.buildStyle,win,pity,reach,grade:record.grade,reels:Object.freeze(reels)});}
 missReels(){const reels=Array.from({length:3},()=>1+Math.min(8,Math.floor(this.rng()*9)));if(reels.every(n=>n===reels[0]))reels[1]=reels[1]%9+1;if(reels.join()===this.stoppedReels.join())reels[0]=reels[0]%9+1;if(reels.every(n=>n===reels[0]))reels[2]=reels[2]%9+1;return reels;}
 emit(type,data={}){this.events.push({type,...data});}
 fire(extra=false){if(this.phase!=='playing'||(!extra&&this.stock<1))return null;if(!extra){this.stock--;this.ledger.spent++;}else this.ledger.extraBalls++;const gold=this.rng()<this.value('gold')/100||(!extra&&this.value('revive')&&this.lost>=this.value('revive'));if(gold&&!extra&&this.lost>=this.value('revive'))this.lost=0;const ball={right:this.rightPlay,gold,large:this.rng()<.05&&this.value('large')>0,extra,hits:0,split:false,after:!extra&&this.afterShots>0};if(!extra&&this.afterShots>0)this.afterShots--;if(!extra&&this.rng()<this.value('twin')/100)this.emit('extra');return ball;}
 addStock(n,source='supply'){if(!Number.isFinite(n)||n<0)throw new RangeError('Stock addition must be nonnegative');this.stock+=n;if(source!=='payout')this.ledger[source]=(this.ledger[source]||0)+n;if(!this.belowBorder)this.zeroTime=0;}
 setStock(n,source='debugAdjustment'){if(source==='debug')source='debugAdjustment';if(!Number.isFinite(n)||n<0)throw new RangeError('Stock must be nonnegative');this.ledger[source]=(this.ledger[source]||0)+n-this.stock;this.stock=n;if(!this.belowBorder)this.zeroTime=0;}
 award(n,{basePrize=0,source='game'}={}){this.payoutRemainder+=n;const whole=Math.floor(this.payoutRemainder+1e-8);this.payoutRemainder-=whole;this.addStock(whole,'payout');this.ledger.basePrize+=basePrize;this.ledger.gamePrize+=whole-basePrize;this.ledger.payout+=whole;this.total+=whole;if(this.rush)this.rush.total+=whole;if(whole>0)this.payoutPulse=this.time;this.confirmTickets();this.lastAward={amount:whole,basePrize,gamePrize:whole-basePrize,source};return whole;}
 get accounting(){return {...this.ledger,machineNet:this.ledger.basePrize-this.ledger.spent,playNet:this.ledger.payout-this.ledger.spent,balance:this.stock-this.initial,reconciled:this.initial+this.ledger.payout+this.ledger.returned+this.ledger.supply+this.ledger.debugAdjustment-this.ledger.spent===this.stock};}
 checkStage(){if(this.phase!=='playing'||this.stock<this.target)return;this.cleared=this.stage;this.confirmTickets();this.emit('clear',{stage:this.stage});if(this.stage===10&&!this.endless){this.finish('clear');return;}this.phase='skill';this.choices=candidates(this.skills,this.rng);}
 selectSkill(id){if(this.phase!=='skill'||(this.choices.length&&!this.choices.some(s=>s.id===id)))return;if(this.choices.length)this.skills[id]=(this.skills[id]||0)+1;this.stage++;this.pocketCounts={};this.addStock((this.profile.upgrades.supply||0)*5);this.beginStage();this.enqueueDraw(this.value('opening'),'opening-skill');this.phase='playing';this.emit('stage');this.checkStage();}
 hit(ball,kind,id=0){if(this.phase!=='playing'||(kind==='rush'&&(!this.rush||this.jackpot)))return;const base=kind==='bonus'?(this.jackpot?.awardPerBall??this.machine.prizes.bonus):this.machine.prizes[kind];if(base===undefined)return;let mult=1+(ball.gold?1:0)+(this.profile.upgrades[kind==='rush'?'start':kind]||0)*.05;let bonus=this.value('large')*(ball.large?1:0);if(kind==='normal'){this.normalCount++;this.pocketCounts[id]=(this.pocketCounts[id]||0)+1;mult+=this.value('pocket')/100+Math.min(this.value('grow'),Math.floor(this.pocketCounts[id]/10)*5)/100+Math.min(5,Math.floor(ball.hits/5))*this.value('polish')/100;if(this.time-this.lastNormal<=2)mult+=this.value('combo')/100;if(this.stock-this.lowerBorder<=this.initial*.2)mult+=this.value('last')/100;if(ball.after)mult+=this.value('after')/100;this.lastNormal=this.time;if(this.value('back')&&this.normalCount%this.value('back')===0)this.enqueueDraw(1,'back-skill',this.rush?'rush':'normal',moonBallOrigin(ball,kind,id));}if(kind==='start'||kind==='rush'){const mode=kind==='rush'?'rush':'normal';this.enqueueDraw(1,kind,mode,moonBallOrigin(ball,kind,id));if(this.rng()<this.value('double')/100)this.enqueueDraw(1,'double-skill',mode,moonBallOrigin(ball,kind,id));}if(kind==='bonus'){mult+=this.value('bonus')/100;if(this.jackpot)this.jackpot.count++;}const prizeMultiplier=kind==='bonus'?this.course.scale*(this.jackpot?.payoutMultiplier??this.payoutMultiplier):1;const amount=this.award((base*mult+bonus)*prizeMultiplier,{basePrize:base,source:kind});if(kind==='bonus'&&this.jackpot)this.jackpot.payout+=amount;this.emit('payout',{amount,kind,basePrize:base,gamePrize:amount-base});this.checkStage();}
 lose(ball){if(ball.extra)return;this.lost++;if(this.rng()<this.value('return')/100){this.addStock(1,'returned');this.emit('return');}}
 startJackpot(){if(this.jackpot||this.phase==='result')return;const fromRush=!!this.rush;this.presentation=null;this.spinActive=false;this.activeDraw=null;this.spinResult=null;this.stopTimer=0;if(!this.stoppedReels.every(n=>n===this.stoppedReels[0]))this.stoppedReels=[7,7,7];const payoutAmount=fromRush&&this.machine.rightDraw.payouts?(this.pendingPayout??selectPayout(this.rng(),this.machine.rightDraw.payouts)):null,plan=payoutAmount?rushPayoutPlan(payoutAmount):null;this.pendingPayout=null;const rounds=plan?.rounds??this.pendingGrade??this.drawGrade(this.rng(),fromRush?this.machine.rightDraw.weights:this.rules.weights);this.pendingGrade=null;this.pityCount=0;const entryEligible=fromRush||rounds>=6||this.rng()<this.machine.rushEntry.fourRoundRate;const displayRounds=rounds===10&&this.rng()<this.machine.roundReveal.earlyTenRate?10:4;this.jackpot={round:1,rounds,displayRounds,count:0,time:0,gap:0,fromRush,entryEligible,entryRevealed:fromRush||rounds>=6,challenge:null,payout:0,payoutAmount,awardPerBall:plan?.awardPerBall??this.machine.prizes.bonus,payoutMultiplier:this.payoutMultiplier,kind:'fixed-round-bonus',initialRounds:rounds,continuation:null};if(fromRush)this.rush.chain++;this.jackpots++;this.misses=0;this.lastDraw=true;if(this.bank){this.award(this.bank);this.bank=0;}this.emit('jackpot',{fromRush,displayRounds});for(let i=0;i<this.value('salute');i++)this.emit('extra');this.checkStage();}
 startRush(initialTotal=0){if(this.phase==='result')return false;if(this.rush){this.rush.remaining=this.machine.rightDraw.spins;this.emit('rushReset',{remaining:this.rush.remaining,chain:this.rush.chain});return;}this.rush={remaining:this.machine.rightDraw.spins,chain:1,total:initialTotal,startedAt:this.time,consumed:0};this.emit('rushStart',{remaining:this.rush.remaining,chain:1});}
 endRush(){if(!this.rush)return;this.lastRush={...this.rush,endedAt:this.time};this.rush=null;this.rushHolds=[];this.emit('rushEnd',this.lastRush);}
 revealBonus(j){const reveal=this.machine.roundReveal;if(j.round===j.displayRounds&&j.rounds>j.displayRounds&&(j.count>=reveal.atCount||j.time>=reveal.atSeconds)){const previous=j.displayRounds;j.displayRounds=j.displayRounds===4?Math.min(6,j.rounds):j.rounds;j.entryRevealed=true;this.emit('roundsRevealed',{previous,rounds:j.displayRounds,added:j.displayRounds-previous});}if(!j.fromRush&&j.rounds===4&&!j.challenge&&j.round===4&&(j.count>=reveal.atCount||j.time>=reveal.atSeconds)){j.challenge={time:0,win:null};this.emit('rushChallengeStart');}}
 finishBonus(j){if(this.phase!=='playing')return;if(!j.entryRevealed){j.entryRevealed=true;if(j.challenge)j.challenge.win=j.entryEligible;this.emit('rushEntryResult',{win:j.entryEligible});}this.lastBonus={...j,endedAt:this.time};this.jackpot=null;this.afterShots=30;this.emit('bonusEnd',{rush:j.entryEligible,fromRush:j.fromRush,payout:j.payout});if(j.entryEligible)this.startRush(j.payout);}
 recordBalance(){const point={time:this.time,value:this.stock-this.initial};const last=this.balanceHistory.at(-1);if(last?.time===point.time)this.balanceHistory[this.balanceHistory.length-1]=point;else this.balanceHistory.push(point);if(this.balanceHistory.length>1800)this.balanceHistory=[this.balanceHistory[0],...this.balanceHistory.slice(1,-1).filter((_,i)=>i%2===0),this.balanceHistory.at(-1)];}
 tick(dt){if(this.phase!=='playing')return;this.time+=dt;this.balanceClock+=dt;if(this.balanceClock>=1){this.balanceClock=0;this.recordBalance();}if(this.belowBorder){this.zeroTime+=dt;if(this.zeroTime>=3){this.finish('lost');return;}}else this.zeroTime=0;
 if(this.jackpot){const j=this.jackpot,machine=this.machine;
 if(j.challenge&&j.challenge.win===null){j.challenge.time+=dt;if(j.challenge.time>=1.6){j.challenge.win=j.entryEligible;j.entryRevealed=true;this.emit('rushEntryResult',{win:j.entryEligible});}}
 if(j.gap>0){j.gap=Math.max(0,j.gap-dt);return;}j.time+=dt;this.revealBonus(j);if(j.count>=machine.countLimit||j.time>=machine.openSeconds*(1+this.value('extend')/100)){if(j.round>=j.rounds)this.finishBonus(j);else{j.round++;j.count=0;j.time=0;j.gap=machine.gapSeconds;}}return;}
 if(this.presentation){const p=this.presentation;p.time+=dt;if(p.time>=durationFor(p.pattern)*p.rate){this.presentation=null;this.resolveDraw(p.win,this.reelOutcome);}return;}
 if(this.stopTimer>0){this.stopTimer=Math.max(0,this.stopTimer-dt);return;}
 if(!this.spinActive&&this.queue>0){this.startSpin(this.acceptedDraws.shift());}
 if(this.spinActive){if(!this.spinResult)this.startSpin(this.activeDraw||this.createDraw('debug'));this.drawTimer+=dt;const result=this.spinResult,stops=this.drawTempo+this.reelStopGap*(result.reach?1:2);if(this.drawTimer>=stops){this.drawTimer=0;this.spinActive=false;this.draws++;this.pityCount++;const record=this.activeDraw;if(record.mode==='rush'&&this.rush){this.rush.remaining--;this.rush.consumed++;}this.activeDraw=null;const {pity,win}=result;this.lastResolvedDraw=Object.freeze({...record,consumedAt:this.time,spin:this.draws,pity,win});if(win){this.pendingGrade=record.grade;this.pendingPayout=record.payoutAmount??null;}
 if(result.reach)this.beginPresentation(win);else this.resolveDraw(false,result.reels);}}}

 beginPresentation(win,demo=false,choice={}){if(this.phase!=='playing'||this.jackpot||this.presentation)return false;if(demo&&(!this.practice||this.spinActive))return false;const pattern=demo&&PATTERNS.some(p=>p.id===choice.pattern&&p.win===!!win)?choice.pattern:chooseReach(!!win,this.rng);const sceneId=demo&&SCENES.some(s=>s.id===choice.sceneId)?choice.sceneId:SCENES[Math.min(9,Math.floor(this.rng()*10))].id;if(win&&this.pendingGrade===null)this.pendingGrade=this.drawGrade(this.rng(),this.rush?this.machine.rightDraw.weights:this.rules.weights);this.spinActive=false;const color=demo&&['normal','red'].includes(choice.color)?choice.color:reachColor(!!win,this.rng);const last=this.spinResult?.reach&&this.spinResult.win===!!win?this.spinResult.reels[2]:this.missReels()[2];const n=demo?7:this.spinResult?.reels[0]??7;this.reelOutcome=[n,n,win?n:last===n?nextSymbol(n):last];const draw=!demo&&this.lastResolvedDraw?.id===this.spinResult?.drawId?this.lastResolvedDraw:null;this.presentation={id:++this.presentationSerial,drawId:draw?.id??null,origin:draw?.origin??moonOrigin('debug'),buildStyle:demo&&['balanced','assault','fortify','counter'].includes(choice.buildStyle)?choice.buildStyle:draw?.buildStyle??moonBuildStyle(this.skills),win:!!win,time:0,rate:this.rush?.45:[1,.65,1.2][this.courseIndex],demo,pattern,sceneId,reachColor:color,grade:win?this.pendingGrade:null};this.emit('reach');return true;}

 resolveDraw(win,reels=null){this.spinActive=false;this.spinResult=null;this.stoppedReels=win?(reels||[7,7,7]):(reels||this.missReels());this.stopTimer=win?0:this.rush?.2:.85;this.lastDraw=win;this.emit('draw',{win});if(win)this.startJackpot();else{this.misses++;this.bank=Math.min(this.initial,this.bank+this.value('bank'));if(this.rush&&this.rush.remaining===0)this.endRush();}}

 get rewardEligible(){return !this.practice&&!this.endless&&!this.debug;}
 get ticketEstimate(){return this.confirmedReward.tickets;}
 confirmTickets(){
  if(!this.rewardEligible||this.result)return;
  const reward=ticketBreakdown(this.total,this.cleared,this.profile.upgrades.tickets||0);
  if(reward.tickets<=this.confirmedReward.tickets)return;
  const amount=reward.tickets-this.confirmedReward.tickets;
  this.confirmedReward=reward;this.emit('tickets',{amount,tickets:reward.tickets});
 }
 claimTickets(profile){
  const amount=this.confirmedReward.tickets-this.claimedTickets;
  if(amount<=0)return 0;
  profile.tickets+=amount;this.claimedTickets+=amount;return amount;
 }
 finish(reason){if(this.phase==='result')return;this.recordBalance();this.confirmTickets();const reward={...this.confirmedReward};this.phase='result';this.result={reason,tickets:reward.tickets,reward,total:this.total,accounting:this.accounting,cleared:this.cleared,practice:this.practice,endless:this.endless,debug:this.debug};this.emit('finish',this.result);}
 claimResult(profile){
  const r=this.result;
  if(!r||this.resultClaimed)return false;
  this.resultClaimed=true;
  const paid=this.claimTickets(profile);
  if(r.practice||r.endless||r.debug)return paid>0;
  profile.best[this.courseIndex]=Math.max(profile.best[this.courseIndex]||0,r.cleared);
  if(r.reason==='clear')profile.unlocked=Math.min(3,Math.max(profile.unlocked,this.courseIndex+2));
  return true;
 }
 pause(){if(this.phase==='playing')this.phase='paused';}
 resume(){if(this.phase==='paused')this.phase='playing';}
}

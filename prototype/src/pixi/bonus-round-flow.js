import {payoutRevealSeconds} from './payout-reveal.js';
import {RUSH_WIN_SECONDS} from './rush-win-motion.js';
// Bridges the review's approved moving door to the existing bonus/payout rules.
// This isolated fixture does not run the obsolete stage progression or persist rewards.
export function attachBonusRounds(model,game){
 const {flow,attacker}=model;game.checkStage=()=>{};game.confirmTickets=()=>{};
 let phase='celebration',since=0,shownRound=1,shownCount=0;const history=[];
 const transition=next=>{phase=next;since=game.time;history.push({phase,time:game.time,round:shownRound,count:shownCount,payout:game.jackpot?.payout??game.lastBonus?.payout??0});};
 const close=()=>{attacker.request(false);transition('closing');};
 return {
  advance(dt){
   const j=game.jackpot;
   if(phase==='open'){
    shownCount=j.count;const round=j.round;game.tick(dt);
    if(!game.jackpot||game.jackpot.round!==round){close();return;}
   }else if(phase==='gap'){
    game.tick(dt);if(game.jackpot?.gap<=0){shownRound=game.jackpot.round;shownCount=0;attacker.request(true);transition('opening');}
   }else game.time+=dt;
   if(phase==='celebration'&&game.time-game.previewWinAt>=(game.previewRushWin?RUSH_WIN_SECONDS:5.8)){model.setMode('right-closed');transition(j.fromRush?'payout-reveal':'guide');}
   else if(phase==='payout-reveal'&&game.time-since>=payoutRevealSeconds(j.payoutAmount)){transition('guide');}
   else if(phase==='guide'&&game.time-since>=(game.previewRushWin?.35:1.2)){shownRound=j.round;attacker.request(true);transition('opening');}
   else if(phase==='opening'&&!attacker.state().moving){if(game.isWMachine)game.openWRound();transition('open');}
   else if(phase==='closing'&&!attacker.state().moving){transition(game.jackpot?'gap':'finished');}
  },
  hit(ball,id){
   if(phase!=='open'||!game.jackpot)throw new Error('Bonus admission outside the open round');
   const oldRound=game.jackpot.round,oldCount=game.jackpot.count;game.hit(ball,'bonus',id);shownCount=game.isWMachine?oldCount+1:game.jackpot.count;
   history.push({phase:'admission',time:game.time,round:shownRound,count:shownCount,ballId:ball.id,payout:game.jackpot?.payout??game.lastBonus?.payout??0});
   if(shownCount>=game.machine.countLimit){if(!game.isWMachine)game.tick(0);close();}
  },
  snapshot:()=>({phase,phaseTime:Math.max(0,game.time-since),fromRush:!!(game.jackpot??game.lastBonus)?.fromRush,round:shownRound,count:shownCount,limit:game.machine.countLimit,payout:game.jackpot?.payout??game.lastBonus?.payout??0,maxPayout:game.isWMachine?(game.wBatch?.maxPayout??game.jackpot?.maxPayout??game.lastBonus?.maxPayout??0):Math.round(((game.jackpot??game.lastBonus)?.rounds??0)*game.machine.countLimit*((game.jackpot??game.lastBonus)?.awardPerBall??game.machine.prizes.bonus)*game.course.scale*((game.jackpot??game.lastBonus)?.payoutMultiplier??1)),remainingSeconds:Math.max(0,game.machine.openSeconds-(game.jackpot?.time??0)),history:[...history]})
 };
}

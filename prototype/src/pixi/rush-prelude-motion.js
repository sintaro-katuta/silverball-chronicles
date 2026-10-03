import {entryTitleDuration} from './entry-title-schedule.js';
import {REVIVAL_ENTRY} from './revival-entry-motion.js';
export const RUSH_PRELUDES=Object.freeze({revival:REVIVAL_ENTRY.end,moon:entryTitleDuration('moon'),reflection:entryTitleDuration('reflection'),castle:8,slash:entryTitleDuration('slash'),mechanism:entryTitleDuration('mechanism')});
export function preludePose(time,sequence){
 if(!sequence)return {visible:false,age:-1};
 const age=time-sequence.startedAt,duration=RUSH_PRELUDES[sequence.variant];
 return {visible:age>=0&&age<duration,age,duration,variant:sequence.variant,payout:sequence.payout};
}
export function beginRushPrelude(game,startedAt=game.time){
 // Presentation consumes no RNG and never grants entry. The settled bonus owns eligibility.
 if(!game.rush||!game.lastBonus?.entryEligible||game.lastBonus.fromRush)return null;
 const requested=game.reviewEntryVariant;
 const variant=Object.hasOwn(RUSH_PRELUDES,requested)?requested:['moon','reflection','castle','slash','mechanism','revival'][(game.jackpots-1)%6];
 return game.entryPrelude={variant,startedAt,payout:game.lastBonus.payout};
}

// Long anticipation, held compression, fast release, then room for the title.
export function preludeArtPose(age,variant){
 const t=age-(variant==='revival'?REVIVAL_ENTRY.awakeningAt:0);
 const starts=[0,1.25,2.9,4.55,6.3,6.62];
 let frame=0;for(let i=1;i<starts.length;i++)if(t>=starts[i])frame=i;
 // Freeze the compressed shot. A restrained camera push builds the preceding shots.
 const zoom=frame<3?1+Math.max(0,t)/4.55*.07:frame===3?1.07:frame===4?1:1+Math.min(1,(t-6.62)/1.38)*.035;
 return {age:t,frame,zoom};
}

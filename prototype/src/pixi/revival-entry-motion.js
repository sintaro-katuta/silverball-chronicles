// Presentation only: the already-settled entry result and gameplay RNG are untouched.
export const REVIVAL_ENTRY={resultAt:.12,leftAt:1.7,blackoutAt:4.35,awakeningAt:4.8,end:6.6};
export function revivalPhase(age){
 if(age<REVIVAL_ENTRY.resultAt)return 'blackout';
 if(age<REVIVAL_ENTRY.leftAt)return 'result';
 if(age<REVIVAL_ENTRY.blackoutAt)return 'normal';
 if(age<REVIVAL_ENTRY.awakeningAt)return 'blackout';
 if(age<REVIVAL_ENTRY.end)return 'awakening';
 return 'rush';
}
export function revivalReels(game,state){
 const seq=game.entryPrelude;
 if(seq?.variant!=='revival'||revivalPhase(game.time-seq.startedAt)!=='normal')return state;
 return {...state,numbers:[2,4,6],stopped:[true,true,true]};
}

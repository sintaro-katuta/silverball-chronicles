import {reelState} from '../domain/reels.js';
// Physical display columns always stop left, right, centre. Legacy stored
// results hold the first two stops in slots 0/1. All routes use the same
// presentation mapping; the stored outcome and its symbol distribution stay intact.
export const DISPLAY_STOP_RANKS=Object.freeze([0,2,1]);
export function displayResultIndex(column){return DISPLAY_STOP_RANKS[column];}
export function reviewReelState(game){
 const s=reelState(game);
 return {...s,numbers:DISPLAY_STOP_RANKS.map(i=>s.numbers[i]),stopped:DISPLAY_STOP_RANKS.map(i=>s.stopped[i])};
}
export const WIN_ZOOM = {start:.18, holdStart:.26, holdEnd:1.26, end:1.51};
export function linkedWinScale(t){
 const {start,holdStart,holdEnd,end}=WIN_ZOOM;
 if(t<start||t>=end)return 1;
 if(t<holdStart)return 1+5*(1-(1-(t-start)/(holdStart-start))**3);
 if(t<=holdEnd)return 6;
 const u=(t-holdEnd)/(end-holdEnd);return 6-5*u*u*(3-2*u);
}

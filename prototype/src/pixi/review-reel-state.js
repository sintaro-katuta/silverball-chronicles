import {reelState} from '../reels.js';
// The review presentation waits for the centre: preserve the stored result, swap its display columns.
export function reviewReelState(game){const s=reelState(game);if(!game.previewCenterPending)return s;return {...s,numbers:[s.numbers[0],s.numbers[2],s.numbers[1]],stopped:[s.stopped[0],s.stopped[2],s.stopped[1]]};}
export const WIN_ZOOM = {start:.18, holdStart:.26, holdEnd:1.26, end:1.51};
export function linkedWinScale(t){
 const {start,holdStart,holdEnd,end}=WIN_ZOOM;
 if(t<start||t>=end)return 1;
 if(t<holdStart)return 1+5*(1-(1-(t-start)/(holdStart-start))**3);
 if(t<=holdEnd)return 6;
 const u=(t-holdEnd)/(end-holdEnd);return 6-5*u*u*(3-2*u);
}

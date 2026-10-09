const clamp=x=>Math.max(0,Math.min(1,x));
import {upperReachPose} from './long-reach-timeline.js';
import {reachFinalePose} from './decision-push.js';
export function cabinetLightPose(game){
 const t=game.time??0,win=game.previewWinAt===undefined?-1:t-game.previewWinAt;
 if(game.entryPrelude){const age=t-game.entryPrelude.startedAt;return {phase:'entry',travel:Math.sin(clamp(age/1.4)*Math.PI)*.7,light:.65,rainbow:true,hue:age*.12};}
 if(game.presentation?.longReach){const upper=upperReachPose(game.presentation),finale=reachFinalePose(game);if(finale.confirmed)return {phase:'win',travel:0,light:game.reducedEffects?.65:.9,rainbow:true,hue:game.reducedEffects?0:finale.age*.4};return {phase:upper.active?'upper':'reach',travel:0,light:upper.active?.42:finale.warm?(game.reducedEffects?.55:.4+.3*(.5+.5*Math.cos(game.presentation.time*Math.PI*4))):.06,rainbow:false,hue:0};}
 if(win>=0&&win<2.4){const hit=win<.16?clamp(win/.16):win<1.15?1:1-clamp((win-1.15)/.75);return {phase:'win',travel:hit,light:.35+.55*hit,rainbow:true,hue:win*.2};}
 if(game.presentation?.basicReach){const age=game.presentation.time;return {phase:'reach',travel:.25*clamp(age/.7),light:.25+.18*(1-Math.cos(age*3))/2,rainbow:false,hue:0};}
 if(game.jackpot)return {phase:'payout',travel:0,light:.23+.06*Math.sin(t*2),rainbow:false,hue:0};
 if(game.rush)return {phase:'rush',travel:0,light:.3+.1*Math.sin(t*1.5),rainbow:false,hue:0};
 return {phase:'normal',travel:0,light:.06,rainbow:false,hue:0};
}

// One complete clockwise turn about the fixed hilt; all angles use the game clock.
export function cabinetSwordPose(game){
 if(game.presentation?.longReach){const p=upperReachPose(game.presentation);return {phase:p.phase,y:0,angle:p.angle};}
 if(game.lastReachWasLong)return {phase:'rest',y:0,angle:0};
 const age=game.previewWinAt===undefined?-1:(game.time??0)-game.previewWinAt;
 let angle=0,phase='rest';
 if(age>=.10&&age<.90){phase='spin';const t=(age-.10)/.80;angle=2*Math.PI*(t*t*(3-2*t));}
 else if(age>=.90&&age<1.15){phase='settle';const t=(age-.90)/.25;angle=2*Math.PI+.045*Math.sin(t*Math.PI*2)*(1-t);}
 return {phase,y:0,angle};
}

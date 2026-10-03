const clamp=x=>Math.max(0,Math.min(1,x));
export function cabinetLightPose(game){
 const t=game.time??0,win=game.previewWinAt===undefined?-1:t-game.previewWinAt;
 if(game.entryPrelude){const age=t-game.entryPrelude.startedAt;return {phase:'entry',travel:Math.sin(clamp(age/1.4)*Math.PI)*.7,light:.65,rainbow:true,hue:age*.12};}
 if(win>=0&&win<2.4){const hit=win<.16?clamp(win/.16):win<1.15?1:1-clamp((win-1.15)/.75);return {phase:'win',travel:hit,light:.35+.55*hit,rainbow:true,hue:win*.2};}
 if(game.presentation?.basicReach){const age=game.presentation.time;return {phase:'reach',travel:.25*clamp(age/.7),light:.25+.18*(1-Math.cos(age*3))/2,rainbow:false,hue:0};}
 if(game.jackpot)return {phase:'payout',travel:0,light:.23+.06*Math.sin(t*2),rainbow:false,hue:0};
 if(game.rush)return {phase:'rush',travel:0,light:.3+.1*Math.sin(t*1.5),rainbow:false,hue:0};
 return {phase:'normal',travel:0,light:.06,rainbow:false,hue:0};
}

// Game-clock driven gravity-like drop, short impact recoil, then a slower reset.
// Losing reach, entry and payout cannot independently trigger the blade.
export function cabinetSwordPose(game){
 const age=game.previewWinAt===undefined?-1:(game.time??0)-game.previewWinAt;
 let y=0,phase='rest';
 if(age>=.10&&age<.20){phase='drop';y=64*((age-.10)/.10)**2;}
 else if(age>=.20&&age<.28){phase='impact';y=64-4*Math.sin((age-.20)/.08*Math.PI/2);}
 else if(age>=.28&&age<1.10){phase='hold';y=60;}
 else if(age>=1.10&&age<1.75){phase='return';const t=(age-1.10)/.65;y=60*(1-t*t*(3-2*t));}
 return {phase,y:Math.round(y)};
}

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

// Rotate about the held hilt toward the right-hand moon; fixed art never moves.
export function cabinetSwordPose(game){
 const age=game.previewWinAt===undefined?-1:(game.time??0)-game.previewWinAt;
 let angle=0,phase='rest';
 if(age>=.10&&age<.28){phase='prepare';angle=-12*((age-.10)/.18);}
 else if(age>=.28&&age<.44){phase='slash';const t=(age-.28)/.16;angle=-12+67*t*t;}
 else if(age>=.44&&age<.54){phase='impact';angle=55-5*Math.sin((age-.44)/.10*Math.PI/2);}
 else if(age>=.54&&age<1.05){phase='hold';angle=50;}
 else if(age>=1.05&&age<1.75){phase='return';const t=(age-1.05)/.70;angle=50*(1-t*t*(3-2*t));}
 return {phase,y:0,angle:angle*Math.PI/180};
}
